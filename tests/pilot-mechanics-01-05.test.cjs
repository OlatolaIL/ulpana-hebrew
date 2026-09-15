const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const { renderToStaticMarkup } = require('react-dom/server');
const { JSDOM } = require('jsdom');

const confetti = require('canvas-confetti');
const speechModule = require('../src/lib/speech.ts');
const { getLessonPhoneScenario } = require('../src/data/phoneScenarios.ts');
const { getExerciseQuestionDisplay, LessonExercises } = require('../src/components/LessonExercises.tsx');
const { createGuestProfile } = require('../src/lib/storage.ts');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');

function findLesson(num) {
  const lesson = DETAILED_LESSONS[num];
  assert.ok(lesson, `Lesson ${num} not found`);
  return lesson;
}

test('phone scenario female adaptation in Lesson 2 returns female verb and maintains male forms for male student', () => {
  const lesson2 = findLesson(2);
  const femaleScenario = getLessonPhoneScenario(lesson2, 'female');
  const maleScenario = getLessonPhoneScenario(lesson2, 'male');

  // Female student checks
  assert.equal(
    femaleScenario.suggestedReplies[0].hebrew,
    'שָׁלוֹם, אֲנִי רוֹצָה קָפֶה גָּדוֹל עִם חָלָב, בְּבַקָּשָׁה.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[0].transcription,
    'шалóм, анӣ роцá кафэ́ гадóль им халáв, бэвакашá.'
  );
  assert.equal(femaleScenario.completionCondition, 'Ученица сделала заказ кофе и узнала стоимость.');
  // Initial greeting adapted for female listener (present tense)
  assert.ok(femaleScenario.initialGreeting.hebrew.includes('מָה אַתְּ רוֹצָה'));
  assert.ok(femaleScenario.initialGreeting.transcription.includes('ма ат роцá'));

  // Male student checks - completely preserved
  assert.equal(
    maleScenario.suggestedReplies[0].hebrew,
    'שָׁלוֹם, אֲנִי רוֹצֶה קָפֶה גָּדוֹל עִם חָלָב, בְּבַקָּשָׁה.'
  );
  assert.equal(
    maleScenario.suggestedReplies[0].transcription,
    'шалóм, анӣ роцé кафэ́ гадóль им халáв, бэвакашá.'
  );
  assert.equal(maleScenario.completionCondition, 'Ученик сделал заказ кофе и узнал стоимость.');
  assert.ok(maleScenario.initialGreeting.hebrew.includes('מָה אַתָּה רוֹצֶה'));
  assert.ok(maleScenario.initialGreeting.transcription.includes('ма атá роцé'));
});

test('phone scenario female adaptation in Lesson 3 adapts studentObjective, completionCondition and suggestedReplies', () => {
  const lesson3 = findLesson(3);
  const femaleScenario = getLessonPhoneScenario(lesson3, 'female');
  const maleScenario = getLessonPhoneScenario(lesson3, 'male');

  // Female student checks
  assert.ok(femaleScenario.studentObjective.includes('אֲנִי גָּרָה בְּ...'));
  assert.ok(!femaleScenario.studentObjective.includes('אֲנִי גָּר בְּ...'));
  assert.equal(femaleScenario.completionCondition, 'Ученица назвала страну, город или квартиру.');
  assert.equal(
    femaleScenario.suggestedReplies[1].hebrew,
    'שָׁלוֹם דָּנִי! הַכֹּל טוֹב. אֲנִי גָּרָה בְּדִירָה 4.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[1].transcription,
    'шалóм Дáни! hакóль тов. анӣ гарá бэ-дирá áрба.'
  );
  assert.ok(femaleScenario.goals.some((g) => g.includes('אֲנִי גָּרָה בְּדִירָה 5')));

  // Male student checks
  assert.ok(maleScenario.studentObjective.includes('אֲנִי גָּר בְּ...'));
  assert.equal(maleScenario.completionCondition, 'Ученик назвал страну, город или квартиру.');
  assert.equal(
    maleScenario.suggestedReplies[1].hebrew,
    'שָׁלוֹם דָּנִי! הַכֹּל טוֹב. אֲנִי גָּר בְּדִירָה 4.'
  );
  assert.equal(
    maleScenario.suggestedReplies[1].transcription,
    'шалóм Дáни! hакóль тов. анӣ гар бэ-дирá áрба.'
  );
});

