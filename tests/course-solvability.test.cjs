const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { getExerciseSentence } = require('../src/lib/exerciseSentence.ts');
const { areWordsEqual } = require('../src/lib/sentenceParser.ts');

test('all 1200 exercises have unique IDs and a selectable correct answer', () => {
  const problems = [];
  let count = 0;
  assert.equal(Object.keys(DETAILED_LESSONS).length, 100);
  for (const lesson of Object.values(DETAILED_LESSONS)) {
    const ids = new Set();
    for (const exercise of lesson.exercises) {
      count++;
      if (ids.has(exercise.id)) problems.push(`${exercise.id}: duplicate ID`);
      ids.add(exercise.id);
      const sentence = getExerciseSentence(exercise);
      if (sentence) {
        const available = [...sentence.cleanOptions];
        if (!sentence.targetWords.length) problems.push(`${exercise.id}: empty target`);
        for (const word of sentence.targetWords) {
          const index = available.findIndex(option => areWordsEqual(option, word));
          if (index < 0) problems.push(`${exercise.id}: unavailable target word ${word}`);
          else available.splice(index, 1);
        }
      } else if (!exercise.options.includes(exercise.correctAnswer)) {
        problems.push(`${exercise.id}: answer is not an option`);
      }
    }
  }
  assert.equal(count, 1200);
  assert.deepEqual(problems, []);
});

test('explanatory spelling differences cannot override a selectable answer key', () => {
  const sentence = getExerciseSentence({ type: 'build_sentence', correctAnswer: ['הֻלֶּדֶת'], options: ['הֻלֶּדֶת'], explanation: 'Ответ: הוּלֶּדֶת. (пример)' });
  assert.deepEqual(sentence.targetWords, ['הֻלֶּדֶת']);
});
