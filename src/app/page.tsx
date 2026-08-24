'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CourseMap } from '@/components/CourseMap';
import { LessonView } from '@/components/LessonView';
import { FlashcardTrainer } from '@/components/FlashcardTrainer';
import { PersonalDictionary } from '@/components/PersonalDictionary';
import { AlphabetTrainer } from '@/components/AlphabetTrainer';
import { SettingsModal } from '@/components/SettingsModal';
import { UserProfile, Word } from '@/types';
import { loadUserProfile, saveUserProfile } from '@/lib/storage';
import { initHebrewVoices } from '@/lib/speech';
import { DETAILED_LESSONS, getLessonById } from '@/data/lessonsData';

type ViewMode = 'map' | 'lesson' | 'flashcards' | 'dictionary' | 'alphabet';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('map');
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [flashcardWords, setFlashcardWords] = useState<Word[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Загрузка профиля из LocalStorage
    const p = loadUserProfile();
    setProfile(p);
    initHebrewVoices();
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

  const handleSelectLesson = (id: number) => {
    setActiveLessonId(id);
    setCurrentView('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFlashcards = (wordsToTrain: Word[]) => {
    setFlashcardWords(wordsToTrain);
    setCurrentView('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchGeneralFlashcards = () => {
    // Собираем слова из текущего открытого урока или первого урока
    const currentLessonWords = getLessonById(activeLessonId).vocabulary;
    const personal = profile.personalVocabulary;
    const combined = [...personal, ...currentLessonWords];
    // Уникализируем
    const unique = Array.from(new Map(combined.map((w) => [w.hebrewPlain, w])).values());
    handleStartFlashcards(unique.length > 0 ? unique : currentLessonWords);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
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
      />

      {/* Основная рабочая область */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8">
        {currentView === 'map' && (
          <CourseMap
            userProfile={profile}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {currentView === 'lesson' && (
          <LessonView
            lessonId={activeLessonId}
            userProfile={profile}
            onBack={() => setCurrentView('map')}
            onSelectLesson={handleSelectLesson}
            onStartFlashcards={handleStartFlashcards}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              saveUserProfile(updated);
            }}
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
            />
          </div>
        )}

        {currentView === 'alphabet' && (
          <AlphabetTrainer userProfile={profile} />
        )}

        {currentView === 'dictionary' && (
          <PersonalDictionary
            userProfile={profile}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              saveUserProfile(updated);
            }}
            onStartPractice={(words) => handleStartFlashcards(words)}
          />
        )}
      </main>

      {/* Модалка настроек */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          saveUserProfile(updated);
        }}
      />
    </div>
  );
}
