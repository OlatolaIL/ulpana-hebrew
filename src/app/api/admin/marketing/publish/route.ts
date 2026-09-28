import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface PublishRequestBody {
  channel: 'youtube' | 'telegram' | 'facebook' | 'tiktok';
  publicationId?: string;
  videoPath?: string;
  title: string;
  description?: string;
  campaignTitle?: string;
  version?: string;
  tags?: string[];
  privacy?: 'public' | 'unlisted' | 'private';
  register?: boolean;
  link?: string;
}

const DATA_DIR = path.join(process.cwd(), 'growth', 'data');
const PUBLICATIONS_FILE = path.join(DATA_DIR, 'publications.json');

interface ResolvedVideo {
  filePath: string;
  isTemp: boolean;
}

async function resolveServerVideo(inputPath?: string): Promise<ResolvedVideo | null> {
  if (inputPath) {
    // If it's a remote URL (CDN on GitHub Releases, etc.), download it to a temporary file
    if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
      try {
        const resp = await fetch(inputPath);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          const parsedUrl = new URL(inputPath);
          const ext = path.extname(parsedUrl.pathname) || '.mp4';
          const tempPath = path.join(
            os.tmpdir(),
            `ulpana_upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`
          );
          fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
          return { filePath: tempPath, isTemp: true };
        } else {
          console.warn(`[Publish API] Remote video download returned status ${resp.status}: ${inputPath}`);
        }
      } catch (err: any) {
        console.warn(`[Publish API] Error downloading remote video from ${inputPath}:`, err.message);
      }
    }

    const directPath = path.isAbsolute(inputPath)
      ? inputPath
      : path.join(process.cwd(), inputPath.replace(/^\//, ''));
    if (fs.existsSync(directPath)) return { filePath: directPath, isTemp: false };
  }

  // Fallback demo candidates in public/demo/
  const candidates = [
    path.join(process.cwd(), 'public', 'demo', 'reels_duolingo_vs_reality.mp4'),
    path.join(process.cwd(), 'public', 'demo', 'tutorials', 'stage_05_dialogue_v2.mp4'),
    path.join(process.cwd(), 'public', 'demo', 'ulpana_full_guide.mp4'),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) return { filePath: cand, isTemp: false };
  }

  return null;
}

