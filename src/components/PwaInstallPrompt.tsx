'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from '@/lib/usePwaInstall';
import { PwaInstallGuideModal } from '@/components/PwaInstallGuideModal';

export const PwaInstallPrompt: React.FC = () => {
  const {
    isStandalone,
    hasPrompt,
    isIOS,
    isIOSSafari,
    showGuide,
    setShowGuide,
    installApp,
  } = usePwaInstall();

  const [dismissed, setDismissed] = useState(false);
  const [autoShowPrompt, setAutoShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Регистрация Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registered with scope:', reg.scope);
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.log('PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // 2. Проверяем, не скрывал ли пользователь баннер недавно (3 дня)
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    if (dismissedAt && now - parseInt(dismissedAt, 10) < threeDaysMs) {
      setDismissed(true);
      return;
    }

    // 3. Для iOS Safari показываем подсказку через 3 секунды после входа
    if (isIOSSafari && !isStandalone) {
      const timer = setTimeout(() => {
        setAutoShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isIOSSafari, isStandalone]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
  };

  const shouldShowBanner =
    !isStandalone &&
    !dismissed &&
    (hasPrompt || autoShowPrompt);

  return (
    <>
      {/* Плавающий нижний баннер установки */}
      {shouldShowBanner && (
        <aside
          aria-label="Установка приложения"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-4 rounded-3xl shadow-2xl border border-blue-500/30 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-md shrink-0">
                א
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>Установить Ульпану</span>
                  <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                    App
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 dark:text-slate-400 truncate">
                  {isIOS
                    ? 'Добавьте на экран «Домой» для быстрого входа'
                    : 'Полноэкранный режим без адресной строки'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await installApp();
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'Как?' : 'Установить'}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                title="Закрыть"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Модальное окно с инструкцией */}
      <PwaInstallGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        isIOS={isIOS}
      />
    </>
  );
};
