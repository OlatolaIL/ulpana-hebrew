'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { CourseMap } from '@/components/CourseMap';
import { LessonView } from '@/components/LessonView';
import { FlashcardTrainer } from '@/components/FlashcardTrainer';
import { PersonalDictionary } from '@/components/PersonalDictionary';
import { AlphabetTrainer } from '@/components/AlphabetTrainer';
import { FlashcardSetupModal } from '@/components/FlashcardSetupModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { UserProfile, Word, UserSession } from '@/types';
import { loadUserProfile, saveUserProfile, resetLessonProgress } from '@/lib/storage';
import { initHebrewVoices } from '@/lib/speech';
import { DETAILED_LESSONS, getLessonById } from '@/data/lessonsData';
import { isVipUser, VIP_EXPIRES_AT, applyVipProfileEnhancements } from '@/lib/vipUsers';
import { useModalHistory } from '@/lib/useHistoryState';

type ViewMode = 'map' | 'lesson' | 'flashcards' | 'dictionary' | 'alphabet';

function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;

  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initData) {
    return tg.initData;
  }

  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const tgWebAppData = params.get('tgWebAppData');
      if (tgWebAppData) return tgWebAppData;
    }
  } catch {}

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const tgWebAppData = searchParams.get('tgWebAppData');
    if (tgWebAppData) return tgWebAppData;
  } catch {}

  return null;
}

