import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, createSessionToken } from '@/lib/auth';
import { getDbPool } from '@/lib/db';
import { UserSession } from '@/types';
import { IS_EARLY_ACCESS_FREE } from '@/lib/config';
import { resolvePromoBundle } from '@/lib/promoBundles';

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
    let promoRes = await db.query(
      'SELECT p.*, b.name as bundle_name, b.unlocked_lessons as b_lessons, b.unlocked_decks as b_decks, b.unlocked_categories as b_categories FROM ulpana_promo_codes p LEFT JOIN ulpana_promo_bundles b ON b.id = p.bundle_id WHERE UPPER(p.code) = $1 AND p.is_active = true',
      [normalizedCode]
    );

    // Авто-инициализация системного или бандлового промокода при первом обращении (без хардкода строк)
    if (promoRes.rows.length === 0) {
      const resolvedBundle = resolvePromoBundle(normalizedCode);
      if (resolvedBundle) {
        const channel = normalizedCode.includes('TG') ? 'tg' : normalizedCode.includes('LATTE') || normalizedCode.includes('FB') ? 'fb' : 'other';
        const postDesc = `Промокод с доступом: ${resolvedBundle.name}`;
        await db.query(
          `INSERT INTO ulpana_promo_codes (id, code, days_valid, max_uses, used_count, is_active, code_type, channel, description, bundle_id)
           VALUES ($1, $2, $3, $4, 0, true, 'post', $5, $6, $7)
           ON CONFLICT (code) DO UPDATE SET bundle_id = EXCLUDED.bundle_id`,
          [`promo_${normalizedCode.toLowerCase()}_system`, normalizedCode, 30, 1000, channel, postDesc, resolvedBundle.id]
        );
        promoRes = await db.query(
          'SELECT p.*, b.name as bundle_name, b.unlocked_lessons as b_lessons, b.unlocked_decks as b_decks, b.unlocked_categories as b_categories FROM ulpana_promo_codes p LEFT JOIN ulpana_promo_bundles b ON b.id = p.bundle_id WHERE UPPER(p.code) = $1 AND p.is_active = true',
          [normalizedCode]
        );
      }
    }

    if (promoRes.rows.length === 0) {
      return NextResponse.json({ error: 'Неверный или недействительный промокод' }, { status: 400 });
    }

    const promo = promoRes.rows[0];
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'Лимит активаций этого промокода исчерпан' }, { status: 400 });
    }

    // Собираем разблокируемый контент из бандла и самого промокода
    const unlockedDecks: string[] = Array.from(new Set([
      ...(promo.unlocked_decks || []),
      ...(promo.b_decks || []),
    ]));
    const unlockedCategories: string[] = Array.from(new Set([
      ...(promo.unlocked_categories || []),
      ...(promo.b_categories || []),
    ]));
    const unlockedLessons: number[] = Array.from(new Set([
      ...(promo.unlocked_lessons || []),
      ...(promo.b_lessons || []),
    ]));

    // Режим беты: сохраняем код за пользователем и сразу начисляем постоянные права
    if (IS_EARLY_ACCESS_FREE) {
      await db.query(
        `UPDATE ulpana_users 
         SET promo_pending = $1, 
             activated_promos = array_append(COALESCE(activated_promos, '{}'), $1),
             unlocked_decks = array_cat(COALESCE(unlocked_decks, '{}'), $2),
             unlocked_categories = array_cat(COALESCE(unlocked_categories, '{}'), $3),
             unlocked_lessons = array_cat(COALESCE(unlocked_lessons, '{}'), $4),
             updated_at = NOW() 
         WHERE id = $5`,
        [normalizedCode, unlockedDecks, unlockedCategories, unlockedLessons, session.id]
      );
      const updatedUser: UserSession = {
        ...session,
        promoPending: normalizedCode,
        activatedPromos: Array.from(new Set([...(session.activatedPromos || []), normalizedCode])),
        unlockedDecks: Array.from(new Set([...(session.unlockedDecks || []), ...unlockedDecks])),
        unlockedCategories: Array.from(new Set([...(session.unlockedCategories || []), ...unlockedCategories])),
        unlockedLessons: Array.from(new Set([...(session.unlockedLessons || []), ...unlockedLessons])),
      };
      const token = await createSessionToken(updatedUser);
      const response = NextResponse.json({
        success: true,
        pending: true,
        message: `Промокод «${normalizedCode}» зафиксирован! PRO-доступ активируется автоматически после окончания беты.${
          promo.bundle_name ? ` Бессрочно открыт: «${promo.bundle_name}».` : ''
        }`,
        user: updatedUser,
      });
      response.cookies.set('ulpana_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      return response;
    }

    // Обычный режим: активируем сразу
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
       SET subscription_tier = 'pro', 
           subscription_expires_at = $1, 
           promo_pending = NULL,
           activated_promos = array_append(COALESCE(activated_promos, '{}'), $2),
           unlocked_decks = array_cat(COALESCE(unlocked_decks, '{}'), $3),
           unlocked_categories = array_cat(COALESCE(unlocked_categories, '{}'), $4),
           unlocked_lessons = array_cat(COALESCE(unlocked_lessons, '{}'), $5),
           updated_at = NOW()
       WHERE id = $6`,
      [newExpiresAt, normalizedCode, unlockedDecks, unlockedCategories, unlockedLessons, session.id]
    );

    const updatedSession: UserSession = {
      ...session,
      subscriptionTier: 'pro',
      subscriptionExpiresAt: newExpiresAt,
      promoPending: null,
      activatedPromos: Array.from(new Set([...(session.activatedPromos || []), normalizedCode])),
      unlockedDecks: Array.from(new Set([...(session.unlockedDecks || []), ...unlockedDecks])),
      unlockedCategories: Array.from(new Set([...(session.unlockedCategories || []), ...unlockedCategories])),
      unlockedLessons: Array.from(new Set([...(session.unlockedLessons || []), ...unlockedLessons])),
    };

    const newToken = await createSessionToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      pending: false,
      message: `Промокод успешно активирован! PRO-доступ предоставлен на ${daysToAdd} дн.${
        promo.bundle_name ? ` Бессрочно открыт: «${promo.bundle_name}».` : ''
      }`,
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
