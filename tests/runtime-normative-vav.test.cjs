/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');

const { cleanHebrewForSpeech, speakHebrew, stopSpeech } = require('../src/lib/speech.ts');
const { createSessionToken } = require('../src/lib/auth.ts');
const { POST: phonePOST } = require('../src/app/api/ai/phone/route.ts');
const { POST: chatPOST } = require('../src/app/api/ai/chat/route.ts');

const FORCED_VE_REGEX = /ВСЕГДА.*вэ-|ЗАПРЕЩЕНО.*у-|союзом "вэ-"/;

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

// ---------------------------------------------------------------------------
// 1. cleanHebrewForSpeech: preservation of normative vav and root vav
// ---------------------------------------------------------------------------
test('cleanHebrewForSpeech preserves normative vav and root-vav words without forced segol substitution', () => {
  // Conjunction וּ (shuruk) before BUMAF and sheva
  assert.equal(cleanHebrewForSpeech('וּגְבִינָה'), 'וּגְבִינָה', 'Initial וּ must be preserved without segol');
  assert.equal(cleanHebrewForSpeech('וּמֵאָה'), 'וּמֵאָה', 'Initial וּ before מ must be preserved');
  assert.equal(cleanHebrewForSpeech('וּשְׁנַיִם'), 'וּשְׁנַיִם', 'Initial וּ before shva must be preserved');

  // Conjunction וּ in mid-phrase / sentence
  assert.equal(cleanHebrewForSpeech('לֶחֶם וּגְבִינָה'), 'לֶחֶם וּגְבִינָה', 'Mid-phrase וּ must be preserved');
  assert.equal(cleanHebrewForSpeech('אֲנִי רוֹצֶה לֶחֶם וּגְבִינָה'), 'אֲנִי רוֹצֶה לֶחֶם וּגְבִינָה');

  // Conjunction וְ (shva)
  assert.equal(cleanHebrewForSpeech('וְסֵפֶר'), 'וְסֵפֶר', 'Initial וְ must be preserved without segol');
  assert.equal(cleanHebrewForSpeech('סֵפֶר וְמַחְבֶּרֶת'), 'סֵפֶר וְמַחְבֶּרֶת', 'Mid-phrase וְ must be preserved');

  // Words where vav is part of the root (must not be corrupted or confused with conjunction)
  assert.equal(cleanHebrewForSpeech('וִילוֹן'), 'וִילוֹן', 'Root vav in וִילוֹן must be preserved');
  assert.equal(cleanHebrewForSpeech('וֶרֶד'), 'וֶרֶד', 'Root vav in וֶרֶד must be preserved');

  // Punctuation, quotes and brackets handling
  assert.equal(cleanHebrewForSpeech('"וּגְבִינָה"'), 'וּגְבִינָה', 'Quotes must be stripped, text intact');
  assert.equal(cleanHebrewForSpeech('«וּגְבִינָה»'), 'וּגְבִינָה', 'Guillemets must be stripped, text intact');
  assert.equal(cleanHebrewForSpeech('[וּגְבִינָה]'), 'וּגְבִינָה', 'Brackets must be stripped, text intact');
  assert.equal(cleanHebrewForSpeech('   וּגְבִינָה   '), 'וּגְבִינָה', 'Whitespace must be trimmed');

  // Slash-separated options take primary (first) form
  assert.equal(cleanHebrewForSpeech('עוֹלֶה / עוֹלָה'), 'עוֹלֶה');
  assert.equal(cleanHebrewForSpeech('רוֹצֶה / רוֹצָה'), 'רוֹצֶה');

  // Neighboring phonetic corrections and rules remain fully functional
  assert.equal(cleanHebrewForSpeech('תודה'), 'תּוֹדָה', 'Phonetic correction for תודה preserved');
  assert.equal(cleanHebrewForSpeech('שלום'), 'שָׁלוֹם', 'Phonetic correction for שלום preserved');
  assert.equal(cleanHebrewForSpeech('ספר'), 'סֵפֶר', 'Phonetic correction for noun ספר preserved');
  assert.equal(cleanHebrewForSpeech('ספרי לי'), 'סַפְּרִי לי', 'Phonetic correction for ספרי לי preserved');
});

