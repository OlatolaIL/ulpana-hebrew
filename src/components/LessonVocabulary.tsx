import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Plus,
  Check,
  Search,
  Layers,
  List,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  RefreshCw,
  ThumbsUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Word, UserProfile, PartOfSpeech } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud, getWordTranscription } from '@/lib/transcription';
import { saveUserProfile, markLessonTabCompleted, updateCardSRS } from '@/lib/storage';
import { getHebrewPictogram } from '@/lib/pictograms';

interface LessonVocabularyProps {
  lessonId?: number;
  words: Word[];
  userProfile: UserProfile;
  onCompleted?: () => void;
  onStartPractice?: (words: Word[]) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const LessonVocabulary: React.FC<LessonVocabularyProps> = ({
  lessonId,
  words,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  // Режим просмотра: 'card' (интерактивные флип-карточки по умолчанию) или 'list' (полный словарь)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWordIds, setKnownWordIds] = useState<Set<string>>(new Set());
  const [reviewWordIds, setReviewWordIds] = useState<Set<string>>(new Set());
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Для режима списка
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [revealedRoots, setRevealedRoots] = useState<Record<string, boolean>>({});
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});

  const isCursive = userProfile.fontStyle === 'cursive';

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleMarkDone = () => {
    if (lessonId) {
      const updated = markLessonTabCompleted(lessonId, 'vocab');
      if (onUpdateProfile) onUpdateProfile(updated);
    }
    if (onCompleted) onCompleted();
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsSessionCompleted(true);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkKnown = () => {
    const word = words[currentIndex];
    if (word) {
      try {
        updateCardSRS(word.id, 5, word.hebrewPlain || word.hebrew);
      } catch {}
      setKnownWordIds((prev) => new Set(prev).add(word.id));
      setReviewWordIds((prev) => {
        const next = new Set(prev);
        next.delete(word.id);
        return next;
      });
    }
    handleNext();
  };

  const handleMarkRepeat = () => {
    const word = words[currentIndex];
    if (word) {
      try {
        updateCardSRS(word.id, 1, word.hebrewPlain || word.hebrew);
      } catch {}
      setReviewWordIds((prev) => new Set(prev).add(word.id));
      setKnownWordIds((prev) => {
        const next = new Set(prev);
        next.delete(word.id);
        return next;
      });
    }
    handleNext();
  };

  const handleRestartCards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsSessionCompleted(false);
    setKnownWordIds(new Set());
    setReviewWordIds(new Set());
  };

