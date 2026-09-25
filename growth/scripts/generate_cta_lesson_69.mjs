import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('./public/demo/frames');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const PLATFORM_SUBTITLES = {
  YT: 'Ссылка на Урок 69 в описании видео 👇',
  TG: 'Кнопка перехода в канале @ulpana_il 👇',
  INSTA: 'Ссылка на Урок 69 в шапке профиля (био) 👆',
  TIKTOK: 'Ссылка на тренажёр в шапке профиля 🔗',
  FB: 'Ссылка на Урок 69 под видео 👇',
};

export async function generateCtaImageLesson69(promoCode) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, // Retina 2x для четкого 780x1688
  });
  const page = await context.newPage();

  const subtitle = PLATFORM_SUBTITLES[promoCode] || 'Ссылка на этот урок под видео 👇';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@700;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 390px;
        height: 844px;
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at 50% 20%, #1e3a8a 0%, #060913 100%);
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      #promo-cta-overlay {
        position: absolute;
        inset: 0;
        background: rgba(6, 11, 24, 0.96);
        backdrop-filter: blur(12px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
      }
      .logo-icon {
        width: 68px;
        height: 68px;
        border-radius: 20px;
        background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 38px;
        color: #fff;
        box-shadow: 0 0 35px rgba(56, 189, 248, 0.6);
        margin-bottom: 12px;
      }
      .badge-tag {
        color: #38bdf8;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 6px;
      }
      .main-title {
        color: #ffffff;
        font-size: 24px;
        font-weight: 900;
        line-height: 1.25;
        margin-bottom: 16px;
      }
      .vocab-box {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 14px 18px;
        width: 100%;
        max-width: 320px;
        margin-bottom: 20px;
        text-align: left;
      }
      .vocab-header {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 800;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }
      .vocab-content {
        color: #f8fafc;
        font-size: 14px;
        line-height: 1.7;
      }
      .he-bold {
        font-family: 'Heebo', sans-serif;
        color: #38bdf8;
        font-weight: 900;
        direction: rtl;
        unicode-bidi: embed;
      }
      .promo-card {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        border: 2px solid #38bdf8;
        border-radius: 16px;
        padding: 14px 20px;
        width: 100%;
        max-width: 320px;
        box-shadow: 0 10px 30px -5px rgba(2, 132, 199, 0.6);
      }
      .promo-label {
        color: #e0f2fe;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .promo-code {
        color: #ffffff;
        font-size: 32px;
        font-weight: 900;
        letter-spacing: 3px;
        margin: 4px 0;
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
      }
      .promo-sub {
        color: #bae6fd;
        font-size: 12px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div id="promo-cta-overlay">
      <div class="logo-icon">א</div>
      <div class="badge-tag">УРОК 69 • СЛИТНЫЕ ПРЕДЛОГИ עַל</div>
      <div class="main-title">Говори на иврите уверенно!</div>
      
      <div class="vocab-box">
        <div class="vocab-header">КЛЮЧЕВЫЕ ФРАЗЫ УРОКА:</div>
        <div class="vocab-content">
          ☕ <b class="he-bold">עָלַי</b> [алáй] — за меня / на мне<br/>
          🤝 <b class="he-bold">!זֶה עָלַי</b> — Я угощаю!<br/>
          🎯 <b class="he-bold">!בַּפַּעַם הַבָּאָה עָלַי</b> — В следующий раз за мной!
        </div>
      </div>

      <div class="promo-card">
        <div class="promo-label">30 ДНЕЙ БЕСПЛАТНОГО ДОСТУПА:</div>
        <div class="promo-code">${promoCode}</div>
        <div class="promo-sub">${subtitle}</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  // Ждём шрифты
  await page.evaluate(() => document.fonts.ready);
  const outPath = path.join(CACHE_DIR, `cta_l69_${promoCode}.png`);
  await page.screenshot({ path: outPath });
  await browser.close();
  return outPath;
}

if (process.argv[1]?.endsWith('generate_cta_lesson_69.mjs')) {
  generateCtaImageLesson69('TG').then((p) => console.log('Generated:', p));
}
