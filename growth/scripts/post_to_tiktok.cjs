/**
 * Скрипт автоматической публикации видео в TikTok через официальный TikTok Content Posting API v2 (Direct Post)
 * 
 * Контур: growth/scripts/ (Изолированный маркетинговый контур согласно правилу R-23)
 * 
 * Использование:
 *   node growth/scripts/post_to_tiktok.cjs --preview                   # Предпросмотр видео и метаданных (Dry Run)
 *   node growth/scripts/post_to_tiktok.cjs --auth                      # Мастер первичной авторизации OAuth 2.0 (порт 8085)
 *   node growth/scripts/post_to_tiktok.cjs --send                      # Загрузка видео в TikTok (по умолчанию SELF_ONLY)
 *   node growth/scripts/post_to_tiktok.cjs --video=path/to/video.mp4 --send
 *   node growth/scripts/post_to_tiktok.cjs --privacy=PUBLIC_TO_EVERYONE --send  # Публикация для всех (требует Audited статус)
 *   node growth/scripts/post_to_tiktok.cjs --send --register           # Загрузка и регистрация в growth/data/publications.json
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Загрузка переменных окружения из .env.local
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {
  try {
    const content = fs.readFileSync('.env.local', 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = match[2] ? match[2].trim() : '';
      }
    });
  } catch (err) {
    console.warn('Не удалось загрузить .env.local');
  }
}

const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
const refreshToken = process.env.TIKTOK_REFRESH_TOKEN?.trim();
const redirectUri = process.env.TIKTOK_REDIRECT_URI?.trim() || 'http://localhost:8085/callback';

// Разбор аргументов командной строки
const args = process.argv.slice(2);
const isSend = args.includes('--send');
const isAuth = args.includes('--auth');
const isRegister = args.includes('--register');
const isPreview = args.includes('--preview') || (!isSend && !isAuth);

const videoArg = args.find(a => a.startsWith('--video='));
const customVideoPath = videoArg ? videoArg.split('=')[1] : null;

const titleArg = args.find(a => a.startsWith('--title='));
const customTitle = titleArg ? titleArg.slice(titleArg.indexOf('=') + 1) : null;

const privacyArg = args.find(a => a.startsWith('--privacy='));
const customPrivacy = privacyArg ? privacyArg.split('=')[1] : 'SELF_ONLY';

// Шаблон поста для TikTok «Ульпан Алеф»
const samplePost = {
  title: 'Что на самом деле говорит израильский курьер Wolt 🛵🇮🇱 #иврит #ульпан #израиль #ульпаналеф #репатриация',
  privacy: customPrivacy, // 'SELF_ONLY' (приватно) или 'PUBLIC_TO_EVERYONE' (публично)
  defaultVideoPaths: [
    'public/demo/reels_duolingo_vs_reality.mp4',
    'public/demo/tutorials/stage_05_dialogue_v2.mp4',
    'public/demo/ulpana_full_guide.mp4'
  ]
};

function resolveVideoPath(inputPath) {
  if (inputPath && fs.existsSync(inputPath)) {
    return inputPath;
  }
  for (const candidate of samplePost.defaultVideoPaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Интерактивный мастер первичной авторизации OAuth 2.0 для TikTok
 */