test('phone scenario female adaptation in Lesson 4 adapts female verbs while preserving caller Sarah role and gender', () => {
  const lesson4 = findLesson(4);
  const femaleScenario = getLessonPhoneScenario(lesson4, 'female');
  const maleScenario = getLessonPhoneScenario(lesson4, 'male');

  // Caller is Sarah - constant for both genders
  assert.equal(femaleScenario.callerName, 'שָׂרָה');
  assert.equal(femaleScenario.callerNameRu, 'Сара (студентка из ульпана)');
  assert.equal(femaleScenario.suggestedReplies[0].hebrew, 'הַלּוֹ שָׂרָה! הַכֹּל טוֹב, תּוֹדָה. מָה שְׁלוֹמֵךְ?');
  assert.equal(femaleScenario.completionCondition, 'Ученица назвала страну/город или языки.');

  // Female student replies
  assert.equal(
    femaleScenario.suggestedReplies[1].hebrew,
    'אֲנִי מֵרוּסְיָה וְעַכְשָׁו אֲנִי גָּרָה בְּתֵל אָבִיב.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[1].transcription,
    'анӣ мэ-Рýсья вэ-ахшáв анӣ гарá бэ-Тэль Авӣв.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[2].hebrew,
    'אֲנִי מְדַבֶּרֶת רוּסִית, אַנְגְּלִית וּקְצָת עִבְרִית.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[2].transcription,
    'анӣ мэдабэ́рэт русӣт, англӣт вэ-кцат иврӣт.'
  );

  // Male student replies
  assert.equal(
    maleScenario.suggestedReplies[1].hebrew,
    'אֲנִי מֵרוּסְיָה וְעַכְשָׁו אֲנִי גָּר בְּתֵל אָבִיב.'
  );
  assert.equal(
    maleScenario.suggestedReplies[1].transcription,
    'анӣ мэ-Рýсья вэ-ахшáв анӣ гар бэ-Тэль Авӣв.'
  );
  assert.equal(
    maleScenario.suggestedReplies[2].hebrew,
    'אֲנִי מְדַבֵּר רוּסִית, אַנְגְּלִית וּקְצָת עִבְרִית.'
  );
  assert.equal(
    maleScenario.suggestedReplies[2].transcription,
    'анӣ мэдабэ́р русӣт, англӣт вэ-кцат иврӣт.'
  );
});

