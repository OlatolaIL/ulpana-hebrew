'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  RotateCw,
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  HelpCircle,
  Award,
  Delete,
  Space,
  ArrowLeftRight,
  Shuffle,
  Columns2,
  Play,
  Pause,
  Repeat,
  Timer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Word, UserProfile, VerbConjugation } from '@/types';
import { speakHebrew, speakRussian, stopSpeech } from '@/lib/speech';
import { updateCardSRS, calculateWordMastery, addWordToPersonalDict, isWordInPersonalDict, loadUserProfile, saveUserProfile, markLessonTabCompleted, sortWordsBySRSPriority, shuffleWords } from '@/lib/storage';
import { stripNikkud, getWordTranscription } from '@/lib/transcription';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';
import { getHebrewPictogram } from '@/lib/pictograms';
import { WordVisual } from '@/components/WordVisual';
import { useModalHistory } from '@/lib/useHistoryState';

interface FlashcardTrainerProps {
  initialWords: Word[];
  userProfile: UserProfile;
  onClose?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  customTitle?: string;
  initialMode?: 'flip' | 'builder' | 'listening' | 'auto_audio';
  initialDirection?: 'he-ru' | 'ru-he' | 'carousel';
  initialShuffle?: boolean;
  lessonId?: number;
  onContinueLesson?: (lessonId: number, nextTab: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone') => void;
}

type TrainerMode = 'flip' | 'builder' | 'listening' | 'auto_audio';

interface Tile {
  id: string;
  char: string;
}

/**
 * Равномерно разбивает массив слов на части оптимального размера (7–10 слов).
 * Если слов <= 12, деление не требуется и возвращается исходный массив одной частью.
 */
export function splitWordsIntoParts(wordsList: Word[]): Word[][] {
  const total = wordsList.length;
  if (total <= 12) {
    return [wordsList];
  }
  const numParts = Math.max(2, Math.ceil(total / 10));
  const partsList: Word[][] = [];
  const baseSize = Math.floor(total / numParts);
  const remainder = total % numParts;
  let offset = 0;
  for (let i = 0; i < numParts; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    partsList.push(wordsList.slice(offset, offset + size));
    offset += size;
  }
  return partsList;
}

export function getCleanHebrewTarget(word: Word): string {
  const raw = word.hebrewPlain || word.hebrew || '';
  return stripNikkud(raw)
    .replace(/[.,!?;:"'״׳()[\]{}—\-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export const FlashcardTrainer: React.FC<FlashcardTrainerProps> = ({
  initialWords,
  userProfile,
  onClose,
  onUpdateProfile,
  customTitle,
  initialMode,
  initialDirection,
  initialShuffle,
  lessonId,
  onContinueLesson,
}) => {
  const [masterWords, setMasterWords] = useState<Word[]>(() => {
    const base = lessonId
      ? initialWords
      : sortWordsBySRSPriority(
          initialWords,
          userProfile.flashcardStats,
          userProfile.flashcardProgress
        );
    return initialShuffle ? shuffleWords(base) : base;
  });

  const canSplit = initialWords.length > 12;
  const [isSplitMode, setIsSplitMode] = useState(false);
  // Стабильное деление на части: фиксируется строго по исходному списку initialWords
  const stableCanonicalParts = React.useMemo(() => splitWordsIntoParts(initialWords), [initialWords]);
  const [parts, setParts] = useState<Word[][]>(() => stableCanonicalParts);
  const [activePartIndex, setActivePartIndex] = useState<number>(0);
  const [completedPartIndices, setCompletedPartIndices] = useState<number[]>([]);
  const [partCompletionStatus, setPartCompletionStatus] = useState<'idle' | 'part_completed' | 'all_parts_completed'>('idle');

  // Активный набор слов: выбранная часть либо все слова колоды
  const words = isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]
    ? parts[activePartIndex]
    : masterWords;

  const [isShuffled, setIsShuffled] = useState(Boolean(initialShuffle));
  const [shuffleToast, setShuffleToast] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<TrainerMode>(initialMode || 'flip');
  const [isCompleted, setIsCompleted] = useState(false);

  // Для режима "Авто на слух"
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPauseSec, setAutoPauseSec] = useState(3);
  const [autoPhase, setAutoPhase] = useState<'idle' | 'prompt' | 'pause' | 'reveal'>('idle');
  const [autoCountdown, setAutoCountdown] = useState(0);

  const handleShuffleWords = () => {
    if (isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]) {
      // Перемешиваем только ВНУТРИ текущей части, границы частей остаются стабильными
      setParts((prev) => {
        const next = [...prev];
        next[activePartIndex] = shuffleWords(next[activePartIndex]);
        return next;
      });
    } else {
      const shuffled = shuffleWords(masterWords);
      setMasterWords(shuffled);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
    setShuffleToast(true);
    setTimeout(() => setShuffleToast(false), 2000);
  };

  const handleToggleSplitMode = () => {
    if (!isSplitMode) {
      setParts(stableCanonicalParts);
      setIsSplitMode(true);
      setActivePartIndex(0);
      setCurrentIndex(0);
      setIsFlipped(false);
      setPartCompletionStatus('idle');
      setIsCompleted(false);
    } else {
      setIsSplitMode(false);
      setActivePartIndex(-1);
      setCurrentIndex(0);
      setIsFlipped(false);
      setPartCompletionStatus('idle');
      setIsCompleted(false);
    }
  };

  const handleSelectPart = (idx: number) => {
    setActivePartIndex(idx);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPartCompletionStatus('idle');
    setIsCompleted(false);
  };

