import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const MAIN_DIR = 'C:/Users/azrie/.codex/Ulpana2/growth/video-factory/production-additional-100/handoff/new100/main';
const PUBLICATIONS_JSON = path.resolve(ROOT, 'growth/data/publications.json');
const SYNC_TS_SCRIPT = path.resolve(ROOT, 'scripts/sync_marketing_publications_ts.cjs');

const REPO = 'OlatolaIL/ulpana-hebrew';
const RELEASE_TAG = 'v-media-factory-200';

function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const remoteUrl = cp.execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/https:\/\/(?:([^:]+)@)?github\.com/);
    if (match && match[1] && match[1].startsWith('github_pat_')) {
      return match[1];
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
    console.log(`📦 Найден существующий релиз: ${json.name} (ID: ${json.id}, Assets: ${json.assets?.length || 0})`);
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
        name: `🎬 Видеофабрика: Вторая сотня уроков (${tag})`,
        body: `100 видеороликов «Диалоги и грамматика» (ULP-0113..ULP-0212) для дневного вещания в YouTube Shorts, Telegram, Instagram, TikTok, Facebook.`,
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

async function uploadAsset(filePath, assetName, release, pat) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ⚠️ Файл не найден: ${filePath}`);
    return null;
  }

  const fileStats = fs.statSync(filePath);
  const existingAsset = release.assets?.find((a) => a.name === assetName);

  if (existingAsset) {
    if (existingAsset.size === fileStats.size) {
      return existingAsset.browser_download_url;
    }
    console.log(`  🔄 Обновление актива ${assetName} (размер изменился: ${existingAsset.size} -> ${fileStats.size})...`);
    await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${pat}`,
        'User-Agent': 'Antigravity-Agent',
      },
    });
  }

  console.log(`  ⏳ Загрузка ${assetName} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)...`);
  const fileBuffer = fs.readFileSync(filePath);
  const uploadUrl = `https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(assetName)}`;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`  🔄 Повторная попытка ${attempt}/4 для ${assetName}...`);
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
        console.error(`  ❌ Ошибка загрузки ${assetName}: HTTP ${res.status} - ${err}`);
        if (res.status >= 500 || res.status === 429) continue;
        return null;
      }

      const json = await res.json();
      console.log(`  ✅ Загружен: ${json.name} -> ${json.browser_download_url}`);
      return json.browser_download_url;
    } catch (err) {
      console.warn(`  ⚠️ Сбой сети при загрузке ${assetName}: ${err.message}. Попытка ${attempt}/4...`);
    }
  }

  return null;
}

function injectPromo(text, promo) {
  return text.replace(/(https?:\/\/)?(ulpana-hebrew\.vercel\.app[^\s\r\n]*)/g, (match, proto, domainAndPath) => {
    if (match.includes('promo=')) return match;
    const separator = domainAndPath.includes('?') ? '&' : '?';
    return (proto || '') + domainAndPath + separator + 'promo=' + promo;
  });
}

