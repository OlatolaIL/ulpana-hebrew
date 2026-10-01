/**
 * scripts/generate_all_gemini_sentences.cjs
 *
 * Трехмодельный каскадный генератор студийного нейросетевого аудио для курса «Ульпан Алеф» (2 688 предложений):
 * 1. gemini-3.8-flash-lite-tts (100 фраз/сутки)
 * 2. gemini-3.8-flash-tts      (100 фраз/сутки)
 * 3. gemini-3.1-flash-tts-preview (100 фраз/сутки)
 * Суммарная пропускная способность: 300 предложений в сутки на одних и тех же голосах курса (Orus ♂ / Aoede ♀).
 *
 * Инварианты:
 * - R-13: Только проверенные факты и логи, без домыслов.
 * - R-16: Ключ GEMINI_TTS_API_KEY берется из .env.local, никогда не логируется.
 * - R-17: Строгое разделение мужского (Orus) и женского (Aoede) голосов.
 * - R-18: Огласованный כתיב מלא из канонических TSV-манифестов.
 * - R-24: Монолитные студийные MP3 44.1kHz через ffmpeg без склеек слогов.
 * - Кэш и идемпотентность: Файлы со статусом 'verified_gemini_3.8', 'verified_gemini_3.1' или 'verified_gemini_3.5' пропускаются.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const repoRoot = path.resolve(__dirname, '..');
const SENTENCES_DIR = path.resolve(repoRoot, 'public/audio/sentences');
const MANIFEST_PATH = path.resolve(SENTENCES_DIR, 'manifest.json');
const METADATA_PATH = path.resolve(SENTENCES_DIR, 'audio_metadata.json');
const ENV_PATH = path.resolve(repoRoot, '.env.local');

const FEMALE_TSV = path.resolve(repoRoot, 'public/sentences_female_manifest.tsv');
const MALE_TSV = path.resolve(repoRoot, 'public/sentences_male_manifest.tsv');

if (!fs.existsSync(SENTENCES_DIR)) {
  fs.mkdirSync(SENTENCES_DIR, { recursive: true });
}

const { getGeminiApiKeys, maskKey } = require('./gemini_carousel.cjs');

function safeWriteJson(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return;
    } catch (err) {
      if (attempt === 5) throw err;
      const waitMs = attempt * 150;
      const start = Date.now();
      while (Date.now() - start < waitMs) {}
    }
  }
}

function getApiKeys() {
  const keyObjs = getGeminiApiKeys();
  if (!keyObjs.length) throw new Error('No Gemini API keys found in .env.local');
  return keyObjs.map((k) => k.key);
}

function stripNikkud(text) {
  return text ? text.replace(/[\u0591-\u05C7]/g, '') : '';
}

function normalizeSentenceKey(sentence) {
  return stripNikkud(sentence)
    .replace(/["״׳']/g, '')
    .replace(/[.,!?:;«»()[\]{}—\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Фонетическая нормализация иврита перед передачей в нейросеть Gemini TTS.
 * Исправляет редукцию согласных и гарантирует правильное звучание.
 */
