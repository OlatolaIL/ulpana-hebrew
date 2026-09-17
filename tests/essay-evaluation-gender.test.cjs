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
  const savedModel = process.env.GROQ_MODEL;
  const savedFallback = process.env.GROQ_FALLBACK_MODEL;

  process.env.GROQ_API_KEY = 'synthetic-groq-key';
  process.env.GROQ_MODEL = 'synthetic-model';
  process.env.GROQ_FALLBACK_MODEL = 'synthetic-model';
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
      femaleSystemPrompt.includes('Настоящее время:') &&
      femaleSystemPrompt.includes('רוֹצָה') &&
      femaleSystemPrompt.includes('גָּרָה'),
      'System prompt must require female agreement for first-person present tense verbs'
    );

    // CRITICAL: Ensure past tense 1st person is documented as common to both genders and NOT an error for female author
    assert.ok(
      femaleSystemPrompt.includes('Прошедшее время:') &&
      femaleSystemPrompt.includes('גרתי') &&
      (femaleSystemPrompt.includes('одинаково') || femaleSystemPrompt.includes('едина') || femaleSystemPrompt.includes('НЕ различается')),
      'System prompt must explicitly state that first-person past tense (גרתי) has no gender distinction and is not an error'
    );

    // CRITICAL: Verify precise past tense distinctions (3rd sing vs 3rd plur, 1st plur)
    assert.ok(
      femaleSystemPrompt.includes('3-м лице единственного числа (גר / גרה)'),
      'System prompt must specify that gender distinction in past tense applies to 3rd person singular'
    );
    assert.ok(
      femaleSystemPrompt.includes('3-м лице множественного числа форма общая (גרו для обоих родов)'),
      'System prompt must specify that 3rd person plural past form (גרו) is common for both genders'
    );
    assert.ok(
      femaleSystemPrompt.includes('1-го лица множественного числа «גרנו»'),
      'System prompt must specify that 1st person plural past form (גרנו) is common for both genders'
    );

    // CRITICAL: Verify adjective agreement is separate from verb tense
    assert.ok(
      femaleSystemPrompt.includes('Согласование прилагательных: прилагательное всегда согласуется с существительным в роде и числе'),
      'System prompt must state adjective agreement separately without binding to verb tense'
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
      maleSystemPrompt.includes('Настоящее время:') &&
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
    if (savedModel === undefined) delete process.env.GROQ_MODEL;
    else process.env.GROQ_MODEL = savedModel;
    if (savedFallback === undefined) delete process.env.GROQ_FALLBACK_MODEL;
    else process.env.GROQ_FALLBACK_MODEL = savedFallback;
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

test('generateHebrewTranscription and ensureCyrillicHebrewTranscription never output consonant soup on unvocalized text', () => {
  const { generateHebrewTranscription, ensureCyrillicHebrewTranscription } = require('../src/lib/transcription.ts');
  const unvocalizedText = 'בוקר תוב! קאורים לי סרגיי! נעים מאוד. להיתגאת.';

  // 1. generateHebrewTranscription must return empty string for unpointed text
  const result = generateHebrewTranscription(unvocalizedText);
  assert.equal(result, '', 'generateHebrewTranscription must return empty string when there is no nikkud');
  assert.ok(!result.includes('ввкр'), 'Must never emit "ввкр"');
  assert.ok(!result.includes('твв'), 'Must never emit "твв"');

  // 2. ensureCyrillicHebrewTranscription with empty transcription and unpointed text
  const ensured = ensureCyrillicHebrewTranscription('', unvocalizedText);
  assert.equal(ensured, '', 'ensureCyrillicHebrewTranscription must return empty string when text has no nikkud');

  // 3. Pointed text works properly and produces real vowels
  const pointed = 'בֹּקֶר טוֹב';
  const pointedTrans = generateHebrewTranscription(pointed);
  assert.ok(pointedTrans.includes('о'), `Pointed text must have vowels: ${pointedTrans}`);
});

test('essay evaluation route eliminates typos from correctedVersion and enriches with nikkud', async () => {
  const { POST } = require('../src/app/api/ai/essay/evaluate/route.ts');
  const savedFetch = global.fetch;
  const savedGroq = process.env.GROQ_API_KEY;

  process.env.GROQ_API_KEY = 'test-key';

  try {
    const modelOutputWithEchoedTypos = {
      score: 75,
      rating: 'good',
      summaryRu: 'Хорошее сочинение, но есть орфографические ошибки.',
      taskCompliance: { isRelevant: true, score: 80, topicCommentRu: 'Тема раскрыта.', levelCommentRu: 'Нормально.' },
      spellingFeedback: {
        hasErrors: true,
        items: [
          { wrongWord: 'תוב', correctWord: 'טוֹב', explanationRu: 'Пишется ט' },
          { wrongWord: 'קאורים', correctWord: 'קוֹרְאִים', explanationRu: 'Пишется קוראים' },
        ],
        generalAdviceRu: 'Проверяйте созвучные буквы.',
      },
      wordOrderFeedback: { hasErrors: false, items: [], generalAdviceRu: '' },
      grammarFeedback: { items: [], genderAgreementRu: '' },
      vocabularyAnalysis: { usedLessonWords: [], count: 0, commentRu: '' },
      correctedVersion: {
        hebrew: 'בוקר תוב! קאורים לי סרגיי!',
        transcription: '',
        translation: 'Доброе утро! Меня зовут Сергей!',
      },
    };

    global.fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(modelOutputWithEchoedTypos) } }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    const req = new NextRequest('http://localhost/api/ai/essay/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        lessonId: 1,
        userEssay: 'בוקר תוב! קאורים לי סרגיי!',
        userGender: 'male',
      }),
    });

    const res = await POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.ok(!data.correctedVersion.hebrew.includes('תוב'), 'correctedVersion must not contain typo תוב');
    assert.ok(!data.correctedVersion.hebrew.includes('קאורים'), 'correctedVersion must not contain typo קאורים');
    assert.ok(data.correctedVersion.hebrew.includes('טוֹב') || data.correctedVersion.hebrew.includes('טוב'), 'Must contain corrected word טוב');
    assert.ok(!data.correctedVersion.transcription.includes('ввкр'), 'Transcription must not be consonant soup');
    assert.ok(!data.correctedVersion.transcription.includes('твв'), 'Transcription must not be consonant soup');
  } finally {
    global.fetch = savedFetch;
    if (savedGroq !== undefined) process.env.GROQ_API_KEY = savedGroq;
    else delete process.env.GROQ_API_KEY;
  }
});

