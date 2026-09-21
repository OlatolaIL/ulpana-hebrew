import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const outDir = path.resolve('./growth/output/frames_inspect');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const videos = [
  { name: 'wolt', path: './public/demo/reels_duolingo_vs_reality.mp4', times: ['1.5', '5.5', '8.5', '11.0', '13.0', '15.0', '17.0', '18.5', '20.0', '21.5', '23.0'] },
  { name: 'rent', path: './public/demo/reels_rent_contract.mp4', times: ['1.5', '5.5', '8.0', '10.5', '13.0', '15.5', '17.5'] },
  { name: 'doctor', path: './public/demo/reels_doctor_master.mp4', times: ['2.0', '6.0', '10.0', '14.0', '18.0', '22.0'] }
];

for (const v of videos) {
  if (fs.existsSync(v.path)) {
    for (const t of v.times) {
      const out = path.join(outDir, `${v.name}_${t}s.jpg`);
      execSync(`"${ffmpeg}" -y -ss ${t} -i "${v.path}" -vframes 1 -q:v 2 "${out}"`, { stdio: 'pipe' });
      console.log('Extracted:', out);
    }
  } else {
    console.log('Not found:', v.path);
  }
}
