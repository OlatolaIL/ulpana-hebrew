import * as fs from 'fs';
import * as path from 'path';
import { ALEF_LESSONS_01_10 } from '../src/data/lessons/alef_01_10';
import { ALEF_LESSONS_11_25 } from '../src/data/lessons/alef_11_25';
import { ALEF_LESSONS_26_35 } from '../src/data/lessons/alef_26_35';
import { ALEF_LESSONS_36_50 } from '../src/data/lessons/alef_36_50';
import { BET_LESSONS_51_65 } from '../src/data/lessons/bet_51_65';
import { BET_LESSONS_66_80 } from '../src/data/lessons/bet_66_80';
import { BET_LESSONS_81_90 } from '../src/data/lessons/bet_81_90';
import { BET_LESSONS_91_100 } from '../src/data/lessons/bet_91_100';
import { Lesson, Exercise, Word, Sentence } from '../src/types';

const allLessons: Record<number, Lesson> = {
  ...ALEF_LESSONS_01_10,
  ...ALEF_LESSONS_11_25,
  ...ALEF_LESSONS_26_35,
  ...ALEF_LESSONS_36_50,
  ...BET_LESSONS_51_65,
  ...BET_LESSONS_66_80,
  ...BET_LESSONS_81_90,
  ...BET_LESSONS_91_100,
};

// Сбор общего пула слов по уровням для дистракторов
const wordsByLevel: Record<'alef' | 'bet', Word[]> = {
  alef: [],
  bet: [],
};

Object.values(allLessons).forEach((lesson) => {
  if (lesson.vocabulary) {
    wordsByLevel[lesson.level].push(...lesson.vocabulary);
  }
});

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDistractorTranslations(correctTranslation: string, level: 'alef' | 'bet', lessonWords: Word[], count = 3): string[] {
  const pool = [...lessonWords, ...wordsByLevel[level]];
  const distractors = new Set<string>();
  for (const w of pool) {
    if (w.translation && w.translation !== correctTranslation && !distractors.has(w.translation)) {
      distractors.add(w.translation);
      if (distractors.size >= count) break;
    }
  }
  return Array.from(distractors);
}

function getDistractorHebrew(correctHebrew: string, level: 'alef' | 'bet', lessonWords: Word[], count = 3): string[] {
  const pool = [...lessonWords, ...wordsByLevel[level]];
  const distractors = new Set<string>();
  for (const w of pool) {
    if (w.hebrew && w.hebrew !== correctHebrew && !distractors.has(w.hebrew)) {
      distractors.add(w.hebrew);
      if (distractors.size >= count) break;
    }
  }
  return Array.from(distractors);
}

