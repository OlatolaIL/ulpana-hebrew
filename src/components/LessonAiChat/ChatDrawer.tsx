import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Lightbulb, X, Volume2, BookmarkPlus, Check } from 'lucide-react';
import { Lesson, UserProfile, ChatMessage, DialogueWord } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict } from '@/lib/storage';

interface ChatDrawerProps {
  isOpen: boolean;
  onOpen: (tab: 'words' | 'replies') => void;
  onClose: () => void;
  lesson: Lesson;
  userProfile: UserProfile;
  lastAiMessage?: ChatMessage;
  isDialogueFinished: boolean;
  drawerTab: 'words' | 'replies';
  setDrawerTab: (tab: 'words' | 'replies') => void;
  addedWords: Record<string, boolean>;
  onAddWordDirectly: (wordItem: DialogueWord) => void;
  onSelectReply: (hebrew: string) => void;
  onSpeak: (text: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onOpen,
  onClose,
  lesson,
  userProfile,
  lastAiMessage,
  isDialogueFinished,
  drawerTab,
  setDrawerTab,
  addedWords,
  onAddWordDirectly,
  onSelectReply,
  onSpeak,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCursive = userProfile.fontStyle === 'cursive';
  const hasUsefulWords = Boolean(lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0);
  const hasReplies = Boolean(
    lastAiMessage?.suggestedReplies &&
    lastAiMessage.suggestedReplies.length > 0 &&
    !isDialogueFinished
  );

  return (
    <>
      {/* БОКОВОЙ ЯРЛЫЧОК ШТОРКИ (Floating Drawer Tab справа) - всегда на виду на мобильных */}
      {hasUsefulWords && (
        <button
          type="button"
          onClick={() => onOpen('words')}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl rounded-l-2xl py-3 px-1.5 sm:px-2 flex flex-col items-center gap-1.5 cursor-pointer border-y border-l border-blue-400/60 lg:hidden group transition-all"
          title="Открыть боковую шторку со словами"
        >
          <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase [writing-mode:vertical-rl] tracking-widest text-blue-100">
            {userProfile.ulpanMode ? 'מִילִּים' : 'СЛОВА'}
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center shadow-xs">
            {lesson.dialogue.usefulWords!.length}
          </span>
        </button>
      )}

      {/* БОКОВАЯ ШТОРКА (SIDE DRAWER СПРАВА) ЧЕРЕЗ CREATEPORTAL */}
      {mounted && isOpen && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Затемнение фона (Backdrop) */}
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
                      {userProfile.ulpanMode ? 'שִׁלְדַּת הַשִּׂיחָה' : 'Подсказки к шагу'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {userProfile.ulpanMode ? 'מִילִּים וּדֻּגְמָאוֹת' : 'Слова шага и готовые примеры'}
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

              {/* Вкладки внутри шторки: Слова / Варианты */}
              {hasReplies && (
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-3 pt-2 gap-2 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('words')}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      drawerTab === 'words'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{userProfile.ulpanMode ? 'מִילִּים' : 'Слова шага'}</span>
                    {lesson.dialogue.usefulWords && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                        {lesson.dialogue.usefulWords.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerTab('replies')}
                    className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                      drawerTab === 'replies'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>{userProfile.ulpanMode ? 'דֻּגְמָאוֹת' : 'Варианты'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {lastAiMessage!.suggestedReplies!.length}
                    </span>
                  </button>
                </div>
              )}

              {/* Контент шторки с независимым скроллом */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
                {drawerTab === 'words' ? (
                  /* Список слов */
                  lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0 ? (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-0.5">
                        {userProfile.ulpanMode ? 'מִילִּים לַתְּשׁוּבָה:' : 'Слова для ответа:'}
                      </p>
                      {lesson.dialogue.usefulWords.map((word, idx) => {
                        const isAdded =
                          addedWords[word.hebrew] ||
                          isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
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
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
                                    {userProfile.ulpanMode ? 'חָדָשׁ' : 'Новое'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onSpeak(word.hebrew)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                                  title="Озвучить"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  disabled={isAdded}
                                  onClick={() => onAddWordDirectly(word)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    isAdded
                                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                      : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-700'
                                  }`}
                                  title={isAdded ? 'В словаре' : 'В личный словарь'}
                                >
                                  {isAdded ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <BookmarkPlus className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm leading-snug flex items-baseline gap-1.5 flex-wrap">
                              {!userProfile.ulpanMode && word.transcription && (
                                <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                                  [{word.transcription}]
                                </span>
                              )}
                              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                                {word.translation}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 text-center py-8">
                      {userProfile.ulpanMode
                        ? 'אֵין מִילִּים נוֹסָפוֹת'
                        : 'Для этого шага нет дополнительных слов'}
                    </p>
                  )
                ) : (
                  /* Список вариантов ответов */
                  lastAiMessage?.suggestedReplies && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-0.5">
                        {userProfile.ulpanMode ? 'דֻּגְמָאוֹת לַתְּשׁוּבָה:' : 'Готовые варианты ответа:'}
                      </p>
                      {lastAiMessage.suggestedReplies.map((reply, rIdx) => (
                        <div
                          key={rIdx}
                          className="bg-white dark:bg-zinc-800/90 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl p-3 flex flex-col gap-2 shadow-2xs hover:border-indigo-400 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p
                              dir="rtl"
                              className="font-hebrew font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed text-right flex-1"
                            >
                              {reply.hebrew}
                            </p>
                            <button
                              type="button"
                              onClick={() => onSpeak(reply.hebrew)}
                              className="p-1 rounded-md text-zinc-400 hover:text-blue-600 transition cursor-pointer shrink-0"
                              title="Озвучить"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {reply.translation && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {reply.translation}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectReply(reply.hebrew)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                          >
                            <span>Использовать эту фразу</span>
                            <span>↵</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>

              {/* Подвал шторки с кнопкой Закрыть */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition cursor-pointer active:scale-98 border border-zinc-200 dark:border-zinc-700"
                >
                  {userProfile.ulpanMode ? 'סְגִירָה' : 'Закрыть подсказки'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
