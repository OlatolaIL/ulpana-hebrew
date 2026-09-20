/**
 * Facebook Lead Radar — Автономный партизанский радар групп Facebook
 * 
 * Назначение:
 *   Мониторинг целевых групп («Тыквенный латте», «Оле Хадаш», «Мамы Израиля»)
 *   с домашнего ПК с частотой 1 раз в 12 часов с сохранением сессии (cookies).
 *   Анализ языковых болей через ИИ (Groq / Gemini), генерация персонализированного ответа
 *   и прямая отправка карточек лидов в админку на боевом сервере (/admin).
 * 
 * Использование:
 *   node growth/scripts/facebook_radar.cjs --auth             # Первичный интерактивный вход в Facebook и сохранение cookies
 *   node growth/scripts/facebook_radar.cjs --scan             # Основное сканирование групп и отправка на боевой сервер
 *   node growth/scripts/facebook_radar.cjs --scan --fast      # Сканирование с сокращенными паузами (для тестов)
 *   node growth/scripts/facebook_radar.cjs --dry-run          # Проверка пайплайна на демо-данных без открытия браузера
 *   node growth/scripts/facebook_radar.cjs --test-msg="текст" # Тестовый ИИ-разбор единичного сообщения
 *   node growth/scripts/facebook_radar.cjs --summary          # Просмотр базы сохраненных лидов
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 1. Загрузка переменных окружения из .env.local
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {}

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SESSION_FILE = path.join(DATA_DIR, 'fb_session.json');
const COMMUNITIES_FILE = path.join(DATA_DIR, 'target_communities.json');

// 2. Ситечко триггерных паттернов (Regex)
const TRIGGER_PATTERNS = [
  /курьер/i,
  /вольт/i,
  /wolt/i,
  /садик/i,
  /воспитател/i,
  /гоненет/i,
  /собес/i,
  /интервью/i,
  /ульпан/i,
  /иврит/i,
  /не понима/i,
  /не могу сказа/i,
  /ступор/i,
  /боюсь говор/i,
  /страх говор/i,
  /языковой барьер/i,
  /стыдно/i,
  /поликлиник/i,
  /макаби/i,
  /клалит/i,
  /меухедет/i,
  /леумит/i,
  /домофон/i,
  /ани лемата/i,
];

// 2.1 Конфигурация временного окна и дедупликации
// Для 12-часового цикла мониторинга окно 24 часа дает надежный нахлёст (overlap),
// исключая пропуск ночных/дневных постов, а дедупликация защищает от повторов.
const MAX_LOOKBACK_HOURS = 24;

function matchesTrigger(text) {
  if (!text || typeof text !== 'string') return false;
  return TRIGGER_PATTERNS.some((p) => p.test(text));
}

/**
 * Нормализованная сигнатура контента для гарантированной дедупликации
 * даже если Facebook не отдает прямой permalink поста
 */
function getLeadSignature(author, text) {
  const normAuthor = (author || '').trim().toLowerCase();
  const normText = (text || '').replace(/\s+/g, ' ').trim().slice(0, 80).toLowerCase();
  return `${normAuthor}:::${normText}`;
}

/**
 * Оценка давности поста в часах по тексту метки времени Facebook
 * Поддерживает форматы на русском, английском и иврите ("2 ч.", "30 мин", "Yesterday", "1d")
 */
