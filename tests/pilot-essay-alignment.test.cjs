/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');

const { BESPOKE_ESSAY_PROMPTS, getLessonEssayPrompt } = require('../src/data/essayTopics.ts');
const { createSessionToken } = require('../src/lib/auth.ts');

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

test('BESPOKE_ESSAY_PROMPTS aligns Lesson 3 with origin, residence, and languages', () => {
  const prompt3 = BESPOKE_ESSAY_PROMPTS[3];
  assert.ok(prompt3, 'Lesson 3 bespoke prompt must exist');
  assert.equal(prompt3.topicRu, 'Откуда я, где живу и на каких языках говорю');
  assert.equal(prompt3.topicHe, 'מֵאַיִן אֲנִי, אֵיפֹה אֲנִי גָּר וּבְאֵילוּ שָׂפוֹת אֲנִי מְדַבֵּר');
  assert.ok(prompt3.situationRu.includes('מִ / מֵ'), 'Situation must mention preposition mi/me');
  assert.ok(prompt3.situationRu.includes('גָּר / גָּרָה'), 'Situation must support both genders');
  assert.ok(prompt3.situationRu.includes('מְדַבֵּר / מְדַבֶּרֶת'), 'Situation must mention speech verbs');
  assert.ok(prompt3.grammarFocusRu.includes('גָּר/גָּרָה'), 'Grammar focus must emphasize present tense living verb');
  assert.ok(prompt3.grammarFocusRu.includes('מְדַבֵּר/מְדַבֶּרֶת'), 'Grammar focus must emphasize speech verb');
  assert.equal(prompt3.minWords, 12);

  // Suggested words check
  const wordsHebrew = prompt3.suggestedWords.map((w) => w.hebrew);
  assert.ok(wordsHebrew.includes('מֵאַיִן / מֵאֵיפֹה'));
  assert.ok(wordsHebrew.includes('גָּר / גָּרָה'));
  assert.ok(wordsHebrew.includes('עִיר'));
  assert.ok(wordsHebrew.includes('מְדִינָה'));
  assert.ok(wordsHebrew.includes('יִשְׂרָאֵל'));
  assert.ok(wordsHebrew.includes('מְדַבֵּר / מְדַבֶּרֶת'));
  assert.ok(wordsHebrew.includes('עִבְרִית'));
  assert.ok(wordsHebrew.includes('רוּסִית'));
  assert.ok(wordsHebrew.includes('אַנְגְּלִית'));
  assert.ok(wordsHebrew.includes('קְצָת'));

  // Stress check for gará
  const garWord = prompt3.suggestedWords.find((w) => w.hebrew === 'גָּר / גָּרָה');
  assert.equal(garWord.transcription, 'гар / гарá', 'Normative stress for present gará must be on the last syllable');

  // Sample essay check
  const sample = prompt3.sampleEssay;
  assert.ok(sample, 'Sample essay must be provided');
  const sampleWords = sample.hebrew.trim().split(/\s+/).filter(Boolean);
  assert.ok(
    sampleWords.length >= prompt3.minWords,
    'Sample essay word count (' + sampleWords.length + ') must reach minWords (' + prompt3.minWords + ')'
  );
  assert.ok(
    sample.translation.includes('для женщины: גָּרָה, מְדַבֶּרֶת'),
    'Sample translation must explain perspective and female counterparts'
  );
  assert.ok(
    sample.transcription.includes('у-кцат'),
    'Normative vav shuruk before shva must be transcribed as у-кцат'
  );
});

test('BESPOKE_ESSAY_PROMPTS aligns Lesson 4 with classroom demonstratives and gender', () => {
  const prompt4 = BESPOKE_ESSAY_PROMPTS[4];
  assert.ok(prompt4, 'Lesson 4 bespoke prompt must exist');
  assert.equal(prompt4.topicRu, 'В классе ульпана: кто это и что это');
  assert.equal(prompt4.topicHe, 'בַּכִּיתָּה בָּאוּלְפָּן: מִי זֶה וּמַה זֶּה');
  assert.ok(prompt4.situationRu.includes('זֶה, זֹאת/זוֹ, אֵלֶּה'));
  assert.ok(prompt4.grammarFocusRu.includes('זֶה'));
  assert.ok(prompt4.grammarFocusRu.includes('זֹאת'));
  assert.ok(prompt4.grammarFocusRu.includes('אֵלֶּה'));
  assert.equal(prompt4.minWords, 12);

  // Suggested words check
  const wordsHebrew = prompt4.suggestedWords.map((w) => w.hebrew);
  assert.ok(wordsHebrew.includes('זֶה'));
  assert.ok(wordsHebrew.includes('זֹאת / זוֹ'));
  assert.ok(wordsHebrew.includes('אֵלֶּה'));
  assert.ok(wordsHebrew.includes('מוֹרֶה / מוֹרָה'));
  assert.ok(wordsHebrew.includes('תַּלְמִיד / תַּלְמִידָה'));
  assert.ok(wordsHebrew.includes('סֵפֶר'));
  assert.ok(wordsHebrew.includes('מַחְבֶּרֶת'));
  assert.ok(wordsHebrew.includes('עֵט'));
  assert.ok(wordsHebrew.includes('שׁוּלְחָן'));
  assert.ok(wordsHebrew.includes('כִּיסֵּא'));

  // Sample essay check
  const sample = prompt4.sampleEssay;
  assert.ok(sample, 'Sample essay must be provided');
  const sampleWords = sample.hebrew.trim().split(/\s+/).filter(Boolean);
  assert.ok(
    sampleWords.length >= prompt4.minWords,
    'Sample essay word count (' + sampleWords.length + ') must reach minWords (' + prompt4.minWords + ')'
  );
  assert.ok(
    sample.translation.includes('תַּלְמִיד') && sample.translation.includes('תַּלְמִידָה'),
    'Sample translation must guide student on gender usage for self-identification'
  );
});

