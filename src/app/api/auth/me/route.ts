import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';
import { isVipUser, VIP_EXPIRES_AT } from '@/lib/vipUsers';
import { IS_EARLY_ACCESS_FREE } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const db = getDbPool();
    if (!db) return NextResponse.json({ error: 'Сервис входа временно недоступен' }, { status: 503 });
    await initDatabase();
    let updatedSession = session;
    let gender = 'female';
    let fontStyle = 'print';

    if (isVipUser(session.username, session.telegramId)) {
      updatedSession = {
        ...session,
        subscriptionTier: 'pro',
        subscriptionExpiresAt: VIP_EXPIRES_AT,
      };
    }

    if (db) {
      const res = await db.query('SELECT * FROM ulpana_users WHERE id = $1', [session.id]);
      if (!res.rows.length) return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
      if (res.rows.length > 0) {
        const row = res.rows[0];
        gender = row.gender || 'female';
        fontStyle = row.font_style || 'print';

        // Проверяем срок действия подписки
        let tier = row.subscription_tier || 'free';
        const expiresAt = row.subscription_expires_at ? Number(row.subscription_expires_at) : null;
        if (tier === 'pro' && expiresAt && Date.now() > expiresAt) {
          tier = 'free';
          await db.query(`UPDATE ulpana_users SET subscription_tier = 'free' WHERE id = $1`, [session.id]);
        }

        // Авто-активация промокода после окончания беты
        const promoPending: string | null = row.promo_pending ?? null;
        if (!IS_EARLY_ACCESS_FREE && promoPending && tier !== 'pro') {
          const promoRes = await db.query(
            'SELECT * FROM ulpana_promo_codes WHERE UPPER(code) = $1 AND is_active = true',
            [promoPending.toUpperCase()]
          );
          if (promoRes.rows.length > 0) {
            const promo = promoRes.rows[0];
            const limitOk = !promo.max_uses || promo.used_count < promo.max_uses;
            if (limitOk) {
              const newExpiresAt = Date.now() + promo.days_valid * 24 * 60 * 60 * 1000;
              await db.query(
                `UPDATE ulpana_users
                 SET subscription_tier = 'pro', subscription_expires_at = $1, promo_pending = NULL, updated_at = NOW()
                 WHERE id = $2`,
                [newExpiresAt, session.id]
              );
              await db.query(
                'UPDATE ulpana_promo_codes SET used_count = used_count + 1 WHERE id = $1',
                [promo.id]
              );
              tier = 'pro';
            } else {
              // Лимит исчерпан — просто очищаем pending, чтобы не повторять
              await db.query(
                `UPDATE ulpana_users SET promo_pending = NULL, updated_at = NOW() WHERE id = $1`,
                [session.id]
              );
            }
          } else {
            // Код устарел/деактивирован — очищаем
            await db.query(
              `UPDATE ulpana_users SET promo_pending = NULL, updated_at = NOW() WHERE id = $1`,
              [session.id]
            );
          }
          // Перечитываем свежий expiresAt из БД после возможного обновления
          const refreshed = await db.query(
            'SELECT subscription_expires_at FROM ulpana_users WHERE id = $1',
            [session.id]
          );
          const freshExpires = refreshed.rows[0]?.subscription_expires_at
            ? Number(refreshed.rows[0].subscription_expires_at)
            : null;
          updatedSession = {
            ...session,
            name: row.name || session.name,
            username: row.username || session.username,
            avatarUrl: row.avatar_url || session.avatarUrl,
            telegramId: row.telegram_id ? Number(row.telegram_id) : session.telegramId,
            email: row.email || session.email,
            subscriptionTier: tier as 'free' | 'pro' | 'admin',
            subscriptionExpiresAt: freshExpires,
            isChannelSubscriber: Boolean(row.is_channel_subscriber),
            channelVerifiedAt: row.channel_verified_at ? new Date(row.channel_verified_at).getTime() : null,
          };
        } else {
          updatedSession = {
            ...session,
            name: row.name || session.name,
            username: row.username || session.username,
            avatarUrl: row.avatar_url || session.avatarUrl,
            telegramId: row.telegram_id ? Number(row.telegram_id) : session.telegramId,
            email: row.email || session.email,
            subscriptionTier: tier as 'free' | 'pro' | 'admin',
            subscriptionExpiresAt: expiresAt,
            isChannelSubscriber: Boolean(row.is_channel_subscriber),
            channelVerifiedAt: row.channel_verified_at ? new Date(row.channel_verified_at).getTime() : null,
          };
        }
      }
    }

    const isVip = isVipUser(updatedSession.username, updatedSession.telegramId, updatedSession.name);
    if (isVip) {
      updatedSession = {
        ...updatedSession,
        subscriptionTier: 'pro',
        subscriptionExpiresAt: VIP_EXPIRES_AT,
      };
    }

    return NextResponse.json({
      authenticated: true,
      user: updatedSession,
      gender,
      fontStyle,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[API Auth Me] Error:', error);
    return NextResponse.json({ error: 'Не удалось проверить вход. Попробуйте снова.' }, { status: 503 });
  }
}
