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

function getApiKey() {
  if (process.env.GEMINI_TTS_API_KEY) return process.env.GEMINI_TTS_API_KEY.trim();
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const m = content.match(/GEMINI_TTS_API_KEY=([^\r\n]+)/);
    if (m) return m[1].trim();
  }
  throw new Error('GEMINI_TTS_API_KEY not found in .env.local');
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

  for (const item of allItems) {
    const filePath = path.join(SENTENCES_DIR, item.fileName);
    const hasMetadata =
      metadata[item.fileName]?.status === 'verified_gemini_3.8' ||
      metadata[item.fileName]?.status === 'verified_gemini_3.1' ||
      metadata[item.fileName]?.status === 'verified_gemini_3.5';
    const hasFile = fs.existsSync(filePath) && fs.statSync(filePath).size > 1000;
    item.isAlreadyGenerated = !options.isForce && hasMetadata && hasFile;
  }

  return { items: allItems, manifest, metadata };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TTS_MODELS = [
  { id: 'gemini-3.8-flash-lite-tts', family: 'gemini-3.8', status: 'verified_gemini_3.8' },
  { id: 'gemini-3.8-flash-tts', family: 'gemini-3.8', status: 'verified_gemini_3.8' },
  { id: 'gemini-3.1-flash-tts-preview', family: 'gemini-3.1', status: 'verified_gemini_3.1' }
];

let activeModelIdx = 0;

async function synthesizeWithGemini(text, destPath, apiKey, voiceName, maxRetries = 5) {
  while (activeModelIdx < TTS_MODELS.length) {
    const currentModel = TTS_MODELS[activeModelIdx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel.id}:generateContent?key=${apiKey}`;
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

        if (res.status === 429 || data.error?.code === 429) {
          const errMsg = data.error?.message || '';
          const isDailyExhausted = /per_model_per_day|Please retry in/i.test(errMsg);

          if (isDailyExhausted) {
            console.warn(`🛑 Модель [${currentModel.id}] исчерпала суточный лимит: ${errMsg}`);
            activeModelIdx++;
            if (activeModelIdx < TTS_MODELS.length) {
              console.warn(`🔄 Автопереключение на каскадную модель: [${TTS_MODELS[activeModelIdx].id}]...`);
              break; // Пробуем следующую модель в каскаде
            } else {
              const quotaErr = new Error(`Все модели Gemini TTS в пуле исчерпали суточный лимит (300 фраз).`);
              quotaErr.isAllModelsExhausted = true;
              throw quotaErr;
            }
          }

          if (attempt === maxRetries) {
            const quotaErr = new Error(`Gemini API 429 Rate Limit (10 RPM): ${errMsg || 'RESOURCE_EXHAUSTED'}`);
            quotaErr.isRateLimit = true;
            throw quotaErr;
          }
          console.warn(`⏳ [Rate Limit 429] Окно 10 RPM модели [${currentModel.id}] заполнено. Ожидание 20с (${attempt}/${maxRetries})...`);
          await sleep(20000);
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
        const isRawPcm = /l16|pcm|raw/i.test(mimeType) || currentModel.family === 'gemini-3.1';
        const tempExt = isRawPcm ? 'pcm' : 'wav';
        const tempFile = path.join(SENTENCES_DIR, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.${tempExt}`);
        fs.writeFileSync(tempFile, audioBuffer);

        // Конвертация сырого PCM (24kHz s16le) или WAV в студийный MP3 44.1kHz (R-24)
        const ffmpegArgs = isRawPcm
          ? ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempFile, '-ar', '44100', '-b:a', '128k', destPath]
          : ['-y', '-i', tempFile, '-ar', '44100', '-b:a', '128k', destPath];

        cp.execFileSync(ffmpegPath, ffmpegArgs, { stdio: 'ignore' });

        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        bytesWritten = fs.statSync(destPath).size;
        attemptSuccess = true;
        break;
      } catch (err) {
        if (err.isAllModelsExhausted) throw err;
        if (attempt === maxRetries) throw err;
        console.warn(`⚠️ Ошибка запроса (${attempt}/${maxRetries}): ${err.message}. Повтор через 5с...`);
        await sleep(5000);
      }
    }

    if (attemptSuccess) {
      return { bytes: bytesWritten, model: currentModel };
    }
  }

  const exhaustedErr = new Error('Все модели Gemini TTS (3.8-lite, 3.8-flash, 3.1) исчерпали свои суточные лимиты.');
  exhaustedErr.isAllModelsExhausted = true;
  throw exhaustedErr;
}

async function main() {
  const args = process.argv.slice(2);
  const isForce = args.includes('--force');
  const isDryRun = args.includes('--dry-run');
  const isMaleOnly = args.includes('--male-only');
  const isFemaleOnly = args.includes('--female-only');

  let limit = Infinity;
  const limitArg = args.find((a) => a.startsWith('--limit='));
  if (limitArg) {
    const val = limitArg.split('=')[1];
    limit = val === 'all' ? Infinity : parseInt(val, 10);
  }

  const apiKey = getApiKey();
  const { items, manifest, metadata } = loadCatalog({ isForce, isMaleOnly, isFemaleOnly });

  const alreadyDone = items.filter((i) => i.isAlreadyGenerated);
  const pending = items.filter((i) => !i.isAlreadyGenerated);

  console.log('================================================================');
  console.log('🎙️ ТРЕХМОДЕЛЬНАЯ КАСКАДНАЯ ГЕНЕРАЦИЯ (GEMINI 3.8 / 3.8-LITE / 3.1 TTS)');
  console.log(`Всего предложений в каноническом пакете: ${items.length}`);
  console.log(`Уже сгенерировано и верифицировано: ${alreadyDone.length}`);
  console.log(`Осталось сгенерировать: ${pending.length}`);
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
      const { bytes, model } = await synthesizeWithGemini(item.sentenceHe, targetFile, apiKey, item.voiceName);

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
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
        fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
      }

      // Пауза 8500мс между запросами для строгого соблюдения лимита 10 RPM (~7 запросов в минуту)
      await sleep(8500);
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
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');

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
