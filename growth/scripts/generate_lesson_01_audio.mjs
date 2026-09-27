import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const CACHE_DIR = path.resolve(DEMO_DIR, 'audio_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getGeminiApiKeys() {
  const keys = [];
  if (process.env.GEMINI_PRIMARY_API_KEY) keys.push(process.env.GEMINI_PRIMARY_API_KEY);
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  const envPath = path.resolve(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m1 = content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    const m2 = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (m1 && !keys.includes(m1[1].trim())) keys.push(m1[1].trim());
    if (m2 && !keys.includes(m2[1].trim())) keys.push(m2[1].trim());
  }
  return keys;
}

/**
 * Синтез речи через Gemini TTS API (Charon для диктора, Aoede / Orus для иврита)
 */
async function tryGeminiTts(text, voiceName, wavPath, speed = 1.0) {
  const keys = getGeminiApiKeys();
  if (!keys.length) {
    throw new Error('No Gemini API keys found in .env.local');
  }

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.status === 429 || data.error?.code === 429) {
        console.warn(`  ⏳ [Gemini TTS 429] Ожидание 12 сек для сброса лимита запросов (ключ ${i + 1})...`);
        await new Promise((r) => setTimeout(r, 12000));
        // Повторная попытка на том же ключе
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const retryData = await retryRes.json();
        if (retryData.candidates && retryData.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
          const pcmBuffer = Buffer.from(retryData.candidates[0].content.parts[0].inlineData.data, 'base64');
          const tempPcm = wavPath + '.temp.pcm';
          fs.writeFileSync(tempPcm, pcmBuffer);

          const ffmpegArgs = ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempPcm];
          if (speed !== 1.0) ffmpegArgs.push('-filter:a', `atempo=${speed}`);
          ffmpegArgs.push('-ar', '44100', '-ac', '2', wavPath);

          cp.spawnSync(ffmpeg, ffmpegArgs);
          if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
          if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 1000) return true;
        }
        continue;
      }

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
        const pcmBuffer = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
        const tempPcm = wavPath + '.temp.pcm';
        fs.writeFileSync(tempPcm, pcmBuffer);

        const ffmpegArgs = [
          '-y',
          '-f', 's16le',
          '-ar', '24000',
          '-ac', '1',
          '-i', tempPcm,
        ];
        if (speed !== 1.0) {
          ffmpegArgs.push('-filter:a', `atempo=${speed}`);
        }
        ffmpegArgs.push('-ar', '44100', '-ac', '2', wavPath);

        const convRes = cp.spawnSync(ffmpeg, ffmpegArgs);
        if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);

        if (convRes.status === 0 && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 1000) {
          return true;
        }
      }
      console.warn(`  ⚠️ Gemini TTS ответ (ключ ${i + 1}):`, data.error?.message || 'нет аудио');
    } catch (err) {
      console.warn(`  ⚠️ Ошибка сети Gemini TTS на ключе ${i + 1}:`, err.message);
    }
  }

  return false;
}

/**
 * Синтез иврита через Edge Neural TTS (AvriNeural / HilaNeural)
 */
async function tryEdgeTts(text, voiceName, wavPath, options = {}) {
  const tempMp3 = wavPath + '.temp.mp3';
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const ttsOptions = {};
    if (options.rate) ttsOptions.rate = options.rate;
    if (options.pitch) ttsOptions.pitch = options.pitch;

    const { audioStream } = tts.toStream(text, ttsOptions);
    const writeStream = fs.createWriteStream(tempMp3);

    await new Promise((resolve, reject) => {
      audioStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    await new Promise((r) => setTimeout(r, 100));
    try { tts.close(); } catch (_) {}

    const ffmpegArgs = ['-y', '-i', tempMp3, '-ar', '44100', '-ac', '2', wavPath];
    const res = cp.spawnSync(ffmpeg, ffmpegArgs);
    if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);

    return res.status === 0 && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 1000;
  } catch (err) {
    if (fs.existsSync(tempMp3)) try { fs.unlinkSync(tempMp3); } catch (_) {}
    console.warn(`  ⚠️ Edge TTS ошибка: ${err.message}`);
    return false;
  }
}

/**
 * Универсальный синтез реплики: Gemini TTS (Charon) для русского, Edge/Gemini для иврита
 */
