'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Play,
  Search,
  BookOpen,
  Award,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { LESSONS_CATALOG } from '@/data/lessonsData';
import { Level, UserProfile } from '@/types';

interface CourseMapProps {
  userProfile: UserProfile;
  onSelectLesson: (lessonId: number) => void;
}

export const CourseMap: React.FC<CourseMapProps> = ({
  userProfile,
  onSelectLesson,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>('alef');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  return (
    <div className="space-y-6">
      {/* Главный информационный баннер со статистикой */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 md:p-8 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Программа Ульпана • 100 уроков</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Иврит: От Алеф (א) до Бет (ב)
            </h1>
            <p className="text-sm text-blue-100 max-w-xl mt-1">
              Комплексное обучение с теоретической базой, словарями, грамматикой и живой разговорной практикой с ИИ.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
            <div className="text-center px-2">
              <div className="text-2xl font-bold">{completedCount} / 100</div>
              <div className="text-xs text-blue-200">Пройдено уроков</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <div className="text-2xl font-bold">{userProfile.personalVocabulary.length}</div>
              <div className="text-xs text-blue-200">Слов в словарике</div>
            </div>
          </div>
        </div>

        {/* Переключатель уровней Алеф / Бет */}
        <div className="flex p-1 bg-black/20 rounded-2xl max-w-md backdrop-blur">
          <button
            onClick={() => setSelectedLevel('alef')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              selectedLevel === 'alef'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span>Уровень Алеф (א)</span>
            <span className="text-xs opacity-75 font-normal">1-50 уроков</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold ml-1">
              {alefCompleted}/50
            </span>
          </button>

          <button
            onClick={() => setSelectedLevel('bet')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              selectedLevel === 'bet'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <span>Уровень Бет (ב)</span>
            <span className="text-xs opacity-75 font-normal">51-100 уроков</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold ml-1">
              {betCompleted}/50
            </span>
          </button>
        </div>
      </div>

      {/* Панель фильтров и поиска */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Поиск по урокам уровня ${selectedLevel === 'alef' ? 'Алеф' : 'Бет'}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="all">Все категории темы</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Сетка 50 уроков выбранного уровня */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((lesson) => {
          const isCompleted = userProfile.completedLessons.includes(lesson.id);
          const progress = userProfile.lessonProgress[lesson.id];
          const completedTabsCount = progress?.completedTabs?.length || 0;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/40 transition duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Номер урока и бейдж статуса */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    Урок {lesson.number}
                  </span>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Пройден</span>
                    </span>
                  ) : completedTabsCount > 0 ? (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      В процессе ({completedTabsCount}/4)
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">Новый</span>
                  )}
                </div>

                {/* Название на иврите и русском */}
                <div>
                  <div
                    dir="rtl"
                    className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
                  >
                    {lesson.titleHebrew}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                    {lesson.titleRussian}
                  </h3>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              {/* Футер карточки урока */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-zinc-500">{lesson.category}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition">
                  <span>Начать</span>
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
