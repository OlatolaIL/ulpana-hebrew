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
  const [telegramInput, setTelegramInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Автоматический вход, если приложение открыто внутри Telegram (Mini App / WebApp)
  useEffect(() => {
    if (!isOpen) return;

    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        const tgPayload = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: Math.floor(Date.now() / 1000),
          hash: tg.initData ? 'webapp_validated' : undefined,
        };

        handleDirectLogin(tgPayload);
        return;
      }
    } catch {}

    // Глобальная функция, которую вызывает официальный скрипт Telegram Login Widget
    (window as any).onTelegramAuth = async (user: any) => {
      handleDirectLogin(user);
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
  }, [isOpen, botUsername]);

  const handleDirectLogin = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user, data.gender, data.fontStyle);
        onClose();
      } else {
        setError(data.error || 'Ошибка авторизации');
      }
    } catch (e) {
      setError('Не удалось связаться с сервером авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = telegramInput.trim();
    if (!input) {
      setError('Пожалуйста, введите ваш Telegram ID или @username');
      return;
    }

    const isNumeric = /^\d+$/.test(input);
    const payload = isNumeric
      ? { id: parseInt(input, 10), first_name: `Пользователь ${input}` }
      : { username: input.replace(/^@/, ''), first_name: input };

    handleDirectLogin(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center shadow-inner">
            <Send className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Вход через Telegram
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Синхронизация прогресса, словаря и PRO-подписки
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Форма быстрого входа по ID / @username (без номера телефона!) */}
        <form onSubmit={handleCustomSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Вход по Telegram ID или Никнейму:
            </label>
            <div className="relative">
              <input
                type="text"
                value={telegramInput}
                onChange={(e) => setTelegramInput(e.target.value)}
                placeholder="Например: 8215851 или @ваш_ник"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-[#229ED9]/30 focus:border-[#229ED9] transition"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-0.5">
              <span>Номер телефона не требуется</span>
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="text-[#229ED9] hover:underline font-medium"
              >
                Узнать свой ID в @userinfobot →
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E8CC0] active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{loading ? 'Авторизация...' : 'Войти в 1 клик'}</span>
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
            или официальный виджет
          </span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* Официальный контейнер виджета Telegram */}
        <div className="flex justify-center min-h-[44px]">
          <div id="telegram-login-container" ref={containerRef} />
        </div>

        {/* Преимущества авторизации */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Авто-синхронизация прогресса на ПК и телефоне</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Сохранение словарика и карточек SRS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
