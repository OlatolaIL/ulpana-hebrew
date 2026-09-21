import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { getAllSystemSentences, SentenceDrillItem } from '../src/lib/audioSentencesCatalog';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const ROOT = path.resolve(process.cwd());
const OUTPUT_DIR = path.resolve(ROOT, 'public/audio/sentences/gemini');
const BATCHES_MANIFEST = path.resolve(ROOT, 'src/data/gemini_audio_batches.json');
const BATCH_SIZE = 100;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getGeminiApiKey(): string {
  const envPath = path.resolve(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m1 = content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    const m2 = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (m1) return m1[1].trim();
    if (m2) return m2[1].trim();
  }
  return process.env.GEMINI_PRIMARY_API_KEY || process.env.GEMINI_API_KEY || '';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface BatchItemMeta {
  index: number;
  id: string;
  sentenceHe: string;
  sentenceRu: string;
  category: string;
  targetWord?: string;
  voice: 'Puck' | 'Aoede';
  fileName: string;
  hasAudio: boolean;
  sizeBytes?: number;
}

export interface BatchGroup {
  batchId: number;
  totalItems: number;
  completedItems: number;
  status: 'pending' | 'in_progress' | 'completed';
  items: BatchItemMeta[];
}

/**
 * Инициализирует или загружает структуру 25 батчей по 100 элементов
 */
export function loadOrInitBatches(): BatchGroup[] {
  const allSentences = getAllSystemSentences();
  const total = allSentences.length;

  let existingBatches: BatchGroup[] = [];
  if (fs.existsSync(BATCHES_MANIFEST)) {
    try {
      existingBatches = JSON.parse(fs.readFileSync(BATCHES_MANIFEST, 'utf8'));
    } catch {}
  }

  const batches: BatchGroup[] = [];
  const numBatches = Math.ceil(total / BATCH_SIZE);

  for (let b = 0; b < numBatches; b++) {
    const start = b * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, total);
    const slice = allSentences.slice(start, end);

    const items: BatchItemMeta[] = slice.map((s, idx) => {
      const overallIndex = start + idx + 1;
      const targetFile = path.resolve(OUTPUT_DIR, s.fileName);
      const exists = fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000;
      const sizeBytes = exists ? fs.statSync(targetFile).size : 0;

      // Определение голоса по R-17:
      // Женский, если женская грамматика или HilaNeural, иначе мужской Puck
      const isFemale =
        s.defaultVoice === 'he-IL-HilaNeural' ||
        s.genderCategory === 'second_person_f' ||
        s.genderCategory === 'third_person_f' ||
        s.sentenceHe.startsWith('הִיא') ||
        s.sentenceHe.includes('אַתְּ ') ||
        s.category === 'mom';

      return {
        index: overallIndex,
        id: s.id,
        sentenceHe: s.sentenceHe,
        sentenceRu: s.sentenceRu,
        category: s.category,
        targetWord: s.targetWord,
        voice: isFemale ? 'Aoede' : 'Puck',
        fileName: s.fileName,
        hasAudio: exists,
        sizeBytes,
      };
    });

    const completed = items.filter((i) => i.hasAudio).length;
    const status = completed === items.length ? 'completed' : completed > 0 ? 'in_progress' : 'pending';

    batches.push({
      batchId: b + 1,
      totalItems: items.length,
      completedItems: completed,
      status,
      items,
    });
  }

  fs.writeFileSync(BATCHES_MANIFEST, JSON.stringify(batches, null, 2), 'utf8');
  return batches;
}

/**
 * Синтезирует аудио одного предложения через Google AI Studio (Gemini 2.5 Flash TTS)
 */
export async function synthesizeGeminiItem(
  item: BatchItemMeta,
  maxRetries = 4
): Promise<{ success: boolean; bytes: number; error?: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_PRIMARY_API_KEY not found');

  const destPath = path.resolve(OUTPUT_DIR, item.fileName);
  const tempRaw = destPath + '.raw';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: item.sentenceHe }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: item.voice },
        },
      },
    },
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 429 || data.error?.code === 429) {
        console.warn(`⏳ [429 Rate Limit] Превышен лимит 10 RPM. Ожидание 62с для сброса окна...`);
        await sleep(62000);
        continue;
      }

      if (res.status !== 200 || data.error) {
        return {
          success: false,
          bytes: 0,
          error: data.error?.message || `HTTP ${res.status}`,
        };
      }

      const part = data.candidates?.[0]?.content?.parts?.[0];
      if (!part?.inlineData?.data) {
        return { success: false, bytes: 0, error: 'No audio data in candidate' };
      }

      const rawBuffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync(tempRaw, rawBuffer);

      // Конвертируем raw PCM (24kHz, 1ch, s16le) в чистый MP3 192k
      cp.spawnSync(ffmpeg, [
        '-y',
        '-f', 's16le',
        '-ar', '24000',
        '-ac', '1',
        '-i', tempRaw,
        '-ar', '44100',
        '-ac', '2',
        '-b:a', '192k',
        destPath,
      ]);

      if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);

      const size = fs.statSync(destPath).size;
      item.hasAudio = true;
      item.sizeBytes = size;

      return { success: true, bytes: size };
    } catch (err: any) {
      if (attempt === maxRetries) {
        return { success: false, bytes: 0, error: err.message };
      }
      console.warn(`⚠️ Сетевой сбой (${attempt}/${maxRetries}): ${err.message}. Пауза 5с...`);
      await sleep(5000);
    }
  }

  return { success: false, bytes: 0, error: 'Max retries exceeded' };
}

