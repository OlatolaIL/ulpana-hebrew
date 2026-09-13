'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ChevronLeft,
  Volume2,
  RotateCcw,
  Undo2,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, Exercise } from '@/types';
import { markLessonTabCompleted } from '@/lib/storage';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { areWordsEqual } from '@/lib/sentenceParser';
import { getExerciseSentence } from '@/lib/exerciseSentence';
import {
  ExerciseResultsMap,
  recordExerciseResult,
  calculateExerciseSummary,
  findFirstIncompleteIndex,
} from '@/lib/exerciseResults';

export function getExerciseQuestionDisplay(
  exercise: Exercise,
  isAnswered: boolean
): string {
  if (exercise.type === 'listening' && !isAnswered) {
    return 'Послушайте аудиозапись и выберите верный перевод:';
  }
  return exercise.question;
}

interface LessonExercisesProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const LessonExercises: React.FC<LessonExercisesProps> = ({
  lesson,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  const exercises = useMemo(() => lesson.exercises || [], [lesson.exercises]);

  const [prevLessonId, setPrevLessonId] = useState(lesson.id);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSentenceIndices, setSelectedSentenceIndices] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [resultsMap, setResultsMap] = useState<ExerciseResultsMap>({});

  const topRef = useRef<HTMLDivElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasMarkedCompletedRef = useRef<number | null>(null);

  // Сброс состояния при смене lesson.id непосредственно во время рендера (без эффекта и каскадных перерендеров)
  if (prevLessonId !== lesson.id) {
    setPrevLessonId(lesson.id);
    setCurrentIdx(0);
    setIsFinished(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedSentenceIndices([]);
    setIsCorrect(false);
    setResultsMap({});
  }

  const resetCurrentAnswerState = useCallback(() => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedSentenceIndices([]);
    setIsCorrect(false);
  }, []);

  const currentEx: Exercise | undefined = exercises[currentIdx];

  // Расчёт сводной статистики по заданиям
  const stats = useMemo(() => {
    return calculateExerciseSummary(exercises, resultsMap);
  }, [exercises, resultsMap]);

  // Зачёт этапа ТОЛЬКО при 100% правильных ответах на все задания текущего урока
  useEffect(() => {
    if (
      isFinished &&
      stats.isAllCorrect &&
      !stats.isEmpty &&
      hasMarkedCompletedRef.current !== lesson.id
    ) {
      hasMarkedCompletedRef.current = lesson.id;
      const updated = markLessonTabCompleted(lesson.id, 'exercises');
      if (onUpdateProfile) onUpdateProfile(updated);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [isFinished, stats.isAllCorrect, stats.isEmpty, lesson.id, onUpdateProfile]);

  // Плавный скролл к кнопке «Следующий вопрос» после ответа
  useEffect(() => {
    if (isAnswered && nextButtonRef.current) {
      const timer = setTimeout(() => {
        nextButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAnswered]);

  // При смене вопроса возвращаем скролл наверх к началу карточки
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [currentIdx]);

  const getOptionDisplay = (opt: string): string => {
    const isHeb = /[\u0590-\u05FF]/.test(opt);
    return isHeb && !userProfile.showNikkud ? stripNikkud(opt) : opt;
  };

  // Переход к конкретному номеру с подгрузкой ранее сохранённого ответа (если был)
  const goToIndex = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    const targetEx = exercises[targetIdx];
    const saved = targetEx ? resultsMap[targetEx.id] : undefined;

    if (saved && (saved.status === 'correct' || saved.status === 'incorrect')) {
      setIsAnswered(true);
      setIsCorrect(saved.status === 'correct');
      setSelectedOption(saved.selectedOption ?? null);
      setSelectedSentenceIndices(saved.selectedSentenceIndices ?? []);
    } else {
      resetCurrentAnswerState();
    }

    setCurrentIdx(targetIdx);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentEx) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentEx.correctAnswer;
    setIsCorrect(correct);

    // Сохраняем по id упражнения, пересчитываем без накопления
    setResultsMap((prev) =>
      recordExerciseResult(prev, currentEx.id, correct ? 'correct' : 'incorrect', {
        selectedOption: opt,
      })
    );

    if (correct) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Вычисляем структуру предложения для режима build_sentence
  const sentenceStructure = useMemo(() => currentEx ? getExerciseSentence(currentEx) : null, [currentEx]);

  const handleSentenceWordClick = (poolIndex: number) => {
    if (isAnswered || !sentenceStructure || !currentEx) return;
    const { cleanOptions, targetWords } = sentenceStructure;
    const nextIndices = [...selectedSentenceIndices, poolIndex];
    setSelectedSentenceIndices(nextIndices);

    if (nextIndices.length === targetWords.length) {
      setIsAnswered(true);
      const nextWords = nextIndices.map((idx) => cleanOptions[idx]);

      const correct =
        nextWords.length === targetWords.length &&
        nextWords.every((w, idx) => areWordsEqual(w, targetWords[idx], false));

      setIsCorrect(correct);
      setResultsMap((prev) =>
        recordExerciseResult(prev, currentEx.id, correct ? 'correct' : 'incorrect', {
          selectedSentenceIndices: nextIndices,
        })
      );

      if (correct) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleUnselectSentenceWord = (sentencePosition: number) => {
    if (isAnswered) return;
    setSelectedSentenceIndices((prev) => prev.filter((_, i) => i !== sentencePosition));
  };

  const handleRemoveLastWord = () => {
    if (isAnswered || selectedSentenceIndices.length === 0) return;
    setSelectedSentenceIndices((prev) => prev.slice(0, -1));
  };

  const handleResetSentence = () => {
    if (isAnswered) return;
    setSelectedSentenceIndices([]);
  };

  // Повторить текущее задание (разрешает исправить ошибку)
  const handleRetryCurrent = () => {
    resetCurrentAnswerState();
  };

  const handleNext = () => {
    if (currentIdx + 1 < exercises.length) {
      goToIndex(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      goToIndex(currentIdx - 1);
    }
  };

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < exercises.length && idx !== currentIdx) {
      goToIndex(idx);
    }
  };

  // Пропуск текущего задания: записывает статус 'skipped' по id упражнения
  const handleSkip = () => {
    if (!currentEx) return;
    if (!isAnswered) {
      setResultsMap((prev) =>
        recordExerciseResult(prev, currentEx.id, 'skipped')
      );
    }

    if (currentIdx + 1 < exercises.length) {
      goToIndex(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  // 1. Пустой список заданий: не показывает бесконечную доработку
  if (exercises.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {`Урок ${lesson.number}: ${lesson.titleRussian}`}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            В этом уроке пока нет интерактивных упражнений.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Вы можете сразу перейти к написанию сочинения или диалогу с ИИ.
          </p>
        </div>
        {onCompleted && (
          <button
            type="button"
            onClick={onCompleted}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Перейти к сочинению (этап 4/6) ✍️</span>
          </button>
        )}
      </div>
    );
  }

  // 2. ЭКРАН РЕЗУЛЬТАТОВ (финальный зачёт или доработка)
  if (!currentEx || isFinished) {
    if (stats.isAllCorrect) {
      return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-hebrew">
              !מְצוּיָן
            </h2>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {`Все упражнения урока ${lesson.number} успешно выполнены!`}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {`Верно решено ${stats.correctCount} из ${stats.total} заданий (100%). Этап 3 из 6 завершен. Переходите к написанию сочинения!`}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {onCompleted && (
              <button
                onClick={onCompleted}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Перейти к сочинению (этап 4/6) ✍️</span>
              </button>
            )}

            <button
              onClick={() => {
                setCurrentIdx(0);
                setIsFinished(false);
                setResultsMap({});
                hasMarkedCompletedRef.current = null;
                resetCurrentAnswerState();
              }}
              className="w-full py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
            >
              Пройти упражнения еще раз
            </button>
          </div>
        </div>
      );
    }

    const incompleteCount = stats.incorrectCount + stats.skippedCount + stats.unansweredCount;

    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
          <RotateCcw className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
            Требуется доработка
          </h2>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            Чтобы засчитать этап, необходимо правильно ответить на все задания урока.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {`Урок ${lesson.number}: верно решено ${stats.correctCount} из ${stats.total} (${stats.scorePercent}%).`}
          </p>
        </div>

        {/* Честная сводка результатов */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Верно</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.correctCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">Ошибки</div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {stats.incorrectCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Пропущено</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.skippedCount + stats.unansweredCount}
            </div>
          </div>
        </div>

        {/* Список заданий с возможностью быстрого перехода */}
        <div className="space-y-1.5 text-left max-h-56 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
            Задания урока:
          </div>
          {exercises.map((ex, idx) => {
            const res = resultsMap[ex.id];
            const status = res?.status;
            let badge = { text: 'Не решено', bg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' };
            if (status === 'correct') {
              badge = { text: 'Верно ✓', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' };
            } else if (status === 'incorrect') {
              badge = { text: 'Ошибка ✕', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' };
            } else if (status === 'skipped') {
              badge = { text: 'Пропущено ⏩', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
            }

            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setIsFinished(false);
                  goToIndex(idx);
                  if (status !== 'correct') {
                    resetCurrentAnswerState();
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center justify-between text-xs transition cursor-pointer gap-2"
                title={`Перейти к заданию ${idx + 1}`}
              >
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {`${idx + 1}. ${ex.question}`}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${badge.bg}`}>
                  {badge.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Действия по доработке */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              const targetIdx = findFirstIncompleteIndex(exercises, resultsMap);
              setIsFinished(false);
              goToIndex(targetIdx);
              resetCurrentAnswerState();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{`Доработать задания (${incompleteCount}) 🔄`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setResultsMap({});
              setCurrentIdx(0);
              setIsFinished(false);
              hasMarkedCompletedRef.current = null;
              resetCurrentAnswerState();
            }}
            className="w-full py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
          >
            Начать заново (сбросить все ответы)
          </button>
        </div>
      </div>
    );
  }

  const isCursive = userProfile.fontStyle === 'cursive';

  const getExerciseHebrewToSpeak = (ex: Exercise): string => {
    if (ex.hebrewSnippet && /[\u0590-\u05FF]/.test(ex.hebrewSnippet)) {
      return ex.hebrewSnippet;
    }
    if (ex.correctAnswer && typeof ex.correctAnswer === 'string' && /[\u0590-\u05FF]/.test(ex.correctAnswer)) {
      return ex.correctAnswer;
    }
    const quoteMatch = ex.question?.match(/«([^»]+)»/);
    if (quoteMatch && /[\u0590-\u05FF]/.test(quoteMatch[1])) {
      return quoteMatch[1];
    }
    const expQuoteMatch = ex.explanation?.match(/«([^»]+)»/);
    if (expQuoteMatch && /[\u0590-\u05FF]/.test(expQuoteMatch[1])) {
      return expQuoteMatch[1];
    }
    const anyHeb = ex.question?.match(/[\u0590-\u05FF\s,!?.-]{2,}/);
    if (anyHeb && anyHeb[0].trim().length > 1) {
      return anyHeb[0].trim();
    }
    return '';
  };

  const renderFormattedQuestion = (questionText: string, cursive: boolean) => {
    const parts = questionText.split(/(«[^»]+»)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('«') && part.endsWith('»')) {
        const inner = part.slice(1, -1);
        const isHeb = /[\u0590-\u05FF]/.test(inner);
        if (isHeb) {
          return (
            <span key={idx} className="inline-flex items-center mx-1 align-baseline">
              «
              <bdi
                dir="rtl"
                className={`px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold inline-block mx-0.5 ${
                  cursive ? 'font-cursive text-xl' : 'font-hebrew text-base'
                }`}
              >
                {inner}
              </bdi>
              »
            </span>
          );
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const isLastQuestion = currentIdx + 1 >= exercises.length;
  const currentStatus = currentEx ? resultsMap[currentEx.id]?.status : undefined;

  return (
    <div
      ref={topRef}
      data-font-style={userProfile.fontStyle || 'print'}
      className="max-w-xl mx-auto space-y-3 sm:space-y-4"
    >
      {/* Верхний блок навигации по вопросам */}
      <div className="bg-white dark:bg-zinc-900 p-2 sm:p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Кнопка «Назад» */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 shrink-0 cursor-pointer"
            title="Предыдущий вопрос"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Назад</span>
          </button>

          {/* Индикаторы номеров вопросов со статусом */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-1 scrollbar-none max-w-full justify-center">
            {exercises.map((_, idx) => {
              const ex = exercises[idx];
              const isCurrent = idx === currentIdx;
              const status = resultsMap[ex.id]?.status;

              let badgeClass =
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700';

              if (status === 'correct') {
                badgeClass =
                  'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80';
              } else if (status === 'incorrect') {
                badgeClass =
                  'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80';
              } else if (status === 'skipped') {
                badgeClass =
                  'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80';
              }

              if (isCurrent) {
                badgeClass += ' ring-2 ring-blue-500/50 scale-105';
                if (!status) {
                  badgeClass =
                    'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 scale-105';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleJumpTo(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition shrink-0 cursor-pointer ${badgeClass}`}
                  title={`Вопрос ${idx + 1}${status ? ` (${status})` : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* ВЕРХНЯЯ КНОПКА: ДАЛЕЕ / ЗАВЕРШИТЬ / ПРОПУСТИТЬ */}
          <button
            type="button"
            onClick={isAnswered ? handleNext : handleSkip}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
              isAnswered
                ? isLastQuestion
                  ? stats.isAllCorrect
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
            title={
              isAnswered
                ? isLastQuestion
                  ? 'Завершить тесты'
                  : 'Следующий вопрос'
                : 'Пропустить вопрос и перейти к следующему'
            }
          >
            <span>
              {isAnswered
                ? isLastQuestion
                  ? stats.isAllCorrect
                    ? 'Завершить 🎉'
                    : 'Итоги 📊'
                  : 'Далее ➡️'
                : 'Пропустить ⏩'}
            </span>
          </button>
        </div>

        {/* Тонкий прогресс-бар */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIdx + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Карточка вопроса */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3.5 sm:space-y-4">
        {/* Баннер, если вопрос ранее был пропущен */}
        {currentStatus === 'skipped' && !isAnswered && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/60 animate-in fade-in">
            <span>⏩ Задание было пропущено. Выберите верный ответ:</span>
          </div>
        )}

        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
          {renderFormattedQuestion(getExerciseQuestionDisplay(currentEx, isAnswered), isCursive)}
        </h3>

        {/* Для типа listening: кнопка прослушивания аудио */}
        {currentEx.type === 'listening' && (
          <div className="flex flex-col items-center justify-center py-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const textToSpeak =
                  currentEx.hebrewSnippet ||
                  (currentEx.correctAnswer &&
                  typeof currentEx.correctAnswer === 'string' &&
                  /[\u0590-\u05FF]/.test(currentEx.correctAnswer)
                    ? currentEx.correctAnswer
                    : '');
                if (textToSpeak) speakHebrew(textToSpeak);
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition shadow-sm cursor-pointer active:scale-95 text-xs sm:text-sm"
            >
              <Volume2 className="w-5 h-5" />
              <span>🔊 Нажмите, чтобы прослушать аудио</span>
            </button>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center font-hebrew">
              💡 Не слышно? Проверьте громкость и Silent Switch (беззвучный режим) на телефоне
            </p>
          </div>
        )}

        {/* Варианты выбора: кнопка ответа и кнопка озвучки оформлены как СОСЕДНИЕ элементы (без недопустимой вложенности button в button) */}
        {(currentEx.type === 'word_match' || currentEx.type === 'fill_blank' || currentEx.type === 'listening') &&
          currentEx.options && (
            <div className="grid grid-cols-1 gap-2">
              {currentEx.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt === currentEx.correctAnswer;
                const displayOpt = getOptionDisplay(opt);
                const isDisplayHebrew = /[\u0590-\u05FF]/.test(displayOpt);

                let btnClass =
                  'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200';

                if (isAnswered) {
                  if (isCorrectOpt) {
                    btnClass =
                      'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnClass =
                      'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
                  }
                }

                return (
                  <div key={i} className="flex items-center gap-2">
                    {/* Кнопка выбора варианта ответа */}
                    <button
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`flex-1 py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${btnClass}`}
                    >
                      <span
                        dir={isDisplayHebrew ? 'rtl' : 'ltr'}
                        className={
                          isDisplayHebrew
                            ? isCursive
                              ? 'font-cursive text-2xl md:text-3xl font-bold'
                              : 'font-hebrew text-lg font-bold'
                            : 'text-xs sm:text-sm font-medium'
                        }
                      >
                        {displayOpt}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isAnswered && isCorrectOpt && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrectOpt && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Соседняя отдельная кнопка прослушивания произношения */}
                    {isDisplayHebrew && (
                      <button
                        type="button"
                        onClick={() => {
                          const toSpeak = opt && /[\u0590-\u05FF]/.test(opt) ? opt : displayOpt;
                          speakHebrew(toSpeak);
                        }}
                        className="p-2.5 sm:p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition shrink-0 cursor-pointer active:scale-95"
                        title="Прослушать произношение"
                        aria-label={`Прослушать ${displayOpt}`}
                      >
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        {/* Режим сборки предложения из слов (build_sentence) */}
        {currentEx.type === 'build_sentence' && sentenceStructure && (
          <div className="space-y-3.5 sm:space-y-4">
            {/* Поле сборки предложения */}
            <div
              dir="rtl"
              className={`w-full min-h-[64px] p-3.5 sm:p-4 rounded-2xl border-2 border-dashed ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-blue-400 dark:border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20'
              } flex flex-wrap gap-2 items-center leading-relaxed transition-colors duration-200`}
            >
              {sentenceStructure.parsed.tokens.map((token, tIdx) => {
                if (token.type === 'punct') {
                  return (
                    <span
                      key={`punct-${tIdx}`}
                      className="text-zinc-700 dark:text-zinc-300 font-bold text-lg sm:text-xl px-0.5 select-none font-hebrew"
                    >
                      {token.text}
                    </span>
                  );
                }

                const slotIdx = token.slotIndex ?? 0;
                const poolIdx = selectedSentenceIndices[slotIdx];
                const isFilled = poolIdx !== undefined;

                if (isFilled) {
                  const wordText = sentenceStructure.cleanOptions[poolIdx] || '';
                  return (
                    <button
                      key={`slot-${slotIdx}-${poolIdx}`}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleUnselectSentenceWord(slotIdx)}
                      className={`px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-xl shadow-xs border transition cursor-pointer active:scale-95 font-bold ${
                        isCursive
                          ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                          : 'font-hebrew text-base sm:text-lg text-zinc-900 dark:text-zinc-50'
                      } ${
                        isAnswered
                          ? isCorrect
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                      title="Нажмите, чтобы убрать слово"
                    >
                      {userProfile.showNikkud ? wordText : stripNikkud(wordText)}
                    </button>
                  );
                }

                return (
                  <span
                    key={`empty-${slotIdx}`}
                    className="inline-flex items-center justify-center min-w-[48px] h-9 px-3 py-1 rounded-xl border-2 border-dashed border-blue-300/80 dark:border-blue-700/60 bg-blue-100/30 dark:bg-blue-950/30 text-blue-400/60 dark:text-blue-500/50 select-none text-xs font-mono"
                    title="Место для слова"
                  >
                    ···
                  </span>
                );
              })}
            </div>

            {/* Панель вспомогательных действий */}
            {selectedSentenceIndices.length > 0 && !isAnswered && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-zinc-400 font-medium">
                  {`Выбрано: ${selectedSentenceIndices.length} из ${sentenceStructure.targetWords.length}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveLastWord}
                    className="px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs transition active:scale-95 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                    title="Стереть последнее выбранное слово"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Назад</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSentence}
                    className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-xs transition active:scale-95 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                    title="Очистить всю фразу"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сброс</span>
                  </button>
                </div>
              </div>
            )}

            {/* Кнопка озвучки после ответа */}
            {isAnswered && sentenceStructure.fullSentence && (
              <div className="flex items-center justify-end px-1">
                <button
                  type="button"
                  onClick={() => speakHebrew(sentenceStructure.fullSentence)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900 shadow-xs transition active:scale-95 cursor-pointer text-xs flex items-center gap-1.5"
                  title="Прослушать полное предложение"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 Прослушать фразу целиком</span>
                </button>
              </div>
            )}

            {/* Банк чистых слов */}
            <div dir="rtl" className="flex flex-wrap gap-2 justify-center pt-1">
              {sentenceStructure.cleanOptions.map((w, i) => {
                const isUsed = selectedSentenceIndices.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isUsed || isAnswered}
                    onClick={() => handleSentenceWordClick(i)}
                    className={`px-4 py-2 rounded-xl font-bold border transition cursor-pointer ${
                      isCursive ? 'font-cursive text-2xl md:text-3xl' : 'font-hebrew text-base sm:text-lg'
                    } ${
                      isUsed
                        ? 'opacity-20 border-transparent bg-zinc-100 dark:bg-zinc-800 pointer-events-none scale-95'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 hover:shadow-xs text-zinc-900 dark:text-zinc-50 active:scale-95'
                    }`}
                  >
                    {userProfile.showNikkud ? w : stripNikkud(w)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Пояснение после ответа с кнопкой «Попробовать снова» при ошибке */}
        {isAnswered && currentEx.explanation && (
          <div
            className={`p-3 sm:p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <p className="font-bold font-hebrew">
                  {isCorrect
                    ? 'Верно! Отличный ответ.'
                    : 'Почти получилось! Обратите внимание:'}
                </p>
                <p>{currentEx.explanation}</p>
                {!isCorrect && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleRetryCurrent}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-bold text-xs hover:bg-amber-200 dark:hover:bg-amber-900/70 transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Попробовать ещё раз</span>
                    </button>
                  </div>
                )}
              </div>
              {currentEx.type !== 'build_sentence' &&
                currentEx.type !== 'listening' &&
                Boolean(getExerciseHebrewToSpeak(currentEx)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const textToSpeak = getExerciseHebrewToSpeak(currentEx);
                      if (textToSpeak) speakHebrew(textToSpeak);
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                    title="Прослушать"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>
        )}

        {/* Нижняя кнопка перехода (после ответа на вопрос) */}
        {isAnswered && (
          <div className="pt-1">
            <button
              ref={nextButtonRef}
              onClick={handleNext}
              className={`w-full py-3 sm:py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95 ${
                isLastQuestion
                  ? stats.isAllCorrect
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>
                {isLastQuestion
                  ? stats.isAllCorrect
                    ? 'Завершить упражнения 🎉'
                    : 'Проверить итоги 📊'
                  : `Следующий вопрос (${currentIdx + 2}/${exercises.length})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
