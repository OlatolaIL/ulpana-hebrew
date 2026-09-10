import React from 'react';
import {
  Bot,
  User as UserIcon,
  Volume2,
  Sparkles,
  AlertCircle,
  BookmarkPlus,
  Check,
  Target,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ChatMessage, UserProfile, DialogueWord } from '@/types';
import { tokenizeText, TextToken, stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict } from '@/lib/storage';

interface ChatMessageItemProps {
  msg: ChatMessage;
  isLastMessage: boolean;
  lastMessageRef?: React.Ref<HTMLDivElement>;
  userProfile: UserProfile;
  isTranslationRevealed: boolean;
  addedWords: Record<string, boolean>;
  onToggleTranslation: (msgId: string) => void;
  onWordClick: (token: TextToken, fullSentence: string) => void;
  onSpeak: (text: string) => void;
  onAddWordDirectly: (wordItem: DialogueWord) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  msg,
  isLastMessage,
  lastMessageRef,
  userProfile,
  isTranslationRevealed,
  addedWords,
  onToggleTranslation,
  onWordClick,
  onSpeak,
  onAddWordDirectly,
}) => {
  const isAi = msg.role === 'assistant';
  const tokens = tokenizeText(msg.hebrew);
  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <React.Fragment>
      {/* Карточка новой ситуации прямо в ленте сообщений (Audio-First, без блокирующих окон) */}
      {msg.stepFact && (
        <div className="my-2 mx-auto max-w-[96%] sm:max-w-md bg-blue-50/90 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800/80 rounded-2xl p-3 sm:p-3.5 shadow-xs text-xs text-blue-950 dark:text-blue-100 flex items-start gap-2.5">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="font-bold text-blue-700 dark:text-blue-300 block uppercase tracking-wider text-[10px]">
              {userProfile.ulpanMode
                ? msg.stepIndex === 1
                  ? 'שָׁלָב 1: הַתְחָלַת הַשִּׂיחָה'
                  : `שָׁלָב ${msg.stepIndex || 2}: הַמַּצָּב הִשְׁתַּנָּה!`
                : msg.stepIndex === 1
                ? 'Шаг 1 из 3: Начало диалога'
                : `Шаг ${msg.stepIndex || 2} из 3: Ситуация изменилась!`}
            </span>
            <p className="leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal">
              {msg.stepFact}
            </p>
          </div>
        </div>
      )}

      <div
        ref={isLastMessage ? lastMessageRef : null}
        className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
      >
        <div className="flex items-end gap-1.5 sm:gap-2 max-w-[92%] sm:max-w-[85%]">
          {isAi && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}

          <div
            className={`p-3 sm:p-3.5 rounded-2xl shadow-sm ${
              isAi
                ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                : 'bg-blue-600 text-white rounded-br-sm'
            }`}
          >
            {/* Текст на иврите с учетом настройки showNikkud */}
            <div
              dir="rtl"
              className={`font-bold leading-relaxed text-right ${
                isCursive
                  ? 'font-cursive text-xl sm:text-2xl text-blue-600 dark:text-blue-400'
                  : 'font-hebrew text-lg sm:text-xl'
              }`}
            >
              {tokens.map((token) => {
                const displayWord = userProfile.showNikkud
                  ? token.text
                  : stripNikkud(token.text);

                if (token.isHebrew) {
                  return (
                    <span
                      key={token.id}
                      onClick={() => onWordClick(token, msg.hebrew)}
                      className={`inline-block px-1 py-0.5 rounded-md transition cursor-pointer select-text ${
                        isAi
                          ? 'hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:bg-blue-100/70 dark:hover:bg-blue-900/50 active:scale-95'
                          : 'hover:text-yellow-200 hover:underline hover:bg-blue-700/60 active:scale-95'
                      }`}
                      title="Нажмите для перевода и словарика"
                    >
                      {displayWord}
                    </span>
                  );
                }
                return <span key={token.id}>{token.text}</span>;
              })}
            </div>

            {/* Перевод и транскрипция для реплик ИИ (Audio-First: скрыты до клика) */}
            {isAi ? (
              <div>
                {!userProfile.ulpanMode && isTranslationRevealed && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 space-y-1 text-xs animate-in fade-in duration-150">
                    {userProfile.showTranscription && msg.transcription && (
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        [{msg.transcription}]
                      </p>
                    )}
                    {msg.translation && (
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {msg.translation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!userProfile.ulpanMode && userProfile.showTranscription && msg.transcription && (
                  <p className="text-xs text-blue-100 font-medium mt-1">
                    [{msg.transcription}]
                  </p>
                )}
                {!userProfile.ulpanMode && msg.translation && (
                  <p className="text-xs text-blue-100/90 mt-1">
                    {msg.translation}
                  </p>
                )}
              </div>
            )}

            {/* Карточки новых/полезных слов этой реплики */}
            {isAi && msg.newWords && msg.newWords.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/70 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-2 font-hebrew">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{userProfile.ulpanMode ? 'מִילִּים חֲדָשׁוֹת:' : 'Новые слова в реплике:'}</span>
                </div>
                <div className="space-y-1">
                  {msg.newWords.map((nw, nwIdx) => {
                    const isAdded =
                      addedWords[nw.hebrew] ||
                      isWordInPersonalDict(nw.hebrew, userProfile.personalVocabulary);
                    return (
                      <div
                        key={nwIdx}
                        className="flex items-center justify-between gap-1.5 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/30 text-xs shadow-2xs"
                      >
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span dir="rtl" className="font-hebrew font-bold text-zinc-900 dark:text-zinc-100">
                            {userProfile.showNikkud ? nw.hebrew : stripNikkud(nw.hebrew)}
                          </span>
                          {!userProfile.ulpanMode && nw.transcription && (
                            <span className="text-[10px] text-blue-500">[{nw.transcription}]</span>
                          )}
                          <span className="text-zinc-600 dark:text-zinc-300 text-[11px] truncate">
                            — {nw.translation}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSpeak(nw.hebrew)}
                            className="p-1 text-zinc-400 hover:text-blue-500 rounded cursor-pointer"
                            title="Озвучить"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={isAdded}
                            onClick={() => onAddWordDirectly(nw)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer flex items-center gap-0.5 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-2.5 h-2.5" />
                                <span>{userProfile.ulpanMode ? 'בַּמִּילּוֹן' : 'В словаре'}</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-2.5 h-2.5" />
                                <span>{userProfile.ulpanMode ? 'הוֹסֵף' : '+ В словарик'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Нижняя панель сообщения: бейдж движка, раскрытие перевода и озвучка */}
            {isAi ? (
              <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                {msg.engine ? (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{msg.engine}</span>
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2.5 shrink-0">
                  {!userProfile.ulpanMode && msg.translation && (
                    <button
                      type="button"
                      onClick={() => onToggleTranslation(msg.id)}
                      className={`text-xs flex items-center gap-1 transition cursor-pointer px-1.5 py-0.5 rounded-md ${
                        isTranslationRevealed
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      title={isTranslationRevealed ? 'Скрыть русский перевод' : 'Показать русский перевод'}
                    >
                      {isTranslationRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isTranslationRevealed ? 'Скрыть' : 'Перевод'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSpeak(msg.hebrew)}
                    className="text-xs text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition shrink-0 cursor-pointer"
                    title="Прослушать фразу"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{userProfile.ulpanMode ? 'שמע' : 'Прослушать'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 pt-1.5 border-t border-blue-500/40 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSpeak(msg.hebrew)}
                  className="text-[11px] text-blue-100 hover:text-white flex items-center gap-1 transition shrink-0 cursor-pointer"
                  title="Прослушать вашу фразу"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{userProfile.ulpanMode ? 'שמע' : 'Прослушать'}</span>
                </button>
              </div>
            )}
          </div>

          {!isAi && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}
        </div>

        {/* Обратная связь от ИИ по грамматике */}
        {msg.feedback && (
          <div className="ml-8 sm:ml-10 max-w-[85%] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2 sm:p-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">{userProfile.ulpanMode ? 'מִשׁוּב / תִּיקּוּן: ' : 'Пояснение: '}</span>
              <span>{msg.feedback}</span>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
