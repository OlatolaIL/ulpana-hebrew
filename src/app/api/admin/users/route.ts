import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import { VIP_EXPIRES_AT } from '@/lib/vipUsers';

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
        users: [],
      });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search')?.trim().toLowerCase() || '';

    // 1. Детальный запрос по конкретному пользователю
    if (userId) {
      const userRes = await db.query('SELECT * FROM ulpana_users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
      }

      const progressRes = await db.query(
        'SELECT lesson_id, completed_tabs, is_completed, score, last_visited, updated_at FROM ulpana_lesson_progress WHERE user_id = $1 ORDER BY lesson_id ASC',
        [userId]
      );

      const vocabRes = await db.query(
        'SELECT id, hebrew, hebrew_plain, transcription, translation, part_of_speech, root, lesson_id, created_at FROM ulpana_vocabulary WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      const user = userRes.rows[0];
      return NextResponse.json({
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatar_url,
          gender: user.gender,
          fontStyle: user.font_style,
          subscriptionTier: user.subscription_tier,
          subscriptionExpiresAt: user.subscription_expires_at ? Number(user.subscription_expires_at) : null,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        progress: progressRes.rows.map((r) => ({
          lessonId: r.lesson_id,
          completedTabs: r.completed_tabs || [],
          isCompleted: r.is_completed,
          score: r.score,
          lastVisited: Number(r.last_visited),
          updatedAt: r.updated_at,
        })),
        vocabulary: vocabRes.rows.map((r) => ({
          id: r.id,
          hebrew: r.hebrew,
          hebrewPlain: r.hebrew_plain,
          transcription: r.transcription,
          translation: r.translation,
          partOfSpeech: r.part_of_speech,
          root: r.root,
          lessonId: r.lesson_id,
          createdAt: r.created_at,
        })),
      });
    }

    // 2. Список всех пользователей с поиском и агрегацией прогресса (без декартова произведения таблиц)
    let query = `
      SELECT 
        u.id,
        u.telegram_id,
        u.email,
        u.name,
        u.username,
        u.avatar_url,
        u.gender,
        u.font_style,
        u.subscription_tier,
        u.subscription_expires_at,
        u.created_at,
        u.updated_at,
        COALESCE(lp_stats.completed_count, 0) as completed_lessons_count,
        COALESCE(lp_stats.max_lesson_id, 0) as max_lesson_id,
        COALESCE(lp_stats.avg_score, 0) as avg_score,
        lp_stats.last_active_at,
        COALESCE(v_stats.vocab_count, 0) as vocab_words_count
      FROM ulpana_users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(CASE WHEN is_completed THEN 1 END) as completed_count,
          MAX(lesson_id) as max_lesson_id,
          ROUND(AVG(NULLIF(score, 0))) as avg_score,
          MAX(updated_at) as last_active_at
        FROM ulpana_lesson_progress
        GROUP BY user_id
      ) lp_stats ON u.id = lp_stats.user_id
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as vocab_count
        FROM ulpana_vocabulary
        GROUP BY user_id
      ) v_stats ON u.id = v_stats.user_id
    `;

    const queryParams: any[] = [];
    if (search) {
      query += `
        WHERE LOWER(u.name) LIKE $1 
           OR LOWER(COALESCE(u.username, '')) LIKE $1 
           OR CAST(u.telegram_id AS TEXT) LIKE $1
           OR u.id LIKE $1
      `;
      queryParams.push(`%${search}%`);
    }

    query += `
      ORDER BY COALESCE(lp_stats.last_active_at, u.created_at) DESC
      LIMIT 100
    `;

    const usersListRes = await db.query(query, queryParams);

    const users = usersListRes.rows.map((r) => {
      const expiresAt = r.subscription_expires_at ? Number(r.subscription_expires_at) : null;
      const isProActive =
        r.subscription_tier === 'pro' && (!expiresAt || expiresAt > Date.now());

      return {
        id: r.id,
        telegramId: r.telegram_id,
        email: r.email,
        name: r.name,
        username: r.username,
        avatarUrl: r.avatar_url,
        gender: r.gender,
        fontStyle: r.font_style,
        subscriptionTier: isProActive ? 'pro' : 'free',
        subscriptionExpiresAt: expiresAt,
        createdAt: r.created_at,
        lastActiveAt: r.last_active_at || r.created_at,
        completedLessonsCount: parseInt(r.completed_lessons_count || '0', 10),
        maxLessonId: parseInt(r.max_lesson_id || '0', 10),
        avgScore: parseInt(r.avg_score || '0', 10),
        vocabWordsCount: parseInt(r.vocab_words_count || '0', 10),
      };
    });

    return NextResponse.json({
      isDbConnected: true,
      users,
      totalCount: users.length,
    });
  } catch (error) {
    console.error('[API Admin Users GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { userId, action, days } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'Параметры userId и action обязательны' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    let newTier = 'free';
    let newExpiresAt: number | null = null;

    if (action === 'grant_pro') {
      newTier = 'pro';
      const daysValid = Number(days) || 30;
      newExpiresAt = Date.now() + daysValid * 86400000;
    } else if (action === 'grant_vip') {
      newTier = 'pro';
      newExpiresAt = VIP_EXPIRES_AT;
    } else if (action === 'revoke_pro') {
      newTier = 'free';
      newExpiresAt = null;
    }

    await db.query(
      `UPDATE ulpana_users
       SET subscription_tier = $1, subscription_expires_at = $2, updated_at = NOW()
       WHERE id = $3`,
      [newTier, newExpiresAt, userId]
    );

    return NextResponse.json({
      success: true,
      subscriptionTier: newTier,
      subscriptionExpiresAt: newExpiresAt,
    });
  } catch (error) {
    console.error('[API Admin Users POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
