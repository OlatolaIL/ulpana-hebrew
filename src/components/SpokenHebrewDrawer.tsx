'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types';
import { getSpokenGuideForLesson } from '@/data/spokenHebrewCatalog';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';

interface SpokenHebrewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  category?: string;
  lessonTitle?: string;
  userProfile: UserProfile;
}

export const SpokenHebrewDrawer: React.FC<SpokenHebrewDrawerProps> = ({
  isOpen,
  onClose,
  lessonId,
  category,
  lessonTitle,
  userProfile,
}) => {
  const [mounted, setMounted] = useState(false);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Закрытие по клавише Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  const guide = getSpokenGuideForLesson(lessonId, category, lessonTitle);
  const isCursive = userProfile.fontStyle === 'cursive';
  const isUlpan = Boolean(userProfile.ulpanMode);

  const handlePlayPhrase = (text: string, key: string) => {
    if (!text) return;
    setPlayingKey(key);
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
    setTimeout(() => {
      setPlayingKey((curr) => (curr === key ? null : curr));
    }, 2200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Затемненный фон (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Выезжающая панель шторки */}
      <div
        className="relative z-10 w-[90vw] max-w-sm sm:max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка шторки */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shrink-0 border border-amber-200 dark:border-amber-800">
              🗣️
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 truncate">
                {isUlpan ? 'שְׂפַת דִּבּוּר וְהֶגֶה' : 'Живая речь и ударения'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {guide.topicTitle || `Секреты живого языка • Урок ${lessonId}`}
              </p>
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
          {/* БЛОК 1: Секрет ударения и разница с синтезатором */}
          {guide.stressRuleNote && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Академическая норма vs Живая речь</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-200/60 dark:border-amber-900/40">
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Синтезатор / Академия
                  </div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    {guide.stressRuleNote.academic}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700">
                  <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                    В жизни (говорите так!):
                  </div>
                  <div className="font-extrabold text-amber-950 dark:text-amber-100 text-xs">
                    {guide.stressRuleNote.spoken}
                  </div>
                </div>
              </div>

              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                {guide.stressRuleNote.explanation}
              </p>
            </div>
          )}

          {/* БЛОК 2: Как говорят в Израиле (Разговорные фразы темы) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Как говорят на улице и дома:</span>
              </h4>
              <span className="text-[11px] text-zinc-400">
                {guide.phrases.length} фраз
              </span>
            </div>

            <div className="space-y-2">
              {guide.phrases.map((phrase, idx) => {
                const phraseKey = `spoken-phrase-${idx}`;
                const isPlaying = playingKey === phraseKey;
                const displayText = userProfile.showNikkud ? phrase.hebrew : stripNikkud(phrase.hebrew);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        dir="rtl"
                        onClick={() => handlePlayPhrase(phrase.hebrew, phraseKey)}
                        className={`font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-50 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition leading-snug ${
                          isCursive ? 'font-cursive text-2xl' : 'font-hebrew'
                        }`}
                        title="Нажмите, чтобы послушать"
                      >
                        {displayText}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlayPhrase(phrase.hebrew, phraseKey)}
                        className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                          isPlaying
                            ? 'bg-blue-600 text-white shadow-xs scale-105'
                            : 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300'
                        }`}
                        title="Прослушать произношение"
                      >
                        <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        {phrase.transcription}
                      </span>
                      {phrase.stressNote && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {phrase.stressNote}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      {phrase.translation}
                    </div>

                    {phrase.context && (
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                        💡 {phrase.context}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* БЛОК 3: Сленг и сокращения */}
          {guide.slangAndShortcuts && guide.slangAndShortcuts.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Сленг и фишки темы:</span>
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {guide.slangAndShortcuts.map((s, idx) => {
                  const slangKey = `slang-${idx}`;
                  const isPlaying = playingKey === slangKey;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-amber-50/50 dark:bg-zinc-800/40 border border-amber-200/50 dark:border-zinc-700/60 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            dir="rtl"
                            onClick={() => handlePlayPhrase(s.term, slangKey)}
                            className="font-hebrew font-bold text-base text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition"
                          >
                            {userProfile.showNikkud ? s.term : stripNikkud(s.term)}
                          </span>
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            ({s.transcription})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayPhrase(s.term, slangKey)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isPlaying
                              ? 'bg-amber-600 text-white'
                              : 'text-zinc-400 hover:text-amber-600 dark:hover:text-amber-300'
                          }`}
                          title="Прослушать"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {s.meaning}
                      </div>

                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        {s.usageTip}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Подвал шторки */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition cursor-pointer shadow-xs"
          >
            Понятно, спасибо! 👍
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
