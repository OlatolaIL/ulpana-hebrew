import React from 'react';
import {
  Layers,
  Hammer,
  Headphones,
  Play,
  Columns2,
  ArrowLeftRight,
  Shuffle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { calculateWordMastery } from '@/lib/storage';
import { TrainerMode } from './types';

interface TrainerHeaderProps {
  displayTitle?: string;
  isSplitMode: boolean;
  canSplit: boolean;
  activePartIndex: number;
  parts: Word[][];
  completedPartIndices: number[];
  currentWord?: Word;
  userProfile: UserProfile;
  mode: TrainerMode;
  cardDirection: 'he-ru' | 'ru-he' | 'carousel';
  isShuffled: boolean;
  shuffleToast: boolean;
  currentIndex: number;
  wordsLength: number;
  masterWordsLength: number;
  onSetMode: (mode: TrainerMode) => void;
  onToggleSplitMode: () => void;
  onToggleDirection: () => void;
  onShuffleWords: () => void;
  onToggleFontStyle: () => void;
  onPrevWord: () => void;
  onAdvanceNext: () => void;
  onSelectPart: (index: number) => void;
}

export const TrainerHeader: React.FC<TrainerHeaderProps> = ({
  displayTitle,
  isSplitMode,
  canSplit,
  activePartIndex,
  parts,
  completedPartIndices,
  currentWord,
  userProfile,
  mode,
  cardDirection,
  isShuffled,
  shuffleToast,
  currentIndex,
  wordsLength,
  masterWordsLength,
  onSetMode,
  onToggleSplitMode,
  onToggleDirection,
  onShuffleWords,
  onToggleFontStyle,
  onPrevWord,
  onAdvanceNext,
  onSelectPart,
}) => {
  return (
    <div className="space-y-4">
      {/* Заголовок тренировки (если есть customTitle) */}
      {displayTitle && (
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 font-hebrew flex-wrap">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{displayTitle}</span>
            {isSplitMode && canSplit && activePartIndex >= 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 normal-case">
                · Часть {activePartIndex + 1} из {parts.length}
              </span>
            )}
          </div>
          {currentWord && (() => {
            const stats =
              userProfile.flashcardStats?.[currentWord.id] ||
              userProfile.flashcardProgress?.[currentWord.id] ||
              (currentWord.hebrewPlain
                ? userProfile.flashcardStats?.[stripNikkud(currentWord.hebrewPlain)]
                : undefined) ||
              userProfile.flashcardStats?.[stripNikkud(currentWord.hebrew)];
            const mastery = calculateWordMastery(stats);
            const masteryText = `Знание: ${mastery.score}% (${mastery.label})`;
            return (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mastery.badgeBg}`}>
                {masteryText}
              </span>
            );
          })()}
        </div>
      )}

      {/* Шапка тренировки и выбор режима */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 w-full sm:w-auto bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5">
          {/* Флип */}
          <button
            onClick={() => onSetMode('flip')}
            title="Флип"
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'flip'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Флип</span>
          </button>
          {/* Конструктор */}
          <button
            onClick={() => onSetMode('builder')}
            title="Конструктор"
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'builder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Конструктор</span>
          </button>
          {/* На слух */}
          <button
            onClick={() => onSetMode('listening')}
            title="На слух"
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'listening'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">На слух</span>
          </button>
          {/* Авто на слух */}
          <button
            onClick={() => onSetMode('auto_audio')}
            title="Авто на слух"
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'auto_audio'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current flex-shrink-0" />
            <span className="hidden sm:inline">Авто</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Кнопка деления на части (По частям), если в колоде > 12 слов */}
          {canSplit && (
            <button
              type="button"
              onClick={onToggleSplitMode}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
                isSplitMode
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/30'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
              title={
                isSplitMode
                  ? 'Отключить режим частей'
                  : 'Разбить колоду на части по 7–10 слов'
              }
            >
              <Columns2
                className={`w-3.5 h-3.5 ${
                  isSplitMode ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              />
              <span className="hidden sm:inline">
                {isSplitMode ? 'По частям' : 'Поделить'}
              </span>
              <span className="sm:hidden">Части</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSplitMode
                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                {parts.length}
              </span>
            </button>
          )}

          {/* Переключатель направления карточек (Иврит ↔ Русский ↔ Карусель) */}
          <button
            type="button"
            onClick={onToggleDirection}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
              cardDirection === 'ru-he'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                : cardDirection === 'carousel'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={
              cardDirection === 'ru-he'
                ? 'Обратный: Русский → Иврит. Нажмите для режима Карусель'
                : cardDirection === 'carousel'
                ? 'Карусель: случайный/чередующийся порядок (то иврит, то русский). Нажмите для Иврит → Русский'
                : 'Прямой: Иврит → Русский. Нажмите для режима Русский → Иврит'
            }
          >
            <ArrowLeftRight
              className={`w-3.5 h-3.5 ${
                cardDirection === 'ru-he'
                  ? 'text-amber-600 dark:text-amber-400'
                  : cardDirection === 'carousel'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            />
            <span className="font-bold flex items-center gap-1">
              {cardDirection === 'ru-he' ? (
                <>
                  <span className="text-amber-700 dark:text-amber-300 font-extrabold">
                    Рус
                  </span>
                  <span className="text-zinc-400">→</span>
                  <span>Ивр</span>
                </>
              ) : cardDirection === 'carousel' ? (
                <>
                  <span className="text-purple-600 dark:text-purple-400 font-extrabold">🔀</span>
                  <span className="text-purple-700 dark:text-purple-300">Карусель</span>
                </>
              ) : (
                <>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                    Ивр
                  </span>
                  <span className="text-zinc-400">→</span>
                  <span>Рус</span>
                </>
              )}
            </span>
            <span className="hidden sm:inline text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
              {cardDirection === 'ru-he' ? '(обратный)' : cardDirection === 'carousel' ? '(микс)' : ''}
            </span>
          </button>

          {/* Кнопка перемешивания слов (Shuffle) */}
          <button
            type="button"
            onClick={onShuffleWords}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${
              shuffleToast
                ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-200 ring-2 ring-purple-400/50'
                : isShuffled
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title="Перемешать слова (случайный порядок)"
          >
            <Shuffle
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                shuffleToast
                  ? 'rotate-180 text-purple-600 dark:text-purple-400'
                  : isShuffled
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-zinc-500'
              }`}
            />
            <span className="hidden sm:inline">
              {shuffleToast ? 'Перемешано!' : 'Вразброс'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleFontStyle}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Переключить шрифт карточек: Печатный / Рукописный"
          >
            {userProfile.fontStyle === 'cursive' ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">
                  כתב
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">
                  דפוס
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={onPrevWord}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
              title="Предыдущее слово (Стрелка влево)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 px-1.5 min-w-[65px] text-center select-none font-hebrew flex flex-col items-center justify-center leading-tight">
              <span>{currentIndex + 1} из {wordsLength}</span>
              {isSplitMode && canSplit && activePartIndex >= 0 && (
                <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                  Ч. {activePartIndex + 1}/{parts.length}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={currentIndex + 1 >= wordsLength}
              onClick={onAdvanceNext}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed transition cursor-pointer"
              title="Следующее слово (Стрелка вправо)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Навигация по частям (если включен режим частей) */}
      {isSplitMode && canSplit && (
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1.5 shrink-0">
            Части:
          </span>
          {parts.map((part, idx) => {
            const isActive = activePartIndex === idx;
            const isDone = completedPartIndices.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPart(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20'
                    : isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                <span>Часть {idx + 1}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isDone
                      ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                      : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {part.length}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onSelectPart(-1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activePartIndex === -1
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Все вместе</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                activePartIndex === -1
                  ? 'bg-indigo-700 text-white'
                  : 'bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {masterWordsLength}
            </span>
          </button>
        </div>
      )}

      {/* Прогресс-бар */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isSplitMode && canSplit && activePartIndex >= 0 ? 'bg-blue-600' : 'bg-indigo-600'
          }`}
          style={{ width: `${((currentIndex + 1) / wordsLength) * 100}%` }}
        />
      </div>
    </div>
  );
};
