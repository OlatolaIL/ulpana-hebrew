'use client';

import React from 'react';
import { MessageSquare, X } from 'lucide-react';

interface FeedbackButtonProps {
  onClick: () => void;
  onDismiss: () => void;
  isLessonMode?: boolean;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onClick,
  onDismiss,
  isLessonMode = false,
}) => {
  return (
    <div
      className={`fixed z-30 pointer-events-auto transition-all duration-200 ${
        isLessonMode
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6'
          : 'bottom-20 right-4 md:bottom-6 md:right-6'
      }`}
    >
      <div className="relative group">
        {/* Маленький крестик для скрытия кнопки (если мешает пользователю) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-zinc-800/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 cursor-pointer text-[10px]"
          title="Скрыть кнопку с экрана (доступна в шапке сайта)"
          aria-label="Скрыть кнопку связи"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Компактная круглая плавающая кнопка без текста */}
        <button
          type="button"
          onClick={onClick}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer ring-2 ring-white/30 dark:ring-zinc-800"
          title="Обратная связь и сообщение об ошибках (@Osa_IL). Доступно также в шапке сайта."
          aria-label="Обратная связь"
        >
          <MessageSquare className="w-5 h-5 drop-shadow-xs" />
        </button>
      </div>
    </div>
  );
};
