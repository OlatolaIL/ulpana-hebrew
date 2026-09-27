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
  'gemini-3.1-flash-tts-preview',
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
];

let activeKeyIdx = 0;
let activeModelIdx = 0;

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
 * 2. Синтез через Gemini TTS с автоматической 4-ключевой и помодельной каруселью
 */
async function synthesizeGeminiTtsWithCarousel(text, voiceName, langCode, outPath, geminiKeys, gcloudKey) {
  const isRussian = langCode === 'ru';
  const speed = isRussian ? 1.15 : 1.0;

  // Пытаемся по карусели ключей и моделей Gemini
  const totalCombos = geminiKeys.length * GEMINI_MODELS.length;
  let attempts = 0;

  while (attempts < totalCombos) {
    const currentKey = geminiKeys[activeKeyIdx % geminiKeys.length];
    const currentModel = GEMINI_MODELS[activeModelIdx % GEMINI_MODELS.length];
    attempts++;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${currentKey}`;
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

      if (res.status === 429 || data.error?.code === 429) {
        const msg = data.error?.message || '';
        const isDaily = /per_model_per_day|Please retry in/i.test(msg);

        if (isDaily) {
          console.warn(`  🛑 [${currentModel}] исчерпал дневной лимит 100 запросов на ключе ${activeKeyIdx + 1}. Ротация...`);
          // Переключаем модель или ключ
          activeModelIdx++;
          if (activeModelIdx % GEMINI_MODELS.length === 0) {
            activeKeyIdx++;
          }
          continue;
        } else {
          console.warn(`  ⏳ [429 RPM] Модель ${currentModel} на ключе ${activeKeyIdx + 1}. Ротация ключа...`);
          activeKeyIdx++;
          await sleep(2000);
          continue;
        }
      }

      if (res.status === 402 || data.error?.code === 402) {
        console.warn(`  ⚠️ [402 Payment Required] на ключе ${activeKeyIdx + 1}. Переход к следующему ключу...`);
        activeKeyIdx++;
        continue;
      }

      const b64Data = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!b64Data) {
        throw new Error(`Empty audio data from Gemini: ${data.error?.message || 'unknown error'}`);
      }

      const pcmBuffer = Buffer.from(b64Data, 'base64');
      const tempPcm = outPath + '.pcm';
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
        '-b:a', '128k',
        outPath,
      ]);
      try { fs.unlinkSync(tempPcm); } catch (_) {}

      if (conv.status === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 100) {
        return { success: true, model: currentModel, keyIndex: (activeKeyIdx % geminiKeys.length) + 1 };
      }
    } catch (err) {
      console.warn(`  ⚠️ Исключение на ключе ${activeKeyIdx + 1} (${currentModel}): ${err.message}`);
      activeKeyIdx++;
      await sleep(1000);
    }
  }

  // Если все Gemini ключи и модели исчерпаны, резервный фолбэк на Google Cloud TTS
  if (gcloudKey) {
    console.warn(`  🔄 Переход на резервный Google Cloud TTS REST API...`);
    const gVoice = isRussian ? 'ru-RU-Neural2-D' : (voiceName === 'Orus' ? 'he-IL-Wavenet-B' : 'he-IL-Wavenet-A');
    await synthesizeGoogleCloudTts(text, gVoice, langCode, outPath, gcloudKey);
    return { success: true, model: 'google-cloud-tts', keyIndex: 'gcloud' };
  }

  throw new Error('All carousel keys and models exhausted.');
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
    // По умолчанию уроки 2-10 (Шаг 1 плана)
    console.log('ℹ️ Диапазон не указан. Запуск приоритета 1: Уроки 2–10.');
    itemsToProcess = catalog.filter((c) => c.lesson >= 2 && c.lesson <= 10);
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
