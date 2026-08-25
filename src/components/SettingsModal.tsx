'use client';

import React from 'react';
import Link from 'next/link';
import { X, Key, User, Volume2, Eye, HelpCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { UserProfile, UserGender, AiProvider } from '@/types';
import { isVipUser } from '@/lib/vipUsers';
import { saveUserProfile } from '@/lib/storage';
import { speakHebrew } from '@/lib/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onOpenAuth?: () => void;
  onOpenSubscription?: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onOpenAuth,
  onOpenSubscription,
  onLogout,
}) => {
  if (!isOpen) return null;

  const isPro = profile.subscriptionTier === 'pro' || profile.subscriptionTier === 'admin';

  const handleChange = (fields: Partial<UserProfile>) => {
    const updated = { ...profile, ...fields };
    onUpdateProfile(updated);
    saveUserProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                Настройки и профиль
              </h2>
              <p className="text-xs text-zinc-500">Аккаунт, подписка, пол и ИИ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 0. Секция аккаунта и подписки */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {profile.isLoggedIn
                      ? profile.username
                        ? `@${profile.username}`
                        : `ID: ${profile.telegramId || (profile.id ? profile.id.replace(/^tg_/, '') : 'Telegram')}`
                      : 'Гостевой режим (локально)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenSubscription) onOpenSubscription();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isPro
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {isPro ? '👑 PRO' : 'Купить PRO'}
                </button>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              {profile.isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) onLogout();
                      onClose();
                    }}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Выйти из аккаунта
                  </button>
                  {isVipUser(profile.username, profile.telegramId, profile.name) && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Панель админа →</span>
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Войти через Telegram для синхронизации →
                </button>
              )}
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* 1. Грамматический пол ученика (Критично для иврита!) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Грамматический пол говорящего
            </label>
            <p className="text-xs text-zinc-500 leading-relaxed">
              В иврите формы глаголов зависят от пола («אֲנִי רוֹצֶה» для мужчин и «אֲנִי רוֹצָה» для женщин). ИИ будет обращаться к вам соответственно.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleChange({ gender: 'female' })}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1 transition ${
                  profile.gender === 'female'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-600/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="text-lg">👩 Женский</span>
                <span dir="rtl" className="text-xs text-zinc-500 font-hebrew">
                  נְקֵבָה (אַתְּ רוֹצָה)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleChange({ gender: 'male' })}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1 transition ${
                  profile.gender === 'male'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-600/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="text-lg">👨 Мужской</span>
                <span dir="rtl" className="text-xs text-zinc-500 font-hebrew">
                  זָכָר (אַתָּה רוֹצֶה)
                </span>
              </button>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* 2. Настройки отображения иврита */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Отображение текста</span>
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Показывать огласовки (Никуд - נִקּוּד)
                  </span>
                  <p className="text-xs text-zinc-500">
                    Рекомендуется для уровня Алеф для правильного чтения
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.showNikkud}
                  onChange={(e) => handleChange({ showNikkud: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Русская транскрипция (с буквой h для ה)
                  </span>
                  <p className="text-xs text-zinc-500">
                    Помогает освоить звуки и правильные ударения
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.showTranscription}
                  onChange={(e) => handleChange({ showTranscription: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              {/* Переключатель печатного / рукописного шрифта */}
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Стиль шрифта иврита
                  </span>
                  <p className="text-xs text-zinc-500">
                    Печатный для учебников или рукописный (Ктав Яд) для записок и практики
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleChange({ fontStyle: 'print' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      profile.fontStyle !== 'cursive'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-600/20'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-base font-hebrew font-bold">דפוס</span>
                    <span>Печатный</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange({ fontStyle: 'cursive' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      profile.fontStyle === 'cursive'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-600/20'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-2xl font-cursive font-bold text-blue-600 dark:text-blue-400">כתב</span>
                    <span>Рукописный</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* 3. Скорость речи и озвучки */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Скорость речи и озвучки</span>
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {(profile.speechRate ?? 0.7).toFixed(2)}x
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              Настройте темп голоса, чтобы отчетливо слышать каждый звук и окончание.
            </p>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: '0.55x Медленно', rate: 0.55 },
                { label: '0.70x Учебная', rate: 0.7 },
                { label: '0.85x Средняя', rate: 0.85 },
                { label: '1.00x Обычная', rate: 1.0 },
              ].map((p) => (
                <button
                  key={p.rate}
                  type="button"
                  onClick={() => {
                    handleChange({ speechRate: p.rate });
                    speakHebrew('שָׁלוֹם, בּוֹקֶר טוֹב!', { rate: p.rate });
                  }}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-medium transition ${
                    (profile.speechRate ?? 0.7) === p.rate
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-600/20'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center gap-3">
              <input
                type="range"
                min="0.4"
                max="1.2"
                step="0.05"
                value={profile.speechRate ?? 0.7}
                onChange={(e) => handleChange({ speechRate: parseFloat(e.target.value) })}
                className="flex-1 accent-emerald-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() =>
                  speakHebrew('שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי לוֹמֵד עִבְרִית.', {
                    rate: profile.speechRate ?? 0.7,
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Проверить</span>
              </button>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* 3. Настройка бесплатного ИИ (Groq / Gemini) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Движок искусственного интеллекта (Бесплатно)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ aiProvider: 'groq' })}
                className={`p-3 rounded-xl border text-left transition ${
                  profile.aiProvider === 'groq'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/20'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Groq (Рекомендуется)</span>
                  {profile.aiProvider === 'groq' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Llama 3.3 70B • Сверхбыстро и бесплатно</p>
              </button>

              <button
                type="button"
                onClick={() => handleChange({ aiProvider: 'gemini' })}
                className={`p-3 rounded-xl border text-left transition ${
                  profile.aiProvider === 'gemini'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/20'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Google Gemini</span>
                  {profile.aiProvider === 'gemini' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">Gemini 2.0 Flash • Google AI Studio</p>
              </button>
            </div>

            {profile.aiProvider === 'groq' ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ключ Groq API (gsk_...)
                </label>
                <input
                  type="password"
                  value={profile.groqApiKey || ''}
                  onChange={(e) => handleChange({ groqApiKey: e.target.value })}
                  placeholder="Вставьте бесплатный ключ Groq"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-zinc-500">
                  Ключ можно получить бесплатно на сайте{' '}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    console.groq.com
                  </a>
                  . Работает без оплаты и кредитных карт.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ключ Google Gemini API (AIzaSy...)
                </label>
                <input
                  type="password"
                  value={profile.geminiApiKey || ''}
                  onChange={(e) => handleChange({ geminiApiKey: e.target.value })}
                  placeholder="Вставьте ключ Gemini"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-xs text-zinc-500">
                  Ключ доступен бесплатно на{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    aistudio.google.com
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="sticky bottom-0 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            Сохранить и закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
