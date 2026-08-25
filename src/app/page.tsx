'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { CourseMap } from '@/components/CourseMap';
import { LessonView } from '@/components/LessonView';
import { FlashcardTrainer } from '@/components/FlashcardTrainer';
import { PersonalDictionary } from '@/components/PersonalDictionary';
import { AlphabetTrainer } from '@/components/AlphabetTrainer';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { UserProfile, Word, UserSession } from '@/types';
import { loadUserProfile, saveUserProfile, resetLessonProgress } from '@/lib/storage';
import { initHebrewVoices } from '@/lib/speech';
import { DETAILED_LESSONS, getLessonById } from '@/data/lessonsData';
import { isVipUser, VIP_EXPIRES_AT, applyVipProfileEnhancements } from '@/lib/vipUsers';

type ViewMode = 'map' | 'lesson' | 'flashcards' | 'dictionary' | 'alphabet';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

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

    const handleTgUserFound = (u: any) => {
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

      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          username: u.username,
          photo_url: u.photo_url,
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'webapp_validated',
        }),
      }).catch((err) => console.warn('[WebApp Auth BG] Error:', err));
    };

    // 1. Проверяем Telegram WebApp немедленно или с повторными попытками
    const initialTgUser = getTelegramUser();
    if (initialTgUser) {
      handleTgUserFound(initialTgUser);
    } else {
      let attempts = 0;
      const tgInterval = setInterval(() => {
        attempts++;
        const delayedTgUser = getTelegramUser();
        if (delayedTgUser) {
          clearInterval(tgInterval);
          handleTgUserFound(delayedTgUser);
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

  const handleSelectLesson = (id: number) => {
    if (id > 3 && !isPro) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    setActiveLessonId(id);
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetLessonProgress = (lessonId: number) => {
    const updated = resetLessonProgress(lessonId);
    handleUpdateProfile(updated);
  };

  const handleStartFlashcards = (wordsToTrain: Word[]) => {
    setFlashcardWords(wordsToTrain);
    setCurrentView('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchGeneralFlashcards = () => {
    const currentLessonWords = getLessonById(activeLessonId).vocabulary;
    const personal = profile.personalVocabulary;
    const combined = [...personal, ...currentLessonWords];
    const unique = Array.from(new Map(combined.map((w) => [w.hebrewPlain, w])).values());
    handleStartFlashcards(unique.length > 0 ? unique : currentLessonWords);
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
            setCurrentView(view);
          }
        }}
        userProfile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleFontStyle={handleToggleFontStyle}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Основная рабочая область */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 md:py-6 pb-24 md:pb-8">
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
            userProfile={profile}
            onBack={() => setCurrentView('map')}
            onSelectLesson={handleSelectLesson}
            onStartFlashcards={handleStartFlashcards}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {currentView === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('map')}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
              >
                ← Вернуться назад
              </button>
            </div>
            <FlashcardTrainer
              initialWords={flashcardWords}
              userProfile={profile}
              onClose={() => setCurrentView('map')}
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
            onStartPractice={(words) => handleStartFlashcards(words)}
          />
        )}
      </main>

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

