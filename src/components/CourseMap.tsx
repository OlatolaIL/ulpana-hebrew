'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Target,
  ArrowRight,
  Play,
  Sparkles,
  X,
  LogIn,
} from 'lucide-react';
import { LESSONS_CATALOG } from '@/data/lessonsData';
import { Level, UserProfile } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { isLessonLockedForUser, isLessonAuthRequired } from '@/lib/config';
import { TierBadge } from './TierBadge';
import { useBannerCooldown } from '@/lib/useBannerCooldown';
import { LESSON_STAGES_ORDER } from '@/lib/storage';

const TOTAL_STAGES = LESSON_STAGES_ORDER.length;

interface CourseMapProps {
  userProfile: UserProfile;
  onSelectLesson: (lessonId: number) => void;
  onRequirePro?: (lessonId: number) => void;
  onRequireAuth?: (lessonId: number) => void;
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
  onRequireAuth,
  onResetLessonProgress,
}) => {
  const isPro = userProfile.subscriptionTier === 'pro' || userProfile.subscriptionTier === 'admin';
  const { isVisible: isBetaBannerVisible, dismiss: dismissBetaBanner } = useBannerCooldown('course_map_beta');

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
  const isLoggedIn = Boolean(userProfile.isLoggedIn);
  const currentLessonAuthRequired = isLessonAuthRequired(currentLesson.id, isLoggedIn);
  const currentLessonLocked = isLessonLockedForUser(currentLesson.id, isPro);

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

  // Переключение уровня с авто-фокусом на актуальный блок
  const handleLevelChange = (lvl: Level) => {
    setSelectedLevel(lvl);
    setSelectedDecade(getInitialDecadeForLevel(lvl));
  };

  // Мгновенный переход к текущему уроку («Где я»)
  const handleScrollToCurrentLesson = () => {
    if (selectedLevel !== currentLesson.level) {
      setSelectedLevel(currentLesson.level);
    }
    const d = DECADES_BY_LEVEL[currentLesson.level].find(
      (dec) => currentLesson.id >= dec.range[0] && currentLesson.id <= dec.range[1]
    );
    if (d) {
      setSelectedDecade(d.id);
    }
    setTimeout(() => {
      const el = document.getElementById(`lesson-card-${currentLesson.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
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

  // Фильтрация каталога: только уровень и выбранный блок
  const filteredCatalog = useMemo(() => {
    return LESSONS_CATALOG.filter((lesson) => {
      if (lesson.level !== selectedLevel) return false;

      if (selectedDecade !== 'all') {
        const activeDecadeObj = DECADES_BY_LEVEL[selectedLevel].find((d) => d.id === selectedDecade);
        if (activeDecadeObj) {
          if (lesson.id < activeDecadeObj.range[0] || lesson.id > activeDecadeObj.range[1]) {
            return false;
          }
        }
      }

      return true;
    });
  }, [selectedLevel, selectedDecade]);

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
      {/* 1. Единый компактный Hero-виджет: Текущий урок и прогресс курса */}
      <div
        onClick={() => {
          if (currentLessonLocked) {
            if (onRequirePro) onRequirePro(currentLesson.id);
          } else {
            onSelectLesson(currentLesson.id);
          }
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white p-3.5 sm:p-5 shadow-sm border border-blue-400/20 cursor-pointer active:scale-[0.99] transition group"
      >
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            {/* Метка урока и этапы */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/20 text-white backdrop-blur whitespace-nowrap">
                Урок {currentLesson.number}
              </span>
              <span className="text-[11px] font-medium text-blue-100 whitespace-nowrap">
                Текущий урок
              </span>
              {currentCompletedTabs > 0 && !isCurrentCompleted && (
                <span className="text-[10px] font-semibold text-emerald-300 bg-black/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {currentCompletedTabs}/{TOTAL_STAGES}
                </span>
              )}
              {currentLessonAuthRequired ? (
                <TierBadge tier="free-registration" size="xs" customLabel="Бесплатно • Регистрация" />
              ) : currentLesson.id > 30 ? (
                <TierBadge tier="pro-beta" size="xs" />
              ) : (
                <TierBadge tier="always-free" size="xs" customLabel="Бесплатно" />
              )}
            </div>

            {/* Тема урока */}
            <div
              dir="rtl"
              className="text-lg sm:text-2xl font-black font-hebrew text-white tracking-wide leading-snug truncate text-left"
            >
              {userProfile.showNikkud ? currentLesson.titleHebrew : stripNikkud(currentLesson.titleHebrew)}
            </div>
            <div className="text-xs sm:text-sm font-medium text-blue-100/90 truncate">
              {currentLesson.titleRussian}
            </div>
          </div>

          {/* Правая часть: кнопка действия и прогресс курса */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="text-[11px] font-bold bg-black/25 px-2.5 py-1 rounded-lg text-blue-100 backdrop-blur">
              {completedCount} / 100 <span className="opacity-75 font-normal">({progressPercent}%)</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentLessonAuthRequired) {
                  if (onRequireAuth) onRequireAuth(currentLesson.id);
                  else onSelectLesson(currentLesson.id);
                } else if (currentLessonLocked) {
                  if (onRequirePro) onRequirePro(currentLesson.id);
                } else {
                  onSelectLesson(currentLesson.id);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-white text-blue-700 hover:bg-blue-50 active:scale-95 shadow-sm transition"
            >
              {currentLessonAuthRequired ? (
                <>
                  <LogIn className="w-3.5 h-3.5 text-blue-700" />
                  <span>Войти бесплатно</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-blue-700 text-blue-700" />
                  <span>
                    {currentLessonLocked
                      ? 'PRO'
                      : isCurrentCompleted
                      ? 'Повторить'
                      : 'Продолжить'}
                  </span>
                </>
              )}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>

        {/* Тонкий общий прогресс курса по низу карточки */}
        <div className="mt-3 w-full bg-black/20 rounded-full h-1 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Информационный баннер открытого бета-тестирования */}
      {isBetaBannerVisible && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="text-xs leading-tight">
              <span className="font-bold">
                Открытое бета-тестирование:
              </span>{' '}
              <span className="opacity-90">
                Уроки 1–30 всегда бесплатны (этапы 1–3). Продвинутые уроки 31–100 и симуляторы звонков с ИИ сейчас открыты в режиме PRO БЕТА.
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
            <TierBadge tier="pro-beta" size="sm" />
            <button
              type="button"
              onClick={dismissBetaBanner}
              className="p-1 rounded-lg text-amber-700/70 hover:text-amber-900 dark:text-amber-300/70 dark:hover:text-amber-100 hover:bg-amber-500/20 transition cursor-pointer"
              title="Скрыть на 5 дней"
              aria-label="Скрыть на 5 дней"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Единая компактная панель навигации: Уровни (א / ב), Десятки и кнопка «Где я» */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 sm:p-2.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Переключатель уровней: Алеф (א) и Бет (ב) */}
          <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0">
            <button
              onClick={() => handleLevelChange('alef')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                selectedLevel === 'alef'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span className="font-hebrew text-base font-black leading-none">א</span>
              <span>Алеф</span>
            </button>

            <button
              onClick={() => handleLevelChange('bet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                selectedLevel === 'bet'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span className="font-hebrew text-base font-black leading-none">ב</span>
              <span>Бет</span>
            </button>
          </div>

          {/* Кнопка «Где я» для мгновенного перехода к текущему уроку */}
          <button
            onClick={handleScrollToCurrentLesson}
            className="shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100/70 transition active:scale-95 shadow-2xs"
            title="Перейти к текущему уроку на карте"
          >
            <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Где я</span>
          </button>
        </div>

        {/* Лента 10-урочных блоков для выбранного уровня */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {currentLevelDecades.map((dec) => {
            const isSelected = selectedDecade === dec.id;
            const hasCurrentLesson = currentLesson.id >= dec.range[0] && currentLesson.id <= dec.range[1];
            const stats = decadeStats[dec.id] || { completed: 0, total: 10 };
            const isAllCompleted = stats.completed === stats.total;

            return (
              <button
                key={dec.id}
                onClick={() => setSelectedDecade(dec.id)}
                className={`group relative shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                }`}
              >
                {hasCurrentLesson && (
                  <Target className={`w-3 h-3 shrink-0 ${isSelected ? 'text-yellow-300' : 'text-blue-500'}`} />
                )}
                <span>{dec.shortRu}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-md font-bold ${
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
            className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition whitespace-nowrap border ${
              selectedDecade === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-750'
            }`}
          >
            <span>Все 50</span>
          </button>
        </div>
      </div>

      {/* Заголовок активного блока уроков */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
          {activeDecadeObj ? activeDecadeObj.titleRu : 'Все уроки уровня'}
        </span>
        <span className="text-zinc-400 font-medium">
          {filteredCatalog.length} уроков
        </span>
      </div>

      {/* 3. Сетка карточек уроков */}
      {filteredCatalog.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-zinc-500 text-sm">
            В этом блоке пока нет доступных уроков.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCatalog.map((lesson) => {
            const isCompleted = userProfile.completedLessons.includes(lesson.id);
            const progress = userProfile.lessonProgress[lesson.id];
            const completedTabsCount = progress?.completedTabs?.length || 0;
            const hasProgress = isCompleted || completedTabsCount > 0;
            const isLessonAuth = isLessonAuthRequired(lesson.id, isLoggedIn);
            const isLessonLocked = isLessonLockedForUser(lesson.id, isPro);
            const isCurrent = lesson.id === currentLessonId;

            const handleCardClick = () => {
              if (isLessonAuth) {
                if (onRequireAuth) onRequireAuth(lesson.id);
                else onSelectLesson(lesson.id);
                return;
              }
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
                id={`lesson-card-${lesson.id}`}
                onClick={handleCardClick}
                className={`group relative border rounded-2xl p-3 sm:p-3.5 transition duration-150 cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm'
                    : isLessonLocked
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 opacity-85 hover:border-amber-400'
                    : isLessonAuth
                    ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Номер и тема урока */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      Урок {lesson.number}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        Текущий
                      </span>
                    )}

                    {!isCompleted && completedTabsCount > 0 && (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded whitespace-nowrap">
                        {completedTabsCount}/{TOTAL_STAGES}
                      </span>
                    )}

                    {isLessonAuth ? (
                      <TierBadge tier="free-registration" size="xs" customLabel="Бесплатно • Регистрация" />
                    ) : lesson.id > 30 ? (
                      <TierBadge tier="pro-beta" size="xs" />
                    ) : (
                      <TierBadge tier="always-free" size="xs" customLabel="Бесплатно" />
                    )}
                  </div>

                  {/* Тема урока на иврите */}
                  <div
                    dir="rtl"
                    className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug truncate text-left"
                  >
                    {userProfile.showNikkud ? lesson.titleHebrew : stripNikkud(lesson.titleHebrew)}
                  </div>

                  {/* Тема урока на русском */}
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                    {lesson.titleRussian}
                  </div>
                </div>

                {/* Статус урока: зеленая галочка / замок / вход / стрелка */}
                <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                  {/* Кнопка сброса прогресса */}
                  {hasProgress && onResetLessonProgress && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-90"
                      title={`Сбросить прогресс урока ${lesson.number}`}
                      aria-label={`Сбросить прогресс урока ${lesson.number}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isLessonLocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      <span>🔒</span>
                      <span>PRO</span>
                    </span>
                  ) : isLessonAuth ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                      <LogIn className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Вход</span>
                    </span>
                  ) : isCompleted ? (
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs"
                      title="Пройден"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

