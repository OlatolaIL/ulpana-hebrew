/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { getLessonPhoneScenario, BESPOKE_PHONE_SCENARIOS } = require('../src/data/phoneScenarios.ts');
const { getExerciseSentence } = require('../src/lib/exerciseSentence.ts');
const { areWordsEqual } = require('../src/lib/sentenceParser.ts');

test('Lesson 5: grammar tables and rules provide normative numeral support', () => {
  const lesson5 = DETAILED_LESSONS[5];
  assert.ok(lesson5, 'Lesson 5 must exist');
  assert.equal(lesson5.id, 5);

  const grammar = lesson5.grammar[0];
  assert.ok(grammar, 'Lesson 5 must have grammar topic');
  assert.equal(grammar.tables.length, 2, 'Lesson 5 must have both feminine and masculine numeral tables');

  const femTable = grammar.tables[0];
  assert.ok(femTable.title.includes('женский род / простой счет'));
  // Colloquial chamesh shkalim must NOT be presented as normative example in feminine table
  for (const row of femTable.rows) {
    assert.ok(!row[3].includes('חָמֵשׁ שְׁקָלִים'), 'Feminine table must not include colloquial חָמֵשׁ שְׁקָלִים');
  }
  const fiveFemRow = femTable.rows.find(r => r[0] === '5');
  assert.ok(fiveFemRow, 'Row for 5 must exist in feminine table');
  assert.equal(fiveFemRow[1], 'חָמֵשׁ');
  assert.equal(fiveFemRow[3], 'חָמֵשׁ שַׂקִּיּוֹת');

  const sixFemRow = femTable.rows.find(r => r[0] === '6');
  assert.ok(sixFemRow, 'Row for 6 must exist in feminine table');
  assert.equal(sixFemRow[1], 'שֵׁשׁ');
  assert.equal(sixFemRow[3], 'שֵׁשׁ שַׂקִּיּוֹת');

  const mascTable = grammar.tables[1];
  assert.ok(mascTable.title.includes('мужского рода'), 'Second table must cover masculine numerals');
  assert.ok(mascTable.title.includes('שקלים') || mascTable.title.includes('шекелях'));
  assert.equal(mascTable.rows.length, 10, 'Masculine table must cover 1-10');

  const oneMasc = mascTable.rows.find(r => r[0] === '1');
  assert.ok(oneMasc[1].includes('אֶחָד'));
  assert.ok(oneMasc[3].includes('שֶׁקֶל אֶחָד'));

  const twoMasc = mascTable.rows.find(r => r[0] === '2');
  assert.ok(twoMasc[1].includes('שְׁנֵי'));
  assert.ok(twoMasc[3].includes('שְׁנֵי שְׁקָלִים'));

  const threeMasc = mascTable.rows.find(r => r[0] === '3');
  assert.equal(threeMasc[1], 'שְׁלוֹשָׁה');
  assert.ok(threeMasc[3].includes('שְׁלוֹשָׁה שְׁקָלִים'));

  const tenMasc = mascTable.rows.find(r => r[0] === '10');
  assert.equal(tenMasc[1], 'עֲשָׂרָה');
  assert.ok(tenMasc[3].includes('עֲשָׂרָה שְׁקָלִים'));

  // Rules verification
  const rulesJoined = grammar.rules.join('\n');
  assert.ok(rulesJoined.includes('שֶׁקֶל'), 'Rules must explain that shekel is masculine');
  assert.ok(rulesJoined.includes('עֲשָׂרָה שְׁקָלִים'), 'Rules must cite masculine shekel agreement');
  assert.ok(rulesJoined.includes('חמש שקל') || rulesJoined.includes('חמש שקלים'), 'Rules must note colloquial violation');
  assert.ok(rulesJoined.includes('שְׁנֵי שְׁקָלִים') || rulesJoined.includes('שְׁנֵי'), 'Rules must explain construct form for 2');
});