async function runOAuthFlow() {
  console.log('=====================================================');
  console.log('🔑 МАСТЕР АВТОРИЗАЦИИ TIKTOK OAUTH 2.0 (DIRECT POST)');
  console.log('=====================================================\n');

  if (!clientKey || !clientSecret) {
    console.error('❌ ОШИБКА: TIKTOK_CLIENT_KEY или TIKTOK_CLIENT_SECRET не найдены в .env.local!\n');
    console.log('Добавьте их в .env.local:');
    console.log('TIKTOK_CLIENT_KEY=ваш_client_key');
    console.log('TIKTOK_CLIENT_SECRET=ваш_client_secret');
    process.exit(1);
  }

  const port = 8085;
  const scopes = ['user.info.basic', 'video.publish', 'video.upload'];
  const state = 'ulpana_' + Math.random().toString(36).substring(2, 10);

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
    new URLSearchParams({
      client_key: clientKey,
      scope: scopes.join(','),
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state
    }).toString();

  console.log('1. Откройте следующую ссылку в браузере под аккаунтом TikTok-канала:\n');
  console.log(`   \x1b[36m${authUrl}\x1b[0m\n`);
  console.log('2. Нажмите "Authorize" / "Разрешить" для доступа к загрузке видео.');
  console.log(`3. Ожидание ответа от TikTok на ${redirectUri}...\n`);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, `http://localhost:${port}`);
        if (reqUrl.pathname === '/callback' || reqUrl.pathname === '/oauth2callback') {
          const code = reqUrl.searchParams.get('code');
          const error = reqUrl.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>Ошибка авторизации TikTok: ${error}</h1>`);
            server.close();
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>Код авторизации не получен</h1>');
            server.close();
            reject(new Error('No code received'));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #fff;">
                <h1 style="color: #22c55e;">✅ Авторизация TikTok успешна!</h1>
                <p style="color: #94a3b8; font-size: 18px;">Токены получены и сохранены. Вы можете закрыть эту вкладку и вернуться в терминал.</p>
              </body>
            </html>
          `);

          server.close();

          console.log('📡 Обмен authorization code на access & refresh token...');
          const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cache-Control': 'no-cache'
            },
            body: new URLSearchParams({
              client_key: clientKey,
              client_secret: clientSecret,
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri
            })
          });

          const tokenData = await tokenRes.json();

          if (!tokenRes.ok || !tokenData.data?.refresh_token) {
            console.error('❌ Ошибка получения токена TikTok:', tokenData);
            reject(new Error(tokenData.error_description || tokenData.message || 'Failed to obtain tokens'));
            return;
          }

          const refreshTokenVal = tokenData.data.refresh_token;
          const accessTokenVal = tokenData.data.access_token;
          const openId = tokenData.data.open_id;

          console.log('\n🎉 ПОЗДРАВЛЯЕМ! TikTok OAuth-токены успешно получены!');
          console.log(`👤 Open ID: ${openId}`);

          try {
            let envContent = '';
            if (fs.existsSync('.env.local')) {
              envContent = fs.readFileSync('.env.local', 'utf8');
            }
            if (/^TIKTOK_REFRESH_TOKEN=/m.test(envContent)) {
              envContent = envContent.replace(/^TIKTOK_REFRESH_TOKEN=.*$/m, `TIKTOK_REFRESH_TOKEN=${refreshTokenVal}`);
            } else {
              envContent += `\nTIKTOK_REFRESH_TOKEN=${refreshTokenVal}\n`;
            }
            fs.writeFileSync('.env.local', envContent.trim() + '\n', 'utf8');
            console.log('✅ TIKTOK_REFRESH_TOKEN автоматически сохранён в .env.local!');
          } catch (saveErr) {
            console.warn('⚠️ Не удалось автоматически записать в .env.local:', saveErr.message);
          }

          console.log('=====================================================');
          console.log('Теперь вы можете публиковать видео в TikTok:');
          console.log('   node growth/scripts/post_to_tiktok.cjs --send\n');
          resolve(tokenData.data);
        }
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(port, () => {
      console.log(`[Сервер авторизации слушает порт ${port} на ${redirectUri}]`);
    });
  });
}

/**
 * Получение свежего access token через refresh token
 */
async function getFreshAccessToken() {
  if (!refreshToken) {
    throw new Error('TIKTOK_REFRESH_TOKEN отсутствует в .env.local! Запустите: node growth/scripts/post_to_tiktok.cjs --auth');
  }

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache'
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const data = await res.json();
  if (!res.ok || !data.data?.access_token) {
    throw new Error(`Ошибка обновления токена TikTok: ${JSON.stringify(data)}`);
  }

  // Обновляем refresh_token, если TikTok вернул новый
  if (data.data.refresh_token && data.data.refresh_token !== refreshToken) {
    let envContent = fs.readFileSync('.env.local', 'utf8');
    envContent = envContent.replace(/^TIKTOK_REFRESH_TOKEN=.*$/m, `TIKTOK_REFRESH_TOKEN=${data.data.refresh_token}`);
    fs.writeFileSync('.env.local', envContent.trim() + '\n', 'utf8');
  }

  return data.data.access_token;
}

/**
 * Получение информации об авторе (Creator Info Query)
 */
async function queryCreatorInfo(accessToken) {
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    }
  });

  const data = await res.json();
  if (!res.ok || data.error?.code !== 'ok') {
    console.warn('⚠️ Предупреждение creator_info:', data);
  }
  return data.data || {};
}

/**
 * Основная функция отправки
 */
