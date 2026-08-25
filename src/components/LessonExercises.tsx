'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  RotateCcw,
  Sparkles,
  SkipForward,
  Bot,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, Exercise } from '@/types';
import { markLessonTabCompleted } from '@/lib/storage';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';

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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSentenceWords, setSelectedSentenceWords] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});

  const exercises = lesson.exercises;
  const currentEx = exercises[currentIdx];

  const resetCurrentAnswerState = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedSentenceWords([]);
    setIsCorrect(false);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentEx.correctAnswer;
    setIsCorrect(correct);
    setAnsweredMap((prev) => ({ ...prev, [currentIdx]: true }));

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
      setAnsweredMap((prev) => ({ ...prev, [currentIdx]: true }));
      if (correct) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleUnselectSentenceWord = (index: number) => {
    if (isAnswered) return;
    setSelectedSentenceWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetSentence = () => {
    if (isAnswered) return;
    setSelectedSentenceWords([]);
  };

  const handleNext = () => {
    resetCurrentAnswerState();

    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      const updated = markLessonTabCompleted(lesson.id, 'exercises');
      if (onUpdateProfile) onUpdateProfile(updated);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      resetCurrentAnswerState();
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < exercises.length && idx !== currentIdx) {
      resetCurrentAnswerState();
      setCurrentIdx(idx);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleCompleteAndGoToChat = () => {
    const updated = markLessonTabCompleted(lesson.id, 'exercises');
    if (onUpdateProfile) onUpdateProfile(updated);
    if (onCompleted) {
      onCompleted();
    }
  };

  if (!currentEx || isFinished) {
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
            Все упражнения урока {lesson.number} успешно выполнены!
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Этап 3 из 5 завершен. Переходите к ролевому диалогу с ИИ!
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {onCompleted && (
            <button
              onClick={onCompleted}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Перейти к ИИ-чату (этап 4/5) ➡️</span>
            </button>
          )}

          <button
            onClick={() => {
              setCurrentIdx(0);
              setIsFinished(false);
              setAnsweredMap({});
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

  const isCursive = userProfile.fontStyle === 'cursive';

  const handleToggleFont = () => {
    const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
    try {
      localStorage.setItem('ulpana_user_profile', JSON.stringify(updated));
    } catch {}
    if (onUpdateProfile) onUpdateProfile(updated);
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

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="max-w-xl mx-auto space-y-4 sm:space-y-5">
      {/* 1. Верхняя панель этапа с прямым переходом к ИИ-чату и переключателем шрифта */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                Этап 3/5: Тесты
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                ({currentIdx + 1} из {exercises.length})
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate hidden xs:block">
              Закрепление темы и грамматики
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Переключатель шрифта */}
          <button
            type="button"
            onClick={handleToggleFont}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Переключить шрифт упражнений: Печатный / Рукописный"
          >
            {isCursive ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>

          {/* Прямой переход к следующему этапу (ИИ-чат) */}
          {onCompleted && (
            <button
              type="button"
              onClick={handleCompleteAndGoToChat}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition shadow-xs flex items-center gap-1 cursor-pointer"
              title="Перейти к этапу 4 (ИИ-чат)"
            >
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">К ИИ-чату</span>
              <span>➡️</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Верхний блок быстрой навигации по вопросам + кнопка перехода */}
      <div className="bg-white dark:bg-zinc-900 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5">
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

          {/* Интерактивные индикаторы номеров вопросов */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-1 scrollbar-none max-w-full justify-center">
            {exercises.map((_, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnsweredItem = Boolean(answeredMap[idx]);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleJumpTo(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 scale-105'
                      : isAnsweredItem
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                  title={`Перейти к вопросу ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* ВЕРХНЯЯ КНОПКА ПЕРЕХОДА / СЛЕДУЮЩИЙ ВОПРОС */}
          <button
            type="button"
            onClick={isAnswered ? handleNext : handleSkip}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
              isAnswered
                ? isLastQuestion
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
            title={isAnswered ? (isLastQuestion ? 'Завершить тесты' : 'Следующий вопрос') : 'Пропустить вопрос и перейти к следующему'}
          >
            <span>
              {isAnswered
                ? isLastQuestion
                  ? 'Завершить 🎉'
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

      {/* 3. Карточка вопроса */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
          {renderFormattedQuestion(currentEx.question, isCursive)}
        </h3>

        {/* Для типа listening: кнопка прослушивания аудио */}
        {currentEx.type === 'listening' && (
          <div className="flex justify-center py-2">
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
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition shadow-sm cursor-pointer active:scale-95 text-xs sm:text-sm"
            >
              <Volume2 className="w-5 h-5" />
              <span>🔊 Нажмите, чтобы прослушать аудио</span>
            </button>
          </div>
        )}

        {/* Варианты выбора (word_match, fill_blank, listening) */}
        {(currentEx.type === 'word_match' || currentEx.type === 'fill_blank' || currentEx.type === 'listening') &&
          currentEx.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentEx.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt === currentEx.correctAnswer;
                const isOptHebrew = /[\u0590-\u05FF]/.test(opt);

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
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${btnClass}`}
                  >
                    <span
                      dir={isOptHebrew ? 'rtl' : 'ltr'}
                      className={
                        isOptHebrew
                          ? isCursive
                            ? 'font-cursive text-2xl md:text-3xl font-bold'
                            : 'font-hebrew text-lg font-bold'
                          : 'text-xs sm:text-sm font-medium'
                      }
                    >
                      {isOptHebrew && !userProfile.showNikkud ? stripNikkud(opt) : opt}
                    </span>
                    <div className="flex items-center gap-2">
                      {isOptHebrew && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakHebrew(opt);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                          title="Прослушать произношение"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                      {isAnswered && isCorrectOpt && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrectOpt && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        {/* Режим сборки предложения из слов (build_sentence) */}
        {currentEx.type === 'build_sentence' && currentEx.options && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div
                dir="rtl"
                className={`flex-1 min-h-[56px] p-3 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 flex flex-wrap gap-2 items-center font-bold ${
                  isCursive ? 'font-cursive text-2xl text-blue-600 dark:text-blue-400' : 'font-hebrew text-lg'
                }`}
              >
                {selectedSentenceWords.length > 0 ? (
                  selectedSentenceWords.map((w, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleUnselectSentenceWord(i)}
                      className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 transition cursor-pointer active:scale-95"
                      title="Нажмите, чтобы убрать слово"
                    >
                      {userProfile.showNikkud ? w : stripNikkud(w)}
                    </button>
                  ))
                ) : (
                  <span className="text-zinc-400 text-xs font-sans font-normal">
                    Нажимайте на слова ниже для составления фразы...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {selectedSentenceWords.length > 0 && !isAnswered && (
                  <button
                    type="button"
                    onClick={handleResetSentence}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition active:scale-95 cursor-pointer"
                    title="Сбросить выбранные слова"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                {selectedSentenceWords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => speakHebrew(selectedSentenceWords.join(' '))}
                    className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
                    title="Прослушать собранное предложение"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div dir="rtl" className="flex flex-wrap gap-2 justify-center">
              {currentEx.options.map((w, i) => {
                const isUsed = selectedSentenceWords.includes(w);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isUsed || isAnswered}
                    onClick={() => handleSentenceWordClick(w, i)}
                    className={`px-4 py-2 rounded-xl font-bold border transition cursor-pointer ${
                      isCursive ? 'font-cursive text-2xl md:text-3xl' : 'font-hebrew text-base'
                    } ${
                      isUsed
                        ? 'opacity-30 border-transparent bg-zinc-100 dark:bg-zinc-800'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 shadow-sm text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    {userProfile.showNikkud ? w : stripNikkud(w)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Пояснение после ответа */}
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

        {/* 4. Нижний блок кнопок перехода */}
        <div className="pt-2 space-y-2">
          {isAnswered ? (
            <button
              onClick={handleNext}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95 ${
                isLastQuestion
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>{isLastQuestion ? 'Завершить упражнения 🎉' : `Следующий вопрос (${currentIdx + 2}/${exercises.length})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Пропустить вопрос</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {onCompleted && (
                <button
                  onClick={handleCompleteAndGoToChat}
                  className="py-3 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200 dark:border-purple-800/80 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-500" />
                  <span>К ИИ-чату (этап 4/5) ➡️</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