test('Lesson 5: all 12 exercises have unique IDs, selectable answers and solvable sentence builders', () => {
  const lesson5 = DETAILED_LESSONS[5];
  assert.equal(lesson5.exercises.length, 12, 'Lesson 5 must maintain exactly 12 exercises');

  const ids = new Set();
  for (let i = 1; i <= 12; i++) {
    const expectedId = 'ex5-' + i;
    const ex = lesson5.exercises.find(e => e.id === expectedId);
    assert.ok(ex, 'Exercise ' + expectedId + ' must exist');
    assert.ok(!ids.has(ex.id), 'Exercise ID ' + ex.id + ' must be unique');
    ids.add(ex.id);

    if (ex.type === 'build_sentence') {
      const sentence = getExerciseSentence(ex);
      assert.ok(sentence, ex.id + ' must parse as sentence');
      const available = [...sentence.cleanOptions];
      for (const word of sentence.targetWords) {
        const idx = available.findIndex(opt => areWordsEqual(opt, word));
        assert.ok(idx >= 0, ex.id + ': missing or exhausted token for ' + word);
        available.splice(idx, 1);
      }
    } else {
      assert.ok(
        ex.options.includes(ex.correctAnswer),
        ex.id + ': correctAnswer "' + ex.correctAnswer + '" must be in options'
      );
    }
  }

  // ex5-2 tests preposition merger with definite article (בַּשּׁוּק)
  const ex5_2 = lesson5.exercises.find(e => e.id === 'ex5-2');
  assert.equal(ex5_2.correctAnswer, 'בַּשּׁוּק');
  assert.ok(ex5_2.options.includes('בְּשׁוּק'));
  assert.ok(ex5_2.explanation.includes('בַּשּׁוּק'));

  // ex5-6 tests feminine numeral agreement with tomatoes
  const ex5_6 = lesson5.exercises.find(e => e.id === 'ex5-6');
  assert.equal(ex5_6.correctAnswer, 'שָׁלוֹשׁ עַגְבָנִיּוֹת');
  assert.ok(ex5_6.options.includes('שְׁלוֹשָׁה עַגְבָנִיּוֹת'));

  // ex5-7 tests masculine numeral agreement with shekels
  const ex5_7 = lesson5.exercises.find(e => e.id === 'ex5-7');
  assert.equal(ex5_7.correctAnswer, 'עֲשָׂרָה');
  assert.ok(ex5_7.options.includes('עֶשֶׂר'));
  assert.ok(ex5_7.explanation.includes('עֲשָׂרָה שְׁקָלִים'));

  // ex5-8 sentence builder preserved
  const ex5_8 = lesson5.exercises.find(e => e.id === 'ex5-8');
  assert.deepEqual(ex5_8.correctAnswer, ['זֶה', 'עוֹלֶה', 'עֲשָׂרָה', 'שְׁקָלִים']);

  // ex5-9 listening exercise preserved
  const ex5_9 = lesson5.exercises.find(e => e.id === 'ex5-9');
  assert.equal(ex5_9.type, 'listening');
  assert.equal(ex5_9.hebrewSnippet, 'לֶחֶם');
});

