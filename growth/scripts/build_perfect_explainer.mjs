import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { fetchTts } from '../../scripts/tts_helper.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');

async function buildPerfectExplainer() {
  console.log('🎙️ Сборка безупречного explainer с точным израильским ударением [хо-ЗЭ́] и [ха-ЗЭ́]...');

  // 1. Часть 1 (RU): "Одной буквой ошибся — и вместо договора подписал грудь хозяйки!"
  const part1Mp3 = await fetchTts(
    'Одной буквой ошибся — и вместо договора подписал грудь хозяйки!',
    'ru',
    'exp_part1.mp3'
  );
  const part1Wav = path.join(CACHE_DIR, 'exp_part1.wav');
  cp.spawnSync(ffmpeg, ['-y', '-i', part1Mp3, '-filter:a', 'atempo=1.22', '-ar', '44100', '-ac', '2', part1Wav]);

  // 2. Слово 1 (IW): חוֹזֶה [хо-ЗЭ́] (Google Native Hebrew)
  const hozeMp3 = await fetchTts('חוֹזֶה', 'iw', 'exp_hoze.mp3');
  const hozeWav = path.join(CACHE_DIR, 'exp_hoze.wav');
  cp.spawnSync(ffmpeg, ['-y', '-i', hozeMp3, '-ar', '44100', '-ac', '2', hozeWav]);

  // 3. Часть 2 (RU): "— это контракт, а"
  const part2Mp3 = await fetchTts('— это контракт, а', 'ru', 'exp_part2.mp3');
  const part2Wav = path.join(CACHE_DIR, 'exp_part2.wav');
  cp.spawnSync(ffmpeg, ['-y', '-i', part2Mp3, '-filter:a', 'atempo=1.22', '-ar', '44100', '-ac', '2', part2Wav]);

  // 4. Слово 2 (IW): חָזֶה [ха-ЗЭ́] (Google Native Hebrew)
  const hazeMp3 = await fetchTts('חָזֶה', 'iw', 'exp_haze.mp3');
  const hazeWav = path.join(CACHE_DIR, 'exp_haze.wav');
  cp.spawnSync(ffmpeg, ['-y', '-i', hazeMp3, '-ar', '44100', '-ac', '2', hazeWav]);

  // 5. Часть 3 (RU): "— грудь!"
  const part3Mp3 = await fetchTts('— грудь!', 'ru', 'exp_part3.mp3');
  const part3Wav = path.join(CACHE_DIR, 'exp_part3.wav');
  cp.spawnSync(ffmpeg, ['-y', '-i', part3Mp3, '-filter:a', 'atempo=1.22', '-ar', '44100', '-ac', '2', part3Wav]);

  // Объединение через FFmpeg concat с небольшими паузами
  // Создаем файл тишины 250мс
  const silenceWav = path.join(CACHE_DIR, 'silence_200ms.wav');
  cp.spawnSync(ffmpeg, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '0.2', silenceWav]);
  const silenceShortWav = path.join(CACHE_DIR, 'silence_100ms.wav');
  cp.spawnSync(ffmpeg, ['-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', '0.1', silenceShortWav]);

  const listFile = path.join(CACHE_DIR, 'explainer_concat_list.txt');
  const filesList = [
    part1Wav,
    silenceWav,
    hozeWav,
    silenceShortWav,
    part2Wav,
    silenceShortWav,
    hazeWav,
    silenceShortWav,
    part3Wav,
  ];

  fs.writeFileSync(listFile, filesList.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

  const finalExplainerWav = path.join(CACHE_DIR, 'rent_cue_04_explainer.wav');
  cp.spawnSync(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'pcm_s16le',
    '-ar', '44100',
    '-ac', '2',
    finalExplainerWav,
  ]);

  console.log(`✅ [Успех] rent_cue_04_explainer.wav собран с чистым израильским [хо-ЗЭ́] и [ха-ЗЭ́]!`);
  return finalExplainerWav;
}

buildPerfectExplainer().catch(console.error);
