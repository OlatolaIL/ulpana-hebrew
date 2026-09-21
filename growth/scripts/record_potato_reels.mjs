import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { POTATO_CUES_CONFIG } from './generate_potato_audio.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const OUTPUT_DIR = path.resolve(ROOT, 'public/demo');
const CACHE_DIR = path.resolve(OUTPUT_DIR, 'audio_cache');
const SCENE_HTML = path.resolve(ROOT, 'growth/scenes/potato_fresh/index.html');
const PROMO_OUTPUT_DIR = path.resolve(ROOT, 'growth/output');

if (!fs.existsSync(PROMO_OUTPUT_DIR)) fs.mkdirSync(PROMO_OUTPUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buildMasterAudio(outputPath = path.join(OUTPUT_DIR, 'reels_potato_audio.wav')) {
  console.log('🎙️ Сборка мастер-аудиодорожки «Картофельный фреш» с косинусным de-clicking...');
  const sampleRate = 44100;
  const numChannels = 2;

  const loadedClips = [];
  for (const cue of POTATO_CUES_CONFIG) {
    const filename = `potato_${cue.id}.wav`;
    const wavPath = path.join(CACHE_DIR, filename);
    if (!fs.existsSync(wavPath)) {
      throw new Error(`Аудиоклип не найден: ${wavPath}`);
    }

    const rawBuf = fs.readFileSync(wavPath);
    const pcm = rawBuf.subarray(44);
    const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2);

    // Косинусное сглаживание 15ms (de-clicking R-25)
    const fadeLen = Math.floor(sampleRate * 0.015);
    const clipSamples = samples.length / numChannels;

    for (let i = 0; i < clipSamples; i++) {
      let fade = 1.0;
      if (i < fadeLen) {
        fade = 0.5 * (1 - Math.cos((Math.PI * i) / fadeLen));
      } else if (i > clipSamples - fadeLen) {
        fade = 0.5 * (1 - Math.cos((Math.PI * (clipSamples - i)) / fadeLen));
      }

      for (let ch = 0; ch < numChannels; ch++) {
        const idx = i * numChannels + ch;
        samples[idx] = Math.round(samples[idx] * fade);
      }
    }

    const durationSec = clipSamples / sampleRate;
    loadedClips.push({
      id: cue.id,
      samples,
      durationSec,
      gapAfterSec: cue.gapAfterSec || 0.3,
    });
  }

  // Расчет таймкодов
  let currentTime = 0;
  const visualTimings = {};

  for (const clip of loadedClips) {
    visualTimings[clip.id] = Math.round(currentTime * 1000);
    currentTime += clip.durationSec + clip.gapAfterSec;
  }
  const totalDurationSec = currentTime;

  const vendorClip = loadedClips.find((c) => c.id === 'cue_03_vendor');
  const vendorDurationMs = Math.round((vendorClip?.durationSec || 2.5) * 1000);

  // Таймкоды сцен:
  // 1. Старт ларька: 0
  // 2. Ученик заказывает: visualTimings['cue_02_student']
  // 3. Реакция продавца: visualTimings['cue_03_vendor']
  // 4. Показ стакана с картофельным фрешем: сразу после вопроса продавца
  // 5. Разбор семейства яблок: через 3.2с после старта Cue 04
  // 6. Outro: visualTimings['cue_05_outro']
  const sceneTimings = {
    tStall: 0,
    tStudent: visualTimings['cue_02_student'],
    tVendor: visualTimings['cue_03_vendor'],
    tDrink: visualTimings['cue_03_vendor'] + vendorDurationMs + 100,
    tBreakdown: visualTimings['cue_04_breakdown'] + 3200,
    tOutro: visualTimings['cue_05_outro'],
    totalDurationMs: Math.round(totalDurationSec * 1000),
  };

  console.log('⏱️ Рассчитанные тайминги сцен (ms):', sceneTimings);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'potato_scene_timings.json'), JSON.stringify(sceneTimings, null, 2));

  // Сведение мастер PCM
  const totalSamplesCount = Math.ceil(totalDurationSec * sampleRate) * numChannels;
  const masterBuffer = new Int16Array(totalSamplesCount);

  let writeSampleOffset = 0;
  for (const clip of loadedClips) {
    masterBuffer.set(clip.samples, writeSampleOffset);
    writeSampleOffset += clip.samples.length + Math.round(clip.gapAfterSec * sampleRate * numChannels);
  }

  // Наложение звуковых эффектов (SFX) для усиления динамики и юмора
  const sfxDir = path.resolve(ROOT, 'public/demo/sfx');
  function mixSfx(sfxPath, startSec, volume = 1.0) {
    if (!fs.existsSync(sfxPath)) return;
    const raw = fs.readFileSync(sfxPath);
    const pcm = raw.subarray(44);
    const sfxSamples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2);
    const startIdx = Math.round(startSec * sampleRate) * numChannels;

    for (let i = 0; i < sfxSamples.length; i++) {
      const targetIdx = startIdx + i;
      if (targetIdx < masterBuffer.length) {
        const mixed = masterBuffer[targetIdx] + Math.round(sfxSamples[i] * volume);
        masterBuffer[targetIdx] = Math.max(-32768, Math.min(32767, mixed));
      }
    }
  }

  // 1. Record scratch на стыке вопроса ученика и ступора продавца
  mixSfx(path.join(sfxDir, 'scratch.wav'), (visualTimings['cue_03_vendor'] - 350) / 1000, 1.2);
  // 2. Boing на реплику продавца и показ картофелины
  mixSfx(path.join(sfxDir, 'boing.wav'), visualTimings['cue_03_vendor'] / 1000, 0.9);
  // 3. Chime на картофельный фреш и разбор правильного слова «апельсин»
  mixSfx(path.join(sfxDir, 'chime.wav'), sceneTimings.tDrink / 1000, 0.8);
  mixSfx(path.join(sfxDir, 'chime.wav'), (visualTimings['cue_04_breakdown'] + 11100) / 1000, 0.7);

  const header = Buffer.alloc(44);
  const dataByteLen = masterBuffer.byteLength;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28);
  header.writeUInt16LE(numChannels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataByteLen, 40);

  fs.writeFileSync(outputPath, Buffer.concat([header, Buffer.from(masterBuffer.buffer)]));
  console.log(`✅ Мастер-аудио готово: ${outputPath} (${totalDurationSec.toFixed(2)}s)`);

  return { outputPath, sceneTimings, totalDurationSec };
}

