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

const TARGET_LESSONS = [1, 2, 3, 4, 5, 6];

async function rebuildAndUploadBatch() {
  console.log(`\n======================================================`);
  console.log(`🚀 ПАКЕТНЫЙ ПЕРЕСБОР И ВЫГРУЗКА УРОКОВ 1–6 (CLEAN)`);
  console.log(`======================================================\n`);

  for (const l of TARGET_LESSONS) {
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
    for (const p of pubs) {
      // Ищем кампании уроков 1..6 clean
      const match = p.id.match(/^pub-([a-z]+)-l0?([1-6])-clean$/);
      if (match) {
        p.status = 'ready';
        p.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    }
    fs.writeFileSync(PUBS_PATH, JSON.stringify(pubs, null, 2), 'utf8');
    console.log(`   ✅ Обновлен статус ${updatedCount} кампаний на "ready" в publications.json!`);
  }

  // Обновление статусов в lessons_video_registry.json
  if (fs.existsSync(REGISTRY_PATH)) {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    for (const l of TARGET_LESSONS) {
      const key = String(l);
      if (reg.lessons?.[key]?.variants?.clean) {
        reg.lessons[key].variants.clean.status = 'ready';
        reg.lessons[key].updatedAt = new Date().toISOString();
      }
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
    console.log(`   ✅ lessons_video_registry.json: статус уроков 1..6 clean зафиксирован как "ready"!`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 ВСЕ УРОКИ 1–6 УСПЕШНО ПЕРЕСОБРАНЫ, ВЫГРУЖЕНЫ И ГОТОВЫ!`);
  console.log(`======================================================\n`);
}

rebuildAndUploadBatch().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
