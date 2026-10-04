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
const CHAR_DIR = path.resolve(ROOT, 'growth/characters/david_guard/emotions');
const AUDIO_BANK = path.resolve(DEMO_DIR, 'audio_bank');
const SFX_DIR = path.resolve(AUDIO_BANK, 'sfx');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true });

// Input images
const contextMallImg = path.join(CHAR_DIR, 'context_mall.jpg');
const davidGuardImg = path.join(CHAR_DIR, 'david_guard.jpg');
const studentDesperateImg = path.join(CHAR_DIR, 'student_desperate.jpg');

// 1. Generate Overlay Cards (1080x1920)
async function generateOverlays() {
  console.log('🎨 [1/4] Генерация 1080x1920 оверлейных карточек (Clean - Каньон Азриэли)...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

  const cards = [
    {
      file: 'l07_clean_card_01_hook.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;">
          <!-- Top Tag -->
          <div style="display:inline-flex;align-items:center;background:rgba(239,68,68,0.95);color:#fff;padding:16px 36px;border-radius:999px;font-size:32px;font-weight:900;letter-spacing:2px;box-shadow:0 8px 30px rgba(239,68,68,0.5);">
            🚨 КАЗУС В КАНЬОНЕ • УРОК 7
          </div>

          <!-- Big Headline Box -->
          <div style="margin-top:50px;background:rgba(15,23,42,0.85);backdrop-filter:blur(16px);border:3px solid rgba(255,255,255,0.15);border-radius:32px;padding:48px;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
            <div style="color:#38BDF8;font-size:36px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">
              🛍️ КАНЬОН АЗРИЭЛИ • ТЕЛЬ-АВИВ
            </div>
            <div style="color:#FFFFFF;font-size:56px;font-weight:900;line-height:1.2;">
              Срочно приспичило в туалет в торговом центре...
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'l07_clean_card_02_student.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
          <div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(20px);border:3px solid #38BDF8;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div style="background:#38BDF8;color:#0F172A;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
                👨‍🎓 ПОСЕТИТЕЛЬ
              </div>
              <div style="color:#94A3B8;font-size:24px;font-weight:600;">(в панике подбегает к охране)</div>
            </div>
            <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:70px;font-weight:900;color:#FFFFFF;line-height:1.2;margin-bottom:20px;">
              ?אֵיפֹה יֵשׁ פֹּה... <span style="color:#EF4444;text-decoration:underline;text-decoration-thickness:6px;">שֵׁרוּת</span> לָאָדָם
            </div>
            <div style="color:#E2E8F0;font-size:36px;font-weight:700;">
              «Где здесь... <span style="color:#EF4444;">услуга человеку</span>?!»
            </div>
            <div style="color:#94A3B8;font-size:24px;font-weight:600;margin-top:10px;">
              (Хотел сказать «туалет» — שֵׁרוּתִים, а попросил сервис)
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'l07_clean_card_03_guard.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:280px;">
          <div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(20px);border:3px solid #38BDF8;border-radius:36px;padding:44px 50px;box-shadow:0 24px 60px rgba(0,0,0,0.7);">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div style="background:#0284C7;color:#FFFFFF;font-size:26px;font-weight:900;padding:8px 24px;border-radius:999px;">
                👮‍♂️ ДАВИД (ОХРАННИК)
              </div>
              <div style="color:#38BDF8;font-size:24px;font-weight:600;">(спокойно указывает на эскалатор)</div>
            </div>
            <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:66px;font-weight:900;color:#FFFFFF;line-height:1.25;margin-bottom:20px;">
              !מוֹדִיעִין בַּקּוֹמָה שְׁנִיָּה, אָחִי
            </div>
            <div style="color:#BAE6FD;font-size:36px;font-weight:700;">
              «Справочная на втором этаже, брат!»
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'l07_clean_card_04_freeze.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
          <div style="background:rgba(15,23,42,0.95);backdrop-filter:blur(24px);border:4px solid #F59E0B;border-radius:40px;padding:50px 60px;box-shadow:0 30px 80px rgba(245,158,11,0.5);text-align:center;max-width:880px;">
            <div style="font-size:70px;margin-bottom:16px;">⏸️ 😱 ⏳</div>
            <div style="direction:rtl;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;color:#F59E0B;font-size:52px;font-weight:900;margin-bottom:12px;">
              ...מְאוּחָר מִדַּי
            </div>
            <div style="color:#F59E0B;font-size:38px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">
              СЛИШКОМ ПОЗДНО...
            </div>
            <div style="color:#FFFFFF;font-size:34px;font-weight:700;line-height:1.4;">
              Когда перепутал окончание в самый неподходящий момент
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'l07_clean_card_05_rule.png',
      html: `
        <div style="width:1080px;height:1920px;position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box;padding:80px 50px;display:flex;flex-direction:column;justify-content:center;">
          <div style="background:rgba(15,23,42,0.95);backdrop-filter:blur(24px);border:3px solid #10B981;border-radius:40px;padding:48px;box-shadow:0 30px 80px rgba(0,0,0,0.8);">
            <!-- Badge -->
            <div style="display:inline-flex;align-items:center;background:#10B981;color:#0F172A;padding:12px 28px;border-radius:999px;font-size:24px;font-weight:900;margin-bottom:32px;">
              💡 ПРАВИЛО ВЫЖИВАНИЯ В ИЗРАИЛЕ
            </div>

            <div style="color:#FFFFFF;font-size:44px;font-weight:900;margin-bottom:36px;line-height:1.2;">
              Запомните разницу:
            </div>

            <!-- Comparison Grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:36px;">
              <!-- Toilet (plural) -->
              <div style="background:rgba(16,185,129,0.12);border:2px solid #10B981;border-radius:24px;padding:28px 24px;text-align:center;">
                <div style="color:#34D399;font-size:22px;font-weight:800;margin-bottom:8px;">ВСЕГДА МН. ЧИСЛО</div>
                <div style="font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#FFFFFF;margin-bottom:8px;">שֵׁרוּתִים</div>
                <div style="color:#A7F3D0;font-size:26px;font-weight:700;">шэрути́м (туалет)</div>
              </div>

              <!-- Service (single) -->
              <div style="background:rgba(239,68,68,0.12);border:2px solid #EF4444;border-radius:24px;padding:28px 24px;text-align:center;">
                <div style="color:#F87171;font-size:22px;font-weight:800;margin-bottom:8px;">ЕД. ЧИСЛО (СЕРВИС)</div>
                <div style="font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:56px;font-weight:900;color:#FFFFFF;margin-bottom:8px;">שֵׁרוּת</div>
                <div style="color:#FECACA;font-size:26px;font-weight:700;">шэру́т (служба)</div>
              </div>
            </div>

            <!-- Ready phrase -->
            <div style="background:rgba(255,255,255,0.06);border-radius:24px;padding:28px 32px;border:1px solid rgba(255,255,255,0.1);">
              <div style="color:#94A3B8;font-size:22px;font-weight:700;margin-bottom:12px;">✅ Спасительная фраза на каждый день:</div>
              <div style="direction:rtl;text-align:right;font-family:'Segoe UI Hebrew',Rubik,Arial,sans-serif;font-size:46px;font-weight:900;color:#38BDF8;margin-bottom:8px;">
                ?אֵיפֹה הַשֵּׁרוּתִים, בְּבַקָּשָׁה
              </div>
              <div style="color:#E2E8F0;font-size:24px;font-weight:600;">
                «Где туалет, пожалуйста?»
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      file: 'l07_clean_card_06_cta.png',
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
              Отрабатывай живые ситуации в ТЦ и на улице с ИИ
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
                Урок 7: Дом, город и навигация
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

  // Clip 1: Mall Hook (0.0s to 2.8s = 2.8s = 84 frames)
  const clip1 = path.join(ASSETS_DIR, 'l07_clean_broll_01_hook.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', contextMallImg,
    '-vf', "zoompan=z='min(zoom+0.0006,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=84:s=1080x1920:fps=30",
    '-c:v', 'libx264', '-t', '2.8', '-pix_fmt', 'yuv420p', clip1
  ]);

  // Clip 2: Student Fail (2.8s to 5.5s = 2.7s = 81 frames)
  const clip2 = path.join(ASSETS_DIR, 'l07_clean_broll_02_student.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', studentDesperateImg,
    '-vf', "zoompan=z='min(1.04+on*0.0007,1.12)':x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom/2)':d=81:s=1080x1920:fps=30",
    '-c:v', 'libx264', '-t', '2.7', '-pix_fmt', 'yuv420p', clip2
  ]);

  // Clip 3: Guard David (5.5s to 8.0s = 2.5s = 75 frames)
  const clip3 = path.join(ASSETS_DIR, 'l07_clean_broll_03_guard.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', davidGuardImg,
    '-vf', "zoompan=z='min(1.05+on*0.0006,1.15)':x='iw/2-(iw/zoom/2)':y='ih*0.38-(ih/zoom/2)':d=75:s=1080x1920:fps=30",
    '-c:v', 'libx264', '-t', '2.5', '-pix_fmt', 'yuv420p', clip3
  ]);

  // Clip 4: Freeze Frame Comedic Pause (8.0s to 9.8s = 1.8s = 54 frames)
  const clip4 = path.join(ASSETS_DIR, 'l07_clean_broll_04_freeze.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', studentDesperateImg,
    '-vf', "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=saturation=0.85:contrast=1.1",
    '-c:v', 'libx264', '-t', '1.8', '-r', '30', '-pix_fmt', 'yuv420p', clip4
  ]);

  // Clip 5: Rule Mall Backdrop (9.8s to 18.3s = 8.5s = 255 frames)
  const clip5 = path.join(ASSETS_DIR, 'l07_clean_broll_05_rule.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', contextMallImg,
    '-vf', "zoompan=z='min(1.08-on*0.00025,1.02)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=255:s=1080x1920:fps=30,boxblur=2:1,eq=brightness=-0.08",
    '-c:v', 'libx264', '-t', '8.5', '-pix_fmt', 'yuv420p', clip5
  ]);

  // Clip 6: CTA Backdrop (18.3s to 23.3s = 5.0s = 150 frames)
  const clip6 = path.join(ASSETS_DIR, 'l07_clean_broll_06_cta.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-loop', '1', '-i', davidGuardImg,
    '-vf', "zoompan=z='min(1.12-on*0.00035,1.06)':x='iw/2-(iw/zoom/2)':y='ih*0.35-(ih/zoom/2)':d=150:s=1080x1920:fps=30,eq=brightness=-0.1",
    '-c:v', 'libx264', '-t', '5.0', '-pix_fmt', 'yuv420p', clip6
  ]);

  console.log('   ✅ Все 6 динамических B-Roll клипов сгенерированы');
}

// 3. Mix Master Audio (23.3s)
function mixAudio() {
  console.log('🔊 [3/4] Сведение многодорожечного аудио со звуковыми эффектами...');
  const s1 = path.join(AUDIO_BANK, 'l07_clean_s1_01.mp3');
  const s2 = path.join(AUDIO_BANK, 'l07_clean_s2_02.mp3');
  const scratch = path.join(SFX_DIR, 'record_scratch.wav');
  const s3 = path.join(AUDIO_BANK, 'l07_clean_s2_03.mp3');
  const s4 = path.join(AUDIO_BANK, 'l07_clean_s2_04.mp3');
  const chime = path.join(SFX_DIR, 'chime_ding.wav');
  const s5 = path.join(AUDIO_BANK, 'l07_clean_s3_05.mp3');
  const s6 = path.join(AUDIO_BANK, 'l07_clean_s4_06.mp3');

  const masterAudio = path.join(ASSETS_DIR, 'l07_clean_master_audio.wav');

  // Timings:
  // 0ms: s1 (Hook narrator: 2503ms -> ends at 2503ms)
  // 2800ms: s2 (Desperate student: 2401ms -> ends at 5201ms)
  // 5250ms: record scratch (320ms)
  // 5600ms: s3 (David guard: 2201ms -> ends at 7801ms)
  // 8050ms: s4 (Student: מְאוּחָר מִדַּי... 1441ms -> ends at 9491ms)
  // 9550ms: chime (1000ms)
  // 9850ms: s5 (Rule narrator: 8157ms -> ends at 18007ms)
  // 18300ms: s6 (CTA narrator: 4800ms -> ends at 23100ms)

  const filter = [
    '[0:a]adelay=0|0,volume=1.0[a0]',
    '[1:a]adelay=2800|2800,volume=1.1[a1]',
    '[2:a]adelay=5250|5250,volume=0.85[a2]',
    '[3:a]adelay=5600|5600,volume=1.1,equalizer=f=2500:width_type=h:width=1200:g=2[a3]',
    '[4:a]adelay=8050|8050,volume=1.1[a4]',
    '[5:a]adelay=9550|9550,volume=0.8[a5]',
    '[6:a]adelay=9850|9850,volume=1.05[a6]',
    '[7:a]adelay=18300|18300,volume=1.0[a7]',
    '[a0][a1][a2][a3][a4][a5][a6][a7]amix=inputs=8:dropout_transition=0,dynaudnorm=f=75:g=15:p=0.95[out]'
  ].join(';');

  cp.spawnSync(ffmpeg, [
    '-y',
    '-i', s1,
    '-i', s2,
    '-i', scratch,
    '-i', s3,
    '-i', s4,
    '-i', chime,
    '-i', s5,
    '-i', s6,
    '-filter_complex', filter,
    '-map', '[out]',
    '-ar', '44100',
    '-ac', '2',
    '-t', '23.3',
    masterAudio
  ]);

  console.log('   ✅ Мастер-аудио сведено:', masterAudio, fs.statSync(masterAudio).size, 'байт');
  return masterAudio;
}

// 4. Composite Video (B-Roll + Overlays + Audio)
function compositeVideo(masterAudio) {
  console.log('🎞️ [4/4] Финальный NLE-композитинг чистового YouTube Shorts (1080x1920)...');

  // Concat all B-rolls first
  const brollConcatList = path.join(ASSETS_DIR, 'l07_clean_broll_concat.txt');
  const brollListContent = [
    `file '${path.join(ASSETS_DIR, 'l07_clean_broll_01_hook.mp4').replace(/\\/g, '/')}'`,
    `file '${path.join(ASSETS_DIR, 'l07_clean_broll_02_student.mp4').replace(/\\/g, '/')}'`,
    `file '${path.join(ASSETS_DIR, 'l07_clean_broll_03_guard.mp4').replace(/\\/g, '/')}'`,
    `file '${path.join(ASSETS_DIR, 'l07_clean_broll_04_freeze.mp4').replace(/\\/g, '/')}'`,
    `file '${path.join(ASSETS_DIR, 'l07_clean_broll_05_rule.mp4').replace(/\\/g, '/')}'`,
    `file '${path.join(ASSETS_DIR, 'l07_clean_broll_06_cta.mp4').replace(/\\/g, '/')}'`,
  ].join('\n');
  fs.writeFileSync(brollConcatList, brollListContent);

  const mergedBroll = path.join(ASSETS_DIR, 'l07_clean_merged_broll.mp4');
  cp.spawnSync(ffmpeg, [
    '-y', '-f', 'concat', '-safe', '0', '-i', brollConcatList,
    '-c', 'copy', mergedBroll
  ]);

  // Card overlays
  const card1 = path.join(ASSETS_DIR, 'l07_clean_card_01_hook.png');
  const card2 = path.join(ASSETS_DIR, 'l07_clean_card_02_student.png');
  const card3 = path.join(ASSETS_DIR, 'l07_clean_card_03_guard.png');
  const card4 = path.join(ASSETS_DIR, 'l07_clean_card_04_freeze.png');
  const card5 = path.join(ASSETS_DIR, 'l07_clean_card_05_rule.png');
  const card6 = path.join(ASSETS_DIR, 'l07_clean_card_06_cta.png');

  // Filter chain matching Lesson 10 standard
  const filter = [
    `[0:v][1:v]overlay=0:0:enable='between(t,0,2.8)'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,2.8,5.5)'[v2]`,
    `[v2][3:v]overlay=0:0:enable='between(t,5.5,8.0)'[v3]`,
    `[v3][4:v]overlay=0:0:enable='between(t,8.0,9.8)'[v4]`,
    `[v4][5:v]overlay=0:0:enable='between(t,9.8,18.3)'[v5]`,
    `[v5][6:v]overlay=0:0:enable='gte(t,18.3)'[vfinal]`
  ].join(';');

  const finalShort = path.join(LESSONS_DIR, 'lesson_07_clean_youtube_shorts.mp4');

  const res = cp.spawnSync(ffmpeg, [
    '-y',
    '-i', mergedBroll,
    '-loop', '1', '-i', card1,
    '-loop', '1', '-i', card2,
    '-loop', '1', '-i', card3,
    '-loop', '1', '-i', card4,
    '-loop', '1', '-i', card5,
    '-loop', '1', '-i', card6,
    '-i', masterAudio,
    '-filter_complex', filter,
    '-map', '[vfinal]',
    '-map', '7:a',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', '23.3',
    finalShort
  ]);

  if (res.status !== 0) {
    throw new Error(`Ошибка финального композитинга: ${res.stderr?.toString()}`);
  }

  // Also create a copy as lesson_07_youtube_shorts.mp4 for convenience
  const defaultShort = path.join(LESSONS_DIR, 'lesson_07_youtube_shorts.mp4');
  fs.copyFileSync(finalShort, defaultShort);

  const stat = fs.statSync(finalShort);
  console.log(`\n🎉 Финальное видео успешно собрано: ${finalShort}`);
  console.log(`   Размер: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   Разрешение: 1080x1920 (9:16 vertical)`);
  console.log(`   Длительность: 23.3с @ 30fps`);
}

async function main() {
  console.log('================================================================');
  console.log('🚀 ФАБРИКА ВИДЕО: УРОК 7 CLEAN (YOUTUBE SHORTS 1080x1920)');
  console.log('================================================================\n');

  await generateOverlays();
  generateBroll();
  const masterAudio = mixAudio();
  compositeVideo(masterAudio);

  console.log('\n================================================================');
  console.log('✨ СБОРКА УРОКА 7 (CLEAN YOUTUBE SHORTS) УСПЕШНО ЗАВЕРШЕНА!');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
