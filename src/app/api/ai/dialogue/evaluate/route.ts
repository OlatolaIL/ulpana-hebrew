import { groqModels as configuredGroqModels, geminiModel, resolveAiKeys } from '@/lib/aiModels';
import { readAiJson, fetchAi, aiErrorResponse, textOnlyEvaluation } from '@/lib/aiRequest';
import { detectHebrewGrammarErrors, detectHebrewWordOrderErrors } from '@/lib/hebrewFeedback';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT, FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { stripNikkud } from '@/lib/transcription';
import { sanitizeRussianTranslation } from '@/lib/russianTranslation';
import { DialogueEvaluationResult } from '@/types';

interface DialogueEvaluateRequestBody {
  userSpokenHebrew: string;
  targetIntentRu: string;
  referenceHebrew: string;
  acceptableKeywords?: string[];
  sampleVariations?: string[];
  userGender?: 'male' | 'female';
  opponentGender?: 'male' | 'female';
  lessonNumber?: number;
  level?: 'alef' | 'bet';
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

/**
 * Локальная эвристическая оценка семантического соответствия
 * используется как быстрый фолбэк при недоступности внешнего LLM API
 */
function evaluateHeuristic(
  userText: string,
  referenceHebrew: string,
  acceptableKeywords: string[] = [],
  sampleVariations: string[] = []
): DialogueEvaluationResult {
  const cleanUser = stripNikkud(userText).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').trim();
  const cleanRef = stripNikkud(referenceHebrew).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').trim();

  // 0. Строгая проверка базовой грамматики и порядка слов
  const grammarErrors = detectHebrewGrammarErrors(userText);
  const wordOrderErrors = detectHebrewWordOrderErrors(userText);
  const allDetectedErrors = [...grammarErrors, ...wordOrderErrors];

  if (allDetectedErrors.length > 0) {
    const errorExplanations = allDetectedErrors.map((e) => e.explanationRu).join(' ');
    return {
      isCorrect: true,
      score: Math.min(70, Math.max(55, 75 - allDetectedErrors.length * 5)),
      assessment: 'good',
      feedbackRu: `Смысл ответа понятен, но есть ошибка в согласовании или порядке слов! ${errorExplanations}`,
      pronunciationScore: 82,
      pronunciationFeedbackRu: 'Обратите внимание на правильный порядок слов и согласование рода.',
      betterAlternative: referenceHebrew,
      userSpokenHebrew: userText,
    };
  }

  // 1. Точное или близкое совпадение с эталоном
  if (cleanRef.length > 0 && cleanUser === cleanRef) {
    return {
      isCorrect: true,
      score: 100,
      assessment: 'perfect',
      feedbackRu: 'Отлично! Смысл передан абсолютно точно.',
      pronunciationScore: 98,
      pronunciationFeedbackRu: 'Превосходная чёткость речи! Все звуки и окончания прозвучали внятно и чисто.',
      userSpokenHebrew: userText,
    };
  }

  // 2. Совпадение с одной из допустимых вариаций
  for (const variation of sampleVariations) {
    const cleanVar = stripNikkud(variation).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').trim();
    if (cleanVar.length > 0 && cleanUser === cleanVar) {
      return {
        isCorrect: true,
        score: 95,
        assessment: 'perfect',
        feedbackRu: 'Замечательно! Ваша фраза звучит естественно и точно передает мысль.',
        pronunciationScore: 92,
        pronunciationFeedbackRu: 'Хорошее произношение. Следите за полным договариванием конечных букв.',
        userSpokenHebrew: userText,
      };
    }
  }

  // 3. Проверка наличия ключевых корней / слов
  const matchedKeywords = acceptableKeywords.filter((kw) => {
    const cleanKw = stripNikkud(kw).toLowerCase().trim();
    return cleanKw.length >= 2 && cleanUser.includes(cleanKw);
  });

  const keywordRatio = acceptableKeywords.length > 0 ? matchedKeywords.length / acceptableKeywords.length : 0;

  if (matchedKeywords.length >= 2 || keywordRatio >= 0.5) {
    return {
      isCorrect: true,
      score: 85,
      assessment: 'good',
      feedbackRu: 'Хорошо! Смысл передан понятно, собеседник вас понял.',
      pronunciationScore: 84,
      pronunciationFeedbackRu: 'Смысл понятен. Обратите внимание на четкое договаривание окончаний слов.',
      betterAlternative: referenceHebrew,
      userSpokenHebrew: userText,
    };
  }

  if (matchedKeywords.length >= 1 && cleanUser.split(/\s+/).length >= 2) {
    return {
      isCorrect: true,
      score: 75,
      assessment: 'good',
      feedbackRu: 'Понятно! Основная мысль передана.',
      pronunciationScore: 78,
      pronunciationFeedbackRu: 'Слова распознаны, но старайтесь не проглатывать окончания букв на выдохе.',
      betterAlternative: referenceHebrew,
      userSpokenHebrew: userText,
    };
  }

  // Если слов совсем мало или они невпопад
  return {
    isCorrect: false,
    score: 40,
    assessment: 'incorrect',
    feedbackRu: 'Не совсем то. Попробуйте сказать иначе или используйте эталонную фразу.',
    pronunciationScore: 50,
    pronunciationFeedbackRu: 'Речь прозвучала неразборчиво. Попробуйте произнести слова медленнее и четче.',
    betterAlternative: referenceHebrew,
    userSpokenHebrew: userText,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await readAiJson<DialogueEvaluateRequestBody>(req);
    const {
      userSpokenHebrew = '',
      targetIntentRu = '',
      referenceHebrew = '',
      acceptableKeywords = [],
      sampleVariations = [],
      userGender = 'female',
      opponentGender = 'male',
      lessonNumber = 1,
      level = 'alef',
      provider = 'groq',
      apiKey,
    } = body;

    const trimmedUser = userSpokenHebrew.trim();
    if (!trimmedUser) {
      return NextResponse.json(textOnlyEvaluation({
        isCorrect: false,
        score: 0,
        assessment: 'incorrect',
        feedbackRu: 'Голос не распознан. Пожалуйста, нажмите на микрофон и произнесите ответ.',
        betterAlternative: referenceHebrew,
        userSpokenHebrew: '',
      } satisfies DialogueEvaluationResult));
    }

    // 1. Проверка авторизации: уроки с 3-го требуют бесплатной регистрации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > FREE_GUEST_LESSONS_LIMIT) {
      return NextResponse.json(
        textOnlyEvaluation({ error: 'Unauthorized: Требуется бесплатная регистрация для доступа к урокам с 3-го' }),
        { status: 401 }
      );
    }
    if (!IS_EARLY_ACCESS_FREE && (!session || session.subscriptionTier !== 'pro') && lessonNumber > FREE_LESSONS_LIMIT) {
      return NextResponse.json(
        textOnlyEvaluation({ error: 'Unauthorized: Требуется подписка PRO для уроков выше 30-го' }),
        { status: 403 }
      );
    }

    // 2. Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_dialogue_eval_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 40, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      // При превышении лимита возвращаем надежную локальную оценку без задержки
      return NextResponse.json(textOnlyEvaluation({ error: 'Слишком много запросов. Попробуйте через минуту.' }), { status: 429 });
    }

