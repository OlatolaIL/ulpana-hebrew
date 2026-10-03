import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const ROOT = path.resolve('.');
const envPath = path.resolve('.env.local');

// 1. Gather Gemini API Keys
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

console.log(`Loaded ${geminiKeys.length} Gemini keys.`);

const GEMINI_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview',
];

async function synthesizeGemini(text, voiceName, outWav, lang = 'he') {
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
          const err = await res.text();
          console.warn(`  ⚠️ [${model} / ${voiceName}] status ${res.status}: ${err.slice(0, 150)}`);
          continue;
        }

        const data = await res.json();
        const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!b64) continue;

        const raw = Buffer.from(b64, 'base64');
        const isRiff = raw.subarray(0, 4).toString('ascii') === 'RIFF';
        const tempIn = outWav + (isRiff ? '.in.wav' : '.in.pcm');
        fs.writeFileSync(tempIn, raw);

        const inputArgs = isRiff
          ? ['-i', tempIn]
          : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempIn];

        cp.spawnSync(ffmpeg, [
          '-y',
          ...inputArgs,
          '-ar', '44100',
          '-ac', '2',
          outWav,
        ]);
        try { fs.unlinkSync(tempIn); } catch (_) {}

        if (fs.existsSync(outWav) && fs.statSync(outWav).size > 1000) {
          console.log(`✅ Synthesized [${voiceName}] (${text.slice(0, 30)}...) -> ${path.basename(outWav)}`);
          return true;
        }
      } catch (e) {
        // continue
      }
    }
  }
  throw new Error(`Failed to synthesize with voice ${voiceName}: all Gemini slots exhausted`);
}

async function run() {
  const outDir = path.resolve('public/demo/audio_bank/l10_multivoice');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Narrator Hook (Charon, Russian)
  await synthesizeGemini(
    "Пытаешься объяснить нервному таксисту, куда повернуть...",
    "Charon",
    path.join(outDir, "01_hook_narrator.wav"),
    "ru"
  );

  // 2. Passenger (Puck, Hebrew - young learner)
  await synthesizeGemini(
    "תִּסַּע יָשָׁן! עוֹד יוֹתֵר יָשָׁן!",
    "Puck",
    path.join(outDir, "02_passenger_puck.wav"),
    "he"
  );

  // 3. Driver (Fenrir, Hebrew - angry energetic Israeli driver)
  await synthesizeGemini(
    "מִי יָשָׁן, יָא חַבּוּבּ?! אֲנִי נַהָג כְּבָר עֶשְׂרִים שָׁנָה, אַתָּה קוֹרֵא לִי זָקֵן?! רֵד מֵהַמּוֹנִית!",
    "Fenrir",
    path.join(outDir, "03_driver_fenrir.wav"),
    "he"
  );

  // 4. Narrator Explanation (Charon, Russian)
  await synthesizeGemini(
    "Прямо — это יָשָׁר (яша́р) с буквой Реш на конце! А со словом יָשָׁן (яша́н) ты пойдёшь пешком по трассе Аялон.",
    "Charon",
    path.join(outDir, "04_explain_narrator.wav"),
    "ru"
  );

  // 5. Narrator CTA (Charon, Russian)
  await synthesizeGemini(
    "Урок десять в Ульпан Алеф. Добирайся в любую точку Израиля на чистом иврите. Промокод: YT.",
    "Charon",
    path.join(outDir, "05_cta_narrator.wav"),
    "ru"
  );

  console.log("🎉 All 5 multi-voice cues synthesized successfully!");
}

run().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
