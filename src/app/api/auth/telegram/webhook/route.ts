import { NextRequest, NextResponse } from 'next/server';
import { getDbPool, initDatabase } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { isVipUser, VIP_EXPIRES_AT } from '@/lib/vipUsers';
import { UserSession } from '@/types';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8857824092:AAE3sCbuElBPEctBBXlfTCZfjmPPZTJjdnY';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const from = message.from;

    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const startParam = parts[1]; // e.g. ulp_XXXXX

      const fullName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Ученик';
      const userId = `tg_${from.id}`;
      
      const isVip = isVipUser(from.username, from.id);
      let tier: 'free' | 'pro' | 'admin' = isVip ? 'pro' : 'free';
      let expiresAt: number | null = isVip ? VIP_EXPIRES_AT : null;
      let gender: 'male' | 'female' = 'female';
      let fontStyle: 'print' | 'cursive' = 'print';

      await initDatabase();
      const db = getDbPool();

      if (db) {
        // 1. Создаем или обновляем пользователя в базе
        const existing = await db.query('SELECT * FROM ulpana_users WHERE telegram_id = $1 OR id = $2', [from.id, userId]);
        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          tier = (row.subscription_tier as any) || 'free';
          expiresAt = row.subscription_expires_at ? Number(row.subscription_expires_at) : null;
          gender = row.gender || 'female';
          fontStyle = row.font_style || 'print';

          await db.query(
            'UPDATE ulpana_users SET name = $1, username = $2, updated_at = NOW() WHERE id = $3',
            [fullName, from.username || null, userId]
          );
        } else {
          await db.query(
            'INSERT INTO ulpana_users (id, telegram_id, name, username, gender, font_style, subscription_tier) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [userId, from.id, fullName, from.username || null, gender, fontStyle, tier]
          );
        }

        // 2. Если передан токен авторизации (ulp_...) - подтверждаем веб-сессию
        if (startParam && startParam.startsWith('ulp_')) {
          await db.query(
            `UPDATE ulpana_auth_tokens
             SET status = 'completed',
                 user_data = $1
             WHERE token = $2`,
            [
              JSON.stringify({
                id: from.id,
                first_name: from.first_name,
                last_name: from.last_name,
                username: from.username,
                subscriptionTier: tier,
                subscriptionExpiresAt: expiresAt,
                gender,
                fontStyle,
              }),
              startParam,
            ]
          );
        }
      }

      // Создаем подписанный токен для входа в браузере (Magic Link)
      const session: UserSession = {
        id: userId,
        telegramId: from.id,
        username: from.username,
        name: fullName,
        subscriptionTier: tier,
        subscriptionExpiresAt: expiresAt,
      };
      const sessionJwt = await createSessionToken(session);
      const browserUrl = `https://ulpana-hebrew.vercel.app/?login_token=${sessionJwt}`;

      // Отправляем красивый ответ в Telegram
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: `🇮🇱 *Добро пожаловать в Ульпану Иврит!*\n\n✅ *Авторизация успешна!*\nВы вошли как *${fullName}*.\n\n👇 Нажмите кнопку ниже, чтобы начать обучение:`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🚀 Открыть в Telegram (Приложение)',
                    web_app: { url: 'https://ulpana-hebrew.vercel.app' },
                  },
                ],
                [
                  {
                    text: '🌐 Открыть в браузере (Safari / Chrome)',
                    url: browserUrl,
                  },
                ],
              ],
            },
          }),
        });
      } catch (tgErr) {
        console.error('[Webhook TG reply] Error:', tgErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// GET-запрос для быстрой регистрации Webhook
export async function GET() {
  try {
    const webhookUrl = 'https://ulpana-hebrew.vercel.app/api/auth/telegram/webhook';
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
