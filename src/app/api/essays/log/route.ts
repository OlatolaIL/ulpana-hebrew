import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lessonId = 1,
      topicTitle = 'Сочинение',
      essayText = '',
      score = 0,
      rating = 'good',
      evaluation = {},
      userName = 'Ученик',
    } = body;

    const trimmed = (essayText || '').trim();
    if (!trimmed) {
      return NextResponse.json({ success: false, error: 'Текст сочинения пуст' }, { status: 400 });
    }

    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    const userId = session?.id || 'guest';
    const finalUserName = session?.name || userName || 'Ученик';

    const db = getDbPool();
    if (!db) {
      // Offline fallback
      return NextResponse.json({ success: true, savedToDb: false });
    }

    await initDatabase();

    const essayId = `essay_${userId}_${lessonId}`;

    await db.query(
      `INSERT INTO ulpana_essays 
        (id, user_id, user_name, lesson_id, topic_title, essay_text, score, rating, evaluation, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        topic_title = EXCLUDED.topic_title,
        essay_text = EXCLUDED.essay_text,
        score = EXCLUDED.score,
        rating = EXCLUDED.rating,
        evaluation = EXCLUDED.evaluation,
        updated_at = NOW()`,
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

    return NextResponse.json({ success: true, essayId, savedToDb: true });
  } catch (error: any) {
    console.error('Failed to log essay:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

