import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDbPool, initDatabase } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { UserSession } from '@/types';

// In-memory fallback map if DB is offline
const memoryAuthTokens = new Map<string, { status: string; userData?: any; createdAt: number }>();

export async function POST() {
  try {
    const token = 'ulp_' + crypto.randomBytes(12).toString('hex');
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'Ulpinebot';
    
    await initDatabase();
    const db = getDbPool();

    if (db) {
      await db.query(
        'INSERT INTO ulpana_auth_tokens (token, status, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (token) DO NOTHING',
        [token, 'pending']
      );
    } else {
      memoryAuthTokens.set(token, { status: 'pending', createdAt: Date.now() });
    }

    const botUrl = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      botUrl,
      botUsername,
    });
  } catch (error) {
    console.error('[Auth Token POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create auth session' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();

    let status = 'pending';
    let userData: any = null;

    if (db) {
      const res = await db.query(
        'SELECT status, user_data FROM ulpana_auth_tokens WHERE token = $1 AND expires_at > NOW()',
        [token]
      );
      if (res.rows.length > 0) {
        status = res.rows[0].status;
        userData = res.rows[0].user_data;
      }
    } else {
      const mem = memoryAuthTokens.get(token);
      if (mem) {
        status = mem.status;
        userData = mem.userData;
      }
    }

    if (status === 'completed' && userData) {
      const session: UserSession = {
        id: `tg_${userData.id}`,
        telegramId: userData.id,
        username: userData.username,
        name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || (userData.username ? `@${userData.username}` : 'Ученик'),
        avatarUrl: userData.photo_url,
        subscriptionTier: userData.subscriptionTier || 'free',
        subscriptionExpiresAt: userData.subscriptionExpiresAt || null,
      };

      const sessionJwt = await createSessionToken(session);

      const response = NextResponse.json({
        completed: true,
        user: session,
        gender: userData.gender || 'female',
        fontStyle: userData.fontStyle || 'print',
      });

      response.cookies.set('ulpana_session', sessionJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      // Cleanup token
      if (db) {
        await db.query('DELETE FROM ulpana_auth_tokens WHERE token = $1', [token]);
      } else {
        memoryAuthTokens.delete(token);
      }

      return response;
    }

    return NextResponse.json({ completed: false, status });
  } catch (error) {
    console.error('[Auth Token GET] Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
