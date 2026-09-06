'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  HelpCircle,
  Sparkles,
  Map,
  GraduationCap,
  PenTool,
  Layers,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { SECTION_GUIDES, SectionGuide } from '@/data/guideContent';

interface SectionGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
  onNavigateSection?: (section: any) => void;
}

const SECTION_TABS = [
  { id: 'map', label: 'Карта', icon: Map },
  { id: 'lesson', label: 'Урок', icon: GraduationCap },
  { id: 'writing', label: 'Прописи', icon: PenTool },
  { id: 'flashcards', label: 'Карточки', icon: Layers },
  { id: 'verbs', label: 'Глаголы', icon: RotateCcw },
  { id: 'vocabulary', label: 'Словарь', icon: BookOpen },
];

export const SectionGuideDrawer: React.FC<SectionGuideDrawerProps> = ({
  isOpen,
  onClose,
  activeSection = 'map',
  onNavigateSection,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>(activeSection);
  const [autoShowEnabled, setAutoShowEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ulpana_auto_show_guides');
    if (saved === 'false') {
      setAutoShowEnabled(false);
    }
  }, []);

  // Синхронизируем выбранную вкладку с текущим разделом при открытии
  useEffect(() => {
    if (isOpen && activeSection) {
      const normalized = activeSection === 'dictionary' ? 'vocabulary' : activeSection;
      setSelectedSection(SECTION_GUIDES[normalized] ? normalized : 'map');
    }
  }, [isOpen, activeSection]);

  // Закрытие по клавише Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleAutoShow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAutoShowEnabled(checked);
    localStorage.setItem('ulpana_auto_show_guides', checked ? 'true' : 'false');
  };

  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  const guide: SectionGuide = SECTION_GUIDES[selectedSection] || SECTION_GUIDES.map;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Затемненный фон */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          
          {/* 1. Верхняя панель: Заголовок и закрытие */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-850/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50">
                    Гид по платформе
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Возможности и лайфхаки каждого раздела
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
                title="Закрыть (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Быстрые вкладки разделов */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
              {SECTION_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSection(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Основной скроллируемый контент */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
            
            {/* Карточка заголовка раздела */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-blue-600 text-white">
                  {guide.badge}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">Раздел</span>
              </div>
              <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {guide.title}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {guide.summary}
              </p>
            </div>

            {/* Список ключевых возможностей */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Как пользоваться разделом:
              </h5>

              <div className="space-y-2.5">
                {guide.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1"
                  >
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] flex items-center justify-center shrink-0 font-extrabold">
                        {idx + 1}
                      </span>
                      <span>{feat.title}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Лайфхаки и секреты раздела */}
            {guide.proTips && guide.proTips.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Полезные советы и лайфхаки:</span>
                </div>
                <ul className="space-y-1.5 pl-1 text-xs text-amber-950 dark:text-amber-200">
                  {guide.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. Нижняя панель: Настройка автопоказа и кнопка закрытия */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={!autoShowEnabled}
                onChange={(e) => {
                  const doNotShow = e.target.checked;
                  setAutoShowEnabled(!doNotShow);
                  localStorage.setItem('ulpana_auto_show_guides', doNotShow ? 'false' : 'true');
                }}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Больше не показывать подсказки автоматически</span>
            </label>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Понятно, спасибо!</span>
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
