import React from 'react';
import {
  CheckCircle2,
  Plus,
  Check,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { UserProfile, PhoneScenario, ChatMessage, Word, PhoneDebriefReport } from '@/types';
import { isWordInPersonalDict } from '@/lib/storage';

interface CallDebriefViewProps {
  scenario: PhoneScenario;
  userProfile: UserProfile;
  callDuration: number;
  formatTimer: (seconds: number) => string;
  messages: ChatMessage[];
  relevantWords: Word[];
  addedWords: Record<string, boolean>;
  onAddWord: (w: Word) => void;
  debriefReport: PhoneDebriefReport | null;
  onOpenDialogueReview: () => void;
  onStartCall: () => void;
  onBackToLesson?: () => void;
}

export const CallDebriefView: React.FC<CallDebriefViewProps> = ({
  scenario,
  userProfile,
  callDuration,
  formatTimer,
  messages,
  relevantWords,
  addedWords,
  onAddWord,
  debriefReport,
  onOpenDialogueReview,
  onStartCall,
  onBackToLesson,
}) => {
  const userTurnsCount = messages.filter((m) => m.role === 'user').length;
  const isCallSuccessful = userTurnsCount >= 2;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* Заголовок звонка: успех или предупреждение о несостоявшемся разговоре */}
      {isCallSuccessful ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
            🎉
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            Разговор завершен!
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-hebrew">
            Отличная тренировка телефонного иврита
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
            📞
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            Разговор был слишком коротким
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto font-hebrew">
            Собеседник не услышал ваших реплик (0 ответов). Чтобы урок был засчитан, произнесите ответ вслух или нажмите на подсказку.
          </p>
        </div>
      )}

      {/* Метрики звонка */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-hebrew">
        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="text-xs text-zinc-400 block font-medium">
            Длительность
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatTimer(callDuration)}
          </span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center">
          <span className="text-xs text-zinc-400 block font-medium">
            Реплик сказано
          </span>
          <span className={`text-lg font-bold ${userTurnsCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500'}`}>
            {userTurnsCount}
          </span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center col-span-2 sm:col-span-1">
          <span className="text-xs text-zinc-400 block font-medium">
            Результат
          </span>
          <span className={`text-lg font-bold ${isCallSuccessful ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
            {isCallSuccessful ? '100% 🏆' : 'Требуется диалог'}
          </span>
        </div>
      </div>

      {/* Чек-лист целей */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 font-hebrew">
        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Цели сценария:</span>
        </h4>
        <ul className="space-y-2">
          {scenario.goals.map((goal, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                ✓
              </div>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Слова из урока для сохранения в личный словарик */}
      {relevantWords.length > 0 && (
        <div className="space-y-2 font-hebrew">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Полезные слова из этого звонка:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relevantWords.map((word) => {
              const isAdded =
                addedWords[word.hebrew] ||
                isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
              return (
                <div
                  key={word.id || word.hebrew}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 font-hebrew truncate text-sm">
                      {word.hebrew}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {word.translation}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddWord(word)}
                    disabled={isAdded}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition ${
                      isAdded
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                    title={
                      isAdded
                        ? 'Слово уже в словаре'
                        : 'Добавить в словарь'
                    }
                  >
                    {isAdded ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[11px]">В словарь</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Индикаторы произношения и грамматики */}
      {debriefReport && (
        <div className="grid grid-cols-3 gap-2 font-hebrew">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center shadow-2xs">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-semibold">
              🎯 Итог
            </span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-800 dark:text-emerald-200 font-mono">
              {debriefReport.overallScore}%
            </span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-2xl border border-blue-200 dark:border-blue-800/60 text-center shadow-2xs">
            <span className="text-[11px] text-blue-700 dark:text-blue-300 block font-semibold">
              🎙️ Произношение
            </span>
            <span className="text-base sm:text-lg font-extrabold text-blue-800 dark:text-blue-200 font-mono">
              {debriefReport.pronunciationScore ?? 92}%
            </span>
          </div>
          <div
            className={`p-2.5 rounded-2xl border text-center shadow-2xs ${
              (debriefReport.grammarScore ?? 95) >= 85
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200'
            }`}
          >
            <span className="text-[11px] block font-semibold">
              📚 Грамматика
            </span>
            <span className="text-base sm:text-lg font-extrabold font-mono">
              {debriefReport.grammarScore ?? 95}%
            </span>
          </div>
        </div>
      )}

      {/* Кнопка открытия полного разбора диалога с комментариями учителя */}
      <button
        type="button"
        onClick={onOpenDialogueReview}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer font-hebrew"
      >
        <MessageSquare className="w-5 h-5 text-blue-100" />
        <span>
          Посмотреть полный диалог и комментарии учителя 💬
        </span>
      </button>

      {/* Кнопки действий */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2 font-hebrew">
        <button
          onClick={onStartCall}
          className="flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Позвонить еще раз</span>
        </button>

        {onBackToLesson && (
          <button
            onClick={onBackToLesson}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
          >
            <span>Вернуться к уроку</span>
          </button>
        )}
      </div>
    </div>
  );
};
