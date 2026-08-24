'use client';

import React from 'react';
import {
  BookOpen,
  Layers,
  Settings,
  Sparkles,
  User,
  Heart,
  Zap,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface NavbarProps {
  currentView: 'map' | 'lesson' | 'flashcards' | 'dictionary' | 'alphabet';
  onNavigate: (view: 'map' | 'flashcards' | 'dictionary' | 'alphabet') => void;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  onToggleFontStyle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userProfile,
  onOpenSettings,
  onToggleFontStyle,
}) => {
  const dictCount = userProfile.personalVocabulary?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Логотип */}
        <div
          onClick={() => onNavigate('map')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
            <span className="font-bold text-lg font-hebrew">א</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                Ульпана
              </span>
              <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                100 уроков
              </span>
            </div>
            <span dir="rtl" className="text-[11px] text-zinc-400 font-hebrew font-medium block -mt-0.5">
              עִבְרִית מִן הַהַתְחָלָה
            </span>
          </div>
        </div>

        {/* Навигационные ссылки */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('map')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              currentView === 'map' || currentView === 'lesson'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Уроки</span>
          </button>

          <button
            onClick={() => onNavigate('alphabet')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              currentView === 'alphabet'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span className="font-cursive font-bold text-lg leading-none text-blue-600 dark:text-blue-400">א</span>
            <span>Прописи</span>
          </button>

          <button
            onClick={() => onNavigate('flashcards')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              currentView === 'flashcards'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Карточки</span>
          </button>

          <button
            onClick={() => onNavigate('dictionary')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              currentView === 'dictionary'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Мой словарик</span>
            {dictCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200">
                {dictCount}
              </span>
            )}
          </button>
        </nav>

        {/* Правая часть: пол, статус ИИ и Настройки */}
        <div className="flex items-center gap-2">
          {/* Быстрый переключатель шрифта (Печатный / Рукописный) */}
          <button
            onClick={onToggleFontStyle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Быстрое переключение шрифта иврита: Печатный (דפוס) / Рукописный (כתב)"
          >
            {userProfile.fontStyle === 'cursive' ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-200 leading-none">דפוס</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>

          {/* Бейдж пола */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Грамматический пол для спряжений ИИ"
          >
            <span>{userProfile.gender === 'female' ? '👩 Жен.' : '👨 Муж.'}</span>
            <span dir="rtl" className="text-[10px] font-hebrew text-zinc-400">
              {userProfile.gender === 'female' ? 'נְקֵבָה' : 'זָכָר'}
            </span>
          </button>

          {/* Кнопка настроек */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Настройки обучения"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Мобильная нижняя панель навигации */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95">
        <button
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'map' || currentView === 'lesson'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Уроки</span>
        </button>

        <button
          onClick={() => onNavigate('alphabet')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'alphabet'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-400'
          }`}
        >
          <span className="font-cursive font-bold text-xl leading-none text-blue-600 dark:text-blue-400">א</span>
          <span>Прописи</span>
        </button>

        <button
          onClick={() => onNavigate('flashcards')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'flashcards'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Карточки</span>
        </button>

        <button
          onClick={() => onNavigate('dictionary')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold ${
            currentView === 'dictionary'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-400'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            {dictCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                {dictCount}
              </span>
            )}
          </div>
          <span>Словарик</span>
        </button>
      </div>
    </header>
  );
};
