import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const LESSONS_DIR = path.resolve(DEMO_DIR, 'lessons');
const ASSETS_DIR = path.resolve(DEMO_DIR, 'openchatcut_assets');
const AUDIO_BANK = path.resolve(DEMO_DIR, 'audio_bank');
const SFX_DIR = path.resolve(AUDIO_BANK, 'sfx');
const CHARACTERS_DIR = path.resolve(ROOT, 'growth/characters');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const CATALOG_PATH = path.resolve(ROOT, 'growth/MASTER_TTS_CATALOG.json');
const SCENES_SCRIPT_PATH = path.resolve(ROOT, 'growth/scripts/generate_lesson_scenes.mjs');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true });

const PLATFORMS = [
  {
    code: 'YT',
    channel: 'youtube',
    name: 'YouTube Shorts',
    filename: (num, v) => `lesson_${num}_${v}_youtube_shorts.mp4`,
    ctaLink: '👇 Ссылка на интерактивный тренажёр в описании!'
  },
  {
    code: 'TG',
    channel: 'telegram',
    name: 'Telegram Channel',
    filename: (num, v) => `lesson_${num}_${v}_telegram.mp4`,
    ctaLink: '👇 Ссылка на интерактивный тренажёр в посте!'
  },
  {
    code: 'INSTA',
    channel: 'instagram',
    name: 'Instagram Reels',
    filename: (num, v) => `lesson_${num}_${v}_instagram_reels.mp4`,
    ctaLink: '👆 Ссылка на интерактивный тренажёр в шапке профиля!'
  },
  {
    code: 'TIKTOK',
    channel: 'tiktok',
    name: 'TikTok',
    filename: (num, v) => `lesson_${num}_${v}_tiktok.mp4`,
    ctaLink: '🔗 Ссылка на интерактивный тренажёр в профиле!'
  },
  {
    code: 'FB',
    channel: 'facebook',
    name: 'Facebook Reels',
    filename: (num, v) => `lesson_${num}_${v}_facebook_reels.mp4`,
    ctaLink: '👇 Ссылка на интерактивный тренажёр в комментариях!'
  }
];

// Утилита получения точной длительности аудиофайла
function getAudioDurationSec(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const res = cp.spawnSync(ffmpeg, ['-i', filePath]);
  const match = res.stderr.toString().match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
  }
  return 0;
}

// Загрузка сценария из generate_lesson_scenes.mjs и MASTER_TTS_CATALOG.json
function loadLessonScenario(lessonNumber, variant = 'clean') {
  let sceneConfig = null;
  if (fs.existsSync(SCENES_SCRIPT_PATH)) {
    const content = fs.readFileSync(SCENES_SCRIPT_PATH, 'utf8');
    const startIdx = content.indexOf('const LESSON_CONFIGS = [');
    if (startIdx !== -1) {
      // Ищем блок урока
      const regex = new RegExp(`{\\s*number:\\s*${lessonNumber},\\s*variant:\\s*'${variant}',([\\s\\S]*?)(?=},\\s*{\\s*number:|];)`, 'm');
      const m = content.match(regex);
      if (m) {
        try {
          const fakeObjStr = `({ number: ${lessonNumber}, variant: '${variant}', ${m[1]} })`;
          sceneConfig = eval(fakeObjStr);
        } catch (_) {}
      }
    }
  }

  let catalogCues = [];
  if (fs.existsSync(CATALOG_PATH)) {
    const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    const prefix = `l${String(lessonNumber).padStart(2, '0')}_${variant}`;
    catalogCues = cat.filter(c => c.id && c.id.startsWith(prefix));
  }

  return { sceneConfig, catalogCues };
}