    // 3. Предварительный анализ грамматических ошибок согласования (זֶה / זֹאת / אֵלֶּה) и порядка слов
    const detectedGrammarErrors = [
      ...detectHebrewGrammarErrors(trimmedUser),
      ...detectHebrewWordOrderErrors(trimmedUser),
    ];
    const grammarWarningText = detectedGrammarErrors.length > 0
      ? `\n\nВНИМАНИЕ! В ответе ученика обнаружена ошибка (согласование рода/числа или порядок слов):\n${detectedGrammarErrors.map((e) => `- ${e.explanationRu}`).join('\n')}\nТЫ ОБЯЗАН: снизить оценку (score НЕ ВЫШЕ 70, assessment = "good", НИ В КОЕМ СЛУЧАЕ НЕ "perfect") и обязательно подробно объяснить ученику это правило в feedbackRu!`
      : '';

    // 4. Быстрая проверка: если совпадение очевидное и нет грамматических ошибок, не тратим квоту LLM
    const quickHeuristic = evaluateHeuristic(trimmedUser, referenceHebrew, acceptableKeywords, sampleVariations);
    if (quickHeuristic.isCorrect && quickHeuristic.score >= 95 && detectedGrammarErrors.length === 0) {
      return NextResponse.json(textOnlyEvaluation(quickHeuristic));
    }

    // 5. Запрос к LLM для глубокой семантической и грамматической оценки
    const { groqKey, geminiKey } = resolveAiKeys(provider, apiKey);

