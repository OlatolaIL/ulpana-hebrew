import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('./public/demo/frames');

export async function generateCtaImage(promoCode) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const bgImgBase64 = fs.existsSync(path.join(CACHE_DIR, 'bg_phone_39s.png'))
    ? `data:image/png;base64,${fs.readFileSync(path.join(CACHE_DIR, 'bg_phone_39s.png')).toString('base64')}`
    : '';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 390px;
        height: 844px;
        position: relative;
        overflow: hidden;
        background-color: #0f172a;
        background-image: url('${bgImgBase64}');
        background-size: cover;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #promo-cta-overlay {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="promo-cta-overlay">
      <div style="font-size: 42px; margin-bottom: 8px;">🏢 🔑</div>
      <div style="color: #60a5fa; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Урок 7 • Аренда квартиры</div>
      <div style="color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.25; margin-bottom: 16px;">Говори на иврите уверенно!</div>
      
      <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; padding: 14px 18px; width: 100%; max-width: 320px; margin-bottom: 20px; text-align: left;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">СЛОВАРЬ ЭТОГО УРОКА:</div>
        <div style="color: #f8fafc; font-size: 14px; line-height: 1.65;">
          🏠 <b style="direction: rtl; unicode-bidi: embed;">דִּירָה</b> [дирá] — квартира<br/>
          🚪 <b style="direction: rtl; unicode-bidi: embed;">שְׁלוֹשָׁה חֲדָרִים</b> — 3 комнаты<br/>
          🧊 <b style="direction: rtl; unicode-bidi: embed;">מְקָרֵר</b> [мэкарэ́р] — холодильник<br/>
          🛏️ <b style="direction: rtl; unicode-bidi: embed;">מִיטָּה</b> [митá] — кровать
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 14px; padding: 12px 20px; width: 100%; max-width: 320px; box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.5);">
        <div style="color: #bfdbfe; font-size: 12px; font-weight: 600;">ПРОМОКОД НА 30 ДНЕЙ ПРЕМИУМА:</div>
        <div id="promo-code-display" style="color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 2px 0;">${promoCode}</div>
        <div style="color: #93c5fd; font-size: 11px;">Ссылка на этот урок под видео 👇</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  const outPath = path.join(CACHE_DIR, `cta_${promoCode}.png`);
  await page.screenshot({ path: outPath });
  await browser.close();
  return outPath;
}

if (process.argv[1]?.endsWith('generate_cta.mjs')) {
  generateCtaImage('INSTA').then(p => console.log('Generated:', p));
}
