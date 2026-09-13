import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { randomUUID } from 'crypto';
import { readBoundedJson, RequestBodyError } from '@/lib/requestBody';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) return NextResponse.json({ success: true, savedToDb: false });
    if (!checkRateLimit(`essays:${session.id}`, { limit: 30 }).allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const body = await readBoundedJson(req, 128 * 1024);
    const {
      lessonId = 1,
      topicTitle = 'Сочинение',
      essayText = '',
      score = 0,
      rating = 'good',
      evaluation = {},
      userName = 'Ученик',
    } = body;

    if (typeof essayText !== 'string' || essayText.length > 20000 || typeof topicTitle !== 'string' || topicTitle.length > 500 ||
        typeof rating !== 'string' || rating.length > 80 || !Number.isInteger(lessonId) || Number(lessonId) < 1 || Number(lessonId) > 100 ||
        !Number.isInteger(score) || Number(score) < 0 || Number(score) > 100) throw new RequestBodyError('Некорректные данные сочинения.', 400);
    const trimmed = essayText.trim();
    if (!trimmed) {
      return NextResponse.json({ success: false, error: 'Текст сочинения пуст' }, { status: 400 });
    }

    const userId = session.id;
    const finalUserName = session?.name || userName || 'Ученик';

    const db = getDbPool();
    if (!db) {
      // Offline fallback
      return NextResponse.json({ success: true, savedToDb: false });
    }

    await initDatabase();

    const essayId = `essay_${randomUUID()}`;

    const saved = await db.query(
      `INSERT INTO ulpana_essays 
        (id, user_id, user_name, lesson_id, topic_title, essay_text, score, rating, evaluation, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        topic_title = EXCLUDED.topic_title,
        essay_text = EXCLUDED.essay_text,
        score = EXCLUDED.score,
        rating = EXCLUDED.rating,
        evaluation = EXCLUDED.evaluation,
        updated_at = NOW() RETURNING id`,
      [
        essayId,
        userId,
        finalUserName,
        lessonId,
        topicTitle,
        trimmed,
        score,
        rating,
        JSON.stringify(evaluation),
      ]
    );

    return NextResponse.json({ success: true, essayId: saved.rows[0].id, savedToDb: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Failed to log essay:', error);
    return NextResponse.json({ success: false, error: 'Не удалось сохранить сочинение' }, { status: 503 });
  }
}

