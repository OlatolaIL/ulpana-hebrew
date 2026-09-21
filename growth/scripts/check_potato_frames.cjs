const cp = require('child_process');
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve('public/demo/screenshots_potato');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const times = [3.0, 7.5, 9.8, 11.1, 18.0, 32.0];
for (const t of times) {
  const outFile = path.join(outDir, `frame_${t}s.png`);
  cp.spawnSync(ffmpegPath, [
    '-y',
    '-ss', t.toString(),
    '-i', 'growth/output/reels_potato_youtube.mp4',
    '-vframes', '1',
    outFile
  ]);
  console.log(`Extracted frame at ${t}s -> ${outFile}`);
}