function generateLessonExercises(lesson: Lesson): Exercise[] {
  const exercises: Exercise[] = [];
  const vocab = lesson.vocabulary || [];
  const sentences = lesson.basicSentences || [];

  // 1. Упражнение 1: Перевод с иврита на русский первого ключевого слова (word_match)
  if (vocab[0]) {
    const w = vocab[0];
    const distractors = getDistractorTranslations(w.translation, lesson.level, vocab, 3);
    const options = shuffle([w.translation, ...distractors]);
    exercises.push({
      id: `ex${lesson.id}-1`,
      type: 'word_match',
      question: `Выберите правильный перевод для слова «${w.hebrew}»:`,
      options,
      correctAnswer: w.translation,
      explanation: `Слово «${w.hebrew}» (${w.transcription}) переводится как «${w.translation}».`,
    });
  }

  // 2. Упражнение 2: Обратный перевод с русского на иврит второго ключевого слова (word_match)
  if (vocab[1]) {
    const w = vocab[1];
    const distractors = getDistractorHebrew(w.hebrew, lesson.level, vocab, 3);
    const options = shuffle([w.hebrew, ...distractors]);
    exercises.push({
      id: `ex${lesson.id}-2`,
      type: 'word_match',
      question: `Как переводится «${w.translation}» на иврит?`,
      options,
      correctAnswer: w.hebrew,
      explanation: `«${w.translation}» на иврите будет «${w.hebrew}» (${w.transcription}).`,
    });
  }

  // 3. Упражнение 3: Заполнение пропуска в первом предложении урока (fill_blank)
  if (sentences[0]) {
    const s = sentences[0];
    const tokens = s.hebrew.split(' ').filter(t => t.trim().length > 0);
    let blankIdx = tokens.length > 2 ? 1 : 0;
    if (tokens[blankIdx] && tokens[blankIdx].length <= 2 && tokens.length > 2) blankIdx = 2;
    const targetWord = tokens[blankIdx] || tokens[0];
    const sentenceWithBlank = tokens.map((t, idx) => idx === blankIdx ? '____' : t).join(' ');
    
    const distractors = getDistractorHebrew(targetWord, lesson.level, vocab, 3);
    const options = shuffle([targetWord, ...distractors]);

    exercises.push({
      id: `ex${lesson.id}-3`,
      type: 'fill_blank',
      question: `Вставьте пропущенное слово: «${sentenceWithBlank}» (${s.translation}):`,
      options,
      correctAnswer: targetWord,
      explanation: `Правильная фраза: «${s.hebrew}» (${s.transcription}) — «${s.translation}».`,
    });
  }

  // 4. Упражнение 4: Сборка первого предложения (build_sentence)
  if (sentences[0]) {
    const s = sentences[0];
    const words = s.hebrew.split(' ').filter(t => t.trim().length > 0);
    let shuffled = shuffle(words);
    while (shuffled.length > 1 && JSON.stringify(shuffled) === JSON.stringify(words)) {
      shuffled = shuffle(words);
    }
    exercises.push({
      id: `ex${lesson.id}-4`,
      type: 'build_sentence',
      question: `Соберите предложение «${s.translation}» на иврите:`,
      options: shuffled,
      correctAnswer: words,
      explanation: `Правильный порядок слов: ${s.hebrew} (${s.transcription}).`,
    });
  }

  // 5. Упражнение 5: Перевод с иврита третьего слова (word_match)
  if (vocab[2]) {
    const w = vocab[2];
    const distractors = getDistractorTranslations(w.translation, lesson.level, vocab, 3);
    const options = shuffle([w.translation, ...distractors]);
    exercises.push({
      id: `ex${lesson.id}-5`,
      type: 'word_match',
      question: `Выберите верный перевод слова «${w.hebrew}»:`,
      options,
      correctAnswer: w.translation,
      explanation: `«${w.hebrew}» (${w.transcription}) означает «${w.translation}».`,
    });
  }

  // 6. Упражнение 6: Обратный перевод четвертого слова (word_match)
  if (vocab[3]) {
    const w = vocab[3];
    const distractors = getDistractorHebrew(w.hebrew, lesson.level, vocab, 3);
    const options = shuffle([w.hebrew, ...distractors]);
    exercises.push({
      id: `ex${lesson.id}-6`,
      type: 'word_match',
      question: `Какое ивритское слово означает «${w.translation}»?`,
      options,
      correctAnswer: w.hebrew,
      explanation: `Слово «${w.hebrew}» (${w.transcription}) переводится как «${w.translation}».`,
    });
  }

  // 7. Упражнение 7: Грамматическое заполнение пропуска (fill_blank) во 2-м предложении
  if (sentences[1] || sentences[0]) {
    const s = sentences[1] || sentences[0];
    const tokens = s.hebrew.split(' ').filter(t => t.trim().length > 0);
    const blankIdx = tokens.length > 1 ? tokens.length - 1 : 0;
    const targetWord = tokens[blankIdx] || tokens[0];
    const sentenceWithBlank = tokens.map((t, idx) => idx === blankIdx ? '____' : t).join(' ');
    const distractors = getDistractorHebrew(targetWord, lesson.level, vocab, 3);
    const options = shuffle([targetWord, ...distractors]);

    exercises.push({
      id: `ex${lesson.id}-7`,
      type: 'fill_blank',
      question: `Заполните пропуск в предложении: «${sentenceWithBlank}» (${s.translation}):`,
      options,
      correctAnswer: targetWord,
      explanation: `Полная фраза: «${s.hebrew}» (${s.transcription}) — ${s.translation}.`,
    });
  }

  // 8. Упражнение 8: Сборка второго предложения (build_sentence)
  if (sentences[1] || sentences[0]) {
    const s = sentences[1] || sentences[0];
    const words = s.hebrew.split(' ').filter(t => t.trim().length > 0);
    let shuffled = shuffle(words);
    while (shuffled.length > 1 && JSON.stringify(shuffled) === JSON.stringify(words)) {
      shuffled = shuffle(words);
    }
    exercises.push({
      id: `ex${lesson.id}-8`,
      type: 'build_sentence',
      question: `Соберите фразу «${s.translation}» из слов:`,
      options: shuffled,
      correctAnswer: words,
      explanation: `Верный вариант: ${s.hebrew} (${s.transcription}).`,
    });
  }

  // 9. Упражнение 9: Аудирование (listening)
  const listenWord = vocab[4] || vocab[0];
  const listenDistractors = getDistractorTranslations(listenWord.translation, lesson.level, vocab, 3);
  exercises.push({
    id: `ex${lesson.id}-9`,
    type: 'listening',
    question: `Послушайте аудиозапись и определите перевод слова «${listenWord.hebrew}»:`,
    hebrewSnippet: listenWord.hebrew,
    transcriptionSnippet: listenWord.transcription,
    options: shuffle([listenWord.translation, ...listenDistractors]),
    correctAnswer: listenWord.translation,
    explanation: `Звучит слово «${listenWord.hebrew}» (${listenWord.transcription}) — «${listenWord.translation}».`,
  });

  // 10. Упражнение 10: Перевод пятого/шестого слова (word_match)
  const w10 = vocab[5] || vocab[2] || vocab[0];
  const distractors10 = getDistractorTranslations(w10.translation, lesson.level, vocab, 3);
  exercises.push({
    id: `ex${lesson.id}-10`,
    type: 'word_match',
    question: `Что означает слово «${w10.hebrew}»?`,
    options: shuffle([w10.translation, ...distractors10]),
    correctAnswer: w10.translation,
    explanation: `«${w10.hebrew}» (${w10.transcription}) переводится как «${w10.translation}».`,
  });

  // 11. Упражнение 11: Заполнение пропуска в 3-м предложении или диалоге (fill_blank)
  const s11 = sentences[2] || sentences[0];
  const tokens11 = s11.hebrew.split(' ').filter(t => t.trim().length > 0);
  const blankIdx11 = Math.min(1, tokens11.length - 1);
  const targetWord11 = tokens11[blankIdx11] || tokens11[0];
  const sentenceWithBlank11 = tokens11.map((t, idx) => idx === blankIdx11 ? '____' : t).join(' ');
  const distractors11 = getDistractorHebrew(targetWord11, lesson.level, vocab, 3);
  exercises.push({
    id: `ex${lesson.id}-11`,
    type: 'fill_blank',
    question: `Вставьте пропущенный элемент: «${sentenceWithBlank11}» (${s11.translation}):`,
    options: shuffle([targetWord11, ...distractors11]),
    correctAnswer: targetWord11,
    explanation: `Корректное предложение: «${s11.hebrew}» (${s11.transcription}) — «${s11.translation}».`,
  });

  // 12. Упражнение 12: Сборка третьего предложения или фразы (build_sentence)
  const s12 = sentences[2] || sentences[1] || sentences[0];
  const words12 = s12.hebrew.split(' ').filter(t => t.trim().length > 0);
  let shuffled12 = shuffle(words12);
  while (shuffled12.length > 1 && JSON.stringify(shuffled12) === JSON.stringify(words12)) {
    shuffled12 = shuffle(words12);
  }
  exercises.push({
    id: `ex${lesson.id}-12`,
    type: 'build_sentence',
    question: `Соберите предложение «${s12.translation}» на иврите:`,
    options: shuffled12,
    correctAnswer: words12,
    explanation: `Правильная сборка предложения: ${s12.hebrew} (${s12.transcription}).`,
  });

  return exercises;
}

