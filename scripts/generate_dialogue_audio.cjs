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
const cp = require('child_process');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

let ffmpegPath = null;
try {
  ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
} catch {}

const repoRoot = path.join(__dirname, '..');
const { getScriptedDialogueForLesson } = require(path.join(repoRoot, 'src/data/dialogueLessons.ts'));
const { stripNikkud } = require(path.join(repoRoot, 'src/lib/transcription.ts'));

const DIALOGUES_DIR = path.resolve(repoRoot, 'public/audio/dialogues');
const GEMINI_DIR = path.resolve(DIALOGUES_DIR, 'gemini');
const MANIFEST_PATH = path.resolve(DIALOGUES_DIR, 'manifest.json');

if (!fs.existsSync(DIALOGUES_DIR)) {
  fs.mkdirSync(DIALOGUES_DIR, { recursive: true });
}

function getGeminiApiKeys() {
  const envPath = path.join(repoRoot, '.env.local');
  const keys = [];
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('GEMINI_TTS_API_KEY=') ||
        trimmed.startsWith('GEMINI_PRIMARY_API_KEY=') ||
        trimmed.startsWith('GEMINI_API_KEY=') ||
        trimmed.startsWith('GEMINI_SECONDARY_API_KEY=')
      ) {
        const val = trimmed.split('=')[1]?.trim().replace(/^['"]|['"]$/g, '');
        if (val && !keys.includes(val)) keys.push(val);
      }
    }
  }
  if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
    keys.push(process.env.GEMINI_API_KEY);
  }
  return keys;
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

function stripDageshFrom(text, letters) {
  const set = new Set(letters);
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (set.has(char)) {
      res += char;
      while (i + 1 < text.length && text.charCodeAt(i + 1) >= 0x0591 && text.charCodeAt(i + 1) <= 0x05C7) {
        i++;
        if (text.charCodeAt(i) !== 0x05BC) {
          res += text[i];
        }
      }
    } else {
      res += char;
    }
  }
  return res;
}

function normalizeHebrewForNeuralTts(text) {
  if (!text) return '';
  let res = text;

  // 1. Приоритет современного כתיב מלא (R-04)
  res = res.replace(/וְעַכְשָׁו/g, 'וְעַכְשָׁיו').replace(/ועכשו/g, 'ועכשיו');
  res = res.replace(/בַּלִּמּוּדִים/g, 'בַּלִּימוּדִים');
  res = res.replace(/בְּתֵאָבוֹן/g, 'בְּתֵיאָבוֹן').replace(/בתאבון/g, 'בתיאבון');

  // 2. Снятие нефонематического дагеша со всех букв, кроме смыслоразличительных [ב, כ, פ]
  // В современном иврите только ב (б/в), כ (к/х), פ (п/ф) меняют звучание от дагеша.
  // На остальных буквах (ת, ד, ג, ק, ט, צ, ס, ז, ר, ל, מ, נ) библейский масоретский дагеш
  // ломает парсер Microsoft TTS: вызывает взрывные щелчки (בבקע שעה вместо בבקשה),
  // искажение гласных (הקיפה вместо הקפה), удвоения (תגיערה) и артефакт «тевода» (תּוֹ -> «тево»).
  const nonPhonemic = ['ג', 'ד', 'ת', 'ק', 'ט', 'צ', 'ס', 'ז', 'ר', 'ל', 'מ', 'נ', 'ש', 'י'];
  res = stripDageshFrom(res, nonPhonemic);

  // 3. Фонетический фикс камац-катан в слове «כל»
  // Нейросеть Microsoft читает כָּל с камацем как «каль» (омофон קל).
  // Замена на כּוֹל гарантирует академическое звучание «коль hа-кавод».
  res = res.replace(/כָּל(?=[\s\-]|$)/g, 'כּוֹל');

  // 4. Фонетический фикс «ברוכה הבאה» (гарантия женского рода «бруха hа-баа», не «брух»):
  res = res.replace(/ב[\u0591-\u05C7]*ר[\u0591-\u05C7]*ו[\u0591-\u05C7]*כ[\u0591-\u05C7]*ה[\u0591-\u05C7]*\s*ה[\u0591-\u05C7]*ב[\u0591-\u05C7]*א[\u0591-\u05C7]*ה[\u0591-\u05C7]*/g, 'ברוכה הבאה');

  // 5. Фонетический фикс «תודה רבה»:
  // Гарантируем огласовку «רַבָּה», чтобы не звучало «рэба»
  res = res.replace(/תּ?[וֹֹ\u05b9]*דָ?ה?\s*רַ?בָּ?ה?/g, 'תודה רַבָּה');
  res = res.replace(/תודה\s+רבה/g, 'תודה רַבָּה');
  res = res.replace(/תּוֹדָה/g, 'תודה');

  // 6. Защита слова אוּלְפָּן (дагеш в букве пей)
  res = res.replace(/([לבמה]?ָ?)אוּלְפָן/g, '$1אוּלְפָּן');
  res = res.replace(/([לבמה]?)אולפן/g, '$1אוּלְפָּן');

  // 7. Очистка от служебных знаков и эмодзи (сохраняя никуд!)
  res = res
    .replace(/[♂♀⚥✔️❌①②③④⑤👉📦🌸🎙️👥↗️➡️⬅️⬆️⬇️✨💫\u200D\uFE0F\uFE0E]/g, '')
    .replace(/[؟？]/g, '?')
    .replace(/[！]/g, '!')
    .replace(/["״׳«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return res;
}

function cleanHebrewForTts(text) {
  return normalizeHebrewForNeuralTts(text);
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

async function synthesizeTurnGemini(text, voice, destPath, apiKeys, retries = 5) {
  const clean = cleanHebrewForTts(text);
  if (!clean) return { success: false, error: 'Empty text' };

  if (!ffmpegPath) {
    return { success: false, error: '@ffmpeg-installer/ffmpeg not found' };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    for (let k = 0; k < apiKeys.length; k++) {
      const apiKey = apiKeys[k];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: clean }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice }
            }
          }
        }
      };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.status === 429 || data.error?.code === 429) {
          console.warn(`⏳ [Gemini 429 Rate Limit] Ключ ${k + 1}. Пробуем следующий...`);
          continue;
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
          const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
          const pcmBuffer = Buffer.from(base64Audio, 'base64');
          const tempPcm = destPath + '.pcm';
          fs.writeFileSync(tempPcm, pcmBuffer);

          // Конвертируем сырой PCM 24000Hz s16le в MP3 44100Hz 128kbps (R-151)
          const proc = cp.spawnSync(ffmpegPath, [
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

          if (proc.status === 0 && fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
            return { success: true, bytes: fs.statSync(destPath).size };
          } else {
            return { success: false, error: 'FFmpeg encoding error: ' + (proc.stderr?.toString() || 'unknown') };
          }
        }

        if (data.error) {
          console.warn(`[Gemini API Error on key ${k + 1}]:`, data.error.message?.slice(0, 100));
        }
      } catch (err) {
        console.warn(`[Network Error on key ${k + 1}]:`, err.message);
      }
    }
    // Задержка перед повторной попыткой при исчерпании пула
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
  return { success: false, error: 'All retries/keys failed' };
}

