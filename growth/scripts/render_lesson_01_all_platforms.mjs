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
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');

if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true });
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getGeminiApiKeys() {
  const keys = [];
  if (process.env.GEMINI_PRIMARY_API_KEY) keys.push(process.env.GEMINI_PRIMARY_API_KEY);
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_SECONDARY_API_KEY) keys.push(process.env.GEMINI_SECONDARY_API_KEY);
  const envPath = path.resolve(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m1 = content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    const m2 = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    const m3 = content.match(/GEMINI_SECONDARY_API_KEY=([^\r\n]+)/);
    if (m1 && !keys.includes(m1[1].trim())) keys.push(m1[1].trim());
    if (m2 && !keys.includes(m2[1].trim())) keys.push(m2[1].trim());
    if (m3 && !keys.includes(m3[1].trim())) keys.push(m3[1].trim());
  }
  return keys;
}

async function tryGeminiTts(text, voiceName = 'Charon', wavPath, speed = 1.15) {
  const keys = getGeminiApiKeys();
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const key = keys[keyIdx];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${key}`;
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

      if (res.status === 429) {
        console.log(`  ⏳ [Gemini TTS 429] Ждём 12 сек (ключ ${keyIdx + 1})...`);
        await sleep(12000);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`  ⚠️ Gemini TTS ответ (ключ ${keyIdx + 1}): ${errText.slice(0, 180)}`);
        continue;
      }

      const json = await res.json();
      const b64Data = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!b64Data) {
        console.warn(`  ⚠️ Пустые аудиоданные от Gemini TTS`);
        continue;
      }

      const pcmBuffer = Buffer.from(b64Data, 'base64');
      const tempPcm = wavPath + '.pcm';
      fs.writeFileSync(tempPcm, pcmBuffer);

      const filterArgs = speed !== 1.0 ? ['-filter:a', `atempo=${speed}`] : [];
      const conv = cp.spawnSync(ffmpeg, [
        '-y',
        '-f', 's16le',
        '-ar', '24000',
        '-ac', '1',
        '-i', tempPcm,
        ...filterArgs,
        '-ar', '44100',
        '-ac', '2',
        wavPath,
      ]);
      try { fs.unlinkSync(tempPcm); } catch (_) {}

      if (conv.status === 0 && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 5000) {
        return true;
      }
    } catch (e) {
      console.warn(`  ⚠️ Исключение при вызове ключа ${keyIdx + 1}: ${e.message}`);
    }
  }
  return false;
}

const PLATFORMS = [
  {
    code: 'YT',
    name: 'YouTube Shorts',
    filenameClean: 'lesson_01_clean_youtube_shorts.mp4',
    filenameSpicy: 'lesson_01_spicy_youtube_shorts.mp4',
    cleanCtaText: 'Урок один в Ульпан Алеф. Различай род с первой секунды! Промокод для Ютуб — на экране! Тридцать дней бесплатно. Ссылка в описании!',
    spicyCtaText: 'Урок один в Ульпан Алеф: спаси своё свидание до того, как принесут счёт. Промокод для Ютуб — на экране! Тридцать дней бесплатно. Ссылка под видео!',
  },
  {
    code: 'TG',
    name: 'Telegram',
    filenameClean: 'lesson_01_clean_telegram.mp4',
    filenameSpicy: 'lesson_01_spicy_telegram.mp4',
    cleanCtaText: 'Урок один в Ульпан Алеф. Различай род с первой секунды! Промокод для Телеграм — на экране! Тридцать дней бесплатно. Ссылка в описании!',
    spicyCtaText: 'Урок один в Ульпан Алеф: спаси своё свидание до того, как принесут счёт. Промокод для Телеграм — на экране! Тридцать дней бесплатно. Ссылка в посте!',
  },
  {
    code: 'INSTA',
    name: 'Instagram Reels',
    filenameClean: 'lesson_01_clean_instagram_reels.mp4',
    filenameSpicy: 'lesson_01_spicy_instagram_reels.mp4',
    cleanCtaText: 'Урок один в Ульпан Алеф. Различай род с первой секунды! Промокод для Инстаграм — на экране! Тридцать дней бесплатно. Ссылка в шапке профиля!',
    spicyCtaText: 'Урок один в Ульпан Алеф: спаси своё свидание до того, как принесут счёт. Промокод для Инстаграм — на экране! Тридцать дней бесплатно. Ссылка в шапке профиля!',
  },
  {
    code: 'TIKTOK',
    name: 'TikTok',
    filenameClean: 'lesson_01_clean_tiktok.mp4',
    filenameSpicy: 'lesson_01_spicy_tiktok.mp4',
    cleanCtaText: 'Урок один в Ульпан Алеф. Различай род с первой секунды! Промокод для ТикТок — на экране! Тридцать дней бесплатно. Ссылка в профиле!',
    spicyCtaText: 'Урок один в Ульпан Алеф: спаси своё свидание до того, как принесут счёт. Промокод для ТикТок — на экране! Тридцать дней бесплатно. Ссылка в профиле!',
  },
  {
    code: 'FB',
    name: 'Facebook Reels',
    filenameClean: 'lesson_01_clean_facebook_reels.mp4',
    filenameSpicy: 'lesson_01_spicy_facebook_reels.mp4',
    cleanCtaText: 'Урок один в Ульпан Алеф. Различай род с первой секунды! Промокод для Фейсбук — на экране! Тридцать дней бесплатно. Ссылка в описании!',
    spicyCtaText: 'Урок один в Ульпан Алеф: спаси своё свидание до того, как принесут счёт. Промокод для Фейсбук — на экране! Тридцать дней бесплатно. Ссылка под видео!',
  },
];

function stitchClipsWithDeclick(clips, outWavPath) {
  const sampleRate = 44100;
  const numChannels = 2;
  const fadeLen = Math.floor(sampleRate * 0.015);

  const processed = [];
  let totalDurationSec = 0;
  const visualTimings = {};

  for (const clip of clips) {
    const rawBuf = fs.readFileSync(clip.wavPath);
    const pcm = rawBuf.subarray(44);
    const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2);
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

async function prepareAudioForPlatform(variant, platform) {
  const isClean = variant === 'clean';
  const prefix = isClean ? 'l01_clean' : 'l01_spicy';
  const ctaCachePath = path.join(CACHE_DIR, `${prefix}_cue_05_cta_${platform.code.toLowerCase()}.wav`);

  if (!fs.existsSync(ctaCachePath) || fs.statSync(ctaCachePath).size < 10000) {
    const text = isClean ? platform.cleanCtaText : platform.spicyCtaText;
    console.log(`  🎙️ Синтез CTA для [${platform.code}] (${platform.name})...`);
    const ok = await tryGeminiTts(text, 'Charon', ctaCachePath, 1.15);
    if (!ok) {
      // Fallback к базовому CTA
      const defaultCta = path.join(CACHE_DIR, `${prefix}_cue_05_cta.wav`);
      fs.copyFileSync(defaultCta, ctaCachePath);
    }
  }

  const baseCues = isClean
    ? [
        { id: 'tHook', wavPath: path.join(CACHE_DIR, 'l01_clean_cue_01_hook.wav'), gapAfterSec: 0.25 },
        { id: 'tStudent', wavPath: path.join(CACHE_DIR, 'l01_clean_cue_02_student.wav'), gapAfterSec: 0.35 },
        { id: 'tLead', wavPath: path.join(CACHE_DIR, 'l01_clean_cue_03_lead.wav'), gapAfterSec: 0.35 },
        { id: 'tExplainer', wavPath: path.join(CACHE_DIR, 'l01_clean_cue_04_explainer.wav'), gapAfterSec: 0.4 },
        { id: 'tCta', wavPath: ctaCachePath, gapAfterSec: 0.5 },
      ]
    : [
        { id: 'tHook', wavPath: path.join(CACHE_DIR, 'l01_spicy_cue_01_hook.wav'), gapAfterSec: 0.25 },
        { id: 'tGuy', wavPath: path.join(CACHE_DIR, 'l01_spicy_cue_02_guy.wav'), gapAfterSec: 0.3 },
        { id: 'tGirl', wavPath: path.join(CACHE_DIR, 'l01_spicy_cue_03_girl.wav'), gapAfterSec: 0.35 },
        { id: 'tExplainer', wavPath: path.join(CACHE_DIR, 'l01_spicy_cue_04_explainer.wav'), gapAfterSec: 0.35 },
        { id: 'tCta', wavPath: ctaCachePath, gapAfterSec: 0.5 },
      ];

  const masterWavPath = path.join(DEMO_DIR, `lesson_01_${variant}_${platform.code.toLowerCase()}_master.wav`);
  const timingsJsonPath = path.join(DEMO_DIR, `lesson_01_${variant}_${platform.code.toLowerCase()}_timings.json`);

  const { totalDurationSec, visualTimings } = stitchClipsWithDeclick(baseCues, masterWavPath);
  const timingData = { ...visualTimings, totalDurationSec };
  fs.writeFileSync(timingsJsonPath, JSON.stringify(timingData, null, 2));

  return { masterWavPath, timingsJsonPath, timingData };
}

async function recordPlatformVideo(variant, platform, audioInfo, browser) {
  const isClean = variant === 'clean';
  const sceneHtmlPath = isClean
    ? path.resolve(ROOT, 'growth/scenes/lesson_01_clean/index.html')
    : path.resolve(ROOT, 'growth/scenes/lesson_01_spicy/index.html');
  const filename = isClean ? platform.filenameClean : platform.filenameSpicy;
  const outMp4Path = path.join(LESSONS_DIR, filename);

  const totalDurationSec = audioInfo.timingData.totalDurationSec;
  const tempDir = path.join(DEMO_DIR, `temp_${variant}_${platform.code.toLowerCase()}`);
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
  const fileUrl = 'file://' + sceneHtmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  await page.evaluate(({ timings, code }) => {
    window.startReelsTimeline(timings, code);
  }, { timings: audioInfo.timingData, code: platform.code });

  const waitMs = Math.round(totalDurationSec * 1000) + 1200;
  await sleep(waitMs);

  await page.close();
  await context.close();

  const webmFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.webm'));
  if (!webmFiles.length) throw new Error(`Не найден webm для ${filename}`);
  const rawWebm = path.join(tempDir, webmFiles[0]);

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

async function main() {
  console.log('======================================================');
  console.log('🏭 ФАБРИКА-500: ГЕНЕРАЦИЯ ВСЕХ ПЛАТФОРМЕННЫХ РОЛИКОВ УРОКА 1');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-web-security', '--allow-file-access-from-files'],
  });

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

  for (const variant of ['clean', 'spicy']) {
    console.log(`\n------------------------------------------------------`);
    console.log(`🎬 СБОРКА ВАРИАНТА: ${variant.toUpperCase()}`);
    console.log(`------------------------------------------------------`);

    for (const platform of PLATFORMS) {
      console.log(`\n▶ [${platform.code}] ${platform.name}...`);
      const audioInfo = await prepareAudioForPlatform(variant, platform);
      const fileMeta = await recordPlatformVideo(variant, platform, audioInfo, browser);

      registry.lessons['1'].variants[variant].files[platform.code] = fileMeta;
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
    }
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('✅ ВСЕ 10 РОЛИКОВ УРОКА 1 (CLEAN + SPICY) УСПЕШНО СОБРАНЫ!');
  console.log('======================================================\n');
}

main().catch((e) => {
  console.error('❌ Ошибка:', e);
  process.exit(1);
});
