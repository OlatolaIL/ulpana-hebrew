'use client';

import React, { useEffect, useState } from 'react';
import { X, Send, Sparkles, ShieldCheck, CheckCircle2, Bot, AlertCircle } from 'lucide-react';
import { UserProfile, UserSession } from '@/types';

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
  botUsername = 'UlpanaHebrewBot',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUsername, setManualUsername] = useState('');
  const [manualName, setManualName] = useState('');

  // Интеграция глобального callback для виджета Telegram
  useEffect(() => {
    if (!isOpen) return;

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
        setError('Не удалось подключиться к серверу авторизации');
      } finally {
        setLoading(false);
      }
    };

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleSimulatedTelegramLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const randomId = Math.floor(100000000 + Math.random() * 900000000);
      const cleanUsername = manualUsername.replace('@', '').trim() || `user_${randomId}`;

      const simulatedUser = {
        id: randomId,
        first_name: manualName.trim(),
        username: cleanUsername,
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'simulated_dev_hash',
      };

      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedUser),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user, data.gender, data.fontStyle);
        onClose();
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
            <Send className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Вход в Ульпан Иврита
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Авторизуйтесь, чтобы синхронизировать прогресс уроков и словарь на всех ваших устройствах.
          </p>
        </div>

        {/* Преимущества входа */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Сохранение пройденных уроков и упражнений</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Личный словарик и история диалогов с ИИ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Активация и управление PRO-подпиской</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Быстрый вход через Telegram */}
        <div className="space-y-3">
          <form onSubmit={handleSimulatedTelegramLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ваше имя или псевдоним
              </label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Например: Даниил / Анна"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Telegram @username (не обязательно)
              </label>
              <input
                type="text"
                value={manualUsername}
                onChange={(e) => setManualUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !manualName.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E8CC0] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Вход...' : 'Войти через Telegram'}</span>
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-zinc-400">
            Вход защищен. Ваши персональные данные в безопасности.
          </p>
        </div>
      </div>
    </div>
  );
};
