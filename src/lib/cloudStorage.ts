import fs from 'fs';
import path from 'path';
import type { S3Client } from '@aws-sdk/client-s3';

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

let s3ClientInstance: S3Client | null = null;

export function validateAudioKey(key: string): void {
  if (!/^audio\/[a-f0-9]{64}\/[a-f0-9-]{36}\.(webm|m4a|aac)$/.test(key)) {
    throw new Error('Invalid recording key');
  }
}

function privateAudioPath(key: string): string {
  validateAudioKey(key);
  return path.join(process.cwd(), '.uploads', ...key.split('/'));
}

function recordingUrl(key: string): string {
  return `/api/audio/file?key=${encodeURIComponent(key)}`;
}

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
 * Возвращает адрес защищённого обработчика воспроизведения.
 */
export async function uploadAudioFile({ buffer, key, contentType = 'audio/webm' }: UploadOptions): Promise<string> {
  validateAudioKey(key);
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

        return recordingUrl(key);
      }
    } catch (error) {
      console.error('[Storage] Cloud upload failed:', error);
      throw new Error('Recording storage unavailable');
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Private cloud recording storage is required in production');
  }

  // 2. Development-only private storage outside public/.
  try {
    const localPath = privateAudioPath(key);
    const localDir = path.dirname(localPath);

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    fs.writeFileSync(localPath, buffer);
    return recordingUrl(key);
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
    const key = keyOrUrl.startsWith('/api/audio/file?')
      ? new URL(keyOrUrl, 'http://localhost').searchParams.get('key') || ''
      : keyOrUrl;
    validateAudioKey(key);
    if (!isCloudStorageConfigured() && process.env.NODE_ENV !== 'production') {
      const localPath = privateAudioPath(key);
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

export async function readAudioFile(key: string): Promise<{ data: Uint8Array; contentType: string }> {
  validateAudioKey(key);
  if (isCloudStorageConfigured()) {
    const client = await getS3Client();
    if (!client) throw new Error('Recording storage unavailable');
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const result = await client.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || process.env.AWS_S3_BUCKET,
      Key: key,
    }));
    if (!result.Body) throw new Error('Recording not found');
    return { data: await result.Body.transformToByteArray(), contentType: result.ContentType || 'audio/webm' };
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Recording storage unavailable');
  return { data: fs.readFileSync(privateAudioPath(key)), contentType: key.endsWith('.m4a') ? 'audio/mp4' : key.endsWith('.aac') ? 'audio/aac' : 'audio/webm' };
}
