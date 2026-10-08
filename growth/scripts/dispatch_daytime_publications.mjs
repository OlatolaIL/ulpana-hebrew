import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const PUBS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const LOGS_DIR = path.resolve(ROOT, 'growth/logs');
const LOG_FILE = path.resolve(LOGS_DIR, 'daytime_publisher.log');
const SYNC_TS_SCRIPT = path.resolve(ROOT, 'scripts/sync_marketing_publications_ts.cjs');
const LOCAL_FACTORY_MAIN = 'C:/Users/azrie/.codex/Ulpana2/growth/video-factory/production-additional-100/handoff/new100/main';

// 1. Загрузка переменных окружения из .env.local
try {
  const envPath = path.resolve(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] ? match[2].trim() : '';
        val = val.replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn('[Publisher] Предупреждение при чтении .env.local:', e.message);
}

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  try {
    if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch (_) {}
}

async function resolveVideoFile(pub) {
  // Проверяем локальное хранилище фабрики ULP-0xxx
  const idMatch = pub.id.match(/ulp-(\d{4})/i);
  if (idMatch) {
    const epNum = idMatch[1];
    const epFolder = `ULP-${epNum}`;
    const localMp4 = path.join(LOCAL_FACTORY_MAIN, epFolder, `${epFolder}.mp4`);
    if (fs.existsSync(localMp4)) {
      return { path: localMp4, isTemp: false };
    }
  }

  if (pub.videoPath && (pub.videoPath.startsWith('http://') || pub.videoPath.startsWith('https://'))) {
    // Скачиваем временный файл для сервисов, требующих локальный файл
    const tempPath = path.join(os.tmpdir(), `ulp_video_${Date.now()}.mp4`);
    log(`📥 Скачивание видео из CDN: ${pub.videoPath}...`);
    const res = await fetch(pub.videoPath);
    if (!res.ok) throw new Error(`Ошибка загрузки видео с CDN HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);
    return { path: tempPath, isTemp: true };
  }

  if (pub.videoPath && fs.existsSync(pub.videoPath)) {
    return { path: pub.videoPath, isTemp: false };
  }

  return null;
}

async function publishFacebook(pub, pageId, token) {
  const videoObj = await resolveVideoFile(pub);
  if (!videoObj || !fs.existsSync(videoObj.path)) {
    throw new Error('Видеофайл не найден для Facebook');
  }

  try {
    const formData = new FormData();
    formData.append('access_token', token);
    formData.append('title', pub.title);
    formData.append('description', pub.caption || pub.title);
    const buffer = fs.readFileSync(videoObj.path);
    formData.append('source', new Blob([buffer], { type: 'video/mp4' }), path.basename(videoObj.path));

    log(`📡 Загрузка видео в Facebook Page (${pageId})...`);
    const res = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}/videos`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(`Meta API error: ${data.error?.message || JSON.stringify(data)}`);
    }

    const videoId = data.id;
    const livePostUrl = `https://www.facebook.com/${videoId}`;
    log(`🎉 Успешно опубликовано в Facebook: ${livePostUrl}`);
    return livePostUrl;
  } finally {
    if (videoObj.isTemp && fs.existsSync(videoObj.path)) {
      try { fs.unlinkSync(videoObj.path); } catch (_) {}
    }
  }
}

async function publishInstagram(pub, igUserId, token) {
  const publicVideoUrl = pub.videoPath;
  if (!publicVideoUrl || !publicVideoUrl.startsWith('https://')) {
    throw new Error('Instagram Reels API требует публичный HTTPS URL видео');
  }

  log(`📸 Создание Reels медиа-контейнера в Instagram (${igUserId})...`);
  const containerParams = new URLSearchParams();
  containerParams.append('media_type', 'REELS');
  containerParams.append('video_url', publicVideoUrl);
  containerParams.append('caption', pub.caption || pub.title);
  containerParams.append('share_to_feed', 'true');
  containerParams.append('access_token', token);

  const containerRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(igUserId)}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: containerParams.toString(),
  });

  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error || !containerData.id) {
    throw new Error(`Ошибка контейнера Instagram: ${containerData.error?.message || JSON.stringify(containerData)}`);
  }

  const containerId = containerData.id;
  log(`⏳ Контейнер Instagram создан (ID: ${containerId}). Ожидание обработки...`);

  let isFinished = false;
  for (let attempt = 1; attempt <= 25; attempt++) {
    await new Promise((r) => setTimeout(r, 2500));
    const statusRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(containerId)}?fields=status_code&access_token=${encodeURIComponent(token)}`);
    const statusData = await statusRes.json();
    if (statusData.status_code === 'FINISHED') {
      isFinished = true;
      break;
    }
    if (statusData.status_code === 'ERROR') {
      throw new Error(`Ошибка обработки видео сервером Instagram: ${JSON.stringify(statusData)}`);
    }
  }

  if (!isFinished) {
    throw new Error('Таймаут ожидания обработки видео в Instagram (>60 сек)');
  }

  log(`🚀 Публикация контейнера Instagram...`);
  const pubParams = new URLSearchParams();
  pubParams.append('creation_id', containerId);
  pubParams.append('access_token', token);

  const pubRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(igUserId)}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: pubParams.toString(),
  });

  const pubData = await pubRes.json();
  if (!pubRes.ok || pubData.error || !pubData.id) {
    throw new Error(`Ошибка публикации Instagram: ${pubData.error?.message || JSON.stringify(pubData)}`);
  }

  const mediaId = pubData.id;
  let liveUrl = `https://www.instagram.com/p/${mediaId}`;
  try {
    const linkRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(mediaId)}?fields=permalink&access_token=${encodeURIComponent(token)}`);
    const linkData = await linkRes.json();
    if (linkData.permalink) liveUrl = linkData.permalink;
  } catch (_) {}

  log(`🎉 Успешно опубликован Reels в Instagram: ${liveUrl}`);
  return liveUrl;
}

async function publishTelegram(pub, botToken) {
  const targetChat = '@ulpana_il';
  const videoObj = await resolveVideoFile(pub);
  if (!videoObj || !fs.existsSync(videoObj.path)) {
    throw new Error('Видеофайл не найден для Telegram');
  }

  try {
    const formData = new FormData();
    formData.append('chat_id', targetChat);
    const videoBuffer = fs.readFileSync(videoObj.path);
    formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), path.basename(videoObj.path));
    formData.append('caption', pub.caption || pub.title);
    formData.append('parse_mode', 'HTML');
    formData.append('supports_streaming', 'true');

    if (pub.fullUrlWithPromo) {
      formData.append(
        'reply_markup',
        JSON.stringify({
          inline_keyboard: [[{ text: '👉 Начать урок в приложении', url: pub.fullUrlWithPromo }]],
        })
      );
    }

    log(`📡 Отправка видео в Telegram-канал ${targetChat}...`);
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description || JSON.stringify(data)}`);
    }

    const liveUrl = `https://t.me/ulpana_il/${data.result.message_id}`;
    log(`🎉 Успешно опубликовано в Telegram: ${liveUrl}`);
    return liveUrl;
  } finally {
    if (videoObj.isTemp && fs.existsSync(videoObj.path)) {
      try { fs.unlinkSync(videoObj.path); } catch (_) {}
    }
  }
}

