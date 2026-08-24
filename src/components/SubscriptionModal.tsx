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

        {/* Текущий статус подписки */}
        <div
          className={`p-4 rounded-2xl border ${
            isPro
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300'
          } flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className={`w-5 h-5 ${isPro ? 'text-emerald-600' : 'text-amber-500'} shrink-0`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {isPro ? 'Ваш статус: PRO активирован' : 'Ваш статус: Бесплатный тариф'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {isPro
                  ? `Доступ открыт до ${expiresDate || 'бессрочно'}`
                  : 'Доступны алфавит и первые 3 урока каталога'}
              </p>
            </div>
          </div>
        </div>

        {/* Преимущества тарифа PRO */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Что входит в подписку PRO:
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs text-zinc-700 dark:text-zinc-200">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Все 100 уроков ульпана</span> — полные курсы уровней Алеф (A1-A2) и Бет (B1-B2).
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Безлимитный живой диалог с ИИ</span> — общение голосом и текстом на актуальные бытовые темы Израиля.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Рукописный шрифт и прописи</span> — навык чтения реальных записей и вывесок в Израиле.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Умные интервальные повторения (SRS)</span> — слова навсегда остаются в долговременной памяти.
              </div>
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
