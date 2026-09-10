'use client';

import { useState, useEffect, useCallback } from 'react';

// Период скрытия: 5 дней в миллисекундах (5 * 24 * 60 * 60 * 1000)
export const BANNER_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;

/**
 * Хук для временного скрытия информационных баннеров с кулдауном 5 дней.
 *
 * @param bannerKey Уникальный ключ баннера для localStorage
 */
export function useBannerCooldown(bannerKey: string) {
  // Начинаем с false для предотвращения расхождений при SSR гидратации
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(`banner_dismissed_${bannerKey}`);
      if (!dismissedAt) {
        setIsVisible(true);
        return;
      }

      const timestamp = Number(dismissedAt);
      if (isNaN(timestamp) || Date.now() - timestamp >= BANNER_COOLDOWN_MS) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } catch {
      setIsVisible(true);
    }
  }, [bannerKey]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(`banner_dismissed_${bannerKey}`, Date.now().toString());
    } catch {}
  }, [bannerKey]);

  return { isVisible, dismiss };
}
