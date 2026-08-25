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
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
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
