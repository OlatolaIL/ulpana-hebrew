import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const sfxDir = path.resolve('public/demo/audio_bank/sfx');
if (!fs.existsSync(sfxDir)) fs.mkdirSync(sfxDir, { recursive: true });

// 1. CAR HORN (Double Honk: "Бип-бип!")
// Dual frequencies 430Hz + 540Hz with saturation
const hornFile = path.join(sfxDir, 'car_horn.wav');
const hornCmd = [
  '-y',
  '-f', 'lavfi',
  '-i', 'sine=frequency=435:duration=0.25,volume=0.6',
  '-f', 'lavfi',
  '-i', 'sine=frequency=545:duration=0.25,volume=0.5',
  '-f', 'lavfi',
  '-i', 'sine=frequency=435:duration=0.45,volume=0.6',
  '-f', 'lavfi',
  '-i', 'sine=frequency=545:duration=0.45,volume=0.5',
  '-filter_complex',
  '[0:a][1:a]amix=inputs=2,afade=t=in:st=0:d=0.03,afade=t=out:st=0.20:d=0.05[h1];' +
  '[2:a][3:a]amix=inputs=2,afade=t=in:st=0:d=0.03,afade=t=out:st=0.38:d=0.07[h2];' +
  'aevalsrc=0:d=0.1[silence];' +
  '[h1][silence][h2]concat=n=3:v=0:a=1,alimiter=limit=0.9[out]',
  '-map', '[out]',
  '-ar', '44100',
  '-ac', '2',
  hornFile
];
cp.spawnSync(ffmpeg, hornCmd);
console.log('✅ Generated Car Horn:', hornFile, fs.statSync(hornFile).size, 'bytes');

// 2. TIRE SCREECH (Sudden brake lock / skid)
// High pitched friction with frequency flutter and distortion
const screechFile = path.join(sfxDir, 'tire_screech.wav');
const screechCmd = [
  '-y',
  '-f', 'lavfi',
  '-i', 'anoisesrc=d=1.6:c=white:r=44100:a=0.9',
  '-f', 'lavfi',
  '-i', 'sine=frequency=2800:duration=1.6,volume=0.35',
  '-filter_complex',
  '[0:a]bandpass=f=3200:width_type=h:w=1400,flanger=delay=3:depth=6:regen=65:width=85:speed=3.5[noise];' +
  '[1:a]vibrato=f=7:d=0.4[tone];' +
  '[noise][tone]amix=inputs=2:weights=1.0 0.4,aexciter=level_in=1:level_out=1.2:amount=1,' +
  'afade=t=in:st=0:d=0.08,afade=t=out:st=1.1:d=0.5[out]',
  '-map', '[out]',
  '-ar', '44100',
  '-ac', '2',
  screechFile
];
cp.spawnSync(ffmpeg, screechCmd);
console.log('✅ Generated Tire Screech:', screechFile, fs.statSync(screechFile).size, 'bytes');

// 3. CHIME / DING (Educational insight sound)
const chimeFile = path.join(sfxDir, 'chime_ding.wav');
const chimeCmd = [
  '-y',
  '-f', 'lavfi',
  '-i', 'sine=frequency=1046.5:duration=1.2,volume=0.5', // C6
  '-f', 'lavfi',
  '-i', 'sine=frequency=2093:duration=1.2,volume=0.3', // C7
  '-filter_complex',
  '[0:a][1:a]amix=inputs=2,afade=t=in:st=0:d=0.01,afade=t=out:st=0.1:d=1.1[out]',
  '-map', '[out]',
  '-ar', '44100',
  '-ac', '2',
  chimeFile
];
cp.spawnSync(ffmpeg, chimeCmd);
console.log('✅ Generated Chime Ding:', chimeFile, fs.statSync(chimeFile).size, 'bytes');
