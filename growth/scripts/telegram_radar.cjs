/**
 * Telegram Lead Radar — Автономный сторож ключевых фраз (MTProto)
 * 
 * Назначение:
 *   Пассивный мониторинг сообщений в реальных супергруппах Telegram (например, @ole_hadash_chat)
 *   по триггерам языковых проблем олим в Израиле, анализ боли через ИИ (Groq / Qwen)
 *   и моментальная отправка карточки горячего лида фаундеру в Telegram.
 * 
 * Режим безопасности (R-23, R-16, Superseded Log):
 *   - Только чтение (Listen-Only): скрипт НИКОГДА ничего не отправляет в чужой чат от имени юзера.
 *   - Сессия и токены сохраняются только локально в gitignored файлах.
 * 
 * Использование:
 *   node growth/scripts/telegram_radar.cjs                     # Запуск мониторинга @ole_hadash_chat
 *   node growth/scripts/telegram_radar.cjs --chat=other_chat   # Мониторинг другого чата
 *   node growth/scripts/telegram_radar.cjs --test-alert       # Тестовая отправка алерта фаундеру
 *   node growth/scripts/telegram_radar.cjs --dry-run          # Проверка подключения без бесконечного цикла
 */

const fs = require('fs');
const path = require('path');

// 1. Загрузка переменных окружения из .env.local
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {
  // Fallback если loadEnvFile не поддержан или пуст
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SESSION_FILE = path.join(DATA_DIR, 'tg_session.txt');
const COMMUNITIES_FILE = path.join(DATA_DIR, 'target_communities.json');

// 2. Ситечко триггерных слов (Regex)
const TRIGGER_PATTERNS = [
  /ульпан/i,
  /иврит/i,
  /не понима/i,
  /не могу сказа/i,
  /боюсь говор/i,
  /страх говор/i,
  /языковой барьер/i,
  /курьер/i,
  /вольт/i,
  /wolt/i,
  /домофон/i,
  /ани лемата/i,
  /садик/i,
  /воспитател/i,
  /гоненет/i,
  /поликлиник/i,
  /макаби/i,
  /клалит/i,
  /меухедет/i,
  /леумит/i,
  /собес/i,
  /интервью/i,
  /митинг/i,
  /мисрад/i,
  /клита/i,
  /арнон/i,
  /посоветуйте курс/i,
  /посоветуйте препод/i,
  /репетитор/i,
];

function matchesTrigger(text) {
  if (!text || typeof text !== 'string') return false;
  return TRIGGER_PATTERNS.some((pattern) => pattern.test(text));
}

// 3. Работа с базой сообществ и лидов
function loadTargetCommunities() {
  if (!fs.existsSync(COMMUNITIES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(COMMUNITIES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function incrementCommunityLeadCount(chatIdentifier) {
  if (!fs.existsSync(COMMUNITIES_FILE) || !chatIdentifier) return;
  try {
    const communities = JSON.parse(fs.readFileSync(COMMUNITIES_FILE, 'utf-8'));
    const cleanId = String(chatIdentifier).replace(/^@/, '').toLowerCase();
    let updated = false;
    for (const c of communities) {
      const u = (c.username || '').toLowerCase();
      const t = (c.title || '').toLowerCase();
      if (u === cleanId || cleanId.includes(u) || t.includes(cleanId) || cleanId.includes(t)) {
        c.leadCount = (c.leadCount || 0) + 1;
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(COMMUNITIES_FILE, JSON.stringify(communities, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('⚠️ Ошибка обновления счетчика лидов сообщества:', e.message);
  }
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLead(newLead) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const leads = loadLeads();
  // Дедупликация: не сохранять дубликат одного и того же сообщения
  const exists = leads.some((l) => l.rawText === newLead.rawText || (l.authorContact === newLead.authorContact && Math.abs(new Date(l.timestamp) - new Date(newLead.timestamp)) < 60000));
  if (!exists) {
    leads.unshift(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    incrementCommunityLeadCount(newLead.sourceChatName);
    return true;
  }
  return false;
}

// 4. ИИ-анализ боли через Groq (Qwen 27B) или эвристический фолбэк
async function analyzePainWithAI(rawText) {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const systemPrompt = `Ты — эксперт по языковой адаптации репатриантов в Израиле для проекта «Ульпан Алеф».
Твоя задача — мгновенно классифицировать сообщение из чата Израиля.
Верни строго JSON:
{
  "isTargetLead": boolean,
  "painCategory": "courier_call" | "kindergarten" | "clinic" | "interview" | "speaking_barrier" | "bureaucracy" | "other",
  "confidence": number,
  "painSummary": string,
  "targetDeepLink": string,
  "suggestedReply": string
}`;

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Текст сообщения: "${rawText}"` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    } catch (e) {
      console.warn('⚠️ [Radar] Ошибка Groq API, используем эвристику:', e.message);
    }
  }

  // Эвристический анализатор при недоступности LLM
  const isCourier = /курьер|вольт|wolt|домофон|ани лемата/i.test(rawText);
  const isKinder = /садик|воспитател|гоненет/i.test(rawText);
  const isClinic = /поликлиник|макаби|клалит|меухедет|леумит|врач/i.test(rawText);
  const isInterview = /собес|интервью|митинг/i.test(rawText);
  const isBureaucracy = /мисрад|клита|арнон/i.test(rawText);

  let category = 'speaking_barrier';
  let summary = 'Языковой барьер / поиск ульпана';
  let link = '/lessons/1';

  if (isCourier) {
    category = 'courier_call';
    summary = 'Страх звонков курьеров (Wolt / доставка)';
    link = '/lessons/1/call';
  } else if (isKinder) {
    category = 'kindergarten';
    summary = 'Общение в детском саду / звонок воспитательницы';
    link = '/decks/mom';
  } else if (isClinic) {
    category = 'clinic';
    summary = 'Поход к врачу / больничная касса';
    link = '/decks/medical';
  } else if (isInterview) {
    category = 'interview';
    summary = 'Собеседование или работа в IT на иврите';
    link = '/decks/it-interview';
  } else if (isBureaucracy) {
    category = 'bureaucracy';
    summary = 'Госучреждения и бытовые службы';
    link = '/lessons/5/call';
  }

  return {
    isTargetLead: true,
    painCategory: category,
    confidence: 8,
    painSummary: summary,
    targetDeepLink: link,
    suggestedReply: `Здравствуйте! Очень вас понимаю, сам через это проходил. В «Ульпан Алеф» как раз есть интерактивный тренажер для таких ситуаций (симулятор звонков и нужные фразы): https://ulpana-hebrew.vercel.app${link}?promo=RADAR`,
  };
}

// 5. Отправка алерта фаундеру в Telegram
async function sendAlertToFounder(lead) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() || '@ulpana_il';

  if (!botToken) {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не задан, вывод алерта в консоль:');
    console.log(lead);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ulpana-hebrew.vercel.app';
  const fullDeepLink = `${appUrl}${lead.aiAnalysis.targetDeepLink}?promo=RADAR`;

  const safeChat = String(lead.sourceChatName || 'Чат Telegram').replace(/[<>]/g, '');
  const safeAuthor = String(lead.authorName || 'Пользователь').replace(/[<>]/g, '');
  const safeText = String(lead.rawText || '').slice(0, 500).replace(/[<>]/g, '');
  const safePain = String(lead.aiAnalysis.painSummary || '').replace(/[<>]/g, '');
  const safeReply = String(lead.aiAnalysis.suggestedReply || '').replace(/[<>]/g, '');

  const html = `🎯 <b>ГОРИТ ЛИД В ЧАТЕ:</b> ${safeChat}
👤 <b>Автор:</b> ${safeAuthor} (${lead.authorContact})
🔥 <b>Боль:</b> ${safePain} (Уверенность: ${lead.aiAnalysis.confidence}/10)

💬 <b>Сообщение:</b>
<i>«${safeText}»</i>

💡 <b>Рекомендуемый ответ для ручной отправки:</b>
<code>${safeReply}</code>`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🎯 Открыть тренажер', url: fullDeepLink },
      ],
    ],
  };

  if (lead.messageUrl) {
    inlineKeyboard.inline_keyboard[0].unshift({ text: '💬 Перейти к сообщению', url: lead.messageUrl });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: html,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('❌ Ошибка отправки алерта в Telegram:', err);
    } else {
      console.log(`🔔 Алерт о лиде успешно отправлен в Telegram (${adminChatId})!`);
    }
  } catch (e) {
    console.error('❌ Сбой сети при отправке алерта:', e.message);
  }
}

// 6. Главная функция подключения GramJS
async function main() {
  const args = process.argv.slice(2);
  const isTestAlert = args.includes('--test-alert');
  const isDryRun = args.includes('--dry-run');
  const chatArg = args.find((a) => a.startsWith('--chat='));
  const targetChat = chatArg ? chatArg.split('=')[1] : 'ole_hadash_chat';

  console.log('=====================================================');
  console.log('🛰  ULPANA ALEPH — TELEGRAM LEAD RADAR (LISTEN-ONLY)');
  console.log('=====================================================');

  if (isTestAlert) {
    console.log('🧪 Отправка тестового алерта фаундеру...');
    const testLead = {
      id: `lead-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceChannel: 'telegram',
      sourceChatName: `@${targetChat}`,
      authorName: 'Михаил (Тест)',
      authorContact: '@mikhail_test',
      rawText: 'Вчера курьер из Wolt звонил, кричал в трубку "ани лемата", я от страха сбросил трубку... Что делать с этим ивритом?',
      aiAnalysis: await analyzePainWithAI('Вчера курьер из Wolt звонил, кричал в трубку "ани лемата", я от страха сбросил трубку...'),
      messageUrl: `https://t.me/${targetChat}/12345`,
      status: 'new',
    };
    saveLead(testLead);
    await sendAlertToFounder(testLead);
    console.log('✅ Тест завершён.');
    return;
  }

  const apiId = parseInt(process.env.TELEGRAM_API_ID, 10);
  const apiHash = process.env.TELEGRAM_API_HASH?.trim();

  if (!apiId || !apiHash) {
    console.error('\n❌ ОШИБКА: Не заданы TELEGRAM_API_ID или TELEGRAM_API_HASH в .env.local!');
    console.log('\n📌 Как получить их за 1 минуту:');
    console.log('1. Откройте https://my.telegram.org и войдите по номеру телефона');
    console.log('2. Перейдите в "API development tools"');
    console.log('3. Создайте приложение (назовите "Ulpana Radar")');
    console.log('4. Добавьте в .env.local:');
    console.log('   TELEGRAM_API_ID=12345678');
    console.log('   TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890\n');
    process.exit(1);
  }

  let gramjs;
  let input;
  try {
    gramjs = require('telegram');
    input = require('input');
  } catch (e) {
    console.error('❌ ОШИБКА: Библиотеки `telegram` и `input` не установлены.');
    console.log('Запустите: npm install telegram input\n');
    process.exit(1);
  }

  const { TelegramClient } = require('telegram');
  const { StringSession } = require('telegram/sessions');
  const { NewMessage } = require('telegram/events');

  let sessionString = process.env.TELEGRAM_SESSION_STRING?.trim() || '';
  if (!sessionString && fs.existsSync(SESSION_FILE)) {
    sessionString = fs.readFileSync(SESSION_FILE, 'utf-8').trim();
  }

  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
  });

  console.log('🔌 Подключение к Telegram MTProto...');
  await client.start({
    phoneNumber: async () => await input.text('Введите номер телефона (с кодом страны, напр. +972...): '),
    password: async () => await input.text('Введите облачный пароль 2FA (если есть): '),
    phoneCode: async () => await input.text('Введите код подтверждения из Telegram: '),
    onError: (err) => console.error('Ошибка входа:', err),
  });

  console.log('✅ Успешная авторизация в Telegram!');

  // Сохраняем сессию
  const currentSession = client.session.save();
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SESSION_FILE, currentSession, 'utf-8');
  console.log(`💾 Сессия сохранена в ${SESSION_FILE} (не будет повторного ввода кода)`);

  // Получаем список диалогов пользователя
  console.log('📋 Загрузка списка доступных чатов и групп...');
  const dialogs = await client.getDialogs({ limit: 40 });
  const groupDialogs = dialogs.filter((d) => d.isGroup || d.isChannel);

  console.log(`\n👥 Ваши активные группы и каналы (${groupDialogs.length}):`);
  groupDialogs.slice(0, 15).forEach((g, i) => {
    const uName = g.entity?.username ? `@${g.entity.username}` : '(без @username)';
    console.log(`   ${i + 1}. "${g.title}" [${uName}, ID: ${g.id}]`);
  });

  const communities = loadTargetCommunities();
  const activeComms = communities.filter((c) => c.status === 'active');
  console.log(`\n📡 Целевые сообщества из CRM админки (${communities.length} всего, ${activeComms.length} в эфире):`);
  activeComms.forEach((c, i) => {
    console.log(`   ${i + 1}. [${c.categoryLabel || c.category}] "${c.title}" (@${c.username}) — лидов: ${c.leadCount || 0}`);
  });

  // Поиск целевого чата
  let targetEntity = null;
  const cleanTarget = targetChat.replace(/^@/, '').toLowerCase();

  // 1. Поиск среди уже подключенных диалогов
  targetEntity = groupDialogs.find((d) => {
    const u = (d.entity?.username || '').toLowerCase();
    const t = (d.title || '').toLowerCase();
    return u === cleanTarget || t.includes(cleanTarget);
  })?.entity;

  // 2. Если не найден в диалогах, пробуем резолв через getEntity
  if (!targetEntity) {
    try {
      targetEntity = await client.getEntity(targetChat);
      console.log(`✅ Чат @${targetChat} успешно найден на сервере!`);
    } catch (e) {
      console.warn(`⚠️ Чат @${targetChat} не найден или аккаунт ещё не вступил в него.`);
      console.log('💡 Сторож переключается в режим мониторинга ВСЕХ ваших активных групп!');
    }
  } else {
    console.log(`✅ Целевой чат выбран: "${targetEntity.title || targetEntity.username}"`);
  }

  // Фильтр для NewMessage
  const eventFilter = targetEntity ? new NewMessage({ chats: [targetEntity] }) : new NewMessage({});

  // Слушатель входящих сообщений
  client.addEventHandler(async (event) => {
    try {
      const message = event.message;
      if (!message || !message.message) return;

      // Игнорируем личные переписки, слушаем только группы и каналы
      if (!event.isGroup && !event.isChannel) return;

      const text = message.message;
      if (!matchesTrigger(text)) {
        return; // Пропускаем сообщения без ключевых слов
      }

      let chatTitle = 'Группа Telegram';
      let messageUrl = null;
      try {
        const chat = await message.getChat();
        if (chat) {
          chatTitle = chat.title || chat.username || 'Группа Telegram';
          if (chat.username) {
            messageUrl = `https://t.me/${chat.username}/${message.id}`;
          }
        }
      } catch (e) {}

      console.log(`\n🎯 [ТРИГГЕР в "${chatTitle}"]`);
      console.log(`   Текст: "${text.slice(0, 90)}..."`);

      let authorName = 'Пользователь';
      let authorContact = 'Скрыт';

      try {
        const sender = await message.getSender();
        if (sender) {
          authorName = [sender.firstName, sender.lastName].filter(Boolean).join(' ') || sender.username || 'Пользователь';
          authorContact = sender.username ? `@${sender.username}` : (sender.phone ? `+${sender.phone}` : `ID: ${sender.id}`);
        }
      } catch (e) {}

      // ИИ-анализ боли
      const aiAnalysis = await analyzePainWithAI(text);
      if (!aiAnalysis.isTargetLead) {
        console.log('⚪ ИИ определил сообщение как нецелевое.');
        return;
      }

      const lead = {
        id: `lead-tg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sourceChannel: 'telegram',
        sourceChatName: chatTitle,
        authorName,
        authorContact,
        rawText: text,
        aiAnalysis,
        messageUrl,
        status: 'new',
      };

      const isNew = saveLead(lead);
      if (isNew) {
        console.log(`🔥 [ЛИД ЗАФИКСИРОВАН] ${authorName} | Боль: ${aiAnalysis.painSummary}`);
        await sendAlertToFounder(lead);
      }
    } catch (err) {
      console.error('⚠️ Ошибка обработки сообщения:', err.message);
    }
  }, eventFilter);

  console.log('\n👂 Слушатель запущен (Listen-Only). Ожидание входящих сообщений...');
  console.log('Нажмите Ctrl+C для остановки.');
}

main().catch(console.error);
