import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, createSessionToken } from '@/lib/auth';
import { getDbPool } from '@/lib/db';
import { UserSession } from '@/types';
import { IS_EARLY_ACCESS_FREE } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Войдите в аккаунт, чтобы зафиксировать промокод', requireAuth: true },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Недействительная сессия', requireAuth: true },
        { status: 401 }
      );
    }

    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Укажите промокод' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    const db = getDbPool();
    if (!db) {
      return NextResponse.json(
        { error: 'База данных недоступна. Попробуйте позже.' },
        { status: 503 }
      );
    }

    // Валидируем: код должен существовать и быть активным
    const promoRes = await db.query(
      'SELECT * FROM ulpana_promo_codes WHERE UPPER(code) = $1 AND is_active = true',
      [normalizedCode]
    );

    if (promoRes.rows.length === 0) {
      return NextResponse.json({ error: 'Неверный или недействительный промокод' }, { status: 400 });
    }

    const promo = promoRes.rows[0];
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'Лимит активаций этого промокода исчерпан' }, { status: 400 });
    }

    // Режим беты: сохраняем код за пользователем, активируем после беты
    if (IS_EARLY_ACCESS_FREE) {
      await db.query(
        `UPDATE ulpana_users SET promo_pending = $1, updated_at = NOW() WHERE id = $2`,
        [normalizedCode, session.id]
      );
      return NextResponse.json({
        success: true,
        pending: true,
        message: `Промокод «${normalizedCode}» зафиксирован! PRO-доступ активируется автоматически после окончания беты.`,
        user: session,
      });
    }

    // Обычный режим: активируем сразу
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'Лимит активаций этого промокода исчерпан' }, { status: 400 });
    }

    const daysToAdd: number = promo.days_valid;

    await db.query(
      'UPDATE ulpana_promo_codes SET used_count = used_count + 1 WHERE id = $1',
      [promo.id]
    );

    const currentExpires =
      session.subscriptionExpiresAt && session.subscriptionExpiresAt > Date.now()
        ? session.subscriptionExpiresAt
        : Date.now();

    const newExpiresAt = currentExpires + daysToAdd * 24 * 60 * 60 * 1000;

    await db.query(
      `UPDATE ulpana_users
       SET subscription_tier = 'pro', subscription_expires_at = $1, promo_pending = NULL, updated_at = NOW()
       WHERE id = $2`,
      [newExpiresAt, session.id]
    );

    const updatedSession: UserSession = {
      ...session,
      subscriptionTier: 'pro',
      subscriptionExpiresAt: newExpiresAt,
    };

    const newToken = await createSessionToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      pending: false,
      message: `Промокод успешно активирован! PRO-доступ предоставлен на ${daysToAdd} дн.`,
      user: updatedSession,
    });

    response.cookies.set('ulpana_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[API Promo Code] Error:', error);
    return NextResponse.json({ error: 'Ошибка активации промокода' }, { status: 500 });
  }
}
