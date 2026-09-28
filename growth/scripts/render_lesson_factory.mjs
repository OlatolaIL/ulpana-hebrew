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
const CACHE_DIR = path.resolve(DEMO_DIR, 'audio_cache');
const BANK_DIR = path.resolve(DEMO_DIR, 'audio_bank');
const SCENES_DIR = path.resolve(ROOT, 'growth/scenes');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const CATALOG_PATH = path.resolve(ROOT, 'growth/MASTER_TTS_CATALOG.json');

if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true });
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
if (!fs.existsSync(BANK_DIR)) fs.mkdirSync(BANK_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getGeminiApiKeys() {
  const keys = [];
  if (process.env.GEMINI_TTS_API_KEY) keys.push(process.env.GEMINI_TTS_API_KEY);
  if (process.env.GEMINI_TTS_KEY_2) keys.push(process.env.GEMINI_TTS_KEY_2);
  if (process.env.GEMINI_PRIMARY_API_KEY) keys.push(process.env.GEMINI_PRIMARY_API_KEY);
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_SECONDARY_API_KEY) keys.push(process.env.GEMINI_SECONDARY_API_KEY);
  const envPath = path.resolve(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m0 = content.match(/GEMINI_TTS_API_KEY=([^\r\n]+)/);
    const m0b = content.match(/GEMINI_TTS_KEY_2=([^\r\n]+)/);
    const m1 = content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    const m2 = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    const m3 = content.match(/GEMINI_SECONDARY_API_KEY=([^\r\n]+)/);
    if (m0 && !keys.includes(m0[1].trim())) keys.push(m0[1].trim());
    if (m0b && !keys.includes(m0b[1].trim())) keys.push(m0b[1].trim());
    if (m1 && !keys.includes(m1[1].trim())) keys.push(m1[1].trim());
    if (m2 && !keys.includes(m2[1].trim())) keys.push(m2[1].trim());
    if (m3 && !keys.includes(m3[1].trim())) keys.push(m3[1].trim());
  }
  return keys;
}

function sanitizeWavFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const pcm = cp.execFileSync(ffmpeg, [
      '-y',
      '-i', filePath,
      '-f', 's16le',
      '-ar', '44100',
      '-ac', '2',
      'pipe:1',
    ], { maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

    const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
    const sampleRate = 44100;
    const numChannels = 2;
    const clipSamples = Math.floor(samples.length / numChannels);

    // 1. Устранение щелчка в начале (2ms silence + 10ms fade-in)
    const headerSilence = Math.floor(sampleRate * 0.002);
    const fadeIn = Math.floor(sampleRate * 0.010);
    for (let i = 0; i < headerSilence && i < clipSamples; i++) {
      for (let c = 0; c < numChannels; c++) samples[i * numChannels + c] = 0;
    }
    for (let i = headerSilence; i < headerSilence + fadeIn && i < clipSamples; i++) {
      const fade = 0.5 * (1 - Math.cos((Math.PI * (i - headerSilence)) / fadeIn));
      for (let c = 0; c < numChannels; c++) samples[i * numChannels + c] = Math.round(samples[i * numChannels + c] * fade);
    }

    // 2. Детект и обрезка хвоста водяного знака SynthID
    const last200ms = Math.floor(sampleRate * 0.2);
    let tailMax = 0;
    const tailStart = Math.max(0, clipSamples - last200ms);
    for (let j = tailStart * numChannels; j < samples.length; j++) {
      const val = Math.abs(samples[j]);
      if (val > tailMax) tailMax = val;
    }

    let finalClipSamples = clipSamples;
    if (tailMax > 5000) {
      const minSilenceLen = Math.floor(sampleRate * 0.025);
      let silenceCount = 0;
      let cutPoint = clipSamples;
      for (let k = clipSamples - 1; k >= 0; k--) {
        let maxCh = 0;
        for (let c = 0; c < numChannels; c++) {
          const v = Math.abs(samples[k * numChannels + c]);
          if (v > maxCh) maxCh = v;
        }
        if (maxCh < 800) {
          silenceCount++;
          if (silenceCount >= minSilenceLen) {
            cutPoint = k + minSilenceLen;
            break;
          }
        } else {
          silenceCount = 0;
        }
      }
      if (cutPoint < clipSamples) finalClipSamples = cutPoint;
    }

    // 3. Fade out
    const fadeOut = Math.floor(sampleRate * 0.015);
    const fadeOutStart = Math.max(0, finalClipSamples - fadeOut);
    for (let i = fadeOutStart; i < finalClipSamples; i++) {
      const fade = 0.5 * (1 - Math.cos((Math.PI * (finalClipSamples - i)) / fadeOut));
      for (let c = 0; c < numChannels; c++) samples[i * numChannels + c] = Math.round(samples[i * numChannels + c] * fade);
    }

    const finalSamples = samples.subarray(0, finalClipSamples * numChannels);
    const dataByteLen = finalSamples.byteLength;
    const header = Buffer.alloc(44);
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

    fs.writeFileSync(filePath, Buffer.concat([header, Buffer.from(finalSamples.buffer, finalSamples.byteOffset, finalSamples.byteLength)]));
  } catch (_) {}
}

