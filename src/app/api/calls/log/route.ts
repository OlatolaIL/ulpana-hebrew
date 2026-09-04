import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id: customId,
      lessonId,
      callerName,
      callerRole,
      durationSeconds = 0,
      transcript = [],
      feedback,
      userName = 'Ученик',
    } = body;

    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    const userId = session?.id || 'guest';

    const db = getDbPool();
    if (!db) {
      // Offline fallback: просто возвращаем успешный ответ
      return NextResponse.json({ success: true, savedToDb: false });
    }

    await initDatabase();

    const callId = customId || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.query(
      `INSERT INTO ulpana_call_logs 
        (id, user_id, user_name, lesson_id, caller_name, caller_role, duration_seconds, messages_count, transcript, feedback, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET
        duration_seconds = EXCLUDED.duration_seconds,
        messages_count = EXCLUDED.messages_count,
        transcript = EXCLUDED.transcript,
        feedback = EXCLUDED.feedback`,
      [
        callId,
        userId,
        userName || session?.name || 'Ученик',
        lessonId || 1,
        callerName || 'Собеседник',
        callerRole || 'Собеседник',
        durationSeconds,
        Array.isArray(transcript) ? transcript.length : 0,
        JSON.stringify(transcript),
        feedback || null,
      ]
    );

    return NextResponse.json({ success: true, callId, savedToDb: true });
  } catch (error: any) {
    console.error('Failed to log call:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
