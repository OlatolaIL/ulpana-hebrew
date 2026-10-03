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
const CHAR_DIR = path.resolve(ROOT, 'growth/characters/itsik_bus/emotions');
const AUDIO_BANK = path.resolve(DEMO_DIR, 'audio_bank');
const SFX_DIR = path.resolve(AUDIO_BANK, 'sfx');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true });

// Input images
const contextBusImg = path.join(CHAR_DIR, 'context_bus.jpg');
const shockedBusImg = path.join(CHAR_DIR, 'shocked.jpg');
const passengerBusImg = path.join(CHAR_DIR, 'passenger_bus.jpg');

// 1. Generate Overlay Cards (1080x1920)
async function generateOverlays() {
  console.log('🎨 [1/4] Генерация 1080x1920 оверлейных карточек (Clean - Автобус)...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

  const cards = [
    {
      file: 'clean_card_01_hook.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;">
          <!-- Top Tag -->
          <div style="display:inline-flex;align-items:center;background:rgba(239,68,68,0.95);color:#fff;padding:16px 36px;border-radius:999px;font-size:32px;font-weight:900;letter-spacing:2px;box-shadow:0 8px 30px rgba(239,68,68,0.5);">
            🚨 ОШИБКА В АВТОБУСЕ • УРОК 10
          </div>

          <!-- Big Headline Box -->
          <div style="margin-top:50px;background:rgba(15,23,42,0.85);backdrop-filter:blur(16px);border:3px solid rgba(255,255,255,0.15);border-radius:32px;padding:48px;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
            <div style="color:#38BDF8;font-size:36px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">
              🚌 МАРШРУТ 25 • ИБН ГВИРОЛЬ
            </div>
            <div style="color:#FFFFFF;font-size:56px;font-weight:900;line-height:1.2;">
              Пытаешься попросить водителя сделать остановку...
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'clean_card_02_passenger.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
          <div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(20px);border:3px solid #38BDF8;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div style="background:#38BDF8;color:#0F172A;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
                👨‍🎓 ПАССАЖИР
              </div>
              <div style="color:#94A3B8;font-size:24px;font-weight:600;">(кричит через весь салон водителю)</div>
            </div>
            <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:74px;font-weight:900;color:#FFFFFF;line-height:1.2;margin-bottom:20px;">
              נַהָג! <span style="color:#EF4444;text-decoration:underline;text-decoration-thickness:6px;">תַּהֲרֹג</span> פֹּה בְּבַקָּשָׁה!
            </div>
            <div style="color:#E2E8F0;font-size:36px;font-weight:700;">
              «Водитель! <span style="color:#EF4444;">Убей здесь</span>, пожалуйста!»
            </div>
            <div style="color:#94A3B8;font-size:24px;font-weight:600;margin-top:10px;">
              (Хотел сказать «останови» — תַּעֲצוֹר, а попросил убийство)
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'clean_card_02b_freeze.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
          <div style="background:rgba(15,23,42,0.95);backdrop-filter:blur(24px);border:4px solid #F59E0B;border-radius:40px;padding:50px 60px;box-shadow:0 30px 80px rgba(245,158,11,0.5);text-align:center;max-width:880px;">
            <div style="font-size:70px;margin-bottom:16px;">⏸️ 😱 🚌</div>
            <div style="color:#F59E0B;font-size:40px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">
              АВТОБУС РЕЗКО ЗАМЕР
            </div>
            <div style="color:#FFFFFF;font-size:36px;font-weight:700;line-height:1.4;">
              Водитель ударил по тормозам... Весь салон уставился на тебя
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'clean_card_03_driver.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
          <div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(20px);border:3px solid #EF4444;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div style="background:#EF4444;color:#FFFFFF;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
                🚌 ИЦИК (ВОДИТЕЛЬ)
              </div>
              <div style="color:#F87171;font-size:24px;font-weight:600;">(в шоке орет в салон)</div>
            </div>
            <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:62px;font-weight:900;color:#FFFFFF;line-height:1.25;margin-bottom:20px;">
              ?אֶת מִי לַהֲרֹג, יָא מְשֻׁגָּע<br/>
              !אוֹתְךָ אוֹ אֶת הַזָּקֵן?!
            </div>
            <div style="color:#FCA5A5;font-size:36px;font-weight:700;">
              «Кого убить, псих?! Тебя или старика?!»
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'clean_card_04_rule.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;">
          <div style="background:rgba(15,23,42,0.95);backdrop-filter:blur(24px);border:3px solid #10B981;border-radius:40px;padding:48px;box-shadow:0 30px 80px rgba(0,0,0,0.8);">
            <!-- Badge -->
            <div style="display:inline-flex;align-items:center;background:#10B981;color:#0F172A;padding:12px 28px;border-radius:999px;font-size:24px;font-weight:900;margin-bottom:32px;">
              💡 ПРАВИЛО ВЫЖИВАНИЯ В ТРАНСПОРТЕ
            </div>

            <div style="color:#FFFFFF;font-size:44px;font-weight:900;margin-bottom:36px;line-height:1.2;">
              Не путайте корни:
            </div>

            <!-- Comparison Grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:36px;">
              <!-- Good -->
              <div style="background:rgba(16,185,129,0.12);border:2px solid #10B981;border-radius:24px;padding:28px 24px;text-align:center;">
                <div style="color:#34D399;font-size:22px;font-weight:800;margin-bottom:8px;">ОСТАНОВИТЬ (ТОРМОЗИТЬ)</div>
                <div style="font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#FFFFFF;margin-bottom:8px;">לַעֲצוֹר</div>
                <div style="color:#A7F3D0;font-size:26px;font-weight:700;">лаацо́р</div>
              </div>

              <!-- Danger -->
              <div style="background:rgba(239,68,68,0.12);border:2px solid #EF4444;border-radius:24px;padding:28px 24px;text-align:center;">
                <div style="color:#F87171;font-size:22px;font-weight:800;margin-bottom:8px;">УБИТЬ (ОПАСНО!)</div>
                <div style="font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#FFFFFF;margin-bottom:8px;">לַהֲרוֹג</div>
                <div style="color:#FECACA;font-size:26px;font-weight:700;">лаhаро́г</div>
              </div>
            </div>

            <!-- Ready phrase -->
            <div style="background:rgba(255,255,255,0.06);border-radius:24px;padding:28px 32px;border:1px solid rgba(255,255,255,0.1);">
              <div style="color:#94A3B8;font-size:22px;font-weight:700;margin-bottom:12px;">✅ Спасительная фраза водителю:</div>
              <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:46px;font-weight:900;color:#38BDF8;margin-bottom:8px;">
                ?אֶפְשָׁר לַעֲצוֹר בַּתַּחֲנָה, בְּבַקָּשָׁה
              </div>
              <div style="color:#E2E8F0;font-size:24px;font-weight:600;">
                «Можно остановить на остановке, пожалуйста?»
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'clean_card_05_cta_yt.png',
      html: `
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
                ПРОМОКОД: YT
              </div>
              <div style="color:#E0F2FE;font-size:22px;font-weight:600;">
                Урок 10: Транспорт и городская навигация
              </div>
            </div>

            <!-- Link CTA -->
            <div style="color:#38BDF8;font-size:28px;font-weight:800;">
              👇 Ссылка на интерактивный тренажёр в описании!
            </div>
          </div>
        </div>
      `
    }
  ];

  for (const c of cards) {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { width: 1080px; height: 1920px; background: transparent; overflow: hidden; }
          </style>
        </head>
        <body>${c.html}</body>
      </html>
    `);
    const outPath = path.join(ASSETS_DIR, c.file);
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log(`   ✅ Сгенерирована карточка: ${c.file}`);
  }

  await browser.close();
}

// 2. Generate Dynamic B-Roll Clips
function generateBroll() {
  console.log('🎬 [2/4] Рендер динамических B-Roll (Ken Burns + Zero Shake)...');

  // Clip 1: Hook (0 to 3.0s = 3.0s = 90 frames)
  const clip1 = path.join(ASSETS_DIR, 'clean_broll_01_hook.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', contextBusImg,
    '-vf', "zoompan=z='min(zoom+0.0006,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:s=1080x1920:fps=30",
    '-c:v', 'libx264', '-t', '3.0', '-pix_fmt', 'yuv420p', clip1
  ]);

  // Clip 2: Passenger (3.0s to 5.7s = 2.7s = 81 frames)
  const clip2 = path.join(ASSETS_DIR, 'clean_broll_02_pass.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', passengerBusImg,
    '-vf', "zoompan=z='min(1.04+on*0.0006,1.10)':x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom/2)':d=81:s=1080x1920:fps=30",
    '-c:v', 'libx264', '-t', '2.7', '-pix_fmt', 'yuv420p', clip2
  ]);

  // Clip 2b: Freeze Frame Comedic Pause (5.7s to 6.6s = 0.9s = 27 frames)
  const clip2b = path.join(ASSETS_DIR, 'clean_broll_02b_freeze.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', passengerBusImg,
    '-vf', "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=saturation=0.85:contrast=1.1",
    '-c:v', 'libx264', '-t', '0.9', '-r', '30', '-pix_fmt', 'yuv420p', clip2b
  ]);

  // Clip 3: Driver Shocked (6.6s to 11.2s = 4.6s = 138 frames) - Stable cinematic zoom
  const clip3 = path.join(ASSETS_DIR, 'clean_broll_03_driver.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', shockedBusImg,
    '-vf', "zoompan=z='min(1.06+on*0.0008,1.20)':x='iw/2-(iw/zoom/2)':y='ih*0.42-(ih/zoom/2)':d=138:s=1080x1920:fps=30",
    '-c:v', 'libx264', '-t', '4.6', '-pix_fmt', 'yuv420p', clip3
  ]);

  // Clip 4: Rule (11.2s to 21.8s = 10.6s = 318 frames) - Subtle drift with soft blur
  const clip4 = path.join(ASSETS_DIR, 'clean_broll_04_rule.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', contextBusImg,
    '-vf', "zoompan=z='min(1.08-on*0.00025,1.02)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=318:s=1080x1920:fps=30,boxblur=2:1,eq=brightness=-0.08",
    '-c:v', 'libx264', '-t', '10.6', '-pix_fmt', 'yuv420p', clip4
  ]);

  // Clip 5: CTA (21.8s to 26.5s = 4.7s = 141 frames)
  const clip5 = path.join(ASSETS_DIR, 'clean_broll_05_cta.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', shockedBusImg,
    '-vf', "zoompan=z='min(1.15-on*0.0004,1.08)':x='iw/2-(iw/zoom/2)':y='ih*0.4-(ih/zoom/2)':d=141:s=1080x1920:fps=30,eq=brightness=-0.1",
    '-c:v', 'libx264', '-t', '4.7', '-pix_fmt', 'yuv420p', clip5
  ]);

  console.log('   ✅ Все 6 динамических B-Roll клипов сгенерированы');
}

// 3. Mix Master Audio (26.5s)
function mixAudio() {
  console.log('🔊 [3/4] Сведение многодорожечного аудио со звуковыми эффектами...');
  const s1 = path.join(AUDIO_BANK, 'l10_clean_s1_01.mp3');
  const s2 = path.join(AUDIO_BANK, 'l10_clean_s2_02.mp3');
  const scratch = path.join(SFX_DIR, 'record_scratch.wav');
  const screech = path.join(SFX_DIR, 'tire_screech.wav');
  const s3 = path.join(AUDIO_BANK, 'l10_clean_s2_03.mp3');
  const chime = path.join(SFX_DIR, 'chime_ding.wav');
  const s4 = path.join(AUDIO_BANK, 'l10_clean_s3_04.mp3');
  const s5 = path.join(AUDIO_BANK, 'l10_clean_s4_05.mp3');

  const masterAudio = path.join(ASSETS_DIR, 'clean_master_audio.wav');

  // Timings in milliseconds:
  // 0ms: s1 (Hook narrator: 2762ms)
  // 3000ms: s2 (Passenger: 2400ms -> ends at 5400ms)
  // 5650ms: record scratch (320ms)
  // 5850ms: tire screech (1600ms)
  // 6600ms: s3 (Driver Itsik: 3760ms -> ends at 10360ms)
  // 11100ms: chime (1000ms)
  // 11300ms: s4 (Rule narrator: 10300ms -> ends at 21600ms)
  // 21900ms: s5 (CTA narrator: 4143ms -> ends at 26043ms)

  const filter = [
    '[0:a]adelay=0|0,volume=1.0[a0]',
    '[1:a]adelay=3000|3000,volume=1.05[a1]',
    '[2:a]adelay=5650|5650,volume=0.85[a2]',
    '[3:a]adelay=5850|5850,volume=0.85[a3]',
    '[4:a]adelay=6600|6600,volume=1.1,equalizer=f=3000:width_type=h:width=1500:g=3[a4]',
    '[5:a]adelay=11100|11100,volume=0.8[a5]',
    '[6:a]adelay=11300|11300,volume=1.0[a6]',
    '[7:a]adelay=21900|21900,volume=1.0[a7]',
    '[a0][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:dropout_transition=0,dynaudnorm=f=75:g=15:p=0.95[out]'
  ].join(';');

  cp.spawnSync(ffmpeg, [
    '-y',
    '-i', s1,
    '-i', s2,
    '-i', scratch,
    '-i', screech,
    '-i', s3,
    '-i', chime,
    '-i', s4,
    '-i', s5,
    '-filter_complex', filter,
    '-map', '[out]',
    '-ar', '44100',
    '-ac', '2',
    '-t', '26.5',
    masterAudio
  ]);

  console.log('   ✅ Мастер-аудио сведено:', masterAudio, fs.statSync(masterAudio).size, 'байт');
  return masterAudio;
}

// 4. Composite Video (B-Roll + Overlays + Audio)
function compositeVideo(masterAudio) {
  console.log('🎞️ [4/4] Финальный NLE-композитинг чистового YouTube Shorts (1080x1920)...');

  // Concat all B-rolls first
  const concatList = path.join(ASSETS_DIR, 'clean_concat_list.txt');
  fs.writeFileSync(concatList, [
    `file '${path.join(ASSETS_DIR, 'clean_broll_01_hook.mp4')}'`,
    `file '${path.join(ASSETS_DIR, 'clean_broll_02_pass.mp4')}'`,
    `file '${path.join(ASSETS_DIR, 'clean_broll_02b_freeze.mp4')}'`,
    `file '${path.join(ASSETS_DIR, 'clean_broll_03_driver.mp4')}'`,
    `file '${path.join(ASSETS_DIR, 'clean_broll_04_rule.mp4')}'`,
    `file '${path.join(ASSETS_DIR, 'clean_broll_05_cta.mp4')}'`,
  ].join('\n'), 'utf8');

  const baseVideo = path.join(ASSETS_DIR, 'clean_base_broll.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-f', 'concat', '-safe', '0', '-i', concatList,
    '-c', 'copy', baseVideo
  ]);

  // Card paths
  const c1 = path.join(ASSETS_DIR, 'clean_card_01_hook.png');
  const c2 = path.join(ASSETS_DIR, 'clean_card_02_passenger.png');
  const c2b = path.join(ASSETS_DIR, 'clean_card_02b_freeze.png');
  const c3 = path.join(ASSETS_DIR, 'clean_card_03_driver.png');
  const c4 = path.join(ASSETS_DIR, 'clean_card_04_rule.png');
  const c5 = path.join(ASSETS_DIR, 'clean_card_05_cta_yt.png');

  // Filter overlay timeline:
  // c1: 0 to 3.0s
  // c2: 3.0 to 5.7s
  // c2b: 5.7 to 6.6s
  // c3: 6.6 to 11.2s
  // c4: 11.2 to 21.8s
  // c5: 21.8 to 26.5s
  const filterOverlay = [
    '[0:v][1:v]overlay=0:0:enable=\'between(t,0,3.0)\'[v1]',
    '[v1][2:v]overlay=0:0:enable=\'between(t,3.0,5.7)\'[v2]',
    '[v2][3:v]overlay=0:0:enable=\'between(t,5.7,6.6)\'[v3]',
    '[v3][4:v]overlay=0:0:enable=\'between(t,6.6,11.2)\'[v4]',
    '[v4][5:v]overlay=0:0:enable=\'between(t,11.2,21.8)\'[v5]',
    '[v5][6:v]overlay=0:0:enable=\'gte(t,21.8)\'[vout]'
  ].join(';');

  const finalShorts = path.join(LESSONS_DIR, 'lesson_10_clean_youtube_shorts.mp4');

  const res = cp.spawnSync(ffmpeg, [
    '-y',
    '-i', baseVideo,
    '-i', c1,
    '-i', c2,
    '-i', c2b,
    '-i', c3,
    '-i', c4,
    '-i', c5,
    '-i', masterAudio,
    '-filter_complex', filterOverlay,
    '-map', '[vout]',
    '-map', '7:a',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', '26.5',
    '-pix_fmt', 'yuv420p',
    finalShorts
  ]);

  if (res.status !== 0) {
    console.error('Ошибка сборки видео:', res.stderr.toString());
    process.exit(1);
  }

  const stat = fs.statSync(finalShorts);
  console.log(`\n🎉 YouTube Shorts Урок 10 (Clean) успешно собран!`);
  console.log(`   Файл: ${finalShorts}`);
  console.log(`   Размер: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   Разрешение: 1080x1920 (30 fps)`);

  return finalShorts;
}

async function main() {
  await generateOverlays();
  generateBroll();
  const masterAudio = mixAudio();
  const finalFile = compositeVideo(masterAudio);

  // Update registry
  const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');
  if (fs.existsSync(REGISTRY_PATH)) {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    if (!reg.lessons['10']) reg.lessons['10'] = { lessonNumber: 10, variants: {} };
    if (!reg.lessons['10'].variants.clean) reg.lessons['10'].variants.clean = { files: {} };
    reg.lessons['10'].variants.clean.files.YT = {
      path: 'public/demo/lessons/lesson_10_clean_youtube_shorts.mp4',
      promoCode: 'YT',
      durationSec: 26.5,
      resolution: '1080x1920',
      fileSizeBytes: fs.statSync(finalFile).size,
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 2), 'utf8');
    console.log('📝 Реестр lessons_video_registry.json обновлен!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
