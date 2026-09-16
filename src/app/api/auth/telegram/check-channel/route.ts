import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool, initDatabase } from '@/lib/db';

const TELEGRAM_CHANNEL_USERNAME = '@ulpana_il';
const VALID_SUBSCRIBER_STATUSES = ['creator', 'administrator', 'member', 'restricted'];

async function handleCheckChannel(req: NextRequest) {
  try {
    const token =
      req.cookies.get('ulpana_session')?.value ||
      req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Требуется авторизация' }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session || !session.id) {
      return NextResponse.json({ ok: false, error: 'Недействительная сессия' }, { status: 401 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      return NextResponse.json(
        { ok: false, error: 'Сервис проверки Telegram временно недоступен' },
        { status: 503 }
      );
    }

    await initDatabase();
    const db = getDbPool();

    let telegramId = session.telegramId;

    // Если в сессии нет telegramId, проверяем актуальную запись в БД
    if (!telegramId && db) {
      const userRes = await db.query('SELECT telegram_id FROM ulpana_users WHERE id = $1', [session.id]);
      if (userRes.rows.length > 0 && userRes.rows[0].telegram_id) {
        telegramId = Number(userRes.rows[0].telegram_id);
      }
    }

    if (!telegramId) {
      return NextResponse.json({ ok: false, reason: 'telegram_not_linked' });
    }

    // Вызываем Telegram Bot API getChatMember
    let isSubscriber = false;
    try {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(
          TELEGRAM_CHANNEL_USERNAME
        )}&user_id=${telegramId}`,
        {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        }
      );

      if (tgRes.ok) {
        const data = await tgRes.json();
        const status = data.result?.status;
        isSubscriber = Boolean(data.ok && status && VALID_SUBSCRIBER_STATUSES.includes(status));
      } else {
        const errorData = await tgRes.json().catch(() => null);
        console.warn('[Telegram check-channel] getChatMember returned status:', tgRes.status, errorData?.description);
        isSubscriber = false;
      }
    } catch (fetchErr) {
      console.error('[Telegram check-channel] Error querying Telegram API:', fetchErr instanceof Error ? fetchErr.message : 'Unknown error');
      return NextResponse.json(
        { ok: false, error: 'Ошибка соединения с Telegram API' },
        { status: 502 }
      );
    }

    // Сохраняем результат в базе данных Postgres
    if (db) {
      await db.query(`
        ALTER TABLE ulpana_users ADD COLUMN IF NOT EXISTS is_channel_subscriber BOOLEAN DEFAULT FALSE;
        ALTER TABLE ulpana_users ADD COLUMN IF NOT EXISTS channel_verified_at TIMESTAMPTZ;
      `);

      await db.query(
        `UPDATE ulpana_users 
         SET is_channel_subscriber = $1, channel_verified_at = NOW(), updated_at = NOW() 
         WHERE id = $2`,
        [isSubscriber, session.id]
      );
    }

    return NextResponse.json({ ok: true, isSubscriber });
  } catch (err) {
    console.error('[Telegram check-channel] Internal error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ ok: false, error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleCheckChannel(req);
}

export async function GET(req: NextRequest) {
  return handleCheckChannel(req);
}
