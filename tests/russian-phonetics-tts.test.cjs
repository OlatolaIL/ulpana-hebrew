/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanRussianForSpeech, fixRussianPhonetics } = require('../src/lib/speech.ts');

test('Russian Phonetics TTS: "летом" is stressed on E (ле́том) to prevent synthesizer producing "лётом"', () => {
  assert.equal(fixRussianPhonetics('летом'), 'ле\u0301том');
  assert.equal(fixRussianPhonetics('Летом'), 'Ле\u0301том');
  assert.equal(fixRussianPhonetics('в ульпане летом.'), 'в ульпане ле\u0301том.');
  assert.equal(
    cleanRussianForSpeech('Я познакомился с ним в ульпане летом.'),
    'Я познакомился с ним в ульпане ле\u0301том'
  );
  assert.equal(
    cleanRussianForSpeech('Они женятся ближайшим летом в Израиле.'),
    'Они женятся ближайшим ле\u0301том в Израиле'
  );
  assert.equal(
    cleanRussianForSpeech('Люди жалуются на погоду летом.'),
    'Люди жалуются на погоду ле\u0301том'
  );
});

test('Russian Phonetics TTS: "сто́ит" (цена / рекомендация) vs "стои́т" (на ногах / вертикально)', () => {
  // Стоимость / рекомендация -> сто́ит
  assert.equal(cleanRussianForSpeech('Сколько это стоит?'), 'Сколько это сто\u0301ит?');
  assert.equal(cleanRussianForSpeech('Сколько она стоит?'), 'Сколько она сто\u0301ит?');
  assert.equal(cleanRussianForSpeech('Это стоит десять шекелей.'), 'Это сто\u0301ит десять шекелей');
  assert.equal(cleanRussianForSpeech('Стоит взять кепку и воду?'), 'Сто\u0301ит взять кепку и воду?');
  assert.equal(cleanRussianForSpeech('Очень стоит!'), 'Очень сто\u0301ит!');
  assert.equal(cleanRussianForSpeech('Не стоит беспокоиться.'), 'Не сто\u0301ит беспокоиться');

  // Стояние -> стои́т
  assert.equal(cleanRussianForSpeech('Он стоит возле остановки.'), 'Он стои\u0301т возле остановки');
  assert.equal(cleanRussianForSpeech('Стоит возле магазина.'), 'Стои\u0301т возле магазина');
  assert.equal(
    cleanRussianForSpeech('Вот шифр издания — по нему книга стоит на полке.'),
    'Вот шифр издания по нему книга стои\u0301т на полке'
  );
  assert.equal(
    cleanRussianForSpeech('Он стоит на светофоре.'),
    'Он стои\u0301т на светофоре'
  );
});

test('Russian Phonetics TTS: "плачу́" (оплата) vs "пла́чу" (слезы)', () => {
  assert.equal(
    cleanRussianForSpeech('Я сейчас плачу кредитной картой.'),
    'Я сейчас плачу\u0301 кредитной картой'
  );
  assert.equal(
    cleanRussianForSpeech('Я плачу наличными.'),
    'Я плачу\u0301 наличными'
  );
  assert.equal(
    cleanRussianForSpeech('Не беспокойся, я заплачу счет сегодня.'),
    'Не беспокойся, я заплачу\u0301 счет сегодня'
  );
});

test('Russian Phonetics TTS: "до́ма" (наречие места) and "уже́" (наречие времени)', () => {
  assert.equal(
    cleanRussianForSpeech('Дедушка отдыхает дома днем.'),
    'Дедушка отдыхает до\u0301ма днем'
  );
  assert.equal(
    cleanRussianForSpeech('Вчера я включил дома кондиционер.'),
    'Вчера я включил до\u0301ма кондиционер'
  );
  assert.equal(
    cleanRussianForSpeech('Я уже знаю это правило.'),
    'Я уже\u0301 знаю это правило'
  );
});

test('Russian Phonetics TTS: compound sentences with commas are not truncated', () => {
  assert.equal(
    cleanRussianForSpeech('Не беспокойся, я заплачу счет сегодня.'),
    'Не беспокойся, я заплачу\u0301 счет сегодня'
  );
  assert.equal(
    cleanRussianForSpeech('Я знаю, что это трудно.'),
    'Я знаю, что это трудно'
  );
  // Short glossary entries with synonyms still keep the first meaning
  assert.equal(cleanRussianForSpeech('есть, кушать'), 'есть');
  assert.equal(cleanRussianForSpeech('ветер; дух'), 'ветер');
});
