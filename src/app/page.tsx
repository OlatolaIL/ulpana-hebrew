'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, X } from 'lucide-react';
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
import { ChannelSubscribeModal } from '@/components/ChannelSubscribeModal';
import {
  AccessRequirement,
  checkContentAccess,
  getEffectiveLessonRequirement,
} from '@/lib/accessPolicy';

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
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [channelModalLessonNumber, setChannelModalLessonNumber] = useState<number | undefined>(undefined);
  const [accessRules, setAccessRules] = useState<Record<number, AccessRequirement> | null>(null);
  const [isEarlyAccessFreeStatus, setIsEarlyAccessFreeStatus] = useState<boolean | undefined>(undefined);
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

  const [capturedPromoToast, setCapturedPromoToast] = useState<string | null>(null);

  useEffect(() => {
    if (!capturedPromoToast) return;
    const timer = setTimeout(() => {
      setCapturedPromoToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [capturedPromoToast]);

  // Привязка модалок страницы к истории браузера (свайп назад / кнопка Back закрывает модалку)
  useModalHistory(isSettingsOpen, () => setIsSettingsOpen(false), 'settings-modal');
  useModalHistory(isAuthModalOpen, () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    setPendingLessonId(null);
    setPendingDeckId(null);
  }, 'auth-modal');
  useModalHistory(isSubscriptionModalOpen, () => setIsSubscriptionModalOpen(false), 'subscription-modal');
  useModalHistory(isChannelModalOpen, () => setIsChannelModalOpen(false), 'channel-modal');
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
    let initialHash = window.location.hash;
    let initialView: ViewMode = 'map';
    let initialLessonId = 1;
    let initialTab: LessonStageTab = 'theory';

    // Проверка параметров URL search, если hash не задан
    if (!initialHash && typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const qLesson = searchParams.get('lesson');
        const qStage = searchParams.get('stage');
        if (qLesson) {
          const num = parseInt(qLesson, 10);
          const stageSlug = qStage ? qStage.toLowerCase() : '';
          initialHash = `#lesson-${num}${stageSlug ? `/${stageSlug}` : ''}`;
        }
      } catch {}
    }

    if (initialHash.startsWith('#lesson-')) {
      const raw = initialHash.replace('#lesson-', '');
      const slashIndex = raw.indexOf('/');
      const num = parseInt(slashIndex === -1 ? raw : raw.slice(0, slashIndex), 10);
      const tabSlug = slashIndex === -1 ? '' : raw.slice(slashIndex + 1).toLowerCase();

      const tabMap: Record<string, LessonStageTab> = {
        theory: 'theory',
        vocab: 'vocab',
        vocabulary: 'vocab',
        exercises: 'exercises',
        essay: 'essay',
        chat: 'chat',
        dialogue: 'chat',
        dialog: 'chat',
        phone: 'phone',
        call: 'phone',
        '1': 'theory',
        '2': 'vocab',
        '3': 'exercises',
        '4': 'essay',
        '5': 'chat',
        '6': 'phone',
      };
      const requestedTab = tabMap[tabSlug];

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
          initialTab = requestedTab || getFirstIncompleteLessonTab(num, userProf);
        }
      }
    } else if (initialHash === '#flashcards') {
      let recoveredWords: Word[] = [];
      let recoveredTitle = 'Тренировка карточек';
      let recoveredMode: 'flip' | 'builder' | 'listening' | 'auto_audio' = 'flip';
      let recoveredDirection: 'he-ru' | 'ru-he' = 'he-ru';
      let recoveredShuffle = false;
      let recoveredLessonId: number | null = null;

      try {
        const state = typeof window !== 'undefined' ? window.history.state : null;
        if (state && Array.isArray(state.flashcardWords) && state.flashcardWords.length > 0) {
          recoveredWords = state.flashcardWords;
          if (state.flashcardTitle) recoveredTitle = state.flashcardTitle;
          if (state.flashcardMode) recoveredMode = state.flashcardMode;
          if (state.flashcardDirection) recoveredDirection = state.flashcardDirection;
          if (state.flashcardShuffle !== undefined) recoveredShuffle = state.flashcardShuffle;
          if (state.flashcardSourceLessonId !== undefined) recoveredLessonId = state.flashcardSourceLessonId;
        } else if (typeof window !== 'undefined') {
          const raw = sessionStorage.getItem('ulpana_active_flashcards');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.words) && parsed.words.length > 0) {
              recoveredWords = parsed.words;
              if (parsed.title) recoveredTitle = parsed.title;
              if (parsed.mode) recoveredMode = parsed.mode;
              if (parsed.direction) recoveredDirection = parsed.direction;
              if (parsed.shuffle !== undefined) recoveredShuffle = parsed.shuffle;
              if (parsed.lessonId !== undefined) recoveredLessonId = parsed.lessonId;
            }
          }
        }
      } catch {}

      if (recoveredWords.length > 0) {
        initialView = 'flashcards';
        setFlashcardWords(recoveredWords);
        setFlashcardTitle(recoveredTitle);
        setFlashcardMode(recoveredMode);
        setFlashcardDirection(recoveredDirection);
        setFlashcardShuffle(recoveredShuffle);
        setFlashcardSourceLessonId(recoveredLessonId);
      } else {
        // Нет сохраненных слов для тренировки — перенаправляем в словарик вместо зависшего экрана
        initialView = 'dictionary';
        initialHash = '#dictionary';
      }
    } else if (initialHash.startsWith('#deck-') || initialHash.startsWith('#decks/')) {
      const rawDeckId = initialHash.startsWith('#deck-')
        ? initialHash.replace('#deck-', '')
        : initialHash.replace('#decks/', '');
      initialView = 'dictionary';
      setActiveDeckId(rawDeckId);
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

        // Захват промокода или реферального источника из URL (?promo=FB или ?ref=FB)
        const promoParam = (url.searchParams.get('promo') || url.searchParams.get('ref'))?.trim().toUpperCase();
        if (promoParam) {
          try {
            localStorage.setItem('ulpana_pending_promo', promoParam);
            localStorage.setItem('ulpana_referral_source', promoParam);
            localStorage.setItem('ulpana_promo_captured_at', Date.now().toString());
          } catch {}
          // Cookie-мост: дублируем промокод в cookie, доступную серверу при auth-запросе.
          // httpOnly: false — клиент должен уметь удалить cookie после активации (R-16).
          document.cookie = `ulpana_promo_ref=${encodeURIComponent(promoParam)}; Max-Age=604800; Path=/; SameSite=Lax`;
          setCapturedPromoToast(promoParam);
          url.searchParams.delete('promo');
          url.searchParams.delete('ref');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
        }
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
        const pendingPromo = promoParam || (typeof window !== 'undefined' ? localStorage.getItem('ulpana_pending_promo') : null);
        if (data.authenticated && data.user) {
          const loaded = await hydrateAccount(data.user);
          if (cancelled) return;
          const updated = applyVipProfileEnhancements({
            ...loaded,
            gender: data.gender || loaded.gender,
            fontStyle: data.fontStyle || loaded.fontStyle,
            promoPending: loaded.promoPending || pendingPromo || undefined,
          });
          setProfile(updated); saveUserProfile(updated); initializeNavigation(updated);
          if (updated.cloudSyncPending) void syncToCloud(updated);
        } else if (!cancelled) {
          if (cached.id) saveUserProfile(cached);
          const guest = cached.id
            ? { ...createGuestProfile(), promoPending: pendingPromo || undefined }
            : { ...cached, promoPending: cached.promoPending || pendingPromo || undefined };
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

  useEffect(() => {
    fetch('/api/admin/access-rules')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setIsEarlyAccessFreeStatus(Boolean(data.isEarlyAccessFree));
          if (data.lessonRules) {
            setAccessRules(data.lessonRules);
          }
        }
      })
      .catch(() => {});
  }, []);

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
        const targetLesson = options?.lessonId !== undefined ? options.lessonId : activeLessonId;
        const targetTab = options?.tab || lessonInitialTab;
        const tabSuffix = targetTab && targetTab !== 'theory' ? `/${targetTab}` : '';
        hash = `#lesson-${targetLesson}${tabSuffix}`;
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
        flashcardWords: options?.flashcardWords !== undefined ? options.flashcardWords : flashcardWords,
        flashcardShuffle: options?.flashcardShuffle !== undefined ? options.flashcardShuffle : flashcardShuffle,
        flashcardSourceLessonId:
          options?.flashcardSourceLessonId !== undefined
            ? options.flashcardSourceLessonId
            : flashcardSourceLessonId,
        flashcardTitle: options?.flashcardTitle || flashcardTitle,
        flashcardMode: options?.flashcardMode || flashcardMode,
        flashcardDirection: options?.flashcardDirection || flashcardDirection,
      };

      if (typeof window !== 'undefined') {
        if (view === 'flashcards') {
          const activeWords = options?.flashcardWords || flashcardWords;
          if (activeWords && activeWords.length > 0) {
            try {
              sessionStorage.setItem(
                'ulpana_active_flashcards',
                JSON.stringify({
                  words: activeWords,
                  title: options?.flashcardTitle || flashcardTitle,
                  mode: options?.flashcardMode || flashcardMode,
                  direction: options?.flashcardDirection || flashcardDirection,
                  shuffle: options?.flashcardShuffle !== undefined ? options.flashcardShuffle : flashcardShuffle,
                  lessonId: options?.flashcardSourceLessonId !== undefined ? options.flashcardSourceLessonId : flashcardSourceLessonId,
                })
              );
            } catch {}
          }
        } else {
          try {
            sessionStorage.removeItem('ulpana_active_flashcards');
          } catch {}
        }

        if (options?.replace) {
          window.history.replaceState(stateObj, '', hash);
        } else {
          window.history.pushState(stateObj, '', hash);
        }
      }
    },
    [activeLessonId, lessonInitialTab, flashcardWords, flashcardShuffle, flashcardSourceLessonId, flashcardTitle, flashcardMode, flashcardDirection]
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
        if (state.flashcardShuffle !== undefined) setFlashcardShuffle(state.flashcardShuffle);
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
          let hasWords = false;
          try {
            const raw = sessionStorage.getItem('ulpana_active_flashcards');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed.words) && parsed.words.length > 0) {
                setFlashcardWords(parsed.words);
                if (parsed.title) setFlashcardTitle(parsed.title);
                if (parsed.mode) setFlashcardMode(parsed.mode);
                if (parsed.direction) setFlashcardDirection(parsed.direction);
                if (parsed.shuffle !== undefined) setFlashcardShuffle(parsed.shuffle);
                if (parsed.lessonId !== undefined) setFlashcardSourceLessonId(parsed.lessonId);
                hasWords = true;
              }
            }
          } catch {}
          if (hasWords) {
            setCurrentView('flashcards');
          } else {
            setCurrentView('dictionary');
          }
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
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('ulpana_active_flashcards');
      } catch {}
    }
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
    const requirement = getEffectiveLessonRequirement(id, accessRules, isEarlyAccessFreeStatus);
    const access = checkContentAccess(requirement, {
      isLoggedIn: Boolean(profile.isLoggedIn),
      isPro,
      isChannelSubscriber: Boolean(profile.isChannelSubscriber),
    });

    if (!access.allowed) {
      if (access.reason === 'require_auth') {
        handleRequireAuth(id);
        return;
      }
      if (access.reason === 'require_channel') {
        setChannelModalLessonNumber(id);
        setIsChannelModalOpen(true);
        return;
      }
      if (access.reason === 'require_pro') {
        setIsSubscriptionModalOpen(true);
        return;
      }
      if (access.reason === 'require_both') {
        if (!profile.isChannelSubscriber) {
          setChannelModalLessonNumber(id);
          setIsChannelModalOpen(true);
        } else {
          setIsSubscriptionModalOpen(true);
        }
        return;
      }
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
      promoPending: updatedSession.promoPending,
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
            onRequireChannel={(lessonId) => {
              setChannelModalLessonNumber(lessonId);
              setIsChannelModalOpen(true);
            }}
            onResetLessonProgress={handleResetLessonProgress}
            accessRules={accessRules}
            isEarlyAccessFree={isEarlyAccessFreeStatus}
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

      {/* Модалка проверки подписки на Telegram-канал @ulpana_il */}
      <ChannelSubscribeModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        userProfile={profile}
        lessonNumber={channelModalLessonNumber}
        onOpenAuth={() => {
          setIsChannelModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSubscriptionVerified={(isSubscriber) => {
          if (isSubscriber) {
            const updated = {
              ...profile,
              isChannelSubscriber: true,
              channelVerifiedAt: Date.now(),
            };
            setProfile(updated);
            saveUserProfile(updated);
            if (updated.cloudSyncPending || updated.isLoggedIn) {
              void syncToCloud(updated);
            }
            if (channelModalLessonNumber) {
              const num = channelModalLessonNumber;
              setTimeout(() => {
                handleSelectLesson(num);
              }, 400);
            }
          }
        }}
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

      {/* Всплывающее уведомление о захвате промокода из URL (?promo=FB) */}
      {capturedPromoToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 shadow-2xl border border-amber-500/40 backdrop-blur-md animate-in fade-in slide-in-from-top-4 max-w-sm w-[90%]"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs flex-1 min-w-0">
            <p className="font-bold truncate">Промокод «{capturedPromoToast}» зафиксирован!</p>
            <p className="opacity-80 text-[11px] truncate">Специальные условия сохранены за вами</p>
          </div>
          <button
            type="button"
            onClick={() => setCapturedPromoToast(null)}
            className="p-1 opacity-60 hover:opacity-100 transition shrink-0"
            aria-label="Закрыть уведомление"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
