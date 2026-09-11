'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, Bot, User, CheckCircle } from 'lucide-react';
import { speakHebrew, stopSpeech } from '@/lib/speech';

export interface SmartPlayerMessage {
  id?: string;
  role: string; // 'user' | 'assistant'
  hebrew: string;
  transcription?: string;
  translation?: string;
  userAudioUrl?: string;
}

interface SmartConversationPlayerProps {
  messages: SmartPlayerMessage[];
  callerName?: string;
  userName?: string;
  speechRate?: number;
  onActiveMessageChange?: (index: number | null) => void;
  className?: string;
  compact?: boolean;
}

export const SmartConversationPlayer: React.FC<SmartConversationPlayerProps> = ({
  messages,
  callerName = 'Собеседник',
  userName = 'Ученик',
  speechRate = 0.75,
  onActiveMessageChange,
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<'bot' | 'user' | null>(null);

  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const nextTimerRef = useRef<NodeJS.Timeout | any>(null);

  const cleanStop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentSpeaker(null);
    stopSpeech();
    if (userAudioPlayerRef.current) {
      try {
        userAudioPlayerRef.current.pause();
        userAudioPlayerRef.current.currentTime = 0;
      } catch {}
      userAudioPlayerRef.current = null;
    }
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanStop();
    };
  }, [cleanStop]);

  const playTurn = useCallback(
    async (index: number) => {
      if (!isPlayingRef.current || index >= messages.length) {
        cleanStop();
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        if (onActiveMessageChange) onActiveMessageChange(null);
        return;
      }

      currentIndexRef.current = index;
      setCurrentIndex(index);
      if (onActiveMessageChange) onActiveMessageChange(index);

      const msg = messages[index];
      const isUser = msg.role === 'user';
      setCurrentSpeaker(isUser ? 'user' : 'bot');

      if (isUser) {
        // Воспроизведение реального голоса ученика
        if (msg.userAudioUrl) {
          try {
            const audio = new Audio(msg.userAudioUrl);
            userAudioPlayerRef.current = audio;

            audio.onended = () => {
              if (!isPlayingRef.current) return;
              nextTimerRef.current = setTimeout(() => {
                playTurn(index + 1);
              }, 450);
            };

            audio.onerror = () => {
              console.warn('[SmartPlayer] User audio play failed, moving next');
              if (!isPlayingRef.current) return;
              nextTimerRef.current = setTimeout(() => {
                playTurn(index + 1);
              }, 400);
            };

            await audio.play();
          } catch (err) {
            console.warn('[SmartPlayer] Audio play exception:', err);
            if (!isPlayingRef.current) return;
            nextTimerRef.current = setTimeout(() => {
              playTurn(index + 1);
            }, 500);
          }
        } else {
          // Если аудиозаписи нет (например, ученик вводил текст руками), озвучиваем синтезом
          try {
            await speakHebrew(msg.hebrew, { rate: speechRate });
          } catch {}
          if (!isPlayingRef.current) return;
          nextTimerRef.current = setTimeout(() => {
            playTurn(index + 1);
          }, 450);
        }
      } else {
        // Воспроизведение реплики собеседника через синтезатор речи
        try {
          await speakHebrew(msg.hebrew, { rate: speechRate });
        } catch (e) {
          console.warn('[SmartPlayer] TTS failed:', e);
        }

        if (!isPlayingRef.current) return;
        nextTimerRef.current = setTimeout(() => {
          playTurn(index + 1);
        }, 500);
      }
    },
    [messages, speechRate, onActiveMessageChange, cleanStop]
  );

  const handleTogglePlay = () => {
    if (isPlaying) {
      cleanStop();
    } else {
      if (messages.length === 0) return;
      cleanStop();
      isPlayingRef.current = true;
      setIsPlaying(true);
      const startIndex = currentIndex >= messages.length ? 0 : currentIndex;
      playTurn(startIndex);
    }
  };

  const handleReset = () => {
    cleanStop();
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    if (onActiveMessageChange) onActiveMessageChange(null);
  };

  if (!messages || messages.length === 0) {
    return null;
  }

  const hasAnyUserAudio = messages.some((m) => m.role === 'user' && Boolean(m.userAudioUrl));
  const progressPercent = Math.round(((currentIndex + (isPlaying ? 0.5 : 0)) / messages.length) * 100);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isPlaying
          ? 'bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-emerald-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-emerald-950/30 border-blue-300 dark:border-blue-700 shadow-md'
          : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80'
      } p-3 sm:p-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Левая часть: кнопка Play + Инфо */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95'
            }`}
            title={isPlaying ? 'Пауза' : 'Прослушать весь разговор целиком'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Умный плеер звонка</span>
                {hasAnyUserAudio ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    🎙️ Голос ученика записан
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    Текст
                  </span>
                )}
              </span>
            </div>

            {/* Статус кто сейчас говорит */}
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
              {isPlaying ? (
                currentSpeaker === 'user' ? (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                    <User className="w-3.5 h-3.5" />
                    <span>Говорит: {userName} (запись голоса)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Говорит: {callerName}</span>
                  </span>
                )
              ) : (
                <span>
                  {messages.length} реплик • Слушайте реплики собеседника и свои ответы
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Правая часть: прогресс и сброс */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className="text-right text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
            {currentIndex + 1} / {messages.length}
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={currentIndex === 0 && !isPlaying}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition disabled:opacity-30 cursor-pointer"
            title="Сначала"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Линейка прогресса */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-blue-600 transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
