import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import https from 'https';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(dest);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', reject);
  });
}

/**
 * Синтез речи через Microsoft Edge Neural TTS
 */
async function generateEdgeTts(text, { voice = 'ru-RU-DmitryNeural', rate = 1.0, pitch = '0Hz' }, wavPath, maxRetries = 3) {
  const ratePct = rate !== 1.0 ? `${rate >= 1.0 ? '+' : ''}${Math.round((rate - 1.0) * 100)}%` : '+0%';
  const options = { rate: ratePct };
  if (pitch && pitch !== '0Hz') {
    options.pitch = pitch;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const tempMp3 = wavPath + '.temp.mp3';
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const { audioStream } = tts.toStream(text, options);
      const ws = fs.createWriteStream(tempMp3);
      audioStream.pipe(ws);

      await new Promise((resolve, reject) => {
        audioStream.on('end', resolve);
        audioStream.on('error', reject);
        ws.on('error', reject);
      });

      await new Promise((r) => setTimeout(r, 100));
      try { tts.close(); } catch (_) {}

      // Конвертация в WAV 44.1kHz stereo
      const args = [
        '-y',
        '-i', tempMp3,
        '-ar', '44100',
        '-ac', '2',
        '-c:a', 'pcm_s16le',
        wavPath
      ];
      const res = cp.spawnSync(FFMPEG_PATH, args);
      if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);

      if (res.status !== 0) {
        throw new Error(`FFmpeg error converting mp3 to wav: ${res.stderr?.toString()}`);
      }

      return wavPath;
    } catch (err) {
      if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
      console.warn(`  ⚠️ Попытка ${attempt}/${maxRetries} не удалась: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

export async function synthesizeCue({ id, text, voice, rate = 1.0, pitch = '0Hz', forceWavName, overwrite = true }) {
  const filename = forceWavName || `doctor_${id}.wav`;
  const wavPath = path.join(CACHE_DIR, filename);

  if (!overwrite && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 2000) {
    console.log(`✅ [КЭШ] ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
    return wavPath;
  }

  console.log(`\n🎙️ Синтез [${voice}] "${id}": "${text.slice(0, 50)}..."`);
  await generateEdgeTts(text, { voice, rate, pitch }, wavPath);

  const stat = fs.statSync(wavPath);
  console.log(`  ✅ Готово: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return wavPath;
}

/**
 * Экспресс-разбор (всего 5 секунд): Pealim SSOT לנשום vs לנשק
 */
export async function buildFastBreakdownCue() {
  console.log('\n🩺 Ультра-быстрый Pealim SSOT (~5 сек)...');

  const linshomMp3 = path.join(CACHE_DIR, 'pealim_linshom.mp3');
  const lenashekMp3 = path.join(CACHE_DIR, 'pealim_lenashek.mp3');

  await downloadFile('https://audio.pealim.com/v0/1a/1a4nc20ekcs3z.mp3', linshomMp3);
  await downloadFile('https://audio.pealim.com/v0/rr/rrtg54sv6nw9.mp3', lenashekMp3);

  const toWav = (src, dest) => {
    cp.spawnSync(FFMPEG_PATH, ['-y', '-i', src, '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', dest]);
    return dest;
  };

  const wLinshom = toWav(linshomMp3, path.join(CACHE_DIR, 'w_linshom.wav'));
  const wLenashek = toWav(lenashekMp3, path.join(CACHE_DIR, 'w_lenashek.wav'));

  const bBreath = await synthesizeCue({
    id: 'u_breath',
    text: '— дышать.',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.25,
    forceWavName: 'u_breath.wav',
    overwrite: true,
  });

  const bKiss = await synthesizeCue({
    id: 'u_kiss',
    text: '— целовать!',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.25,
    forceWavName: 'u_kiss.wav',
    overwrite: true,
  });

  const breakdownWav = path.join(CACHE_DIR, 'doctor_cue_04_fast_breakdown.wav');
  const concatFilter = [
    '[0:a]adelay=0|0[a0];',
    '[1:a]adelay=100|100[a1];',
    '[2:a]adelay=140|140[a2];',
    '[3:a]adelay=100|100[a3];',
    '[a0][a1][a2][a3]concat=n=4:v=0:a=1[out]'
  ].join('');

  const res = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', wLinshom,
    '-i', bBreath,
    '-i', wLenashek,
    '-i', bKiss,
    '-filter_complex', concatFilter,
    '-map', '[out]',
    '-c:a', 'pcm_s16le',
    breakdownWav
  ]);

  if (res.status !== 0) throw new Error(`FFmpeg concat error: ${res.stderr?.toString()}`);
  console.log(`✅ Экспресс-разбор готов: ${breakdownWav}`);
  return breakdownWav;
}

export const DOCTOR_FAST_CUES_CONFIG = [
  {
    id: 'cue_01_doctor',
    text: 'תִּנְשׁוֹם עָמוֹק!',
    voice: 'he-IL-AvriNeural',
    rate: 1.05,
    pitch: '0Hz',
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_02_patient',
    text: 'דּוֹקְטוֹר, קָשֶׁה לִי מְאוֹד לְנַשֵּׁק!',
    voice: 'he-IL-AvriNeural',
    rate: 0.98,
    pitch: '+8Hz',
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_03_doctor_punchline',
    text: 'Ну, батенька, с этим вам к семейному психологу, а я кардиолог!',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.12,
    pitch: '0Hz',
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_04_fast_breakdown',
    customBuilder: true,
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_05_outro',
    text: 'Учи живой иврит в Ульпан Алеф. Промокод ЮТУБ — ссылка в описании!',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.25,
    pitch: '0Hz',
    gapAfterSec: 0.2,
  },
];

async function main() {
  console.log('🚀 Генерация ультра-быстрого аудио (< 22 сек) 🩺...');

  for (const cue of DOCTOR_FAST_CUES_CONFIG) {
    if (cue.customBuilder) {
      await buildFastBreakdownCue();
    } else {
      await synthesizeCue({ ...cue, overwrite: true });
    }
  }

  console.log('\n🎉 Все ультра-быстрые аудиоклипы сгенерированы!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Ошибка генерации аудио:', err);
    process.exit(1);
  });
}
