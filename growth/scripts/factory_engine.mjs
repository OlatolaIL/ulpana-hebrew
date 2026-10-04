import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const SCENARIOS_PATH = path.resolve(ROOT, 'growth/data/factory_scenarios_20.json');
const CAMPAIGNS_DIR = path.resolve(ROOT, 'growth/output/campaigns');
const AUDIO_CACHE_DIR = path.resolve(ROOT, 'public/audio/factory');
const BG_IMG_PATH = path.resolve(ROOT, 'public/images/marketing/latte_mama_kindergarten.jpg');

if (fs.existsSync(path.resolve(ROOT, '.env.local'))) {
  process.loadEnvFile(path.resolve(ROOT, '.env.local'));
}

if (!fs.existsSync(CAMPAIGNS_DIR)) fs.mkdirSync(CAMPAIGNS_DIR, { recursive: true });
if (!fs.existsSync(AUDIO_CACHE_DIR)) fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });

const bgBase64 = fs.existsSync(BG_IMG_PATH)
  ? `data:image/jpeg;base64,${fs.readFileSync(BG_IMG_PATH).toString('base64')}`
  : '';

const geminiKeys = [
  process.env.GEMINI_TTS_API_KEY,
  process.env.GEMINI_TTS_KEY_2,
  process.env.GEMINI_PRIMARY_API_KEY,
  process.env.GEMINI_SECONDARY_API_KEY,
].filter(Boolean);

const ttsModels = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-3.8-flash-tts'
];