export async function run() {
  console.log('🚀 Старт выгрузки второй сотни (100 уроков) на GitHub Releases CDN [v-media-factory-200]...');
  const pat = getGithubToken();
  if (!pat) {
    throw new Error('Не найден GitHub Token в git remote origin');
  }

  if (!fs.existsSync(MAIN_DIR)) {
    throw new Error(`Папка не найдена: ${MAIN_DIR}`);
  }

  const episodeDirs = fs.readdirSync(MAIN_DIR)
    .filter((f) => fs.statSync(path.join(MAIN_DIR, f)).isDirectory())
    .sort();

  console.log(`📋 Найдено папок уроков: ${episodeDirs.length} (от ${episodeDirs[0]} до ${episodeDirs[episodeDirs.length - 1]}).`);

  const release = await getOrCreateRelease(RELEASE_TAG, pat);

  // Свежий список ассетов
  const refreshRes = await fetch(`https://api.github.com/repos/${REPO}/releases/${release.id}`, {
    headers: { 'Authorization': `token ${pat}`, 'User-Agent': 'Antigravity-Agent' },
  });
  const currentRelease = refreshRes.ok ? await refreshRes.json() : release;

  const cdnUrls = {};
  let uploadedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < episodeDirs.length; i++) {
    const epId = episodeDirs[i];
    const epDir = path.join(MAIN_DIR, epId);
    const files = fs.readdirSync(epDir);
    const mp4File = files.find((f) => f.endsWith('.mp4'));

    if (!mp4File) {
      console.error(`❌ В папке ${epId} не найден MP4 файл!`);
      continue;
    }

    const sourcePath = path.join(epDir, mp4File);
    const assetName = `${epId}.mp4`;
    const existingAsset = currentRelease.assets?.find((a) => a.name === assetName);
    const fileStats = fs.statSync(sourcePath);

    if (existingAsset && existingAsset.size === fileStats.size) {
      cdnUrls[epId] = existingAsset.browser_download_url;
      skippedCount++;
    } else {
      console.log(`[${i + 1}/${episodeDirs.length}] Выгрузка ${epId} (${assetName})...`);
      const downloadUrl = await uploadAsset(sourcePath, assetName, currentRelease, pat);
      if (downloadUrl) {
        cdnUrls[epId] = downloadUrl;
        uploadedCount++;
      }
    }
  }

  console.log(`\n🎉 Выгрузка MP4 на CDN завершена! Загружено новых: ${uploadedCount}, Уже было: ${skippedCount}`);

  // Генерация 100-дневного расписания на дневной слот 13:30 IL
  console.log('\n📅 Генерация 100-дневного расписания публикаций на ВСЕ 5 платформ (дневной слот 13:30 IL)...');

  let existingPubs = [];
  if (fs.existsSync(PUBLICATIONS_JSON)) {
    existingPubs = JSON.parse(fs.readFileSync(PUBLICATIONS_JSON, 'utf8'));
  }

  const startDate = new Date('2026-10-08T13:30:00+03:00'); // Старт 8 октября 2026 в 13:30 IL
  const newPubs = [];

  for (let i = 0; i < episodeDirs.length; i++) {
    const epId = episodeDirs[i];
    const epDir = path.join(MAIN_DIR, epId);
    const cdnUrl = cdnUrls[epId] || `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${epId}.mp4`;

    const schedDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const ymd = schedDate.toISOString().split('T')[0];
    const isoSched = `${ymd}T13:30:00.000+03:00`;

    // Читаем готовые текстовые файлы
    const rawYtTitle = fs.existsSync(path.join(epDir, 'youtube-title.txt'))
      ? fs.readFileSync(path.join(epDir, 'youtube-title.txt'), 'utf8').trim()
      : `Диалог ${epId} | Иврит без паники`;

    const rawYtDesc = fs.existsSync(path.join(epDir, 'youtube-description.txt'))
      ? fs.readFileSync(path.join(epDir, 'youtube-description.txt'), 'utf8').trim()
      : '';

    const rawTg = fs.existsSync(path.join(epDir, 'telegram.txt'))
      ? fs.readFileSync(path.join(epDir, 'telegram.txt'), 'utf8').trim()
      : '';

    const rawIg = fs.existsSync(path.join(epDir, 'instagram.txt'))
      ? fs.readFileSync(path.join(epDir, 'instagram.txt'), 'utf8').trim()
      : '';

    const rawTt = fs.existsSync(path.join(epDir, 'tiktok.txt'))
      ? fs.readFileSync(path.join(epDir, 'tiktok.txt'), 'utf8').trim()
      : '';

    const rawFb = fs.existsSync(path.join(epDir, 'facebook.txt'))
      ? fs.readFileSync(path.join(epDir, 'facebook.txt'), 'utf8').trim()
      : '';

    // Определяем deepLink из описания
    const linkMatch = rawYtDesc.match(/ulpana-hebrew\.vercel\.app(\/[^\s\r\n]*)?/) ||
                      rawTg.match(/ulpana-hebrew\.vercel\.app(\/[^\s\r\n]*)?/);
    const targetDeepLink = (linkMatch && linkMatch[1]) ? linkMatch[1].trim() : '/';
    const deepLinkPath = targetDeepLink !== '/' ? targetDeepLink : '';

    const commonNotes = `Урок ${epId} • Фабрика 200 (Вторая сотня) • Дневной эфир 13:30`;

    // 1. YouTube Shorts (Промокод: YT)
    const ytCaption = injectPromo(rawYtDesc, 'YT');
    const ytId = `pub-yt-${epId.toLowerCase()}`;
    const ytItem = {
      id: ytId,
      date: ymd,
      channel: 'youtube',
      channelAccount: 'Ульпан Алеф',
      format: 'short_video',
      title: rawYtTitle,
      campaignTitle: `Вторая сотня: ${epId}`,
      version: 'v1.0',
      videoPath: cdnUrl,
      caption: ytCaption,
      targetDeepLink,
      promoCode: 'YT',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app${deepLinkPath}?promo=YT&utm_source=youtube&utm_medium=shorts&utm_campaign=${epId.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: `${commonNotes} • промокод YT`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Telegram (Промокод: TG)
    const tgCaption = injectPromo(rawTg, 'TG');
    const tgLines = rawTg.split('\n').map((l) => l.trim()).filter(Boolean);
    const tgTitle = tgLines[0] || rawYtTitle;
    const tgId = `pub-tg-${epId.toLowerCase()}`;
    const tgItem = {
      id: tgId,
      date: ymd,
      channel: 'telegram',
      channelAccount: '@ulpana_il',
      format: 'short_video',
      title: tgTitle,
      campaignTitle: `Вторая сотня: ${epId}`,
      version: 'v1.0',
      videoPath: cdnUrl,
      caption: tgCaption,
      targetDeepLink,
      promoCode: 'TG',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app${deepLinkPath}?promo=TG&utm_source=telegram&utm_medium=channel&utm_campaign=${epId.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: `${commonNotes} • промокод TG`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Instagram Reels (Промокод: INSTA)
    const igCaption = injectPromo(rawIg, 'INSTA');
    const igLines = rawIg.split('\n').map((l) => l.trim()).filter(Boolean);
    const igTitle = igLines[0] || rawYtTitle;
    const igId = `pub-ig-${epId.toLowerCase()}`;
    const igItem = {
      id: igId,
      date: ymd,
      channel: 'instagram',
      channelAccount: 'Instagram @ulpana_alef',
      format: 'short_video',
      title: igTitle,
      campaignTitle: `Вторая сотня: ${epId}`,
      version: 'v1.0',
      videoPath: cdnUrl,
      caption: igCaption,
      targetDeepLink,
      promoCode: 'INSTA',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app${deepLinkPath}?promo=INSTA&utm_source=instagram&utm_medium=reels&utm_campaign=${epId.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: `${commonNotes} • промокод INSTA`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. TikTok (Промокод: TIKTOK)
    const ttCaption = injectPromo(rawTt, 'TIKTOK');
    const ttLines = rawTt.split('\n').map((l) => l.trim()).filter(Boolean);
    const ttTitle = ttLines[0] || rawYtTitle;
    const ttId = `pub-tt-${epId.toLowerCase()}`;
    const ttItem = {
      id: ttId,
      date: ymd,
      channel: 'tiktok',
      channelAccount: 'TikTok @ulpana_alef',
      format: 'short_video',
      title: ttTitle,
      campaignTitle: `Вторая сотня: ${epId}`,
      version: 'v1.0',
      videoPath: cdnUrl,
      caption: ttCaption,
      targetDeepLink,
      promoCode: 'TIKTOK',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app${deepLinkPath}?promo=TIKTOK&utm_source=tiktok&utm_medium=short&utm_campaign=${epId.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: `${commonNotes} • промокод TIKTOK`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Facebook Reels (Промокод: FB)
    const fbCaption = injectPromo(rawFb, 'FB');
    const fbLines = rawFb.split('\n').map((l) => l.trim()).filter(Boolean);
    const fbTitle = fbLines[0] || rawYtTitle;
    const fbId = `pub-fb-${epId.toLowerCase()}`;
    const fbItem = {
      id: fbId,
      date: ymd,
      channel: 'facebook',
      channelAccount: 'Ulpana - Иврит без паники',
      format: 'short_video',
      title: fbTitle,
      campaignTitle: `Вторая сотня: ${epId}`,
      version: 'v1.0',
      videoPath: cdnUrl,
      caption: fbCaption,
      targetDeepLink,
      promoCode: 'FB',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app${deepLinkPath}?promo=FB&utm_source=facebook&utm_medium=reels&utm_campaign=${epId.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: `${commonNotes} • промокод FB`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newPubs.push(ytItem, tgItem, igItem, ttItem, fbItem);
  }

  // Обновляем существующие или добавляем новые
  const pubMap = new Map();
  existingPubs.forEach((p) => pubMap.set(p.id, p));
  newPubs.forEach((p) => {
    if (pubMap.has(p.id)) {
      const existing = pubMap.get(p.id);
      const preserveStatus = existing.status === 'published';
      pubMap.set(p.id, {
        ...existing,
        ...p,
        status: preserveStatus ? 'published' : p.status,
        updatedAt: new Date().toISOString(),
      });
    } else {
      pubMap.set(p.id, p);
    }
  });

  const mergedPubs = Array.from(pubMap.values());
  fs.writeFileSync(PUBLICATIONS_JSON, JSON.stringify(mergedPubs, null, 2), 'utf8');
  console.log(`💾 Сохранено ${mergedPubs.length} публикаций в ${PUBLICATIONS_JSON} (+${newPubs.length} новых записей на дневной слот 13:30 IL).`);

  // Синхронизация TS
  console.log('🔄 Синхронизация с marketingPublicationsData.ts...');
  cp.execSync('node scripts/sync_marketing_publications_ts.cjs', { cwd: ROOT, stdio: 'inherit' });

  console.log('✅ Вторая сотня уроков успешно развернута на CDN и добавлена в расписание!');
}

run().catch((e) => {
  console.error('❌ Ошибка выполнения:', e);
  process.exit(1);
});