test('Lesson 5 interactive mechanics in jsdom: ex5-2, ex5-6, ex5-7 negative & positive answers with state verification', async (t) => {
  // Tracked globals for rigorous restoration
  const trackedGlobals = [
    'window',
    'document',
    'navigator',
    'HTMLElement',
    'Element',
    'Node',
    'HTMLTextAreaElement',
    'IS_REACT_ACT_ENVIRONMENT',
    'addEventListener',
    'removeEventListener',
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ];

  const savedGlobalDescriptors = {};
  for (const key of trackedGlobals) {
    savedGlobalDescriptors[key] = Object.getOwnPropertyDescriptor(global, key);
  }

  const confettiPath = require.resolve('canvas-confetti');
  const exercisesPath = require.resolve('../src/components/LessonExercises.tsx');
  const savedConfettiEntry = require.cache[confettiPath];
  const savedExercisesEntry = require.cache[exercisesPath];

  const speechModule = require('../src/lib/speech.ts');
  const origSpeakHebrew = speechModule.speakHebrew;

  let dom = null;
  let root = null;

  const cleanup = async () => {
    if (root) {
      try {
        const { act } = require('react');
        await act(async () => {
          root.unmount();
        });
      } catch {
        // ignore unmount errors
      }
      root = null;
    }

    if (dom && dom.window) {
      try {
        dom.window.close();
      } catch {
        // ignore close errors
      }
      dom = null;
    }

    for (const key of trackedGlobals) {
      const desc = savedGlobalDescriptors[key];
      if (desc) {
        Object.defineProperty(global, key, desc);
      } else {
        delete global[key];
      }
    }

    speechModule.speakHebrew = origSpeakHebrew;

    if (savedConfettiEntry) {
      require.cache[confettiPath] = savedConfettiEntry;
    } else {
      delete require.cache[confettiPath];
    }

    if (savedExercisesEntry) {
      require.cache[exercisesPath] = savedExercisesEntry;
    } else {
      delete require.cache[exercisesPath];
    }
  };

  t.after(cleanup);

  try {
    // Dummy confetti stub
    const dummyConfetti = () => Promise.resolve();
    dummyConfetti.reset = () => {};
    dummyConfetti.create = () => dummyConfetti;
    dummyConfetti.shapeFromPath = () => {};
    dummyConfetti.shapeFromText = () => {};
    dummyConfetti.default = dummyConfetti;

    require.cache[confettiPath] = {
      id: confettiPath,
      filename: confettiPath,
      loaded: true,
      exports: dummyConfetti,
    };

    // Ensure LessonExercises is loaded with dummyConfetti
    delete require.cache[exercisesPath];

    const { JSDOM } = require('jsdom');
    dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });

    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    global.addEventListener = dom.window.addEventListener.bind(dom.window);
    global.removeEventListener = dom.window.removeEventListener.bind(dom.window);
    dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    dom.window.cancelAnimationFrame = (id) => clearTimeout(id);
    global.requestAnimationFrame = dom.window.requestAnimationFrame;
    global.cancelAnimationFrame = dom.window.cancelAnimationFrame;
    dom.window.Element.prototype.scrollIntoView = () => {};
    dom.window.scrollTo = () => {};

    speechModule.speakHebrew = () => {};

    const React = require('react');
    const { createRoot } = require('react-dom/client');
    const { act } = require('react');
    const { LessonExercises } = require('../src/components/LessonExercises.tsx');
    const { createGuestProfile } = require('../src/lib/storage.ts');

    const container = dom.window.document.getElementById('root');
    root = createRoot(container);
    const lesson5 = DETAILED_LESSONS[5];
    const ex5_2 = lesson5.exercises.find(e => e.id === 'ex5-2');
    const ex5_6 = lesson5.exercises.find(e => e.id === 'ex5-6');
    const ex5_7 = lesson5.exercises.find(e => e.id === 'ex5-7');

    await act(async () => {
      root.render(
        React.createElement(LessonExercises, {
          lesson: { ...lesson5, exercises: [ex5_2, ex5_6, ex5_7] },
          userProfile: createGuestProfile(),
        })
      );
    });

    const getButtons = () => Array.from(container.querySelectorAll('button'));

    // --- Step 1: ex5-2 (Preposition merger: בַּשּׁוּק vs בְּשׁוּק) ---
    const wrongBtn = getButtons().find(b => b.textContent && b.textContent.trim() === 'בְּשׁוּק');
    assert.ok(wrongBtn, 'Wrong button בְּשׁוּק must exist');
    await act(async () => { wrongBtn.click(); });
    assert.ok(container.textContent.includes('Почти получилось! Обратите внимание:'), 'Must show error header for wrong answer');
    const retryBtn = getButtons().find(b => b.textContent && b.textContent.includes('Попробовать ещё раз'));
    assert.ok(retryBtn, 'Retry button must exist after wrong answer');

    await act(async () => { retryBtn.click(); });
    assert.ok(!container.textContent.includes('Почти получилось'), 'Error header must disappear after retry');

    const correctBtn = getButtons().find(b => b.textContent && b.textContent.trim() === 'בַּשּׁוּק');
    assert.ok(correctBtn, 'Correct button בַּשּׁוּק must exist');
    await act(async () => { correctBtn.click(); });
    assert.ok(container.textContent.includes('Верно! Отличный ответ.'), 'Must show success message');

    let nextBtn = getButtons().find(b => b.textContent && b.textContent.includes('Следующий вопрос'));
    assert.ok(nextBtn, 'Next button must exist after correct answer');
    await act(async () => { nextBtn.click(); });

    // --- Step 2: ex5-6 (Feminine numeral agreement: שָׁלוֹשׁ עַגְבָנִיּוֹת vs שְׁלוֹשָׁה עַגְבָנִיּוֹת) ---
    const wrongBtn6 = getButtons().find(b => b.textContent && b.textContent.trim() === 'שְׁלוֹשָׁה עַגְבָנִיּוֹת');
    assert.ok(wrongBtn6, 'Wrong button שְׁלוֹשָׁה עַגְבָנִיּוֹת must exist');
    await act(async () => { wrongBtn6.click(); });
    assert.ok(container.textContent.includes('Почти получилось! Обратите внимание:'), 'Must show error header for ex5-6 wrong');
    const retryBtn6 = getButtons().find(b => b.textContent && b.textContent.includes('Попробовать ещё раз'));
    assert.ok(retryBtn6, 'Retry button must exist after ex5-6 error');
    await act(async () => { retryBtn6.click(); });

    const correctBtn6 = getButtons().find(b => b.textContent && b.textContent.trim() === 'שָׁלוֹשׁ עַגְבָנִיּוֹת');
    assert.ok(correctBtn6, 'Correct button שָׁלוֹשׁ עַגְבָנִיּוֹת must exist');
    await act(async () => { correctBtn6.click(); });
    assert.ok(container.textContent.includes('Верно! Отличный ответ.'), 'Must show success for ex5-6');
    nextBtn = getButtons().find(b => b.textContent && b.textContent.includes('Следующий вопрос'));
    assert.ok(nextBtn, 'Next button must exist after ex5-6 correct');
    await act(async () => { nextBtn.click(); });

    // --- Step 3: ex5-7 (Masculine numeral agreement: עֲשָׂרָה vs עֶשֶׂר) ---
    const wrongBtn7 = getButtons().find(b => b.textContent && b.textContent.trim() === 'עֶשֶׂר');
    assert.ok(wrongBtn7, 'Wrong button עֶשֶׂר must exist');
    await act(async () => { wrongBtn7.click(); });
    assert.ok(container.textContent.includes('Почти получилось! Обратите внимание:'), 'Must show error header for ex5-7 wrong');
    const retryBtn7 = getButtons().find(b => b.textContent && b.textContent.includes('Попробовать ещё раз'));
    assert.ok(retryBtn7, 'Retry button must exist after ex5-7 error');
    await act(async () => { retryBtn7.click(); });

    const correctBtn7 = getButtons().find(b => b.textContent && b.textContent.trim() === 'עֲשָׂרָה');
    assert.ok(correctBtn7, 'Correct button עֲשָׂרָה must exist');
    await act(async () => { correctBtn7.click(); });
    assert.ok(container.textContent.includes('Верно! Отличный ответ.'), 'Must show success for ex5-7');
  } finally {
    await cleanup();
  }
});

