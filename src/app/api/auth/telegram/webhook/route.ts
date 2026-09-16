import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, initDatabase } from '@/lib/db';
import { isVipUser, VIP_EXPIRES_AT } from '@/lib/vipUsers';
import { checkAuthConfiguration, confirmPollingSession, createMagicLinkSession, isValidPollingToken, type TokenUserData } from '@/lib/loginTokens';
import { readBoundedJson, RequestBodyError } from '@/lib/requestBody';

interface TelegramUpdate {
  message?: {
    text?: string;
    chat?: { id?: number; type?: string };
    from?: { id?: number; first_name?: string; last_name?: string; username?: string };
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!webhookSecret || !botToken || !checkAuthConfiguration().ok) {
    return NextResponse.json({ error: 'Login service unavailable' }, { status: 503 });
  }
  if (req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
  }
  try {
    const update = await readBoundedJson(req, 128 * 1024) as TelegramUpdate;
    const message = update.message;
    const from = message?.from;
    // Never send credentials to a group or a chat belonging to somebody else.
    if (message?.chat?.type !== 'private' || !from || !Number.isSafeInteger(from.id) ||
        Number(from.id) <= 0 || message.chat.id !== from.id || typeof message.text !== 'string' ||
        !/^\/start(?:\s|$)/.test(message.text.trim())) {
      return NextResponse.json({ ok: true });
    }
    const db = getDbPool();
    if (!db) return NextResponse.json({ error: 'Login service unavailable' }, { status: 503 });
    await initDatabase();
    const fullName = [from.first_name, from.last_name].filter(v => typeof v === 'string').join(' ').slice(0, 200) || 'Ученик';
    const isVip = isVipUser(null, from.id, null);
    const saved = await db.query(
      `INSERT INTO ulpana_users(id, telegram_id, name, username, subscription_tier, subscription_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (telegram_id) DO UPDATE SET
         name = EXCLUDED.name, username = EXCLUDED.username,
         subscription_tier = CASE WHEN $7 THEN EXCLUDED.subscription_tier ELSE ulpana_users.subscription_tier END,
         subscription_expires_at = CASE WHEN $7 THEN EXCLUDED.subscription_expires_at ELSE ulpana_users.subscription_expires_at END,
         updated_at = NOW()
       RETURNING *`,
      [`tg_${from.id}`, from.id, fullName, from.username || null, isVip ? 'pro' : 'free', isVip ? VIP_EXPIRES_AT : null, isVip],
    );
    const row = saved.rows[0];
    const userData: TokenUserData = {
      purpose: 'magic_link', id: row.id, telegramId: from.id, username: from.username,
      name: fullName, subscriptionTier: row.subscription_tier || 'free',
      subscriptionExpiresAt: row.subscription_expires_at ? Number(row.subscription_expires_at) : null,
      gender: row.gender || 'female', fontStyle: row.font_style || 'print',
    };
    const startParam = message.text.trim().split(/\s+/)[1];
    if (isValidPollingToken(startParam)) await confirmPollingSession(db, startParam, userData);
    const magicToken = await createMagicLinkSession(db, userData);
    const appUrl = new URL(process.env.APP_URL || 'https://ulpana-hebrew.vercel.app');
    if (appUrl.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(appUrl.hostname)) throw new Error('Invalid app URL');
    appUrl.searchParams.set('login_token', magicToken);
    const sent = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: `🇮🇱 Привет, ${fullName}! Ссылка для входа в Ульпану действует 10 минут и подходит для одного входа. Если вы начали вход на сайте, вернитесь в ту вкладку.\n\n📢 Присоединяйтесь к нашему каналу @ulpana_il — разбираем живые фразы и убиваем страх говорить!`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Войти в Ульпану', url: appUrl.toString() }],
            [{ text: '📢 Наш канал: Ульпана | Живой иврит', url: 'https://t.me/ulpana_il' }],
          ],
        },
      }),
    });
    if (!sent.ok || !(await sent.json()).ok) throw new Error('Telegram delivery failed');
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    // A retryable response lets Telegram retry temporary database/delivery failures.
    console.error('[Telegram webhook] Login or delivery failed');
    return NextResponse.json({ error: 'Login temporarily unavailable' }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!webhookSecret || !botToken) return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  if (req.nextUrl.searchParams.has('secret')) return NextResponse.json({ error: 'Use the secret header' }, { status: 400 });
  if (req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((req.nextUrl.searchParams.get('action') || 'info') !== 'info') return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    if (!response.ok) throw new Error('Status unavailable');
    return NextResponse.json(await response.json(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Webhook status unavailable' }, { status: 503 });
  }
}
