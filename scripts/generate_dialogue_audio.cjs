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

const { getGeminiApiKeys, createGeminiCarousel, GEMINI_TTS_MODELS } = require('./gemini_carousel.cjs');

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
  const content = JSON.stringify(manifest, null, 2);
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      fs.writeFileSync(MANIFEST_PATH, content, 'utf8');
      return;
    } catch (err) {
      if (attempt === 5) throw err;
      const waitMs = attempt * 150;
      const start = Date.now();
      while (Date.now() - start < waitMs) {}
    }
  }
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

async function synthesizeTurnGemini(text, voice, destPath, carousel, requiredModel = null) {
  const clean = cleanHebrewForTts(text);
  if (!clean) return { success: false, error: 'Empty text' };

  if (!ffmpegPath) {
    return { success: false, error: '@ffmpeg-installer/ffmpeg not found' };
  }

  while (true) {
    const slot = carousel.getNextAvailableSlot(requiredModel);
    if (!slot) break; // Все слоты Gemini исчерпаны

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${slot.model}:generateContent?key=${slot.key}`;
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

      if (res.status === 402 || data.error?.code === 402) {
        carousel.mark402(slot);
        continue;
      }

      if (res.status === 429 || data.error?.code === 429) {
        const rateInfo = carousel.handleRateLimit(slot, data.error?.message || '');
        if (!rateInfo.daily && rateInfo.retry) {
          await new Promise(r => setTimeout(r, rateInfo.delayMs || 3000));
        }
        continue;
      }

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
        const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
        const pcmBuffer = Buffer.from(base64Audio, 'base64');
        const isWav = pcmBuffer.length >= 12 && pcmBuffer.slice(0, 4).toString('ascii') === 'RIFF' && pcmBuffer.slice(8, 12).toString('ascii') === 'WAVE';
        const tempExt = isWav ? '.wav' : '.pcm';
        const tempAudio = destPath + tempExt;
        fs.writeFileSync(tempAudio, pcmBuffer);

        const ffmpegArgs = ['-y'];
        if (isWav) {
          ffmpegArgs.push('-i', tempAudio);
        } else {
          ffmpegArgs.push('-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempAudio);
        }
        ffmpegArgs.push(
          '-af', 'afade=t=in:st=0:d=0.05,areverse,atrim=start=0.15,afade=t=in:st=0:d=0.08,areverse',
          '-ar', '44100',
          '-b:a', '128k',
          destPath
        );

        const proc = cp.spawnSync(ffmpegPath, ffmpegArgs);

        if (fs.existsSync(tempAudio)) fs.unlinkSync(tempAudio);

        if (proc.status === 0 && fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
          slot.fails = 0;
          return { success: true, bytes: fs.statSync(destPath).size, model: slot.model, keyIndex: slot.keyIndex, keyName: slot.name };
        } else {
          return { success: false, error: 'FFmpeg encoding error: ' + (proc.stderr?.toString() || 'unknown') };
        }
      }

      if (data.error) {
        console.warn(`  [Gemini Error on ${slot.model} (ключ #${slot.keyIndex} ${slot.name})]:`, data.error.message?.slice(0, 100));
        carousel.advance();
      }
    } catch (err) {
      console.warn(`  [Network Error на слоте #${slot.keyIndex} (${slot.model})]:`, err.message);
      carousel.advance();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return { success: false, error: 'All carousel keys and models exhausted' };
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
  const modelArg = args.find(a => a.startsWith('--model='));
  const targetModel = modelArg ? modelArg.split('=')[1] : null;

  let targetDir = DIALOGUES_DIR;
  let carousel = null;
  if (targetEngine === 'gemini') {
    targetDir = GEMINI_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const apiKeys = getGeminiApiKeys();
    if (!apiKeys.length) {
      console.error('❌ ОШИБКА: Не найдены ключи GEMINI_*_KEY в .env.local');
      process.exit(1);
    }
    carousel = createGeminiCarousel(apiKeys);
    console.log(`🔑 Пул ключей Gemini: ${apiKeys.length} шт. | Всего слотов: ${carousel.slots.length}`);
    apiKeys.forEach(k => console.log(`   - Ключ #${k.keyIndex}: ${k.name} [${k.masked}]`));
  }

  if (isAll) {
    lessonIds = Array.from({ length: 100 }, (_, i) => i + 1);
  } else if (lessonsArg) {
    const rawRange = lessonsArg.split('=')[1];
    if (rawRange.includes('-')) {
      const [start, end] = rawRange.split('-').map(Number);
      lessonIds = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else {
      lessonIds = [parseInt(rawRange, 10)];
    }
  } else if (lessonArg) {
    lessonIds = [parseInt(lessonArg.split('=')[1], 10)];
  }

  const isDryRun = args.includes('--dry-run');

  console.log('====================================================');
  console.log(`🎙️ ГЕНЕРАЦИЯ ДИАЛОГОВЫХ АУДИОФАЙЛОВ (${targetEngine.toUpperCase() === 'GEMINI' ? 'GEMINI TTS (КАРУСЕЛЬ СЛОТОВ)' : 'MICROSOFT NEURAL'})`);
  console.log(`Уроки в обработке: ${lessonIds.join(', ')} | Движок: ${targetEngine} | Перезапись: ${isForce ? 'ВКЛЮЧЕН (--force)' : 'ВЫКЛЮЧЕН'}`);
  console.log(`Режим dry-run: ${isDryRun ? 'ВКЛЮЧЕН (без обращений к API)' : 'ВЫКЛЮЧЕН'}`);
  console.log('====================================================\n');

  const manifest = loadManifest();
  let manifestModified = false;
  const combos = ['mm', 'mf', 'fm', 'ff'];

  // 🛡️ PRE-FLIGHT AUDIT: сбор всех задач и отсечение уже существующих файлов ДО вызова API
  const queue = [];
  let alreadyExistingCount = 0;

  for (const lessonId of lessonIds) {
    let dialogue;
    try {
      dialogue = getScriptedDialogueForLesson(lessonId);
    } catch (err) {
      console.warn(`Урок ${lessonId}: не удалось получить диалог:`, err.message);
      continue;
    }

    // R-28: Инвариант однородности модели внутри одного урока
    let lessonModel = targetModel;
    if (!lessonModel && targetEngine === 'gemini' && carousel) {
      const existingTurn = Object.values(manifest).find(m => m.lessonId === lessonId && m.engine === 'gemini' && m.model);
      lessonModel = existingTurn ? existingTurn.model : carousel.getBestAvailableModel();
    }
    if (!lessonModel && targetEngine === 'gemini') {
      lessonModel = 'gemini-3.8-flash-tts';
    }

    for (const turn of dialogue.turns) {
      for (const combo of combos) {
        const key = `d${lessonId}_${turn.id}_${combo}`;
        const fileName = `${key}.mp3`;
        const destPath = path.join(targetDir, fileName);
        const speakerGender = combo[0] === 'm' ? 'male' : 'female';
        const voice = targetEngine === 'gemini'
          ? (speakerGender === 'male' ? 'Orus' : 'Aoede')
          : (speakerGender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural');
        const variant = turn.variants[combo] || turn.variants.mm;
        if (!variant || !variant.hebrew) continue;

        const isFixMixed = args.includes('--fix-mixed');
        const needsFix = isFixMixed && targetEngine === 'gemini' && manifest[key] && (!manifest[key].model || manifest[key].model !== lessonModel);

        if (!isForce && !needsFix && fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
          alreadyExistingCount++;
          if (!manifest[key] || manifest[key].engine !== targetEngine) {
            manifest[key] = {
              lessonId,
              turnId: turn.id,
              combo,
              speakerGender,
              voice,
              engine: targetEngine,
              model: manifest[key]?.model || (targetEngine === 'gemini' ? lessonModel : 'edge'),
              fileName,
              hebrew: variant.hebrew,
              translation: variant.translation,
            };
            manifestModified = true;
          }
          continue;
        }

        queue.push({
          key,
          fileName,
          destPath,
          lessonId,
          turn,
          combo,
          speakerGender,
          voice,
          variant,
          lessonModel
        });
      }
    }
  }

  if (manifestModified) {
    saveManifest(manifest);
  }

  console.log('📊 РЕЗУЛЬТАТЫ PRE-FLIGHT АУДИТА ДИАЛОГОВ:');
  console.log(`   ⏭️ Уже готовы на диске: ${alreadyExistingCount} реплик`);
  console.log(`   🎯 РЕАЛЬНО ТРЕБУЕТСЯ СИНТЕЗИРОВАТЬ: ${queue.length} реплик\n`);

  if (queue.length === 0) {
    console.log('🎉 ВСЕ ДИАЛОГИ В ЗАПРОШЕННОМ ДИАПАЗОНЕ УЖЕ ГОТОВЫ! 0 ЗАПРОСОВ К API.');
    console.log('Ни одного байта квоты не потрачено.');
    return;
  }

  if (isDryRun) {
    console.log(`[DRY-RUN] Список реплик к озвучке (${queue.length}):`);
    queue.slice(0, 20).forEach((q, idx) => console.log(`  ${idx + 1}. [${q.key}] (${q.speakerGender}, ${q.voice}, ${q.lessonModel}): "${q.variant.hebrew.substring(0, 30)}..."`));
    if (queue.length > 20) console.log(`  ... и ещё ${queue.length - 20} реплик.`);
    return;
  }

  let generatedCount = 0;
  let skippedCount = alreadyExistingCount;
  let errorCount = 0;

  const activeLessonModels = new Map();

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const { key, fileName, destPath, lessonId, turn, combo, speakerGender, voice, variant } = item;
    
    // R-28: Однородность модели внутри одного урока
    let currentLessonModel = targetModel;
    if (!currentLessonModel && targetEngine === 'gemini' && carousel) {
      if (activeLessonModels.has(lessonId)) {
        currentLessonModel = activeLessonModels.get(lessonId);
      } else {
        const existingTurn = Object.values(manifest).find(m => m.lessonId === lessonId && m.engine === 'gemini' && m.model);
        currentLessonModel = existingTurn ? existingTurn.model : carousel.getBestAvailableModel();
        activeLessonModels.set(lessonId, currentLessonModel);
        console.log(`\n🎭 [Урок ${lessonId}] Выбрана единая модель для всех реплик урока: ${currentLessonModel}`);
      }
    }
    if (!currentLessonModel && targetEngine === 'gemini') {
      currentLessonModel = 'gemini-3.8-flash-tts';
    }

    const voiceLabel = targetEngine === 'gemini' ? voice : voice.split('-')[2];
    process.stdout.write(`  [${i + 1}/${queue.length}] [${key}] (${speakerGender}, ${voiceLabel}, ${currentLessonModel || 'edge'}): ${variant.hebrew.substring(0, 30)}... `);

    let res;
    if (targetEngine === 'gemini') {
      res = await synthesizeTurnGemini(variant.hebrew, voice, destPath, carousel, currentLessonModel);
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
            model: res.model || (targetEngine === 'gemini' ? currentLessonModel : 'edge'),
            fileName,
            bytes: res.bytes,
            hebrew: variant.hebrew,
            translation: variant.translation,
          };
          const keyLabel = res.keyIndex ? ` (ключ #${res.keyIndex} [${res.keyName}])` : '';
          console.log(`OK (${res.bytes} байт, ${res.model || currentLessonModel || 'edge'}${keyLabel})`);

          if (generatedCount % 5 === 0) {
            saveManifest(manifest);
          }
        } else {
          errorCount++;
          console.log(`ERROR (${res.error})`);
        }

        // Пауза между запросами: для Gemini 2000мс обеспечивает соблюдение 15 RPM
        await new Promise(r => setTimeout(r, targetEngine === 'gemini' ? 2000 : 60));
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
