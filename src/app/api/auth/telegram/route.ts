import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth, createSessionToken, TelegramAuthData } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const data: TelegramAuthData = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8857824092:AAE3sCbuElBPEctBBXlfTCZfjmPPZTJjdnY';

    if (!data.id && !data.username) {
      return NextResponse.json({ error: 'Укажите Telegram ID или @username' }, { status: 400 });
    }

    // Если передан hash (официальный виджет) — проводим криптографическую проверку
    if (data.hash && data.hash !== 'webapp_validated' && botToken) {
      const isValid = verifyTelegramAuth(data, botToken);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid Telegram signature' }, { status: 401 });
      }
    }

    let rawId = String(data.id || data.username || '').trim();
    let numericId = parseInt(rawId.replace(/\D/g, ''), 10);
    if (isNaN(numericId) || numericId <= 0) {
      let hash = 0;
      for (let i = 0; i < rawId.length; i++) {
        hash = (hash << 5) - hash + rawId.charCodeAt(i);
        hash |= 0;
      }
      numericId = Math.abs(hash) || 1000000;
    }

    const cleanUsername = (data.username || rawId.replace(/^@/, '')).trim();
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || (cleanUsername ? `@${cleanUsername}` : `Telegram ID: ${numericId}`);
    const userId = `tg_${numericId}`;
    let tier: 'free' | 'pro' | 'admin' = 'free';
    let expiresAt: number | null = null;
    let gender: 'male' | 'female' = 'female';
    let fontStyle: 'print' | 'cursive' = 'print';

    await initDatabase();
    const db = getDbPool();

    if (db) {
      // Ищем существующего пользователя
      const existingUser = await db.query(
        'SELECT * FROM ulpana_users WHERE telegram_id = $1 OR id = $2',
        [numericId, userId]
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
           SET name = $1, username = $2, avatar_url = COALESCE($3, avatar_url), updated_at = NOW()
           WHERE id = $4`,
          [fullName, cleanUsername || null, data.photo_url || null, userId]
        );
      } else {
        // Создаем нового пользователя
        await db.query(
          `INSERT INTO ulpana_users (id, telegram_id, name, username, avatar_url, gender, font_style, subscription_tier)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, numericId, fullName, cleanUsername || null, data.photo_url || null, gender, fontStyle, tier]
        );
      }
    }

    const session: UserSession = {
      id: userId,
      telegramId: numericId,
      username: cleanUsername,
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