test('BESPOKE_ESSAY_PROMPTS aligns Lesson 5 with market shopping, article, and numerals', () => {
  const prompt5 = BESPOKE_ESSAY_PROMPTS[5];
  assert.ok(prompt5, 'Lesson 5 bespoke prompt must exist');
  assert.equal(prompt5.topicRu, 'Покупки на рынке и в магазине');
  assert.equal(prompt5.topicHe, 'קְנִיּוֹת בַּשּׁוּק וּבַסּוּפֶּרְמַרְקֶט');
  assert.ok(prompt5.situationRu.includes('בַּסּוּפֶּר, בַּשּׁוּק'));
  assert.ok(prompt5.situationRu.includes('כַּמָּה זֶה עוֹלֶה'));
  assert.ok(prompt5.grammarFocusRu.includes('הַ-'));
  assert.ok(prompt5.grammarFocusRu.includes('בַּ-'));
  assert.ok(prompt5.grammarFocusRu.includes('כַּמָּה זֶה עוֹלֶה'));
  assert.ok(prompt5.grammarFocusRu.includes('עֲשָׂרָה שְׁקָלִים'));
  assert.equal(prompt5.minWords, 12);

  // Suggested words check
  const wordsHebrew = prompt5.suggestedWords.map((w) => w.hebrew);
  assert.ok(wordsHebrew.includes('בַּסּוּפֶּר / בַּשּׁוּק'));
  assert.ok(wordsHebrew.includes('רוֹצֶה / רוֹצָה'));
  assert.ok(wordsHebrew.includes('לֶחֶם'));
  assert.ok(wordsHebrew.includes('גְּבִינָה'));
  assert.ok(wordsHebrew.includes('עַגְבָנִיָּה'));
  assert.ok(wordsHebrew.includes('מְלָפְפוֹן'));
  assert.ok(wordsHebrew.includes('כַּמָּה זֶה עוֹלֶה'));
  assert.ok(wordsHebrew.includes('שֶׁקֶל / שְׁקָלִים'));
  assert.ok(wordsHebrew.includes('עֲשָׂרָה שְׁקָלִים'));
  assert.ok(wordsHebrew.includes('שַׂקִּית'));

  // Sample essay check
  const sample = prompt5.sampleEssay;
  assert.ok(sample, 'Sample essay must be provided');
  const sampleWords = sample.hebrew.trim().split(/\s+/).filter(Boolean);
  assert.ok(
    sampleWords.length >= prompt5.minWords,
    'Sample essay word count (' + sampleWords.length + ') must reach minWords (' + prompt5.minWords + ')'
  );
  assert.ok(
    sample.translation.includes('для женщины: רוֹצָה'),
    'Sample translation must explicitly indicate female variant'
  );
});

test('getLessonEssayPrompt maintains fallbacks for lessons beyond bespoke 1-5', () => {
  assert.equal(BESPOKE_ESSAY_PROMPTS[6], undefined, 'Lesson 6 should not have a bespoke prompt');
  const prompt6 = getLessonEssayPrompt(6);
  assert.ok(prompt6, 'Lesson 6 must generate a fallback prompt');
  assert.ok(prompt6.topicRu.startsWith('Рассказ по теме:'));
  assert.ok(prompt6.suggestedWords.length > 0);

  const prompt10 = getLessonEssayPrompt(10);
  assert.equal(prompt10.minWords, 10);

  const prompt20 = getLessonEssayPrompt(20);
  assert.equal(prompt20.minWords, 15);
});

test('essay evaluation route uses aligned prompts 3-5 in outbound LLM requests', async () => {
  const { POST } = require('../src/app/api/ai/essay/evaluate/route.ts');
  const interceptedRequests = [];
  const savedFetch = global.fetch;
  const savedGroq = process.env.GROQ_API_KEY;
  const savedSecret = process.env.JWT_SECRET;

  process.env.GROQ_API_KEY = 'synthetic-key';
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
  }
});
