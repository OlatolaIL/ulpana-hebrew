import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const outDir = path.resolve('public/demo/openchatcut_assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const ayalonImg = path.resolve('C:/Users/azrie/.codex/Ulpana2/tools/openchatcut-local/media/lesson_10_spicy/ayalon_night_taxi.jpg');
const driverImg = path.resolve('C:/Users/azrie/.codex/Ulpana2/tools/openchatcut-local/media/lesson_10_spicy/taxi_driver_shocked.jpg');

// 1. Clip Hook (0 to 4.8s = 144 frames) - Smooth forward drift
const clipHook = path.join(outDir, 'broll_01_hook.mp4');
console.log('Generating dynamic B-Roll Hook...');
cp.spawnSync(ffmpeg, [
  '-y',
  '-loop', '1',
  '-i', ayalonImg,
  '-vf', "zoompan=z='min(zoom+0.0006,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=144:s=1080x1920:fps=30",
  '-c:v', 'libx264',
  '-t', '4.8',
  '-pix_fmt', 'yuv420p',
  clipHook
]);
console.log('✅ Generated clipHook:', fs.statSync(clipHook).size, 'bytes');

// 2. Clip Passenger (4.8s to 7.84s = 3.04s = 92 frames) - Subtle push-in
const clipPass = path.join(outDir, 'broll_02_pass.mp4');
console.log('Generating dynamic B-Roll Passenger...');
cp.spawnSync(ffmpeg, [
  '-y',
  '-loop', '1',
  '-i', ayalonImg,
  '-vf', "zoompan=z='min(1.05+on*0.0005,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=92:s=1080x1920:fps=30",
  '-c:v', 'libx264',
  '-t', '3.04',
  '-pix_fmt', 'yuv420p',
  clipPass
]);
console.log('✅ Generated clipPass:', fs.statSync(clipPass).size, 'bytes');

// 2b. Clip Freeze Frame (7.84s to 8.70s = 0.86s = 26 frames) - Complete freeze frame, completely motionless!
const clipFreeze = path.join(outDir, 'broll_02b_freeze.mp4');
console.log('Generating Freeze Frame B-Roll (Option 3 comedic pause)...');
cp.spawnSync(ffmpeg, [
  '-y',
  '-loop', '1',
  '-i', ayalonImg,
  '-vf', "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=saturation=0.9:contrast=1.05",
  '-c:v', 'libx264',
  '-t', '0.86',
  '-r', '30',
  '-pix_fmt', 'yuv420p',
  clipFreeze
]);
console.log('✅ Generated clipFreeze:', fs.statSync(clipFreeze).size, 'bytes');

// 3. Clip Driver (8.70s to 17.0s = 8.3s = 249 frames) - NO SHAKE! Pure stable, dramatic zoom on driver face!
const clipDriver = path.join(outDir, 'broll_03_driver.mp4');
console.log('Generating dynamic B-Roll Driver (stable cinematic zoom, zero shake)...');
cp.spawnSync(ffmpeg, [
  '-y',
  '-loop', '1',
  '-i', driverImg,
  '-vf', "zoompan=z='min(1.06+on*0.0007,1.24)':x='iw/2-(iw/zoom/2)':y='ih*0.42-(ih/zoom/2)':d=249:s=1080x1920:fps=30",
  '-c:v', 'libx264',
  '-t', '8.3',
  '-pix_fmt', 'yuv420p',
  clipDriver
]);
console.log('✅ Generated clipDriver:', fs.statSync(clipDriver).size, 'bytes');

// 4. Clip Rule (17.0s to 23.5s = 6.5s = 195 frames) - Night Ayalon with bokeh
const clipRule = path.join(outDir, 'broll_04_rule.mp4');
console.log('Generating dynamic B-Roll Rule...');
cp.spawnSync(ffmpeg, [
  '-y',
  '-loop', '1',
  '-i', ayalonImg,
  '-vf', "zoompan=z='min(1.08-on*0.0003,1.02)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=195:s=1080x1920:fps=30,boxblur=2:1,eq=brightness=-0.08",
  '-c:v', 'libx264',
  '-t', '6.5',
  '-pix_fmt', 'yuv420p',
  clipRule
]);
console.log('✅ Generated clipRule:', fs.statSync(clipRule).size, 'bytes');

// 5. Clip CTA (23.5s to 29.2s = 5.7s = 171 frames)
const clipCta = path.join(outDir, 'broll_05_cta.mp4');
console.log('Generating dynamic B-Roll CTA...');
cp.spawnSync(ffmpeg, [
  '-y',
  '-loop', '1',
  '-i', driverImg,
  '-vf', "zoompan=z='min(1.18-on*0.0004,1.08)':x='iw/2-(iw/zoom/2)':y='ih*0.4-(ih/zoom/2)':d=171:s=1080x1920:fps=30,eq=brightness=-0.1",
  '-c:v', 'libx264',
  '-t', '5.7',
  '-pix_fmt', 'yuv420p',
  clipCta
]);
console.log('✅ Generated clipCta:', fs.statSync(clipCta).size, 'bytes');

console.log('🎉 All dynamic B-Roll motion clips generated for Option 3!');