const exhaustedGeminiKeys = new Set();

async function tryGeminiTts(text, voiceName = 'Charon', wavPath, speed = 1.15) {
  const keys = getGeminiApiKeys();
  const models = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.1-flash-tts-preview'];
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    if (exhaustedGeminiKeys.has(keyIdx)) continue;
    const key = keys[keyIdx];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const payload = {
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.status === 429 || res.status === 402) {
          exhaustedGeminiKeys.add(keyIdx);
          break;
        }

        if (!res.ok) continue;

        const json = await res.json();
        const b64Data = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!b64Data) continue;

        const rawAudio = Buffer.from(b64Data, 'base64');
        const isRiff = rawAudio.subarray(0, 4).toString('ascii') === 'RIFF';
        const tempInput = wavPath + (isRiff ? '.in.wav' : '.in.pcm');
        fs.writeFileSync(tempInput, rawAudio);

        const filterArgs = speed !== 1.0 ? ['-filter:a', `atempo=${speed}`] : [];
        const inputArgs = isRiff
          ? ['-i', tempInput]
          : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempInput];

        const conv = cp.spawnSync(ffmpeg, [
          '-y',
          ...inputArgs,
          ...filterArgs,
          '-ar', '44100',
          '-ac', '2',
          wavPath,
        ]);
        try { fs.unlinkSync(tempInput); } catch (_) {}

        if (conv.status === 0 && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 5000) {
          sanitizeWavFile(wavPath);
          return true;
        }
      } catch (_) {}
    }
  }

  // СТРОГИЙ ИНВАРИАНТ R-25: Голоса Microsoft (Edge TTS) в видеопроизводстве ЗАПРЕЩЕНЫ НАВСЕГДА.
  // Никаких фолбэков на Edge Neural TTS! Если Gemini недоступен — возвращаем false.
  return false;
}

