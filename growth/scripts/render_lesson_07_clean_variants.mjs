import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const DEMO_DIR = path.resolve(ROOT, 'public/demo');
const LESSONS_DIR = path.resolve(DEMO_DIR, 'lessons');
const ASSETS_DIR = path.resolve(DEMO_DIR, 'openchatcut_assets');
const MASTER_CLEAN_VIDEO = path.join(LESSONS_DIR, 'lesson_07_clean_youtube_shorts.mp4');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');

const CLEAN_PLATFORMS = [
  {
    code: 'TG',
    channel: 'telegram',
    name: 'Telegram Channel',
    filename: 'lesson_07_clean_telegram.mp4',
    ctaLink: '👇 Ссылка на интерактивный тренажёр в посте!'
  },
  {
    code: 'INSTA',
    channel: 'instagram',
    name: 'Instagram Reels',
    filename: 'lesson_07_clean_instagram_reels.mp4',
    ctaLink: '👆 Ссылка на интерактивный тренажёр в шапке профиля!'
  },
  {
    code: 'TIKTOK',
    channel: 'tiktok',
    name: 'TikTok',
    filename: 'lesson_07_clean_tiktok.mp4',
    ctaLink: '🔗 Ссылка на интерактивный тренажёр в профиле!'
  },
  {
    code: 'FB',
    channel: 'facebook',
    name: 'Facebook Reels',
    filename: 'lesson_07_clean_facebook_reels.mp4',
    ctaLink: '👇 Ссылка на интерактивный тренажёр в комментариях!'
  }
];

function getCtaHtml(promoCode, ctaLink) {
  return `
    <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:3px solid #38BDF8;border-radius:44px;padding:60px 50px;box-shadow:0 30px 90px rgba(0,0,0,0.85);text-align:center;width:100%;max-width:920px;box-sizing:border-box;">
        <!-- Logo & Brand -->
        <div style="display:inline-flex;align-items:center;gap:16px;background:rgba(56,189,248,0.15);padding:14px 32px;border-radius:999px;border:1px solid rgba(56,189,248,0.3);margin-bottom:28px;">
          <span style="font-family:'Segoe UI Hebrew',Rubik,sans-serif;font-size:36px;font-weight:900;color:#38BDF8;">א</span>
          <span style="color:#FFFFFF;font-size:26px;font-weight:800;letter-spacing:1px;">УЛЬПАН АЛЕФ</span>
        </div>

        <!-- Big Title -->
        <div style="color:#FFFFFF;font-size:52px;font-weight:900;line-height:1.2;margin-bottom:16px;">
          Иврит без паники<br/>в реальном Израиле
        </div>

        <!-- Subtitle -->
        <div style="color:#94A3B8;font-size:26px;font-weight:600;margin-bottom:36px;">
          Отрабатывай живые ситуации в магазинах и ТЦ с ИИ
        </div>

        <!-- Promo Box -->
        <div style="background:linear-gradient(135deg,#0284C7,#0369A1);border-radius:28px;padding:32px;margin-bottom:36px;box-shadow:0 16px 40px rgba(2,132,199,0.4);">
          <div style="color:#BAE6FD;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">
            🎁 30 ДНЕЙ БЕСПЛАТНОГО ДОСТУПА
          </div>
          <div style="display:inline-block;background:#FFFFFF;color:#0F172A;font-size:42px;font-weight:900;padding:10px 40px;border-radius:18px;letter-spacing:3px;margin:12px 0;">
            ПРОМОКОД: ${promoCode}
          </div>
          <div style="color:#E0F2FE;font-size:22px;font-weight:600;">
            Урок 7: Дом, город и навигация
          </div>
        </div>

        <!-- Link CTA -->
        <div style="color:#38BDF8;font-size:28px;font-weight:800;">
          ${ctaLink}
        </div>
      </div>
    </div>
  `;
}

async function renderCleanVariants() {
  console.log('\n======================================================');
  console.log('🚀 СБОРКА ОСТАЛЬНЫХ 4 ПЛАТФОРМЕННЫХ РОЛИКОВ УРОКА 7 (CLEAN)');
  console.log('======================================================\n');

  if (!fs.existsSync(MASTER_CLEAN_VIDEO)) {
    throw new Error(`Мастер-видео Clean не найдено: ${MASTER_CLEAN_VIDEO}`);
  }

  // 1. Генерация 4 CTA карточек
  console.log('🎨 [1/3] Генерация 4 CTA-карточек для TG, INSTA, TIKTOK, FB...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

  for (const p of CLEAN_PLATFORMS) {
    const cardHtml = getCtaHtml(p.code, p.ctaLink);
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">${cardHtml}</body></html>`);
    const target = path.join(ASSETS_DIR, `l07_clean_card_06_cta_${p.code.toLowerCase()}.png`);
    await page.screenshot({ path: target, omitBackground: true });
    console.log(`   ✅ Сгенерирована карточка: ${path.basename(target)}`);
  }
  await browser.close();

  // 2. Сборка 4 видео
  console.log('\n🎬 [2/3] Рендер 4 платформенных видео (наложение CTA с 18.3с)...');
  const results = [];

  for (const p of CLEAN_PLATFORMS) {
    const outMp4 = path.join(LESSONS_DIR, p.filename);
    const cardPath = path.join(ASSETS_DIR, `l07_clean_card_06_cta_${p.code.toLowerCase()}.png`);

    console.log(`  🎞️ Наложение оверлея [${p.code}] → ${p.filename}...`);
    const args = [
      '-y',
      '-i', MASTER_CLEAN_VIDEO,
      '-loop', '1',
      '-i', cardPath,
      '-filter_complex', "[0:v][1:v]overlay=0:0:enable='gte(t,18.3)'[v]",
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-crf', '19',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'copy',
      '-t', '23.3',
      outMp4
    ];

    const res = cp.spawnSync(ffmpeg, args);
    if (res.status !== 0) {
      throw new Error(`Ошибка FFmpeg при сборке ${p.filename}: ${res.stderr?.toString()}`);
    }

    const stat = fs.statSync(outMp4);
    console.log(`  ✅ [${p.code}] Готово: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
    results.push({
      code: p.code,
      channel: p.channel,
      filename: p.filename,
      sizeBytes: stat.size
    });
  }

  // 3. Обновление lessons_video_registry.json
  console.log('\n📝 [3/3] Обновление реестра lessons_video_registry.json...');
  if (fs.existsSync(REGISTRY_PATH)) {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    if (!reg.lessons['7']) reg.lessons['7'] = { lessonNumber: 7, variants: {} };
    if (!reg.lessons['7'].variants.clean) reg.lessons['7'].variants.clean = { files: {} };
    for (const r of results) {
      reg.lessons['7'].variants.clean.files[r.code] = {
        path: `public/demo/lessons/${r.filename}`,
        promoCode: r.code,
        durationSec: 23.3,
        resolution: '1080x1920',
        fileSizeBytes: r.sizeBytes,
        generatedAt: new Date().toISOString()
      };
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
    console.log('   ✅ Обновлен lessons_video_registry.json');
  }

  console.log('\n======================================================');
  console.log('✨ ВСЕ 4 ПЛАТФОРМЕННЫХ РОЛИКА УРОКА 7 CLEAN УСПЕШНО СОБРАНЫ!');
  console.log('======================================================\n');
}

renderCleanVariants().catch(err => {
  console.error('❌ Ошибка сборки вариантов:', err);
  process.exit(1);
});