async function main() {
  if (isAuth) {
    await runOAuthFlow();
    return;
  }

  const targetVideo = resolveVideoPath(customVideoPath);
  const title = customTitle || samplePost.title;
  const privacy = customPrivacy || samplePost.privacy;

  console.log('=====================================================');
  console.log('📱 TIKTOK CONTENT POSTING ENGINE (Ульпан Алеф)');
  console.log('=====================================================');

  if (isPreview) {
    console.log('\n[РЕЖИМ ПРЕДПРОСМОТРА (Dry Run)]');
    console.log(`🎬 Видеофайл: ${targetVideo ? targetVideo : '❌ Не найден!'}`);
    if (targetVideo) {
      const stats = fs.statSync(targetVideo);
      console.log(`📦 Размер файла: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    }
    console.log(`📝 Заголовок/Caption: \x1b[32m${title}\x1b[0m`);
    console.log(`🔒 Уровень приватности: \x1b[33m${privacy}\x1b[0m (SELF_ONLY = черновик/только себе, PUBLIC_TO_EVERYONE = для всех)`);
    console.log(`🔗 Целевой лендинг: https://ulpana-hebrew.vercel.app/?promo=TIKTOK`);
    console.log('\nДля авторизации выполните:');
    console.log('   node growth/scripts/post_to_tiktok.cjs --auth');
    console.log('\nДля реальной публикации выполните:');
    console.log('   node growth/scripts/post_to_tiktok.cjs --send');
    console.log('=====================================================\n');
    return;
  }

  if (!isSend) {
    return;
  }

  if (!targetVideo) {
    console.error('❌ ОШИБКА: Видеофайл не найден! Укажите путь через --video=path/to/video.mp4');
    process.exit(1);
  }

  console.log('\n🚀 НАЧАЛО ПУБЛИКАЦИИ ВИДЕО В TIKTOK...\n');

  console.log('🔑 1. Получение активного Access Token...');
  const accessToken = await getFreshAccessToken();

  console.log('👤 2. Проверка разрешений автора (Creator Info)...');
  const creatorInfo = await queryCreatorInfo(accessToken);
  if (creatorInfo.creator_nickname) {
    console.log(`✅ Канал: ${creatorInfo.creator_nickname} (@${creatorInfo.creator_username || 'channel'})`);
  }

  const stats = fs.statSync(targetVideo);
  const videoSize = stats.size;
  const videoSizeMb = (videoSize / (1024 * 1024)).toFixed(2);

  console.log(`📦 3. Инициализация публикации видео (${videoSizeMb} MB, ${privacy})...`);

  // Инициализация видеопоста
  const initPayload = {
    post_info: {
      title: title,
      privacy_level: privacy,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      video_cover_timestamp_ms: 1000
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: videoSize,
      chunk_size: videoSize,
      total_chunk_count: 1
    }
  };

  const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(initPayload)
  });

  const initData = await initRes.json();

  if (!initRes.ok || initData.error?.code !== 'ok') {
    console.error('❌ Ошибка инициализации видео в TikTok:', initData);
    process.exit(1);
  }

  const publishId = initData.data?.publish_id;
  const uploadUrl = initData.data?.upload_url;

  if (!uploadUrl || !publishId) {
    console.error('❌ Не получен upload_url или publish_id:', initData);
    process.exit(1);
  }

  console.log(`🆔 Publish ID: ${publishId}`);
  console.log(`📡 4. Загрузка видеофайла на серверы TikTok...`);

  const videoBuffer = fs.readFileSync(targetVideo);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
      'Content-Length': videoSize.toString(),
      'Content-Type': 'video/mp4'
    },
    body: videoBuffer
  });

  if (!uploadRes.ok) {
    console.error(`❌ Ошибка загрузки чанка в TikTok: HTTP ${uploadRes.status} ${uploadRes.statusText}`);
    process.exit(1);
  }

  console.log('✅ Видеофайл успешно передан! Проверка статуса обработки...');

  // Опрос статуса
  let isComplete = false;
  let attempts = 0;
  while (!isComplete && attempts < 15) {
    attempts++;
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({ publish_id: publishId })
    });

    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    console.log(`⏳ Статус обработки [${attempts}]: ${status || 'CHECKING...'}`);

    if (status === 'PUBLISH_COMPLETE') {
      isComplete = true;
      console.log('\n🎉 ПОЗДРАВЛЯЕМ! Видео успешно опубликовано в TikTok!');
      break;
    } else if (status === 'FAILED') {
      console.error('❌ Ошибка публикации в TikTok:', statusData.data?.fail_reason || statusData);
      process.exit(1);
    }
  }

  // Регистрация в реестре публикаций
  if (isRegister) {
    const pubPath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
    if (fs.existsSync(pubPath)) {
      try {
        const raw = fs.readFileSync(pubPath, 'utf8');
        const publications = JSON.parse(raw);
        const newPub = {
          id: `pub-tiktok-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          channel: 'tiktok',
          channelAccount: creatorInfo.creator_nickname || 'Ульпан Алеф',
          format: 'short_video',
          title,
          targetDeepLink: '/lessons/1/call',
          promoCode: 'TIKTOK',
          fullUrlWithPromo: 'https://ulpana-hebrew.vercel.app/?promo=TIKTOK',
          livePostUrl: `https://www.tiktok.com/@${creatorInfo.creator_username || 'channel'}`,
          status: 'published',
          notes: `TikTok Direct Post API (${privacy})`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        publications.unshift(newPub);
        fs.writeFileSync(pubPath, JSON.stringify(publications, null, 2), 'utf8');
        console.log(`✅ Публикация зарегистрирована в growth/data/publications.json!`);
      } catch (e) {
        console.warn('⚠️ Ошибка записи в publications.json:', e.message);
      }
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Фатальная ошибка:', err);
    process.exit(1);
  });
}

module.exports = {
  samplePost,
  resolveVideoPath
};
