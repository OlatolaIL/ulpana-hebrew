import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const outDir = path.resolve('public/demo/openchatcut_assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const cards = [
  {
    name: 'card_01_hook.png',
    html: `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;">
        <!-- Top Tag -->
        <div style="display:inline-flex;align-items:center;background:rgba(239,68,68,0.9);color:#fff;padding:16px 36px;border-radius:999px;font-size:32px;font-weight:900;letter-spacing:2px;box-shadow:0 8px 30px rgba(239,68,68,0.5);">
          🚨 ОШИБКА РЕПАТРИАНТА • УРОК 10
        </div>

        <!-- Big Headline Box -->
        <div style="margin-top:50px;background:rgba(15,23,42,0.85);backdrop-filter:blur(16px);border:3px solid rgba(255,255,255,0.15);border-radius:32px;padding:48px;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
          <div style="color:#FBBF24;font-size:36px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">
            🚕 В ТАКСИ НА ТРАССЕ АЯЛОН
          </div>
          <div style="color:#FFFFFF;font-size:56px;font-weight:900;line-height:1.2;">
            Пытаешься объяснить водителю дорогу...
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'card_02_passenger.png',
    html: `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
        <!-- Dialogue Bubble Passenger -->
        <div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(20px);border:3px solid #38BDF8;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="background:#38BDF8;color:#0F172A;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
              👨‍🎓 ПАССАЖИР
            </div>
            <div style="color:#94A3B8;font-size:24px;font-weight:600;">(уверенно показывает рукой)</div>
          </div>
          <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:74px;font-weight:900;color:#FFFFFF;line-height:1.2;margin-bottom:20px;">
            תִּסַּע <span style="color:#EF4444;text-decoration:underline;text-decoration-thickness:6px;">יָשָׁן</span>! עוֹד יוֹתֵר <span style="color:#EF4444;">יָשָׁן</span>!
          </div>
          <div style="color:#E2E8F0;font-size:36px;font-weight:700;">
            «Езжай <span style="color:#EF4444;">старая вещь</span>! Ещё более <span style="color:#EF4444;">старая</span>!»
          </div>
          <div style="color:#94A3B8;font-size:24px;font-weight:600;margin-top:10px;">
            (Хотел сказать «прямо» — יָשָׁר, а назвал водителя старым хламом)
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'card_02b_freeze.png',
    html: `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <!-- Freeze Frame Box -->
        <div style="background:rgba(15,23,42,0.95);backdrop-filter:blur(24px);border:4px solid #F59E0B;border-radius:40px;padding:50px 60px;box-shadow:0 30px 80px rgba(245,158,11,0.5);text-align:center;max-width:880px;">
          <div style="font-size:110px;margin-bottom:20px;line-height:1;">
            ❓🤨❓
          </div>
          <div style="color:#FBBF24;font-size:52px;font-weight:900;letter-spacing:1px;margin-bottom:16px;">
            СТОП... ЧТО ОН СКАЗАЛ?!
          </div>
          <div style="color:#E2E8F0;font-size:32px;font-weight:700;">
            (немая пауза в салоне такси)
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'card_03_driver.png',
    html: `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:240px;">
        <!-- Red Screech Alert -->
        <div style="align-self:flex-start;background:#EF4444;color:#FFFFFF;padding:14px 32px;border-radius:20px;font-size:32px;font-weight:900;letter-spacing:2px;box-shadow:0 10px 30px rgba(239,68,68,0.7);margin-bottom:24px;animation:pulse 1s infinite;">
          ⚠️ РЕЗКИЙ ТОРМОЗ! БИП-БИП!
        </div>

        <!-- Driver Freakout Box -->
        <div style="background:rgba(20,10,10,0.94);backdrop-filter:blur(20px);border:4px solid #EF4444;border-radius:36px;padding:44px 50px;box-shadow:0 24px 70px rgba(239,68,68,0.4);">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
            <div style="background:#EF4444;color:#FFFFFF;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
              🚖 ВОДИТЕЛЬ В ШОКЕ
            </div>
          </div>
          <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:54px;font-weight:900;color:#FDE047;line-height:1.25;margin-bottom:20px;">
            מִי יָשָׁן, יָא חַבּוּבּ?! אֲנִי נַהָג עֶשְׂרִים שָׁנָה, אַתָּה קוֹרֵא לִי זָקֵן?! רֵד מֵהַמּוֹנִית!
          </div>
          <div style="color:#FFFFFF;font-size:30px;font-weight:700;line-height:1.35;">
            «Какая я тебе <span style="color:#EF4444;">старая вещь</span>, дружок?! Человек — это <span style="color:#34D399;">זָקֵן (заке́н)</span>, а не старый хлам! Выходи из такси!»
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'card_04_rule.png',
    html: `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;">
        <!-- Trainer Rule Card -->
        <div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:3px solid #38BDF8;border-radius:40px;padding:48px 46px;box-shadow:0 30px 80px rgba(0,0,0,0.85);">
          <div style="display:inline-block;background:#38BDF8;color:#0F172A;font-size:26px;font-weight:900;padding:8px 26px;border-radius:999px;margin-bottom:22px;">
            💡 РАЗБОР • ОДНА БУКВА МЕНЯЕТ ВСЁ!
          </div>

          <!-- Comparison Grid -->
          <div style="display:flex;flex-direction:column;gap:18px;margin-bottom:26px;">
            <!-- Right form: Прямо -->
            <div style="background:rgba(16,185,129,0.15);border:2px solid #10B981;border-radius:20px;padding:18px 26px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="color:#10B981;font-size:24px;font-weight:800;">ПРАВИЛЬНО (ПРЯМО):</div>
                <div style="color:#E2E8F0;font-size:28px;font-weight:700;">яша́р (буква Реш)</div>
              </div>
              <div style="direction:rtl;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#34D399;">
                יָשָׁר
              </div>
            </div>

            <!-- Wrong form: Старая вещь -->
            <div style="background:rgba(239,68,68,0.15);border:2px solid #EF4444;border-radius:20px;padding:18px 26px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="color:#EF4444;font-size:24px;font-weight:800;">СТАРАЯ ВЕЩЬ / ХЛАМ:</div>
                <div style="color:#E2E8F0;font-size:28px;font-weight:700;">яша́н (только вещи!)</div>
              </div>
              <div style="direction:rtl;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#F87171;">
                יָשָׁן
              </div>
            </div>

            <!-- Critical Animacy Rule: Человек - это закен -->
            <div style="background:rgba(99,102,241,0.2);border:2px solid #818CF8;border-radius:20px;padding:18px 26px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="color:#A5B4FC;font-size:24px;font-weight:800;">СТАРЫЙ ЧЕЛОВЕК:</div>
                <div style="color:#FFFFFF;font-size:28px;font-weight:700;">заке́н (только люди!)</div>
              </div>
              <div style="direction:rtl;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#818CF8;">
                זָקֵן
              </div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.08);border-radius:18px;padding:18px 24px;color:#F1F5F9;font-size:26px;font-weight:600;line-height:1.4;">
            «<b>יָשָׁן</b> — только для вещей! Назвав таксиста <i>яшан</i>, ты обозвал его старой рухлядью»
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'card_05_cta.png',
    html: `
      <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:140px;">
        <!-- End Screen Card -->
        <div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:3px solid #6366F1;border-radius:40px;padding:50px 48px;box-shadow:0 30px 80px rgba(99,102,241,0.4);text-align:center;">
          <!-- 3D Aleph Badge -->
          <div style="display:inline-flex;align-items:center;justify-content:center;width:110px;height:110px;background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:28px;box-shadow:0 12px 30px rgba(99,102,241,0.6);margin-bottom:24px;">
            <span style="font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:64px;font-weight:900;color:#FFFFFF;">א</span>
          </div>

          <div style="color:#FFFFFF;font-size:48px;font-weight:900;margin-bottom:12px;">
            УЛЬПАН АЛЕФ • УРОК 10
          </div>
          <div style="color:#A5B4FC;font-size:32px;font-weight:700;margin-bottom:36px;">
            Иврит без паники • Добирайся без приключений
          </div>

          <!-- Promo Badge -->
          <div style="background:linear-gradient(90deg,#F59E0B,#D97706);color:#0F172A;padding:20px 40px;border-radius:24px;font-size:42px;font-weight:900;letter-spacing:2px;box-shadow:0 10px 30px rgba(245,158,11,0.5);display:inline-block;margin-bottom:24px;">
            ПРОМОКОД: YT
          </div>

          <div style="color:#94A3B8;font-size:26px;font-weight:600;">
            Ссылка на платформу в описании профиля
          </div>
        </div>
      </div>
    `
  }
];

export const PLATFORMS = [
  { code: 'YT', name: 'YouTube Shorts', filename: 'lesson_10_spicy_youtube_shorts.mp4' },
  { code: 'TG', name: 'Telegram', filename: 'lesson_10_spicy_telegram.mp4' },
  { code: 'INSTA', name: 'Instagram Reels', filename: 'lesson_10_spicy_instagram_reels.mp4' },
  { code: 'TIKTOK', name: 'TikTok', filename: 'lesson_10_spicy_tiktok.mp4' },
  { code: 'FB', name: 'Facebook Reels', filename: 'lesson_10_spicy_facebook_reels.mp4' },
];

export function getCtaHtml(promoCode = 'YT') {
  return `
    <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:140px;">
      <!-- End Screen Card -->
      <div style="background:rgba(15,23,42,0.96);backdrop-filter:blur(24px);border:3px solid #6366F1;border-radius:40px;padding:50px 48px;box-shadow:0 30px 80px rgba(99,102,241,0.4);text-align:center;">
        <!-- 3D Aleph Badge -->
        <div style="display:inline-flex;align-items:center;justify-content:center;width:110px;height:110px;background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:28px;box-shadow:0 12px 30px rgba(99,102,241,0.6);margin-bottom:24px;">
          <span style="font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:64px;font-weight:900;color:#FFFFFF;">א</span>
        </div>

        <div style="color:#FFFFFF;font-size:48px;font-weight:900;margin-bottom:12px;">
          УЛЬПАН АЛЕФ • УРОК 10
        </div>
        <div style="color:#A5B4FC;font-size:32px;font-weight:700;margin-bottom:36px;">
          Иврит без паники • Добирайся без приключений
        </div>

        <!-- Promo Badge -->
        <div style="background:linear-gradient(90deg,#F59E0B,#D97706);color:#0F172A;padding:20px 40px;border-radius:24px;font-size:42px;font-weight:900;letter-spacing:2px;box-shadow:0 10px 30px rgba(245,158,11,0.5);display:inline-block;margin-bottom:24px;">
          ПРОМОКОД: ${promoCode}
        </div>

        <div style="color:#94A3B8;font-size:26px;font-weight:600;">
          Ссылка на платформу в описании профиля
        </div>
      </div>
    </div>
  `;
}

// Add platform-specific CTA cards
for (const p of PLATFORMS) {
  cards.push({
    name: `card_05_cta_${p.code.toLowerCase()}.png`,
    html: getCtaHtml(p.code)
  });
}

const occMediaDir = 'C:\\Users\\azrie\\.codex\\Ulpana2\\tools\\openchatcut-local\\media\\lesson_10_spicy';

export async function generateAllOverlays() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  for (const c of cards) {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1
    });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">${c.html}</body></html>`);
    const target = path.join(outDir, c.name);
    await page.screenshot({ path: target, omitBackground: true });
    await page.close();
    console.log(`✅ Generated transparent overlay card: ${c.name} (${fs.statSync(target).size} bytes)`);

    // Copy to OpenChatCut linked media dir if it exists
    if (fs.existsSync(occMediaDir)) {
      const occTarget = path.join(occMediaDir, c.name);
      fs.copyFileSync(target, occTarget);
    }
  }
  await browser.close();
  console.log("🎉 All transparent overlay cards (including all 5 platform CTAs) created successfully!");
}

if (process.argv[1] && process.argv[1].endsWith('generate_occ_overlays.mjs')) {
  generateAllOverlays().catch(err => {
    console.error("❌ Overlay generation error:", err);
    process.exit(1);
  });
}
