import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CATALOG_PATH = path.resolve(ROOT, 'growth/MASTER_TTS_CATALOG.json');
const AUDIO_BANK = path.resolve(ROOT, 'public/demo/audio_bank');
const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');

if (!fs.existsSync(AUDIO_BANK)) fs.mkdirSync(AUDIO_BANK, { recursive: true });
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function sanitizeMp3File(filePath) {
  const pcm = cp.execFileSync(ffmpeg, [
    '-y',
    '-i', filePath,
    '-f', 's16le',
    '-ar', '44100',
    '-ac', '1',
    'pipe:1',
  ], { maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
  const sampleRate = 44100;

  // 1. Устранение щелчка в начале (2ms silence + 10ms fade-in)
  const headerSilence = Math.floor(sampleRate * 0.002);
  const fadeIn = Math.floor(sampleRate * 0.010);
  for (let i = 0; i < headerSilence && i < samples.length; i++) samples[i] = 0;
  for (let i = headerSilence; i < headerSilence + fadeIn && i < samples.length; i++) {
    const fade = 0.5 * (1 - Math.cos((Math.PI * (i - headerSilence)) / fadeIn));
    samples[i] = Math.round(samples[i] * fade);
  }

  // 2. Детект и обрезка хвоста водяного знака SynthID
  const last200ms = Math.floor(sampleRate * 0.2);
  let tailMax = 0;
  const tailStart = Math.max(0, samples.length - last200ms);
  for (let j = tailStart; j < samples.length; j++) {
    const val = Math.abs(samples[j]);
    if (val > tailMax) tailMax = val;
  }

  let finalLength = samples.length;
  if (tailMax > 5000) {
    const minSilenceLen = Math.floor(sampleRate * 0.025);
    let silenceCount = 0;
    let cutPoint = samples.length;
    for (let k = samples.length - 1; k >= 0; k--) {
      if (Math.abs(samples[k]) < 800) {
        silenceCount++;
        if (silenceCount >= minSilenceLen) {
          cutPoint = k + minSilenceLen;
          break;
        }
      } else {
        silenceCount = 0;
      }
    }
    if (cutPoint < samples.length) finalLength = cutPoint;
  }

  // 3. Fade out
  const fadeOut = Math.floor(sampleRate * 0.015);
  const fadeOutStart = Math.max(0, finalLength - fadeOut);
  for (let i = fadeOutStart; i < finalLength; i++) {
    const fade = 0.5 * (1 - Math.cos((Math.PI * (finalLength - i)) / fadeOut));
    samples[i] = Math.round(samples[i] * fade);
  }

  const cleanedSamples = samples.subarray(0, finalLength);
  const tempWav = filePath + '.tmp.wav';
  const header = Buffer.alloc(44);
  const dataByteLen = cleanedSamples.byteLength;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataByteLen, 40);

  fs.writeFileSync(tempWav, Buffer.concat([header, Buffer.from(cleanedSamples.buffer, cleanedSamples.byteOffset, cleanedSamples.byteLength)]));
  const tempMp3 = filePath + '.tmp.mp3';
  cp.spawnSync(ffmpeg, ['-y', '-i', tempWav, '-ar', '44100', '-ac', '1', '-b:a', '128k', tempMp3]);
  try { fs.unlinkSync(tempWav); } catch (_) {}
  if (fs.existsSync(tempMp3) && fs.statSync(tempMp3).size > 1000) {
    fs.renameSync(tempMp3, filePath);
  }
}

/**
 * Загрузка всех доступных API-ключей для карусели
 */
function getApiKeys() {
  const envPath = path.resolve(ROOT, '.env.local');
  const geminiKeys = [];
  let gcloudKey = process.env.GOOGLE_TTS_API_KEY || '';

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
        if (
          k === 'GEMINI_TTS_API_KEY' ||
          k === 'GEMINI_PRIMARY_API_KEY' ||
          k === 'GEMINI_SECONDARY_API_KEY' ||
          k === 'GEMINI_API_KEY'
        ) {
          if (v && !geminiKeys.includes(v)) geminiKeys.push(v);
        }
        if (k === 'GOOGLE_TTS_API_KEY' && v) {
          gcloudKey = v;
        }
      }
    }
  }

  // Fallback to process.env
  if (process.env.GEMINI_API_KEY && !geminiKeys.includes(process.env.GEMINI_API_KEY)) {
    geminiKeys.push(process.env.GEMINI_API_KEY);
  }

  return { geminiKeys, gcloudKey };
}

