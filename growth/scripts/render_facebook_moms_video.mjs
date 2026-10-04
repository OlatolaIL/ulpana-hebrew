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
const OUT_DIR = path.resolve(ROOT, 'growth/output');
const SLIDES_DIR = path.resolve(OUT_DIR, 'slides');
const AUDIO_DIR = path.resolve(ROOT, 'public/audio/moms');
const BG_IMG_PATH = path.resolve(ROOT, 'public/images/marketing/latte_mama_kindergarten.jpg');

if (!fs.existsSync(SLIDES_DIR)) {
  fs.mkdirSync(SLIDES_DIR, { recursive: true });
}

// Конвертируем фоновую картинку в base64 для надежного рендера в Playwright
const bgBase64 = fs.existsSync(BG_IMG_PATH) 
  ? `data:image/jpeg;base64,${fs.readFileSync(BG_IMG_PATH).toString('base64')}`
  : '';

const slidesData = [
  {
    type: 'hook',
    badge: 'УЧИМ ИВРИТ • САДИК 🧸',
    tag: 'УТРО 7:30 • МАЛЫШ ЗАБОЛЕЛ',
    titleLine1: 'Что написать',
    titleLine2: 'воспитательнице на иврите?',
    subtitle: '4 готовые фразы в чат садика: температура, продлёнка, пропущенный день',
    previewBadge: 'ВНУТРИ С ОЗВУЧКОЙ:',
    previewHe: 'בּוֹקֶר טוֹב • יֵשׁ לוֹ חוֹם • צַהֲרוֹן',
    hint: '🔊 Включайте звук • 4 фразы с транскрипцией ➔'
  },
  {
    type: 'phrase',
    num: '1',
    badge: '1️⃣ ПРИБОЛЕЛ И ДОМА',
    ru: '«Доброе утро, Даниэль неважно себя чувствует и остаётся дома»',
    he: 'בּוֹקֶר טוֹב, דָּנִיאֵל לֹא מַרְגִּישׁ טוֹב הַבֹּקֶר וְנִשְׁאָר בַּבַּיִת.',
    trans: '(Бо́кер тов, Даниэ́ль ло марги́ш тов hа-бо́кер вэ-ниш’а́р ба-ба́ит)',
    audioFile: path.resolve(AUDIO_DIR, 'kg_phrase_1.mp3')
  },
  {
    type: 'phrase',
    num: '2',
    badge: '2️⃣ ПОДНЯЛАСЬ ТЕМПЕРАТУРА',
    ru: '«Здравствуйте, у него с ночи температура. Мы идём к врачу»',
    he: 'שָׁלוֹם, יֵשׁ לוֹ חוֹם מֵהַלַּיְלָה. אֲנַחְנוּ הוֹלְכִים לָרוֹפֵא.',
    trans: '(Шало́м, йеш ло хом мэ-hа-ла́йла. Ана́хну hольхи́м ла-рофэ́)',
    audioFile: path.resolve(AUDIO_DIR, 'kg_phrase_2.mp3')
  },
  {
    type: 'phrase',
    num: '3',
    badge: '3️⃣ ЗАБРАТЬ ДО ПРОДЛЁНКИ',
    ru: '«Сегодня заберу его пораньше, около 13:30, до продлёнки»',
    he: 'הַיּוֹם אֶקַּח אוֹתוֹ מֻקְדָּם, בִּסְבִיבוֹת אַחַת וָחֵצִי, לִפְנֵי הַצַּהֲרוֹן.',
    trans: '(hайо́м эка́х ото́ мукда́м, би-свиво́т аха́т ва-хэ́ци, лифнэ́й hа-цаhаро́н)',
    audioFile: path.resolve(AUDIO_DIR, 'kg_phrase_3.mp3')
  },
  {
    type: 'phrase',
    num: '4',
    badge: '4️⃣ ЗАБЫЛ КЕПКУ НА ПЛОЩАДКЕ',
    ru: '«Он забыл кепку в песочнице, можно проверить, пожалуйста?»',
    he: 'הוּא שָׁכַח אֶת הַכּוֹבַע שֶׁלּוֹ בְּאַרְגַּז הַחוֹל, אֶפְשָׁר לִבְדּוֹק בְּבַקָּשָׁה?',
    trans: '(hу шаха́х эт hа-ко́ва шело́ бэ-арга́з hа-холь, эфша́р ливдо́к бэ-вакаша́?)',
    audioFile: path.resolve(AUDIO_DIR, 'kg_phrase_4.mp3')
  }
];

