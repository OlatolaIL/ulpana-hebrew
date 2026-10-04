import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const OUT_DIR = path.resolve(ROOT, 'public/audio/moms');

if (fs.existsSync(path.resolve(ROOT, '.env.local'))) {
  process.loadEnvFile(path.resolve(ROOT, '.env.local'));
}

const keys = [
  process.env.GEMINI_SECONDARY_API_KEY,
  process.env.GEMINI_TTS_KEY_2,
  process.env.GEMINI_TTS_API_KEY,
  process.env.GEMINI_PRIMARY_API_KEY,
].filter(Boolean);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const phrases = [
  { id: 'kg_phrase_1', text: 'בּוֹקֶר טוֹב, דָּנִיאֵל לֹא מַרְגִּישׁ טוֹב הַבֹּקֶר וְנִשְׁאָר בַּבַּיִת.' },
  { id: 'kg_phrase_2', text: 'שָׁלוֹם, יֵשׁ לוֹ חוֹם מֵהַלַּיְלָה. אֲנַחְנוּ הוֹלְכִים לָרוֹפֵא.' },
  { id: 'kg_phrase_3', text: 'הַיּוֹם אֶקַּח אוֹתוֹ מֻקְדָּם, בִּסְבִיבוֹת אַחַת וָחֵצִי, לִפְנֵי הַצַּהֲרוֹן.' },
  { id: 'kg_phrase_4', text: 'הוּא שָׁכַח אֶת הַכּוֹבַע שֶׁלּוֹ בְּאַרְגַּז הַחוֹל, אֶפְשָׁר לִבְדּוֹק בְּבַקָּשָׁה?' }
];

const models = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-3.1-flash-tts-preview',
  'gemini-3.8-flash-tts'
];

async function callGeminiTts(text, voiceName) {
  for (const m of models) {
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`;
      const promptText = m.includes('2.5')
        ? `Read the following Hebrew transcript aloud: ${text}`
        : text;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
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

        const data = await res.json();
        const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) {
          console.log(`    ✨ Успех через модель ${m} (ключ ${i + 1})`);
          return Buffer.from(b64, 'base64');
        }
        console.warn(`    ⚠️ ${m} (ключ ${i + 1}, status ${res.status}): ${data.error?.message?.slice(0, 100) || JSON.stringify(data).slice(0, 100)}`);
      } catch (e) {
        console.warn(`    ⚠️ Сетевая ошибка ${m} (ключ ${i + 1}): ${e.message}`);
      }
    }
  }
  throw new Error('Все модели и ключи Gemini исчерпали квоту');
}

function processAudioBuffer(rawBuf, outMp3) {
  const isRiff = rawBuf.subarray(0, 4).toString('ascii') === 'RIFF';
  const tmpIn = outMp3 + (isRiff ? '.in.wav' : '.in.pcm');
  fs.writeFileSync(tmpIn, rawBuf);

  const inputArgs = isRiff
    ? ['-i', `"${tmpIn}"`]
    : ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `"${tmpIn}"`];

  // Нормализация, Anti-Click (fade-in 50ms, fade-out 80ms в хвосте), 44.1kHz стерео
  const filter = 'afade=t=in:st=0:d=0.05,areverse,afade=t=in:st=0:d=0.08,areverse';
  cp.execSync(`"${FFMPEG_PATH}" -y ${inputArgs.join(' ')} -af "${filter}" -ar 44100 -ac 2 -b:a 192k "${outMp3}"`, { stdio: 'ignore' });
  try { fs.unlinkSync(tmpIn); } catch {}
}

async function main() {
  console.log('🎙️ Синтез 4 фраз через Gemini TTS (gemini-3.8-flash-tts, голос Aoede)...');
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    const dest = path.resolve(OUT_DIR, `${p.id}.mp3`);
    console.log(`  [${i + 1}/4] Синтезируем ${p.id}: "${p.text}"`);
    const audioBuf = await callGeminiTts(p.text, 'Aoede');
    processAudioBuffer(audioBuf, dest);
    const size = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(`    ✅ Готово: ${dest} (${size} KB, стерео 44.1kHz)`);
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('🎉 Все 4 фразы Gemini TTS успешно сгенерированы!');
}

main().catch(err => {
  console.error('❌ Фатальная ошибка:', err.message);
  process.exit(1);
});
