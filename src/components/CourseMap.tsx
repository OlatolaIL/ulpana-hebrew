'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Search,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Target,
  Layers,
  ArrowRight,
  Play,
  Filter,
} from 'lucide-react';
import { LESSONS_CATALOG } from '@/data/lessonsData';
import { Level, UserProfile } from '@/types';
import { stripNikkud } from '@/lib/transcription';

interface CourseMapProps {
  userProfile: UserProfile;
  onSelectLesson: (lessonId: number) => void;
  onRequirePro?: (lessonId: number) => void;
  onResetLessonProgress?: (lessonId: number) => void;
}

interface DecadeBlock {
  id: number;
  decadeIndex: number;
  range: [number, number];
  titleRu: string;
  titleHe: string;
  shortRu: string;
  shortHe: string;
}

const DECADES_BY_LEVEL: Record<Level, DecadeBlock[]> = {
  alef: [
    { id: 1, decadeIndex: 1, range: [1, 10], titleRu: '1–10: Первые фразы', titleHe: '1–10: היכרות והבסיס', shortRu: '1–10', shortHe: '1–10' },
    { id: 2, decadeIndex: 2, range: [11, 20], titleRu: '11–20: Семья и дом', titleHe: '11–20: משפחה ובית', shortRu: '11–20', shortHe: '11–20' },
    { id: 3, decadeIndex: 3, range: [21, 30], titleRu: '21–30: Город и покупки', titleHe: '21–30: עיר וקניות', shortRu: '21–30', shortHe: '21–30' },
    { id: 4, decadeIndex: 4, range: [31, 40], titleRu: '31–40: Кафе и здоровье', titleHe: '31–40: אוכל ובריאות', shortRu: '31–40', shortHe: '31–40' },
    { id: 5, decadeIndex: 5, range: [41, 50], titleRu: '41–50: Прошедшее время', titleHe: '41–50: עבר ותוכניות', shortRu: '41–50', shortHe: '41–50' },
  ],
  bet: [
    { id: 6, decadeIndex: 1, range: [51, 60], titleRu: '51–60: Сложные глаголы', titleHe: '51–60: פעלים מורכבים', shortRu: '51–60', shortHe: '51–60' },
    { id: 7, decadeIndex: 2, range: [61, 70], titleRu: '61–70: Путешествия и быт', titleHe: '61–70: טיולים וחברה', shortRu: '61–70', shortHe: '61–70' },
    { id: 8, decadeIndex: 3, range: [71, 80], titleRu: '71–80: Карьера и технологии', titleHe: '71–80: קריירה וטכנולוגיה', shortRu: '71–80', shortHe: '71–80' },
    { id: 9, decadeIndex: 4, range: [81, 90], titleRu: '81–90: Культура и медиа', titleHe: '81–90: תרבות ושיח', shortRu: '81–90', shortHe: '81–90' },
    { id: 10, decadeIndex: 5, range: [91, 100], titleRu: '91–100: Свободное общение', titleHe: '91–100: שליטה מלאה', shortRu: '91–100', shortHe: '91–100' },
  ],
};

