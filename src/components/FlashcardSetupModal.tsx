import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { Lesson, UserProfile, Word } from '@/types';
import { DETAILED_LESSONS, LESSONS_CATALOG } from '@/data/lessonsData';
import { calculateWordMastery } from '@/lib/storage';

interface FlashcardSetupModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onStartSession: (
    words: Word[],
    mode: 'flip' | 'builder' | 'listening',
    title: string
  ) => void;
}

type FilterCondition = 'all' | 'due' | 'weak' | 'new';

export const FlashcardSetupModal: React.FC<FlashcardSetupModalProps> = ({
  userProfile,
  onClose,
  onStartSession,
}) => {
  // Выбранные уроки
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(() => {
    // По умолчанию выбираем текущий урок пользователя или 1-5
    const initial = new Set<number>();
    const current = userProfile.currentLesson || 1;
    for (let i = Math.max(1, current - 4); i <= current; i++) {
      initial.add(i);
    }
    return initial;
  });

  const [activeLevelTab, setActiveLevelTab] = useState<'alef' | 'bet'>('alef');
  const [filterCondition, setFilterCondition] = useState<FilterCondition>('all');
  const [trainingMode, setTrainingMode] = useState<'flip' | 'builder' | 'listening'>('flip');

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
      const stats = userProfile.flashcardProgress?.[w.id];
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
  }, [poolWords, filterCondition, userProfile.flashcardProgress]);

  const handleStart = () => {
    if (filteredWords.length === 0) return;
    const lessonNumbers = Array.from(selectedLessons).sort((a, b) => a - b);
    let title = `Уроки ${lessonNumbers[0]}`;
    if (lessonNumbers.length > 1) {
      title = `Уроки ${lessonNumbers[0]}–${lessonNumbers[lessonNumbers.length - 1]} (${lessonNumbers.length} ур.)`;
    }
    onStartSession(filteredWords, trainingMode, title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Выбор уроков для тренировки
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Выберите любые уроки Ульпана (1–100) и настройте фильтр слов
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело с прокруткой */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Пресеты быстрого выбора */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Быстрые наборы уроков:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('completed')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
              >
                Пройденные мной (1–{userProfile.currentLesson || 1})
              </button>
              <button
                type="button"
                onClick={() => applyPreset('alef_1_10')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Алеф: 1–10
              </button>
              <button
                type="button"
                onClick={() => applyPreset('alef_11_25')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Алеф: 11–25
              </button>
              <button
                type="button"
                onClick={() => applyPreset('alef_26_50')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Алеф: 26–50
              </button>
              <button
                type="button"
                onClick={() => applyPreset('alef_all')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 hover:bg-blue-200"
              >
                Весь Алеф (1–50)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bet_51_75')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              >
                Бет: 51–75
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bet_76_100')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
              >
                Бет: 76–100
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bet_all')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 hover:bg-purple-200"
              >
                Весь Бет (51–100)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('clear')}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeLevelTab === 'alef'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Уровень Алеф (1–50)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLevelTab('bet')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeLevelTab === 'bet'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Уровень Бет (51–100)
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Выбрано: <span className="font-bold text-slate-900 dark:text-white">{selectedLessons.size}</span> уроков
              </div>
            </div>

            {/* Сетка номеров уроков 1-50 или 51-100 */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 max-h-48 overflow-y-auto">
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
                    className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? activeLevelTab === 'alef'
                          ? 'bg-blue-600 text-white font-bold shadow-sm scale-105'
                          : 'bg-purple-600 text-white font-bold shadow-sm scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 border border-slate-200 dark:border-slate-700'
                    }`}
                    title={lessonData ? `${lessonData.titleRussian} (${wordCount} слов)` : `Урок ${num}`}
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

          {/* Фильтр слов */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Какие слова тренировать:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  filterCondition === 'all'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
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
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
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
                    Требующие повторения (SM-2)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    По интервальному алгоритму
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  filterCondition === 'weak'
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
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
                    Слабые слова (&lt; 60% знания)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Слова с частыми ошибками
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  filterCondition === 'new'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
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
                    Новые неизученные слова
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Еще не тренировались
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Режим тренировки */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              Режим карточек:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTrainingMode('flip')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  trainingMode === 'flip'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">Переворот</span>
              </button>
              <button
                type="button"
                onClick={() => setTrainingMode('builder')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  trainingMode === 'builder'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs">Конструктор</span>
              </button>
              <button
                type="button"
                onClick={() => setTrainingMode('listening')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  trainingMode === 'listening'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span className="text-xs">На слух</span>
              </button>
            </div>
          </div>
        </div>

        {/* Футер с кнопкой старта */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Отобрано для тренировки:
            </div>
            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {filteredWords.length} слов
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={filteredWords.length === 0}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              Начать тренировку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
