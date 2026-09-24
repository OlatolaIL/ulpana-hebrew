const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePhoneGoalEvidence } = require('../src/lib/phoneGoalEvidence.ts');
const transcript = [
  { role: 'user', hebrew: 'אני רוצה קפה גדול בלי סוכר.' },
  { role: 'assistant', hebrew: 'הקפה מוכן.' },
  { role: 'user', hebrew: 'תודה, להתראות.' },
];
const evidence = (goalIndex, met, quote = 'אני רוצה קפה גדול', role = 'user') => ({
  goalIndex, met, evidence: quote ? [{ role, quote }] : [],
});

test('every goal needs an explicit assessment; missing data is not success', () => {
  for (const raw of [undefined, null, [], [evidence(0, true)]]) {
    assert.throws(() => validatePhoneGoalEvidence(raw, 2, transcript), /Missing/);
  }
  const unmet = validatePhoneGoalEvidence([evidence(0, false, null)], 1, transcript);
  assert.equal(unmet[0].met, false);
});

test('all met goals require traceable student quotes and preserve each assessment', () => {
  const raw = [evidence(0, true), evidence(1, true, 'בלי סוכר'), evidence(2, true, 'תודה, להתראות')];
  assert.deepEqual(validatePhoneGoalEvidence(raw, 3, transcript), raw);
  assert.doesNotThrow(() => validatePhoneGoalEvidence([evidence(0, true, 'אֲנִי רוֹצֶה קָפֶה גָּדוֹל')], 1, transcript));
});

test('fabricated quotes, absent speakers, and assistant statements attributed to the student fail', () => {
  for (const entry of [
    evidence(0, true, 'אני רוצה תה קטן'),
    evidence(0, true, 'הקפה מוכן', 'user'),
    evidence(0, true, 'אני רוצה קפה גדול', 'assistant'),
    { goalIndex: 0, met: true, evidence: [{ quote: 'אני רוצה קפה גדול' }] },
  ]) {
    assert.throws(() => validatePhoneGoalEvidence([entry], 1, transcript), /Unverifiable/);
  }
});

test('duplicate goal IDs and out-of-range IDs cannot substitute for missing goals', () => {
  assert.throws(() => validatePhoneGoalEvidence([evidence(0, true), evidence(0, true)], 2, transcript), /Invalid/);
  assert.throws(() => validatePhoneGoalEvidence([evidence(2, true)], 1, transcript), /Invalid/);
  assert.throws(() => validatePhoneGoalEvidence([{ ...evidence(0, true), met: 'true' }], 1, transcript), /Invalid/);
});

test('assistant-only or empty evidence cannot award the student a completed goal', () => {
  assert.throws(() => validatePhoneGoalEvidence([evidence(0, true, 'הקפה מוכן', 'assistant')], 1, transcript), /No student/);
  assert.throws(() => validatePhoneGoalEvidence([evidence(0, true, null)], 1, transcript), /No student/);
});

// ── Defect regression tests ──────────────────────────────────────────────────
// These use hardcoded answers (no real model calls). They verify the handler,
// not that the live model improved — that is Etap 2 (live run).

// D01: question + 503 (no assistant reply after student question) → met=false
test('D01: information_retrieval goal with no assistant reply stays met=false', () => {
  const tx = [{ role: 'user', hebrew: 'לאיזה פח זורקים נייר?' }];
  // Model claims met=true but there is no assistant reply in transcript.
  // For information_retrieval the validator silently downgrades to met=false
  // because no assistant evidence could be located in the transcript.
  const result = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: true, evidence: [{ role: 'user', quote: 'לאיזה פח זורקים נייר?' }] }],
    ['Узнать, куда выбрасывать бумагу'],
    tx,
  );
  assert.equal(result[0].met, false, 'D01: unanswered question must be met=false');
  // If model fabricates an assistant quote that doesn't exist → Unverifiable
  assert.throws(
    () => validatePhoneGoalEvidence(
      [{ goalIndex: 0, met: true, evidence: [
        { role: 'user', quote: 'לאיזה פח זורקים נייר?' },
        { role: 'assistant', quote: 'לפח הכחול.' },
      ]}],
      ['Узнать, куда выбрасывать бумагу'],
      tx,
    ),
    /Unverifiable/,
  );
  // met=false is always preserved unchanged
  const r2 = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: false, evidence: [] }],
    ['Узнать, куда выбрасывать бумагу'],
    tx,
  );
  assert.equal(r2[0].met, false);
});

// D04: valid paraphrase is not blocked (student_action goal, no rule)
test('D04: paraphrase of a student_action goal is not rejected by absence of rule', () => {
  const tx = [
    { role: 'user', hebrew: 'אני רוצה לבקש מידע על הדירה.' },
    { role: 'assistant', hebrew: 'כמה חדרים אתה מחפש?' },
  ];
  const result = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: true, evidence: [{ role: 'user', quote: 'אני רוצה לבקש מידע על הדירה.' }] }],
    ['Попросить информацию о квартире'],
    tx,
  );
  // student_action goal: met=true when student performed the action (evidence user present)
  assert.equal(result[0].met, true);
});

// D06/D31: fact-in-greeting for any lesson without informationEvidence (not just lesson 78)
test('D31: information_retrieval goal with fact in greeting (no authored rule) → met=true', () => {
  const factInGreeting = 'שלום! אוטובוס 5 עולה מהתחנה מימין.';
  const tx = [
    { role: 'assistant', hebrew: factInGreeting },
    { role: 'user', hebrew: 'מה מספר האוטובוס?' },
    { role: 'assistant', hebrew: 'בסדר, יום טוב.' },
  ];
  const result = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: true, evidence: [
      { role: 'user', quote: 'מה מספר האוטובוס?' },
      { role: 'assistant', quote: factInGreeting },
    ]}],
    ['Узнать номер автобуса'],
    tx,
  );
  assert.equal(result[0].met, true);
});

