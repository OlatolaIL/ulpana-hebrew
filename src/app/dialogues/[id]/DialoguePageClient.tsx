'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Bot, MessageSquare } from 'lucide-react';
import { getLessonById } from '@/data/lessonsData';
import { ScriptedDialogueTrainer } from '@/components/ScriptedDialogueTrainer';
import { LessonAiChat } from '@/components/LessonAiChat';
import { UserProfile } from '@/types';
import { createGuestProfile, loadUserProfile, saveUserProfile } from '@/lib/storage';
import { syncProfile } from '@/lib/profileSync';

interface DialoguePageClientProps {
  lessonId: number;
}

export const DialoguePageClient: React.FC<DialoguePageClientProps> = ({ lessonId }) => {
  const [profile, setProfile] = useState<UserProfile>(createGuestProfile);
  const [subTab, setSubTab] = useState<'scripted' | 'free_ai'>('scripted');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cached = loadUserProfile();
    setProfile(cached);

    // Подгрузка актуального профиля пользователя
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setProfile((prev) => ({
            ...prev,
            ...data.user,
            isLoggedIn: true,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
    if (updated.isLoggedIn) {
      void syncProfile(updated).catch(() => {});
    }
  }, []);

  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-500 mb-4">Урок не найден.</p>
        <Link
          href="/dialogues"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm"
        >
          ← Вернуться в каталог диалогов
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-2 sm:p-4 min-h-0 h-[calc(100dvh-1rem)] overflow-hidden">
      {/* Шапка диалога с быстрой навигацией */}
      <header className="shrink-0 mb-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/#lesson-${lessonId}`}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition flex items-center gap-1.5 text-xs font-bold"
            title="Перейти ко всем этапам этого урока"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">К уроку {lessonId}</span>
          </Link>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Урок {lessonId}
              </span>
              <h1 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 truncate">
                {lesson.dialogue?.title || lesson.titleRussian}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md">
              {lesson.dialogue?.situation || lesson.description}
            </p>
          </div>
        </div>

        {/* Переключатель режимов: Ролевой тренажер vs Свободный чат */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSubTab('scripted')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'scripted'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>🎭</span>
              <span className="hidden md:inline">Диалог по ролям</span>
              <span className="md:hidden">Роли</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('free_ai')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'free_ai'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>🤖</span>
              <span className="hidden md:inline">Свободный чат</span>
              <span className="md:hidden">Чат</span>
            </button>
          </div>

          <Link
            href="/dialogues"
            className="px-3 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition flex items-center gap-1"
          >
            <span>Каталог</span>
          </Link>
        </div>
      </header>

      {/* Основной контейнер тренажера */}
      <main className="flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 sm:p-4 overflow-hidden flex flex-col">
        {mounted && (
          subTab === 'scripted' ? (
            <ScriptedDialogueTrainer
              key={`standalone-dialogue-${lesson.id}-${profile.id ?? 'guest'}`}
              lesson={lesson}
              userProfile={profile}
              onUpdateProfile={handleUpdateProfile}
              onWordAdded={() => handleUpdateProfile(loadUserProfile())}
              onGoToNextTab={() => {
                if (lessonId < 100) {
                  window.location.href = `/dialogues/${lessonId + 1}`;
                } else {
                  window.location.href = '/dialogues';
                }
              }}
            />
          ) : (
            <LessonAiChat
              key={`standalone-ai-chat-${lesson.id}-${profile.id ?? 'guest'}-${profile.gender}`}
              lesson={lesson}
              userProfile={profile}
              onUpdateProfile={handleUpdateProfile}
              onWordAdded={() => handleUpdateProfile(loadUserProfile())}
            />
          )
        )}
      </main>
    </div>
  );
};
