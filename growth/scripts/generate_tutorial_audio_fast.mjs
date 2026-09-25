import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { fetchTts } from '../../scripts/tts_helper.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function convertMp3ToWav(mp3Path, wavPath, speed = 1.0, pitchFactor = 1.0) {
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

  cp.spawnSync(ffmpeg, args);
  console.log(`✅ [WAV Готов] ${path.basename(wavPath)} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`);
}

async function run() {
  console.log('🎙️ Генерация аудиоклипов для Этапа 5 (Диалоги) v2.0...\n');

  // 1. Intro (RU)
  console.log('🔊 1. Введение (RU)...');
  const introMp3 = await fetchTts(
    'Этап пять: Диалоги. Здесь ты учишься говорить связно в реальных ситуациях без стресса.',
    'ru',
    'tut5_intro_tts.mp3'
  );
  await convertMp3ToWav(introMp3, path.join(CACHE_DIR, 'tut5_sped_01_intro.wav'), 1.22);

  // 2. Barista (IW) - Мужской глубокий голос (pitchFactor = 0.86)
  console.log('🔊 2. Реплика бариста (IW, мужской голос)...');
  const baristaMp3 = await fetchTts(
    'שָׁלוֹם! מָה אַתָּה רוֹצֶה לִשְׁתּוֹת?',
    'iw',
    'tut5_barista_tts.mp3'
  );
  await convertMp3ToWav(baristaMp3, path.join(CACHE_DIR, 'tut5_raw_02_barista.wav'), 1.0, 0.86);

  // 3. Student (IW) - Контрастный женский/высокий голос (pitchFactor = 1.18)
  console.log('🔊 3. Реплика ученика (IW, контрастный голос)...');
  const studentMp3 = await fetchTts(
    'אֲנִי רוֹצֶה קָפֶה קָטָן, בְּבַקָּשָׁה.',
    'iw',
    'tut5_student_tts.mp3'
  );
  await convertMp3ToWav(studentMp3, path.join(CACHE_DIR, 'tut5_raw_03_student.wav'), 1.0, 1.18);

  // 4. Eval (RU) - Без Whisper и жаргона (R-25)
  console.log('🔊 4. Оценка ИИ без инженерного жаргона (RU)...');
  const evalMp3 = await fetchTts(
    'Умный тренажёр слушает без спешки и оценивает точность каждого слова.',
    'ru',
    'tut5_eval_v2_tts.mp3'
  );
  await convertMp3ToWav(evalMp3, path.join(CACHE_DIR, 'tut5_sped_04_eval.wav'), 1.22);

  // 5. Outro (RU)
  console.log('🔊 5. Зачёт / Outro (RU)...');
  const outroMp3 = await fetchTts(
    'Девяносто восемь процентов! Этап успешно зачтён. Говори уверенно в Израиле!',
    'ru',
    'tut5_outro_tts.mp3'
  );
  await convertMp3ToWav(outroMp3, path.join(CACHE_DIR, 'tut5_sped_05_outro.wav'), 1.22);

  console.log('\n🎉 ВСЕ 5 АУДИОКЛИПОВ УСПЕШНО СИНТЕЗИРОВАНЫ И ГОТОВЫ К ЗАПИСИ ВИДЕО!');
}

run().catch((err) => {
  console.error('❌ Ошибка генерации аудио:', err);
  process.exit(1);
});
