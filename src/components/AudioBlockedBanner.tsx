'use client';

import React, { useState, useEffect } from 'react';
import { VolumeX, Volume2, X } from 'lucide-react';
import {
  initAudioAutoUnlock,
  onAudioBlocked,
  onAudioUnblocked,
  unlockAudio,
} from '@/lib/audioNotifier';

export const AudioBlockedBanner: React.FC = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    // 1. Превентивно готовим аудио к первому пользовательскому нажатию
    initAudioAutoUnlock();

    // 2. Слушаем события блокировки браузером (Autoplay Policy / NotAllowedError)
    const unsubBlocked = onAudioBlocked(() => {
      setIsBlocked(true);
    });

    const unsubUnblocked = onAudioUnblocked(() => {
      setIsBlocked(false);
    });

    return () => {
      unsubBlocked();
      unsubUnblocked();
    };
  }, []);

  if (!isBlocked) return null;

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      await unlockAudio();
      setIsBlocked(false);
    } catch (err) {
      console.warn('Manual audio unlock failed:', err);
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <aside
      aria-label="Уведомление о звуке"
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-md text-white border-2 border-amber-500/70 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <VolumeX className="w-5 h-5 animate-pulse text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Звук заблокирован</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Браузер
              </span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">
              Браузер ограничил автозвук. Нажмите кнопку, чтобы включить воспроизведение.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isUnlocking ? 'Включение...' : 'Включить'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBlocked(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            title="Закрыть"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
