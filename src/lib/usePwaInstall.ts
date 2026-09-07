'use client';

import { useState, useEffect, useCallback } from 'react';

// Храним deferredPrompt на уровне модуля, чтобы не потерять событие до монтирования компонентов
let globalDeferredPrompt: any = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying PWA listener:', e);
    }
  });
}

// Регистрируем глобальные слушатели сразу при загрузке скрипта в браузере
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

export function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export function checkIsIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isAppleDevice = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|edgios/.test(ua);
  return isAppleDevice && isSafari;
}

export function usePwaInstall() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const updateState = () => {
      const standalone = checkIsStandalone();
      setIsStandalone(standalone);
      setHasPrompt(Boolean(globalDeferredPrompt));
      setIsIOS(checkIsIOS());
      setIsIOSSafari(checkIsIOSSafari());

      const tg = (window as any).Telegram?.WebApp;
      setIsTelegram(Boolean(tg && tg.initData));
    };

    updateState();
    listeners.add(updateState);

    // Слушатель изменения display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => updateState();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      listeners.delete(updateState);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  const installApp = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'guide' | 'telegram' | 'unsupported'
  > => {
    if (typeof window === 'undefined') return 'unsupported';

    // 1. Если есть нативный системный промпт браузера
    if (globalDeferredPrompt) {
      try {
        globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          globalDeferredPrompt = null;
          notifyListeners();
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    }

    // 2. Если запущено внутри Telegram WebApp (Mini Apps 8.0+)
    const tg = (window as any).Telegram?.WebApp;
    if (tg && typeof tg.addToHomeScreen === 'function') {
      try {
        tg.addToHomeScreen();
        return 'telegram';
      } catch (e) {
        console.warn('Telegram addToHomeScreen failed:', e);
      }
    }

    // 3. Во всех остальных случаях (iOS Safari, десктоп без авто-промпта и др.) показываем инструкцию
    setShowGuide(true);
    return 'guide';
  }, []);

  return {
    isStandalone,
    hasPrompt,
    canInstall: !isStandalone,
    isIOS,
    isIOSSafari,
    isTelegram,
    showGuide,
    setShowGuide,
    installApp,
  };
}
