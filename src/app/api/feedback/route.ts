import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TELEGRAM_IDS } from '@/lib/vipUsers';
import { getDbPool, initDatabase } from '@/lib/db';

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
    const body: FeedbackPayload = await req.json();
    const { message, category = 'bug', pageInfo, user, deviceInfo } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Текст сообщения не может быть пустым' },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();

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
            user?.telegramId ? `tg_${user.telegramId}` : null,
            user?.telegramId ? Number(user.telegramId) : null,
            userName,
            user?.username || null,
            category,
            cleanMessage,
            JSON.stringify(pageInfo || {}),
            JSON.stringify(deviceInfo || {}),
          ]
        );
      }
    } catch (dbErr) {
      console.warn('[Feedback API] DB insert warning:', dbErr);
    }

    // 7. Отправка администратору Osa_IL в Telegram через бота
    let sentCount = 0;
    if (BOT_TOKEN) {
      const inlineKeyboard: any[][] = [];
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

    return NextResponse.json({
      success: true,
      deliveredToTelegram: sentCount > 0,
    });
  } catch (error: any) {
    console.error('[Feedback API] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Не удалось отправить сообщение' },
      { status: 500 }
    );
  }
}
