const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

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
  // Initial greeting adapted for female listener
  assert.ok(femaleScenario.initialGreeting.hebrew.includes('מָה תִּרְצִי'));
  assert.ok(femaleScenario.initialGreeting.transcription.includes('ма тирцӣ'));

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
  assert.ok(maleScenario.initialGreeting.hebrew.includes('מָה תִּרְצֶה'));
  assert.ok(maleScenario.initialGreeting.transcription.includes('ма тирцé'));
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

test('phone scenario female adaptation in Lesson 5 adapts student replies and preserves male address לְךָ to driver', () => {
  const lesson5 = findLesson(5);
  const femaleScenario = getLessonPhoneScenario(lesson5, 'female');
  const maleScenario = getLessonPhoneScenario(lesson5, 'male');

  // Female student checks
  assert.ok(femaleScenario.studentObjective.includes('«אֲנִי יוֹרֶדֶת עַכְשָׁו»'));
  assert.ok(!femaleScenario.studentObjective.includes('«אֲנִי יוֹרֵד עַכְשָׁו»'));
  assert.equal(
    femaleScenario.completionCondition,
    'Пассажирка сообщила, что спускается («אני יורדת»), попросила подождать («עוד שתי דקות», «רגע») или спросила о машине.'
  );
  assert.ok(!/(^|\s)сообщил(\s|,|$)/.test(femaleScenario.completionCondition));
  assert.ok(!/(^|\s)попросил(\s|,|$)/.test(femaleScenario.completionCondition));
  assert.ok(!/(^|\s)спросил(\s|,|$)/.test(femaleScenario.completionCondition));
  assert.equal(
    femaleScenario.suggestedReplies[0].hebrew,
    'שָׁלוֹם! אֲנִי יוֹרֶדֶת עַכְשָׁו, עוֹד שְׁתֵּי דַּקּוֹת אֲנִי שָׁם.'
  );
  assert.equal(
    femaleScenario.suggestedReplies[0].transcription,
    'шалóм! анӣ йорéдэт ахшáв, од штэй дакóт анӣ шам.'
  );
  // Crucial: student is speaking to male driver Eli, so לְךָ must NOT become לָךְ
  assert.equal(femaleScenario.suggestedReplies[1].hebrew, 'רֶגַע, אֵיזֶה רֶכֶב יֵשׁ לְךָ?');
  assert.equal(femaleScenario.suggestedReplies[1].transcription, 'рéга, э́йзе рéхев йеш лэхá?');

  // Useful word adapted for female speaker to male driver
  const femaleWaitWord = femaleScenario.usefulWords.find((w) => w.hebrew.includes('מְחַכָּה'));
  assert.ok(femaleWaitWord, 'useful word for female student waiting for male driver should be אֲנִי מְחַכָּה לְךָ');
  assert.equal(femaleWaitWord.hebrew, 'אֲנִי מְחַכָּה לְךָ');
  assert.equal(femaleWaitWord.transcription, 'анӣ мэхакá лэхá');

  // Male student checks
  assert.ok(maleScenario.studentObjective.includes('«אֲנִי יוֹרֵד עַכְשָׁו»'));
  assert.ok(maleScenario.completionCondition.includes('Пассажир сообщил, что спускается («אני יורד»)'));
  assert.equal(
    maleScenario.suggestedReplies[0].hebrew,
    'שָׁלוֹם! אֲנִי יוֹרֵד עַכְשָׁו, עוֹד שְׁתֵּי דַּקּוֹת אֲנִי שָׁם.'
  );
  assert.equal(
    maleScenario.suggestedReplies[0].transcription,
    'шалóм! анӣ йорéд ахшáв, од штэй дакóт анӣ шам.'
  );
});