// ---------------------------------------------------------------------------
// 2. speakHebrew: transmission to all 3 synthesis sinks with strict isolation
// ---------------------------------------------------------------------------
test('speakHebrew transmits normative text across native TTS, unsupported synthesis, and error fallback', async (t) => {
  const restoreGlobals = snapshotGlobalProperties([
    'window',
    'SpeechSynthesisUtterance',
    'Audio',
    'localStorage',
  ]);

  if (t && typeof t.after === 'function') {
    t.after(() => {
      stopSpeech();
      restoreGlobals();
    });
  }

  const sinks = [];

  try {
    global.localStorage = { getItem: () => null };

    global.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.onend = null;
        this.onerror = null;
      }
    };

    global.Audio = class {
      constructor(url) {
        this.src = url;
        this.playbackRate = 1;
        this.onended = null;
        this.onerror = null;
      }
      play() {
        const queryText = new URL(this.src).searchParams.get('q');
        sinks.push({ sink: 'fallback-audio', text: queryText, rate: this.playbackRate });
        queueMicrotask(() => this.onended?.());
        return Promise.resolve();
      }
      pause() {}
    };

    // Sink 1: Native browser SpeechSynthesis
    global.window = {
      speechSynthesis: {
        getVoices: () => [],
        cancel() {},
        resume() {},
        speak(utterance) {
          sinks.push({
            sink: 'browser-tts',
            text: utterance.text,
            lang: utterance.lang,
            rate: utterance.rate,
          });
          queueMicrotask(() => utterance.onend?.());
        },
      },
    };

    const inputPhrase = 'לֶחֶם וּגְבִינָה';
    await speakHebrew(inputPhrase, { rate: 0.8 });

    assert.equal(sinks.length, 1);
    assert.equal(sinks[0].sink, 'browser-tts');
    assert.equal(sinks[0].text, 'לֶחֶם וּגְבִינָה', 'Native TTS must receive unmodified normative וּגְבִינָה');
    assert.equal(sinks[0].lang, 'he-IL');
    assert.equal(sinks[0].rate, 0.8);

    // Sink 2: Unsupported synthesis fallback (speechSynthesis deleted)
    delete global.window.speechSynthesis;
    await speakHebrew(inputPhrase, { rate: 0.8 });

    assert.equal(sinks.length, 2);
    assert.equal(sinks[1].sink, 'fallback-audio');
    // Google Translate TTS получает текст БЕЗ огласовок — иначе читает неверно («теуда», «беваакаша»).
    // Нормативный текст с огласовками идёт только в браузерный speechSynthesis (Sink 1).
    assert.equal(sinks[1].text, 'לחם וגבינה', 'Fallback Audio URL must strip nikkud for Google TTS to pronounce correctly');
    assert.equal(sinks[1].rate, 0.8);

    // Sink 3: Error fallback (speechSynthesis.speak errors out)
    global.window.speechSynthesis = {
      getVoices: () => [],
      cancel() {},
      resume() {},
      speak(utterance) {
        queueMicrotask(() => utterance.onerror?.({ error: 'synthetic-tts-error' }));
      },
    };

    const originalWarn = console.warn;
    console.warn = () => {};
    try {
      await speakHebrew(inputPhrase, { rate: 0.8 });
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(sinks.length, 3);
    assert.equal(sinks[2].sink, 'fallback-audio');
    // Google Translate TTS получает текст БЕЗ огласовок
    assert.equal(sinks[2].text, 'לחם וגבינה', 'Error fallback Audio URL must strip nikkud for Google TTS');

    // Single-word test: וּגְבִינָה alone
    global.window.speechSynthesis = {
      getVoices: () => [],
      cancel() {},
      resume() {},
      speak(utterance) {
        sinks.push({ sink: 'browser-tts', text: utterance.text });
        queueMicrotask(() => utterance.onend?.());
      },
    };

    await speakHebrew('וּגְבִינָה');
    assert.equal(sinks.length, 4);
    assert.equal(sinks[3].sink, 'browser-tts');
    assert.equal(sinks[3].text, 'וּגְבִינָה', 'Single word וּגְבִינָה must not be converted to segol');

    stopSpeech();
  } finally {
    stopSpeech();
    restoreGlobals();
  }
});