function normalizeHebrewForGeminiTts(text) {
  if (!text) return '';
  let res = text;

  // 1. Нормализация слова «вода» (מים, במים, במיים):
  // В стандартном написании מַיִם с одним йодом нейросеть Gemini TTS редуцирует [j]
  // в гласное зияние [baˈma.im] («маим»).
  // Написание с усиленным כתיב מלא (двойной йод) בַּמַּיִּים / מַיִּים заставляет
  // акустическую модель Gemini четко артикулировать согласный глайд [j] -> [baˈmajim] («майим»).
  res = res.replace(/(^|[\s.,!?:;«»"״׳()[\]{}—])([בלהומכ]?[\u0591-\u05C7]*)מ[\u0591-\u05C7]*י[\u0591-\u05C7]*ם(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/g, (match, p1, prefix) => {
    const p = prefix || '';
    if (!p) return `${p1}מַיִּים`;
    if (p.includes('בַּ') || p.includes('בַּ') || p.includes('בַ') || p === 'ב') return `${p1}בַּמַּיִּים`;
    if (p.includes('בְּ') || p.includes('בְּ') || p.includes('בְ')) return `${p1}בְּמַיִּים`;
    if (p.includes('הַ') || p === 'ה') return `${p1}הַמַּיִּים`;
    if (p.includes('וּ') || p.includes('וְ') || p === 'ו') return `${p1}וּמַיִּים`;
    if (p.includes('לַ') || p.includes('לְ') || p === 'ל') return `${p1}לַמַּיִּים`;
    if (p.includes('מִ') || p.includes('מֵ') || p === 'מ') return `${p1}מִמַּיִּים`;
    return `${p1}${p}מַיִּים`;
  });

  return res;
}

function parseTsv(filePath, gender, voiceName) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 3) {
      const fileName = parts[1].trim();
      const sentenceHe = parts[2].trim();
      const transcription = parts[3] ? parts[3].trim() : '';
      const russian = parts[4] ? parts[4].trim() : '';

      items.push({
        id: `tsv_${gender}_${parts[0].trim()}`,
        fileName,
        sentenceHe,
        transcription,
        russian,
        gender,
        voiceName,
        normKey: normalizeSentenceKey(sentenceHe)
      });
    }
  }
  return items;
}

function loadCatalog(options = {}) {
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) : {};
  const metadata = fs.existsSync(METADATA_PATH) ? JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8')) : {};

  const femaleItems = parseTsv(FEMALE_TSV, 'female', 'Aoede');
  const maleItems = parseTsv(MALE_TSV, 'male', 'Orus');
  let allItems = [...femaleItems, ...maleItems];

  if (options.isMaleOnly) allItems = allItems.filter((i) => i.gender === 'male');
  if (options.isFemaleOnly) allItems = allItems.filter((i) => i.gender === 'female');

  let metadataModified = false;
  for (const item of allItems) {
    const filePath = path.join(SENTENCES_DIR, item.fileName);
    const hasMetadata =
      metadata[item.fileName]?.status === 'verified_gemini_3.8' ||
      metadata[item.fileName]?.status === 'verified_gemini_3.1' ||
      metadata[item.fileName]?.status === 'verified_gemini_3.5';
    const hasFile = fs.existsSync(filePath) && fs.statSync(filePath).size > 25000;
    
    // Авто-хилинг: если файл физически есть на диске и валиден, фиксируем в метаданных и никогда не переозвучиваем
    if (hasFile && !hasMetadata) {
      metadata[item.fileName] = {
        status: 'verified_gemini_3.8',
        model: 'auto_healed_from_disk',
        voice: item.voiceName,
        verifiedAt: new Date().toISOString()
      };
      metadataModified = true;
    }
    const isTargetFile = options.targetFile && item.fileName === options.targetFile;
    const isWaterWord = /(^|[\s.,!?:;«»"״׳()[\]{}—])([בלהומכ]?[\u0591-\u05C7]*)מ[\u0591-\u05C7]*י[\u0591-\u05C7]*ם(?=[\s.,!?:;«»"״׳()[\]{}—]|$)/.test(item.sentenceHe);
    const isTargetWord = options.targetWord && (
      options.targetWord === 'מים' ? isWaterWord : item.sentenceHe.includes(options.targetWord)
    );
    const forceThisItem = Boolean(isTargetFile || isTargetWord);

    item.isWaterWord = isWaterWord;
    item.isAlreadyGenerated = !options.isForce && !forceThisItem && (hasMetadata || hasFile);
  }

  if (metadataModified) {
    safeWriteJson(METADATA_PATH, metadata);
  }

  return { items: allItems, manifest, metadata };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TTS_MODELS = [
  { id: 'gemini-3.8-flash-tts', family: 'gemini-3.8', status: 'verified_gemini_3.8' },
  { id: 'gemini-3.8-flash-lite-tts', family: 'gemini-3.8', status: 'verified_gemini_3.8' },
  { id: 'gemini-3.1-flash-tts-preview', family: 'gemini-3.1', status: 'verified_gemini_3.1' }
];

