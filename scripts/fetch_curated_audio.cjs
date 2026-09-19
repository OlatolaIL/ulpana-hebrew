/**
 * scripts/fetch_curated_audio.cjs
 *
 * Генератор и синхронизатор постоянного реестра Curated Audio (R-24)
 * для сленговых слов и предложений с нерегулярным ударением.
 *
 * Гарантирует:
 * - Монолитные качественные MP3-файлы без склеек слогов.
 * - Чистую дикторскую дикцию с эталонным израильским ударением (милель для сленга).
 * - Локальное кэширование в public/audio/words/ и public/audio/sentences/.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const WORDS_DIR = path.resolve(__dirname, '../public/audio/words');
const SENTENCES_DIR = path.resolve(__dirname, '../public/audio/sentences');

if (!fs.existsSync(WORDS_DIR)) fs.mkdirSync(WORDS_DIR, { recursive: true });
if (!fs.existsSync(SENTENCES_DIR)) fs.mkdirSync(SENTENCES_DIR, { recursive: true });

const CURATED_WORDS = [
  { id: 'sababa', text: 'סַבָּבָה', file: 'sababa.mp3' },
  { id: 'tachles', text: 'תַּכְלֶס', file: 'tachles.mp3' },
  { id: 'fraier', text: 'פְרָאיֶיר', file: 'fraier.mp3' },
  { id: 'sahbak', text: 'סַחְבָּק', file: 'sahbak.mp3' },
  { id: 'pancher', text: "פַּנְצֶ'ר", file: 'pancher.mp3' },
  { id: 'tzimer', text: 'צִימֶר', file: 'tzimer.mp3' },
  { id: 'tabu', text: 'טַאבּוּ', file: 'tabu.mp3' },
  { id: 'syllabus', text: 'סִילָבּוּס', file: 'syllabus.mp3' },
  { id: 'zahal', text: 'צַהַ"ל', file: 'zahal.mp3' },
  { id: 'baasa', text: 'בָּאסָה', file: 'baasa.mp3' },
  { id: 'yalla', text: 'יַאלְלָה', file: 'yalla.mp3' },
];

const CURATED_SENTENCES = [
  { id: 'hakol_sababa', text: 'הַכֹּל סַבָּבָה, תּוֹדָה רַבָּה!', file: 'hakol_sababa.mp3' },
  { id: 'tachles_tsodek', text: 'תַּכְלֶס, אַתָּה מַמָּשׁ צוֹדֵק.', file: 'tachles_tsodek.mp3' },
  { id: 'lo_fraier', text: 'אַף אֶחָד לֹא פְרָאיֶיר.', file: 'lo_fraier.mp3' },
  { id: 'sahbak_amiti', text: 'הוּא סַחְבָּק אֲמִתִּי שֶׁלָּנוּ.', file: 'sahbak_amiti.mp3' },
  { id: 'pancher_baoto', text: "יֵשׁ לִי פַּנְצֶ'ר בָּאוֹטוֹ.", file: 'pancher_baoto.mp3' },
  { id: 'tzimer_tzafon', text: 'שָׂכַרְנוּ צִימֶר יָפֶה בַּצָּפוֹן.', file: 'tzimer_tzafon.mp3' },
  { id: 'tabu_dira', text: 'הַדִּירָה כְּבָר רְשׁוּמָה בַּטַּאבּוּ.', file: 'tabu_dira.mp3' },
  { id: 'syllabus_mevorat', text: 'הַסִּילָבּוּס מְפוֹרָט מְאֹד הַשָּׁנָה.', file: 'syllabus_mevorat.mp3' },
  { id: 'zahal_megen', text: 'צַהַ"ל מֵגֵן עַל הַמְּדִינָה.', file: 'zahal_megen.mp3' },
];

function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GEMINI_PRIMARY_API_KEY) return process.env.GEMINI_PRIMARY_API_KEY;
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m = content.match(/GEMINI_API_KEY=([^\r\n]+)/) || content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    if (m) return m[1].trim();
  }
  return '';
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithGeminiTts(text, destPath, apiKey, voiceName = 'Aoede', maxRetries = 5) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent';
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

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.status === 429 || data.error?.code === 429) {
      const waitSeconds = 65; // Wait for the full 60s Free Tier sliding window to reset
      console.log(`⏳ [Free Tier Rate Limit] Лимит 3 RPM. Сброс окна: ожидание ${waitSeconds} сек. перед повторной попыткой (${attempt}/${maxRetries})...`);
      await sleep(waitSeconds * 1000);
      continue;
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const pcmBuffer = Buffer.from(part.inlineData.data, 'base64');
          const tempPcm = destPath + '.pcm';
          fs.writeFileSync(tempPcm, pcmBuffer);
          spawnSync(ffmpegPath, ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', tempPcm, destPath]);
          if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
          return fs.statSync(destPath).size;
        }
      }
    }

    throw new Error('Gemini TTS generation error: ' + JSON.stringify(data));
  }
  throw new Error(`Gemini TTS failed after ${maxRetries} retries due to rate limits`);
}

function downloadAudioFallback(text, destPath) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=iw&q=${encodeURIComponent(text)}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`TTS download failed (${res.statusCode}) for: ${text}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 1500) {
          return reject(new Error(`Corrupt or too small audio stream (${buf.length} bytes) for: ${text}`));
        }
        fs.writeFileSync(destPath, buf);
        resolve(buf.length);
      });
    }).on('error', reject);
  });
}

async function fetchOrGenerateAudio(text, destPath, options = {}) {
  const { apiKey, force = false } = options;
  if (!force && fs.existsSync(destPath) && fs.statSync(destPath).size > 1500) {
    return { bytes: fs.statSync(destPath).size, source: 'cached' };
  }

  if (apiKey) {
    const bytes = await generateWithGeminiTts(text, destPath, apiKey);
    await sleep(25000); // 25s pacing ensures <= 2.4 RPM, strictly under the 3 RPM limit
    return { bytes, source: 'gemini-3.1-flash-tts' };
  }

  const bytes = await downloadAudioFallback(text, destPath);
  return { bytes, source: 'fallback' };
}

function probeAudio(filePath) {
  const probe = spawnSync(ffmpegPath, ['-i', filePath]);
  const stderr = probe.stderr.toString();
  const durMatch = stderr.match(/Duration: (\d{2}:\d{2}:\d{2}\.\d+)/);
  return durMatch ? durMatch[1] : 'unknown';
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlyArg = args.find((a) => a.startsWith('--only='));
  const onlyList = onlyArg ? onlyArg.replace('--only=', '').split(',') : null;

  const apiKey = getGeminiApiKey();

  console.log('====================================================');
  console.log('🎙️ СИНХРОНИЗАЦИЯ CURATED AUDIO (СЛЕНГ И ПРЕДЛОЖЕНИЯ)');
  console.log('Движок:', apiKey ? 'Gemini 3.1 Flash TTS (Google AI Studio)' : 'HTTP TTS Fallback');
  console.log('====================================================\n');

  console.log('--- 1. Синхронизация отдельных слов (11 единиц) ---');
  for (const item of CURATED_WORDS) {
    if (onlyList && !onlyList.includes(item.id)) continue;
    const targetFile = path.join(WORDS_DIR, item.file);
    try {
      const result = await fetchOrGenerateAudio(item.text, targetFile, { apiKey, force });
      const dur = probeAudio(targetFile);
      console.log(`✓ [Слово] ${item.text.padEnd(12)} -> /audio/words/${item.file.padEnd(14)} (${dur}, ${result.bytes} байт, ${result.source})`);
    } catch (err) {
      console.error(`✗ Ошибка при получении слова "${item.text}":`, err.message);
      process.exit(1);
    }
  }

  console.log('\n--- 2. Синхронизация предложений (9 единиц) ---');
  for (const item of CURATED_SENTENCES) {
    if (onlyList && !onlyList.includes(item.id)) continue;
    const targetFile = path.join(SENTENCES_DIR, item.file);
    try {
      const result = await fetchOrGenerateAudio(item.text, targetFile, { apiKey, force });
      const dur = probeAudio(targetFile);
      console.log(`✓ [Фраза] ${item.text.padEnd(32)} -> /audio/sentences/${item.file.padEnd(20)} (${dur}, ${result.bytes} байт, ${result.source})`);
    } catch (err) {
      console.error(`✗ Ошибка при получении предложения "${item.text}":`, err.message);
      process.exit(1);
    }
  }

  console.log('\n====================================================');
  console.log('✅ Все аудиофайлы проверены и актуализированы!');
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Критический сбой:', err);
  process.exit(1);
});
