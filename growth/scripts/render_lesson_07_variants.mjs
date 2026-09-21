import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { generateCtaImage } from './generate_cta.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const LESSONS_DIR = path.resolve('./public/demo/lessons');
const FRAMES_DIR = path.resolve('./public/demo/frames');

const MASTER_VIDEO = path.join(LESSONS_DIR, 'lesson_07_youtube_shorts.mp4');

const PLATFORM_VARIANTS = [
  { code: 'INSTA', filename: 'lesson_07_instagram_reels.mp4', platform: 'Instagram Reels' },
  { code: 'TIKTOK', filename: 'lesson_07_tiktok.mp4', platform: 'TikTok' },
  { code: 'TG', filename: 'lesson_07_telegram.mp4', platform: 'Telegram Channel' },
  { code: 'FB', filename: 'lesson_07_facebook_reels.mp4', platform: 'Facebook Reels' },
];

async function renderAllVariants() {
  console.log('\n======================================================');
  console.log('🚀 ГЕНЕРАЦИЯ ПЛАТФОРМЕННЫХ ВАРИАНТОВ УРОКА 7');
  console.log('======================================================\n');

  if (!fs.existsSync(MASTER_VIDEO)) {
    throw new Error(`Мастер-видео не найдено: ${MASTER_VIDEO}`);
  }

  // 1. Создаем master копию
  const masterCopy = path.join(LESSONS_DIR, 'lesson_07_master.mp4');
  fs.copyFileSync(MASTER_VIDEO, masterCopy);
  console.log(`✅ [Master] ${path.basename(masterCopy)} готов!`);

  // 2. Генерируем каждый платформенный вариант
  for (const variant of PLATFORM_VARIANTS) {
    console.log(`\n🎨 Создание оверлея для [${variant.code}] (${variant.platform})...`);
    const ctaPngPath = await generateCtaImage(variant.code);

    const outMp4Path = path.join(LESSONS_DIR, variant.filename);
    console.log(`🎞️ FFmpeg рендеринг: ${variant.filename}...`);

    const ffmpegArgs = [
      '-y',
      '-i', MASTER_VIDEO,
      '-loop', '1',
      '-t', '8',
      '-i', ctaPngPath,
      '-filter_complex', '[1:v]format=yuva420p,fade=t=in:st=0:d=0.4:alpha=1[cta];[0:v][cta]overlay=0:0:enable=\'gte(t,49.8)\'[v]',
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'copy',
      outMp4Path,
    ];

    const res = cp.spawnSync(ffmpeg, ffmpegArgs);
    if (res.status !== 0) {
      throw new Error(`FFmpeg error for ${variant.filename}: ${res.stderr?.toString()}`);
    }

    const stat = fs.statSync(outMp4Path);
    console.log(`  🎉 Готово: ${variant.filename} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('\n======================================================');
  console.log('✨ ВСЕ ПЛАТФОРМЕННЫЕ ВАРИАНТЫ УСПЕШНО СОБРАНЫ:');
  const allFiles = fs.readdirSync(LESSONS_DIR).filter(f => f.startsWith('lesson_07_') && f.endsWith('.mp4'));
  for (const f of allFiles) {
    const s = fs.statSync(path.join(LESSONS_DIR, f));
    console.log(`  📁 ${f} — ${(s.size / 1024 / 1024).toFixed(2)} MB`);
  }
  console.log('======================================================\n');
}

renderAllVariants().catch((err) => {
  console.error('❌ Ошибка сборки вариантов:', err);
  process.exit(1);
});
