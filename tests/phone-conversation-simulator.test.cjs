/* Structural and deterministic checks. Live model behavior is evaluated separately. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { getLessonPhoneScenario, getPhoneLessonContract, PHONE_LESSON_CONTRACTS } = require('../src/data/phoneScenarios.ts');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { tokenizeText, stripNikkud, ensureCyrillicHebrewTranscription, validateAndCorrectHebrewTranscription } = require('../src/lib/transcription.ts');
const { cleanHebrewForSpeech } = require('../src/lib/speech.ts');

test('all 100 phone lessons have authored actor/student contracts and usable variants', () => {
  assert.deepEqual(Object.keys(PHONE_LESSON_CONTRACTS).map(Number).sort((a,b) => a-b), Array.from({length:100},(_,i) => i+1));
  for (let n=1;n<=100;n++) for (const gender of ['male','female']) {
    const scenario=getLessonPhoneScenario(DETAILED_LESSONS[n],gender);
    const contract=getPhoneLessonContract(n);
    assert.ok(['incoming','outgoing'].includes(scenario.callType));
    assert.ok(['male','female'].includes(scenario.callerGender));
    assert.ok(contract.facts.length>0 && contract.studentDetails.length>0 && contract.forbiddenActions.length>0, String(n));
    assert.ok(contract.goals.length>0 && contract.completionCondition.length>20, String(n));
    assert.ok([3,4].includes(scenario.targetTurns));
    assert.ok(scenario.suggestedReplies.length>0, `missing student scaffolding ${n}/${gender}`);
    for (const p of [scenario.initialGreeting,...scenario.suggestedReplies]) {
      assert.ok(/[א-ת]/.test(p.hebrew) && p.translation.trim() && p.transcription.trim(), `${n}/${gender}`);
      assert.ok(!p.hebrew.includes('${') && !p.hebrew.includes('...'), `unresolved speech ${n}/${gender}`);
      if (n<=50) assert.doesNotMatch(stripNikkud(p.hebrew), /(?:^|\s)(?:נתראה|תצטרך|תרצה|תרצי|תהיה|תהיי)(?=\s|[.,!?]|$)/, `${n}/${gender}`);
    }
  }
});

test('lesson 7 landlord owns apartment facts and may only ask tenant preferences or agreement', () => {
  const c=getPhoneLessonContract(7);
  assert.equal(c.callerRole,'Арендодатель (сдаёт квартиры в центре)');
  assert.equal(c.userRole,'Арендатор');
  assert.equal(c.callType,'outgoing');
  assert.match(c.facts.join(' '),/холодильник/i);
  assert.doesNotMatch(c.studentDetails.join(' '),/(?:есть|наличие).*холодильник/i);
  assert.match(c.forbiddenActions.join(' '),/соглас|подтвержд/i);
  const male=getLessonPhoneScenario(DETAILED_LESSONS[7],'male');
  const female=getLessonPhoneScenario(DETAILED_LESSONS[7],'female');
  assert.match(male.initialGreeting.hebrew,/מְחַפֵּשׂ/);
  assert.match(female.initialGreeting.hebrew,/מְחַפֶּשֶׂת/);
  assert.equal(female.callerGender,'male');
});

test('known nonsensical first-word replies and gender guesses cannot recur', () => {
  const bad={11:'אני רוצה מסעדה',16:'אני רוצה יש לי',19:'אני רוצה בנק',26:'אני רוצה בית ספר',57:'אני רוצה אזמין',72:'אני רוצה כאשר',75:'אני רוצה שם פעולה'};
  for (const [id,text] of Object.entries(bad)) for(const gender of ['male','female']) {
    const s=getLessonPhoneScenario(DETAILED_LESSONS[id],gender);
    assert.ok(s.suggestedReplies.every(r=>!stripNikkud(r.hebrew).includes(text)),id);
  }
  for(const id of [16,57,95]) assert.equal(getPhoneLessonContract(id).callerGender,'female',String(id));
  for(const id of [8,9,10,20]) {
    const greeting=stripNikkud(getLessonPhoneScenario(DETAILED_LESSONS[id],'female').initialGreeting.hebrew);
    assert.doesNotMatch(greeting,/את (?:עובד|קם|נוסע|יודע)(?=[\s?!.,]|$)/,String(id));
  }
});

test('a returned scenario can be edited by a caller without corrupting the shared contract', () => {
  const before=getLessonPhoneScenario(DETAILED_LESSONS[7],'male');
  const changed=getLessonPhoneScenario(DETAILED_LESSONS[7],'male');
  changed.initialGreeting.hebrew='corrupted'; changed.goals.push('corrupted');
  assert.deepEqual(getLessonPhoneScenario(DETAILED_LESSONS[7],'male'),before);
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

test('P-03: extractClosedSlots identifies name and wellbeing from "שלום אני שרגי נעים מאוד הכל טוב"', () => {
  const { extractClosedSlots, formatSlotMemoryPrompt, filterRepeatedSlotQuestions } = require('../src/lib/slotMemory.ts');

  const messages = [
    { role: 'assistant', content: 'הַלּוֹ? שָׁלוֹם! זֶה נוֹעַם מִדִּירָה אַרְבַּע. מָה נִשְׁמַע?' },
    { role: 'user', content: 'שלום אני שרגי נעים מאוד הכל טוב' },
  ];

  const slots = extractClosedSlots(messages);
  assert.equal(slots.name, 'שרגי');
  assert.ok(slots.wellbeing);

  const promptSection = formatSlotMemoryPrompt(slots);
  assert.ok(promptSection.includes('שרגי'));
  assert.ok(promptSection.includes('КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО спрашивать имя'));
  assert.ok(promptSection.includes('КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО переспрашивать «מָה נִשְׁמַע?»'));

  // Test guardrail stripping repeated name question
  const badReply = {
    hebrew: 'שָׁלוֹם שַׂרְגִּי! נָעִים מְאוֹד. אֵיךְ קוֹרְאִים לְךָ? אַתָּה בְּדִירָה חָמֵשׁ?',
    transcription: 'шалóм сарги! наӣм мэóд. эйх коръӣм лэхá? атá ба-дирá хамéш?',
    translation: 'Привет, Шарги! Очень приятно. Как тебя зовут? Ты в пятой квартире?',
  };

  const cleanReply = filterRepeatedSlotQuestions(badReply, slots);
  assert.ok(!cleanReply.hebrew.includes('אֵיךְ קוֹרְאִים לְךָ'), 'Hebrew must not contain name question');
  assert.ok(!cleanReply.transcription.includes('эйх кор'), 'Transcription must not contain name question');
  assert.ok(!cleanReply.translation.includes('Как тебя зовут'), 'Translation must not contain name question');
  assert.ok(cleanReply.hebrew.includes('שַׂרְגִּי'), 'Greeting by name must be preserved');
  assert.ok(cleanReply.hebrew.includes('אַתָּה בְּדִירָה חָמֵשׁ'), 'Subsequent question must be preserved');
});

test('P-03: extractClosedSlots identifies apartment number "שתיים" and coffee sugar', () => {
  const { extractClosedSlots, filterRepeatedSlotQuestions } = require('../src/lib/slotMemory.ts');

  const messages = [
    { role: 'user', content: 'אני גר בדירה שתיים, קוראים לי סרגיי' },
    { role: 'user', content: 'אני רוצה קפה גדול בלי סוכר' },
  ];

  const slots = extractClosedSlots(messages);
  assert.equal(slots.name, 'סרגיי');
  assert.equal(slots.apartment, 'שתיים');
  assert.equal(slots.coffee_sugar, 'בְּלִי סוּכָּר');
  assert.equal(slots.coffee_size, 'גָּדוֹל');

  const badCoffeeReply = {
    hebrew: 'מְעוּלֶּה! וְעִם סוּכָּר?',
    transcription: 'мэулэ! вэ-им сукáр?',
    translation: 'Отлично! И с сахаром?',
  };

  const cleanCoffeeReply = filterRepeatedSlotQuestions(badCoffeeReply, slots);
  assert.ok(!cleanCoffeeReply.hebrew.includes('סוּכָּר'), 'Must strip sugar question');
  assert.ok(!cleanCoffeeReply.translation.includes('сахаром'), 'Must strip sugar translation');
});
