'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, Sparkles, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { LinguisticTip, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';

interface LinguisticTipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tip: LinguisticTip | null;
  userProfile?: UserProfile;
}

export const LinguisticTipDrawer: React.FC<LinguisticTipDrawerProps> = ({
  isOpen,
  onClose,
  tip,
  userProfile,
}) => {
  const [mounted, setMounted] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !tip || typeof document === 'undefined') {
    return null;
  }

  const isCursive = userProfile?.fontStyle === 'cursive';

  const handlePlayPhrase = (text: string, key: string) => {
    if (!text) return;
    setPlayingKey(key);
    speakHebrew(text, { rate: userProfile?.speechRate || 0.7 });
    setTimeout(() => {
      setPlayingKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const getCategoryIcon = (category: LinguisticTip['category']) => {
    switch (category) {
      case 'phonetics':
        return '🗣️';
      case 'grammar':
        return '💼';
      case 'abbreviation':
        return '🏷️';
      case 'slang':
        return '💬';
      case 'custom':
      default:
        return '💡';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-stretch sm:justify-end">
      {/* Затемненный фон (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Выезжающая панель шторки */}
      <div
        className="relative z-10 w-full sm:w-[90vw] sm:max-w-md max-h-[88vh] sm:max-h-full h-auto sm:h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Индикатор смахивания вниз для мобильных */}
        <div className="sm:hidden w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Шапка шторки */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shrink-0 border border-amber-200 dark:border-amber-800">
              {getCategoryIcon(tip.category)}
            </div>
            <div className="min-w-0">
              <span className="inline-block text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {tip.badgeTitle}
              </span>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 truncate leading-snug">
                {tip.ruleTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Скроллируемый контент */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Основное понятное объяснение правила */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Суть правила простыми словами:</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {tip.ruleExplanation}
            </p>
          </div>

          {/* Академическая норма vs Живая речь */}
          {tip.spokenVsAcademic && (
            <div className="bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Как в словаре vs Как говорят израильтяне</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Академическая норма */}
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-amber-200/60 dark:border-amber-900/40">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Синтезатор / Ульпан
                  </div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    {tip.spokenVsAcademic.academic}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    {tip.spokenVsAcademic.academicNote}
                  </div>
                </div>

                {/* Живая речь */}
                <div className="p-2.5 rounded-xl bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700">
                  <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                    На улице и в жизни:
                  </div>
                  <div className="font-extrabold text-amber-950 dark:text-amber-100 text-xs">
                    {tip.spokenVsAcademic.spoken}
                  </div>
                  <div className="text-[11px] text-amber-900/80 dark:text-amber-200/80 mt-1">
                    {tip.spokenVsAcademic.spokenNote}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ключевые тезисы правила */}
          {tip.ruleDetails && tip.ruleDetails.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-0.5">
                Главное запомнить:
              </h4>
              <div className="space-y-1.5">
                {tip.ruleDetails.map((detail, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Живые примеры с озвучкой */}
          {tip.examples && tip.examples.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Примеры употребления с озвучкой:</span>
                </h4>
                <span className="text-[11px] text-zinc-400">
                  {tip.examples.length} фраз
                </span>
              </div>

              <div className="space-y-2">
                {tip.examples.map((ex, idx) => {
                  const isPlaying = playingKey === `ex-${idx}`;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            dir="rtl"
                            className={`font-bold text-zinc-900 dark:text-zinc-100 ${
                              isCursive
                                ? 'font-cursive text-xl text-blue-600 dark:text-blue-400'
                                : 'font-hebrew text-base'
                            }`}
                          >
                            {ex.hebrew}
                          </span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            [{ex.transcription}]
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">
                          {ex.translation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlayPhrase(ex.hebrew, `ex-${idx}`)}
                        className={`p-2 rounded-xl shrink-0 transition cursor-pointer ${
                          isPlaying
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-zinc-700'
                        }`}
                        title="Прослушать правильное произношение"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Нижняя кнопка закрытия */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer"
          >
            Понятно, спасибо!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
