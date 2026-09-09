import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { createLoudMasterAudio } from './build_direct_audio.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const OUTPUT_DIR = path.resolve('./public/demo');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runFullVideoGeneration() {
  const masterAudioPath = path.resolve('./public/demo/master_audio.wav');
  const TOTAL_DURATION_SEC = 140;
  console.log(`🎙️ Сборка мастер-аудио с чистым громким голосом диктора и тихой музыкой (${TOTAL_DURATION_SEC}s)...`);
  await createLoudMasterAudio(TOTAL_DURATION_SEC, masterAudioPath);

  console.log('📱 Запуск браузера Chrome для синхронной видеозаписи (390x844)...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('ulpana_auto_show_guides', 'false');
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
    localStorage.setItem('ulpana_show_floating_feedback', 'false');
    localStorage.setItem('ulpana_chat_tips_hidden', 'true');
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });

  // Внедряем стили баннера, тач-курсора и отключаем перехват кликов dev-оверлеем
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      nextjs-portal, [data-nextjs-dev-overlay] {
        pointer-events: none !important;
        display: none !important;
      }
      #demo-banner {
        position: fixed;
        bottom: 18px;
        left: 12px;
        right: 12px;
        z-index: 999999;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1.5px solid rgba(255, 255, 255, 0.22);
        border-radius: 20px;
        padding: 12px 14px;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.7), 0 0 30px rgba(59, 130, 246, 0.35);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }
      #demo-touch {
        position: fixed;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.75) 0%, rgba(37, 99, 235, 0.25) 70%, transparent 100%);
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 18px rgba(59, 130, 246, 0.85);
        pointer-events: none;
        z-index: 1000000;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.18s ease-out, opacity 0.25s ease-out;
        opacity: 0;
      }
      #demo-touch.active { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
      #demo-touch.tap { transform: translate(-50%, -50%) scale(0.85); }
    `;
    document.head.appendChild(style);

    const touch = document.createElement('div');
    touch.id = 'demo-touch';
    document.body.appendChild(touch);

    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
        <span id="d-badge" style="font-size:10px;font-weight:800;letter-spacing:0.06em;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:2px 8px;border-radius:999px;">УЛЬПАНА</span>
        <span id="d-icon" style="font-size:13px;">🇮🇱</span>
      </div>
      <div id="d-title" style="font-size:14px;font-weight:800;color:#f8fafc;margin-bottom:2px;">Загрузка...</div>
      <div id="d-desc" style="font-size:11.5px;color:#cbd5e1;line-height:1.35;">Интерактивный курс иврита</div>
    `;
    document.body.appendChild(banner);

    window.__setBanner = (badge, title, desc) => {
      document.getElementById('d-badge').innerText = badge;
      document.getElementById('d-title').innerText = title;
      document.getElementById('d-desc').innerText = desc;
    };

    window.__touchAnim = (x, y) => {
      const t = document.getElementById('demo-touch');
      t.style.left = `${x}px`;
      t.style.top = `${y}px`;
      t.classList.add('active', 'tap');
      setTimeout(() => t.classList.remove('tap'), 180);
      setTimeout(() => t.classList.remove('active'), 450);
    };
  });

  async function tap(target) {
    try {
      let loc = typeof target === 'string' ? page.locator(target).first() : target;
      if (loc) {
        await loc.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
        const b = await loc.boundingBox();
        if (b) {
          const x = b.x + b.width / 2;
          const y = b.y + b.height / 2;
          await page.evaluate(({ px, py }) => window.__touchAnim(px, py), { px: x, py: y });
          await sleep(150);
          await loc.click({ force: true }).catch(async () => {
            await page.mouse.click(x, y);
          });
        }
      }
    } catch (e) {}
  }

  async function setBanner(badge, title, desc) {
    await page.evaluate(({ b, t, d }) => window.__setBanner(b, t, d), { b: badge, t: title, d: desc });
  }

  const startTime = Date.now();
  async function waitTill(targetSec) {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const remainingMs = (targetSec - elapsedSec) * 1000;
    if (remainingMs > 50) {
      await sleep(remainingMs);
    }
  }

  // =========================================================================
  // ТАЙМЛАЙН ДЕМОНСТРАЦИИ (140s)
  // =========================================================================

  // 1. (0s - 12s) ИНТРО: 100 УРОКОВ И КАРТА КУРСА
  console.log('▶ [0s] Сцена 1: Интро • 100 уроков');
  await setBanner('КУРС ИВРИТА', '100 интерактивных уроков', 'От уровня Алеф (с нуля) до свободного Бет (B2)');
  await sleep(2500);
  // Плавный скролл по карте уроков
  await page.mouse.wheel(0, 380);
  await sleep(2500);
  await page.mouse.wheel(0, 380);
  await sleep(2500);
  await page.mouse.wheel(0, -760);
  await waitTill(12.0);

  // 2. (12s - 27.5s) СТРУКТУРА: 5 ОБЯЗАТЕЛЬНЫХ ЭТАПОВ В КАЖДОМ УРОКЕ
  console.log('▶ [12s] Сцена 2: 5 этапов в каждом уроке');
  await page.evaluate(() => {
    const splash = document.createElement('div');
    splash.id = 'demo-5-stages-splash';
    splash.style.cssText = `
      position: fixed; inset: 10px 10px 85px 10px; z-index: 99990;
      background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(25px);
      border-radius: 28px; border: 2px solid rgba(59, 130, 246, 0.4);
      padding: 18px 16px; color: white; display: flex; flex-direction: column;
      justify-content: space-between; box-shadow: 0 25px 60px rgba(0,0,0,0.8);
      font-family: -apple-system, sans-serif;
    `;
    splash.innerHTML = `
      <div>
        <div style="font-size: 11px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">СТРУКТУРА УРОКА</div>
        <div style="font-size: 17px; font-weight: 900; line-height: 1.25; margin-bottom: 12px;">5 обязательных этапов:</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="background: rgba(255,255,255,0.06); border-radius: 14px; padding: 8px 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">📖</span>
            <div><b style="font-size: 13px; color: #93c5fd;">1. Теория</b><div style="font-size: 11px; color: #94a3b8;">Грамматика и правила простым языком</div></div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 14px; padding: 8px 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🗂️</span>
            <div><b style="font-size: 13px; color: #6ee7b7;">2. Словарный запас</b><div style="font-size: 11px; color: #94a3b8;">Разбор корней и умные карточки SM-2</div></div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 14px; padding: 8px 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🧩</span>
            <div><b style="font-size: 13px; color: #fcd34d;">3. Тренажер</b><div style="font-size: 11px; color: #94a3b8;">Сборка фраз и интерактивные тесты</div></div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 14px; padding: 8px 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">🗣️</span>
            <div><b style="font-size: 13px; color: #c4b5fd;">4. Тренировка диалогов</b><div style="font-size: 11px; color: #94a3b8;">Разговорная практика и проверка произношения</div></div>
          </div>
          <div style="background: rgba(255,255,255,0.06); border-radius: 14px; padding: 8px 12px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">📱</span>
            <div><b style="font-size: 13px; color: #f472b6;">5. Звонок с ИИ</b><div style="font-size: 11px; color: #94a3b8;">Симулятор телефона в бытовых ситуациях</div></div>
          </div>
        </div>
      </div>
      <div style="text-align: center; font-size: 11px; color: #60a5fa; font-weight: 700; background: rgba(59,130,246,0.15); padding: 6px; border-radius: 10px;">
        Каждый этап развивает практический навык речи
      </div>
    `;
    document.body.appendChild(splash);
  });
  await setBanner('5 ЭТАПОВ В УРОКЕ', 'Целостная методика ульпана', 'От грамматики и прописей до свободного звонка по телефону');
  await waitTill(25.0);

  // Убираем сплэш и входим в Урок 1
  await page.evaluate(() => {
    const s = document.getElementById('demo-5-stages-splash');
    if (s) s.remove();
  });
  await tap('button:has-text("Начать"), button:has-text("Продолжить"), .bg-gradient-to-r');
  await waitTill(27.5);

  // 3. (27.5s - 45.0s) ЭТАП 1: ТЕОРИЯ, ОЗВУЧКА, ШРИФТЫ И ОГЛАСОВКИ
  console.log('▶ [27.5s] Сцена 3: Этап 1 • Теория, озвучка и переключение шрифтов');
  await setBanner('ЭТАП 1: ТЕОРИЯ', 'Озвучка фраз и переключение шрифтов', 'Печатный (דפוס) и рукописный (כתב), скрытие никудот');
  await page.mouse.wheel(0, 220);
  await sleep(1500);

  // Демонстрация озвучки фразы кликом
  const audioBtn = page.locator('button:has(.lucide-volume-2)').first();
  if (await audioBtn.isVisible()) {
    await tap(audioBtn);
    await setBanner('ОЗВУЧКА СЛОВ И ФРАЗ', 'Аудио носителей языка в один клик', 'Нажмите на динамик для идеального произношения');
    await sleep(2500);
  }

  // Переключение шрифта דפוס -> כתב
  const fontBtn = page.locator('button:has-text("דפוס"), button:has-text("כתב")').first();
  await tap(fontBtn);
  await setBanner('РУКОПИСНЫЙ ШРИФТ', 'Живой израильский курсив (כתב יד)', 'Учимся читать записи от руки и вывески в Израиле');
  await sleep(3500);

  // Обратно на печатный
  await tap(fontBtn);
  await sleep(1200);

  // Открытие настроек для демонстрации огласовок
  const settingsBtn = page.locator('button[title*="Настройки"], button:has(.lucide-settings)').first();
  if (await settingsBtn.isVisible()) {
    await tap(settingsBtn);
    await sleep(1000);
    const nikkud = page.locator('label:has-text("Показывать огласовки") input[type="checkbox"]').first();
    if (await nikkud.isVisible()) {
      await tap(nikkud);
      await sleep(1000);
    }
    const closeSet = page.locator('button:has(.lucide-x)').first();
    if (await closeSet.isVisible()) await tap(closeSet);
    await setBanner('ОГЛАСОВКИ (НИКУД)', 'Чтение без огласовок', 'Тренировка чтения текста как в реальной жизни в Израиле');
    await sleep(2500);

    // Включаем огласовки обратно
    await tap(settingsBtn);
    await sleep(800);
    if (await nikkud.isVisible()) await tap(nikkud);
    if (await closeSet.isVisible()) await tap(closeSet);
  }
  await waitTill(45.0);

  // 4. (45.0s - 58.5s) РАЗДЕЛ «ПРОПИСИ» (AlphabetTrainer)
  console.log('▶ [45s] Сцена 4: Раздел Прописи • Рукописный алфавит');
  // Выходим в меню
  const homeBtn = page.locator('button:has(.lucide-home), button:has-text("←")').first();
  if (await homeBtn.isVisible()) await tap(homeBtn);
  await sleep(600);

  // Переход в раздел Прописи
  await tap('nav.md\\:hidden button:has-text("Прописи")');
  await setBanner('РАЗДЕЛ ПРОПИСИ', 'Тренажер рукописного алфавита (Ктав Яд)', '27 букв • Траектории штрихов, линовка тетради и холст');
  await sleep(2000);

  // Клик по первой букве Алеф в сетке
  const alefCard = page.locator('div.grid div.group').first();
  await tap(alefCard);
  await setBanner('ПРАВИЛА НАПИСАНИЯ', 'Буква Алеф (אָלֶף)', 'Точки старта ❶ ❷, линовка школьной тетради и направление руки');
  await sleep(2500);

  // Симуляция плавного рисования на интерактивном холсте
  const canvas = page.locator('canvas').first();
  if (await canvas.isVisible()) {
    const box = await canvas.boundingBox();
    if (box) {
      const startX = box.x + box.width * 0.45;
      const startY = box.y + box.height * 0.35;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      // Рисуем дугу
      await page.mouse.move(startX + 35, startY + 50, { steps: 8 });
      await page.mouse.move(startX + 10, startY + 110, { steps: 8 });
      await page.mouse.up();
      await sleep(400);

      // Второй штрих
      await page.mouse.move(startX - 25, startY + 20);
      await page.mouse.down();
      await page.mouse.move(startX - 40, startY + 115, { steps: 8 });
      await page.mouse.up();
    }
  }
  await waitTill(58.5);

  // 5. (58.5s - 80.0s) ТЕМАТИЧЕСКИЕ КОЛОДЫ, КАРТОЧКИ И ВСТРОЕННЫЙ ПЕАЛИМ
  console.log('▶ [58.5s] Сцена 5: Карточки и встроенный Пеалим');
  await tap('nav.md\\:hidden button:has-text("Словарик")');
  await sleep(800);

  // Переход во вкладку Тематические колоды
  const thematicTab = page.locator('button:has-text("Тематические колоды")').first();
  if (await thematicTab.isVisible()) await tap(thematicTab);
  await setBanner('ТЕМАТИЧЕСКИЕ КОЛОДЫ', 'Глаголы, Еда, Сленг, Город, Семья', 'Тематические наборы слов и встроенный справочник Пеалим');
  await sleep(2000);

  // Открываем первую колоду: Глаголы Алеф — Часть 1
  const verbsTrainBtn = page.locator('button:has-text("Учить"), button:has-text("Тренировать")').first();
  await tap(verbsTrainBtn);
  await setBanner('КАРТОЧКИ СЛОВ', 'Глагол: לִרְצוֹת (хотеть)', 'Озвучка носителями языка и тренировка запоминания');
  await sleep(2000);

  // Озвучка слова на карточке
  const cardSpeaker = page.locator('button:has(.lucide-volume-2)').first();
  if (await cardSpeaker.isVisible()) {
    await tap(cardSpeaker);
    await sleep(1200);
  }

  // Переворот карточки
  const flashcard = page.locator('.min-h-\\[200px\\]').first();
  await tap(flashcard);
  await setBanner('ОБОРОТ КАРТОЧКИ', 'Перевод, корень (ר-צ-ה) и кнопка Пеалим', 'Мгновенный доступ к спряжениям глагола прямо из карточки');
  await sleep(2000);

  // Клик по кнопке Пеалим
  const pealimBtn = page.locator('button:has-text("Пеалим")').first();
  if (await pealimBtn.isVisible()) {
    await tap(pealimBtn);
    await setBanner('ВСТРОЕННЫЙ ПЕАЛИМ', 'Все времена глагола: Настоящее, Прошедшее, Будущее', 'Таблица форм: הווה, עבר, עתיד с озвучкой каждой формы');
    await sleep(3000);

    // Переключение вкладки на Прошедшее время
    const pastTab = page.locator('button:has-text("Прошедшее")').first();
    if (await pastTab.isVisible()) {
      await tap(pastTab);
      await sleep(1800);
    }

    // Переключение вкладки на Будущее время
    const futureTab = page.locator('button:has-text("Будущее")').first();
    if (await futureTab.isVisible()) {
      await tap(futureTab);
      await sleep(1800);
    }

    // НАДЕЖНОЕ ЗАКРЫТИЕ ОКНА ПЕАЛИМ: клик по кнопке назад внутри модалки
    console.log('Закрытие окна Пеалим...');
    const pealimBack = page.locator('.fixed.inset-0.z-50 button[title="Назад"]').first();
    if (await pealimBack.isVisible()) {
      await tap(pealimBack);
    } else {
      await page.evaluate(() => {
        const backdrop = document.querySelector('.fixed.inset-0.z-50');
        if (backdrop) backdrop.click();
      });
    }
    await sleep(600);

    // Гарантированное удаление модалки из DOM, если она еще открыта
    await page.evaluate(() => {
      const backdrop = document.querySelector('.fixed.inset-0.z-50');
      if (backdrop) backdrop.remove();
    });
    await sleep(400);
  }

  // Закрываем карточки и возвращаемся в Уроки
  console.log('Возврат из карточек в Уроки...');
  const closeCards = page.locator('button:has-text("Вернуться"), button:has(.lucide-arrow-left)').first();
  if (await closeCards.isVisible()) await tap(closeCards);
  await sleep(500);

  await waitTill(80.0);

  // 6. (80.0s - 90.0s) ЭТАП 3: ИНТЕРАКТИВНЫЙ ТРЕНАЖЕР УПРАЖНЕНИЙ
  console.log('▶ [80s] Сцена 6: Этап 3 • Интерактивный тренажер');
  await tap('nav.md\\:hidden button:has-text("Уроки")');
  await sleep(600);
  await tap('button:has-text("Начать"), button:has-text("Продолжить"), .bg-gradient-to-r');
  await sleep(800);

  const testsTab = page.locator('button:has-text("Тесты"), button:has-text("תַּרְגִּילִים")').first();
  await tap(testsTab);
  await setBanner('ЭТАП 3: ТРЕНАЖЕР', 'Интерактивная сборка предложений', 'Правильный порядок слов и моментальная проверка грамматики');
  await sleep(1800);

  const opt = page.locator('button[class*="border"]:has-text("אֲנִי"), [class*="rounded-xl"]:has-text("אֲנִי")').first();
  if (await opt.isVisible()) await tap(opt);
  await sleep(1000);

  const checkB = page.locator('button:has-text("Проверить"), button:has-text("Далее")').first();
  if (await checkB.isVisible()) await tap(checkB);
  await waitTill(90.0);

  // 7. (90.0s - 109.0s) ЭТАП 4: ЖИВОЙ ДИАЛОГ И ПРОВЕРКА ПРОИЗНОШЕНИЯ (96%)
  console.log('▶ [90s] Сцена 7: Этап 4 • Живой диалог и проверка произношения');
  const dialTab = page.locator('button:has-text("Диалог"), button:has-text("שִׂיחָה")').first();
  await tap(dialTab);
  await setBanner('ЭТАП 4: ДИАЛОГ', 'Разговорная практика с озвучкой', 'Озвучка реплик учителя: «שָׁלוֹם! מָה נִשְׁמַע?»');
  await waitTill(92.5);

  await setBanner('ОЦЕНКА РЕЧИ', 'Проверка произношения ИИ (96%)', 'Анализ правильных ударений, окончаний и чистоты звуков');
  
  // Внедряем карточку оценки произношения
  await page.evaluate(() => {
    const cont = document.querySelector('[class*="overflow-y-auto"]') || document.body;
    const box = document.createElement('div');
    box.id = 'demo-dial-eval';
    box.style.cssText = `
      background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981;
      border-radius: 18px; padding: 14px; margin: 12px; font-family: sans-serif;
    `;
    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:900;color:#059669;font-size:14px;">✓ Отлично! Вас поняли</span>
        <span style="background:white;color:#2563eb;font-weight:900;padding:3px 10px;border-radius:10px;font-size:13px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">🎙️ Чёткость: 96%</span>
      </div>
      <div style="font-size:15px;font-weight:800;color:#0f172a;direction:rtl;margin-bottom:6px;">«שָׁלוֹם, הַכֹּל בְּסֵדֶר!»</div>
      <div style="font-size:11.5px;color:#047857;line-height:1.4;">🗣️ <b>Рекомендация по произношению:</b> Превосходная чистота звука [שׁ] и правильное ударение на последний слог.</div>
    `;
    cont.appendChild(box);
  });
  await waitTill(109.0);

  // 8. (109.0s - 132.0s) ЭТАП 5: СИМУЛЯТОР ТЕЛЕФОННОГО ЗВОНКА В ЖИЗНЕННЫХ СИТУАЦИЯХ
  console.log('▶ [109s] Сцена 8: Этап 5 • Телефонный звонок в жизненных ситуациях');
  const phoneTab = page.locator('button:has-text("Звонок"), button:has-text("טֶלֶפוֹן")').first();
  await tap(phoneTab);
  await setBanner('ЭТАП 5: ТЕЛЕФОН', 'Симулятор реального звонка', 'Бытовые ситуации: такси 🚕, друг 🤝, курьер 🛵, клиника 🏥');
  await sleep(2000);

  // Прием звонка
  const callB = page.locator('button:has-text("Позвонить"), button:has-text("Начать звонок"), button[class*="bg-emerald"], button[class*="bg-green"]').first();
  if (await callB.isVisible()) await tap(callB);
  await waitTill(114.0);

  await setBanner('ЖИВОЙ РАЗГОВОР', 'Голос в динамике смартфона', 'Преодоление языкового барьера без стресса в повседневных сценариях');
  await waitTill(126.0);

  // Появление подробного отчета Debrief
  await page.evaluate(() => {
    const r = document.createElement('div');
    r.id = 'demo-phone-report';
    r.style.cssText = `
      position: fixed; top: 75px; left: 14px; right: 14px;
      background: white; border-radius: 24px; padding: 18px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3); border: 2.5px solid #3b82f6;
      z-index: 100000; font-family: sans-serif;
    `;
    r.innerHTML = `
      <div style="text-align:center;margin-bottom:12px;">
        <div style="font-size:32px;">🚕 🏆 🎉</div>
        <div style="font-size:16px;font-weight:900;color:#0f172a;">Звонок успешно завершен!</div>
        <div style="font-size:12px;color:#64748b;">Ситуация: Заказ такси и встреча у подъезда</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:8px 4px;text-align:center;">
          <div style="font-size:10px;font-weight:700;color:#64748b;">ИТОГО</div>
          <div style="font-size:17px;font-weight:900;color:#10b981;">94/100</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:8px 4px;text-align:center;">
          <div style="font-size:10px;font-weight:700;color:#64748b;">ГОЛОС</div>
          <div style="font-size:17px;font-weight:900;color:#2563eb;">92%</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:8px 4px;text-align:center;">
          <div style="font-size:10px;font-weight:700;color:#64748b;">ГРАММАТИКА</div>
          <div style="font-size:17px;font-weight:900;color:#8b5cf6;">96%</div>
        </div>
      </div>
      <div style="background:#eff6ff;border-radius:12px;padding:10px;font-size:11.5px;color:#1e40af;line-height:1.4;">
        💡 <b>Разбор диалога:</b> Отличная реакция, согласование рода и числительных без ошибок.
      </div>
    `;
    document.body.appendChild(r);
  });
  await setBanner('DEBRIEF-ОТЧЕТ', 'Детальный разбор телефонного звонка', 'Итоговый балл: 94/100 • Голос 92% • Грамматика 96%');
  await waitTill(132.0);

  // 9. (132.0s - 140.0s) ФИНАЛ: ВСЕ 5 ЭТАПОВ ПРОЙДЕНЫ
  console.log('▶ [132s] Сцена 9: Финал • Все 5 этапов пройдены');
  await page.evaluate(() => {
    const rep = document.getElementById('demo-phone-report');
    if (rep) rep.remove();
    document.querySelectorAll('[class*="h-full w-full"]').forEach((b) => b.classList.add('bg-emerald-500'));
  });
  await setBanner('УРОК ЗАВЕРШЕН', 'Все 5 этапов освоены!', 'Ульпа́на • Говорите на иврите легко и уверенно');
  await waitTill(139.5);

  console.log('💾 Завершение записи и закрытие браузера...');
  await page.close();
  await context.close();
  await browser.close();

  // Находим свежезаписанный файл Playwright
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.webm') && f.startsWith('page@'));
  files.sort((a, b) => fs.statSync(path.join(OUTPUT_DIR, b)).mtimeMs - fs.statSync(path.join(OUTPUT_DIR, a)).mtimeMs);

  if (files.length === 0) {
    throw new Error('Видео screencast не найдено в output dir');
  }

  const rawVideoPath = path.join(OUTPUT_DIR, files[0]);
  console.log('📹 Исходный screencast:', rawVideoPath);

  // Сведение видео и мастер-аудио в MP4 и WebM через ffmpeg
  const finalMp4Path = path.join(OUTPUT_DIR, 'ulpana_full_guide.mp4');
  const finalWebmPath = path.join(OUTPUT_DIR, 'ulpana_mobile_guide.webm');

  console.log('🎬 Сведение видео + чистого голоса диктора + музыки в MP4...');
  const muxMp4 = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', rawVideoPath,
    '-i', masterAudioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalMp4Path,
  ]);

  if (muxMp4.status !== 0) {
    console.error('Ошибка создания MP4:', muxMp4.stderr.toString());
  } else {
    console.log(`🎉 ФИНАЛЬНЫЙ MP4 ГОТОВ: ${finalMp4Path} (${(fs.statSync(finalMp4Path).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('🎬 Создание финального WebM...');
  const muxWebm = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', rawVideoPath,
    '-i', masterAudioPath,
    '-c:v', 'copy',
    '-c:a', 'libvorbis',
    '-b:a', '128k',
    '-shortest',
    finalWebmPath,
  ]);

  if (muxWebm.status !== 0) {
    console.warn('Предупреждение WebM mux:', muxWebm.stderr?.toString()?.slice(0, 150));
  } else {
    console.log(`🎉 ФИНАЛЬНЫЙ WEBM ГОТОВ: ${finalWebmPath} (${(fs.statSync(finalWebmPath).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('🚀 ВСЁ ГОТОВО!');
}

runFullVideoGeneration().catch((err) => {
  console.error('❌ Ошибка генерации видео:', err);
  process.exit(1);
});
