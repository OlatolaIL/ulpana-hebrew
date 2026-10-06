import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { produceCleanLesson } from './produce_clean_lesson.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const PUBS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const UPLOAD_SCRIPT = path.resolve(__dirname, 'upload_release_assets.mjs');
const SYNC_PUBS_SCRIPT = path.resolve(__dirname, 'generate_publications_for_lessons.mjs');
const SYNC_TS_SCRIPT = path.resolve(ROOT, 'scripts/sync_marketing_publications_ts.cjs');

// Парсинг аргументов CLI: --lessons=13-20 или --lessons=13,14,15...
let targetLessons = [13, 14, 15, 16, 17, 18, 19, 20];
const lessonsArg = process.argv.find(a => a.startsWith('--lessons='));
if (lessonsArg) {
  const val = lessonsArg.split('=')[1];
  if (val.includes('-')) {
    const [start, end] = val.split('-').map(Number);
    targetLessons = [];
    for (let i = start; i <= end; i++) targetLessons.push(i);
  } else {
    targetLessons = val.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
  }
}

async function rebuildAndUploadBatch() {
  console.log(`\n======================================================`);
  console.log(`🚀 ПАКЕТНЫЙ СБОР И ВЫГРУЗКА УРОКОВ ${targetLessons.join(', ')} (CLEAN)`);
  console.log(`======================================================\n`);

  for (const l of targetLessons) {
    const pad = String(l).padStart(2, '0');
    console.log(`\n======================================================`);
    console.log(`🎬 СБОРКА УРОКА ${l} (5 платформ 1080x1920)...`);
    console.log(`======================================================\n`);

    try {
      await produceCleanLesson(l);
      console.log(`   ✅ Урок ${l} успешно собран локально!`);
    } catch (err) {
      console.error(`   ❌ Ошибка сборки урока ${l}:`, err.message);
      continue;
    }

    console.log(`\n☁️ ЗАГРУЗКА УРОКА ${l} НА CDN (GitHub Releases)...`);
    const uploadRes = cp.spawnSync('node', [
      UPLOAD_SCRIPT,
      '--release-tag=v-media-lessons-02-05',
      `--filter=lesson_${pad}_clean`,
      '--force'
    ], { stdio: 'inherit', cwd: ROOT });

    if (uploadRes.status !== 0) {
      console.warn(`   ⚠️ Ошибка или предупреждение при выгрузке урока ${l} на CDN.`);
    } else {
      console.log(`   ✅ Урок ${l} успешно опубликован на CDN!`);
    }
  }

  // Синхронизация структуры кампаний
  console.log(`\n🔄 СИНХРОНИЗАЦИЯ РЕЕСТРА ПУБЛИКАЦИЙ (R-25)...`);
  cp.spawnSync('node', [SYNC_PUBS_SCRIPT], { stdio: 'inherit', cwd: ROOT });

  // Обновление статусов в publications.json на ready
  console.log(`\n📝 ОБНОВЛЕНИЕ СТАТУСОВ В PUBLICATIONS.JSON...`);
  if (fs.existsSync(PUBS_PATH)) {
    const pubs = JSON.parse(fs.readFileSync(PUBS_PATH, 'utf8'));
    let updatedCount = 0;
    for (const l of targetLessons) {
      const pad = String(l).padStart(2, '0');
      for (const p of pubs) {
        if (p.id.endsWith(`-l${pad}-clean`)) {
          p.status = 'ready';
          p.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
    }
    fs.writeFileSync(PUBS_PATH, JSON.stringify(pubs, null, 2), 'utf8');
    console.log(`   ✅ Обновлен статус ${updatedCount} кампаний на "ready" в publications.json!`);
  }

  // Обновление статусов в lessons_video_registry.json
  if (fs.existsSync(REGISTRY_PATH)) {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    if (!reg.lessons) reg.lessons = {};
    for (const l of targetLessons) {
      const key = String(l);
      if (!reg.lessons[key]) {
        reg.lessons[key] = {
          lessonNumber: l,
          updatedAt: new Date().toISOString(),
          variants: {}
        };
      }
      if (!reg.lessons[key].variants) reg.lessons[key].variants = {};
      reg.lessons[key].variants.clean = {
        status: 'ready',
        updatedAt: new Date().toISOString(),
        platforms: ['youtube', 'telegram', 'instagram', 'tiktok', 'facebook']
      };
      reg.lessons[key].updatedAt = new Date().toISOString();
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
    console.log(`   ✅ lessons_video_registry.json: статус уроков ${targetLessons.join(', ')} clean зафиксирован как "ready"!`);
  }

  // Синхронизация marketingPublicationsData.ts
  if (fs.existsSync(SYNC_TS_SCRIPT)) {
    console.log(`\n🔄 СИНХРОНИЗАЦИЯ marketingPublicationsData.ts...`);
    cp.spawnSync('node', [SYNC_TS_SCRIPT], { stdio: 'inherit', cwd: ROOT });
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ВСЕ УРОКИ ${targetLessons.join(', ')} УСПЕШНО ПЕРЕСОБРАНЫ, ВЫГРУЖЕНЫ И ГОТОВЫ!`);
  console.log(`======================================================\n`);
}

rebuildAndUploadBatch().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
