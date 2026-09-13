import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { readBoundedJson, RequestBodyError } from '@/lib/requestBody';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) return NextResponse.json({ success: true, savedToDb: false });
    if (!checkRateLimit(`calls:${session.id}`, { limit: 30 }).allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const body = await readBoundedJson(req, 256 * 1024);
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

    if (!Number.isInteger(lessonId) || Number(lessonId) < 1 || Number(lessonId) > 100 ||
        !Number.isInteger(durationSeconds) || Number(durationSeconds) < 0 || Number(durationSeconds) > 3600 ||
        !Array.isArray(transcript) || transcript.length > 100 ||
        [customId, callerName, callerRole, userName].some(v => v !== undefined && (typeof v !== 'string' || v.length > 256)) ||
        (feedback !== undefined && (typeof feedback !== 'string' || feedback.length > 16000))) {
      throw new RequestBodyError('Некорректные данные звонка.', 400);
    }
    const userId = session.id;

    const db = getDbPool();
    if (!db) {
      // Offline fallback: просто возвращаем успешный ответ
      return NextResponse.json({ success: true, savedToDb: false });
    }

    await initDatabase();

    const callId = customId || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const saved = await db.query(
      `INSERT INTO ulpana_call_logs 
        (id, user_id, user_name, lesson_id, caller_name, caller_role, duration_seconds, messages_count, transcript, feedback, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET
        duration_seconds = EXCLUDED.duration_seconds,
        messages_count = EXCLUDED.messages_count,
        transcript = EXCLUDED.transcript,
        feedback = EXCLUDED.feedback
        WHERE ulpana_call_logs.user_id = EXCLUDED.user_id`,
      [
        callId,
        userId,
        session.name || 'Ученик',
        lessonId || 1,
        callerName || 'Собеседник',
        callerRole || 'Собеседник',
        durationSeconds,
        Array.isArray(transcript) ? transcript.length : 0,
        JSON.stringify(transcript),
        feedback || null,
      ]
    );

    if (!saved.rowCount) return NextResponse.json({ error: 'Recording belongs to another account' }, { status: 403 });
    return NextResponse.json({ success: true, callId, savedToDb: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Failed to log call:', error);
    return NextResponse.json({ success: false, error: 'Не удалось сохранить разговор' }, { status: 503 });
  }
}
