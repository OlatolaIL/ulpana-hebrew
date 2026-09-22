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
import { THEMATIC_DECKS } from '@/data/thematicDecks';
import { PROFESSIONAL_DECKS } from '@/data/professionalDecks';
import { TrainerMode } from '@/components/FlashcardTrainer/types';

const ALL_DECKS = [...THEMATIC_DECKS, ...PROFESSIONAL_DECKS];
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
  const [flashcardMode, setFlashcardMode] = useState<TrainerMode>('flip');
  const [flashcardDirection, setFlashcardDirection] = useState<'he-ru' | 'ru-he' | 'carousel'>('he-ru');
  const [flashcardShuffle, setFlashcardShuffle] = useState<boolean>(false);
  const [flashcardSourceLessonId, setFlashcardSourceLessonId] = useState<number | null>(null);
  const [flashcardDeckId, setFlashcardDeckId] = useState<string | null>(null);
  const [flashcardInitialCardIndex, setFlashcardInitialCardIndex] = useState<number>(0);
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

    let recoveredWords: Word[] = [];
    let recoveredTitle = 'Тренировка карточек';
    let recoveredMode: TrainerMode = 'flip';
    let recoveredDirection: 'he-ru' | 'ru-he' | 'carousel' = 'he-ru';
    let recoveredShuffle = false;
    let recoveredLessonId: number | null = null;
    let recoveredDeckId: string | null = null;
    let recoveredCardIndex = 0;

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
    } else if (initialHash.startsWith('#flashcards')) {
      const qIndex = initialHash.indexOf('?');
      const queryString = qIndex !== -1 ? initialHash.slice(qIndex + 1) : '';
      const params = new URLSearchParams(queryString);
      const qLesson = params.get('lesson');
      const qDeck = params.get('deck');
      const qSource = params.get('source');
      const qCard = params.get('card');
      const qMode = params.get('mode') as TrainerMode | null;
      const qDir = params.get('dir') as any;

      if (qCard) {
        const cNum = parseInt(qCard, 10);
        if (!isNaN(cNum) && cNum >= 1) recoveredCardIndex = cNum - 1;
      }
      if (qMode) recoveredMode = qMode;
      if (qDir) recoveredDirection = qDir;

      // 1. Попытка детерминированного восстановления из параметров URL
      if (qLesson) {
        const num = parseInt(qLesson, 10);
        if (!isNaN(num)) {
          const lData = getLessonById(num) || DETAILED_LESSONS[num];
          if (lData && Array.isArray(lData.vocabulary) && lData.vocabulary.length > 0) {
            recoveredWords = lData.vocabulary;
            recoveredTitle = `Урок ${num}: Карточки словаря`;
            recoveredLessonId = num;
          }
        }
      } else if (qDeck) {
        const found = ALL_DECKS.find((d) => d.id === qDeck);
        if (found && Array.isArray(found.words) && found.words.length > 0) {
          recoveredWords = found.words;
          recoveredTitle = found.title;
          recoveredDeckId = qDeck;
        }
      } else if (qSource === 'personal' && verifiedProfile?.personalVocabulary?.length) {
        recoveredWords = verifiedProfile.personalVocabulary;
        recoveredTitle = 'Мой личный словарь';
      }

      // 2. Попытка восстановить из history.state или sessionStorage, если слов еще нет
      if (recoveredWords.length === 0) {
        try {
          const state = typeof window !== 'undefined' ? window.history.state : null;
          if (state && Array.isArray(state.flashcardWords) && state.flashcardWords.length > 0) {
            recoveredWords = state.flashcardWords;
            if (state.flashcardTitle) recoveredTitle = state.flashcardTitle;
            if (state.flashcardMode) recoveredMode = state.flashcardMode;
            if (state.flashcardDirection) recoveredDirection = state.flashcardDirection;
            if (state.flashcardShuffle !== undefined) recoveredShuffle = state.flashcardShuffle;
            if (state.flashcardSourceLessonId !== undefined) recoveredLessonId = state.flashcardSourceLessonId;
            if (state.flashcardDeckId !== undefined) recoveredDeckId = state.flashcardDeckId;
            if (state.flashcardInitialCardIndex !== undefined) recoveredCardIndex = state.flashcardInitialCardIndex;
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
                if (parsed.deckId !== undefined) recoveredDeckId = parsed.deckId;
                if (parsed.cardIndex !== undefined) recoveredCardIndex = parsed.cardIndex;
              }
            }
          }
        } catch {}
      }

      if (recoveredWords.length > 0) {
        initialView = 'flashcards';
        setFlashcardWords(recoveredWords);
        setFlashcardTitle(recoveredTitle);
        setFlashcardMode(recoveredMode);
        setFlashcardDirection(recoveredDirection);
        setFlashcardShuffle(recoveredShuffle);
        setFlashcardSourceLessonId(recoveredLessonId);
        setFlashcardDeckId(recoveredDeckId);
        setFlashcardInitialCardIndex(recoveredCardIndex);
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
      {
        view: initialView,
        lessonId: initialLessonId,
        tab: initialTab,
        flashcardWords: recoveredWords.length > 0 ? recoveredWords : flashcardWords,
        flashcardTitle: recoveredTitle,
        flashcardMode: recoveredMode,
        flashcardDirection: recoveredDirection,
        flashcardShuffle: recoveredShuffle,
        flashcardSourceLessonId: recoveredLessonId,
        flashcardDeckId: recoveredDeckId,
        flashcardInitialCardIndex: recoveredCardIndex,
      },
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
        flashcardMode?: TrainerMode;
        flashcardDirection?: 'he-ru' | 'ru-he' | 'carousel';
        flashcardShuffle?: boolean;
        flashcardSourceLessonId?: number | null;
        flashcardDeckId?: string | null;
        flashcardCardIndex?: number;
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
      if (options?.flashcardDeckId !== undefined) {
        setFlashcardDeckId(options.flashcardDeckId);
      }
      if (options?.flashcardCardIndex !== undefined) {
        setFlashcardInitialCardIndex(options.flashcardCardIndex);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Генерация hash для чистого и уникального URL
      let hash = '#map';
      if (view === 'lesson') {
        const targetLesson = options?.lessonId !== undefined ? options.lessonId : activeLessonId;
        const targetTab = options?.tab || lessonInitialTab;
        const tabSuffix = targetTab && targetTab !== 'theory' ? `/${targetTab}` : '';
        hash = `#lesson-${targetLesson}${tabSuffix}`;
      } else if (view === 'flashcards') {
        const p = new URLSearchParams();
        const srcLesson = options?.flashcardSourceLessonId !== undefined ? options.flashcardSourceLessonId : flashcardSourceLessonId;
        const srcDeck = options?.flashcardDeckId !== undefined ? options.flashcardDeckId : (flashcardDeckId || activeDeckId);
        const cardIdx = options?.flashcardCardIndex !== undefined ? options.flashcardCardIndex : flashcardInitialCardIndex;
        const fMode = options?.flashcardMode || flashcardMode;
        const fDir = options?.flashcardDirection || flashcardDirection;

        if (srcLesson) {
          p.set('lesson', srcLesson.toString());
        } else if (srcDeck) {
          p.set('deck', srcDeck);
        }
        if (typeof cardIdx === 'number' && cardIdx > 0) {
          p.set('card', (cardIdx + 1).toString());
        }
        if (fMode && fMode !== 'flip') {
          p.set('mode', fMode);
        }
        if (fDir && fDir !== 'he-ru') {
          p.set('dir', fDir);
        }
        const qs = p.toString();
        hash = qs ? `#flashcards?${qs}` : '#flashcards';
      } else if (view === 'dictionary') {
        const dId = activeDeckId;
        hash = dId ? `#deck-${dId}` : '#dictionary';
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
        flashcardDeckId:
          options?.flashcardDeckId !== undefined ? options.flashcardDeckId : flashcardDeckId,
        flashcardInitialCardIndex:
          options?.flashcardCardIndex !== undefined ? options.flashcardCardIndex : flashcardInitialCardIndex,
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
                  deckId: options?.flashcardDeckId !== undefined ? options.flashcardDeckId : flashcardDeckId,
                  cardIndex: options?.flashcardCardIndex !== undefined ? options.flashcardCardIndex : flashcardInitialCardIndex,
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
    [activeLessonId, lessonInitialTab, flashcardWords, flashcardShuffle, flashcardSourceLessonId, flashcardDeckId, flashcardInitialCardIndex, flashcardTitle, flashcardMode, flashcardDirection, activeDeckId]
  );

  // Мягкое обновление URL при смене карточки или режима (без спама записей в историю)
  const handleFlashcardCardChange = useCallback(
    (index: number, mode: TrainerMode, word?: Word) => {
      setFlashcardInitialCardIndex(index);
      setFlashcardMode(mode);
      if (typeof window === 'undefined') return;

      const p = new URLSearchParams();
      if (flashcardSourceLessonId) {
        p.set('lesson', flashcardSourceLessonId.toString());
      } else if (flashcardDeckId || activeDeckId) {
        p.set('deck', (flashcardDeckId || activeDeckId)!);
      }
      p.set('card', (index + 1).toString());
      if (mode && mode !== 'flip') {
        p.set('mode', mode);
      }
      if (flashcardDirection && flashcardDirection !== 'he-ru') {
        p.set('dir', flashcardDirection);
      }
      const newHash = `#flashcards?${p.toString()}`;

      const currentState = window.history.state || {};
      window.history.replaceState(
        {
          ...currentState,
          flashcardInitialCardIndex: index,
          flashcardMode: mode,
          flashcardWords,
          flashcardTitle,
          flashcardSourceLessonId,
          flashcardDeckId: flashcardDeckId || activeDeckId,
        },
        '',
        newHash
      );
    },
    [flashcardSourceLessonId, flashcardDeckId, activeDeckId, flashcardDirection, flashcardWords, flashcardTitle]
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

      const curHash = window.location.hash || '';
      const state = event.state;

      // 2. Если popstate вернул нас на карточки (#flashcards)
      if (curHash.startsWith('#flashcards') || state?.view === 'flashcards') {
        const qIndex = curHash.indexOf('?');
        const queryString = qIndex !== -1 ? curHash.slice(qIndex + 1) : '';
        const params = new URLSearchParams(queryString);
        const qLesson = params.get('lesson');
        const qDeck = params.get('deck');
        const qSource = params.get('source');
        const qCard = params.get('card');
        const qMode = params.get('mode') as TrainerMode | null;
        const qDir = params.get('dir') as any;

        let recoveredWords: Word[] = [];
        let recoveredTitle = state?.flashcardTitle || flashcardTitle;
        let recoveredMode: TrainerMode = qMode || state?.flashcardMode || flashcardMode;
        let recoveredDirection = qDir || state?.flashcardDirection || flashcardDirection;
        let recoveredShuffle = state?.flashcardShuffle ?? flashcardShuffle;
        let recoveredLessonId: number | null = state?.flashcardSourceLessonId ?? flashcardSourceLessonId;
        let recoveredDeckId: string | null = state?.flashcardDeckId ?? flashcardDeckId;
        let recoveredCardIndex = state?.flashcardInitialCardIndex ?? 0;

        if (qCard) {
          const cNum = parseInt(qCard, 10);
          if (!isNaN(cNum) && cNum >= 1) recoveredCardIndex = cNum - 1;
        }

        // Приоритет 1: детерминированное восстановление по URL параметрам
        if (qLesson) {
          const num = parseInt(qLesson, 10);
          if (!isNaN(num)) {
            const lData = getLessonById(num) || DETAILED_LESSONS[num];
            if (lData && Array.isArray(lData.vocabulary) && lData.vocabulary.length > 0) {
              recoveredWords = lData.vocabulary;
              recoveredTitle = `Урок ${num}: Карточки словаря`;
              recoveredLessonId = num;
            }
          }
        } else if (qDeck) {
          const found = ALL_DECKS.find((d) => d.id === qDeck);
          if (found && Array.isArray(found.words) && found.words.length > 0) {
            recoveredWords = found.words;
            recoveredTitle = found.title;
            recoveredDeckId = qDeck;
          }
        } else if (qSource === 'personal' && profile?.personalVocabulary?.length) {
          recoveredWords = profile.personalVocabulary;
          recoveredTitle = 'Мой личный словарь';
        }

        // Приоритет 2: восстановление из event.state
        if (recoveredWords.length === 0 && state && Array.isArray(state.flashcardWords) && state.flashcardWords.length > 0) {
          recoveredWords = state.flashcardWords;
        }

        // Приоритет 3: восстановление из sessionStorage
        if (recoveredWords.length === 0 && typeof window !== 'undefined') {
          try {
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
                if (parsed.deckId !== undefined) recoveredDeckId = parsed.deckId;
                if (parsed.cardIndex !== undefined) recoveredCardIndex = parsed.cardIndex;
              }
            }
          } catch {}
        }

        // Приоритет 4: текущие слова в компоненте
        if (recoveredWords.length === 0 && flashcardWords.length > 0) {
          recoveredWords = flashcardWords;
        }

        if (recoveredWords.length > 0) {
          setCurrentView('flashcards');
          setFlashcardWords(recoveredWords);
          setFlashcardTitle(recoveredTitle);
          setFlashcardMode(recoveredMode);
          setFlashcardDirection(recoveredDirection);
          setFlashcardShuffle(recoveredShuffle);
          setFlashcardSourceLessonId(recoveredLessonId);
          setFlashcardDeckId(recoveredDeckId);
          setFlashcardInitialCardIndex(recoveredCardIndex);
        } else {
          setCurrentView('dictionary');
        }
        return;
      }

      // 3. Другие разделы по хэшу или state
      if (curHash.startsWith('#lesson-') || state?.view === 'lesson') {
        const raw = curHash.replace('#lesson-', '');
        const slashIndex = raw.indexOf('/');
        const num = parseInt(slashIndex === -1 ? raw : raw.slice(0, slashIndex), 10);
        const tabSlug = slashIndex === -1 ? '' : raw.slice(slashIndex + 1).toLowerCase();

        const tabMap: Record<string, LessonStageTab> = {
          theory: 'theory', vocab: 'vocab', exercises: 'exercises', essay: 'essay', chat: 'chat', phone: 'phone',
        };
        const requestedTab = tabMap[tabSlug] || state?.tab || 'theory';

        setCurrentView('lesson');
        if (!isNaN(num) && num >= 1 && num <= 100) {
          setActiveLessonId(num);
        } else if (state?.lessonId) {
          setActiveLessonId(state.lessonId);
        }
        setLessonInitialTab(requestedTab);
        return;
      }

      if (curHash.startsWith('#deck-') || curHash.startsWith('#decks/')) {
        const rawDeckId = curHash.startsWith('#deck-')
          ? curHash.replace('#deck-', '')
          : curHash.replace('#decks/', '');
        setCurrentView('dictionary');
        setActiveDeckId(rawDeckId);
        return;
      }

      if (curHash === '#dictionary' || state?.view === 'dictionary') {
        setCurrentView('dictionary');
        return;
      }

      if (curHash === '#alphabet' || state?.view === 'alphabet') {
        setCurrentView('alphabet');
        return;
      }

      setCurrentView('map');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isSettingsOpen,
    isAuthModalOpen,
    isSubscriptionModalOpen,
    isMultiLessonSetupOpen,
    flashcardTitle,
    flashcardMode,
    flashcardDirection,
    flashcardShuffle,
    flashcardSourceLessonId,
    flashcardDeckId,
    flashcardWords,
    profile,
  ]);

  const handleCloseFlashcards = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('ulpana_active_flashcards');
      } catch {}
    }
    if (flashcardSourceLessonId) {
      navigateTo('lesson', { lessonId: flashcardSourceLessonId, tab: 'vocab' });
    } else if (flashcardDeckId) {
      setActiveDeckId(flashcardDeckId);
      navigateTo('dictionary');
    } else {
      navigateTo('dictionary');
    }
  }, [flashcardSourceLessonId, flashcardDeckId, navigateTo]);
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
    mode?: TrainerMode,
    lessonId?: number,
    direction?: 'he-ru' | 'ru-he' | 'carousel',
    shuffle?: boolean,
    deckId?: string,
    cardIndex?: number
  ) => {
    const customTitle =
      title ||
      (lessonId
        ? `Урок ${lessonId}: Карточки словаря`
        : deckId
        ? (ALL_DECKS.find((d) => d.id === deckId)?.title || 'Тренировка карточек')
        : 'Тренировка карточек');

    navigateTo('flashcards', {
      flashcardWords: wordsToTrain,
      flashcardTitle: customTitle,
      flashcardMode: mode || 'flip',
      flashcardSourceLessonId: lessonId || null,
      flashcardDeckId: deckId || (lessonId ? null : activeDeckId),
      flashcardCardIndex: cardIndex ?? 0,
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
              deckId={flashcardDeckId || undefined}
              initialCardIndex={flashcardInitialCardIndex}
              onCardChange={handleFlashcardCardChange}
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
            onStartPractice={(words, title, mode, shuffle, direction, deckId) =>
              handleStartFlashcards(words, title, mode, undefined, direction, shuffle, deckId)
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
