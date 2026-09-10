import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2 } from 'lucide-react';
import { Lesson, UserProfile, DialogueStep } from '@/types';
import { stripNikkud } from '@/lib/transcription';

interface ChatBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  userProfile: UserProfile;
  activeStep?: DialogueStep;
  stepsCount: number;
  onSpeak: (text: string) => void;
}

export const ChatBriefingModal: React.FC<ChatBriefingModalProps> = ({
  isOpen,
  onClose,
  lesson,
  userProfile,
  activeStep,
  stepsCount,
  onSpeak,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden font-hebrew flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl">📍</span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                {activeStep
                  ? `Вводные данные: Шаг ${activeStep.stepIndex} из ${stepsCount}`
                  : 'Вводные данные диалога'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {lesson.dialogue.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело модального окна */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-left">
          {/* Общая ситуация диалога */}
          {lesson.dialogue.situation && (
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Общая ситуация диалога:
              </span>
              <p className="text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                {lesson.dialogue.situation}
              </p>
            </div>
          )}

          {/* Если есть activeStep (пошаговый режим) */}
          {activeStep ? (
            <>
              {/* Факт текущего шага */}
              <div className="bg-blue-50 dark:bg-blue-950/60 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>
                    Что происходит прямо сейчас (факт):
                  </span>
                </span>
                <p className="text-sm sm:text-base font-bold text-blue-950 dark:text-blue-100 leading-relaxed">
                  {activeStep.fact}
                </p>
              </div>

              {/* Вопрос учителя */}
              {activeStep.aiQuestionHebrew && (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                    Вопрос учителя:
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <p
                      dir="rtl"
                      className="font-hebrew font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 leading-relaxed text-right flex-1"
                    >
                      {userProfile.showNikkud
                        ? activeStep.aiQuestionHebrew
                        : stripNikkud(activeStep.aiQuestionHebrew)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSpeak(activeStep.aiQuestionHebrew)}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer shrink-0"
                      title="Озвучить вопрос"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  {activeStep.aiQuestionRu && (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-700 pt-2 italic">
                      {activeStep.aiQuestionRu}
                    </p>
                  )}
                </div>
              )}

              {/* Цель ответа ученика (без спойлеров на иврите) */}
              {activeStep.expectedConcept && (
                <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3.5 border border-amber-200 dark:border-amber-900/60">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                    💡 Ваша задача:
                  </span>
                  <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium">
                    {activeStep.expectedConcept}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Для всех остальных уроков со свободным диалогом */
            <>
              {/* Роли */}
              {(lesson.dialogue.userRole || lesson.dialogue.aiRole) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                      Ваша роль:
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {lesson.dialogue.userRole || 'Ученик'}
                    </span>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                      Собеседник:
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {lesson.dialogue.aiRole || 'Собеседник'}
                    </span>
                  </div>
                </div>
              )}

              {/* Цели диалога */}
              {lesson.dialogue.goals && lesson.dialogue.goals.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3.5 border border-amber-200 dark:border-amber-900/60">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-2">
                    💡 Цели диалога:
                  </span>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                    {lesson.dialogue.goals.map((goal, idx) => {
                      const cleanGoal = goal
                        .replace(/\s*\([\u0590-\u05FF\s\.,;:!?'-/]+\)/g, '')
                        .replace(/«[\u0590-\u05FF\s\.,;:!?'-/]+»/g, '');
                      return (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                          <span className="font-medium">{cleanGoal}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Подвал с кнопкой Понятно */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Понятно, к диалогу 💬</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
