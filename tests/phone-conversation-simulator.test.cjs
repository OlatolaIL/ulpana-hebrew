/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');

const { createSessionToken } = require('../src/lib/auth.ts');
const { POST: phonePOST } = require('../src/app/api/ai/phone/route.ts');
const { getLessonPhoneScenario } = require('../src/data/phoneScenarios.ts');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { tokenizeText, ensureCyrillicHebrewTranscription, validateAndCorrectHebrewTranscription } = require('../src/lib/transcription.ts');
const { cleanHebrewForSpeech } = require('../src/lib/speech.ts');

function snapshotGlobalProperties(keys) {
  const descriptors = new Map();
  for (const key of keys) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  }
  return () => {
    for (const key of keys) {
      const desc = descriptors.get(key);
      if (desc === undefined) {
        delete globalThis[key];
      } else {
        Object.defineProperty(globalThis, key, desc);
      }
    }
  };
}

function setupTestEnv(t) {
  const restoreFetch = snapshotGlobalProperties(['fetch']);
  const envNames = [
    'NODE_ENV',
    'JWT_SECRET',
    'DATABASE_URL',
    'POSTGRES_URL',
    'GROQ_API_KEY',
    'GEMINI_API_KEY',
    'GROQ_FALLBACK_MODEL',
  ];
  const envBefore = new Map(
    envNames.map((k) => [k, { exists: Object.hasOwn(process.env, k), value: process.env[k] }])
  );

  process.env.NODE_ENV = 'test';
  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  process.env.GROQ_API_KEY = 'synthetic-phone-test-groq-key';
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_FALLBACK_MODEL;
  process.env.JWT_SECRET = 'synthetic-phone-simulator-test-secret-32-bytes!';

  const calls = [];

  const mockAiFetch = (provider, handler) => {
    global.fetch = async (url, options) => {
      const body = JSON.parse(options.body);
      calls.push({ provider, body, url: String(url) });

      let mockContent;
      if (typeof handler === 'function') {
        mockContent = handler(body);
      } else {
        mockContent = handler;
      }

      const contentStr = JSON.stringify(mockContent);
      const responsePayload =
        provider === 'groq'
          ? { choices: [{ message: { content: contentStr } }] }
          : { candidates: [{ content: { parts: [{ text: contentStr }] } }] };

      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };
  };

  const cleanup = () => {
    restoreFetch();
    for (const [key, entry] of envBefore) {
      if (!entry.exists) {
        delete process.env[key];
      } else {
        process.env[key] = entry.value;
      }
    }
  };

  if (t && typeof t.after === 'function') {
    t.after(cleanup);
  }

  return { calls, mockAiFetch, cleanup };
}

// ---------------------------------------------------------------------------
// 1. Lesson 7 bespoke scenario & prompt integrity
// ---------------------------------------------------------------------------
test('Lesson 7 bespoke scenario: Eli is landlord, student is tenant, call is outgoing', () => {
  const l7 = DETAILED_LESSONS[7];
  assert.ok(l7, 'Lesson 7 must exist in DETAILED_LESSONS');
  assert.equal(l7.dialogue.callType, 'outgoing', 'Lesson 7 dialogue callType must be outgoing');
  assert.equal(l7.dialogue.aiRole, 'Арендодатель Эли');
  assert.equal(l7.dialogue.userRole, 'Арендатор');

  const maleScenario = getLessonPhoneScenario(l7, 'male');
  assert.equal(maleScenario.callType, 'outgoing');
  assert.equal(maleScenario.callerRole, 'Арендодатель (сдаёт квартиры в центре)');
  assert.ok(maleScenario.initialGreeting.hebrew.includes('מְחַפֵּשׂ'), 'Male greeting must use מְחַפֵּשׂ');
  assert.ok(maleScenario.systemPromptAddition.includes('АРЕНДОДАТЕЛЬ ЭЛИ'));
  assert.ok(maleScenario.systemPromptAddition.includes('רֶגַע, אֲנִי בַּעַל הַדִּירָה, אֲנִי מַשְׂכִּיר'));

  // Useful words should include שׁוּלְחָן and מְקָרֵר
  const usefulHebrew = maleScenario.usefulWords.map((w) => w.hebrew);
  assert.ok(usefulHebrew.includes('שׁוּלְחָן'), 'Lesson 7 useful words must include שׁוּלְחָן');
  assert.ok(usefulHebrew.includes('מְקָרֵר'), 'Lesson 7 useful words must include מְקָרֵר');

  // Female scenario adaptation
  const femaleScenario = getLessonPhoneScenario(l7, 'female');
  assert.ok(femaleScenario.initialGreeting.hebrew.includes('מְחַפֶּשֶׂת'), 'Female greeting must use מְחַפֶּשֶׂת');
  assert.equal(femaleScenario.initialGreeting.transcription.includes('мэхапэ́сэт'), true);
});

