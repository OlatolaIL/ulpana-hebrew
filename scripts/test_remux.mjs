import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { createLoudMasterAudio } from './build_direct_audio.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

async function remux() {
  const masterAudio = await createLoudMasterAudio(148, './public/demo/master_audio.wav');
  const rawVideo = './public/demo/page@a2f86ac299c7d726b41d34298fda25a0.webm';
  const outMp4 = './public/demo/ulpana_full_guide.mp4';
  const outWebm = './public/demo/ulpana_mobile_guide.webm';

  console.log('🎬 Пересведение в MP4 с громким голосом диктора...');
  const resMp4 = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', rawVideo,
    '-i', masterAudio,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outMp4,
  ]);

  if (resMp4.status !== 0) {
    console.error('Ошибка MP4:', resMp4.stderr.toString());
  } else {
    console.log(`🎉 ГРОМКИЙ MP4 ГОТОВ: ${outMp4} (${(fs.statSync(outMp4).size / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('🎬 Пересведение в WebM...');
  cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', rawVideo,
    '-i', masterAudio,
    '-c:v', 'copy',
    '-c:a', 'libvorbis',
    '-b:a', '128k',
    '-shortest',
    outWebm,
  ]);
  console.log(`🎉 ГРОМКИЙ WEBM ГОТОВ: ${outWebm}`);
}

remux().catch(console.error);