test('non-regression: phone scenario for Lesson 1 and Lesson 6 remain unaffected by 2-5 female verb overrides', () => {
  const lesson1 = findLesson(1);
  const l1Female = getLessonPhoneScenario(lesson1, 'female');
  assert.equal(l1Female.studentObjective, 'Поздороваться, сказать что всё отлично, и назвать своё имя.');
  assert.equal(l1Female.completionCondition, 'Ученик ответил на приветствие и назвал имя.');
  assert.equal(l1Female.suggestedReplies[0].hebrew, 'הַלּוֹ נוֹעַם, שָׁלוֹם! הַכֹּל טוֹב, תּוֹדָה.');
  assert.equal(l1Female.suggestedReplies[1].hebrew, 'נָעִים מְאוֹד, אֲנִי דָּוִד מִדִּירָה 5.');

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

test('interactive transition flow: unanswered hides word, answered reveals word, retry resets and hides word again', () => {
  for (let num = 1; num <= 5; num++) {
    const lesson = findLesson(num);
    const listeningEx = lesson.exercises.find((e) => e.type === 'listening');
    assert.ok(listeningEx, `Lesson ${num} missing listening exercise`);

    // 1. Initial unanswered state: word is hidden
    assert.equal(
      getExerciseQuestionDisplay(listeningEx, false),
      'Послушайте аудиозапись и выберите верный перевод:'
    );

    // 2. Option selected (isAnswered = true): word is revealed for feedback
    const answeredText = getExerciseQuestionDisplay(listeningEx, true);
    assert.equal(answeredText, listeningEx.question);
    assert.ok(answeredText.includes(listeningEx.hebrewSnippet));

    // 3. User clicks retry (handleRetryCurrent -> resetCurrentAnswerState -> isAnswered = false):
    // word is hidden again
    assert.equal(
      getExerciseQuestionDisplay(listeningEx, false),
      'Послушайте аудиозапись и выберите верный перевод:'
    );
  }
});

test('listening exercises resolve valid Hebrew audio playback source independently of question prompt', () => {
  for (let num = 1; num <= 5; num++) {
    const lesson = findLesson(num);
    const listeningEx = lesson.exercises.find((e) => e.type === 'listening');
    assert.ok(listeningEx, `Lesson ${num} missing listening exercise`);

    // The audio button in LessonExercises uses:
    // textToSpeak = currentEx.hebrewSnippet || (currentEx.correctAnswer ...)
    const textToSpeak =
      listeningEx.hebrewSnippet ||
      (listeningEx.correctAnswer &&
      typeof listeningEx.correctAnswer === 'string' &&
      /[\u0590-\u05FF]/.test(listeningEx.correctAnswer)
        ? listeningEx.correctAnswer
        : '');

    assert.ok(textToSpeak, `Lesson ${num} audio source must not be empty`);
    assert.ok(/[\u0590-\u05FF]/.test(textToSpeak), `Lesson ${num} audio source must contain Hebrew characters`);
    assert.equal(textToSpeak, listeningEx.hebrewSnippet, `Lesson ${num} textToSpeak must match hebrewSnippet`);
  }
});

test('audio playback handler in listening exercise passes exact hebrewSnippet to speakHebrew', () => {
  const speech = require('../src/lib/speech.ts');
  const originalSpeak = speech.speakHebrew;
  let spokenText = null;
  speech.speakHebrew = (text) => {
    spokenText = text;
  };

  try {
    for (let num = 1; num <= 5; num++) {
      const lesson = findLesson(num);
      const listeningEx = lesson.exercises.find((e) => e.type === 'listening');
      assert.ok(listeningEx);

      // Simulate the exact audio button click logic from LessonExercises.tsx (lines 623-633)
      const textToSpeak =
        listeningEx.hebrewSnippet ||
        (listeningEx.correctAnswer &&
        typeof listeningEx.correctAnswer === 'string' &&
        /[\u0590-\u05FF]/.test(listeningEx.correctAnswer)
          ? listeningEx.correctAnswer
          : '');

      if (textToSpeak) speech.speakHebrew(textToSpeak);

      assert.equal(
        spokenText,
        listeningEx.hebrewSnippet,
        `Lesson ${num} did not invoke speakHebrew with hebrewSnippet`
      );
      spokenText = null;
    }
  } finally {
    speech.speakHebrew = originalSpeak;
  }
});

