import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ essays: [], total: 0 });
    }

    await initDatabase();

    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const lessonIdParam = searchParams.get('lessonId');
    const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : null;

    let countQuery = 'SELECT COUNT(*) as count FROM ulpana_essays';
    let selectQuery = `
      SELECT id, user_id, user_name, lesson_id, topic_title, essay_text, score, rating, evaluation, created_at, updated_at
      FROM ulpana_essays
    `;
    const countParams: unknown[] = [];
    const selectParams: unknown[] = [];

    if (lessonId && Number.isInteger(lessonId)) {
      countQuery += ' WHERE lesson_id = $1';
      countParams.push(lessonId);
      selectQuery += ' WHERE lesson_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3';
      selectParams.push(lessonId, limit, offset);
    } else {
      selectQuery += ' ORDER BY updated_at DESC LIMIT $1 OFFSET $2';
      selectParams.push(limit, offset);
    }

    const countRes = await db.query(countQuery, countParams);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const essaysRes = await db.query(selectQuery, selectParams);

    return NextResponse.json({
      essays: essaysRes.rows,
      total,
    });
  } catch (error: any) {
    console.error('Failed to get essays:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
