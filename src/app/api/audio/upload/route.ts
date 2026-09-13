import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { uploadAudioFile } from '@/lib/cloudStorage';
import { checkRateLimit } from '@/lib/rateLimit';
import { createHash, randomUUID } from 'crypto';
import { readBoundedForm, RequestBodyError } from '@/lib/requestBody';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const limit = checkRateLimit(`audio_upload_${session.id}`, { limit: 30 });
    if (!limit.allowed) return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
    if (Number(req.headers.get('content-length')) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Recording too large' }, { status: 413 });
    }
    const formData = await readBoundedForm(req, 10 * 1024 * 1024);
    const file = formData.get('file') as Blob | File | null;
    const lessonId = Number(formData.get('lessonId') || '1');
    const stage = (formData.get('stage') as string) || 'phone'; // 'phone' | 'chat'
    const turnIndex = formData.has('turnIndex') ? Number(formData.get('turnIndex')) : 0;
    const durationSeconds = formData.has('durationSeconds') ? Number(formData.get('durationSeconds')) : 0;
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!file.size || file.size > 10 * 1024 * 1024 || !file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid audio file' }, { status: 400 });
    }
    if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > 100 ||
        !['phone', 'chat'].includes(stage) || !Number.isInteger(turnIndex) || turnIndex < 0 || turnIndex > 100 ||
        !Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 3600) {
      return NextResponse.json({ error: 'Invalid recording metadata' }, { status: 400 });
    }
    const userId = session.id;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'audio/webm';
    const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('aac') ? 'aac' : 'webm';

    // Do not create an orphaned object when the production database is unavailable.
    const db = getDbPool();
    if (process.env.NODE_ENV === 'production' && !db) {
      return NextResponse.json({ error: 'Сохранение записей временно недоступно.' }, { status: 503 });
    }
    if (db) await initDatabase();

    // A private, unique path prevents concurrent attempts from overwriting audio.
    const ownerKey = createHash('sha256').update(userId).digest('hex');
    const fileKey = `audio/${ownerKey}/${randomUUID()}.${ext}`;

    const publicUrl = await uploadAudioFile({
      buffer,
      key: fileKey,
      contentType: mimeType,
    });

    let dbRecord = null;

    if (db) {
      // Merge one turn inside the row lock acquired by ON CONFLICT.
      // Parallel uploads must not replace each other's turns.
      const currentTurns = { [turnIndex]: publicUrl };

      // One conflict target only: parallel first inserts must not also race on a deterministic primary key.
      const recordId = `rec_${randomUUID()}`;
      const upsertRes = await db.query(
        `INSERT INTO ulpana_audio_recordings 
          (id, user_id, lesson_id, stage, turns_audio, duration_seconds, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id, lesson_id, stage) DO UPDATE SET
          turns_audio = COALESCE(ulpana_audio_recordings.turns_audio, '{}'::jsonb) || EXCLUDED.turns_audio,
          duration_seconds = CASE WHEN EXCLUDED.duration_seconds > 0 THEN EXCLUDED.duration_seconds ELSE ulpana_audio_recordings.duration_seconds END,
          updated_at = NOW()
         RETURNING *`,
        [recordId, userId, lessonId, stage, JSON.stringify(currentTurns), durationSeconds]
      );

      dbRecord = upsertRes.rows[0];
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      turnIndex,
      stage,
      lessonId,
      dbRecord,
    });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Failed to upload audio', error && typeof error === 'object' && 'code' in error ? error.code : 'storage_error');
    return NextResponse.json({ success: false, error: 'Запись не сохранена. Попробуйте снова.' }, { status: 503 });
  }
}
