/**
 * Управление результатами упражнений урока.
 * Хранение по id упражнения, пересчёт без накопления, валидация 100% зачёта.
 */

import { Exercise } from '@/types';

export type ExerciseStatus = 'correct' | 'incorrect' | 'skipped';

export interface ExerciseResultItem {
  exerciseId: string;
  status: ExerciseStatus;
  selectedOption?: string | null;
  selectedSentenceIndices?: number[];
  updatedAt: number;
}

export type ExerciseResultsMap = Record<string, ExerciseResultItem>;

export interface ExerciseSummaryStats {
  total: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  unansweredCount: number;
  isAllCorrect: boolean;
  isEmpty: boolean;
  scorePercent: number;
}

/**
 * Запись или обновление результата упражнения по его id.
 * При повторном ответе заменяет предыдущую запись (пересчёт без накопления).
 */
export function recordExerciseResult(
  prev: ExerciseResultsMap,
  exerciseId: string,
  status: ExerciseStatus,
  details?: {
    selectedOption?: string | null;
    selectedSentenceIndices?: number[];
  }
): ExerciseResultsMap {
  return {
    ...prev,
    [exerciseId]: {
      exerciseId,
      status,
      selectedOption: details?.selectedOption ?? null,
      selectedSentenceIndices: details?.selectedSentenceIndices ?? [],
      updatedAt: Date.now(),
    },
  };
}

/**
 * Расчёт сводной статистики по упражнениям урока.
 * Зачёт этапа (isAllCorrect) возможен ТОЛЬКО когда на ВСЕ задания дан верный ответ.
 * Пустой список заданий возвращает isEmpty: true и isAllCorrect: false.
 */
export function calculateExerciseSummary(
  exercises: Exercise[],
  results: ExerciseResultsMap
): ExerciseSummaryStats {
  const total = exercises.length;
  if (total === 0) {
    return {
      total: 0,
      correctCount: 0,
      incorrectCount: 0,
      skippedCount: 0,
      unansweredCount: 0,
      isAllCorrect: false,
      isEmpty: true,
      scorePercent: 0,
    };
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let unansweredCount = 0;

  for (const ex of exercises) {
    const item = results[ex.id];
    if (!item) {
      unansweredCount += 1;
    } else if (item.status === 'correct') {
      correctCount += 1;
    } else if (item.status === 'incorrect') {
      incorrectCount += 1;
    } else if (item.status === 'skipped') {
      skippedCount += 1;
    }
  }

  const isAllCorrect = total > 0 && correctCount === total;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    total,
    correctCount,
    incorrectCount,
    skippedCount,
    unansweredCount,
    isAllCorrect,
    isEmpty: false,
    scorePercent,
  };
}

/**
 * Поиск индекса первого нерешённого / ошибочного / пропущенного задания.
 */
export function findFirstIncompleteIndex(
  exercises: Exercise[],
  results: ExerciseResultsMap
): number {
  const idx = exercises.findIndex((ex) => results[ex.id]?.status !== 'correct');
  return idx >= 0 ? idx : 0;
}

/**
 * Поиск индекса первого задания с ошибкой.
 */
export function findFirstIncorrectIndex(
  exercises: Exercise[],
  results: ExerciseResultsMap
): number {
  const idx = exercises.findIndex((ex) => results[ex.id]?.status === 'incorrect');
  return idx >= 0 ? idx : findFirstIncompleteIndex(exercises, results);
}

/**
 * Поиск индекса первого пропущенного / неотвеченного задания.
 */
export function findFirstSkippedIndex(
  exercises: Exercise[],
  results: ExerciseResultsMap
): number {
  const idx = exercises.findIndex((ex) => {
    const s = results[ex.id]?.status;
    return s === 'skipped' || !s;
  });
  return idx >= 0 ? idx : findFirstIncompleteIndex(exercises, results);
}