    const systemPrompt = `You are an expert Hebrew ulpan teacher evaluating a student's spoken response in a roleplay dialogue.

EVALUATION CRITERIA:
1. SEMANTICS: Assess if the student conveyed the intended communicative goal, not a verbatim match. Natural variations and creative phrasing are fully accepted.
2. HEBREW GRAMMAR:
   - Word order: Adjectives must strictly follow nouns (e.g. סֵפֶר טוֹב, קָפֶה חַם).
   - Demonstratives: זֶה (masculine), זֹאת/זוֹ (feminine), אֵלֶּה (plural).
3. If intent is achieved with correct grammar: isCorrect = true, assessment = "perfect" or "good".
4. If intent failed or severe error: isCorrect = false, assessment = "incorrect" (or score <= 70, assessment = "good" if partially understood), with a clear, encouraging pedagogical explanation in Russian in feedbackRu.

CONTEXT:
- Lesson: #${lessonNumber} (Level ${level.toUpperCase()})
- Target Intent (Russian): "${targetIntentRu}"
- Reference Hebrew: "${referenceHebrew}"
- Acceptable variations: ${JSON.stringify(sampleVariations)}
- Keywords: ${JSON.stringify(acceptableKeywords)}
- Student gender: ${userGender === 'female' ? 'female (נקבה)' : 'male (זכר)'}
- Opponent gender: ${opponentGender === 'female' ? 'female (נקבה)' : 'male (זכר)'}
- WHAT STUDENT SAID: "${trimmedUser}"${grammarWarningText}

Return STRICT JSON only:
{
  "isCorrect": true,
  "score": 90,
  "assessment": "perfect",
  "feedbackRu": "Доброжелательный комментарий на русском языке с объяснением для ученика.",
  "betterAlternative": "Естественная альтернатива с огласовками (если уместно)"
}`;

    const applyGrammarSafetyEnforcement = (resData: DialogueEvaluationResult): DialogueEvaluationResult => {
      if (detectedGrammarErrors.length > 0) {
        // Принудительно ограничиваем оценку и статус при наличии грамматических ошибок или нарушений порядка слов
        if (resData.score > 70) {
          resData.score = 70;
        }
        if (resData.assessment === 'perfect') {
          resData.assessment = 'good';
        }
        const errorSummary = detectedGrammarErrors.map((e) => e.explanationRu).join(' ');
        const feedbackLower = resData.feedbackRu.toLowerCase();
        const hasRuleMention =
          feedbackLower.includes('порядок') ||
          feedbackLower.includes('после') ||
          feedbackLower.includes('прилагательн') ||
          feedbackLower.includes('отрицани') ||
          feedbackLower.includes('род') ||
          feedbackLower.includes('זֶה') ||
          feedbackLower.includes('זֹאת') ||
          feedbackLower.includes('זה') ||
          feedbackLower.includes('זאת') ||
          feedbackLower.includes('אלה') ||
          feedbackLower.includes('местоимен');

        if (!hasRuleMention) {
          resData.feedbackRu = `Смысл понятен, но обратите внимание на ошибки в речи: ${errorSummary} ${resData.feedbackRu}`.trim();
        }
      }
      return resData;
    };

    if (groqKey) {
      const groqModels = configuredGroqModels('dialogue');

      for (const groqModel of groqModels) {
        try {
          const res = await fetchAi('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Оцени ответ ученика на иврите. Верни результат строго в формате JSON.' },
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content?.trim();
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              if (typeof parsed.isCorrect !== 'boolean' || !Number.isFinite(parsed.score) || typeof parsed.feedbackRu !== 'string') throw new Error('Invalid evaluation');
              const evalResult: DialogueEvaluationResult = {
                isCorrect: Boolean(parsed.isCorrect),
                score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : (parsed.isCorrect ? 90 : 40),
                assessment: (['perfect', 'good', 'incorrect'].includes(parsed.assessment) ? parsed.assessment : (parsed.isCorrect ? 'good' : 'incorrect')) as any,
                feedbackRu: sanitizeRussianTranslation(parsed.feedbackRu || (parsed.isCorrect ? 'Отлично! Вас поняли.' : 'Попробуйте повторить фразу.')),
                betterAlternative: parsed.betterAlternative ? String(parsed.betterAlternative).trim() : referenceHebrew,
                userSpokenHebrew: trimmedUser,
              };

              return NextResponse.json(textOnlyEvaluation(applyGrammarSafetyEnforcement(evalResult)));
            }
          }
        } catch {}
      }
    }

    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel('dialogue')}:generateContent?key=${geminiKey}`;
        const res = await fetchAi(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingBudget: 512,
              },
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (typeof parsed.isCorrect !== 'boolean' || !Number.isFinite(parsed.score) || typeof parsed.feedbackRu !== 'string') throw new Error('Invalid evaluation');
            const evalResult: DialogueEvaluationResult = {
              isCorrect: Boolean(parsed.isCorrect),
              score: typeof parsed.score === 'number' ? parsed.score : (parsed.isCorrect ? 90 : 40),
              assessment: parsed.assessment || (parsed.isCorrect ? 'good' : 'incorrect'),
              feedbackRu: sanitizeRussianTranslation(parsed.feedbackRu || 'Хороший ответ!'),
              betterAlternative: parsed.betterAlternative || referenceHebrew,
              userSpokenHebrew: trimmedUser,
            };

            return NextResponse.json(textOnlyEvaluation(applyGrammarSafetyEnforcement(evalResult)));
          }
        }
      } catch {}
    }

    // An unavailable provider cannot award a grade.
    return aiErrorResponse(new Error('Evaluation unavailable'));
  } catch (error: any) { return aiErrorResponse(error); }
}
