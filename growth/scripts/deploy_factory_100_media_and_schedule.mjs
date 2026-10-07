import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CODEX_ROOT = 'C:/Users/azrie/.codex/Ulpana2';
const VIEWING_INDEX_PATH = path.join(CODEX_ROOT, 'growth/video-factory/production-100/viewing-index.json');
const PUBLICATIONS_JSON = path.resolve(ROOT, 'growth/data/publications.json');

const REPO = 'OlatolaIL/ulpana-hebrew';
const RELEASE_TAG = 'v-media-factory-100';

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
        name: `🎬 Видеофабрика: 100 глагольных уроков (${tag})`,
        body: `100 видеороликов «Глагол → Предложение → Форма → Корень» для ежедневного вещания в YouTube Shorts, Telegram, Instagram.`,
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

export async function run() {
  console.log('🚀 Старт выгрузки 100 уроков на GitHub Releases CDN и генерации расписания...');
  const pat = getGithubToken();
  if (!pat) {
    throw new Error('Не найден GitHub Token в git remote origin');
  }

  if (!fs.existsSync(VIEWING_INDEX_PATH)) {
    throw new Error(`Файл не найден: ${VIEWING_INDEX_PATH}`);
  }

  const viewingIndex = JSON.parse(fs.readFileSync(VIEWING_INDEX_PATH, 'utf8'));
  const episodes = viewingIndex.episodes;
  console.log(`📋 Загружен индекс: ${episodes.length} уроков.`);

  const release = await getOrCreateRelease(RELEASE_TAG, pat);

  // Свежий список ассетов
  const refreshRes = await fetch(`https://api.github.com/repos/${REPO}/releases/${release.id}`, {
    headers: { 'Authorization': `token ${pat}`, 'User-Agent': 'Antigravity-Agent' },
  });
  const currentRelease = refreshRes.ok ? await refreshRes.json() : release;

  const cdnUrls = {};
  let uploadedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    const assetName = `${ep.id}.mp4`;
    let sourcePath = path.join(CODEX_ROOT, ep.source_mp4);

    if (!fs.existsSync(sourcePath)) {
      sourcePath = path.join(
        CODEX_ROOT,
        'growth/video-factory/episodes',
        ep.id,
        'revisions',
        ep.revision,
        `${ep.id}_${ep.revision}.mp4`
      );
    }

    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Файл не найден для ${ep.id}: ${sourcePath}`);
      continue;
    }

    const existingAsset = currentRelease.assets?.find((a) => a.name === assetName);
    const fileStats = fs.statSync(sourcePath);

    if (existingAsset && existingAsset.size === fileStats.size) {
      cdnUrls[ep.id] = existingAsset.browser_download_url;
      skippedCount++;
    } else {
      console.log(`[${i + 1}/${episodes.length}] Обработка ${ep.id}...`);
      const downloadUrl = await uploadAsset(sourcePath, assetName, currentRelease, pat);
      if (downloadUrl) {
        cdnUrls[ep.id] = downloadUrl;
        uploadedCount++;
      }
    }
  }

  console.log(`\n🎉 Загрузка ассетов завершена! Загружено: ${uploadedCount}, Уже было на CDN: ${skippedCount}`);

  // Вспомогательный парсер черновиков платформенных текстов
  function parseDraftMarkdown(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const sections = {};
    let currentSection = null;
    const lines = content.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        sections[currentSection] = [];
      } else if (currentSection) {
        sections[currentSection].push(rawLine);
      }
    }
    const result = {};
    for (const [key, valLines] of Object.entries(sections)) {
      result[key] = valLines.join('\n').trim();
    }
    return result;
  }

  // Генерация записей публикаций
  console.log('\n📅 Генерация 100-дневного расписания публикаций на ВСЕ 5 платформ (вечерний слот 18:30 IL)...');
  
  let existingPubs = [];
  if (fs.existsSync(PUBLICATIONS_JSON)) {
    existingPubs = JSON.parse(fs.readFileSync(PUBLICATIONS_JSON, 'utf8'));
  }

  const startDate = new Date('2026-10-08T18:30:00+03:00'); // Старт завтра вечером
  const newPubs = [];

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    const cdnUrl = cdnUrls[ep.id] || `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${ep.id}.mp4`;

    const schedDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const ymd = schedDate.toISOString().split('T')[0];
    const isoSched = `${ymd}T18:30:00.000+03:00`;

    const genDir = path.join(
      CODEX_ROOT,
      'growth/video-factory/episodes',
      ep.id,
      'revisions',
      ep.revision,
      'generated'
    );

    const parsedYt = parseDraftMarkdown(path.join(genDir, 'youtube.md'));
    const parsedTg = parseDraftMarkdown(path.join(genDir, 'telegram.md'));
    const parsedIg = parseDraftMarkdown(path.join(genDir, 'instagram.md'));
    const parsedTt = parseDraftMarkdown(path.join(genDir, 'tiktok.md'));
    const parsedFb = parseDraftMarkdown(path.join(genDir, 'facebook.md'));

    const commonNotes = `Урок ${i + 1} (${ep.verb}) • Фабрика 100 • Вечерний эфир 18:30`;

    // 1. YouTube Shorts
    const ytTitle = parsedYt?.['Заголовок или первая строка'] || `${ep.verb} в предложении и семья корня | Иврит с Ульпаной`;
    const ytStudy = parsedYt?.['Учебный блок'] || `«${ep.sentence}»`;
    const ytCaption = `${ytTitle}\n\n${ytStudy}\n\n💡 Тренируйте живые диалоги в приложении «Ульпан Алеф»:\n👉 https://ulpana-hebrew.vercel.app/?promo=YOUTUBE\n\n#Shorts #иврит #ульпан #израиль #ульпаналеф`;
    const ytId = `pub-yt-${ep.id.toLowerCase()}`;
    const ytItem = {
      id: ytId,
      date: ymd,
      channel: 'youtube',
      channelAccount: 'Ульпан Алеф',
      format: 'short_video',
      title: ytTitle,
      campaignTitle: `100 уроков: ${ep.verb}`,
      version: ep.revision,
      videoPath: cdnUrl,
      caption: ytCaption,
      targetDeepLink: `/lesson/${i + 1}`,
      promoCode: 'YOUTUBE',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/?promo=YOUTUBE&utm_source=youtube&utm_medium=shorts&utm_campaign=${ep.id.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: commonNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Telegram
    const tgHeader = parsedTg?.['Заголовок или первая строка'] || 'тренировка памяти и речи';
    const tgStudy = parsedTg?.['Учебный блок'] || `«${ep.sentence}»`;
    const tgCaption = `🎬 <b>${ep.verb} в предложении</b>\n\n${tgStudy}\n\n💡 Попробуйте повторить фразу вслух и проверьте себя в приложении:\n👉 https://ulpana-hebrew.vercel.app/?promo=TG`;
    const tgId = `pub-tg-${ep.id.toLowerCase()}`;
    const tgItem = {
      id: tgId,
      date: ymd,
      channel: 'telegram',
      channelAccount: '@ulpana_il',
      format: 'short_video',
      title: `${ep.verb} — ${tgHeader}`,
      campaignTitle: `100 уроков: ${ep.verb}`,
      version: ep.revision,
      videoPath: cdnUrl,
      caption: tgCaption,
      targetDeepLink: `/lesson/${i + 1}`,
      promoCode: 'TG',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/?promo=TG&utm_source=telegram&utm_medium=channel&utm_campaign=${ep.id.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: commonNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Instagram Reels
    const igHeader = parsedIg?.['Заголовок или первая строка'] || 'Сможете сказать целую фразу на иврите за 5 секунд?';
    const igStudy = parsedIg?.['Учебный блок'] || `«${ep.sentence}»`;
    const igCaption = `${igHeader}\n\n${igStudy}\n\n💡 Тренируйте живую речь и звонки в приложении «Ульпан Алеф»!\n🎁 Промокод на 30 дней: INSTA\n👉 Ссылка в шапке профиля @ulpana_alef\n\n#иврит #учимиврит #ульпан #ульпаналеф #израиль #репатриация #reels`;
    const igId = `pub-ig-${ep.id.toLowerCase()}`;
    const igItem = {
      id: igId,
      date: ymd,
      channel: 'instagram',
      channelAccount: 'Instagram @ulpana_alef',
      format: 'short_video',
      title: `${ep.verb}: ${igHeader}`,
      campaignTitle: `100 уроков: ${ep.verb}`,
      version: ep.revision,
      videoPath: cdnUrl,
      caption: igCaption,
      targetDeepLink: `/lesson/${i + 1}`,
      promoCode: 'INSTA',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/?promo=INSTA&utm_source=instagram&utm_medium=reels&utm_campaign=${ep.id.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: commonNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. TikTok
    const ttHeader = parsedTt?.['Заголовок или первая строка'] || 'Вспомните глагол и скажите фразу до появления ответа';
    const ttStudy = parsedTt?.['Учебный блок'] || `«${ep.sentence}»`;
    const ttCaption = `${ttHeader} 🇮🇱\n\n${ttStudy}\n\n🔥 Тренируйтесь в приложении «Ульпан Алеф» (промокод: TIKTOK)\n#иврит #учимиврит #ульпаналеф #израиль #shorts`;
    const ttId = `pub-tt-${ep.id.toLowerCase()}`;
    const ttItem = {
      id: ttId,
      date: ymd,
      channel: 'tiktok',
      channelAccount: 'TikTok @ulpana_alef',
      format: 'short_video',
      title: `${ep.verb}: ${ttHeader}`,
      campaignTitle: `100 уроков: ${ep.verb}`,
      version: ep.revision,
      videoPath: cdnUrl,
      caption: ttCaption,
      targetDeepLink: `/lesson/${i + 1}`,
      promoCode: 'TIKTOK',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/?promo=TIKTOK&utm_source=tiktok&utm_medium=short&utm_campaign=${ep.id.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: commonNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Facebook Reels
    const fbHeader = parsedFb?.['Заголовок или первая строка'] || 'Как связать глагол, предложение и семью слов на иврите';
    const fbStudy = parsedFb?.['Учебный блок'] || `«${ep.sentence}»`;
    const fbCaption = `${fbHeader}\n\n${fbStudy}\n\n💡 Тренируйте живые диалоги и звонки в приложении «Ульпан Алеф»:\n👉 https://ulpana-hebrew.vercel.app/?promo=FB\n\n#иврит #ульпан #израиль #ульпаналеф #репатриация`;
    const fbId = `pub-fb-${ep.id.toLowerCase()}`;
    const fbItem = {
      id: fbId,
      date: ymd,
      channel: 'facebook',
      channelAccount: 'Ulpana - Иврит без паники',
      format: 'short_video',
      title: `${ep.verb}: ${fbHeader}`,
      campaignTitle: `100 уроков: ${ep.verb}`,
      version: ep.revision,
      videoPath: cdnUrl,
      caption: fbCaption,
      targetDeepLink: `/lesson/${i + 1}`,
      promoCode: 'FB',
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/?promo=FB&utm_source=facebook&utm_medium=reels&utm_campaign=${ep.id.toLowerCase()}`,
      livePostUrl: '',
      status: 'scheduled',
      scheduledAt: isoSched,
      notes: commonNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newPubs.push(ytItem, tgItem, igItem, ttItem, fbItem);
  }

  // Обновляем существующие или добавляем новые
  const pubMap = new Map();
  existingPubs.forEach((p) => pubMap.set(p.id, p));
  newPubs.forEach((p) => pubMap.set(p.id, p)); // перезаписываем / добавляем

  const mergedPubs = Array.from(pubMap.values());
  fs.writeFileSync(PUBLICATIONS_JSON, JSON.stringify(mergedPubs, null, 2), 'utf8');
  console.log(`💾 Сохранено ${mergedPubs.length} публикаций в ${PUBLICATIONS_JSON} (+${newPubs.length} новых записей).`);

  // Синхронизация TS
  console.log('🔄 Синхронизация с marketingPublicationsData.ts...');
  cp.execSync('node scripts/sync_marketing_publications_ts.cjs', { cwd: ROOT, stdio: 'inherit' });

  console.log('✅ Генерация расписания и CDN-пакета успешно завершена!');
}

run().catch((e) => {
  console.error('❌ Ошибка выполнения:', e);
  process.exit(1);
});
