const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getStudioAudioForWord,
  getCuratedSentenceAudio,
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

    // Curated studio audio for slang words (sababa, tachles)
    await speakHebrew('סבבה');
    assert.equal(playedUrls.length, 3);
    assert.equal(playedUrls[2], '/audio/words/sababa.mp3');

    await speakHebrew('סַבָּבָה');
    assert.equal(playedUrls.length, 4);
    assert.equal(playedUrls[3], '/audio/words/sababa.mp3');

    await speakHebrew('תַּכְלֶס');
    assert.equal(playedUrls.length, 5);
    assert.equal(playedUrls[4], '/audio/words/tachles.mp3');

    // Curated pre-rendered audio for slang sentences (R-24)
    await speakHebrew('הַכֹּל סַבָּבָה, תּוֹדָה רַבָּה!');
    assert.equal(playedUrls.length, 6);
    assert.equal(playedUrls[5], '/audio/sentences/hakol_sababa.mp3');

    await speakHebrew('תַּכְלֶס, אַתָּה מַמָּשׁ צוֹדֵק.');
    assert.equal(playedUrls.length, 7);
    assert.equal(playedUrls[6], '/audio/sentences/tachles_tsodek.mp3');

    stopSpeech();
  } finally {
    global.Audio = originalAudio;
    global.window = originalWindow;
    stopSpeech();
  }
});

test('getStudioAudioForWord: curated studio audio overrides for slang words and loanwords (11 words)', () => {
  assert.equal(getStudioAudioForWord('סבבה'), '/audio/words/sababa.mp3');
  assert.equal(getStudioAudioForWord('סַבָּבָה'), '/audio/words/sababa.mp3');
  assert.equal(getStudioAudioForWord('סַבָּבָּה'), '/audio/words/sababa.mp3');
  assert.equal(getStudioAudioForWord('תכלס'), '/audio/words/tachles.mp3');
  assert.equal(getStudioAudioForWord('תַּכְלֶס'), '/audio/words/tachles.mp3');
  assert.equal(getStudioAudioForWord('פראייר'), '/audio/words/fraier.mp3');
  assert.equal(getStudioAudioForWord('פְרָאיֶיר'), '/audio/words/fraier.mp3');
  assert.equal(getStudioAudioForWord('סחבק'), '/audio/words/sahbak.mp3');
  assert.equal(getStudioAudioForWord('סַחְבָּק'), '/audio/words/sahbak.mp3');
  assert.equal(getStudioAudioForWord('פנצר'), '/audio/words/pancher.mp3');
  assert.equal(getStudioAudioForWord("פנצ'ר"), '/audio/words/pancher.mp3');
  assert.equal(getStudioAudioForWord("פַּנְצֶ'ר"), '/audio/words/pancher.mp3');
  assert.equal(getStudioAudioForWord('צימר'), '/audio/words/tzimer.mp3');
  assert.equal(getStudioAudioForWord('צִימֶר'), '/audio/words/tzimer.mp3');
  assert.equal(getStudioAudioForWord('טאבו'), '/audio/words/tabu.mp3');
  assert.equal(getStudioAudioForWord('טַאבּוּ'), '/audio/words/tabu.mp3');
  assert.equal(getStudioAudioForWord('סילבוס'), '/audio/words/syllabus.mp3');
  assert.equal(getStudioAudioForWord('סִילָבּוּס'), '/audio/words/syllabus.mp3');
  assert.equal(getStudioAudioForWord('צהל'), '/audio/words/zahal.mp3');
  assert.equal(getStudioAudioForWord('צה"ל'), '/audio/words/zahal.mp3');
  assert.equal(getStudioAudioForWord('צה״ל'), '/audio/words/zahal.mp3');
  assert.equal(getStudioAudioForWord('צַהַ"ל'), '/audio/words/zahal.mp3');
  assert.equal(getStudioAudioForWord('צַהַ״ל'), '/audio/words/zahal.mp3');
  assert.equal(getStudioAudioForWord('באסה'), '/audio/words/baasa.mp3');
  assert.equal(getStudioAudioForWord('בָּאסָה'), '/audio/words/baasa.mp3');
  assert.equal(getStudioAudioForWord('יאללה'), '/audio/words/yalla.mp3');
  assert.equal(getStudioAudioForWord('יַאלְלָה'), '/audio/words/yalla.mp3');
});

test('getCuratedSentenceAudio: returns pre-rendered audio for all 9 slang sentences (R-24)', () => {
  assert.equal(getCuratedSentenceAudio('הַכֹּל סַבָּבָה, תּוֹדָה רַבָּה!'), '/audio/sentences/hakol_sababa.mp3');
  assert.equal(getCuratedSentenceAudio('הכל סבבה תודה רבה'), '/audio/sentences/hakol_sababa.mp3');

  assert.equal(getCuratedSentenceAudio('תַּכְלֶס, אַתָּה מַמָּשׁ צוֹדֵק.'), '/audio/sentences/tachles_tsodek.mp3');
  assert.equal(getCuratedSentenceAudio('תכלס אתה ממש צודק'), '/audio/sentences/tachles_tsodek.mp3');

  assert.equal(getCuratedSentenceAudio('אַף אֶחָד לֹא פְרָאיֶיר.'), '/audio/sentences/lo_fraier.mp3');
  assert.equal(getCuratedSentenceAudio('אף אחד לא פראייר'), '/audio/sentences/lo_fraier.mp3');

  assert.equal(getCuratedSentenceAudio('הוּא סַחְבָּק אֲמִתִּי שֶׁלָּנוּ.'), '/audio/sentences/sahbak_amiti.mp3');
  assert.equal(getCuratedSentenceAudio('הוא סחבק אמיתי שלנו'), '/audio/sentences/sahbak_amiti.mp3');

  assert.equal(getCuratedSentenceAudio("יֵשׁ לִי פַּנְצֶ'ר בָּאוֹטוֹ."), '/audio/sentences/pancher_baoto.mp3');
  assert.equal(getCuratedSentenceAudio('יש לי פנצר באוטו'), '/audio/sentences/pancher_baoto.mp3');

  assert.equal(getCuratedSentenceAudio('שָׂכַרְנוּ צִימֶר יָפֶה בַּצָּפוֹן.'), '/audio/sentences/tzimer_tzafon.mp3');
  assert.equal(getCuratedSentenceAudio('שכרנו צימר יפה בצפון'), '/audio/sentences/tzimer_tzafon.mp3');

  assert.equal(getCuratedSentenceAudio('הַדִּירָה כְּבָר רְשׁוּמָה בַּטַּאבּוּ.'), '/audio/sentences/tabu_dira.mp3');
  assert.equal(getCuratedSentenceAudio('הדירה כבר רשומה בטאבו'), '/audio/sentences/tabu_dira.mp3');

  assert.equal(getCuratedSentenceAudio('הַסִּילָבּוּס מְפוֹרָט מְאֹד הַשָּׁנָה.'), '/audio/sentences/syllabus_mevorat.mp3');
  assert.equal(getCuratedSentenceAudio('הסילבוס מפורט מאוד השנה'), '/audio/sentences/syllabus_mevorat.mp3');

  assert.equal(getCuratedSentenceAudio('צַהַ"ל מֵגֵן עַל הַמְּדִינָה.'), '/audio/sentences/zahal_megen.mp3');
  assert.equal(getCuratedSentenceAudio('צהל מגן על המדינה'), '/audio/sentences/zahal_megen.mp3');

  // Обычное предложение без сленга возвращает null (идёт в стандартный TTS)
  assert.equal(getCuratedSentenceAudio('שלום מה נשמע הבוקר'), null);
});
