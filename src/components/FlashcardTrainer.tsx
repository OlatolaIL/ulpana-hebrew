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
import { updateCardSRS, calculateWordMastery, addWordToPersonalDict, isWordInPersonalDict, loadUserProfile } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';

interface FlashcardTrainerProps {
  initialWords: Word[];
  userProfile: UserProfile;
  onClose?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  customTitle?: string;
  initialMode?: 'flip' | 'builder' | 'listening';
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
}) => {
  const [words, setWords] = useState<Word[]>(initialWords);
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
    const otherTranslations = words
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.translation);
    const shuffledOthers = otherTranslations.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOpts = [...shuffledOthers, currentWord.translation].sort(() => Math.random() - 0.5);
    setQuizOptions(allOpts);
  }, [currentIndex, mode, currentWord, words]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleNextWord = (quality = 4) => {
    if (currentWord) {
      updateCardSRS(currentWord.id, quality);
    }

    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      triggerCelebration();
    }
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
    const isCorrect = option === currentWord.translation;

    if (isCorrect) {
      speakHebrew(currentWord.hebrew);
      setTimeout(() => handleNextWord(5), 900);
    } else {
      setTimeout(() => handleNextWord(1), 1500);
    }
  };

  if (!currentWord || isCompleted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
          <Award className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !כָּל הַכָּבוֹד
          </h2>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Отличная работа! Тренировка завершена.
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Вы повторили {words.length} слов(а). Прогресс сохранен в интервальной памяти.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsCompleted(false);
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            Повторить снова
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              Вернуться
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Заголовок тренировки (если есть customTitle) */}
      {customTitle && (
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{customTitle}</span>
          </div>
          {currentWord && (() => {
            const mastery = calculateWordMastery(userProfile.flashcardProgress?.[currentWord.id]);
            return (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mastery.badgeColor}`}>
                Знание: {mastery.score}% ({mastery.label})
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
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'flip'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Флип
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'builder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Конструктор
          </button>
          <button
            onClick={() => setMode('listening')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'listening'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            На слух
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
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Переключить шрифт карточек: Печатный / Рукописный"
          >
            {userProfile.fontStyle === 'cursive' ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>

          <div className="text-xs font-semibold text-zinc-500">
            {currentIndex + 1} из {words.length}
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
                title="Озвучить"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {!isFlipped ? (
              <div className="space-y-2 sm:space-y-3">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                  Иврит (нажмите для перевода)
                </span>
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
                {userProfile.showTranscription && (
                  <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                    [{currentWord.transcription}]
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3 animate-in fade-in">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                  Перевод и детали
                </span>
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
                {currentWord.root && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    <span>Шореш:</span>
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300/60 dark:border-purple-800 shadow-sm transition active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Пеалим (спряжения и семья корня)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Кнопки оценки легкости (SRS) - всегда на виду и яркие */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => handleNextWord(1)}
              className="py-2.5 sm:py-3.5 px-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-2 border-rose-400/80 dark:border-rose-700 font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
            >
              <span>Снова / Забыл</span>
              <span className="text-[10px] text-rose-500/80 dark:text-rose-400 font-normal hidden sm:inline">1 балл</span>
            </button>
            <button
              onClick={() => handleNextWord(3)}
              className="py-2.5 sm:py-3.5 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-2 border-amber-400/80 dark:border-amber-700 font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
            >
              <span>С трудом</span>
              <span className="text-[10px] text-amber-500/80 dark:text-amber-400 font-normal hidden sm:inline">3 балла</span>
            </button>
            <button
              onClick={() => handleNextWord(5)}
              className="py-2.5 sm:py-3.5 px-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400/80 dark:border-emerald-700 font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
            >
              <span>Легко / Знаю</span>
              <span className="text-[10px] text-emerald-500/80 dark:text-emerald-400 font-normal hidden sm:inline">5 баллов</span>
            </button>
          </div>
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
                {hasSpaces ? 'Соберите фразу по буквам и пробелам:' : 'Соберите слово по буквам:'}
              </span>
              <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                {currentWord.translation}
              </div>
              {userProfile.showTranscription && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  [{currentWord.transcription}]
                </p>
              )}
            </div>

            {/* Блок подсказки "Показать правильно" */}
            {showHint && !builderSuccess && (
              <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 text-center space-y-2 animate-in fade-in zoom-in-95 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Правильный ответ:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => speakHebrew(currentWord.hebrew)}
                    className="p-1.5 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:bg-amber-300 transition"
                    title="Прослушать произношение"
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

                {currentWord.transcription && (
                  <p className="text-xs font-medium text-amber-900/80 dark:text-amber-300/80">
                    [{currentWord.transcription}]
                  </p>
                )}

                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoAssemble}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
                    title="Автоматически собрать правильные буквы и пробелы"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Собрать правильно</span>
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
                    className={`px-3 py-1.5 rounded-xl font-bold shadow-sm transition active:scale-95 ${
                      tile.char === ' '
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs border border-amber-300 dark:border-amber-800 flex items-center gap-1'
                        : `bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 text-2xl md:text-3xl ${
                            userProfile.fontStyle === 'cursive'
                              ? 'font-cursive text-blue-600 dark:text-blue-400'
                              : 'font-hebrew'
                          }`
                    }`}
                    title="Нажмите, чтобы вернуть символ"
                  >
                    {tile.char === ' ' ? (
                      <>
                        <Space className="w-3 h-3" />
                        <span>Пробел</span>
                      </>
                    ) : (
                      tile.char
                    )}
                  </button>
                ))
              ) : (
                <span className="text-zinc-400 text-sm font-sans font-medium">
                  {hasSpaces ? 'Нажимайте на буквы и пробелы ниже...' : 'Нажимайте на буквы ниже...'}
                </span>
              )}
            </div>

            {/* Панель кнопок управления конструктором (Показать ответ / Стереть / Сброс) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-zinc-500 font-medium">
                {hasSpaces ? 'Символов' : 'Букв'}: {builderSelected.length} из {targetText.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHint((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                    showHint
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                  }`}
                  title="Показать правильный ответ"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Скрыть ответ' : 'Показать правильно'}</span>
                </button>

                <button
                  type="button"
                  disabled={builderSelected.length === 0 || builderSuccess}
                  onClick={handleBackspace}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition flex items-center gap-1.5"
                  title="Удалить последний символ (Backspace)"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Стереть</span>
                </button>

                <button
                  type="button"
                  disabled={builderSelected.length === 0 || builderSuccess}
                  onClick={handleResetBuilder}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition flex items-center gap-1.5"
                  title="Сбросить все буквы"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить</span>
                </button>
              </div>
            </div>

            {/* Блок подтверждения успеха (Появляется сразу при верном сборе) */}
            {builderSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <span>!מְצוּיָן! נָכוֹן (Верно!)</span>
                </div>

                <div
                  dir="rtl"
                  className={`text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300 ${
                    userProfile.fontStyle === 'cursive' ? 'font-cursive' : 'font-hebrew'
                  }`}
                >
                  {userProfile.showNikkud ? currentWord.hebrew : targetText}
                </div>

                {userProfile.showTranscription && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    [{currentWord.transcription}]
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleNextWord(5)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Следующее слово</span>
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
                    className={`rounded-2xl font-bold shadow-sm transition active:scale-90 ${
                      tile.char === ' '
                        ? 'px-4 py-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white border-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-1.5'
                        : `w-13 h-13 min-w-[50px] min-h-[50px] bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-2xl md:text-3xl border border-zinc-200 dark:border-zinc-700 ${
                            userProfile.fontStyle === 'cursive'
                              ? 'font-cursive text-3xl text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white'
                              : 'font-hebrew'
                          }`
                    }`}
                    title={tile.char === ' ' ? 'Пробел (Space)' : `Буква ${tile.char}`}
                  >
                    {tile.char === ' ' ? (
                      <>
                        <Space className="w-4 h-4 shrink-0" />
                        <span>Пробел</span>
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
              className="w-20 h-20 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <Volume2 className="w-8 h-8" />
            </button>
            <p className="text-xs text-zinc-400 mt-3">Нажмите, чтобы прослушать слово еще раз</p>
          </div>

          {/* Варианты ответов */}
          <div className="grid grid-cols-1 gap-2.5">
            {quizOptions.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === currentWord.translation;

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
                  className={`p-3.5 rounded-xl border text-sm text-left transition ${btnClass}`}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            {pealimModalVerb.loading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">Загружаем спряжения и семью корня Pealim...</p>
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
                  Спряжения для глагола <strong className="font-hebrew text-base">{pealimModalVerb.word.hebrew}</strong> пока недоступны.
                </p>
                <button
                  onClick={() => setPealimModalVerb(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

