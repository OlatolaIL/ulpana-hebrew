'use client';

import React, { useState, useEffect } from 'react';
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

export type LessonTab = 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone';

interface LessonViewProps {
  lessonId: number;
  initialTab?: LessonTab;
  userProfile: UserProfile;
  onBack: () => void;
  onSelectLesson: (id: number) => void;
  onStartFlashcards: (words: Word[], lessonId?: number) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  initialTab = 'theory',
  userProfile,
  onBack,
  onSelectLesson,
  onStartFlashcards,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<LessonTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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

  const STAGES: {
    id: LessonTab;
    num: number;
    labelRu: string;
    labelHe: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'theory', num: 1, labelRu: 'Теория', labelHe: 'תֵּאוֹרְיָה', icon: BookOpen },
    { id: 'vocab', num: 2, labelRu: 'Слова', labelHe: 'מִילִּים', icon: Layers },
    { id: 'exercises', num: 3, labelRu: 'Тесты', labelHe: 'תַּרְגִּילִים', icon: ListTodo },
    { id: 'chat', num: 4, labelRu: 'Диалог', labelHe: 'שִׂיחָה', icon: Bot },
    { id: 'phone', num: 5, labelRu: 'Звонок', labelHe: 'טֶלֶפוֹן', icon: Phone },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden">
      {/* 1. Единый ультра-компактный бар навигации (48px) со встроенным прогрессом 5 этапов */}
      <div className="h-12 px-2 sm:px-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 mb-2">
        {/* Слева: Выход в каталог + Индикатор урока */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition cursor-pointer shrink-0"
            title={userProfile.ulpanMode ? 'חֲזָרָה לַמַּפָּה' : 'Назад к списку уроков'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-bold shrink-0 font-hebrew ${
                userProfile.ulpanMode
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
              }`}
            >
              {userProfile.ulpanMode ? `שִׁיעוּר ${lesson.number}` : `Урок ${lesson.number}`}
            </span>
            <span
              className="hidden md:inline text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px] lg:max-w-[200px]"
              dir={userProfile.ulpanMode ? 'rtl' : 'ltr'}
              title={userProfile.ulpanMode ? (lesson.titleHebrew || lesson.titleRussian) : lesson.titleRussian}
            >
              {userProfile.ulpanMode ? (lesson.titleHebrew || lesson.titleRussian) : lesson.titleRussian}
            </span>
          </div>
        </div>

        {/* Центр: 5 интерактивных Stories-сегментов с прогрессом */}
        <div className="flex-1 flex items-center justify-center gap-1 max-w-lg mx-1 sm:mx-3 min-w-0">
          {STAGES.map((stage) => {
            const isCompleted = completedTabs.includes(stage.id);
            const isActive = activeTab === stage.id;
            const StageIcon = stage.icon;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveTab(stage.id)}
                className={`relative flex flex-col justify-between py-1 px-1 sm:px-2 rounded-xl transition-all cursor-pointer select-none group min-w-0 ${
                  isActive
                    ? 'flex-1 sm:flex-1 bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/80 dark:border-blue-900/60 shadow-2xs'
                    : isCompleted
                    ? 'w-7 sm:w-auto sm:flex-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 border border-transparent'
                    : 'w-7 sm:w-auto sm:flex-1 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
                }`}
                title={`${stage.num}. ${userProfile.ulpanMode ? stage.labelHe : stage.labelRu}${isCompleted ? ' (Завершено)' : ''}`}
              >
                {/* Индикатор прогресса Stories-стиля */}
                <div className="w-full h-1 rounded-full mb-0.5 overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`h-full w-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isActive
                        ? 'bg-blue-600 dark:bg-blue-400'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Содержимое вкладки */}
                <div className="flex items-center justify-center gap-1 min-w-0 h-5">
                  {/* Мобильный вид для неактивных: цифра/галочка */}
                  <span className={`sm:hidden text-xs font-semibold ${isActive ? 'hidden' : 'inline'}`}>
                    {isCompleted ? '✓' : stage.num}
                  </span>

                  {/* Иконка */}
                  <span className={`${isActive ? 'inline' : 'hidden sm:inline'} shrink-0`}>
                    <StageIcon className="w-3.5 h-3.5" />
                  </span>

                  {/* Текст названия */}
                  <span className={`${isActive ? 'inline' : 'hidden sm:inline'} truncate text-[11px] sm:text-xs font-hebrew`}>
                    <span className="hidden md:inline font-mono text-[10px] opacity-70 mr-0.5">{stage.num}.</span>
                    {userProfile.ulpanMode ? stage.labelHe : stage.labelRu}
                  </span>

                  {/* Галочка завершения для десктопа */}
                  {isCompleted && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 hidden sm:inline" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Справа: Шрифт דפוס/כתב + Предыдущий / Следующий урок */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleToggleFont}
            className="px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1 shrink-0 cursor-pointer"
            title={userProfile.ulpanMode ? 'הַחְלֵף גּוֹפָן: דְּפוּס / כְּתָב' : 'Переключить шрифт: Печатный / Рукописный'}
          >
            {userProfile.fontStyle === 'cursive' ? (
              <span className="font-cursive font-bold text-sm text-blue-600 dark:text-blue-400 leading-none">כתב</span>
            ) : (
              <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
            )}
          </button>

          {prevLesson && (
            <button
              type="button"
              onClick={() => onSelectLesson(prevLesson)}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
              title={userProfile.ulpanMode ? `שִׁיעוּר קוֹדֵם ${prevLesson}` : `Предыдущий урок ${prevLesson}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {nextLesson && (
            <button
              type="button"
              onClick={() => onSelectLesson(nextLesson)}
              className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shrink-0 shadow-xs"
              title={userProfile.ulpanMode ? `שִׁיעוּר הַבָּא ${nextLesson}` : `Следующий урок ${nextLesson}`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Рабочая область выбранного этапа */}
      <div className={`flex-1 min-h-0 ${activeTab === 'chat' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto pr-1'}`}>
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
            onStartPractice={(wordsToTrain) => onStartFlashcards(wordsToTrain, lesson.id)}
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
            onGoToPhone={() => setActiveTab('phone')}
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
