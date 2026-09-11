import fs from 'fs';
import path from 'path';

export interface UploadOptions {
  buffer: Buffer;
  key: string; // e.g. 'audio/user123/lesson_1_phone_turn_0.webm'
  contentType?: string;
}

export function isCloudStorageConfigured(): boolean {
  const hasR2 = Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
  const hasS3 = Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
  return hasR2 || hasS3;
}

let s3ClientInstance: any = null;

async function getS3Client() {
  if (s3ClientInstance) return s3ClientInstance;

  try {
    const { S3Client } = await import('@aws-sdk/client-s3');

    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      s3ClientInstance = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
      return s3ClientInstance;
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      s3ClientInstance = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      return s3ClientInstance;
    }
  } catch (err) {
    console.warn('[Storage] @aws-sdk/client-s3 not available or failed to init:', err);
  }

  return null;
}

/**
 * Загружает аудио-буфер в Cloudflare R2 / AWS S3 или локально на диск при отсутствии ключей облака.
 * Возвращает публичный URL для воспроизведения в браузере.
 */
export async function uploadAudioFile({ buffer, key, contentType = 'audio/webm' }: UploadOptions): Promise<string> {
  // 1. Попытка загрузки в Cloudflare R2 / S3
  if (isCloudStorageConfigured()) {
    try {
      const s3 = await getS3Client();
      if (s3) {
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');
        const bucket = process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET;

        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          })
        );

        const publicBaseUrl = (
          process.env.R2_PUBLIC_URL ||
          process.env.AWS_S3_PUBLIC_URL ||
          `https://${bucket}.r2.dev`
        ).replace(/\/$/, '');

        return `${publicBaseUrl}/${key}`;
      }
    } catch (error) {
      console.error('[Storage] Cloud upload failed, falling back to local storage:', error);
    }
  }

  // 2. Локальный фолбэк: сохранение в public/uploads/...
  try {
    const cleanKey = key.replace(/^[/\\]+/, '');
    const localDir = path.join(process.cwd(), 'public', 'uploads', path.dirname(cleanKey));
    const localPath = path.join(process.cwd(), 'public', 'uploads', cleanKey);

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    fs.writeFileSync(localPath, buffer);
    return `/uploads/${cleanKey.replace(/\\/g, '/')}`;
  } catch (localErr) {
    console.error('[Storage] Local file save failed:', localErr);
    throw new Error('Failed to save audio recording');
  }
}

/**
 * Удаляет файл из облака или с локального диска при перезаписи попытки.
 */
export async function deleteAudioFile(keyOrUrl: string): Promise<boolean> {
  try {
    if (keyOrUrl.startsWith('/uploads/')) {
      const relativePath = keyOrUrl.replace(/^\/uploads\//, '');
      const localPath = path.join(process.cwd(), 'public', 'uploads', relativePath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return true;
    }

    if (isCloudStorageConfigured()) {
      const s3 = await getS3Client();
      if (s3) {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        const bucket = process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET;
        // Извлекаем key из URL, если передан полный URL
        const key = keyOrUrl.startsWith('http')
          ? new URL(keyOrUrl).pathname.replace(/^\//, '')
          : keyOrUrl;

        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        );
        return true;
      }
    }
  } catch (err) {
    console.warn('[Storage] Delete file warning:', err);
  }
  return false;
}
