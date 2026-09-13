import React from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { VerbTriadInfo } from '@/lib/verbTriad';
import { RootRelatedWord } from '@/types';

interface VerbTriadBlockProps {
  triad: VerbTriadInfo;
  onSpeakHebrew: (text: string) => void;
  onOpenPealim?: () => void;
  onSelectRelatedWord?: (word: RootRelatedWord) => void;
}

export const VerbTriadBlock: React.FC<VerbTriadBlockProps> = ({
  triad,
  onSpeakHebrew,
  onOpenPealim,
  onSelectRelatedWord,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-2.5 w-full max-w-md mx-auto bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-2xl p-2.5 sm:p-3 border border-blue-200/80 dark:border-blue-800/60 shadow-xs text-left select-text"
    >
      {/* Шапка: Биньян, Корень, Предлог управления */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap pb-2 mb-2 border-b border-blue-200/60 dark:border-blue-800/50 text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 shadow-2xs">
            {triad.binyanClean || triad.binyan}
          </span>
          {triad.root && (
            <span
              className="font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300/40"
              dir="rtl"
            >
              שורש: {triad.root}
            </span>
          )}
        </div>

        {triad.prepositionInfo && (
          <span
            className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
            title={`Управление: ${triad.prepositionInfo.ruleRu}`}
          >
            + {triad.prepositionInfo.preposition}
          </span>
        )}
      </div>

      {/* 2 Слотовые формы: Настоящее (он) и Прошедшее (он) — инфинитив уже есть выше на главной карточке */}
      <div className="grid grid-cols-2 gap-2 text-center">
        {/* 1. Настоящее (Он) */}
        <div className="bg-white/90 dark:bg-zinc-900/90 p-2 sm:p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col justify-between shadow-2xs">
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Настоящее (он)
          </span>
          <div
            dir="rtl"
            className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-100 my-0.5 leading-snug"
          >
            {triad.presentMasc.hebrew}
          </div>
          {triad.presentMasc.transcription && (
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">
              {triad.presentMasc.transcription}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSpeakHebrew(triad.presentMasc.hebrew);
            }}
            className="mt-1 p-1 mx-auto rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
            title="Озвучить настоящее время"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Прошедшее (Он вчера) */}
        <div className="bg-white/90 dark:bg-zinc-900/90 p-2 sm:p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col justify-between shadow-2xs">
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Прошедшее (он)
          </span>
          <div
            dir="rtl"
            className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-100 my-0.5 leading-snug"
          >
            {triad.pastHe.hebrew}
          </div>
          {triad.pastHe.transcription && (
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">
              {triad.pastHe.transcription}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSpeakHebrew(triad.pastHe.hebrew);
            }}
            className="mt-1 p-1 mx-auto rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
            title="Озвучить прошедшее время"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Пояснение по управлению предлогом (если есть) */}
      {triad.prepositionInfo && (
        <div className="mt-2 pt-1.5 border-t border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 px-1 flex-wrap gap-1">
          <span>
            Управление:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {triad.prepositionInfo.ruleRu}
            </strong>
          </span>
          <span
            dir="rtl"
            className="font-hebrew font-bold text-zinc-800 dark:text-zinc-200"
          >
            {triad.prepositionInfo.exampleHe} ({triad.prepositionInfo.exampleRu})
          </span>
        </div>
      )}

      {/* Однокоренные слова: существительные / прилагательные (до 3 штук) с всплывающими карточками */}
      {triad.relatedWords && triad.relatedWords.length > 0 && (
        <div className="mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/40 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-0.5">
            <span>Семья корня (нажмите для карточки):</span>
            <span className="text-[9px] font-medium lowercase text-blue-600 dark:text-blue-400">
              {triad.relatedWords.length}{' '}
              {triad.relatedWords.length === 1 ? 'слово' : 'слова'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {triad.relatedWords.map((rw, idx) => (
              <button
                key={`rw-${idx}-${rw.hebrew}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectRelatedWord) {
                    onSelectRelatedWord(rw);
                  } else {
                    onSpeakHebrew(rw.hebrew);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-zinc-800/90 hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800/60 text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer group"
                title={`Открыть карточку слова: ${rw.translation}`}
              >
                <span
                  dir="rtl"
                  className="font-hebrew font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                >
                  {rw.hebrew}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
                  · {rw.translation}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка перехода в подробные таблицы Pealim */}
      {onOpenPealim && (
        <div className="mt-2 pt-1.5 border-t border-blue-200/50 dark:border-blue-800/30 flex justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPealim();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300/60 dark:border-purple-800 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Все времена и семья корня (Пеалим)</span>
          </button>
        </div>
      )}
    </div>
  );
};
