import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  verifyTelegramAuth,
  verifyTelegramWebAppData,
  createSessionToken,
  TelegramAuthData,
} from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { isVipUser, VIP_EXPIRES_AT } from '@/lib/vipUsers';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const currentSession = await verifySessionToken(sessionCookie);
    if (!currentSession || !currentSession.id) {
      return NextResponse.json({ error: 'Недействительная сессия' }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    const body = await req.json();

    let validatedUser: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    } | null = null;

    // Вариант 1: Telegram WebApp initData
    if (body.initData) {
      const result = verifyTelegramWebAppData(body.initData, botToken);
      if (result.isValid && result.user) {
        validatedUser = {
          id: result.user.id,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          username: result.user.username,
          photo_url: result.user.photo_url,
        };
      }
    }
    // Вариант 2: Telegram Login Widget (hash + id + auth_date)
    else if (body.hash && body.id && body.auth_date) {
      const isValid = verifyTelegramAuth(body as TelegramAuthData, botToken);
      if (isValid) {
        validatedUser = {
          id: Number(body.id),
          first_name: body.first_name,
          last_name: body.last_name,
          username: body.username,
          photo_url: body.photo_url,
        };
      }
    }
    // Вариант 3: Token из 1-Click бота
    else if (body.token) {
      const db = getDbPool();
      if (db) {
        const tokenRes = await db.query(
          'SELECT status, user_data FROM ulpana_auth_tokens WHERE token = $1 AND status = $2',
          [body.token, 'completed']
        );
        if (tokenRes.rows.length > 0 && tokenRes.rows[0].user_data) {
          const ud = tokenRes.rows[0].user_data;
          validatedUser = {
            id: Number(ud.id),
            first_name: ud.first_name,
            last_name: ud.last_name,
            username: ud.username,
            photo_url: ud.photo_url,
          };
          await db.query('DELETE FROM ulpana_auth_tokens WHERE token = $1', [body.token]);
        }
      }
    }

    if (!validatedUser || !validatedUser.id) {
      return NextResponse.json({ error: 'Неверные данные авторизации Telegram' }, { status: 401 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных недоступна' }, { status: 503 });
    }

    const tgId = validatedUser.id;
    const tgUserId = `tg_${tgId}`;
    const cleanUsername = validatedUser.username ? validatedUser.username.trim() : null;

    // 1. Текущий пользователь
    const currentRes = await db.query('SELECT * FROM ulpana_users WHERE id = $1', [currentSession.id]);
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Текущий профиль не найден' }, { status: 404 });
    }
    const currentUser = currentRes.rows[0];

    // Если уже привязан этот же Telegram
    if (currentUser.telegram_id && Number(currentUser.telegram_id) === tgId) {
      return NextResponse.json({
        success: true,
        alreadyLinked: true,
        message: 'Этот Telegram-аккаунт уже привязан к вашему профилю',
        user: currentSession,
      });
    }

    // 2. Проверяем, существует ли ДРУГОЙ пользователь с таким telegram_id
    const otherRes = await db.query(
      'SELECT * FROM ulpana_users WHERE (telegram_id = $1 OR id = $2) AND id != $3',
      [tgId, tgUserId, currentSession.id]
    );

    let finalTier = currentUser.subscription_tier || 'free';
    let finalExpiresAt = currentUser.subscription_expires_at ? Number(currentUser.subscription_expires_at) : null;

    if (otherRes.rows.length > 0) {
      const otherUser = otherRes.rows[0];
      const otherUserId = otherUser.id;

      // Объединяем PRO подписки
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

      await db.query('DELETE FROM ulpana_vocabulary WHERE user_id = $1', [otherUserId]);
      await db.query('DELETE FROM ulpana_lesson_progress WHERE user_id = $1', [otherUserId]);
      await db.query('DELETE FROM ulpana_users WHERE id = $1', [otherUserId]);
    }

    // Проверка VIP
    const isVip = isVipUser(cleanUsername, tgId, currentUser.name);
    if (isVip) {
      finalTier = 'pro';
      finalExpiresAt = VIP_EXPIRES_AT;
    }

    // 3. Обновляем текущего пользователя
    await db.query(`
      UPDATE ulpana_users
      SET telegram_id = $1,
          username = COALESCE($2, username),
          subscription_tier = $3,
          subscription_expires_at = $4,
          updated_at = NOW()
      WHERE id = $5
    `, [tgId, cleanUsername, finalTier, finalExpiresAt, currentSession.id]);

    const updatedSession: UserSession = {
      ...currentSession,
      telegramId: tgId,
      username: cleanUsername || currentSession.username,
      subscriptionTier: finalTier as any,
      subscriptionExpiresAt: finalExpiresAt,
    };

    const sessionJwt = await createSessionToken(updatedSession);
    const response = NextResponse.json({
      success: true,
      message: otherRes.rows.length > 0
        ? 'Telegram успешно привязан, данные профилей объединены!'
        : 'Telegram успешно привязан!',
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
    console.error('[API User Link Telegram] Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера при привязке Telegram' }, { status: 500 });
  }
}
