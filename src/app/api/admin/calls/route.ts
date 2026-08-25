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
      return NextResponse.json({ calls: [], total: 0 });
    }

    await initDatabase();

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const countRes = await db.query('SELECT COUNT(*) as count FROM ulpana_call_logs');
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const callsRes = await db.query(
      `SELECT id, user_id, user_name, lesson_id, caller_name, caller_role, duration_seconds, messages_count, transcript, feedback, created_at 
       FROM ulpana_call_logs 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      calls: callsRes.rows,
      total,
    });
  } catch (error: any) {
    console.error('Failed to get call logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