const PLATFORMS = [
  {
    code: 'YT',
    name: 'YouTube Shorts',
    ctaCleanTail: 'Промокод для Ютуб — на экране! Тридцать дней бесплатно. Ссылка в описании!',
    ctaSpicyTail: 'Промокод для Ютуб — на экране! Тридцать дней бесплатно. Ссылка под видео!',
  },
  {
    code: 'TG',
    name: 'Telegram',
    ctaCleanTail: 'Промокод для Телеграм — на экране! Тридцать дней бесплатно. Ссылка в посте!',
    ctaSpicyTail: 'Промокод для Телеграм — на экране! Тридцать дней бесплатно. Ссылка в посте!',
  },
  {
    code: 'INSTA',
    name: 'Instagram Reels',
    ctaCleanTail: 'Промокод для Инстаграм — на экране! Тридцать дней бесплатно. Ссылка в шапке профиля!',
    ctaSpicyTail: 'Промокод для Инстаграм — на экране! Тридцать дней бесплатно. Ссылка в шапке профиля!',
  },
  {
    code: 'TIKTOK',
    name: 'TikTok',
    ctaCleanTail: 'Промокод для ТикТок — на экране! Тридцать дней бесплатно. Ссылка в профиле!',
    ctaSpicyTail: 'Промокод для ТикТок — на экране! Тридцать дней бесплатно. Ссылка в профиле!',
  },
  {
    code: 'FB',
    name: 'Facebook Reels',
    ctaCleanTail: 'Промокод для Фейсбук — на экране! Тридцать дней бесплатно. Ссылка в описании!',
    ctaSpicyTail: 'Промокод для Фейсбук — на экране! Тридцать дней бесплатно. Ссылка под видео!',
  },
];

function convertToWavIfNeeded(srcPath, outWavPath, force = false) {
  if (!fs.existsSync(srcPath)) return false;

  if (!force && fs.existsSync(outWavPath) && fs.statSync(outWavPath).size > 3000) {
    const srcMtime = fs.statSync(srcPath).mtimeMs;
    const outMtime = fs.statSync(outWavPath).mtimeMs;
    if (outMtime >= srcMtime) return true;
  }

  const res = cp.spawnSync(ffmpeg, [
    '-y',
    '-i', srcPath,
    '-ar', '44100',
    '-ac', '2',
    outWavPath,
  ]);
  if (res.status === 0 && fs.existsSync(outWavPath)) {
    sanitizeWavFile(outWavPath);
    return true;
  }
  return false;
}

