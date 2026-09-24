import { groqModels, geminiModels, resolveAiKeys } from '@/lib/aiModels';
import { readAiJson, fetchAi, aiErrorResponse, AiRequestError, classifyHttpError, AiErrorCategory } from '@/lib/aiRequest';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT, FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { getLessonPhoneScenario, getPhoneLessonContract } from '@/data/phoneScenarios';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { buildPhonePrompt, normalizePhoneTurns, validatePhoneReply } from '@/lib/phoneConversation';

export const maxDuration = 30;

interface PhoneAttemptDiagnostic {
  provider: 'gemini' | 'groq';
  model: string;
  status?: number;
  category: AiErrorCategory;
  durationMs: number;
  phase?: 'transport' | 'http' | 'parse' | 'validation';
}

interface PhoneRequestBody {
  requestId?: string;
  messages?: unknown;
  lessonNumber?: number;
  userGender?: 'male' | 'female';
  userName?: string;
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  let requestId = req.headers.get('x-request-id') || '';
  try {
    const body = await readAiJson<PhoneRequestBody>(req);
    if (!requestId && typeof body.requestId === 'string') {
      requestId = body.requestId;
    }
    if (!requestId) {
      requestId = `phone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }

    const lessonNumber = body.lessonNumber ?? 1;
    const lesson = DETAILED_LESSONS[lessonNumber];
    if (!lesson) throw new AiRequestError('Урок не найден.', 400, 'validation_rejected', requestId);
    if (body.userGender !== undefined && body.userGender !== 'male' && body.userGender !== 'female') {
      throw new AiRequestError('Некорректный профиль ученика.', 400, 'validation_rejected', requestId);
    }
    const gender = body.userGender || 'male';
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > FREE_GUEST_LESSONS_LIMIT) {
      throw new AiRequestError('Для этого урока войдите в аккаунт.', 401, 'auth_config', requestId);
    }
    if (!IS_EARLY_ACCESS_FREE && (!session || session.subscriptionTier !== 'pro') && lessonNumber > FREE_LESSONS_LIMIT) {
      throw new AiRequestError('Для этого урока требуется подписка PRO.', 403, 'auth_config', requestId);
    }
    const identity = session?.id || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'guest';
    const limit = checkRateLimit(`ai_phone_${identity}`, { limit: 30, windowMs: 60 * 1000 });
    if (!limit.allowed) throw new AiRequestError('Слишком много запросов. Попробуйте через минуту.', 429, 'app_rate_limit', requestId);

    let turns;
    try { turns = normalizePhoneTurns(body.messages || []); }
    catch { throw new AiRequestError('Некорректная история звонка.', 400, 'validation_rejected', requestId); }
    if (!turns.length || turns.at(-1)?.role !== 'user') throw new AiRequestError('Ожидается реплика ученика.', 400, 'validation_rejected', requestId);

    // All roles, goals and limits come from the same versioned server contract.
    const contract = getPhoneLessonContract(lessonNumber);
    const scenario = getLessonPhoneScenario(lesson, gender);
    const vocabulary = [...new Set([
      ...Object.values(DETAILED_LESSONS).filter(l => l.number <= lessonNumber).flatMap(l => l.vocabulary.map(w => w.hebrew)),
      ...(scenario.usefulWords || []).map(w => w.hebrew),
    ])];
    const name = typeof body.userName === 'string' ? body.userName.slice(0, 80) : undefined;
    const systemPrompt = buildPhonePrompt({ lessonNumber, gender, name, scenario, contract, turns, vocabulary });
    const { groqKey, geminiKeys } = resolveAiKeys(body.provider || 'gemini', body.apiKey);

    const startTime = Date.now();
    const TOTAL_BUDGET_MS = 24000;
    let lastErrorCategory: AiErrorCategory = 'provider_unavailable';
    let lastRetryAfter: string | undefined = undefined;
    const attempts: PhoneAttemptDiagnostic[] = [];

    if (geminiKeys.length === 0) {
      attempts.push({
        provider: 'gemini',
        model: 'none',
        category: 'auth_config',
        durationMs: 0,
      });
    }

    // Native system instructions and separate user/model turns; no history-as-instructions.
    geminiLoop: for (const key of geminiKeys) {
      for (const model of geminiModels('phone')) {
        const elapsed = Date.now() - startTime;
        const remaining = TOTAL_BUDGET_MS - elapsed;
        if (remaining < 2500) break geminiLoop;
        const attemptTimeout = Math.min(remaining - 500, 4500);
        const attemptStart = Date.now();
        let status: number | undefined;
        let phase: NonNullable<PhoneAttemptDiagnostic['phase']> = 'transport';

        try {
          const response = await fetchAi(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: turns.map(t => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] })),
              generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
            }),
          }, attemptTimeout);

          status = response.status;
          phase = 'http';
          if (!response.ok) {
            lastErrorCategory = classifyHttpError(response.status);
            const retryAfter = response.headers.get('retry-after') || undefined;
            if (retryAfter) lastRetryAfter = retryAfter;
            const durationMs = Date.now() - attemptStart;
            attempts.push({
              provider: 'gemini',
              model,
              status: response.status,
              phase,
              category: lastErrorCategory,
              durationMs,
            });
            console.warn(JSON.stringify({
              event: 'phone_ai_attempt_failed',
              requestId,
              provider: 'gemini',
              model,
              status: response.status,
              category: lastErrorCategory,
              retryAfter,
              durationMs,
            }));
            if (lastErrorCategory === 'provider_timeout') break geminiLoop;
            continue;
          }

          phase = 'parse';
          const data = await response.json();
          phase = 'validation';
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof rawText !== 'string') throw new Error('Missing provider content');
          phase = 'parse';
          const parsed = JSON.parse(rawText);
          phase = 'validation';
          const result = validatePhoneReply(parsed, { contract, turns, name, lessonNumber, gender });
          return NextResponse.json(
            { ...result, engine: `Gemini (${model})`, requestId },
            { headers: { 'x-request-id': requestId } }
          );
        } catch (attemptErr: any) {
          lastErrorCategory = attemptErr?.name === 'TimeoutError' || attemptErr?.name === 'AbortError' ? 'provider_timeout'
            : phase === 'parse' && attemptErr instanceof SyntaxError ? 'malformed_json' : phase === 'validation' ? 'validation_rejected' : 'provider_unavailable';
          if (lastErrorCategory === 'provider_timeout' || lastErrorCategory === 'provider_unavailable') phase = 'transport';
          const durationMs = Date.now() - attemptStart;
          attempts.push({
            provider: 'gemini',
            model,
            status,
            phase,
            category: lastErrorCategory,
            durationMs,
          });
          console.warn(JSON.stringify({
            event: 'phone_ai_attempt_exception',
            requestId,
            provider: 'gemini',
            model,
            status,
            phase,
            category: lastErrorCategory,
            durationMs,
          }));
          // If Gemini timed out, skip retrying remaining Gemini keys to switch to Groq fallback within budget
          if (lastErrorCategory === 'provider_timeout') {
            break geminiLoop;
          }
        }
      }
    }

    if (groqKey) {
      for (const model of groqModels('phone')) {
        const elapsed = Date.now() - startTime;
        const remaining = TOTAL_BUDGET_MS - elapsed;
        if (remaining < 2500) break;
        const attemptTimeout = Math.min(remaining - 500, 4500);
        const attemptStart = Date.now();
        let status: number | undefined;
        let phase: NonNullable<PhoneAttemptDiagnostic['phase']> = 'transport';

        try {
          const response = await fetchAi('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
            body: JSON.stringify({
              model, messages: [{ role: 'system', content: systemPrompt }, ...turns],
              response_format: { type: 'json_object' }, temperature: 0.3, max_tokens: 500,
              ...(model.includes('oss') ? { reasoning_effort: 'low' } : {}),
            }),
          }, attemptTimeout);

          status = response.status;
          phase = 'http';
          if (!response.ok) {
            lastErrorCategory = classifyHttpError(response.status);
            const retryAfter = response.headers.get('retry-after') || undefined;
            if (retryAfter) lastRetryAfter = retryAfter;
            const durationMs = Date.now() - attemptStart;
            attempts.push({
              provider: 'groq',
              model,
              status: response.status,
              phase,
              category: lastErrorCategory,
              durationMs,
            });
            console.warn(JSON.stringify({
              event: 'phone_ai_attempt_failed',
              requestId,
              provider: 'groq',
              model,
              status: response.status,
              category: lastErrorCategory,
              retryAfter,
              durationMs,
            }));
            continue;
          }

          phase = 'parse';
          const data = await response.json();
          phase = 'validation';
          const rawText = data?.choices?.[0]?.message?.content;
          if (typeof rawText !== 'string') throw new Error('Missing provider content');
          phase = 'parse';
          const parsed = JSON.parse(rawText);
          phase = 'validation';
          const result = validatePhoneReply(parsed, { contract, turns, name, lessonNumber, gender });
          return NextResponse.json(
            { ...result, engine: `Groq (${model})`, requestId },
            { headers: { 'x-request-id': requestId } }
          );
        } catch (attemptErr: any) {
          lastErrorCategory = attemptErr?.name === 'TimeoutError' || attemptErr?.name === 'AbortError' ? 'provider_timeout'
            : phase === 'parse' && attemptErr instanceof SyntaxError ? 'malformed_json' : phase === 'validation' ? 'validation_rejected' : 'provider_unavailable';
          if (lastErrorCategory === 'provider_timeout' || lastErrorCategory === 'provider_unavailable') phase = 'transport';
          const durationMs = Date.now() - attemptStart;
          attempts.push({
            provider: 'groq',
            model,
            status,
            phase,
            category: lastErrorCategory,
            durationMs,
          });
          console.warn(JSON.stringify({
            event: 'phone_ai_attempt_exception',
            requestId,
            provider: 'groq',
            model,
            status,
            phase,
            category: lastErrorCategory,
            durationMs,
          }));
        }
      }
    } else {
      attempts.push({
        provider: 'groq',
        model: 'none',
        category: 'auth_config',
        durationMs: 0,
      });
    }

    const errorObj = new AiRequestError(
      'Собеседник сейчас не смог ответить. Повторите реплику; разговор сохранён.',
      503,
      lastErrorCategory,
      requestId,
      true,
      { attempts }
    );
    const errRes = aiErrorResponse(errorObj, requestId);
    if (lastRetryAfter) {
      errRes.headers.set('retry-after', lastRetryAfter);
    }
    return errRes;
  } catch (error) {
    return aiErrorResponse(error, requestId);
  }
}