test('EssayEvaluationView respects showNikkud for display while preserving pointed Hebrew for speech', async () => {
  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const { act } = require('react');
  const { JSDOM } = require('jsdom');
  const { stripNikkud } = require('../src/lib/transcription.ts');
  const { EssayEvaluationView } = require('../src/components/LessonEssay/EssayEvaluationView.tsx');

  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });

  const savedWindow = global.window;
  const savedDocument = global.document;
  const savedNavigator = global.navigator;
  const savedHTMLElement = global.HTMLElement;
  const savedElement = global.Element;
  const savedNode = global.Node;
  const savedActEnv = global.IS_REACT_ACT_ENVIRONMENT;

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  const mockEvaluation = {
    score: 90,
    rating: 'excellent',
    summaryRu: 'Отлично!',
    taskCompliance: { isRelevant: true, score: 90, topicCommentRu: 'Тема раскрыта.', levelCommentRu: '' },
    spellingFeedback: { hasErrors: false, items: [], generalAdviceRu: '' },
    wordOrderFeedback: { hasErrors: false, items: [], generalAdviceRu: '' },
    grammarFeedback: { items: [], genderAgreementRu: '' },
    vocabularyAnalysis: { usedLessonWords: [], count: 0, commentRu: '' },
    correctedVersion: {
      hebrew: 'בֹּקֶר טוֹב! קוֹרְאִים לִי דָּנִיאֵל.',
      transcription: 'бóкер тов! коръӣм ли Даниэ́ль.',
      translation: 'Доброе утро! Меня зовут Даниэль.',
    },
    valuableTipsRu: ['Совет 1'],
  };

  const container = dom.window.document.getElementById('root');
  const root = createRoot(container);

  try {
    const profileNoNikkud = {
      showNikkud: false,
      showTranscription: true,
      speechRate: 0.75,
    };

    await act(async () => {
      root.render(
        React.createElement(EssayEvaluationView, {
          evaluation: mockEvaluation,
          userEssay: 'בוקר טוב',
          userProfile: profileNoNikkud,
          onTryAgain: () => {},
          onContinue: () => {},
        })
      );
    });

    const renderedHtml = container.innerHTML;
    const cleanHebrew = stripNikkud(mockEvaluation.correctedVersion.hebrew);
    assert.ok(renderedHtml.includes(cleanHebrew), `Rendered HTML must contain clean unpointed Hebrew: ${cleanHebrew}`);
    assert.ok(!renderedHtml.includes('בֹּקֶר'), 'When showNikkud=false, display must not show nikkud');

    const profileWithNikkud = {
      showNikkud: true,
      showTranscription: false,
      speechRate: 0.75,
    };

    await act(async () => {
      root.render(
        React.createElement(EssayEvaluationView, {
          evaluation: mockEvaluation,
          userEssay: 'בוקר טוב',
          userProfile: profileWithNikkud,
          onTryAgain: () => {},
          onContinue: () => {},
        })
      );
    });

    const renderedHtml2 = container.innerHTML;
    assert.ok(renderedHtml2.includes('בֹּקֶר'), 'When showNikkud=true, display must show nikkud');
    assert.ok(!renderedHtml2.includes('коръӣм'), 'When showTranscription=false, transcription must be hidden');
  } finally {
    await act(async () => {
      root.unmount();
    });
    global.window = savedWindow;
    global.document = savedDocument;
    global.navigator = savedNavigator;
    global.HTMLElement = savedHTMLElement;
    global.Element = savedElement;
    global.Node = savedNode;
    global.IS_REACT_ACT_ENVIRONMENT = savedActEnv;
  }
});
