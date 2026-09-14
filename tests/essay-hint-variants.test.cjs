/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

// 1. Setup isolated DOM environment before loading React/ReactDOM
function createTestEnv() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
  });

  const saved = {
    window: global.window,
    document: global.document,
    navigator: global.navigator,
    HTMLElement: global.HTMLElement,
    Element: global.Element,
    Node: global.Node,
    HTMLTextAreaElement: global.HTMLTextAreaElement,
    actEnv: global.IS_REACT_ACT_ENVIRONMENT,
    addEvent: global.addEventListener,
    removeEvent: global.removeEventListener,
    raf: global.requestAnimationFrame,
    caf: global.cancelAnimationFrame,
  };

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
  dom.window.Element.prototype.attachEvent = () => {};
  dom.window.Element.prototype.detachEvent = () => {};

  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const { act } = require('react');
  const { LessonEssay } = require('../src/components/LessonEssay/LessonEssay.tsx');
  const { getLessonById } = require('../src/data/lessonsData.ts');

  const container = dom.window.document.getElementById('root');
  const root = createRoot(container);

  const cleanup = async () => {
    await act(async () => {
      root.unmount();
    });
    global.window = saved.window;
    global.document = saved.document;
    global.navigator = saved.navigator;
    global.HTMLElement = saved.HTMLElement;
    global.Element = saved.Element;
    global.Node = saved.Node;
    global.HTMLTextAreaElement = saved.HTMLTextAreaElement;
    global.IS_REACT_ACT_ENVIRONMENT = saved.actEnv;
    global.addEventListener = saved.addEvent;
    global.removeEventListener = saved.removeEvent;
    global.requestAnimationFrame = saved.raf;
    global.cancelAnimationFrame = saved.caf;
  };

  return { React, act, root, container, cleanup, LessonEssay, getLessonById };
}

test('Lesson 8 out-of-pilot: selecting female form, male form, and focused insertion with cursor preservation', async () => {
  const env = createTestEnv();
  try {
    const { React, act, root, container, LessonEssay, getLessonById } = env;
    const lesson8 = getLessonById(8);
    assert.ok(lesson8, 'Lesson 8 must exist');

    const femaleProfile = {
      id: 'test-female',
      name: 'Ученица',
      gender: 'female',
      lessonProgress: {},
    };

    await act(async () => {
      root.render(
        React.createElement(LessonEssay, {
          lesson: lesson8,
          userProfile: femaleProfile,
          onCompleted: () => {},
          onUpdateProfile: () => {},
        })
      );
    });

    const getButtons = () => Array.from(container.querySelectorAll('button'));

    // Open cheat sheet
    const cheatSheetBtn = getButtons().find(
      (b) => (b.textContent && b.textContent.includes('шпаргалк')) || (b.textContent && b.textContent.includes('Шпаргалк'))
    );
    assert.ok(cheatSheetBtn, 'Cheat sheet button must be rendered');

    await act(async () => {
      cheatSheetBtn.click();
    });

    const textarea = container.querySelector('textarea');
    assert.ok(textarea, 'Textarea must be rendered');
    assert.equal(textarea.value, '', 'Textarea starts empty');

    // 1. Check distinct buttons for variants of "לוֹמֵד / לוֹמֶדֶת"
    const femaleBtn = getButtons().find((b) => b.textContent === 'לוֹמֶדֶת');
    const maleBtn = getButtons().find((b) => b.textContent === 'לוֹמֵד');
    assert.ok(femaleBtn, 'Female variant button "לוֹמֶדֶת" must exist as a distinct button');
    assert.ok(maleBtn, 'Male variant button "לוֹמֵד" must exist as a distinct button');

    // Click female variant
    await act(async () => {
      femaleBtn.click();
    });
    assert.equal(textarea.value, 'לומדת ', 'Female variant button must insert unpointed "לומדת "');

    // 2. Test cursor positioning and insertion in the middle between words
    // Move cursor to position 0 (before "לומדת ")
    await act(async () => {
      textarea.focus();
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    });

    // Click male variant at pos 0
    await act(async () => {
      maleBtn.focus();
      maleBtn.click();
    });

    assert.equal(
      textarea.value,
      'לומד לומדת ',
      'Inserting male variant at cursor position 0 must prepend before "לומדת "'
    );
    assert.equal(
      textarea.selectionStart,
      5,
      'Cursor position must advance to right after the inserted word'
    );

    // 3. Now cursor is at position 5 (between "לומד " and "לומדת ")
    // Click another word variant: "כּוֹתֵב"
    const kotevBtn = getButtons().find((b) => b.textContent === 'כּוֹתֵב');
    assert.ok(kotevBtn, 'Button for "כּוֹתֵב" must exist');

    await act(async () => {
      kotevBtn.focus();
      kotevBtn.click();
    });

    assert.equal(
      textarea.value,
      'לומד כותב לומדת ',
      'Inserting "כותב " at position 5 must place it cleanly in the middle between words'
    );
    assert.equal(
      textarea.selectionStart,
      10,
      'Cursor position must advance to 10 (right after "לומד כותב ")'
    );
  } finally {
    await env.cleanup();
  }
});

