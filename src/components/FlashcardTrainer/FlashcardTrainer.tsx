'use client';

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Word, UserProfile, VerbConjugation } from '@/types';
import { speakHebrew, speakRussian, stopSpeech } from '@/lib/speech';
import {
  updateCardSRS,
  loadUserProfile,
  saveUserProfile,
  markLessonTabCompleted,
  sortWordsBySRSPriority,
  shuffleWords,
} from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { useModalHistory } from '@/lib/useHistoryState';
import { TrainerMode, Tile, FlashcardTrainerProps } from './types';
import { splitWordsIntoParts, getCleanHebrewTarget, generateCarouselDirections } from './helpers';
import { TrainerHeader } from './TrainerHeader';
import { TrainerVictoryModal } from './TrainerVictoryModal';
import { FlipCardMode } from './modes/FlipCardMode';
import { BuilderMode } from './modes/BuilderMode';
import { ListeningMode } from './modes/ListeningMode';
import { AutoAudioMode } from './modes/AutoAudioMode';
import { PealimModal } from './PealimModal';

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
  const stableCanonicalParts = useMemo(() => splitWordsIntoParts(initialWords), [initialWords]);
  const [parts, setParts] = useState<Word[][]>(() => stableCanonicalParts);
  const [activePartIndex, setActivePartIndex] = useState<number>(0);
  const [completedPartIndices, setCompletedPartIndices] = useState<number[]>([]);
  const [partCompletionStatus, setPartCompletionStatus] = useState<
    'idle' | 'part_completed' | 'all_parts_completed'
  >('idle');

  // Активный набор слов: выбранная часть либо все слова колоды
  const words =
    isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]
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
  const [autoPhase, setAutoPhase] = useState<'idle' | 'prompt' | 'pause' | 'reveal' | 'paused'>('idle');
  const [autoCountdown, setAutoCountdown] = useState(0);
  const [isAutoLooping, setIsAutoLooping] = useState(true);
  const [autoLoopCount, setAutoLoopCount] = useState(1);

  const handleShuffleWords = () => {
    setCarouselDirections(generateCarouselDirections(words.length));
    if (isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]) {
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
      setCarouselDirections(
        generateCarouselDirections(stableCanonicalParts[0]?.length || initialWords.length)
      );
      setCurrentIndex(0);
      setIsFlipped(false);
      setPartCompletionStatus('idle');
      setIsCompleted(false);
    } else {
      setIsSplitMode(false);
      setActivePartIndex(-1);
      setCarouselDirections(generateCarouselDirections(masterWords.length));
      setCurrentIndex(0);
      setIsFlipped(false);
      setPartCompletionStatus('idle');
      setIsCompleted(false);
    }
  };

  const handleSelectPart = (idx: number) => {
    const targetLength = parts[idx]?.length || masterWords.length;
    setCarouselDirections(generateCarouselDirections(targetLength));
    setActivePartIndex(idx);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPartCompletionStatus('idle');
    setIsCompleted(false);
  };

  // Направление карточек: 'he-ru', 'ru-he' или 'carousel'
  const [cardDirection, setCardDirection] = useState<'he-ru' | 'ru-he' | 'carousel'>(() => {
    if (initialDirection) return initialDirection;
    if (userProfile.flashcardDirection) return userProfile.flashcardDirection as any;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flashcard_direction');
      if (saved === 'ru-he' || saved === 'he-ru' || saved === 'carousel') return saved;
    }
    return 'he-ru';
  });

  // Направления карточек для режима "Карусель (микс)" (true = Русский -> Иврит, false = Иврит -> Русский)
  const [carouselDirections, setCarouselDirections] = useState<boolean[]>(() =>
    generateCarouselDirections(masterWords.length)
  );

  const handleToggleDirection = () => {
    const nextDir: 'he-ru' | 'ru-he' | 'carousel' =
      cardDirection === 'he-ru'
        ? 'ru-he'
        : cardDirection === 'ru-he'
        ? 'carousel'
        : 'he-ru';
    if (nextDir === 'carousel') {
      setCarouselDirections(generateCarouselDirections(words.length));
    }
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

  const handleToggleFontStyle = () => {
    const nextStyle: 'print' | 'cursive' =
      userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
    if (onUpdateProfile) onUpdateProfile(updated);
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
  const isCurrentCardFrontRussian =
    cardDirection === 'ru-he' ||
    (cardDirection === 'carousel' &&
      (carouselDirections[currentIndex] ?? (currentIndex % 2 === 1)));

  // Перезапуск цикла воспроизведения со случайным перемешиванием слов и направлений
  const reshuffleAndRestartLoop = () => {
    setAutoLoopCount((prev) => prev + 1);
    setCarouselDirections(generateCarouselDirections(words.length));

    const lastFinishedWord = words[currentIndex];
    if (isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]) {
      setParts((prev) => {
        const next = [...prev];
        const currentPart = next[activePartIndex];
        let shuffled = shuffleWords(currentPart);
        if (currentPart.length > 1 && lastFinishedWord && shuffled[0]?.id === lastFinishedWord.id) {
          shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
        }
        next[activePartIndex] = shuffled;
        return next;
      });
    } else {
      setMasterWords((prev) => {
        let shuffled = shuffleWords(prev);
        if (prev.length > 1 && lastFinishedWord && shuffled[0]?.id === lastFinishedWord.id) {
          shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
        }
        return shuffled;
      });
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    if (!currentWord) return;
    setIsFlipped(false);
    setSelectedAnswer(null);
    setBuilderError(false);
    setBuilderSuccess(false);

    if (mode === 'listening') {
      speakHebrew(currentWord.hebrew);
    }

    const targetText = getCleanHebrewTarget(currentWord);
    const rawChars = targetText.split('');
    const tiles: Tile[] = rawChars.map((char, index) => ({
      id: `tile-${index}-${char}-${Math.random().toString(36).substr(2, 4)}`,
      char: char,
    }));
    setBuilderAvailable([...tiles].sort(() => Math.random() - 0.5));
    setBuilderSelected([]);
    setShowHint(false);

    const pool = words.length >= 4 ? words : masterWords;
    const otherOptions = pool
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.translation);
    const currentOpt = currentWord.translation;

    const shuffledOthers = otherOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOpts = [...shuffledOthers, currentOpt].sort(() => Math.random() - 0.5);
    setQuizOptions(allOpts);
  }, [
    currentIndex,
    mode,
    currentWord,
    words,
    masterWords,
    userProfile.showNikkud,
  ]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Авто на слух (Hands-Free)
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

      const promptIsRussian = isCurrentCardFrontRussian;

      setAutoPhase('prompt');
      if (promptIsRussian) {
        await speakRussian(targetWord.translation);
      } else {
        await speakHebrew(targetWord.hebrew);
      }
      if (isCancelled) return;

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

      setAutoPhase('reveal');
      if (promptIsRussian) {
        await speakHebrew(targetWord.hebrew);
      } else {
        await speakRussian(targetWord.translation);
      }
      if (isCancelled) return;

      await new Promise((resolve) => {
        timer = setTimeout(resolve, 1500);
      });
      if (isCancelled) return;

      if (currentIndex + 1 < words.length) {
        setCurrentIndex((prev) => prev + 1);
      } else if (isAutoLooping) {
        reshuffleAndRestartLoop();
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
  }, [
    mode,
    isAutoPlaying,
    currentIndex,
    autoPauseSec,
    cardDirection,
    isCompleted,
    words,
    isAutoLooping,
    autoLoopCount,
    isCurrentCardFrontRussian,
  ]);

  const handleAutoStart = () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);
  };

  const handleAutoPause = () => {
    setIsAutoPlaying(false);
    setAutoPhase('paused');
    stopSpeech();
  };

  const handleAutoStop = () => {
    setIsAutoPlaying(false);
    setAutoPhase('idle');
    setAutoCountdown(0);
    setCurrentIndex(0);
    setAutoLoopCount(1);
    stopSpeech();
  };

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
    } else if (mode === 'auto_audio' && isAutoLooping && words.length > 1) {
      setCurrentIndex(words.length - 1);
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
    } else if (mode === 'auto_audio' && isAutoLooping) {
      reshuffleAndRestartLoop();
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

  // Горячие клавиши для режима карточек
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

  // Горячие клавиши для конструктора букв
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
    const correctOpt = currentWord.translation;
    const isCorrect = option === correctOpt;

    if (isCorrect) {
      speakHebrew(currentWord.hebrew);
      setTimeout(() => handleNextWord(5), 900);
    } else {
      setTimeout(() => handleNextWord(1), 1500);
    }
  };

  // Если состояние победы/завершения:
  if (partCompletionStatus === 'part_completed') {
    return (
      <TrainerVictoryModal
        status="part_completed"
        lessonId={lessonId}
        activePartIndex={activePartIndex}
        parts={parts}
        wordsLength={words.length}
        masterWordsLength={masterWords.length}
        completedPartIndices={completedPartIndices}
        canSplit={canSplit}
        onNextPart={(nextIdx) => {
          setActivePartIndex(nextIdx);
          setCurrentIndex(0);
          setIsFlipped(false);
          setPartCompletionStatus('idle');
        }}
        onRepeatPart={() => {
          if (isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]) {
            setParts((prev) => {
              const next = [...prev];
              next[activePartIndex] = shuffleWords(next[activePartIndex]);
              return next;
            });
          }
          setCarouselDirections(generateCarouselDirections(words.length));
          setCurrentIndex(0);
          setIsFlipped(false);
          setPartCompletionStatus('idle');
        }}
        onAllWordsTogether={() => {
          setActivePartIndex(-1);
          setCarouselDirections(generateCarouselDirections(masterWords.length));
          setCurrentIndex(0);
          setIsFlipped(false);
          setPartCompletionStatus('idle');
        }}
        onContinueLesson={onContinueLesson}
        onClose={onClose}
        onRestart={() => {}}
        onStartSplitMode={() => {}}
        onShuffleRestart={() => {}}
      />
    );
  }

  if (partCompletionStatus === 'all_parts_completed') {
    return (
      <TrainerVictoryModal
        status="all_parts_completed"
        lessonId={lessonId}
        activePartIndex={activePartIndex}
        parts={parts}
        wordsLength={words.length}
        masterWordsLength={masterWords.length}
        completedPartIndices={completedPartIndices}
        canSplit={canSplit}
        onNextPart={() => {}}
        onRepeatPart={() => {
          if (isSplitMode && canSplit && activePartIndex >= 0 && parts[activePartIndex]) {
            setParts((prev) => {
              const next = [...prev];
              next[activePartIndex] = shuffleWords(next[activePartIndex]);
              return next;
            });
          }
          setCarouselDirections(generateCarouselDirections(words.length));
          setCurrentIndex(0);
          setIsFlipped(false);
          setPartCompletionStatus('idle');
        }}
        onAllWordsTogether={() => {
          setActivePartIndex(-1);
          setCarouselDirections(generateCarouselDirections(masterWords.length));
          setCurrentIndex(0);
          setIsFlipped(false);
          setPartCompletionStatus('idle');
        }}
        onContinueLesson={onContinueLesson}
        onClose={onClose}
        onRestart={() => {
          setCarouselDirections(generateCarouselDirections(words.length));
          setCurrentIndex(0);
          setIsFlipped(false);
          setPartCompletionStatus('idle');
        }}
        onStartSplitMode={() => {}}
        onShuffleRestart={() => {}}
      />
    );
  }

  if (!currentWord || isCompleted) {
    return (
      <TrainerVictoryModal
        status="completed"
        lessonId={lessonId}
        activePartIndex={activePartIndex}
        parts={parts}
        wordsLength={words.length}
        masterWordsLength={masterWords.length}
        completedPartIndices={completedPartIndices}
        canSplit={canSplit}
        onNextPart={() => {}}
        onRepeatPart={() => {}}
        onAllWordsTogether={() => {}}
        onContinueLesson={onContinueLesson}
        onClose={onClose}
        onRestart={() => {
          if (isShuffled) {
            setMasterWords((prev) => shuffleWords(prev));
          }
          setCarouselDirections(generateCarouselDirections(words.length));
          setCurrentIndex(0);
          setIsCompleted(false);
          setPartCompletionStatus('idle');
        }}
        onStartSplitMode={() => {
          setIsSplitMode(true);
          setActivePartIndex(0);
          setCompletedPartIndices([]);
          setCarouselDirections(generateCarouselDirections(parts[0]?.length || 10));
          setCurrentIndex(0);
          setIsCompleted(false);
          setPartCompletionStatus('idle');
        }}
        onShuffleRestart={() => {
          handleShuffleWords();
          setIsCompleted(false);
          setPartCompletionStatus('idle');
        }}
      />
    );
  }

  const displayTitle = customTitle;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <TrainerHeader
        displayTitle={displayTitle}
        isSplitMode={isSplitMode}
        canSplit={canSplit}
        activePartIndex={activePartIndex}
        parts={parts}
        completedPartIndices={completedPartIndices}
        currentWord={currentWord}
        userProfile={userProfile}
        mode={mode}
        cardDirection={cardDirection}
        isShuffled={isShuffled}
        shuffleToast={shuffleToast}
        currentIndex={currentIndex}
        wordsLength={words.length}
        masterWordsLength={masterWords.length}
        onSetMode={(m) => {
          if (mode === 'auto_audio') handleAutoStop();
          setMode(m);
          if (m === 'auto_audio') setIsAutoPlaying(true);
        }}
        onToggleSplitMode={handleToggleSplitMode}
        onToggleDirection={handleToggleDirection}
        onShuffleWords={handleShuffleWords}
        onToggleFontStyle={handleToggleFontStyle}
        onPrevWord={handlePrevWord}
        onAdvanceNext={handleAdvanceNext}
        onSelectPart={handleSelectPart}
      />

      {mode === 'flip' && (
        <FlipCardMode
          currentWord={currentWord}
          userProfile={userProfile}
          isFlipped={isFlipped}
          isCurrentCardFrontRussian={isCurrentCardFrontRussian}
          cardDirection={cardDirection}
          currentIndex={currentIndex}
          onFlipCard={handleFlipCard}
          onPrevWord={handlePrevWord}
          onNextWord={handleNextWord}
          onOpenPealim={handleOpenPealim}
          onSpeakHebrew={speakHebrew}
        />
      )}

      {mode === 'builder' && (
        <BuilderMode
          currentWord={currentWord}
          userProfile={userProfile}
          currentIndex={currentIndex}
          showHint={showHint}
          builderSuccess={builderSuccess}
          builderError={builderError}
          builderSelected={builderSelected}
          builderAvailable={builderAvailable}
          onToggleHint={() => setShowHint((prev) => !prev)}
          onSelectTile={handleSelectTile}
          onUnselectTile={handleUnselectTile}
          onBackspace={handleBackspace}
          onResetBuilder={handleResetBuilder}
          onAutoAssemble={handleAutoAssemble}
          onPrevWord={handlePrevWord}
          onNextWord={handleNextWord}
          onSpeakHebrew={speakHebrew}
        />
      )}

      {mode === 'listening' && (
        <ListeningMode
          currentWord={currentWord}
          currentIndex={currentIndex}
          quizOptions={quizOptions}
          selectedAnswer={selectedAnswer}
          userProfile={userProfile}
          onQuizSelect={handleQuizSelect}
          onPrevWord={handlePrevWord}
          onAdvanceNext={handleAdvanceNext}
          onSpeakHebrew={speakHebrew}
        />
      )}

      {mode === 'auto_audio' && (
        <AutoAudioMode
          currentWord={currentWord}
          userProfile={userProfile}
          isCurrentCardFrontRussian={isCurrentCardFrontRussian}
          cardDirection={cardDirection}
          currentIndex={currentIndex}
          isAutoPlaying={isAutoPlaying}
          isAutoLooping={isAutoLooping}
          autoLoopCount={autoLoopCount}
          autoPhase={autoPhase}
          autoCountdown={autoCountdown}
          autoPauseSec={autoPauseSec}
          onToggleAutoLooping={() => setIsAutoLooping((prev) => !prev)}
          onSetAutoPauseSec={setAutoPauseSec}
          onAutoStart={handleAutoStart}
          onAutoPause={handleAutoPause}
          onAutoStop={handleAutoStop}
          onPrevWord={handlePrevWord}
          onAdvanceNext={handleAdvanceNext}
          onSpeakHebrew={speakHebrew}
          onShuffleWords={handleShuffleWords}
        />
      )}

      <PealimModal
        verbData={pealimModalVerb}
        userProfile={userProfile}
        onClose={() => setPealimModalVerb(null)}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
};
