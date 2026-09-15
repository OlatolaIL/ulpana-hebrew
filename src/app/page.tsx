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
import { AuthModal, AuthModalReason } from '@/components/AuthModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { SectionGuideDrawer } from '@/components/SectionGuideDrawer';
import { useGuidePreference } from '@/lib/useGuidePreference';
import { FeedbackDrawer } from '@/components/FeedbackDrawer';
import { FeedbackButton } from '@/components/FeedbackButton';
import { UserProfile, Word, UserSession, ThematicDeck } from '@/types';
import {
  createGuestProfile,
  loadAccountProfile,
  loadUserProfile,
  saveUserProfile,
  resetLessonProgress,
  getFirstIncompleteLessonTab,
  sanitizePersonalVocabulary,
  LessonStageTab,
} from '@/lib/storage';
import { hydrateAccount, syncProfile, resetSyncSession, finishPendingSync, resolveSyncConflict } from '@/lib/profileSync';
import { initHebrewVoices } from '@/lib/speech';
import { DETAILED_LESSONS, getLessonById } from '@/data/lessonsData';
import { isVipUser, VIP_EXPIRES_AT, applyVipProfileEnhancements } from '@/lib/vipUsers';
import { useModalHistory } from '@/lib/useHistoryState';
import { isLessonLockedForUser, isLessonAuthRequired } from '@/lib/config';

type ViewMode = 'map' | 'lesson' | 'flashcards' | 'dictionary' | 'alphabet';
type TelegramWindow = Window & { Telegram?: { WebApp?: { initData?: string; isVersionAtLeast?: (version: string) => boolean; BackButton?: { hide: () => void; show: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void } } } };


function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;

  const tg = (window as TelegramWindow).Telegram?.WebApp;
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

