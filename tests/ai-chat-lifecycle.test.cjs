const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  createChatSession,
  isChatResponseApplicable,
  validateAiChatResponse,
  shouldAwardChatCompletion,
  formatChatTranscript,
  buildInitialMessage,
  TARGET_TURNS,
} = require('../src/components/LessonAiChat/useAiChat.ts');

test('validateAiChatResponse throws when res.ok is false and never awards completion', () => {
  for (const status of [500, 503, 429, 401]) {
    assert.throws(
      () => validateAiChatResponse({ ok: false, status }, { error: 'Service Unavailable', hebrew: 'שלום' }),
      /код|Собеседник|Service/
    );
  }
});

test('validateAiChatResponse throws when response payload is malformed or missing hebrew', () => {
  assert.throws(() => validateAiChatResponse({ ok: true, status: 200 }, null), /Некорректный ответ/);
  assert.throws(() => validateAiChatResponse({ ok: true, status: 200 }, {}), /не содержит текста/);
  assert.throws(() => validateAiChatResponse({ ok: true, status: 200 }, { hebrew: '' }), /не содержит текста/);
  assert.throws(() => validateAiChatResponse({ ok: true, status: 200 }, { hebrew: '   ' }), /не содержит текста/);
  assert.throws(() => validateAiChatResponse({ ok: true, status: 200 }, { error: 'LLM crashed', hebrew: 'שלום' }), /LLM crashed/);
});

test('validateAiChatResponse normalizes valid successful responses', () => {
  const valid = validateAiChatResponse(
    { ok: true, status: 200 },
    {
      hebrew: 'שָׁלוֹם! מָה שְׁלוֹמְךָ?',
      transcription: 'шалóм! ма шломхá?',
      translation: 'Привет! Как дела?',
      isCompleted: true,
      suggestedReplies: [{ hebrew: 'בְּסֵדֶר', transcription: 'бэсэдер', translation: 'В порядке' }],
    }
  );
  assert.equal(valid.hebrew, 'שָׁלוֹם! מָה שְׁלוֹמְךָ?');
  assert.equal(valid.isCompleted, true);
  assert.equal(valid.suggestedReplies.length, 1);
});

test('createChatSession generates distinct unique identifiers and timestamps for each session', async () => {
  const session1 = createChatSession(1, 'male');
  assert.match(session1.id, /^chat_1_male_\d+_[a-z0-9]+$/);
  assert.equal(session1.lessonId, 1);
  assert.equal(session1.gender, 'male');
  assert.ok(session1.startTime > 0);

  await new Promise((resolve) => setTimeout(resolve, 10));

  const session2 = createChatSession(2, 'female');
  assert.match(session2.id, /^chat_2_female_\d+_[a-z0-9]+$/);
  assert.equal(session2.lessonId, 2);
  assert.equal(session2.gender, 'female');
  assert.notEqual(session1.id, session2.id);
  assert.ok(session2.startTime >= session1.startTime);
});

test('isChatResponseApplicable rejects late AI responses when lessonId has changed', () => {
  const sessionLesson1 = createChatSession(1, 'male');
  const sessionLesson2 = createChatSession(2, 'male');

  assert.equal(isChatResponseApplicable(sessionLesson1, sessionLesson2, true), false);
  assert.equal(isChatResponseApplicable(sessionLesson2, sessionLesson2, true), true);
});

test('isChatResponseApplicable rejects late AI responses when gender has changed', () => {
  const sessionMale = createChatSession(5, 'male');
  const sessionFemale = createChatSession(5, 'female');

  assert.equal(isChatResponseApplicable(sessionMale, sessionFemale, true), false);
  assert.equal(isChatResponseApplicable(sessionFemale, sessionFemale, true), true);
});

test('isChatResponseApplicable rejects late AI responses when component is unmounted or activeSession is null', () => {
  const session = createChatSession(3, 'male');
  assert.equal(isChatResponseApplicable(session, session, false), false);
  assert.equal(isChatResponseApplicable(session, null, true), false);
  assert.equal(isChatResponseApplicable(session, null, false), false);
});

test('shouldAwardChatCompletion requires a valid response and never awards completion on failed or partial turns', () => {
  const incompleteResponse = {
    hebrew: 'יופי',
    isCompleted: false,
    suggestedReplies: [],
  };

  assert.equal(shouldAwardChatCompletion(incompleteResponse, 0, TARGET_TURNS), false);
  assert.equal(shouldAwardChatCompletion(incompleteResponse, 1, TARGET_TURNS), false);
  assert.equal(shouldAwardChatCompletion(incompleteResponse, 2, TARGET_TURNS), false);
  assert.equal(shouldAwardChatCompletion(incompleteResponse, 3, TARGET_TURNS), false);

  const completedResponse = {
    hebrew: 'להתראות!',
    isCompleted: true,
    suggestedReplies: [],
  };
  assert.equal(shouldAwardChatCompletion(completedResponse, 1, TARGET_TURNS), false);
  assert.equal(shouldAwardChatCompletion(completedResponse, 3, TARGET_TURNS), true);
});

test('formatChatTranscript creates safe transcripts without inventing pronunciation or leaking metadata', () => {
  const transcript = formatChatTranscript([
    { id: '1', role: 'assistant', hebrew: 'שלום', translation: 'Привет', timestamp: 100 },
    { id: '2', role: 'user', hebrew: 'שלום', timestamp: 200 },
  ]);
  assert.deepEqual(transcript, [
    { role: 'assistant', hebrew: 'שלום', translation: 'Привет', transcription: undefined },
    { role: 'user', hebrew: 'שלום', translation: undefined, transcription: undefined },
  ]);
});

test('buildInitialMessage is pure and generates gendered greeting', () => {
  const mockLesson = {
    id: 1,
    number: 1,
    dialogue: {
      steps: [{ fact: 'Начало', sampleAnswers: [{ hebrew: 'שלום', translation: 'Привет' }] }],
    },
  };
  const male = buildInitialMessage(mockLesson, 'male');
  const female = buildInitialMessage(mockLesson, 'female');
  assert.equal(male.role, 'assistant');
  assert.equal(male.timestamp, 0);
  assert.ok(male.hebrew.includes('לְךָ'));
  assert.ok(female.hebrew.includes('לָךְ'));
});