// Поиск или выбор изображений персонажей
function resolveCharacterImages(lessonNumber) {
  // Проверяем специализированные папки персонажей
  if (lessonNumber === 8) {
    const tomerDir = path.join(CHARACTERS_DIR, 'tomer_boss/emotions');
    if (fs.existsSync(tomerDir)) {
      return {
        context: path.join(tomerDir, 'context_office.jpg'),
        student: path.join(tomerDir, 'sarah_employee.jpg'),
        lead: path.join(tomerDir, 'tomer_boss.jpg'),
      };
    }
  }
  if (lessonNumber === 7) {
    const davidDir = path.join(CHARACTERS_DIR, 'david_guard/emotions');
    return {
      context: path.join(davidDir, 'context_mall.jpg'),
      student: path.join(davidDir, 'student_desperate.jpg'),
      lead: path.join(davidDir, 'david_guard.jpg'),
    };
  }
  if (lessonNumber === 10) {
    const itsikDir = path.join(CHARACTERS_DIR, 'itsik_bus/emotions');
    return {
      context: path.join(itsikDir, 'context_bus.jpg'),
      student: path.join(itsikDir, 'passenger_bus.jpg'),
      lead: path.join(itsikDir, 'shocked.jpg'),
    };
  }
  // Фоллбэк на существующие качественные кадры
  const defaultDir = path.join(CHARACTERS_DIR, 'david_guard/emotions');
  return {
    context: path.join(defaultDir, 'context_mall.jpg'),
    student: path.join(defaultDir, 'student_desperate.jpg'),
    lead: path.join(defaultDir, 'david_guard.jpg'),
  };
}

