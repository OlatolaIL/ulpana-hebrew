'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  Settings,
  Sparkles,
  User,
  Heart,
  Zap,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { isVipUser } from '@/lib/vipUsers';

interface NavbarProps {
  currentView: 'map' | 'lesson' | 'flashcards' | 'dictionary' | 'alphabet';
  onNavigate: (view: 'map' | 'flashcards' | 'dictionary' | 'alphabet') => void;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  onToggleFontStyle?: () => void;
  onToggleUlpanMode?: () => void;
  onOpenAuth?: () => void;
  onOpenSubscription?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userProfile,
  onOpenSettings,
  onToggleFontStyle,
  onToggleUlpanMode,
  onOpenAuth,
  onOpenSubscription,
  onLogout,
}) => {
  const dictCount = userProfile.personalVocabulary?.length || 0;
  const isPro = userProfile.subscriptionTier === 'pro' || userProfile.subscriptionTier === 'admin';
  const isAdmin = isVipUser(userProfile.username, userProfile.telegramId, userProfile.name);

  return (
    <>
      {/* Верхний компактный навбар */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Логотип */}
          <div
            onClick={() => onNavigate('map')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition shrink-0">
              <span className="font-bold text-base sm:text-lg font-hebrew">א</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                  Ульпана
                </span>
              </div>
              <span dir="rtl" className="text-[11px] text-zinc-400 font-hebrew font-medium hidden sm:block -mt-0.5">
                עִבְרִית מִן הַהַתְחָלָה
              </span>
            </div>
          </div>

          {/* Навигационные ссылки (десктоп) */}
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
              <span>{userProfile.ulpanMode ? 'שִׁיעוּרִים' : 'Уроки'}</span>
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
              <span>{userProfile.ulpanMode ? 'כְּתַב יָד' : 'Прописи'}</span>
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
              <span>{userProfile.ulpanMode ? 'כַּרְטִיסִיּוֹת' : 'Карточки'}</span>
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
              <span>{userProfile.ulpanMode ? 'מִילּוֹן' : 'Мой словарик'}</span>
              {dictCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200">
                  {dictCount}
                </span>
              )}
            </button>
          </nav>

          {/* Правая часть: Админка (только для osa_il), PRO, авторизация и Настройки */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Кнопка Админки для osa_il */}
            {isAdmin && (
              <Link
                href="/admin"
                className="px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
                title="Панель администратора (@osa_il)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">{userProfile.ulpanMode ? 'נִהוּל' : 'Админка'}</span>
              </Link>
            )}

            {/* Кнопка подписки PRO */}
            <button
              onClick={onOpenSubscription}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0 ${
                isPro
                  ? 'border-amber-400/80 bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-amber-500/20'
                  : 'border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
              }`}
              title="Управление подпиской PRO и промокоды"
            >
              <span>👑</span>
              <span>PRO</span>
            </button>

            {/* Быстрый переключатель Режима Ульпан (Погружение עברית בעברית) */}
            <button
              onClick={onToggleUlpanMode}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                userProfile.ulpanMode
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
              title={
                userProfile.ulpanMode
                  ? 'Режим «Ульпан» (עברית בעברית) активен. Нажмите, чтобы вернуться в стандартный режим.'
                  : 'Включить Режим «Ульпан» (погружение עברית בעברית без перевода)'
              }
            >
              <GraduationCap className={`w-3.5 h-3.5 ${userProfile.ulpanMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">
                {userProfile.ulpanMode ? 'Ульпан' : 'Ульпан'}
              </span>
              {userProfile.ulpanMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Быстрый переключатель шрифта (десктоп) */}
            <button
              onClick={onToggleFontStyle}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shrink-0"
              title="Быстрое переключение шрифта иврита: Печатный / Рукописный"
            >
              {userProfile.fontStyle === 'cursive' ? (
                <>
                  <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                  <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">
                    {userProfile.ulpanMode ? 'כְּתַב' : 'Рукописный'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-200 leading-none">דפוס</span>
                  <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">
                    {userProfile.ulpanMode ? 'דְּפוּס' : 'Печатный'}
                  </span>
                </>
              )}
            </button>

            {/* Кнопка входа / Профиль пользователя */}
            {userProfile.isLoggedIn ? (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm shrink-0"
                title={`Профиль: ${userProfile.name} (@${userProfile.username || 'user'})`}
              >
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[65px] sm:max-w-[110px] truncate">
                  {userProfile.name}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1E8CC0] text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0"
                title="Войти через Telegram для синхронизации прогресса"
              >
                <span>{userProfile.ulpanMode ? 'כְּנִיסָה' : 'Войти'}</span>
              </button>
            )}

            {/* Кнопка настроек */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
              title="Настройки обучения"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Мобильная нижняя панель навигации (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'map' || currentView === 'lesson'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-zinc-400 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">
            {userProfile.ulpanMode ? 'שִׁיעוּרִים' : 'Уроки'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('alphabet')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'alphabet'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-zinc-400 font-medium'
          }`}
        >
          <span className="font-cursive font-bold text-xl leading-none mb-0.5">א</span>
          <span className="text-[11px] leading-tight">
            {userProfile.ulpanMode ? 'כְּתַב' : 'Прописи'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('flashcards')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'flashcards'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-zinc-400 font-medium'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">
            {userProfile.ulpanMode ? 'כַּרְטִיסִיּוֹת' : 'Карточки'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('dictionary')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            currentView === 'dictionary'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-zinc-400 font-medium'
          }`}
        >
          <div className="relative mb-0.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {dictCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-bold bg-amber-500 text-white">
                {dictCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">
            {userProfile.ulpanMode ? 'מִילּוֹן' : 'Словарик'}
          </span>
        </button>
      </nav>
    </>
  );
};

