import React, { useState, useMemo } from 'react';
import { Volume2, RotateCw, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { getHebrewPictogram } from '@/lib/pictograms';
import { getWordTranscription } from '@/lib/transcription';
import { detectLinguisticTip } from '@/lib/linguisticTips';
import { LinguisticTipDrawer } from '@/components/ThematicDecks/LinguisticTipDrawer';
import { extractVerbTriad } from '@/lib/verbTriad';
import { VerbTriadBlock } from '../VerbTriadBlock';

interface FlipCardModeProps {
  currentWord: Word;
  userProfile: UserProfile;
  isFlipped: boolean;
  isCurrentCardFrontRussian: boolean;
  cardDirection: 'he-ru' | 'ru-he' | 'carousel';
  currentIndex: number;
  onFlipCard: () => void;
  onPrevWord: () => void;
  onNextWord: (quality?: number) => void;
  onOpenPealim: (word: Word) => void;
  onSpeakHebrew: (text: string) => void;
}

export const FlipCardMode: React.FC<FlipCardModeProps> = ({
  currentWord,
  userProfile,
  isFlipped,
  isCurrentCardFrontRussian,
  cardDirection,
  currentIndex,
  onFlipCard,
  onPrevWord,
  onNextWord,
  onOpenPealim,
  onSpeakHebrew,
}) => {
  const isCursive = userProfile.fontStyle === 'cursive';
  const [isTipOpen, setIsTipOpen] = useState(false);
  const tip = detectLinguisticTip(currentWord);

  const triad = useMemo(() => {
    if (
      currentWord.partOfSpeech === 'verb' ||
      currentWord.hebrew.startsWith('לִ') ||
      currentWord.hebrew.startsWith('לְ') ||
      currentWord.hebrew.startsWith('לַ') ||
      currentWord.hebrew.startsWith('לָ') ||
      Boolean(currentWord.root)
    ) {
      return extractVerbTriad(currentWord);
    }
    return null;
  }, [currentWord]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Сама карточка */}
      <div
        onClick={onFlipCard}
        className="min-h-[200px] sm:min-h-[270px] bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-blue-500/50 transition duration-300 relative select-none"
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSpeakHebrew(currentWord.hebrew);
            }}
            className="p-2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition shadow-sm"
            title={
              isCurrentCardFrontRussian && !isFlipped
                ? 'Подсказка: прослушать на иврите'
                : 'Озвучить'
            }
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Кнопка подсказки в верхнем левом углу карточки */}
        {tip && (
          <div className="absolute top-3 left-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTipOpen(true);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/80 transition shadow-xs cursor-pointer"
              title={`Лингвистическая подсказка: ${tip.ruleTitle}`}
            >
              <span className="text-sm">💡</span>
            </button>
          </div>
        )}

        {!isFlipped ? (
          isCurrentCardFrontRussian ? (
            /* Лицевая сторона: Русский → Иврит (обратный режим) */
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                  Русский (вспомните иврит)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                  Русский → Иврит
                </span>
                {triad?.prepositionInfo && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 shadow-2xs"
                    title={`Управление: ${triad.prepositionInfo.ruleRu}`}
                  >
                    + {triad.prepositionInfo.preposition}
                  </span>
                )}
              </div>

              {getHebrewPictogram(currentWord.hebrew) && (() => {
                const icon = getHebrewPictogram(currentWord.hebrew)!;
                const isMale = icon.includes('♂');
                const isFemale = icon.includes('♀');
                return (
                  <div
                    className={`inline-flex items-center justify-center text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl border font-bold select-none my-1 shadow-xs animate-in zoom-in-75 ${
                      isMale
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        : isFemale
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {icon}
                  </div>
                );
              })()}

              <div className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 font-sans tracking-wide max-w-md mx-auto">
                {currentWord.translation}
              </div>

              <p className="text-xs text-zinc-400 font-medium">
                Нажмите на карточку или пробел, чтобы увидеть иврит
              </p>
            </div>
          ) : (
            /* Лицевая сторона: Иврит → Русский (прямой режим) */
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                  Иврит (нажмите для перевода)
                </span>
                {triad?.prepositionInfo && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 shadow-2xs"
                    title={`Управление: ${triad.prepositionInfo.ruleRu}`}
                  >
                    + {triad.prepositionInfo.preposition}
                  </span>
                )}
              </div>

              {getHebrewPictogram(currentWord.hebrew) && (() => {
                const icon = getHebrewPictogram(currentWord.hebrew)!;
                const isMale = icon.includes('♂');
                const isFemale = icon.includes('♀');
                return (
                  <div
                    className={`inline-flex items-center justify-center text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl border font-bold select-none my-1 shadow-xs animate-in zoom-in-75 ${
                      isMale
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        : isFemale
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {icon}
                  </div>
                );
              })()}

              <div
                dir="rtl"
                className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                  isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
                }`}
              >
                {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
              </div>
              {userProfile.showTranscription &&
                getWordTranscription(currentWord) && (
                  <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                    [{getWordTranscription(currentWord)}]
                  </p>
                )}
            </div>
          )
        ) : isCurrentCardFrontRussian ? (
          /* Оборотная сторона: Иврит и детали (обратный режим) */
          <div className="space-y-2.5 sm:space-y-3 animate-in fade-in">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Иврит и детали
            </span>

            {getHebrewPictogram(currentWord.hebrew) && (() => {
              const icon = getHebrewPictogram(currentWord.hebrew)!;
              const isMale = icon.includes('♂');
              const isFemale = icon.includes('♀');
              return (
                <div
                  className={`inline-flex items-center justify-center text-xl sm:text-2xl px-3 py-1 rounded-xl border font-bold select-none shadow-xs ${
                    isMale
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      : isFemale
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {icon}
                </div>
              );
            })()}

            <div
              dir="rtl"
              className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
              }`}
            >
              {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
            </div>

            {getWordTranscription(currentWord) && (
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 -mt-1">
                [{getWordTranscription(currentWord)}]
              </p>
            )}

            <div className="text-lg sm:text-2xl font-bold text-zinc-700 dark:text-zinc-300 pt-0.5">
              {currentWord.translation}
            </div>

            {triad ? (
              <VerbTriadBlock
                triad={triad}
                onSpeakHebrew={onSpeakHebrew}
                onOpenPealim={() => onOpenPealim(currentWord)}
              />
            ) : (
              <>
                {currentWord.root && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    <span>Шореш:</span>
                    <span dir="rtl" className="font-bold">
                      {currentWord.root}
                    </span>
                  </div>
                )}

                {(currentWord.partOfSpeech === 'verb' ||
                  currentWord.hebrew.startsWith('לִ') ||
                  currentWord.hebrew.startsWith('לְ') ||
                  currentWord.hebrew.startsWith('לַ') ||
                  currentWord.hebrew.startsWith('לָ') ||
                  Boolean(currentWord.root)) && (
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPealim(currentWord);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300/60 dark:border-purple-800 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Пеалим (спряжения и семья корня)</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Кнопка лингвистической подсказки */}
            {tip && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTipOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300/60 dark:border-amber-800 shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  <span>💡</span>
                  <span>{tip.badgeTitle}: {tip.ruleTitle}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Оборотная сторона: Перевод и детали (прямой режим) */
          <div className="space-y-2.5 sm:space-y-3 animate-in fade-in">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Перевод и детали
            </span>

            {getHebrewPictogram(currentWord.hebrew) && (() => {
              const icon = getHebrewPictogram(currentWord.hebrew)!;
              const isMale = icon.includes('♂');
              const isFemale = icon.includes('♀');
              return (
                <div
                  className={`inline-flex items-center justify-center text-xl sm:text-2xl px-3 py-1 rounded-xl border font-bold select-none shadow-xs ${
                    isMale
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      : isFemale
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {icon}
                </div>
              );
            })()}

            <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {currentWord.translation}
            </div>
            <div
              dir="rtl"
              className={`text-lg sm:text-2xl text-zinc-600 dark:text-zinc-300 font-bold ${
                isCursive ? 'font-cursive text-blue-500' : 'font-hebrew'
              }`}
            >
              {currentWord.hebrew}
            </div>
            {getWordTranscription(currentWord) && (
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 -mt-1">
                [{getWordTranscription(currentWord)}]
              </p>
            )}
            {triad ? (
              <VerbTriadBlock
                triad={triad}
                onSpeakHebrew={onSpeakHebrew}
                onOpenPealim={() => onOpenPealim(currentWord)}
              />
            ) : (
              <>
                {currentWord.root && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    <span>Шореш:</span>
                    <span dir="rtl" className="font-bold">
                      {currentWord.root}
                    </span>
                  </div>
                )}

                {(currentWord.partOfSpeech === 'verb' ||
                  currentWord.hebrew.startsWith('לִ') ||
                  currentWord.hebrew.startsWith('לְ') ||
                  currentWord.hebrew.startsWith('לַ') ||
                  currentWord.hebrew.startsWith('לָ') ||
                  Boolean(currentWord.root)) && (
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPealim(currentWord);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-300/60 dark:border-purple-800 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Пеалим (спряжения и семья корня)</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Кнопка лингвистической подсказки */}
            {tip && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTipOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300/60 dark:border-amber-800 shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  <span>💡</span>
                  <span>{tip.badgeTitle}: {tip.ruleTitle}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Действия для лицевой стороны (!isFlipped) */}
      {!isFlipped ? (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={onPrevWord}
              className="py-3.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
              title="Предыдущее слово"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              type="button"
              onClick={onFlipCard}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Показать ответ</span>
            </button>
          </div>
        </div>
      ) : (
        /* Действия для открытой карточки (isFlipped) */
        <div className="space-y-2.5 animate-in fade-in">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNextWord(1)}
              className="py-3 sm:py-3.5 px-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-2 border-rose-400/80 dark:border-rose-700 font-extrabold text-sm sm:text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
              title="Забыл (повторить скоро)"
            >
              <span>Забыл</span>
            </button>

            <button
              type="button"
              onClick={() => onNextWord(3)}
              className="py-3 sm:py-3.5 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-2 border-amber-400/80 dark:border-amber-700 font-extrabold text-sm sm:text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
              title="С трудом"
            >
              <span>С трудом</span>
            </button>

            <button
              type="button"
              onClick={() => onNextWord(5)}
              className="py-3 sm:py-3.5 px-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400/80 dark:border-emerald-700 font-extrabold text-sm sm:text-base shadow-sm transition active:scale-95 flex flex-col items-center justify-center cursor-pointer"
              title="Легко"
            >
              <span>Легко</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 px-1">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={onPrevWord}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition inline-flex items-center gap-1 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              title="Предыдущее слово"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>

            <button
              type="button"
              onClick={onFlipCard}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {cardDirection === 'ru-he'
                  ? 'Скрыть иврит'
                  : 'Перевернуть обратно'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Шторка лингвистической подсказки */}
      <LinguisticTipDrawer
        isOpen={isTipOpen}
        onClose={() => setIsTipOpen(false)}
        tip={tip}
        userProfile={userProfile}
      />
    </div>
  );
};
