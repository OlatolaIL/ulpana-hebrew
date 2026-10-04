import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const BANK_DIR = path.resolve(DEMO_DIR, 'audio_bank');
const CATALOG_PATH = path.resolve(ROOT, 'growth/MASTER_TTS_CATALOG.json');
const envPath = path.resolve(ROOT, '.env.local');

if (!fs.existsSync(BANK_DIR)) fs.mkdirSync(BANK_DIR, { recursive: true });

// 1. Сбор ключей Gemini
const geminiKeys = [];
let gcloudKey = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('GEMINI_') && trimmed.includes('=')) {
      const v = trimmed.slice(trimmed.indexOf('=') + 1).replace(/^['"]|['"]$/g, '').trim();
      if (v && !geminiKeys.includes(v)) geminiKeys.push(v);
    }
    if (trimmed.startsWith('GOOGLE_TTS_API_KEY=') || trimmed.startsWith('GCLOUD_TTS_KEY=')) {
      gcloudKey = trimmed.slice(trimmed.indexOf('=') + 1).replace(/^['"]|['"]$/g, '').trim();
    }
  }
}

const GEMINI_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview',
];

async function synthesizeGemini(text, voiceName, outMp3) {
  for (const key of geminiKeys) {
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const payload = {
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          continue;
        }

        const data = await res.json();
        const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!b64) continue;

        const raw = Buffer.from(b64, 'base64');
        const isRiff = raw.subarray(0, 4).toString('ascii') === 'RIFF';
        const tempIn = outMp3 + (isRiff ? '.in.wav' : '.in.pcm');
        fs.writeFileSync(tempIn, raw);

        const inputArgs = isRiff
          ? ['-i', tempIn]
          : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempIn];

        cp.spawnSync(ffmpeg, [
          '-y',
          ...inputArgs,
          '-ar', '44100',
          '-ac', '2',
          '-b:a', '192k',
          outMp3,
        ]);

        if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
        return true;
      } catch (err) {
        // Пробуем следующий ключ / модель
      }
    }
  }

  // Фолбэк на Google Cloud TTS если есть ключ
  if (gcloudKey) {
    try {
      const gUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcloudKey}`;
      const gPayload = {
        input: { text },
        voice: {
          languageCode: voiceName === 'Charon' ? 'ru-RU' : 'he-IL',
          name: voiceName === 'Charon' ? 'ru-RU-Neural2-D' : voiceName === 'Aoede' ? 'he-IL-Wavenet-A' : 'he-IL-Wavenet-B',
        },
        audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 44100 },
      };
      const gRes = await fetch(gUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gPayload),
      });
      if (gRes.ok) {
        const gJson = await gRes.json();
        if (gJson.audioContent) {
          fs.writeFileSync(outMp3, Buffer.from(gJson.audioContent, 'base64'));
          return true;
        }
      }
    } catch (_) {}
  }

  return false;
}

async function batchSynthesize() {
  const args = process.argv.slice(2);
  const fromArg = args.find(a => a.startsWith('--from='));
  const toArg = args.find(a => a.startsWith('--to='));
  const fromLesson = fromArg ? parseInt(fromArg.split('=')[1], 10) : 11;
  const toLesson = toArg ? parseInt(toArg.split('=')[1], 10) : 20;

  console.log(`\n======================================================`);
  console.log(`🎙️ ПАКЕТНЫЙ СИНТЕЗ АУДИО УРОКОВ ${fromLesson}–${toLesson} (GEMINI TTS)`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`Каталог не найден: ${CATALOG_PATH}`);
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

  for (let l = fromLesson; l <= toLesson; l++) {
    const pad = String(l).padStart(2, '0');
    console.log(`\n🔹 Урок ${l}...`);

    // Синтезируем только clean реплики для конвейера
    const cues = catalog.filter(c => c.id && c.id.startsWith(`l${pad}_clean`));
    for (const cue of cues) {
      const outMp3 = path.join(BANK_DIR, `${cue.id}.mp3`);
      if (fs.existsSync(outMp3) && fs.statSync(outMp3).size > 2000) {
        console.log(`   ⏭️ [${cue.id}] уже существует, пропускаем (R-27)`);
        continue;
      }

        console.log(`   ⏳ Синтез [${cue.id}] (${cue.geminiVoice || 'Charon'}): "${cue.text.slice(0, 45)}..."`);
        const ok = await synthesizeGemini(cue.text, cue.geminiVoice || 'Charon', outMp3);
        if (ok) {
          console.log(`   ✅ [${cue.id}] сохранен (${(fs.statSync(outMp3).size / 1024).toFixed(1)} KB)`);
        } else {
          console.error(`   ⚠️ [${cue.id}] 429 Rate limit, ждём 15 секунд...`);
          await new Promise(r => setTimeout(r, 15000));
          const retryOk = await synthesizeGemini(cue.text, cue.geminiVoice || 'Charon', outMp3);
          if (retryOk) {
            console.log(`   ✅ [${cue.id}] сохранен после ожидания!`);
          } else {
            console.error(`   ❌ [${cue.id}] пропуск.`);
          }
        }
        // Вежливая пауза между запросами для соблюдения RPM
        await new Promise(r => setTimeout(r, 3500));
      }
    }

  console.log(`\n======================================================`);
  console.log(`🎉 ПАКЕТНЫЙ СИНТЕЗ УРОКОВ ${fromLesson}–${toLesson} ЗАВЕРШЁН!`);
  console.log(`======================================================\n`);
}

batchSynthesize().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
