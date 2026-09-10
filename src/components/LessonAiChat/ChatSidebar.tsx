import React from 'react';
import { Sparkles, Volume2, BookmarkPlus, Check } from 'lucide-react';
import { Lesson, UserProfile, DialogueStep, DialogueWord } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict } from '@/lib/storage';

interface ChatSidebarProps {
  lesson: Lesson;
  userProfile: UserProfile;
  activeStep?: DialogueStep;
  stepsCount: number;
  addedWords: Record<string, boolean>;
  onAppendWord: (wordHebrew: string) => void;
  onAddWordDirectly: (wordItem: DialogueWord) => void;
  onSpeak: (text: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  lesson,
  userProfile,
  activeStep,
  stepsCount,
  addedWords,
  onAppendWord,
  onAddWordDirectly,
  onSpeak,
}) => {
  return (
    <div className="hidden lg:flex flex-col w-[320px] xl:w-[340px] shrink-0 h-full min-h-0 bg-zinc-50/70 dark:bg-zinc-900/90 overflow-hidden">
      {/* Шапка боковой панели */}
      <div className="h-12 px-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100 font-hebrew">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{userProfile.ulpanMode ? 'שִׁלְדַּת הַשִּׂיחָה וּמִילּוֹן' : 'Шпаргалка к диалогу'}</span>
        </div>
        {lesson.dialogue.usefulWords && (
          <span className="text-[10px] text-zinc-400 font-medium">
            {lesson.dialogue.usefulWords.length} слов
          </span>
        )}
      </div>

      {/* Скроллируемое тело боковой панели */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* 1. Карточка текущего факта (Fact First) */}
        {activeStep && (
          <div className="bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-3 shadow-2xs font-hebrew">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
              <span>📌</span>
              <span>
                {userProfile.ulpanMode ? `שָׁלָב ${activeStep.stepIndex}:` : `Шаг ${activeStep.stepIndex} из ${stepsCount}`}
              </span>
            </div>
            <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
              {activeStep.fact}
            </p>
          </div>
        )}

        {/* 2. Словарь диалога */}
        {lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-0.5 font-hebrew">
              {userProfile.ulpanMode ? 'מִילִּים שֶׁיַּעַזְרוּ לָכֶם:' : 'Слова для ответа:'}
            </p>
            <div className="space-y-1.5">
              {lesson.dialogue.usefulWords.map((word, idx) => {
                const isAdded =
                  addedWords[word.hebrew] ||
                  isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                return (
                  <div
                    key={idx}
                    onClick={() => onAppendWord(word.hebrew)}
                    className="group cursor-pointer bg-white dark:bg-zinc-800/90 hover:bg-blue-50/60 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs transition active:scale-[0.99]"
                    title="Нажмите, чтобы вставить в поле ответа"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          dir="rtl"
                          className="font-hebrew font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition"
                        >
                          {userProfile.showNikkud ? word.hebrew : stripNikkud(word.hebrew)}
                        </span>
                        {word.isNew && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
                            {userProfile.ulpanMode ? 'חָדָשׁ' : 'Новое'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {!userProfile.ulpanMode && word.transcription && (
                          <span className="text-blue-500 mr-1">[{word.transcription}]</span>
                        )}
                        <span>{word.translation}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpeak(word.hebrew);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                        title="Озвучить"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isAdded}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddWordDirectly(word);
                        }}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-0.5 ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-zinc-100 hover:bg-amber-500 hover:text-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                        }`}
                        title={isAdded ? 'В словаре' : 'В словарик'}
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <BookmarkPlus className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
