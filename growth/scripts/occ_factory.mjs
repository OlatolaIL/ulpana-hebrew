/**
 * ==============================================================================
 * OpenChatCut Video Factory Engine («Ульпан Алеф»)
 * ==============================================================================
 * Полный конвейер производства вертикальных видео (1080x1920 @ 30fps)
 * с живыми фотографиями персонажей (Ken Burns + Zero Shake),
 * юмористическими стоп-кадрами, валидацией כתיב מלא и одушевлённости (Animacy),
 * NLE-монтажом в OpenChatCut и пакетным выводом для 5 платформ (YT, TG, INSTA, TIKTOK, FB).
 *
 * Использование:
 *   node growth/scripts/occ_factory.mjs --lesson 10 --spicy --all
 *   node growth/scripts/occ_factory.mjs --lesson 10 --spicy --step broll
 *   node growth/scripts/occ_factory.mjs --lesson 10 --spicy --step overlays
 *   node growth/scripts/occ_factory.mjs --lesson 10 --spicy --step variants
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { PLATFORMS, generateAllOverlays } from './generate_occ_overlays.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const LESSONS_DIR = path.resolve(DEMO_DIR, 'lessons');
const ASSETS_DIR = path.resolve(DEMO_DIR, 'openchatcut_assets');
const CHARACTERS_REGISTRY_PATH = path.resolve(ROOT, 'growth/characters/registry.json');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const OCC_MEDIA_DIR = 'C:\\Users\\azrie\\.codex\\Ulpana2\\tools\\openchatcut-local\\media\\lesson_10_spicy';

export async function runOccFactoryPipeline(options = {}) {
  const lesson = options.lesson || 10;
  const variant = options.variant || 'spicy';
  const step = options.step || 'all';

  console.log('\n================================================================');
  console.log(`🎬 OPENCHATCUT VIDEO FACTORY: УРОК ${lesson} (${variant.toUpperCase()})`);
  console.log(`Режим выполнения: [${step.toUpperCase()}]`);
  console.log('================================================================\n');

  // Шаг 1: Проверка персонажей в Character Bible
  if (fs.existsSync(CHARACTERS_REGISTRY_PATH)) {
    const charRegistry = JSON.parse(fs.readFileSync(CHARACTERS_REGISTRY_PATH, 'utf8'));
    console.log(`📖 [Character Bible] Загружен реестр персонажей (${charRegistry.characters.length} персонажей)`);
    const activeChar = charRegistry.characters.find(c => c.id === 'yossi_taxi');
    if (activeChar) {
      console.log(`   Актер сцены: ${activeChar.name} (${activeChar.nameHebrew}) — ${activeChar.role}`);
      console.log(`   Голос: Gemini TTS ${activeChar.voice.preset}`);
    }
  }

  // Шаг 2: Генерация B-Roll с живыми фотографиями (Ken Burns + Zero Shake)
  if (step === 'all' || step === 'broll') {
    console.log('\n📸 [ШАГ 1] Генерация динамических B-Roll (Живые фото, Ken Burns)...');
    cp.spawnSync('node', ['growth/scripts/create_dynamic_broll.mjs'], { stdio: 'inherit', cwd: ROOT });
  }

  // Шаг 3: Генерация прозрачных оверлейных карточек с проверкой одушевленности и промокодами
  if (step === 'all' || step === 'overlays') {
    console.log('\n🎨 [ШАГ 2] Генерация 1080x1920 карточек (диалоги + Animacy Check + 5 CTA)...');
    await generateAllOverlays();
  }

  // Шаг 4: Сборка платформенных вариантов (YT, TG, INSTA, TIKTOK, FB)
  if (step === 'all' || step === 'variants') {
    console.log('\n🚀 [ШАГ 3] Пакетная сборка 5 видеороликов для всех платформ...');
    cp.spawnSync('node', ['growth/scripts/render_occ_variants.mjs'], { stdio: 'inherit', cwd: ROOT });
  }

  console.log('\n================================================================');
  console.log(`✅ [УРОК ${lesson}] КОНВЕЙЕР УСПЕШНО ЗАВЕРШЕН!`);
  console.log(`📂 Готовые видео размещены в: public/demo/lessons/`);
  console.log('================================================================\n');
}

// Запуск из CLI
const args = process.argv.slice(2);
if (process.argv[1] && process.argv[1].endsWith('occ_factory.mjs')) {
  let lesson = 10;
  let variant = 'spicy';
  let step = 'all';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lesson' && args[i + 1]) lesson = parseInt(args[++i], 10);
    if (args[i] === '--variant' && args[i + 1]) variant = args[++i];
    if (args[i] === '--step' && args[i + 1]) step = args[++i];
  }

  runOccFactoryPipeline({ lesson, variant, step }).catch(err => {
    console.error('❌ Ошибка конвейера видеофабрики:', err);
    process.exit(1);
  });
}