function extractWavPcm(rawBuf) {
  let offset = 12; // Skip 'RIFF', size, 'WAVE'
  while (offset + 8 <= rawBuf.length) {
    const chunkId = rawBuf.toString('ascii', offset, offset + 4);
    const chunkSize = rawBuf.readUInt32LE(offset + 4);
    if (chunkId === 'data') {
      const pcmStart = offset + 8;
      const pcmEnd = Math.min(rawBuf.length, pcmStart + chunkSize);
      return Buffer.from(rawBuf.subarray(pcmStart, pcmEnd));
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++;
  }
  return Buffer.from(rawBuf.subarray(44));
}

function stitchClipsWithDeclick(clips, outWavPath) {
  const sampleRate = 44100;
  const numChannels = 2;
  const fadeLen = Math.floor(sampleRate * 0.015);

  const processed = [];
  let totalDurationSec = 0;
  const visualTimings = {};

  for (const clip of clips) {
    const rawBuf = fs.readFileSync(clip.wavPath);
    const pcmBuf = extractWavPcm(rawBuf);
    const samples = new Int16Array(pcmBuf.buffer, pcmBuf.byteOffset, Math.floor(pcmBuf.byteLength / 2));
    const clipSamples = Math.floor(samples.length / numChannels);

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
    visualTimings[clip.id] = Math.round(totalDurationSec * 1000);

    processed.push({
      id: clip.id,
      samples,
      durationSec,
      gapAfterSec: clip.gapAfterSec || 0.25,
    });

    totalDurationSec += durationSec + (clip.gapAfterSec || 0.25);
  }

  const totalSamplesCount = Math.ceil(totalDurationSec * sampleRate) * numChannels;
  const masterBuffer = new Int16Array(totalSamplesCount);

  let writeSampleOffset = 0;
  for (const item of processed) {
    masterBuffer.set(item.samples, writeSampleOffset);
    writeSampleOffset += item.samples.length + Math.round(item.gapAfterSec * sampleRate * numChannels);
  }

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

  fs.writeFileSync(outWavPath, Buffer.concat([header, Buffer.from(masterBuffer.buffer)]));
  return { totalDurationSec, visualTimings };
}

async function prepareAudioForPlatform(lessonNum, variant, platform) {
  const numPad = String(lessonNum).padStart(2, '0');
  const isClean = variant === 'clean';
  const prefix = `l${numPad}_${variant}`;

  // Найти базовые аудиофайлы из банка
  const cue1Id = `${prefix}_s1_01`;
  const cue2Id = `${prefix}_s2_02`;
  const cue3Id = `${prefix}_s2_03`;
  const cue4Id = (lessonNum === 7 && isClean) ? `${prefix}_s3_05` : `${prefix}_s3_04`;
  const defaultCtaId = (lessonNum === 7 && isClean) ? `${prefix}_s4_06` : `${prefix}_s4_05`;

  const getWav = (cueId) => {
    const wavPath = path.join(CACHE_DIR, `${cueId}.wav`);
    const mp3Bank = path.join(BANK_DIR, `${cueId}.mp3`);
    const mp3Cache = path.join(CACHE_DIR, `${cueId}.mp3`);
    const srcMp3 = fs.existsSync(mp3Bank) ? mp3Bank : mp3Cache;
    if (fs.existsSync(srcMp3)) {
      convertToWavIfNeeded(srcMp3, wavPath);
      return wavPath;
    }
    if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 3000) return wavPath;
    return wavPath;
  };

  const ctaWav = path.join(CACHE_DIR, `${prefix}_cta_${platform.code.toLowerCase()}.wav`);
  if (!fs.existsSync(ctaWav) || fs.statSync(ctaWav).size < 8000) {
    // Получить базовый текст пэйоффа из каталога
    let baseCtaText = isClean
      ? `Урок ${lessonNum} в Ульпан Алеф. Разговаривай свободно и без паники!`
      : `Урок ${lessonNum} в Ульпан Алеф. Спаси ситуацию до того, как станет поздно!`;
    try {
      const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      const item = cat.find((c) => c.id === defaultCtaId);
      if (item && item.text) baseCtaText = item.text;
    } catch (_) {}

    const platformTail = isClean ? platform.ctaCleanTail : platform.ctaSpicyTail;
    const fullCtaText = `${baseCtaText} ${platformTail}`;

    const ok = await tryGeminiTts(fullCtaText, 'Charon', ctaWav, 1.15);
    if (!ok) {
      const defWav = getWav(defaultCtaId);
      if (fs.existsSync(defWav) && fs.statSync(defWav).size > 3000) {
        fs.copyFileSync(defWav, ctaWav);
      } else {
        throw new Error(`❌ СТРОГИЙ ЗАПРЕТ: Gemini TTS недоступен для CTA [${platform.code}]! Голоса Microsoft строго запрещены для видео. Ролик не собирается.`);
      }
    }
  }

  const baseCues = [
    { id: 'tHook', wavPath: getWav(cue1Id), gapAfterSec: 0.25 },
    { id: 'tStudent', wavPath: getWav(cue2Id), gapAfterSec: 0.35 },
    { id: 'tLead', wavPath: getWav(cue3Id), gapAfterSec: 0.35 },
  ];
  if (lessonNum === 7 && isClean) {
    baseCues.push({ id: 'tStudent2', wavPath: getWav(`${prefix}_s2_04`), gapAfterSec: 0.35 });
  }
  baseCues.push(
    { id: 'tExplainer', wavPath: getWav(cue4Id), gapAfterSec: 0.4 },
    { id: 'tCta', wavPath: ctaWav, gapAfterSec: 0.5 }
  );

  for (const cue of baseCues) {
    if (!cue.wavPath || !fs.existsSync(cue.wavPath) || fs.statSync(cue.wavPath).size < 3000) {
      throw new Error(`❌ СТРОГИЙ ЗАПРЕТ: Аудиодорожка ${cue.id} (${cue.wavPath}) отсутствует! Gemini TTS недоступен, а голоса Microsoft строго запрещены для видео. Ролик не собирается.`);
    }
  }

  const masterWavPath = path.join(DEMO_DIR, `lesson_${numPad}_${variant}_${platform.code.toLowerCase()}_master.wav`);
  const timingsJsonPath = path.join(DEMO_DIR, `lesson_${numPad}_${variant}_${platform.code.toLowerCase()}_timings.json`);

  const { totalDurationSec, visualTimings } = stitchClipsWithDeclick(baseCues, masterWavPath);
  const timingData = { ...visualTimings, totalDurationSec };
  fs.writeFileSync(timingsJsonPath, JSON.stringify(timingData, null, 2));

  return { masterWavPath, timingsJsonPath, timingData };
}