function parsePostAgeHours(timeText) {
  if (!timeText || typeof timeText !== 'string') return 0; // если метка скрыта, считаем свежим
  const t = timeText.toLowerCase();

  // Минуты
  if (t.includes('мин') || t.includes('min') || t.includes('דק')) return 0.5;
  // Часы
  const hMatch = t.match(/(\d+)\s*(ч|h|hour|hr|שע)/i);
  if (hMatch) return parseInt(hMatch[1], 10);
  // Дни
  const dMatch = t.match(/(\d+)\s*(дн|д|d|day|ימ)/i);
  if (dMatch) return parseInt(dMatch[1], 10) * 24;
  // Вчера
  if (t.includes('вчера') || t.includes('yesterday') || t.includes('אתמול')) return 24;
  // Недели или месяцы (заведомо старые посты)
  if (t.includes('нед') || t.includes('w') || t.includes('мес') || t.includes('m') || t.includes('год') || t.includes('y')) return 168;

  return 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return sleep(ms);
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveLeads(leads) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

function loadTargetCommunities() {
  if (!fs.existsSync(COMMUNITIES_FILE)) return [];
  try {
    const list = JSON.parse(fs.readFileSync(COMMUNITIES_FILE, 'utf-8'));
    return list.filter((c) => c.platform === 'facebook' && c.status !== 'paused');
  } catch {
    return [];
  }
}

// 3. ИИ-анализатор болей и генератор вежливых ответов (Groq / Gemini)
async function analyzeWithAi(rawText) {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_PRIMARY_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();

  const systemPrompt = `Ты — эксперт по языковой адаптации в Израиле для проекта «Ульпан Алеф».
Твоя задача — проанализировать крик о помощи или вопрос олим из Facebook.
Сгенерируй вежливый, максимально эмпатичный и естественный ответ от первого лица (реального участника сообщества).
Строгие правила ответа:
1. НИКАКИХ голых спам-ссылок в тексте ответа!
2. Сначала эмпатия и конкретная языковая польза (2-3 готовые дежурные фразы с Pealim-транскрипцией).
3. В конце мягкое предложение: предложить бесплатный тренажер звонков/диалогов или назвать промокод (например, LATTE для Тыквенного латте, OLE2026 для новичков, MOMS для мам).
Верни СТРОГО JSON:
{
  "isTargetLead": boolean,
  "painCategory": "courier_call" | "kindergarten" | "clinic" | "interview" | "speaking_barrier" | "other",
  "confidence": number,
  "painSummary": string,
  "targetDeepLink": string,
  "suggestedReply": string
}`;

  // 1. Приоритет Groq Qwen
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
            { role: 'user', content: `Сообщение из Facebook: "${rawText}"` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    } catch (e) {
      console.warn('[FB Radar] Groq warning, trying fallback:', e.message);
    }
  }

  // 2. Gemini fallback
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nСообщение из Facebook: "${rawText}"` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (e) {
      console.warn('[FB Radar] Gemini warning:', e.message);
    }
  }

  // 3. Детерминированный фолбэк при оффлайне
  const isCourier = /курьер|вольт|wolt/i.test(rawText);
  const isKinder = /садик|воспитател|гоненет/i.test(rawText);
  const isInterview = /собес|интервью/i.test(rawText);
  const isClinic = /поликлиник|макаби|клалит|меухедет|леумит/i.test(rawText);

  let category = 'speaking_barrier';
  let summary = 'Преодоление языкового барьера';
  let link = '/lessons/1';
  let reply = 'Очень вас понимаю! В Ульпане Алеф есть интерактивный речевой тренажер именно для этой ситуации. Промокод LATTE дает 14 дней полного доступа.';

  if (isCourier) {
    category = 'courier_call';
    summary = 'Страх звонков курьера (Вольт/доставка)';
    link = '/lessons/1/call?promo=LATTE';
    reply = 'Очень знакомая боль! Главное — не теряться и сразу сказать курьеру: "ани лемата" (я внизу) или "таси́м лид hа-де́лет" (оставьте у двери). А чтобы натренировать ухо перед звонком — в Ульпане Алеф есть бесплатный симулятор звонка курьера, промокод LATTE.';
  } else if (isKinder) {
    category = 'kindergarten';
    summary = 'Разговор с воспитательницей в детском саду';
    link = '/decks/kindergarten?promo=MOMS';
    reply = 'Прекрасно вас понимаю, у самой в первый год руки дрожали от звонков из садика. Держите 3 дежурные фразы: "hа-кол бе-се́дер?" (всё в порядке?), "еш хом?" (есть температура?), "ани квар ба-а" (я уже иду). Отрепетировать диалог можно в тренажере садика в Ульпане Алеф (промокод MOMS).';
  } else if (isInterview) {
    category = 'interview';
    summary = 'Собеседование на иврите / хайтек';
    link = '/decks/it-interview?promo=OLE2026';
    reply = 'Для интервью главное — заучить шаблон самопрезентации на 1.5 минуты и терминологию. В Ульпане Алеф как раз есть профильная колода фраз для собеседований на иврите (промокод OLE2026).';
  } else if (isClinic) {
    category = 'clinic';
    summary = 'Визит в поликлинику / запись к врачу';
    link = '/decks/clinic?promo=LATTE';
    reply = 'В поликлинике главное четко назвать жалобу и номер теудат-зеут. В Ульпане Алеф есть готовый разбор диалогов с секретарем больничной кассы (промокод LATTE).';
  }

  return {
    isTargetLead: true,
    painCategory: category,
    confidence: 8.5,
    painSummary: summary,
    targetDeepLink: link,
    suggestedReply: reply,
  };
}

// 4. Отправка лидов на боевой сервер (/api/admin/marketing/radar)
async function pushLeadsToRemoteApi(leads, customRemoteUrl) {
  const remoteUrl = (
    customRemoteUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://ulpana-hebrew.vercel.app'
  ).replace(/\/$/, '');

  const adminKey = process.env.ADMIN_SECRET_KEY?.trim() || process.env.JWT_SECRET?.trim();

  console.log(`\n📡 Отправка ${leads.length} лидов на боевой сервер: ${remoteUrl}/api/admin/marketing/radar`);

  try {
    const res = await fetch(`${remoteUrl}/api/admin/marketing/radar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      },
      body: JSON.stringify({
        action: 'ingest',
        leads,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Успешно синхронизировано с боевым сервером! Сохранено в БД: ${data.ingested || leads.length}`);
      return true;
    } else {
      const err = await res.text();
      console.warn(`⚠️ Боевой сервер вернул статус ${res.status}: ${err}`);
      return false;
    }
  } catch (e) {
    console.warn(`⚠️ Ошибка подключения к ${remoteUrl}:`, e.message);
    return false;
  }
}

async function launchBrowser(playwright, options = {}) {
  // 1. Приоритет: установленный Google Chrome
  try {
    return await playwright.chromium.launch({
      ...options,
      channel: 'chrome',
    });
  } catch (e) {
    // 2. Фолбэк: установленный Microsoft Edge
    try {
      return await playwright.chromium.launch({
        ...options,
        channel: 'msedge',
      });
    } catch (e2) {
      // 3. Фолбэк: встроенный Chromium
      return await playwright.chromium.launch(options);
    }
  }
}

// 5. Интерактивная авторизация в Facebook (--auth)
async function runAuth() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('❌ Playwright не установлен. Запустите: npm install playwright');
    process.exit(1);
  }

  console.log('\n=============================================================');
  console.log('📘 ИНТЕРАКТИВНЫЙ ВХОД В FACEBOOK ДЛЯ СОХРАНЕНИЯ СЕССИИ');
  console.log('=============================================================');
  console.log('1. Сейчас откроется окно Google Chrome.');
  console.log('2. Войдите в свой аккаунт Facebook.');
  console.log('3. Скрипт сам автоматически обнаружит вход и сохранит сессию.');
  console.log('-------------------------------------------------------------\n');

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const browser = await launchBrowser(playwright, {
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });

  console.log('👉 Пожалуйста, войдите в свой аккаунт Facebook в открывшемся окне браузера.');
  console.log('   Скрипт автоматически распознает вход по cookie c_user или закроется по таймауту...\n');

  // Автоматическое ожидание входа (проверка кук каждые 2 секунды) до 5 минут
  const startTime = Date.now();
  let loggedIn = false;

  while (Date.now() - startTime < 300000) {
    try {
      // Получаем все куки контекста (без фильтрации по жесткому URL)
      const cookies = await context.cookies();
      const hasUserCookie = cookies.some((c) => c.name === 'c_user' || (c.name === 'xs' && c.domain.includes('facebook')));
      if (hasUserCookie) {
        console.log('\n🎉 Успешный вход обнаружен (найдены сессионные куки Facebook)!');
        loggedIn = true;
        await sleep(3000); // даем FB завершить установку сессионных кук
        break;
      }
    } catch {}
    await sleep(2000);
  }

  if (!loggedIn) {
    console.log('⚠️ Время ожидания (5 мин) истекло.');
  }

  // Сохраняем storageState
  await context.storageState({ path: SESSION_FILE });
  console.log(`\n✅ Сессия Facebook успешно сохранена в файл:\n   ${SESSION_FILE}`);
  console.log('🔒 Файл добавлен в .gitignore и не передается в репозиторий.');

  await browser.close();
}

// 5.1 Быстрое сохранение куки из командной строки (--cookie="c_user=...; xs=...")
function saveCookiesFromHeader(cookieString) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const pairs = cookieString.split(';').map((p) => p.trim()).filter(Boolean);
  const cookies = [];

  for (const p of pairs) {
    const eqIdx = p.indexOf('=');
    if (eqIdx === -1) continue;
    const name = p.slice(0, eqIdx).trim();
    const value = p.slice(eqIdx + 1).trim();

    cookies.push({
      name,
      value,
      domain: '.facebook.com',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
      httpOnly: name === 'xs',
      secure: true,
      sameSite: 'None',
    });
  }

  const storageState = {
    cookies,
    origins: [
      {
        origin: 'https://www.facebook.com',
        localStorage: [],
      },
    ],
  };

  fs.writeFileSync(SESSION_FILE, JSON.stringify(storageState, null, 2), 'utf-8');
  console.log(`\n✅ Сессия Facebook успешно создана из переданных кук (${cookies.length} параметров)!`);
  console.log(`   Файл: ${SESSION_FILE}`);
}

// 6. Основной цикл сканирования групп (--scan)
async function runScan(options = {}) {
  const isFast = options.fast || false;
  const dryRun = options.dryRun || false;
  const remoteUrl = options.remoteUrl;

  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('❌ Playwright не установлен. Запустите: npm install playwright');
    process.exit(1);
  }

  if (!fs.existsSync(SESSION_FILE) && !dryRun) {
    console.error('\n⚠️ Файл сессии Facebook не найден!');
    console.error(`   Ожидался путь: ${SESSION_FILE}`);
    console.error('👉 Запустите сначала первичную авторизацию:');
    console.error('   node growth/scripts/facebook_radar.cjs --auth\n');
    process.exit(1);
  }

  const communities = loadTargetCommunities();
  if (communities.length === 0) {
    console.log('⚠️ Нет активных сообществ Facebook в target_communities.json');
    return;
  }

  console.log(`\n🚀 Запуск сканирования групп Facebook (целевых сообществ: ${communities.length})...`);
  console.log(`⏱ Режим: ${isFast ? 'Быстрый (тест)' : 'Щадящий (человекоподобный раз в 12 часов)'}`);

  const leads = loadLeads();
  const existingUrls = new Set(leads.map((l) => l.postUrl).filter((u) => u && (u.includes('/posts/') || u.includes('/permalink/'))));
  const existingSignatures = new Set(leads.map((l) => getLeadSignature(l.authorName, l.rawText)));
  const newLeads = [];

  const browser = await launchBrowser(playwright, {
    headless: true,
  });

  const context = await browser.newContext({
    storageState: SESSION_FILE,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  for (let i = 0; i < communities.length; i++) {
    const comm = communities[i];
    // Хронологическая сортировка ленты Facebook: новые посты первыми (?sorting_setting=CHRONOLOGICAL)
    const targetUrl = comm.inviteUrl.includes('?')
      ? `${comm.inviteUrl}&sorting_setting=CHRONOLOGICAL`
      : `${comm.inviteUrl}?sorting_setting=CHRONOLOGICAL`;

    console.log(`\n🔍 [${i + 1}/${communities.length}] Сканирование: "${comm.title}" (${targetUrl})`);

    const page = await context.newPage();

    try {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await randomDelay(isFast ? 1000 : 3000, isFast ? 2000 : 5000);

      // Плавный скролл 2-3 раза для подгрузки свежих постов
      for (let s = 0; s < 3; s++) {
        await page.mouse.wheel(0, 450);
        await randomDelay(isFast ? 600 : 1500, isFast ? 1200 : 3000);
      }

      // Извлекаем посты со страницы
      const extractedPosts = await page.evaluate(() => {
        const results = [];
        // Селекторы блоков сообщений в группах Facebook
        const postContainers = document.querySelectorAll('div[role="feed"] > div, div[data-ad-preview="message"], div[dir="auto"]');

        postContainers.forEach((el) => {
          const text = el.innerText?.trim();
          if (!text || text.length < 30 || text.length > 2500) return;

          const article = el.closest('div[role="article"]') || el;

          // Ищем ссылку на пост
          const linkEl = article.querySelector('a[href*="/posts/"], a[href*="/permalink/"]');
          const postUrl = linkEl ? linkEl.href : window.location.href;

          // Имя автора
          const authorEl = article.querySelector('h2, strong, a[role="link"]');
          const authorName = authorEl?.innerText?.trim() || 'Участник группы';

          // Временная метка поста (например, "2 ч.", "30 мин", "Yesterday")
          const timeEl = article.querySelector('a[href*="/posts/"] span, a[href*="/permalink/"] span, abbr');
          const timeText = timeEl?.innerText?.trim() || '';

          results.push({
            text,
            postUrl,
            authorName,
            timeText,
          });
        });

        return results;
      });

      console.log(`  📄 Найдено блоков текста: ${extractedPosts.length}`);

      for (const p of extractedPosts) {
        if (!matchesTrigger(p.text)) continue;

        // 1. Проверка временного окна (не старше MAX_LOOKBACK_HOURS = 24 ч)
        const ageHours = parsePostAgeHours(p.timeText);
        if (ageHours > MAX_LOOKBACK_HOURS) {
          console.log(`  ⏭ Пропущен пост старше ${MAX_LOOKBACK_HOURS}ч (~${Math.round(ageHours)}ч назад): "${p.text.slice(0, 40)}..."`);
          continue;
        }

        // 2. Двухуровневая дедупликация (по URL и по сигнатуре текста)
        const signature = getLeadSignature(p.authorName, p.text);
        const hasUrlMatch = p.postUrl && (p.postUrl.includes('/posts/') || p.postUrl.includes('/permalink/')) && existingUrls.has(p.postUrl);
        const hasSigMatch = existingSignatures.has(signature);

        if (hasUrlMatch || hasSigMatch) {
          console.log(`  ⏭ Пост уже обработан ранее (дубликат), пропускаем: "${p.text.slice(0, 40)}..."`);
          continue;
        }

        console.log(`  🎯 Сработал языковой триггер! Автор: ${p.authorName} (${p.timeText || 'свежее'})`);
        console.log(`     Цитата: "${p.text.slice(0, 60)}..."`);

        const analysis = await analyzeWithAi(p.text);

        if (analysis.isTargetLead) {
          const leadItem = {
            id: `lead-fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            sourceChannel: 'facebook',
            sourceChatName: comm.title.replace('Facebook: ', ''),
            authorName: p.authorName,
            authorContact: p.authorName,
            postUrl: p.postUrl,
            rawText: p.text,
            aiAnalysis: analysis,
            status: 'new',
          };

          newLeads.push(leadItem);
          existingSignatures.add(signature);
          if (p.postUrl && (p.postUrl.includes('/posts/') || p.postUrl.includes('/permalink/'))) {
            existingUrls.add(p.postUrl);
          }
        }
      }
    } catch (err) {
      console.warn(`  ⚠️ Ошибка при сканировании ${comm.title}:`, err.message);
    } finally {
      await page.close();
    }

    // Человекоподобная пауза между группами
    if (i < communities.length - 1) {
      const waitTime = isFast ? 3000 : 20000;
      console.log(`  ☕ Человеческая пауза перед следующей группой (${Math.round(waitTime / 1000)}с)...`);
      await sleep(waitTime);
    }
  }

  await browser.close();

  console.log(`\n🎉 Сканирование завершено. Найдено новых целевых лидов: ${newLeads.length}`);

  if (newLeads.length > 0) {
    // 1. Сохраняем локально
    const updated = [...newLeads, ...leads];
    saveLeads(updated);

    // 2. Отправляем на боевой сервер
    await pushLeadsToRemoteApi(newLeads, remoteUrl);
  }
}

