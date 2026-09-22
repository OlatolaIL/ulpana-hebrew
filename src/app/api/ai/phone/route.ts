import { groqModels, geminiModels, resolveAiKeys } from '@/lib/aiModels';
import { readAiJson, fetchAi, aiErrorResponse, AiRequestError } from '@/lib/aiRequest';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT, FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { getLessonPhoneScenario, getPhoneLessonContract } from '@/data/phoneScenarios';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { buildPhonePrompt, normalizePhoneTurns, validatePhoneReply } from '@/lib/phoneConversation';

interface PhoneRequestBody {
  messages?: unknown;
  lessonNumber?: number;
  userGender?: 'male' | 'female';
  userName?: string;
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await readAiJson<PhoneRequestBody>(req);
    const lessonNumber = body.lessonNumber ?? 1;
    const lesson = DETAILED_LESSONS[lessonNumber];
    if (!lesson) throw new AiRequestError('Урок не найден.', 400);
    if (body.userGender !== undefined && body.userGender !== 'male' && body.userGender !== 'female') {
      throw new AiRequestError('Некорректный профиль ученика.', 400);
    }
    const gender = body.userGender || 'male';
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > FREE_GUEST_LESSONS_LIMIT) {
      throw new AiRequestError('Для этого урока войдите в аккаунт.', 401);
    }
    if (!IS_EARLY_ACCESS_FREE && (!session || session.subscriptionTier !== 'pro') && lessonNumber > FREE_LESSONS_LIMIT) {
      throw new AiRequestError('Для этого урока требуется подписка PRO.', 403);
    }
    const identity = session?.id || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'guest';
    const limit = checkRateLimit(`ai_phone_${identity}`, { limit: 30, windowMs: 60 * 1000 });
    if (!limit.allowed) throw new AiRequestError('Слишком много запросов. Попробуйте через минуту.', 429);

    let turns;
    try { turns = normalizePhoneTurns(body.messages || []); }
    catch { throw new AiRequestError('Некорректная история звонка.', 400); }
    if (!turns.length || turns.at(-1)?.role !== 'user') throw new AiRequestError('Ожидается реплика ученика.', 400);

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
    const validate = (raw: string) => validatePhoneReply(JSON.parse(raw), { contract, turns, name, lessonNumber });

    // Native system instructions and separate user/model turns; no history-as-instructions.
    for (const key of geminiKeys) {
      for (const model of geminiModels('phone')) {
        try {
          const response = await fetchAi(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: turns.map(t => ({ role: t.role === 'user' ? 'user' : 'model', parts: [{ text: t.content }] })),
              generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
            }),
          });
          if (!response.ok) continue;
          const data = await response.json();
          const result = validate(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          return NextResponse.json({ ...result, engine: `Gemini (${model})` });
        } catch {
          // Try the configured backup. Do not log provider payloads, transcripts or keys.
        }
      }
    }

    if (groqKey) {
      for (const model of groqModels('phone')) {
        try {
          const response = await fetchAi('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
            body: JSON.stringify({
              model, messages: [{ role: 'system', content: systemPrompt }, ...turns],
              response_format: { type: 'json_object' }, temperature: 0.3, max_tokens: 500,
              ...(model.includes('oss') ? { reasoning_effort: 'low' } : {}),
            }),
          });
          if (!response.ok) continue;
          const data = await response.json();
          const result = validate(data.choices?.[0]?.message?.content || '{}');
          return NextResponse.json({ ...result, engine: `Groq (${model})` });
        } catch {
          // Malformed or contradictory output is not recovered as a successful answer.
        }
      }
    }

    throw new AiRequestError('Собеседник сейчас не смог ответить. Повторите реплику; разговор сохранён.', 503);
  } catch (error) { return aiErrorResponse(error); }
}
