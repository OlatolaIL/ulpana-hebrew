/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');
const { JSDOM } = require('jsdom');

const { BESPOKE_ESSAY_PROMPTS, getLessonEssayPrompt } = require('../src/data/essayTopics.ts');
const { getLessonById } = require('../src/data/lessonsData.ts');
const { createSessionToken } = require('../src/lib/auth.ts');
const { LessonEssay } = require('../src/components/LessonEssay/LessonEssay.tsx');

test('BESPOKE_ESSAY_PROMPTS preserves lessons 1 and 2 intact', () => {
  const prompt1 = BESPOKE_ESSAY_PROMPTS[1];
  assert.ok(prompt1, 'Lesson 1 bespoke prompt must exist');
  assert.equal(prompt1.topicRu, 'Знакомство и первые приветствия');
  assert.equal(prompt1.minWords, 8);
  assert.ok(prompt1.sampleEssay.hebrew.includes('דָּנִיאֵל'));

  const prompt2 = BESPOKE_ESSAY_PROMPTS[2];
  assert.ok(prompt2, 'Lesson 2 bespoke prompt must exist');
  assert.equal(prompt2.topicRu, 'Мой заказ в кафе');
  assert.equal(prompt2.minWords, 10);
  assert.ok(prompt2.sampleEssay.hebrew.includes('בְּבֵית קָפֶה'));
});

test('getLessonEssayPrompt maintains fallbacks for lessons beyond bespoke 1-5', () => {
  assert.equal(BESPOKE_ESSAY_PROMPTS[6], undefined, 'Lesson 6 should not have a bespoke prompt');
  const prompt6 = getLessonEssayPrompt(6);
  assert.ok(prompt6, 'Lesson 6 must generate a fallback prompt');
  assert.ok(prompt6.topicRu.startsWith('Рассказ по теме:'));
  assert.ok(prompt6.suggestedWords.length > 0);

  const prompt10 = getLessonEssayPrompt(10);
  assert.equal(prompt10.minWords, 10);
});

function setupDom() {
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
  const savedHTMLTextArea = global.HTMLTextAreaElement;
  const savedActEnv = global.IS_REACT_ACT_ENVIRONMENT;
  const savedAddEvent = global.addEventListener;
  const savedRemoveEvent = global.removeEventListener;
  const savedRaf = global.requestAnimationFrame;
  const savedCaf = global.cancelAnimationFrame;

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.addEventListener = dom.window.addEventListener.bind(dom.window);
  global.removeEventListener = dom.window.removeEventListener.bind(dom.window);

  dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  dom.window.cancelAnimationFrame = (id) => clearTimeout(id);
  global.requestAnimationFrame = dom.window.requestAnimationFrame;
  global.cancelAnimationFrame = dom.window.cancelAnimationFrame;

  dom.window.Element.prototype.scrollIntoView = () => {};
  dom.window.scrollTo = () => {};
  dom.window.Element.prototype.attachEvent = () => {};
  dom.window.Element.prototype.detachEvent = () => {};

  const container = dom.window.document.getElementById('root');
  const root = createRoot(container);

  const cleanup = async () => {
    await act(async () => {
      root.unmount();
    });
    global.window = savedWindow;
    global.document = savedDocument;
    global.navigator = savedNavigator;
    global.HTMLElement = savedHTMLElement;
    global.Element = savedElement;
    global.Node = savedNode;
    global.HTMLTextAreaElement = savedHTMLTextArea;
    global.IS_REACT_ACT_ENVIRONMENT = savedActEnv;
    global.addEventListener = savedAddEvent;
    global.removeEventListener = savedRemoveEvent;
    global.requestAnimationFrame = savedRaf;
    global.cancelAnimationFrame = savedCaf;
  };

  return { dom, container, root, cleanup };
}