// ---------------------------------------------------------------------------
// Helper for intercepted AI route tests with descriptor/env restoration
// ---------------------------------------------------------------------------
function setupAiRouteEnv(t) {
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
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GROQ_FALLBACK_MODEL;
  process.env.JWT_SECRET = 'synthetic-local-runtime-vav-test-secret-32-bytes';

  const calls = [];

  const mockAiFetch = (provider, mockContent) => {
    global.fetch = async (url, options) => {
      const endpoint = new URL(String(url));
      assert.ok(
        endpoint.hostname === 'api.groq.com' || endpoint.hostname === 'generativelanguage.googleapis.com',
        `Unexpected fetch endpoint: ${endpoint.hostname}`
      );
      const body = JSON.parse(options.body);
      calls.push({ provider, body, url: String(url) });

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
// 3. POST /api/ai/phone: preserves normative transcription for Groq & Gemini
// ---------------------------------------------------------------------------
test('POST /api/ai/phone preserves normative "у-" transcription and provides positive prompt rules (Groq and Gemini)', async (t) => {
  const env = setupAiRouteEnv(t);

  try {
    const token = await createSessionToken({
      id: 'synthetic-phone-vav-user',
      name: 'Tester',
      subscriptionTier: 'free',
    });

    const mockContent = {
      hebrew: 'וּגְבִינָה',
      cyrillic_transcription: 'у-гвинá',
      russian_translation: 'и сыр',
      isCompleted: false,
      shouldHangUp: false,
      suggestedReplies: [
        {
          hebrew: 'וּגְבִינָה',
          cyrillic_transcription: 'у-гвинá',
          russian_translation: 'и сыр',
        },
        {
          hebrew: 'בְּבַקָּשָׁה',
          cyrillic_transcription: 'бэвакашá',
          russian_translation: 'пожалуйста',
        },
      ],
    };

    for (const provider of ['groq', 'gemini']) {
      env.mockAiFetch(provider, mockContent);
      const beforeCallCount = env.calls.length;

      const req = new NextRequest('http://localhost/api/ai/phone', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `ulpana_session=${token}`,
        },
        body: JSON.stringify({
          lessonNumber: 5,
          level: 'alef',
          userGender: 'female',
          provider,
          apiKey: 'synthetic-provider-key',
          messages: [{ role: 'user', content: 'אֲנִי רוֹצָה לֶחֶם' }],
          scenarioTitle: 'Покупка продуктов',
          situation: 'В магазине',
          aiRole: 'Продавец в продуктовой лавке',
          userRole: 'Покупательница',
          goals: ['Назвать продукты'],
          currentStepIndex: 0,
        }),
      });

      const res = await phonePOST(req);
      assert.equal(res.status, 200, `phone/${provider} returned status ${res.status}`);
      const json = await res.json();

      // Main replica transcription must preserve normative "у-гвинá"
      assert.equal(json.transcription, 'у-гвинá', `phone/${provider} main transcription must preserve "у-гвинá"`);
      assert.notEqual(json.transcription, 'вэ-гвинá', `phone/${provider} must NOT forcibly replace "у-" with "вэ-"`);

      // Suggested replies transcription must also preserve "у-гвинá"
      assert.ok(Array.isArray(json.suggestedReplies) && json.suggestedReplies.length >= 2);
      assert.equal(
        json.suggestedReplies[0].transcription,
        'у-гвинá',
        `phone/${provider} reply 0 transcription must preserve "у-гвинá"`
      );
      assert.equal(
        json.suggestedReplies[1].transcription,
        'бэвакашá',
        `phone/${provider} reply 1 transcription must preserve "бэвакашá"`
      );

      // Verify outgoing prompt
      assert.equal(env.calls.length - beforeCallCount, 1);
      const callData = env.calls.at(-1);
      const prompt =
        provider === 'groq'
          ? callData.body.messages.find((m) => m.role === 'system').content
          : callData.body.systemInstruction.parts[0].text;

      // Prompt must NOT contain forced-ve instructions
      const forcedVeLines = prompt.split('\n').filter((l) => FORCED_VE_REGEX.test(l));
      assert.equal(
        forcedVeLines.length,
        0,
        `phone/${provider} prompt must not contain forced-ve rules, found: ${JSON.stringify(forcedVeLines)}`
      );

      // Prompt must contain positive normative rule
      assert.ok(
        prompt.includes('וּ') && prompt.includes('у-') && prompt.includes('וְ') && prompt.includes('вэ-'),
        `phone/${provider} prompt must specify positive normative correspondence for וּ and וְ`
      );
    }
  } finally {
    env.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 4. POST /api/ai/phone: preserves standard "вэ-" without reverse conversion and trims
// ---------------------------------------------------------------------------
test('POST /api/ai/phone preserves standard "вэ-" and trims surrounding whitespace', async (t) => {
  const env = setupAiRouteEnv(t);

  try {
    const token = await createSessionToken({
      id: 'synthetic-phone-vav-user-2',
      name: 'Tester 2',
      subscriptionTier: 'free',
    });

    const mockContent = {
      hebrew: 'וְסֵפֶר',
      transcription: '  вэ-сéфер  ',
      translation: 'и книга',
      isCompleted: false,
      shouldHangUp: false,
      suggestedReplies: [
        {
          hebrew: 'וְסֵפֶר',
          transcription: '  вэ-сéфер  ',
          translation: 'и книга',
        },
      ],
    };

    env.mockAiFetch('groq', mockContent);

    const req = new NextRequest('http://localhost/api/ai/phone', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `ulpana_session=${token}`,
      },
      body: JSON.stringify({
        lessonNumber: 5,
        level: 'alef',
        userGender: 'male',
        provider: 'groq',
        apiKey: 'synthetic-key',
        messages: [{ role: 'user', content: 'שלום' }],
      }),
    });

    const res = await phonePOST(req);
    assert.equal(res.status, 200);
    const json = await res.json();

    assert.equal(json.transcription, 'вэ-сéфер', 'Standard "вэ-" must be preserved and trimmed');
    assert.equal(json.suggestedReplies[0].transcription, 'вэ-сéфер', 'Reply standard "вэ-" must be preserved and trimmed');
  } finally {
    env.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 5. POST /api/ai/chat: preserves normative transcription for Groq & Gemini
// ---------------------------------------------------------------------------
test('POST /api/ai/chat preserves normative "у-" transcription and provides positive prompt rules (Groq and Gemini)', async (t) => {
  const env = setupAiRouteEnv(t);

  try {
    const token = await createSessionToken({
      id: 'synthetic-chat-vav-user',
      name: 'ChatTester',
      subscriptionTier: 'free',
    });

    const mockContent = {
      hebrew: 'וּגְבִינָה',
      cyrillic_transcription: 'у-гвинá',
      russian_translation: 'и сыр',
      feedback_ru: null,
      isCompleted: false,
      suggestedReplies: [
        {
          hebrew: 'וּגְבִינָה',
          cyrillic_transcription: 'у-гвинá',
          russian_translation: 'и сыр',
        },
        {
          hebrew: 'בְּבַקָּשָׁה',
          cyrillic_transcription: 'бэвакашá',
          russian_translation: 'пожалуйста',
        },
      ],
    };

    for (const provider of ['groq', 'gemini']) {
      env.mockAiFetch(provider, mockContent);
      const beforeCallCount = env.calls.length;

      const req = new NextRequest('http://localhost/api/ai/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `ulpana_session=${token}`,
        },
        body: JSON.stringify({
          lessonNumber: 5,
          level: 'alef',
          userGender: 'female',
          provider,
          apiKey: 'synthetic-provider-key',
          messages: [{ role: 'user', content: 'אֲנִי רוֹצָה לֶחֶם' }],
          scenarioTitle: 'Покупка продуктов',
          situation: 'В магазине',
          aiRole: 'Продавец',
          userRole: 'Покупательница',
          goals: ['Назвать продукты'],
          currentStepIndex: 0,
        }),
      });

      const res = await chatPOST(req);
      assert.equal(res.status, 200, `chat/${provider} returned status ${res.status}`);
      const json = await res.json();

      // Main replica transcription must preserve normative "у-гвинá"
      assert.equal(json.transcription, 'у-гвинá', `chat/${provider} main transcription must preserve "у-гвинá"`);

      // Suggested replies transcription must also preserve "у-гвинá"
      assert.ok(Array.isArray(json.suggestedReplies) && json.suggestedReplies.length >= 2);
      assert.equal(
        json.suggestedReplies[0].transcription,
        'у-гвинá',
        `chat/${provider} reply 0 transcription must preserve "у-гвинá"`
      );
      assert.equal(
        json.suggestedReplies[1].transcription,
        'бэвакашá',
        `chat/${provider} reply 1 transcription must preserve "бэвакашá"`
      );

      // Verify outgoing prompt
      assert.equal(env.calls.length - beforeCallCount, 1);
      const callData = env.calls.at(-1);
      const prompt =
        provider === 'groq'
          ? callData.body.messages.find((m) => m.role === 'system').content
          : callData.body.contents[0].parts[0].text;

      // Prompt must NOT contain forced-ve instructions
      const forcedVeLines = prompt.split('\n').filter((l) => FORCED_VE_REGEX.test(l));
      assert.equal(
        forcedVeLines.length,
        0,
        `chat/${provider} prompt must not contain forced-ve rules, found: ${JSON.stringify(forcedVeLines)}`
      );

      // Prompt must contain positive normative rule
      assert.ok(
        prompt.includes('וּ') && prompt.includes('у-') && prompt.includes('וְ') && prompt.includes('вэ-'),
        `chat/${provider} prompt must specify positive normative correspondence for וּ and וְ`
      );
    }
  } finally {
    env.cleanup();
  }
});

// ---------------------------------------------------------------------------
// 6. POST /api/ai/chat: preserves standard "вэ-" and trims whitespace
// ---------------------------------------------------------------------------
test('POST /api/ai/chat preserves standard "вэ-" and trims surrounding whitespace', async (t) => {
  const env = setupAiRouteEnv(t);

  try {
    const token = await createSessionToken({
      id: 'synthetic-chat-vav-user-2',
      name: 'ChatTester 2',
      subscriptionTier: 'free',
    });

    const mockContent = {
      hebrew: 'וְסֵפֶר',
      transcription: '  вэ-сéфер  ',
      translation: 'и книга',
      isCompleted: false,
      suggestedReplies: [
        {
          hebrew: 'וְסֵפֶר',
          transcription: '  вэ-сéфер  ',
          translation: 'и книга',
        },
      ],
    };

    env.mockAiFetch('groq', mockContent);

    const req = new NextRequest('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `ulpana_session=${token}`,
      },
      body: JSON.stringify({
        lessonNumber: 5,
        level: 'alef',
        userGender: 'male',
        provider: 'groq',
        apiKey: 'synthetic-key',
        messages: [{ role: 'user', content: 'שלום' }],
        scenarioTitle: 'Покупка продуктов',
        situation: 'В магазине',
        aiRole: 'Продавец',
        userRole: 'Покупатель',
        goals: ['Назвать продукты'],
        currentStepIndex: 0,
      }),
    });

    const res = await chatPOST(req);
    assert.equal(res.status, 200);
    const json = await res.json();

    assert.equal(json.transcription, 'вэ-сéфер', 'Standard "вэ-" must be preserved and trimmed');
    assert.equal(json.suggestedReplies[0].transcription, 'вэ-сéфер', 'Reply standard "вэ-" must be preserved and trimmed');
  } finally {
    env.cleanup();
  }
});
