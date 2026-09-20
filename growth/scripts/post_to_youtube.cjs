/**
 * Скрипт автоматической публикации видео и Shorts на YouTube через YouTube Data API v3
 * 
 * Использование:
 *   node growth/scripts/post_to_youtube.cjs --preview                   # Предпросмотр видео и метаданных (Dry Run)
 *   node growth/scripts/post_to_youtube.cjs --auth                      # Мастер первичной авторизации OAuth 2.0
 *   node growth/scripts/post_to_youtube.cjs --send                      # Загрузка видео на канал YouTube
 *   node growth/scripts/post_to_youtube.cjs --video=path/to/video.mp4 --send
 *   node growth/scripts/post_to_youtube.cjs --send --register           # Загрузка и регистрация в publications.json
 *   node growth/scripts/post_to_youtube.cjs --privacy=unlisted --send   # Загрузка с доступом по ссылке
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

const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();

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

const descArg = args.find(a => a.startsWith('--desc='));
const customDesc = descArg ? descArg.slice(descArg.indexOf('=') + 1) : null;

const tagsArg = args.find(a => a.startsWith('--tags='));
const customTags = tagsArg ? tagsArg.slice(tagsArg.indexOf('=') + 1).split(',').map(t => t.trim()) : null;

const privacyArg = args.find(a => a.startsWith('--privacy='));
const customPrivacy = privacyArg ? privacyArg.split('=')[1] : 'public';

const fileArg = args.find(a => a.startsWith('--file='));
const filePath = fileArg ? fileArg.split('=')[1] : null;

// Образец аутентичного видео/Shorts для YouTube «Ульпан Алеф»
const samplePost = {
  title: '🇮🇱 Как не впасть в ступор, когда звонит израильский курьер #Shorts',
  description: `Знакомый холодок по спине, когда звонит неизвестный номер 05x и в трубку скороговоркой:
«Шалом! Ани лемата, ма а-код шел а-интерком?»

В ульпане нас учили читать классиков, но не объяснили, как спасти свой заказ из Wolt.

3 фразы, которые спасут вас:
1️⃣ הַקּוֹד שֶׁל הָאִינְטֶרְקוֹם זֶה אַרְבַּע-אֶחָד-שְׁתַּיִם
(hа-код шель hа-интерком зэ арба-эхад-штайм — Код домофона 412)

2️⃣ תַּשְׁאִיר לְיַד הַדֶּלֶת, תּוֹדָה!
(ташъир ле-йад hа-дэлет, тода! — Оставь возле двери, спасибо!)

3️⃣ הָאִינְטֶרְקוֹם לֹא עוֹבֵד, אֲנִי יוֹרֵד לְמַטָּה
(hа-интерком ло овед, ани йорэд лемата — Домофон не работает, я спускаюсь вниз)

💡 Боитесь отвечать голосом?
Потренируйте этот диалог в интерактивном симуляторе звонков «Ульпан Алеф»:
👉 https://ulpana-hebrew.vercel.app/?promo=YT

#Shorts #иврит #ульпан #израиль #репатриация #израильскийкурьер #ульпаналеф #ивритснуля`,
  tags: [
    'Shorts',
    'иврит',
    'ульпан',
    'израиль',
    'репатриация',
    'ульпан алеф',
    'курьер wolt',
    'разговорный иврит',
    'учить иврит',
    'иврит для начинающих'
  ],
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
 * Интерактивный мастер первичной авторизации OAuth 2.0
 */
