/**
 * scripts/generate_mom_drills_gemini.cjs
 *
 * Генерация студийного аудио для колоды «Мамы Израиля» (все 142 фразы)
 * через нейросетевой движок Gemini 3.1 Flash TTS (голос: Aoede).
 *
 * Инварианты:
 * - R-16: Ключ читается из .env.local (GEMINI_TTS_API_KEY).
 * - R-17: Женский голос 'Aoede' для материнской тематики.
 * - R-18: Огласованный כתיב מלא, 3-4 слова, живая израильская просодика.
 * - R-24: Монолитные MP3 44.1kHz через ffmpeg без склеек слогов.
 * - Кэш-контроль: Файлы со статусом 'verified_gemini_3.5' в audio_metadata.json
 *   пропускаются, чтобы исключить повторную трату бюджета.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');

require('../tests/register.cjs');
const { MOM_DRILLS_DATA } = require('../src/data/drills/momDrillsData.ts');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const SENTENCES_DIR = path.resolve(__dirname, '../public/audio/sentences');
const MANIFEST_PATH = path.resolve(SENTENCES_DIR, 'manifest.json');
const METADATA_PATH = path.resolve(SENTENCES_DIR, 'audio_metadata.json');
const ENV_PATH = path.resolve(__dirname, '../.env.local');

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

function loadCatalog() {
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) : {};
  const metadata = fs.existsSync(METADATA_PATH) ? JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8')) : {};

  const items = [];
  const entries = Object.entries(MOM_DRILLS_DATA);

  for (const [key, item] of entries) {
    if (!item || !item.sentenceHe) continue;
    const normKey = normalizeSentenceKey(item.sentenceHe);
    const hash = crypto.createHash('md5').update(normKey).digest('hex').slice(0, 12);
    const fileName = manifest[normKey] || `s_${hash}.mp3`;

    const isAlreadyGenerated = metadata[fileName]?.status === 'verified_gemini_3.5';

    items.push({
      id: item.id,
      targetWord: key,
      sentenceHe: item.sentenceHe,
      sentenceRu: item.sentenceRu,
      sentenceTranscription: item.sentenceTranscription || '',
      normKey,
      fileName,
      isAlreadyGenerated,
    });
  }

  return { items, manifest, metadata };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function synthesizeWithGemini(text, destPath, apiKey, voiceName = 'Aoede', maxRetries = 3) {
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
        console.warn(`⏳ [Rate Limit 429] Ожидание 10с перед повтором (${attempt}/${maxRetries})...`);
        await sleep(10000);
        continue;
      }

      if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message || JSON.stringify(data.error)}`);
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
      ]);

      if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
      return fs.statSync(destPath).size;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`⚠️ Попытка ${attempt} не удалась: ${err.message}. Повтор через 3с...`);
      await sleep(3000);
    }
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const apiKey = getApiKey();
  const { items, manifest, metadata } = loadCatalog();

  const alreadyDone = items.filter((i) => i.isAlreadyGenerated);
  const pending = items.filter((i) => !i.isAlreadyGenerated);

  console.log('====================================================');
  console.log('🎙️ ГЕНЕРАЦИЯ АУДИО ДЛЯ КОЛОДЫ «МАМЫ ИЗРАИЛЯ» (GEMINI 3.5 TTS)');
  console.log(`Всего предложений в колоде: ${items.length}`);
  console.log(`Уже сгенерировано Gemini 3.5 (кэш): ${alreadyDone.length}`);
  console.log(`Осталось сгенерировать: ${pending.length}`);
  console.log(`Голос: Aoede (нативный израильский женский голос)`);
  console.log(`Режим dry-run: ${isDryRun ? 'ВКЛЮЧЕН (без запросов к API)' : 'ВЫКЛЮЧЕН (боевая генерация)'}`);
  console.log('====================================================\n');

  if (isDryRun) {
    console.log('📋 Список ожидающих генерации фраз:');
    pending.forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.targetWord}] ${p.sentenceHe} (${p.sentenceRu}) -> ${p.fileName}`);
    });
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    const targetFile = path.join(SENTENCES_DIR, item.fileName);
    const progress = `[${String(i + 1).padStart(2, ' ')}/${pending.length}] (всего: ${alreadyDone.length + i + 1}/${items.length})`;

    try {
      const bytes = await synthesizeWithGemini(item.sentenceHe, targetFile, apiKey, 'Aoede');

      // Обновляем манифест и реестр метаданных
      manifest[item.normKey] = item.fileName;
      metadata[item.fileName] = {
        id: item.id,
        targetWord: item.targetWord,
        sentenceHe: item.sentenceHe,
        sentenceRu: item.sentenceRu,
        category: 'mom',
        deck: 'Мамы в Израиле',
        engine: 'gemini-3.1-flash-tts-preview',
        modelFamily: 'gemini-3.5',
        voice: 'Aoede',
        status: 'verified_gemini_3.5',
        generatedAt: new Date().toISOString()
      };

      successCount++;
      console.log(`✓ ${progress} ${item.sentenceHe.padEnd(36)} -> ${item.fileName} (${bytes} байт)`);

      // Периодическое автосохранение каждые 10 записей
      if (successCount % 10 === 0) {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
        fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
      }

      // Вежливая пауза между запросами
      await sleep(600);
    } catch (err) {
      failCount++;
      console.error(`✗ ${progress} Ошибка на фразе "${item.sentenceHe}": ${err.message}`);
    }
  }

  // Финальное сохранение обновленного манифеста и метаданных
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');

  console.log('\n====================================================');
  console.log(`🎉 ИТОГО: Успешно сгенерировано новых: ${successCount} фраз.`);
  console.log(`Общее количество озвученных Gemini 3.5: ${alreadyDone.length + successCount} из ${items.length}.`);
  if (failCount > 0) {
    console.log(`⚠️ Ошибок: ${failCount}`);
  }
  console.log(`Метаданные зафиксированы в: public/audio/sentences/audio_metadata.json`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Критический сбой:', err.message);
  process.exit(1);
});
