import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, verifyGoogleIdToken, fetchGoogleUserInfo, createSessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { isVipUser, VIP_EXPIRES_AT } from '@/lib/vipUsers';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const currentSession = await verifySessionToken(token);
    if (!currentSession || !currentSession.id) {
      return NextResponse.json({ error: 'Недействительная сессия' }, { status: 401 });
    }

    const body = await req.json();
    const { credential, accessToken } = body;

    if (
      (!credential || typeof credential !== 'string') &&
      (!accessToken || typeof accessToken !== 'string')
    ) {
      return NextResponse.json(
        { error: 'Отсутствует токен авторизации Google' },
        { status: 400 }
      );
    }

    let googleUser = null;
    if (credential) {
      googleUser = await verifyGoogleIdToken(credential);
    } else if (accessToken) {
      googleUser = await fetchGoogleUserInfo(accessToken);
    }

    if (!googleUser || !googleUser.email || !googleUser.sub) {
      return NextResponse.json(
        { error: 'Не удалось подтвердить Google-аккаунт' },
        { status: 401 }
      );
    }

    const email = googleUser.email.toLowerCase().trim();
    const googleId = `google_${googleUser.sub}`;

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных недоступна' }, { status: 503 });
    }

    // 1. Получаем текущего пользователя из БД
    const currentRes = await db.query('SELECT * FROM ulpana_users WHERE id = $1', [currentSession.id]);
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Текущий профиль не найден в базе' }, { status: 404 });
    }
    const currentUser = currentRes.rows[0];

    // Если этот email уже привязан к текущему аккаунту
    if (currentUser.email === email) {
      return NextResponse.json({
        success: true,
        alreadyLinked: true,
        message: 'Этот Google-аккаунт уже привязан к вашему профилю',
        user: { ...currentSession, email },
      });
    }

    // 2. Проверяем, существует ли ДРУГОЙ пользователь с этим email или google ID
    const otherRes = await db.query(
      'SELECT * FROM ulpana_users WHERE (email = $1 OR id = $2) AND id != $3',
      [email, googleId, currentSession.id]
    );

    let finalTier = currentUser.subscription_tier || 'free';
    let finalExpiresAt = currentUser.subscription_expires_at ? Number(currentUser.subscription_expires_at) : null;

    if (otherRes.rows.length > 0) {
      const otherUser = otherRes.rows[0];
      const otherUserId = otherUser.id;

      // Объединяем подписки: если у другого пользователя PRO лучше, забираем его
      if (otherUser.subscription_tier === 'pro' && finalTier !== 'pro') {
        finalTier = 'pro';
        finalExpiresAt = otherUser.subscription_expires_at ? Number(otherUser.subscription_expires_at) : null;
      } else if (otherUser.subscription_tier === 'pro' && finalTier === 'pro') {
        const otherExp = otherUser.subscription_expires_at ? Number(otherUser.subscription_expires_at) : 0;
        if (otherExp > (finalExpiresAt || 0)) {
          finalExpiresAt = otherExp;
        }
      }

      // Объединяем прогресс уроков
      await db.query(`
        INSERT INTO ulpana_lesson_progress (user_id, lesson_id, completed_tabs, is_completed, score, last_visited, updated_at)
        SELECT $1, lesson_id, completed_tabs, is_completed, score, last_visited, updated_at
        FROM ulpana_lesson_progress
        WHERE user_id = $2
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
          is_completed = ulpana_lesson_progress.is_completed OR EXCLUDED.is_completed,
          score = GREATEST(ulpana_lesson_progress.score, EXCLUDED.score),
          completed_tabs = (
            SELECT array_agg(DISTINCT tab)
            FROM unnest(ulpana_lesson_progress.completed_tabs || EXCLUDED.completed_tabs) AS tab
          ),
          updated_at = NOW()
      `, [currentSession.id, otherUserId]);

      // Объединяем словарик
      await db.query(`
        UPDATE ulpana_vocabulary
        SET user_id = $1
        WHERE user_id = $2
        AND NOT EXISTS (
          SELECT 1 FROM ulpana_vocabulary uv2
          WHERE uv2.user_id = $1 AND uv2.hebrew_plain = ulpana_vocabulary.hebrew_plain
        )
      `, [currentSession.id, otherUserId]);

      // Очищаем старые записи
      await db.query('DELETE FROM ulpana_vocabulary WHERE user_id = $1', [otherUserId]);
      await db.query('DELETE FROM ulpana_lesson_progress WHERE user_id = $1', [otherUserId]);
      await db.query('DELETE FROM ulpana_users WHERE id = $1', [otherUserId]);
    }

    // Проверяем VIP статус
    const isVip = isVipUser(currentUser.username, currentUser.telegram_id, currentUser.name) ||
                  isVipUser(email.split('@')[0], null, googleUser.name);
    if (isVip) {
      finalTier = 'pro';
      finalExpiresAt = VIP_EXPIRES_AT;
    }

    // 3. Обновляем текущего пользователя
    await db.query(`
      UPDATE ulpana_users
      SET email = $1,
          avatar_url = COALESCE(avatar_url, $2),
          subscription_tier = $3,
          subscription_expires_at = $4,
          updated_at = NOW()
      WHERE id = $5
    `, [email, googleUser.picture || null, finalTier, finalExpiresAt, currentSession.id]);

    const updatedSession: UserSession = {
      ...currentSession,
      email,
      avatarUrl: currentSession.avatarUrl || googleUser.picture || undefined,
      subscriptionTier: finalTier as any,
      subscriptionExpiresAt: finalExpiresAt,
    };

    const sessionJwt = await createSessionToken(updatedSession);
    const response = NextResponse.json({
      success: true,
      message: otherRes.rows.length > 0
        ? 'Google-аккаунт успешно привязан, данные профилей объединены!'
        : 'Google-аккаунт успешно привязан!',
      user: updatedSession,
    });

    response.cookies.set('ulpana_session', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[API User Link Google] Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера при привязке Google' }, { status: 500 });
  }
}