// ---------------------------------------------------------------------------
// 2. Multi-turn dialogue simulations for Lesson 7 (Student Personas)
// ---------------------------------------------------------------------------
test('Phone simulator: Multi-turn Persona 1 (Ideal Student) maintains role and completes dialogue', async (t) => {
  const env = setupTestEnv(t);

  const token = await createSessionToken({
    id: 'test-student-ideal',
    name: 'Ideal Student',
    subscriptionTier: 'free',
  });

  env.mockAiFetch('groq', (body) => {
    const messages = body.messages || [];
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    if (lastUserMsg.includes('שְׁלוֹשָׁה חֲדָרִים')) {
      return {
        hebrew: 'מְעֻלֶּה! יֵשׁ לִי דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים בְּדִיזֶנְגּוֹף. יֵשׁ שָׁם מְקָרֵר וּמִיטָּה. אַתָּה צָרִיךְ רִיהוּט?',
        transcription: 'мэулé! йеш ли дирá шель шлошá хадарӣм бэ-Дӣзенгоф. йеш шам мэкарэ́р у-митá. атá царӣх риhӯт?',
        translation: 'Отлично! У меня есть трёхкомнатная квартира на Дизенгоф. Там есть холодильник и кровать. Вам нужна мебель?',
        isCompleted: false,
        shouldHangUp: false,
        suggestedReplies: [],
      };
    }

    if (lastUserMsg.includes('עוֹלֶה') || lastUserMsg.includes('רִיהוּט')) {
      return {
        hebrew: 'הִיא עוֹלָה 6,000 שֶׁקֶל. כָּל הָרִיהוּט שָׁם! רוֹצֶה לִרְאוֹת אֶת הַדִּירָה הַיּוֹם?',
        transcription: 'hи олá 6,000 шéкель. коль hа-риhӯт шам! роцé лиръóт эт hа-дирá hайóм?',
        translation: 'Она стоит 6,000 шекелей. Вся мебель там! Хотите посмотреть квартиру сегодня?',
        isCompleted: false,
        shouldHangUp: false,
        suggestedReplies: [],
      };
    }

    return {
      hebrew: 'יוֹפִי, נִתְרָאֶה הַיּוֹם בְּשֶׁבַע! תּוֹדָה וּלְהִתְרָאוֹת!',
      transcription: 'йóфи, нитраé hайóм бэ-шéва! тодá у-лэhитраóт!',
      translation: 'Отлично, увидимся сегодня в семь! Спасибо и до свидания!',
      isCompleted: true,
      shouldHangUp: true,
      suggestedReplies: [],
    };
  });

  const lesson = DETAILED_LESSONS[7];
  const scenario = getLessonPhoneScenario(lesson, 'male');

  const turn1Req = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 7,
      level: 'alef',
      userGender: 'male',
      provider: 'groq',
      messages: [
        { role: 'assistant', content: scenario.initialGreeting.hebrew },
        { role: 'user', content: 'שָׁלוֹם אֵלִי, אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים בַּמֶּרְכָּז.' },
      ],
      callType: 'outgoing',
    }),
  });

  const res1 = await phonePOST(turn1Req);
  assert.equal(res1.status, 200);
  const json1 = await res1.json();
  assert.equal(json1.isCompleted, false);
  assert.equal(json1.shouldHangUp, false);
  assert.ok(json1.hebrew.includes('שְׁלוֹשָׁה חֲדָרִים') || json1.hebrew.includes('דִיזֶנְגּוֹף'));

  const outgoingPrompt = env.calls[0].body.messages[0].content;
  assert.ok(outgoingPrompt.includes('АРЕНДОДАТЕЛЬ ЭЛИ'));
  assert.ok(outgoingPrompt.includes('Ученик (Арендатор) сам звонит тебе'));
  assert.ok(outgoingPrompt.includes('НИКОГДА НЕ ПОВТОРЯЙ ФРАЗЫ ОТ ПЕРВОГО ЛИЦА'));

  const turn2Req = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 7,
      level: 'alef',
      userGender: 'male',
      provider: 'groq',
      messages: [
        { role: 'assistant', content: scenario.initialGreeting.hebrew },
        { role: 'user', content: 'שָׁלוֹם אֵלִי, אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים בַּמֶּרְכָּז.' },
        { role: 'assistant', content: json1.hebrew },
        { role: 'user', content: 'כֵּן, כַּמָּה זֶה עוֹלֶה וְיֵשׁ שָׁם רִיהוּט?' },
      ],
      callType: 'outgoing',
    }),
  });

  const res2 = await phonePOST(turn2Req);
  assert.equal(res2.status, 200);
  const json2 = await res2.json();
  assert.equal(json2.isCompleted, false);
  assert.equal(json2.shouldHangUp, false);

  const turn3Req = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 7,
      level: 'alef',
      userGender: 'male',
      provider: 'groq',
      messages: [
        { role: 'assistant', content: scenario.initialGreeting.hebrew },
        { role: 'user', content: 'שָׁלוֹם אֵלִי, אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים בַּמֶּרְכָּז.' },
        { role: 'assistant', content: json1.hebrew },
        { role: 'user', content: 'כֵּן, כַּמָּה זֶה עוֹלֶה וְיֵשׁ שָׁם רִיהוּט?' },
        { role: 'assistant', content: json2.hebrew },
        { role: 'user', content: 'מְעֻלֶּה, אֲנִי בָּא הַיּוֹם בְּשֶׁבַע! תּוֹדָה רַבָּה!' },
      ],
      callType: 'outgoing',
    }),
  });

  const res3 = await phonePOST(turn3Req);
  assert.equal(res3.status, 200);
  const json3 = await res3.json();
  assert.equal(json3.isCompleted, true);
  assert.equal(json3.shouldHangUp, true);
});

