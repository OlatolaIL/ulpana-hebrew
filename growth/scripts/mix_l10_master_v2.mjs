import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const audioDir = path.resolve('public/demo/openchatcut_assets');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const hookFile = path.resolve('public/demo/audio_bank/l10_multivoice/01_hook_narrator.wav');
const passengerFile = path.resolve('public/demo/audio_bank/l10_multivoice/02_passenger_puck.wav');
const driverFile = path.resolve('public/demo/audio_bank/l10_spicy_s2_03.mp3');
const explainFile = path.resolve('public/demo/audio_bank/l10_spicy_s3_04.mp3');
const ctaFile = path.resolve('public/demo/audio_bank/l10_spicy_s4_05.mp3');

const scratchFile = path.resolve('public/demo/audio_bank/sfx/record_scratch.wav');
const screechFile = path.resolve('public/demo/audio_bank/sfx/tire_screech.wav');
const hornFile = path.resolve('public/demo/audio_bank/sfx/car_horn.wav');
const chimeFile = path.resolve('public/demo/audio_bank/sfx/chime_ding.wav');

const masterWav = path.join(audioDir, 'lesson_10_spicy_master_v2.wav');

// Timing plan for Freeze-Frame Comedic Pause:
// 0: Hook Narrator (0 -> 4680)
// 4800: Passenger Puck (4800 -> 7840)
// 7850: Record Scratch SFX (7850 -> 8170)
// [8170 -> 8700: Comedic dead silence in taxi!]
// 8700: Screech SFX (8700 -> 10300)
// 8900: Car Horn SFX (8900 -> 9700)
// 9400: Driver Orus (9400 -> 16920)
// 17000: Chime SFX (17000 -> 18000)
// 17300: Explain Narrator (17300 -> 23410)
// 23600: CTA Narrator (23600 -> 28510)

const filterComplex = [
  '[0:a]adelay=0|0,volume=1.0[a0]',
  '[1:a]adelay=4800|4800,volume=1.05[a1]',
  '[2:a]adelay=7850|7850,volume=0.9[a2]', // Record scratch
  '[3:a]adelay=8700|8700,volume=0.9[a3]', // Brake screech
  '[4:a]adelay=8900|8900,volume=0.75[a4]', // Horn
  '[5:a]adelay=9400|9400,volume=1.1,equalizer=f=3000:width_type=h:width=1500:g=3[a5]', // Driver
  '[6:a]adelay=17000|17000,volume=0.8[a6]', // Chime
  '[7:a]adelay=17300|17300,volume=1.0[a7]', // Explain
  '[8:a]adelay=23600|23600,volume=1.0[a8]', // CTA
  '[a0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:dropout_transition=0,dynaudnorm=f=75:g=15:p=0.95[out]'
].join(';');

const cmd = [
  '-y',
  '-i', hookFile,
  '-i', passengerFile,
  '-i', scratchFile,
  '-i', screechFile,
  '-i', hornFile,
  '-i', driverFile,
  '-i', chimeFile,
  '-i', explainFile,
  '-i', ctaFile,
  '-filter_complex', filterComplex,
  '-map', '[out]',
  '-ar', '44100',
  '-ac', '2',
  '-t', '29.2',
  masterWav
];

console.log('Mixing master audio with 9 tracks (comedic freeze-frame pause)...');
const res = cp.spawnSync(ffmpeg, cmd);
if (res.status !== 0) {
  console.error('FFmpeg error:', res.stderr.toString());
  process.exit(1);
}

console.log('✅ Successfully mixed master audio:', masterWav, fs.statSync(masterWav).size, 'bytes');
