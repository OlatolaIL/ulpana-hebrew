import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const OUTPUT_DIR = path.resolve('./public/demo/tutorials');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Cues для Этапа 5: Диалоги
const STAGE_05_CUES = [
  {
    id: 'intro',
    wavFile: 'tut5_sped_01_intro.wav',
    gapAfterSec: 0.35,
  },
  {
    id: 'barista',
    wavFile: 'tut5_raw_02_barista.wav',
    gapAfterSec: 0.4,
  },
  {
    id: 'student',
    wavFile: 'tut5_raw_03_student.wav',
    gapAfterSec: 0.5,
  },
  {
    id: 'eval',
    wavFile: 'tut5_sped_04_eval.wav',
    gapAfterSec: 0.4,
  },
  {
    id: 'outro',
    wavFile: 'tut5_sped_05_outro.wav',
    gapAfterSec: 0.5,
  },
];

/**
 * Сборка мастер-аудио с косинусным сглаживанием 15ms (устранение щелчков)
 */
async function buildTutorialMasterAudio(outputPath, cues) {
  console.log(`🎙️ Сборка мастер-аудио для туториала (${cues.length} клипов)...`);
  const sampleRate = 44100;
  const numChannels = 2;

  const loadedClips = [];
  for (const cue of cues) {
    const wavPath = path.join(CACHE_DIR, cue.wavFile);
    if (!fs.existsSync(wavPath)) {
      throw new Error(`Аудиоклип не найден в кэше: ${wavPath}`);
    }
    const wavBuf = fs.readFileSync(wavPath);
    const pcmData = wavBuf.subarray(44);
    const clipSamples = Math.floor(pcmData.length / 4);
    const durationSec = clipSamples / sampleRate;

    loadedClips.push({
      ...cue,
      wavPath,
      pcmData,
      clipSamples,
      durationSec,
    });
  }

  // Расчет таймкодов
  let currentTime = 0.3; // Начальная микропауза
  for (const clip of loadedClips) {
    clip.timeSec = currentTime;
    clip.endSec = clip.timeSec + clip.durationSec;
    currentTime = clip.endSec + (clip.gapAfterSec || 0.35);
    console.log(`  🔊 [${clip.timeSec.toFixed(2)}s -> ${clip.endSec.toFixed(2)}s] ${clip.id} (${clip.wavFile}) [${clip.durationSec.toFixed(2)}s]`);
  }

  const totalDurationSec = Math.ceil(currentTime + 0.5);
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  console.log(`⏱️ Итоговый хронометраж аудио: ${totalDurationSec}s (${totalSamples} сэмплов)`);

  const voiceL = new Float32Array(totalSamples);
  const voiceR = new Float32Array(totalSamples);

  // Сглаживание 15ms (de-clicking / raised cosine window)
  const fadeLen = Math.floor(sampleRate * 0.015);
  for (const clip of loadedClips) {
    const startSample = Math.floor(clip.timeSec * sampleRate);
    for (let i = 0; i < clip.clipSamples; i++) {
      const idx = startSample + i;
      if (idx >= totalSamples) break;

      let fade = 1.0;
      if (i < fadeLen) {
        fade = 0.5 * (1 - Math.cos(Math.PI * i / fadeLen));
      } else if (i > clip.clipSamples - fadeLen) {
        fade = 0.5 * (1 - Math.cos(Math.PI * (clip.clipSamples - i) / fadeLen));
      }

      const sL = (clip.pcmData.readInt16LE(i * 4) / 32768.0) * fade;
      const sR = (clip.pcmData.readInt16LE(i * 4 + 2) / 32768.0) * fade;

      voiceL[idx] += sL * 1.25;
      voiceR[idx] += sR * 1.25;
    }
  }

  // Звуковой эффект успеха ИИ (success chime) после ответа студента
  const studentClip = loadedClips.find((c) => c.id === 'student');
  if (studentClip) {
    const chimeStart = Math.floor((studentClip.endSec + 0.05) * sampleRate);
    for (let i = chimeStart; i < chimeStart + Math.floor(sampleRate * 1.2) && i < totalSamples; i++) {
      const t = (i - chimeStart) / sampleRate;
      const decay = Math.exp(-4.5 * t);
      const chime = (Math.sin(2 * Math.PI * 587.33 * t) + Math.sin(2 * Math.PI * 880.00 * t) + Math.sin(2 * Math.PI * 1174.66 * t)) * 0.15 * decay;
      voiceL[i] += chime;
      voiceR[i] += chime;
    }
  }

  // Запись WAV
  const dataSize = totalSamples * numChannels * 2;
  const outBuf = Buffer.alloc(44 + dataSize);

  outBuf.write('RIFF', 0);
  outBuf.writeUInt32LE(36 + dataSize, 4);
  outBuf.write('WAVE', 8);
  outBuf.write('fmt ', 12);
  outBuf.writeUInt32LE(16, 16);
  outBuf.writeUInt16LE(1, 20);
  outBuf.writeUInt16LE(numChannels, 22);
  outBuf.writeUInt32LE(sampleRate, 24);
  outBuf.writeUInt32LE(sampleRate * numChannels * 2, 28);
  outBuf.writeUInt16LE(numChannels * 2, 32);
  outBuf.writeUInt16LE(16, 34);
  outBuf.write('data', 36);
  outBuf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    let sampleL = Math.max(-0.99, Math.min(0.99, voiceL[i]));
    let sampleR = Math.max(-0.99, Math.min(0.99, voiceR[i]));

    outBuf.writeInt16LE(Math.floor(sampleL * 32767), offset);
    outBuf.writeInt16LE(Math.floor(sampleR * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(outputPath, outBuf);
  console.log(`✅ Мастер-аудио сохранено: ${outputPath}`);

  return {
    totalDurationSec,
    clips: loadedClips,
    outputPath,
  };
}

/**
 * Основная функция записи туториала
 */
async function recordStageTutorial(stageNum = 5, version = 'v2') {
  console.log(`\n========================================`);
  console.log(`🎬 ЗАПИСЬ ОБУЧАЮЩЕГО ВИДЕО: ЭТАП ${stageNum} (${version})`);
  console.log(`========================================\n`);

  const stageKey = `stage-0${stageNum}-dialogue`;
  const masterAudioPath = path.resolve(CACHE_DIR, `tut_${stageKey}_${version}_master.wav`);
  const { totalDurationSec, clips } = await buildTutorialMasterAudio(masterAudioPath, STAGE_05_CUES);
  let uiOffsetSec = 0;

  const introClip = clips.find((c) => c.id === 'intro');
  const baristaClip = clips.find((c) => c.id === 'barista');
  const studentClip = clips.find((c) => c.id === 'student');
  const evalClip = clips.find((c) => c.id === 'eval');
  const outroClip = clips.find((c) => c.id === 'outro');

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

  let context;
  let page;
  let recordingStartTime = 0;

  if (version === 'v2') {
    // ВЕРСИЯ v2.0: ЗАПИСЬ НА РЕАЛЬНОМ ЭКРАНЕ http://localhost:3000/lesson/2?stage=5 (R-25)
    console.log('🌟 [v2.0] Активация режима реального экрана приложения (localhost:3000)...');

    console.log('🔥 Прогрев роута http://localhost:3000/#lesson-2/chat перед записью...');
    const warmupContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const warmupPage = await warmupContext.newPage();
    await warmupPage.addInitScript(() => {
      try {
        localStorage.setItem('ulpana_auto_show_guides', 'false');
        localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
        localStorage.setItem('ulpana_show_floating_feedback', 'false');
        localStorage.setItem('ulpana_chat_tips_hidden', 'true');
        localStorage.setItem(
          'ulpana_user_profile',
          JSON.stringify({
            id: 'tut_guest_v2',
            name: 'Ученик',
            gender: 'female',
            showNikkud: true,
            showTranscription: true,
            fontStyle: 'print',
            speechRate: 0.75,
            completedLessons: [1],
            lessonProgress: {
              2: { completedTabs: ['theory', 'vocab', 'exercises', 'essay'] },
            },
          })
        );
      } catch (_) {}
    });
    try {
      await warmupPage.goto('http://localhost:3000/#lesson-2/chat', { waitUntil: 'domcontentloaded' });
      await warmupPage.locator('button:has-text("Ответить по ролям (голос)")').waitFor({ state: 'visible', timeout: 30000 });
    } catch (_) {}
    await warmupPage.close();
    await warmupContext.close();
    console.log('✅ Роут прогрет и готов к съемке без задержек!');

    console.log('🎥 Запуск чистого контекста записи Playwright...');
    recordingStartTime = Date.now();
    context = await browser.newContext({
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

    page = await context.newPage();

    // 1. Настройка localStorage и перехват моков
    await page.addInitScript(() => {
      try {
        localStorage.setItem('ulpana_auto_show_guides', 'false');
        localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
        localStorage.setItem('ulpana_show_floating_feedback', 'false');
        localStorage.setItem('ulpana_chat_tips_hidden', 'true');
        localStorage.setItem(
          'ulpana_user_profile',
          JSON.stringify({
            id: 'tut_guest_v2',
            name: 'Ученик',
            gender: 'female',
            showNikkud: true,
            showTranscription: true,
            fontStyle: 'print',
            speechRate: 0.75,
            completedLessons: [1],
            lessonProgress: {
              2: { completedTabs: ['theory', 'vocab', 'exercises', 'essay'] },
            },
          })
        );
      } catch (_) {}

      // Безопасная инициализация тач-курсора и скрытие dev-оверлеев
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
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.45);
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
            pointer-events: none;
            z-index: 9999999;
            transform: translate(-50%, -50%) scale(1);
            transition: left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.15s ease, opacity 0.25s ease;
            opacity: 0;
          }
          #touch-pointer.active {
            transform: translate(-50%, -50%) scale(0.82);
            background: rgba(37, 99, 235, 0.75);
          }
          .touch-ripple {
            position: fixed;
            width: 38px;
            height: 38px;
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
        `;
        target.appendChild(style);

        const pointer = document.createElement('div');
        pointer.id = 'touch-pointer';
        target.appendChild(pointer);
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

      window.__hideTouch = () => {
        const el = document.getElementById('touch-pointer');
        if (el) el.style.opacity = '0';
      };
    });

    // 2. Перехват API роутов для мгновенного и надежного ответа
    await page.route('**/api/ai/transcribe', async (route) => {
      console.log('  🎯 [MOCK API] Перехвачен вызов /api/ai/transcribe');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          text: 'אֲנִי רוֹצֶה קָפֶה קָטָן, בְּבַקָּשָׁה',
        }),
      });
    });

    await page.route('**/api/ai/dialogue/evaluate', async (route) => {
      console.log('  🎯 [MOCK API] Перехвачен вызов /api/ai/dialogue/evaluate (98% Perfect)');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          assessment: 'perfect',
          isCorrect: true,
          score: 98,
          feedbackRu: 'Отличный заказ кофе! Точная грамматика и вежливая форма בבקשה.',
          pronunciationScore: 98,
          pronunciationFeedbackRu: 'Превосходное звучание гласных и правильное ударение.',
          userSpokenHebrew: 'אֲנִי רוֹצֶה קָפֶה קָטָן, בְּבַקָּשָׁה',
          betterAlternative: null,
        }),
      });
    });

    await page.route('**/api/calls/log', async (route) => {
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.route('**/api/audio/recording**', async (route) => {
      await route.fulfill({ status: 200, json: null });
    });

    page.on('console', (msg) => {
      const txt = msg.text();
      if (!txt.includes('Download the React DevTools')) {
        console.log('  [BROWSER]', msg.type(), txt);
      }
    });
    page.on('pageerror', (err) => console.error('  [BROWSER ERROR]', err.message));

    uiOffsetSec = 0;

    const targetUrl = 'http://localhost:3000/#lesson-2/chat';
    console.log(`🌐 Переход на ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    console.log('⏳ Ожидание появления экрана этапа 5 (кнопка "Ответить по ролям (голос)")...');
    const roleBtn = page.locator('button:has-text("Ответить по ролям (голос)")');
    await roleBtn.waitFor({ state: 'visible', timeout: 25000 });
    const uiReadyTime = Date.now();
    uiOffsetSec = Math.max(0, (uiReadyTime - recordingStartTime) / 1000);
    console.log(`✅ Экран этапа 5 успешно загружен! Смещение предзагрузки: ${uiOffsetSec.toFixed(2)}s (будет отрезано)`);

    // Функция для плавного нажатия на элемент
    const tapElement = async (selector, description) => {
      try {
        const el = page.locator(selector).first();
        await el.waitFor({ state: 'visible', timeout: 10000 });
        const box = await el.boundingBox();
        if (box) {
          const centerX = Math.round(box.x + box.width / 2);
          const centerY = Math.round(box.y + box.height / 2);
          console.log(`  👉 [TOUCH] Нажатие на "${description}" (${centerX}, ${centerY})`);
          try {
            await page.evaluate(({ x, y }) => {
              if (typeof window.__tapTouch === 'function') window.__tapTouch(x, y);
            }, { x: centerX, y: centerY });
          } catch (e) {
            console.warn(`  ⚠️ Не удалось отрисовать курсор:`, e.message);
          }
          await el.click({ force: true });
          return true;
        }
      } catch (err) {
        console.warn(`  ⚠️ Не удалось нажать "${description}":`, err.message);
      }
      return false;
    };

    // ТАЙМЛАЙН ДЕЙСТВИЙ В РЕАЛЬНОМ UI (СИНХРОНИЗИРОВАН С АУДИО ДОРОЖКОЙ)
    console.log('⏳ Запуск синхронизированного сценария в реальном UI...');

    // ШАГ 1: Экран этапа 5 (ListeningView) -> Клик «Ответить по ролям (голос)»
    // introClip: 0.3s -> 6.08s. Кликаем за 0.8с до конца интро (~5.2s)
    const introActionMs = Math.round((introClip.endSec - 0.8) * 1000);
    const elapsed1 = Date.now() - uiReadyTime;
    if (introActionMs > elapsed1) await sleep(introActionMs - elapsed1);

    await tapElement('button:has-text("Ответить по ролям (голос)")', 'Кнопка "Ответить по ролям (голос)"');

    // ШАГ 2: Экран выбора роли (RoleSelectView) -> Клик «Играть за роль Б» (Клиент)
    // Выбираем роль в 6.1s (перед репликой баристы в 6.43s)
    const roleActionMs = Math.round((baristaClip.timeSec - 0.35) * 1000);
    const elapsed2 = Date.now() - uiReadyTime;
    if (roleActionMs > elapsed2) await sleep(roleActionMs - elapsed2);

    await tapElement('button:has-text("Играть за роль Б")', 'Карточка "Клиент (Роль Б)"');

    // ШАГ 3: Бариста произносит реплику (6.43s -> 7.98s)
    console.log('  ☕ Бариста произносит реплику...');
    const micBtn = page.locator('button:has-text("Нажмите и говорите на иврите"), button:has-text("Попробовать снова (голос)")').first();
    await micBtn.waitFor({ state: 'visible', timeout: 12000 });

    // Подводим тач-курсор к кнопке микрофона заранее
    const box = await micBtn.boundingBox();
    if (box) {
      const cx = Math.round(box.x + box.width / 2);
      const cy = Math.round(box.y + box.height / 2);
      try {
        await page.evaluate(({ x, y }) => {
          if (typeof window.__moveTouch === 'function') window.__moveTouch(x, y);
        }, { x: cx, y: cy });
      } catch (_) {}
    }

    // ШАГ 4: Зажатие микрофона и реплика ученика (studentClip: 8.38s -> 10.03s)
    const studentActionMs = Math.round((studentClip.timeSec - 0.1) * 1000);
    const elapsed3 = Date.now() - uiReadyTime;
    if (studentActionMs > elapsed3) await sleep(studentActionMs - elapsed3);

    console.log('  🎙️ Нажатие кнопки микрофона для ответа...');
    await tapElement(
      'button:has-text("Нажмите и говорите на иврите"), button:has-text("Попробовать снова (голос)")',
      'Кнопка записи микрофона'
    );

    // Звучит фраза ученика
    const studentDurationMs = Math.round(studentClip.durationSec * 1000);
    await sleep(studentDurationMs);

    // ШАГ 5: Завершение записи и проверка ответа
    console.log('  ⏹️ Завершение записи микрофона...');
    await tapElement(
      'button:has-text("Готово, проверить ответ")',
      'Кнопка "Готово, проверить ответ"'
    );

    // Ожидание появления реальной карточки оценки 98% (evalClip: 10.53s -> 15.35s)
    console.log('  ✨ Ожидание появления оценки ИИ...');
    try {
      const badge = page.locator('span:has-text("98%"), :has-text("Отличный заказ кофе"), :has-text("Отлично!")').first();
      await badge.waitFor({ state: 'visible', timeout: 8000 });
      console.log('  🎉 Бейдж 98% успешно отобразился в DOM!');
    } catch (_) {}

    // ШАГ 6: Клик по кнопке перехода к завершению / следующей реплике (outroClip: 15.75s -> 21.28s)
    const outroActionMs = Math.round((outroClip.timeSec + 0.8) * 1000);
    const elapsed4 = Date.now() - uiReadyTime;
    if (outroActionMs > elapsed4) await sleep(outroActionMs - elapsed4);

    console.log('  ➡️ Нажатие кнопки перехода к следующему этапу...');
    await tapElement(
      'button:has-text("Финальная реплика собеседника и завершение →"), button:has-text("Следующая реплика"), button:has-text("Завершить диалог"), button:has-text("🎉 Завершить диалог и зачесть этап")',
      'Кнопка "Следующая реплика / Завершение"'
    );

    // Финальная выдержка ровно до конца хронометража (totalDurationSec)
    const totalMs = Math.round(totalDurationSec * 1000);
    const elapsedFinal = Date.now() - uiReadyTime;
    if (totalMs > elapsedFinal) {
      await sleep(totalMs - elapsedFinal);
    }

  } else {
    // ВЕРСИЯ v1.0 (Устаревший HTML-мок)
    const sceneHtmlPath = path.resolve(`./growth/tutorials/${stageKey}/${version}/index.html`);
    if (!fs.existsSync(sceneHtmlPath)) {
      throw new Error(`Файл сцены не найден: ${sceneHtmlPath}`);
    }

    const visualTimings = {
      startTap: Math.round((introClip.endSec - 0.7) * 1000),
      scenePractice: Math.round((introClip.endSec + 0.1) * 1000),
      micTap: Math.round((baristaClip.endSec + 0.25) * 1000),
      sceneCompleted: Math.round((evalClip.endSec + 0.15) * 1000),
      nextTap: Math.round((outroClip.timeSec + 1.8) * 1000),
    };

    await page.addInitScript((timings) => {
      window.__PLAYWRIGHT_MANUAL_START__ = true;
      window.__TUTORIAL_TIMINGS__ = timings;
    }, visualTimings);

    const sceneUrl = `file:///${sceneHtmlPath.replace(/\\/g, '/')}`;
    console.log(`🌐 Загрузка сцены: ${sceneUrl}...`);
    await page.goto(sceneUrl, { waitUntil: 'domcontentloaded' });
    await sleep(600);

    await page.evaluate((timings) => {
      window.startTutorialTimeline(timings);
    }, visualTimings);

    await sleep(Math.floor(totalDurationSec * 1000));
  }

  console.log('🛑 Завершение записи сцены...');
  const videoObj = page.video();
  await page.close();
  await context.close();
  await browser.close();

  let rawVideoPath;
  if (videoObj) {
    try {
      rawVideoPath = await videoObj.path();
    } catch (_) {}
  }
  if (!rawVideoPath || !fs.existsSync(rawVideoPath)) {
    const files = fs
      .readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith('.webm'))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    if (!files.length) {
      throw new Error('Playwright не создал файл .webm в ' + OUTPUT_DIR);
    }
    rawVideoPath = path.join(OUTPUT_DIR, files[0].name);
  }
  const finalMp4Path = path.resolve(OUTPUT_DIR, `stage_0${stageNum}_dialogue_${version}.mp4`);

  console.log(`🎬 Сведение видео (${rawVideoPath}) со смещением ${uiOffsetSec.toFixed(2)}s и мастер-аудио в ${finalMp4Path}...`);

  const ffmpegArgs = [
    '-y',
    '-i', rawVideoPath,
    '-i', masterAudioPath,
    ...(uiOffsetSec > 0.05
      ? ['-filter_complex', `[0:v]trim=start=${uiOffsetSec.toFixed(3)},setpts=PTS-STARTPTS[v]`, '-map', '[v]', '-map', '1:a']
      : ['-map', '0:v', '-map', '1:a']),
    '-t', totalDurationSec.toString(),
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    finalMp4Path,
  ];

  const ffmpegRes = cp.spawnSync(FFMPEG_PATH, ffmpegArgs);

  if (ffmpegRes.status !== 0) {
    console.error('Ошибка FFmpeg:', ffmpegRes.stderr.toString());
    throw new Error('FFmpeg не смог собрать финальный MP4');
  }

  // Очистка временного WebM
  if (fs.existsSync(rawVideoPath)) {
    try { fs.unlinkSync(rawVideoPath); } catch (_) {}
  }

  const finalStat = fs.statSync(finalMp4Path);
  console.log(`\n🎉 ОБУЧАЮЩЕЕ ВИДЕО ДЛЯ ЭТАПА ${stageNum} (v2.0) УСПЕШНО СОЗДАНО!`);
  console.log(`📁 Путь: ${finalMp4Path}`);
  console.log(`📦 Размер: ${(finalStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`⏱️ Хронометраж: ${totalDurationSec}s (9:16 vertical, 390x844 @2x)`);

  // Контрольные кадры для верификации (R-13)
  const framesDir = path.resolve(OUTPUT_DIR, 'verification_frames');
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
  const checkTimes = [0.5, 11.5, 20.0];
  for (const t of checkTimes) {
    const framePath = path.join(framesDir, `frame_${t.toFixed(1)}s.jpg`);
    cp.spawnSync(FFMPEG_PATH, ['-y', '-ss', t.toString(), '-i', finalMp4Path, '-frames:v', '1', '-q:v', '2', framePath]);
    console.log(`📸 Контрольный кадр (${t}s): ${framePath}`);
  }

  // Обновляем registry.json
  const registryPath = path.resolve('./growth/tutorials/registry.json');
  if (fs.existsSync(registryPath)) {
    const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const stageEntry = reg.stages?.[stageKey];
    if (stageEntry) {
      stageEntry.status = 'ready';
      stageEntry.durationSec = totalDurationSec;
      stageEntry.outputFile = `public/demo/tutorials/stage_0${stageNum}_dialogue_${version}.mp4`;
      stageEntry.fileSizeBytes = finalStat.size;
      stageEntry.lastGenerated = new Date().toISOString();
      fs.writeFileSync(registryPath, JSON.stringify(reg, null, 2), 'utf8');
      console.log(`📋 registry.json успешно обновлен.`);
    }
  }

  return finalMp4Path;
}

// Парсинг аргументов CLI
const args = process.argv.slice(2);
let stage = 5;
let ver = 'v2';

for (const arg of args) {
  if (arg.startsWith('--stage=')) stage = parseInt(arg.split('=')[1], 10) || 5;
  if (arg.startsWith('--version=')) ver = arg.split('=')[1] || 'v2';
}

recordStageTutorial(stage, ver).catch((err) => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