test('Phone simulator: Role-confusion provocation is caught in system prompt guardrails', async (t) => {
  const env = setupTestEnv(t);

  const token = await createSessionToken({
    id: 'test-student-confused',
    name: 'Confused Student',
    subscriptionTier: 'free',
  });

  env.mockAiFetch('groq', () => ({
    hebrew: 'רֶגַע, אֲנִי בַּעַל הַדִּירָה, אֲנִי מַשְׂכִּיר! אַתָּה רוֹצֶה לִשְׂכֹּר דִּירָה?',
    transcription: 'рéга, анӣ бáаль hа-дирá, анӣ маскӣр! атá роцé лискóр дирá?',
    translation: 'Минутку, я владелец квартиры, я сдаю! Ты хочешь снять квартиру?',
    isCompleted: false,
    shouldHangUp: false,
    suggestedReplies: [],
  }));

  const l7 = DETAILED_LESSONS[7];
  const scenario = getLessonPhoneScenario(l7, 'male');

  const req = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 7,
      level: 'alef',
      userGender: 'male',
      provider: 'groq',
      messages: [
        { role: 'assistant', content: scenario.initialGreeting.hebrew },
        { role: 'user', content: 'שָׁלוֹם, אֲנִי מַשְׂכִּיר דִּירָה שֶׁל שְׁנֵי חֲדָרִים.' },
      ],
      callType: 'outgoing',
    }),
  });

  const res = await phonePOST(req);
  assert.equal(res.status, 200);
  const json = await res.json();

  const prompt = env.calls[0].body.messages[0].content;
  assert.ok(prompt.includes('Если ученик путает роли (например, говорит «אני משכיר דירה» вместо «שוכר»)'));
  assert.ok(prompt.includes('רגע, אני בעל הדירה, אני משכיר!'));
  assert.ok(json.hebrew.includes('בַּעַל הַדִּירָה') || json.hebrew.includes('מַשְׂכִּיר'));
});