  // Направление карточек: 'he-ru' (иврит на лицевой), 'ru-he' (русский на лицевой) или 'carousel' (карусель / микс)
  const [cardDirection, setCardDirection] = useState<'he-ru' | 'ru-he' | 'carousel'>(() => {
    if (initialDirection) return initialDirection;
    if (userProfile.flashcardDirection) return userProfile.flashcardDirection as any;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flashcard_direction');
      if (saved === 'ru-he' || saved === 'he-ru' || saved === 'carousel') return saved;
    }
    return 'he-ru';
  });

  const handleToggleDirection = () => {
    const nextDir: 'he-ru' | 'ru-he' | 'carousel' =
      cardDirection === 'he-ru'
        ? 'ru-he'
        : cardDirection === 'ru-he'
        ? 'carousel'
        : 'he-ru';
    setCardDirection(nextDir);
    setIsFlipped(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flashcard_direction', nextDir);
    }
    if (onUpdateProfile) {
      const updated: UserProfile = { ...userProfile, flashcardDirection: nextDir as any };
      saveUserProfile(updated);
      onUpdateProfile(updated);
    }
  };

  // Для режима конструктора букв
  const [builderAvailable, setBuilderAvailable] = useState<Tile[]>([]);
  const [builderSelected, setBuilderSelected] = useState<Tile[]>([]);
  const [builderSuccess, setBuilderSuccess] = useState(false);
  const [builderError, setBuilderError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Для режима аудирования
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Для системы Pealim (спряжения и семья корней)
  const [pealimModalVerb, setPealimModalVerb] = useState<{
    word: Word;
    conjugation: VerbConjugation | null;
    loading: boolean;
  } | null>(null);

  useModalHistory(Boolean(pealimModalVerb), () => setPealimModalVerb(null), 'pealim-flashcards');

  const handleOpenPealim = async (word: Word) => {
    const offlineMatch =
      findOfflineVerbConjugation(word.hebrew) ||
      findOfflineVerbConjugation(word.hebrewPlain || stripNikkud(word.hebrew));

    if (offlineMatch) {
      setPealimModalVerb({
        word,
        conjugation: offlineMatch,
        loading: false,
      });
      return;
    }

    setPealimModalVerb({
      word,
      conjugation: null,
      loading: true,
    });

    try {
      const res = await fetch('/api/ai/conjugate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verb: word.hebrew,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.present) {
          setPealimModalVerb({
            word,
            conjugation: data,
            loading: false,
          });
          return;
        }
      }
    } catch (e) {
      console.error('Pealim fetch error:', e);
    }

    setPealimModalVerb((prev) => (prev ? { ...prev, loading: false } : null));
  };

  const currentWord = words[currentIndex];
  // В режиме "карусель" направление чередуется на каждой карточке (то иврит, то русский)
  const isCurrentCardFrontRussian =
    cardDirection === 'ru-he' ||
    (cardDirection === 'carousel' && currentIndex % 2 === 1);

  useEffect(() => {
    if (!currentWord) return;
    setIsFlipped(false);
    setSelectedAnswer(null);
    setBuilderError(false);
    setBuilderSuccess(false);

    // Озвучиваем слово при показе в режиме аудирования
    if (mode === 'listening') {
      speakHebrew(currentWord.hebrew);
    }

    // Подготовка для режима конструктора букв (сохраняем пробелы как плитки)
    const targetText = getCleanHebrewTarget(currentWord);
    const rawChars = targetText.split('');
    const tiles: Tile[] = rawChars.map((char, index) => ({
      id: `tile-${index}-${char}-${Math.random().toString(36).substr(2, 4)}`,
      char: char,
    }));
    // Перемешиваем буквы
    setBuilderAvailable([...tiles].sort(() => Math.random() - 0.5));
    setBuilderSelected([]);
    setShowHint(false);

    // Подготовка вариантов для аудирования
    const isUlpanMode = Boolean(userProfile.ulpanMode);
    const pool = words.length >= 4 ? words : masterWords;
    const otherOptions = pool
      .filter((w) => w.id !== currentWord.id)
      .map((w) =>
        isUlpanMode
          ? userProfile.showNikkud
            ? w.hebrew
            : w.hebrewPlain
          : w.translation
      );
    const currentOpt = isUlpanMode
      ? userProfile.showNikkud
        ? currentWord.hebrew
        : currentWord.hebrewPlain
      : currentWord.translation;

    const shuffledOthers = otherOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOpts = [...shuffledOthers, currentOpt].sort(() => Math.random() - 0.5);
    setQuizOptions(allOpts);
  }, [currentIndex, mode, currentWord, words, masterWords, userProfile.ulpanMode, userProfile.showNikkud]);

  // Эффект для режима "Авто на слух" (Hands-Free):
  // Озвучка первого языка → Пауза 2-3 сек (чтобы ученик вспомнил сам) → Озвучка второго языка → переход к следующему слову
  useEffect(() => {
    if (mode !== 'auto_audio' || !isAutoPlaying || isCompleted) {
      return;
    }

    let isCancelled = false;
    let timer: any = null;
    let countdownInterval: any = null;

    const runCycle = async () => {
      if (isCancelled) return;
      const targetWord = words[currentIndex];
      if (!targetWord) return;

      const promptIsRussian =
        cardDirection === 'ru-he' ||
        (cardDirection === 'carousel' && currentIndex % 2 === 1);

      // Шаг 1: Озвучка первого языка (вопрос)
      setAutoPhase('prompt');
      if (promptIsRussian) {
        await speakRussian(targetWord.translation);
      } else {
        await speakHebrew(targetWord.hebrew);
      }
      if (isCancelled) return;

      // Шаг 2: Пауза (2-4 секунды) для размышления
      setAutoPhase('pause');
      setAutoCountdown(autoPauseSec);
      let count = autoPauseSec;
      await new Promise<void>((resolve) => {
        countdownInterval = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            if (countdownInterval) clearInterval(countdownInterval);
            resolve();
          } else {
            setAutoCountdown(count);
          }
        }, 1000);
      });
      if (isCancelled) return;

      // Шаг 3: Озвучка второго языка (ответ)
      setAutoPhase('reveal');
      if (promptIsRussian) {
        await speakHebrew(targetWord.hebrew);
      } else {
        await speakRussian(targetWord.translation);
      }
      if (isCancelled) return;

      // Шаг 4: Короткая пауза (1.5 сек) перед следующим словом
      await new Promise((resolve) => {
        timer = setTimeout(resolve, 1500);
      });
      if (isCancelled) return;

      // Шаг 5: Переход к следующему слову или завершение
      if (currentIndex + 1 < words.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsAutoPlaying(false);
        setAutoPhase('idle');
        handleFinishSet();
      }
    };

    runCycle();

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
      stopSpeech();
    };
  }, [mode, isAutoPlaying, currentIndex, autoPauseSec, cardDirection, isCompleted, words]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleRecordSRS = (quality = 4) => {
    if (currentWord) {
      const cleanHeb = stripNikkud(currentWord.hebrewPlain || currentWord.hebrew || '');
      updateCardSRS(currentWord.id, quality, cleanHeb);
      const updated = loadUserProfile();
      if (onUpdateProfile) {
        onUpdateProfile(updated);
      }
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFinishSet = () => {
    if (isSplitMode && canSplit && activePartIndex >= 0) {
      const nextCompleted = completedPartIndices.includes(activePartIndex)
        ? completedPartIndices
        : [...completedPartIndices, activePartIndex];
      setCompletedPartIndices(nextCompleted);

      triggerCelebration();

      const allDone = parts.every((_, idx) => nextCompleted.includes(idx));
      if (allDone || activePartIndex >= parts.length - 1) {
        if (lessonId) {
          const updated = markLessonTabCompleted(lessonId, 'vocab');
          if (onUpdateProfile) onUpdateProfile(updated);
        }
        setPartCompletionStatus('all_parts_completed');
      } else {
        setPartCompletionStatus('part_completed');
      }
    } else {
      setIsCompleted(true);
      if (lessonId) {
        const updated = markLessonTabCompleted(lessonId, 'vocab');
        if (onUpdateProfile) onUpdateProfile(updated);
      } else {
        const updated = loadUserProfile();
        if (onUpdateProfile) onUpdateProfile(updated);
      }
      triggerCelebration();
    }
  };

  const handleNextWord = (quality = 4) => {
    handleRecordSRS(quality);

    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishSet();
    }
  };

  const handleAdvanceNext = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishSet();
    }
  };

  const handleFlipCard = () => {
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && isCurrentCardFrontRussian && currentWord) {
        speakHebrew(currentWord.hebrew);
      }
      return next;
    });
  };

  // Горячие клавиши для режима карточек (Стрелка влево / вправо / пробел / цифры 1-3)
  useEffect(() => {
    if (mode !== 'flip' || !currentWord) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevWord();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlipCard();
        } else {
          handleNextWord(5);
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlipCard();
        } else {
          handleNextWord(5);
        }
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleNextWord(1);
        } else if (e.key === '2' || e.key === '3') {
          e.preventDefault();
          handleNextWord(3);
        } else if (e.key === '4' || e.key === '5') {
          e.preventDefault();
          handleNextWord(5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentWord, currentIndex, cardDirection, isFlipped]);

  const handleSelectTile = (tile: Tile) => {
    if (builderSuccess) return;
    const nextSelected = [...builderSelected, tile];
    const nextAvailable = builderAvailable.filter((t) => t.id !== tile.id);

    setBuilderSelected(nextSelected);
    setBuilderAvailable(nextAvailable);

    const targetWord = getCleanHebrewTarget(currentWord);
    const currentInput = nextSelected.map((t) => t.char).join('');

    if (currentInput === targetWord) {
      // Успешно собрали слово или фразу!
      setBuilderSuccess(true);
      setBuilderError(false);
      speakHebrew(currentWord.hebrew);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else if (!targetWord.startsWith(currentInput)) {
      setBuilderError(true);
      setTimeout(() => {
        setBuilderError(false);
      }, 700);
    } else {
      setBuilderError(false);
    }
  };

  const handleUnselectTile = (tile: Tile) => {
    if (builderSuccess) return;
    setBuilderSelected((prev) => prev.filter((t) => t.id !== tile.id));
    setBuilderAvailable((prev) => [...prev, tile]);
    setBuilderError(false);
  };

  const handleBackspace = () => {
    if (builderSuccess || builderSelected.length === 0) return;
    const lastTile = builderSelected[builderSelected.length - 1];
    handleUnselectTile(lastTile);
  };

  const handleResetBuilder = () => {
    if (builderSuccess) return;
    const targetText = getCleanHebrewTarget(currentWord);
    const rawChars = targetText.split('');
    const tiles: Tile[] = rawChars.map((char, index) => ({
      id: `tile-${index}-${char}-${Math.random().toString(36).substr(2, 4)}`,
      char: char,
    }));
    setBuilderAvailable([...tiles].sort(() => Math.random() - 0.5));
    setBuilderSelected([]);
    setBuilderError(false);
    setBuilderSuccess(false);
  };

  const handleAutoAssemble = () => {
    if (builderSuccess || !currentWord) return;
    const targetText = getCleanHebrewTarget(currentWord);
    const fullTiles: Tile[] = targetText.split('').map((char, index) => ({
      id: `tile-auto-${index}-${char}-${Math.random().toString(36).substr(2, 4)}`,
      char: char,
    }));

    setBuilderSelected(fullTiles);
    setBuilderAvailable([]);
    setBuilderSuccess(true);
    setBuilderError(false);
    speakHebrew(currentWord.hebrew);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  useEffect(() => {
    if (mode !== 'builder' || !currentWord) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (builderSuccess) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextWord(5);
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        const spaceTile = builderAvailable.find((t) => t.char === ' ');
        if (spaceTile) {
          handleSelectTile(spaceTile);
        }
        return;
      }

      const tile = builderAvailable.find((t) => t.char === e.key);
      if (tile) {
        e.preventDefault();
        handleSelectTile(tile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentWord, builderAvailable, builderSelected, builderSuccess]);

  const handleQuizSelect = (option: string) => {
    setSelectedAnswer(option);
    const correctOpt = userProfile.ulpanMode
      ? userProfile.showNikkud
        ? currentWord.hebrew
        : currentWord.hebrewPlain
      : currentWord.translation;
    const isCorrect = option === correctOpt;

    if (isCorrect) {
      speakHebrew(currentWord.hebrew);
      setTimeout(() => handleNextWord(5), 900);
    } else {
      setTimeout(() => handleNextWord(1), 1500);
    }
  };

  const isUlpan = Boolean(userProfile.ulpanMode);

  // ЭКРАН 1: Завершена отдельная часть (не последняя)
  if (partCompletionStatus === 'part_completed') {
    const nextPartIdx = activePartIndex + 1;
    const nextPartWordsCount = parts[nextPartIdx]?.length || 0;
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isUlpan
                ? `חֵלֶק ${activePartIndex + 1} מִתּוֹךְ ${parts.length} הוּשְׁלַם!`
                : `Часть ${activePartIndex + 1} из ${parts.length} пройдена!`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !כָּל הַכָּבוֹד
          </h2>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400">
            {isUlpan
              ? `עֲבוֹדָה מְצוּיֶנֶת! שְׁלַטְתֶּם בְּ-${words.length} מִילִּים.`
              : `Отлично! Вы повторили ${words.length} слов(а).`}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isUlpan
              ? `מוּכָנִים לַעֲבוֹר לַחֵלֶק הַבָּא אוֹ לַחֲזוֹר עַל חֵלֶק זֶה?`
              : `Готовы перейти к следующей части или хотите повторить эту ещё раз?`}
          </p>
        </div>

        {/* Индикатор всех частей */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-1 flex-wrap">
          {parts.map((p, idx) => {
            const isFinished = completedPartIndices.includes(idx);
            const isCurrent = activePartIndex === idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isFinished
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                {isFinished && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                <span>{isUlpan ? `חלק ${idx + 1}` : `Ч. ${idx + 1}`}</span>
                <span className="text-[10px] opacity-75">({p.length})</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2.5 pt-2">
          {nextPartIdx < parts.length && (
            <button
              type="button"
              onClick={() => {
                setActivePartIndex(nextPartIdx);
                setCurrentIndex(0);
                setIsFlipped(false);
                setPartCompletionStatus('idle');
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isUlpan
                  ? `הַמְשֵׁךְ לְחֵלֶק ${nextPartIdx + 1} (${nextPartWordsCount} מִילִּים) ➡️`
                  : `Перейти к части ${nextPartIdx + 1} (${nextPartWordsCount} слов) ➡️`}
              </span>
            </button>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setPartCompletionStatus('idle');
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              {isUlpan ? 'חֲזֹר עַל חֵלֶק זֶה' : 'Повторить эту часть'}
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePartIndex(-1);
                setCurrentIndex(0);
                setIsFlipped(false);
                setPartCompletionStatus('idle');
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
            >
              {isUlpan ? 'הַכֹּל יַחַד עַכְשָׁו' : 'Все слова сразу'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ЭКРАН 2: Завершены все части — объединить и закрепить всё вместе
  if (partCompletionStatus === 'all_parts_completed') {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-100 to-indigo-100 dark:from-amber-950/60 dark:to-indigo-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isUlpan ? '!כָּל הַחֲלָקִים הוּשְׁלְמוּ' : 'Все части успешно пройдены!'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !כָּל הַכָּבוֹד
          </h2>
          <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            {isUlpan
              ? `עֲבַרְתֶּם עַל כָּל ${parts.length} הַחֲלָקִים (${masterWords.length} מִילִּים)!`
              : `Вы последовательно выучили все ${parts.length} частей (${masterWords.length} слов)!`}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isUlpan
              ? 'עַכְשָׁו מֻמְלָץ לְאַחֵד אֶת כָּל הַמִּילִּים וּלְחַזֵּק אֶת הַזִּכָּרוֹן יַחַד.'
              : 'Теперь закрепим результат: объедините все слова колоды для финального повторения!'}
          </p>
        </div>

        {/* Главная кнопка объединения */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              setActivePartIndex(-1);
              setCurrentIndex(0);
              setIsFlipped(false);
              setPartCompletionStatus('idle');
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {isUlpan
                ? `🚀 אֲחֵד וְתַרְגֵּל אֶת כָּל ${masterWords.length} הַמִּילִּים`
                : `🚀 Объединить и повторить всё вместе (${masterWords.length} слов)`}
            </span>
          </button>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setPartCompletionStatus('idle');
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              {isUlpan ? 'חֲזֹר עַל חֵלֶק אַחֲרוֹן' : 'Повторить последнюю часть'}
            </button>

            {lessonId ? (
              <button
                type="button"
                onClick={() => {
                  if (onContinueLesson) {
                    onContinueLesson(lessonId, 'exercises');
                  } else if (onClose) {
                    onClose();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'מַעֲבָר לְתַרְגִּילִים ➡️' : 'К упражнениям ➡️'}
              </button>
            ) : onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'סְגוֹר' : 'Завершить'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ЭКРАН 3: Завершение полной колоды («Все вместе» или без деления)
  if (!currentWord || isCompleted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !כָּל הַכָּבוֹד
          </h2>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {isUlpan
              ? (lessonId ? `עֲבוֹדָה מְצוּיֶנֶת! שִׁיעוּר ${lessonId} הוּשְׁלַם בְּהַצְלָחָה!` : 'עֲבוֹדָה מְצוּיֶנֶת! הַתִּרְגּוּל הֻשְׁלַם.')
              : (lessonId
                  ? `Отличная работа! Словарь урока ${lessonId} успешно пройден!`
                  : 'Отличная работа! Тренировка завершена.')}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isUlpan
              ? (lessonId ? `חֲזַרְתֶּם עַל כָּל ${masterWords.length} הַמִּילִּים. שָׁלָב 2/5 הוּשְׁלַם.` : `חֲזַרְתֶּם עַל ${masterWords.length} מִילִּים.`)
              : (lessonId
                  ? `Вы повторили все ${masterWords.length} слов(а). Раздел «Словарь» зачтен (этап 2/5).`
                  : `Вы повторили ${masterWords.length} слов(а). Прогресс сохранен в интервальной памяти.`)}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {lessonId ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (onContinueLesson) {
                    onContinueLesson(lessonId, 'exercises');
                  } else if (onClose) {
                    onClose();
                  }
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isUlpan ? 'מַעֲבָר לְתַרְגִּילִים (שָׁלָב 3/5) ➡️' : 'Перейти к упражнениям (этап 3/5) ➡️'}</span>
              </button>

              <div className="flex gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueLesson) {
                      onContinueLesson(lessonId, 'vocab');
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  className="flex-1 min-w-[110px] py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  {isUlpan ? 'חֲזָרָה לַשִּׁיעוּר' : 'Вернуться в урок'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsCompleted(false);
                    setPartCompletionStatus('idle');
                  }}
                  className="flex-1 min-w-[110px] py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  {isUlpan ? 'תִּרְגּוּל נוֹסָף' : 'Повторить'}
                </button>

                {canSplit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSplitMode(true);
                      setActivePartIndex(0);
                      setCompletedPartIndices([]);
                      setCurrentIndex(0);
                      setIsCompleted(false);
                      setPartCompletionStatus('idle');
                    }}
                    className="flex-1 min-w-[110px] py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm hover:bg-blue-100 dark:hover:bg-blue-900/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Columns2 className="w-4 h-4" />
                    <span>{isUlpan ? 'בַּחֲלָקִים' : 'По частям'}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsCompleted(false);
                  setPartCompletionStatus('idle');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'תִּרְגּוּל שׁוּב' : 'Повторить снова'}
              </button>
              {canSplit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSplitMode(true);
                    setActivePartIndex(0);
                    setCompletedPartIndices([]);
                    setCurrentIndex(0);
                    setIsCompleted(false);
                    setPartCompletionStatus('idle');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 font-semibold text-sm text-blue-700 dark:text-blue-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Columns2 className="w-4 h-4" />
                  <span>{isUlpan ? 'בַּחֲלָקִים' : 'По частям'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  handleShuffleWords();
                  setIsCompleted(false);
                  setPartCompletionStatus('idle');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-semibold text-sm text-purple-700 dark:text-purple-300 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>{isUlpan ? 'עַרְבֵּב וְהַתְחֵל' : 'Перемешать и учить'}</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition cursor-pointer"
                >
                  {isUlpan ? 'סְגוֹר' : 'Вернуться'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const displayTitle = isUlpan
    ? (customTitle || '')
        .replace(/Урок\s*(\d+):\s*Карточки словаря/i, 'שִׁיעוּר $1: כַּרְטִיסִיּוֹת מִילִּים')
        .replace(/Тренировка карточек/i, 'תִּרְגּוּל כַּרְטִיסִיּוֹת')
        .replace(/Словарь урока\s*(\d+)/i, 'אוֹצַר מִילִּים $1')
    : customTitle;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Заголовок тренировки (если есть customTitle) */}
      {displayTitle && (
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-hebrew flex-wrap">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{displayTitle}</span>
            {isSplitMode && canSplit && activePartIndex >= 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 normal-case">
                {isUlpan
                  ? `· חֵלֶק ${activePartIndex + 1} מִתּוֹךְ ${parts.length}`
                  : `· Часть ${activePartIndex + 1} из ${parts.length}`}
              </span>
            )}
          </div>
          {currentWord && (() => {
            const stats =
              userProfile.flashcardStats?.[currentWord.id] ||
              userProfile.flashcardProgress?.[currentWord.id] ||
              (currentWord.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(currentWord.hebrewPlain)] : undefined) ||
              userProfile.flashcardStats?.[stripNikkud(currentWord.hebrew)];
            const mastery = calculateWordMastery(stats);
            const masteryText = isUlpan
              ? `יְדִיעָה: ${mastery.score}% (${mastery.score >= 80 ? 'מְצוּיָן' : mastery.score >= 50 ? 'בְּתַהֲלִיךְ' : 'חָדָשׁ'})`
              : `Знание: ${mastery.score}% (${mastery.label})`;
            return (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mastery.badgeBg}`}>
                {masteryText}
              </span>
            );
          })()}
        </div>
      )}

      {/* Шапка тренировки и выбор режима */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setMode('flip')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'flip'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {isUlpan ? 'כַּרְטִיסִייָה' : 'Флип'}
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'builder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {isUlpan ? 'הַרְכָּבָה' : 'Конструктор'}
          </button>
          <button
            onClick={() => setMode('listening')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'listening'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {isUlpan ? 'שְׁמִיעָה' : 'На слух'}
          </button>
          <button
            onClick={() => {
              setMode('auto_audio');
              setIsAutoPlaying(true);
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'auto_audio'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            title="Автоматическое прослушивание всех слов с паузой для размышления"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isUlpan ? 'אוֹטוֹ' : 'Авто на слух'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Кнопка деления на части (По частям), если в колоде > 12 слов */}
          {canSplit && (
            <button
              type="button"
              onClick={handleToggleSplitMode}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
                isSplitMode
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/30'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
              title={
                isUlpan
                  ? (isSplitMode ? 'בַּטֵּל חֲלוּקָה לַחֲלָקִים' : 'חַלֵּק אֶת הַכַּרְטִיסִיּוֹת לַחֲלָקִים (7–10 מִילִּים)')
                  : (isSplitMode ? 'Отключить режим частей' : 'Разбить колоду на части по 7–10 слов')
              }
            >
              <Columns2 className={`w-3.5 h-3.5 ${isSplitMode ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
              <span className="hidden sm:inline">
                {isUlpan ? (isSplitMode ? 'בְּחֲלָקִים' : 'חַלֵּק') : (isSplitMode ? 'По частям' : 'Поделить')}
              </span>
              <span className="sm:hidden">
                {isUlpan ? 'חַלֵּק' : 'Части'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSplitMode ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                {parts.length}
              </span>
            </button>
          )}

          {/* Переключатель направления карточек (Иврит ↔ Русский ↔ Карусель) */}
          <button
            type="button"
            onClick={handleToggleDirection}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
              cardDirection === 'ru-he'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                : cardDirection === 'carousel'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={
              cardDirection === 'ru-he'
                ? 'Обратный: Русский → Иврит. Нажмите для режима Карусель'
                : cardDirection === 'carousel'
                ? 'Карусель: случайный/чередующийся порядок (то иврит, то русский). Нажмите для Иврит → Русский'
                : 'Прямой: Иврит → Русский. Нажмите для режима Русский → Иврит'
            }
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${
              cardDirection === 'ru-he'
                ? 'text-amber-600 dark:text-amber-400'
                : cardDirection === 'carousel'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-blue-600 dark:text-blue-400'
            }`} />
            <span className="font-bold flex items-center gap-1">
              {cardDirection === 'ru-he' ? (
                <>
                  <span className="text-amber-700 dark:text-amber-300 font-extrabold">{isUlpan ? 'רוּ' : 'Рус'}</span>
                  <span className="text-zinc-400">→</span>
                  <span>{isUlpan ? 'עִבְ' : 'Ивр'}</span>
                </>
              ) : cardDirection === 'carousel' ? (
                <>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">🔀</span>
                  <span className="text-purple-700 dark:text-purple-300">{isUlpan ? 'מִיקְס' : 'Карусель'}</span>
                </>
              ) : (
                <>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{isUlpan ? 'עִבְ' : 'Ивр'}</span>
                  <span className="text-zinc-400">→</span>
                  <span>{isUlpan ? 'רוּ' : 'Рус'}</span>
                </>
              )}
            </span>
            <span className="hidden sm:inline text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
              {cardDirection === 'ru-he' ? '(обратный)' : cardDirection === 'carousel' ? '(микс)' : ''}
            </span>
          </button>

          {/* Кнопка перемешивания слов (Shuffle) */}
          <button
            type="button"
            onClick={handleShuffleWords}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
              shuffleToast
                ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-200 ring-2 ring-purple-400/50'
                : isShuffled
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={
              isUlpan
                ? 'עַרְבֵּב מִילִּים (סֵדֶר אַקְרָאִי)'
                : 'Перемешать слова (случайный порядок)'
            }
          >
            <Shuffle className={`w-3.5 h-3.5 transition-transform duration-300 ${shuffleToast ? 'rotate-180 text-purple-600 dark:text-purple-400' : isShuffled ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">
              {shuffleToast ? (isUlpan ? 'עֻרְבַּב!' : 'Перемешано!') : isUlpan ? 'עִרְבּוּב' : 'Вразброс'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
              const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
              if (onUpdateProfile) onUpdateProfile(updated);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={isUlpan ? 'החלף גופן (דפוס / כתב יד)' : 'Переключить шрифт карточек: Печатный / Рукописный'}
          >
            {userProfile.fontStyle === 'cursive' ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="text-zinc-700 dark:text-zinc-300">{isUlpan ? 'כְּתַב יָד' : 'Рукописный'}</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="text-zinc-700 dark:text-zinc-300">{isUlpan ? 'אוֹתִיּוֹת דְּפוּס' : 'Печатный'}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrevWord}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
              title={isUlpan ? 'מִילָּה קוֹדֶמֶת (הקודם)' : 'Предыдущее слово (Стрелка влево)'}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 px-1.5 min-w-[65px] text-center select-none font-hebrew flex flex-col items-center justify-center leading-tight">
              <span>
                {isUlpan
                  ? `${currentIndex + 1} / ${words.length}`
                  : `${currentIndex + 1} из ${words.length}`}
              </span>
              {isSplitMode && canSplit && activePartIndex >= 0 && (
                <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                  {isUlpan
                    ? `חֵלֶק ${activePartIndex + 1}/${parts.length}`
                    : `Ч. ${activePartIndex + 1}/${parts.length}`}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={currentIndex + 1 >= words.length}
              onClick={handleAdvanceNext}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
              title={isUlpan ? 'הַמִּילָּה הַבָּאָה (הבא)' : 'Следующее слово (Стрелка вправо)'}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Навигация по частям (если включен режим частей) */}
      {isSplitMode && canSplit && (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1.5 shrink-0">
            {isUlpan ? 'חֲלָקִים:' : 'Части:'}
          </span>
          {parts.map((part, idx) => {
            const isActive = activePartIndex === idx;
            const isDone = completedPartIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPart(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                    : isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                <span>{isUlpan ? `חֵלֶק ${idx + 1}` : `Часть ${idx + 1}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isDone
                      ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                      : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {part.length}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleSelectPart(-1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activePartIndex === -1
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{isUlpan ? 'הַכֹּל יַחַד' : 'Все вместе'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                activePartIndex === -1
                  ? 'bg-indigo-700 text-white'
                  : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {masterWords.length}
            </span>
          </button>
        </div>
      )}

      {/* Прогресс-бар */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isSplitMode && canSplit && activePartIndex >= 0 ? 'bg-blue-600' : 'bg-indigo-600'
          }`}
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* РЕЖИМ 1: ФЛИП-КАРТОЧКА */}
      {mode === 'flip' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Сама карточка */}
          <div
            onClick={handleFlipCard}
            className="min-h-[200px] sm:min-h-[270px] bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-blue-500/50 transition duration-300 relative select-none"
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(currentWord.hebrew);
                }}
                className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-sm"
                title={
                  isCurrentCardFrontRussian && !isFlipped
                    ? (isUlpan ? 'רֶמֶז קוֹלִי (הַשְׁמַע עִבְרִית)' : 'Подсказка: прослушать на иврите')
                    : (isUlpan ? 'הַשְׁמַע' : 'Озвучить')
                }
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {!isFlipped ? (
              isCurrentCardFrontRussian ? (
                /* Лицевая сторона: Русский → Иврит (обратный режим) */
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                      {userProfile.ulpanMode ? 'רוּסִית (לַחֲצוּ לְהַצָּגַת עִבְרִית)' : 'Русский (вспомните иврит)'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                      {isUlpan ? 'רוּ ← עִבְ' : 'Русский → Иврит'}
                    </span>
                  </div>

                  {/* Visual: large image in ulpan mode, small badge in normal mode */}
                  {isUlpan ? (
                    <WordVisual
                      hebrew={currentWord.hebrew}
                      hebrewPlain={currentWord.hebrewPlain}
                      size="lg"
                      ulpanMode={true}
                      className="my-2"
                    />
                  ) : (
                    getHebrewPictogram(currentWord.hebrew) && (() => {
                      const icon = getHebrewPictogram(currentWord.hebrew)!;
                      const isMale = icon.includes('♂');
                      const isFemale = icon.includes('♀');
                      return (
                        <div
                          className={`inline-flex items-center justify-center text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl border font-bold select-none my-1 shadow-xs animate-in zoom-in-75 ${
                            isMale
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                              : isFemale
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {icon}
                        </div>
                      );
                    })()
                  )}

                  <div className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 font-sans tracking-wide max-w-md mx-auto">
                    {currentWord.translation}
                  </div>

                  <p className="text-xs text-zinc-400 font-medium">
                    {isUlpan ? 'לַחֲצוּ כְּדֵי לִרְאוֹת אֶת הַמִּילָּה בְּעִבְרִית' : 'Нажмите на карточку или пробел, чтобы увидеть иврит'}
                  </p>
                </div>
              ) : (
                /* Лицевая сторона: Иврит → Русский (прямой режим) */
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    {userProfile.ulpanMode ? 'עִבְרִית (לחצו להצגת מידע)' : 'Иврит (нажмите для перевода)'}
                  </span>

                  {/* Visual: large image in ulpan mode, small badge in normal mode */}
                  {isUlpan ? (
                    <WordVisual
                      hebrew={currentWord.hebrew}
                      hebrewPlain={currentWord.hebrewPlain}
                      size="lg"
                      ulpanMode={true}
                      className="my-2"
                    />
                  ) : (
                    getHebrewPictogram(currentWord.hebrew) && (() => {
                      const icon = getHebrewPictogram(currentWord.hebrew)!;
                      const isMale = icon.includes('♂');
                      const isFemale = icon.includes('♀');
                      return (
                        <div
                          className={`inline-flex items-center justify-center text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl border font-bold select-none my-1 shadow-xs animate-in zoom-in-75 ${
                            isMale
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                              : isFemale
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {icon}
                        </div>
                      );
                    })()
                  )}

                  <div
                    dir="rtl"
                    className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                      userProfile.fontStyle === 'cursive'
                        ? 'font-cursive text-blue-600 dark:text-blue-400'
                        : 'font-hebrew'
                    }`}
                  >
                    {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                  </div>
                  {!userProfile.ulpanMode && userProfile.showTranscription && getWordTranscription(currentWord) && (
                    <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                      [{getWordTranscription(currentWord)}]
                    </p>
                  )}
                </div>
              )
            ) : (
              isCurrentCardFrontRussian ? (
                /* Оборотная сторона: Иврит и детали (обратный режим) */
                <div className="space-y-2.5 sm:space-y-3 animate-in fade-in">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    {userProfile.ulpanMode ? 'עִבְרִית וּפְרָטִים' : 'Иврит и детали'}
                  </span>

                  {/* Visual on flipped side */}
                  {isUlpan ? (
                    <WordVisual
                      hebrew={currentWord.hebrew}
                      hebrewPlain={currentWord.hebrewPlain}
                      size="sm"
                      ulpanMode={true}
                    />
                  ) : (
                    getHebrewPictogram(currentWord.hebrew) && (() => {
                      const icon = getHebrewPictogram(currentWord.hebrew)!;
                      const isMale = icon.includes('♂');
                      const isFemale = icon.includes('♀');
                      return (
                        <div
                          className={`inline-flex items-center justify-center text-xl sm:text-2xl px-3 py-1 rounded-xl border font-bold select-none shadow-xs ${
                            isMale
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                              : isFemale
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {icon}
                        </div>
                      );
                    })()
                  )}

                  <div
                    dir="rtl"
                    className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                      userProfile.fontStyle === 'cursive'
                        ? 'font-cursive text-blue-600 dark:text-blue-400'
                        : 'font-hebrew'
                    }`}
                  >
                    {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                  </div>

                  {!userProfile.ulpanMode && getWordTranscription(currentWord) && (
                    <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 -mt-1">
                      [{getWordTranscription(currentWord)}]
                    </p>
                  )}

                  <div className="text-lg sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 pt-0.5">
                    {currentWord.translation}
                  </div>

                  {currentWord.root && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                      <span>{userProfile.ulpanMode ? 'שׁוֹרֶשׁ:' : 'Шореш:'}</span>
                      <span dir="rtl" className="font-bold">
                        {currentWord.root}
                      </span>
                    </div>
                  )}

                  {/* Кнопка ПЕАЛИМ для глаголов */}
                  {(currentWord.partOfSpeech === 'verb' || currentWord.hebrew.startsWith('לִ') || currentWord.hebrew.startsWith('לְ') || currentWord.hebrew.startsWith('לַ') || currentWord.hebrew.startsWith('לָ') || Boolean(currentWord.root)) && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPealim(currentWord);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300/60 dark:border-purple-800 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isUlpan ? 'פְּעָלִים וּנְטִיּוֹת ✨' : 'Пеалим (спряжения и семья корня)'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Оборотная сторона: Перевод и детали (прямой режим) */
                <div className="space-y-2.5 sm:space-y-3 animate-in fade-in">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    {userProfile.ulpanMode ? 'פֵּרוּשׁ וּפְרָטִים' : 'Перевод и детали'}
                  </span>

                  {/* Visual on flipped side */}
                  {isUlpan ? (
                    <WordVisual
                      hebrew={currentWord.hebrew}
                      hebrewPlain={currentWord.hebrewPlain}
                      size="sm"
                      ulpanMode={true}
                    />
                  ) : (
                    getHebrewPictogram(currentWord.hebrew) && (() => {
                      const icon = getHebrewPictogram(currentWord.hebrew)!;
                      const isMale = icon.includes('♂');
                      const isFemale = icon.includes('♀');
                      return (
                        <div
                          className={`inline-flex items-center justify-center text-xl sm:text-2xl px-3 py-1 rounded-xl border font-bold select-none shadow-xs ${
                            isMale
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                              : isFemale
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {icon}
                        </div>
                      );
                    })()
                  )}

                  <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {currentWord.translation}
                  </div>
                  <div
                    dir="rtl"
                    className={`text-lg sm:text-2xl text-zinc-600 dark:text-zinc-300 font-bold ${
                      userProfile.fontStyle === 'cursive' ? 'font-cursive text-blue-500' : 'font-hebrew'
                    }`}
                  >
                    {currentWord.hebrew}
                  </div>
                  {!userProfile.ulpanMode && getWordTranscription(currentWord) && (
                    <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 -mt-1">
                      [{getWordTranscription(currentWord)}]
                    </p>
                  )}
                  {currentWord.root && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                      <span>{userProfile.ulpanMode ? 'שׁוֹרֶשׁ:' : 'Шореш:'}</span>
                      <span dir="rtl" className="font-bold">
                        {currentWord.root}
                      </span>
                    </div>
                  )}

                  {/* Кнопка ПЕАЛИМ для глаголов */}
                  {(currentWord.partOfSpeech === 'verb' || currentWord.hebrew.startsWith('לִ') || currentWord.hebrew.startsWith('לְ') || currentWord.hebrew.startsWith('לַ') || currentWord.hebrew.startsWith('לָ') || Boolean(currentWord.root)) && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPealim(currentWord);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300/60 dark:border-purple-800 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isUlpan ? 'פְּעָלִים וּנְטִיּוֹת ✨' : 'Пеалим (спряжения и семья корня)'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Действия для лицевой стороны (!isFlipped) */}
          {!isFlipped ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePrevWord}
                  className="py-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
                  title={isUlpan ? 'חֲזֹר לַמִּילָּה הַקּוֹדֶמֶת' : 'Предыдущее слово'}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{isUlpan ? 'קוֹדֶמֶת' : 'Назад'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlipCard}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>
                    {isUlpan ? 'הַצֵּג תְּשׁוּבָה' : 'Показать ответ'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Действия для открытой карточки (isFlipped) */
            <div className="space-y-2.5 animate-in fade-in">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleNextWord(1)}
                  className="py-3 sm:py-3.5 px-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-2 border-rose-400/80 dark:border-rose-700 font-extrabold text-sm sm:text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                  title={isUlpan ? 'שָׁכַחְתִּי' : 'Забыл (повторить скоро)'}
                >
                  <span>{isUlpan ? 'שָׁכַחְתִּי' : 'Забыл'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNextWord(3)}
                  className="py-3 sm:py-3.5 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-2 border-amber-400/80 dark:border-amber-700 font-extrabold text-sm sm:text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                  title={isUlpan ? 'בְּקֹשִׁי' : 'С трудом'}
                >
                  <span>{isUlpan ? 'בְּקֹשִׁי' : 'С трудом'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNextWord(5)}
                  className="py-3 sm:py-3.5 px-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400/80 dark:border-emerald-700 font-extrabold text-sm sm:text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                  title={isUlpan ? 'קַל' : 'Легко'}
                >
                  <span>{isUlpan ? 'קַל' : 'Легко'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={handlePrevWord}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition inline-flex items-center gap-1 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                  title={isUlpan ? 'חֲזֹר לַמִּילָּה הַקּוֹדֶמֶת' : 'Предыдущее слово'}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isUlpan ? 'קוֹדֶמֶת' : 'Назад'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {cardDirection === 'ru-he'
                      ? (isUlpan ? 'הַסְתֵּר עִבְרִית' : 'Скрыть иврит')
                      : (isUlpan ? 'הַסְתֵּר תַּרְגּוּם' : 'Перевернуть обратно')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* РЕЖИМ 2: КОНСТРУКТОР БУКВ */}
      {mode === 'builder' && (() => {
        const targetText = getCleanHebrewTarget(currentWord);
        const hasSpaces = targetText.includes(' ');

        return (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs text-zinc-400 font-semibold">
                {isUlpan
                  ? (hasSpaces ? 'הַרְכֵּב אֶת הַמִּשְׁפָּט מֵאוֹתִיּוֹת וּרְוָחִים:' : 'הַרְכֵּב אֶת הַמִּילָּה מֵאוֹתִיּוֹת:')
                  : (hasSpaces ? 'Соберите фразу по буквам и пробелам:' : 'Соберите слово по буквам:')}
              </span>
              {isUlpan ? (
                <div className="py-1">
                  <WordVisual
                    hebrew={currentWord.hebrew}
                    hebrewPlain={currentWord.hebrewPlain}
                    size="md"
                    ulpanMode={true}
                    className="mb-1"
                  />
                  <button
                    type="button"
                    onClick={() => speakHebrew(currentWord.hebrew)}
                    className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-xs inline-flex items-center gap-1.5 text-xs font-semibold"
                    title="השמע מילה"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>שְׁמַע</span>
                  </button>
                </div>
              ) : (
                <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                  {currentWord.translation}
                </div>
              )}
              {!isUlpan && userProfile.showTranscription && getWordTranscription(currentWord) && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  [{getWordTranscription(currentWord)}]
                </p>
              )}
            </div>

            {/* Блок подсказки "Показать правильно" */}
            {showHint && !builderSuccess && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 text-center space-y-2 animate-in fade-in zoom-in-95 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-hebrew">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isUlpan ? 'תְּשׁוּבָה נְכוֹנָה:' : 'Правильный ответ:'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => speakHebrew(currentWord.hebrew)}
                    className="p-1.5 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:bg-amber-300 transition cursor-pointer"
                    title={isUlpan ? 'השמע מילה' : 'Прослушать произношение'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div
                  dir="rtl"
                  className={`text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 ${
                    userProfile.fontStyle === 'cursive' ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
                  }`}
                >
                  {userProfile.showNikkud ? currentWord.hebrew : targetText}
                </div>

                {!isUlpan && getWordTranscription(currentWord) && (
                  <p className="text-xs font-medium text-amber-900/80 dark:text-amber-300/80">
                    [{getWordTranscription(currentWord)}]
                  </p>
                )}

                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoAssemble}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title={isUlpan ? 'הרכב אותיות באופן אוטומטי' : 'Автоматически собрать правильные буквы и пробелы'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isUlpan ? 'הַרְכֵּב נָכוֹן' : 'Собрать правильно'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Поле собранных букв */}
            <div
              dir="rtl"
              className={`min-h-[80px] p-4 rounded-2xl border-2 flex flex-wrap items-center justify-center gap-2 transition ${
                userProfile.fontStyle === 'cursive' ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
              } ${
                builderSuccess
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40'
                  : builderError
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 animate-shake'
                  : 'border-dashed border-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
              }`}
            >
              {builderSelected.length > 0 ? (
                builderSelected.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => handleUnselectTile(tile)}
                    className={`px-3 py-1.5 rounded-xl font-bold shadow-sm transition active:scale-95 cursor-pointer ${
                      tile.char === ' '
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs border border-amber-300 dark:border-amber-800 flex items-center gap-1'
                        : `bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 text-2xl md:text-3xl ${
                            userProfile.fontStyle === 'cursive'
                              ? 'font-cursive text-blue-600 dark:text-blue-400'
                              : 'font-hebrew'
                          }`
                    }`}
                    title={isUlpan ? 'לחץ להסרת אות' : 'Нажмите, чтобы вернуть символ'}
                  >
                    {tile.char === ' ' ? (
                      <>
                        <Space className="w-3 h-3" />
                        <span>{isUlpan ? 'רֶוַח' : 'Пробел'}</span>
                      </>
                    ) : (
                      tile.char
                    )}
                  </button>
                ))
              ) : (
                <span className="text-zinc-400 text-sm font-sans font-medium">
                  {isUlpan
                    ? (hasSpaces ? 'לַחֲצוּ עַל הָאוֹתִיּוֹת וְהָרְוָחִים לְמַטָּה...' : 'לַחֲצוּ עַל הָאוֹתִיּוֹת לְמַטָּה...')
                    : (hasSpaces ? 'Нажимайте на буквы и пробелы ниже...' : 'Нажимайте на буквы ниже...')}
                </span>
              )}
            </div>

            {/* Панель кнопок управления конструктором (Показать ответ / Стереть / Сброс) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-zinc-500 font-medium font-hebrew">
                {isUlpan
                  ? `אוֹתִיּוֹת: ${builderSelected.length} מִתּוֹךְ ${targetText.length}`
                  : `${hasSpaces ? 'Символов' : 'Букв'}: ${builderSelected.length} из ${targetText.length}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    showHint
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                  }`}
                  title={isUlpan ? 'הצג תשובה' : 'Показать правильный ответ'}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>
                    {isUlpan
                      ? (showHint ? 'הַסְתֵּר רֶמֶז' : 'הַצֵּג רֶמֶז')
                      : (showHint ? 'Скрыть ответ' : 'Показать правильно')}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={builderSelected.length === 0 || builderSuccess}
                  onClick={handleBackspace}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition flex items-center gap-1.5 cursor-pointer"
                  title={isUlpan ? 'מחק תו אחרון' : 'Удалить последний символ (Backspace)'}
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>{isUlpan ? 'מְחַק' : 'Стереть'}</span>
                </button>

                <button
                  type="button"
                  disabled={builderSelected.length === 0 || builderSuccess}
                  onClick={handleResetBuilder}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition flex items-center gap-1.5 cursor-pointer"
                  title={isUlpan ? 'אפס את כל האותיות' : 'Сбросить все буквы'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isUlpan ? 'אִפּוּס' : 'Сбросить'}</span>
                </button>
              </div>
            </div>

            {/* Блок подтверждения успеха (Появляется сразу при верном сборе) */}
            {builderSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg font-hebrew">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>{isUlpan ? '!מְצוּיָן! ✓' : '!מְצוּיָן! נָכוֹן (Верно!)'}</span>
                </div>

                <div
                  dir="rtl"
                  className={`text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300 ${
                    userProfile.fontStyle === 'cursive' ? 'font-cursive' : 'font-hebrew'
                  }`}
                >
                  {userProfile.showNikkud ? currentWord.hebrew : targetText}
                </div>

                {!isUlpan && userProfile.showTranscription && getWordTranscription(currentWord) && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    [{getWordTranscription(currentWord)}]
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={handlePrevWord}
                    className="py-3 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    title={isUlpan ? 'חֲזֹר לַמִּילָּה הַקּוֹדֶמֶת' : 'Предыдущее слово'}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{isUlpan ? 'קוֹדֶמֶת' : 'Назад'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNextWord(5)}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <span>{isUlpan ? 'הַמִּילָּה הַבָּאָה' : 'Следующее слово'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Плитки доступных букв и пробела */}
            {!builderSuccess && (
              <div dir="rtl" className="flex flex-wrap gap-2.5 justify-center pt-2">
                {builderAvailable.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => handleSelectTile(tile)}
                    className={`rounded-2xl font-bold shadow-sm transition active:scale-90 cursor-pointer ${
                      tile.char === ' '
                        ? 'px-4 py-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white border-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-1.5'
                        : `w-13 h-13 min-w-[50px] min-h-[50px] bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-2xl md:text-3xl border border-zinc-200 dark:border-zinc-700 ${
                            userProfile.fontStyle === 'cursive'
                              ? 'font-cursive text-3xl text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white'
                              : 'font-hebrew'
                          }`
                    }`}
                    title={tile.char === ' ' ? (isUlpan ? 'רווח' : 'Пробел (Space)') : `${isUlpan ? 'אות' : 'Буква'} ${tile.char}`}
                  >
                    {tile.char === ' ' ? (
                      <>
                        <Space className="w-4 h-4 shrink-0" />
                        <span>{isUlpan ? 'רֶוַח' : 'Пробел'}</span>
                      </>
                    ) : (
                      tile.char
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* РЕЖИМ 3: АУДИРОВАНИЕ */}
      {mode === 'listening' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
          <div className="text-center py-4">
            <button
              onClick={() => speakHebrew(currentWord.hebrew)}
              className="w-20 h-20 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
              title={isUlpan ? 'השמע שוב' : 'Прослушать снова'}
            >
              <Volume2 className="w-8 h-8" />
            </button>
            <p className="text-xs text-zinc-400 mt-3 font-hebrew">
              {isUlpan ? 'לַחֲצוּ לַהַשְׁמָעָה חוֹזֶרֶת' : 'Нажмите, чтобы прослушать слово еще раз'}
            </p>
          </div>

          {/* Варианты ответов */}
          <div className="grid grid-cols-1 gap-2.5">
            {quizOptions.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const correctOpt = isUlpan
                ? userProfile.showNikkud
                  ? currentWord.hebrew
                  : currentWord.hebrewPlain
                : currentWord.translation;
              const isCorrect = opt === correctOpt;

              let btnClass =
                'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';

              if (selectedAnswer) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
                } else if (isSelected) {
                  btnClass = 'bg-red-600 text-white border-red-600';
                }
              }

              return (
                <button
                  key={i}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleQuizSelect(opt)}
                  dir={isUlpan ? 'rtl' : 'ltr'}
                  className={`p-3.5 rounded-xl border text-sm transition cursor-pointer ${
                    isUlpan ? 'text-right font-hebrew text-lg' : 'text-left'
                  } ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Навигация в режиме аудирования */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrevWord}
              className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
              title={isUlpan ? 'חֲזֹר לַמִּילָּה הַקּוֹדֶמֶת' : 'Предыдущее слово'}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isUlpan ? 'מִילָּה קוֹדֶמֶת' : 'Предыдущее слово'}</span>
            </button>

            <button
              type="button"
              onClick={handleAdvanceNext}
              className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
              title={isUlpan ? 'דַּלֵּג לַמִּילָּה הַבָּאָה' : 'Перейти к следующему слову'}
            >
              <span>{isUlpan ? 'דַּלֵּג (הַבָּא)' : 'Пропустить (далее)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* РЕЖИМ: АВТО НА СЛУХ (Hands-Free Listening) */}
      {mode === 'auto_audio' && currentWord && (
        <div className="space-y-4">
          <div className="min-h-[260px] sm:min-h-[300px] bg-gradient-to-b from-white to-blue-50/30 dark:from-zinc-900 dark:to-blue-950/20 border-2 border-blue-200 dark:border-blue-900/60 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-between text-center relative select-none shadow-xl">
            {/* Верхний статус-бейдж фазы */}
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  <span>{isUlpan ? 'מַצָּב אוֹטוֹמָטִי' : 'Авто на слух'}</span>
                </span>
                {cardDirection === 'carousel' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    🔀 Карусель
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-zinc-400 mr-1 hidden sm:inline">Пауза:</span>
                {[2, 3, 4].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setAutoPauseSec(sec)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      autoPauseSec === sec
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                    title={`Пауза ${sec} секунды для размышления`}
                  >
                    {sec}с
                  </button>
                ))}
              </div>
            </div>

            {/* Центральная часть: Слово и индикатор паузы */}
            <div className="my-auto py-4 space-y-3 max-w-lg w-full">
              {/* Статус текущего шага */}
              <div className="flex items-center justify-center">
                {autoPhase === 'prompt' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>
                      {isCurrentCardFrontRussian ? 'Слушайте русский...' : 'Слушайте иврит...'}
                    </span>
                  </span>
                )}
                {autoPhase === 'pause' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                    <Timer className="w-3.5 h-3.5 animate-spin" />
                    <span>Вспомните и произнесите! ({autoCountdown}с)</span>
                  </span>
                )}
                {autoPhase === 'reveal' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Правильный перевод</span>
                  </span>
                )}
                {autoPhase === 'idle' && (
                  <span className="text-xs font-medium text-zinc-400">
                    Нажмите «Старт», чтобы запустить автоматическое воспроизведение
                  </span>
                )}
              </div>

              {/* Отображение слова */}
              <div className="space-y-2">
                <div
                  dir="rtl"
                  className={`text-3xl sm:text-5xl font-bold transition-all duration-300 ${
                    autoPhase === 'pause' && isCurrentCardFrontRussian
                      ? 'text-zinc-300 dark:text-zinc-700 opacity-40'
                      : 'text-zinc-900 dark:text-zinc-50'
                  } ${userProfile.fontStyle === 'cursive' ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'}`}
                >
                  {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                </div>

                {getWordTranscription(currentWord) && (
                  <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400">
                    [{getWordTranscription(currentWord)}]
                  </p>
                )}

                <div className="text-xl sm:text-2xl font-bold text-zinc-700 dark:text-zinc-200">
                  {currentWord.translation}
                </div>
              </div>
            </div>

            {/* Нижняя панель управления плеером (Play/Pause, Навигация) */}
            <div className="w-full flex items-center justify-between gap-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrevWord}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 transition flex items-center gap-1 cursor-pointer"
                title="Предыдущее слово"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying((prev) => !prev)}
                  className={`py-3 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer ${
                    isAutoPlaying
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{autoPhase === 'idle' ? 'Старт' : 'Продолжить'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => speakHebrew(currentWord.hebrew)}
                  className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Повторить произношение"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdvanceNext}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                title="Следующее слово"
              >
                <span className="hidden sm:inline">Далее</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно PEALIM во время тренировки */}
      {pealimModalVerb && (
        <div
          onClick={() => setPealimModalVerb(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 max-h-[90vh] overflow-y-auto relative"
          >
            {pealimModalVerb.loading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">
                  {isUlpan ? '⏳ טוֹעֵן פְּעָלִים...' : 'Загружаем спряжения и семью корня Pealim...'}
                </p>
              </div>
            ) : pealimModalVerb.conjugation ? (
              <VerbConjugationView
                conjugation={pealimModalVerb.conjugation}
                userProfile={userProfile}
                onBack={() => setPealimModalVerb(null)}
                onAddToVocabulary={(w) => {
                  addWordToPersonalDict(w);
                  if (onUpdateProfile) onUpdateProfile(loadUserProfile());
                }}
                isWordInPersonalVocab={isWordInPersonalDict(pealimModalVerb.word.hebrew, userProfile.personalVocabulary)}
              />
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {isUlpan ? (
                    <>
                      <span className="font-hebrew text-base">{pealimModalVerb.word.hebrew}</span>
                      {' — הַנְטָיָה אֵינָהּ זְמִינָה.'}
                    </>
                  ) : (
                    <>
                      {'Спряжения для глагола '}
                      <strong className="font-hebrew text-base">{pealimModalVerb.word.hebrew}</strong>
                      {' пока недоступны.'}
                    </>
                  )}
                </p>
                <button
                  onClick={() => setPealimModalVerb(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
                >
                  {isUlpan ? 'סְגוֹר' : 'Закрыть'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