// D06: no assistant reply in non-rule lesson → met=false
test('D06: information_retrieval goal with unanswered question (no rule) → met=false', () => {
  const tx = [{ role: 'user', hebrew: 'מה מספר האוטובוס?' }];
  assert.throws(
    () => validatePhoneGoalEvidence(
      [{ goalIndex: 0, met: true, evidence: [
        { role: 'user', quote: 'מה מספר האוטובוס?' },
        { role: 'assistant', quote: 'אוטובוס 5.' },
      ]}],
      ['Узнать номер автобуса'],
      tx,
    ),
    /Unverifiable/,
  );
});

// D12: conditional reply «רק אם העירייה תאשר» must not prove information delivery
test('D12: conditional reply before a fact must not satisfy information_retrieval goal', () => {
  const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
  const contract = getPhoneLessonContract(78);
  const rules = contract.informationEvidence;
  const q = { role: 'user', hebrew: 'לאיזה פח זורקים נייר?' };
  const condAnswer = { role: 'assistant', hebrew: 'רק אם העירייה תאשר, נייר לפח הכחול.' };
  const tx = [q, condAnswer];
  const result = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: true, evidence: [
      { role: 'user', quote: q.hebrew },
      { role: 'assistant', quote: condAnswer.hebrew },
    ]}],
    ['Узнать, куда выбрасывать бумагу'],
    tx,
    { 0: Object.values(rules)[0] },
  );
  // Conditional clause before the fact should not satisfy the pattern
  assert.equal(result[0].met, false, 'Conditional answer must not satisfy an information goal');
});

// D14: «אין בעיה» prefix must not block a valid answer
test('D14: answer starting with «אין בעיה» must not be blocked for information_retrieval', () => {
  const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
  const contract = getPhoneLessonContract(78);
  const rules = contract.informationEvidence;
  const q = { role: 'user', hebrew: 'לאיזה פח זורקים נייר?' };
  // Answer: «אין בעיה.» + valid fact about paper destination in blue bin
  const okAnswer = { role: 'assistant', hebrew: 'אין בעיה. נְיָיר זוֹרְקִים לַפַּח הַכָּחוֹל.' };
  const tx = [q, okAnswer];
  const result = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: true, evidence: [
      { role: 'user', quote: q.hebrew },
      { role: 'assistant', quote: okAnswer.hebrew },
    ]}],
    ['Узнать, куда выбрасывать бумагу'],
    tx,
    { 0: Object.values(rules)[0] },
  );
  assert.equal(result[0].met, true, 'אין בעיה prefix must not block a valid answer (D14 regression)');
});

// D15: «אין» as a full substantive answer (e.g. «אין חדר פנוי») must not block information retrieval
test('D15: «אין חדר פנוי» is a substantive answer, not a pure negation', () => {
  const tx = [
    { role: 'user', hebrew: 'האם יש חדר פנוי?' },
    { role: 'assistant', hebrew: 'אין חדר פנוי הלילה.' },
  ];
  const result = validatePhoneGoalEvidence(
    [{ goalIndex: 0, met: true, evidence: [
      { role: 'user', quote: 'האם יש חדר פנוי?' },
      { role: 'assistant', quote: 'אין חדר פנוי הלילה.' },
    ]}],
    ['Узнать, есть ли свободный номер'],
    tx,
  );
  // Without an authored rule, this is model-assessed; structurally an assistant replied after user question.
  assert.equal(result[0].met, true, 'Substantive אין answer must not be downgraded (D15)');
});

// D16: student_action done → met=true; agreement not completed → met=false
test('D16: student_action met=true independently of agreement goal', () => {
  const tx = [
    { role: 'user', hebrew: 'בבקשה, אפשר לקבל מחיר?' },
    { role: 'assistant', hebrew: 'נדאג לזה.' }, // vague, no agreement
  ];
  const result = validatePhoneGoalEvidence(
    [
      { goalIndex: 0, met: true, evidence: [{ role: 'user', quote: 'בבקשה, אפשר לקבל מחיר?' }] },
      { goalIndex: 1, met: false, evidence: [] },
    ],
    ['Попросить назвать цену', 'Договориться об оплате'],
    tx,
  );
  assert.equal(result[0].met, true, 'student_action goal must be met independently');
  assert.equal(result[1].met, false, 'agreement goal without both-side confirmation must stay false');
});

// D21: partial goal completion preserved correctly
test('D21: partial completion — some met, some unmet — preserved without contamination', () => {
  const tx = [
    { role: 'user', hebrew: 'מה השעות שלכם?' },
    { role: 'assistant', hebrew: 'אנחנו פתוחים מ-9 עד 18.' },
    { role: 'user', hebrew: 'תודה, להתראות.' },
  ];
  const result = validatePhoneGoalEvidence(
    [
      { goalIndex: 0, met: true, evidence: [
        { role: 'user', quote: 'מה השעות שלכם?' },
        { role: 'assistant', quote: 'אנחנו פתוחים מ-9 עד 18.' },
      ]},
      { goalIndex: 1, met: false, evidence: [] },
    ],
    ['Узнать часы работы', 'Попросить о встрече'],
    tx,
  );
  assert.equal(result[0].met, true);
  assert.equal(result[1].met, false);
});