  // Горячие клавиши на десктопе:
  // До переворота: Пробел / Enter / Стрелка вправо — перевернуть, Стрелка влево — назад
  // После переворота: Стрелка вправо / D — Знаю, Стрелка влево / A — Повторить, Пробел — скрыть обратно
  useEffect(() => {
    if (viewMode !== 'card' || isSessionCompleted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        if (!isFlipped) {
          setIsFlipped(true);
        } else {
          handleMarkKnown();
        }
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        if (!isFlipped) {
          handlePrev();
        } else {
          handleMarkRepeat();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex, isSessionCompleted, isFlipped, words]);

  const filteredWords = words.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return selectedPos === 'all' || w.partOfSpeech === selectedPos;
    }
    const matchesSearch =
      (w.hebrew || '').toLowerCase().includes(q) ||
      (w.hebrewPlain || '').toLowerCase().includes(q) ||
      (w.translation || '').toLowerCase().includes(q) ||
      (w.transcription || '').toLowerCase().includes(q);

    const matchesPos = selectedPos === 'all' || w.partOfSpeech === selectedPos;
    return matchesSearch && matchesPos;
  });

  const wordsWithRoots = filteredWords.filter((w) => Boolean(w.root));
  const allRevealed =
    wordsWithRoots.length > 0 &&
    wordsWithRoots.every((w) => Boolean(revealedRoots[w.id]));

  const handleToggleAllRoots = () => {
    const nextState = !allRevealed;
    const nextMap: Record<string, boolean> = { ...revealedRoots };
    wordsWithRoots.forEach((w) => {
      nextMap[w.id] = nextState;
    });
    setRevealedRoots(nextMap);
  };

  const handleToggleDict = (word: Word) => {
    const cleanWordHeb = stripNikkud(word.hebrew);
    let updatedVocab = [...(userProfile.personalVocabulary || [])];
    const isAlreadyIn = updatedVocab.some(
      (pw) => stripNikkud(pw.hebrew) === cleanWordHeb
    );

    if (isAlreadyIn) {
      updatedVocab = updatedVocab.filter(
        (pw) => stripNikkud(pw.hebrew) !== cleanWordHeb
      );
    } else {
      const newWord: Word = {
        ...word,
        id: `user-word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        isUserAdded: true,
        dateAdded: Date.now(),
      };
      updatedVocab.unshift(newWord);
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      personalVocabulary: updatedVocab,
    };

    saveUserProfile(updatedProfile);
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
  };

  const isWordInDict = (word: Word) => {
    return (userProfile.personalVocabulary || []).some(
      (pw) => stripNikkud(pw.hebrew) === stripNikkud(word.hebrew)
    );
  };

  const getPosBadge = (pos: PartOfSpeech) => {
    switch (pos) {
      case 'noun':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">Сущ.</span>;
      case 'verb':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">Глагол</span>;
      case 'adjective':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">Прил.</span>;
      case 'expression':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">Фраза</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Слово</span>;
    }
  };

  const getGenderBadge = (gender?: 'm' | 'f' | 'both') => {
    if (!gender) return null;
    if (gender === 'm') {
      return (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60"
          title="Мужской род"
        >
          м.р. ♂
        </span>
      );
    }
    if (gender === 'f') {
      return (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60"
          title="Женский род"
        >
          ж.р. ♀
        </span>
      );
    }
    if (gender === 'both') {
      return (
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60"
          title="Общий род"
        >
          общ. ⚥
        </span>
      );
    }
    return null;
  };

  const currentWord = words[currentIndex] || words[0];

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="space-y-4 sm:space-y-6 max-w-3xl mx-auto pb-10">

      {/* Верхняя строка управления: Переключатель режимов (Карточки / Списком) */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 p-2 sm:p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Переключатель Карточки / Списком */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setViewMode('card');
              setIsSessionCompleted(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'card'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Карточки</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Списком</span>
          </button>
        </div>


        {/* Счётчик и прогресс для режима карточек */}
        {viewMode === 'card' && !isSessionCompleted && words.length > 0 && (
          <div className="flex items-center gap-2 pr-1">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-mono">
              {currentIndex + 1} / {words.length}
            </span>
            <div className="w-16 sm:w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Индикатор общего количества слов в режиме списка */}
        {viewMode === 'list' && (
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 px-2">
            {words.length} слов
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. РЕЖИМ КАРТОЧЕК (АКТИВНОЕ ИНТЕРАКТИВНОЕ ОБУЧЕНИЕ 1-В-1) */}
      {/* ========================================================================= */}
      {viewMode === 'card' && (
        <div className="space-y-4 max-w-md mx-auto">
          {!isSessionCompleted && currentWord ? (
            <>
              {/* Интерактивная карточка (нажатие переворачивает) */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="w-full min-h-[360px] sm:min-h-[400px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md hover:shadow-lg transition-all p-6 sm:p-7 flex flex-col justify-between cursor-pointer select-none group relative overflow-hidden"
              >
                {/* ЛИЦЕВАЯ СТОРОНА: Слово на иврите с огласовками + звук */}
                {!isFlipped ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getPosBadge(currentWord.partOfSpeech)}
                        {getGenderBadge(currentWord.gender)}
                        {currentWord.isUserAdded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            <span>👑</span>
                            <span>Добавлено вами</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDict(currentWord);
                        }}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          isWordInDict(currentWord)
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                        title={
                          isWordInDict(currentWord)
                            ? 'В вашем личном словаре'
                            : 'Добавить в личный словарь'
                        }
                      >
                        {isWordInDict(currentWord) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="my-auto py-6 text-center space-y-4">
                      {/* Пиктограмма (если есть) */}
                      {getHebrewPictogram(currentWord.hebrew) && (
                        <div className="text-3xl select-none">
                          {getHebrewPictogram(currentWord.hebrew)}
                        </div>
                      )}

                      {/* Крупное слово на иврите */}
                      <div
                        dir="rtl"
                        className={`font-black tracking-tight leading-tight select-text ${
                          isCursive
                            ? 'font-cursive text-4xl sm:text-5xl md:text-6xl text-blue-600 dark:text-blue-400'
                            : 'font-hebrew text-4xl sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-50'
                        }`}
                      >
                        {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                      </div>

                      {/* Большая удобная кнопка озвучки */}
                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakHebrew(currentWord.hebrew, {
                              rate: userProfile.speechRate || 0.7,
                            });
                          }}
                          className="p-3.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition cursor-pointer hover:scale-110 active:scale-95 shadow-xs inline-flex items-center justify-center"
                          title="Прослушать произношение"
                        >
                          <Volume2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Подсказка для переворота */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <RotateCw className="w-3.5 h-3.5 opacity-70" />
                      <span>
                        Нажмите, чтобы проверить перевод
                      </span>
                    </div>
                  </>
                ) : (
                  /* ОБРАТНАЯ СТОРОНА: Перевод, транскрипция, корень, пример */
                  <>
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          dir="rtl"
                          className="font-hebrew text-lg font-bold text-blue-600 dark:text-blue-400"
                        >
                          {userProfile.showNikkud
                            ? currentWord.hebrew
                            : currentWord.hebrewPlain}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakHebrew(currentWord.hebrew, {
                              rate: userProfile.speechRate || 0.7,
                            });
                          }}
                          className="p-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                          title="Озвучить"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDict(currentWord);
                        }}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          isWordInDict(currentWord)
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        {isWordInDict(currentWord) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="my-auto py-4 text-center space-y-2">
                      {/* Перевод */}
                      <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 leading-snug">
                        {currentWord.translation}
                      </div>

                      {/* Транскрипция */}
                      {userProfile.showTranscription &&
                        getWordTranscription(currentWord) && (
                          <div className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 font-mono">
                            [{getWordTranscription(currentWord)}]
                          </div>
                        )}

                      {/* Корень (Шореш) */}
                      {currentWord.root && (
                        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                          <span className="text-zinc-400">
                            Корень:
                          </span>
                          <span
                            dir="rtl"
                            className="font-bold font-hebrew text-sm px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-900/50"
                          >
                            {currentWord.root}
                          </span>
                        </div>
                      )}

                      {/* Пример предложения */}
                      {currentWord.exampleSentence && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800/80 text-left space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p
                              dir="rtl"
                              className={`font-medium ${
                                isCursive
                                  ? 'font-cursive text-xl text-blue-600 dark:text-blue-400'
                                  : 'font-hebrew text-sm sm:text-base text-zinc-800 dark:text-zinc-200'
                              }`}
                            >
                              {currentWord.exampleSentence.hebrew}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                speakHebrew(currentWord.exampleSentence!.hebrew)
                              }
                              className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 transition shrink-0"
                              title="Озвучить пример"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {currentWord.exampleSentence.translation}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span>
                        Оцените свой ответ кнопками ниже
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Панель действий под карточкой: честный двухшаговый процесс (Active Recall) */}
              {!isFlipped ? (
                 /* ШАГ 1 (Карточка закрыта): Ученик вспоминает ответ -> Кнопка "Показать перевод" */
                <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95 cursor-pointer shrink-0"
                    title="Предыдущее слово"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm shadow-blue-600/25"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Показать перевод</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer shrink-0"
                    title="Следующее слово"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* ШАГ 2 (Карточка открыта): Ученик сверяет ответ -> Кнопки оценки "Повторить" и "Знаю" */
                <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95 cursor-pointer shrink-0"
                    title="Предыдущее слово"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkRepeat}
                    className="flex-1 py-3.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-2 border-amber-200/90 dark:border-amber-900/70 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                    title="Забыл / Повторить скоро"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Повторить</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkKnown}
                    className="flex-1 py-3.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/25"
                    title="Знаю хорошо"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Знаю</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer shrink-0"
                    title="Следующее слово"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ЭКРАН ЗАВЕРШЕНИЯ КАРТОЧЕК */
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-sm animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-xs">
                🌟
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                  Все слова урока пройдены!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  {`Вы успешно завершили этап карточек (${words.length} слов)`}
                </p>
              </div>

              {/* Метрики */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {knownWordIds.size}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">
                    Усвоено
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {reviewWordIds.size}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium">
                    На повторение
                  </div>
                </div>
              </div>

              {/* Кнопка перехода к этапу 3 */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleMarkDone}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>
                    Перейти к упражнениям (этап 3/5) ➡️
                  </span>
                </button>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRestartCards}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Пройти карточки заново</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Посмотреть списком</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. РЕЖИМ СПИСКА (ПОЛНЫЙ СЛОВАРЬ ТЕМЫ ДЛЯ СПРАВКИ И ПОИСКА) */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Поиск и фильтры по частям речи */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск слова..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select
                value={selectedPos}
                onChange={(e) => setSelectedPos(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Все части речи</option>
                <option value="noun">Сущ.</option>
                <option value="verb">Глаголы</option>
                <option value="adjective">Прил.</option>
                <option value="expression">Фразы</option>
              </select>
            </div>

            {wordsWithRoots.length > 0 && (
              <button
                type="button"
                onClick={handleToggleAllRoots}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
                  allRevealed
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {allRevealed ? (
                  <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
                <span>{allRevealed ? 'Скрыть корни' : 'Показать корни'}</span>
              </button>
            )}
          </div>

          {/* Список слов в виде аккуратных карточек */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredWords.map((word) => {
              const inDict = isWordInDict(word);
              const isRootRevealed = Boolean(revealedRoots[word.id]);
              const pictogram = getHebrewPictogram(word.hebrew);

              return (
                <div
                  key={word.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getPosBadge(word.partOfSpeech)}
                        {getGenderBadge(word.gender)}
                        {word.isUserAdded && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            <span>👑</span>
                            <span>Своё</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            speakHebrew(word.hebrew, {
                              rate: userProfile.speechRate || 0.7,
                            })
                          }
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                          title="Прослушать произношение"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDict(word)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            inDict
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                          title={
                            inDict
                              ? 'В личном словаре'
                              : 'Добавить в личный словарь'
                          }
                        >
                          {inDict ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div
                        dir="rtl"
                        className={`font-black ${
                          isCursive
                            ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                            : 'font-hebrew text-xl sm:text-2xl text-zinc-900 dark:text-zinc-50'
                        }`}
                      >
                        {userProfile.showNikkud ? word.hebrew : word.hebrewPlain}
                      </div>

                      {pictogram && (
                        <span className="text-xl select-none">{pictogram}</span>
                      )}
                    </div>

                    {/* Транскрипция */}
                    {userProfile.showTranscription &&
                      getWordTranscription(word) && (
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                          [{getWordTranscription(word)}]
                        </p>
                      )}

                    {/* Перевод */}
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1.5">
                      {word.translation}
                    </p>
                  </div>

                  {/* Шореш / пример */}
                  {(word.root || word.exampleSentence) && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                      {word.root && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                          <span className="text-[11px] text-zinc-400">
                            Шореш:
                          </span>
                          <span
                            dir="rtl"
                            className="font-bold font-hebrew text-xs px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-900/50"
                          >
                            {word.root}
                          </span>
                        </div>
                      )}

                      {word.exampleSentence && (
                        <div className="text-xs bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              dir="rtl"
                              className="font-medium font-hebrew text-zinc-800 dark:text-zinc-200"
                            >
                              {word.exampleSentence.hebrew}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                speakHebrew(word.exampleSentence!.hebrew)
                              }
                              className="p-1 text-zinc-400 hover:text-blue-600 transition"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            {word.exampleSentence.translation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Завершение этапа словаря в режиме списка */}
          <div className="text-center pt-4 pb-6">
            <button
              type="button"
              onClick={handleMarkDone}
              className="py-3.5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>
                Я выучил слова • Перейти к упражнениям (этап 3/5) ➡️
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