function getTelegramUser(): any | null {
  if (typeof window === 'undefined') return null;

  // 1. Из window.Telegram.WebApp
  const tg = (window as any).Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch {}
    if (tg.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
  }

  // 2. Из window.location.hash (tgWebAppData)
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const tgWebAppData = params.get('tgWebAppData');
      if (tgWebAppData) {
        const dataParams = new URLSearchParams(tgWebAppData);
        const userStr = dataParams.get('user');
        if (userStr) {
          return JSON.parse(decodeURIComponent(userStr));
        }
      }
    }
  } catch {}

  // 3. Из window.location.search
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const tgWebAppData = searchParams.get('tgWebAppData');
    if (tgWebAppData) {
      const dataParams = new URLSearchParams(tgWebAppData);
      const userStr = dataParams.get('user');
      if (userStr) {
        return JSON.parse(decodeURIComponent(userStr));
      }
    }
  } catch {}

  return null;
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('map');
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [flashcardWords, setFlashcardWords] = useState<Word[]>([]);
  const [flashcardTitle, setFlashcardTitle] = useState<string>('Тренировка карточек');
  const [flashcardMode, setFlashcardMode] = useState<'flip' | 'builder' | 'listening'>('flip');
  const [flashcardDirection, setFlashcardDirection] = useState<'he-ru' | 'ru-he'>('he-ru');
  const [flashcardSourceLessonId, setFlashcardSourceLessonId] = useState<number | null>(null);
  const [lessonInitialTab, setLessonInitialTab] = useState<'theory' | 'vocab' | 'exercises' | 'chat' | 'phone'>('theory');
  const [isMultiLessonSetupOpen, setIsMultiLessonSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Привязка модалок страницы к истории браузера (свайп назад / кнопка Back закрывает модалку)
  useModalHistory(isSettingsOpen, () => setIsSettingsOpen(false), 'settings-modal');
  useModalHistory(isAuthModalOpen, () => setIsAuthModalOpen(false), 'auth-modal');
  useModalHistory(isSubscriptionModalOpen, () => setIsSubscriptionModalOpen(false), 'subscription-modal');
  useModalHistory(isMultiLessonSetupOpen, () => setIsMultiLessonSetupOpen(false), 'setup-modal');

  // Синхронизация данных с облаком
  const syncToCloud = useCallback(async (updated: UserProfile) => {
    if (updated.isLoggedIn) {
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonProgress: updated.lessonProgress,
            personalVocabulary: updated.personalVocabulary,
            flashcardStats: updated.flashcardStats,
            gender: updated.gender,
            fontStyle: updated.fontStyle,
          }),
        });
      } catch (e) {
        console.warn('[Sync] Cloud sync failed:', e);
      }
    }
  }, []);

  const handleUpdateProfile = useCallback(
    (updated: UserProfile) => {
      setProfile(updated);
      saveUserProfile(updated);
      syncToCloud(updated);
    },
    [syncToCloud]
  );

  useEffect(() => {
    let p = loadUserProfile();
    p = applyVipProfileEnhancements(p);
    setProfile(p);
    initHebrewVoices();

    const handleTgUserFound = (u: any, initData?: string | null) => {
      const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || (u.username ? `@${u.username}` : 'Ученик');
      const instantProfile: UserProfile = applyVipProfileEnhancements({
        ...p,
        id: `tg_${u.id}`,
        telegramId: u.id,
        username: u.username || fullName,
        name: fullName,
        avatarUrl: u.photo_url,
        isLoggedIn: true,
      });
      setProfile(instantProfile);
      saveUserProfile(instantProfile);

      if (initData) {
        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        }).catch((err) => console.warn('[WebApp Auth BG] Error:', err));
      }
    };

    // 1. Проверяем Telegram WebApp немедленно или с повторными попытками
    const initialTgUser = getTelegramUser();
    const initialInitData = getTelegramInitData();
    if (initialTgUser) {
      handleTgUserFound(initialTgUser, initialInitData);
    } else {
      let attempts = 0;
      const tgInterval = setInterval(() => {
        attempts++;
        const delayedTgUser = getTelegramUser();
        const delayedInitData = getTelegramInitData();
        if (delayedTgUser) {
          clearInterval(tgInterval);
          handleTgUserFound(delayedTgUser, delayedInitData);
        } else if (attempts >= 20) {
          clearInterval(tgInterval);
        }
      }, 100);
    }

    const initAuth = async () => {
      // 0. Проверяем токен в URL (Magic Link из Telegram-бота для браузера)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const loginToken = urlParams.get('login_token');
        if (loginToken) {
          const tokenRes = await fetch('/api/auth/token-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: loginToken }),
          });
          const tokenData = await tokenRes.json();
          if (tokenRes.ok && tokenData.success && tokenData.user) {
            window.history.replaceState({}, '', window.location.pathname);

            const syncRes = await fetch('/api/user/sync');
            const syncData = await syncRes.json();

            const merged: UserProfile = applyVipProfileEnhancements({
              ...p,
              id: tokenData.user.id,
              telegramId: tokenData.user.telegramId,
              username: tokenData.user.username,
              name: tokenData.user.name,
              avatarUrl: tokenData.user.avatarUrl,
              isLoggedIn: true,
              subscriptionTier: tokenData.user.subscriptionTier,
              subscriptionExpiresAt: tokenData.user.subscriptionExpiresAt,
              gender: tokenData.gender || p.gender,
              fontStyle: tokenData.fontStyle || p.fontStyle,
              lessonProgress: {
                ...p.lessonProgress,
                ...(syncData.lessonProgress || {}),
              },
              personalVocabulary:
                syncData.personalVocabulary && syncData.personalVocabulary.length > 0
                  ? syncData.personalVocabulary
                  : p.personalVocabulary,
              flashcardStats: {
                ...(p.flashcardStats || {}),
                ...(syncData.flashcardStats || {}),
              },
            });

            setProfile(merged);
            saveUserProfile(merged);
            return;
          }
        }
      } catch (err) {
        console.warn('[Magic Link] Auth failed:', err);
      }

      // 2. Проверяем обычную сессию cookie на сервере
      try {
        const meRes = await fetch('/api/auth/me');
        const data = await meRes.json();
        if (data.authenticated && data.user) {
          const syncRes = await fetch('/api/user/sync');
          const syncData = await syncRes.json();

          const mergedProfile: UserProfile = applyVipProfileEnhancements({
            ...p,
            id: data.user.id,
            telegramId: data.user.telegramId,
            username: data.user.username,
            name: data.user.name,
            avatarUrl: data.user.avatarUrl,
            isLoggedIn: true,
            subscriptionTier: data.user.subscriptionTier,
            subscriptionExpiresAt: data.user.subscriptionExpiresAt,
            gender: data.gender || p.gender,
            fontStyle: data.fontStyle || p.fontStyle,
            lessonProgress: {
              ...p.lessonProgress,
              ...(syncData.lessonProgress || {}),
            },
            personalVocabulary:
              syncData.personalVocabulary && syncData.personalVocabulary.length > 0
                ? syncData.personalVocabulary
                : p.personalVocabulary,
            flashcardStats: {
              ...(p.flashcardStats || {}),
              ...(syncData.flashcardStats || {}),
            },
          });

          setProfile(mergedProfile);
          saveUserProfile(mergedProfile);
        }
      } catch (err) {
        console.log('[Auth] Guest mode active:', err);
      }
    };

    initAuth();
  }, []);

  // Навигация с сохранением в историю браузера (для свайпов назад и кнопок Back)
  const navigateTo = useCallback(
    (
      view: ViewMode,
      options?: {
        lessonId?: number;
        tab?: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone';
        flashcardWords?: Word[];
        flashcardTitle?: string;
        flashcardMode?: 'flip' | 'builder' | 'listening';
        flashcardDirection?: 'he-ru' | 'ru-he';
        flashcardSourceLessonId?: number | null;
        replace?: boolean;
      }
    ) => {
      setCurrentView(view);
      if (options?.lessonId !== undefined) setActiveLessonId(options.lessonId);
      if (options?.tab) setLessonInitialTab(options.tab);
      if (options?.flashcardWords) setFlashcardWords(options.flashcardWords);
      if (options?.flashcardTitle) setFlashcardTitle(options.flashcardTitle);
      if (options?.flashcardMode) setFlashcardMode(options.flashcardMode);
      if (options?.flashcardDirection) setFlashcardDirection(options.flashcardDirection);
      if (options?.flashcardSourceLessonId !== undefined) {
        setFlashcardSourceLessonId(options.flashcardSourceLessonId);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Генерация hash для чистого URL
      let hash = '#map';
      if (view === 'lesson') {
        hash = `#lesson-${options?.lessonId || activeLessonId}`;
      } else if (view === 'flashcards') {
        hash = '#flashcards';
      } else if (view === 'dictionary') {
        hash = '#dictionary';
      } else if (view === 'alphabet') {
        hash = '#alphabet';
      }

      const stateObj = {
        view,
        lessonId: options?.lessonId !== undefined ? options.lessonId : activeLessonId,
        tab: options?.tab || lessonInitialTab,
        flashcardSourceLessonId:
          options?.flashcardSourceLessonId !== undefined
            ? options.flashcardSourceLessonId
            : flashcardSourceLessonId,
        flashcardTitle: options?.flashcardTitle || flashcardTitle,
        flashcardMode: options?.flashcardMode || flashcardMode,
        flashcardDirection: options?.flashcardDirection || flashcardDirection,
      };

      if (typeof window !== 'undefined') {
        if (options?.replace) {
          window.history.replaceState(stateObj, '', hash);
        } else {
          window.history.pushState(stateObj, '', hash);
        }
      }
    },
    [activeLessonId, lessonInitialTab, flashcardSourceLessonId, flashcardTitle, flashcardMode, flashcardDirection]
  );

  // Обработка истории браузера (popstate) при свайпе назад / системной кнопке Назад
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Первичная инициализация состояния из hash
    const initialHash = window.location.hash;
    let initialView: ViewMode = 'map';
    let initialLessonId = 1;
    let initialTab: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone' = 'theory';

    if (initialHash.startsWith('#lesson-')) {
      initialView = 'lesson';
      const num = parseInt(initialHash.replace('#lesson-', ''), 10);
      if (!isNaN(num) && num >= 1 && num <= 100) initialLessonId = num;
    } else if (initialHash === '#flashcards') {
      initialView = 'flashcards';
    } else if (initialHash === '#dictionary') {
      initialView = 'dictionary';
    } else if (initialHash === '#alphabet') {
      initialView = 'alphabet';
    }

    if (initialView !== 'map') {
      setCurrentView(initialView);
      setActiveLessonId(initialLessonId);
      setLessonInitialTab(initialTab);
    }

    window.history.replaceState(
      { view: initialView, lessonId: initialLessonId, tab: initialTab },
      '',
      initialHash || '#map'
    );

    const handlePopState = (event: PopStateEvent) => {
      // 1. Если открыты глобальные модалки - закрываем модалку в первую очередь
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }
      if (isSubscriptionModalOpen) {
        setIsSubscriptionModalOpen(false);
        return;
      }
      if (isMultiLessonSetupOpen) {
        setIsMultiLessonSetupOpen(false);
        return;
      }

      const state = event.state;
      if (state && state.view) {
        setCurrentView(state.view);
        if (state.lessonId) setActiveLessonId(state.lessonId);
        if (state.tab) setLessonInitialTab(state.tab);
        if (state.flashcardWords) setFlashcardWords(state.flashcardWords);
        if (state.flashcardTitle) setFlashcardTitle(state.flashcardTitle);
        if (state.flashcardMode) setFlashcardMode(state.flashcardMode);
        if (state.flashcardDirection) setFlashcardDirection(state.flashcardDirection);
        if (state.flashcardSourceLessonId !== undefined) {
          setFlashcardSourceLessonId(state.flashcardSourceLessonId);
        }
      } else {
        // Фоллбек: разбираем hash
        const curHash = window.location.hash;
        if (curHash.startsWith('#lesson-')) {
          const id = parseInt(curHash.replace('#lesson-', ''), 10);
          setCurrentView('lesson');
          if (!isNaN(id)) setActiveLessonId(id);
        } else if (curHash === '#flashcards') {
          setCurrentView('flashcards');
        } else if (curHash === '#dictionary') {
          setCurrentView('dictionary');
        } else if (curHash === '#alphabet') {
          setCurrentView('alphabet');
        } else {
          setCurrentView('map');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSettingsOpen, isAuthModalOpen, isSubscriptionModalOpen, isMultiLessonSetupOpen]);

  // Интеграция с Telegram WebApp BackButton
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const isModalOpen =
      isSettingsOpen ||
      isAuthModalOpen ||
      isSubscriptionModalOpen ||
      isMultiLessonSetupOpen;

    const isRoot = currentView === 'map' && !isModalOpen;

    if (isRoot) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      const handleTgBack = () => {
        window.history.back();
      };
      tg.BackButton.onClick(handleTgBack);
      return () => {
        tg.BackButton.offClick(handleTgBack);
      };
    }
  }, [currentView, isSettingsOpen, isAuthModalOpen, isSubscriptionModalOpen, isMultiLessonSetupOpen]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Загрузка программы ульпана...</p>
        </div>
      </div>
    );
  }

  const isPro = profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'admin';

  const handleSelectLesson = (
    id: number,
    tab?: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone'
  ) => {
    if (id > 3 && !isPro) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    navigateTo('lesson', { lessonId: id, tab: tab || 'theory' });
  };

  const handleResetLessonProgress = (lessonId: number) => {
    const updated = resetLessonProgress(lessonId);
    handleUpdateProfile(updated);
  };

  const handleStartFlashcards = (
    wordsToTrain: Word[],
    title?: string,
    mode?: 'flip' | 'builder' | 'listening',
    lessonId?: number,
    direction?: 'he-ru' | 'ru-he'
  ) => {
    const customTitle =
      title ||
      (lessonId
        ? (profile?.ulpanMode
            ? `שִׁיעוּר ${lessonId}: כַּרְטִיסִיּוֹת מִילִּים`
            : `Урок ${lessonId}: Карточки словаря`)
        : (profile?.ulpanMode
            ? 'תִּרְגּוּל כַּרְטִיסִיּוֹת'
            : 'Тренировка карточек'));

    navigateTo('flashcards', {
      flashcardWords: wordsToTrain,
      flashcardTitle: customTitle,
      flashcardMode: mode || 'flip',
      flashcardSourceLessonId: lessonId || null,
      flashcardDirection: direction || flashcardDirection || 'he-ru',
    });
  };

  const handleCloseFlashcards = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      if (flashcardSourceLessonId) {
        navigateTo('lesson', { lessonId: flashcardSourceLessonId, replace: true });
      } else {
        navigateTo('map', { replace: true });
      }
    }
  };

  const handleContinueLessonFromFlashcards = (
    lessonId: number,
    nextTab: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone'
  ) => {
    navigateTo('lesson', { lessonId, tab: nextTab });
  };

  const handleLaunchGeneralFlashcards = () => {
    setIsMultiLessonSetupOpen(true);
  };

  const handleToggleFontStyle = () => {
    const nextStyle = profile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...profile, fontStyle: nextStyle };
    handleUpdateProfile(updated);
  };

  const handleToggleUlpanMode = () => {
    const nextUlpan = !profile.ulpanMode;
    const updated: UserProfile = {
      ...profile,
      ulpanMode: nextUlpan,
      ...(nextUlpan ? { showTranscription: false } : {}),
    };
    handleUpdateProfile(updated);
  };

  const handleLoginSuccess = async (
    session: UserSession,
    gender?: 'male' | 'female',
    fontStyle?: 'print' | 'cursive'
  ) => {
    const updated: UserProfile = {
      ...profile,
      id: session.id,
      telegramId: session.telegramId,
      username: session.username,
      name: session.name,
      avatarUrl: session.avatarUrl,
      isLoggedIn: true,
      subscriptionTier: session.subscriptionTier,
      subscriptionExpiresAt: session.subscriptionExpiresAt,
      gender: gender || profile.gender,
      fontStyle: fontStyle || profile.fontStyle,
    };

    handleUpdateProfile(updated);

    // Сразу загружаем в облако локальный прогресс
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonProgress: updated.lessonProgress,
          personalVocabulary: updated.personalVocabulary,
          flashcardStats: updated.flashcardStats,
          gender: updated.gender,
          fontStyle: updated.fontStyle,
        }),
      });
    } catch (e) {
      console.warn('[Sync] Initial push failed:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    const guestProfile: UserProfile = {
      ...profile,
      id: undefined,
      telegramId: undefined,
      username: undefined,
      avatarUrl: undefined,
      isLoggedIn: false,
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      name: 'Ученик',
    };
    handleUpdateProfile(guestProfile);
  };

  const handlePromoActivated = (updatedSession: UserSession) => {
    const updated: UserProfile = {
      ...profile,
      subscriptionTier: updatedSession.subscriptionTier,
      subscriptionExpiresAt: updatedSession.subscriptionExpiresAt,
    };
    handleUpdateProfile(updated);
  };

  const handleCloseLesson = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('map', { replace: true });
    }
  };

  return (
    <div
      data-font-style={profile.fontStyle || 'print'}
      className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans"
    >
      {/* Навбар */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'flashcards') {
            handleLaunchGeneralFlashcards();
          } else {
            navigateTo(view);
          }
        }}
        userProfile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleFontStyle={handleToggleFontStyle}
        onToggleUlpanMode={handleToggleUlpanMode}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Основная рабочая область */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto ${
          currentView === 'lesson'
            ? 'p-1.5 sm:p-2 sm:px-4 flex flex-col min-h-0 h-[100dvh] overflow-hidden'
            : 'px-2 sm:px-4 py-4 md:py-6 pb-24 md:pb-8'
        }`}
      >
        {currentView === 'map' && (
          <CourseMap
            userProfile={profile}
            onSelectLesson={handleSelectLesson}
            onRequirePro={() => setIsSubscriptionModalOpen(true)}
            onResetLessonProgress={handleResetLessonProgress}
          />
        )}

        {currentView === 'lesson' && (
          <LessonView
            lessonId={activeLessonId}
            initialTab={lessonInitialTab}
            userProfile={profile}
            onBack={handleCloseLesson}
            onSelectLesson={(id) => handleSelectLesson(id, 'theory')}
            onStartFlashcards={(words, lessonId) =>
              handleStartFlashcards(
                words,
                `Урок ${lessonId || activeLessonId}: Карточки словаря`,
                'flip',
                lessonId || activeLessonId
              )
            }
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCloseFlashcards}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer flex items-center gap-1"
              >
                <span>
                  {flashcardSourceLessonId
                    ? (profile?.ulpanMode
                        ? `← חֲזָרָה לְשִׁיעוּר ${flashcardSourceLessonId}`
                        : `← Вернуться в урок ${flashcardSourceLessonId}`)
                    : (profile?.ulpanMode ? '← חֲזָרָה' : '← Вернуться назад')}
                </span>
              </button>
            </div>
            <FlashcardTrainer
              initialWords={flashcardWords}
              userProfile={profile}
              customTitle={flashcardTitle}
              initialMode={flashcardMode}
              initialDirection={flashcardDirection}
              lessonId={flashcardSourceLessonId || undefined}
              onContinueLesson={handleContinueLessonFromFlashcards}
              onClose={handleCloseFlashcards}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {currentView === 'alphabet' && (
          <AlphabetTrainer userProfile={profile} />
        )}

        {currentView === 'dictionary' && (
          <PersonalDictionary
            userProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onStartPractice={(words, title) => handleStartFlashcards(words, title)}
            onOpenMultiLessonSetup={() => setIsMultiLessonSetupOpen(true)}
          />
        )}
      </main>

      {/* Модалка выбора уроков и фильтра слов для карточек */}
      {isMultiLessonSetupOpen && profile && (
        <FlashcardSetupModal
          userProfile={profile}
          onClose={() => setIsMultiLessonSetupOpen(false)}
          onStartSession={(words, mode, title, direction) => {
            handleStartFlashcards(words, title, mode, undefined, direction);
          }}
        />
      )}

      {/* Модалка настроек */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Модалка авторизации через Telegram */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Модалка подписки PRO и промокодов */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userProfile={profile}
        onPromoActivated={handlePromoActivated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
}