export default function Home() {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('map');
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [flashcardWords, setFlashcardWords] = useState<Word[]>([]);
  const [flashcardTitle, setFlashcardTitle] = useState<string>('Тренировка карточек');
  const [flashcardMode, setFlashcardMode] = useState<'flip' | 'builder' | 'listening' | 'auto_audio'>('flip');
  const [flashcardDirection, setFlashcardDirection] = useState<'he-ru' | 'ru-he'>('he-ru');
  const [flashcardShuffle, setFlashcardShuffle] = useState<boolean>(false);
  const [flashcardSourceLessonId, setFlashcardSourceLessonId] = useState<number | null>(null);
  const [lessonInitialTab, setLessonInitialTab] = useState<LessonStageTab>('theory');
  const [isMultiLessonSetupOpen, setIsMultiLessonSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingLessonId, setPendingLessonId] = useState<number | null>(null);
  const [pendingDeckId, setPendingDeckId] = useState<string | null>(null);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [authModalReason, setAuthModalReason] = useState<AuthModalReason | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isGuideDrawerOpen, setIsGuideDrawerOpen] = useState(false);
  const [autoShowGuides] = useGuidePreference();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackLessonTab, setFeedbackLessonTab] = useState<string | undefined>(undefined);
  const [showFloatingFeedback, setShowFloatingFeedback] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ulpana_show_floating_feedback') !== 'false';
    }
    return true;
  });

  const handleToggleFloatingFeedback = (show: boolean) => {
    setShowFloatingFeedback(show);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ulpana_show_floating_feedback', show ? 'true' : 'false');
    }
  };

  // Привязка модалок страницы к истории браузера (свайп назад / кнопка Back закрывает модалку)
  useModalHistory(isSettingsOpen, () => setIsSettingsOpen(false), 'settings-modal');
  useModalHistory(isAuthModalOpen, () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    setPendingLessonId(null);
    setPendingDeckId(null);
  }, 'auth-modal');
  useModalHistory(isSubscriptionModalOpen, () => setIsSubscriptionModalOpen(false), 'subscription-modal');
  useModalHistory(isGuideDrawerOpen, () => setIsGuideDrawerOpen(false), 'guide-drawer');
  useModalHistory(isMultiLessonSetupOpen, () => setIsMultiLessonSetupOpen(false), 'setup-modal');

  const syncToCloud = useCallback(async (updated: UserProfile) => {
    if (!updated.isLoggedIn) return;
    try { await syncProfile(updated); setSyncError(null); }
    catch (error) { setSyncError(error instanceof Error ? error.message : 'Ошибка облачного сохранения'); }
  }, []);

  const handleUpdateProfile = useCallback((updated: UserProfile) => {
    const pending = { ...updated, cloudSyncPending: Boolean(updated.isLoggedIn) };
    setProfile(pending);
    saveUserProfile(pending);
    void syncToCloud(pending);
  }, [syncToCloud]);

  const initializeNavigation = useCallback((verifiedProfile: UserProfile) => {
    // Первичная инициализация состояния из hash
    const initialHash = window.location.hash;
    let initialView: ViewMode = 'map';
    let initialLessonId = 1;
    let initialTab: LessonStageTab = 'theory';

    if (initialHash.startsWith('#lesson-')) {
      const num = parseInt(initialHash.replace('#lesson-', ''), 10);
      const userProf = verifiedProfile;
      if (!isNaN(num) && num >= 1 && num <= 100) {
        if (isLessonAuthRequired(num, Boolean(userProf.isLoggedIn))) {
          setPendingLessonId(num);
          setAuthModalReason({
            lessonId: num,
            title: `Урок ${num} доступен после бесплатной регистрации`,
            description: `Уроки 1 и 2 открыты всем гостям. Чтобы перейти к уроку ${num} и сохранять прогресс — войдите бесплатно в 1 клик.`,
          });
          setIsAuthModalOpen(true);
          initialView = 'map';
        } else {
          initialView = 'lesson';
          initialLessonId = num;
          initialTab = getFirstIncompleteLessonTab(num, userProf);
        }
      }
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

  }, []);

  useEffect(() => {
    let cancelled = false;
    initHebrewVoices();
    const initAuth = async () => {
      const cached = loadUserProfile();
      try {
        const url = new URL(window.location.href);
        const loginToken = url.searchParams.get('login_token');
        const initData = getTelegramInitData();
        if (loginToken) {
          url.searchParams.delete('login_token');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          const login = await fetch('/api/auth/token-login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: loginToken }),
          });
          if (!login.ok) throw new Error('Ссылка для входа недействительна. Войдите снова.');
        } else if (initData) {
          const login = await fetch('/api/auth/telegram', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData }),
          });
          if (!login.ok) throw new Error('Не удалось подтвердить вход через Telegram.');
        }
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) throw new Error('Не удалось проверить сессию.');
        const data = await response.json();
        if (data.authenticated && data.user) {
          const loaded = await hydrateAccount(data.user);
          if (cancelled) return;
          const updated = applyVipProfileEnhancements({ ...loaded, gender: data.gender || loaded.gender, fontStyle: data.fontStyle || loaded.fontStyle });
          setProfile(updated); saveUserProfile(updated); initializeNavigation(updated);
          if (updated.cloudSyncPending) void syncToCloud(updated);
        } else if (!cancelled) {
          if (cached.id) saveUserProfile(cached);
          const guest = cached.id ? createGuestProfile() : cached;
          setProfile(guest); saveUserProfile(guest); initializeNavigation(guest);
        }
      } catch (error) {
        if (!cancelled) {
          const offline = { ...cached, isLoggedIn: false };
          setProfile(offline); initializeNavigation(offline);
          setSyncError(error instanceof Error ? error.message : 'Не удалось загрузить профиль.');
        }
      }
    };
    void initAuth();
    return () => { cancelled = true; };
  }, [syncToCloud, initializeNavigation]);

  // Навигация с сохранением в историю браузера (для свайпов назад и кнопок Back)
  const navigateTo = useCallback(
    (
      view: ViewMode,
      options?: {
        lessonId?: number;
        tab?: LessonStageTab;
        flashcardWords?: Word[];
        flashcardTitle?: string;
        flashcardMode?: 'flip' | 'builder' | 'listening' | 'auto_audio';
        flashcardDirection?: 'he-ru' | 'ru-he';
        flashcardShuffle?: boolean;
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
      if (options?.flashcardShuffle !== undefined) setFlashcardShuffle(options.flashcardShuffle);
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

  const handleCloseFlashcards = useCallback(() => {
    if (flashcardSourceLessonId) {
      navigateTo('lesson', { lessonId: flashcardSourceLessonId });
    } else {
      navigateTo('dictionary');
    }
  }, [flashcardSourceLessonId, navigateTo]);
  const handleCloseLesson = useCallback(() => {
    navigateTo('map');
  }, [navigateTo]);

  // Интеграция с Telegram WebApp BackButton
  useEffect(() => {
    const tg = (window as TelegramWindow).Telegram?.WebApp;
    const isBackButtonSupported = Boolean(
      tg &&
      typeof tg.isVersionAtLeast === 'function' &&
      tg.isVersionAtLeast('6.1') &&
      tg.BackButton
    );
    if (!isBackButtonSupported) return;

    const isModalOpen =
      isSettingsOpen ||
      isAuthModalOpen ||
      isSubscriptionModalOpen ||
      isMultiLessonSetupOpen;

    const isRoot = currentView === 'map' && !isModalOpen;

    if (isRoot) {
      tg!.BackButton!.hide();
    } else {
      tg!.BackButton!.show();
      const handleTgBack = () => {
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isAuthModalOpen) { setIsAuthModalOpen(false); return; }
        if (isSubscriptionModalOpen) { setIsSubscriptionModalOpen(false); return; }
        if (isMultiLessonSetupOpen) { setIsMultiLessonSetupOpen(false); return; }
        if (currentView === 'flashcards') {
          handleCloseFlashcards();
        } else if (currentView !== 'map') {
          handleCloseLesson();
        } else {
          window.history.back();
        }
      };
      tg!.BackButton!.onClick(handleTgBack);
      return () => {
        tg!.BackButton!.offClick(handleTgBack);
      };
    }
  }, [currentView, isSettingsOpen, isAuthModalOpen, isSubscriptionModalOpen, isMultiLessonSetupOpen, handleCloseFlashcards, handleCloseLesson]);

  // Автоматический показ шторки-подсказки при первом посещении раздела
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!autoShowGuides) return;
    if (!profile || isSettingsOpen || isAuthModalOpen || isSubscriptionModalOpen ||
        isMultiLessonSetupOpen || isFeedbackOpen || isGuideDrawerOpen) return;

    const seenKey = `ulpana_seen_guide_${currentView}`;
    const alreadySeen = localStorage.getItem(seenKey);
    if (!alreadySeen) {
      const timer = setTimeout(() => {
        localStorage.setItem(seenKey, 'true');
        setIsGuideDrawerOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentView, autoShowGuides, profile, isSettingsOpen, isAuthModalOpen, isSubscriptionModalOpen,
      isMultiLessonSetupOpen, isFeedbackOpen, isGuideDrawerOpen]);

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

  const handleRequireAuth = (lessonId?: number) => {
    if (lessonId) {
      setPendingLessonId(lessonId);
      setPendingDeckId(null);
      setAuthModalReason({
        lessonId,
        title: `Урок ${lessonId} доступен после бесплатной регистрации`,
        description: `Уроки 1 и 2 открыты всем гостям. Чтобы перейти к уроку ${lessonId}, продолжить обучение и сохранять свой прогресс — зарегистрируйтесь бесплатно в 1 клик.`,
      });
    } else {
      setPendingLessonId(null);
      setPendingDeckId(null);
      setAuthModalReason(null);
    }
    setIsAuthModalOpen(true);
  };

  const handleRequireDeckAuth = (deck: ThematicDeck) => {
    setPendingDeckId(deck.id);
    setPendingLessonId(null);
    setAuthModalReason({
      title: `Колода «${deck.title}»`,
      description: `Тематические и профессиональные словари входят в тариф PRO. На период бета-тестирования они открыты на 100% бесплатно! Войдите в 1 клик через Telegram или Google, чтобы учить слова.`,
    });
    setIsAuthModalOpen(true);
  };

  const handleSelectLesson = (
    id: number,
    tab?: LessonStageTab
  ) => {
    if (isLessonAuthRequired(id, Boolean(profile.isLoggedIn))) {
      handleRequireAuth(id);
      return;
    }
    if (isLessonLockedForUser(id, isPro)) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    const resolvedTab = tab || getFirstIncompleteLessonTab(id, profile);
    navigateTo('lesson', { lessonId: id, tab: resolvedTab });
  };

  const handleResetLessonProgress = (lessonId: number) => {
    const updated = resetLessonProgress(lessonId);
    handleUpdateProfile(updated);
  };

  const handleStartFlashcards = (
    wordsToTrain: Word[],
    title?: string,
    mode?: 'flip' | 'builder' | 'listening' | 'auto_audio',
    lessonId?: number,
    direction?: 'he-ru' | 'ru-he',
    shuffle?: boolean
  ) => {
    const customTitle =
      title ||
      (lessonId
        ? `Урок ${lessonId}: Карточки словаря`
        : 'Тренировка карточек');

    navigateTo('flashcards', {
      flashcardWords: wordsToTrain,
      flashcardTitle: customTitle,
      flashcardMode: mode || 'flip',
      flashcardSourceLessonId: lessonId || null,
      flashcardDirection: direction || flashcardDirection || 'he-ru',
      flashcardShuffle: shuffle ?? false,
    });
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

  const handleLoginSuccess = async (
    session: UserSession,
    gender?: 'male' | 'female',
    fontStyle?: 'print' | 'cursive'
  ) => {
    resetSyncSession();
    let updated: UserProfile;
    try {
      updated = await hydrateAccount(session);
      updated = { ...updated, gender: gender || updated.gender, fontStyle: fontStyle || updated.fontStyle };
      setSyncError(null);
    } catch (error) {
      updated = { ...loadAccountProfile(session.id), ...session, isLoggedIn: true };
      setSyncError(error instanceof Error ? error.message : 'Не удалось загрузить профиль.');
    }
    setProfile(updated);
    saveUserProfile(updated);
    if (updated.cloudSyncPending && updated.cloudRevision !== undefined) void syncToCloud(updated);

    // Если перед авторизацией был выбран урок 3+ — сразу открываем его
    if (pendingLessonId) {
      const targetId = pendingLessonId;
      setPendingLessonId(null);
      setPendingDeckId(null);
      setAuthModalReason(null);
      const targetTab = getFirstIncompleteLessonTab(targetId, updated);
      navigateTo('lesson', { lessonId: targetId, tab: targetTab });
    } else if (pendingDeckId) {
      const targetDeckId = pendingDeckId;
      setPendingDeckId(null);
      setPendingLessonId(null);
      setAuthModalReason(null);
      setActiveDeckId(targetDeckId);
      if (currentView !== 'dictionary') {
        navigateTo('dictionary');
      }
    }

  };

  const handleLogout = async () => {
    await finishPendingSync();
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Не удалось выйти. Повторите попытку.');
    } catch {
      setSyncError('Не удалось выйти из аккаунта. Проверьте подключение и повторите попытку.');
      return;
    }
    saveUserProfile(loadUserProfile());
    resetSyncSession();
    const guest = createGuestProfile();
    setProfile(guest); saveUserProfile(guest); setSyncError(null);
    navigateTo('map');
  };

  const handleSyncChoice = async (choice: 'local' | 'cloud') => {
    const message = choice === 'local'
      ? 'Заменить облачный прогресс версией из этого браузера? Предыдущие версии будут сохранены локально как резервная копия.'
      : 'Загрузить облачный прогресс? Текущая версия останется в локальной резервной копии.';
    if (!window.confirm(message)) return;
    setSyncBusy(true);
    try { const updated = await resolveSyncConflict(choice); setProfile(updated); setSyncError(null); }
    catch (error) { setSyncError(error instanceof Error ? error.message : 'Ошибка синхронизации'); }
    finally { setSyncBusy(false); }
  };

  const handlePromoActivated = (updatedSession: UserSession) => {
    const updated: UserProfile = {
      ...profile,
      subscriptionTier: updatedSession.subscriptionTier,
      subscriptionExpiresAt: updatedSession.subscriptionExpiresAt,
    };
    handleUpdateProfile(updated);
  };



  const handleOpenFeedback = (tab?: string) => {
    setFeedbackLessonTab(tab);
    setIsFeedbackOpen(true);
  };

  const activeLessonData = getLessonById(activeLessonId);
  const feedbackContext = {
    view: currentView,
    lessonId: currentView === 'lesson' ? activeLessonId : undefined,
    lessonTitle: currentView === 'lesson' ? (activeLessonData?.titleRussian || activeLessonData?.titleHebrew) : undefined,
    lessonTab: currentView === 'lesson' ? (feedbackLessonTab || lessonInitialTab) : undefined,
  };

  return (
    <div
      data-font-style={profile.fontStyle || 'print'}
      className={`flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans ${
        currentView === 'lesson' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {syncError && (
        <div role="alert" className="shrink-0 bg-amber-50 text-amber-950 border-b border-amber-200 px-4 py-3 text-sm">
          <p>{syncError}</p>
          {profile.isLoggedIn && <div className="flex flex-wrap gap-3 mt-2">
            <button disabled={syncBusy} onClick={() => handleSyncChoice('local')} className="underline">Сохранить мою версию в облаке</button>
            <button disabled={syncBusy} onClick={() => handleSyncChoice('cloud')} className="underline">Загрузить облачную версию</button>
          </div>}
        </div>
      )}
      {/* Навбар */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'flashcards') {
            navigateTo('dictionary');
          } else {
            navigateTo(view);
          }
        }}
        userProfile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => {
          localStorage.setItem(`ulpana_seen_guide_${currentView}`, 'true');
          setIsGuideDrawerOpen(true);
        }}
        onOpenFeedback={() => handleOpenFeedback()}
        onToggleFontStyle={handleToggleFontStyle}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Основная рабочая область */}
      <main
        className={`flex-1 max-w-6xl w-full mx-auto min-h-0 ${
          currentView === 'lesson'
            ? 'p-1.5 sm:p-2 sm:px-4 flex flex-col overflow-hidden h-full'
            : 'px-2 sm:px-4 py-4 md:py-6 pb-24 md:pb-8'
        }`}
      >
        {currentView === 'map' && (
          <CourseMap
            userProfile={profile}
            onSelectLesson={handleSelectLesson}
            onRequireAuth={handleRequireAuth}
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
            onOpenAuth={() => handleRequireAuth(activeLessonId)}
            onStartFlashcards={(words, lessonId) =>
              handleStartFlashcards(
                words,
                `Урок ${lessonId || activeLessonId}: Карточки словаря`,
                'flip',
                lessonId || activeLessonId
              )
            }
            onUpdateProfile={handleUpdateProfile}
            onResetLessonProgress={handleResetLessonProgress}
            onOpenFeedback={(tab) => handleOpenFeedback(tab)}
          />
        )}

        {currentView === 'flashcards' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCloseFlashcards}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer flex items-center gap-1"
              >
                <span>
                  {flashcardSourceLessonId
                    ? `← Вернуться в урок ${flashcardSourceLessonId}`
                    : '← Вернуться в словарик'}
                </span>
              </button>
            </div>
            <FlashcardTrainer
              key={`${flashcardTitle}-${flashcardWords.length}-${flashcardShuffle ? 'shuffled' : 'ordered'}`}
              initialWords={flashcardWords}
              userProfile={profile}
              customTitle={flashcardTitle}
              initialMode={flashcardMode}
              initialDirection={flashcardDirection}
              initialShuffle={flashcardShuffle}
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
            initialDeckId={activeDeckId}
            onUpdateProfile={handleUpdateProfile}
            onStartPractice={(words, title, mode, shuffle, direction) =>
              handleStartFlashcards(words, title, mode, undefined, direction, shuffle)
            }
            onOpenMultiLessonSetup={() => setIsMultiLessonSetupOpen(true)}
            onRequireAuth={handleRequireDeckAuth}
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
        onOpenFeedback={() => handleOpenFeedback()}
        showFloatingFeedback={showFloatingFeedback}
        onToggleFloatingFeedback={handleToggleFloatingFeedback}
        onLogout={handleLogout}
      />

      {/* Модалка авторизации через Telegram / Google */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalReason(null);
          setPendingLessonId(null);
          setPendingDeckId(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        reason={authModalReason}
      />

      {/* Модалка подписки PRO и промокодов */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        userProfile={profile}
        onPromoActivated={handlePromoActivated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Плавающая кнопка сообщения об ошибке / обратной связи (можно скрыть) */}
      {showFloatingFeedback && currentView !== 'lesson' && currentView !== 'flashcards' && (
        <FeedbackButton
          onClick={() => handleOpenFeedback()}
          onDismiss={() => handleToggleFloatingFeedback(false)}
        />
      )}

      {/* Всплывающая шторка обратной связи и сообщений об ошибках (@Osa_IL) */}
      <FeedbackDrawer
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        userProfile={profile}
        pageContext={feedbackContext}
      />

      {/* Выезжающая шторка-гид по возможностям разделов платформы */}
      <SectionGuideDrawer
        isOpen={isGuideDrawerOpen}
        onClose={() => setIsGuideDrawerOpen(false)}
        activeSection={currentView}
      />
    </div>
  );
}
