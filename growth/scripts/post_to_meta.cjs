/**
 * Скрипт публикации постов на страницу Facebook через Meta Graph API
 * 
 * Использование:
 *   node growth/scripts/post_to_meta.cjs --preview           # Предпросмотр поста
 *   node growth/scripts/post_to_meta.cjs --send              # Публикация на страницу Facebook
 *   node growth/scripts/post_to_meta.cjs --file=post.txt --send
 *   node growth/scripts/post_to_meta.cjs --send --register   # Опубликовать и внести в реестр publications.json
 */

const fs = require('fs');
const path = require('path');

// Загрузка переменных окружения из .env.local
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {
  // node < 20.6 fallback
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

const pageId = process.env.FB_PAGE_ID?.trim();
const pageAccessToken = process.env.META_ACCESS_TOKEN?.trim();

// Разбор аргументов командной строки
const args = process.argv.slice(2);
const isSend = args.includes('--send');
const isRegister = args.includes('--register');
const isInstagram = args.includes('--instagram') || args.includes('--channel=instagram');
const isPreview = args.includes('--preview') || !isSend;
const fileArg = args.find(a => a.startsWith('--file='));
const filePath = fileArg ? fileArg.split('=')[1] : null;
const linkArg = args.find(a => a.startsWith('--link='));
const customLink = linkArg ? linkArg.slice(linkArg.indexOf('=') + 1) : null;
const videoArg = args.find(a => a.startsWith('--video='));
const customVideo = videoArg ? videoArg.slice(videoArg.indexOf('=') + 1) : null;

// Образец аутентичного поста для Facebook «Ульпан Алеф»
const samplePost = {
  title: 'Как не впасть в ступор, когда звонит израильский курьер',
  message: `🇮🇱 Знакомый холодок по спине? Телефон звонит с неизвестного 05x, и в трубку скороговоркой:
«Шалом! Ани лемата, ма а-код шел а-интерком?»

В ульпане нас учили читать стихи Бялика, но не объяснили, как спасти свой заказ из Wolt.

3 фразы, которые спасут вас сегодня:

1️⃣ Код домофона:
«הַקּוֹד שֶׁל הָאִינְטֶרְקוֹם זֶה אַרְבַּע-אֶחָד-שְׁתַּיִם»
(hа-код шель hа-интерком зэ арба-эхад-штайм — Код домофона — 412)

2️⃣ Оставить у двери:
«תַּשְׁאִיר לְיַד הַדֶּלֶת, תּוֹדָה!»
(ташъир ле-йад hа-дэлет, тода! — Оставь возле двери, спасибо!)

3️⃣ Если домофон сломался:
«הָאִינְטֶרְקוֹם לֹא עוֹבֵד, אֲנִי יוֹרֵד לְמַטָּה»
(hа-интерком ло овед, ани йорэд лемата — Домофон не работает, я спускаюсь вниз)

💡 Боитесь отвечать голосом?
Потренируйте этот разговор в нашем симуляторе звонков. Виртуальный курьер позвонит вам прямо в приложении «Ульпан Алеф» — можно ошибаться сколько угодно, пока не пропадет страх!`,
  link: 'https://ulpana-hebrew.vercel.app/lessons/1/call?promo=FB_POST'
};

async function main() {
  let messageText = samplePost.message;
  let postLink = customLink || samplePost.link;

  if (filePath && fs.existsSync(filePath)) {
    messageText = fs.readFileSync(filePath, 'utf8');
  }

  console.log('=====================================================');
  console.log(`🎯 ЦЕЛЕВАЯ СТРАНИЦА FB ID: ${pageId || 'НЕ ЗАДАН'}`);
  console.log(`🤖 РЕЖИМ: ${isSend ? '🚀 ОТПРАВКА В FACEBOOK' : '👀 ПРЕДПРОСМОТР (DRY RUN)'}`);
  if (customVideo) {
    console.log(`🎬 ВИДЕО: ${customVideo}`);
  }
  console.log('=====================================================\n');
  console.log(messageText);
  console.log('\n-----------------------------------------------------');
  console.log(`Прикреплённая ссылка: ${postLink}`);
  console.log('-----------------------------------------------------\n');

  if (!isSend) {
    console.log('💡 Для реальной публикации на страницу Facebook запустите:');
    console.log('   node growth/scripts/post_to_meta.cjs --send\n');
    return;
  }

  if (!pageId || !pageAccessToken) {
    console.error('❌ ОШИБКА: FB_PAGE_ID или META_ACCESS_TOKEN не найдены в .env.local!');
    process.exit(1);
  }

  if (isInstagram) {
    console.log('📸 РЕЖИМ: ПУБЛИКАЦИЯ В INSTAGRAM REELS (Meta Graph API)');
    let igUserId = process.env.IG_USER_ID?.trim();
    if (!igUserId) {
      console.log(`🔍 Запрос ID связанного Instagram-аккаунта со страницы ${pageId}...`);
      const pageRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}?fields=instagram_business_account&access_token=${encodeURIComponent(pageAccessToken)}`);
      const pageData = await pageRes.json();
      if (pageData?.instagram_business_account?.id) {
        igUserId = pageData.instagram_business_account.id;
      }
    }
    if (!igUserId) {
      console.error('❌ ОШИБКА: Не удалось получить ID Instagram Business аккаунта. Убедитесь, что токен META_ACCESS_TOKEN имеет права instagram_basic и instagram_content_publish.');
      process.exit(1);
    }
    console.log(`✅ Найдена учетная запись Instagram ID: ${igUserId}`);

    if (!customVideo) {
      console.error('❌ ОШИБКА: Для публикации в Instagram Reels необходимо указать видеофайл через --video=<URL>');
      process.exit(1);
    }

    let publicVideoUrl = customVideo;
    if (!publicVideoUrl.startsWith('http://') && !publicVideoUrl.startsWith('https://')) {
      console.error('❌ ОШИБКА: Instagram Reels API требует прямой публичный HTTPS URL видеофайла (например, ссылку на GitHub Releases CDN).');
      process.exit(1);
    }

    console.log(`📦 Шаг 1: Создание медиа-контейнера Reels для ${publicVideoUrl}...`);
    const containerParams = new URLSearchParams();
    containerParams.append('media_type', 'REELS');
    containerParams.append('video_url', publicVideoUrl);
    containerParams.append('caption', messageText);
    containerParams.append('share_to_feed', 'true');
    containerParams.append('access_token', pageAccessToken);

    const containerRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(igUserId)}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: containerParams.toString()
    });
    const containerData = await containerRes.json();
    if (!containerRes.ok || containerData.error || !containerData.id) {
      console.error('❌ Ошибка создания контейнера Instagram:', containerData.error ? containerData.error.message : containerData);
      process.exit(1);
    }

    const containerId = containerData.id;
    console.log(`⏳ Контейнер создан (ID: ${containerId}). Ожидание обработки видео Instagram...`);

    let isFinished = false;
    let attempts = 0;
    while (!isFinished && attempts < 25) {
      await new Promise(r => setTimeout(r, 2500));
      attempts++;
      const statusRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(containerId)}?fields=status_code,status&access_token=${encodeURIComponent(pageAccessToken)}`);
      const statusData = await statusRes.json();
      const code = statusData.status_code;
      if (code === 'FINISHED') {
        isFinished = true;
        console.log(`\n✅ Видео успешно обработано сервером Instagram!`);
      } else if (code === 'ERROR') {
        console.error('\n❌ Ошибка обработки видео сервером Instagram:', statusData);
        process.exit(1);
      } else {
        process.stdout.write('.');
      }
    }

    if (!isFinished) {
      console.error('\n❌ Таймаут ожидания обработки видео в Instagram.');
      process.exit(1);
    }

    console.log(`🚀 Шаг 2: Публикация контейнера...`);
    const pubParams = new URLSearchParams();
    pubParams.append('creation_id', containerId);
    pubParams.append('access_token', pageAccessToken);

    const pubRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(igUserId)}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: pubParams.toString()
    });
    const pubData = await pubRes.json();
    if (!pubRes.ok || pubData.error || !pubData.id) {
      console.error('❌ Ошибка публикации в Instagram:', pubData.error ? pubData.error.message : pubData);
      process.exit(1);
    }

    const mediaId = pubData.id;
    let liveUrl = `https://www.instagram.com/p/${mediaId}`;
    try {
      const linkRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(mediaId)}?fields=permalink&access_token=${encodeURIComponent(pageAccessToken)}`);
      const linkData = await linkRes.json();
      if (linkData.permalink) liveUrl = linkData.permalink;
    } catch {}

    console.log(`🎉 REELS УСПЕШНО ОПУБЛИКОВАН В INSTAGRAM!`);
    console.log(`🆔 Media ID: ${mediaId}`);
    console.log(`🔗 Ссылка: ${liveUrl}`);
    return;
  }

  let tempVideoPath = null;
  try {
    let resolvedVideoPath = null;
    if (customVideo) {
      if (customVideo.startsWith('http://') || customVideo.startsWith('https://')) {
        console.log(`📥 Загрузка видео из CDN: ${customVideo}...`);
        const resp = await fetch(customVideo);
        if (!resp.ok) throw new Error(`Не удалось скачать видео: HTTP ${resp.status}`);
        const ab = await resp.arrayBuffer();
        const os = require('os');
        tempVideoPath = path.join(os.tmpdir(), `fb_video_${Date.now()}.mp4`);
        fs.writeFileSync(tempVideoPath, Buffer.from(ab));
        resolvedVideoPath = tempVideoPath;
      } else {
        const direct = path.isAbsolute(customVideo) ? customVideo : path.join(process.cwd(), customVideo);
        if (fs.existsSync(direct)) resolvedVideoPath = direct;
      }
    }

    if (resolvedVideoPath && fs.existsSync(resolvedVideoPath)) {
      console.log(`📡 Загрузка ВИДЕО на страницу Facebook (${pageId})...`);
      const formData = new FormData();
      formData.append('access_token', pageAccessToken);
      formData.append('title', samplePost.title);
      formData.append('description', messageText);
      const buffer = fs.readFileSync(resolvedVideoPath);
      formData.append('source', new Blob([buffer], { type: 'video/mp4' }), path.basename(resolvedVideoPath));

      const res = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}/videos`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        console.error('❌ Ошибка Meta Video API:', data.error ? data.error.message : data);
        process.exit(1);
      }

      const videoId = data.id;
      const publicPostUrl = `https://www.facebook.com/${videoId}`;
      console.log(`🎉 ВИДЕО УСПЕШНО ОПУБЛИКОВАНО В FACEBOOK!`);
      console.log(`🆔 Video ID: ${videoId}`);
      console.log(`🔗 Ссылка на видео: ${publicPostUrl}`);
      return;
    }

    console.log(`📡 Отправка текстового поста на страницу Facebook (${pageId})...`);
    const postUrl = `https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}/feed`;
    const bodyParams = new URLSearchParams();
    bodyParams.append('message', messageText);
    if (postLink) {
      bodyParams.append('link', postLink);
    }
    bodyParams.append('access_token', pageAccessToken);

    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString()
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('❌ Ошибка Meta Graph API:', data.error ? data.error.message : data);
      if (data.error && data.error.error_user_msg) {
        console.error('Подробности:', data.error.error_user_msg);
      }
      process.exit(1);
    }

    const postId = data.id; // формат: {page_id}_{post_id}
    const publicPostUrl = `https://www.facebook.com/${postId}`;
    console.log(`🎉 ПОСТ УСПЕШНО ОПУБЛИКОВАН В FACEBOOK!`);
    console.log(`🆔 Post ID: ${postId}`);
    console.log(`🔗 Ссылка на пост: ${publicPostUrl}`);

    // Автоматическая регистрация в publications.json, если передан флаг --register
    if (isRegister) {
      const pubPath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
      if (fs.existsSync(pubPath)) {
        try {
          const raw = fs.readFileSync(pubPath, 'utf8');
          const publications = JSON.parse(raw);
          const newPub = {
            id: `pub-fb-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            channel: 'facebook',
            channelAccount: 'Ulpana - Иврит без паники',
            format: 'post',
            title: samplePost.title,
            targetDeepLink: '/lessons/1/call',
            promoCode: 'FB_POST',
            fullUrlWithPromo: postLink,
            livePostUrl: publicPostUrl,
            status: 'published',
            notes: 'Автопостинг через Meta Graph API',
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
    console.error('❌ Сетевая ошибка при отправке в Facebook:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
