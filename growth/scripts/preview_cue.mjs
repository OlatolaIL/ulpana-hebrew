/**
 * preview_cue.mjs — синтезирует одну реплику и открывает WAV для прослушивания.
 *
 * Использование:
 *   node growth/scripts/preview_cue.mjs clean cue_05_cta
 *   node growth/scripts/preview_cue.mjs spicy cue_03_girl
 *   node growth/scripts/preview_cue.mjs spicy cue_05_cta
 *
 * Флаг --force: пересинтезировать даже если есть кэш
 *   node growth/scripts/preview_cue.mjs clean cue_05_cta --force
 */
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { CUES_LESSON_01_CLEAN, CUES_LESSON_01_SPICY } from './generate_lesson_01_audio.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');

const [,, variant, cueId, flag] = process.argv;
const force = flag === '--force';

if (!variant || !cueId) {
  console.error('Использование: node growth/scripts/preview_cue.mjs <clean|spicy> <cue_id> [--force]');
  process.exit(1);
}

const cues = variant === 'clean' ? CUES_LESSON_01_CLEAN : CUES_LESSON_01_SPICY;
const cue = cues.find(c => c.id === cueId);

if (!cue) {
  console.error(`❌ Реплика "${cueId}" не найдена в варианте "${variant}"`);
  console.log('Доступные:', cues.map(c => c.id).join(', '));
  process.exit(1);
}

const filename = `l01_${variant}_${cue.id}.wav`;
const wavPath = path.join(CACHE_DIR, filename);

if (force && fs.existsSync(wavPath)) {
  fs.unlinkSync(wavPath);
  console.log(`🗑️ Кэш удалён: ${filename}`);
}

// Динамический импорт synthesizeCue через прямой вызов функций из generate_lesson_01_audio.mjs
// (synthesizeCue не экспортируется, поэтому используем прямой вызов через временный скрипт)

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Используем те же функции через re-import
const generateModule = await import('./generate_lesson_01_audio.mjs');

// Синтез через временный запуск generate с одной репликой
// (synthesizeCue доступна внутри модуля — вызываем через обёртку generateSingleCue)
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

async function getGeminiApiKeys() {
  const keys = [];
  if (process.env.GEMINI_PRIMARY_API_KEY) keys.push(process.env.GEMINI_PRIMARY_API_KEY);
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  const envPath = path.resolve(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m1 = content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    const m2 = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (m1 && !keys.includes(m1[1].trim())) keys.push(m1[1].trim());
    if (m2 && !keys.includes(m2[1].trim())) keys.push(m2[1].trim());
  }
  return keys;
}

async function tryGeminiTts(text, voiceName, outPath, speed = 1.0) {
  const keys = await getGeminiApiKeys();
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
      }
    };
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        const pcmBuffer = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
        const tempPcm = outPath + '.temp.pcm';
        fs.writeFileSync(tempPcm, pcmBuffer);
        const ffmpegArgs = ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempPcm];
        if (speed !== 1.0) ffmpegArgs.push('-filter:a', `atempo=${speed}`);
        ffmpegArgs.push('-ar', '44100', '-ac', '2', outPath);
        cp.spawnSync(ffmpeg, ffmpegArgs);
        if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) return true;
      }
      console.warn(`  ⚠️ Gemini TTS ответ:`, data.error?.message || 'нет аудио');
    } catch (err) {
      console.warn(`  ⚠️ Ошибка Gemini TTS:`, err.message);
    }
  }
  return false;
}

async function tryEdgeTts(text, voiceName, outPath, options = {}) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  const tempMp3 = outPath + '.temp.mp3';
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const ttsOptions = {};
    if (options.rate) ttsOptions.rate = options.rate;
    if (options.pitch) ttsOptions.pitch = options.pitch;
    const { audioStream } = tts.toStream(text, ttsOptions);
    const writeStream = fs.createWriteStream(tempMp3);
    await new Promise((resolve, reject) => {
      audioStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });
    await new Promise(r => setTimeout(r, 100));
    try { tts.close(); } catch (_) {}
    const res = cp.spawnSync(ffmpeg, ['-y', '-i', tempMp3, '-ar', '44100', '-ac', '2', outPath]);
    if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
    return res.status === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 1000;
  } catch (err) {
    if (fs.existsSync(tempMp3)) try { fs.unlinkSync(tempMp3); } catch (_) {}
    console.warn(`  ⚠️ Edge TTS ошибка:`, err.message);
    return false;
  }
}

// Синтез
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const alreadyExists = fs.existsSync(wavPath) && fs.statSync(wavPath).size > 50000;
if (alreadyExists) {
  console.log(`⚡ [КЭШ] ${filename} — используем существующий`);
  console.log(`   Чтобы пересинтезировать: добавь --force`);
} else {
  console.log(`\n🎙️ Синтез [${variant}] "${cue.id}"`);
  console.log(`   Текст: "${cue.text}"`);
  console.log(`   Движок: ${cue.engine === 'gemini' ? `Gemini TTS (${cue.voice})` : `Edge TTS (${cue.voice})`}\n`);

  let ok = false;
  if (cue.engine === 'gemini') {
    ok = await tryGeminiTts(cue.text, cue.voice || 'Charon', wavPath, cue.speed || 1.0);
  } else {
    ok = await tryEdgeTts(cue.text, cue.voice, wavPath, cue.options || {});
    if (!ok && cue.geminiFallback) {
      console.log(`  🔄 Фолбэк на Gemini TTS (${cue.geminiFallback})...`);
      ok = await tryGeminiTts(cue.text, cue.geminiFallback, wavPath, cue.speed || 1.0);
    }
  }

  if (!ok) {
    console.error(`❌ Не удалось синтезировать "${cue.id}"`);
    process.exit(1);
  }
  console.log(`✅ Готово: ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
}

// Открыть для прослушивания
console.log(`\n🔊 Открываю для прослушивания: ${wavPath}`);
cp.spawn('cmd', ['/c', 'start', '', wavPath], { detached: true, stdio: 'ignore' }).unref();
console.log(`\n   Файл: ${wavPath}`);