async function synthesizeCue(cue, forceFilename) {
  const filename = forceFilename || `${cue.id}.wav`;
  const wavPath = path.join(CACHE_DIR, filename);

  console.log(`🎙️ Синтез "${cue.id}": "${cue.text.slice(0, 45)}..." [engine: ${cue.engine}]`);

  // Если файл уже успешно синтезирован, используем кэш
  if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 50000) {
    console.log(`  ⚡ [КЭШ] ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
    return wavPath;
  }

  let ok = false;
  if (cue.engine === 'gemini') {
    ok = await tryGeminiTts(cue.text, cue.voice || 'Charon', wavPath, cue.speed || 1.0);
    if (!ok) {
      console.log(`  🔄 Фолбэк русского диктора на мужской Edge TTS (ru-RU-DmitryNeural)...`);
      ok = await tryEdgeTts(cue.text, 'ru-RU-DmitryNeural', wavPath, { rate: '+10%' });
    }
  } else if (cue.engine === 'edge') {
    ok = await tryEdgeTts(cue.text, cue.voice, wavPath, cue.options || {});
    if (!ok) {
      console.log(`  🔄 Фолбэк иврита на Gemini TTS (${cue.geminiFallback || 'Orus'})...`);
      ok = await tryGeminiTts(cue.text, cue.geminiFallback || 'Orus', wavPath, cue.speed || 1.0);
    }
  }

  if (!ok || !fs.existsSync(wavPath) || fs.statSync(wavPath).size < 1000) {
    throw new Error(`Не удалось качественно синтезировать аудиоклип: ${cue.id}`);
  }

  console.log(`  ✅ Готово: ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
  return wavPath;
}

/**
 * Склейка дорожек с косинусным de-clicking 15ms (R-25)
 */
function stitchClipsWithDeclick(clips, outWavPath) {
  const sampleRate = 44100;
  const numChannels = 2;
  const fadeLen = Math.floor(sampleRate * 0.015); // 15ms

  const processed = [];
  let totalDurationSec = 0;
  const visualTimings = {};

  for (const clip of clips) {
    const rawBuf = fs.readFileSync(clip.wavPath);
    const pcm = rawBuf.subarray(44);
    const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2);
    const clipSamples = samples.length / numChannels;

    // Косинусный de-clicking на границах
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
  console.log(`  🎉 Мастер-трек: ${path.basename(outWavPath)} (${totalDurationSec.toFixed(2)} сек)`);

  return { totalDurationSec, visualTimings };
}

// ==========================================
// КОНФИГУРАЦИЯ ВАРИАНТА А (Clean / Ad-Safe)
// Диктор: Gemini TTS Charon (мужской баритон)
// Иврит: Edge/Gemini (Avri / Orus)
// ==========================================
export const CUES_LESSON_01_CLEAN = [
  {
    id: 'cue_01_hook',
    text: 'Первый рабочий день в Израиле. Хочешь спросить у коллеги-мужчины, свободен ли он...',
    engine: 'gemini',
    voice: 'Charon',
    speed: 1.15,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_02_student',
    text: 'סְלִיחָה, אַתְּ פְּנוּיָה?',
    engine: 'edge',
    voice: 'he-IL-AvriNeural',
    geminiFallback: 'Orus',
    options: { pitch: '+6Hz', rate: '-5%' },
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_03_lead',
    text: 'אֲנִי נִרְאֶה לָךְ כְּמוֹ בַּחוּרָה, אָחִי?!',
    engine: 'edge',
    voice: 'he-IL-AvriNeural',
    geminiFallback: 'Orus',
    options: { pitch: '-15Hz', rate: '+5%' },
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_04_explainer',
    text: 'В иврите "ты" мужчине — это אַתָּה! А "ат" — только женщинам. Перепутал букву — и бородатый тимлид уже сомневается в твоих скиллах.',
    engine: 'gemini',
    voice: 'Charon',
    speed: 1.12,
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_05_cta',
    text: 'Урок один в Ульпан Алеф. Различай род с первой секунды! Промокод SHORTS на 30 дней. Ссылка в описании!',
    engine: 'gemini',
    voice: 'Charon',
    speed: 1.15,
    gapAfterSec: 0.5,
  },
];

// ==========================================
// КОНФИГУРАЦИЯ ВАРИАНТА B (Spicy / Organic)
// Диктор: Gemini TTS Charon
// Иврит: Avri / Hila
// ==========================================
export const CUES_LESSON_01_SPICY = [
  {
    id: 'cue_01_hook',
    text: 'Встретил израильтянку на первом свидании и решил блеснуть ивритом...',
    engine: 'gemini',
    voice: 'Charon',
    speed: 1.15,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_02_guy',
    text: 'שָׁלוֹם! אַתָּה יָפֶה מְאוֹד!',
    engine: 'edge',
    voice: 'he-IL-AvriNeural',
    geminiFallback: 'Orus',
    options: { pitch: '+2Hz', rate: '+0%' },
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_03_girl',
    text: 'תּוֹדָה מוֹתֶק, אֲבָל מֵאָז הַבֹּקֶר אֲנִי עֲדַיִן אִשָּׁה!',
    engine: 'edge',
    voice: 'he-IL-HilaNeural',
    geminiFallback: 'Aoede',
    options: { pitch: '+5Hz', rate: '+5%' },
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_04_explainer',
    text: '«Атá яфэ» — это комплимент таксисту! Девушке — только «אַתְּ יָפָה»! Не превращай свидание в армейскую перекличку.',
    engine: 'gemini',
    voice: 'Charon',
    speed: 1.12,
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_05_cta',
    text: 'Урок один в Ульпан Алеф: спаси своё свидание до того, как принесут счёт. Промокод SHORTS на 30 дней. Ссылка под видео!',
    engine: 'gemini',
    voice: 'Charon',
    speed: 1.15,
    gapAfterSec: 0.5,
  },
];

export async function generateLesson01Audio() {
  console.log('\n======================================================');
  console.log('🎙️ СИНТЕЗ ЧИСТОГО АУДИО УРОКА 1 (GEMINI CHARON + EDGE)');
  console.log('======================================================\n');

  // 1. Вариант Clean
  console.log('🟢 1. Синтез дорожки Clean (Ad-Safe)...');
  const cleanClips = [];
  for (const c of CUES_LESSON_01_CLEAN) {
    const fn = `l01_clean_${c.id}.wav`;
    const wavPath = await synthesizeCue(c, fn);
    cleanClips.push({ ...c, wavPath });
  }
  const cleanOutWav = path.join(DEMO_DIR, 'lesson_01_clean_master_audio.wav');
  const cleanResult = stitchClipsWithDeclick(cleanClips, cleanOutWav);

  const cleanTimings = {
    tHook: cleanResult.visualTimings['cue_01_hook'],
    tStudent: cleanResult.visualTimings['cue_02_student'],
    tLead: cleanResult.visualTimings['cue_03_lead'],
    tExplainer: cleanResult.visualTimings['cue_04_explainer'],
    tCta: cleanResult.visualTimings['cue_05_cta'],
    totalDurationSec: cleanResult.totalDurationSec,
  };
  fs.writeFileSync(path.join(DEMO_DIR, 'lesson_01_clean_timings.json'), JSON.stringify(cleanTimings, null, 2));

  // 2. Вариант Spicy
  console.log('\n🌶️ 2. Синтез дорожки Spicy (Organic)...');
  const spicyClips = [];
  for (const c of CUES_LESSON_01_SPICY) {
    const fn = `l01_spicy_${c.id}.wav`;
    const wavPath = await synthesizeCue(c, fn);
    spicyClips.push({ ...c, wavPath });
  }
  const spicyOutWav = path.join(DEMO_DIR, 'lesson_01_spicy_master_audio.wav');
  const spicyResult = stitchClipsWithDeclick(spicyClips, spicyOutWav);

  const spicyTimings = {
    tHook: spicyResult.visualTimings['cue_01_hook'],
    tGuy: spicyResult.visualTimings['cue_02_guy'],
    tGirl: spicyResult.visualTimings['cue_03_girl'],
    tExplainer: spicyResult.visualTimings['cue_04_explainer'],
    tCta: spicyResult.visualTimings['cue_05_cta'],
    totalDurationSec: spicyResult.totalDurationSec,
  };
  fs.writeFileSync(path.join(DEMO_DIR, 'lesson_01_spicy_timings.json'), JSON.stringify(spicyTimings, null, 2));

  console.log('\n🎉 Аудиодорожки созданы на базе Gemini Charon без Google Translate!');
  return { cleanTimings, spicyTimings, cleanOutWav, spicyOutWav };
}

if (process.argv[1]?.endsWith('generate_lesson_01_audio.mjs')) {
  generateLesson01Audio().catch((err) => {
    console.error('❌ Ошибка генерации аудио:', err);
    process.exit(1);
  });
}
