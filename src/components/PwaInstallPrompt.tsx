'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Регистрация Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.log('PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // 2. Проверка, запущено ли приложение уже в режиме standalone (PWA)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Уже установлено и открыто как PWA
    }

    // 3. Проверка iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    setIsIOS(isAppleDevice && isSafari);

    // Проверяем, не скрывал ли пользователь баннер недавно
    const dismissedAt = localStorage.getItem('pwa_prompt_dismissed_at');
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    if (dismissedAt && now - parseInt(dismissedAt, 10) < threeDaysMs) {
      return;
    }

    // 4. Ловим событие установки для Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Для iOS показываем подсказку через 3 секунды после входа
    if (isAppleDevice && isSafari && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Плавающий нижний баннер установки */}
      <aside aria-label="Установка приложения" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5">
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
                {isIOS ? 'Добавьте на экран «Домой» для быстрого входа' : 'Полноэкранный режим без адресной строки'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-blue-600/30 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIOS ? 'Как?' : 'Установить'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Модальное окно с инструкцией для iPhone / iPad (iOS Safari) */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Установка на iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Чтобы приложение открывалось на весь экран как нативное приложение из App Store:
            </p>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                  <Share className="w-4 h-4" />
                </div>
                <span>1. Нажмите кнопку <strong>«Поделиться»</strong> внизу Safari</span>
              </li>

              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. Пролистайте вниз и выберите <strong>«На экран “Домой”»</strong></span>
              </li>

              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
                  <Check className="w-4 h-4" />
                </div>
                <span>3. Нажмите <strong>«Добавить»</strong> в правом верхнем углу</span>
              </li>
            </ol>

            <button
              onClick={() => {
                setShowIOSGuide(false);
                setShowPrompt(false);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
            >
              Понятно!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
