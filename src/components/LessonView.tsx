'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  Bot,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import { Lesson, UserProfile, Word } from '@/types';
import { LessonTheory } from './LessonTheory';
import { LessonVocabulary } from './LessonVocabulary';
import { LessonExercises } from './LessonExercises';
import { LessonAiChat } from './LessonAiChat';
import { getLessonById, LESSONS_CATALOG } from '@/data/lessonsData';

interface LessonViewProps {
  lessonId: number;
  userProfile: UserProfile;
  onBack: () => void;
  onSelectLesson: (id: number) => void;
  onStartFlashcards: (words: Word[]) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

type LessonTab = 'theory' | 'vocab' | 'exercises' | 'chat';

export const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  userProfile,
  onBack,
  onSelectLesson,
  onStartFlashcards,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<LessonTab>('theory');
  const lesson = getLessonById(lessonId);

  const prevLesson = lessonId > 1 ? lessonId - 1 : null;
  const nextLesson = lessonId < 100 ? lessonId + 1 : null;

  const progress = userProfile.lessonProgress[lessonId];
  const completedTabs = progress?.completedTabs || [];

  return (
    <div className="space-y-6">
      {/* Верхняя панель навигации по уроку */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Назад к карте курса"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                Урок {lesson.number} ({lesson.level === 'alef' ? 'Алеф' : 'Бет'})
              </span>
              <span className="text-xs text-zinc-400 font-medium">{lesson.category}</span>
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
              {lesson.titleRussian}
            </h1>
          </div>
        </div>

        {/* Переход к предыдущему / следующему уроку и переключатель шрифта */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextStyle = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
              onUpdateProfile({ ...userProfile, fontStyle: nextStyle });
            }}
            className="px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
            title="Переключить шрифт урока: Печатный / Рукописный"
          >
            {userProfile.fontStyle === 'cursive' ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>

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
