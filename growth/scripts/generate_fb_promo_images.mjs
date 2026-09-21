import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const OUTPUT_DIR = path.resolve('./growth/output/facebook_promo');
const ARTIFACT_DIR = path.resolve('C:/Users/azrie/.gemini/antigravity/brain/0dcde5b9-4868-4703-8ee4-2238819e41a6');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getBase64Image(filePath) {
  const bitmap = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${bitmap.toString('base64')}`;
}

const woltFrame = getBase64Image(path.resolve('./growth/output/frames_inspect/wolt_21.5s.jpg'));
const rentFrame = getBase64Image(path.resolve('./growth/output/frames_inspect/rent_5.5s.jpg'));

async function renderCard(browser, htmlContent, width, height, filename) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1
  });
  await page.setContent(htmlContent, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  
  const outPath = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: outPath, type: 'png' });
  
  // Копируем также в каталог артефактов для мгновенного просмотра пользователем
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  fs.copyFileSync(outPath, artifactPath);
  
  await page.close();
  console.log(`✅ Сгенерировано: ${filename} (${width}x${height})`);
}

async function main() {
  console.log('🚀 Генерация идеальных промо-баннеров для Facebook...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  // -------------------------------------------------------------
  // КАРТОЧКА 1: Звонок курьера Wolt (1080x1350)
  // -------------------------------------------------------------
  const card1Html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1350px;
    background: radial-gradient(circle at 50% 12%, #1e293b 0%, #090d16 65%, #030712 100%);
    font-family: 'Rubik', sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 44px 48px;
    overflow: hidden;
    position: relative;
  }
  
  .top-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }
  .brand-chip {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(30, 41, 59, 0.9);
    border: 2px solid rgba(59, 130, 246, 0.5);
    padding: 10px 22px;
    border-radius: 999px;
  }
  .brand-logo {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 800;
  }
  .geo-chip {
    background: rgba(16, 185, 129, 0.15);
    border: 2px solid #10b981;
    color: #34d399;
    padding: 10px 22px;
    border-radius: 999px;
    font-size: 20px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .headline-box {
    text-align: center;
    margin-bottom: 24px;
  }
  .headline {
    font-family: 'Montserrat', sans-serif;
    font-size: 44px;
    font-weight: 900;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin-bottom: 10px;
  }
  .headline span.accent {
    color: #facc15;
    text-shadow: 0 0 25px rgba(250, 204, 21, 0.4);
  }
  .sub-headline {
    font-size: 23px;
    color: #cbd5e1;
    font-weight: 500;
  }

  .center-preview-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    margin-bottom: 24px;
  }
  .phone-frame {
    width: 440px;
    height: 730px;
    background: #000;
    border-radius: 40px;
    border: 5px solid #334155;
    box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.25);
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .phone-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .feature-bullets {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .bullet-item {
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 20px 24px;
    display: flex;
    gap: 18px;
    align-items: flex-start;
  }
  .bullet-icon {
    font-size: 34px;
    line-height: 1;
  }
  .bullet-text h4 {
    font-size: 23px;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 6px;
  }
  .bullet-text p {
    font-size: 19px;
    color: #94a3b8;
    line-height: 1.35;
  }

  .promo-banner {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
    border: 3px solid #60a5fa;
    border-radius: 26px;
    padding: 22px 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 15px 40px rgba(37, 99, 235, 0.4);
  }
  .promo-left h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 25px;
    font-weight: 900;
    color: #facc15;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .promo-left p {
    font-size: 19px;
    color: #e0f2fe;
    font-weight: 600;
  }
  .promo-code-box {
    background: #0f172a;
    border: 3px dashed #facc15;
    border-radius: 18px;
    padding: 12px 28px;
    text-align: center;
  }
  .promo-label {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }
  .promo-code {
    font-family: 'Montserrat', sans-serif;
    font-size: 32px;
    font-weight: 900;
    color: #facc15;
    letter-spacing: 1.5px;
  }
</style>
</head>
<body>
  <div class="top-badge-row">
    <div class="brand-chip">
      <div class="brand-logo">א</div>
      <div class="brand-name">Ульпан Алеф</div>
    </div>
    <div class="geo-chip">
      <span>📍</span> Онлайн / Любой город Израиля
    </div>
  </div>

  <div class="headline-box">
    <h1 class="headline">Хватит бояться <span class="accent">звонков на иврите!</span></h1>
    <p class="sub-headline">Интерактивный симулятор реальных разговоров в Израиле</p>
  </div>

  <div class="center-preview-wrap">
    <div class="phone-frame">
      <img src="${woltFrame}" alt="Тренажер звонка">
    </div>
    <div class="feature-bullets">
      <div class="bullet-item">
        <div class="bullet-icon">🛵</div>
        <div class="bullet-text">
          <h4>Звонок курьера Wolt</h4>
          <p>Учись отвечать курьеру быстро и уверенно в реальном времени.</p>
        </div>
      </div>
      <div class="bullet-item">
        <div class="bullet-icon">🎙️</div>
        <div class="bullet-text">
          <h4>Говоришь голосом</h4>
          <p>Умный собеседник слушает без спешки и мгновенно разбирает слова.</p>
        </div>
      </div>
      <div class="bullet-item">
        <div class="bullet-icon">🎯</div>
        <div class="bullet-text">
          <h4>Точность 98%</h4>
          <p>Оценка произношения, подсветка ошибок и подсказка нужных фраз.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="promo-banner">
    <div class="promo-left">
      <h3>🎁 Открытый тест — сейчас всё бесплатно!</h3>
      <p>+30 дней премиума в подарок по промокоду:</p>
    </div>
    <div class="promo-code-box">
      <div class="promo-label">Промокод</div>
      <div class="promo-code">FB_RI_TRIAL</div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, card1Html, 1080, 1350, 'promo_wolt_call_1080x1350.png');

  // -------------------------------------------------------------
  // КАРТОЧКА 2: Конфуз с арендой (חוזה vs חזה) + тренажер быта (1080x1350)
  // -------------------------------------------------------------
  const card2Html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1350px;
    background: radial-gradient(circle at 50% 12%, #1e1b4b 0%, #0b0f19 70%, #030712 100%);
    font-family: 'Rubik', sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 44px 48px;
    overflow: hidden;
  }
  
  .top-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }
  .brand-chip {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(30, 41, 59, 0.9);
    border: 2px solid rgba(139, 92, 246, 0.5);
    padding: 10px 22px;
    border-radius: 999px;
  }
  .brand-logo {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 800;
  }
  .geo-chip {
    background: rgba(16, 185, 129, 0.15);
    border: 2px solid #10b981;
    color: #34d399;
    padding: 10px 22px;
    border-radius: 999px;
    font-size: 20px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .headline-box {
    text-align: center;
    margin-bottom: 24px;
  }
  .headline {
    font-family: 'Montserrat', sans-serif;
    font-size: 44px;
    font-weight: 900;
    line-height: 1.22;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin-bottom: 10px;
  }
  .headline span.red { color: #f87171; }
  .headline span.green { color: #4ade80; }
  .sub-headline {
    font-size: 23px;
    color: #cbd5e1;
    font-weight: 500;
  }

  .center-preview-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 32px;
    margin-bottom: 24px;
  }
  .phone-frame {
    width: 440px;
    height: 730px;
    background: #000;
    border-radius: 40px;
    border: 5px solid #334155;
    box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139, 92, 246, 0.25);
    overflow: hidden;
  }
  .phone-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .situations-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .sit-item {
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 18px 22px;
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .sit-icon {
    font-size: 36px;
  }
  .sit-info h4 {
    font-size: 22px;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 4px;
  }
  .sit-info p {
    font-size: 18px;
    color: #94a3b8;
  }

  .promo-banner {
    background: linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #312e81 100%);
    border: 3px solid #818cf8;
    border-radius: 26px;
    padding: 22px 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 15px 40px rgba(99, 102, 241, 0.35);
  }
  .promo-left h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 25px;
    font-weight: 900;
    color: #facc15;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .promo-left p {
    font-size: 19px;
    color: #e0e7ff;
    font-weight: 600;
  }
  .promo-code-box {
    background: #0f172a;
    border: 3px dashed #facc15;
    border-radius: 18px;
    padding: 12px 28px;
    text-align: center;
  }
  .promo-label {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }
  .promo-code {
    font-family: 'Montserrat', sans-serif;
    font-size: 32px;
    font-weight: 900;
    color: #facc15;
    letter-spacing: 1.5px;
  }
</style>
</head>
<body>
  <div class="top-badge-row">
    <div class="brand-chip">
      <div class="brand-logo">א</div>
      <div class="brand-name">Ульпан Алеф</div>
    </div>
    <div class="geo-chip">
      <span>📍</span> Онлайн / Любой город Израиля
    </div>
  </div>

  <div class="headline-box">
    <h1 class="headline">Чтобы не перепутать <span class="green">חוֹזֶה</span> и <span class="red">חָזֶה</span>! 😅</h1>
    <p class="sub-headline">Отрабатывай реальные израильские ситуации в тренажёре</p>
  </div>

  <div class="center-preview-wrap">
    <div class="phone-frame">
      <img src="${rentFrame}" alt="Конфуз года">
    </div>
    <div class="situations-list">
      <div class="sit-item">
        <div class="sit-icon">🔑</div>
        <div class="sit-info">
          <h4>Аренда квартиры</h4>
          <p>Переговоры с хозяином жилья и договор аренды</p>
        </div>
      </div>
      <div class="sit-item">
        <div class="sit-icon">🏥</div>
        <div class="sit-info">
          <h4>Поликлиника (Клалит / Маккаби)</h4>
          <p>Запись к врачу, рецепты и симптомы</p>
        </div>
      </div>
      <div class="sit-item">
        <div class="sit-icon">🏦</div>
        <div class="sit-info">
          <h4>Банк и почта</h4>
          <p>Очереди, карточки и решение бытовых вопросов</p>
        </div>
      </div>
      <div class="sit-item">
        <div class="sit-icon">☕</div>
        <div class="sit-info">
          <h4>Кафе и рынок</h4>
          <p>Живой израильский сленг и заказ еды</p>
        </div>
      </div>
    </div>
  </div>

  <div class="promo-banner">
    <div class="promo-left">
      <h3>🎁 Сейчас тестирование — всё бесплатно!</h3>
      <p>+30 дней доступа в подарок по промокоду:</p>
    </div>
    <div class="promo-code-box">
      <div class="promo-label">Промокод</div>
      <div class="promo-code">FB_RI_TRIAL</div>
    </div>
  </div>
</body>
</html>`;

  await renderCard(browser, card2Html, 1080, 1350, 'promo_rent_confuse_1080x1350.png');

  // -------------------------------------------------------------
  // КАРТОЧКА 3: Квадратная визитка-постер для Facebook (1080x1080)
  // -------------------------------------------------------------
  const card3Html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Rubik:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1080px;
    background: radial-gradient(circle at 50% 18%, #172554 0%, #090d16 65%, #020617 100%);
    font-family: 'Rubik', sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 44px 48px;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
  }
  .brand-title {
    font-size: 30px;
    font-weight: 900;
  }
  .brand-subtitle {
    font-size: 16px;
    color: #94a3b8;
    font-weight: 600;
  }
  .free-badge {
    background: #10b981;
    color: #fff;
    padding: 10px 24px;
    border-radius: 999px;
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  .main-title-box {
    text-align: center;
    margin: 6px 0;
  }
  .main-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 46px;
    font-weight: 900;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  .main-title span.yellow {
    color: #facc15;
  }
  .main-desc {
    font-size: 23px;
    color: #cbd5e1;
    font-weight: 500;
  }

  .grid-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin: 6px 0;
  }
  .feature-card {
    background: rgba(15, 23, 42, 0.85);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 18px 22px;
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .feat-icon {
    font-size: 36px;
  }
  .feat-text h4 {
    font-size: 21px;
    font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 4px;
  }
  .feat-text p {
    font-size: 16px;
    color: #94a3b8;
  }

  .bottom-promo-card {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    border: 3px solid #60a5fa;
    border-radius: 24px;
    padding: 20px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .promo-text-group h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #facc15;
    margin-bottom: 4px;
  }
  .promo-text-group p {
    font-size: 18px;
    color: #e2e8f0;
    font-weight: 600;
  }
  .promo-btn-wrap {
    background: #0f172a;
    border: 3px dashed #facc15;
    border-radius: 16px;
    padding: 10px 24px;
    text-align: center;
  }
  .code-title {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 800;
    text-transform: uppercase;
  }
  .code-val {
    font-family: 'Montserrat', sans-serif;
    font-size: 28px;
    font-weight: 900;
    color: #facc15;
    letter-spacing: 1px;
  }
  .link-footer {
    text-align: center;
    font-size: 17px;
    color: #94a3b8;
    font-weight: 600;
  }
</style>
</head>
<body>
  <div class="header-row">
    <div class="brand">
      <div class="brand-icon">א</div>
      <div>
        <div class="brand-title">Ульпан Алеф</div>
        <div class="brand-subtitle">Тренажёр выживания и живой речи в Израиле</div>
      </div>
    </div>
    <div class="free-badge">100% Бесплатно</div>
  </div>

  <div class="main-title-box">
    <h1 class="main-title">Учишь иврит? <span class="yellow">Заговори вслух!</span></h1>
    <p class="main-desc">Практикуйся прямо в браузере с телефона или компьютера</p>
  </div>

  <div class="grid-features">
    <div class="feature-card">
      <div class="feat-icon">📞</div>
      <div class="feat-text">
        <h4>Симулятор звонков</h4>
        <p>Курьер, поликлиника, банк, школа</p>
      </div>
    </div>
    <div class="feature-card">
      <div class="feat-icon">🗣️</div>
      <div class="feat-text">
        <h4>Оценка произношения</h4>
        <p>Умный собеседник разбирает слова</p>
      </div>
    </div>
    <div class="feature-card">
      <div class="feat-icon">🎧</div>
      <div class="feat-text">
        <h4>Слуховой комплекс</h4>
        <p>Учимся понимать беглую речь на слух</p>
      </div>
    </div>
    <div class="feature-card">
      <div class="feat-icon">☕</div>
      <div class="feat-text">
        <h4>Современный иврит</h4>
        <p>Живые фразы без пыльной теории</p>
      </div>
    </div>
  </div>

  <div class="bottom-promo-card">
    <div class="promo-text-group">
      <h3>🎁 Идёт открытое тестирование!</h3>
      <p>+30 дней доступа после тестов по промокоду:</p>
    </div>
    <div class="promo-btn-wrap">
      <div class="code-title">Промокод</div>
      <div class="code-val">FB_RI_TRIAL</div>
    </div>
  </div>

  <div class="link-footer">
    📍 Онлайн по всей стране • Доступ: ulpana-hebrew.vercel.app?promo=FB_RI_TRIAL
  </div>
</body>
</html>`;

  await renderCard(browser, card3Html, 1080, 1080, 'promo_square_features_1080x1080.png');

  await browser.close();
  console.log('🎉 Все изображения успешно обновлены!');
}

main().catch(err => {
  console.error('Ошибка генерации:', err);
  process.exit(1);
});
