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
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [pollToken, setPollToken] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
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

  // 2. Поллинг статуса подтверждения через Telegram-бота
  useEffect(() => {
    if (!isWaitingForBot || !pollToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram/token?token=${pollToken}`);
        const data = await res.json();
        if (data.completed && data.user) {
          clearInterval(interval);
          setIsWaitingForBot(false);
          onLoginSuccess(data.user, data.gender, data.fontStyle);
          onClose();
        }
      } catch (e) {
        console.warn('[Polling] error:', e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isWaitingForBot, pollToken, onLoginSuccess, onClose]);

  // Запуск входа в 1 клик через Telegram-бота
  const handleStartBotLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/telegram/token', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setPollToken(data.token);
        setBotUrl(data.botUrl);
        setIsWaitingForBot(true);
        window.open(data.botUrl, '_blank');
      } else {
        setError('Не удалось создать сессию входа');
      }
    } catch {
      setError('Ошибка связи с сервером');
    } finally {
      setLoading(false);
    }
  };

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
            Авторизация в 1 клик без паролей и номеров телефонов
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Главная кнопка входа: Вход в 1 клик через Telegram */}
        {!isWaitingForBot ? (
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleStartBotLogin}
              disabled={loading}
              className="w-full py-4 px-5 rounded-2xl bg-[#229ED9] hover:bg-[#1E8CC0] active:scale-98 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>Войти через Telegram</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition underline underline-offset-2"
              >
                {showManualInput ? 'Скрыть ручной ввод ID' : 'Или войти по Telegram ID / Нику →'}
              </button>
            </div>
          </div>
        ) : (
          /* Режим ожидания подтверждения из Telegram */
          <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center space-y-3 animate-in fade-in">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-[#229ED9] animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Ожидание подтверждения...
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                Откройте Telegram и нажмите кнопку <span className="font-bold text-[#229ED9]">«Старт»</span> в боте @{botUsername}
              </p>
            </div>

            {botUrl && (
              <a
                href={botUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#229ED9] text-white text-xs font-bold hover:bg-[#1E8CC0] shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Открыть бота в Telegram</span>
              </a>
            )}
          </div>
        )}

        {/* Ручной ввод (если пользователь нажал ссылку) */}
        {showManualInput && (
          <form onSubmit={handleCustomSubmit} className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Telegram ID или @username:
              </label>
              <input
                type="text"
                value={telegramInput}
                onChange={(e) => setTelegramInput(e.target.value)}
                placeholder="Например: 8215851 или @ваш_ник"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 focus:outline-none focus:ring-2 focus:ring-[#229ED9]/30 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Подтвердить ID</span>
            </button>
          </form>
        )}

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
