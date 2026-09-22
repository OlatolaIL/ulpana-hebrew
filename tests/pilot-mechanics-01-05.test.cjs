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

const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
const replyText = s => s.suggestedReplies.map(r => r.hebrew).join(' ');

test('phone drink and grocery replies follow learner gender without changing the male seller', () => {
  for (const id of [5]) {
    const female = getLessonPhoneScenario(findLesson(id), 'female');
    const male = getLessonPhoneScenario(findLesson(id), 'male');
    assert.equal(female.callerGender, 'male');
    assert.equal(male.callerGender, 'male');
    assert.match(replyText(female), /אֲנִי רוֹצָה/);
    assert.doesNotMatch(replyText(female), /אֲנִי רוֹצֶה/);
    assert.match(replyText(male), /אֲנִי רוֹצֶה/);
    assert.doesNotMatch(replyText(male), /אֲנִי רוֹצָה/);
    assert.match(female.completionCondition, /цен/);
    assert.doesNotMatch(female.initialGreeting.hebrew, /אַתְּ רוֹצֶה|אַתָּה רוֹצָה/);
  }
  const cafe = getLessonPhoneScenario(findLesson(2), 'female');
  assert.match(cafe.callerRole, /Бариста/);
  assert.equal(cafe.callerGender, 'male');
  assert.doesNotMatch(replyText(cafe), /אֲנִי רוֹצֶה/);
  assert.match(replyText(cafe), /גָּדוֹל.*חָלָב/);
  assert.match(replyText(cafe), /קָפֶה|תֵּה/);
  assert.match(cafe.completionCondition, /подтвержд/);
  assert.match(getPhoneLessonContract(2).facts.join(' '), /маленький кофе.*10.*большой.*15/);
  assert.doesNotMatch(getPhoneLessonContract(2).studentDetails.join(' '), /цен|стоимост/);
});

test('phone Lesson 3 offers gender-neutral origin and residence examples without assigning a biography', () => {
  const female = getLessonPhoneScenario(findLesson(3), 'female');
  const male = getLessonPhoneScenario(findLesson(3), 'male');
  assert.equal(female.callerGender, 'male');
  assert.equal(female.callerName, male.callerName);
  assert.match(replyText(female), /אֲנִי מֵרוּסְיָה/);
  assert.match(replyText(female), /עַכְשָׁו אֲנִי בְּתֵל אָבִיב/);
  assert.doesNotMatch(replyText(female), /אֲנִי גָּר בְּ/);
  assert.match(replyText(male), /אֲנִי מֵרוּסְיָה/);
  assert.match(replyText(male), /עַכְשָׁו אֲנִי בְּתֵל אָבִיב/);
  assert.doesNotMatch(replyText(male), /אֲנִי גָּרָה/);
  assert.match(female.completionCondition, /происхожд/);
  assert.match(female.completionCondition, /мест[ое] жительств/);
  assert.match(getPhoneLessonContract(3).forbiddenActions.join(' '), /Приписывать.*без.*ответ/);
});

test('phone Lesson 4 keeps female Michal and demonstratives for objects for both learner genders', () => {
  for (const gender of ['male', 'female']) {
    const scenario = getLessonPhoneScenario(findLesson(4), gender);
    assert.equal(scenario.callerGender, 'female');
    assert.match(scenario.callerRole, /Михаль/);
    assert.match(scenario.initialGreeting.hebrew, /זֹאת מִיכַל/);
    assert.doesNotMatch(scenario.initialGreeting.hebrew, /זֶה מִיכַל/);
    assert.match(replyText(scenario), /סֵפֶר|מַחְבֶּרֶת/);
    assert.match(scenario.goals.join(' '), /זה.*זאת/);
    assert.match(scenario.goals.join(' '), /אלה/);
    assert.doesNotMatch(scenario.studentObjective, /стран|язык/);
    assert.match(scenario.situationSummary, /представьте.*книга.*тетрадь.*карандаши/);
    assert.match(scenario.situationSummary, /изображение не требуется/);
  }
});

test('phone grocery thanks addresses male David even when the learner is female', () => {
  for (const gender of ['male', 'female']) {
    const scenario = getLessonPhoneScenario(findLesson(5), gender);
    assert.match(scenario.callerRole, /Продавец.*Давид/);
    assert.match(replyText(scenario), /תּוֹדָה רַבָּה לְךָ/);
    assert.doesNotMatch(replyText(scenario), /תּוֹדָה רַבָּה לָךְ/);
    assert.match(replyText(scenario), /לֶחֶם|גְּבִינָה|עַגְבָנִיּוֹת/);
    assert.doesNotMatch(replyText(scenario), /רוֹצ[ֶָ]ה מִסְפָּר/);
  }
});

test('phone Lessons 1 and 6 preserve introductory and family goals without invented private facts', () => {
  const first = getLessonPhoneScenario(findLesson(1), 'female');
  assert.match(first.studentObjective, /Поздороваться/);
  assert.match(first.completionCondition, /имя/);
  assert.match(first.completionCondition, /как дела/);
  assert.match(replyText(first), /שָׁלוֹם|הַכֹּל טוֹב/);
  const family = getLessonPhoneScenario(findLesson(6), 'female');
  assert.match(family.callerRole, /Рони/);
  assert.match(family.situationSummary, /получения.*фотографии/);
  assert.match(family.completionCondition, /другая семья/);
  assert.match(getPhoneLessonContract(6).forbiddenActions.join(' '), /Предполагать наличие родителей/);
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
  const confettiPath = require.resolve('canvas-confetti');
  const exercisesPath = require.resolve('../src/components/LessonExercises.tsx');
  const savedConfettiEntry = require.cache[confettiPath];
  const savedExercisesEntry = require.cache[exercisesPath];

  try {
    // Particle rendering is an external boundary: jsdom has no canvas context.
    // Load only this interactive component with the stub, then restore its cache.
    const mockConfetti = () => Promise.resolve();
    mockConfetti.reset = () => {};
    mockConfetti.default = mockConfetti;
    require.cache[confettiPath] = { id: confettiPath, filename: confettiPath, loaded: true, exports: mockConfetti };
    delete require.cache[exercisesPath];
    const { LessonExercises: InteractiveExercises } = require('../src/components/LessonExercises.tsx');

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
        React.createElement(InteractiveExercises, {
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
    if (savedConfettiEntry) require.cache[confettiPath] = savedConfettiEntry;
    else delete require.cache[confettiPath];
    if (savedExercisesEntry) require.cache[exercisesPath] = savedExercisesEntry;
    else delete require.cache[exercisesPath];
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