async function callGeminiTts(text, voiceName = 'Aoede') {
  for (const model of ttsModels) {
    for (let i = 0; i < geminiKeys.length; i++) {
      const k = geminiKeys[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${k}`;
      const promptText = model.includes('2.5')
        ? `Read the following Hebrew transcript aloud: ${text}`
        : text;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) {
          return Buffer.from(b64, 'base64');
        }
        if (res.status === 429 || data?.error?.code === 429) continue;
      } catch (e) {}
    }
  }
  throw new Error(`Все модели Gemini TTS исчерпали квоту для текста: "${text}"`);
}

function processAudioBuffer(rawBuf, outMp3) {
  const isRiff = rawBuf.subarray(0, 4).toString('ascii') === 'RIFF';
  const tmpIn = outMp3 + (isRiff ? '.in.wav' : '.in.pcm');
  fs.writeFileSync(tmpIn, rawBuf);

  const inputArgs = isRiff
    ? ['-i', `"${tmpIn}"`]
    : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `"${tmpIn}"`];

  // Anti-click: 50ms fade-in, 80ms fade-out, 44.1kHz stereo
  const filter = 'afade=t=in:st=0:d=0.05,areverse,afade=t=in:st=0:d=0.08,areverse';
  cp.execSync(`"${FFMPEG_PATH}" -y ${inputArgs.join(' ')} -af "${filter}" -ar 44100 -ac 2 -b:a 192k "${outMp3}"`, { stdio: 'ignore' });
  try { fs.unlinkSync(tmpIn); } catch {}
}

function getAudioDuration(file) {
  try {
    const res = cp.spawnSync(FFMPEG_PATH, ['-i', file], { encoding: 'utf8' });
    const match = (res.stderr || '').match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (match) {
      return parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
    }
  } catch (e) {}
  return 4.5;
}

async function ensureScenarioAudio(scenario) {
  const audioFiles = [];
  for (let i = 0; i < scenario.phrases.length; i++) {
    const p = scenario.phrases[i];
    const outMp3 = path.resolve(AUDIO_CACHE_DIR, `${scenario.id}_p${i + 1}.mp3`);
    if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 15000) {
      audioFiles.push(outMp3);
      continue;
    }

    console.log(`   🎙️ Синтез TTS [${i + 1}/4] (${scenario.voice}): "${p.he}"`);
    const rawBuf = await callGeminiTts(p.he, scenario.voice || 'Aoede');
    processAudioBuffer(rawBuf, outMp3);
    audioFiles.push(outMp3);
    await new Promise(r => setTimeout(r, 1200));
  }
  return audioFiles;
}

function getHtmlForSlide(slide, scenario, aspect = '1:1') {
  const isVertical = aspect === '9:16';
  const width = 1080;
  const height = isVertical ? 1920 : 1080;
  const padding = isVertical ? '140px 70px 220px 70px' : '70px';

  if (slide.type === 'hook') {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Rubik:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${width}px; height: ${height}px;
    background: #090d16;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #ffffff;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: ${padding};
    position: relative;
    overflow: hidden;
  }
  .bg-img {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('${bgBase64}');
    background-size: cover; background-position: center;
    opacity: 0.22; filter: blur(2px);
  }
  .overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.12) 0%, rgba(9, 13, 22, 0.95) 75%);
  }
  .content {
    position: relative; z-index: 2; height: 100%;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .top-bar {
    display: flex; justify-content: space-between; align-items: center;
  }
  .badge {
    background: rgba(245, 158, 11, 0.18);
    border: 1.5px solid rgba(245, 158, 11, 0.5);
    color: #fbbf24;
    padding: 14px 28px;
    border-radius: 9999px;
    font-size: 24px; font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .brand {
    font-size: 26px; font-weight: 800; color: #94a3b8;
    letter-spacing: 0.5px;
  }
  .hero-box {
    margin: auto 0;
    background: rgba(15, 23, 42, 0.85);
    border: 1.5px solid rgba(255, 255, 255, 0.14);
    border-radius: 36px;
    padding: ${isVertical ? '64px 50px' : '52px 48px'};
    backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  }
  .hero-tag {
    display: inline-block;
    background: rgba(244, 63, 94, 0.18);
    border: 1px solid rgba(244, 63, 94, 0.45);
    color: #fda4af;
    padding: 8px 22px;
    border-radius: 9999px;
    font-size: 22px; font-weight: 700;
    margin-bottom: 22px;
    letter-spacing: 0.5px;
  }
  .hero-title-1 {
    font-size: ${isVertical ? '56px' : '52px'}; font-weight: 900; color: #f87171;
    line-height: 1.15; margin-bottom: 10px;
    font-family: 'Rubik', sans-serif;
  }
  .hero-title-2 {
    font-size: ${isVertical ? '68px' : '64px'}; font-weight: 900; color: #ffffff;
    line-height: 1.18; margin-bottom: 20px;
    font-family: 'Rubik', sans-serif;
  }
  .hero-subtitle {
    font-size: 30px; font-weight: 500; color: #cbd5e1;
    line-height: 1.4; margin-bottom: 30px;
  }
  .preview-box {
    margin-top: 10px;
    background: rgba(56, 189, 248, 0.08);
    border: 1.5px solid rgba(56, 189, 248, 0.35);
    border-radius: 20px;
    padding: 16px 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .preview-badge {
    font-size: 20px; font-weight: 700; color: #94a3b8;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .preview-he {
    font-size: 38px; font-weight: 700; color: #38bdf8;
    direction: rtl;
    font-family: 'Assistant', 'Segoe UI', Arial, sans-serif;
    font-feature-settings: "kern" 1, "mark" 1, "mkmk" 1, "liga" 1;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.5px;
  }
  .bottom-bar {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 24px;
    padding: 24px 36px;
  }
  .hint-text {
    font-size: 28px; font-weight: 700; color: #fbbf24;
  }
  .dots { display: flex; gap: 10px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; background: #475569; }
  .dot.active { background: #fbbf24; width: 36px; border-radius: 8px; }
</style>
</head>
<body>
  <div class="bg-img"></div>
  <div class="overlay"></div>
  <div class="content">
    <div class="top-bar">
      <div class="badge">${scenario.badge}</div>
      <div class="brand">УЛЬПАН АЛЕФ</div>
    </div>
    <div class="hero-box">
      <div class="hero-tag">${scenario.tag}</div>
      <div class="hero-title-1">${scenario.titleLine1}</div>
      <div class="hero-title-2">${scenario.titleLine2}</div>
      <div class="hero-subtitle">${scenario.subtitle}</div>
      <div class="preview-box">
        <span class="preview-badge">${scenario.previewBadge}</span>
        <span class="preview-he">${scenario.previewHe}</span>
      </div>
    </div>
    <div class="bottom-bar">
      <div class="hint-text">${scenario.hint}</div>
      <div class="dots">
        <div class="dot active"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  // Слайд фразы (2-5)
  const activeDotIndex = parseInt(slide.num, 10);
  const dotsHtml = [0, 1, 2, 3, 4].map(idx => 
    `<div class="dot ${idx === activeDotIndex ? 'active' : ''}"></div>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Rubik:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${width}px; height: ${height}px;
    background: #090d16;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #ffffff;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: ${padding};
    position: relative;
    overflow: hidden;
  }
  .bg-glow {
    position: absolute; top: -150px; right: -150px; width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%);
  }
  .content {
    position: relative; z-index: 2; height: 100%;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .top-bar {
    display: flex; justify-content: space-between; align-items: center;
  }
  .badge {
    background: rgba(56, 189, 248, 0.15);
    border: 1.5px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
    padding: 12px 26px;
    border-radius: 9999px;
    font-size: 24px; font-weight: 700;
    letter-spacing: 0.5px;
  }
  .brand {
    font-size: 24px; font-weight: 800; color: #64748b;
    letter-spacing: 0.5px;
  }
  .main-card {
    margin: auto 0;
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(255, 255, 255, 0.14);
    border-radius: 36px;
    padding: ${isVertical ? '60px 48px' : '50px 48px'};
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  }
  .ru-label {
    font-size: 22px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .ru-text {
    font-size: ${isVertical ? '36px' : '34px'}; font-weight: 600; color: #ffffff;
    line-height: 1.35; margin-bottom: 38px;
  }
  .divider {
    height: 1px; background: rgba(255, 255, 255, 0.12);
    margin-bottom: 36px;
  }
  .he-text {
    font-size: ${isVertical ? '50px' : '48px'}; font-weight: 700; color: #38bdf8;
    direction: rtl; text-align: right;
    line-height: 1.5;
    font-family: 'Assistant', 'Rubik', 'Segoe UI', Arial, sans-serif;
    font-feature-settings: "kern" 1, "mark" 1, "mkmk" 1, "liga" 1;
    text-rendering: optimizeLegibility;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
  }
  .trans-text {
    font-size: ${isVertical ? '30px' : '28px'}; font-weight: 500; font-style: italic; color: #fbbf24;
    line-height: 1.4;
  }
  .bottom-bar {
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 20px 32px;
  }
  .sound-indicator {
    display: flex; align-items: center; gap: 14px;
    font-size: 24px; font-weight: 700; color: #38bdf8;
  }
  .sound-wave { display: flex; align-items: center; gap: 4px; }
  .wave-bar { width: 4px; border-radius: 2px; background: #38bdf8; }
  .w1 { height: 12px; }
  .w2 { height: 22px; }
  .w3 { height: 16px; }
  .w4 { height: 26px; }
  .w5 { height: 14px; }
  .dots { display: flex; gap: 10px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; background: #475569; }
  .dot.active { background: #38bdf8; width: 36px; border-radius: 8px; }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="content">
    <div class="top-bar">
      <div class="badge">${slide.badge}</div>
      <div class="brand">УЛЬПАН АЛЕФ</div>
    </div>
    <div class="main-card">
      <div class="ru-label">По-русски:</div>
      <div class="ru-text">${slide.ru}</div>
      <div class="divider"></div>
      <div class="he-text">${slide.he}</div>
      <div class="trans-text">${slide.trans}</div>
    </div>
    <div class="bottom-bar">
      <div class="sound-indicator">
        <div class="sound-wave">
          <div class="wave-bar w1"></div>
          <div class="wave-bar w2"></div>
          <div class="wave-bar w3"></div>
          <div class="wave-bar w4"></div>
          <div class="wave-bar w5"></div>
        </div>
        <span>Иврит носителем (слушайте)</span>
      </div>
      <div class="dots">${dotsHtml}</div>
    </div>
  </div>
</body>
</html>`;
}

async function renderSlides(scenario, outDir, aspect = '1:1') {
  const isVertical = aspect === '9:16';
  const width = 1080;
  const height = isVertical ? 1920 : 1080;
  const slidesDir = path.resolve(outDir, isVertical ? 'slides_vertical' : 'slides_square');
  if (!fs.existsSync(slidesDir)) fs.mkdirSync(slidesDir, { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const slides = [
    { type: 'hook' },
    ...scenario.phrases.map(p => ({ type: 'phrase', ...p }))
  ];

  const imagePaths = [];
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const html = getHtmlForSlide(s, scenario, aspect);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const imgPath = path.resolve(slidesDir, `slide_${i + 1}.png`);
    await page.screenshot({ path: imgPath });
    imagePaths.push(imgPath);
  }

  await browser.close();
  return imagePaths;
}

async function assembleVideoFromSlides(imagePaths, audioFiles, outMp4, isVertical = false) {
  const tempDir = path.dirname(outMp4);
  const slideDurations = [3.0]; // 3 сек вводный слайд
  const audioChunks = [];

  // Чанк 1: тишина 3 сек
  const chunk1 = path.resolve(tempDir, `tmp_chunk_1_${isVertical ? 'v' : 's'}.wav`);
  cp.execSync(`"${FFMPEG_PATH}" -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 3.0 -c:a pcm_s16le "${chunk1}"`, { stdio: 'ignore' });
  audioChunks.push(chunk1);

  // Чанки 2-5: аудио дорожки фраз
  for (let i = 0; i < audioFiles.length; i++) {
    const aFile = audioFiles[i];
    const chunkPath = path.resolve(tempDir, `tmp_chunk_${i + 2}_${isVertical ? 'v' : 's'}.wav`);
    const rawDur = getAudioDuration(aFile);
    const padSec = i === audioFiles.length - 1 ? 0.8 : 0.5;
    const totalDur = parseFloat((rawDur + padSec).toFixed(2));
    slideDurations.push(totalDur);

    const filter = `aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=stereo,apad`;
    cp.execSync(`"${FFMPEG_PATH}" -y -i "${aFile}" -af "${filter}" -t ${totalDur} -c:a pcm_s16le "${chunkPath}"`, { stdio: 'ignore' });
    audioChunks.push(chunkPath);
  }

  // Склейка мастер-аудио
  const masterAudio = path.resolve(tempDir, `tmp_master_${isVertical ? 'v' : 's'}.wav`);
  const audioInputs = audioChunks.map(c => `-i "${c}"`).join(' ');
  const audioFilter = `[0:a][1:a][2:a][3:a][4:a]concat=n=5:v=0:a=1[outa]`;
  cp.execSync(`"${FFMPEG_PATH}" -y ${audioInputs} -filter_complex "${audioFilter}" -map "[outa]" -c:a pcm_s16le "${masterAudio}"`, { stdio: 'ignore' });

  // Сборка видеоряда через filter_complex
  const videoInputs = imagePaths.map((p, idx) => `-loop 1 -t ${slideDurations[idx]} -i "${p}"`).join(' ');
  const videoFilter = `[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[outv]`;
  const renderCmd = `"${FFMPEG_PATH}" -y ${videoInputs} -i "${masterAudio}" -filter_complex "${videoFilter}" -map "[outv]" -map 5:a -c:v libx264 -pix_fmt yuv420p -r 25 -c:a aac -b:a 192k -shortest "${outMp4}"`;
  cp.execSync(renderCmd, { stdio: 'ignore' });

  // Удаление временных файлов
  try {
    audioChunks.forEach(f => fs.unlinkSync(f));
    fs.unlinkSync(masterAudio);
  } catch {}

  return outMp4;
}

function generateCopywriting(scenario, outDir) {
  const p1 = scenario.phrases[0];
  const p2 = scenario.phrases[1];
  const p3 = scenario.phrases[2];
  const p4 = scenario.phrases[3];

  // 1. Facebook (Zero-Link Protocol)
  const fbText = `${scenario.badge}: 4 готовые фразы на иврите

${scenario.subtitle}

Включайте видео со звуком 🔊 — внутри правильное нативное произношение:

${p1.badge}:
${p1.he}
${p1.trans}

${p2.badge}:
${p2.he}
${p2.trans}

${p3.badge}:
${p3.he}
${p3.trans}

${p4.badge}:
${p4.he}
${p4.trans}

Сохраняйте себе в закладки, чтобы нужные слова всегда были под рукой!
(Ссылка на интерактивный тренажёр живых диалогов — в первом комментарии к этому видео 👇)
`;
  fs.writeFileSync(path.resolve(outDir, 'post_facebook.txt'), fbText, 'utf8');

  // 2. Telegram HTML (@ulpana_il)
  const tgText = `<b>${scenario.badge}: 4 готовые фразы на иврите</b>

<i>${scenario.subtitle}</i>

🔊 <b>Слушайте произношение на карточках:</b>

<b>${p1.badge}</b>
<code>${p1.he}</code>
<i>${p1.trans}</i>

<b>${p2.badge}</b>
<code>${p2.he}</code>
<i>${p2.trans}</i>

<b>${p3.badge}</b>
<code>${p3.he}</code>
<i>${p3.trans}</i>

<b>${p4.badge}</b>
<code>${p4.he}</code>
<i>${p4.trans}</i>

💡 <b>Хотите говорить на иврите свободно и без страха звонить?</b>
Отрабатывайте живые диалоги в интерактивном тренажёре «Ульпан Алеф».

👉 <a href="https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=TG&utm_source=telegram&utm_medium=channel&utm_campaign=${scenario.id}">Начать практику (30 дней бесплатно с промокодом TG)</a>
`;
  fs.writeFileSync(path.resolve(outDir, 'post_telegram.html'), tgText, 'utf8');

  // 3. Instagram (Bio Link + DM Trigger)
  const igText = `${scenario.badge}: 4 фразы на иврите

${scenario.subtitle}

Листайте карусель 👉 внутри 4 готовые фразы с правильным ударением:

${p1.badge}
${p1.he}
${p1.trans}

${p2.badge}
${p2.he}
${p2.trans}

${p3.badge}
${p3.he}
${p3.trans}

${p4.badge}
${p4.he}
${p4.trans}

💾 Обязательно сохраняйте в закладки, чтобы нужные слова всегда были под рукой!

🎁 Хотите потренироваться отвечать и говорить на иврите без ступора и переводчика?
Переходите по ссылке в шапке профиля @ulpana_alef — там открыт интерактивный тренажёр живых диалогов и звонков.
Промокод на 30 дней бесплатного доступа: INSTA ✨

💬 Напишите «ИВРИТ» в комментариях 👇 — и мы пришлём прямую ссылку в Директ!

#иврит #урокииврита #ивритдляначинающих #ивритизраиль #ульпан #ульпаналеф #репатриация #жизньвизраиле #олимхадашим #разговорныйиврит
`;
  fs.writeFileSync(path.resolve(outDir, 'post_instagram.txt'), igText, 'utf8');

  // 4. YouTube Shorts / TikTok (SEO & Timestamps)
  const ytText = `${scenario.titleLine1} ${scenario.titleLine2} | Иврит без паники

${scenario.subtitle}

0:00 - Обзор темы
0:03 - ${p1.badge}
0:08 - ${p2.badge}
0:13 - ${p3.badge}
0:18 - ${p4.badge}

🔥 Интерактивный тренажёр живой речи «Ульпан Алеф» (30 дней бесплатно по промокоду YOUTUBE):
👉 https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=YOUTUBE&utm_source=youtube&utm_medium=shorts&utm_campaign=${scenario.id}

#иврит #ульпан #израиль #репатриация #shorts
`;
  fs.writeFileSync(path.resolve(outDir, 'post_youtube_shorts.txt'), ytText, 'utf8');
}

export async function buildCampaignPackage(scenarioId) {
  const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'));
  const sc = scenarios.find(s => s.id === scenarioId);
  if (!sc) throw new Error(`Сценарий ${scenarioId} не найден в каталоге!`);

  console.log(`\n=============================================================`);
  console.log(`🏭 ЗАПУСК ФАБРИКИ ДЛЯ КАМПАНИИ: ${sc.id} («${sc.topic}»)`);
  console.log(`=============================================================`);

  const campaignOutDir = path.resolve(CAMPAIGNS_DIR, sc.id);
  if (!fs.existsSync(campaignOutDir)) fs.mkdirSync(campaignOutDir, { recursive: true });

  const squareMp4 = path.resolve(campaignOutDir, 'video_square_1080x1080.mp4');
  const verticalMp4 = path.resolve(campaignOutDir, 'video_vertical_1080x1920.mp4');
  const fbText = path.resolve(campaignOutDir, 'post_facebook.txt');
  if (
    fs.existsSync(squareMp4) && fs.statSync(squareMp4).size > 200000 &&
    fs.existsSync(verticalMp4) && fs.statSync(verticalMp4).size > 200000 &&
    fs.existsSync(fbText)
  ) {
    console.log(`   ⚡ [Video Gate R-27] Пакет ${sc.id} уже полностью смонтирован и готов. Пропуск.`);
    return { id: sc.id, dir: campaignOutDir, squareMp4, verticalMp4 };
  }

  // 1. Обеспечение чистого аудио TTS
  console.log(`\n1️⃣ Проверка аудиобанка и синтез Gemini TTS...`);
  const audioFiles = await ensureScenarioAudio(sc);

  // 2. Рендеринг слайдов 1:1 (Квадрат для FB/IG)
  console.log(`\n2️⃣ Рендеринг 5 слайдов 1:1 (1080x1080)...`);
  const squareImages = await renderSlides(sc, campaignOutDir, '1:1');

  // 3. Рендеринг слайдов 9:16 (Вертикал для Shorts/Reels/TikTok)
  console.log(`\n3️⃣ Рендеринг 5 слайдов 9:16 (1080x1920)...`);
  const verticalImages = await renderSlides(sc, campaignOutDir, '9:16');

  // 4. Сборка квадратного MP4
  console.log(`\n4️⃣ Сборка квадратного мастер-видео MP4...`);
  await assembleVideoFromSlides(squareImages, audioFiles, squareMp4, false);
  console.log(`   ✅ Готово: ${squareMp4} (${(fs.statSync(squareMp4).size / 1024 / 1024).toFixed(2)} MB)`);

  // 5. Сборка вертикального MP4
  console.log(`\n5️⃣ Сборка вертикального мастер-видео 9:16 MP4...`);
  await assembleVideoFromSlides(verticalImages, audioFiles, verticalMp4, true);
  console.log(`   ✅ Готово: ${verticalMp4} (${(fs.statSync(verticalMp4).size / 1024 / 1024).toFixed(2)} MB)`);

  // 6. Генерация копирайтинга под 4 платформы
  console.log(`\n6️⃣ Генерация адаптированных текстов (FB, TG, IG, YT/TT)...`);
  generateCopywriting(sc, campaignOutDir);

  console.log(`\n🎉 ПАКЕТ КАМПАНИИ ${sc.id} УСПЕШНО СОБРАН И ГОТОВ К ВЫКЛАДКЕ!`);
  console.log(`📁 Директория: ${campaignOutDir}\n`);

  return {
    id: sc.id,
    dir: campaignOutDir,
    squareMp4,
    verticalMp4,
    squareImages,
    verticalImages
  };
}

async function main() {
  const args = process.argv.slice(2);
  const targetId = args.find(a => a.startsWith('--id='))?.split('=')[1] || 'sc-01-kindergarten';

  if (targetId === 'all') {
    const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'));
    for (const sc of scenarios) {
      await buildCampaignPackage(sc.id);
    }
  } else {
    await buildCampaignPackage(targetId);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('❌ Ошибка сборщика фабрики:', err.message);
    process.exit(1);
  });
}
