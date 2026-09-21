import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { fetchTts } from '../../scripts/tts_helper.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getGeminiApiKeys() {
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

async function tryGeminiTts(text, voiceName, wavPath) {
  const keys = getGeminiApiKeys();
  if (!keys.length) {
    throw new Error('No Gemini API keys found');
  }

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
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

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.status === 429 || data.error?.code === 429) {
        console.warn(`⏳ [Gemini TTS 429] Rate limit на ключе ${i + 1}. Пробуем следующий...`);
        continue;
      }
      if (data.error?.message?.includes('depleted') || data.error?.message?.includes('quota')) {
        console.warn(`⚠️ [Gemini TTS] Квота исчерпана на ключе ${i + 1}.`);
        continue;
      }

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
        const pcmBuffer = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
        const tempPcm = wavPath + '.pcm';
        fs.writeFileSync(tempPcm, pcmBuffer);
        cp.spawnSync(FFMPEG_PATH, [
          '-y',
          '-f', 's16le',
          '-ar', '24000',
          '-ac', '1',
          '-i', tempPcm,
          '-ar', '44100',
          '-ac', '2',
          wavPath
        ]);
        if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
        return true;
      }
      console.warn(`Gemini TTS API error on key ${i + 1}:`, data.error?.message || 'unknown');
    } catch (err) {
      console.warn(`Gemini TTS network error on key ${i + 1}:`, err.message);
    }
  }

  return false;
}

async function generateWithGoogleTtsFallback(text, lang, wavPath, speed = 1.0, pitchFactor = 1.0) {
  const mp3Name = path.basename(wavPath, '.wav') + '_google.mp3';
  console.log(`🔄 Переход на резервный Google TTS для "${text.slice(0, 30)}..." [lang: ${lang}]`);
  const mp3Path = await fetchTts(text, lang, mp3Name);

  const args = ['-y', '-i', mp3Path];
  const filters = [];
  if (pitchFactor !== 1.0) {
    const sampleRate = 44100;
    const newRate = Math.round(sampleRate * pitchFactor);
    const tempoCorrection = (1 / pitchFactor).toFixed(4);
    filters.push(`asetrate=${newRate}`, `aresample=${sampleRate}`, `atempo=${tempoCorrection}`);
  }
  if (speed !== 1.0) {
    filters.push(`atempo=${speed}`);
  }
  if (filters.length > 0) {
    args.push('-filter:a', filters.join(','));
  }
  args.push('-ar', '44100', '-ac', '2', wavPath);

  const res = cp.spawnSync(FFMPEG_PATH, args);
  if (res.status !== 0) {
    throw new Error(`FFmpeg error converting Google TTS mp3 to wav: ${res.stderr.toString()}`);
  }
  return wavPath;
}

export async function synthesizeCue({ id, text, lang, geminiVoice, speed = 1.0, pitchFactor = 1.0, forceWavName }) {
  const filename = forceWavName || `rent_${id}.wav`;
  const wavPath = path.join(CACHE_DIR, filename);

  if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 2000) {
    console.log(`✅ [КЭШ] ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
    return wavPath;
  }

  console.log(`\n🎙️ Синтез "${id}": "${text.slice(0, 45)}..."`);

  // Шаг 1: Пробуем Gemini TTS
  let success = false;
  try {
    console.log(`  -> Попытка через Gemini TTS (голос: ${geminiVoice})...`);
    success = await tryGeminiTts(text, geminiVoice, wavPath);
    if (success && speed !== 1.0) {
      // Применяем темпо-контроль при необходимости
      const tempSpeed = wavPath + '.speed.wav';
      cp.spawnSync(FFMPEG_PATH, ['-y', '-i', wavPath, '-filter:a', `atempo=${speed}`, tempSpeed]);
      if (fs.existsSync(tempSpeed)) {
        fs.renameSync(tempSpeed, wavPath);
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ Ошибка Gemini TTS: ${err.message}`);
    success = false;
  }

  // Шаг 2: Резервный Google TTS при сбое Gemini
  if (!success) {
    await generateWithGoogleTtsFallback(text, lang, wavPath, speed, pitchFactor);
  }

  const stat = fs.statSync(wavPath);
  console.log(`  ✅ Готово: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return wavPath;
}

export const CUES_CONFIG = [
  {
    id: 'cue_01_hook',
    text: 'Главный страх при съёме квартиры в Израиле...',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.22,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_02_student',
    text: 'שָׁלוֹם... בָּאתִי לַחְתּוֹם... עַל הַחָזֶה!',
    lang: 'iw',
    geminiVoice: 'Puck',
    speed: 0.78, // Медленная, раздельная речь ученика-репатрианта (темпо-контраст)
    pitchFactor: 1.02,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_03_landlady',
    text: 'עַל מָה?!',
    lang: 'iw',
    geminiVoice: 'Aoede',
    speed: 1.0,
    pitchFactor: 1.15,
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_04_explainer',
    text: 'Одной буквой ошибся — и вместо договора подписал грудь хозяйки! Хо-зэ́ — это контракт, а ха-зэ́ — грудь!',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.15,
    pitchFactor: 1.0,
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_05_outro',
    text: 'Не красней в Израиле. Учи иврит с интерактивным разбором и точным звуком в Ульпан Алеф. Ссылка в описании!',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.22,
    pitchFactor: 1.0,
    gapAfterSec: 0.5,
  },
];

async function main() {
  console.log('🚀 Генерация всех аудиоклипов для вирального ролика «חוֹזֶה vs חָזֶה»...');
  for (const cue of CUES_CONFIG) {
    await synthesizeCue(cue);
  }
  console.log('\n🎉 Все аудиоклипы успешно сгенерированы и сохранены в public/demo/audio_cache!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Фатальная ошибка генерации аудио:', err);
    process.exit(1);
  });
}
