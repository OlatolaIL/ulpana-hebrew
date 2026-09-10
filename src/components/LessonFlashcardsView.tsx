'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Play,
  RotateCcw,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  ArrowLeftRight,
} from 'lucide-react';
import { UserProfile, Word } from '@/types';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { calculateWordMastery } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';

interface LessonFlashcardsViewProps {
  userProfile: UserProfile;
  onStartTraining: (
    words: Word[],
    title: string,
    mode: 'flip' | 'builder' | 'listening' | 'auto_audio',
    direction: 'he-ru' | 'ru-he'
  ) => void;
}

type FilterCondition = 'all' | 'due' | 'weak' | 'new';

export const LessonFlashcardsView: React.FC<LessonFlashcardsViewProps> = ({
  userProfile,
  onStartTraining,
}) => {
  // Выбранные уроки
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    const current = userProfile.currentLesson || 1;
    for (let i = Math.max(1, current - 4); i <= current; i++) {
      initial.add(i);
    }
    return initial;
  });

  const [activeLevelTab, setActiveLevelTab] = useState<'alef' | 'bet'>('alef');
  const [filterCondition, setFilterCondition] = useState<FilterCondition>('all');
  const [trainingMode, setTrainingMode] = useState<'flip' | 'builder' | 'listening' | 'auto_audio'>('flip');
  const [cardDirection, setCardDirection] = useState<'he-ru' | 'ru-he'>(() => {
    if (userProfile.flashcardDirection) return userProfile.flashcardDirection;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flashcard_direction');
      if (saved === 'ru-he' || saved === 'he-ru') return saved;
    }
    return 'he-ru';
  });

  // Пресеты
  const applyPreset = (type: string) => {
    const next = new Set<number>();
    switch (type) {
      case 'alef_1_10':
        for (let i = 1; i <= 10; i++) next.add(i);
        setActiveLevelTab('alef');
        break;
      case 'alef_11_25':
        for (let i = 11; i <= 25; i++) next.add(i);
        setActiveLevelTab('alef');
        break;
      case 'alef_26_50':
        for (let i = 26; i <= 50; i++) next.add(i);
        setActiveLevelTab('alef');
        break;
      case 'alef_all':
        for (let i = 1; i <= 50; i++) next.add(i);
        setActiveLevelTab('alef');
        break;
      case 'bet_51_75':
        for (let i = 51; i <= 75; i++) next.add(i);
        setActiveLevelTab('bet');
        break;
      case 'bet_76_100':
        for (let i = 76; i <= 100; i++) next.add(i);
        setActiveLevelTab('bet');
        break;
      case 'bet_all':
        for (let i = 51; i <= 100; i++) next.add(i);
        setActiveLevelTab('bet');
        break;
      case 'completed':
        for (let i = 1; i <= (userProfile.currentLesson || 1); i++) next.add(i);
        if ((userProfile.currentLesson || 1) > 50) setActiveLevelTab('bet');
        break;
      case 'clear':
        break;
      default:
        break;
    }
    setSelectedLessons(next);
  };

  const toggleLesson = (num: number) => {
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  // Сбор всех слов из выбранных уроков
  const poolWords = useMemo(() => {
    const words: Word[] = [];
    const seenIds = new Set<string>();

    selectedLessons.forEach((num) => {
      const lesson = DETAILED_LESSONS[num];
      if (lesson && lesson.vocabulary) {
        lesson.vocabulary.forEach((w) => {
          if (!seenIds.has(w.id)) {
            seenIds.add(w.id);
            words.push(w);
          }
        });
      }
    });

    return words;
  }, [selectedLessons]);

  // Фильтрация слов по условию (все, к повторению, слабые, новые)
  const filteredWords = useMemo(() => {
    if (filterCondition === 'all') return poolWords;

    return poolWords.filter((w) => {
      const stats =
        userProfile.flashcardStats?.[w.id] ||
        userProfile.flashcardProgress?.[w.id] ||
        (w.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(w.hebrewPlain)] : undefined) ||
        userProfile.flashcardStats?.[stripNikkud(w.hebrew)];
      const mastery = calculateWordMastery(stats);

      if (filterCondition === 'due') {
        return mastery.isDue;
      }
      if (filterCondition === 'weak') {
        return mastery.score < 60;
      }
      if (filterCondition === 'new') {
        return mastery.level === 'new';
      }
      return true;
    });
  }, [poolWords, filterCondition, userProfile.flashcardStats, userProfile.flashcardProgress]);

  const handleStart = () => {
    if (filteredWords.length === 0) return;
    const lessonNumbers = Array.from(selectedLessons).sort((a, b) => a - b);
    let title = userProfile.ulpanMode
      ? `שִׁיעוּר ${lessonNumbers[0]}`
      : `Уроки ${lessonNumbers[0]}`;
    if (lessonNumbers.length > 1) {
      title = userProfile.ulpanMode
        ? `שִׁיעוּרִים ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]} (${lessonNumbers.length})`
        : `Уроки ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]} (${lessonNumbers.length} ур.)`;
    }
    onStartTraining(filteredWords, title, trainingMode, cardDirection);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Карточка заголовка и быстрых пресетов */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {userProfile.ulpanMode ? 'כַּרְטִיסִיּוֹת שִׁיעוּרִים' : 'Карточки уроков курса'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userProfile.ulpanMode
                  ? 'בְּחַר שִׁיעוּרִים (1–100) וְהַגְדֵּר מַצַּב תִּרְגּוּל'
                  : 'Выберите уроки (1–100), режим тренировки и интервальные фильтры слов'}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {userProfile.ulpanMode ? 'נִבְחֲרוּ:' : 'Выбрано:'}{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{selectedLessons.size}</span>{' '}
            {userProfile.ulpanMode ? 'שִׁיעוּרִים' : 'ур.'}
          </div>
        </div>

        {/* Быстрые наборы уроков */}
        <div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{userProfile.ulpanMode ? 'בְּחִירָה מְהִירָה:' : 'Быстрые наборы уроков:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('completed')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer transition"
            >
              Пройденные (1–{userProfile.currentLesson || 1})
            </button>
            <button
              type="button"
              onClick={() => applyPreset('alef_1_10')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              Алеф: 1–10
            </button>
            <button
              type="button"
              onClick={() => applyPreset('alef_11_25')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              Алеф: 11–25
            </button>
            <button
              type="button"
              onClick={() => applyPreset('alef_26_50')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition"
            >
              Алеф: 26–50
            </button>
            <button
              type="button"
              onClick={() => applyPreset('alef_all')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 hover:bg-blue-200 cursor-pointer transition"
            >
              Весь Алеф (1–50)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('bet_51_75')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 cursor-pointer transition"
            >
              Бет: 51–75
            </button>
            <button
              type="button"
              onClick={() => applyPreset('bet_76_100')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 cursor-pointer transition"
            >
              Бет: 76–100
            </button>
            <button
              type="button"
              onClick={() => applyPreset('bet_all')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 hover:bg-purple-200 cursor-pointer transition"
            >
              Весь Бет (51–100)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('clear')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition"
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* Переключение вкладок Алеф / Бет для сетки */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveLevelTab('alef')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeLevelTab === 'alef'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Уровень Алеф (1–50)
              </button>
              <button
                type="button"
                onClick={() => setActiveLevelTab('bet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeLevelTab === 'bet'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Уровень Бет (51–100)
              </button>
            </div>
          </div>

          {/* Сетка номеров уроков 1-50 или 51-100 */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 max-h-56 overflow-y-auto">
            {Array.from(
              { length: 50 },
              (_, i) => (activeLevelTab === 'alef' ? i + 1 : i + 51)
            ).map((num) => {
              const isSelected = selectedLessons.has(num);
              const lessonData = DETAILED_LESSONS[num];
              const wordCount = lessonData?.vocabulary?.length || 0;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => toggleLesson(num)}
                  className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? activeLevelTab === 'alef'
                        ? 'bg-blue-600 text-white font-bold shadow-sm scale-102 ring-2 ring-blue-500/30'
                        : 'bg-purple-600 text-white font-bold shadow-sm scale-102 ring-2 ring-purple-500/30'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={lessonData ? `${lessonData.titleRussian} (${wordCount} сл.)` : `Урок ${num}`}
                >
                  <span className="text-xs font-bold leading-none">{num}</span>
                  <span className="text-[9px] opacity-75 mt-0.5 leading-none">
                    {wordCount} сл.
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Настройки фильтрации, режима и направления перевода */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Фильтр слов */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-2.5">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Какие слова тренировать:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                filterCondition === 'all'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="filterCondition"
                checked={filterCondition === 'all'}
                onChange={() => setFilterCondition('all')}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="text-xs font-bold">Все слова уроков</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Полный набор ({poolWords.length} слов)
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                filterCondition === 'due'
                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="filterCondition"
                checked={filterCondition === 'due'}
                onChange={() => setFilterCondition('due')}
                className="w-4 h-4 text-amber-600"
              />
              <div>
                <div className="text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>К повторению (SM-2)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  По интервальному алгоритму
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                filterCondition === 'weak'
                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="filterCondition"
                checked={filterCondition === 'weak'}
                onChange={() => setFilterCondition('weak')}
                className="w-4 h-4 text-rose-600"
              />
              <div>
                <div className="text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>Слабые слова (&lt; 60%)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Слова с частыми ошибками
                </div>
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                filterCondition === 'new'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="filterCondition"
                checked={filterCondition === 'new'}
                onChange={() => setFilterCondition('new')}
                className="w-4 h-4 text-emerald-600"
              />
              <div>
                <div className="text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Новые слова</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Еще не тренировались
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Режим и направление перевода */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-3">
          {/* Режим */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Режим карточек:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTrainingMode('flip')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  trainingMode === 'flip'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">Переворот</span>
              </button>
              <button
                type="button"
                onClick={() => setTrainingMode('builder')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  trainingMode === 'builder'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs">Конструктор</span>
              </button>
              <button
                type="button"
                onClick={() => setTrainingMode('listening')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  trainingMode === 'listening'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span className="text-xs">На слух</span>
              </button>
              <button
                type="button"
                onClick={() => setTrainingMode('auto_audio')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  trainingMode === 'auto_audio'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Play className="w-4 h-4" />
                <span className="text-xs">Авто на слух</span>
              </button>
            </div>
          </div>

          {/* Направление перевода */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Направление перевода:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCardDirection('he-ru')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                  cardDirection === 'he-ru'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <span className="text-blue-600 dark:text-blue-400 font-hebrew" dir="rtl">עִבְרִית</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-800 dark:text-slate-200">Рус</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Иврит на лицевой
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  cardDirection === 'he-ru' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {cardDirection === 'he-ru' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCardDirection('ru-he')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                  cardDirection === 'ru-he'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 ring-1 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <span className="text-amber-700 dark:text-amber-300">Рус</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-amber-600 dark:text-amber-400 font-hebrew" dir="rtl">עִבְרִית</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Русский на лицевой
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  cardDirection === 'ru-he' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {cardDirection === 'ru-he' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Панель запуска тренировки */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-blue-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-blue-100 font-medium">
            Слов готово к тренировке:
          </div>
          <div className="text-xl sm:text-2xl font-black">
            {filteredWords.length} {filteredWords.length === 1 ? 'слово' : filteredWords.length > 1 && filteredWords.length < 5 ? 'слова' : 'слов'}
          </div>
          <div className="text-xs text-blue-100/80 mt-0.5">
            Из {selectedLessons.size} выбранных уроков
          </div>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={filteredWords.length === 0}
          className="px-6 py-3 rounded-xl sm:rounded-2xl text-sm font-bold bg-white hover:bg-blue-50 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current shrink-0" />
          <span>Начать тренировку карточек</span>
        </button>
      </div>
    </div>
  );
};