async function recordPlatformVideo(lessonNum, variant, platform, audioInfo, browser) {
  const numPad = String(lessonNum).padStart(2, '0');
  const sceneDir = path.resolve(SCENES_DIR, `lesson_${numPad}_${variant}`);
  const sceneHtmlPath = path.resolve(sceneDir, 'index.html');

  if (!fs.existsSync(sceneHtmlPath)) {
    throw new Error(`Сцена не найдена: ${sceneHtmlPath}. Запустите generate_lesson_scenes.mjs`);
  }

  const filename = `lesson_${numPad}_${variant}_${platform.name.toLowerCase().replace(/\s+/g, '_')}.mp4`;
  const outMp4Path = path.join(LESSONS_DIR, filename);

  if (fs.existsSync(outMp4Path) && fs.statSync(outMp4Path).size > 1000000) {
    const stat = fs.statSync(outMp4Path);
    console.log(`  ⏩ Уже существует: ${filename} (${(stat.size / 1024 / 1024).toFixed(2)} MB), пропускаем`);
    return {
      path: `public/demo/lessons/${filename}`,
      promoCode: platform.code,
      durationSec: Number(audioInfo.timingData.totalDurationSec.toFixed(1)),
      resolution: '780x1688',
      fileSizeBytes: stat.size,
      generatedAt: new Date().toISOString(),
    };
  }

  const totalDurationSec = audioInfo.timingData.totalDurationSec;
  const tempDir = path.join(DEMO_DIR, `temp_${numPad}_${variant}_${platform.code.toLowerCase()}`);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: tempDir,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();
  const video = page.video();
  const fileUrl = 'file://' + sceneHtmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  await page.evaluate(({ timings, code }) => {
    window.startReelsTimeline(timings, code);
  }, { timings: audioInfo.timingData, code: platform.code });

  const waitMs = Math.round(totalDurationSec * 1000) + 1200;
  await sleep(waitMs);

  await page.close();
  await context.close();

  let rawWebm = null;
  if (video) {
    try {
      rawWebm = await video.path();
    } catch (_) {}
  }
  if (!rawWebm || !fs.existsSync(rawWebm)) {
    const webmFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith('.webm'));
    if (!webmFiles.length) throw new Error(`Не найден webm для ${filename}`);
    rawWebm = path.join(tempDir, webmFiles[0]);
  }
  await sleep(400);

  const ffmpegArgs = [
    '-y',
    '-i', rawWebm,
    '-i', audioInfo.masterWavPath,
    '-vf', 'scale=780:1688:flags=lanczos',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outMp4Path,
  ];

  const res = cp.spawnSync(ffmpeg, ffmpegArgs);
  if (res.status !== 0) throw new Error(`FFmpeg error: ${res.stderr?.toString()}`);
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}

  const stat = fs.statSync(outMp4Path);
  console.log(`  🎉 Готово: ${filename} (${(stat.size / 1024 / 1024).toFixed(2)} MB, ${totalDurationSec.toFixed(1)} сек)`);

  return {
    path: `public/demo/lessons/${filename}`,
    promoCode: platform.code,
    durationSec: Number(totalDurationSec.toFixed(1)),
    resolution: '780x1688',
    fileSizeBytes: stat.size,
    generatedAt: new Date().toISOString(),
  };
}

