'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, MessageSquare, Sparkles, ChevronRight, User } from 'lucide-react';
import { Lesson, Level } from '@/types';

interface DialogueSummary {
  lessonId: number;
  level: Level;
  titleRu: string;
  titleHe: string;
  situation: string;
  aiRole: string;
  userRole: string;
  turnsCount: number;
}

interface DialoguesCatalogClientProps {
  dialogues: DialogueSummary[];
}

const LEVEL_TABS: Array<{ id: 'all' | 'alef1' | 'alef2' | 'bet1' | 'bet2'; label: string; desc: string }> = [
  { id: 'all', label: 'Все 100 диалогов', desc: 'Полный каталог речевых ситуаций' },
  { id: 'alef1', label: 'Алеф 1 (1–25)', desc: 'Знакомство, кафе, покупки, город' },
  { id: 'alef2', label: 'Алеф 2 (26–50)', desc: 'Быт, поликлиника, аренда, транспорт' },
  { id: 'bet1', label: 'Бет 1 (51–75)', desc: 'Работа, собеседование, учеба' },
  { id: 'bet2', label: 'Бет 2 (76–100)', desc: 'Свободное общение и дискуссии' },
];

export const DialoguesCatalogClient: React.FC<DialoguesCatalogClientProps> = ({ dialogues }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'alef1' | 'alef2' | 'bet1' | 'bet2'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDialogues = useMemo(() => {
    return dialogues.filter((d) => {
      // Фильтр по уровню
      if (activeTab === 'alef1' && (d.lessonId < 1 || d.lessonId > 25)) return false;
      if (activeTab === 'alef2' && (d.lessonId < 26 || d.lessonId > 50)) return false;
      if (activeTab === 'bet1' && (d.lessonId < 51 || d.lessonId > 75)) return false;
      if (activeTab === 'bet2' && (d.lessonId < 76 || d.lessonId > 100)) return false;

      // Поисковый запрос
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          d.titleRu.toLowerCase().includes(q) ||
          d.titleHe.includes(q) ||
          d.situation.toLowerCase().includes(q) ||
          d.aiRole.toLowerCase().includes(q) ||
          d.userRole.toLowerCase().includes(q) ||
          String(d.lessonId) === q
        );
      }

      return true;
    });
  }, [dialogues, activeTab, searchQuery]);

  return (
    <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 pb-20 space-y-6">
      {/* Навигационная плашка и заголовок */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться на главную (Карта курса)</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <span>🎭</span>
            <span>Каталог диалогов и речевых ситуаций</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            100 жизненных диалогов для развития беглой разговорной речи на иврите. Каждый диалог доступен по уникальному адресу, поддерживает озвучку носителей, режим ролевой практики и свободное общение с ИИ.
          </p>
        </div>

        {/* Поиск */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск темы (кафе, такси, урок)..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Вкладки уровней */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {LEVEL_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex flex-col items-start ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-normal ${isActive ? 'text-blue-100' : 'text-zinc-400'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Сетка карточек диалогов */}
      {filteredDialogues.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-400 text-sm">
          <p className="font-bold text-zinc-700 dark:text-zinc-300">Ничего не найдено</p>
          <p className="text-xs text-zinc-400 mt-1">Попробуйте изменить поисковый запрос или переключить уровень.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDialogues.map((item) => (
            <Link
              key={item.lessonId}
              href={`/dialogues/${item.lessonId}`}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
                    Урок {item.lessonId}
                  </span>
                  <span className="text-xs font-hebrew font-bold text-zinc-400 group-hover:text-blue-600 transition" dir="rtl">
                    {item.titleHe}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {item.titleRu}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.situation}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-zinc-400">Собеседник:</span>
                    <span className="truncate">{item.aiRole}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-zinc-400">Ваша роль:</span>
                    <span className="truncate">{item.userRole}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>Пройти диалог</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
