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
              const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
              const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
              try {
                localStorage.setItem('ulpana_user_profile', JSON.stringify(updated));
              } catch {}
              onUpdateProfile(updated);
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
          onClick={() => setActiveTab('theory')}\n          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${\n            activeTab === 'theory'\n              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'\n              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'\n          }`}\n        >\n          <BookOpen className=\"w-4 h-4\" />\n          <span>1. Теория</span>\n          {completedTabs.includes('theory') && (\n            <CheckCircle2 className=\"w-3.5 h-3.5 text-emerald-500 shrink-0\" />\n          )}\n        </button>\n\n        <button\n          onClick={() => setActiveTab('vocab')}\n          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${\n            activeTab === 'vocab'\n              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'\n              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'\n          }`}\n        >\n          <Layers className=\"w-4 h-4\" />\n          <span>2. Словарь ({lesson.vocabulary.length})</span>\n          {completedTabs.includes('vocab') && (\n            <CheckCircle2 className=\"w-3.5 h-3.5 text-emerald-500 shrink-0\" />\n          )}\n        </button>\n\n        <button\n          onClick={() => setActiveTab('exercises')}\n          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${\n            activeTab === 'exercises'\n              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'\n              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'\n          }`}\n        >\n          <ListTodo className=\"w-4 h-4\" />\n          <span>3. Упражнения</span>\n          {completedTabs.includes('exercises') && (\n            <CheckCircle2 className=\"w-3.5 h-3.5 text-emerald-500 shrink-0\" />\n          )}\n        </button>\n\n        <button\n          onClick={() => setActiveTab('chat')}\n          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition ${\n            activeTab === 'chat'\n              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'\n              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'\n          }`}\n        >\n          <Bot className=\"w-4 h-4 text-purple-500\" />\n          <span>4. Живой ИИ-диалог</span>\n          {completedTabs.includes('chat') && (\n            <CheckCircle2 className=\"w-3.5 h-3.5 text-emerald-500 shrink-0\" />\n          )}\n        </button>\n      </div>\n\n      {/* Контент выбранной вкладки */}\n      <div className=\"pt-2\">\n        {activeTab === 'theory' && (\n          <LessonTheory\n            lesson={lesson}\n            userProfile={userProfile}\n            onCompleted={() => setActiveTab('vocab')}\n            onUpdateProfile={onUpdateProfile}\n          />\n        )}\n\n        {activeTab === 'vocab' && (\n          <LessonVocabulary\n            words={lesson.vocabulary}\n            userProfile={userProfile}\n            onWordToggled={() => onUpdateProfile({ ...userProfile })}\n            onStartPractice={(wordsToTrain) => onStartFlashcards(wordsToTrain)}\n            onUpdateProfile={onUpdateProfile}\n          />\n        )}\n\n        {activeTab === 'exercises' && (\n          <LessonExercises\n            lesson={lesson}\n            userProfile={userProfile}\n            onCompleted={() => setActiveTab('chat')}\n            onUpdateProfile={onUpdateProfile}\n          />\n        )}\n\n        {activeTab === 'chat' && (\n          <LessonAiChat\n            lesson={lesson}\n            userProfile={userProfile}\n            onUpdateProfile={onUpdateProfile}\n            onWordAdded={() => onUpdateProfile({ ...userProfile })}\n          />\n        )}\n      </div>\n    </div>\n  );\n};\n