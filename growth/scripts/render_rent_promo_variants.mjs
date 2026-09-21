#!/usr/bin/env node
/**
 * render_rent_promo_variants.mjs
 *
 * Генерирует 5 версий ролика «חוֹזֶה vs חָזֶה» с индивидуальной плашкой промокода в конце:
 * - Instagram Reels  (INSTA    • Ссылка в шапке профиля)
 * - TikTok           (TIKTOK   • Ссылка в шапке профиля)
 * - YouTube Shorts   (YOUTUBE  • Ссылка в описании видео)
 * - Facebook         (FB       • Ссылка в тексте поста)
 * - Telegram-канал   (TG       • Ссылка прямо в посте)
 *
 * Исходник: public/demo/reels_rent_contract.mp4
 * Выход:    growth/output/reels_rent_<platform>.mp4
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
const SOURCE_VIDEO = path.resolve(ROOT, 'public/demo/reels_rent_contract.mp4');
const OUTPUT_DIR = path.resolve(ROOT, 'growth/output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PLATFORMS = [
  {
    id: 'youtube',
    label: 'YouTube Shorts',
    code: 'YOUTUBE',
    instruction: 'Ссылка в описании видео',
  },
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

// Системный шрифт Arial Bold на Windows
const winFont = 'C:/Windows/Fonts/arialbd.ttf';
const hasWinFont = fs.existsSync(winFont);
const fontClause = hasWinFont ? `fontfile='C\\:/Windows/Fonts/arialbd.ttf':` : '';

function getVideoDuration(videoPath) {
  try {
    const res = cp.spawnSync(FFMPEG_PATH, ['-i', videoPath]);
    const match = res.stderr.toString().match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const mins = parseFloat(match[2]);
      const secs = parseFloat(match[3]);
      return hours * 3600 + mins * 60 + secs;
    }
  } catch (err) {
    console.error('Error getting duration via ffmpeg:', err);
  }
  return 27.8;
}

function buildFilter(platform, overlayStartSec) {
  // 1. Подложка поверх нижней зоны сплэш-экрана (y: 710..830)
  const bgBox = `drawbox=x=0:y=710:w=390:h=126:color=0x070e24@0.98:t=fill:enable='gte(t,${overlayStartSec})'`;

  // 2. Внутренняя карточка с золотой рамкой
  const innerCard = `drawbox=x=14:y=718:w=362:h=108:color=0x152347@0.95:t=fill:enable='gte(t,${overlayStartSec})'`;

  // 3. Строка 1: ПРОМОКОД
  const promoText = `ПРОМОКОД\\: ${platform.code}`;
  const line1 = `drawtext=${fontClause}text='${promoText}':fontsize=18:fontcolor=0xFFD700:x=(w-text_w)/2:y=730:enable='gte(t,${overlayStartSec})'`;

  // 4. Строка 2: Инструкция
  const line2 = `drawtext=${fontClause}text='${platform.instruction}':fontsize=13:fontcolor=0xFFFFFF:x=(w-text_w)/2:y=758:enable='gte(t,${overlayStartSec})'`;

  // 5. Строка 3: Домен платформы
  const line3 = `drawtext=${fontClause}text='ulpana-hebrew.vercel.app':fontsize=11:fontcolor=0x60A5FA:x=(w-text_w)/2:y=782:enable='gte(t,${overlayStartSec})'`;

  return [bgBox, innerCard, line1, line2, line3].join(',');
}

async function renderPlatform(platform, overlayStartSec) {
  const outputPath = path.resolve(OUTPUT_DIR, `reels_rent_${platform.id}.mp4`);
  console.log(`\n🎬 Рендер [${platform.label}] (промокод: ${platform.code})...`);

  const filter = buildFilter(platform, overlayStartSec);

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

  const duration = getVideoDuration(SOURCE_VIDEO);
  const timingsPath = path.resolve(ROOT, 'public/demo/scene_timings.json');
  let overlayStartSec = '19.6';
  if (fs.existsSync(timingsPath)) {
    try {
      const timings = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));
      if (timings.tOutro) {
        overlayStartSec = (timings.tOutro / 1000).toFixed(1);
      }
    } catch (e) {
      console.warn('Could not parse scene_timings.json:', e.message);
    }
  }

  console.log(`🚀 Старт генерации 5 вариантов видео «חוֹזֶה vs חָזֶה»...`);
  console.log(`📁 Исходник: ${SOURCE_VIDEO} (длительность: ${duration.toFixed(1)}s, плашка с: ${overlayStartSec}s)`);
  console.log(`🎬 FFmpeg:   ${FFMPEG_PATH}`);

  const results = [];
  for (const platform of PLATFORMS) {
    const file = await renderPlatform(platform, overlayStartSec);
    results.push({ platform: platform.label, code: platform.code, file });
  }

  console.log('\n' + '═'.repeat(65));
  console.log('🎉 ВСЕ 5 ВЕРСИЙ ВИДЕО ДЛЯ КАНАЛОВ УСПЕШНО СГЕНЕРИРОВАНЫ!');
  console.log('═'.repeat(65));
  results.forEach((r) => {
    console.log(`📱 ${r.platform.padEnd(20)} | Промокод: ${r.code.padEnd(8)} | Файл: ${r.file}`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Ошибка рендера промо-вариантов:', err);
    process.exit(1);
  });
}
