'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Search,
  RotateCcw,
  ChevronRight,
  Sparkles,
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

export const CourseMap: React.FC<CourseMapProps> = ({
  userProfile,
  onSelectLesson,
  onRequirePro,
  onResetLessonProgress,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>('alef');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isPro = userProfile.subscriptionTier === 'pro' || userProfile.subscriptionTier === 'admin';

  const filteredCatalog = LESSONS_CATALOG.filter((lesson) => {
    const matchesLevel = lesson.level === selectedLevel;
    const matchesSearch =
      lesson.titleRussian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.titleHebrew.includes(searchQuery) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.number.toString() === searchQuery.trim();
    const matchesCategory =
      selectedCategory === 'all' || lesson.category === selectedCategory;

    return matchesLevel && matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(
      LESSONS_CATALOG.filter((l) => l.level === selectedLevel).map((l) => l.category)
    )
  );

  const completedCount = userProfile.completedLessons.length;
  const alefCompleted = userProfile.completedLessons.filter((id) => id <= 50).length;
  const betCompleted = userProfile.completedLessons.filter((id) => id > 50).length;
  const progressPercent = Math.min(100, Math.round((completedCount / 100) * 100));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Компактный прогресс-блок */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight">
              Программа курса (100 уроков)
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

      {/* Переключатель уровней Алеф / Бет */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl">
        <button
          onClick={() => setSelectedLevel('alef')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
            selectedLevel === 'alef'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <span>Алеф (1–50)</span>
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
          onClick={() => setSelectedLevel('bet')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
            selectedLevel === 'bet'
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <span>Бет (51–100)</span>
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

      {/* Панель фильтров и поиска */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-white dark:bg-zinc-900 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Поиск по урокам уровня ${selectedLevel === 'alef' ? 'Алеф' : 'Бет'}...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">Все категории</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Сетка уроков выбранного уровня */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredCatalog.map((lesson) => {
          const isCompleted = userProfile.completedLessons.includes(lesson.id);
          const progress = userProfile.lessonProgress[lesson.id];
          const completedTabsCount = progress?.completedTabs?.length || 0;
          const hasProgress = isCompleted || completedTabsCount > 0;
          const isLessonLocked = lesson.id > 3 && !isPro;

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
              className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-4 shadow-sm transition duration-200 cursor-pointer flex flex-col justify-between ${
                isLessonLocked
                  ? 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/40'
              }`}
            >
              <div className="space-y-2.5">
                {/* Номер урока, статус и кнопка сброса */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    Урок {lesson.number}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isLessonLocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        <span>🔒</span>
                        <span>PRO</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Пройден</span>
                      </span>
                    ) : completedTabsCount > 0 ? (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        В процессе ({completedTabsCount}/5)
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">Новый</span>
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

                {/* Название на иврите и русском */}
                <div>
                  <div
                    dir="rtl"
                    className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-hebrew group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug"
                  >
                    {userProfile.showNikkud ? lesson.titleHebrew : stripNikkud(lesson.titleHebrew)}
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {lesson.titleRussian}
                  </h3>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              {/* Футер карточки урока */}
              <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-500 truncate max-w-[150px]">{lesson.category}</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition shrink-0 ${
                    isLessonLocked ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <span>{isLessonLocked ? 'В PRO' : isCompleted ? 'Повторить' : 'Начать'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
