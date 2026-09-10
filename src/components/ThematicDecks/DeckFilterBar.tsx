import React from 'react';

export type DeckFilter =
  | 'all'
  | 'alef'
  | 'bet'
  | 'verbs'
  | 'food'
  | 'body'
  | 'city'
  | 'slang'
  | 'caregiver'
  | 'autoRepair'
  | 'kindergarten'
  | 'doctor'
  | 'accounting';

interface FilterOption {
  id: DeckFilter;
  label: string;
  activeClass: string;
  inactiveClass: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    id: 'all',
    label: 'Все',
    activeClass: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs',
    inactiveClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
  },
  {
    id: 'alef',
    label: 'Алеф (א)',
    activeClass: 'bg-blue-600 text-white shadow-xs',
    inactiveClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100',
  },
  {
    id: 'bet',
    label: 'Бет (ב)',
    activeClass: 'bg-purple-600 text-white shadow-xs',
    inactiveClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100',
  },
  {
    id: 'verbs',
    label: '⚡ Глаголы',
    activeClass: 'bg-indigo-600 text-white shadow-xs',
    inactiveClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100',
  },
  {
    id: 'food',
    label: '🥐 Еда и кафе',
    activeClass: 'bg-amber-600 text-white shadow-xs',
    inactiveClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100',
  },
  {
    id: 'body',
    label: '🏥 Здоровье',
    activeClass: 'bg-rose-600 text-white shadow-xs',
    inactiveClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100',
  },
  {
    id: 'city',
    label: '🏙️ Город',
    activeClass: 'bg-emerald-600 text-white shadow-xs',
    inactiveClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100',
  },
  {
    id: 'slang',
    label: '🗣️ Сленг',
    activeClass: 'bg-purple-600 text-white shadow-xs',
    inactiveClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100',
  },
  {
    id: 'caregiver',
    label: '👩‍⚕️ Метапелет',
    activeClass: 'bg-teal-600 text-white shadow-xs',
    inactiveClass: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100',
  },
  {
    id: 'autoRepair',
    label: '🔧 Автомастерская',
    activeClass: 'bg-amber-600 text-white shadow-xs',
    inactiveClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100',
  },
  {
    id: 'kindergarten',
    label: '👶 Детский сад',
    activeClass: 'bg-rose-600 text-white shadow-xs',
    inactiveClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100',
  },
  {
    id: 'doctor',
    label: '🏥 Врач',
    activeClass: 'bg-cyan-600 text-white shadow-xs',
    inactiveClass: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100',
  },
  {
    id: 'accounting',
    label: '💼 Бухгалтер',
    activeClass: 'bg-emerald-600 text-white shadow-xs',
    inactiveClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100',
  },
];

interface DeckFilterBarProps {
  filter: DeckFilter;
  onFilterChange: (filter: DeckFilter) => void;
  totalDecksCount: number;
}

export const DeckFilterBar: React.FC<DeckFilterBarProps> = ({
  filter,
  onFilterChange,
  totalDecksCount,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-hebrew">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = filter === opt.id;
        const label = opt.id === 'all' ? `${opt.label} (${totalDecksCount})` : opt.label;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onFilterChange(opt.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              isActive ? opt.activeClass : opt.inactiveClass
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