test('Phone simulator: Female student receives feminine prompt and gender agreement', async (t) => {
  const env = setupTestEnv(t);

  const token = await createSessionToken({
    id: 'test-student-female',
    name: 'Female Student',
    subscriptionTier: 'free',
  });

  env.mockAiFetch('groq', () => ({
    hebrew: 'מְעֻלֶּה! כַּמָּה חֲדָרִים אַתְּ צְרִיכָה?',
    transcription: 'мэулé! кáма хадарӣм ат црихá?',
    translation: 'Отлично! Сколько комнат вам нужно?',
    isCompleted: false,
    shouldHangUp: false,
    suggestedReplies: [],
  }));

  const l7 = DETAILED_LESSONS[7];
  const femaleScenario = getLessonPhoneScenario(l7, 'female');

  const req = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 7,
      level: 'alef',
      userGender: 'female',
      provider: 'groq',
      messages: [
        { role: 'assistant', content: femaleScenario.initialGreeting.hebrew },
        { role: 'user', content: 'שָׁלוֹם, אֲנִי מְחַפֶּשֶׂת דִּירָה שֶׁל שְׁנֵי חֲדָרִים.' },
      ],
      callType: 'outgoing',
    }),
  });

  const res = await phonePOST(req);
  assert.equal(res.status, 200);

  const prompt = env.calls[0].body.messages[0].content;
  assert.ok(prompt.includes('Женский (обращайся к ней на «אַתְּ»'));
  assert.ok(prompt.includes('אַתְּ מְחַפֶּשֶׂת?'));
});

// ---------------------------------------------------------------------------
// 3. Scalability: All 100 lessons scenario contract and role integrity
// ---------------------------------------------------------------------------
test('All 100 lessons: getLessonPhoneScenario generates valid scenarios with non-inverted roles', () => {
  for (let lessonNum = 1; lessonNum <= 100; lessonNum++) {
    const lesson = DETAILED_LESSONS[lessonNum];
    assert.ok(lesson, 'Lesson ' + lessonNum + ' must exist in DETAILED_LESSONS');

    for (const gender of ['male', 'female']) {
      const scenario = getLessonPhoneScenario(lesson, gender);

      assert.ok(scenario, 'Lesson ' + lessonNum + ' (' + gender + ') scenario must be generated');
      assert.ok(scenario.callerRole && scenario.callerRole.trim().length > 0, 'Lesson ' + lessonNum + ' (' + gender + ') callerRole must not be empty');
      assert.ok(scenario.initialGreeting && scenario.initialGreeting.hebrew && scenario.initialGreeting.hebrew.trim().length > 0, 'Lesson ' + lessonNum + ' (' + gender + ') initialGreeting.hebrew must not be empty');
      assert.ok(scenario.initialGreeting && scenario.initialGreeting.transcription && scenario.initialGreeting.transcription.trim().length > 0, 'Lesson ' + lessonNum + ' (' + gender + ') initialGreeting.transcription must not be empty');
      assert.ok(scenario.initialGreeting && scenario.initialGreeting.translation && scenario.initialGreeting.translation.trim().length > 0, 'Lesson ' + lessonNum + ' (' + gender + ') initialGreeting.translation must not be empty');
      assert.ok(['incoming', 'outgoing'].includes(scenario.callType), 'Lesson ' + lessonNum + ' (' + gender + ') callType must be incoming or outgoing');
      assert.ok(Array.isArray(scenario.goals) && scenario.goals.length > 0, 'Lesson ' + lessonNum + ' (' + gender + ') goals must be non-empty');
      assert.equal(scenario.initialGreeting.hebrew.includes('${'), false, 'Lesson ' + lessonNum + ' greeting must not contain unresolved templates');
    }
  }
});

