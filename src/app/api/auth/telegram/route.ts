import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth, createSessionToken, TelegramAuthData } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const data: TelegramAuthData = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!data.id) {
      return NextResponse.json({ error: 'Missing Telegram ID' }, { status: 400 });
    }

    // Если токен бота указан, проводим строгую криптографическую проверку
    if (botToken) {
      const isValid = verifyTelegramAuth(data, botToken);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Telegram signature' }, { status: 401 });
      }
    } else {
      console.warn('[Auth] TELEGRAM_BOT_TOKEN not configured in env. Allowing dev authentication.');
    }

    await initDatabase();
    const db = getDbPool();

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || 'Ученик';
    const userId = `tg_${data.id}`;
    let tier: 'free' | 'pro' | 'admin' = 'free';
    let expiresAt: number | null = null;
    let gender: 'male' | 'female' = 'female';
    let fontStyle: 'print' | 'cursive' = 'print';

    if (db) {
      // Ищем существующего пользователя
      const existingUser = await db.query(
        'SELECT * FROM ulpana_users WHERE telegram_id = $1 OR id = $2',
        [data.id, userId]
      );

      if (existingUser.rows.length > 0) {
        const row = existingUser.rows[0];
        tier = (row.subscription_tier as any) || 'free';
        expiresAt = row.subscription_expires_at ? Number(row.subscription_expires_at) : null;
        gender = row.gender || 'female';
        fontStyle = row.font_style || 'print';

        // Обновляем данные пользователя при входе
        await db.query(
          `UPDATE ulpana_users
           SET name = $1, username = $2, avatar_url = $3, updated_at = NOW()
           WHERE id = $4`,
          [fullName, data.username || null, data.photo_url || null, userId]
        );
      } else {
        // Создаем нового пользователя
        await db.query(
          `INSERT INTO ulpana_users (id, telegram_id, name, username, avatar_url, gender, font_style, subscription_tier)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, data.id, fullName, data.username || null, data.photo_url || null, gender, fontStyle, tier]
        );
      }
    }

    const session: UserSession = {
      id: userId,
      telegramId: data.id,
      username: data.username,
      name: fullName,
      avatarUrl: data.photo_url,
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

    // Устанавливаем защищенную Cookie на 30 дней
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