async function runCli() {
  const args = process.argv.slice(2);
  const batches = loadOrInitBatches();

  if (args.includes('--status')) {
    console.log('\n======================================================');
    console.log('📋 СТАТУС БАТЧЕЙ ОЗВУЧКИ GEMINI TTS (25 батчей по 100)');
    console.log('======================================================');
    batches.forEach((b) => {
      const icon = b.status === 'completed' ? '✅' : b.status === 'in_progress' ? '🔄' : '⏳';
      console.log(
        `Батч #${b.batchId.toString().padStart(2, '0')}: ${icon} ${b.status.padEnd(12)} [${b.completedItems}/${b.totalItems} готово]`
      );
    });
    return;
  }

  const batchArg = args.find((a) => a.startsWith('--batch='));
  const batchId = batchArg ? parseInt(batchArg.split('=')[1], 10) : 1;

  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : BATCH_SIZE;

  // Безопасная пауза между запросами: 6500мс (гарантирует темп ~9.2 запроса в минуту при лимите 10 RPM)
  const delayArg = args.find((a) => a.startsWith('--delay='));
  const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 6500;

  const targetBatch = batches.find((b) => b.batchId === batchId);
  if (!targetBatch) {
    console.error(`❌ Батч #${batchId} не найден (всего ${batches.length} батчей)`);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log(`🎙️  ЗАПУСК СИНТЕЗА GEMINI TTS: БАТЧ #${batchId}`);
  console.log(`Всего в батче: ${targetBatch.totalItems} | Лимит текущего прогона: ${limit}`);
  console.log(`Темп: 1 запрос каждые ${(delayMs / 1000).toFixed(1)}с (безопасно для Free Tier 10 RPM)`);
  console.log('======================================================\n');

  const itemsToProcess = targetBatch.items.slice(0, limit);
  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (let i = 0; i < itemsToProcess.length; i++) {
    const item = itemsToProcess[i];
    const overallNum = `[${i + 1}/${itemsToProcess.length}] (#${item.index})`;

    // Если уже сгенерирован — пропускаем
    const destPath = path.resolve(OUTPUT_DIR, item.fileName);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`${overallNum} ⏭️ Уже готов: ${item.fileName} (${Math.round(fs.statSync(destPath).size / 1024)} KB) — "${item.sentenceHe}"`);
      skippedCount++;
      continue;
    }

    const t0 = Date.now();
    console.log(`${overallNum} 🎙️ [${item.voice}] Синтез: "${item.sentenceHe}" (${item.sentenceRu})...`);

    const res = await synthesizeGeminiItem(item);
    const durMs = Date.now() - t0;

    if (res.success) {
      successCount++;
      console.log(`${overallNum} ✅ Готово (${(res.bytes / 1024).toFixed(1)} KB, ${durMs}ms) -> ${item.fileName}`);
    } else {
      failCount++;
      console.error(`${overallNum} ❌ Ошибка: ${res.error}`);
    }

    // Сохраняем промежуточный статус батчей
    targetBatch.completedItems = targetBatch.items.filter((it) => it.hasAudio).length;
    targetBatch.status = targetBatch.completedItems === targetBatch.totalItems ? 'completed' : 'in_progress';
    fs.writeFileSync(BATCHES_MANIFEST, JSON.stringify(batches, null, 2), 'utf8');

    // Пауза перед следующим запросом (если не последний элемент)
    if (i < itemsToProcess.length - 1 && res.success) {
      await sleep(delayMs);
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 ИТОГИ ПРОГОНА БАТЧА #${batchId}:`);
  console.log(`Успешно: ${successCount} | Пропущено: ${skippedCount} | Ошибок: ${failCount}`);
  console.log(`Общий прогресс батча #${batchId}: ${targetBatch.completedItems}/${targetBatch.totalItems}`);
  console.log('======================================================\n');
}

// Запуск при прямом вызове
if (process.argv[1]?.includes('generate_gemini_sentences')) {
  runCli().catch((err) => {
    console.error('Fatal CLI Error:', err);
    process.exit(1);
  });
}