test('Phone simulator interactive word lookup: tokenizing Hebrew speech correctly identifies clickable tokens', () => {
  const samplePhrase = 'שָׁלוֹם, מָה נִשְׁמַע? אֲנִי רוֹצֶה לְהַזְמִין קָפֶה!';
  const tokens = tokenizeText(samplePhrase);

  const hebrewTokens = tokens.filter((t) => t.isHebrew);
  assert.ok(hebrewTokens.length >= 7, 'Should extract at least 7 Hebrew word tokens');

  // Check specific clean tokens
  assert.equal(hebrewTokens[0].cleanText, 'שלום');
  assert.equal(hebrewTokens[1].cleanText, 'מה');
  assert.equal(hebrewTokens[2].cleanText, 'נשמע');
  assert.equal(hebrewTokens[3].cleanText, 'אני');
  assert.equal(hebrewTokens[4].cleanText, 'רוצה');
  assert.equal(hebrewTokens[5].cleanText, 'להזמין');
  assert.equal(hebrewTokens[6].cleanText, 'קפה');

  // Verify non-Hebrew punctuation/spacing tokens are preserved for layout
  const allText = tokens.map((t) => t.text).join('');
  assert.equal(allText, samplePhrase, 'Full text reconstruction must match original phrase exactly');
});

// ---------------------------------------------------------------------------
// 4. Invariants P-01, P-04, P-06 compliance tests
// ---------------------------------------------------------------------------
test('P-06: Lessons 1-35 do not contain future tense tirce/tirci in greetings, suggested replies, or prompts', () => {
  for (let lessonNum = 1; lessonNum <= 35; lessonNum++) {
    const lesson = DETAILED_LESSONS[lessonNum];
    assert.ok(lesson, 'Lesson ' + lessonNum + ' must exist');

    for (const gender of ['male', 'female']) {
      const scenario = getLessonPhoneScenario(lesson, gender);

      // 1. Initial greeting
      assert.equal(
        scenario.initialGreeting.hebrew.includes('תִּרְצֶה') || scenario.initialGreeting.hebrew.includes('תִּרְצִי'),
        false,
        `Lesson ${lessonNum} (${gender}) initialGreeting.hebrew must not contain future tense tirce/tirci`
      );
      assert.equal(
        scenario.initialGreeting.transcription.toLowerCase().includes('тирцé') ||
          scenario.initialGreeting.transcription.toLowerCase().includes('тирцӣ'),
        false,
        `Lesson ${lessonNum} (${gender}) initialGreeting.transcription must not contain tirce/tirci`
      );

      // 2. Suggested replies
      if (Array.isArray(scenario.suggestedReplies)) {
        for (const reply of scenario.suggestedReplies) {
          assert.equal(
            reply.hebrew.includes('תִּרְצֶה') || reply.hebrew.includes('תִּרְצִי'),
            false,
            `Lesson ${lessonNum} (${gender}) suggestedReply must not contain future tense tirce/tirci`
          );
        }
      }

      // 3. System prompt addition
      if (scenario.systemPromptAddition) {
        assert.equal(
          scenario.systemPromptAddition.includes('תִּרְצֶה') || scenario.systemPromptAddition.includes('תִּרְצִי'),
          false,
          `Lesson ${lessonNum} (${gender}) systemPromptAddition must not contain future tense tirce/tirci`
        );
        assert.equal(
          scenario.systemPromptAddition.includes('נִתְרָאֶה'),
          false,
          `Lesson ${lessonNum} (${gender}) systemPromptAddition must not contain future tense נִתְרָאֶה`
        );
        assert.equal(
          scenario.systemPromptAddition.includes('תִּצְטָרֵךְ'),
          false,
          `Lesson ${lessonNum} (${gender}) systemPromptAddition must not contain future tense תִּצְטָרֵךְ`
        );
        assert.equal(
          scenario.systemPromptAddition.includes('תִּמְסֹר'),
          false,
          `Lesson ${lessonNum} (${gender}) systemPromptAddition must not contain future tense תִּמְסֹר`
        );
      }
    }
  }
});

