'use client';

import React, { useState } from 'react';
import { X, Crown, CheckCircle2, Sparkles, KeyRound, AlertCircle, ArrowRight, MessageSquare, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, UserSession } from '@/types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onPromoActivated: (updatedSession: UserSession) => void;
  onOpenAuth: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onPromoActivated,
  onOpenAuth,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPro = userProfile.subscriptionTier === 'pro' || userProfile.subscriptionTier === 'admin';
  const expiresDate = userProfile.subscriptionExpiresAt
    ? new Date(userProfile.subscriptionExpiresAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleActivatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    if (!userProfile.isLoggedIn) {
      setError('Пожалуйста, сначала войдите через Telegram, чтобы привязать подписку к вашему аккаунту.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/subscription/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onPromoActivated(data.user);
        setPromoCode('');
      } else {
        setError(data.error || 'Не удалось активировать промокод');
      }
    } catch (e) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Шапка модалки */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Ульпан PRO • Полный доступ
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Освойте разговорный иврит от уровня Алеф до свободного общения
          </p>
        </div>

        {/* Текущий статус: Открытое бета-тестирование */}
        <div className="p-4 rounded-2xl border bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Открытое бета-тестирование
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {isPro
                    ? `У вас активирован статус PRO (${expiresDate || 'бессрочно'})`
                    : 'Вам открыт полный доступ ко всем функциям PRO на время тестирования'}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shrink-0">
              PRO БЕТА
            </span>
          </div>
        </div>

        {/* Прозрачное разграничение: Бесплатно vs PRO */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Структура курса и тарифов:
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {/* Всегда бесплатно */}
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Всегда бесплатно (для всех зарегистрированных):</span>
              </div>
              <ul className="text-[11px] space-y-0.5 pl-6 list-disc opacity-90">
                <li>Уроки 1–30 уровня Алеф: этапы 1–3 (Теория, Словарь, Тесты)</li>
                <li>Алфавит и прописи (печатный и рукописный шрифт)</li>
                <li>Личный словарик и умный поиск слов</li>
                <li>3 базовые колоды (Глаголы Пааль ч.1, Шук/Еда, Кафе/Ресторан)</li>
              </ul>
            </div>

            {/* Входит в PRO */}
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex items-center justify-between gap-2 font-bold text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Входит в PRO (сейчас открыто в бете):</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold">
                  БЕТА
                </span>
              </div>
              <ul className="text-[11px] space-y-0.5 pl-6 list-disc opacity-90">
                <li>Симулятор телефонных звонков и живые диалоги с ИИ (уроки 3–100)</li>
                <li>Продвинутые уроки 31–100 (завершение Алеф и полный курс Бет)</li>
                <li>Все специализированные колоды (биньяны глаголов, сленг, банк, медицина)</li>
                <li>Интервальное повторение (SRS) без ограничений</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Активация промокода */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Активация промокода</span>
          </div>

          <form onSubmit={handleActivatePromo} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Введите промокод (напр. ULPANA2026)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !promoCode.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {loading ? '...' : 'Применить'}
            </button>
          </form>

          {successMsg && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {successMsg}
            </p>
          )}

          {error && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {!userProfile.isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline block"
            >
              Войдите через Telegram для привязки подписки →
            </button>
          )}
        </div>

        <div className="text-center pt-2">
          <a
            href="https://t.me/azr2001"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Написать автору / Задать вопрос по подписке</span>
          </a>
        </div>
      </div>
    </div>
  );
};
