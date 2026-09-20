#!/usr/bin/env node
/**
 * render_promo_variants.mjs
 *
 * Генерирует 5 версий ролика с индивидуальной плашкой промокода в конце:
 * - Instagram Reels  (INSTA    • Ссылка в шапке профиля)
 * - TikTok           (TIKTOK   • Ссылка в шапке профиля)
 * - YouTube Shorts   (YOUTUBE  • Ссылка в описании видео)
 * - Facebook         (FB       • Ссылка в тексте поста)
 * - Telegram-канал   (TG       • Ссылка прямо в посте)
 *
 * Исходник: public/demo/reels_duolingo_vs_reality.mp4
 * Выход:    growth/output/reels_<platform>.mp4
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const SOURCE_VIDEO = path.resolve(ROOT, 'public/demo/reels_duolingo_vs_reality.mp4');
const OUTPUT_DIR = path.resolve(ROOT, 'growth/output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PLATFORMS = [
  {
    id: 'insta',
    label: 'Instagram Reels',
    code: 'INSTA',
    instruction: 'Ссылка в шапке профиля (bio)',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    code: 'TIKTOK',
    instruction: 'Ссылка в шапке профиля (bio)',
  },
  {
    id: 'youtube',
    label: 'YouTube Shorts',
    code: 'YOUTUBE',
    instruction: 'Ссылка в описании видео',
  },
  {
    id: 'fb',
    label: 'Facebook',
    code: 'FB',
    instruction: 'Ссылка в тексте поста',
  },
  {
    id: 'tg',
    label: 'Telegram-канал',
    code: 'TG',
    instruction: 'Ссылка прямо в посте',
  },
];

// Проверяем наличие системного шрифта Arial Bold на Windows
const winFont = 'C:/Windows/Fonts/arialbd.ttf';
const hasWinFont = fs.existsSync(winFont);
const fontClause = hasWinFont ? `fontfile='C\\:/Windows/Fonts/arialbd.ttf':` : '';

// Тайминг: финальный экран CTA появляется на 23.0s, плашка промокода активируется на 23.5s
const OVERLAY_START_SEC = '23.5';

function buildFilter(platform) {
  // 1. Плотная затемняющая подложка поверх старой надписи (y: 728..838)
  const bgBox = `drawbox=x=0:y=728:w=390:h=116:color=0x070e24@0.98:t=fill:enable='gte(t,${OVERLAY_START_SEC})'`;

  // 2. Внутренняя брендовая карточка
  const innerCard = `drawbox=x=16:y=734:w=358:h=96:color=0x152347@0.95:t=fill:enable='gte(t,${OVERLAY_START_SEC})'`;

  // 3. Строка 1: ПРОМОКОД (золотой крупный капс, двоеточие экранировано как \\: для FFmpeg)
  const promoText = `ПРОМОКОД\\: ${platform.code}`;
  const line1 = `drawtext=${fontClause}text='${promoText}':fontsize=18:fontcolor=0xFFD700:x=(w-text_w)/2:y=746:enable='gte(t,${OVERLAY_START_SEC})'`;

  // 4. Строка 2: Где ссылка (белый читаемый текст)
  const line2 = `drawtext=${fontClause}text='${platform.instruction}':fontsize=13:fontcolor=0xFFFFFF:x=(w-text_w)/2:y=774:enable='gte(t,${OVERLAY_START_SEC})'`;

  // 5. Строка 3: Домен платформы (голубой фирменный)
  const line3 = `drawtext=${fontClause}text='ulpana-hebrew.vercel.app':fontsize=11:fontcolor=0x60A5FA:x=(w-text_w)/2:y=798:enable='gte(t,${OVERLAY_START_SEC})'`;

  return [bgBox, innerCard, line1, line2, line3].join(',');
}

async function renderPlatform(platform) {
  const outputPath = path.resolve(OUTPUT_DIR, `reels_${platform.id}.mp4`);
  console.log(`\n🎬 Рендер [${platform.label}] (промокод: ${platform.code})...`);

  const filter = buildFilter(platform);

  const args = [
    '-y',
    '-i', SOURCE_VIDEO,
    '-vf', filter,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    '-movflags', '+faststart',
    outputPath,
  ];

  const res = cp.spawnSync(FFMPEG_PATH, args);
  if (res.status !== 0) {
    console.error(`❌ Ошибка FFmpeg для ${platform.id}:`, res.stderr.toString().slice(-800));
    throw new Error(`FFmpeg error on ${platform.id}`);
  }

  const stat = fs.statSync(outputPath);
  console.log(`✅ Готово: ${outputPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  return outputPath;
}

async function main() {
  if (!fs.existsSync(SOURCE_VIDEO)) {
    console.error(`❌ Исходный файл не найден: ${SOURCE_VIDEO}`);
    process.exit(1);
  }

  console.log(`🚀 Старт генерации 5 вариантов промо-видео (Wolt курьер)...`);
  console.log(`📁 Исходник: ${SOURCE_VIDEO}`);
  console.log(`🎬 FFmpeg:   ${FFMPEG_PATH}`);
  console.log(`🔤 Шрифт:    ${hasWinFont ? winFont : 'System default'}`);

  const results = [];
  for (const platform of PLATFORMS) {
    const file = await renderPlatform(platform);
    results.push({ platform: platform.label, code: platform.code, file });
  }

  console.log('\n' + '═'.repeat(65));
  console.log('🎉 ВСЕ 5 ВЕРСИЙ ВИДЕО УСПЕШНО СГЕНЕРИРОВАНЫ!');
  console.log('═'.repeat(65));
  results.forEach((r) => {
    console.log(`📱 ${r.platform.padEnd(20)} | Промокод: ${r.code.padEnd(8)} | Файл: ${r.file}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
