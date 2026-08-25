import { NextRequest, NextResponse } from 'next/server';
import {
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
    const body = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8857824092:AAE3sCbuElBPEctBBXlfTCZfjmPPZTJjdnY';

    let validatedUser: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    } | null = null;

    // Вариант 1: Telegram Mini App (initData)
    if (body.initData && typeof body.initData === 'string') {
      const result = verifyTelegramWebAppData(body.initData, botToken);
      if (!result.isValid || !result.user || !result.user.id) {
        return NextResponse.json(
          { error: 'Invalid Telegram WebApp signature' },
          { status: 401 }
        );
      }
      validatedUser = {
        id: result.user.id,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        username: result.user.username,
        photo_url: result.user.photo_url,
      };
    }
    // Вариант 2: Официальный виджет Telegram Login (hash + id + auth_date)
    else if (body.hash && body.id && body.auth_date) {
      const isValid = verifyTelegramAuth(body as TelegramAuthData, botToken);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid Telegram Widget signature' },
          { status: 401 }
        );
      }
      validatedUser = {
        id: Number(body.id),
        first_name: body.first_name,
        last_name: body.last_name,
        username: body.username,
        photo_url: body.photo_url,
      };
    } else {
      // Любые другие неподписанные попытки входа строго отклоняются
      return NextResponse.json(
        { error: 'Missing or invalid cryptographic signature' },
        { status: 401 }
      );
    }

    const numericId = validatedUser.id;
    const cleanUsername = validatedUser.username ? validatedUser.username.trim() : '';
    const fullName =
      [validatedUser.first_name, validatedUser.last_name].filter(Boolean).join(' ') ||
      (cleanUsername ? `@${cleanUsername}` : `Telegram ID: ${numericId}`);
    const userId = `tg_${numericId}`;

    // Строгая проверка VIP/Admin по числовому ID и username
    const isVip = isVipUser(cleanUsername, numericId);
    let tier: 'free' | 'pro' | 'admin' = isVip ? 'pro' : 'free';
    let expiresAt: number | null = isVip ? VIP_EXPIRES_AT : null;
    let gender: 'male' | 'female' = 'female';
    let fontStyle: 'print' | 'cursive' = 'print';

    await initDatabase();
    const db = getDbPool();

    if (db) {
      const existingUser = await db.query(
        'SELECT * FROM ulpana_users WHERE telegram_id = $1 OR id = $2',
        [numericId, userId]
      );

      if (existingUser.rows.length > 0) {
        const row = existingUser.rows[0];
        tier = isVip ? 'pro' : ((row.subscription_tier as any) || 'free');
        expiresAt = isVip
          ? VIP_EXPIRES_AT
          : (row.subscription_expires_at ? Number(row.subscription_expires_at) : null);
        gender = row.gender || 'female';
        fontStyle = row.font_style || 'print';

        await db.query(
          `UPDATE ulpana_users
           SET name = $1, username = $2, avatar_url = COALESCE($3, avatar_url), updated_at = NOW()
           WHERE id = $4`,
          [fullName, cleanUsername || null, validatedUser.photo_url || null, userId]
        );
      } else {
        await db.query(
          `INSERT INTO ulpana_users (id, telegram_id, name, username, avatar_url, gender, font_style, subscription_tier, subscription_expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            userId,
            numericId,
            fullName,
            cleanUsername || null,
            validatedUser.photo_url || null,
            gender,
            fontStyle,
            tier,
            expiresAt,
          ]
        );
      }
    }

    const session: UserSession = {
      id: userId,
      telegramId: numericId,
      username: cleanUsername,
      name: fullName,
      avatarUrl: validatedUser.photo_url,
      subscriptionTier: tier,
      subscriptionExpiresAt: expiresAt,
    };

    const token = await createSessionToken(session);

    const response = NextResponse.json({
      success: true,
      user: session,
      gender,
      fontStyle,
    });

    response.cookies.set('ulpana_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[API Auth Telegram] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
