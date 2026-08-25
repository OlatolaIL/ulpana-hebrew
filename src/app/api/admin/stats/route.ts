import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    await initDatabase();
    const db = getDbPool();

    if (!db) {
      return NextResponse.json({
        isDbConnected: false,
        stats: {
          totalUsers: 0,
          todayUsers: 0,
          weekUsers: 0,
          proUsers: 0,
          totalCompletedLessons: 0,
          activeUsersWeek: 0,
        },
        recentActivity: [],
      });
    }

    // 1. Общее количество пользователей
    const usersCountRes = await db.query('SELECT COUNT(*) as count FROM ulpana_users');
    const totalUsers = parseInt(usersCountRes.rows[0]?.count || '0', 10);

    // 2. Новые пользователи за 24 часа
    const todayUsersRes = await db.query(`
      SELECT COUNT(*) as count FROM ulpana_users
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `);
    const todayUsers = parseInt(todayUsersRes.rows[0]?.count || '0', 10);

    // 3. Новые пользователи за 7 дней
    const weekUsersRes = await db.query(`
      SELECT COUNT(*) as count FROM ulpana_users
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const weekUsers = parseInt(weekUsersRes.rows[0]?.count || '0', 10);

    // 4. Активные PRO-пользователи
    const proUsersRes = await db.query(`
      SELECT COUNT(*) as count FROM ulpana_users
      WHERE subscription_tier = 'pro'
        AND (subscription_expires_at IS NULL OR subscription_expires_at > (EXTRACT(EPOCH FROM NOW()) * 1000))
    `);
    const proUsers = parseInt(proUsersRes.rows[0]?.count || '0', 10);

    // 5. Суммарно пройденных уроков
    const completedLessonsRes = await db.query(`
      SELECT COUNT(*) as count FROM ulpana_lesson_progress
      WHERE is_completed = true
    `);
    const totalCompletedLessons = parseInt(completedLessonsRes.rows[0]?.count || '0', 10);

    // 6. Активные ученики за последние 7 дней (по активности в уроках)
    const activeLearnersRes = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM ulpana_lesson_progress
      WHERE updated_at >= NOW() - INTERVAL '7 days'
    `);
    const activeUsersWeek = parseInt(activeLearnersRes.rows[0]?.count || '0', 10);

    // 7. Лента недавней активности
    const recentActivityRes = await db.query(`
      SELECT 
        lp.id,
        lp.user_id,
        u.name as user_name,
        u.username as user_username,
        u.avatar_url as user_avatar,
        lp.lesson_id,
        lp.is_completed,
        lp.score,
        lp.updated_at
      FROM ulpana_lesson_progress lp
      LEFT JOIN ulpana_users u ON lp.user_id = u.id
      ORDER BY lp.updated_at DESC
      LIMIT 10
    `);

    const recentActivity = recentActivityRes.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name || 'Анонимный ученик',
      userUsername: r.user_username,
      userAvatar: r.user_avatar,
      lessonId: r.lesson_id,
      isCompleted: r.is_completed,
      score: r.score,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({
      isDbConnected: true,
      stats: {
        totalUsers,
        todayUsers,
        weekUsers,
        proUsers,
        totalCompletedLessons,
        activeUsersWeek,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('[API Admin Stats] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
