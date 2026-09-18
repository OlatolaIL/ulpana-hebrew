const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getStudioAudioForWord,
  cleanHebrewForSpeech,
  speakHebrew,
  stopSpeech,
} = require('../src/lib/speech.ts');

test('getStudioAudioForWord: exact Pealim lemma matching for root ח-ת-ן and studio audio availability', () => {
  // 1. חתונה (свадьба)
  const chatunaAudio = getStudioAudioForWord('חתונה');
  assert.ok(chatunaAudio, 'Must find studio audio for חתונה');
  assert.match(chatunaAudio, /^https:\/\/audio\.pealim\.com\/.*\.mp3$/, 'Must point to Pealim mp3');
  assert.equal(chatunaAudio, 'https://audio.pealim.com/v0/18/18fljifnr07w9.mp3');

  // 2. חֲתוּנָּה (with vocalization)
  const chatunaVocalizedAudio = getStudioAudioForWord('חֲתוּנָּה');
  assert.equal(chatunaVocalizedAudio, chatunaAudio, 'Vocalized input must match clean lemma');

  // 3. חתן (жених / зять)
  const chatanAudio = getStudioAudioForWord('חתן');
  assert.ok(chatanAudio, 'Must find studio audio for חתן');
  assert.equal(chatanAudio, 'https://audio.pealim.com/v0/aj/ajlxya3po2ke.mp3');

  // 4. לחתן (поженить)
  const lechatenAudio = getStudioAudioForWord('לחתן');
  assert.ok(lechatenAudio, 'Must find studio audio for לחתן');
  assert.equal(lechatenAudio, 'https://audio.pealim.com/v0/2n/2nlfxhlczh2n.mp3');

  // 5. להתחתן (жениться)
  const lehitchatenAudio = getStudioAudioForWord('להתחתן');
  assert.ok(lehitchatenAudio, 'Must find studio audio for להתחתן');
  assert.equal(lehitchatenAudio, 'https://audio.pealim.com/v0/hb/hbbxgtbm7dl6.mp3');

  // 6. Full phrase / sentence must NOT return single word studio audio
  const sentenceAudio = getStudioAudioForWord('הם מתחתנים בקיץ הקרוב בישראל');
  assert.equal(sentenceAudio, null, 'Multi-word sentence must not match single word studio audio');

  const twoWords = getStudioAudioForWord('בוקר טוב');
  assert.equal(twoWords, null, 'Two-word phrase must not match single word studio audio');
});

test('cleanHebrewForSpeech: phonetic protection for חתונה / חתונות prevents TTS saying "хетуна"', () => {
  // Input with hataf-patah חֲתוּנָּה
  const cleaned1 = cleanHebrewForSpeech('חֲתוּנָּה');
  assert.equal(cleaned1, 'חַתּוּנָה', 'Must replace hataf-patah with pure patah for speech');
  assert.ok(cleaned1.includes('\u05B7'), 'Must contain pure patah character (0x05B7)');

  // Input unvocalized חתונה
  const cleaned2 = cleanHebrewForSpeech('חתונה');
  assert.equal(cleaned2, 'חַתּוּנָה', 'Unvocalized חתונה must be vocalized with patah for TTS');

  // Input plural חתונות / חֲתוּנּוֹת
  const cleanedPlural = cleanHebrewForSpeech('חֲתוּנּוֹת');
  assert.equal(cleanedPlural, 'חַתּוּנוֹת', 'Plural must be vocalized with patah for TTS');

  // Inside a phrase
  const inPhrase = cleanHebrewForSpeech('יש חתונה גדולה');
  assert.equal(inPhrase, 'יש חַתּוּנָה גדולה');
});

test('speakHebrew: plays studio audio for single words when available', async (t) => {
  const playedUrls = [];
  const originalAudio = global.Audio;
  const originalWindow = global.window;

  global.Audio = class {
    constructor(src) {
      this.src = src;
      this.onended = null;
      this.onerror = null;
    }
    play() {
      playedUrls.push(this.src);
      queueMicrotask(() => this.onended?.());
      return Promise.resolve();
    }
    pause() {}
  };

  global.window = {
    speechSynthesis: {
      speaking: false,
      pending: false,
      cancel() {},
      getVoices: () => [],
      speak() {
        assert.fail('Should not call TTS when studio audio is present and preferStudioAudio is true');
      },
    },
  };

  try {
    await speakHebrew('חתונה');
    assert.equal(playedUrls.length, 1);
    assert.equal(playedUrls[0], 'https://audio.pealim.com/v0/18/18fljifnr07w9.mp3');

    await speakHebrew('חֲתוּנָּה');
    assert.equal(playedUrls.length, 2);
    assert.equal(playedUrls[1], 'https://audio.pealim.com/v0/18/18fljifnr07w9.mp3');

    stopSpeech();
  } finally {
    global.Audio = originalAudio;
    global.window = originalWindow;
    stopSpeech();
  }
});