export const CourseMap: React.FC<CourseMapProps> = ({
  userProfile,
  onSelectLesson,
  onRequirePro,
  onResetLessonProgress,
}) => {
  const isPro = userProfile.subscriptionTier === 'pro' || userProfile.subscriptionTier === 'admin';
  const isUlpan = Boolean(userProfile.ulpanMode);

  // Вычисляем активный урок пользователя
  const currentLessonId = useMemo(() => {
    const inProgressLesson = LESSONS_CATALOG.find((l) => {
      const p = userProfile.lessonProgress[l.id];
      return p && p.completedTabs && p.completedTabs.length > 0 && !userProfile.completedLessons.includes(l.id);
    });
    if (inProgressLesson) return inProgressLesson.id;

    const firstUncompleted = LESSONS_CATALOG.find((l) => !userProfile.completedLessons.includes(l.id));
    if (firstUncompleted) return firstUncompleted.id;

    return userProfile.currentLesson || 1;
  }, [userProfile]);

  const currentLesson = useMemo(() => {
    return LESSONS_CATALOG.find((l) => l.id === currentLessonId) || LESSONS_CATALOG[0];
  }, [currentLessonId]);

  const currentProgress = userProfile.lessonProgress[currentLesson.id];
  const currentCompletedTabs = currentProgress?.completedTabs?.length || 0;
  const isCurrentCompleted = userProfile.completedLessons.includes(currentLesson.id);
  const currentLessonLocked = currentLesson.id > 3 && !isPro;

  // По умолчанию открываем уровень текущего урока
  const [selectedLevel, setSelectedLevel] = useState<Level>(() => currentLesson.level);

  // Функция подбора стартового блока 10 уроков для уровня
  const getInitialDecadeForLevel = (level: Level): number => {
    if (currentLesson.level === level) {
      const d = DECADES_BY_LEVEL[level].find(
        (dec) => currentLesson.id >= dec.range[0] && currentLesson.id <= dec.range[1]
      );
      if (d) return d.id;
    }
    const firstUncompleted = LESSONS_CATALOG.find(
      (l) => l.level === level && !userProfile.completedLessons.includes(l.id)
    );
    if (firstUncompleted) {
      const d = DECADES_BY_LEVEL[level].find(
        (dec) => firstUncompleted.id >= dec.range[0] && firstUncompleted.id <= dec.range[1]
      );
      if (d) return d.id;
    }
    return DECADES_BY_LEVEL[level][0].id;
  };

  // Выбранный блок из 10 уроков (или 'all' для просмотра всех 50)
  const [selectedDecade, setSelectedDecade] = useState<number | 'all'>(() => {
    return getInitialDecadeForLevel(currentLesson.level);
  });

  // Фильтр по статусу прохождения
  const [statusFilter, setStatusFilter] = useState<'all' | 'uncompleted' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Переключение уровня с авто-фокусом на актуальный блок
  const handleLevelChange = (lvl: Level) => {
    setSelectedLevel(lvl);
    setSelectedDecade(getInitialDecadeForLevel(lvl));
  };

  // Статистика прохождения по блокам (десятилетиям)
  const decadeStats = useMemo(() => {
    const stats: Record<number, { completed: number; total: number }> = {};
    const allDecades = [...DECADES_BY_LEVEL.alef, ...DECADES_BY_LEVEL.bet];
    for (const dec of allDecades) {
      const total = dec.range[1] - dec.range[0] + 1;
      const completed = userProfile.completedLessons.filter(
        (id) => id >= dec.range[0] && id <= dec.range[1]
      ).length;
      stats[dec.id] = { completed, total };
    }
    return stats;
  }, [userProfile.completedLessons]);

  // Фильтрация каталога
  const filteredCatalog = useMemo(() => {
    return LESSONS_CATALOG.filter((lesson) => {
      // Уровень
      if (lesson.level !== selectedLevel) return false;

      // Десятилетие (если не выбрано 'all' и пользователь не ищет через строку поиска)
      if (!searchQuery.trim() && selectedDecade !== 'all') {
        const activeDecadeObj = DECADES_BY_LEVEL[selectedLevel].find((d) => d.id === selectedDecade);
        if (activeDecadeObj) {
          if (lesson.id < activeDecadeObj.range[0] || lesson.id > activeDecadeObj.range[1]) {
            return false;
          }
        }
      }

      // Фильтр статуса
      const isCompleted = userProfile.completedLessons.includes(lesson.id);
      if (statusFilter === 'uncompleted' && isCompleted) return false;
      if (statusFilter === 'completed' && !isCompleted) return false;

      // Поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          lesson.titleRussian.toLowerCase().includes(q) ||
          lesson.titleHebrew.includes(q) ||
          lesson.description.toLowerCase().includes(q) ||
          lesson.number.toString() === q;
        if (!matchesSearch) return false;
      }

      // Категория
      if (selectedCategory !== 'all' && lesson.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [selectedLevel, selectedDecade, statusFilter, searchQuery, selectedCategory, userProfile.completedLessons]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(LESSONS_CATALOG.filter((l) => l.level === selectedLevel).map((l) => l.category))
    );
  }, [selectedLevel]);

  const completedCount = userProfile.completedLessons.length;
  const alefCompleted = userProfile.completedLessons.filter((id) => id <= 50).length;
  const betCompleted = userProfile.completedLessons.filter((id) => id > 50).length;
  const progressPercent = Math.min(100, Math.round((completedCount / 100) * 100));

  const currentLevelDecades = DECADES_BY_LEVEL[selectedLevel];
  const activeDecadeObj = selectedDecade !== 'all'
    ? currentLevelDecades.find((d) => d.id === selectedDecade)
    : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Компактный прогресс-блок курса */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              {isUlpan ? 'תוֹכְנִית הַקּוּרְס (100 שִׁיעוּרִים)' : 'Программа курса (100 уроков)'}
            </h1>
          </div>
          <div className="text-xs sm:text-sm font-bold bg-white/15 px-2.5 py-1 rounded-xl backdrop-blur shrink-0">
            {completedCount} / 100 <span className="font-normal opacity-80">({progressPercent}%)</span>
          </div>
        </div>

        {/* Тонкий прогресс-бар курса */}
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Hero-карточка: Текущий урок с быстрым переходом в 1 клик */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 text-white p-4 sm:p-5 shadow-md border border-blue-400/20">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur text-white border border-white/20">
                <Target className="w-3.5 h-3.5 text-yellow-300" />
                {isUlpan ? 'הַשִּׁיעוּר הַנּוֹכְחִי שֶׁלְּךָ' : 'Ваш текущий урок'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-black/25 text-blue-100">
                {isUlpan ? `שִׁיעוּר ${currentLesson.number}` : `Урок ${currentLesson.number}`}
              </span>
              {currentLessonLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-amber-950">
                  🔒 PRO
                </span>
              )}
            </div>

            <div>
              <div
                dir="rtl"
                className="text-xl sm:text-2xl font-black font-hebrew text-white drop-shadow-sm leading-tight"
              >
                {userProfile.showNikkud ? currentLesson.titleHebrew : stripNikkud(currentLesson.titleHebrew)}
              </div>
              {!isUlpan && (
                <h2 className="text-sm sm:text-base font-semibold text-blue-50 line-clamp-1 mt-0.5">
                  {currentLesson.titleRussian}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-blue-100 pt-0.5">
              <span className="font-medium">
                {isCurrentCompleted
                  ? (isUlpan ? '✓ שִׁיעוּר הוּשְׁלַם' : '✓ Урок успешно пройден')
                  : currentCompletedTabs > 0
                  ? (isUlpan ? `בְּתַהֲלִיךְ: ${currentCompletedTabs} מִתּוֹךְ 5 שְׁלַבִּים` : `В процессе: ${currentCompletedTabs} из 5 этапов пройдено`)
                  : (isUlpan ? 'מוּכָן לִתְחִילָה (0/5 שְׁלַבִּים)' : 'Готов к прохождению (0/5 этапов)')}
              </span>
              {/* Точки прогресса этапов урока */}
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((stepIdx) => (
                  <div
                    key={stepIdx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isCurrentCompleted || stepIdx < currentCompletedTabs
                        ? 'bg-emerald-300'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Кнопка мгновенного перехода к уроку без скролла */}
          <div className="shrink-0">
            <button
              onClick={() => {
                if (currentLessonLocked) {
                  if (onRequirePro) onRequirePro(currentLesson.id);
                } else {
                  onSelectLesson(currentLesson.id);
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white text-blue-700 hover:bg-blue-50 active:scale-95 shadow-md transition group"
            >
              <Play className="w-4 h-4 fill-blue-700 text-blue-700 group-hover:translate-x-0.5 transition" />
              <span>
                {currentLessonLocked
                  ? (isUlpan ? 'פְּתַח בְּ-PRO' : 'Открыть в PRO')
                  : isCurrentCompleted
                  ? (isUlpan ? `חֲזוֹר עַל שִׁיעוּר ${currentLesson.number}` : `Повторить урок ${currentLesson.number}`)
                  : currentCompletedTabs > 0
                  ? (isUlpan ? `הַמְשֵׁךְ שִׁיעוּר ${currentLesson.number}` : `Продолжить урок ${currentLesson.number}`)
                  : (isUlpan ? `הַתְחֵל שִׁיעוּר ${currentLesson.number}` : `Начать урок ${currentLesson.number}`)}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Переключатель уровней Алеф / Бет */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl">
        <button
          onClick={() => handleLevelChange('alef')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
            selectedLevel === 'alef'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <span>{isUlpan ? 'רָמָה א׳ (1–50)' : 'Алеф (1–50)'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedLevel === 'alef'
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                : 'bg-zinc-300/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {alefCompleted}/50
          </span>
        </button>

        <button
          onClick={() => handleLevelChange('bet')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
            selectedLevel === 'bet'
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <span>{isUlpan ? 'רָמָה ב׳ (51–100)' : 'Бет (51–100)'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedLevel === 'bet'
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                : 'bg-zinc-300/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {betCompleted}/50
          </span>
        </button>
      </div>

      {/* 4. Модульная навигация по блокам (по 10 уроков) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-0.5">
          <div className="flex items-center gap-1.5 font-bold">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>{isUlpan ? 'בְּחִירַת יְחִידַת לִמּוּד (10 שִׁיעוּרִים):' : 'Блоки курса (по 10 уроков):'}</span>
          </div>
          {activeDecadeObj && (
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {isUlpan ? activeDecadeObj.titleHe : activeDecadeObj.titleRu}
            </span>
          )}
        </div>

        {/* Чипы 10-урочных блоков */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {currentLevelDecades.map((dec) => {
            const isSelected = selectedDecade === dec.id;
            const hasCurrentLesson = currentLesson.id >= dec.range[0] && currentLesson.id <= dec.range[1];
            const stats = decadeStats[dec.id] || { completed: 0, total: 10 };
            const isAllCompleted = stats.completed === stats.total;

            return (
              <button
                key={dec.id}
                onClick={() => setSelectedDecade(dec.id)}
                className={`group relative shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                }`}
              >
                {hasCurrentLesson && (
                  <Target className={`w-3 h-3 shrink-0 ${isSelected ? 'text-yellow-300' : 'text-blue-500'}`} />
                )}
                <span>{isUlpan ? dec.shortHe : dec.shortRu}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isAllCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {isAllCompleted ? '✓' : `${stats.completed}/10`}
                </span>
              </button>
            );
          })}

          {/* Кнопка просмотра всех 50 уроков */}
          <button
            onClick={() => setSelectedDecade('all')}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition whitespace-nowrap border ${
              selectedDecade === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-750'
            }`}
          >
            <span>{isUlpan ? 'כָּל 50 הַשִּׁיעוּרִים' : 'Все 50 уроков'}</span>
          </button>
        </div>
      </div>

      {/* 5. Панель поиска и фильтров статуса */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Фильтры статуса: Все / К прохождению / Пройденные */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {isUlpan ? 'הַכֹּל' : 'Все'}
          </button>
          <button
            onClick={() => setStatusFilter('uncompleted')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'uncompleted'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Скрыть пройденные уроки и оставить только те, что нужно пройти"
          >
            <Target className="w-3 h-3 text-blue-500" />
            <span>{isUlpan ? 'לְלִמּוּד' : 'К прохождению'}</span>
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>{isUlpan ? 'הוּשְׁלְמוּ' : 'Пройденные'}</span>
          </button>
        </div>

        {/* Поиск и категории */}
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUlpan
                  ? `חִפּוּשׂ בְּרָמָה ${selectedLevel === 'alef' ? 'א׳' : 'ב׳'}...`
                  : `Поиск по уровню ${selectedLevel === 'alef' ? 'Алеф' : 'Бет'}...`
              }
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 max-w-[130px] sm:max-w-[170px] truncate"
          >
            <option value="all">{isUlpan ? 'כָּל הַקָּטֵגוֹרְיוֹת' : 'Все темы'}</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. Сетка карточек уроков */}
      {filteredCatalog.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-zinc-500 text-sm">
            {isUlpan ? 'לֹא נִמְצְאוּ שִׁיעוּרִים מַתְאִימִים' : 'По вашему запросу уроки не найдены.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            {isUlpan ? 'אִפּוּס מַסְנְנִים' : 'Сбросить фильтры'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCatalog.map((lesson) => {
            const isCompleted = userProfile.completedLessons.includes(lesson.id);
            const progress = userProfile.lessonProgress[lesson.id];
            const completedTabsCount = progress?.completedTabs?.length || 0;
            const hasProgress = isCompleted || completedTabsCount > 0;
            const isLessonLocked = lesson.id > 3 && !isPro;
            const isCurrent = lesson.id === currentLessonId;

            const handleCardClick = () => {
              if (isLessonLocked) {
                if (onRequirePro) onRequirePro(lesson.id);
              } else {
                onSelectLesson(lesson.id);
              }
            };

            const handleReset = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (window.confirm(`Сбросить прогресс урока ${lesson.number} («${lesson.titleRussian}»)?`)) {
                if (onResetLessonProgress) {
                  onResetLessonProgress(lesson.id);
                }
              }
            };

            return (
              <div
                key={lesson.id}
                onClick={handleCardClick}
                className={`group relative border rounded-2xl p-4 shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/25 dark:ring-blue-400/30 bg-gradient-to-br from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-md'
                    : isLessonLocked
                    ? 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/40'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Номер урока, статус и кнопка сброса */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isUlpan
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      }`}>
                        {isUlpan ? `שִׁיעוּר ${lesson.number}` : `Урок ${lesson.number}`}
                      </span>

                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 animate-pulse">
                          <Target className="w-2.5 h-2.5" />
                          <span>{isUlpan ? 'נוֹכְחִי' : 'ТЕКУЩИЙ'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLessonLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          <span>🔒</span>
                          <span>PRO</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isUlpan ? 'הוּשְׁלַם' : 'Пройден'}</span>
                        </span>
                      ) : completedTabsCount > 0 ? (
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {isUlpan ? `בְּתַהֲלִיךְ (${completedTabsCount}/5)` : `В процессе (${completedTabsCount}/5)`}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">
                          {isUlpan ? 'חָדָשׁ' : 'Новый'}
                        </span>
                      )}

                      {/* Кнопка сброса прогресса урока */}
                      {hasProgress && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-90 ml-0.5"
                          title={`Сбросить прогресс урока ${lesson.number}`}
                          aria-label={`Сбросить прогресс урока ${lesson.number}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Название на иврите */}
                  <div>
                    <div
                      dir="rtl"
                      className={`font-bold font-hebrew group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug ${
                        isUlpan
                          ? 'text-xl text-zinc-900 dark:text-zinc-50'
                          : 'text-lg text-zinc-900 dark:text-zinc-50'
                      }`}
                    >
                      {userProfile.showNikkud ? lesson.titleHebrew : stripNikkud(lesson.titleHebrew)}
                    </div>
                    {!isUlpan && (
                      <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {lesson.titleRussian}
                      </h3>
                    )}
                  </div>

                  {!isUlpan && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}
                </div>

                {/* Футер карточки урока */}
                <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium text-zinc-500 truncate max-w-[150px]">
                    {isUlpan ? `שִׁיעוּר ${lesson.number}` : lesson.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition shrink-0 ${
                      isLessonLocked ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <span>
                      {isLessonLocked
                        ? 'В PRO'
                        : isCompleted
                        ? (isUlpan ? 'חֲזוֹר' : 'Повторить')
                        : (isUlpan ? 'הַתְחֵל' : 'Начать')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

