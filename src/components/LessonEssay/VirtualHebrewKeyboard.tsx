'use client';

import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

interface VirtualHebrewKeyboardProps {
  onChar: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

// Стандартная израильская раскладка клавиатуры иврита
const ROW_1 = ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'];
const ROW_2 = ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'];
const ROW_3 = ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'];
const PUNCTUATION = ['.', ',', '!', '?', '"'];

export const VirtualHebrewKeyboard: React.FC<VirtualHebrewKeyboardProps> = ({
  onChar,
  onBackspace,
  onSpace,
  onEnter,
  disabled = false,
}) => {
  return (
    <div
      dir="rtl"
      className="w-full max-w-2xl mx-auto p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200 dark:border-zinc-750 shadow-inner select-none space-y-1.5 sm:space-y-2"
    >
      {/* Ряд 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {ROW_1.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => onChar(char)}
            className="flex-1 max-w-[48px] h-10 sm:h-12 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-hebrew font-bold text-lg sm:text-xl rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 active:scale-92 transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Ряд 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {ROW_2.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => onChar(char)}
            className="flex-1 max-w-[48px] h-10 sm:h-12 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-hebrew font-bold text-lg sm:text-xl rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 active:scale-92 transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Ряд 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {ROW_3.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={() => onChar(char)}
            className="flex-1 max-w-[48px] h-10 sm:h-12 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-hebrew font-bold text-lg sm:text-xl rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 active:scale-92 transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Ряд 4: Знаки препинания + Пробел + Удаление + Новая строка */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 pt-0.5">
        {/* Знаки препинания */}
        {PUNCTUATION.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onChar(p)}
            className="w-7 sm:w-9 h-10 sm:h-11 bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-bold text-sm sm:text-base rounded-xl border border-zinc-300/80 dark:border-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-600 active:scale-95 transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            {p}
          </button>
        ))}

        {/* Пробел (רווח) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onSpace}
          className="flex-1 min-w-[90px] sm:min-w-[130px] h-10 sm:h-11 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-650 active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          title="Пробел"
        >
          <span>רווח</span>
          <span className="text-[10px] text-zinc-400 font-sans">(пробел)</span>
        </button>

        {/* Удалить (Backspace) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className="w-11 sm:w-14 h-10 sm:h-11 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-800 active:scale-95 transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          title="Удалить последний символ"
          aria-label="Удалить"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Новая строка (Enter) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="w-10 sm:w-12 h-10 sm:h-11 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 active:scale-95 transition cursor-pointer flex items-center justify-center disabled:opacity-50"
          title="Перенос строки"
          aria-label="Перенос строки"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