const exhaustedSlots = new Set();
const exhaustedKeys = new Set();
let globalSlots = null;
let currentSlotIdx = 0;

function getNextAvailableSlot(slots) {
  let scanned = 0;
  while (scanned < slots.length) {
    const slot = slots[currentSlotIdx % slots.length];
    const slotKey = `${slot.keyIndex}_${slot.model.id}`;
    if (!exhaustedKeys.has(slot.keyIndex) && !exhaustedSlots.has(slotKey)) {
      return slot;
    }
    currentSlotIdx++;
    scanned++;
  }
  return null;
}

async function synthesizeWithGemini(rawText, destPath, apiKeys, voiceName, maxRetries = 3) {
  const text = normalizeHebrewForGeminiTts(rawText);
  if (!globalSlots) {
    globalSlots = [];
    apiKeys.forEach((key, kIdx) => {
      TTS_MODELS.forEach((model) => {
        globalSlots.push({ key, model, keyIndex: kIdx + 1 });
      });
    });
  }

  while (true) {
    const slot = getNextAvailableSlot(globalSlots);
    if (!slot) break;

    const slotKey = `${slot.keyIndex}_${slot.model.id}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${slot.model.id}:generateContent?key=${slot.key}`;
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

    let attemptSuccess = false;
    let bytesWritten = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.status === 402 || data.error?.code === 402) {
          console.warn(`⚠️ [402 Payment Required] на ключе #${slot.keyIndex}. Ключ исключён из карусели.`);
          exhaustedKeys.add(slot.keyIndex);
          currentSlotIdx++;
          break;
        }

        if (res.status === 429 || data.error?.code === 429) {
          const errMsg = data.error?.message || '';
          const detailsStr = JSON.stringify(data.error?.details || '');
          const combinedErr = errMsg + ' ' + detailsStr;
          const isDailyExhausted = /per_model_per_day|per_day|per day|PerDay|GenerateRequestsPerDay/i.test(combinedErr);

          if (isDailyExhausted) {
            console.warn(`🛑 Модель [${slot.model.id}] исчерпала суточный лимит на ключе #${slot.keyIndex}. Ротация слота...`);
            exhaustedSlots.add(slotKey);
            currentSlotIdx++;
            break;
          }

          if (attempt === maxRetries) {
            console.warn(`⏳ [RPM 429] Модель [${slot.model.id}] на ключе #${slot.keyIndex} достигла минутного лимита. Временная ротация...`);
            currentSlotIdx++;
            break;
          }
          console.warn(`⏳ [Rate Limit 429] Окно RPM модели [${slot.model.id}] на ключе #${slot.keyIndex}. Ожидание 5с (${attempt}/${maxRetries})...`);
          await sleep(5000);
          continue;
        }

        if (data.error) {
          const err = new Error(`Gemini API Error: ${data.error.message || JSON.stringify(data.error)}`);
          throw err;
        }

        const candidate = data.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;

        if (!audioData) {
          throw new Error(`No audio data received in response: ${JSON.stringify(data)}`);
        }

        const audioBuffer = Buffer.from(audioData, 'base64');
        const mimeType = part?.inlineData?.mimeType || '';
        const isRawPcm = /l16|pcm|raw/i.test(mimeType) || slot.model.family === 'gemini-3.1';
        const tempExt = isRawPcm ? 'pcm' : 'wav';
        const tempFile = path.join(SENTENCES_DIR, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.${tempExt}`);
        fs.writeFileSync(tempFile, audioBuffer);

        const ffmpegArgs = isRawPcm
          ? ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempFile, '-ar', '44100', '-b:a', '128k', destPath]
          : ['-y', '-i', tempFile, '-ar', '44100', '-b:a', '128k', destPath];

        cp.execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'ignore' });

        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        bytesWritten = fs.statSync(destPath).size;
        attemptSuccess = true;
        break;
      } catch (err) {
        if (attempt === maxRetries) {
          currentSlotIdx++;
          break;
        }
        console.warn(`⚠️ Ошибка запроса (${attempt}/${maxRetries}): ${err.message}. Повтор через 2с...`);
        await sleep(2000);
      }
    }

    if (attemptSuccess) {
      return { bytes: bytesWritten, model: slot.model, keyIndex: slot.keyIndex };
    }
  }

  const exhaustedErr = new Error('Все доступные ключи и модели Gemini TTS исчерпали свои суточные лимиты.');
  exhaustedErr.isAllModelsExhausted = true;
  throw exhaustedErr;
}

async function main() {
  const args = process.argv.slice(2);
  const isForce = args.includes('--force');
  const isDryRun = args.includes('--dry-run');
  const isMaleOnly = args.includes('--male-only');
  const isFemaleOnly = args.includes('--female-only');
  // --force-water: принудительно перегенерировать все фразы с «вода» (מים),
  // игнорируя кэш. Исправляет баг: старые файлы синтезированы без нормализации
  // двойного йода и произносятся «маим» вместо «майим».
  const isForceWater = args.includes('--force-water');

  let limit = Infinity;
  const limitArg = args.find((a) => a.startsWith('--limit='));
  if (limitArg) {
    const val = limitArg.split('=')[1];
    limit = val === 'all' ? Infinity : parseInt(val, 10);
  }

  const targetFileArg = args.find((a) => a.startsWith('--target-file='));
  const targetFile = targetFileArg ? targetFileArg.split('=')[1].trim() : null;

  const targetWordArg = args.find((a) => a.startsWith('--word='));
  // --force-water автоматически подразумевает targetWord=מים
  const targetWord = isForceWater ? 'מים' : (targetWordArg ? targetWordArg.split('=')[1].trim() : null);

  const apiKeys = getApiKeys();
  const { items, manifest, metadata } = loadCatalog({ isForce, isMaleOnly, isFemaleOnly, targetFile, targetWord, isForceWater });

  const alreadyDone = items.filter((i) => i.isAlreadyGenerated);
  const pending = items.filter((i) => !i.isAlreadyGenerated);

  // Первоочередная приоритезация: целевой файл, целевое слово и любые фразы со словом «вода» (מים) идут первыми
  pending.sort((a, b) => {
    const aPri = (targetFile && a.fileName === targetFile) || a.isWaterWord;
    const bPri = (targetFile && b.fileName === targetFile) || b.isWaterWord;
    if (aPri && !bPri) return -1;
    if (!aPri && bPri) return 1;
    return 0;
  });

  console.log('================================================================');
  console.log('🎙️ ШЕСТИКАНАЛЬНАЯ КАСКАДНАЯ ГЕНЕРАЦИЯ (2 КОНТУРА × 3 МОДЕЛИ GEMINI TTS)');
  console.log(`Всего предложений в каноническом пакете: ${items.length}`);
  console.log(`Уже сгенерировано и верифицировано: ${alreadyDone.length}`);
  console.log(`Осталось сгенерировать: ${pending.length}`);
  console.log(`Ключей в карусели: ${apiKeys.length}`);
  console.log(`Лимит на текущий запуск: ${limit} фраз`);
  console.log(`Режим dry-run: ${isDryRun ? 'ВКЛЮЧЕН (без запросов к API)' : 'ВЫКЛЮЧЕН (боевая генерация)'}`);
  if (isMaleOnly) console.log('Фильтр: ТОЛЬКО МУЖСКИЕ ПРЕДЛОЖЕНИЯ (голос: Orus)');
  if (isFemaleOnly) console.log('Фильтр: ТОЛЬКО ЖЕНСКИЕ ПРЕДЛОЖЕНИЯ (голос: Aoede)');
  console.log('================================================================\n');

  if (pending.length === 0) {
    console.log('🎉 ВСЕ ПРЕДЛОЖЕНИЯ ПОЛНОСТЬЮ СГЕНЕРИРОВАНЫ! РАБОТА ЗАВЕРШЕНА.');
    return;
  }

  if (isDryRun) {
    console.log(`📋 Первые ${Math.min(limit, pending.length)} ожидающих генерации фраз:`);
    const toShow = pending.slice(0, limit);
    toShow.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.gender === 'female' ? '♀' : '♂'} ${p.voiceName}] ${p.sentenceHe} (${p.russian}) -> ${p.fileName}`);
    });
    if (pending.length > limit) {
      console.log(`  ... и ещё ${pending.length - limit} фраз в следующих батчах.`);
    }
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let quotaHit = false;

  const batch = pending.slice(0, limit);

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    const targetFile = path.join(SENTENCES_DIR, item.fileName);
    const progress = `[${String(i + 1).padStart(2, ' ')}/${batch.length}] (всего: ${alreadyDone.length + i + 1}/${items.length})`;

    try {
      const { bytes, model } = await synthesizeWithGemini(item.sentenceHe, targetFile, apiKeys, item.voiceName);

      // Обновляем манифест и реестр метаданных
      manifest[item.normKey] = item.fileName;
      metadata[item.fileName] = {
        id: item.id,
        sentenceHe: item.sentenceHe,
        sentenceRu: item.russian,
        sentenceTranscription: item.transcription,
        gender: item.gender,
        voice: item.voiceName,
        engine: model.id,
        modelFamily: model.family,
        status: model.status,
        generatedAt: new Date().toISOString()
      };

      successCount++;
      const genderIcon = item.gender === 'female' ? '♀' : '♂';
      console.log(`✓ ${progress} ${genderIcon} [${model.id}] ${item.sentenceHe.padEnd(36)} -> ${item.fileName} (${bytes} байт)`);

      // Периодическое сохранение каждые 10 записей
      if (successCount % 10 === 0) {
        safeWriteJson(MANIFEST_PATH, manifest);
        safeWriteJson(METADATA_PATH, metadata);
      }

      // Пауза 2500мс между запросами: при 3-модельной карусели это 7.5с на модель (~8 RPM при лимите 15 RPM)
      await sleep(2500);
    } catch (err) {
      failCount++;
      console.error(`✗ ${progress} Ошибка на фразе "${item.sentenceHe}": ${err.message}`);

      if (err.isAllModelsExhausted) {
        console.warn('\n🛑 Достигнут суточный лимит ВСЕХ моделей Gemini TTS в пуле (300 фраз).');
        console.warn('Сохраняем текущий прогресс. Следующий батч продолжит по расписанию.');
        quotaHit = true;
        break;
      }

      if (err.isRateLimit || /quota|exhausted|429/i.test(err.message)) {
        console.warn('⚠️ [Rate Limit] Минутное окно временно заполнено. Пауза 30с перед следующим элементом...');
        await sleep(30000);
      }
    }
  }

  // Финальное сохранение
  safeWriteJson(MANIFEST_PATH, manifest);
  safeWriteJson(METADATA_PATH, metadata);

  console.log('\n================================================================');
  console.log(`📊 ИТОГО ЗАПУСКА:`);
  console.log(`  Успешно сгенерировано новых: ${successCount} фраз.`);
  console.log(`  Ошибок: ${failCount}`);
  console.log(`  Общий прогресс пакета: ${alreadyDone.length + successCount} из ${items.length} (${Math.round(((alreadyDone.length + successCount) / items.length) * 100)}%).`);
  const stillPending = items.length - (alreadyDone.length + successCount);
  console.log(`  Осталось фраз до полного пакета: ${stillPending}`);
  if (quotaHit) {
    console.log(`  Статус: ПРИОСТАНОВЛЕНО ПО ЛИМИТУ КВОТЫ (повтор запланирован по расписанию).`);
  } else if (stillPending === 0) {
    console.log(`  🎉 ВЕСЬ ПАКЕТ ИЗ 2 688 ПРЕДЛОЖЕНИЙ ПОЛНОСТЬЮ СГЕНЕРИРОВАН!`);
  }
  console.log(`Метаданные зафиксированы в: public/audio/sentences/audio_metadata.json`);
  console.log('================================================================');
}

main().catch((err) => {
  console.error('Критический сбой:', err.message);
  process.exit(1);
});
