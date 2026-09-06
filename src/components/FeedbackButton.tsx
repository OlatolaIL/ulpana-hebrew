'use client';

import React from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface FeedbackButtonProps {
  onClick: () => void;
  isLessonMode?: boolean;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onClick,
  isLessonMode = false,
}) => {
  return (
    <div
      className={`fixed z-30 transition-all duration-200 ${
        isLessonMode
          ? 'bottom-4 right-3.5 sm:bottom-6 sm:right-6'
          : 'bottom-20 right-3.5 md:bottom-6 md:right-6'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-700/80 shadow-lg hover:shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer select-none ring-1 ring-black/5 dark:ring-white/5"
        title="Сообщить об ошибке или оставить отзыв (@Osa_IL)"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold tracking-tight hidden sm:inline text-zinc-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
          Сообщить об ошибке
        </span>
        <span className="text-[11px] font-bold sm:hidden text-zinc-700 dark:text-zinc-200">
          Связь
        </span>
      </button>
    </div>
  );
};
