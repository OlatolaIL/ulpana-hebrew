import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const OUTPUT_DIR = path.resolve('./public/demo/lessons');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function recordLesson07Video(promoCode = 'YOUTUBE', variantName = 'master') {
  console.log('\n======================================================');
  console.log(`🎬 ЗАПИСЬ ВИДЕО ДЛЯ УРОКА 7: [${promoCode}] (${variantName})`);
  console.log('======================================================\n');

  const masterAudioPath = path.resolve(CACHE_DIR, 'l07_master_audio.wav');
  if (!fs.existsSync(masterAudioPath)) {
    throw new Error(`Мастер-аудио не найдено: ${masterAudioPath}`);
  }

  const wavBuf = fs.readFileSync(masterAudioPath);
  const dataSize = wavBuf.readUInt32LE(40);
  const totalDurationSec = Math.ceil(dataSize / (44100 * 2 * 2));
  console.log(`⏱️ Длительность мастер-аудио: ${totalDurationSec} секунд`);

  console.log('📱 Запуск Playwright Chromium (390x844 @2x, 9:16 vertical)...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ],
  });

  console.log('🎥 Запуск контекста видеозаписи...');
  const recordingStartTime = Date.now();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    permissions: ['microphone'],
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();

  // Настройка localStorage и оверлея
  await page.addInitScript((code) => {
    try {
      localStorage.setItem('ulpana_auto_show_guides', 'false');
      localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
      localStorage.setItem('ulpana_show_floating_feedback', 'false');
      localStorage.setItem('ulpana_chat_tips_hidden', 'true');
      localStorage.setItem(
        'hebrew_app_profile_v1',
        JSON.stringify({
          name: 'Student',
          gender: 'male',
          isLoggedIn: true,
          showNikkud: true,
          showTranscription: true,
          fontStyle: 'print',
          speechRate: 0.75,
          completedLessons: [1, 2, 3, 4, 5, 6],
          lessonProgress: {
            7: { completedTabs: ['theory', 'vocab', 'exercises', 'essay'] },
          },
        })
      );
    } catch (_) {}

    window.__CURRENT_PROMO__ = code;
    window.__ensureTouchPointer = () => {
      if (document.getElementById('touch-pointer')) return;
      const target = document.body || document.documentElement;
      if (!target) return;

      const style = document.createElement('style');
      style.id = 'touch-pointer-style';
      style.textContent = `
        nextjs-portal,
        [data-nextjs-dev-overlay],
        [data-nextjs-dialog-overlay] {
          display: none !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
        #touch-pointer {
          position: fixed;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.45);
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
          pointer-events: none;
          z-index: 9999999;
          transform: translate(-50%, -50%) scale(1);
          transition: left 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.15s ease, opacity 0.25s ease;
          opacity: 0;
        }
        #touch-pointer.active {
          transform: translate(-50%, -50%) scale(0.82);
          background: rgba(37, 99, 235, 0.75);
        }
        .touch-ripple {
          position: fixed;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          pointer-events: none;
          z-index: 9999998;
          transform: translate(-50%, -50%) scale(1);
          animation: touch-ripple-anim 0.55s ease-out forwards;
        }
        @keyframes touch-ripple-anim {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
        #promo-cta-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(8px);
          z-index: 9999990;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
        }
        #promo-cta-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
      `;
      target.appendChild(style);

      const pointer = document.createElement('div');
      pointer.id = 'touch-pointer';
      target.appendChild(pointer);

      const cta = document.createElement('div');
      cta.id = 'promo-cta-overlay';
      cta.innerHTML = `
        <div style="font-size: 42px; margin-bottom: 8px;">🏢 🔑 🇮🇱</div>
        <div style="color: #60a5fa; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Урок 7 • Аренда квартиры</div>
        <div style="color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.25; margin-bottom: 16px;">Говори на иврите уверенно!</div>
        
        <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; padding: 14px 18px; width: 100%; max-width: 320px; margin-bottom: 20px; text-align: left;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">СЛОВАРЬ ЭТОГО УРОКА:</div>
          <div style="color: #f8fafc; font-size: 14px; line-height: 1.65;">
            🏠 <b style="direction: rtl; unicode-bidi: embed;">דִּירָה</b> [дирá] — квартира<br/>
            🚪 <b style="direction: rtl; unicode-bidi: embed;">שְׁלוֹשָׁה חֲדָרִים</b> — 3 комнаты<br/>
            🧊 <b style="direction: rtl; unicode-bidi: embed;">מְקָרֵר</b> [мэкарэ́р] — холодильник<br/>
            🛏️ <b style="direction: rtl; unicode-bidi: embed;">מִיטָּה</b> [митá] — кровать
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 14px; padding: 12px 20px; width: 100%; max-width: 320px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5);">
          <div style="color: #bfdbfe; font-size: 12px; font-weight: 600;">ПРОМОКОД НА 7 ДНЕЙ ПРЕМИУМА:</div>
          <div id="promo-code-display" style="color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 2px 0;">${window.__CURRENT_PROMO__ || 'YOUTUBE'}</div>
          <div style="color: #93c5fd; font-size: 11px;">Ссылка на этот урок под видео 👇</div>
        </div>
      `;
      target.appendChild(cta);
    };

    window.__moveTouch = (x, y) => {
      window.__ensureTouchPointer();
      const el = document.getElementById('touch-pointer');
      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.opacity = '1';
      }
    };

    window.__tapTouch = (x, y) => {
      window.__ensureTouchPointer();
      window.__moveTouch(x, y);
      const el = document.getElementById('touch-pointer');
      if (el) {
        el.classList.add('active');
        const target = document.body || document.documentElement;
        if (target) {
          const ripple = document.createElement('div');
          ripple.className = 'touch-ripple';
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          target.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
        setTimeout(() => el.classList.remove('active'), 250);
      }
    };

    window.__showCta = (promo) => {
      window.__ensureTouchPointer();
      const el = document.getElementById('promo-cta-overlay');
      const codeEl = document.getElementById('promo-code-display');
      if (codeEl) codeEl.textContent = promo || window.__CURRENT_PROMO__ || 'YOUTUBE';
      if (el) el.classList.add('active');
    };
  }, promoCode);

  // Моки авторизации и AI-оценки
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      json: { authenticated: true, user: { id: 'vip-user', name: 'Student', email: 'test@ulpana.me' } },
    });
  });

  await page.route('**/api/admin/access-rules', async (route) => {
    await route.fulfill({ status: 200, json: { ok: true, isEarlyAccessFree: true, lessonRules: {} } });
  });

  await page.route('**/api/ai/transcribe', async (route) => {
    console.log('  🎯 [MOCK API] /api/ai/transcribe');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: 'אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים. יֵשׁ מְקָרֵר?',
      }),
    });
  });

  await page.route('**/api/ai/dialogue/evaluate', async (route) => {
    console.log('  🎯 [MOCK API] /api/ai/dialogue/evaluate (98% Perfect)');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        assessment: 'perfect',
        isCorrect: true,
        score: 98,
        feedbackRu: 'Отличный ответ! Точный выбор комнат и проверка холодильника.',
        pronunciationScore: 98,
        pronunciationFeedbackRu: 'Превосходное звучание гласных и правильное ударение.',
        userSpokenHebrew: 'אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים. יֵשׁ מְקָרֵר?',
      }),
    });
  });

  await page.route('**/api/calls/log', async (route) => {
    await route.fulfill({ status: 200, json: { ok: true } });
  });

  // Загрузка Урока 7: Словарь
  const targetUrl = 'http://localhost:3000/#lesson-7/vocab';
  console.log(`🌐 Загрузка страницы: ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('button[title*="2. Словарь"]').first().waitFor({ state: 'visible', timeout: 35000 });
  await sleep(1200);

  const uiReadyTime = Date.now();
  const uiOffsetSec = Math.max(0, (uiReadyTime - recordingStartTime) / 1000);
  console.log(`✅ UI готов к съемке! Смещение предзагрузки: ${uiOffsetSec.toFixed(2)}s`);

  const tapElement = async (selector, description, timeout = 6000) => {
    try {
      const el = page.locator(selector).first();
      await el.waitFor({ state: 'visible', timeout });
      const box = await el.boundingBox();
      if (box) {
        const centerX = Math.round(box.x + box.width / 2);
        const centerY = Math.round(box.y + box.height / 2);
        console.log(`  👉 [TOUCH] "${description}" (${centerX}, ${centerY})`);
        try {
          await page.evaluate(({ x, y }) => {
            if (typeof window.__tapTouch === 'function') window.__tapTouch(x, y);
          }, { x: centerX, y: centerY });
        } catch (_) {}
        await el.click({ force: true });
        return true;
      }
    } catch (err) {
      console.warn(`  ⚠️ Не удалось нажать "${description}":`, err.message);
    }
    return false;
  };

  const waitTo = async (targetSec) => {
    const targetMs = Math.round(targetSec * 1000);
    const elapsed = Date.now() - uiReadyTime;
    if (targetMs > elapsed) await sleep(targetMs - elapsed);
  };

  // ========================================================
  // ПОСЕКУНДНЫЙ ТАЙМЛАЙН СИНХРОНИЗАЦИИ
  // ========================================================

  // АКТ 1: СЛОВАРЬ (0:00 - 0:11)
  console.log('📖 [АКТ 1] Словарь: Тапы по карточкам слов...');
  await waitTo(6.8);
  await tapElement(':has-text("דִּירָה"), [data-word="דִּירָה"]', 'Карточка "דִּירָה"');

  await waitTo(8.4);
  await tapElement(':has-text("חֲדָרִים"), :has-text("חֶדֶר")', 'Карточка "חֲדָרִים"');

  await waitTo(10.5);
  await tapElement(':has-text("מְקָרֵר")', 'Карточка "מְקָרֵר"');

  // АКТ 2: ДИАЛОГ (0:12 - 0:26)
  await waitTo(12.0);
  console.log('💬 [АКТ 2] Переход на вкладку 5. Диалог...');
  await tapElement('button[title*="5. Диалог"]', 'Вкладка "5. Диалог"');
  await sleep(600);

  // Клик «Ответить по ролям»
  await tapElement('button:has-text("Ответить по ролям")', 'Кнопка "Ответить по ролям"');
  await sleep(600);

  // Клик «Играть за роль Б» (Арендатор)
  await tapElement('button:has-text("Играть за роль Б"), button:has-text("Играть за роль")', 'Выбор роли ученика');

  // Нажатие микрофона в 18.5s
  await waitTo(18.5);
  console.log('🎙️ [АКТ 2] Нажатие микрофона и ответ ученика...');
  await tapElement(
    'button:has-text("Нажмите и говорите на иврите"), button:has-text("Попробовать снова (голос)")',
    'Кнопка микрофона'
  );

  // Завершение ответа в 21.4s
  await waitTo(21.4);
  console.log('⏹️ [АКТ 2] Завершение записи и отправка на оценку...');
  await tapElement('button:has-text("Готово, проверить ответ")', 'Кнопка проверки ответа');

  // Ожидание бейджа 98%
  try {
    const badge = page.locator(':has-text("98%"), :has-text("Отлично")').first();
    await badge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('  ✨ Оценка 98% успешно отобразилась!');
  } catch (_) {}

  // АКТ 3: ЗВОНОК С ИИ (0:26 - 0:39)
  await waitTo(26.8);
  console.log('📞 [АКТ 3] Переход на вкладку 6. Звонок...');
  await tapElement('button[title*="6. Звонок"]', 'Вкладка "6. Звонок"');
  await sleep(800);

  // Тап по кнопке запуска звонка
  await tapElement(
    'button:has-text("Позвонить"), button:has-text("Начать звонок"), button:has-text("Позвонить арендодателю"), button[aria-label*="звонок"]',
    'Кнопка старта звонка'
  );

  // Эли отвечает в трубке (35.5s)
  await waitTo(35.5);
  console.log('🟢 [АКТ 3] Активный звонок с Эли...');

  // АКТ 4: ФИНАЛ И CTA (0:39 - 0:47)
  await waitTo(39.2);
  console.log(`🎁 [АКТ 4] Показ финального промо-оверлея [${promoCode}]...`);
  await page.evaluate((code) => {
    window.__showCta(code);
  }, promoCode);

  await waitTo(totalDurationSec);

  console.log('🛑 Завершение видеозаписи...');
  await page.close();
  await context.close();
  await browser.close();

  const webmFiles = fs.readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith('.webm'))
    .map((f) => ({
      name: f,
      fullPath: path.join(OUTPUT_DIR, f),
      time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  if (!webmFiles.length) {
    throw new Error('WebM файл не найден');
  }

  const rawVideoPath = webmFiles[0].fullPath;
  const finalMp4Filename = `lesson_07_${variantName}.mp4`;
  const finalMp4Path = path.resolve(OUTPUT_DIR, finalMp4Filename);

  console.log(`🎞️ Сведение мастер-видео MP4: ${finalMp4Filename}...`);
  const ffmpegArgs = [
    '-y',
    '-ss', uiOffsetSec.toFixed(3),
    '-i', rawVideoPath,
    '-i', masterAudioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', totalDurationSec.toString(),
    finalMp4Path,
  ];

  const res = cp.spawnSync(FFMPEG_PATH, ffmpegArgs);
  if (res.status !== 0) {
    throw new Error(`FFmpeg error: ${res.stderr?.toString()}`);
  }

  // Очистка сырого webm
  try { fs.unlinkSync(rawVideoPath); } catch (_) {}

  const stat = fs.statSync(finalMp4Path);
  console.log(`\n🎉 ГОТОВО: ${finalMp4Filename} (${(stat.size / 1024 / 1024).toFixed(2)} MB, ${totalDurationSec} сек)`);
  return finalMp4Path;
}

if (process.argv[1]?.endsWith('record_lesson_07_video.mjs')) {
  recordLesson07Video('YOUTUBE', 'youtube_shorts').catch((err) => {
    console.error('❌ Ошибка записи:', err);
    process.exit(1);
  });
}

export { recordLesson07Video };
