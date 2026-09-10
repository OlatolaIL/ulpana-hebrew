import React from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, Check, BookmarkPlus } from 'lucide-react';
import { UserProfile, PhoneScenario, Word } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict } from '@/lib/storage';

interface CallDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: PhoneScenario;
  userProfile: UserProfile;
  lessonId: number;
  addedWords: Record<string, boolean>;
  onAddWord: (w: Word) => void;
  mounted: boolean;
}

export const CallDrawer: React.FC<CallDrawerProps> = ({
  isOpen,
  onClose,
  scenario,
  userProfile,
  lessonId,
  addedWords,
  onAddWord,
  mounted,
}) => {
  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
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
              <h3 className="font-bold text-sm sm:base text-zinc-900 dark:text-zinc-50 truncate">
                {userProfile.ulpanMode ? 'מִילִּים לַשִּׂיחָה' : 'Полезные фразы'}
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {userProfile.ulpanMode ? 'מִילִּים וּבִיטּוּיִים שֶׁיַּעַזְרוּ לָכֶם' : 'Шпаргалка и подсказки к звонку'}
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

        {/* Контент шторки: список фраз с независимым скроллом */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {scenario.usefulWords && scenario.usefulWords.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  {userProfile.ulpanMode ? 'מִילִּים וּבִיטּוּיִים:' : 'Слова и выражения:'}
                </p>
                <span className="text-[11px] text-zinc-400">
                  {scenario.usefulWords.length} шт.
                </span>
              </div>

              {scenario.usefulWords.map((word, idx) => {
                const isAdded =
                  addedWords[word.hebrew] ||
                  isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                const isCursive = userProfile.fontStyle === 'cursive';
                return (
                  <div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-600 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          dir="rtl"
                          className={`font-hebrew font-bold text-lg text-zinc-900 dark:text-zinc-50 ${
                            isCursive ? 'font-cursive text-xl text-blue-600 dark:text-blue-400' : ''
                          }`}
                        >
                          {userProfile.showNikkud ? word.hebrew : stripNikkud(word.hebrew)}
                        </span>
                        {word.isNew && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-hebrew shrink-0">
                            {userProfile.ulpanMode ? 'חָדָשׁ' : 'Новое'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 })
                          }
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                          title="Озвучить"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() =>
                            onAddWord({
                              id: `phone-sc-w-${idx}`,
                              hebrew: word.hebrew,
                              hebrewPlain: stripNikkud(word.hebrew),
                              transcription: word.transcription,
                              translation: word.translation,
                              partOfSpeech: 'expression',
                              lessonId,
                              isUserAdded: true,
                              dateAdded: Date.now(),
                            })
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-zinc-200 hover:bg-amber-500 hover:text-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          }`}
                          title={isAdded ? 'В словаре' : 'В личный словарь'}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{userProfile.ulpanMode ? 'בַּמִּילוֹן' : 'В словаре'}</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>{userProfile.ulpanMode ? 'לַמִּילוֹן' : 'В словарь'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {!userProfile.ulpanMode && userProfile.showTranscription && word.transcription && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                        [{word.transcription}]
                      </div>
                    )}

                    {!userProfile.ulpanMode && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-300">
                        {word.translation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-8">
              {userProfile.ulpanMode
                ? 'אֵין מִילִּים נוֹסָפוֹת לְשִׂיחָה זוֹ'
                : 'К этому сценарию нет дополнительных фраз'}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