test('interactive LessonEssay component in jsdom: opening cheat sheet and selecting female or male verb and noun forms (Lessons 3 and 4)', async () => {
  const femaleProfile = {
    gender: 'female',
    lessonProgress: {},
    aiProvider: 'groq',
  };

  // --- 1. LESSON 3: Female and male living and speaking verbs ---
  {
    const { container, root, cleanup } = setupDom();
    try {
      const lesson3 = getLessonById(3);
      await act(async () => {
        root.render(
          React.createElement(LessonEssay, {
            lesson: lesson3,
            userProfile: femaleProfile,
            onCompleted: () => {},
            onUpdateProfile: () => {},
          })
        );
      });

      const getButtons = () => Array.from(container.querySelectorAll('button'));
      const cheatSheetBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('шпаргалк') || (b.textContent && b.textContent.includes('Шпаргалк'))
      );
      assert.ok(cheatSheetBtn, 'Cheat sheet toggle button must be rendered');

      await act(async () => {
        cheatSheetBtn.click();
      });

      const textarea = container.querySelector('textarea');
      assert.ok(textarea, 'Textarea must be rendered');
      assert.equal(textarea.value, '', 'Textarea starts empty');

      // Female student clicks female verb gara
      const femaleGaraBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('גָּרָה')
      );
      assert.ok(femaleGaraBtn, 'Female gara button must be present in cheat sheet');

      await act(async () => {
        femaleGaraBtn.click();
      });
      assert.equal(textarea.value, 'גרה ', 'Clicking female gara must insert unpointed feminine form "גרה "');

      // Female student clicks female verb medaberet
      const femaleMedaberetBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('מְדַבֶּרֶת')
      );
      assert.ok(femaleMedaberetBtn, 'Female medaberet button must be present');

      await act(async () => {
        femaleMedaberetBtn.click();
      });
      assert.equal(
        textarea.value,
        'גרה מדברת ',
        'Clicking female medaberet must insert unpointed feminine form "מדברת "'
      );

      // Male options remain available and functional
      const maleGarBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('גָּר') && !b.textContent.includes('גָּרָה')
      );
      assert.ok(maleGarBtn, 'Male gar button must remain available');

      await act(async () => {
        maleGarBtn.click();
      });
      assert.equal(
        textarea.value,
        'גרה מדברת גר ',
        'Clicking male gar must insert unpointed masculine form "גר "'
      );
    } finally {
      await cleanup();
    }
  }

  // --- 2. LESSON 4: Female and male student nouns ---
  {
    const { container, root, cleanup } = setupDom();
    try {
      const lesson4 = getLessonById(4);
      await act(async () => {
        root.render(
          React.createElement(LessonEssay, {
            lesson: lesson4,
            userProfile: femaleProfile,
            onCompleted: () => {},
            onUpdateProfile: () => {},
          })
        );
      });

      const getButtons = () => Array.from(container.querySelectorAll('button'));
      const cheatSheetBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('шпаргалк') || (b.textContent && b.textContent.includes('Шпаргалк'))
      );
      assert.ok(cheatSheetBtn, 'Cheat sheet toggle button must be rendered for Lesson 4');

      await act(async () => {
        cheatSheetBtn.click();
      });

      const textarea = container.querySelector('textarea');
      assert.ok(textarea, 'Textarea must be rendered for Lesson 4');

      // Female student clicks talmida
      const femaleTalmidaBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('תַּלְמִידָה')
      );
      assert.ok(femaleTalmidaBtn, 'Female talmida button must be present in Lesson 4');

      await act(async () => {
        femaleTalmidaBtn.click();
      });
      assert.equal(
        textarea.value,
        'תלמידה ',
        'Clicking female talmida must insert unpointed feminine form "תלמידה "'
      );

      // Male student clicks talmid
      const maleTalmidBtn = getButtons().find(
        (b) => b.textContent && b.textContent.includes('תַּלְמִיד') && !b.textContent.includes('תַּלְמִידָה')
      );
      assert.ok(maleTalmidBtn, 'Male talmid button must remain available');

      await act(async () => {
        maleTalmidBtn.click();
      });
      assert.equal(
        textarea.value,
        'תלמידה תלמיד ',
        'Clicking male talmid must insert unpointed masculine form "תלמיד "'
      );
    } finally {
      await cleanup();
    }
  }
});