test('phone scenario female adaptation in Lesson 5 adapts student replies and preserves male address לְךָ to seller David', () => {
  const lesson5 = findLesson(5);
  const femaleScenario = getLessonPhoneScenario(lesson5, 'female');
  const maleScenario = getLessonPhoneScenario(lesson5, 'male');

  // Both scenarios share seller David
  assert.equal(femaleScenario.callerName, 'דָּוִד');
  assert.equal(maleScenario.callerName, 'דָּוִד');
  assert.equal(femaleScenario.avatarEmoji, '🛒');
  assert.equal(maleScenario.avatarEmoji, '🛒');

  // Female student checks
  assert.ok(femaleScenario.studentObjective.includes('«אֲנִי רוֹצָה לֶחֶם וּגְבִינָה»'));
  assert.ok(!femaleScenario.studentObjective.includes('«אֲנִי רוֹצֶה לֶחֶם וּגְבִינָה»'));
  assert.equal(
    femaleScenario.completionCondition,
    'Покупательница назвала нужные продукты («רוצה לחם/גבינה/עגבניות»), уточнила количество или спросила цену («כמה זה עולה»).'
  );
  assert.ok(!/(^|\s)назвал(\s|,|$)/.test(femaleScenario.completionCondition));
  assert.ok(!/(^|\s)уточнил(\s|,|$)/.test(femaleScenario.completionCondition));
  assert.ok(!/(^|\s)спросил(\s|,|$)/.test(femaleScenario.completionCondition));
  assert.equal(
    femaleScenario.suggestedReplies[0].hebrew,
    'שָׁלוֹם דָּוִד! אֲנִי רוֹצָה לֶחֶם, גְּבִינָה וְקִילוֹ עַגְבָנִיּוֹת.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[0].transcription,
    'шалóм Давӣд! анӣ роцá лэ́хем, гвинá вэ-кӣло агванийóт.'
  );
  // Crucial: student is speaking to male seller David, so לְךָ must NOT become לָךְ
  assert.equal(femaleScenario.suggestedReplies[1].hebrew, 'כַּמָּה זֶה עוֹלֶה? אֶפְשָׁר גַּם שַׂקִּית, בְּבַקָּשָׁה? תּוֹדָה רַבָּה לְךָ!');
  assert.equal(femaleScenario.suggestedReplies[1].transcription, 'кáма зэ олé? эфшáр гам сакӣт, бэвакашá? тодá рабá лэхá!');

  // Useful word adapted for female speaker
  const femaleWantWord = femaleScenario.usefulWords.find((w) => w.hebrew === 'אֲנִי רוֹצָה');
  assert.ok(femaleWantWord, 'useful word for female student should be אֲנִי רוֹצָה');
  assert.equal(femaleWantWord.hebrew, 'אֲנִי רוֹצָה');
  assert.equal(femaleWantWord.transcription, 'анӣ роцá');

  // Address to male seller remains לְךָ
  const thanksWord = femaleScenario.usefulWords.find((w) => w.hebrew.includes('תּוֹדָה רַבָּה לְךָ'));
  assert.ok(thanksWord, 'useful word for thanking male seller should be תּוֹדָה רַבָּה לְךָ');
  assert.equal(thanksWord.hebrew, 'תּוֹדָה רַבָּה לְךָ');
  assert.equal(thanksWord.transcription, 'тодá рабá лэхá');

  // Male student checks
  assert.ok(maleScenario.studentObjective.includes('«אֲנִי רוֹצֶה לֶחֶם וּגְבִינָה»'));
  assert.ok(maleScenario.completionCondition.includes('Покупатель назвал нужные продукты («רוצה לחם/גבינה/עגבניות»)'));
  assert.equal(
    maleScenario.suggestedReplies[0].hebrew,
    'שָׁלוֹם דָּוִד! אֲנִי רוֹצֶה לֶחֶם, גְּבִינָה וְקִילוֹ עַגְבָנִיּוֹת.'
  );
  assert.equal(
    maleScenario.suggestedReplies[0].transcription,
    'шалóм Давӣд! анӣ роцé лэ́хем, гвинá вэ-кӣло агванийóт.'
  );
});

test('non-regression: phone scenario for Lesson 1 and Lesson 6 female adaptation', () => {
  const lesson1 = findLesson(1);
  const l1Female = getLessonPhoneScenario(lesson1, 'female');
  assert.equal(l1Female.studentObjective, 'Поздороваться, сказать что всё отлично, и назвать своё имя.');
  assert.equal(l1Female.completionCondition, 'Ученица ответила на приветствие и назвала имя.');
  assert.equal(l1Female.suggestedReplies[0].hebrew, 'הַלּוֹ נוֹעַם, שָׁלוֹם! הַכֹּל טוֹב, תּוֹדָה.');
  assert.equal(l1Female.suggestedReplies[1].hebrew, 'נָעִים מְאוֹד, אֲנִי שָׂרָה מִדִּירָה 5.');

  const lesson6 = findLesson(6);
  const l6Female = getLessonPhoneScenario(lesson6, 'female');
  assert.equal(l6Female.callerName, 'רוֹנִי');
  assert.equal(l6Female.suggestedReplies[0].hebrew, 'שָׁלוֹם רוֹנִי! כֵּן, זֹאת הַמִּשְׁפָּחָה שֶׁלִּי.');
  assert.equal(l6Female.studentObjective, 'Подтвердить, что на фото ваша семья (זֹאת הַמִּשְׁפָּחָה שֶׁלִּי), назвать кого-то из родных или поблагодарить друга.');
});

