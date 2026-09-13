'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  HelpCircle,
  ChevronDown,
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
import { useGuidePreference } from '@/lib/useGuidePreference';

const emptySubscribe = () => () => {};

interface SectionGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection?: string;
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
}) => {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [prevActiveSection, setPrevActiveSection] = useState(activeSection);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [selectedSection, setSelectedSection] = useState<string>(() => {
    const normalized = activeSection === 'dictionary' ? 'vocabulary' : activeSection;
    return SECTION_GUIDES[normalized] ? normalized : 'map';
  });
  const [autoShowEnabled, setAutoShowEnabled] = useGuidePreference();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Синхронизируем выбранную вкладку с текущим разделом во время рендера (без каскадных эффектов)
  if (prevActiveSection !== activeSection || prevIsOpen !== isOpen) {
    setPrevActiveSection(activeSection);
    setPrevIsOpen(isOpen);
    if (isOpen && activeSection) {
      const normalized = activeSection === 'dictionary' ? 'vocabulary' : activeSection;
      setSelectedSection(SECTION_GUIDES[normalized] ? normalized : 'map');
      setIsDetailsOpen(false);
    }
  }

  // Закрытие по клавише Escape
  useEffect(() => {
    if (!isOpen || !isClient) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"]), input, a[href]') ?? []);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen, isClient, onClose]);

  const handleToggleAutoShow = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoShowEnabled(e.target.checked);
  };

  if (!isClient || !isOpen || typeof document === 'undefined') {
    return null;
  }

  const guide: SectionGuide = SECTION_GUIDES[selectedSection] || SECTION_GUIDES.map;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Справка по разделу"
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
    >
      {/* Затемненный фон */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-lg flex">
        <div className="w-full min-w-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          
          {/* 1. Верхняя панель: Заголовок и закрытие */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-850/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50">
                    Справка к разделу
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Понятные шаги и ориентиры для обучения
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Закрыть (Esc)"
                aria-label="Закрыть справку"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Быстрые вкладки разделов */}
            <div
              role="tablist"
              aria-label="Разделы платформы"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SECTION_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    tabIndex={isSelected ? 0 : -1}
                    aria-selected={isSelected}
                    aria-label={tab.label}
                    onKeyDown={(event) => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      const current = SECTION_TABS.findIndex(item => item.id === tab.id);
                      const next = event.key === 'Home' ? 0 : event.key === 'End' ? SECTION_TABS.length - 1 :
                        (current + (event.key === 'ArrowRight' ? 1 : -1) + SECTION_TABS.length) % SECTION_TABS.length;
                      setSelectedSection(SECTION_TABS[next].id);
                      setIsDetailsOpen(false);
                      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
                    }}
                    onClick={() => {
                      setSelectedSection(tab.id);
                      setIsDetailsOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
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

            {/* Краткая справка к разделу: 3 шага */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <span>Краткая справка: как проходить раздел</span>
              </h5>

              <div className="p-3.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center shrink-0 font-extrabold">
                      1
                    </span>
                    <span>Что делать сначала</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 pl-7 leading-relaxed">
                    {guide.quickAction.firstStep}
                  </p>
                </div>

                <div className="space-y-1 border-t border-blue-200/60 dark:border-blue-900/40 pt-2.5">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center shrink-0 font-extrabold">
                      2
                    </span>
                    <span>Следующее действие</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 pl-7 leading-relaxed">
                    {guide.quickAction.nextStep}
                  </p>
                </div>

                <div className="space-y-1 border-t border-blue-200/60 dark:border-blue-900/40 pt-2.5">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center shrink-0 font-extrabold">
                      ✓
                    </span>
                    <span>Как понять результат</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 pl-7 leading-relaxed">
                    {guide.quickAction.resultCheck}
                  </p>
                </div>
              </div>
            </div>

            {/* Подробности по желанию раскрываются отдельно */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setIsDetailsOpen((prev) => !prev)}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between transition cursor-pointer"
                aria-expanded={isDetailsOpen}
              >
                <span>Подробные возможности раздела</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                    isDetailsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDetailsOpen && (
                <div className="space-y-3 animate-in fade-in-50 duration-150">
                  <div className="space-y-2">
                    {guide.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1"
                      >
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>{feat.title}</span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-3 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Полезные советы */}
                  {guide.proTips && guide.proTips.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Полезные советы:</span>
                      </div>
                      <ul className="space-y-1 pl-1 text-xs text-amber-950 dark:text-amber-200">
                        {guide.proTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* 3. Нижняя панель: Настройка автопоказа и кнопка закрытия */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={autoShowEnabled}
                onChange={handleToggleAutoShow}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Показывать справку при первом открытии раздела</span>
            </label>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Понятно, закрыть</span>
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
