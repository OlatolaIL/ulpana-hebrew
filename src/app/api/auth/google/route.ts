import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleIdToken, fetchGoogleUserInfo, createSessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { isVipUser, VIP_EXPIRES_AT } from '@/lib/vipUsers';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, accessToken } = body;

    if (
      (!credential || typeof credential !== 'string') &&
      (!accessToken || typeof accessToken !== 'string')
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid Google credential or accessToken' },
        { status: 400 }
      );
    }

    // 1. Валидация токена Google (ID token через JWKS или Access Token через Google UserInfo)
    let googleUser = null;
    if (credential) {
      googleUser = await verifyGoogleIdToken(credential);
    } else if (accessToken) {
      googleUser = await fetchGoogleUserInfo(accessToken);
    }

    if (!googleUser || !googleUser.email || !googleUser.sub) {
      return NextResponse.json(
        { error: 'Invalid Google authentication token' },
        { status: 401 }
      );
    }

    let userId = `google_${googleUser.sub}`;
    const email = googleUser.email.toLowerCase().trim();
    const fullName = googleUser.name || email.split('@')[0];
    const avatarUrl = googleUser.picture || null;

    // Проверка VIP статуса
    const emailPrefix = email.split('@')[0];
    const isVip = isVipUser(emailPrefix, null, fullName);
    let tier: 'free' | 'pro' | 'admin' = isVip ? 'pro' : 'free';
    let expiresAt: number | null = isVip ? VIP_EXPIRES_AT : null;
    let gender: 'male' | 'female' = 'female';
    let fontStyle: 'print' | 'cursive' = 'print';

    // 2. Интеграция с базой данных
    await initDatabase();
    const db = getDbPool();
    if (!db) return NextResponse.json({ error: 'Вход временно недоступен: база данных не подключена.' }, { status: 503 });

    if (db) {
      // Ищем по email или по google ID
      const existingUser = await db.query(
        'SELECT * FROM ulpana_users WHERE email = $1 OR id = $2',
        [email, userId]
      );

      if (existingUser.rows.length > 0) {
        const row = existingUser.rows[0];
        userId = row.id; // сохраняем существующий id
        tier = isVip ? 'pro' : ((row.subscription_tier as any) || 'free');
        expiresAt = isVip
          ? VIP_EXPIRES_AT
          : (row.subscription_expires_at ? Number(row.subscription_expires_at) : null);
        gender = row.gender || 'female';
        fontStyle = row.font_style || 'print';

        await db.query(
          `UPDATE ulpana_users
           SET name = COALESCE($1, name),
               avatar_url = COALESCE($2, avatar_url),
               email = COALESCE($3, email),
               updated_at = NOW()
           WHERE id = $4`,
          [fullName, avatarUrl, email, userId]
        );
      } else {
        await db.query(
          `INSERT INTO ulpana_users (id, email, name, avatar_url, gender, font_style, subscription_tier, subscription_expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            userId,
            email,
            fullName,
            avatarUrl,
            gender,
            fontStyle,
            tier,
            expiresAt,
          ]
        );
      }

      // Авто-привязка промокода из cookie-моста (устанавливается клиентом при переходе по ?promo=)
      const promoRefCookie = req.cookies.get('ulpana_promo_ref')?.value;
      if (promoRefCookie) {
        const promoCode = decodeURIComponent(promoRefCookie).trim().toUpperCase().slice(0, 64);
        if (promoCode) {
          await db.query(
            `UPDATE ulpana_users SET promo_pending = $1, updated_at = NOW()
             WHERE id = $2 AND (promo_pending IS NULL OR promo_pending = '')`,
            [promoCode, userId]
          );
        }
      }
    }

    // 3. Создаем сессию
    const session: UserSession = {
      id: userId,
      email,
      name: fullName,
      avatarUrl: avatarUrl || undefined,
      subscriptionTier: tier,
      subscriptionExpiresAt: expiresAt,
    };

    const sessionJwt = await createSessionToken(session);

    const response = NextResponse.json({
      success: true,
      user: session,
      gender,
      fontStyle,
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
    console.error('[API Auth Google] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