function getHtmlForSlide(slide) {
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
    width: 1080px; height: 1080px;
    background: #090d16;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #ffffff;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 70px;
    position: relative;
    overflow: hidden;
  }
  .bg-img {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('${bgBase64}');
    background-size: cover; background-position: center;
    opacity: 0.24;
    filter: blur(2px);
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
    background: rgba(15, 23, 42, 0.82);
    border: 1.5px solid rgba(255, 255, 255, 0.14);
    border-radius: 36px;
    padding: 52px 48px;
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
    font-size: 52px; font-weight: 900; color: #f87171;
    line-height: 1.15; margin-bottom: 10px;
    font-family: 'Rubik', sans-serif;
  }
  .hero-title-2 {
    font-size: 64px; font-weight: 900; color: #ffffff;
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
    font-size: 20px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .preview-he {
    font-size: 38px;
    font-weight: 700;
    color: #38bdf8;
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
  .dots {
    display: flex; gap: 10px;
  }
  .dot {
    width: 14px; height: 14px; border-radius: 50%; background: #475569;
  }
  .dot.active {
    background: #fbbf24; width: 36px; border-radius: 8px;
  }
</style>
</head>
<body>
  <div class="bg-img"></div>
  <div class="overlay"></div>
  <div class="content">
    <div class="top-bar">
      <div class="badge">${slide.badge}</div>
      <div class="brand">УЛЬПАН АЛЕФ</div>
    </div>
    <div class="hero-box">
      <div class="hero-tag">${slide.tag}</div>
      <div class="hero-title-1">${slide.titleLine1}</div>
      <div class="hero-title-2">${slide.titleLine2}</div>
      <div class="hero-subtitle">${slide.subtitle}</div>
      <div class="preview-box">
        <span class="preview-badge">${slide.previewBadge}</span>
        <span class="preview-he">${slide.previewHe}</span>
      </div>
    </div>
    <div class="bottom-bar">
      <div class="hint-text">${slide.hint}</div>
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

  // Слайд с фразой
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
    width: 1080px; height: 1080px;
    background: #090d16;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #ffffff;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 60px;
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
    padding: 50px 48px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  }
  .ru-label {
    font-size: 22px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .ru-text {
    font-size: 34px; font-weight: 600; color: #ffffff;
    line-height: 1.35; margin-bottom: 38px;
  }
  .divider {
    height: 1px; background: rgba(255, 255, 255, 0.12);
    margin-bottom: 36px;
  }
  .he-text {
    font-size: 48px; font-weight: 700; color: #38bdf8;
    direction: rtl; text-align: right;
    line-height: 1.5;
    font-family: 'Assistant', 'Rubik', 'Segoe UI', Arial, sans-serif;
    font-feature-settings: "kern" 1, "mark" 1, "mkmk" 1, "liga" 1;
    text-rendering: optimizeLegibility;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
  }
  .trans-text {
    font-size: 28px; font-weight: 500; font-style: italic; color: #fbbf24;
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
  .sound-wave {
    display: flex; align-items: center; gap: 4px;
  }
  .wave-bar {
    width: 4px; border-radius: 2px; background: #38bdf8;
  }
  .w1 { height: 12px; }
  .w2 { height: 22px; }
  .w3 { height: 16px; }
  .w4 { height: 26px; }
  .w5 { height: 14px; }
  .dots {
    display: flex; gap: 10px;
  }
  .dot {
    width: 14px; height: 14px; border-radius: 50%; background: #475569;
  }
  .dot.active {
    background: #38bdf8; width: 36px; border-radius: 8px;
  }
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
      <div class="he-text" lang="he" dir="rtl">${slide.he}</div>
      <div class="trans-text">${slide.trans}</div>
    </div>
    <div class="bottom-bar">
      <div class="sound-indicator">
        <div class="sound-wave">
          <div class="wave-bar w1"></div>
          <div class="wave-bar w2"></div>
          <div class="wave-bar w4"></div>
          <div class="wave-bar w3"></div>
          <div class="wave-bar w5"></div>
        </div>
        <span>Иврит носителем (слушайте)</span>
      </div>
      <div class="dots">
        ${dotsHtml}
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function renderSlideImages() {
  console.log('🎨 Рендеринг 5 слайдов через Playwright (1080x1080)...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const imagePaths = [];
  for (let i = 0; i < slidesData.length; i++) {
    const slide = slidesData[i];
    const html = getHtmlForSlide(slide);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const imgPath = path.resolve(SLIDES_DIR, `slide_${i + 1}.png`);
    await page.screenshot({ path: imgPath });
    imagePaths.push(imgPath);
    console.log(`   ✅ Слайд ${i + 1}: ${imgPath}`);
  }

  await browser.close();
  return imagePaths;
}

function getAudioDuration(file) {
  try {
    const res = cp.spawnSync(FFMPEG_PATH, ['-i', file], { encoding: 'utf8' });
    const match = (res.stderr || '').match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (match) {
      const h = parseFloat(match[1]);
      const m = parseFloat(match[2]);
      const s = parseFloat(match[3]);
      return h * 3600 + m * 60 + s;
    }
  } catch (e) {}
  return 4.5;
}

async function assembleVideo(imagePaths) {
  console.log('\n🎬 Сборка видеоролика из 5 слайдов через FFmpeg (Filter Complex Timeline)...');

  // Определяем точные длительности для каждого слайда и готовим аудиодорожки
  const slideDurations = [3.0]; // Слайд 1: 3.0 сек
  const audioChunks = [];

  // Чанк 1: 3.0 сек чистой стерео-тишины
  const chunk1 = path.resolve(OUT_DIR, 'audio_chunk_1.wav');
  cp.execSync(`"${FFMPEG_PATH}" -y -f lavfi -i anullsrc=r=44100:cl=stereo -t 3.0 -c:a pcm_s16le "${chunk1}"`, { stdio: 'ignore' });
  audioChunks.push(chunk1);

  // Чанки 2-5: аудио фраз с гарантированным падингом (0.5с) и приведением к стерео 44.1кГц
  for (let i = 1; i < slidesData.length; i++) {
    const slide = slidesData[i];
    const chunkPath = path.resolve(OUT_DIR, `audio_chunk_${i + 1}.wav`);
    const rawDur = getAudioDuration(slide.audioFile);
    const padSec = i === slidesData.length - 1 ? 0.8 : 0.5;
    const totalDur = parseFloat((rawDur + padSec).toFixed(2));
    slideDurations.push(totalDur);

    console.log(`   Аудио чанк ${i + 1} (${slide.badge}): ${rawDur.toFixed(2)}с + ${padSec}с пауза = ${totalDur}с`);
    // Нормализация аудио в стерео 44.1кГц с добавлением тишины в хвост до точной длительности totalDur
    const filter = `aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=stereo,apad`;
    cp.execSync(`"${FFMPEG_PATH}" -y -i "${slide.audioFile}" -af "${filter}" -t ${totalDur} -c:a pcm_s16le "${chunkPath}"`, { stdio: 'ignore' });
    audioChunks.push(chunkPath);
  }

  // 1. Склейка всех 5 аудиочастей в единый мастер-аудиофайл
  const masterAudio = path.resolve(OUT_DIR, 'master_audio.wav');
  console.log('\n🎙️ Склейка единой непрерывной мастер-аудиодорожки...');
  const audioInputs = audioChunks.map(c => `-i "${c}"`).join(' ');
  const audioFilter = `[0:a][1:a][2:a][3:a][4:a]concat=n=5:v=0:a=1[outa]`;
  cp.execSync(`"${FFMPEG_PATH}" -y ${audioInputs} -filter_complex "${audioFilter}" -map "[outa]" -c:a pcm_s16le "${masterAudio}"`, { stdio: 'ignore' });

  // 2. Сборка видеоряда: каждый слайд зациклен строго на свою длительность
  const finalVideo = path.resolve(OUT_DIR, 'kindergarten_facebook_slides.mp4');
  console.log('\n🎞️ Сборка финального MP4 с единым аудио и видеорядом...');
  const videoInputs = imagePaths.map((p, idx) => `-loop 1 -t ${slideDurations[idx]} -i "${p}"`).join(' ');
  const videoFilter = `[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[outv]`;
  const renderCmd = `"${FFMPEG_PATH}" -y ${videoInputs} -i "${masterAudio}" -filter_complex "${videoFilter}" -map "[outv]" -map 5:a -c:v libx264 -pix_fmt yuv420p -r 25 -c:a aac -b:a 192k -shortest "${finalVideo}"`;
  cp.execSync(renderCmd, { stdio: 'ignore' });

  // Удаляем временные аудио-чанки
  try {
    audioChunks.forEach(f => fs.unlinkSync(f));
    fs.unlinkSync(masterAudio);
  } catch {}

  const sizeMb = (fs.statSync(finalVideo).size / 1024 / 1024).toFixed(2);
  console.log(`\n🎉 ФИНАЛЬНОЕ ВИДЕО УСПЕШНО СОБРАНО!`);
  console.log(`📁 Путь: ${finalVideo}`);
  console.log(`📦 Размер: ${sizeMb} MB`);
  return finalVideo;
}

async function main() {
  const images = await renderSlideImages();
  await assembleVideo(images);
}

main().catch(console.error);