test('listening exercises hide tested Hebrew word before answering and reveal it after answering (Lessons 1-5)', () => {
  const pilotLessons = [1, 2, 3, 4, 5];
  for (const num of pilotLessons) {
    const lesson = findLesson(num);
    const listeningEx = lesson.exercises.find((e) => e.type === 'listening');
    assert.ok(listeningEx, `Lesson ${num} missing listening exercise`);

    // Before answer: neutral instruction, no Hebrew word leaked
    const displayBefore = getExerciseQuestionDisplay(listeningEx, false);
    assert.equal(displayBefore, 'Послушайте аудиозапись и выберите верный перевод:');
    assert.ok(
      !displayBefore.includes(listeningEx.hebrewSnippet),
      `Lesson ${num} leaked ${listeningEx.hebrewSnippet} in unanswered question display`
    );

    // After answer: original question revealed for debrief / review
    const displayAfter = getExerciseQuestionDisplay(listeningEx, true);
    assert.equal(displayAfter, listeningEx.question);
    assert.ok(
      displayAfter.includes(listeningEx.hebrewSnippet),
      `Lesson ${num} missing ${listeningEx.hebrewSnippet} in answered question display`
    );

    // Hebrew audio source is preserved
    assert.ok(listeningEx.hebrewSnippet.length > 0, `Lesson ${num} missing hebrewSnippet`);
    assert.ok(listeningEx.options && listeningEx.options.length >= 2, `Lesson ${num} options missing`);
  }
});

test('listening exercise question hiding applies globally beyond the pilot (Lesson 6 and Lesson 10)', () => {
  for (const num of [6, 10]) {
    const lesson = findLesson(num);
    const listeningEx = lesson.exercises.find((e) => e.type === 'listening');
    assert.ok(listeningEx, `Lesson ${num} missing listening exercise`);

    const displayBefore = getExerciseQuestionDisplay(listeningEx, false);
    assert.equal(displayBefore, 'Послушайте аудиозапись и выберите верный перевод:');
    assert.ok(!displayBefore.includes(listeningEx.hebrewSnippet));

    const displayAfter = getExerciseQuestionDisplay(listeningEx, true);
    assert.equal(displayAfter, listeningEx.question);
  }
});

test('non-listening exercises always display their question regardless of isAnswered state', () => {
  const lesson1 = findLesson(1);
  const nonListeningTypes = ['word_match', 'fill_blank', 'build_sentence'];
  for (const type of nonListeningTypes) {
    const ex = lesson1.exercises.find((e) => e.type === type);
    assert.ok(ex, `Lesson 1 missing exercise type ${type}`);

    assert.equal(getExerciseQuestionDisplay(ex, false), ex.question);
    assert.equal(getExerciseQuestionDisplay(ex, true), ex.question);
  }
});

test('LessonExercises component renders hidden prompt without leaking Hebrew snippet prior to answer', () => {
  const lesson5 = findLesson(5);
  const listeningIdx = lesson5.exercises.findIndex((e) => e.type === 'listening');
  assert.ok(listeningIdx >= 0, 'Lesson 5 listening exercise not found');
  const listeningEx = lesson5.exercises[listeningIdx];

  // Create single-exercise lesson to isolate rendering
  const isolatedLesson = {
    ...lesson5,
    exercises: [listeningEx],
  };

  const html = renderToStaticMarkup(
    React.createElement(LessonExercises, {
      lesson: isolatedLesson,
      userProfile: createGuestProfile(),
    })
  );

  // Question header should contain the neutral instruction
  assert.ok(html.includes('Послушайте аудиозапись и выберите верный перевод:'));
  // Question header should NOT contain the leaked question text with quotation
  assert.ok(!html.includes('определите перевод слова'));
  // Audio playback button must still be rendered
  assert.ok(html.includes('Нажмите, чтобы прослушать аудио'));
  // Options must still be rendered
  for (const opt of listeningEx.options) {
    assert.ok(html.includes(opt), `Missing option in rendered markup: ${opt}`);
  }
});