test('Lesson 5 phone call covers product quantities, seller-owned prices and bag choice', () => {
  const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
  const contract = getPhoneLessonContract(5);
  for (const gender of ['male', 'female']) {
    const scenario = getLessonPhoneScenario(DETAILED_LESSONS[5], gender);
    assert.equal(scenario.callerGender, 'male');
    assert.match(scenario.callerRole, /Продавец.*Давид/);
    assert.match(scenario.userRole, /Покупател/);
    assert.match(scenario.situationSummary, /заказ продуктов/);
    assert.doesNotMatch(scenario.situationSummary + scenario.callerRole, /такси|водитель|автобус|поезд/i);
    assert.match(scenario.studentObjective, /продукт.*количеств/);
    assert.match(scenario.studentObjective, /цен/);
    assert.match(scenario.studentObjective, /пакет/);
    assert.match(scenario.completionCondition, /количеств.*согласован/);
    assert.match(scenario.completionCondition, /цена сообщена/);
    assert.match(scenario.completionCondition, /решение о пакете принято/);
    const answers = scenario.suggestedReplies.map(r => r.hebrew).join(' ');
    assert.match(answers, gender === 'female' ? /אֲנִי רוֹצָה/ : /אֲנִי רוֹצֶה/);
    assert.doesNotMatch(answers, gender === 'female' ? /אֲנִי רוֹצֶה/ : /אֲנִי רוֹצָה/);
    assert.match(answers, /לֶחֶם|גְּבִינָה|עַגְבָנִיּוֹת/);
    assert.match(answers, /קִילוֹ|אֶחָד|אַחַת|שְׁנֵי|שְׁתֵּי/);
    assert.match(answers, /תּוֹדָה רַבָּה לְךָ/);
    assert.doesNotMatch(answers, /תּוֹדָה רַבָּה לָךְ/);
  }
  assert.match(contract.facts.join(' '), /Хлеб стоит 10.*сыр.*10.*помидоры.*10/);
  assert.match(contract.facts.join(' '), /Пакет бесплатный/);
  assert.match(contract.studentDetails.join(' '), /продукты.*количество.*пакет/);
  assert.doesNotMatch(contract.studentDetails.join(' '), /цен|стоимост|сколько стоит/);
  assert.match(contract.forbiddenActions.join(' '), /пакет повторно/);
  assert.match(contract.forbiddenActions.join(' '), /физически передал продукты/);
});

test('Course structure check: exactly 1200 exercises in DETAILED_LESSONS and presence of bespoke phone scenarios 1-5', () => {
  let totalEx = 0;
  assert.equal(Object.keys(DETAILED_LESSONS).length, 100);
  for (const [idStr, lesson] of Object.entries(DETAILED_LESSONS)) {
    const num = Number(idStr);
    assert.equal(lesson.exercises.length, 12, `Lesson ${num} must have exactly 12 exercises`);
    totalEx += lesson.exercises.length;

    // Check bespoke phone scenarios 1..5
    if (num <= 5 && BESPOKE_PHONE_SCENARIOS[num]) {
      const maleSc = getLessonPhoneScenario(lesson, 'male');
      const femaleSc = getLessonPhoneScenario(lesson, 'female');
      assert.ok(maleSc.callerName, `Lesson ${num} male phone scenario has caller`);
      assert.ok(femaleSc.callerName, `Lesson ${num} female phone scenario has caller`);
    }
  }
  assert.equal(totalEx, 1200, 'Total exercises must remain exactly 1200');
});
