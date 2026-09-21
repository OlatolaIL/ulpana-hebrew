/**
 * scripts/generate_from_manifests.cjs
 *
 * Генератор 100% аудио предложений по точным манифестам:
 * - 565 мужских фраз -> he-IL-Chirp3-HD-Fenrir (♂)
 * - 2 123 женские фразы -> he-IL-Chirp3-HD-Aoede (♀)
 * Итого: 2 688 файлов.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const SENTENCES_DIR = path.resolve(repoRoot, 'public/audio/sentences');
const MANIFEST_PATH = path.resolve(SENTENCES_DIR, 'manifest.json');

const args = process.argv.slice(2);
const tokenArg = args.find((a) => a.startsWith('--token='));
const projectArg = args.find((a) => a.startsWith('--project='));
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const isForce = args.includes('--force');
const isResume = args.includes('--resume');
const isMaleOnly = args.includes('--male-only');
const isFemaleOnly = args.includes('--female-only');
const limitArg = args.find((a) => a.startsWith('--limit='));

const token = tokenArg ? tokenArg.replace('--token=', '').trim() : process.env.GCP_ACCESS_TOKEN || '';
const projectId = projectArg ? projectArg.replace('--project=', '').trim() : process.env.GCP_PROJECT_ID || 'project-aebc6692-f6eb-4d2f-b1b';
const concurrency = concurrencyArg ? parseInt(concurrencyArg.replace('--concurrency=', ''), 10) : 4;
const limit = limitArg ? parseInt(limitArg.replace('--limit=', ''), 10) : Infinity;

if (!token) {
  console.error('❌ ОШИБКА: Не передан OAuth2 токен Google Cloud (--token=ya29...)');
  process.exit(1);
}

const MALE_VOICE = 'he-IL-Chirp3-HD-Fenrir';
const FEMALE_VOICE = 'he-IL-Chirp3-HD-Aoede';

function normalizeSentenceKey(text) {
  return text
    .replace(/[\u0591-\u05C7]/g, '')
    .toLowerCase()
    .replace(/[؟?.,!;:״׳"'—«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let manifestCache = {};
if (fs.existsSync(MANIFEST_PATH)) {
  try {
    manifestCache = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {}
}

function saveManifestKey(key, fileName) {
  manifestCache[key] = fileName;
}

function persistManifest() {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestCache, null, 2), 'utf-8');
}

function parseTsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const items = [];
  // Skip header line (Index, FileName, SentenceHebrew, Transcription, Russian)
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 3) {
      items.push({
        index: parts[0].trim(),
        fileName: parts[1].trim(),
        sentenceHe: parts[2].trim(),
        transcription: parts[3] ? parts[3].trim() : '',
        russian: parts[4] ? parts[4].trim() : '',
      });
    }
  }
  return items;
}

async function synthesizeGcp(text, destPath, voiceName, maxRetries = 6) {
  const clean = text
    .replace(/[؟？]/g, '?')
    .replace(/[！]/g, '!')
    .replace(/["״׳«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const payload = {
    input: { text: clean },
    voice: { languageCode: 'he-IL', name: voiceName },
    audioConfig: {
      audioEncoding: 'MP3',
      sampleRateHertz: 24000,
      speakingRate: 0.95,
    },
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-goog-user-project': projectId,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        const waitSec = 15 * attempt;
        console.warn(`⏳ [Rate Limit 429] Квота Google Cloud в минуту. Ожидание ${waitSec}с перед повтором (${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }

      const data = await res.json();
      if (data.audioContent) {
        const buf = Buffer.from(data.audioContent, 'base64');
        fs.writeFileSync(destPath, buf);
        return buf.length;
      }
      throw new Error(`No audioContent in response`);
    } catch (e) {
      if (attempt === maxRetries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('🎙️  МАССОВАЯ ГЕНЕРАЦИЯ АУДИО ИЗ МАНИФЕСТОВ GOOGLE CLOUD CHIRP 3 HD');
  console.log(`    Мужской голос (♂): ${MALE_VOICE}`);
  console.log(`    Женский голос (♀): ${FEMALE_VOICE}`);
  console.log(`    Project ID:        ${projectId}`);
  console.log('================================================================\n');

  const maleTsvPath = path.resolve(repoRoot, 'public/sentences_male_manifest.tsv');
  const femaleTsvPath = path.resolve(repoRoot, 'public/sentences_female_manifest.tsv');

  const maleItems = !isFemaleOnly && fs.existsSync(maleTsvPath) ? parseTsv(maleTsvPath) : [];
  const femaleItems = !isMaleOnly && fs.existsSync(femaleTsvPath) ? parseTsv(femaleTsvPath) : [];

  console.log(`Найдено в мужском манифесте: ${maleItems.length} фраз`);
  console.log(`Найдено в женском манифесте: ${femaleItems.length} фраз`);

  const allTasks = [];

  // Мужские задачи
  for (const item of maleItems) {
    const dest = path.resolve(SENTENCES_DIR, item.fileName);
    const exists = fs.existsSync(dest) && fs.statSync(dest).size > 200;
    const isFresh = exists && (Date.now() - fs.statSync(dest).mtimeMs < 45 * 60 * 1000);

    if (isForce || (!isResume && !exists) || (isResume && !isFresh)) {
      allTasks.push({
        gender: 'male',
        voice: MALE_VOICE,
        fileName: item.fileName,
        sentenceHe: item.sentenceHe,
        destPath: dest,
        manifestKey: normalizeSentenceKey(item.sentenceHe),
      });
    }
  }

  // Женские задачи
  for (const item of femaleItems) {
    const dest = path.resolve(SENTENCES_DIR, item.fileName);
    const exists = fs.existsSync(dest) && fs.statSync(dest).size > 200;
    const isFresh = exists && (Date.now() - fs.statSync(dest).mtimeMs < 45 * 60 * 1000);

    if (isForce || (!isResume && !exists) || (isResume && !isFresh)) {
      const normKey = normalizeSentenceKey(item.sentenceHe);
      const isSuffix = item.fileName.endsWith('_f.mp3');
      allTasks.push({
        gender: 'female',
        voice: FEMALE_VOICE,
        fileName: item.fileName,
        sentenceHe: item.sentenceHe,
        destPath: dest,
        manifestKey: isSuffix ? `${normKey}::female` : normKey,
        altKey: normKey,
      });
    }
  }

  const tasksToRun = allTasks.slice(0, limit);
  console.log(`\nВсего задач к выполнению: ${tasksToRun.length} (пропущено готовых: ${maleItems.length + femaleItems.length - allTasks.length})\n`);

  if (tasksToRun.length === 0) {
    console.log('✅ Все файлы уже существуют. Перезапуск не требуется. Используйте --force для принудительной перезаписи.');
    return;
  }

  let completed = 0;
  let errors = 0;
  let totalBytes = 0;
  const startTime = Date.now();

  for (let i = 0; i < tasksToRun.length; i += concurrency) {
    const batch = tasksToRun.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (task) => {
        try {
          const bytes = await synthesizeGcp(task.sentenceHe, task.destPath, task.voice);
          completed++;
          totalBytes += bytes;

          saveManifestKey(task.manifestKey, task.fileName);
          if (task.altKey) saveManifestKey(task.altKey, task.fileName);

          if (completed % 25 === 0 || completed === tasksToRun.length) {
            const pct = Math.round((completed / tasksToRun.length) * 100);
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const rps = (completed / Math.max(1, elapsed)).toFixed(1);
            console.log(`[${completed}/${tasksToRun.length}] [${pct}%] (${elapsed}с, ${rps} фр/с) ✓ ${task.gender === 'male' ? '♂' : '♀'} ${task.fileName} — "${task.sentenceHe}"`);
            persistManifest();
          }
        } catch (err) {
          errors++;
          console.error(`✗ Ошибка [${task.fileName}]:`, err.message);
        }
      })
    );

    // Пауза 80мс между пачками для стабильности RPM
    await new Promise((r) => setTimeout(r, 80));
  }

  persistManifest();
  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n================================================================');
  console.log(`🎉 ГЕНЕРАЦИЯ УСПЕШНО ЗАВЕРШЕНА ЗА ${durationSec} СЕК.!`);
  console.log(`   Успешно создано: ${completed} MP3 файлов`);
  console.log(`   Ошибок:          ${errors}`);
  console.log(`   Общий объём:     ${(totalBytes / (1024 * 1024)).toFixed(2)} МБ`);
  console.log(`   Манифест:        ${MANIFEST_PATH}`);
  console.log('================================================================\n');
}

main().catch((e) => {
  console.error('Критический сбой:', e);
  process.exit(1);
});