async function recordVideo(sceneTimings, totalDurationSec, masterAudioPath) {
  console.log('\n🎬 Запуск Playwright для покадровой видеозаписи...');
  const tempVideoDir = path.join(OUTPUT_DIR, 'temp_potato_record');
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });

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
  const fileUrl = 'file://' + SCENE_HTML.replace(/\\/g, '/');
  console.log(`  -> Открытие страницы сцен: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  console.log('  -> Запуск таймлайна анимации...');
  await page.evaluate((timings) => {
    window.startPotatoTimeline(timings);
  }, sceneTimings);

  const recordWaitMs = Math.round(totalDurationSec * 1000) + 1200;
  console.log(`  -> Запись видео (${(recordWaitMs / 1000).toFixed(1)}s)...`);
  await sleep(recordWaitMs);

  await page.close();
  await context.close();
  await browser.close();

  const recordedFiles = fs.readdirSync(tempVideoDir).filter((f) => f.endsWith('.webm'));
  if (!recordedFiles.length) throw new Error('Playwright не создал webm');
  const rawWebm = path.join(tempVideoDir, recordedFiles[0]);

  const masterMp4 = path.join(OUTPUT_DIR, 'reels_potato_master.mp4');
  console.log(`\n🎞️ Сведение мастер-видео и аудио в FFmpeg -> ${masterMp4}...`);

  const ffmpegArgs = [
    '-y',
    '-i', rawWebm,
    '-i', masterAudioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    masterMp4,
  ];

  const res = cp.spawnSync(FFMPEG_PATH, ffmpegArgs);
  if (res.status !== 0) throw new Error(`FFmpeg error: ${res.stderr.toString()}`);
  fs.rmSync(tempVideoDir, { recursive: true, force: true });

  return masterMp4;
}

async function renderYouTubeShorts(masterMp4, overlayStartSec) {
  const finalYoutubeMp4 = path.join(PROMO_OUTPUT_DIR, 'reels_potato_youtube.mp4');
  console.log(`\n🎬 Наложение промокода YouTube Shorts -> ${finalYoutubeMp4}...`);

  const winFont = 'C:/Windows/Fonts/arialbd.ttf';
  const hasWinFont = fs.existsSync(winFont);
  const fontClause = hasWinFont ? `fontfile='C\\:/Windows/Fonts/arialbd.ttf':` : '';

  const bgBox = `drawbox=x=0:y=710:w=390:h=126:color=0x070e24@0.98:t=fill:enable='gte(t,${overlayStartSec})'`;
  const innerCard = `drawbox=x=14:y=718:w=362:h=108:color=0x152347@0.95:t=fill:enable='gte(t,${overlayStartSec})'`;
  const line1 = `drawtext=${fontClause}text='ПРОМОКОД\\: YOUTUBE':fontsize=18:fontcolor=0xFFD700:x=(w-text_w)/2:y=730:enable='gte(t,${overlayStartSec})'`;
  const line2 = `drawtext=${fontClause}text='Ссылка в описании видео':fontsize=13:fontcolor=0xFFFFFF:x=(w-text_w)/2:y=758:enable='gte(t,${overlayStartSec})'`;
  const line3 = `drawtext=${fontClause}text='ulpana-hebrew.vercel.app':fontsize=11:fontcolor=0x60A5FA:x=(w-text_w)/2:y=782:enable='gte(t,${overlayStartSec})'`;

  const filter = [bgBox, innerCard, line1, line2, line3].join(',');

  const args = [
    '-y',
    '-i', masterMp4,
    '-vf', filter,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    finalYoutubeMp4,
  ];

  const res = cp.spawnSync(FFMPEG_PATH, args);
  if (res.status !== 0) throw new Error(`FFmpeg error on promo overlay: ${res.stderr.toString()}`);

  const stat = fs.statSync(finalYoutubeMp4);
  console.log(`🎉 ГОТОВ РОЛИК ДЛЯ YOUTUBE SHORTS: ${finalYoutubeMp4} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  return finalYoutubeMp4;
}

async function main() {
  const { outputPath: masterAudioPath, sceneTimings, totalDurationSec } = await buildMasterAudio();
  const masterMp4 = await recordVideo(sceneTimings, totalDurationSec, masterAudioPath);
  const overlayStartSec = (sceneTimings.tOutro / 1000).toFixed(1);
  const youtubeVideo = await renderYouTubeShorts(masterMp4, overlayStartSec);
  return youtubeVideo;
}

main().catch((err) => {
  console.error('❌ Фатальная ошибка:', err);
  process.exit(1);
});
