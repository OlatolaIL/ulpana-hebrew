/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');

const makeEssayRequest = (body) =>
  new NextRequest('http://localhost/api/ai/essay/evaluate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': 'test-essay-gender',
    },
    body: JSON.stringify(body),
  });

test('essay evaluation outbound request separates present tense gender agreement from first-person past tense and rejects the flawed past-tense gender generalization', async () => {
  const { POST } = require('../src/app/api/ai/essay/evaluate/route.ts');
  const savedFetch = global.fetch;
  const savedGroq = process.env.GROQ_API_KEY;
  const savedGemini = process.env.GEMINI_API_KEY;

  process.env.GROQ_API_KEY = 'synthetic-groq-key';
  delete process.env.GEMINI_API_KEY;

  try {
    const interceptedRequests = [];
    global.fetch = async (url, options) => {
      const parsedBody = JSON.parse(options.body);
      interceptedRequests.push({
        url: String(url),
        body: parsedBody,
      });
      // Simulate external provider failure (503)
      return new Response(JSON.stringify({ error: 'synthetic service unavailable' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    };

    // 1. Female author request
    const femalePayload = {
      lessonId: 1,
      userEssay: 'שלום, אני גרה בתל אביב. אתמול אני גרתי בירושלים.',
      userGender: 'female',
    };

    const femaleRes = await POST(makeEssayRequest(femalePayload));
    assert.equal(femaleRes.status, 503, 'Route must fail with 503 when provider is unavailable');
    const femaleJson = await femaleRes.json();
    assert.ok(femaleJson.error, 'Provider outage response must contain error');
    assert.equal(femaleJson.score, undefined, 'Must not invent score on outage');

    assert.equal(interceptedRequests.length, 1, 'Exactly one provider call should be initiated for female author');
    const femaleCall = interceptedRequests[0];
    const femaleMessages = femaleCall.body.messages;
    assert.ok(Array.isArray(femaleMessages), 'Outbound payload must contain messages array');

    const femaleSystemPrompt = femaleMessages.find((m) => m.role === 'system')?.content || '';
    const femaleUserPrompt = femaleMessages.find((m) => m.role === 'user')?.content || '';

    // CRITICAL: Ensure the former flawed generalization is absent
    assert.equal(
      femaleSystemPrompt.includes('Глаголы настоящего и прошедшего времени от первого лица'),
      false,
      'System prompt must NOT contain the flawed generalization that first-person past tense verbs vary by author gender'
    );

    // CRITICAL: Ensure author gender context is preserved
    assert.ok(
      femaleSystemPrompt.includes('Пол автора текста: ЖЕНСКИЙ (נקבה)'),
      'System prompt must preserve female author context'
    );
    assert.ok(
      femaleUserPrompt.includes('Пол ученика: Женский (נקבה)'),
      'User prompt must preserve female student context'
    );

    // CRITICAL: Ensure present tense requires female gender agreement and flags male present verbs as error
    assert.ok(
      femaleSystemPrompt.includes('НАСТОЯЩЕЕ ВРЕМЯ') &&
      femaleSystemPrompt.includes('רוֹצָה') &&
      femaleSystemPrompt.includes('גָּרָה'),
      'System prompt must require female agreement for first-person present tense verbs'
    );

    // CRITICAL: Ensure past tense 1st person is documented as common to both genders and NOT an error for female author
    assert.ok(
      femaleSystemPrompt.includes('ПРОШЕДШЕЕ ВРЕМЯ') &&
      femaleSystemPrompt.includes('גַּרְתִּי') &&
      (femaleSystemPrompt.includes('одинаково') || femaleSystemPrompt.includes('едина') || femaleSystemPrompt.includes('НЕ различается')),
      'System prompt must explicitly state that first-person past tense (גרתי) has no gender distinction and is not an error'
    );

    // 2. Male author request
    const malePayload = {
      lessonId: 1,
      userEssay: 'שלום, אני גר בתל אביב. אתמול אני גרתי בירושלים.',
      userGender: 'male',
    };

    const maleRes = await POST(makeEssayRequest(malePayload));
    assert.equal(maleRes.status, 503, 'Route must fail with 503 when provider is unavailable');

    assert.equal(interceptedRequests.length, 2, 'Exactly two provider calls in total');
    const maleCall = interceptedRequests[1];
    const maleMessages = maleCall.body.messages;

    const maleSystemPrompt = maleMessages.find((m) => m.role === 'system')?.content || '';
    const maleUserPrompt = maleMessages.find((m) => m.role === 'user')?.content || '';

    // CRITICAL: Ensure flawed generalization is absent for male as well
    assert.equal(
      maleSystemPrompt.includes('Глаголы настоящего и прошедшего времени от первого лица'),
      false,
      'System prompt for male must NOT contain the flawed generalization'
    );

    // CRITICAL: Ensure male author context is preserved
    assert.ok(
      maleSystemPrompt.includes('Пол автора текста: МУЖСКОЙ (זכר)'),
      'System prompt must preserve male author context'
    );
    assert.ok(
      maleUserPrompt.includes('Пол ученика: Мужской (זכר)'),
      'User prompt must preserve male student context'
    );

    // CRITICAL: Ensure present tense requires male gender agreement
    assert.ok(
      maleSystemPrompt.includes('НАСТОЯЩЕЕ ВРЕМЯ') &&
      maleSystemPrompt.includes('רוֹצֶה') &&
      maleSystemPrompt.includes('גָּר'),
      'System prompt must require male agreement for first-person present tense verbs'
    );

    // 3. Lesson topic and situation preserved
    assert.ok(femaleUserPrompt.includes('Тема сочинения:'), 'User prompt must include essay topic');
    assert.ok(femaleUserPrompt.includes('Коммуникативная ситуация:'), 'User prompt must include situation');
  } finally {
    global.fetch = savedFetch;
    if (savedGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = savedGroq;
    if (savedGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedGemini;
  }
});

test('essay evaluation parses valid synthetic provider response and preserves author gender feedback without inventing scores', async () => {
  const { POST } = require('../src/app/api/ai/essay/evaluate/route.ts');
  const savedFetch = global.fetch;
  const savedGroq = process.env.GROQ_API_KEY;
  const savedGemini = process.env.GEMINI_API_KEY;

  process.env.GROQ_API_KEY = 'synthetic-groq-key';
  delete process.env.GEMINI_API_KEY;

  const mockModelOutput = {
    score: 92,
    rating: 'excellent',
    summaryRu: 'Отличный текст, грамматика соблюдена.',
    taskCompliance: {
      isRelevant: true,
      score: 95,
      topicCommentRu: 'Тема раскрыта полностью.',
      levelCommentRu: 'Соответствует уровню урока 1.',
    },
    spellingFeedback: {
      hasErrors: false,
      items: [],
      generalAdviceRu: 'Орфографических ошибок нет.',
    },
    wordOrderFeedback: {
      hasErrors: false,
      items: [],
      generalAdviceRu: 'Порядок слов верный.',
    },
    grammarFeedback: {
      items: [],
      genderAgreementRu: 'Род автора (женский) согласован корректно: настоящее время в женском роде, прошедшее время первого лица едино.',
    },
    vocabularyAnalysis: {
      usedLessonWords: ['שלום', 'תל אביב'],
      count: 2,
      commentRu: 'Хорошее использование лексики.',
    },
    correctedVersion: {
      hebrew: 'שָׁלוֹם, אֲנִי גָּרָה בְּתֵל אָבִיב. אֶתְמוֹל אֲנִי גַּרְתִּי בִּירוּשָׁלַיִם.',
      transcription: 'шалóм, анӣ гарá бэ-тéль авӣв. этмóль анӣ гáрти б-ирушалáим.',
      translation: 'Привет, я живу в Тель-Авиве. Вчера я жила в Иерусалиме.',
    },
    valuableTipsRu: [
      'В иврите прилагательное следует за существительным.',
      'Отрицание «לא» всегда перед глаголом.',
      'Форма первого лица прошедшего времени (גרתי) едина для мужчин и женщин.',
    ],
  };

  try {
    global.fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(mockModelOutput) } }],
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );

    const payload = {
      lessonId: 1,
      userEssay: 'שלום, אני גרה בתל אביב. אתמול אני גרתי ביроשלים.',
      userGender: 'female',
    };

    const res = await POST(makeEssayRequest(payload));
    assert.equal(res.status, 200, 'Valid model response must result in 200 OK');
    const result = await res.json();

    assert.equal(result.score, 92);
    assert.equal(result.rating, 'excellent');
    assert.equal(result.taskCompliance.isRelevant, true);
    assert.equal(result.grammarFeedback.items.length, 0);
    assert.ok(result.grammarFeedback.genderAgreementRu.includes('женский'));
    assert.equal(result.pronunciationScore, undefined, 'Essay evaluation must not invent pronunciationScore');
    assert.equal(result.pronunciationFeedbackRu, undefined, 'Essay evaluation must not invent pronunciationFeedback');
  } finally {
    global.fetch = savedFetch;
    if (savedGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = savedGroq;
    if (savedGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = savedGemini;
  }
});
