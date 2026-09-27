import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const LESSONS_DIR = path.resolve(DEMO_DIR, 'lessons');

if (!fs.existsSync(LESSONS_DIR)) {
  fs.mkdirSync(LESSONS_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function recordShortsVariant({
  variantName,
  sceneHtmlPath,
  masterAudioPath,
  timingsJsonPath,
  outputMp4Path,
}) {
  console.log(`\n======================================================`);
  console.log(`🎬 ЗАПИСЬ YOUTUBE SHORTS [${variantName}] ЧЕРЕЗ PLAYWRIGHT`);
  console.log(`======================================================`);

  if (!fs.existsSync(sceneHtmlPath)) {
    throw new Error(`Сцена не найдена: ${sceneHtmlPath}`);
  }
  if (!fs.existsSync(masterAudioPath)) {
    throw new Error(`Мастер-аудио не найдено: ${masterAudioPath}`);
  }
  if (!fs.existsSync(timingsJsonPath)) {
    throw new Error(`Тайминги не найдены: ${timingsJsonPath}`);
  }

  const timings = JSON.parse(fs.readFileSync(timingsJsonPath, 'utf8'));
  const totalDurationSec = timings.totalDurationSec || 18.0;

  const tempVideoDir = path.join(DEMO_DIR, `temp_record_${variantName.toLowerCase()}`);
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

  console.log('  -> Запуск Chromium (Mobile 390x844 @ 2x Retina)...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();
  const fileUrl = 'file://' + sceneHtmlPath.replace(/\\/g, '/');
  console.log(`  -> Открытие страницы сцены: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  console.log('  -> Старт анимационной шкалы...');
  await page.evaluate((t) => {
    window.startReelsTimeline(t);
  }, timings);

  const recordWaitMs = Math.round(totalDurationSec * 1000) + 1200;
  console.log(`  -> Запись видео (${(recordWaitMs / 1000).toFixed(1)} сек) и покадровый контроль...`);

  // Покадровый контроль каждой сцены
  const varLower = variantName.toLowerCase();
  await sleep(2000);
  await page.screenshot({ path: path.join(DEMO_DIR, `frame_${varLower}_01_hook.png`) });

  await sleep(4000);
  await page.screenshot({ path: path.join(DEMO_DIR, `frame_${varLower}_02_blunder.png`) });

  await sleep(10000);
  await page.screenshot({ path: path.join(DEMO_DIR, `frame_${varLower}_03_trainer.png`) });

  const remainingBeforeOutro = Math.max(1000, (recordWaitMs - 16000 - 4500));
  await sleep(remainingBeforeOutro);
  await sleep(4500); // момент после pop-in промокода
  await page.screenshot({ path: path.join(DEMO_DIR, `frame_${varLower}_04_outro_yt.png`) });

  const remaining = recordWaitMs - (2000 + 4000 + 10000 + remainingBeforeOutro + 4500);
  if (remaining > 0) await sleep(remaining);

  await page.close();
  await context.close();
  await browser.close();

  // Находим webm
  const recordedFiles = fs.readdirSync(tempVideoDir).filter((f) => f.endsWith('.webm'));
  if (!recordedFiles.length) {
    throw new Error(`Playwright не создал webm видео для ${variantName}`);
  }
  const rawWebm = path.join(tempVideoDir, recordedFiles[0]);

  console.log(`  -> FFmpeg сведение с аудио и кодирование в MP4 (780x1688 Retina HD, H.264 / AAC 192k)...`);
  const ffmpegArgs = [
    '-y',
    '-i', rawWebm,
    '-i', masterAudioPath,
    '-vf', 'scale=780:1688:flags=lanczos',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outputMp4Path,
  ];

  const res = cp.spawnSync(ffmpeg, ffmpegArgs);
  if (res.status !== 0) {
    console.error('❌ Ошибка сведения FFmpeg:', res.stderr?.toString());
    throw new Error(`FFmpeg error for ${variantName}`);
  }

  // Очистка временного webm
  try {
    fs.rmSync(tempVideoDir, { recursive: true, force: true });
  } catch (_) {}

  const stat = fs.statSync(outputMp4Path);
  console.log(`✅ [${variantName}] РОЛИК ГОТОВ!`);
  console.log(`📁 Файл: ${outputMp4Path}`);
  console.log(`📊 Размер: ${(stat.size / 1024 / 1024).toFixed(2)} MB • Длительность: ~${totalDurationSec.toFixed(1)} сек\n`);

  return outputMp4Path;
}

export async function recordAllLesson01Shorts() {
  console.log('\n======================================================');
  console.log('🚀 СЪЁМКА ВИРАЛЬНЫХ РОЛИКОВ ДЛЯ УРОКА 1 (YOUTUBE SHORTS)');
  console.log('======================================================\n');

  // 1. Вариант A: Clean (Ad-Safe)
  const cleanVideo = await recordShortsVariant({
    variantName: 'CLEAN',
    sceneHtmlPath: path.resolve(ROOT, 'growth/scenes/lesson_01_clean/index.html'),
    masterAudioPath: path.resolve(DEMO_DIR, 'lesson_01_clean_master_audio.wav'),
    timingsJsonPath: path.resolve(DEMO_DIR, 'lesson_01_clean_timings.json'),
    outputMp4Path: path.resolve(LESSONS_DIR, 'lesson_01_clean_youtube_shorts.mp4'),
  });

  // 2. Вариант B: Spicy (Organic)
  const spicyVideo = await recordShortsVariant({
    variantName: 'SPICY',
    sceneHtmlPath: path.resolve(ROOT, 'growth/scenes/lesson_01_spicy/index.html'),
    masterAudioPath: path.resolve(DEMO_DIR, 'lesson_01_spicy_master_audio.wav'),
    timingsJsonPath: path.resolve(DEMO_DIR, 'lesson_01_spicy_timings.json'),
    outputMp4Path: path.resolve(LESSONS_DIR, 'lesson_01_spicy_youtube_shorts.mp4'),
  });

  console.log('======================================================');
  console.log('🎉 ВСЕ РОЛИКИ УРОКА 1 ДЛЯ YOUTUBE SHORTS УСПЕШНО СНЯТЫ!');
  console.log(`  1. Clean : ${cleanVideo}`);
  console.log(`  2. Spicy : ${spicyVideo}`);
  console.log('======================================================\n');

  return { cleanVideo, spicyVideo };
}

if (process.argv[1]?.endsWith('record_lesson_01_shorts.mjs')) {
  recordAllLesson01Shorts().catch((err) => {
    console.error('❌ Ошибка съёмки роликов:', err);
    process.exit(1);
  });
}