async function main() {
  const args = process.argv.slice(2);
  let lessonIds = [3]; // По умолчанию урок 3

  const lessonArg = args.find(a => a.startsWith('--lesson='));
  const lessonsArg = args.find(a => a.startsWith('--lessons='));
  const engineArg = args.find(a => a.startsWith('--engine='));
  const isAll = args.includes('--all');
  const isForce = args.includes('--force');

  const targetEngine = engineArg ? engineArg.split('=')[1].toLowerCase() : 'edge'; // 'gemini' | 'edge'

  let targetDir = DIALOGUES_DIR;
  let apiKeys = [];
  if (targetEngine === 'gemini') {
    targetDir = GEMINI_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    apiKeys = getGeminiApiKeys();
    if (!apiKeys.length) {
      console.error('❌ ОШИБКА: Не найдены ключи GEMINI_API_KEY / GEMINI_TTS_API_KEY в .env.local');
      process.exit(1);
    }
  }

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
  console.log(`🎙️ ГЕНЕРАЦИЯ ДИАЛОГОВЫХ АУДИОФАЙЛОВ (${targetEngine.toUpperCase() === 'GEMINI' ? 'GEMINI 3.1 TTS (ORUS/AOEDE)' : 'MICROSOFT NEURAL'})`);
  console.log(`Уроки в обработке: ${lessonIds.join(', ')} | Движок: ${targetEngine} | Перезапись: ${isForce ? 'ВКЛЮЧЕН (--force)' : 'ВЫКЛЮЧЕН'}`);
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
        const destPath = path.join(targetDir, fileName);

        // Говорящий: первая буква комбинации ('m' -> male, 'f' -> female)
        const speakerGender = combo[0] === 'm' ? 'male' : 'female';
        const voice = targetEngine === 'gemini'
          ? (speakerGender === 'male' ? 'Orus' : 'Aoede')
          : (speakerGender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural');

        const variant = turn.variants[combo] || turn.variants.mm;
        if (!variant || !variant.hebrew) continue;

        // Проверяем наличие файла
        if (!isForce && fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
          skippedCount++;
          // Убедимся, что ключ есть в манифесте
          if (!manifest[key] || manifest[key].engine !== targetEngine) {
            manifest[key] = {
              lessonId,
              turnId: turn.id,
              combo,
              speakerGender,
              voice,
              engine: targetEngine,
              fileName,
              hebrew: variant.hebrew,
              translation: variant.translation,
            };
          }
          continue;
        }

        const voiceLabel = targetEngine === 'gemini' ? voice : voice.split('-')[2];
        process.stdout.write(`  [${key}] (${speakerGender}, ${voiceLabel}): ${variant.hebrew.substring(0, 30)}... `);

        let res;
        if (targetEngine === 'gemini') {
          res = await synthesizeTurnGemini(variant.hebrew, voice, destPath, apiKeys);
        } else {
          res = await synthesizeTurn(variant.hebrew, voice, destPath);
        }

        if (res.success) {
          generatedCount++;
          manifest[key] = {
            lessonId,
            turnId: turn.id,
            combo,
            speakerGender,
            voice,
            engine: targetEngine,
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

        // Небольшая пауза между запросами
        await new Promise(r => setTimeout(r, targetEngine === 'gemini' ? 300 : 60));
      }
    }
    saveManifest(manifest);
  }

  saveManifest(manifest);
  console.log('\n====================================================');
  console.log(`✅ ГОТОВО! Сгенерировано: ${generatedCount} | Пропущено (уже есть): ${skippedCount} | Ошибок: ${errorCount}`);
  console.log(`Манифест обновлён: ${MANIFEST_PATH}`);
  console.log('====================================================');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