function resolveServerVideoPath(inputPath?: string): string | null {
  if (inputPath) {
    const directPath = path.isAbsolute(inputPath)
      ? inputPath
      : path.join(process.cwd(), inputPath.replace(/^\//, ''));
    if (fs.existsSync(directPath)) return directPath;
  }

  const candidates = [
    path.join(process.cwd(), 'public', 'demo', 'reels_duolingo_vs_reality.mp4'),
    path.join(process.cwd(), 'public', 'demo', 'tutorials', 'stage_05_dialogue_v2.mp4'),
    path.join(process.cwd(), 'public', 'demo', 'ulpana_full_guide.mp4'),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }

  return null;
}

async function registerPublication(pub: {
  publicationId?: string;
  channel: 'youtube' | 'telegram' | 'facebook' | 'tiktok';
  title: string;
  format: 'short_video' | 'post';
  channelAccount: string;
  livePostUrl: string;
  promoCode: string;
  notes: string;
  videoPath?: string;
  caption?: string;
  campaignTitle?: string;
  version?: string;
}) {
  // 1. PostgreSQL Database Update (Source of Truth on production server)
  try {
    await initDatabase();
    const db = getDbPool();
    if (db) {
      if (pub.publicationId) {
        await db.query(
          `UPDATE ulpana_publications SET
            live_post_url = $2,
            status = 'published',
            video_path = COALESCE($3, video_path),
            caption = COALESCE($4, caption),
            updated_at = NOW()
          WHERE id = $1`,
          [pub.publicationId, pub.livePostUrl, pub.videoPath || null, pub.caption || null]
        );
      } else {
        const newId = `pub-${pub.channel.slice(0, 2)}-${Date.now().toString().slice(-4)}`;
        await db.query(
          `INSERT INTO ulpana_publications (
            id, date, channel, channel_account, format, title, campaign_title, version,
            video_path, caption, target_deep_link, promo_code, full_url_with_promo,
            live_post_url, status, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'published', $15, NOW(), NOW())`,
          [
            newId,
            new Date().toISOString().split('T')[0],
            pub.channel,
            pub.channelAccount,
            pub.format,
            pub.title,
            pub.campaignTitle || null,
            pub.version || null,
            pub.videoPath || null,
            pub.caption || null,
            '/lessons/1/call',
            pub.promoCode,
            `https://ulpana-hebrew.vercel.app/lessons/1/call?promo=${pub.promoCode}`,
            pub.livePostUrl,
            pub.notes,
          ]
        );
      }
    }
  } catch (dbErr: any) {
    console.error('[Publish API] Database sync error:', dbErr.message);
  }

  // 2. Local JSON file update (for offline/local dev and git repo tracking)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let items: any[] = [];
    if (fs.existsSync(PUBLICATIONS_FILE)) {
      items = JSON.parse(fs.readFileSync(PUBLICATIONS_FILE, 'utf8'));
    }

    if (pub.publicationId) {
      const idx = items.findIndex((i: any) => i.id === pub.publicationId);
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          livePostUrl: pub.livePostUrl,
          status: 'published',
          videoPath: pub.videoPath || items[idx].videoPath,
          caption: pub.caption || items[idx].caption,
          updatedAt: new Date().toISOString(),
        };
        fs.writeFileSync(PUBLICATIONS_FILE, JSON.stringify(items, null, 2), 'utf8');
        return;
      }
    }

    const newPub = {
      id: `pub-${pub.channel.slice(0, 2)}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      channel: pub.channel,
      channelAccount: pub.channelAccount,
      format: pub.format,
      title: pub.title,
      campaignTitle: pub.campaignTitle,
      version: pub.version,
      videoPath: pub.videoPath,
      caption: pub.caption,
      targetDeepLink: '/lessons/1/call',
      promoCode: pub.promoCode,
      fullUrlWithPromo: `https://ulpana-hebrew.vercel.app/lessons/1/call?promo=${pub.promoCode}`,
      livePostUrl: pub.livePostUrl,
      status: 'published',
      notes: pub.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.unshift(newPub);
    fs.writeFileSync(PUBLICATIONS_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[Publish API] Warning: Failed to register in publications.json:', err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = (await req.json()) as PublishRequestBody;
    const {
      channel,
      title,
      description,
      tags,
      privacy = 'public',
      register = true,
      publicationId,
      campaignTitle,
      version,
      videoPath,
    } = body;

    if (!channel || !title) {
      return NextResponse.json(
        { error: 'Параметры channel и title обязательны' },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. ПУБЛИКАЦИЯ В YOUTUBE (YouTube Data API v3)
    // ==========================================
    if (channel === 'youtube') {
      const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
      const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();

      if (!clientId || !clientSecret || !refreshToken) {
        return NextResponse.json(
          {
            error:
              'Отсутствуют учетные данные YouTube API (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN). ' +
              'Добавьте их в Vercel Project Settings -> Environment Variables.'
          },
          { status: 400 }
        );
      }

      let videoResult: ResolvedVideo | null = null;
      try {
        videoResult = await resolveServerVideo(body.videoPath);
        const videoFilePath = videoResult?.filePath;
        if (!videoFilePath || !fs.existsSync(videoFilePath)) {
          return NextResponse.json(
            { error: `Видеофайл не найден на сервере: ${body.videoPath || 'public/demo/...'}` },
            { status: 400 }
          );
        }

        // Получаем свежий access_token через refresh_token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          return NextResponse.json(
            { error: `Ошибка обновления токена Google OAuth: ${tokenData.error_description || JSON.stringify(tokenData)}` },
            { status: 502 }
          );
        }

        const accessToken = tokenData.access_token;
        const videoStats = fs.statSync(videoFilePath);
        const ext = path.extname(videoFilePath).toLowerCase();
        const mimeType = ext === '.webm' ? 'video/webm' : 'video/mp4';

        const metadata = {
          snippet: {
            title,
            description: description || title,
            tags: tags || ['Shorts', 'иврит', 'ульпан', 'израиль'],
            categoryId: '27' // Education
          },
          status: {
            privacyStatus: privacy,
            selfDeclaredMadeForKids: false
          }
        };

        // Инициализация Resumable Upload
        const initRes = await fetch(
          'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
              'X-Upload-Content-Length': videoStats.size.toString(),
              'X-Upload-Content-Type': mimeType
            },
            body: JSON.stringify(metadata)
          }
        );

        if (!initRes.ok) {
          const errText = await initRes.text();
          return NextResponse.json(
            { error: `Ошибка инициализации загрузки на YouTube: ${errText}` },
            { status: initRes.status }
          );
        }

        const uploadUrl = initRes.headers.get('location');
        if (!uploadUrl) {
          return NextResponse.json(
            { error: 'YouTube API не вернул адрес сессии загрузки (Location header)' },
            { status: 502 }
          );
        }

        // Передача файла
        const videoBuffer = fs.readFileSync(videoFilePath);
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
          return NextResponse.json(
            { error: `Ошибка загрузки видео на YouTube: ${JSON.stringify(videoData)}` },
            { status: uploadRes.status || 500 }
          );
        }

        const videoId = videoData.id;
        const publicUrl = `https://youtu.be/${videoId}`;
        const shortsUrl = `https://www.youtube.com/shorts/${videoId}`;

        if (register) {
          await registerPublication({
            publicationId,
            channel: 'youtube',
            title,
            campaignTitle,
            version,
            videoPath: body.videoPath || videoFilePath,
            caption: description || title,
            format: 'short_video',
            channelAccount: 'Ульпан Алеф',
            livePostUrl: shortsUrl,
            promoCode: 'YT',
            notes: 'Автопостинг через веб-админку боевого сервера (YouTube Data API v3)'
          });
        }

        return NextResponse.json({
          success: true,
          channel: 'youtube',
          videoId,
          publicUrl,
          shortsUrl,
          livePostUrl: shortsUrl,
          title
        });
      } finally {
        if (videoResult?.isTemp && fs.existsSync(videoResult.filePath)) {
          try {
            fs.unlinkSync(videoResult.filePath);
          } catch {}
        }
      }
    }

    // ==========================================
    // 2. ПУБЛИКАЦИЯ В TELEGRAM (@ulpana_il)
    // ==========================================
    if (channel === 'telegram') {
      const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
      const targetChat = '@ulpana_il';

      if (!botToken) {
        return NextResponse.json(
          { error: 'TELEGRAM_BOT_TOKEN не задан в переменных окружения' },
          { status: 400 }
        );
      }

      let videoResult: ResolvedVideo | null = null;
      try {
        if (body.videoPath) {
          videoResult = await resolveServerVideo(body.videoPath);
        }
        const videoFilePath = videoResult?.filePath;

        if (videoFilePath && fs.existsSync(videoFilePath)) {
          const formData = new FormData();
          formData.append('chat_id', targetChat);
          const videoBuffer = fs.readFileSync(videoFilePath);
          formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), path.basename(videoFilePath));
          formData.append('caption', description || title);
          formData.append('parse_mode', 'HTML');
          formData.append(
            'reply_markup',
            JSON.stringify({
              inline_keyboard: [[{ text: '📞 Открыть симулятор звонков', url: 'https://ulpana-hebrew.vercel.app/?promo=TG' }]]
            })
          );

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
            method: 'POST',
            body: formData
          });
          const tgData = await tgRes.json();

          if (!tgData.ok) {
            return NextResponse.json(
              { error: `Ошибка Telegram API: ${tgData.description || 'Не удалось отправить видео'}` },
              { status: 502 }
            );
          }

          const liveUrl = `https://t.me/ulpana_il/${tgData.result.message_id}`;
          if (register) {
            await registerPublication({
              publicationId,
              channel: 'telegram',
              title,
              campaignTitle,
              version,
              videoPath: body.videoPath || videoFilePath,
              caption: description || title,
              format: 'short_video',
              channelAccount: '@ulpana_il',
              livePostUrl: liveUrl,
              promoCode: 'TG_CHANNEL',
              notes: 'Публикация видео в Telegram через веб-админку'
            });
          }

          return NextResponse.json({
            success: true,
            channel: 'telegram',
            messageId: tgData.result.message_id,
            livePostUrl: liveUrl
          });
        }
      } finally {
        if (videoResult?.isTemp && fs.existsSync(videoResult.filePath)) {
          try {
            fs.unlinkSync(videoResult.filePath);
          } catch {}
        }
      }

      // Текстовый пост
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: description || title,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '👉 Перейти к урокам', url: 'https://ulpana-hebrew.vercel.app/?promo=TG' }]]
          }
        })
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) {
        return NextResponse.json(
          { error: `Ошибка Telegram API: ${tgData.description || 'Не удалось отправить сообщение'}` },
          { status: 502 }
        );
      }

      const liveUrl = `https://t.me/ulpana_il/${tgData.result.message_id}`;
      if (register) {
        await registerPublication({
          publicationId,
          channel: 'telegram',
          title,
          campaignTitle,
          version,
          caption: description || title,
          format: 'post',
          channelAccount: '@ulpana_il',
          livePostUrl: liveUrl,
          promoCode: 'TG_CHANNEL',
          notes: 'Публикация поста в Telegram через веб-админку'
        });
      }

      return NextResponse.json({
        success: true,
        channel: 'telegram',
        messageId: tgData.result.message_id,
        livePostUrl: liveUrl
      });
    }

    // ==========================================
    // 3. ПУБЛИКАЦИЯ В FACEBOOK (Meta Graph API)
    // ==========================================
    if (channel === 'facebook') {
      const pageId = process.env.FB_PAGE_ID?.trim();
      const pageAccessToken = process.env.META_ACCESS_TOKEN?.trim();

      if (!pageId || !pageAccessToken) {
        return NextResponse.json(
          { error: 'FB_PAGE_ID или META_ACCESS_TOKEN не заданы в переменных окружения' },
          { status: 400 }
        );
      }

      // 1. Попытка загрузить видео, если передан videoPath
      let videoResult: ResolvedVideo | null = null;
      try {
        if (body.videoPath) {
          videoResult = await resolveServerVideo(body.videoPath);
        }
        const videoFilePath = videoResult?.filePath;

        if (videoFilePath && fs.existsSync(videoFilePath)) {
          const formData = new FormData();
          formData.append('access_token', pageAccessToken);
          formData.append('title', title);
          formData.append('description', description || title);
          const videoBuffer = fs.readFileSync(videoFilePath);
          formData.append('source', new Blob([videoBuffer], { type: 'video/mp4' }), path.basename(videoFilePath));

          const fbVideoRes = await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}/videos`, {
            method: 'POST',
            body: formData,
          });

          const fbVideoData = await fbVideoRes.json();
          if (!fbVideoRes.ok || fbVideoData.error) {
            return NextResponse.json(
              { error: `Ошибка Meta Video API: ${fbVideoData.error?.message || 'Не удалось опубликовать видео'}` },
              { status: 502 }
            );
          }

          const videoId = fbVideoData.id;
          const liveUrl = `https://www.facebook.com/${videoId}`;

          if (register) {
            await registerPublication({
              publicationId,
              channel: 'facebook',
              title,
              campaignTitle,
              version,
              videoPath: body.videoPath || videoFilePath,
              caption: description || title,
              format: 'short_video',
              channelAccount: 'Ulpana - Иврит без паники',
              livePostUrl: liveUrl,
              promoCode: 'FB',
              notes: 'Публикация видео/Reels в Facebook через веб-админку (Meta Graph API)',
            });
          }

          return NextResponse.json({
            success: true,
            channel: 'facebook',
            videoId,
            livePostUrl: liveUrl,
            title,
          });
        }
      } catch (videoErr: any) {
        console.error('[Publish API] Ошибка загрузки видео в Facebook:', videoErr.message);
        return NextResponse.json(
          { error: `Ошибка подготовки видеофайла для Facebook: ${videoErr.message}` },
          { status: 500 }
        );
      } finally {
        if (videoResult?.isTemp && fs.existsSync(videoResult.filePath)) {
          try {
            fs.unlinkSync(videoResult.filePath);
          } catch {}
        }
      }

      // 2. Если видео не указано или не найдено — публикуем обычный ссылочный/текстовый пост
      const postUrl = `https://graph.facebook.com/v26.0/${encodeURIComponent(pageId)}/feed`;
      const bodyParams = new URLSearchParams();
      bodyParams.append('message', description || title);
      bodyParams.append('link', body.link || 'https://ulpana-hebrew.vercel.app/?promo=FB');
      bodyParams.append('access_token', pageAccessToken);

      const fbRes = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
      });

      const fbData = await fbRes.json();
      if (!fbRes.ok || fbData.error) {
        return NextResponse.json(
          { error: `Ошибка Meta API: ${fbData.error?.message || 'Не удалось опубликовать пост'}` },
          { status: 502 }
        );
      }

      const postId = fbData.id;
      const liveUrl = `https://www.facebook.com/${postId}`;

      if (register) {
        await registerPublication({
          publicationId,
          channel: 'facebook',
          title,
          campaignTitle,
          version,
          caption: description || title,
          format: 'post',
          channelAccount: 'Ulpana - Иврит без паники',
          livePostUrl: liveUrl,
          promoCode: 'FB_POST',
          notes: 'Публикация в Facebook через веб-админку'
        });
      }

      return NextResponse.json({
        success: true,
        channel: 'facebook',
        postId,
        livePostUrl: liveUrl
      });
    }

    // ==========================================
    // 4. ПУБЛИКАЦИЯ В TIKTOK (Content Posting API v2)
    // ==========================================
    if (channel === 'tiktok') {
      const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
      const refreshToken = process.env.TIKTOK_REFRESH_TOKEN?.trim();

      if (!clientKey || !clientSecret || !refreshToken) {
        return NextResponse.json(
          {
            error: 'TikTok API ещё не авторизован! Выполните один раз в терминале команду: node growth/scripts/post_to_tiktok.cjs --auth',
            requiresAuth: true
          },
          { status: 400 }
        );
      }

      let videoResult: ResolvedVideo | null = null;
      try {
        if (body.videoPath) {
          videoResult = await resolveServerVideo(body.videoPath);
        }
        const videoFilePath = videoResult?.filePath;

        if (!videoFilePath || !fs.existsSync(videoFilePath)) {
          return NextResponse.json(
            { error: `Видеофайл для TikTok не найден на сервере: ${body.videoPath || 'путь не указан'}` },
            { status: 404 }
          );
        }

        const videoStats = fs.statSync(videoFilePath);
        const videoSize = videoStats.size;

        // 1. Получаем свежий Access Token через Refresh Token
        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
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

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.data?.access_token) {
          return NextResponse.json(
            { error: `Ошибка обновления токена TikTok: ${tokenData.error_description || tokenData.message || JSON.stringify(tokenData)}` },
            { status: 502 }
          );
        }

        const accessToken = tokenData.data.access_token;

        // 2. Инициализация Direct Post
        const chunkSize = 10 * 1024 * 1024; // 10MB
        const totalChunks = Math.ceil(videoSize / chunkSize);
        const privacyLevel = body.privacy === 'public' ? 'PUBLIC_TO_EVERYONE' : 'SELF_ONLY';

        const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8'
          },
          body: JSON.stringify({
            post_info: {
              title: description || title,
              privacy_level: privacyLevel,
              disable_duet: false,
              disable_stitch: false,
              disable_comment: false,
              video_cover_timestamp_ms: 1000
            },
            source_info: {
              source: 'FILE_UPLOAD',
              video_size: videoSize,
              chunk_size: chunkSize,
              total_chunk_count: totalChunks
            }
          })
        });

        const initData = await initRes.json();
        if (!initRes.ok || !initData.data?.publish_id) {
          return NextResponse.json(
            { error: `Ошибка инициализации публикации TikTok: ${initData.error?.message || JSON.stringify(initData)}` },
            { status: 502 }
          );
        }

        const publishId = initData.data.publish_id;
        const uploadUrl = initData.data.upload_url;

        // 3. Загрузка видео частями
        const fileBuffer = fs.readFileSync(videoFilePath);
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, videoSize);
          const chunk = fileBuffer.subarray(start, end);

          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'video/mp4',
              'Content-Range': `bytes ${start}-${end - 1}/${videoSize}`,
              'Content-Length': chunk.length.toString()
            },
            body: chunk
          });

          if (!uploadRes.ok && uploadRes.status !== 308) {
            return NextResponse.json(
              { error: `Ошибка загрузки видео в TikTok: HTTP ${uploadRes.status}` },
              { status: 502 }
            );
          }
        }

        const liveUrl = 'https://www.tiktok.com/@ulpana_il';

        if (register) {
          await registerPublication({
            publicationId,
            channel: 'tiktok',
            title,
            campaignTitle,
            version,
            videoPath: body.videoPath || videoFilePath,
            caption: description || title,
            format: 'short_video',
            channelAccount: '@ulpana_il',
            livePostUrl: liveUrl,
            promoCode: 'TIKTOK',
            notes: `Публикация в TikTok через веб-админку (Publish ID: ${publishId})`
          });
        }

        return NextResponse.json({
          success: true,
          channel: 'tiktok',
          publishId,
          livePostUrl: liveUrl,
          title
        });
      } catch (tiktokErr: any) {
        console.error('[Publish API] Ошибка публикации в TikTok:', tiktokErr.message);
        return NextResponse.json(
          { error: `Ошибка публикации в TikTok: ${tiktokErr.message}` },
          { status: 500 }
        );
      } finally {
        if (videoResult?.isTemp && fs.existsSync(videoResult.filePath)) {
          try {
            fs.unlinkSync(videoResult.filePath);
          } catch {}
        }
      }
    }

    return NextResponse.json({ error: `Неподдерживаемый канал: ${channel}` }, { status: 400 });
  } catch (error: any) {
    console.error('[API Marketing Publish] Fatal Error:', error);
    return NextResponse.json({ error: `Внутренняя ошибка сервера: ${error.message}` }, { status: 500 });
  }
}
