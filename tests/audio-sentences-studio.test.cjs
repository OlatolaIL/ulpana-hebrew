const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  getAllSystemSentences,
  getAudioSettings,
  saveAudioSettings,
  getSentencesManifest,
  saveToSentencesManifest,
  sanitizeFileName,
} = require('../src/lib/audioSentencesCatalog.ts');
const {
  getSentenceAudioEngine,
  getCuratedSentenceAudio,
  getStudioAudioForWord,
  normalizeSentenceKey,
} = require('../src/lib/speech.ts');

test('Audio Sentences Catalog: getAllSystemSentences collects all system phrases with valid metadata', () => {
  const allSentences = getAllSystemSentences();
  assert.ok(allSentences.length > 2000, `Expected > 2000 sentences, got ${allSentences.length}`);

  // Проверяем наличие всех категорий
  const categories = new Set(allSentences.map((s) => s.category));
  assert.ok(categories.has('verb'), 'Must include verb sentences');
  assert.ok(categories.has('noun'), 'Must include noun sentences');
  assert.ok(categories.has('adjective'), 'Must include adjective sentences');
  assert.ok(categories.has('preposition'), 'Must include preposition sentences');
  assert.ok(categories.has('mom'), 'Must include mom sentences');

  // Проверяем структуру произвольного элемента
  const first = allSentences[0];
  assert.ok(first.id, 'Sentence must have id');
  assert.ok(first.sentenceHe, 'Sentence must have Hebrew vocalized text');
  assert.ok(first.sentencePlain, 'Sentence must have unvocalized text');
  assert.ok(first.sentenceRu, 'Sentence must have Russian translation');
  assert.ok(first.category, 'Sentence must have category');
  assert.ok(first.audioUrl.startsWith('/audio/sentences/'), 'audioUrl must point to /audio/sentences/');
});

test('Audio Settings: getAudioSettings and saveAudioSettings manage global engine configuration', () => {
  const currentSettings = getAudioSettings();
  assert.ok(currentSettings, 'Must return settings object');
  assert.ok(
    currentSettings.sentenceAudioEngine === 'current' ||
      currentSettings.sentenceAudioEngine === 'google_cloud' ||
      currentSettings.sentenceAudioEngine === 'edge_neural',
    'Engine must be valid value'
  );

  // Сохранение и восстановление
  const original = currentSettings.sentenceAudioEngine;
  saveAudioSettings({ sentenceAudioEngine: 'google_cloud' });
  assert.equal(getAudioSettings().sentenceAudioEngine, 'google_cloud');

  saveAudioSettings({ sentenceAudioEngine: original });
  assert.equal(getAudioSettings().sentenceAudioEngine, original);
});

test('Audio Sentences Manifest: registers and retrieves sentence audio mappings', () => {
  const manifest = getSentencesManifest();
  assert.ok(typeof manifest === 'object', 'Manifest must be an object');

  // Проверяем регистрацию тестовой фразы
  const testKey = 'בדיקת שמע סטודיו';
  saveToSentencesManifest(testKey, 'test_audio_sample.mp3');

  const updatedManifest = getSentencesManifest();
  assert.equal(updatedManifest[testKey], 'test_audio_sample.mp3');

  // Очищаем тестовую запись
  delete updatedManifest[testKey];
  const manifestPath = path.resolve(__dirname, '../public/audio/sentences/manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2), 'utf-8');
});

test('Speech Dispatcher: sentences isolation ensures single words are never affected by sentence engine', () => {
  // Одиночное слово 'חתונה' всегда возвращает аудио Pealim SSOT
  const wordStudio = getStudioAudioForWord('חתונה');
  assert.ok(wordStudio, 'Single word must be looked up in Pealim SSOT');
  assert.match(wordStudio, /^https:\/\/audio\.pealim\.com\//);

  const wordAsSentence = getCuratedSentenceAudio('חתונה');
  assert.equal(wordAsSentence, null, 'Single word without spaces must not be resolved as sentence audio');
});
