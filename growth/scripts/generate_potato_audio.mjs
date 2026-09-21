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
 * Синтез речи через Microsoft Edge Neural TTS (Azure Cognitive Services)
 * Поддерживает natural rate/pitch без искажения формант
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

      // Небольшая задержка перед закрытием соединения
      await new Promise((r) => setTimeout(r, 100));
      try { tts.close(); } catch (_) {}

      // Конвертация MP3 в WAV 44.1kHz stereo
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

export async function synthesizeCue({ id, text, voice, rate = 1.0, pitch = '0Hz', forceWavName, overwrite = false }) {
  const filename = forceWavName || `potato_${id}.wav`;
  const wavPath = path.join(CACHE_DIR, filename);

  if (!overwrite && fs.existsSync(wavPath) && fs.statSync(wavPath).size > 2000) {
    console.log(`✅ [КЭШ] ${filename} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
    return wavPath;
  }

  console.log(`\n🎙️ Синтез Edge Neural TTS [${voice}] "${id}": "${text.slice(0, 45)}..."`);
  await generateEdgeTts(text, { voice, rate, pitch }, wavPath);

  const stat = fs.statSync(wavPath);
  console.log(`  ✅ Готово: ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return wavPath;
}

export async function buildCue04Breakdown() {
  console.log('\n🍏 Сборка Cue 04 (Семейство яблок с нативным Pealim SSOT)...');

  // Скачиваем оригиналы из Pealim SSOT
  const tapuachMp3 = path.join(CACHE_DIR, 'pealim_tapuach.mp3');
  const tapuzMp3 = path.join(CACHE_DIR, 'pealim_tapuz.mp3');
  const tapuachAdamaMp3 = path.join(CACHE_DIR, 'pealim_tapuach_adama.mp3');

  await downloadFile('https://audio.pealim.com/v0/t6/t6b2ogdewk81.mp3', tapuachMp3);
  await downloadFile('https://audio.pealim.com/v0/11/11axzcpyzs45l.mp3', tapuzMp3);
  await downloadFile('https://audio.pealim.com/v0/12/12m69cwn0grzw.mp3', tapuachAdamaMp3);

  const toWav = (src, dest) => {
    cp.spawnSync(FFMPEG_PATH, ['-y', '-i', src, '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', dest]);
    return dest;
  };

  const wTapuach = toWav(tapuachMp3, path.join(CACHE_DIR, 'w_tapuach.wav'));
  const wTapuz = toWav(tapuzMp3, path.join(CACHE_DIR, 'w_tapuz.wav'));
  const wTapuachAdama = toWav(tapuachAdamaMp3, path.join(CACHE_DIR, 'w_tapuach_adama.wav'));

  // Синтезируем русские связки через Edge Neural TTS (DmitryNeural)
  const p1 = await synthesizeCue({
    id: 'pot_b1',
    text: 'Как не заказать картофельный сок вместо апельсинового? В иврите всё крутится вокруг яблок.',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.15,
    forceWavName: 'pot_b1.wav',
    overwrite: true,
  });

  const p2 = await synthesizeCue({
    id: 'pot_b2',
    text: '— это просто яблоко.',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.15,
    forceWavName: 'pot_b2.wav',
    overwrite: true,
  });

  const p3 = await synthesizeCue({
    id: 'pot_b3',
    text: '— апельсин! Дословно — «золотое яблоко». А вот',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.15,
    forceWavName: 'pot_b3.wav',
    overwrite: true,
  });

  const p4 = await synthesizeCue({
    id: 'pot_b4',
    text: '— это картошка, буквально «земляное яблоко»!',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.15,
    forceWavName: 'pot_b4.wav',
    overwrite: true,
  });

  // Concat с задержками
  const cue04Wav = path.join(CACHE_DIR, 'potato_cue_04_breakdown.wav');
  const concatFilter = [
    '[0:a]adelay=0|0[a0];',
    '[1:a]adelay=200|200[a1];',
    '[2:a]adelay=180|180[a2];',
    '[3:a]adelay=200|200[a3];',
    '[4:a]adelay=180|180[a4];',
    '[5:a]adelay=200|200[a5];',
    '[6:a]adelay=180|180[a6];',
    '[a0][a1][a2][a3][a4][a5][a6]concat=n=7:v=0:a=1[out]'
  ].join('');

  const res = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', p1,
    '-i', wTapuach,
    '-i', p2,
    '-i', wTapuz,
    '-i', p3,
    '-i', wTapuachAdama,
    '-i', p4,
    '-filter_complex', concatFilter,
    '-map', '[out]',
    '-c:a', 'pcm_s16le',
    cue04Wav
  ]);

  if (res.status !== 0) throw new Error(`FFmpeg concat error: ${res.stderr?.toString()}`);
  console.log(`✅ Сборка Cue 04 завершена: ${cue04Wav}`);
  return cue04Wav;
}

export const POTATO_CUES_CONFIG = [
  {
    id: 'cue_01_hook',
    text: 'На улице жарá, плюс тридцать пять в Тель-Авиве. Ты подходишь к ларьку за свежим соком...',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.15,
    pitch: '0Hz',
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_02_student',
    // Медленно, раздельно, отчетливо: акцент на «... תַּפּוּחֵי אֲדָמָה»
    text: 'אֶפְשָׁר מִיץ... תַּפּוּחֵי אֲדָמָה סָחוּט טָרִי?',
    voice: 'he-IL-AvriNeural',
    rate: 0.82, // -18% замедление для четкости
    pitch: '+8Hz', // Молодой голос ученика
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_03_vendor',
    // Строго на иврите с иронией, басистый голос продавца
    text: 'אַחִי, אַתָּה רוֹצֶה אֶת זֶה עִם קֶרַח אוֹ עִם שָׁמִיר?!',
    voice: 'he-IL-AvriNeural',
    rate: 1.05,
    pitch: '-15Hz', // Басистый саркастичный израильский продавец
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_04_breakdown',
    // Собирается через buildCue04Breakdown со студийным Pealim SSOT
    customBuilder: true,
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_05_outro',
    text: 'Не красней в Израиле! Учи живой язык улиц и реальных ситуаций в Ульпан Алеф. Промокод ЮТУБ — ссылка в описании!',
    voice: 'ru-RU-DmitryNeural',
    rate: 1.2,
    pitch: '0Hz',
    gapAfterSec: 0.5,
  },
];

async function main() {
  console.log('🚀 Генерация всех аудиоклипов для «Картофельный фреш» через Edge Neural TTS 🥔🥤...');

  for (const cue of POTATO_CUES_CONFIG) {
    if (cue.customBuilder) {
      await buildCue04Breakdown();
    } else {
      await synthesizeCue({ ...cue, overwrite: true });
    }
  }

  console.log('\n🎉 Все аудиоклипы успешно сгенерированы в public/demo/audio_cache!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Фатальная ошибка генерации аудио:', err);
    process.exit(1);
  });
}
