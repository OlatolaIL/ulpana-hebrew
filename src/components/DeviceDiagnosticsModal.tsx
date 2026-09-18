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
  Smartphone,
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

export const DeviceDiagnosticsModal: React.FC<DeviceDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !report) return null;

  const jsonString = JSON.stringify(report, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback для старых WebView
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

  const handlePlayAgain = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakHebrew(report.liveSpeechTest.testedText || 'סַבָּ-בָּה');
    } finally {
      setIsPlaying(false);
    }
  };

  const heVoice = report.speechSynthesis.hebrewVoices[0];
  const isV4Cache = report.pwaAndCache.hasV4Cache;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-50 leading-tight">
                Диагностика аудио & TTS
              </h3>
              <p className="text-xs text-zinc-400">
                Снимок окружения устройства и движка речи
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

        {/* Сводные карточки ключевых параметров */}
        <div className="py-3 space-y-2.5 overflow-y-auto shrink-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Голос */}
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                Голос иврита
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                {heVoice ? heVoice.name : 'Резервный Google TTS'}
              </span>
              <span className="text-[10px] text-zinc-500">
                {heVoice ? `Язык: ${heVoice.lang}` : 'Audio fallback stream'}
              </span>
            </div>

            {/* Кэш PWA */}
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                Версия кэша PWA
              </span>
              <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                {isV4Cache ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>v4 (Свежий)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">
                      {report.pwaAndCache.cacheNames[0] || 'Без кэша'}
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 truncate block">
                {report.environment.platform}
              </span>
            </div>
          </div>

          {/* Тест звучания слова */}
          <div className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 block">
                Фонетический ввод для синтеза
              </span>
              <span className="font-hebrew font-bold text-base text-zinc-900 dark:text-zinc-50">
                {report.liveSpeechTest.cleanedSpeechText || 'סַבָּ-בָּה'}
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Длительность: {report.liveSpeechTest.durationMs} мс
              </span>
            </div>

            <button
              onClick={handlePlayAgain}
              disabled={isPlaying}
              className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span>{isPlaying ? 'Играет...' : 'Послушать'}</span>
            </button>
          </div>
        </div>

        {/* Действия: Скопировать и Скачать */}
        <div className="pt-2 pb-3 flex gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать JSON в буфер'}</span>
          </button>

          <button
            onClick={() => downloadDiagnosticsFile(report)}
            className="py-3 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-98"
            title="Скачать JSON файл"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Скачать файл</span>
          </button>
        </div>

        {/* Превью JSON (сворачиваемое / прокручиваемое) */}
        <div className="flex-1 min-h-28 overflow-hidden rounded-xl bg-zinc-900 text-zinc-300 p-3 border border-zinc-800 flex flex-col text-[11px] font-mono">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800 text-zinc-400 text-[10px]">
            <span>ulpana-speech-diag.json</span>
            <span>{Math.round(jsonString.length / 1024)} КБ</span>
          </div>
          <pre className="overflow-y-auto flex-1 select-all font-mono leading-tight whitespace-pre">
            {jsonString}
          </pre>
        </div>

        <p className="text-[11px] text-zinc-400 text-center pt-2">
          Нажмите «Скопировать JSON в буфер» и отправьте его в чат разработчику.
        </p>
      </div>
    </div>
  );
};
