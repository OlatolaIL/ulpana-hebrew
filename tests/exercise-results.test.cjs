const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateExerciseSummary, recordExerciseResult, findFirstIncompleteIndex } = require('../src/lib/exerciseResults.ts');
const exercises = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];

test('skipping every exercise never awards completion', () => {
  const results = exercises.reduce((r, e) => recordExerciseResult(r, e.id, 'skipped'), {});
  const stats = calculateExerciseSummary(exercises, results);
  assert.equal(stats.isAllCorrect, false);
  assert.equal(stats.scorePercent, 0);
  assert.equal(stats.skippedCount, 3);
});

test('an incorrect answer, a skip and an unanswered exercise each prevent completion', () => {
  const firstTwo = { one: { status: 'correct' }, two: { status: 'correct' } };
  for (const status of ['incorrect', 'skipped', undefined]) {
    const stats = calculateExerciseSummary(exercises, status ? { ...firstTwo, three: { status } } : firstTwo);
    assert.equal(stats.isAllCorrect, false);
    assert.equal(stats.correctCount, 2);
  }
});

test('correcting an answer replaces its result without inflating the score', () => {
  let results = { one: { status: 'correct' }, two: { status: 'skipped' }, three: { status: 'incorrect' } };
  assert.equal(findFirstIncompleteIndex(exercises, results), 1);
  for (let i = 0; i < 5; i++) results = recordExerciseResult(results, 'two', 'correct');
  results = recordExerciseResult(results, 'three', 'correct');
  const stats = calculateExerciseSummary(exercises, results);
  assert.equal(stats.isAllCorrect, true);
  assert.equal(stats.correctCount, 3);
  assert.equal(stats.scorePercent, 100);
});

test('empty lessons and results belonging to another lesson never count as completed', () => {
  assert.equal(calculateExerciseSummary([], {}).isAllCorrect, false);
  assert.equal(calculateExerciseSummary([{ id: 'different' }], { one: { status: 'correct' } }).isAllCorrect, false);
});
