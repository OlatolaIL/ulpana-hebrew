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

    if (currentUser.email && currentUser.email !== email) {
      return NextResponse.json({ error: 'К профилю уже привязан другой Google-аккаунт. Замена требует отдельного подтверждения.' }, { status: 409 });
    }

    // 2. Проверяем, существует ли ДРУГОЙ пользователь с этим email или google ID
    const otherRes = await db.query(
      'SELECT * FROM ulpana_users WHERE (email = $1 OR id = $2) AND id != $3',
      [email, googleId, currentSession.id]
    );

    let finalTier = currentUser.subscription_tier || 'free';
    let finalExpiresAt = currentUser.subscription_expires_at ? Number(currentUser.subscription_expires_at) : null;

    if (otherRes.rows.length > 0) {
      return NextResponse.json({ error: 'Этот способ входа уже связан с другим профилем. Войдите в него отдельно: автоматическое объединение данных отключено.' }, { status: 409 });
    }

    // Проверяем VIP статус
    const isVip = isVipUser(currentUser.username, currentUser.telegram_id, currentUser.name) ||
                  isVipUser(email.split('@')[0], null, googleUser.name);
    if (isVip) {
      finalTier = 'pro';
      finalExpiresAt = VIP_EXPIRES_AT;
    }

    // 3. Обновляем текущего пользователя
    const linked = await db.query(`
      UPDATE ulpana_users
      SET email = $1,
          avatar_url = COALESCE(avatar_url, $2),
          subscription_tier = CASE WHEN $6 THEN $3 ELSE subscription_tier END,
          subscription_expires_at = CASE WHEN $6 THEN $4 ELSE subscription_expires_at END,
          updated_at = NOW()
      WHERE id = $5 AND (email IS NULL OR email = $1)
      RETURNING *
    `, [email, googleUser.picture || null, finalTier, finalExpiresAt, currentSession.id, isVip]);

    if (!linked.rows.length) return NextResponse.json({ error: 'Привязка уже изменена. Обновите профиль.' }, { status: 409 });
    const updatedSession: UserSession = {
      ...currentSession,
      email,
      avatarUrl: currentSession.avatarUrl || googleUser.picture || undefined,
      subscriptionTier: linked.rows[0].subscription_tier,
      subscriptionExpiresAt: linked.rows[0].subscription_expires_at ? Number(linked.rows[0].subscription_expires_at) : null,
    };

    const sessionJwt = await createSessionToken(updatedSession);
    const response = NextResponse.json({
      success: true,
      message: 'Google-аккаунт успешно привязан!',
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
    console.error('[API User Link Google] Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера при привязке Google' }, { status: 500 });
  }
}
