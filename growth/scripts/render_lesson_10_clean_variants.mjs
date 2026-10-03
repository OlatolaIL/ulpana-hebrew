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
const MASTER_CLEAN_VIDEO = path.join(LESSONS_DIR, 'lesson_10_clean_youtube_shorts.mp4');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');

const CLEAN_PLATFORMS = [
  {
    code: 'TG',
    channel: 'telegram',
    name: 'Telegram Channel',
    filename: 'lesson_10_clean_telegram.mp4',
    ctaLink: '👇 Ссылка на интерактивный тренажёр в посте!'
  },
  {
    code: 'INSTA',
    channel: 'instagram',
    name: 'Instagram Reels',
    filename: 'lesson_10_clean_instagram_reels.mp4',
    ctaLink: '👆 Ссылка на интерактивный тренажёр в шапке профиля!'
  },
  {
    code: 'TIKTOK',
    channel: 'tiktok',
    name: 'TikTok',
    filename: 'lesson_10_clean_tiktok.mp4',
    ctaLink: '🔗 Ссылка на интерактивный тренажёр в профиле!'
  },
  {
    code: 'FB',
    channel: 'facebook',
    name: 'Facebook Reels',
    filename: 'lesson_10_clean_facebook_reels.mp4',
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
          Отрабатывай живые диалоги в автобусе и такси с ИИ
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
            Урок 10: Транспорт и городская навигация
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
  console.log('🚀 СБОРКА ОСТАЛЬНЫХ 4 ПЛАТФОРМЕННЫХ РОЛИКОВ УРОКА 10 (CLEAN)');
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
    const target = path.join(ASSETS_DIR, `clean_card_05_cta_${p.code.toLowerCase()}.png`);
    await page.screenshot({ path: target, omitBackground: true });
    console.log(`   ✅ Сгенерирована карточка: ${path.basename(target)}`);
  }
  await browser.close();

  // 2. Сборка 4 видео
  console.log('\n🎬 [2/3] Рендер 4 платформенных видео (наложение CTA с 21.8с)...');
  const results = [];

  for (const p of CLEAN_PLATFORMS) {
    const outMp4 = path.join(LESSONS_DIR, p.filename);
    const cardPath = path.join(ASSETS_DIR, `clean_card_05_cta_${p.code.toLowerCase()}.png`);

    console.log(`  🎞️ Наложение оверлея [${p.code}] → ${p.filename}...`);
    const args = [
      '-y',
      '-i', MASTER_CLEAN_VIDEO,
      '-i', cardPath,
      '-filter_complex', "[1:v]format=yuva420p[cta];[0:v][cta]overlay=0:0:enable='gte(t,21.8)'[v]",
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-crf', '19',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'copy',
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

  // 3. Обновление реестров
  console.log('\n📝 [3/3] Обновление реестров lessons_video_registry.json и publications.json...');
  if (fs.existsSync(REGISTRY_PATH)) {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    if (!reg.lessons['10']) reg.lessons['10'] = { lessonNumber: 10, variants: {} };
    if (!reg.lessons['10'].variants.clean) reg.lessons['10'].variants.clean = { files: {} };
    for (const r of results) {
      reg.lessons['10'].variants.clean.files[r.code] = {
        path: `public/demo/lessons/${r.filename}`,
        promoCode: r.code,
        durationSec: 26.5,
        resolution: '1080x1920',
        fileSizeBytes: r.sizeBytes,
        generatedAt: new Date().toISOString()
      };
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
    console.log('   ✅ Обновлен lessons_video_registry.json');
  }

  if (fs.existsSync(PUBLICATIONS_PATH)) {
    const pubs = JSON.parse(fs.readFileSync(PUBLICATIONS_PATH, 'utf8'));
    let updated = 0;
    for (const r of results) {
      const pubId = `pub-${r.code.toLowerCase()}-l10-clean`;
      const idx = pubs.findIndex(p => p.id === pubId);
      if (idx !== -1) {
        pubs[idx].status = 'ready_for_upload';
        pubs[idx].updatedAt = new Date().toISOString();
        updated++;
      }
    }
    fs.writeFileSync(PUBLICATIONS_PATH, JSON.stringify(pubs, null, 2), 'utf8');
    console.log(`   ✅ Обновлено ${updated} публикаций в publications.json со статусом ready_for_upload`);
  }

  // 4. Синхронизация с TypeScript
  const syncScript = path.resolve(ROOT, 'scripts/sync_marketing_publications_ts.cjs');
  if (fs.existsSync(syncScript)) {
    console.log('   🔄 Автоматическая синхронизация с marketingPublicationsData.ts...');
    cp.spawnSync('node', [syncScript], { stdio: 'inherit' });
  }

  // 5. Загрузка в CDN
  console.log('\n🚀 Выгрузка 4 роликов на GitHub Releases CDN [v-media-lessons-02-05]...');
  const uploadScript = path.resolve(ROOT, 'growth/scripts/upload_release_assets.mjs');
  if (fs.existsSync(uploadScript)) {
    cp.spawnSync('node', [uploadScript, '--release-tag=v-media-lessons-02-05', '--filter=lesson_10_clean'], { stdio: 'inherit' });
  }

  console.log('\n======================================================');
  console.log('🎉 ВСЕ 4 ПЛАТФОРМЕННЫХ РОЛИКА УРОКА 10 (CLEAN) УСПЕШНО СОБРАНЫ И ВЫГРУЖЕНЫ!');
  console.log('======================================================\n');
}

renderCleanVariants().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
