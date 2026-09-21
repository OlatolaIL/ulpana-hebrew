const cp = require('child_process');
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve('public/demo/screenshots_check/timeline');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (let s = 1; s <= 27; s += 3) {
  const outFile = path.join(outDir, `frame_${s}s.png`);
  cp.spawnSync(ffmpegPath, [
    '-y',
    '-ss', s.toString(),
    '-i', 'public/demo/reels_rent_contract.mp4',
    '-vframes', '1',
    outFile
  ]);
  console.log(`Extracted frame at ${s}s`);
}
