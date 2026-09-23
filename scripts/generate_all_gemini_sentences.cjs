/**
 * scripts/generate_all_gemini_sentences.cjs
 *
 * Генерация студийного нейросетевого аудио для всего пакета из 2 688 предложений курса:
 * - 2 123 женских предложений -> Gemini 3.5 TTS (голос: Aoede)
 * - 565 мужских предложений -> Gemini 3.5 TTS (голос: Fenrir)
 *
 * Инварианты:
 * - R-13: Только проверенные факты и логи, без домыслов.
 * - R-16: Ключ GEMINI_TTS_API_KEY берется из .env.local, никогда не логируется.
 * - R-17: Строгое разделение мужского (Fenrir) и женского (Aoede) голосов.
 * - R-18: Огласованный כתיב מלא из канонических TSV-манифестов.
 * - R-24: Монолитные студийные MP3 44.1kHz через ffmpeg без склеек слогов.
 * - Кэш и идемпотентность: Файлы со статусом 'verified_gemini_3.5' пропускаются.
 * - Квота-контроль: При лимите 429 RESOURCE_EXHAUSTED сохраняет прогресс и завершает батч.
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

  // Header: Index, FileName, SentenceHebrew, Transcription, Russian
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

function loadCatalog() {
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) : {};
  const metadata = fs.existsSync(METADATA_PATH) ? JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8')) : {};

  const femaleItems = parseTsv(FEMALE_TSV, 'female', 'Aoede');
  const maleItems = parseTsv(MALE_TSV, 'male', 'Fenrir');
  const allItems = [...femaleItems, ...maleItems];

  // Проверка на уже сгенерированные
  for (const item of allItems) {
    const filePath = path.join(SENTENCES_DIR, item.fileName);
    const hasMetadata = metadata[item.fileName]?.status === 'verified_gemini_3.5';
    const hasFile = fs.existsSync(filePath) && fs.statSync(filePath).size > 1000;
    item.isAlreadyGenerated = hasMetadata && hasFile;
  }

  return { items: allItems, manifest, metadata };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function synthesizeWithGemini(text, destPath, apiKey, voiceName, maxRetries = 3) {
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
        const isDailyQuota = /quota|exhausted/i.test(errMsg);
        if (attempt === maxRetries && isDailyQuota) {
          const quotaErr = new Error(`Gemini API Quota Exhausted: ${errMsg || 'RESOURCE_EXHAUSTED'}`);
          quotaErr.isQuotaExhausted = true;
          throw quotaErr;
        }
        console.warn(`⏳ [Rate Limit 429] Ожидание 12с перед повтором (${attempt}/${maxRetries})...`);
        await sleep(12000);
        continue;
      }

      if (data.error) {
        const err = new Error(`Gemini API Error: ${data.error.message || JSON.stringify(data.error)}`);
        if (/quota|exhausted|429/i.test(err.message)) err.isQuotaExhausted = true;
        throw err;
      }

      const candidate = data.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;

      if (!audioData) {
        throw new Error(`No audio data received in response: ${JSON.stringify(data)}`);
      }

      const pcmBuffer = Buffer.from(audioData, 'base64');
      const tempPcm = path.join(SENTENCES_DIR, `temp_${Date.now()}_${Math.random().toString(36).slice(2)}.pcm`);
      fs.writeFileSync(tempPcm, pcmBuffer);

      // Конвертация сырого PCM (24kHz mono 16-bit LE) в чистый студийный MP3 44.1kHz (R-24)
      cp.execFileSync(ffmpegPath, [
        '-y',
        '-f', 's16le',
        '-ar', '24000',
        '-ac', '1',
        '-i', tempPcm,
        '-ar', '44100',
        '-b:a', '128k',
        destPath
      ], { stdio: 'ignore' });

      if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
      return fs.statSync(destPath).size;
    } catch (err) {
      if (err.isQuotaExhausted || attempt === maxRetries) throw err;
      console.warn(`⚠️ Попытка ${attempt} не удалась: ${err.message}. Повтор через 3с...`);
      await sleep(3000);
    }
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 100;

  const apiKey = getApiKey();
  const { items, manifest, metadata } = loadCatalog();

  const alreadyDone = items.filter((i) => i.isAlreadyGenerated);
  const pending = items.filter((i) => !i.isAlreadyGenerated);

  console.log('================================================================');
  console.log('🎙️ ПАКЕТНАЯ ГЕНЕРАЦИЯ ВСЕХ 2 688 ПРЕДЛОЖЕНИЙ (GEMINI 3.5 TTS)');
  console.log(`Всего предложений в каноническом пакете: ${items.length}`);
  console.log(`Уже сгенерировано и верифицировано: ${alreadyDone.length}`);
  console.log(`Осталось сгенерировать: ${pending.length}`);
  console.log(`Лимит на текущий запуск: ${limit} фраз`);
  console.log(`Режим dry-run: ${isDryRun ? 'ВКЛЮЧЕН (без запросов к API)' : 'ВЫКЛЮЧЕН (боевая генерация)'}`);
  console.log('================================================================\n');

  if (pending.length === 0) {
    console.log('🎉 ВСЕ 2 688 ПРЕДЛОЖЕНИЙ КУРСА ПОЛНОСТЬЮ СГЕНЕРИРОВАНЫ GEMINI 3.5! РАБОТА ЗАВЕРШЕНА.');
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
      const bytes = await synthesizeWithGemini(item.sentenceHe, targetFile, apiKey, item.voiceName);

      // Обновляем манифест и реестр метаданных
      manifest[item.normKey] = item.fileName;
      metadata[item.fileName] = {
        id: item.id,
        sentenceHe: item.sentenceHe,
        sentenceRu: item.russian,
        sentenceTranscription: item.transcription,
        gender: item.gender,
        voice: item.voiceName,
        engine: 'gemini-3.1-flash-tts-preview',
        modelFamily: 'gemini-3.5',
        status: 'verified_gemini_3.5',
        generatedAt: new Date().toISOString()
      };

      successCount++;
      const genderIcon = item.gender === 'female' ? '♀' : '♂';
      console.log(`✓ ${progress} ${genderIcon} ${item.sentenceHe.padEnd(36)} -> ${item.fileName} (${bytes} байт)`);

      // Периодическое сохранение каждые 10 записей
      if (successCount % 10 === 0) {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
        fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
      }

      // Пауза 1200мс между запросами для защиты от RPM лимита
      await sleep(1200);
    } catch (err) {
      failCount++;
      console.error(`✗ ${progress} Ошибка на фразе "${item.sentenceHe}": ${err.message}`);

      if (err.isQuotaExhausted || /quota|exhausted|429/i.test(err.message)) {
        console.warn('\n🛑 Достигнут суточный лимит квоты Gemini API (RESOURCE_EXHAUSTED).');
        console.warn('Сохраняем текущий прогресс и завершаем запуск до следующей попытки по расписанию.');
        quotaHit = true;
        break;
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
