'use client';

import React from 'react';
import { X, Share, PlusSquare, Check, Smartphone, Monitor, Globe } from 'lucide-react';
import { checkIsIOS } from '@/lib/usePwaInstall';

interface PwaInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS?: boolean;
}

export const PwaInstallGuideModal: React.FC<PwaInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isIOS = false,
}) => {
  if (!isOpen) return null;

  const actualIsIOS = isIOS || (typeof window !== 'undefined' && checkIsIOS());

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              {actualIsIOS ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {actualIsIOS ? 'Установка на iPhone / iPad' : 'Как установить приложение'}
              </h3>
              <p className="text-xs text-zinc-500">Полноэкранный режим и быстрый запуск</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actualIsIOS ? (
          /* Инструкция для iPhone и iPad (Safari / iOS) */
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Чтобы Ульпана работала на весь экран как нативное приложение из App Store, добавьте её на рабочий стол:
            </p>

            <ol className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-200 font-medium">
              <li className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>1. Нажмите кнопку <strong>«Поделиться»</strong> в нижней панели Safari</span>
              </li>

              <li className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. Пролистайте вниз и выберите <strong>«На экран “Домой”»</strong></span>
              </li>

              <li className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>3. Нажмите <strong>«Добавить»</strong> в правом верхнем углу</span>
              </li>
            </ol>
          </div>
        ) : (
          /* Инструкция для Android / Компьютера / Chrome / Edge */
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Вы можете запускать Ульпану как отдельную программу с панели задач или главного экрана:
            </p>

            <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-200">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Способ 1: Иконка в адресной строке</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  В правом углу адресной строки браузера нажмите на значок установки (компьютер со стрелкой или <strong>«+»</strong>) и нажмите <strong>«Установить»</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Способ 2: Через меню браузера</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Откройте меню браузера (три точки <strong>⋮</strong> в правом верхнем углу) и выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};