// Каскадный список моделей Gemini TTS для ротации квот
const GEMINI_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview',
];

const exhaustedSlots = new Set();
const exhaustedKeys = new Set();
let globalSlots = null;
let currentSlotIdx = 0;

function getNextAvailableSlot(slots) {
  let scanned = 0;
  while (scanned < slots.length) {
    const slot = slots[currentSlotIdx % slots.length];
    const slotKey = `${slot.keyIndex}_${slot.model}`;
    if (!exhaustedKeys.has(slot.keyIndex) && !exhaustedSlots.has(slotKey)) {
      return slot;
    }
    currentSlotIdx++;
    scanned++;
  }
  return null;
}

/**
 * 1. Синтез через Google Cloud Text-to-Speech REST API
 */
async function synthesizeGoogleCloudTts(text, voiceName, langCode, outPath, apiKey) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const payload = {
    input: { text },
    voice: {
      languageCode: langCode === 'he' ? 'he-IL' : 'ru-RU',
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: langCode === 'ru' ? 1.15 : 1.0,
      pitch: 0.0,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Cloud TTS HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (!data.audioContent) {
    throw new Error('No audioContent returned from Google Cloud TTS');
  }

  fs.writeFileSync(outPath, Buffer.from(data.audioContent, 'base64'));
  return true;
}

/**
 * 2. Синтез через Gemini TTS с автоматической каруселью слотов (Ключ x Модель)
 */
async function synthesizeGeminiTtsWithCarousel(text, voiceName, langCode, outPath, geminiKeys, gcloudKey) {
  const isRussian = langCode === 'ru';
  const speed = isRussian ? 1.15 : 1.0;

  if (!globalSlots) {
    globalSlots = [];
    geminiKeys.forEach((key, kIdx) => {
      GEMINI_MODELS.forEach((model) => {
        globalSlots.push({ key, model, keyIndex: kIdx + 1 });
      });
    });
  }

  while (true) {
    const slot = getNextAvailableSlot(globalSlots);
    if (!slot) break; // Все слоты Gemini исчерпаны

    const slotKey = `${slot.keyIndex}_${slot.model}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${slot.model}:generateContent?key=${slot.key}`;
    const payload = {
      contents: [{ parts: [{ text }] }],
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

      if (res.status === 402 || data.error?.code === 402) {
        console.warn(`  ⚠️ [402 Payment Required] на ключе #${slot.keyIndex}. Ключ исключён из карусели.`);
        exhaustedKeys.add(slot.keyIndex);
        currentSlotIdx++;
        continue;
      }

      if (res.status === 429 || data.error?.code === 429) {
        const msg = data.error?.message || '';
        const isDaily = /exceeded your current quota|per_day|per_model_per_day|Please retry in|Resource has been exhausted|quota.*exceeded/i.test(msg);

        if (isDaily) {
          console.warn(`  🛑 [${slot.model}] суточный лимит 100 запросов на ключе #${slot.keyIndex}. Ротация слота...`);
          exhaustedSlots.add(slotKey);
          currentSlotIdx++;
          continue;
        } else {
          console.warn(`  ⏳ [429 RPM] Модель ${slot.model} на ключе #${slot.keyIndex}. Пауза 2с и переход к следующему слоту...`);
          currentSlotIdx++;
          await sleep(2000);
          continue;
        }
      }

      const b64Data = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!b64Data) {
        throw new Error(`Empty audio data from Gemini: ${data.error?.message || 'unknown error'}`);
      }

      const rawAudio = Buffer.from(b64Data, 'base64');
      const isRiff = rawAudio.subarray(0, 4).toString('ascii') === 'RIFF';
      const tempInput = outPath + (isRiff ? '.in.wav' : '.in.pcm');
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
        '-b:a', '128k',
        outPath,
      ]);
      try { fs.unlinkSync(tempInput); } catch (_) {}

      if (conv.status === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 100) {
        // Дополнительная проверка и санитаризация от щелчков/водяных знаков
        try {
          sanitizeMp3File(outPath);
        } catch (_) {}
        return { success: true, model: slot.model, keyIndex: slot.keyIndex };
      }
    } catch (err) {
      console.warn(`  ⚠️ Исключение на ключе #${slot.keyIndex} (${slot.model}): ${err.message}`);
      currentSlotIdx++;
      await sleep(1000);
    }
  }

  // Если все Gemini слоты исчерпаны, резервный фолбэк на Google Cloud TTS
  if (gcloudKey) {
    console.warn(`  🔄 Все слоты Gemini исчерпаны. Переход на резервный Google Cloud TTS REST API...`);
    const gVoice = isRussian ? 'ru-RU-Neural2-D' : (voiceName === 'Orus' ? 'he-IL-Wavenet-B' : 'he-IL-Wavenet-A');
    await synthesizeGoogleCloudTts(text, gVoice, langCode, outPath, gcloudKey);
    return { success: true, model: 'google-cloud-tts', keyIndex: 'gcloud' };
  }

  // СТРОГИЙ ИНВАРИАНТ R-25: Голоса Microsoft (Edge TTS) в видеопроизводстве ЗАПРЕЩЕНЫ НАВСЕГДА.
  // Никаких фолбэков на Edge Neural TTS! Если Gemini/GCloud недоступны — останавливаемся с ошибкой.
  throw new Error('❌ СТРОГИЙ ЗАПРЕТ: Голоса Microsoft запрещены для видеороликов! Все ключи и модели Gemini TTS исчерпали квоту. Синтез остановлен.');
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const lessonArg = args.find((a) => a.startsWith('--lesson='));
  const lessonsArg = args.find((a) => a.startsWith('--lessons='));
  const isForce = args.includes('--force');

  const { geminiKeys, gcloudKey } = getApiKeys();
  if (!geminiKeys.length && !gcloudKey) {
    console.error('❌ ОШИБКА: API-ключи не найдены в process.env или .env.local');
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  let itemsToProcess = catalog;

  if (lessonsArg) {
    const range = lessonsArg.split('=')[1];
    const [start, end] = range.split('-').map(Number);
    itemsToProcess = catalog.filter((c) => c.lesson >= start && c.lesson <= end);
  } else if (lessonArg) {
    const lNum = parseInt(lessonArg.split('=')[1], 10);
    itemsToProcess = catalog.filter((c) => c.lesson === lNum);
  } else if (!isAll) {
    // По умолчанию уроки 1-10 (Приоритет 1)
    console.log('ℹ️ Диапазон не указан. Запуск приоритета 1: Уроки 1–10.');
    itemsToProcess = catalog.filter((c) => c.lesson >= 1 && c.lesson <= 10);
  }

  console.log('====================================================');
  console.log(`🎬 ФАБРИКА-500: ПАКЕТНЫЙ СИНТЕЗ АУДИО (КАРУСЕЛЬ 4 КЛЮЧА)`);
  console.log(`Фраз к обработке: ${itemsToProcess.length} | Ключей в пуле: ${geminiKeys.length} Gemini + ${gcloudKey ? '1 GCloud' : '0 GCloud'}`);
  console.log(`Каталог: ${CATALOG_PATH}`);
  console.log(`Банк звуков: ${AUDIO_BANK}`);
  console.log('====================================================\n');

  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (let i = 0; i < itemsToProcess.length; i++) {
    const item = itemsToProcess[i];
    const filename = `${item.id}.mp3`;
    const outPath = path.resolve(AUDIO_BANK, filename);

    if (!isForce && fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      console.log(`[${i + 1}/${itemsToProcess.length}] ⏭️ Уже в банке: ${filename}`);
      skippedCount++;
      continue;
    }

    console.log(
      `[${i + 1}/${itemsToProcess.length}] 🎙️ Озвучиваем ${filename} (Урок ${item.lesson}, ${item.role}, ${item.gender}, ${item.language}): "${item.text.slice(0, 45)}..."`
    );

    try {
      const result = await synthesizeGeminiTtsWithCarousel(
        item.text,
        item.geminiVoice,
        item.language,
        outPath,
        geminiKeys,
        gcloudKey
      );

      // Также дублируем в CACHE_DIR для совместимости со старыми генераторами
      try {
        fs.copyFileSync(outPath, path.resolve(CACHE_DIR, filename));
      } catch (_) {}

      console.log(`     ✅ OK: ${result.model} (ключ #${result.keyIndex}) -> ${fs.statSync(outPath).size} байт`);
      successCount++;
      await sleep(1200); // 1.2s delay for gentle RPM
    } catch (err) {
      console.error(`     ❌ Ошибка синтеза ${filename}: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`📊 ИТОГИ СИНТЕЗА ФАБРИКИ-500:`);
  console.log(`   ✅ Успешно сгенерировано: ${successCount}`);
  console.log(`   ⏭️ Пропущено (уже в банке): ${skippedCount}`);
  console.log(`   ❌ Ошибок: ${failCount}`);
  console.log(`   📁 Аудиобанк: ${AUDIO_BANK}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
