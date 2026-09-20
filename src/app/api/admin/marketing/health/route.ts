import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { geminiApiKeys, groqModels } from '@/lib/aiModels';
import fs from 'fs';
import path from 'path';

export interface ServiceHealth {
  status: 'ok' | 'warning' | 'error' | 'disabled' | 'manual_mode';
  latencyMs?: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface MarketingHealthResponse {
  timestamp: string;
  services: {
    telegram: ServiceHealth;
    groq: ServiceHealth;
    gemini: ServiceHealth;
    whatsapp: ServiceHealth;
    meta: ServiceHealth;
    youtube: ServiceHealth;
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const startTime = Date.now();

    // 1. Проверка Telegram Bot & Канала @ulpana_il
    const tgToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    let telegramHealth: ServiceHealth;

    if (!tgToken) {
      telegramHealth = {
        status: 'warning',
        message: 'TELEGRAM_BOT_TOKEN не задан в .env.local',
      };
    } else {
      const t0 = Date.now();
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${tgToken}/getMe`, {
          signal: AbortSignal.timeout(4000),
        });
        const meData = await meRes.json();

        if (!meData.ok) {
          telegramHealth = {
            status: 'error',
            latencyMs: Date.now() - t0,
            message: `Ошибка токена Telegram: ${meData.description || 'Неверный токен'}`,
          };
        } else {
          const botUser = meData.result;
          // Проверяем права в канале @ulpana_il
          let isChannelAdmin = false;
          let channelMsg = 'Права в канале не проверены';

          try {
            const memberRes = await fetch(
              `https://api.telegram.org/bot${tgToken}/getChatMember?chat_id=@ulpana_il&user_id=${botUser.id}`,
              { signal: AbortSignal.timeout(4000) }
            );
            const memberData = await memberRes.json();
            if (memberData.ok) {
              const role = memberData.result?.status;
              if (role === 'administrator' || role === 'creator') {
                isChannelAdmin = true;
                channelMsg = `Администратор в @ulpana_il (${role})`;
              } else {
                channelMsg = `В канале @ulpana_il, но статус: ${role} (нужны права админа)`;
              }
            } else {
              channelMsg = `Не удалось проверить канал: ${memberData.description || 'Канал закрыт или бот не добавлен'}`;
            }
          } catch (e: any) {
            channelMsg = `Таймаут проверки канала: ${e.message}`;
          }

          telegramHealth = {
            status: isChannelAdmin ? 'ok' : 'warning',
            latencyMs: Date.now() - t0,
            message: isChannelAdmin
              ? `Бот @${botUser.username} активен и имеет права админа в @ulpana_il`
              : `Бот @${botUser.username} активен, но: ${channelMsg}`,
            details: {
              botUsername: botUser.username,
              botId: botUser.id,
              isChannelAdmin,
              channelStatus: channelMsg,
            },
          };
        }
      } catch (e: any) {
        telegramHealth = {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: `Ошибка подключения к Telegram API: ${e.message}`,
        };
      }
    }

    // 2. Проверка Groq LLM API
    const groqKey = process.env.GROQ_API_KEY?.trim();
    let groqHealth: ServiceHealth;

    if (!groqKey) {
      groqHealth = {
        status: 'warning',
        message: 'GROQ_API_KEY не задан в .env',
      };
    } else {
      const t0 = Date.now();
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${groqKey}` },
          signal: AbortSignal.timeout(4000),
        });
        const groqData = await groqRes.json();

        if (!groqRes.ok) {
          groqHealth = {
            status: 'error',
            latencyMs: Date.now() - t0,
            message: `Ошибка Groq API (${groqRes.status}): ${groqData.error?.message || 'Ошибка авторизации'}`,
          };
        } else {
          const models = groqModels('chat');
          groqHealth = {
            status: 'ok',
            latencyMs: Date.now() - t0,
            message: `Groq API активен. Модели: ${models.join(', ')}`,
            details: {
              configuredModels: models,
              totalAvailableModels: Array.isArray(groqData.data) ? groqData.data.length : 0,
            },
          };
        }
      } catch (e: any) {
        groqHealth = {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: `Ошибка подключения к Groq API: ${e.message}`,
        };
      }
    }

    // 3. Проверка Gemini LLM API
    const geminiKeys = geminiApiKeys();
    let geminiHealth: ServiceHealth;

    if (geminiKeys.length === 0) {
      geminiHealth = {
        status: 'warning',
        message: 'Ключи Gemini (GEMINI_PRIMARY_API_KEY) не заданы в .env',
      };
    } else {
      const t0 = Date.now();
      const primaryKey = geminiKeys[0];
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${primaryKey}`,
          { signal: AbortSignal.timeout(4000) }
        );
        const geminiData = await geminiRes.json();

        if (!geminiRes.ok) {
          geminiHealth = {
            status: 'error',
            latencyMs: Date.now() - t0,
            message: `Ошибка Gemini API (${geminiRes.status}): ${geminiData.error?.message || 'Ошибка ключа'}`,
          };
        } else {
          geminiHealth = {
            status: 'ok',
            latencyMs: Date.now() - t0,
            message: `Gemini API активен (ключей в пуле: ${geminiKeys.length})`,
            details: {
              keysInPool: geminiKeys.length,
              availableModels: Array.isArray(geminiData.models) ? geminiData.models.length : 0,
            },
          };
        }
      } catch (e: any) {
        geminiHealth = {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: `Ошибка подключения к Gemini API: ${e.message}`,
        };
      }
    }

    // 4. Проверка WhatsApp Radar (Baileys Session)
    let whatsappHealth: ServiceHealth;
    const waSessionDir = path.join(process.cwd(), 'growth', 'data', 'wa_session');
    const waSessionExists = fs.existsSync(waSessionDir) && fs.readdirSync(waSessionDir).length > 0;

    if (waSessionExists) {
      whatsappHealth = {
        status: 'ok',
        message: 'Сессия WhatsApp сохранена в growth/data/wa_session',
        details: { sessionPath: 'growth/data/wa_session' },
      };
    } else {
      whatsappHealth = {
        status: 'warning',
        message: 'Сессия WhatsApp не инициализирована (требуется привязка номера через QR-код)',
        details: { sessionPath: 'growth/data/wa_session' },
      };
    }

    // 5. Проверка Meta (Facebook / Instagram)
    let metaHealth: ServiceHealth;
    const metaToken = process.env.META_ACCESS_TOKEN?.trim();
    const fbPageId = process.env.FB_PAGE_ID?.trim();

    if (!metaToken || !fbPageId) {
      metaHealth = {
        status: 'manual_mode',
        message: 'FB_PAGE_ID или META_ACCESS_TOKEN не заданы в .env.local (доступен ручной режим через Meta Business Suite)',
        details: { mode: 'Meta Business Suite UI' },
      };
    } else {
      const t0 = Date.now();
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/v26.0/${encodeURIComponent(fbPageId)}?fields=name,id,link,tasks&access_token=${encodeURIComponent(metaToken)}`,
          { signal: AbortSignal.timeout(4000) }
        );
        const fbData = await fbRes.json();

        if (!fbRes.ok || fbData.error) {
          metaHealth = {
            status: 'error',
            latencyMs: Date.now() - t0,
            message: `Ошибка Meta API: ${fbData.error?.message || 'Не удалось получить данные страницы'}`,
            details: fbData.error || {},
          };
        } else {
          metaHealth = {
            status: 'ok',
            latencyMs: Date.now() - t0,
            message: `Страница Facebook "${fbData.name}" подключена (ID: ${fbData.id})`,
            details: {
              pageName: fbData.name,
              pageId: fbData.id,
              pageLink: fbData.link,
              tasks: fbData.tasks,
              mode: 'Graph API Direct Auto-post',
            },
          };
        }
      } catch (e: any) {
        metaHealth = {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: `Таймаут/ошибка подключения к Meta API: ${e.message}`,
        };
      }
    }

    // 6. Проверка YouTube (YouTube Data API v3 & Shorts)
    let youtubeHealth: ServiceHealth;
    const ytClientId = process.env.YOUTUBE_CLIENT_ID?.trim();
    const ytClientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
    const ytRefreshToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();

    if (!ytClientId || !ytClientSecret || !ytRefreshToken) {
      youtubeHealth = {
        status: 'manual_mode',
        message: 'YOUTUBE_REFRESH_TOKEN не задан в Vercel Env / .env.local (доступен ручной режим или CLI)',
        details: { mode: 'Manual Upload / Studio UI' },
      };
    } else {
      const t0 = Date.now();
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: ytClientId,
            client_secret: ytClientSecret,
            refresh_token: ytRefreshToken,
            grant_type: 'refresh_token',
          }),
          signal: AbortSignal.timeout(4000),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          youtubeHealth = {
            status: 'error',
            latencyMs: Date.now() - t0,
            message: `Ошибка токена YouTube: ${tokenData.error_description || 'Неверный refresh token'}`,
            details: tokenData,
          };
        } else {
          // Запрашиваем информацию о канале
          const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
            signal: AbortSignal.timeout(4000),
          });
          const channelData = await channelRes.json();
          const channelTitle = channelData.items?.[0]?.snippet?.title || 'Ульпан Алеф | Живой иврит';
          const channelId = channelData.items?.[0]?.id || 'UC1kWxNhUydNncIRzTbBzWJw';

          youtubeHealth = {
            status: 'ok',
            latencyMs: Date.now() - t0,
            message: `YouTube-канал "${channelTitle}" подключен (ID: ${channelId})`,
            details: {
              channelTitle,
              channelId,
              mode: 'YouTube Data API v3 Direct Resumable Upload',
            },
          };
        }
      } catch (e: any) {
        youtubeHealth = {
          status: 'error',
          latencyMs: Date.now() - t0,
          message: `Таймаут/ошибка подключения к YouTube API: ${e.message}`,
        };
      }
    }

    const response: MarketingHealthResponse = {
      timestamp: new Date().toISOString(),
      services: {
        telegram: telegramHealth,
        groq: groqHealth,
        gemini: geminiHealth,
        whatsapp: whatsappHealth,
        meta: metaHealth,
        youtube: youtubeHealth,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API Marketing Health GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
