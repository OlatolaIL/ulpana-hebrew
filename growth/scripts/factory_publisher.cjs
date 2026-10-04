/**
 * Единый диспетчер автопостинга материалов фабрики в соцсети
 * («Ульпан Алеф» • Growth Engine)
 * 
 * Поддерживаемые сети:
 *   - Facebook (видео 1:1 + Zero-Link протокол в первом комментарии)
 *   - Telegram (@ulpana_il: видео 1:1 + HTML-пост + inline-кнопка)
 * 
 * Использование:
 *   node growth/scripts/factory_publisher.cjs --id=sc-01-kindergarten --preview
 *   node growth/scripts/factory_publisher.cjs --id=sc-01-kindergarten --send
 *   node growth/scripts/factory_publisher.cjs --id=sc-01-kindergarten --network=facebook --send
 *   node growth/scripts/factory_publisher.cjs --id=sc-01-kindergarten --network=telegram --send
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '../../');
const SCENARIOS_PATH = path.resolve(ROOT, 'growth/data/factory_scenarios_20.json');
const CAMPAIGNS_DIR = path.resolve(ROOT, 'growth/output/campaigns');
const PUBLICATIONS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const SYNC_SCRIPT = path.resolve(ROOT, 'scripts/sync_marketing_publications_ts.cjs');

// Загрузка переменных окружения
try {
  if (fs.existsSync(path.resolve(ROOT, '.env.local'))) {
    process.loadEnvFile(path.resolve(ROOT, '.env.local'));
  }
} catch (e) {
  try {
    const content = fs.readFileSync(path.resolve(ROOT, '.env.local'), 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) process.env[match[1]] = match[2] ? match[2].trim() : '';
    });
  } catch {}
}

const FB_PAGE_ID = process.env.FB_PAGE_ID?.trim();
const FB_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN?.trim();
const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TG_DEFAULT_CHAT = '@ulpana_il';

function registerPublicationEntry(entry) {
  try {
    let pubs = [];
    if (fs.existsSync(PUBLICATIONS_PATH)) {
      pubs = JSON.parse(fs.readFileSync(PUBLICATIONS_PATH, 'utf8'));
    }
    const existingIdx = pubs.findIndex(p => p.id === entry.id);
    if (existingIdx >= 0) {
      pubs[existingIdx] = { ...pubs[existingIdx], ...entry, updatedAt: new Date().toISOString() };
    } else {
      pubs.unshift({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    fs.writeFileSync(PUBLICATIONS_PATH, JSON.stringify(pubs, null, 2), 'utf8');
    console.log(`   📝 Запись внесена в publications.json (ID: ${entry.id})`);

    // Синхронизация с src/data/marketingPublicationsData.ts
    if (fs.existsSync(SYNC_SCRIPT)) {
      cp.execSync(`node "${SYNC_SCRIPT}"`, { stdio: 'ignore' });
      console.log(`   🔄 Синхронизировано с src/data/marketingPublicationsData.ts`);
    }
  } catch (err) {
    console.warn(`   ⚠️ Ошибка синхронизации реестра:`, err.message);
  }
}

async function publishToFacebook(scenario, campaignDir, isSend = false) {
  const videoFile = path.resolve(campaignDir, 'video_square_1080x1080.mp4');
  const postFile = path.resolve(campaignDir, 'post_facebook.txt');

  if (!fs.existsSync(videoFile)) throw new Error(`Видеофайл не найден: ${videoFile}`);
  if (!fs.existsSync(postFile)) throw new Error(`Текст поста не найден: ${postFile}`);

  const postText = fs.readFileSync(postFile, 'utf8');
  const firstComment = `👉 Интерактивный тренажёр живой речи (30 дней бесплатно по промокоду FB_POST):
https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=FB_POST&utm_source=facebook&utm_medium=video&utm_campaign=${scenario.id}`;

  console.log(`\n-------------------------------------------------------------`);
  console.log(`📘 FACEBOOK: ${scenario.topic}`);
  console.log(`-------------------------------------------------------------`);
  console.log(`🎥 Видео: ${videoFile} (${(fs.statSync(videoFile).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`📄 Текст (первые 120 символов): ${postText.slice(0, 120).replace(/\n/g, ' ')}...`);
  console.log(`💬 Zero-Link комментарий: ${firstComment}`);

  if (!isSend) {
    console.log(`👀 Dry-run режим. Отправка пропущена.`);
    return { ok: true, dryRun: true };
  }

  if (!FB_PAGE_ID || !FB_ACCESS_TOKEN) {
    throw new Error('FB_PAGE_ID или META_ACCESS_TOKEN отсутствуют в .env.local');
  }

  console.log(`🚀 Отправка видео на страницу Facebook (${FB_PAGE_ID})...`);
  const formData = new FormData();
  formData.append('access_token', FB_ACCESS_TOKEN);
  formData.append('title', `${scenario.badge}: 4 фразы на иврите`);
  formData.append('description', postText);
  const buffer = fs.readFileSync(videoFile);
  formData.append('source', new Blob([buffer], { type: 'video/mp4' }), path.basename(videoFile));

  const res = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(FB_PAGE_ID)}/videos`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Facebook API error: ${data.error ? data.error.message : JSON.stringify(data)}`);
  }

  const videoId = data.id;
  const liveUrl = `https://www.facebook.com/${videoId}`;
  console.log(`✅ Видео опубликовано в Facebook: ${liveUrl}`);

  // Zero-Link коммент
  try {
    const commentParams = new URLSearchParams();
    commentParams.append('message', firstComment);
    commentParams.append('access_token', FB_ACCESS_TOKEN);
    const commentRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(videoId)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: commentParams.toString()
    });
    const cData = await commentRes.json();
    if (cData.id) {
      console.log(`✅ Первый комментарий со ссылкой опубликован: ${cData.id}`);
    }
  } catch (cErr) {
    console.warn(`⚠️ Ошибка публикации первого комментария:`, cErr.message);
  }

  registerPublicationEntry({
    id: `pub-fb-${scenario.id}`,
    date: new Date().toISOString().split('T')[0],
    channel: 'facebook',
    channelAccount: 'Ulpana - Иврит без паники',
    format: 'video',
    title: `${scenario.badge}: 4 фразы на иврите`,
    targetDeepLink: `/lesson/${scenario.lessonRef}`,
    promoCode: 'FB_POST',
    fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=FB_POST&utm_source=facebook&utm_medium=video&utm_campaign=${scenario.id}`,
    livePostUrl: liveUrl,
    status: 'published',
    notes: `Автопостинг из фабрики: ${scenario.topic}`
  });

  return { ok: true, liveUrl, videoId };
}

async function publishToTelegram(scenario, campaignDir, isSend = false) {
  const videoFile = path.resolve(campaignDir, 'video_square_1080x1080.mp4');
  const postFile = path.resolve(campaignDir, 'post_telegram.html');

  if (!fs.existsSync(videoFile)) throw new Error(`Видеофайл не найден: ${videoFile}`);
  if (!fs.existsSync(postFile)) throw new Error(`HTML текст не найден: ${postFile}`);

  const postHtml = fs.readFileSync(postFile, 'utf8');
  const btnUrl = `https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=TG&utm_source=telegram&utm_medium=channel&utm_campaign=${scenario.id}`;

  console.log(`\n-------------------------------------------------------------`);
  console.log(`✈️ TELEGRAM: ${scenario.topic} -> ${TG_DEFAULT_CHAT}`);
  console.log(`-------------------------------------------------------------`);
  console.log(`🎥 Видео: ${videoFile} (${(fs.statSync(videoFile).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`📄 Текст (первые 120 символов): ${postHtml.slice(0, 120).replace(/\n/g, ' ')}...`);
  console.log(`🔘 Кнопка: [Начать практику (промокод TG)] -> ${btnUrl}`);

  if (!isSend) {
    console.log(`👀 Dry-run режим. Отправка пропущена.`);
    return { ok: true, dryRun: true };
  }

  if (!TG_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN отсутствует в .env.local');
  }

  console.log(`🚀 Отправка видео и текста в Telegram-канал ${TG_DEFAULT_CHAT}...`);
  const formData = new FormData();
  formData.append('chat_id', TG_DEFAULT_CHAT);
  const videoBuffer = fs.readFileSync(videoFile);
  formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), path.basename(videoFile));
  formData.append('caption', postHtml);
  formData.append('parse_mode', 'HTML');
  formData.append('supports_streaming', 'true');
  formData.append('reply_markup', JSON.stringify({
    inline_keyboard: [[{ text: '👉 Начать практику (промокод TG)', url: btnUrl }]]
  }));

  const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendVideo`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(`Telegram API error: ${data.description || JSON.stringify(data)}`);
  }

  const msgId = data.result.message_id;
  const channelName = TG_DEFAULT_CHAT.replace('@', '');
  const liveUrl = `https://t.me/${channelName}/${msgId}`;
  console.log(`✅ Видео опубликовано в Telegram: ${liveUrl}`);

  registerPublicationEntry({
    id: `pub-tg-${scenario.id}`,
    date: new Date().toISOString().split('T')[0],
    channel: 'telegram',
    channelAccount: '@ulpana_il',
    format: 'video',
    title: `${scenario.badge}: 4 фразы на иврите`,
    targetDeepLink: `/lesson/${scenario.lessonRef}`,
    promoCode: 'TG',
    fullUrlWithPromo: btnUrl,
    livePostUrl: liveUrl,
    status: 'published',
    notes: `Автопостинг из фабрики: ${scenario.topic}`
  });

  return { ok: true, liveUrl, messageId: msgId };
}

async function registerOtherPlatforms(scenario, campaignDir) {
  // Instagram package
  registerPublicationEntry({
    id: `pub-ig-${scenario.id}`,
    date: new Date().toISOString().split('T')[0],
    channel: 'instagram',
    channelAccount: 'Instagram @ulpana_alef',
    format: 'carousel',
    title: `${scenario.badge}: 4 фразы на иврите`,
    targetDeepLink: `/lesson/${scenario.lessonRef}`,
    promoCode: 'INSTA',
    fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=INSTA&utm_source=instagram&utm_medium=carousel&utm_campaign=${scenario.id}`,
    livePostUrl: '',
    status: 'ready',
    notes: `Карусель 5 слайдов 1:1 + Reel 9:16 + текст в growth/output/campaigns/${scenario.id}/`
  });

  // YouTube Shorts package
  registerPublicationEntry({
    id: `pub-yt-${scenario.id}`,
    date: new Date().toISOString().split('T')[0],
    channel: 'youtube',
    channelAccount: 'Ульпан Алеф',
    format: 'short_video',
    title: `${scenario.titleLine1} ${scenario.titleLine2} | Иврит без паники`,
    targetDeepLink: `/lesson/${scenario.lessonRef}`,
    promoCode: 'YOUTUBE',
    fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=YOUTUBE&utm_source=youtube&utm_medium=shorts&utm_campaign=${scenario.id}`,
    livePostUrl: '',
    status: 'ready',
    notes: `Вертикальное видео 9:16 + текст с таймкодами в growth/output/campaigns/${scenario.id}/`
  });

  // TikTok package
  registerPublicationEntry({
    id: `pub-tt-${scenario.id}`,
    date: new Date().toISOString().split('T')[0],
    channel: 'tiktok',
    channelAccount: 'TikTok @ulpana_alef',
    format: 'short_video',
    title: `${scenario.titleLine1} ${scenario.titleLine2} 🇮🇱`,
    targetDeepLink: `/lesson/${scenario.lessonRef}`,
    promoCode: 'TIKTOK',
    fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/#lesson-${scenario.lessonRef}?promo=TIKTOK&utm_source=tiktok&utm_medium=short&utm_campaign=${scenario.id}`,
    livePostUrl: '',
    status: 'ready',
    notes: `Вертикальное видео 9:16 в growth/output/campaigns/${scenario.id}/`
  });
}

async function main() {
  const args = process.argv.slice(2);
  const targetId = args.find(a => a.startsWith('--id='))?.split('=')[1] || 'sc-01-kindergarten';
  const network = args.find(a => a.startsWith('--network='))?.split('=')[1] || 'both';
  const isSend = args.includes('--send');

  const scenarios = JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'));
  const sc = scenarios.find(s => s.id === targetId);
  if (!sc) throw new Error(`Сценарий ${targetId} не найден в каталоге!`);

  const campaignDir = path.resolve(CAMPAIGNS_DIR, sc.id);
  if (!fs.existsSync(campaignDir)) {
    throw new Error(`Директория кампании ${campaignDir} не найдена! Сначала запустите фабрику: node growth/scripts/factory_engine.mjs --id=${sc.id}`);
  }

  console.log(`\n=============================================================`);
  console.log(`📡 ДИСПЕТЧЕР ПУБЛИКАЦИИ: ${sc.id} («${sc.topic}»)`);
  console.log(`   Режим: ${isSend ? '🚀 БОЕВАЯ ОТПРАВКА' : '👀 DRY RUN (ПРЕДПРОСМОТР)'}`);
  console.log(`   Сети: ${network}`);
  console.log(`=============================================================`);

  if (network === 'facebook' || network === 'both') {
    await publishToFacebook(sc, campaignDir, isSend);
  }

  if (network === 'telegram' || network === 'both') {
    await publishToTelegram(sc, campaignDir, isSend);
  }

  // Также регистрируем статус готовности для других платформ (Instagram, YouTube, TikTok)
  registerOtherPlatforms(sc, campaignDir);

  console.log(`\n🎉 ДИСПЕТЧЕР ЗАВЕРШИЛ РАБОТУ ДЛЯ ${sc.id}\n`);
}

main().catch(err => {
  console.error('\n❌ Ошибка диспетчера публикации:', err.message);
  process.exit(1);
});
