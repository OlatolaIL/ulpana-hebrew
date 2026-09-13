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
    if (!botToken) return NextResponse.json({ error: 'Вход через Telegram не настроен' }, { status: 503 });
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
    if (!validatedUser || !Number.isSafeInteger(validatedUser.id) || validatedUser.id <= 0) {
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

    if (currentUser.telegram_id && Number(currentUser.telegram_id) !== tgId) {
      return NextResponse.json({ error: 'К профилю уже привязан другой Telegram. Замена требует отдельного подтверждения.' }, { status: 409 });
    }

    // 2. Проверяем, существует ли ДРУГОЙ пользователь с таким telegram_id
    const otherRes = await db.query(
      'SELECT * FROM ulpana_users WHERE (telegram_id = $1 OR id = $2) AND id != $3',
      [tgId, tgUserId, currentSession.id]
    );

    let finalTier = currentUser.subscription_tier || 'free';
    let finalExpiresAt = currentUser.subscription_expires_at ? Number(currentUser.subscription_expires_at) : null;

    if (otherRes.rows.length > 0) {
      return NextResponse.json({ error: 'Этот способ входа уже связан с другим профилем. Войдите в него отдельно: автоматическое объединение данных отключено.' }, { status: 409 });
    }

    // Проверка VIP
    const isVip = isVipUser(cleanUsername, tgId, currentUser.name);
    if (isVip) {
      finalTier = 'pro';
      finalExpiresAt = VIP_EXPIRES_AT;
    }

    // 3. Обновляем текущего пользователя
    const linked = await db.query(`
      UPDATE ulpana_users
      SET telegram_id = $1,
          username = COALESCE($2, username),
          subscription_tier = CASE WHEN $6 THEN $3 ELSE subscription_tier END,
          subscription_expires_at = CASE WHEN $6 THEN $4 ELSE subscription_expires_at END,
          updated_at = NOW()
      WHERE id = $5 AND (telegram_id IS NULL OR telegram_id = $1)
      RETURNING *
    `, [tgId, cleanUsername, finalTier, finalExpiresAt, currentSession.id, isVip]);

    if (!linked.rows.length) return NextResponse.json({ error: 'Привязка уже изменена. Обновите профиль.' }, { status: 409 });
    const updatedSession: UserSession = {
      ...currentSession,
      telegramId: tgId,
      username: cleanUsername || currentSession.username,
      subscriptionTier: linked.rows[0].subscription_tier,
      subscriptionExpiresAt: linked.rows[0].subscription_expires_at ? Number(linked.rows[0].subscription_expires_at) : null,
    };

    const sessionJwt = await createSessionToken(updatedSession);
    const response = NextResponse.json({
      success: true,
      message: 'Telegram успешно привязан!',
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
    if ((error as { code?: string })?.code === '23505') return NextResponse.json({ error: 'Этот способ входа уже связан с другим профилем.' }, { status: 409 });
    console.error('[API User Link Telegram] Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера при привязке Telegram' }, { status: 500 });
  }
}
