import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { synthesizeCue } from './generate_rent_audio.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');

async function main() {
  console.log('🎙️ Сборка идеального Cue 04 с нативным звуком Pealim...');

  // 1. Части русской озвучки
  const p1 = await synthesizeCue({
    id: 'exp_p1',
    text: 'Одной буквой ошибся — и вместо договора подписал грудь хозяйки!',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.18,
    forceWavName: 'exp_p1.wav'
  });

  const p2 = await synthesizeCue({
    id: 'exp_p2',
    text: '— это контракт, а',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.15,
    forceWavName: 'exp_p2.wav'
  });

  const p3 = await synthesizeCue({
    id: 'exp_p3',
    text: '— грудь!',
    lang: 'ru',
    geminiVoice: 'Charon',
    speed: 1.15,
    forceWavName: 'exp_p3.wav'
  });

  const chozeWav = path.join(CACHE_DIR, 'pealim_choze.wav');
  const chazeWav = path.join(CACHE_DIR, 'pealim_chaze.wav');

  // Нормализуем все аудиофайлы к единому формату: 44100Hz, stereo, 16-bit PCM
  const normalize = (src, dest) => {
    cp.spawnSync(FFMPEG_PATH, [
      '-y',
      '-i', src,
      '-ar', '44100',
      '-ac', '2',
      '-c:a', 'pcm_s16le',
      dest
    ]);
  };

  const nP1 = path.join(CACHE_DIR, 'n_exp_p1.wav');
  const nChoze = path.join(CACHE_DIR, 'n_choze.wav');
  const nP2 = path.join(CACHE_DIR, 'n_exp_p2.wav');
  const nChaze = path.join(CACHE_DIR, 'n_chaze.wav');
  const nP3 = path.join(CACHE_DIR, 'n_exp_p3.wav');

  normalize(p1, nP1);
  normalize(chozeWav, nChoze);
  normalize(p2, nP2);
  normalize(chazeWav, nChaze);
  normalize(p3, nP3);

  // Склейка через FFmpeg concat filter с микропаузами
  const combinedWav = path.join(CACHE_DIR, 'rent_cue_04_explainer_pealim.wav');
  const concatFilter = [
    '[0:a]adelay=0|0[a0];',
    '[1:a]adelay=150|150[a1];',
    '[2:a]adelay=150|150[a2];',
    '[3:a]adelay=150|150[a3];',
    '[4:a]adelay=150|150[a4];',
    '[a0][a1][a2][a3][a4]concat=n=5:v=0:a=1[out]'
  ].join('');

  const res = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', nP1,
    '-i', nChoze,
    '-i', nP2,
    '-i', nChaze,
    '-i', nP3,
    '-filter_complex', concatFilter,
    '-map', '[out]',
    '-c:a', 'pcm_s16le',
    combinedWav
  ]);

  if (res.status !== 0) {
    console.error('FFmpeg error:', res.stderr.toString());
    process.exit(1);
  }

  console.log(`✅ Идеальный Cue 04 собран: ${combinedWav}`);
  const stat = fs.statSync(combinedWav);
  console.log(`Размер: ${(stat.size / 1024).toFixed(1)} KB`);
}

main().catch(console.error);
