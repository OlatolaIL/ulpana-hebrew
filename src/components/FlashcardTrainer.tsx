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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Word, UserProfile, VerbConjugation } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { updateCardSRS, calculateWordMastery, addWordToPersonalDict, isWordInPersonalDict, loadUserProfile, markLessonTabCompleted, sortWordsBySRSPriority } from '@/lib/storage';
import { stripNikkud, getWordTranscription } from '@/lib/transcription';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';
import { getHebrewPictogram } from '@/lib/pictograms';
import { WordVisual } from '@/components/WordVisual';

interface FlashcardTrainerProps {
  initialWords: Word[];
  userProfile: UserProfile;
  onClose?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  customTitle?: string;
  initialMode?: 'flip' | 'builder' | 'listening';
  lessonId?: number;
  onContinueLesson?: (lessonId: number, nextTab: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone') => void;
}

type TrainerMode = 'flip' | 'builder' | 'listening';

interface Tile {
  id: string;
  char: string;
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
  lessonId,
  onContinueLesson,
}) => {
  const [words, setWords] = useState<Word[]>(() =>
    lessonId
      ? initialWords
      : sortWordsBySRSPriority(
          initialWords,
          userProfile.flashcardStats,
          userProfile.flashcardProgress
        )
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<TrainerMode>(initialMode || 'flip');
  const [isCompleted, setIsCompleted] = useState(false);


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
    const otherOptions = words
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
  }, [currentIndex, mode, currentWord, words, userProfile.ulpanMode, userProfile.showNikkud]);

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

  const handleNextWord = (quality = 4) => {
    handleRecordSRS(quality);

    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
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

  const handleAdvanceNext = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
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

  const handleForgotFlip = () => {
    handleRecordSRS(1);
    setIsFlipped(true);
  };

  const handleStruggleFlip = () => {
    handleRecordSRS(3);
    setIsFlipped(true);
  };

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
              ? (lessonId ? `חֲזַרְתֶּם עַל כָּל ${words.length} הַמִּילִּים. שָׁלָב 2/5 הוּשְׁלַם.` : `חֲזַרְתֶּם עַל ${words.length} מִילִּים.`)
              : (lessonId
                  ? `Вы повторили все ${words.length} слов(а). Раздел «Словарь» зачтен (этап 2/5).`
                  : `Вы повторили ${words.length} слов(а). Прогресс сохранен в интервальной памяти.`)}
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

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onContinueLesson) {
                      onContinueLesson(lessonId, 'vocab');
                    } else if (onClose) {
                      onClose();
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  {isUlpan ? 'חֲזָרָה לַשִּׁיעוּר' : 'Вернуться в урок'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsCompleted(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  {isUlpan ? 'תִּרְגּוּל נוֹסָף' : 'Повторить карточки'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsCompleted(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'תִּרְגּוּל שׁוּב' : 'Повторить снова'}
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
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-hebrew">
            <Layers className="w-3.5 h-3.5" />
            <span>{displayTitle}</span>
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
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
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

          <div className="text-xs font-semibold text-zinc-500">
            {isUlpan
              ? `${currentIndex + 1} מִתּוֹךְ ${words.length}`
              : `${currentIndex + 1} из ${words.length}`}
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* РЕЖИМ 1: ФЛИП-КАРТОЧКА */}
      {mode === 'flip' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Сама карточка */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[200px] sm:min-h-[270px] bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-blue-500/50 transition duration-300 relative select-none"
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(currentWord.hebrew);
                }}
                className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-sm"
                title={isUlpan ? 'הַשְׁמַע' : 'Озвучить'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {!isFlipped ? (
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
            ) : (
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
            )}
          </div>

          {/* Действия для лицевой стороны (!isFlipped) */}
          {!isFlipped ? (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="w-full py-3 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm border border-blue-200 dark:border-blue-800 shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>{isUlpan ? 'הַצֵּג תַּרְגּוּם וּפְרָטִים' : 'Показать перевод и детали'}</span>
              </button>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleForgotFlip}
                  className="py-2.5 sm:py-3 px-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-2 border-rose-400/80 dark:border-rose-700 font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                  title="Открыть карточку и зафиксировать повторение"
                >
                  <span>{isUlpan ? 'שָׁכַחְתִּי ↩' : 'Снова / Забыл ↩'}</span>
                  <span className="text-[10px] text-rose-500/80 dark:text-rose-400 font-normal hidden sm:inline">
                    {isUlpan ? 'הַצֵּג תְּשׁוּבָה' : 'Показать ответ'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleStruggleFlip}
                  className="py-2.5 sm:py-3 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-2 border-amber-400/80 dark:border-amber-700 font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                  title="Проверить себя (3 балла)"
                >
                  <span>{isUlpan ? 'בְּקֹשִׁי 🔍' : 'С трудом 🔍'}</span>
                  <span className="text-[10px] text-amber-500/80 dark:text-amber-400 font-normal hidden sm:inline">
                    {isUlpan ? '3 נְקֻדּוֹת' : '3 балла'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNextWord(5)}
                  className="py-2.5 sm:py-3 px-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400/80 dark:border-emerald-700 font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
                  title="Знаю сразу (5 баллов)"
                >
                  <span>{isUlpan ? 'יוֹדֵעַ ✓' : 'Легко / Знаю ✓'}</span>
                  <span className="text-[10px] text-emerald-500/80 dark:text-emerald-400 font-normal hidden sm:inline">
                    {isUlpan ? '5 נְקֻדּוֹת' : '5 баллов'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Действия для открытой карточки (isFlipped) */
            <div className="space-y-2.5 animate-in fade-in">
              <button
                type="button"
                onClick={handleAdvanceNext}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <span>{isUlpan ? 'הַמִּילָּה הַבָּאָה' : 'Следующее слово'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleNextWord(1)}
                  className="py-2 sm:py-2.5 px-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <span>{isUlpan ? 'שָׁכַחְתִּי (1)' : 'Забыл (1)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNextWord(3)}
                  className="py-2 sm:py-2.5 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <span>{isUlpan ? 'בְּקֹשִׁי (3)' : 'С трудом (3)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNextWord(5)}
                  className="py-2 sm:py-2.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-xs shadow-xs transition active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <span>{isUlpan ? 'קַל (5)' : 'Легко (5)'}</span>
                </button>
              </div>

              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isUlpan ? 'הַסְתֵּר תַּרְגּוּם' : 'Перевернуть обратно'}</span>
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

                <button
                  type="button"
                  onClick={() => handleNextWord(5)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>{isUlpan ? 'הַמִּילָּה הַבָּאָה' : 'Следующее слово'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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

