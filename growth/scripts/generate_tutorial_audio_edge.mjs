import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function synthesizeEdgeAudio(text, voiceName, outWavFilename, options = {}) {
  const finalWavPath = path.join(CACHE_DIR, outWavFilename);
  const tempMp3Path = path.join(CACHE_DIR, `${outWavFilename}.temp.mp3`);

  console.log(`🎙️ Синтез (${voiceName}, rate=${options.rate || 'default'}): "${text.slice(0, 40)}..."`);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text, options);
  const writeStream = fs.createWriteStream(tempMp3Path);

  await new Promise((resolve, reject) => {
    audioStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    audioStream.on('error', reject);
  });

  // Конвертация через FFmpeg в чистый 44.1kHz 16-bit 2-канальный WAV
  cp.spawnSync(ffmpeg, [
    '-y',
    '-i', tempMp3Path,
    '-ar', '44100',
    '-ac', '2',
    finalWavPath
  ]);

  if (fs.existsSync(tempMp3Path)) {
    try { fs.unlinkSync(tempMp3Path); } catch (_) {}
  }

  const stat = fs.statSync(finalWavPath);
  console.log(`✅ [Edge TTS] Сохранен ${outWavFilename} (${(stat.size / 1024).toFixed(1)} KB)`);
  return finalWavPath;
}

async function run() {
  console.log('🚀 Старт генерации спокойного обучающего аудио (Этап 5: Диалоги) через Edge Neural TTS...\n');
  console.log('📐 Стандарты: R-17 (Иврит 0.8x спокойная артикуляция), R-25 (Русский диктор 1.0x без ускорения)\n');

  // 1. Введение (Диктор, Dmitry, 1.0x, одобренный вариант 1: Пятый этап — диалоги)
  await synthesizeEdgeAudio(
    'Пятый этап — диалоги. Здесь ты учишься говорить связно в реальных ситуациях без стресса.',
    'ru-RU-DmitryNeural',
    'tut5_raw_01_intro.wav',
    { rate: 'default' }
  );

  // 2. Бариста (Иврит, Avri, мужской род к гостю-мужчине: ברוך הבא / מה תרצה)
  await synthesizeEdgeAudio(
    'שלום! ברוך הבא. מה תרצה לשתות?',
    'he-IL-AvriNeural',
    'tut5_raw_02_barista.wav',
    { rate: '-15%' }
  );

  // 3. Ученик (Иврит, Avri с pitch +35Hz для молодого контрастного голоса ученика: רוצה קפה עם חלב)
  await synthesizeEdgeAudio(
    'שלום, אני רוצה קפה עם חלב, בבקשה.',
    'he-IL-AvriNeural',
    'tut5_raw_03_student.wav',
    { rate: '-10%', pitch: '+35Hz' }
  );

  // 4. Оценка ИИ без инженерного жаргона (Диктор, Dmitry, 1.0x, принудительное ударение на слÓва)
  await synthesizeEdgeAudio(
    'Умный тренажёр слушает без спешки и оценивает точность каждого сло\u0301ва.',
    'ru-RU-DmitryNeural',
    'tut5_raw_04_eval.wav',
    { rate: 'default' }
  );

  // 5. Результат / Outro (Диктор, Dmitry, 1.0x, безупречная дикция без оговорок)
  await synthesizeEdgeAudio(
    'Девяносто восемь процентов! Этот этап успешно зачтён. Говори уверенно в Израиле!',
    'ru-RU-DmitryNeural',
    'tut5_raw_05_outro.wav',
    { rate: 'default' }
  );

  // Создаем копии для совместимости tut5_sped_* без какого-либо ускорения (1.0x)
  const compatCopies = [
    { src: 'tut5_raw_01_intro.wav', dst: 'tut5_sped_01_intro.wav' },
    { src: 'tut5_raw_04_eval.wav', dst: 'tut5_sped_04_eval.wav' },
    { src: 'tut5_raw_05_outro.wav', dst: 'tut5_sped_05_outro.wav' },
  ];
  for (const c of compatCopies) {
    fs.copyFileSync(path.join(CACHE_DIR, c.src), path.join(CACHE_DIR, c.dst));
  }

  console.log('\n🎉 ВСЕ 5 АУДИОКЛИПОВ УСПЕШНО СИНТЕЗИРОВАНЫ В СПОКОЙНОМ ОБУЧАЮЩЕМ ТЕМПЕ!');
}

run().catch((err) => {
  console.error('❌ Ошибка генерации аудио:', err);
  process.exit(1);
});
