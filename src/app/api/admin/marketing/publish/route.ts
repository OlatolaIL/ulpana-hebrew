import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export interface PublishRequestBody {
  channel: 'youtube' | 'telegram' | 'facebook';
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

function registerPublication(pub: {
  publicationId?: string;
  channel: 'youtube' | 'telegram' | 'facebook';
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
      updatedAt: new Date().toISOString()
    };

    items.unshift(newPub);
    fs.writeFileSync(PUBLICATIONS_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[Publish API] Warning: Failed to register in publications.json:', err.message);
  }
}

function resolveServerVideoPath(inputPath?: string): string | null {
  if (inputPath) {
    const directPath = path.isAbsolute(inputPath)
      ? inputPath
      : path.join(process.cwd(), inputPath.replace(/^\//, ''));
    if (fs.existsSync(directPath)) return directPath;
  }

  // Дефолтные кандидаты в public/demo/
  const candidates = [
    path.join(process.cwd(), 'public', 'demo', 'reels_duolingo_vs_reality.mp4'),
    path.join(process.cwd(), 'public', 'demo', 'tutorials', 'stage_05_dialogue_v2.mp4'),
    path.join(process.cwd(), 'public', 'demo', 'ulpana_full_guide.mp4')
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }

  return null;
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

      const videoFilePath = resolveServerVideoPath(body.videoPath);
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
        registerPublication({
          publicationId,
          channel: 'youtube',
          title,
          campaignTitle,
          version,
          videoPath: videoFilePath,
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

      const videoFilePath = body.videoPath ? resolveServerVideoPath(body.videoPath) : null;

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
          registerPublication({
            publicationId,
            channel: 'telegram',
            title,
            campaignTitle,
            version,
            videoPath: videoFilePath || undefined,
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
        registerPublication({
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
        registerPublication({
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

    return NextResponse.json({ error: `Неподдерживаемый канал: ${channel}` }, { status: 400 });
  } catch (error: any) {
    console.error('[API Marketing Publish] Fatal Error:', error);
    return NextResponse.json({ error: `Внутренняя ошибка сервера: ${error.message}` }, { status: 500 });
  }
}