async function runOAuthFlow() {
  console.log('=====================================================');
  console.log('🔑 МАСТЕР АВТОРИЗАЦИИ GOOGLE OAUTH 2.0 ДЛЯ YOUTUBE');
  console.log('=====================================================\n');

  if (!clientId || !clientSecret) {
    console.error('❌ ОШИБКА: YOUTUBE_CLIENT_ID или YOUTUBE_CLIENT_SECRET не найдены в .env.local!\n');
    console.log('Инструкция по настройке Google Cloud Console:');
    console.log('1. Откройте Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Создайте проект или выберите существующий.');
    console.log('3. В разделе "APIs & Services" -> "Library" включите "YouTube Data API v3".');
    console.log('4. В разделе "OAuth consent screen" настройте экран согласия (User Type: External).');
    console.log('   В разделе "Test users" обязательно добавьте ваш Google-аккаунт канала.');
    console.log('5. В разделе "Credentials" нажмите "Create Credentials" -> "OAuth client ID":');
    console.log('   - Application type: Web application');
    console.log('   - Name: Ulpana YouTube Autoposter');
    console.log('   - Authorized redirect URIs: http://localhost:8085/oauth2callback');
    console.log('6. Скопируйте Client ID и Client Secret в ваш файл .env.local:');
    console.log('   YOUTUBE_CLIENT_ID=ваш_client_id.apps.googleusercontent.com');
    console.log('   YOUTUBE_CLIENT_SECRET=ваш_client_secret\n');
    console.log('После сохранения .env.local запустите повторно:');
    console.log('   node growth/scripts/post_to_youtube.cjs --auth\n');
    process.exit(1);
  }

  const port = 8085;
  const redirectUri = `http://localhost:${port}/oauth2callback`;
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ];

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    }).toString();

  console.log('1. Откройте следующую ссылку в браузере под аккаунтом YouTube-канала:\n');
  console.log(`   \x1b[36m${authUrl}\x1b[0m\n`);
  console.log('2. Разрешите доступ к загрузке видео.');
  console.log(`3. Ожидание ответа от браузера на ${redirectUri}...\n`);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, `http://localhost:${port}`);
        if (reqUrl.pathname === '/oauth2callback') {
          const code = reqUrl.searchParams.get('code');
          const error = reqUrl.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>Ошибка авторизации: ${error}</h1>`);
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
              <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #16a34a;">✅ Авторизация успешна!</h1>
                <p>Токен получен. Вы можете закрыть эту вкладку и вернуться в терминал.</p>
              </body>
            </html>
          `);

          server.close();

          console.log('📡 Обмен authorization code на refresh token...');
          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code'
            })
          });

          const tokenData = await tokenRes.json();

          if (!tokenRes.ok || !tokenData.refresh_token) {
            console.error('❌ Ошибка получения токена:', tokenData);
            reject(new Error(tokenData.error_description || 'Failed to obtain refresh token'));
            return;
          }

          console.log('\n🎉 ПОЗДРАВЛЯЕМ! OAuth-токен успешно получен!');
          try {
            let envContent = '';
            if (fs.existsSync('.env.local')) {
              envContent = fs.readFileSync('.env.local', 'utf8');
            }
            if (/^YOUTUBE_REFRESH_TOKEN=/m.test(envContent)) {
              envContent = envContent.replace(/^YOUTUBE_REFRESH_TOKEN=.*$/m, `YOUTUBE_REFRESH_TOKEN=${tokenData.refresh_token}`);
            } else {
              envContent += `\nYOUTUBE_REFRESH_TOKEN=${tokenData.refresh_token}\n`;
            }
            fs.writeFileSync('.env.local', envContent.trim() + '\n', 'utf8');
            console.log('✅ YOUTUBE_REFRESH_TOKEN автоматически сохранён в .env.local!');
          } catch (saveErr) {
            console.warn('⚠️ Не удалось автоматически записать в .env.local:', saveErr.message);
          }
          console.log('=====================================================');
          console.log('Для Vercel Production скопируйте эту строку в Environment Variables:\n');
          console.log(`YOUTUBE_REFRESH_TOKEN=${tokenData.refresh_token}\n`);
          console.log('=====================================================');
          console.log('Теперь вы можете публиковать видео:');
          console.log('   node growth/scripts/post_to_youtube.cjs --send\n');
          resolve(tokenData);
        }
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(port, () => {
      // Сервер готов принимать запрос
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Получение свежего access_token по refresh_token
 */
async function getAccessToken() {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Отсутствуют учетные данные YouTube API в .env.local (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN).\n' +
      'Запустите: node growth/scripts/post_to_youtube.cjs --auth'
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Ошибка обновления access_token: ${data.error_description || JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Основная функция публикации видео на YouTube
 */
async function main() {
  if (isAuth) {
    await runOAuthFlow();
    return;
  }

  const targetVideo = resolveVideoPath(customVideoPath);
  let title = customTitle || samplePost.title;
  let description = customDesc || samplePost.description;
  const tags = customTags || samplePost.tags;
  const privacy = customPrivacy;

  if (filePath && fs.existsSync(filePath)) {
    description = fs.readFileSync(filePath, 'utf8');
  }

  const videoStats = targetVideo ? fs.statSync(targetVideo) : null;
  const fileSizeMb = videoStats ? (videoStats.size / 1024 / 1024).toFixed(2) : '0';

  console.log('=====================================================');
  console.log(`🎯 ПУБЛИКАЦИЯ В YOUTUBE (YouTube Data API v3)`);
  console.log(`🤖 РЕЖИМ: ${isSend ? '🚀 ОТПРАВКА НА КАНАЛ' : '👀 ПРЕДПРОСМОТР (DRY RUN)'}`);
  console.log(`📁 ФАЙЛ ВИДЕО: ${targetVideo ? `${targetVideo} (${fileSizeMb} MB)` : '❌ НЕ НАЙДЕН'}`);
  console.log(`🔒 ПРИВАТНОСТЬ: ${privacy}`);
  console.log('=====================================================\n');
  console.log(`📌 Название: ${title}\n`);
  console.log('📝 Описание:\n' + description);
  console.log('\n🏷 Теги:', tags.join(', '));
  console.log('\n-----------------------------------------------------\n');

  if (!isSend) {
    console.log('💡 Для реальной публикации на YouTube канал запустите:');
    console.log('   node growth/scripts/post_to_youtube.cjs --send\n');
    console.log('💡 Если вы еще не настроили доступ к YouTube:');
    console.log('   node growth/scripts/post_to_youtube.cjs --auth\n');
    return;
  }

  if (!targetVideo || !fs.existsSync(targetVideo)) {
    console.error('❌ ОШИБКА: Видеофайл не найден! Укажите путь через --video=path/to/video.mp4');
    process.exit(1);
  }

  console.log('📡 1. Получение активного access_token через Google OAuth 2.0...');
  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.error(`❌ Ошибка авторизации: ${err.message}`);
    process.exit(1);
  }

  console.log('📡 2. Инициализация Resumable Upload сессии в YouTube Data API v3...');
  const metadata = {
    snippet: {
      title,
      description,
      tags,
      categoryId: '27' // Категория 27: Образование (Education)
    },
    status: {
      privacyStatus: privacy,
      selfDeclaredMadeForKids: false
    }
  };

  const ext = path.extname(targetVideo).toLowerCase();
  const mimeType = ext === '.webm' ? 'video/webm' : 'video/mp4';

  let uploadUrl;
  try {
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': videoStats.size.toString(),
          'X-Upload-Content-Type': mimeType
        },
        body: JSON.stringify(metadata)
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error('❌ Ошибка инициализации загрузки на YouTube:', errText);
      process.exit(1);
    }

    uploadUrl = initRes.headers.get('location');
    if (!uploadUrl) {
      console.error('❌ Ошибка: YouTube не вернул Location header для загрузки видео.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Сетевая ошибка при инициализации загрузки:', err.message);
    process.exit(1);
  }

  console.log(`📡 3. Потоковая передача видеофайла (${fileSizeMb} MB)...`);
  try {
    const videoBuffer = fs.readFileSync(targetVideo);
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': videoBuffer.length.toString(),
        'Content-Type': mimeType
      },
      body: videoBuffer
    });

    const videoData = await uploadRes.json();

    if (!uploadRes.ok || !videoData.id) {
      console.error('❌ Ошибка передачи видеофайла:', videoData);
      process.exit(1);
    }

    const videoId = videoData.id;
    const publicUrl = `https://youtu.be/${videoId}`;
    const shortsUrl = `https://www.youtube.com/shorts/${videoId}`;

    console.log('\n🎉 ВИДЕО УСПЕШНО ЗАГРУЖЕНО НА YOUTUBE!');
    console.log(`🆔 Video ID: ${videoId}`);
    console.log(`🔗 Ссылка на видео: ${publicUrl}`);
    console.log(`📱 Ссылка на Shorts: ${shortsUrl}`);

    // Автоматическая регистрация в publications.json при флаге --register
    if (isRegister) {
      const pubPath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
      if (fs.existsSync(pubPath)) {
        try {
          const raw = fs.readFileSync(pubPath, 'utf8');
          const publications = JSON.parse(raw);
          const newPub = {
            id: `pub-yt-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            channel: 'youtube',
            channelAccount: 'Ульпан Алеф',
            format: 'short_video',
            title,
            targetDeepLink: '/lessons/1/call',
            promoCode: 'YT',
            fullUrlWithPromo: 'https://ulpana-hebrew.vercel.app/?promo=YT',
            livePostUrl: shortsUrl,
            status: 'published',
            notes: 'Автопостинг через YouTube Data API v3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          publications.unshift(newPub);
          fs.writeFileSync(pubPath, JSON.stringify(publications, null, 2), 'utf8');
          console.log(`✅ Публикация успешно зарегистрирована в growth/data/publications.json!`);
        } catch (e) {
          console.warn('⚠️ Не удалось записать в publications.json:', e.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ Ошибка при передаче видеофайла на YouTube:', err.message);
    process.exit(1);
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
