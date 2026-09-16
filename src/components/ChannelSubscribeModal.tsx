'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Sparkles, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '@/types';

interface ChannelSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSubscriptionVerified?: (isSubscriber: boolean) => void;
  onOpenAuth?: () => void;
  lessonNumber?: number;
}

export const ChannelSubscribeModal: React.FC<ChannelSubscribeModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSubscriptionVerified,
  onOpenAuth,
  lessonNumber,
}) => {
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasTelegramLinked = Boolean(userProfile.telegramId);

  const handleCheckSubscription = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setChecking(true);

    try {
      const res = await fetch('/api/auth/telegram/check-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Не удалось выполнить проверку. Попробуйте снова.');
      }

      if (data.ok && data.isSubscriber) {
        setSuccessMsg('Подписка подтверждена! Доступ к уроку открыт 🎉');
        try {
          void confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}

        if (onSubscriptionVerified) {
          onSubscriptionVerified(true);
        }

        setTimeout(() => {
          onClose();
        }, 1600);
      } else if (data.reason === 'telegram_not_linked') {
        setErrorMsg('Ваш аккаунт еще не привязан к Telegram. Войдите через Telegram или привяжите его в настройках.');
      } else {
        setErrorMsg('Бот пока не видит вашу подписку на канал @ulpana_il. Пожалуйста, подпишитесь на канал и нажмите кнопку снова.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Произошла ошибка проверки.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="channel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть окно"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center shadow-inner">
            <Send className="w-8 h-8 -translate-x-0.5 translate-y-0.5" />
          </div>
          <div>
            <h2 id="channel-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {lessonNumber ? `Урок ${lessonNumber} ждет вас!` : 'Доступ к материалам'}
            </h2>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mt-0.5">
              Эксклюзивно для подписчиков Telegram-канала
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-4 text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
          <p className="leading-relaxed">
            Этот урок открыт для подписчиков нашего Telegram-канала{' '}
            <span className="font-bold text-sky-600 dark:text-sky-400">@ulpana_il</span>.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            В канале мы публикуем разборы живого иврита, идиомы, анонсы новых уроков и секреты произношения. Подписка бесплатна!
          </p>
        </div>

        {/* Telegram Not Linked Warning */}
        {!userProfile.isLoggedIn ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>Для автоматической проверки подписки необходимо сначала войти в аккаунт.</span>
            </div>
          </div>
        ) : !hasTelegramLinked ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span>
                Ваш текущий аккаунт не привязан к Telegram. Вы можете связать аккаунт через Telegram в настройках профиля.
              </span>
            </div>
          </div>
        ) : null}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Link to Channel */}
          <a
            href="https://t.me/ulpana_il"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
            <span>Перейти в канал @ulpana_il</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Verify Subscription Button */}
          {userProfile.isLoggedIn ? (
            <button
              type="button"
              onClick={handleCheckSubscription}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-bold py-3 px-4 rounded-xl shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Проверяем подписку...' : '🔄 Я подписался, проверить доступ'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти через Telegram / Аккаунт</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 py-2 transition"
          >
            Вернуться к выбору уроков
          </button>
        </div>
      </div>
    </div>
  );
};