test('Lesson 59: multi-word slash variants and single hints with Russian translation', async () => {
  const env = createTestEnv();
  try {
    const { React, act, root, container, LessonEssay, getLessonById } = env;
    const lesson59 = getLessonById(59);
    assert.ok(lesson59, 'Lesson 59 must exist');

    await act(async () => {
      root.render(
        React.createElement(LessonEssay, {
          lesson: lesson59,
          userProfile: { gender: 'female', lessonProgress: {} },
          onCompleted: () => {},
          onUpdateProfile: () => {},
        })
      );
    });

    const getButtons = () => Array.from(container.querySelectorAll('button'));
    const cheatSheetBtn = getButtons().find(
      (b) => (b.textContent && b.textContent.includes('шпаргалк')) || (b.textContent && b.textContent.includes('Шпаргалк'))
    );
    await act(async () => {
      cheatSheetBtn.click();
    });

    const textarea = container.querySelector('textarea');
    assert.ok(textarea);

    // Multi-word variants: "אַל תִּדְאַג / אַל תִּדְאֲגִי"
    const femaleVariant = getButtons().find((b) => b.textContent === 'אַל תִּדְאֲגִי');
    const maleVariant = getButtons().find((b) => b.textContent === 'אַל תִּדְאַג');
    assert.ok(femaleVariant, 'Button "אַל תִּדְאֲגִי" must exist');
    assert.ok(maleVariant, 'Button "אַל תִּדְאַג" must exist');

    await act(async () => {
      femaleVariant.click();
    });
    assert.equal(textarea.value, 'אל תדאגי ');

    // Single hint without slash: "תַּמְתִּין רֶגַע"
    const singleBtn = getButtons().find((b) => b.textContent && b.textContent.includes('תַּמְתִּין רֶגַע'));
    assert.ok(singleBtn, 'Single button for "תַּמְתִּין רֶגַע" must exist');
    assert.ok(singleBtn.textContent.includes('подождите минутку'), 'Translation must be displayed in single button');

    await act(async () => {
      singleBtn.click();
    });
    assert.equal(textarea.value, 'אל תדאגי תמתין רגע ');
  } finally {
    await env.cleanup();
  }
});

test('Lesson 82: long single hint button allows insertion into textarea', async () => {
  const env = createTestEnv();
  try {
    const { React, act, root, container, LessonEssay, getLessonById } = env;
    const lesson82 = getLessonById(82);
    assert.ok(lesson82, 'Lesson 82 must exist');

    await act(async () => {
      root.render(
        React.createElement(LessonEssay, {
          lesson: lesson82,
          userProfile: { gender: 'male', lessonProgress: {} },
          onCompleted: () => {},
          onUpdateProfile: () => {},
        })
      );
    });

    const getButtons = () => Array.from(container.querySelectorAll('button'));
    const cheatSheetBtn = getButtons().find(
      (b) => (b.textContent && b.textContent.includes('шпаргалк')) || (b.textContent && b.textContent.includes('Шпаргалк'))
    );
    await act(async () => {
      cheatSheetBtn.click();
    });

    const textarea = container.querySelector('textarea');
    assert.ok(textarea);

    const longBtn = getButtons().find((b) => b.textContent && b.textContent.includes('לְתִפְאֶרֶת מְדִינַת יִשְׂרָאֵל!'));
    assert.ok(longBtn, 'Long hint button must exist');

    await act(async () => {
      longBtn.click();
    });
    assert.equal(textarea.value, 'לתפארת מדינת ישראל! ');
  } finally {
    await env.cleanup();
  }
});

test('Identical unpointed forms (רוֹצֶה / רוֹצָה in Lesson 2): both pointed buttons exist, inserting unpointed רוצה', async () => {
  const env = createTestEnv();
  try {
    const { React, act, root, container, LessonEssay, getLessonById } = env;
    const lesson2 = getLessonById(2);

    await act(async () => {
      root.render(
        React.createElement(LessonEssay, {
          lesson: lesson2,
          userProfile: { gender: 'female', lessonProgress: {} },
          onCompleted: () => {},
          onUpdateProfile: () => {},
        })
      );
    });

    const getButtons = () => Array.from(container.querySelectorAll('button'));
    const cheatSheetBtn = getButtons().find(
      (b) => (b.textContent && b.textContent.includes('шпаргалк')) || (b.textContent && b.textContent.includes('Шпаргалк'))
    );
    await act(async () => {
      cheatSheetBtn.click();
    });

    const textarea = container.querySelector('textarea');
    assert.ok(textarea);

    const maleRotze = getButtons().find((b) => b.textContent === 'רוֹצֶה');
    const femaleRotza = getButtons().find((b) => b.textContent === 'רוֹצָה');

    assert.ok(maleRotze, 'Pointed masculine button "רוֹצֶה" must exist');
    assert.ok(femaleRotza, 'Pointed feminine button "רוֹצָה" must exist');

    await act(async () => {
      femaleRotza.click();
    });
    // Unpointed forms are identical: both are "רוצה"
    assert.equal(textarea.value, 'רוצה ');

    await act(async () => {
      maleRotze.click();
    });
    assert.equal(textarea.value, 'רוצה רוצה ');
  } finally {
    await env.cleanup();
  }
});
