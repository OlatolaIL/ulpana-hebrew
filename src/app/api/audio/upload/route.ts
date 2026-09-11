import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { uploadAudioFile } from '@/lib/cloudStorage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | File | null;
    const lessonId = parseInt((formData.get('lessonId') as string) || '1', 10);
    const stage = (formData.get('stage') as string) || 'phone'; // 'phone' | 'chat'
    const turnIndex = formData.has('turnIndex') ? parseInt(formData.get('turnIndex') as string, 10) : 0;
    const durationSeconds = formData.has('durationSeconds') ? parseInt(formData.get('durationSeconds') as string, 10) : 0;
    const customUserId = (formData.get('userId') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    const userId = session?.id || customUserId || 'guest';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'audio/webm';
    const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('aac') ? 'aac' : 'webm';

    // Детерминированный путь файла: перезаписывает старую попытку в облаке/диске
    const fileKey = `audio/${userId}/lesson_${lessonId}_${stage}_turn_${turnIndex}.${ext}`;

    const publicUrl = await uploadAudioFile({
      buffer,
      key: fileKey,
      contentType: mimeType,
    });

    const db = getDbPool();
    let dbRecord = null;

    if (db) {
      await initDatabase();

      // Получаем существующие turns_audio для дополнения или перезаписи
      const existingRes = await db.query(
        `SELECT turns_audio FROM ulpana_audio_recordings WHERE user_id = $1 AND lesson_id = $2 AND stage = $3`,
        [userId, lessonId, stage]
      );

      let currentTurns: Record<string, string> = {};
      if (existingRes.rows.length > 0 && existingRes.rows[0].turns_audio) {
        currentTurns = typeof existingRes.rows[0].turns_audio === 'string'
          ? JSON.parse(existingRes.rows[0].turns_audio)
          : existingRes.rows[0].turns_audio;
      }

      // Обновляем аудио для конкретного хода
      currentTurns[turnIndex] = publicUrl;

      const recordId = `rec_${userId}_${lessonId}_${stage}`;
      const upsertRes = await db.query(
        `INSERT INTO ulpana_audio_recordings 
          (id, user_id, lesson_id, stage, turns_audio, duration_seconds, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id, lesson_id, stage) DO UPDATE SET
          turns_audio = EXCLUDED.turns_audio,
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
  } catch (error: any) {
    console.error('Failed to upload audio:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
