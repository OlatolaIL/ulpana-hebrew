import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { PLATFORMS } from './generate_occ_overlays.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const LESSONS_DIR = path.resolve(DEMO_DIR, 'lessons');
const ASSETS_DIR = path.resolve(DEMO_DIR, 'openchatcut_assets');
const MASTER_OCC_VIDEO = path.join(LESSONS_DIR, 'lesson_10_spicy_openchatcut.mp4');

const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');

async function renderPlatformVariants() {
  console.log('\n======================================================');
  console.log('🚀 ФАБРИКА-500: СБОРКА ВСЕХ ПЛАТФОРМЕННЫХ ВАРИАНТОВ УРОКА 10');
  console.log('======================================================\n');

  if (!fs.existsSync(MASTER_OCC_VIDEO)) {
    throw new Error(`Мастер-видео OpenChatCut не найдено: ${MASTER_OCC_VIDEO}`);
  }

  const results = [];

  for (const p of PLATFORMS) {
    const outMp4 = path.join(LESSONS_DIR, p.filename);
    console.log(`\n🎬 Обработка платформы: [${p.code}] ${p.name} → ${p.filename}...`);

    if (p.code === 'YT') {
      // YouTube Shorts uses promo code YT which is already baked into MASTER_OCC_VIDEO
      fs.copyFileSync(MASTER_OCC_VIDEO, outMp4);
      console.log(`  ✅ [${p.code}] Скопирован из мастера (промокод YT уже встроен)`);
    } else {
      const cardPath = path.join(ASSETS_DIR, `card_05_cta_${p.code.toLowerCase()}.png`);
      if (!fs.existsSync(cardPath)) {
        throw new Error(`Карточка CTA не найдена: ${cardPath}`);
      }

      console.log(`  🎞️ Наложение CTA-оверлея с промокодом [${p.code}] с 23.5с...`);
      const ffmpegArgs = [
        '-y',
        '-i', MASTER_OCC_VIDEO,
        '-i', cardPath,
        '-filter_complex', '[1:v]format=yuva420p[cta];[0:v][cta]overlay=0:0:enable=\'gte(t,23.5)\'[v]',
        '-map', '[v]',
        '-map', '0:a',
        '-c:v', 'libx264',
        '-crf', '19',
        '-preset', 'fast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'copy',
        outMp4
      ];

      const res = cp.spawnSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' });
      if (res.status !== 0) {
        throw new Error(`Ошибка FFmpeg при сборке ${p.filename}`);
      }
      console.log(`  ✅ [${p.code}] Успешно собран!`);
    }

    const stat = fs.statSync(outMp4);
    results.push({
      platform: p.code,
      name: p.name,
      filename: p.filename,
      sizeBytes: stat.size,
      sizeMb: (stat.size / (1024 * 1024)).toFixed(2)
    });

    // Generate preview frame for verification
    const previewJpg = path.join(DEMO_DIR, `preview_l10_${p.code.toLowerCase()}.jpg`);
    cp.spawnSync('ffmpeg', [
      '-y',
      '-ss', '00:00:26.000',
      '-i', outMp4,
      '-frames:v', '1',
      '-q:v', '2',
      previewJpg
    ]);
  }

  // Update registry
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
      if (!reg.lessons) reg.lessons = {};
      if (!reg.lessons['10']) {
        reg.lessons['10'] = { lessonNumber: 10, updatedAt: new Date().toISOString(), variants: { spicy: { files: {} } } };
      }
      if (!reg.lessons['10'].variants) reg.lessons['10'].variants = { spicy: { files: {} } };
      if (!reg.lessons['10'].variants.spicy) reg.lessons['10'].variants.spicy = { files: {} };

      for (const r of results) {
        reg.lessons['10'].variants.spicy.files[r.platform] = {
          path: `public/demo/lessons/${r.filename}`,
          promoCode: r.platform,
          durationSec: 29.2,
          resolution: '1080x1920',
          fileSizeBytes: r.sizeBytes,
          generatedAt: new Date().toISOString()
        };
      }
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
      console.log('\n📝 Обновлен реестр видео уроков: growth/lessons_video_registry.json');
    } catch (e) {
      console.warn('⚠️ Ошибка обновления registry:', e.message);
    }
  }

  // Update publications registry status
  if (fs.existsSync(PUBLICATIONS_PATH)) {
    try {
      const pubs = JSON.parse(fs.readFileSync(PUBLICATIONS_PATH, 'utf8'));
      let updatedCount = 0;
      for (const p of pubs) {
        if (p.id && p.id.includes('l10-spicy')) {
          p.updatedAt = new Date().toISOString();
          p.status = 'ready_for_upload';
          updatedCount++;
        }
      }
      fs.writeFileSync(PUBLICATIONS_PATH, JSON.stringify(pubs, null, 2), 'utf8');
      console.log(`📝 Обновлено ${updatedCount} публикаций в growth/data/publications.json`);
    } catch (e) {
      console.warn('⚠️ Ошибка обновления publications:', e.message);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ВСЕ 5 ПЛАТФОРМЕННЫХ РОЛИКОВ УСПЕШНО СОБРАНЫ:');
  for (const r of results) {
    console.log(`  • [${r.platform}] ${r.name}: ${r.filename} (${r.sizeMb} MB)`);
  }
  console.log('======================================================\n');
}

renderPlatformVariants().catch(err => {
  console.error('❌ Ошибка сборки вариантов:', err);
  process.exit(1);
});
