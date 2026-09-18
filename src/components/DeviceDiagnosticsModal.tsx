'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Volume2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Send,
} from 'lucide-react';
import {
  DeviceDiagnosticsReport,
  downloadDiagnosticsFile,
} from '@/lib/deviceDiagnostics';
import { speakHebrew } from '@/lib/speech';

interface DeviceDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DeviceDiagnosticsReport | null;
}

const SABABA_TEST_VARIANTS = [
  { id: 'v1', label: 'סַבָּא בָּה', note: 'Два слова (алеф)', text: 'סַבָּא בָּה' },
  { id: 'v2', label: 'סַבָּ-בָּה', note: 'Дефис', text: 'סַבָּ-בָּה' },
  { id: 'v3', label: 'סַבָּא-בָּה', note: 'Алеф + дефис', text: 'סַבָּא-בָּה' },
  { id: 'v4', label: 'סַבּ בָּה', note: 'Пробел в корне', text: 'סַבּ בָּה' },
  { id: 'v5', label: 'סַבָּבָה', note: 'Исходный оригинал', text: 'סַבָּבָה' },
  { id: 'v6', label: 'סַאבָּבָה', note: 'Алеф в первом слоге', text: 'סַאבָּבָה' },
  { id: 'v7', label: 'סָבָּבָה', note: 'Камац', text: 'סָבָּבָה' },
  { id: 'v8', label: 'סַבָּבַּה', note: 'Патах на конце', text: 'סַבָּבַּה' },
  { id: 'v9', label: 'סַבָּ׳בָּה', note: 'Геруш (апостроф)', text: 'סַבָּ׳בָּה' },
  { id: 'v10', label: 'סַבָּה בָּה', note: 'Саба + ба', text: 'סַבָּה בָּה' },
];

/**
 * Прямая озвучка через системный синтезатор без каких-либо автозамен
 */
function speakRawOnDevice(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      speakHebrew(text).then(resolve);
      return;
    }
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'he-IL';
      u.rate = 0.7;
      const voices = window.speechSynthesis.getVoices();
      const heVoice = voices.find(
        (v) =>
          v.lang === 'he-IL' ||
          v.lang === 'he' ||
          v.lang === 'he_IL' ||
          (v.lang && v.lang.toLowerCase().startsWith('he'))
      );
      if (heVoice) u.voice = heVoice;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

export const DeviceDiagnosticsModal: React.FC<DeviceDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('סַבָּא בָּה');

  if (!isOpen || !report) return null;

  const jsonString = JSON.stringify(report, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = jsonString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePlayVariant = async (id: string, text: string) => {
    if (activePlayingId) return;
    setActivePlayingId(id);
    try {
      await speakRawOnDevice(text);
    } finally {
      setActivePlayingId(null);
    }
  };

  const heVoice = report.speechSynthesis.hebrewVoices[0];
  const isV4Cache = report.pwaAndCache.hasV4Cache;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-5 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50 leading-tight">
                Тестер произношения & TTS
              </h3>
              <p className="text-[11px] text-zinc-400">
                {report.environment.platform} • {heVoice ? heVoice.name : 'Web Speech'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Прокручиваемый контент */}
        <div className="py-2.5 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* Статус движка и кэша */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Голос устройства</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate block text-[11px]">
                {heVoice ? heVoice.name : 'Google TTS Stream'}
              </span>
              <span className="text-[10px] text-zinc-500">{heVoice ? `lang: ${heVoice.lang}` : 'Fallback'}</span>
            </div>

            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Кэш PWA</span>
              <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200 text-[11px]">
                {isV4Cache ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>v4 (Свежий)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{report.pwaAndCache.cacheNames[0] || 'Прямая сеть'}</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-zinc-500">{report.environment.isStandalonePwa ? 'PWA режим' : 'Вкладка браузера'}</span>
            </div>
          </div>

          {/* Интерактивный стенд вариантов ударения для сабаба */}
          <div className="p-3 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-violet-900 dark:text-violet-200 text-xs">
                🎯 Стенд вариантов для «сабаба» (нажмите и послушайте)
              </span>
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                Живой тест на телефоне
              </span>
            </div>

            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
              Нажимайте на варианты ниже. Какой из них ваш телефон произносит как правильное разговорное <b>«са-БА-ба»</b>?
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {SABABA_TEST_VARIANTS.map((v) => {
                const isPlaying = activePlayingId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handlePlayVariant(v.id, v.text)}
                    disabled={activePlayingId !== null}
                    className={`p-2 rounded-xl border text-left transition flex items-center justify-between gap-1.5 active:scale-97 ${
                      isPlaying
                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 border-violet-200/80 dark:border-violet-900/60 hover:border-violet-400 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <span className="font-hebrew font-bold text-sm block leading-tight truncate">
                        {v.label}
                      </span>
                      <span className={`text-[9px] block truncate ${isPlaying ? 'text-violet-100' : 'text-zinc-400'}`}>
                        {v.note}
                      </span>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isPlaying ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
                    }`}>
                      {isPlaying ? (
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Произвольный ввод */}
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-500 block">
              Свой вариант текста для проверки на телефоне:
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                dir="rtl"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Впишите слово на иврите..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-hebrew font-bold focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => handlePlayVariant('custom', customInput)}
                disabled={!customInput.trim() || activePlayingId !== null}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1 transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Озвучить</span>
              </button>
            </div>
          </div>
        </div>

        {/* Действия: Скопировать и Скачать */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать JSON в буфер'}</span>
          </button>

          <button
            onClick={() => downloadDiagnosticsFile(report)}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-98"
            title="Скачать JSON файл"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Файл</span>
          </button>
        </div>
      </div>
    </div>
  );
};
