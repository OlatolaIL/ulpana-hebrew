/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Скрипт пакетной генерации студийного нейросетевого аудио для предложений (Edge Neural TTS)
 * ♂ he-IL-AvriNeural — чистый глубокий мужской голос (для мужских и нейтральных фраз)
 * ♀ he-IL-HilaNeural — чистый мягкий женский голос (для женских фраз и женских профилей)
 *
 * Использование:
 *   node --require ./tests/register.cjs scripts/generate_edge_sentences.cjs --female-only
 *   node --require ./tests/register.cjs scripts/generate_edge_sentences.cjs --all
 *   node --require ./tests/register.cjs scripts/generate_edge_sentences.cjs --missing-only
 */

const path = require('path');
const fs = require('fs');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const repoRoot = path.join(__dirname, '..');
const {
  getAllSystemSentences,
  getSentencesManifest,
  saveToSentencesManifest,
} = require(path.join(repoRoot, 'src/lib/audioSentencesCatalog.ts'));
const { normalizeSentenceKey } = require(path.join(repoRoot, 'src/lib/speech.ts'));

const SENTENCES_DIR = path.resolve(repoRoot, 'public/audio/sentences');
if (!fs.existsSync(SENTENCES_DIR)) {
  fs.mkdirSync(SENTENCES_DIR, { recursive: true });
}

// Аргументы командной строки
const args = process.argv.slice(2);
const isFemaleOnly = args.includes('--female-only');
const isSensitiveMale = args.includes('--sensitive-male');
const isMissingOnly = args.includes('--missing-only');
const isAll = args.includes('--all');
const concurrency = 4;

async function synthesizeWithEdge(text, destFileName, voice, retries = 3) {
  const destPath = path.resolve(SENTENCES_DIR, destFileName);
  const cleanText = text
    .replace(/[؟？]/g, '?')
    .replace(/[！]/g, '!')
    .replace(/["״׳«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return { success: false, error: 'Empty text' };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(cleanText);
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const buf = Buffer.concat(chunks);
      if (buf.length < 100) throw new Error('Empty buffer');

      fs.writeFileSync(destPath, buf);
      return { success: true, bytes: buf.length };
    } catch (err) {
      if (attempt === retries) {
        return { success: false, error: err?.message || String(err) };
      }
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
}

async function run() {
  console.log('=== [Edge Neural TTS] Генератор предложений Ульпан Алеф ===');
  console.log(`Режим: ${isFemaleOnly ? 'Только женские варианты (♀)' : isSensitiveMale ? 'Только мужские варианты М/Ж предложений (♂ Avri)' : isAll ? 'Все предложения' : 'Недостающие файлы'}`);

  const allSentences = getAllSystemSentences();
  console.log(`Всего предложений в системе: ${allSentences.length}`);

  const manifest = getSentencesManifest();

  // Собираем задачи на генерацию
  const tasks = [];

  for (const s of allSentences) {
    // 1. Женские варианты для чувствительных к полу предложений (1-е и 2-е лицо)
    if (!isSensitiveMale && s.isGenderSensitive && s.femaleVariant) {
      const fHe = s.femaleVariant.sentenceHe;
      const fFileName = s.femaleVariant.fileName;
      const fKey = `${normalizeSentenceKey(s.sentenceHe)}::female`;
      const fDirectKey = normalizeSentenceKey(fHe);
      const fPath = path.resolve(SENTENCES_DIR, fFileName);
      const fExists = fs.existsSync(fPath);

      if (!fExists || !isMissingOnly) {
        tasks.push({
          type: 'female_variant',
          text: fHe,
          voice: 'he-IL-HilaNeural',
          fileName: fFileName,
          manifestKeys: [fKey, fDirectKey],
          desc: `♀ [Ж-вариант]: "${fHe}" (к "${s.sentenceHe}")`,
        });
      }
    }

    // 2. Основные предложения (мужской / дефолтный голос)
    if (!isFemaleOnly) {
      const mainPath = path.resolve(SENTENCES_DIR, s.fileName);
      const mainExists = fs.existsSync(mainPath);

      if (isSensitiveMale) {
        if (s.isGenderSensitive) {
          tasks.push({
            type: 'main_sensitive',
            text: s.sentenceHe,
            voice: 'he-IL-AvriNeural',
            fileName: s.fileName,
            manifestKeys: [normalizeSentenceKey(s.sentenceHe)],
            desc: `♂ [М-вариант]: "${s.sentenceHe}"`,
          });
        }
      } else if (!mainExists || isAll) {
        const voice = s.genderCategory === 'third_person_f' ? 'he-IL-HilaNeural' : 'he-IL-AvriNeural';
        tasks.push({
          type: 'main',
          text: s.sentenceHe,
          voice,
          fileName: s.fileName,
          manifestKeys: [normalizeSentenceKey(s.sentenceHe)],
          desc: `${voice.includes('Hila') ? '♀' : '♂'} [Основной]: "${s.sentenceHe}"`,
        });
      }
    }
  }

  console.log(`Задач на синтез: ${tasks.length}`);
  if (tasks.length === 0) {
    console.log('Все запрашиваемые аудиофайлы уже сгенерированы!');
    return;
  }

  let completed = 0;
  let failed = 0;
  const startTime = Date.now();

  async function worker(queue) {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;

      const res = await synthesizeWithEdge(task.text, task.fileName, task.voice);
      if (res.success) {
        completed++;
        for (const k of task.manifestKeys) {
          manifest[k] = task.fileName;
        }
        if (completed % 10 === 0 || completed === tasks.length) {
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`[${completed}/${tasks.length}] (${elapsedSec}s) Готово: ${task.fileName} - ${task.desc}`);
        }
      } else {
        failed++;
        console.error(`[ОШИБКА] ${task.fileName} (${task.desc}): ${res.error}`);
      }
    }
  }

  const queue = [...tasks];
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker(queue));
  }

  await Promise.all(workers);

  const MANIFEST_PATH = path.resolve(SENTENCES_DIR, 'manifest.json');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Манифест успешно сохранен (${Object.keys(manifest).length} записей).`);

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Синтез завершен за ${totalSec}s ===`);
  console.log(`Успешно: ${completed}, Ошибок: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Критический сбой:', err);
  process.exit(1);
});
