import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const OUTPUT_DIR = path.resolve('./growth/output/facebook_promo');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getBase64Image(filePath) {
  const bitmap = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${bitmap.toString('base64')}`;
}

const woltFrame = getBase64Image(path.resolve('./growth/output/frames_inspect/wolt_21.5s.jpg'));
const rentFrame = getBase64Image(path.resolve('./growth/output/frames_inspect/rent_5.5s.jpg'));

console.log('Frames loaded successfully. Building HTML templates...');