async function renderLesson(lessonNum, browser, registry, targetVariants = ['clean', 'spicy'], targetPlatforms = PLATFORMS) {
  console.log(`\n======================================================`);
  console.log(`🎬 ФАБРИКА-500: СБОРКА УРОКА ${lessonNum} (${targetVariants.length * targetPlatforms.length} ВИДЕОРОЛИКОВ)`);
  console.log(`======================================================`);

  if (!registry.lessons[String(lessonNum)]) {
    registry.lessons[String(lessonNum)] = {
      lessonNumber: lessonNum,
      updatedAt: new Date().toISOString(),
      variants: {
        clean: { files: {} },
        spicy: { files: {} },
      },
    };
  }

  for (const variant of targetVariants) {
    console.log(`\n▶ [Урок ${lessonNum}] Вариант: ${variant.toUpperCase()}`);
    for (const platform of targetPlatforms) {
      console.log(`  → Платформа [${platform.code}] ${platform.name}...`);
      const audioInfo = await prepareAudioForPlatform(lessonNum, variant, platform);
      const meta = await recordPlatformVideo(lessonNum, variant, platform, audioInfo, browser);

      if (!registry.lessons[String(lessonNum)].variants[variant]) {
        registry.lessons[String(lessonNum)].variants[variant] = { files: {} };
      }
      registry.lessons[String(lessonNum)].variants[variant].files[platform.code] = meta;
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    }
  }

  console.log(`✅ [Урок ${lessonNum}] Ролики варианта ${targetVariants.join(', ')} собраны!`);
}

async function main() {
  const args = process.argv.slice(2);
  const lessonArg = args.find((a) => a.startsWith('--lesson='));
  const lessonsArg = args.find((a) => a.startsWith('--lessons='));
  const variantArg = args.find((a) => a.startsWith('--variant='));
  const platformArg = args.find((a) => a.startsWith('--platform='));
  const targetVariants = variantArg ? [variantArg.split('=')[1].toLowerCase()] : ['clean', 'spicy'];

  let targetPlatforms = PLATFORMS;
  if (platformArg) {
    const pCode = platformArg.split('=')[1].toUpperCase();
    targetPlatforms = PLATFORMS.filter((p) => p.code === pCode);
    if (!targetPlatforms.length) {
      console.error(`❌ Неизвестная платформа: ${pCode}. Доступные: ${PLATFORMS.map((p) => p.code).join(', ')}`);
      process.exit(1);
    }
  }

  let targetLessons = [2];
  if (lessonsArg) {
    const val = lessonsArg.split('=')[1];
    if (val.includes(',')) {
      targetLessons = val.split(',').map((x) => parseInt(x.trim(), 10));
    } else if (val.includes('-')) {
      const [start, end] = val.split('-').map(Number);
      targetLessons = [];
      for (let l = start; l <= end; l++) targetLessons.push(l);
    } else {
      targetLessons = [parseInt(val, 10)];
    }
  } else if (lessonArg) {
    targetLessons = [parseInt(lessonArg.split('=')[1], 10)];
  }

  console.log('======================================================');
  console.log(`🏭 ФАБРИКА-500: ПАКЕТНЫЙ РЕНДЕР ВИДЕО`);
  console.log(`Уроки к сборке: ${targetLessons.join(', ')}`);
  console.log(`Варианты к сборке: ${targetVariants.join(', ')}`);
  console.log(`Платформы: ${targetPlatforms.map((p) => p.code).join(', ')}`);
  console.log(`Количество роликов на урок: ${targetVariants.length * targetPlatforms.length}`);
  console.log(`Всего роликов: ${targetLessons.length * targetVariants.length * targetPlatforms.length}`);
  console.log('======================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });

  let registry = {};
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    } catch (_) {}
  }
  if (!registry.lessons) registry.lessons = {};

  for (const lNum of targetLessons) {
    await renderLesson(lNum, browser, registry, targetVariants, targetPlatforms);
  }

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 ВСЕ ЗАПЛАНИРОВАННЫЕ ВИДЕОРОЛИКИ УСПЕШНО СОБРАНЫ!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
