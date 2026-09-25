import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { generateCtaImageLesson69 } from './generate_cta_lesson_69.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const LESSONS_DIR = path.resolve('./public/demo/lessons');
const MASTER_VIDEO = path.resolve('./public/demo/tutorial_lesson_69.mp4');

if (!fs.existsSync(LESSONS_DIR)) {
  fs.mkdirSync(LESSONS_DIR, { recursive: true });
}

export const PLATFORM_VARIANTS_69 = [
  { code: 'YT', filename: 'lesson_69_youtube_shorts.mp4', platform: 'YouTube Shorts' },
  { code: 'TG', filename: 'lesson_69_telegram.mp4', platform: 'Telegram Channel' },
  { code: 'INSTA', filename: 'lesson_69_instagram_reels.mp4', platform: 'Instagram Reels' },
  { code: 'TIKTOK', filename: 'lesson_69_tiktok.mp4', platform: 'TikTok' },
  { code: 'FB', filename: 'lesson_69_facebook_reels.mp4', platform: 'Facebook Reels' },
];

async function renderAllLesson69Variants() {
  console.log('\n======================================================');
  console.log('🚀 ФАБРИКА-500: ГЕНЕРАЦИЯ 5 ПЛАТФОРМЕННЫХ ВАРИАНТОВ УРОКА 69');
  console.log('======================================================\n');

  if (!fs.existsSync(MASTER_VIDEO)) {
    throw new Error(`Мастер-видео не найдено: ${MASTER_VIDEO}`);
  }

  // 1. Создаем master копию
  const masterCopy = path.join(LESSONS_DIR, 'lesson_69_master.mp4');
  fs.copyFileSync(MASTER_VIDEO, masterCopy);
  console.log(`✅ [Master] ${path.basename(masterCopy)} готов!`);

  // 2. Генерируем каждый платформенный вариант
  for (const variant of PLATFORM_VARIANTS_69) {
    console.log(`\n🎨 Создание CTA-оверлея для [${variant.code}] (${variant.platform})...`);
    const ctaPngPath = await generateCtaImageLesson69(variant.code);

    const outMp4Path = path.join(LESSONS_DIR, variant.filename);
    console.log(`🎞️ FFmpeg сведение: ${variant.filename}...`);

    const ffmpegArgs = [
      '-y',
      '-i', MASTER_VIDEO,
      '-loop', '1',
      '-t', '8',
      '-i', ctaPngPath,
      '-filter_complex', '[1:v]scale=390:844,format=yuva420p,fade=t=in:st=0:d=0.35:alpha=1[cta];[0:v][cta]overlay=0:0:enable=\'gte(t,49.4)\'[v]',
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
  console.log('✨ ВСЕ 5 ВАРИАНТОВ УРОКА 69 УСПЕШНО СОБРАНЫ:');
  const allFiles = fs.readdirSync(LESSONS_DIR).filter((f) => f.startsWith('lesson_69_') && f.endsWith('.mp4'));
  for (const f of allFiles) {
    const s = fs.statSync(path.join(LESSONS_DIR, f));
    console.log(`  📁 ${f} — ${(s.size / 1024 / 1024).toFixed(2)} MB`);
  }
  console.log('======================================================\n');
}

if (process.argv[1]?.endsWith('render_lesson_69_variants.mjs')) {
  renderAllLesson69Variants().catch((err) => {
    console.error('❌ Ошибка сборки вариантов:', err);
    process.exit(1);
  });
}
