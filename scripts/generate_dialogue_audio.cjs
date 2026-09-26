/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * scripts/generate_dialogue_audio.cjs
 *
 * Пакетная генерация нейросетевых MP3-файлов для реплик диалогов (Этап 5).
 * Использует Microsoft Neural TTS:
 * - ♂ he-IL-AvriNeural для мужских реплик
 * - ♀ he-IL-HilaNeural для женских реплик
 *
 * Файлы сохраняются в public/audio/dialogues/
 * Манифест сохраняется в public/audio/dialogues/manifest.json
 *
 * Использование:
 *   node --require ./tests/register.cjs scripts/generate_dialogue_audio.cjs --lesson=3
 *   node --require ./tests/register.cjs scripts/generate_dialogue_audio.cjs --lessons=1-10
 *   node --require ./tests/register.cjs scripts/generate_dialogue_audio.cjs --all
 */

const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const repoRoot = path.join(__dirname, '..');
const { getScriptedDialogueForLesson } = require(path.join(repoRoot, 'src/data/dialogueLessons.ts'));
const { stripNikkud } = require(path.join(repoRoot, 'src/lib/transcription.ts'));

const DIALOGUES_DIR = path.resolve(repoRoot, 'public/audio/dialogues');
const MANIFEST_PATH = path.resolve(DIALOGUES_DIR, 'manifest.json');

if (!fs.existsSync(DIALOGUES_DIR)) {
  fs.mkdirSync(DIALOGUES_DIR, { recursive: true });
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function cleanHebrewForTts(text) {
  return stripNikkud(text)
    .replace(/[؟？]/g, '?')
    .replace(/[！]/g, '!')
    .replace(/["״׳«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function synthesizeTurn(text, voice, destPath, retries = 3) {
  const clean = cleanHebrewForTts(text);
  if (!clean) return { success: false, error: 'Empty text' };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(clean);
      const buf = await new Promise((resolve, reject) => {
        const chunks = [];
        const timer = setTimeout(() => {
          reject(new Error('TTS WebSocket stream timeout (8s)'));
        }, 8000);

        (async () => {
          try {
            for await (const chunk of audioStream) {
              chunks.push(chunk);
            }
            clearTimeout(timer);
            const combined = Buffer.concat(chunks);
            if (combined.length < 100) {
              return reject(new Error('Buffer too small: ' + combined.length));
            }
            resolve(combined);
          } catch (err) {
            clearTimeout(timer);
            reject(err);
          }
        })();
      });

      fs.writeFileSync(destPath, buf);
      return { success: true, bytes: buf.length };
    } catch (err) {
      if (attempt === retries) {
        return { success: false, error: err.message };
      }
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  let lessonIds = [3]; // По умолчанию урок 3

  const lessonArg = args.find(a => a.startsWith('--lesson='));
  const lessonsArg = args.find(a => a.startsWith('--lessons='));
  const isAll = args.includes('--all');

  if (isAll) {
    lessonIds = Array.from({ length: 100 }, (_, i) => i + 1);
  } else if (lessonsArg) {
    const range = lessonsArg.split('=')[1];
    const [start, end] = range.split('-').map(Number);
    lessonIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else if (lessonArg) {
    lessonIds = [parseInt(lessonArg.split('=')[1], 10)];
  }

  console.log('====================================================');
  console.log('🎙️ ГЕНЕРАЦИЯ ДИАЛОГОВЫХ АУДИОФАЙЛОВ (MICROSOFT NEURAL)');
  console.log(`Уроки в обработке: ${lessonIds.join(', ')}`);
  console.log('====================================================\n');

  const manifest = loadManifest();
  let generatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const combos = ['mm', 'mf', 'fm', 'ff'];

  for (const lessonId of lessonIds) {
    let dialogue;
    try {
      dialogue = getScriptedDialogueForLesson(lessonId);
    } catch (err) {
      console.warn(`Урок ${lessonId}: не удалось получить диалог:`, err.message);
      continue;
    }

    console.log(`\n📖 Урок ${lessonId}: «${dialogue.titleRu || dialogue.titleHe}» (${dialogue.turns.length} реплик)`);

    for (const turn of dialogue.turns) {
      for (const combo of combos) {
        const key = `d${lessonId}_${turn.id}_${combo}`;
        const fileName = `${key}.mp3`;
        const destPath = path.join(DIALOGUES_DIR, fileName);

        // Говорящий: первая буква комбинации ('m' -> male, 'f' -> female)
        const speakerGender = combo[0] === 'm' ? 'male' : 'female';
        const voice = speakerGender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural';

        const variant = turn.variants[combo] || turn.variants.mm;
        if (!variant || !variant.hebrew) continue;

        // Проверяем наличие файла
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
          skippedCount++;
          // Убедимся, что ключ есть в манифесте
          if (!manifest[key]) {
            manifest[key] = {
              lessonId,
              turnId: turn.id,
              combo,
              speakerGender,
              voice,
              engine: 'edge',
              fileName,
              hebrew: variant.hebrew,
              translation: variant.translation,
            };
          }
          continue;
        }

        process.stdout.write(`  [${key}] (${speakerGender}, ${voice.split('-')[2]}): ${variant.hebrew.substring(0, 30)}... `);
        const res = await synthesizeTurn(variant.hebrew, voice, destPath);

        if (res.success) {
          generatedCount++;
          manifest[key] = {
            lessonId,
            turnId: turn.id,
            combo,
            speakerGender,
            voice,
            engine: 'edge',
            fileName,
            bytes: res.bytes,
            hebrew: variant.hebrew,
            translation: variant.translation,
          };
          console.log(`OK (${res.bytes} байт)`);
        } else {
          errorCount++;
          console.log(`ERROR (${res.error})`);
        }

        // Небольшая задержка, чтобы не спамить Edge TTS
        await new Promise(r => setTimeout(r, 60));
      }
    }
    saveManifest(manifest);
  }

  saveManifest(manifest);
  console.log('\n====================================================');
  console.log(`✅ ГОТОВО! Сгенерировано: ${generatedCount} | Пропущено (уже есть): ${skippedCount} | Ошибок: ${errorCount}`);
  console.log(`Манифест обновлён: ${MANIFEST_PATH}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
