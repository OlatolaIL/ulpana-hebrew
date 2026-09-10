import React from 'react';
import { Play, List } from 'lucide-react';
import { ThematicDeck, UserProfile, Word } from '@/types';
import { isDeckAlwaysFree } from '@/lib/permissions';
import { TierBadge } from '../TierBadge';
import { DeckIcon } from './DeckIcon';
import { shuffleWords, sortWordsBySRSPriority } from '@/lib/storage';

export interface DeckStats {
  avgScore: number;
  masteredCount: number;
  dueCount: number;
  totalWords: number;
}

interface DeckCardProps {
  deck: ThematicDeck;
  stats: DeckStats;
  userProfile: UserProfile;
  shuffleDecks: boolean;
  onOpenListModal: (deck: ThematicDeck) => void;
  onStartTraining: (words: Word[], deckTitle: string, shuffle?: boolean) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  stats,
  userProfile,
  shuffleDecks,
  onOpenListModal,
  onStartTraining,
}) => {
  const isAlef = deck.level === 'alef';
  const isCaregiver = deck.category === 'caregiver';
  const isAutoRepair = deck.category === 'autoRepair';
  const isKindergarten = deck.category === 'kindergarten';
  const isDoctor = deck.category === 'doctor';
  const isAccounting = deck.category === 'accounting';

  const getCategoryBadgeLabel = () => {
    if (isCaregiver) return '👩‍⚕️ Метапелет';
    if (isAutoRepair) return '🔧 Автомастерская';
    if (isKindergarten) return '👶 Детский сад';
    if (isDoctor) return '🏥 Врач';
    if (isAccounting) return '💼 Бухгалтер';
    return isAlef ? 'Алеф (א)' : 'Бет (ב)';
  };

  const getCategoryBadgeStyle = () => {
    if (isCaregiver) return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800';
    if (isAutoRepair) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800';
    if (isKindergarten) return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800';
    if (isDoctor) return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800';
    if (isAccounting) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800';
    if (isAlef) return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800';
    return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800';
  };

  const getIconWrapperStyle = () => {
    if (isCaregiver) return 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400';
    if (isAutoRepair) return 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400';
    if (isKindergarten) return 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400';
    if (isDoctor) return 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400';
    if (isAccounting) return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
    if (isAlef) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
    return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400';
  };

  const handleTrainClick = () => {
    const words = shuffleDecks
      ? shuffleWords(deck.words)
      : sortWordsBySRSPriority(
          deck.words,
          userProfile.flashcardStats,
          userProfile.flashcardProgress
        );
    onStartTraining(words, deck.title, shuffleDecks);
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 sm:p-4 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition flex flex-col justify-between gap-3">
      <div
        className="flex items-start gap-3 cursor-pointer group"
        onClick={() => onOpenListModal(deck)}
        title={`Открыть слова «${deck.title}»`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition group-hover:scale-105 ${getIconWrapperStyle()}`}
        >
          <DeckIcon name={deck.icon} className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {deck.title}
              </h3>
              {isDeckAlwaysFree(deck.id) ? (
                <TierBadge
                  tier="always-free"
                  size="xs"
                  isUlpan={userProfile.ulpanMode}
                  customLabel={userProfile.ulpanMode ? 'חִנָּם' : 'Бесплатно'}
                />
              ) : (
                <TierBadge tier="pro-beta" size="xs" isUlpan={userProfile.ulpanMode} />
              )}
            </div>
            {stats.avgScore > 0 && (
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
                {stats.avgScore}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${getCategoryBadgeStyle()}`}
            >
              {getCategoryBadgeLabel()}
            </span>
            <span>•</span>
            <span>{deck.words.length} слов</span>
            {stats.dueCount > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  ⚡ {stats.dueCount} на повтор
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Две аккуратные кнопки */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleTrainClick}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white shadow-xs transition active:scale-98 cursor-pointer ${
            isAlef ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Тренировать</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenListModal(deck)}
          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          title="Посмотреть список слов"
        >
          <List className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Слова ({deck.words.length})</span>
        </button>
      </div>
    </div>
  );
};
