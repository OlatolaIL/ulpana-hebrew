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
  Phone,
} from 'lucide-react';
import { Lesson, UserProfile, Word } from '@/types';
import { LessonTheory } from './LessonTheory';
import { LessonVocabulary } from './LessonVocabulary';
import { LessonExercises } from './LessonExercises';
import { LessonAiChat } from './LessonAiChat';
import { PhoneCallSimulator } from './PhoneCallSimulator';
import { getLessonById, LESSONS_CATALOG } from '@/data/lessonsData';
import { loadUserProfile } from '@/lib/storage';

interface LessonViewProps {
  lessonId: number;
  userProfile: UserProfile;
  onBack: () => void;
  onSelectLesson: (id: number) => void;
  onStartFlashcards: (words: Word[]) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

type LessonTab = 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone';

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

  const handleToggleFont = () => {
    const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
    try {
      localStorage.setItem('ulpana_user_profile', JSON.stringify(updated));
    } catch {}
    onUpdateProfile(updated);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Верхняя компактная панель навигации по уроку */}
      <div className="flex items-center justify-between gap-2.5 bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-600 dark:text-zinc-300 shrink-0"
            title="Назад к списку уроков"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                Урок {lesson.number}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium truncate hidden xs:inline">
                {lesson.category}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 truncate mt-0.5">
              {lesson.titleRussian}
            </h1>
          </div>
        </div>

        {/* Переключатель шрифта и кнопки навигации (предыдущий/следующий урок) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleToggleFont}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1"
            title="Переключить шрифт: Печатный / Рукописный"
          >
            {userProfile.fontStyle === 'cursive' ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>

          {prevLesson && (
            <button
              onClick={() => onSelectLesson(prevLesson)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-1 text-zinc-600 dark:text-zinc-300"
              title={`Предыдущий урок ${prevLesson}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Урок {prevLesson}</span>
            </button>
          )}

          {nextLesson && (
            <button
              onClick={() => onSelectLesson(nextLesson)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm"
              title={`Следующий урок ${nextLesson}`}
            >
              <span className="hidden sm:inline">Урок {nextLesson}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Прогресс-бар 5 этапов урока */}
      <div className="bg-white dark:bg-zinc-900 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <span>Прогресс урока:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {Math.min(5, completedTabs.length)}/5 этапов
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {completedTabs.length >= 5
              ? '🎉 Урок полностью пройден!'
              : 'Теория → Словарь → Упражнения → ИИ-чат → Звонок'}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(Math.min(5, completedTabs.length) / 5) * 100}%` }}
            className={`h-full transition-all duration-300 rounded-full ${
              completedTabs.length >= 5
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}
          />
        </div>
      </div>

      {/* Вкладки урока (адаптивная сетка 5 табов) */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
        <button
          onClick={() => setActiveTab('theory')}
          className={`py-2 px-1 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-sm flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'theory'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Теория</span>
          {completedTabs.includes('theory') && (
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`py-2 px-1 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-sm flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'vocab'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Словарь <span className="text-[10px] opacity-75 hidden md:inline">({lesson.vocabulary.length})</span></span>
          {completedTabs.includes('vocab') && (
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`py-2 px-1 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-sm flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'exercises'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Тесты</span>
          {completedTabs.includes('exercises') && (
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2 px-1 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-sm flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
          <span className="truncate">ИИ-чат</span>
          {completedTabs.includes('chat') && (
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('phone')}
          className={`py-2 px-1 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-sm flex items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === 'phone'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          <span className="truncate">Звонок</span>
          {completedTabs.includes('phone') && (
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
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
            onUpdateProfile={onUpdateProfile}
          />
        )}

        {activeTab === 'vocab' && (
          <LessonVocabulary
            lessonId={lesson.id}
            words={lesson.vocabulary}
            userProfile={userProfile}
            onCompleted={() => setActiveTab('exercises')}
            onStartPractice={(wordsToTrain) => onStartFlashcards(wordsToTrain)}
            onUpdateProfile={onUpdateProfile}
          />
        )}

        {activeTab === 'exercises' && (
          <LessonExercises
            lesson={lesson}
            userProfile={userProfile}
            onCompleted={() => setActiveTab('chat')}
            onUpdateProfile={onUpdateProfile}
          />
        )}

        {activeTab === 'chat' && (
          <LessonAiChat
            lesson={lesson}
            userProfile={userProfile}
            onUpdateProfile={onUpdateProfile}
            onWordAdded={() => onUpdateProfile(loadUserProfile())}
          />
        )}

        {activeTab === 'phone' && (
          <PhoneCallSimulator
            lesson={lesson}
            userProfile={userProfile}
            onUpdateProfile={onUpdateProfile}
            onWordAdded={() => onUpdateProfile(loadUserProfile())}
            onBackToLesson={() => setActiveTab('theory')}
          />
        )}
      </div>
    </div>
  );
};
