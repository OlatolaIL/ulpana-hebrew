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

async function synthesizeEdgeAudio(text, voiceName, outWavFilename) {
  const finalWavPath = path.join(CACHE_DIR, outWavFilename);
  const tempMp3Path = path.join(CACHE_DIR, `${outWavFilename}.temp.mp3`);

  console.log(`🎙️ Синтез (${voiceName}): "${text.slice(0, 40)}..."`);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const readable = tts.toStream(text);
  const writeStream = fs.createWriteStream(tempMp3Path);

  await new Promise((resolve, reject) => {
    readable.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    readable.on('error', reject);
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
  console.log('🚀 Старт генерации аудиоклипов для Обучающего видео (Этап 5: Диалоги) через Edge Neural TTS...\n');

  // 1. Введение (Диктор, Dmitry)
  await synthesizeEdgeAudio(
    'Этап пять: Диалоги. Здесь ты учишься говорить связно в реальных ситуациях без стресса.',
    'ru-RU-DmitryNeural',
    'tut5_raw_01_intro.wav'
  );

  // 2. Бариста (Иврит, Avri)
  await synthesizeEdgeAudio(
    'שָׁלוֹם! מָה אַתָּה רוֹצֶה לִשְׁתּוֹת?',
    'he-IL-AvriNeural',
    'tut5_raw_02_barista.wav'
  );

  // 3. Ученик (Иврит, Hila)
  await synthesizeEdgeAudio(
    'אֲנִי רוֹצֶה קָפֶה קָטָן, בְּבַקָּשָׁה.',
    'he-IL-HilaNeural',
    'tut5_raw_03_student.wav'
  );

  // 4. Оценка ИИ без инженерного жаргона (R-25) (Диктор, Dmitry)
  await synthesizeEdgeAudio(
    'Умный тренажёр слушает без спешки и оценивает точность каждого слова.',
    'ru-RU-DmitryNeural',
    'tut5_raw_04_eval.wav'
  );

  // 5. Результат / Outro (Диктор, Dmitry)
  await synthesizeEdgeAudio(
    'Девяносто восемь процентов! Этап успешно зачтён. Говори уверенно в Израиле!',
    'ru-RU-DmitryNeural',
    'tut5_raw_05_outro.wav'
  );

  // 6. Ускорение закадровой русской речи до 1.22x (R-25)
  console.log('\n⚡ Ускорение закадровой русской речи до 1.22x (R-25)...');
  const speedups = [
    { in: 'tut5_raw_01_intro.wav', out: 'tut5_sped_01_intro.wav', speed: '1.22' },
    { in: 'tut5_raw_04_eval.wav', out: 'tut5_sped_04_eval.wav', speed: '1.22' },
    { in: 'tut5_raw_05_outro.wav', out: 'tut5_sped_05_outro.wav', speed: '1.22' },
  ];

  for (const s of speedups) {
    const inPath = path.join(CACHE_DIR, s.in);
    const outPath = path.join(CACHE_DIR, s.out);
    cp.spawnSync(ffmpeg, [
      '-y',
      '-i', inPath,
      '-filter:a', `atempo=${s.speed}`,
      outPath
    ]);
    const stat = fs.statSync(outPath);
    console.log(`✅ [Ускорен 1.22x] ${s.out} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  console.log('\n🎉 ВСЕ 5 АУДИОКЛИПОВ УСПЕШНО СИНТЕЗИРОВАНЫ И ГОТОВЫ К МОНТАЖУ!');
}

run().catch((err) => {
  console.error('❌ Ошибка генерации аудио:', err);
  process.exit(1);
});
