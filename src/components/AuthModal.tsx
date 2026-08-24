'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { UserSession } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession, gender?: 'male' | 'female', fontStyle?: 'print' | 'cursive') => void;
  botUsername?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'Ulpinebot',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Глобальная функция, которую вызывает официальный скрипт Telegram Login Widget
    (window as any).onTelegramAuth = async (user: any) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          onLoginSuccess(data.user, data.gender, data.fontStyle);
          onClose();
        } else {
          setError(data.error || 'Ошибка авторизации через Telegram');
        }
      } catch (e) {
        setError('Не удалось связаться с сервером авторизации');
      } finally {
        setLoading(false);
      }
    };

    // Вставляем официальный скрипт Telegram в контейнер
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '14');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [isOpen, onLoginSuccess, onClose, botUsername]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center shadow-inner">
            <Send className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Вход через Telegram
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Официальная авторизация через бота <span className="font-semibold text-[#229ED9]">@{botUsername}</span>
          </p>
        </div>

        {/* Преимущества авторизации */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Автоматическая синхронизация прогресса на ПК и телефоне</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Сохранение личного словарика и карточек SRS</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Привязка и продление подписки PRO ко всем устройствам</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Официальный контейнер виджета Telegram */}
        <div className="space-y-3 flex flex-col items-center justify-center pt-2 min-h-[56px]">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#229ED9] font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Авторизация аккаунта...</span>
            </div>
          ) : (
            <div
              id="telegram-login-container"
              ref={containerRef}
              className="flex justify-center min-h-[44px]"
            />
          )}
        </div>

        <div className="text-center pt-1">
          <p className="text-[11px] text-zinc-400">
            Безопасный вход через официальный сервис Telegram без паролей.
          </p>
        </div>
      </div>
    </div>
  );
};