// Генерация HTML карточки оверлея
function getCardHtml(type, data) {
  if (type === 'hook') {
    return `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;">
        <div style="display:inline-flex;align-items:center;background:rgba(239,68,68,0.95);color:#fff;padding:16px 36px;border-radius:999px;font-size:32px;font-weight:900;letter-spacing:2px;box-shadow:0 8px 30px rgba(239,68,68,0.5);">
          ${data.badge || '🚨 КАЗУС НА ИВРИТЕ'}
        </div>
        <div style="margin-top:50px;background:rgba(15,23,42,0.88);backdrop-filter:blur(16px);border:3px solid rgba(255,255,255,0.15);border-radius:32px;padding:48px;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
          <div style="color:#38BDF8;font-size:36px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">
            ${data.location || 'ТЕЛЬ-АВИВ'}
          </div>
          <div style="color:#FFFFFF;font-size:56px;font-weight:900;line-height:1.2;">
            ${data.hookText || 'Неловкая ситуация в Израиле...'}
          </div>
        </div>
      </div>
    `;
  }

  if (type === 'student') {
    return `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
        <div style="background:rgba(15,23,42,0.94);backdrop-filter:blur(20px);border:3px solid #38BDF8;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="background:#38BDF8;color:#0F172A;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
              ${data.author || '👨‍🎓 НОВИЧОК'}
            </div>
            <div style="color:#94A3B8;font-size:24px;font-weight:600;">(уверенно говорит на иврите)</div>
          </div>
          <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:68px;font-weight:900;color:#FFFFFF;line-height:1.2;margin-bottom:20px;">
            ${data.hebrew}
          </div>
          <div style="color:#E2E8F0;font-size:36px;font-weight:700;">
            ${data.russian}
          </div>
        </div>
      </div>
    `;
  }

  if (type === 'lead') {
    return `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
        <div style="background:rgba(15,23,42,0.94);backdrop-filter:blur(20px);border:3px solid #38BDF8;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="background:#0284C7;color:#FFFFFF;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
              ${data.author || '🇮🇱 ИЗРАИЛЬТЯНИН'}
            </div>
            <div style="color:#38BDF8;font-size:24px;font-weight:600;">(ошарашен услышанным)</div>
          </div>
          <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:66px;font-weight:900;color:#FFFFFF;line-height:1.25;margin-bottom:20px;">
            ${data.hebrew}
          </div>
          <div style="color:#BAE6FD;font-size:36px;font-weight:700;">
            ${data.russian}
          </div>
        </div>
      </div>
    `;
  }

  if (type === 'freeze') {
    return `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <div style="background:rgba(239,68,68,0.96);padding:24px 50px;border-radius:30px;box-shadow:0 20px 60px rgba(239,68,68,0.7);transform:rotate(-3deg);text-align:center;margin-bottom:40px;">
          <div style="color:#FFFFFF;font-size:52px;font-weight:900;letter-spacing:2px;">
            😱 ЧТО ПОШЛО НЕ ТАК?!
          </div>
        </div>
        <div style="background:rgba(15,23,42,0.94);backdrop-filter:blur(24px);border:3px solid #EF4444;border-radius:36px;padding:40px 50px;text-align:center;max-width:900px;box-shadow:0 30px 80px rgba(0,0,0,0.8);">
          <div style="color:#94A3B8;font-size:28px;font-weight:700;margin-bottom:12px;">Фатальная путаница в словах:</div>
          <div style="color:#FCA5A5;font-size:42px;font-weight:900;">${data.wrongWord || 'Ошибка в слове'}</div>
        </div>
      </div>
    `;
  }

  if (type === 'rule') {
    return `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:3px solid #38BDF8;border-radius:40px;padding:50px 44px;box-shadow:0 30px 90px rgba(0,0,0,0.85);text-align:center;width:100%;max-width:960px;box-sizing:border-box;">
          <div style="display:inline-flex;align-items:center;background:rgba(56,189,248,0.15);padding:12px 32px;border-radius:999px;border:1px solid rgba(56,189,248,0.3);margin-bottom:28px;">
            <span style="font-size:28px;font-weight:900;color:#38BDF8;">💡 УЛЬПАН АЛЕФ • ПРАВИЛО</span>
          </div>
          <div style="color:#FFFFFF;font-size:46px;font-weight:900;line-height:1.2;margin-bottom:32px;">
            ${data.ruleTitle || 'Запомни разницу раз и навсегда!'}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px;">
            <div style="background:rgba(239,68,68,0.15);border:2px solid #EF4444;border-radius:24px;padding:24px;">
              <div style="color:#FCA5A5;font-size:22px;font-weight:800;margin-bottom:8px;">${data.col1Title || 'НЕ ТО СЛОВО'}</div>
              <div style="direction:rtl;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:52px;font-weight:900;color:#FFFFFF;margin-bottom:8px;">${data.col1He}</div>
              <div style="color:#FECACA;font-size:24px;font-weight:700;">${data.col1Trans || ''}</div>
            </div>
            <div style="background:rgba(34,197,94,0.15);border:2px solid #22C55E;border-radius:24px;padding:24px;">
              <div style="color:#86EFAC;font-size:22px;font-weight:800;margin-bottom:8px;">${data.col2Title || 'ПРАВИЛЬНО'}</div>
              <div style="direction:rtl;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:52px;font-weight:900;color:#FFFFFF;margin-bottom:8px;">${data.col2He}</div>
              <div style="color:#BBF7D0;font-size:24px;font-weight:700;">${data.col2Trans || ''}</div>
            </div>
          </div>
          <div style="color:#BAE6FD;font-size:28px;font-weight:700;line-height:1.35;">
            ${data.ruleDesc || ''}
          </div>
        </div>
      </div>
    `;
  }

  if (type === 'cta') {
    return `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:3px solid #38BDF8;border-radius:44px;padding:60px 50px;box-shadow:0 30px 90px rgba(0,0,0,0.85);text-align:center;width:100%;max-width:920px;box-sizing:border-box;">
          <div style="display:inline-flex;align-items:center;gap:16px;background:rgba(56,189,248,0.15);padding:14px 32px;border-radius:999px;border:1px solid rgba(56,189,248,0.3);margin-bottom:28px;">
            <span style="font-family:'Segoe UI Hebrew',Rubik,sans-serif;font-size:36px;font-weight:900;color:#38BDF8;">א</span>
            <span style="color:#FFFFFF;font-size:26px;font-weight:800;letter-spacing:1px;">УЛЬПАН АЛЕФ</span>
          </div>
          <div style="color:#FFFFFF;font-size:52px;font-weight:900;line-height:1.2;margin-bottom:16px;">
            Иврит без паники<br/>в реальном Израиле
          </div>
          <div style="color:#94A3B8;font-size:26px;font-weight:600;margin-bottom:36px;">
            Отрабатывай живые диалоги в офисе и на улице с ИИ
          </div>
          <div style="background:linear-gradient(135deg,#0284C7,#0369A1);border-radius:28px;padding:32px;margin-bottom:36px;box-shadow:0 16px 40px rgba(2,132,199,0.4);">
            <div style="color:#BAE6FD;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">
              🎁 30 ДНЕЙ БЕСПЛАТНОГО ДОСТУПА
            </div>
            <div style="display:inline-block;background:#FFFFFF;color:#0F172A;font-size:42px;font-weight:900;padding:10px 40px;border-radius:18px;letter-spacing:3px;margin:12px 0;">
              ПРОМОКОД: ${data.promoCode}
            </div>
            <div style="color:#E0F2FE;font-size:22px;font-weight:600;">
              Урок ${data.lessonNumber}: ${data.topicTitle || 'Интерактивный курс'}
            </div>
          </div>
          <div style="color:#38BDF8;font-size:28px;font-weight:800;">
            ${data.ctaLink}
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

// Главная фабричная функция
async function produceCleanLesson(lessonNumber = 8) {
  const numPad = String(lessonNumber).padStart(2, '0');
  console.log(`\n======================================================`);
  console.log(`🚀 ФАБРИКА-500: АВТОМАТИЧЕСКАЯ СБОРКА УРОКА ${lessonNumber} (CLEAN)`);
  console.log(`======================================================\n`);

  // 1. Загрузка сценария
  console.log(`📜 [1/6] Загрузка сценария урока ${lessonNumber}...`);
  const { sceneConfig, catalogCues } = loadLessonScenario(lessonNumber, 'clean');
  
  const hookCue = catalogCues.find(c => c.id.endsWith('_s1_01'));
  const studentCue = catalogCues.find(c => c.id.endsWith('_s2_02'));
  const leadCue = catalogCues.find(c => c.id.endsWith('_s2_03'));
  const ruleCue = catalogCues.find(c => c.id.endsWith('_s3_04'));
  const ctaCue = catalogCues.find(c => c.id.endsWith('_s4_05'));

  const s1Path = path.join(AUDIO_BANK, `l${numPad}_clean_s1_01.mp3`);
  const s2Path = path.join(AUDIO_BANK, `l${numPad}_clean_s2_02.mp3`);
  const s3Path = path.join(AUDIO_BANK, `l${numPad}_clean_s2_03.mp3`);
  const s4Path = path.join(AUDIO_BANK, `l${numPad}_clean_s3_04.mp3`);
  const s5Path = path.join(AUDIO_BANK, `l${numPad}_clean_s4_05.mp3`);

  if (!fs.existsSync(s1Path) || !fs.existsSync(s2Path) || !fs.existsSync(s3Path) || !fs.existsSync(s4Path) || !fs.existsSync(s5Path)) {
    throw new Error(`❌ Не найдены базовые аудиофайлы для урока ${lessonNumber} в audio_bank!`);
  }

  // 2. Авто-таймлайн через измерения аудио
  console.log(`⏱️ [2/6] Auto-Timeline Engine: расчёт точек монтажа...`);
  const dS1 = getAudioDurationSec(s1Path);
  const dS2 = getAudioDurationSec(s2Path);
  const dS3 = getAudioDurationSec(s3Path);
  const dS4 = getAudioDurationSec(s4Path);
  const dS5 = getAudioDurationSec(s5Path);

  const tHookEnd = parseFloat((dS1 + 0.35).toFixed(2));
  const tStudentEnd = parseFloat((tHookEnd + dS2 + 0.35).toFixed(2));
  const tLeadEnd = parseFloat((tStudentEnd + dS3 + 0.40).toFixed(2));
  const tFreezeEnd = parseFloat((tLeadEnd + 1.80).toFixed(2));
  const tRuleEnd = parseFloat((tFreezeEnd + dS4 + 0.40).toFixed(2));
  const tTotal = parseFloat((tRuleEnd + dS5 + 0.50).toFixed(2));

  console.log(`   Таймлайн: Hook=0..${tHookEnd}s, Student=..${tStudentEnd}s, Lead=..${tLeadEnd}s, Freeze=..${tFreezeEnd}s, Rule=..${tRuleEnd}s, Total=${tTotal}s`);

  // 3. Сведение мастер-аудио
  console.log(`🔊 [3/6] Сведение мастер-аудио со звуковыми эффектами...`);
  const scratchWav = path.join(SFX_DIR, 'record_scratch.wav');
  const chimeWav = path.join(SFX_DIR, 'chime_ding.wav');
  const masterAudioWav = path.join(ASSETS_DIR, `l${numPad}_clean_master_audio.wav`);

  const s1Delay = 0;
  const s2Delay = Math.round(tHookEnd * 1000);
  const scratchDelay = Math.round((tStudentEnd + dS3 * 0.75) * 1000);
  const s3Delay = Math.round((tStudentEnd + 0.3) * 1000);
  const chimeDelay = Math.round((tFreezeEnd - 0.3) * 1000);
  const s4Delay = Math.round(tFreezeEnd * 1000);
  const s5Delay = Math.round(tRuleEnd * 1000);

  const filterAudio = [
    `[0:a]adelay=${s1Delay}|${s1Delay},volume=1.0[a0]`,
    `[1:a]adelay=${s2Delay}|${s2Delay},volume=1.1[a1]`,
    `[2:a]adelay=${scratchDelay}|${scratchDelay},volume=0.85[a2]`,
    `[3:a]adelay=${s3Delay}|${s3Delay},volume=1.1,equalizer=f=2500:width_type=h:width=1200:g=2[a3]`,
    `[4:a]adelay=${chimeDelay}|${chimeDelay},volume=0.8[a4]`,
    `[5:a]adelay=${s4Delay}|${s4Delay},volume=1.05[a5]`,
    `[6:a]adelay=${s5Delay}|${s5Delay},volume=1.0[a6]`,
    `[a0][a1][a2][a3][a4][a5][a6]amix=inputs=7:dropout_transition=0,dynaudnorm=f=75:g=15:p=0.95[out]`
  ].join(';');

  cp.spawnSync(ffmpeg, [
    '-y',
    '-i', s1Path,
    '-i', s2Path,
    '-i', scratchWav,
    '-i', s3Path,
    '-i', chimeWav,
    '-i', s4Path,
    '-i', s5Path,
    '-filter_complex', filterAudio,
    '-map', '[out]',
    '-ar', '44100',
    '-ac', '2',
    '-t', String(tTotal),
    masterAudioWav
  ]);

  // 4. Генерация оверлейных карточек (Playwright параллельно)
  console.log(`🎨 [4/6] Генерация оверлейных карточек (Playwright параллельно)...`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

  const cardDefs = [
    {
      file: `l${numPad}_card_01_hook.png`,
      type: 'hook',
      data: {
        badge: sceneConfig?.hookBadge || '🚨 СИТУАЦИЯ В ОФИСЕ',
        location: sceneConfig?.hookLocation || 'ТЕЛЬ-АВИВ • САРОНА',
        hookText: hookCue?.text || 'Босс ловит тебя в коридоре в 10 утра...'
      }
    },
    {
      file: `l${numPad}_card_02_student.png`,
      type: 'student',
      data: {
        author: sceneConfig?.failAuthorStudent || '👩‍💻 СОТРУДНИЦА',
        hebrew: sceneConfig?.failStudentHe || studentCue?.text || 'אֲנִי הוֹלֵךְ לֶאֱכוֹל שׁוּב!',
        russian: sceneConfig?.failStudentRu || '«Я иду снова есть!»'
      }
    },
    {
      file: `l${numPad}_card_03_lead.png`,
      type: 'lead',
      data: {
        author: sceneConfig?.characterName || '👨‍💼 ТОМЕР (ТИМЛИД)',
        hebrew: sceneConfig?.failLeadHe || leadCue?.text || 'שָׁעָה עֶשֶׂר בַּבֹּקֶר, שָׂרָה! רַק הִגַּעַתְּ!',
        russian: sceneConfig?.failLeadRu || '«10 утра, Сара! Ты только пришла!»'
      }
    },
    {
      file: `l${numPad}_card_04_freeze.png`,
      type: 'freeze',
      data: {
        wrongWord: sceneConfig?.errorWrong || 'אוֹכֵל (ем) вместо עוֹבֵד (работаю)'
      }
    },
    {
      file: `l${numPad}_card_05_rule.png`,
      type: 'rule',
      data: {
        ruleTitle: 'Глаголы Пааль: работа vs обед',
        col1Title: sceneConfig?.ruleCol1Title || 'ИДУ ЕСТЬ',
        col1He: sceneConfig?.ruleCol1He || 'אוֹכֵל',
        col1Trans: sceneConfig?.ruleCol1Trans || 'охэ́ль (ем)',
        col2Title: sceneConfig?.ruleCol2Title || 'РАБОТАЮ',
        col2He: sceneConfig?.ruleCol2He || 'עוֹבֵד',
        col2Trans: sceneConfig?.ruleCol2Trans || 'овэ́д (работаю)',
        ruleDesc: 'Оба глагола в настоящем времени звучат похоже (Пааль). Не путай работу с обедом перед боссом!'
      }
    }
  ];

  // Добавляем 5 CTA карточек для всех платформ
  for (const p of PLATFORMS) {
    cardDefs.push({
      file: `l${numPad}_card_06_cta_${p.code.toLowerCase()}.png`,
      type: 'cta',
      data: {
        promoCode: p.code,
        lessonNumber,
        topicTitle: sceneConfig?.title || 'Глаголы Пааль',
        ctaLink: p.ctaLink
      }
    });
  }

  for (const c of cardDefs) {
    const html = getCardHtml(c.type, c.data);
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">${html}</body></html>`);
    const outPng = path.join(ASSETS_DIR, c.file);
    await page.screenshot({ path: outPng, omitBackground: true });
  }
  await browser.close();
  console.log(`   ✅ Сгенерировано ${cardDefs.length} графических оверлеев.`);

  // 5. Рендеринг B-Roll
  console.log(`🎬 [5/6] Генерация динамических B-Roll клипов (Ken Burns)...`);
  const charImgs = resolveCharacterImages(lessonNumber);

  const dur1 = tHookEnd;
  const dur2 = parseFloat((tStudentEnd - tHookEnd).toFixed(2));
  const dur3 = parseFloat((tLeadEnd - tStudentEnd).toFixed(2));
  const dur4 = parseFloat((tFreezeEnd - tLeadEnd).toFixed(2));
  const dur5 = parseFloat((tRuleEnd - tFreezeEnd).toFixed(2));
  const dur6 = parseFloat((tTotal - tRuleEnd).toFixed(2));

  const clip1 = path.join(ASSETS_DIR, `l${numPad}_broll_01.mp4`);
  const clip2 = path.join(ASSETS_DIR, `l${numPad}_broll_02.mp4`);
  const clip3 = path.join(ASSETS_DIR, `l${numPad}_broll_03.mp4`);
  const clip4 = path.join(ASSETS_DIR, `l${numPad}_broll_04.mp4`);
  const clip5 = path.join(ASSETS_DIR, `l${numPad}_broll_05.mp4`);
  const clip6 = path.join(ASSETS_DIR, `l${numPad}_broll_06.mp4`);

  // B-Roll 1 (Хук - Офис)
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', charImgs.context,
    '-vf', `zoompan=z='min(zoom+0.0006,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur1*30)}:s=1080x1920:fps=30`,
    '-c:v', 'libx264', '-t', String(dur1), '-pix_fmt', 'yuv420p', clip1
  ]);

  // B-Roll 2 (Сотрудница Сара)
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', charImgs.student,
    '-vf', `zoompan=z='min(1.04+on*0.0007,1.12)':x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom/2)':d=${Math.round(dur2*30)}:s=1080x1920:fps=30`,
    '-c:v', 'libx264', '-t', String(dur2), '-pix_fmt', 'yuv420p', clip2
  ]);

  // B-Roll 3 (Босс Томер)
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', charImgs.lead,
    '-vf', `zoompan=z='min(1.05+on*0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih*0.38-(ih/zoom/2)':d=${Math.round(dur3*30)}:s=1080x1920:fps=30`,
    '-c:v', 'libx264', '-t', String(dur3), '-pix_fmt', 'yuv420p', clip3
  ]);

  // B-Roll 4 (Стоп-кадр комический)
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', charImgs.student,
    '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=saturation=0.85:contrast=1.1`,
    '-c:v', 'libx264', '-t', String(dur4), '-r', '30', '-pix_fmt', 'yuv420p', clip4
  ]);

  // B-Roll 5 (Правило / Офис)
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', charImgs.context,
    '-vf', `zoompan=z='min(1.10-on*0.0004,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.round(dur5*30)}:s=1080x1920:fps=30,eq=brightness=-0.12`,
    '-c:v', 'libx264', '-t', String(dur5), '-pix_fmt', 'yuv420p', clip5
  ]);

  // B-Roll 6 (CTA / Босс)
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', charImgs.lead,
    '-vf', `zoompan=z='min(1.12-on*0.00035,1.06)':x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom/2)':d=${Math.round(dur6*30)}:s=1080x1920:fps=30,eq=brightness=-0.1`,
    '-c:v', 'libx264', '-t', String(dur6), '-pix_fmt', 'yuv420p', clip6
  ]);

  // Concat B-Rolls
  const brollStemList = path.join(ASSETS_DIR, `l${numPad}_stem_broll.txt`);
  fs.writeFileSync(brollStemList, [
    `file '${clip1.replace(/\\/g, '/')}'`,
    `file '${clip2.replace(/\\/g, '/')}'`,
    `file '${clip3.replace(/\\/g, '/')}'`,
    `file '${clip4.replace(/\\/g, '/')}'`,
    `file '${clip5.replace(/\\/g, '/')}'`
  ].join('\n'));

  const mergedStemBroll = path.join(ASSETS_DIR, `l${numPad}_merged_stem_broll.mp4`);
  cp.spawnSync(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', brollStemList, '-c', 'copy', mergedStemBroll]);

  // 6. Сборка «Базового ствола» (Base Stem) и быстрых «Хвостов» (Tails)
  console.log(`⚡ [6/6] Двухфазный композитинг «Ствол + Хвост» (Base Stem + Tail Splice)...`);

  const card1 = path.join(ASSETS_DIR, `l${numPad}_card_01_hook.png`);
  const card2 = path.join(ASSETS_DIR, `l${numPad}_card_02_student.png`);
  const card3 = path.join(ASSETS_DIR, `l${numPad}_card_03_lead.png`);
  const card4 = path.join(ASSETS_DIR, `l${numPad}_card_04_freeze.png`);
  const card5 = path.join(ASSETS_DIR, `l${numPad}_card_05_rule.png`);

  const filterStem = [
    `[0:v][1:v]overlay=0:0:enable='between(t,0,${tHookEnd})'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,${tHookEnd},${tStudentEnd})'[v2]`,
    `[v2][3:v]overlay=0:0:enable='between(t,${tStudentEnd},${tLeadEnd})'[v3]`,
    `[v3][4:v]overlay=0:0:enable='between(t,${tLeadEnd},${tFreezeEnd})'[v4]`,
    `[v4][5:v]overlay=0:0:enable='gte(t,${tFreezeEnd})'[vfinal]`
  ].join(';');

  const baseStemMp4 = path.join(ASSETS_DIR, `l${numPad}_clean_base_stem.mp4`);
  console.log(`   🎞️ Рендер общего ствола (0.0s – ${tRuleEnd}s)...`);
  const resStem = cp.spawnSync(ffmpeg, [
    '-y',
    '-i', mergedStemBroll,
    '-loop', '1', '-i', card1,
    '-loop', '1', '-i', card2,
    '-loop', '1', '-i', card3,
    '-loop', '1', '-i', card4,
    '-loop', '1', '-i', card5,
    '-i', masterAudioWav,
    '-filter_complex', filterStem,
    '-map', '[vfinal]',
    '-map', '6:a',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-g', '30',
    '-keyint_min', '30',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', String(tRuleEnd),
    baseStemMp4
  ]);

  if (resStem.status !== 0) {
    throw new Error(`Ошибка рендера Base Stem: ${resStem.stderr?.toString()}`);
  }
  console.log(`   ✅ Общий ствол готов! (${(fs.statSync(baseStemMp4).size / 1024 / 1024).toFixed(2)} MB)`);

  // Рендер 5 хвостов и мгновенная склейка
  const results = [];
  for (const p of PLATFORMS) {
    const cardCta = path.join(ASSETS_DIR, `l${numPad}_card_06_cta_${p.code.toLowerCase()}.png`);
    const tailMp4 = path.join(ASSETS_DIR, `l${numPad}_clean_tail_${p.code.toLowerCase()}.mp4`);
    const outMp4 = path.join(LESSONS_DIR, p.filename(numPad, 'clean'));

    // Рендер короткого 5-секундного хвоста
    cp.spawnSync(ffmpeg, [
      '-y',
      '-i', clip6,
      '-loop', '1', '-i', cardCta,
      '-ss', String(tRuleEnd), '-i', masterAudioWav,
      '-filter_complex', '[0:v][1:v]overlay=0:0[vcta]',
      '-map', '[vcta]',
      '-map', '2:a',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '19',
      '-g', '30',
      '-keyint_min', '30',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-t', String(dur6),
      tailMp4
    ]);

    // Мгновенная склейка -c copy
    const concatList = path.join(ASSETS_DIR, `l${numPad}_splice_${p.code.toLowerCase()}.txt`);
    fs.writeFileSync(concatList, [
      `file '${baseStemMp4.replace(/\\/g, '/')}'`,
      `file '${tailMp4.replace(/\\/g, '/')}'`
    ].join('\n'));

    cp.spawnSync(ffmpeg, [
      '-y', '-f', 'concat', '-safe', '0', '-i', concatList,
      '-c', 'copy', outMp4
    ]);

    const stat = fs.statSync(outMp4);
    console.log(`   ✨ [${p.code}] ${path.basename(outMp4)} готов: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
    results.push({
      code: p.code,
      channel: p.channel,
      filename: path.basename(outMp4),
      sizeBytes: stat.size
    });
  }

  // Обновление реестра lessons_video_registry.json
  if (fs.existsSync(REGISTRY_PATH)) {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    if (!reg.lessons[String(lessonNumber)]) reg.lessons[String(lessonNumber)] = { lessonNumber, variants: {} };
    if (!reg.lessons[String(lessonNumber)].variants.clean) reg.lessons[String(lessonNumber)].variants.clean = { files: {} };
    for (const r of results) {
      reg.lessons[String(lessonNumber)].variants.clean.files[r.code] = {
        path: `public/demo/lessons/${r.filename}`,
        promoCode: r.code,
        durationSec: tTotal,
        resolution: '1080x1920',
        fileSizeBytes: r.sizeBytes,
        generatedAt: new Date().toISOString()
      };
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
    console.log(`   📝 lessons_video_registry.json успешно обновлен!`);
  }

  // Также создаем копию lesson_08_youtube_shorts.mp4 для обратной совместимости
  const ytMaster = path.join(LESSONS_DIR, `lesson_${numPad}_clean_youtube_shorts.mp4`);
  const ytLegacy = path.join(LESSONS_DIR, `lesson_${numPad}_youtube_shorts.mp4`);
  if (fs.existsSync(ytMaster)) {
    fs.copyFileSync(ytMaster, ytLegacy);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 УРОК ${lessonNumber} CLEAN УСПЕШНО СОБРАН ВО ВСЕХ 5 ВЕРСИЯХ!`);
  console.log(`======================================================\n`);
  return results;
}

const args = process.argv.slice(2);
const lessonArg = args.find(a => a.startsWith('--lesson='));
const lessonNum = lessonArg ? parseInt(lessonArg.split('=')[1], 10) : 8;

produceCleanLesson(lessonNum).catch(err => {
  console.error('❌ Ошибка сборки:', err);
  process.exit(1);
});
