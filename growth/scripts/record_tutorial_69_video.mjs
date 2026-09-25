import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { TUTORIAL_69_CUES } from './generate_tutorial_69_audio.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const OUTPUT_DIR = path.resolve(ROOT, 'public/demo');
const CACHE_DIR = path.resolve(OUTPUT_DIR, 'audio_cache');
const SCENE_HTML = path.resolve(ROOT, 'growth/scenes/tutorial_lesson_69/index.html');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Сборка мастер-аудио учебного видео Урока 69 с de-clicking 15ms
 */
async function buildTutorial69MasterAudio(outputPath = path.join(OUTPUT_DIR, 'tutorial_lesson_69_audio.wav')) {
  console.log('🎙️ Сборка мастер-аудиодорожки учебного видео Урока 69...');
  const sampleRate = 44100;
  const numChannels = 2;

  const loadedClips = [];
  for (const cue of TUTORIAL_69_CUES) {
    const filename = `tut69_${cue.id}.wav`;
    const wavPath = path.join(CACHE_DIR, filename);
    if (!fs.existsSync(wavPath)) {
      throw new Error(`Аудиоклип не найден: ${wavPath}`);
    }

    const rawBuf = fs.readFileSync(wavPath);
    let pcm = rawBuf.subarray(44);
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
      gapAfterSec: cue.gapAfterSec || 0.25,
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

  const tDialogue = visualTimings['02_dialogue_friend'];
  const tPhone = visualTimings['06_phone_nadav_call'];
  const tOutro = visualTimings['10_outro'];

  const sceneTimings = {
    tVocab: 0,
    tDialogue,
    tDialogueUserOffset: visualTimings['04_dialogue_student'] - tDialogue,
    tPhone,
    tPhoneStudentOffset: visualTimings['08_phone_student_reply'] - tPhone,
    tNadavAckOffset: visualTimings['09_phone_nadav_ack'] - tPhone,
    tOutro,
    totalDurationMs: Math.round(totalDurationSec * 1000),
  };

  console.log('⏱️ Рассчитанные тайминги учебного видео Урока 69 (ms):', sceneTimings);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'tutorial_69_scene_timings.json'), JSON.stringify(sceneTimings, null, 2));

  // Сведение общего PCM буфера
  const totalSamplesCount = Math.ceil(totalDurationSec * sampleRate) * numChannels;
  const masterBuffer = new Int16Array(totalSamplesCount);

  let writeSampleOffset = 0;
  for (const clip of loadedClips) {
    masterBuffer.set(clip.samples, writeSampleOffset);
    writeSampleOffset += clip.samples.length + Math.round(clip.gapAfterSec * sampleRate * numChannels);
  }

  // Запись WAV заголовка
  const header = Buffer.alloc(44);
  const dataByteLen = masterBuffer.byteLength;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28);
  header.writeUInt16LE(numChannels * 2, 32);
  header.writeUInt16LE(16, 34); // 16-bit
  header.write('data', 36);
  header.writeUInt32LE(dataByteLen, 40);

  fs.writeFileSync(outputPath, Buffer.concat([header, Buffer.from(masterBuffer.buffer)]));
  console.log(`✅ Мастер-аудио готово: ${outputPath} (${totalDurationSec.toFixed(2)}s)`);

  return { outputPath, sceneTimings, totalDurationSec };
}

/**
 * Запись ролика через Playwright и сведение в FFmpeg
 */
async function recordAndRender(sceneTimings, totalDurationSec, masterAudioPath) {
  console.log('\n🎬 Запуск Playwright для покадровой видеозаписи учебного видео Урока 69...');
  const tempVideoDir = path.join(OUTPUT_DIR, 'temp_tut69_record');
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
    window.startTutorialTimeline(timings);
  }, sceneTimings);

  const recordWaitMs = Math.round(totalDurationSec * 1000) + 1200;
  console.log(`  -> Запись видео (${(recordWaitMs / 1000).toFixed(1)}s)...`);
  await sleep(recordWaitMs);

  await page.close();
  await context.close();
  await browser.close();

  // Находим записанный webm
  const recordedFiles = fs.readdirSync(tempVideoDir).filter((f) => f.endsWith('.webm'));
  if (!recordedFiles.length) {
    throw new Error('Playwright не создал webm видео');
  }
  const rawWebm = path.join(tempVideoDir, recordedFiles[0]);

  // Финальный путь MP4 для Shorts/Reels
  const finalMp4 = path.join(OUTPUT_DIR, 'tutorial_lesson_69.mp4');
  console.log(`\n🎞️ Сведение мастер-видео и аудио в FFmpeg -> ${finalMp4}...`);

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
    finalMp4,
  ];

  const res = cp.spawnSync(FFMPEG_PATH, ffmpegArgs);
  if (res.status !== 0) {
    console.error('❌ Ошибка сведения FFmpeg:', res.stderr.toString());
    throw new Error('FFmpeg error');
  }

  // Удаляем временный webm
  fs.rmSync(tempVideoDir, { recursive: true, force: true });

  const stat = fs.statSync(finalMp4);
  console.log(`\n🎉 УЧЕБНОЕ ВИДЕО УРОКА 69 УСПЕШНО СМОНТИРОВАНО!`);
  console.log(`📁 Файл: ${finalMp4} (${(stat.size / 1024 / 1024).toFixed(2)} MB, ${totalDurationSec.toFixed(1)} сек)`);
  return finalMp4;
}

async function main() {
  const { outputPath: masterAudioPath, sceneTimings, totalDurationSec } = await buildTutorial69MasterAudio();
  const finalVideo = await recordAndRender(sceneTimings, totalDurationSec, masterAudioPath);
  return finalVideo;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Фатальная ошибка сборки видео:', err);
    process.exit(1);
  });
}
