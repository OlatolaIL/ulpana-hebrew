import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TELEGRAM_IDS } from '@/lib/vipUsers';
import { getDbPool, initDatabase } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { readBoundedJson, RequestBodyError } from '@/lib/requestBody';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

interface FeedbackPayload {
  message: string;
  category?: 'bug' | 'idea' | 'question' | 'other';
  pageInfo?: {
    url?: string;
    view?: string;
    lessonId?: number;
    lessonTitle?: string;
    lessonTab?: string;
  };
  user?: {
    name?: string;
    username?: string;
    telegramId?: number | string;
    isLoggedIn?: boolean;
    subscriptionTier?: string;
  };
  deviceInfo?: {
    platform?: string;
    userAgent?: string;
    screenSize?: string;
    isTelegramWebApp?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await readBoundedJson(req, 16 * 1024) as unknown as FeedbackPayload;
    const { message, category = 'bug', pageInfo, deviceInfo } = body;
    const token = req.cookies.get('ulpana_session')?.value;
    const session = token ? await verifySessionToken(token) : null;
    const user = session || undefined;
    const identity = session?.id || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'guest';
    if (!checkRateLimit(`feedback:${identity}`, { limit: 5 }).allowed || !checkRateLimit('feedback:global', { limit: 100 }).allowed) {
      return NextResponse.json({ error: 'Слишком много сообщений. Попробуйте через минуту.' }, { status: 429 });
    }

    if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return NextResponse.json(
        { error: 'Текст сообщения не может быть пустым' },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();
    for (const context of [pageInfo, deviceInfo]) {
      if (context && (typeof context !== 'object' || Array.isArray(context) ||
          Object.values(context).some(v => typeof v === 'string' && v.length > 512))) {
        throw new RequestBodyError('Слишком длинный контекст сообщения.', 400);
      }
    }
    if (pageInfo?.url) {
      try { const url = new URL(pageInfo.url); pageInfo.url = url.origin + url.pathname; }
      catch { delete pageInfo.url; }
    }

    // 1. Формируем категорию с иконкой
    const categoryLabels: Record<string, string> = {
      bug: '🐞 Сообщение об ошибке (Баг)',
      idea: '💡 Предложение / Идея',
      question: '💬 Вопрос / Отзыв',
      other: '📝 Обратная связь',
    };
    const categoryTitle = categoryLabels[category] || '📝 Обратная связь';

    // 2. Формируем контекст страницы
    let pageContextDesc = 'Главная / Карта курса';
    if (pageInfo) {
      if (pageInfo.lessonId) {
        pageContextDesc = `Урок ${pageInfo.lessonId}${pageInfo.lessonTitle ? `: ${pageInfo.lessonTitle}` : ''}`;
        if (pageInfo.lessonTab) {
          const tabNames: Record<string, string> = {
            theory: 'Теория (תֵּאוֹרְיָה)',
            vocab: 'Словарь (מִילִּים)',
            exercises: 'Упражнения / Тесты (תַּרְגִּילִים)',
            chat: 'Диалог с ИИ (שִׂיחָה)',
            phone: 'Телефонный звонок (טֶלֶפוֹן)',
          };
          pageContextDesc += ` • Вкладка: ${tabNames[pageInfo.lessonTab] || pageInfo.lessonTab}`;
        }
      } else if (pageInfo.view) {
        const viewNames: Record<string, string> = {
          map: 'Карта уроков',
          flashcards: 'Карточки слов (тренировка)',
          dictionary: 'Личный словарик',
          alphabet: 'Прописи и алфавит',
        };
        pageContextDesc = viewNames[pageInfo.view] || pageInfo.view;
      }
    }

    // 3. Данные пользователя
    const userName = user?.name || 'Гость';
    const userHandle = user?.username ? `@${user.username.replace(/^@/, '')}` : 'нет username';
    const tgId = user?.telegramId ? String(user.telegramId) : 'не привязан';
    const subTier = user?.subscriptionTier === 'pro' ? '👑 PRO' : user?.subscriptionTier === 'admin' ? '🛡 ADMIN' : 'Бесплатный';

    // 4. Данные устройства
    const deviceStr = deviceInfo?.platform
      ? `${deviceInfo.platform} (${deviceInfo.screenSize || 'экран неизвестен'})`
      : 'Веб-браузер';

    // 5. Красивое текстовое сообщение для Telegram
    const escapeTg = (text: string) =>
      text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const tgMessage =
      `<b>${escapeTg(categoryTitle)}</b>\n\n` +
      `<b>📍 Страница:</b> ${escapeTg(pageContextDesc)}\n` +
      (pageInfo?.url ? `<b>🔗 URL:</b> <code>${escapeTg(pageInfo.url)}</code>\n` : '') +
      `\n` +
      `<b>👤 Отправитель:</b> ${escapeTg(userName)} (${escapeTg(userHandle)})\n` +
      `<b>🆔 Telegram ID:</b> <code>${escapeTg(tgId)}</code> | <b>Тариф:</b> ${escapeTg(subTier)}\n` +
      `<b>📱 Устройство:</b> ${escapeTg(deviceStr)}${deviceInfo?.isTelegramWebApp ? ' [Telegram WebApp]' : ''}\n` +
      `\n` +
      `<b>💬 Сообщение:</b>\n` +
      `<blockquote>${escapeTg(cleanMessage)}</blockquote>`;

    // 6. Опционально сохраняем в базу данных Postgres
    let savedToDb = false;
    try {
      await initDatabase();
      const db = getDbPool();
      if (db) {
        await db.query(`
          CREATE TABLE IF NOT EXISTS ulpana_feedback (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            telegram_id BIGINT,
            user_name TEXT,
            user_username TEXT,
            category TEXT,
            message TEXT NOT NULL,
            page_info JSONB,
            device_info JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        await db.query(
          `INSERT INTO ulpana_feedback (user_id, telegram_id, user_name, user_username, category, message, page_info, device_info)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            session?.id || null,
            user?.telegramId ? Number(user.telegramId) : null,
            userName,
            user?.username || null,
            category,
            cleanMessage,
            JSON.stringify(pageInfo || {}),
            JSON.stringify(deviceInfo || {}),
          ]
        );
        savedToDb = true;
      }
    } catch (dbErr) {
      console.warn('[Feedback API] DB insert warning:', dbErr);
    }

    // 7. Отправка администратору Osa_IL в Telegram через бота
    let sentCount = 0;
    if (BOT_TOKEN) {
      const inlineKeyboard: { text: string; url: string }[][] = [];
      if (user?.username) {
        inlineKeyboard.push([
          {
            text: `✉️ Ответить @${user.username.replace(/^@/, '')}`,
            url: `https://t.me/${user.username.replace(/^@/, '')}`,
          },
        ]);
      }

      // Отправляем администратору Osa_IL (8903218603)
      for (const adminId of ADMIN_TELEGRAM_IDS) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            signal: AbortSignal.timeout(10000),
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminId,
              text: tgMessage,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
              reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
            }),
          });
          const resJson = await res.json();
          if (resJson.ok) {
            sentCount++;
          } else {
            console.warn(`[Feedback TG Send] Failed for admin ${adminId}:`, resJson);
          }
        } catch (tgErr) {
          console.error(`[Feedback TG Send] Network error for admin ${adminId}:`, tgErr);
        }
      }
    } else {
      console.warn('[Feedback API] TELEGRAM_BOT_TOKEN is not configured.');
    }

    if (!savedToDb && sentCount === 0) {
      return NextResponse.json({ error: 'Не удалось отправить сообщение. Текст сохранён в форме; попробуйте позже.' }, { status: 503 });
    }
    return NextResponse.json({
      success: true,
      savedToDb,
      deliveredToTelegram: sentCount > 0,
    });
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('[Feedback API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить сообщение' },
      { status: 500 }
    );
  }
}
