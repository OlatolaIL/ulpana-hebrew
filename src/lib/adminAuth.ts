import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { isVipUser } from '@/lib/vipUsers';
import { UserSession } from '@/types';

export interface AdminAuthResult {
  authorized: boolean;
  session?: UserSession;
  error?: string;
  status?: number;
}

/**
 * Проверка прав администратора для API роутов
 * Поддерживает как веб-сессию (cookie), так и Machine-to-Machine ключ (x-admin-key / Bearer)
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  // 1. M2M (Machine-to-Machine) авторизация для фоновых скриптов и радаров
  const adminKeyHeader = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expectedKey = process.env.ADMIN_SECRET_KEY?.trim() || process.env.JWT_SECRET?.trim();

  if (adminKeyHeader && expectedKey) {
    try {
      const keyBuf = Buffer.from(adminKeyHeader);
      const expBuf = Buffer.from(expectedKey);
      if (keyBuf.length === expBuf.length && crypto.timingSafeEqual(keyBuf, expBuf)) {
        return {
          authorized: true,
          session: {
            id: 'm2m-admin-radar',
            name: 'M2M Admin Radar',
            username: 'osa_il',
            telegramId: 100000000,
            subscriptionTier: 'pro',
          },
        };
      }
    } catch {
      // Игнорируем ошибки длины буфера
    }
  }

  // 2. Интерактивная веб-сессия через куки браузера
  const token = req.cookies.get('ulpana_session')?.value;
  if (!token) {
    return {
      authorized: false,
      error: 'Unauthorized: Требуется авторизация',
      status: 401,
    };
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return {
      authorized: false,
      error: 'Invalid session: Сессия недействительна или истекла',
      status: 401,
    };
  }

  // Строгая проверка прав доступа: только VIP / Admin (osa_il и доверенные ID)
  const isAdmin = isVipUser(session.username, session.telegramId, session.name);
  if (!isAdmin) {
    return {
      authorized: false,
      error: 'Forbidden: Доступ разрешен только администратору (@osa_il)',
      status: 403,
    };
  }

  return {
    authorized: true,
    session,
  };
}
