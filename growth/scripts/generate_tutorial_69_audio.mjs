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
  if (!keys.length) return false;

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

      if (res.status === 429 || data.error?.code === 429 || data.error?.message?.includes('quota')) {
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
    } catch (_) {}
  }
  return false;
}

async function generateWithGoogleTtsFallback(text, lang, wavPath, speed = 1.0, pitchFactor = 1.0) {
  const mp3Name = path.basename(wavPath, '.wav') + '_google.mp3';
  console.log(`  🔄 Google TTS fallback для "${text.slice(0, 30)}..." [lang: ${lang}]`);
  const mp3Path = await fetchTts(text, lang, mp3Name);

  const args = ['-y', '-i', mp3Path];
  const filters = [];
  if (pitchFactor !== 1.0) {
    const sampleRate = 44100;
    const newRate = Math.round(sampleRate * pitchFactor);
    const tempoCorrection = (1 / pitchFactor).toFixed(4);
    // КРИТИЧЕСКИ ВАЖНО (R-25): Сначала aresample к 44100, иначе asetrate разгоняет 24000 Гц в 1.93 раза!
    filters.push(`aresample=${sampleRate}`, `asetrate=${newRate}`, `atempo=${tempoCorrection}`, `aresample=${sampleRate}`);
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
  const filename = forceWavName || `tut69_${id}.wav`;
  const wavPath = path.join(CACHE_DIR, filename);

  if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 2000) {
    console.log(`✅ [КЭШ] ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
    return wavPath;
  }

  console.log(`🎙️ Синтез "${id}": "${text.slice(0, 45)}..."`);

  let success = false;
  try {
    success = await tryGeminiTts(text, geminiVoice, wavPath);
    if (success && speed !== 1.0) {
      const tempSpeed = wavPath + '.speed.wav';
      cp.spawnSync(FFMPEG_PATH, ['-y', '-i', wavPath, '-filter:a', `atempo=${speed}`, tempSpeed]);
      if (fs.existsSync(tempSpeed)) fs.renameSync(tempSpeed, wavPath);
    }
  } catch (_) {
    success = false;
  }

  if (!success) {
    await generateWithGoogleTtsFallback(text, lang, wavPath, speed, pitchFactor);
  }

  const stat = fs.statSync(wavPath);
  console.log(`  ✅ Готово: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return wavPath;
}

export const TUTORIAL_69_CUES = [
  {
    id: '01_vocab_intro',
    text: 'В кафе или баре вы часто слышите: "Зэ алай!". Это значит "Я угощаю!". В Уроке 69 учим слитные предлоги: алáй — за меня, алéйха — за тебя, алéйну — за нас.',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.22,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: '02_dialogue_friend',
    text: 'אֲנִי מְשַׁלֵּם עַל הַקָּפֶה, זֶה עָלַי!',
    lang: 'iw',
    geminiVoice: 'Orus',
    speed: 1.0,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: '03_dialogue_prompt',
    text: 'Отвечаем голосом. Как правильно сказать: "В следующий раз за мной"?',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.20,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: '04_dialogue_student',
    text: 'תּוֹדָה רַבָּה! אֲבָל בַּפַּעַם הַבָּאָה עָלַי!',
    lang: 'iw',
    geminiVoice: 'Aoede',
    speed: 0.95,
    pitchFactor: 1.05,
    gapAfterSec: 0.25,
  },
  {
    id: '05_dialogue_eval',
    text: 'ИИ мгновенно проверяет речь: точность 98 процентов, вас поняли идеально.',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.22,
    pitchFactor: 1.0,
    gapAfterSec: 0.3,
  },
  {
    id: '06_phone_nadav_call',
    text: 'שָׁלוֹם! כְּבָר שִׁלַּמְתִּי עַל הָאֲרוּחָה. זֶה עָלַי!',
    lang: 'iw',
    geminiVoice: 'Orus',
    speed: 1.05,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: '07_phone_narrator_intro',
    text: 'А теперь звонок из жизни: друг оплатил общий счёт. Договариваемся на следующую встречу:',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.22,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: '08_phone_student_reply',
    text: 'אֲבָל גַּם בַּפַּעַם שֶׁעָבְרָה שִׁלַּמְתָּ! בַּפַּעַם הַבָּאָה אֲנִי מַזְמִין!',
    lang: 'iw',
    geminiVoice: 'Aoede',
    speed: 0.95,
    pitchFactor: 1.05,
    gapAfterSec: 0.25,
  },
  {
    id: '09_phone_nadav_ack',
    text: 'בְּסֵדֶר גָּמוּר, סִגַּרְנוּ!',
    lang: 'iw',
    geminiVoice: 'Orus',
    speed: 1.05,
    pitchFactor: 1.0,
    gapAfterSec: 0.3,
  },
  {
    id: '10_outro',
    text: 'Тренируйте живую речь и звонки в Ульпан Алеф. 30 дней бесплатного доступа по ссылке в описании! Промокод: АЛЕФ69.',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.25,
    pitchFactor: 1.0,
    gapAfterSec: 0.35,
  },
];

async function main() {
  console.log('🚀 Синтез аудиоклипов для учебного видео Урока 69...');
  for (const cue of TUTORIAL_69_CUES) {
    await synthesizeCue(cue);
  }
  console.log('\n🎉 Все аудиоклипы учебного видео успешно сгенерированы!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Ошибка синтеза аудио:', err);
    process.exit(1);
  });
}
