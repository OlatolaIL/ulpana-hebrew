'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  RotateCw,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Word, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { updateCardSRS } from '@/lib/storage';

interface FlashcardTrainerProps {
  initialWords: Word[];
  userProfile: UserProfile;
  onClose?: () => void;
}

type TrainerMode = 'flip' | 'builder' | 'listening';

export const FlashcardTrainer: React.FC<FlashcardTrainerProps> = ({
  initialWords,
  userProfile,
  onClose,
}) => {
  const [words, setWords] = useState<Word[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<TrainerMode>('flip');
  const [isCompleted, setIsCompleted] = useState(false);

  // Для режима конструктора букв
  const [builderLetters, setBuilderLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [builderError, setBuilderError] = useState(false);

  // Для режима аудирования
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (!currentWord) return;
    setIsFlipped(false);
    setSelectedAnswer(null);
    setBuilderError(false);

    // Озвучиваем слово при показе в режиме аудирования
    if (mode === 'listening') {
      speakHebrew(currentWord.hebrew);
    }

    // Подготовка для режима конструктора букв
    const letters = currentWord.hebrewPlain.split('').filter((c) => c !== ' ');
    // Перемешиваем буквы
    setBuilderLetters([...letters].sort(() => Math.random() - 0.5));
    setSelectedLetters([]);

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

  const handleLetterClick = (letter: string, index: number) => {
    const nextSelected = [...selectedLetters, letter];
    setSelectedLetters(nextSelected);

    const remaining = [...builderLetters];
    remaining.splice(index, 1);
    setBuilderLetters(remaining);

    const targetWord = currentWord.hebrewPlain.replace(/\s+/g, '');
    const currentInput = nextSelected.join('');

    if (currentInput === targetWord) {
      // Успешно собрали слово!
      speakHebrew(currentWord.hebrew);
      setTimeout(() => handleNextWord(5), 700);
    } else if (!targetWord.startsWith(currentInput)) {
      setBuilderError(true);
      setTimeout(() => {
        setBuilderError(false);
        // Сброс
        const fullLetters = currentWord.hebrewPlain.split('').filter((c) => c !== ' ');
        setBuilderLetters([...fullLetters].sort(() => Math.random() - 0.5));
        setSelectedLetters([]);
      }, 800);
    }
  };

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
    <div className="max-w-xl mx-auto space-y-6">
      {/* Шапка тренировки и выбор режима */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('flip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'flip'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Флип-карточка
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'builder'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Сборка из букв
          </button>
          <button
            onClick={() => setMode('listening')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'listening'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Аудирование
          </button>
        </div>

        <div className="text-xs font-semibold text-zinc-500">
          Слово {currentIndex + 1} из {words.length}
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
        <div className="space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[300px] bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-blue-500/50 transition duration-300 relative select-none"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakHebrew(currentWord.hebrew);
                }}
                className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 transition shadow-sm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Иврит (нажмите для перевода)
                </span>
                <div
                  dir="rtl"
                  className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew"
                >
                  {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                </div>
                {userProfile.showTranscription && (
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    [{currentWord.transcription}]
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Перевод и детали
                </span>
                <div className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentWord.translation}
                </div>
                <div
                  dir="rtl"
                  className="text-xl text-zinc-500 dark:text-zinc-400 font-hebrew"
                >
                  {currentWord.hebrew}
                </div>
                {currentWord.root && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    <span>Шореш:</span>
                    <span dir="rtl" className="font-bold">
                      {currentWord.root}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Кнопки оценки легкости (SRS) */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleNextWord(1)}
              className="py-3 px-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold text-xs hover:bg-rose-100 transition"
            >
              Снова / Забыл
            </button>
            <button
              onClick={() => handleNextWord(3)}
              className="py-3 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-semibold text-xs hover:bg-amber-100 transition"
            >
              Вспомнил с трудом
            </button>
            <button
              onClick={() => handleNextWord(5)}
              className="py-3 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-semibold text-xs hover:bg-emerald-100 transition"
            >
              Легко / Знаю
            </button>
          </div>
        </div>
      )}

      {/* РЕЖИМ 2: КОНСТРУКТОР БУКВ */}
      {mode === 'builder' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs text-zinc-400 font-semibold">Соберите слово по буквам:</span>
            <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              {currentWord.translation}
            </div>
            {userProfile.showTranscription && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                [{currentWord.transcription}]
              </p>
            )}
          </div>

          {/* Поле собранных букв */}
          <div
            dir="rtl"
            className={`min-h-[64px] p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-hebrew text-3xl font-bold transition ${
              builderError
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                : 'border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-zinc-900 dark:text-zinc-50'
            }`}
          >
            {selectedLetters.length > 0 ? selectedLetters.join('') : '...'}
          </div>

          {/* Плитки доступных букв */}
          <div dir="rtl" className="flex flex-wrap gap-2.5 justify-center">
            {builderLetters.map((char, i) => (
              <button
                key={i}
                onClick={() => handleLetterClick(char, i)}
                className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-hebrew text-2xl font-bold shadow-sm transition active:scale-90"
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
};