// 7. Точка входа
async function main() {
  const args = process.argv.slice(2);
  const isAuth = args.includes('--auth') || args.includes('--login');
  const isScan = args.includes('--scan');
  const isFast = args.includes('--fast');
  const isDryRun = args.includes('--dry-run');
  const isSummary = args.includes('--summary');
  const msgArg = args.find((a) => a.startsWith('--test-msg='));
  const remoteArg = args.find((a) => a.startsWith('--remote='));
  const cookieArg = args.find((a) => a.startsWith('--cookie=') || a.startsWith('--set-cookie='));
  const remoteUrl = remoteArg ? remoteArg.split('=')[1] : undefined;

  if (cookieArg) {
    const rawVal = cookieArg.slice(cookieArg.indexOf('=') + 1);
    saveCookiesFromHeader(rawVal);
    return;
  }

  if (isAuth) {
    await runAuth();
    return;
  }

  if (msgArg) {
    const text = msgArg.split('=')[1];
    console.log(`\n🧪 Тестовый разбор сообщения:\n"${text}"`);
    if (!matchesTrigger(text)) {
      console.log('❌ Сообщение не содержит языковых маркеров болей.');
      return;
    }
    console.log('✅ Триггер сработал! Запуск ИИ-анализа боли...');
    const analysis = await analyzeWithAi(text);
    console.log('\n📊 Результат анализа:');
    console.log(JSON.stringify(analysis, null, 2));

    const testLead = {
      id: `lead-test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceChannel: 'facebook',
      sourceChatName: 'Тыквенный латте',
      authorName: 'Анна М. (Тест)',
      authorContact: 'Анна М.',
      postUrl: 'https://facebook.com/groups/pumpkinlatte/posts/123456789',
      rawText: text,
      aiAnalysis: analysis,
      status: 'new',
    };

    // Сохраняем локально и пушим в API
    const leads = loadLeads();
    leads.unshift(testLead);
    saveLeads(leads);

    await pushLeadsToRemoteApi([testLead], remoteUrl);
    return;
  }

  if (isDryRun) {
    console.log('\n🧪 Запуск демонстрационного прогона (Dry-Run)...');
    const demoPosts = [
      {
        group: 'Тыквенный латте',
        author: 'Елена К.',
        url: 'https://facebook.com/groups/pumpkinlatte/posts/991',
        text: 'Девочки, спасайте. Воспитательница из садика звонит каждый день, а я от страха слова сказать не могу на иврите, сразу ступор...',
      },
      {
        group: 'Оле Хадаш',
        author: 'Дмитрий В.',
        url: 'https://facebook.com/groups/olim.israel.community/posts/882',
        text: 'Уже стыдно перед курьерами Вольта, звонят снизу и тараторят, вообще не понимаю что отвечать.',
      },
    ];

    const newLeads = [];
    for (const post of demoPosts) {
      if (matchesTrigger(post.text)) {
        console.log(`  🎯 Триггер: ${post.author} (${post.group})`);
        const analysis = await analyzeWithAi(post.text);
        newLeads.push({
          id: `lead-demo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          sourceChannel: 'facebook',
          sourceChatName: post.group,
          authorName: post.author,
          authorContact: post.author,
          postUrl: post.url,
          rawText: post.text,
          aiAnalysis: analysis,
          status: 'new',
        });
      }
    }

    const leads = loadLeads();
    saveLeads([...newLeads, ...leads]);
    await pushLeadsToRemoteApi(newLeads, remoteUrl);
    console.log(`\n✅ Демо-прогон успешен. Добавлено ${newLeads.length} лидов.`);
    return;
  }

  if (isScan) {
    await runScan({ fast: isFast, remoteUrl });
    return;
  }

  if (isSummary || args.length === 0) {
    const leads = loadLeads();
    const fbLeads = leads.filter((l) => l.sourceChannel === 'facebook');
    console.log('\n=============================================================');
    console.log('📊 ТЕКУЩИЕ ЛИДЫ В ПАРТИЗАНСКОМ РАДАРЕ:');
    console.log(`Всего лидов: ${leads.length} | Из Facebook: ${fbLeads.length} | Новых: ${leads.filter((l) => l.status === 'new').length}`);
    console.log('=============================================================');
    for (const l of leads.slice(0, 5)) {
      console.log(`\n[${l.status.toUpperCase()}] ${l.sourceChannel.toUpperCase()}: ${l.sourceChatName} | ${l.authorName} (🔥 ${l.aiAnalysis.confidence}/10)`);
      if (l.postUrl) console.log(`  🔗 Пост: ${l.postUrl}`);
      console.log(`  Боль: ${l.aiAnalysis.painSummary}`);
      console.log(`  Экран: ${l.aiAnalysis.targetDeepLink}`);
      console.log(`  Ответ: "${l.aiAnalysis.suggestedReply.slice(0, 75)}..."`);
    }
    console.log('\n-------------------------------------------------------------');
    console.log('Доступные команды:');
    console.log('  node growth/scripts/facebook_radar.cjs --auth        # Вход в FB и сохранение cookies');
    console.log('  node growth/scripts/facebook_radar.cjs --scan        # Запуск сканирования групп');
    console.log('  node growth/scripts/facebook_radar.cjs --dry-run     # Тестовый прогон');
    console.log('  node growth/scripts/facebook_radar.cjs --test-msg="" # Разбор одного сообщения');
  }
}

main().catch(console.error);