test('P-04: All 100 lessons for female students have no leaks of ani roce or male names in student replies', () => {
  for (let lessonNum = 1; lessonNum <= 100; lessonNum++) {
    const lesson = DETAILED_LESSONS[lessonNum];
    assert.ok(lesson, 'Lesson ' + lessonNum + ' must exist');

    const scenario = getLessonPhoneScenario(lesson, 'female');
    if (Array.isArray(scenario.suggestedReplies) && scenario.suggestedReplies.length > 0) {
      for (const reply of scenario.suggestedReplies) {
        assert.equal(
          reply.hebrew.includes('אֲנִי רוֹצֶה'),
          false,
          `Lesson ${lessonNum} female suggested reply leaked masculine אֲנִי רוֹצֶה: ${reply.hebrew}`
        );
        if (reply.transcription) {
          assert.equal(
            reply.transcription.toLowerCase().includes('анӣ роцé'),
            false,
            `Lesson ${lessonNum} female transcription leaked masculine анӣ роцé: ${reply.transcription}`
          );
        }
        if (reply.translation) {
          assert.equal(
            reply.translation.includes('(м.р.)'),
            false,
            `Lesson ${lessonNum} female translation leaked (м.р.): ${reply.translation}`
          );
        }
      }
    }
  }

  // Lesson 1 specific checks: Sarah instead of David in student suggested reply
  const l1Female = getLessonPhoneScenario(DETAILED_LESSONS[1], 'female');
  assert.equal(
    l1Female.suggestedReplies[1].hebrew.includes('דָּוִד'),
    false,
    'Lesson 1 female suggested reply must not contain male name דָּוִד'
  );
  assert.ok(
    l1Female.suggestedReplies[1].hebrew.includes('שָׂרָה'),
    'Lesson 1 female suggested reply must contain female name שָׂרָה'
  );
  assert.equal(
    l1Female.suggestedReplies[1].transcription.includes('Давӣд'),
    false,
    'Lesson 1 female suggested reply transcription must not contain Давӣд'
  );
  assert.ok(
    l1Female.suggestedReplies[1].transcription.includes('Сáра'),
    'Lesson 1 female suggested reply transcription must contain Сáра'
  );
  assert.ok(
    l1Female.completionCondition.includes('Ученица'),
    'Lesson 1 female completion condition must say Ученица'
  );
});

