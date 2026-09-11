import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lessonId = parseInt(searchParams.get('lessonId') || '1', 10);
    const stage = searchParams.get('stage') || 'phone';
    const queryUserId = searchParams.get('userId');

    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    const userId = queryUserId || session?.id || 'guest';

    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ recording: null });
    }

    await initDatabase();

    const res = await db.query(
      `SELECT id, user_id, lesson_id, stage, turns_audio, full_audio_url, duration_seconds, updated_at 
       FROM ulpana_audio_recordings 
       WHERE user_id = $1 AND lesson_id = $2 AND stage = $3`,
      [userId, lessonId, stage]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ recording: null });
    }

    const row = res.rows[0];
    const turnsAudio = typeof row.turns_audio === 'string'
      ? JSON.parse(row.turns_audio)
      : (row.turns_audio || {});

    return NextResponse.json({
      recording: {
        id: row.id,
        userId: row.user_id,
        lessonId: row.lesson_id,
        stage: row.stage,
        turnsAudio,
        fullAudioUrl: row.full_audio_url,
        durationSeconds: row.duration_seconds,
        updatedAt: row.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Failed to get audio recording:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
