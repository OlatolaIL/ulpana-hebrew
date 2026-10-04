import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const SCENARIOS_PATH = path.resolve(ROOT, 'growth/data/factory_scenarios_20.json');
const SCHEDULE_PATH = path.resolve(ROOT, 'growth/data/publication_schedule_20.json');
const CAMPAIGNS_DIR = path.resolve(ROOT, 'growth/output/campaigns');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const SYNC_SCRIPT = path.resolve(ROOT, 'scripts/sync_marketing_publications_ts.cjs');

const REPO = 'OlatolaIL/ulpana-hebrew';
const RELEASE_TAG = 'v-media-campaigns-01-20';

function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    const remoteUrl = cp.execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/https:\/\/(?:([^:]+)@)?github\.com/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (_) {}
  return null;
}

async function getOrCreateRelease(tag, pat) {
  const getUrl = `https://api.github.com/repos/${REPO}/releases/tags/${tag}`;
  const res = await fetch(getUrl, {
    headers: {
      'Authorization': `token ${pat}`,
      'User-Agent': 'Antigravity-Agent',
    },
  });

  if (res.ok) {
    const json = await res.json();
    console.log(`📦 Найден существующий релиз: ${json.name} (ID: ${json.id})`);
    return json;
  }

  if (res.status === 404) {
    console.log(`🆕 Создание нового GitHub Release [${tag}]...`);
    const createUrl = `https://api.github.com/repos/${REPO}/releases`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Antigravity-Agent',
      },
      body: JSON.stringify({
        tag_name: tag,
        name: `🎬 Медиа-пакет Фабрики: 20 Кампаний (${tag})`,
        body: `Смонтированные мастер-видеоролики 1:1 и 9:16 первых 20 кампаний контент-фабрики «Ульпан Алеф».`,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Ошибка создания релиза: ${createRes.status} - ${await createRes.text()}`);
    }
    const created = await createRes.json();
    console.log(`✅ Создан релиз: ${created.name} (ID: ${created.id})`);
    return created;
  }

  throw new Error(`Ошибка запроса релиза: ${res.status} - ${await res.text()}`);
}

async function uploadAsset(filePath, filename, release, pat) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ⚠️ Файл не найден локально: ${filePath}`);
    return null;
  }

  const fileStats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  const existingAsset = release.assets?.find((a) => a.name === filename);
  if (existingAsset) {
    if (existingAsset.size === fileStats.size) {
      console.log(`  ⏭️ ${filename} уже загружен (${(fileStats.size / 1024 / 1024).toFixed(2)} MB), пропускаем.`);
      return existingAsset.browser_download_url;
    }
    console.log(`  🔄 Удаление устаревшей версии ${filename}...`);
    await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${pat}`,
        'User-Agent': 'Antigravity-Agent',
      },
    });
  }

  console.log(`  ⏳ Загрузка ${filename} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)...`);
  const uploadUrl = `https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(filename)}`;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`  🔄 Повторная попытка ${attempt}/4 для ${filename}...`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `token ${pat}`,
          'Content-Type': 'video/mp4',
          'Content-Length': String(fileStats.size),
          'User-Agent': 'Antigravity-Agent',
        },
        body: fileBuffer,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }

      const json = await res.json();
      console.log(`  ✅ Загружен: ${filename} -> ${json.browser_download_url}`);
      return json.browser_download_url;
    } catch (err) {
      console.warn(`  ⚠️ Попытка ${attempt} завершилась ошибкой: ${err.message}`);
      if (attempt === 4) throw err;
    }
  }

  return `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${filename}`;
}

function parseTimeToIso(dateStr, timeStr) {
  // dateStr = "2026-10-05", timeStr = "08:15 IST"
  const timeClean = timeStr.split(' ')[0]; // "08:15"
  const [hours, minutes] = timeClean.split(':');
  // IST is UTC+3 in October (IDT)
  const padH = hours.padStart(2, '0');
  const padM = minutes.padStart(2, '0');
  return `${dateStr}T${padH}:${padM}:00.000+03:00`;
}

async function main() {
  console.log('=============================================================');
  console.log('🚀 ВЫГРУЗКА И АКТИВАЦИЯ 20 КАМПАНИЙ ФАБРИКИ НА CDN И БОЕВОЙ СЕРВЕР');
  console.log('=============================================================\n');

  const pat = getGithubToken();
  if (!pat) {
    throw new Error('GitHub Personal Access Token не найден в git remote origin или переменных окружения!');
  }

  const release = await getOrCreateRelease(RELEASE_TAG, pat);
  const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'));
  const schedule = JSON.parse(fs.readFileSync(SCHEDULE_PATH, 'utf8'));

  const cdnMap = {};

  console.log(`\n1️⃣ Загрузка 40 мастер-видео на GitHub Releases CDN...`);
  for (let i = 0; i < scenarios.length; i++) {
    const sc = scenarios[i];
    const campDir = path.resolve(CAMPAIGNS_DIR, sc.id);
    const sqFile = path.resolve(campDir, 'video_square_1080x1080.mp4');
    const vertFile = path.resolve(campDir, 'video_vertical_1080x1920.mp4');

    console.log(`\n[${i + 1}/20] Кампания: ${sc.id} («${sc.topic}»)...`);

    const sqName = `${sc.id}_square.mp4`;
    const vertName = `${sc.id}_vertical.mp4`;

    const sqUrl = await uploadAsset(sqFile, sqName, release, pat);
    const vertUrl = await uploadAsset(vertFile, vertName, release, pat);

    cdnMap[sc.id] = { square: sqUrl, vertical: vertUrl };
  }

  console.log(`\n2️⃣ Формирование публикаций с расписанием и CDN-ссылками...`);
  let publications = [];
  if (fs.existsSync(PUBLICATIONS_PATH)) {
    publications = JSON.parse(fs.readFileSync(PUBLICATIONS_PATH, 'utf8'));
  }

  let scheduledCount = 0;

  for (const sc of scenarios) {
    const campDir = path.resolve(CAMPAIGNS_DIR, sc.id);
    const schedItem = schedule.find(s => s.scenarioId === sc.id);
    const scheduledDate = schedItem?.scheduledDate || '2026-10-05';
    const scheduledTime = schedItem?.scheduledTime || '09:00 IST';
    const scheduledAtIso = parseTimeToIso(scheduledDate, scheduledTime);

    const fbText = fs.existsSync(path.resolve(campDir, 'post_facebook.txt'))
      ? fs.readFileSync(path.resolve(campDir, 'post_facebook.txt'), 'utf8')
      : '';
    const tgHtml = fs.existsSync(path.resolve(campDir, 'post_telegram.html'))
      ? fs.readFileSync(path.resolve(campDir, 'post_telegram.html'), 'utf8')
      : '';
    const igText = fs.existsSync(path.resolve(campDir, 'post_instagram.txt'))
      ? fs.readFileSync(path.resolve(campDir, 'post_instagram.txt'), 'utf8')
      : '';
    const ytText = fs.existsSync(path.resolve(campDir, 'post_youtube_shorts.txt'))
      ? fs.readFileSync(path.resolve(campDir, 'post_youtube_shorts.txt'), 'utf8')
      : '';

    const sqCdn = cdnMap[sc.id]?.square || `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${sc.id}_square.mp4`;
    const vertCdn = cdnMap[sc.id]?.vertical || `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${sc.id}_vertical.mp4`;

    // 1. Facebook
    const fbPub = {
      id: `pub-fb-${sc.id}`,
      date: scheduledDate,
      channel: 'facebook',
      channelAccount: 'Ulpana - Иврит без паники',
      format: 'short_video',
      title: `${sc.badge}: 4 фразы на иврите`,
      campaignTitle: sc.topic,
      version: 'v1.0',
      videoPath: sqCdn,
      caption: fbText,
      targetDeepLink: `/lesson/${sc.lessonRef}`,
      promoCode: 'FB_POST',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${sc.lessonRef}?promo=FB_POST&utm_source=facebook&utm_medium=video&utm_campaign=${sc.id}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: scheduledAtIso,
      notes: `Zero-Link протокол (ссылка в первом комменте) • Фабрика 2026`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Telegram
    const tgPub = {
      id: `pub-tg-${sc.id}`,
      date: scheduledDate,
      channel: 'telegram',
      channelAccount: '@ulpana_il',
      format: 'short_video',
      title: `${sc.badge}: 4 фразы на иврите`,
      campaignTitle: sc.topic,
      version: 'v1.0',
      videoPath: sqCdn,
      caption: tgHtml,
      targetDeepLink: `/lesson/${sc.lessonRef}`,
      promoCode: 'TG',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${sc.lessonRef}?promo=TG&utm_source=telegram&utm_medium=channel&utm_campaign=${sc.id}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: scheduledAtIso,
      notes: `Видео 1:1 + HTML + Инлайн-кнопка промокода TG • Фабрика 2026`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. YouTube Shorts
    const ytPub = {
      id: `pub-yt-${sc.id}`,
      date: scheduledDate,
      channel: 'youtube',
      channelAccount: 'Ульпан Алеф',
      format: 'short_video',
      title: `${sc.titleLine1} ${sc.titleLine2} | Иврит без паники`,
      campaignTitle: sc.topic,
      version: 'v1.0',
      videoPath: vertCdn,
      caption: ytText,
      targetDeepLink: `/lesson/${sc.lessonRef}`,
      promoCode: 'YOUTUBE',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${sc.lessonRef}?promo=YOUTUBE&utm_source=youtube&utm_medium=shorts&utm_campaign=${sc.id}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: scheduledAtIso,
      notes: `Вертикал 9:16 + таймкоды фраз • Фабрика 2026`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Instagram
    const igPub = {
      id: `pub-ig-${sc.id}`,
      date: scheduledDate,
      channel: 'instagram',
      channelAccount: 'Instagram @ulpana_alef',
      format: 'carousel',
      title: `${sc.badge}: 4 фразы на иврите`,
      campaignTitle: sc.topic,
      version: 'v1.0',
      videoPath: vertCdn,
      caption: igText,
      targetDeepLink: `/lesson/${sc.lessonRef}`,
      promoCode: 'INSTA',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${sc.lessonRef}?promo=INSTA&utm_source=instagram&utm_medium=carousel&utm_campaign=${sc.id}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: scheduledAtIso,
      notes: `Карусель 5 слайдов 1:1 + Reels 9:16 • Фабрика 2026`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    [fbPub, tgPub, ytPub, igPub].forEach(p => {
      const idx = publications.findIndex(ex => ex.id === p.id);
      if (idx >= 0) {
        publications[idx] = { ...publications[idx], ...p, updatedAt: new Date().toISOString() };
      } else {
        publications.unshift(p);
      }
      scheduledCount++;
    });
  }

  fs.writeFileSync(PUBLICATIONS_PATH, JSON.stringify(publications, null, 2), 'utf8');
  console.log(`✅ Записано ${scheduledCount} публикаций в publications.json!`);

  console.log(`\n3️⃣ Синхронизация с src/data/marketingPublicationsData.ts...`);
  cp.execSync(`node "${SYNC_SCRIPT}"`, { stdio: 'inherit' });

  console.log(`\n🎉 ВСЕ 20 КАМПАНИЙ УСПЕШНО ВЫГРУЖЕНЫ НА CDN И ПЕРЕВЕДЕНЫ В СТАТУС SCHEDULED!`);
}

main().catch(err => {
  console.error('\n❌ Ошибка выгрузки кампаний:', err.message);
  process.exit(1);
});
