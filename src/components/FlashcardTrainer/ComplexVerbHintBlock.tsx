import React, { useMemo } from 'react';
import { Sparkles, Volume2 } from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { getVerbDrillSentences, VerbDrillSentence } from '@/data/verbSentencesData';
import { adaptSentenceForGender } from '@/lib/drills/sentenceGenderAdapter';
import { stripNikkud } from '@/lib/transcription';

export interface ComplexVerbHintBlockProps {
  currentWord: Word;
  userProfile: UserProfile;
  isFlipped: boolean;
  selectedTense: 'present' | 'past';
  onSelectTense: (tense: 'present' | 'past') => void;
  onPlayHint: (tense?: 'present' | 'past') => void;
  isPlaying: boolean;
}

export const ComplexVerbHintBlock: React.FC<ComplexVerbHintBlockProps> = ({
  currentWord,
  userProfile,
  isFlipped,
  selectedTense,
  onSelectTense,
  onPlayHint,
  isPlaying,
}) => {
  const raw = (currentWord.hebrewPlain || currentWord.hebrew || '').trim();

  // Извлекаем фразы из матрицы предложений Комплекса (R-18)
  const drillSentences = useMemo(() => {
    return getVerbDrillSentences(raw);
  }, [raw]);

  // Если это не глагол или для него нет фраз в Комплексе — компонент не отображается
  if (drillSentences.length === 0) {
    return null;
  }

  const hasPresent = drillSentences.some((s) => s.tense === 'present');
  const hasPast = drillSentences.some((s) => s.tense === 'past');

  const activeSentence = useMemo(() => {
    const match = drillSentences.find((s) => s.tense === selectedTense) || drillSentences[0];
    if (userProfile.gender === 'female' && match?.sentenceHe) {
      const adapted = adaptSentenceForGender(
        match.sentenceHe,
        match.sentenceTranscription || '',
        'female'
      );
      return {
        ...match,
        sentenceHe: adapted.sentenceHe,
        sentenceTranscription: adapted.sentenceTranscription,
      };
    }
    return match;
  }, [drillSentences, selectedTense, userProfile.gender]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-2 w-full max-w-sm mx-auto flex flex-col items-center select-none"
    >
      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-700/60 shadow-2xs text-xs flex-wrap justify-center">
        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="hidden xs:inline">Подсказка:</span>
        </div>

        {/* Переключатель времён (Настоящее / Прошедшее) */}
        <div className="inline-flex items-center p-0.5 rounded-xl bg-amber-200/50 dark:bg-zinc-800/80 border border-amber-300/40 dark:border-zinc-700/60">
          {hasPresent && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTense('present');
                onPlayHint('present');
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] sm:text-xs transition cursor-pointer ${
                selectedTense === 'present'
                  ? 'bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-200 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
              }`}
              title="Настоящее время фразы из комплекса (нажмите для переключения и озвучки)"
            >
              Наст.
            </button>
          )}

          {hasPast && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTense('past');
                onPlayHint('past');
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] sm:text-xs transition cursor-pointer ${
                selectedTense === 'past'
                  ? 'bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-200 shadow-2xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium'
              }`}
              title="Прошедшее время фразы из комплекса (нажмите для переключения и озвучки)"
            >
              Прош.
            </button>
          )}
        </div>

        {/* Кнопка воспроизведения фразы из комплекса */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlayHint();
          }}
          className={`px-2.5 py-1 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
            isPlaying
              ? 'bg-amber-600 text-white ring-2 ring-amber-400/50 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
          }`}
          title={`Воспроизвести фразу из комплекса (${
            selectedTense === 'present' ? 'настоящее' : 'прошедшее'
          } время)`}
        >
          <Volume2 className="w-3.5 h-3.5 shrink-0" />
          <span>{isPlaying ? 'Играет...' : 'Воспроизвести фразу'}</span>
        </button>
      </div>

      {/* На оборотной стороне (isFlipped) показываем текст фразы Комплекса в помощь студенту */}
      {isFlipped && activeSentence && (
        <div className="mt-2 text-center w-full px-2 animate-in fade-in">
          <div
            dir="rtl"
            className="text-xs sm:text-sm font-hebrew text-zinc-700 dark:text-zinc-300 font-medium"
          >
            {userProfile.showNikkud
              ? activeSentence.sentenceHe
              : stripNikkud(activeSentence.sentenceHe)}
          </div>
          {activeSentence.sentenceRu && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {activeSentence.sentenceRu}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
