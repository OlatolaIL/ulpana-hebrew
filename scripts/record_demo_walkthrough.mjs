import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Загрузка конфигурации видео
const configPath = path.resolve('./scripts/demo_config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const OUTPUT_DIR = path.resolve(config.outputDir || './public/demo');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Вспомогательная задержка
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runRecording() {
  console.log('🚀 Запуск генератора видео-шпаргалки...');
  console.log(`📱 Разрешение: ${config.viewport.width}x${config.viewport.height} (Mobile 9:16)`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ],
  });

  const context = await browser.newContext({
    viewport: {
      width: config.viewport.width,
      height: config.viewport.height,
    },
    deviceScaleFactor: config.viewport.deviceScaleFactor || 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: {
        width: config.viewport.width,
        height: config.viewport.height,
      },
    },
  });

  const page = await context.newPage();

  // Предотвращаем мешающие всплывающие окна
  await page.addInitScript(() => {
    localStorage.setItem('ulpana_auto_show_guides', 'false');
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
    localStorage.setItem('ulpana_show_floating_feedback', 'false');
    localStorage.setItem('ulpana_chat_tips_hidden', 'true');
  });

  console.log(`🌐 Переход на ${config.url}...`);
  await page.goto(config.url, { waitUntil: 'networkidle', timeout: 20000 });

  // Внедряем стили и слой аннотаций (шпаргалки) и виртуального пальца (touch indicator)
  await page.evaluate(() => {
    // 1. Стили оверлея и курсора касания
    const style = document.createElement('style');
    style.id = 'demo-injected-styles';
    style.innerHTML = `
      #demo-overlay-card {
        position: fixed;
        bottom: 16px;
        left: 12px;
        right: 12px;
        z-index: 999999;
        background: rgba(15, 23, 42, 0.88);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1.5px solid rgba(255, 255, 255, 0.18);
        border-radius: 20px;
        padding: 12px 14px;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6), 0 0 25px rgba(59, 130, 246, 0.25);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        animation: demoSlideUp 0.4s ease-out;
      }
      @keyframes demoSlideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #demo-touch-dot {
        position: fixed;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(37, 99, 235, 0.2) 70%, transparent 100%);
        border: 2px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
        pointer-events: none;
        z-index: 1000000;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.18s ease-out, opacity 0.25s ease-out;
        opacity: 0;
      }
      #demo-touch-dot.active {
        transform: translate(-50%, -50%) scale(1.1);
        opacity: 1;
      }
      #demo-touch-dot.tap {
        transform: translate(-50%, -50%) scale(0.85);
      }
    `;
    document.head.appendChild(style);

    // 2. DOM-элемент курсора касания
    const touchDot = document.createElement('div');
    touchDot.id = 'demo-touch-dot';
    document.body.appendChild(touchDot);

    // 3. DOM-элемент плашки подсказок
    const card = document.createElement('div');
    card.id = 'demo-overlay-card';
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
        <span id="demo-badge" style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 2.5px 8px; border-radius: 999px;">ШПАРГАЛКА</span>
        <span id="demo-step-num" style="font-size: 11px; font-weight: 700; color: #94a3b8;">УЛЬПАНА</span>
      </div>
      <div id="demo-title" style="font-size: 14px; font-weight: 700; color: #f8fafc; line-height: 1.25; margin-bottom: 2px;">Загрузка...</div>
      <div id="demo-subtitle" style="font-size: 11.5px; color: #cbd5e1; line-height: 1.35; font-weight: 400;">Подготовка видео...</div>
    `;
    document.body.appendChild(card);

    // Глобальные функции для управления из Playwright
    window.__setDemoOverlay = (badge, title, subtitle, stepNum = '') => {
      document.getElementById('demo-badge').innerText = badge;
      document.getElementById('demo-title').innerText = title;
      document.getElementById('demo-subtitle').innerText = subtitle;
      document.getElementById('demo-step-num').innerText = stepNum;
    };

    window.__animateTouch = (x, y, isTap = true) => {
      const dot = document.getElementById('demo-touch-dot');
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.classList.add('active');
      if (isTap) {
        dot.classList.add('tap');
        setTimeout(() => dot.classList.remove('tap'), 180);
      }
      setTimeout(() => dot.classList.remove('active'), 450);
    };
  });

  // Вспомогательная функция визуального тапа
  async function visualTap(target, description = '') {
    try {
      let locator = null;
      if (typeof target === 'string') {
        locator = page.locator(target).first();
      } else if (target && typeof target.boundingBox === 'function') {
        locator = target;
      }

      if (locator) {
        await locator.waitFor({ state: 'visible', timeout: 7000 }).catch(() => {});
        const box = await locator.boundingBox();
        if (box) {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await page.evaluate(({ px, py }) => window.__animateTouch(px, py, true), { px: x, py: y });
          await sleep(150);
          await locator.click({ force: true }).catch(async () => {
            await page.mouse.click(x, y);
          });
          return;
        }
      } else if (target && typeof target.x === 'number') {
        await page.evaluate(({ px, py }) => window.__animateTouch(px, py, true), { px: target.x, py: target.y });
        await sleep(150);
        await page.mouse.click(target.x, target.y);
      }
    } catch (e) {
      console.warn(`[visualTap] предупреждение для ${description}:`, e.message);
    }
  }

  // Обновление плашки
  async function updateOverlay(sceneKey, extraSubtitle = '') {
    const s = config.scenes[sceneKey];
    if (!s) return;
    await page.evaluate(
      ({ badge, title, subtitle, extra }) => {
        window.__setDemoOverlay(badge, title, extra || subtitle);
      },
      { badge: s.badge, title: s.title, subtitle: s.subtitle, extra: extraSubtitle }
    );
  }

  // ==========================================
  // СЦЕНА 1: Интро и открытие Урока 1
  // ==========================================
  console.log('🎬 Сцена 1: Интро и старт Урока 1...');
  await updateOverlay('intro');
  await sleep(2500);

  // Нажимаем на карточку урока на карте уроков
  const startLessonBtn = page.locator('button:has-text("Начать"), button:has-text("Продолжить"), .bg-gradient-to-r').first();
  await visualTap(startLessonBtn, 'Нажатие на карточку Урока 1');
  await sleep(1500);

  // ==========================================
  // СЦЕНА 2: Этап 1 — Теория (Интерактивный конспект)
  // ==========================================
  console.log('📖 Сцена 2: Этап 1 — Теория...');
  await updateOverlay('stage1_theory');
  await sleep(1500);

  // Плавный скролл конспекта
  await page.mouse.wheel(0, 300);
  await sleep(1200);

  // Тап по кнопке озвучки фразы
  const audioBtn = page.locator('button:has(.lucide-volume-2)').first();
  if (await audioBtn.isVisible()) {
    await visualTap(audioBtn, 'Воспроизведение озвучки фразы');
    await sleep(1800);
  }

  await page.mouse.wheel(0, -300);
  await sleep(800);

  // ==========================================
  // СЦЕНА 3: Шрифты (Печать vs Рукописный) и Огласовки (Никудот)
  // ==========================================
  console.log('✍️ Сцена 3: Переключение шрифтов и огласовок...');
  await updateOverlay('controls_fonts_nikkud', 'Тап по кнопке דפוס / כתב переключает текст на рукописный шрифт');
  await sleep(1200);

  // Тап на кнопку переключения шрифта (דפוס / כתב)
  const fontToggleBtn = page.locator('button:has-text("דפוס"), button:has-text("כתב")').first();
  await visualTap(fontToggleBtn, 'Переключение на рукописный шрифт');
  await sleep(2500);

  // Обратный тап на печатный
  await updateOverlay('controls_fonts_nikkud', 'Возврат к четкому печатному шрифту (דפוס)');
  await visualTap(fontToggleBtn, 'Возврат на печатный');
  await sleep(1500);

  // Открытие настроек для демонстрации огласовок
  await updateOverlay('controls_fonts_nikkud', 'Отключение огласовок (никудот) для тренировки беглого чтения');
  const settingsBtn = page.locator('button[title*="Настройки обучения"], button:has(.lucide-settings)').first();
  if (await settingsBtn.isVisible()) {
    await visualTap(settingsBtn, 'Открытие настроек');
    await sleep(1200);

    // Находим чекбокс огласовок
    const nikkudCheckbox = page.locator('label:has-text("Показывать огласовки") input[type="checkbox"]').first();
    if (await nikkudCheckbox.isVisible()) {
      await visualTap(nikkudCheckbox, 'Выключение огласовок');
      await sleep(1000);
    }

    // Закрываем настройки (крестик)
    const closeSettings = page.locator('button:has(.lucide-x)').first();
    if (await closeSettings.isVisible()) {
      await visualTap(closeSettings, 'Закрытие настроек');
      await sleep(1500);
    }

    // Показываем текст без огласовок
    await sleep(1500);

    // Включаем огласовки обратно
    await visualTap(settingsBtn, 'Открытие настроек');
    await sleep(800);
    if (await nikkudCheckbox.isVisible()) {
      await visualTap(nikkudCheckbox, 'Включение огласовок обратно');
      await sleep(800);
    }
    if (await closeSettings.isVisible()) {
      await visualTap(closeSettings, 'Закрытие настроек');
      await sleep(1000);
    }
  }

  // ==========================================
  // СЦЕНА 4: Этап 2 — Словарь и Умные карточки (SM-2)
  // ==========================================
  console.log('🗂️ Сцена 4: Этап 2 — Словарь и Карточки...');
  // Кликаем по вкладке "Слова" (2-й сегмент)
  const vocabTab = page.locator('button:has-text("Слова"), button:has-text("מִילִּים")').first();
  await visualTap(vocabTab, 'Переход на вкладку Слова');
  await updateOverlay('stage2_vocabulary');
  await sleep(2000);

  // Скроллим карточки слов
  await page.mouse.wheel(0, 250);
  await sleep(1500);

  // Запуск тренажера карточек
  const trainCardsBtn = page.locator('button:has-text("Тренировать карточки"), button:has-text("Учить карточки")').first();
  if (await trainCardsBtn.isVisible()) {
    await updateOverlay('flashcards_trainer', 'Умный алгоритм интервальных повторений SM-2');
    await visualTap(trainCardsBtn, 'Запуск карточек');
    await sleep(2000);

    // Переворот карточки по тапу
    const flashcardFace = page.locator('.cursor-pointer, [class*="perspective"]').first();
    await visualTap(flashcardFace, 'Переворот карточки');
    await sleep(2000);

    // Оценка запоминания (кнопка SM-2)
    const easyBtn = page.locator('button:has-text("Легко"), button:has-text("Помню"), button:has-text("Хорошо")').first();
    if (await easyBtn.isVisible()) {
      await visualTap(easyBtn, 'Оценка карточки: Легко');
      await sleep(1500);
    }

    // Закрываем тренажер карточек
    const closeCardsBtn = page.locator('button:has(.lucide-x)').first();
    if (await closeCardsBtn.isVisible()) {
      await visualTap(closeCardsBtn, 'Выход из карточек обратно в урок');
      await sleep(1000);
    }
  }

  // ==========================================
  // СЦЕНА 5: Этап 3 — Интерактивные тесты
  // ==========================================
  console.log('🧩 Сцена 5: Этап 3 — Тесты...');
  const testsTab = page.locator('button:has-text("Тесты"), button:has-text("תַּרְגִּילִים")').first();
  await visualTap(testsTab, 'Переход на вкладку Тесты');
  await updateOverlay('stage3_exercises');
  await sleep(2000);

  // Кликаем по вариантам ответа в тесте
  const exerciseOption = page.locator('button[class*="border"]:has-text("אֲנִי"), button[class*="border"]:has-text("Я"), [class*="rounded-xl"]:has-text("אֲנִי")').first();
  if (await exerciseOption.isVisible()) {
    await visualTap(exerciseOption, 'Выбор варианта');
    await sleep(1200);
  }

  // Нажимаем кнопку Проверить
  const checkAnswerBtn = page.locator('button:has-text("Проверить"), button:has-text("Далее")').first();
  if (await checkAnswerBtn.isVisible()) {
    await visualTap(checkAnswerBtn, 'Проверка ответа');
    await sleep(1800);
  }

  // ==========================================
  // СЦЕНА 6: Этап 4 — Диалог с озвучкой и проверкой произношения
  // ==========================================
  console.log('🗣️ Сцена 6: Этап 4 — Диалог...');
  const dialogueTab = page.locator('button:has-text("Диалог"), button:has-text("שִׂיחָה")').first();
  await visualTap(dialogueTab, 'Переход на вкладку Диалог');
  await updateOverlay('stage4_dialogue', 'Озвучка реплик собеседника и разбор фраз');
  await sleep(2000);

  // Воспроизводим реплику собеседника (кнопка динамика)
  const dialogueSpeakerBtn = page.locator('button:has(.lucide-volume-2)').first();
  if (await dialogueSpeakerBtn.isVisible()) {
    await visualTap(dialogueSpeakerBtn, 'Озвучка реплики собеседника');
    await sleep(2500);
  }

  // Переключаемся в режим практики или отправляем ответ
  const practiceModeBtn = page.locator('button:has-text("Практика"), button:has-text("Ответить")').first();
  if (await practiceModeBtn.isVisible()) {
    await visualTap(practiceModeBtn, 'Включение режима ответа');
    await sleep(1200);
  }

  // Демонстрация оценки произношения
  await updateOverlay('stage4_dialogue', '🎙️ Произношение: 96% • Анализ ударений, окончаний и чистоты звуков');
  
  // Внедряем визуальный блок эталонной оценки произношения для наглядности шпаргалки
  await page.evaluate(() => {
    const chatContainer = document.querySelector('[class*="overflow-y-auto"]');
    if (chatContainer) {
      const evalBox = document.createElement('div');
      evalBox.id = 'demo-eval-box';
      evalBox.style.cssText = `
        background: rgba(16, 185, 129, 0.12);
        border: 2px solid #10b981;
        border-radius: 18px;
        padding: 12px;
        margin: 10px 0;
        font-family: sans-serif;
        animation: demoSlideUp 0.3s ease-out;
      `;
      evalBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-weight: 800; color: #059669; font-size: 13px; display: flex; align-items: center; gap: 4px;">
            <span>✓</span> Отлично! Вас поняли
          </span>
          <span style="background: white; color: #2563eb; font-weight: 900; padding: 2px 8px; border-radius: 8px; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            🎙️ Чёткость: 96%
          </span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #1e293b; direction: rtl; margin-bottom: 4px;">
          «שָׁלוֹם, נָעִים מְאוֹד!»
        </div>
        <div style="font-size: 11px; color: #047857; line-height: 1.35;">
          🗣️ <b>Произношение:</b> Превосходная чёткость речи! Звуки [שׁ] и [ע] прозвучали аутентично.
        </div>
      `;
      chatContainer.appendChild(evalBox);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
  await sleep(3500);

  // ==========================================
  // СЦЕНА 7: Этап 5 — Симулятор телефонного звонка
  // ==========================================
  console.log('📱 Сцена 7: Этап 5 — Телефонный звонок...');
  const phoneTab = page.locator('button:has-text("Звонок"), button:has-text("טֶלֶפוֹן")').first();
  await visualTap(phoneTab, 'Переход на вкладку Звонок');
  await updateOverlay('stage5_phone', 'Входящий звонок курьера Wolt в реальных условиях');
  await sleep(2200);

  // Нажимаем на кнопку "Начать звонок" или зеленую кнопку ответа
  const callBtn = page.locator('button:has-text("Позвонить"), button:has-text("Начать звонок"), button[class*="bg-emerald"], button[class*="bg-green"]').first();
  if (await callBtn.isVisible()) {
    await visualTap(callBtn, 'Прием входящего звонка');
    await sleep(2500);
  }

  // Показываем активный звонок и таймер
  await updateOverlay('stage5_phone', 'Аудио-диалог в динамике смартфона с распознаванием голоса');
  await sleep(3000);

  // Показываем Debrief-отчет с оценкой речи
  await updateOverlay('stage5_phone', '📊 Debrief-отчет: Произношение 92% • Грамматика 96%');
  await page.evaluate(() => {
    // Внедряем красивую карточку отчета по звонку
    const phoneContainer = document.querySelector('main, [class*="min-h-0"]');
    if (phoneContainer) {
      const report = document.createElement('div');
      report.id = 'demo-call-report';
      report.style.cssText = `
        position: fixed;
        top: 80px;
        left: 16px;
        right: 16px;
        background: #ffffff;
        border-radius: 24px;
        padding: 16px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        border: 2px solid #3b82f6;
        z-index: 10000;
        animation: demoSlideUp 0.35s ease-out;
        font-family: sans-serif;
      `;
      report.innerHTML = `
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="font-size: 32px; margin-bottom: 4px;">🎉</div>
          <div style="font-size: 16px; font-weight: 800; color: #0f172a;">Звонок успешно завершен!</div>
          <div style="font-size: 12px; color: #64748b;">Курьер понял адрес и оставил заказ у двери</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 8px 4px; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b;">ИТОГО</div>
            <div style="font-size: 16px; font-weight: 900; color: #10b981;">94/100</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 8px 4px; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b;">ГОЛОС</div>
            <div style="font-size: 16px; font-weight: 900; color: #2563eb;">92%</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 8px 4px; text-align: center;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b;">ГРАММАТИКА</div>
            <div style="font-size: 16px; font-weight: 900; color: #8b5cf6;">96%</div>
          </div>
        </div>
        <div style="background: #eff6ff; border-radius: 12px; padding: 10px; font-size: 11px; color: #1e40af; line-height: 1.4;">
          💡 <b>Разбор звонка:</b> Вы уверенно ответили на вопрос курьера и правильно назвали номер квартиры.
        </div>
      `;
      document.body.appendChild(report);
    }
  });
  await sleep(4000);

  // ==========================================
  // СЦЕНА 8: Финал — Все 5 этапов урока пройдены!
  // ==========================================
  console.log('🏆 Сцена 8: Финал — Все 5 этапов завершены...');
  await updateOverlay('outro');

  // Подсвечиваем все 5 сегментов в шапке урока зеленым
  await page.evaluate(() => {
    const report = document.getElementById('demo-call-report');
    if (report) report.remove();

    // Закрашиваем все 5 полосок индикаторов в шапке зеленым
    document.querySelectorAll('[class*="h-full w-full"]').forEach((bar) => {
      bar.classList.add('bg-emerald-500');
    });
  });
  await sleep(3500);

  console.log('💾 Завершение сессии и сохранение видеофайла...');
  await page.close();
  await context.close();
  await browser.close();

  // Находим сохраненный webm файл
  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.webm'));
  files.sort((a, b) => fs.statSync(path.join(OUTPUT_DIR, b)).mtimeMs - fs.statSync(path.join(OUTPUT_DIR, a)).mtimeMs);

  if (files.length > 0) {
    const latestVideo = path.join(OUTPUT_DIR, files[0]);
    const finalVideoPath = path.join(OUTPUT_DIR, 'ulpana_mobile_guide.webm');
    fs.copyFileSync(latestVideo, finalVideoPath);
    console.log(`✅ ВИДЕО УСПЕШНО СОХРАНЕНО: ${finalVideoPath}`);
    console.log(`📊 Размер: ${(fs.statSync(finalVideoPath).size / 1024 / 1024).toFixed(2)} MB`);
  }
}

runRecording().catch((err) => {
  console.error('❌ Ошибка при генерации видео:', err);
  process.exit(1);
});
