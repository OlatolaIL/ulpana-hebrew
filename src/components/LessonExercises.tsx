'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, Exercise } from '@/types';
import { markLessonTabCompleted } from '@/lib/storage';

interface LessonExercisesProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted?: () => void;
}

export const LessonExercises: React.FC<LessonExercisesProps> = ({
  lesson,
  userProfile,
  onCompleted,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSentenceWords, setSelectedSentenceWords] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const exercises = lesson.exercises;
  const currentEx = exercises[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentEx.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleSentenceWordClick = (word: string, index: number) => {
    if (isAnswered) return;
    const next = [...selectedSentenceWords, word];
    setSelectedSentenceWords(next);

    const targetArr = currentEx.correctAnswer as string[];
    if (next.length === targetArr.length) {
      setIsAnswered(true);
      const correct = JSON.stringify(next) === JSON.stringify(targetArr);
      setIsCorrect(correct);
      if (correct) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedSentenceWords([]);

    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      markLessonTabCompleted(lesson.id, 'exercises');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      if (onCompleted) onCompleted();
    }
  };

  if (!currentEx || isFinished) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
          <Award className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !מְצוּיָן
          </h2>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Все упражнения урока {lesson.number} успешно выполнены!
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentIdx(0);
            setIsFinished(false);
          }}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
        >
          Пройти упражнения еще раз
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
        <span>Упражнение {currentIdx + 1} из {exercises.length}</span>
        <span>Тема: {lesson.titleRussian}</span>
      </div>

      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {currentEx.question}
        </h3>

        {(currentEx.type === 'word_match' || currentEx.type === 'fill_blank') &&
          currentEx.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentEx.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt === currentEx.correctAnswer;

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
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border text-sm font-medium text-left flex items-center justify-between transition ${btnClass}`}
                  >
                    <span dir={/[\u0590-\u05FF]/.test(opt) ? 'rtl' : 'ltr'}>{opt}</span>
                    {isAnswered && isCorrectOpt && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrectOpt && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        {currentEx.type === 'build_sentence' && currentEx.options && (
          <div className="space-y-4">
            <div
              dir="rtl"
              className="min-h-[56px] p-3 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 flex flex-wrap gap-2 items-center font-hebrew text-lg font-bold"
            >
              {selectedSentenceWords.map((w, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700"
                >
                  {w}
                </span>
              ))}
            </div>

            <div dir="rtl" className="flex flex-wrap gap-2 justify-center">
              {currentEx.options.map((w, i) => {
                const isUsed = selectedSentenceWords.includes(w);
                return (
                  <button
                    key={i}
                    disabled={isUsed || isAnswered}
                    onClick={() => handleSentenceWordClick(w, i)}
                    className={`px-4 py-2 rounded-xl text-base font-bold font-hebrew border transition ${
                      isUsed
                        ? 'opacity-30 border-transparent bg-zinc-100 dark:bg-zinc-800'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 shadow-sm'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isAnswered && currentEx.explanation && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
            }`}
          >
            <p className="font-bold mb-1">
              {isCorrect ? 'Верно! Отличный ответ.' : 'Почти получилось! Обратите внимание:'}
            </p>
            <p>{currentEx.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            <span>{currentIdx + 1 < exercises.length ? 'Следующий вопрос' : 'Завершить упражнения'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
