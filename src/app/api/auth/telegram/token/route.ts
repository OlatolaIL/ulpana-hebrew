import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, initDatabase } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import {
  checkAuthConfiguration,
  createPollingSession,
  consumePollingSession,
  isLegacyOrInsecureToken,
  isValidPollingToken,
  toUserSession,
} from '@/lib/loginTokens';

export async function POST() {
  try {
    const authConfig = checkAuthConfiguration();
    if (!authConfig.ok || !process.env.TELEGRAM_BOT_TOKEN?.trim() || !process.env.TELEGRAM_WEBHOOK_SECRET?.trim()) {
      return NextResponse.json(
        { error: authConfig.error || 'Служба авторизации недоступна' },
        { status: 503 }
      );
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json(
        { error: 'База данных авторизации недоступна' },
        { status: 503 }
      );
    }

    const token = await createPollingSession(db);
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'Ulpinebot';
    const botUrl = `https://t.me/${botUsername}?start=${token}`;

    return NextResponse.json({
      success: true,
      token,
      botUrl,
      botUsername,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Auth Token POST] Error:', error);
    return NextResponse.json({ error: 'Не удалось создать сессию авторизации' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authConfig = checkAuthConfiguration();
    if (!authConfig.ok) {
      return NextResponse.json(
        { error: authConfig.error || 'Служба авторизации недоступна' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json({ error: 'Токен не передан' }, { status: 400 });
    }

    // Отклоняем токены старого небезопасного формата и сырые JWT
    if (isLegacyOrInsecureToken(token) || !isValidPollingToken(token)) {
      return NextResponse.json(
        { error: 'Недействительный или устаревший формат токена' },
        { status: 400 }
      );
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json(
        { error: 'База данных авторизации недоступна' },
        { status: 503 }
      );
    }

    // Одноразовое атомарное потребление токена поллинга
    const result = await consumePollingSession(db, token);

    if (result.completed && result.userData) {
      const session = toUserSession(result.userData);
      const sessionJwt = await createSessionToken(session);

      const response = NextResponse.json({
        completed: true,
        user: session,
        gender: result.userData.gender || 'female',
        fontStyle: result.userData.fontStyle || 'print',
      });

      response.cookies.set('ulpana_session', sessionJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      response.headers.set('Cache-Control', 'no-store');

      return response;
    }

    return NextResponse.json({ completed: false, status: result.status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Auth Token GET] Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
