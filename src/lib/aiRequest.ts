import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rateLimit';
import { verifySessionToken } from './auth';
import { createHash } from 'crypto';
import { getDbPool, initDatabase } from './db';
import { AiBudgetExceeded, consumeAiBudget } from './aiBudget';
import { RequestBodyError } from './requestBody';
import type { UserSession } from '@/types';
import { FREE_GUEST_LESSONS_LIMIT } from './config';

export type AiErrorCategory =
  | 'app_rate_limit'
  | 'provider_rate_limit'
  | 'auth_config'
  | 'invalid_audio'
  | 'provider_timeout'
  | 'provider_unavailable'
  | 'malformed_json'
  | 'validation_rejected';

export function classifyHttpError(status: number): AiErrorCategory {
  if (status === 401 || status === 403) return 'auth_config';
  if (status === 429) return 'provider_rate_limit';
  if (status === 400 || status === 422) return 'validation_rejected';
  if (status === 408 || status === 504) return 'provider_timeout';
  if (status >= 500) return 'provider_unavailable';
  return 'provider_unavailable';
}

export class AiRequestError extends Error {
  status: number;
  category?: AiErrorCategory;
  requestId?: string;
  retryable?: boolean;
  constructor(
    message: string,
    status: number,
    category?: AiErrorCategory,
    requestId?: string,
    retryable?: boolean
  ) {
    super(message);
    this.status = status;
    this.category = category;
    this.requestId = requestId;
    this.retryable = retryable;
  }
}

export async function checkAiRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get('ulpana_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (token && !session) throw new AiRequestError('Сессия истекла. Войдите снова.', 401);
  const identity = session?.id || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'guest';
  const limit = checkRateLimit(`ai:${identity}`, { limit: 40, windowMs: 60000 });
  if (!limit.allowed) throw new AiRequestError('Слишком много запросов. Попробуйте через минуту.', 429);
  const db = getDbPool();
  if (!db) {
    if (process.env.NODE_ENV === 'production') throw new AiRequestError('Сервис ИИ временно недоступен.', 503);
    return session;
  }
  await initDatabase();
  const identityKey = createHash('sha256').update(`${session ? 'user' : 'guest'}:${identity}`).digest('hex');
  try { await consumeAiBudget(db, identityKey, Boolean(session)); }
  catch (error) {
    if (error instanceof AiBudgetExceeded) throw new AiRequestError(error.message, 429);
    throw error;
  }
  return session;
}

/** Read the stream with a real byte limit, even when Content-Length is absent. */
export async function readAiJson<T>(req: NextRequest): Promise<T> {
  const session = await checkAiRequest(req);
  const reader = req.body?.getReader();
  if (!reader) throw new AiRequestError('Пустой запрос.', 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 128 * 1024) {
        await reader.cancel();
        throw new AiRequestError('Слишком большой запрос.', 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AiRequestError('Некорректный JSON.', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AiRequestError('Ожидается объект запроса.', 400);
  }
  const fields = body as Record<string, unknown>;
  for (const name of ['lessonId', 'lessonNumber']) {
    const value = fields[name];
    if (value !== undefined && (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 100)) {
      throw new AiRequestError('Некорректный номер урока.', 400);
    }
    if (typeof value === 'number' && value > FREE_GUEST_LESSONS_LIMIT && !session) {
      throw new AiRequestError('Для этого урока войдите в бесплатный аккаунт.', 401);
    }
  }
  for (const name of ['userEssay', 'userSpokenHebrew', 'referenceHebrew', 'apiKey', 'word', 'verb']) {
    const value = fields[name];
    if (value !== undefined && (typeof value !== 'string' || value.length > 8000)) {
      throw new AiRequestError('Некорректный или слишком длинный текст.', 400);
    }
  }
  for (const name of ['messages', 'transcript', 'acceptableKeywords', 'sampleVariations']) {
    const value = fields[name];
    if (value !== undefined && (!Array.isArray(value) || value.length > 100)) {
      throw new AiRequestError('Слишком много элементов запроса.', 400);
    }
  }
  return body as T;
}

export function aiErrorResponse(error: unknown, reqId?: string): NextResponse {
  const isCustom = error instanceof AiRequestError || error instanceof RequestBodyError;
  const status = isCustom ? error.status : 503;
  const requestId = (error instanceof AiRequestError && error.requestId) || reqId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const category = (error instanceof AiRequestError && error.category) || (status === 429 ? 'app_rate_limit' : status >= 500 ? 'provider_unavailable' : 'validation_rejected');
  const message = isCustom ? error.message : 'Сервис временно недоступен. Попробуйте снова; оценка не выставлена.';

  return NextResponse.json(
    {
      error: message,
      code: category,
      category,
      requestId,
      retryable: status === 429 || status >= 500,
    },
    {
      status,
      headers: {
        'x-request-id': requestId,
      },
    },
  );
}

export function fetchAi(input: string | URL | Request, init?: RequestInit, timeoutMs?: number): Promise<Response> {
  const defaultTimeout = timeoutMs && timeoutMs > 0 ? timeoutMs : 20000;
  if (typeof input === 'string' || input instanceof URL) {
    const url = new URL(input);
    if (url.hostname === 'generativelanguage.googleapis.com' && url.searchParams.has('key')) {
      const headers = new Headers(init?.headers);
      headers.set('x-goog-api-key', url.searchParams.get('key') || '');
      url.searchParams.delete('key');
      return fetch(url, { ...init, headers, signal: init?.signal || AbortSignal.timeout(defaultTimeout) });
    }
  }
  return fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(defaultTimeout) });
}

/** A transcript contains no evidence about the learner's pronunciation. */
export function textOnlyEvaluation<T extends object>(evaluation: T): T {
  const result = { ...evaluation } as T & {
    pronunciationScore?: number;
    pronunciationFeedbackRu?: string;
    turnReviews?: object[];
  };
  delete result.pronunciationScore;
  delete result.pronunciationFeedbackRu;
  if (result.turnReviews) result.turnReviews = result.turnReviews.map(textOnlyEvaluation);
  return result;
}
