const test = require('node:test');
const assert = require('node:assert/strict');
const { extractClosedSlots, hasRepeatedSlotQuestion, filterRepeatedSlotQuestions } = require('../src/lib/slotMemory.ts');
const user = (content) => ({ role: 'user', content });
const memory = (text, scope) => extractClosedSlots([user(text)], undefined, scope);

test('memory does not invent names from requests or ordinary first-person statements', () => {
  for (const text of ['אני צריך דירה', 'אני צריכה מיטה', 'אני עובד בבית', 'אני משכיר דירה', 'אני מגיע מחר']) {
    assert.equal(memory(text).name, undefined, text);
  }
  assert.equal(memory('שלום אני שרגי נעים מאוד הכל טוב').name, 'שרגי');
  assert.equal(memory('קוראים לי סרגיי').name, 'סרגיי');
  assert.equal(memory('שמי דנה').name, 'דנה');
  assert.equal(memory('קוראים לי סרגיי. סליחה, קוראים לי דני').name, 'דני');
  assert.equal(memory('קוראים לי דנה?').name, undefined);
});

test('apartment memory requires a number attached to an apartment, not room counts', () => {
  for (const text of ['אני מחפש דירה של שלושה חדרים', 'דירה שלוש חדרים', 'אני רוצה שלוש כוסות', 'יש בדירה מקרר?']) {
    assert.equal(memory(text).apartment, undefined, text);
  }
  assert.equal(memory('אני גר בדירה שתיים').apartment, 'שתיים');
  assert.equal(memory('אני בדירה מספר 12', 'delivery').apartment, '12');
  assert.equal(memory('אני בדירה 2. סליחה, בדירה 5', 'social').apartment, '5');
  assert.equal(memory('דירה 2', 'rental').apartment, undefined);
});

test('coffee memory is scoped and does not turn large furniture into a drink order', () => {
  for (const scope of [undefined, 'rental', 'delivery', 'general', 'coffee']) {
    assert.equal(memory('אני רוצה שולחן גדול', scope).coffee_size, undefined);
    assert.equal(memory('השולחן גדול', scope).coffee_size, undefined);
  }
  assert.equal(memory('גדול', 'coffee').coffee_size, 'גָּדוֹל');
  assert.equal(memory('גדול', 'general').coffee_size, undefined);
  assert.equal(memory('גדול או קטן', 'coffee').coffee_size, undefined);
  const mixed = extractClosedSlots([user('אני גר בדירה שתיים'), user('אני רוצה קפה גדול בלי סוכר')]);
  assert.equal(mixed.apartment, 'שתיים');
  assert.equal(mixed.coffee_size, 'גָּדוֹל');
  assert.equal(mixed.coffee_sugar, 'בְּלִי סוּכָּר');
});

test('latest explicit choices win across turns and inside one utterance', () => {
  const slots = extractClosedSlots([
    user('קפה גדול בלי סוכר עם חלב'),
    user('קטן בבקשה. עם סוכר. בלי חלב'),
  ], undefined, 'coffee');
  assert.equal(slots.coffee_size, 'קָטָן');
  assert.equal(slots.coffee_sugar, 'עִם סוּכָּר');
  assert.equal(slots.coffee_milk, 'בְּלִי חָלָב');
  assert.equal(memory('בלי סוכר סליחה עם סוכר', 'coffee').coffee_sugar, 'עִם סוּכָּר');
  assert.equal(memory('גדול בעצם קטן', 'coffee').coffee_size, 'קָטָן');
  assert.equal(extractClosedSlots([user('קפה עם סוכר'), user('לא עם סוכר')], undefined, 'coffee').coffee_sugar, undefined);
});

test('questions and negated requests do not close factual slots', () => {
  for (const text of ['עם סוכר?', 'יש לכם קפה גדול?', 'יש חלב סויה', 'אפשר קפה גדול', 'אני לא רוצה קפה גדול', 'לא עם חלב']) {
    assert.deepEqual(memory(text, 'coffee'), {}, text);
  }
  assert.deepEqual(extractClosedSlots([{ role: 'assistant', content: 'קפה גדול עם סוכר' }], undefined, 'coffee'), {});
  assert.equal(memory('אני רוצה קפה קטן. יש חלב סויה?', 'coffee').coffee_size, 'קָטָן');
  assert.equal(memory('אני רוצה קפה קטן. יש חלב סויה?', 'coffee').coffee_milk, undefined);
});

test('repeat detection covers closed slots and preserves affirmative confirmations', () => {
  const examples = [
    ['איך קוראים לך?', { name: 'דנה' }],
    ['מה נשמע?', { wellbeing: 'בסדר' }],
    ['באיזו דירה את?', { apartment: '2' }],
    ['ועם סוכר?', { coffee_sugar: 'בלי סוכר' }],
    ['גדול או קטן?', { coffee_size: 'גדול' }],
    ['איזה חלב?', { coffee_milk: 'סויה' }],
  ];
  for (const [text, slots] of examples) assert.equal(hasRepeatedSlotQuestion(text, slots), true, text);
  assert.equal(hasRepeatedSlotQuestion('הקפה עם סוכר.', { coffee_sugar: 'עם סוכר' }), false);
  assert.equal(hasRepeatedSlotQuestion('אני יודע איך קוראים לך.', { name: 'דנה' }), false);
  assert.equal(hasRepeatedSlotQuestion('ועם סוכר?', {}), false);
});

test('legacy output cleanup only removes aligned whole questions, never confirmations', () => {
  const reply = { hebrew: 'הקפה עם סוכר.', transcription: 'hа-кафэ им сукар.', translation: 'Кофе с сахаром.' };
  assert.deepEqual(filterRepeatedSlotQuestions(reply, { coffee_sugar: 'עם סוכר' }), reply);
  const repeated = { hebrew: 'מעולה! ועם סוכר?', transcription: 'мэулэ! вэ-им сукар?', translation: 'Отлично! И с сахаром?' };
  assert.deepEqual(filterRepeatedSlotQuestions(repeated, { coffee_sugar: 'בלי סוכר' }), {
    hebrew: 'מעולה!', transcription: 'мэулэ!', translation: 'Отлично!',
  });
  const unaligned = { ...repeated, translation: 'Отлично, и с сахаром?' };
  assert.deepEqual(filterRepeatedSlotQuestions(unaligned, { coffee_sugar: 'בלי סוכר' }), unaligned);
  const mixed = { hebrew: 'קפה גדול, ועם סוכר?', transcription: 'кафэ гадоль, вэ-им сукар?', translation: 'Большой кофе, и с сахаром?' };
  assert.deepEqual(filterRepeatedSlotQuestions(mixed, { coffee_sugar: 'בלי סוכר' }), mixed);
});
