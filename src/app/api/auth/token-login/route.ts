import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, initDatabase } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { readBoundedJson, RequestBodyError } from '@/lib/requestBody';
import {
  checkAuthConfiguration,
  consumeMagicLinkSession,
  isLegacyOrInsecureToken,
  isValidMagicLinkToken,
  toUserSession,
} from '@/lib/loginTokens';

export async function POST(req: NextRequest) {
  try {
    const authConfig = checkAuthConfiguration();
    if (!authConfig.ok) {
      return NextResponse.json(
        { error: authConfig.error || 'Служба авторизации недоступна' },
        { status: 503 }
      );
    }

    const body = await readBoundedJson(req, 4096);
    const rawToken = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!rawToken) {
      return NextResponse.json({ error: 'Токен входа не передан' }, { status: 400 });
    }

    // Отклоняем токены старого небезопасного формата и сырые JWT
    if (isLegacyOrInsecureToken(rawToken) || !isValidMagicLinkToken(rawToken)) {
      return NextResponse.json(
        { error: 'Недействительный или устаревший формат одноразовой ссылки' },
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

    // Одноразовое атомарное потребление токена из БД
    const userData = await consumeMagicLinkSession(db, rawToken);
    if (!userData) {
      return NextResponse.json(
        { error: 'Ссылка для входа недействительна или уже была использована' },
        { status: 401 }
      );
    }

    // Формируем сессию с сохранением канонического id профиля
    const session = toUserSession(userData);
    const sessionJwt = await createSessionToken(session);

    const response = NextResponse.json({
      success: true,
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
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[Token Login] Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
