import { execSync } from 'child_process';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const times = ['23.0', '24.5', '25.5', '26.5'];
for (const t of times) {
  const out = path.resolve(`./growth/output/frames_inspect/fb_reels_${t}s.jpg`);
  execSync(`"${ffmpeg}" -y -ss ${t} -i ./growth/output/reels_fb.mp4 -vframes 1 -q:v 2 "${out}"`, { stdio: 'pipe' });
  console.log('Extracted:', out);
}