// Файлы для обновления
const fileConfigs = [
  { file: 'src/data/lessons/alef_01_10.ts', exportName: 'ALEF_LESSONS_01_10', start: 1, end: 10, title: 'Уровня Алеф (1 - 10)' },
  { file: 'src/data/lessons/alef_11_25.ts', exportName: 'ALEF_LESSONS_11_25', start: 11, end: 25, title: 'Уровня Алеф (11 - 25)' },
  { file: 'src/data/lessons/alef_26_35.ts', exportName: 'ALEF_LESSONS_26_35', start: 26, end: 35, title: 'Уровня Алеф (26 - 35)' },
  { file: 'src/data/lessons/alef_36_50.ts', exportName: 'ALEF_LESSONS_36_50', start: 36, end: 50, title: 'Уровня Алеф (36 - 50)' },
  { file: 'src/data/lessons/bet_51_65.ts', exportName: 'BET_LESSONS_51_65', start: 51, end: 65, title: 'Уровня Бет (51 - 65)' },
  { file: 'src/data/lessons/bet_66_80.ts', exportName: 'BET_LESSONS_66_80', start: 66, end: 80, title: 'Уровня Бет (66 - 80)' },
  { file: 'src/data/lessons/bet_81_90.ts', exportName: 'BET_LESSONS_81_90', start: 81, end: 90, title: 'Уровня Бет (81 - 90)' },
  { file: 'src/data/lessons/bet_91_100.ts', exportName: 'BET_LESSONS_91_100', start: 91, end: 100, title: 'Уровня Бет (91 - 100)' },
];

console.log('🚀 Генерация 12 интерактивных упражнений для всех 100 уроков...');

fileConfigs.forEach(cfg => {
  const filePath = path.join(process.cwd(), cfg.file);
  const lessonsRecord: Record<number, Lesson> = {};

  for (let id = cfg.start; id <= cfg.end; id++) {
    const originalLesson = allLessons[id];
    if (!originalLesson) {
      console.error(`Ошибка: урок ${id} не найден!`);
      continue;
    }
    const newExercises = generateLessonExercises(originalLesson);
    lessonsRecord[id] = {
      ...originalLesson,
      exercises: newExercises,
    };
  }

  // Генерация TypeScript кода
  const content = `import { Lesson } from '@/types';

/**
 * Детальные уроки ${cfg.title}
 * Классическая программа израильского ульпана.
 * Транскрипция с 'h' для ה и знаком ударения ´.
 */
export const ${cfg.exportName}: Record<number, Lesson> = ${JSON.stringify(lessonsRecord, null, 2)};
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Обновлен файл ${cfg.file} (Уроки ${cfg.start}-${cfg.end}): 12 упражнений на урок.`);
});

console.log('🎉 Все 100 уроков успешно оснащены 12 упражнениями!');