async function runInteractiveComponentFlow({
  lessonNumber,
  listeningId,
  wrongChoice,
  correctChoice,
  expectedSnippet,
}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });

  const originalWindow = global.window;
  const originalDocument = global.document;
  const originalNavigator = global.navigator;
  const originalHTMLElement = global.HTMLElement;
  const originalElement = global.Element;
  const originalNode = global.Node;
  const originalActEnv = global.IS_REACT_ACT_ENVIRONMENT;
  const originalSpeakHebrew = speechModule.speakHebrew;
  const originalAddEventListener = global.addEventListener;
  const originalRemoveEventListener = global.removeEventListener;

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.addEventListener = dom.window.addEventListener.bind(dom.window);
  global.removeEventListener = dom.window.removeEventListener.bind(dom.window);

  // Stub missing DOM methods in jsdom environment
  dom.window.Element.prototype.scrollIntoView = () => {};
  dom.window.scrollTo = () => {};

  // Mock only the external speech boundary
  const spokenTexts = [];
  speechModule.speakHebrew = (text) => {
    spokenTexts.push(text);
  };

  const container = dom.window.document.getElementById('root');
  const root = createRoot(container);

  try {
    const fullLesson = findLesson(lessonNumber);
    const listeningIndex = fullLesson.exercises.findIndex((e) => e.id === listeningId);
    assert.ok(listeningIndex >= 0, `Exercise ${listeningId} not found in lesson ${lessonNumber}`);
    const listeningEx = fullLesson.exercises[listeningIndex];
    const nextEx = fullLesson.exercises[listeningIndex + 1] || fullLesson.exercises[0];

    // Real exercises passed to component; 2 exercises allow testing skip and return
    const lessonForTest = {
      ...fullLesson,
      exercises: [listeningEx, nextEx],
    };

    await act(async () => {
      root.render(
        React.createElement(LessonExercises, {
          lesson: lessonForTest,
          userProfile: createGuestProfile(),
        })
      );
    });

    const getHeaderText = () => {
      const h3 = container.querySelector('h3');
      return h3 ? h3.textContent.trim() : '';
    };

    const getButtons = () => Array.from(container.querySelectorAll('button'));

    // 1. Initial unanswered state: word is HIDDEN behind neutral prompt
    const initialHeader = getHeaderText();
    assert.equal(initialHeader, 'Послушайте аудиозапись и выберите верный перевод:');
    assert.ok(
      !initialHeader.includes(expectedSnippet),
      `Leaked "${expectedSnippet}" in initial unanswered state`
    );

    // 2. Click genuine audio button -> verify speakHebrew called with expected snippet
    const audioBtn = getButtons().find(
      (b) => b.textContent && b.textContent.includes('Нажмите, чтобы прослушать аудио')
    );
    assert.ok(audioBtn, 'Genuine audio playback button not found');

    await act(async () => {
      audioBtn.click();
    });

    assert.ok(spokenTexts.length > 0, 'No audio was spoken via speakHebrew');
    assert.equal(
      spokenTexts[spokenTexts.length - 1],
      expectedSnippet,
      `Spoken text "${spokenTexts[spokenTexts.length - 1]}" did not match snippet "${expectedSnippet}"`
    );

    // 3. Skip and return: returning to skipped question must keep the question hidden
    const skipBtn = getButtons().find(
      (b) => b.textContent && b.textContent.includes('Пропустить')
    );
    assert.ok(skipBtn, 'Skip button not found');

    await act(async () => {
      skipBtn.click();
    });

    // Moved to next exercise
    assert.notEqual(
      getHeaderText(),
      'Послушайте аудиозапись и выберите верный перевод:'
    );

    // Click "Предыдущий вопрос"
    const prevBtn = container.querySelector('button[title="Предыдущий вопрос"]');
    assert.ok(prevBtn, 'Previous question button not found');

    await act(async () => {
      prevBtn.click();
    });

    // Returned to listening exercise: header must still be hidden
    const returnedHeader = getHeaderText();
    assert.equal(returnedHeader, 'Послушайте аудиозапись и выберите верный перевод:');
    assert.ok(
      !returnedHeader.includes(expectedSnippet),
      `Leaked "${expectedSnippet}" after returning to skipped question`
    );

    // 4. Select incorrect answer -> verify error debrief and question text revealing the Hebrew word
    const wrongOptBtn = getButtons().find(
      (b) => b.textContent && b.textContent.trim() === wrongChoice
    );
    assert.ok(wrongOptBtn, `Wrong option button "${wrongChoice}" not found`);

    await act(async () => {
      wrongOptBtn.click();
    });

    const revealedWrongHeader = getHeaderText();
    assert.ok(
      revealedWrongHeader.includes(expectedSnippet),
      `Snippet "${expectedSnippet}" not revealed after wrong answer: "${revealedWrongHeader}"`
    );

    const retryBtn = getButtons().find(
      (b) => b.textContent && b.textContent.includes('Попробовать ещё раз')
    );
    assert.ok(retryBtn, 'Retry button "Попробовать ещё раз" not found after wrong answer');

    // 5. Click "Попробовать ещё раз" -> verify question header reverts to neutral hidden instruction
    await act(async () => {
      retryBtn.click();
    });

    const retriedHeader = getHeaderText();
    assert.equal(retriedHeader, 'Послушайте аудиозапись и выберите верный перевод:');
    assert.ok(
      !retriedHeader.includes(expectedSnippet),
      `Snippet "${expectedSnippet}" leaked after retry clicked: "${retriedHeader}"`
    );

    // 6. Select correct answer -> verify success feedback and question revelation
    const correctOptBtn = getButtons().find(
      (b) => b.textContent && b.textContent.trim() === correctChoice
    );
    assert.ok(correctOptBtn, `Correct option button "${correctChoice}" not found`);

    await act(async () => {
      correctOptBtn.click();
    });

    const revealedCorrectHeader = getHeaderText();
    assert.ok(
      revealedCorrectHeader.includes(expectedSnippet),
      `Snippet "${expectedSnippet}" not revealed after correct answer: "${revealedCorrectHeader}"`
    );
    assert.ok(
      container.textContent.includes('Верно! Отличный ответ.'),
      'Success feedback not displayed after correct answer'
    );
  } finally {
    try {
      if (typeof confetti.reset === 'function') {
        confetti.reset();
      }
    } catch {}

    await act(async () => {
      root.unmount();
    });
    dom.window.close();

    speechModule.speakHebrew = originalSpeakHebrew;
    global.window = originalWindow;
    global.document = originalDocument;
    global.navigator = originalNavigator;
    global.HTMLElement = originalHTMLElement;
    global.Element = originalElement;
    global.Node = originalNode;
    global.IS_REACT_ACT_ENVIRONMENT = originalActEnv;
    global.addEventListener = originalAddEventListener;
    global.removeEventListener = originalRemoveEventListener;
  }
}

test('interactive component workflow via createRoot and jsdom: audio, error debrief, retry, correct, skip/return (Lesson 2 pilot)', async () => {
  await runInteractiveComponentFlow({
    lessonNumber: 2,
    listeningId: 'ex2-9',
    wrongChoice: 'вода',
    correctChoice: 'чай',
    expectedSnippet: 'תֵּה',
  });
});

test('interactive component workflow via createRoot and jsdom: audio, error debrief, retry, correct, skip/return (Lesson 6 beyond pilot)', async () => {
  await runInteractiveComponentFlow({
    lessonNumber: 6,
    listeningId: 'ex6-9',
    wrongChoice: 'семья',
    correctChoice: 'сестра; медсестра',
    expectedSnippet: 'אָחוֹת',
  });
});