test('P-06 & P-04: Answering machine fallback in route.ts is gender agreed and strictly avoids future tense', async (t) => {
  const env = setupTestEnv(t);
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const token = await createSessionToken({
    id: 'test-fallback-student',
    name: 'Fallback Student',
    subscriptionTier: 'free',
  });

  // 1. Male student fallback
  const maleReq = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 2,
      level: 'alef',
      userGender: 'male',
      messages: [{ role: 'user', content: 'שלום' }],
      callType: 'outgoing',
    }),
  });
  const maleRes = await phonePOST(maleReq);
  assert.equal(maleRes.status, 200);
  const maleJson = await maleRes.json();
  assert.equal(maleJson.engine, 'Автоответчик (Звонок)');
  assert.ok(maleJson.hebrew.includes('אַתָּה רוֹצֶה'), 'Male fallback must use אַתָּה רוֹצֶה');
  assert.equal(maleJson.hebrew.includes('תִּרְצֶה'), false, 'Male fallback must not use future tense תִּרְצֶה');
  assert.ok(maleJson.transcription.includes('атá роцé'));

  // 2. Female student fallback
  const femaleReq = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
    body: JSON.stringify({
      lessonNumber: 2,
      level: 'alef',
      userGender: 'female',
      messages: [{ role: 'user', content: 'שלום' }],
      callType: 'outgoing',
    }),
  });
  const femaleRes = await phonePOST(femaleReq);
  assert.equal(femaleRes.status, 200);
  const femaleJson = await femaleRes.json();
  assert.equal(femaleJson.engine, 'Автоответчик (Звонок)');
  assert.ok(femaleJson.hebrew.includes('אַתְּ רוֹצָה'), 'Female fallback must use אַתְּ רוֹצָה');
  assert.equal(femaleJson.hebrew.includes('תִּרְצֶה') || femaleJson.hebrew.includes('תִּרְצִי'), false, 'Female fallback must not use future tense');
  assert.ok(femaleJson.transcription.includes('ат роцá'));
});

// ---------------------------------------------------------------------------
// 9. Hallucination guard & apartment numeral tests
// ---------------------------------------------------------------------------
test('Transcription guard corrects LLM hallucinations (бадара -> ба-дира, эзрэ -> эзра, хакол -> hаколь)', () => {
  const h = '?נָעִים מְאוֹד! הַכֹּל בְּסֵדֶר בַּדִּירָה? צָרִיךְ עֶזְרָה בְּמַשֶּׁהוּ?';
  const t = 'на́им ма́од! ха́кол бэсэ́дэр бада́ра? цари́х эзрэ́ бэма́шеу?';

  const fixed = ensureCyrillicHebrewTranscription(t, h);
  assert.ok(fixed.includes('ба-дирá?'), `Must correct бада́ра to ба-дирá?, got: ${fixed}`);
  assert.ok(fixed.includes('эзрá'), `Must correct эзрэ́ to эзрá, got: ${fixed}`);
  assert.ok(fixed.includes('мэóд!'), `Must correct ма́од! to мэóд!, got: ${fixed}`);
  assert.ok(fixed.includes('hакóль'), `Must correct ха́кол to hакóль, got: ${fixed}`);
  assert.ok(fixed.includes('бэ-мáшеhу?'), `Must correct бэма́шеу? to бэ-мáшеhу?, got: ${fixed}`);
});

test('cleanHebrewForSpeech converts numerals 0-10 to Hebrew words so numbers are spoken', () => {
  const phrase = 'הַלּוֹ? שָׁלוֹם! זֶה נוֹעַם מִדִּירָה 4. מָה נִשְׁמַע?';
  const speechReady = cleanHebrewForSpeech(phrase);
  assert.ok(speechReady.includes('אַרְבַּע'), `Must convert 4 to אַרְבַּע, got: ${speechReady}`);
  assert.ok(!speechReady.includes('4'), `Must not retain raw digit 4, got: ${speechReady}`);
});

test('Lesson 1 scenario uses אַרְבַּע for apartment number and specifies callerGender male', () => {
  const lesson1 = DETAILED_LESSONS[1];
  const scenario = getLessonPhoneScenario(lesson1, 'male');
  assert.equal(scenario.callerGender, 'male');
  assert.ok(scenario.initialGreeting.hebrew.includes('אַרְבַּע'));
  assert.ok(scenario.initialGreeting.transcription.includes('арбá'));
});