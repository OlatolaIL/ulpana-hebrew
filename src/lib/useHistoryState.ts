'use client';

import { useEffect, useRef } from 'react';

/**
 * Хук для привязки модальных окон к истории браузера (iOS/Android swipe back и кнопка Назад).
 * При открытии окна добавляет запись в history.pushState.
 * При свайпе назад или нажатии кнопки Back закрывает окно вместо закрытия приложения.
 */
export function useModalHistory(
  isOpen: boolean,
  onClose: () => void,
  modalKey: string
) {
  const isPushedRef = useRef(false);
  const closingFromPopstateRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen) {
      if (!isPushedRef.current) {
        isPushedRef.current = true;
        const currentState = window.history.state || {};
        window.history.pushState(
          { ...currentState, modalId: modalKey },
          '',
          window.location.href
        );
      }

      const handlePopState = () => {
        if (isPushedRef.current) {
          isPushedRef.current = false;
          closingFromPopstateRef.current = true;
          onClose();
        }
      };

      window.addEventListener('popstate', handlePopState);

      // Telegram WebApp BackButton
      const tg = (window as any).Telegram?.WebApp;
      let tgBackHandler: (() => void) | null = null;
      if (tg?.BackButton) {
        tg.BackButton.show();
        tgBackHandler = () => {
          window.history.back();
        };
        tg.BackButton.onClick(tgBackHandler);
      }

      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (tg?.BackButton && tgBackHandler) {
          tg.BackButton.offClick(tgBackHandler);
        }
      };
    } else {
      if (isPushedRef.current && !closingFromPopstateRef.current) {
        // Если окно закрыли кликом по крестику или фону (а не через popstate),
        // откатываем history entry назад, чтобы не оставлять висячих записей в истории
        isPushedRef.current = false;
        try {
          if (window.history.state?.modalId === modalKey) {
            window.history.back();
          }
        } catch {}
      }
      isPushedRef.current = false;
      closingFromPopstateRef.current = false;
    }
  }, [isOpen, onClose, modalKey]);
}