test('essay evaluation route uses aligned prompts 3-5 in outbound LLM requests', async () => {
  const { POST } = require('../src/app/api/ai/essay/evaluate/route.ts');
  const interceptedRequests = [];
  const savedFetch = global.fetch;
  const savedGroq = process.env.GROQ_API_KEY;
  const savedSecret = process.env.JWT_SECRET;
  const savedModel = process.env.GROQ_MODEL;
  const savedFallback = process.env.GROQ_FALLBACK_MODEL;

  process.env.GROQ_API_KEY = 'synthetic-key';
  process.env.GROQ_MODEL = 'synthetic-model';
  process.env.GROQ_FALLBACK_MODEL = 'synthetic-model';
  process.env.JWT_SECRET = 'test-only-session-secret-not-for-deployment-123456';

  try {
    const token = await createSessionToken({ id: 'student-test', name: 'student', subscriptionTier: 'free' });
    const authHeaders = {
      'content-type': 'application/json',
      cookie: 'ulpana_session=' + token,
    };

    global.fetch = async (url, options) => {
      interceptedRequests.push({
        url: String(url),
        body: JSON.parse(options.body),
      });
      return new Response(JSON.stringify({ error: 'outage' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    };

    // Test lesson 3
    const req3 = new NextRequest('http://localhost/api/ai/essay/evaluate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        lessonId: 3,
        userEssay: 'אני גר בישראל ואני מדבר עברית ורוסית.',
        userGender: 'male',
      }),
    });
    await POST(req3);

    assert.equal(interceptedRequests.length, 1);
    const call3 = interceptedRequests[0];
    const userPrompt3 = call3.body.messages.find((m) => m.role === 'user')?.content || '';
    assert.ok(userPrompt3.includes('Откуда я, где живу и на каких языках говорю'));
    assert.ok(userPrompt3.includes('Представьтесь новому знакомому'));
    assert.ok(!userPrompt3.includes('Моя семья и фотографии'), 'Old family prompt must not leak');

    // Test lesson 4
    const req4 = new NextRequest('http://localhost/api/ai/essay/evaluate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        lessonId: 4,
        userEssay: 'זה מורה וזאת תלמידה בכיתה.',
        userGender: 'male',
      }),
    });
    await POST(req4);

    assert.equal(interceptedRequests.length, 2);
    const call4 = interceptedRequests[1];
    const userPrompt4 = call4.body.messages.find((m) => m.role === 'user')?.content || '';
    assert.ok(userPrompt4.includes('В классе ульпана: кто это и что это'));
    assert.ok(!userPrompt4.includes('Мой город и моя квартира'), 'Old apartment prompt must not leak');

    // Test lesson 5
    const req5 = new NextRequest('http://localhost/api/ai/essay/evaluate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        lessonId: 5,
        userEssay: 'אני בשוק ורוצה לקנות עגבניות.',
        userGender: 'female',
      }),
    });
    await POST(req5);

    assert.equal(interceptedRequests.length, 3);
    const call5 = interceptedRequests[2];
    const userPrompt5 = call5.body.messages.find((m) => m.role === 'user')?.content || '';
    assert.ok(userPrompt5.includes('Покупки на рынке и в магазине'));
    assert.ok(!userPrompt5.includes('Учёба в ульпане и языки'), 'Old study prompt must not leak');
  } finally {
    global.fetch = savedFetch;
    if (savedGroq !== undefined) {
      process.env.GROQ_API_KEY = savedGroq;
    } else {
      delete process.env.GROQ_API_KEY;
    }
    if (savedSecret !== undefined) {
      process.env.JWT_SECRET = savedSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
    if (savedModel !== undefined) {
      process.env.GROQ_MODEL = savedModel;
    } else {
      delete process.env.GROQ_MODEL;
    }
    if (savedFallback !== undefined) {
      process.env.GROQ_FALLBACK_MODEL = savedFallback;
    } else {
      delete process.env.GROQ_FALLBACK_MODEL;
    }
  }
});
