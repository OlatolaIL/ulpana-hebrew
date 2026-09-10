import React from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, Check, Plus, BookOpen } from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { speakHebrew } from '@/lib/speech';
import { isWordInPersonalDict } from '@/lib/storage';

interface DialogueWordsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  userProfile: UserProfile;
  lessonNumber: number;
  dialogueUsefulWords: Word[];
  lessonVocabularyWords: Word[];
  customLessonWords?: Word[];
  totalAvailableWordsCount: number;
  addedWords: Record<string, boolean>;
  onAddWordToDict: (w: Word) => void;
  showNikkud: boolean;
  showTranscription: boolean;
  speechRate: number;
  mounted: boolean;
}

export const DialogueWordsDrawer: React.FC<DialogueWordsDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  userProfile,
  lessonNumber,
  dialogueUsefulWords,
  lessonVocabularyWords,
  customLessonWords = [],
  totalAvailableWordsCount,
  addedWords,
  onAddWordToDict,
  showNikkud,
  showTranscription,
  speechRate,
  mounted,
}) => {
  const renderWordItem = (word: Word, key: string, isDialogueHighlight?: boolean) => {
    const isAdded =
      addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
    const isCursive = userProfile.fontStyle === 'cursive';

    return (
      <div
        key={key}
        className={`rounded-2xl p-3 shadow-2xs transition space-y-1.5 border ${
          isDialogueHighlight
            ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400'
            : 'bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-600'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              dir="rtl"
              className={`font-hebrew font-bold text-lg text-zinc-900 dark:text-zinc-50 ${
                isCursive ? 'font-cursive text-xl text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {showNikkud ? word.hebrew : stripNikkud(word.hebrew)}
            </span>
            {isDialogueHighlight && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                К диалогу
              </span>
            )}
            {word.partOfSpeech === 'expression' && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25 shrink-0">
                Разговорное
              </span>
            )}
            {word.gender && (
              <span className="text-[10px] text-zinc-400 font-mono">
                ({word.gender === 'm' ? 'ז' : 'נ'})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => speakHebrew(word.hebrew, { rate: speechRate })}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
              title="Озвучить слово"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isAdded}
              onClick={() => onAddWordToDict(word)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                isAdded
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-blue-500 hover:text-blue-600 cursor-pointer shadow-2xs'
              }`}
              title={isAdded ? 'Слово уже в вашем личном словаре' : 'Добавить слово в личный словарь для карточек'}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>В словаре</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>В словарь</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showTranscription && word.transcription && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {word.transcription}
          </div>
        )}

        <div className="text-xs text-zinc-700 dark:text-zinc-300 font-normal">
          {word.translation}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Боковой ярлычок шторки справа */}
      {totalAvailableWordsCount > 0 && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl rounded-l-2xl py-3 px-1.5 sm:px-2 flex flex-col items-center gap-1.5 cursor-pointer border-y border-l border-blue-400/60 transition-all group font-hebrew"
          title="Полезные слова и подсказки к диалогу"
        >
          <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase [writing-mode:vertical-rl] tracking-widest text-blue-100">
            СЛОВА
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center shadow-xs">
            {totalAvailableWordsCount}
          </span>
        </button>
      )}

      {/* Выдвижная боковая шторка через createPortal */}
      {mounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer"
            onClick={onClose}
          />

          {/* Панель шторки */}
          <div
            className="relative z-10 w-[88vw] max-w-sm sm:max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 font-hebrew"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка шторки */}
            <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">📖</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 truncate">
                    Словарь к диалогу
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    Полезные выражения и слова урока {lessonNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Контент шторки: список фраз и слов с независимым скроллом */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {/* Секция 1: Новые и полезные выражения диалога */}
              {dialogueUsefulWords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Новые и ключевые выражения:</span>
                    </p>
                    <span className="text-[10px] text-zinc-400">{dialogueUsefulWords.length} шт.</span>
                  </div>

                  <div className="space-y-2">
                    {dialogueUsefulWords.map((word, idx) =>
                      renderWordItem(word, `dial-w-${idx}`, true)
                    )}
                  </div>
                </div>
              )}

              {/* Секция 2: Добавленные пользователем слова в словарь этого урока */}
              {customLessonWords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👑</span>
                      <span>Добавлено вами в словарь:</span>
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
                      {customLessonWords.length} шт.
                    </span>
                  </div>

                  <div className="space-y-2">
                    {customLessonWords.map((word, idx) =>
                      renderWordItem(word, `custom-w-${idx}`, false)
                    )}
                  </div>
                </div>
              )}

              {/* Секция 3: Слова урока */}
              {lessonVocabularyWords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📚</span>
                      <span>Слова урока {lessonNumber}:</span>
                    </p>
                    <span className="text-[10px] text-zinc-400">{lessonVocabularyWords.length} шт.</span>
                  </div>

                  <div className="space-y-2">
                    {lessonVocabularyWords.map((word, idx) =>
                      renderWordItem(word, `lesson-w-${idx}`, false)
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
