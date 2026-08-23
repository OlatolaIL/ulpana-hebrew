'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  ListTodo,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { Lesson, UserProfile, Word } from '@/types';
import { LessonTheory } from './LessonTheory';
import { LessonVocabulary } from './LessonVocabulary';
import { LessonExercises } from './LessonExercises';
import { LessonAiChat } from './LessonAiChat';
import { getLessonProgress } from '@/lib/storage';

interface LessonViewProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onBack: () => void;
  onSelectLesson: (lessonId: number) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onStartFlashcards: (words: Word[]) => void;
}

type TabType = 'theory' | 'vocab' | 'exercises' | 'chat';

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  userProfile,
  onBack,
  onSelectLesson,
  onUpdateProfile,
  onStartFlashcards,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theory');

  const progress = getLessonProgress(lesson.id);
  const completedTabs = progress?.completedTabs || [];

  const prevLesson = lesson.number > 1 ? lesson.number - 1 : null;
  const nextLesson = lesson.number < 100 ? lesson.number + 1 : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Навигационная панель урока */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Назад к списку уроков"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                Урок {lesson.number} • Уровень {lesson.level === 'alef' ? 'Алеф (א)' : 'Бет (ב)'}
              </span>
              <span className="text-xs text-zinc-400">• {lesson.category}</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mt-0.5">
              <span>{lesson.titleRussian}</span>
              <span dir="rtl" className="font-hebrew text-blue-600 dark:text-blue-400 text-base">
                ({lesson.titleHebrew})
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prevLesson && (
            <button
              onClick={() => onSelectLesson(prevLesson)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Урок {prevLesson}</span>
            </button>
          )}
          {nextLesson && (
            <button
              onClick={() => onSelectLesson(nextLesson)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm"
            >
              <span>Урок {nextLesson}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Вкладки урока */}
      <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'theory'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Теория</span>
          {completedTabs.includes('theory') && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'vocab'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Словарь ({lesson.vocabulary.length})</span>
          {completedTabs.includes('vocab') && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'exercises'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>3. Упражнения</span>
          {completedTabs.includes('exercises') && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-500" />
          <span>4. Живой ИИ-диалог</span>
          {completedTabs.includes('chat') && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          )}
        </button>
      </div>

      {/* Контент выбранной вкладки */}
      <div className="pt-2">
        {activeTab === 'theory' && (
          <LessonTheory
            lesson={lesson}
            userProfile={userProfile}
            onCompleted={() => setActiveTab('vocab')}
          />
        )}

        {activeTab === 'vocab' && (
          <LessonVocabulary
            words={lesson.vocabulary}
            userProfile={userProfile}
            onWordToggled={() => onUpdateProfile({ ...userProfile })}
            onStartPractice={(wordsToTrain) => onStartFlashcards(wordsToTrain)}
          />
        )}

        {activeTab === 'exercises' && (
          <LessonExercises
            lesson={lesson}
            userProfile={userProfile}
            onCompleted={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'chat' && (
          <LessonAiChat
            lesson={lesson}
            userProfile={userProfile}
            onUpdateProfile={onUpdateProfile}
            onWordAdded={() => onUpdateProfile({ ...userProfile })}
          />
        )}
      </div>
    </div>
  );
};