export async function run() {
  log('=====================================================');
  log('🚀 ЗАПУСК АВТОНОМНОГО ДИСПЕТЧЕРА ДНЕВНОГО ЭФИРА (13:30 IL)');
  log('=====================================================');

  if (!fs.existsSync(PUBS_PATH)) {
    log(`❌ Файл реестра не найден: ${PUBS_PATH}`);
    return;
  }

  const pubs = JSON.parse(fs.readFileSync(PUBS_PATH, 'utf8'));
  const nowMs = Date.now();
  const todayYmd = new Date().toISOString().split('T')[0];

  // Ищем запланированные публикации, время которых наступило
  const dueItems = pubs.filter((p) => {
    if (p.status !== 'scheduled') return false;
    if (p.scheduledAt) {
      const ms = Date.parse(p.scheduledAt);
      if (!isNaN(ms)) return ms <= nowMs;
    }
    if (p.date) return p.date <= todayYmd;
    return false;
  });

  log(`📋 Найдено созревших публикаций: ${dueItems.length}`);
  if (dueItems.length === 0) {
    log('✅ Все текущие публикации уже отправлены или запланированы на будущее время.');
    return;
  }

  const pageId = process.env.FB_PAGE_ID;
  const metaToken = process.env.META_ACCESS_TOKEN;
  let igUserId = process.env.IG_USER_ID;
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;

  // Автоматическое определение IG User ID, если не задан явно
  if (pageId && metaToken && !igUserId) {
    try {
      const pRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}?fields=instagram_business_account&access_token=${encodeURIComponent(metaToken)}`);
      const pData = await pRes.json();
      if (pData?.instagram_business_account?.id) {
        igUserId = pData.instagram_business_account.id;
      }
    } catch (_) {}
  }

  let processedCount = 0;

  for (const pub of dueItems) {
    log(`\n⏳ Обработка [${pub.channel.toUpperCase()}] ${pub.id}: "${pub.title}"...`);
    try {
      let liveUrl = '';

      if (pub.channel === 'facebook') {
        if (!pageId || !metaToken) {
          log('⚠️ Пропуск Facebook: FB_PAGE_ID или META_ACCESS_TOKEN отсутствуют в .env.local');
          continue;
        }
        liveUrl = await publishFacebook(pub, pageId, metaToken);
      } else if (pub.channel === 'instagram') {
        if (!igUserId || !metaToken) {
          log('⚠️ Пропуск Instagram: IG_USER_ID или META_ACCESS_TOKEN отсутствуют');
          continue;
        }
        liveUrl = await publishInstagram(pub, igUserId, metaToken);
      } else if (pub.channel === 'telegram') {
        if (!tgToken) {
          log('⚠️ Пропуск Telegram: TELEGRAM_BOT_TOKEN отсутствует');
          continue;
        }
        liveUrl = await publishTelegram(pub, tgToken);
      } else {
        log(`ℹ️ Канал ${pub.channel} пока требует ручного триггера, пропускаем.`);
        continue;
      }

      if (liveUrl) {
        pub.status = 'published';
        pub.livePostUrl = liveUrl;
        pub.updatedAt = new Date().toISOString();
        processedCount++;
      }
    } catch (err) {
      log(`❌ Ошибка отправки ${pub.id}: ${err.message}`);
    }
  }

  if (processedCount > 0) {
    fs.writeFileSync(PUBS_PATH, JSON.stringify(pubs, null, 2), 'utf8');
    log(`💾 Реестр publications.json обновлён (опубликовано: ${processedCount}).`);

    if (fs.existsSync(SYNC_TS_SCRIPT)) {
      log('🔄 Синхронизация с marketingPublicationsData.ts...');
      cp.execSync(`node "${SYNC_TS_SCRIPT}"`, { stdio: 'ignore', cwd: ROOT });
    }
  }

  log(`🏁 Сессия диспетчера завершена. Всего отправлено: ${processedCount} из ${dueItems.length}`);
}

run().catch((err) => {
  log(`💥 Критический сбой диспетчера: ${err.message}`);
});
