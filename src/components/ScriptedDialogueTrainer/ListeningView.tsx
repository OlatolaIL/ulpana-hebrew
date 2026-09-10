import React from 'react';
import { Volume2, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { ScriptedDialogue, ScriptedDialogueTurn, GenderVariant, DialogueParticipant } from '@/types';
import { stripNikkud } from '@/lib/transcription';

interface ListeningViewProps {
  dialogue: ScriptedDialogue;
  characterA: DialogueParticipant;
  characterB: DialogueParticipant;
  getTurnText: (turn: ScriptedDialogueTurn) => GenderVariant;
  handlePlayTurn: (turn: ScriptedDialogueTurn) => void;
  isPlayingAll: boolean;
  activeListeningTurnIndex: number | null;
  turnsScrollRef: React.RefObject<HTMLDivElement | null>;
  showNikkud: boolean;
  showTranscription: boolean;
  setShowTranscription: React.Dispatch<React.SetStateAction<boolean>>;
  showTranslation: boolean;
  setShowTranslation: React.Dispatch<React.SetStateAction<boolean>>;
  totalAvailableWordsCount: number;
  onOpenWordsDrawer: () => void;
  onCompleteListenStage: () => void;
  onSelectRole: () => void;
}

export const ListeningView: React.FC<ListeningViewProps> = ({
  dialogue,
  characterA,
  characterB,
  getTurnText,
  handlePlayTurn,
  isPlayingAll,
  activeListeningTurnIndex,
  turnsScrollRef,
  showNikkud,
  showTranscription,
  setShowTranscription,
  showTranslation,
  setShowTranslation,
  totalAvailableWordsCount,
  onOpenWordsDrawer,
  onCompleteListenStage,
  onSelectRole,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Список реплик диалога в стиле чата */}
      <div
        ref={turnsScrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5"
      >
        {dialogue.turns.map((turn, idx) => {
          const isSpeakerA = turn.speaker === 'a';
          const variant = getTurnText(turn);
          const isTurnActive = isPlayingAll && activeListeningTurnIndex === idx;
          const character = isSpeakerA ? characterA : characterB;

          return (
            <div
              key={turn.id}
              id={`listen-turn-${idx}`}
              className={`flex gap-2.5 sm:gap-3 transition-all duration-300 ${
                isSpeakerA ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Аватар персонажа */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs ${
                  isSpeakerA
                    ? 'bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900'
                    : 'bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900'
                }`}
                title={`${character.nameRu} (${character.roleRu})`}
              >
                {character.avatarEmoji}
              </div>

              {/* Пузырь сообщения */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 sm:p-3.5 transition-all shadow-xs ${
                  isTurnActive
                    ? 'ring-2 ring-blue-500 shadow-md scale-[1.01] bg-blue-50/90 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700'
                    : isSpeakerA
                    ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60'
                }`}
              >
                {/* Имя и роль спикера */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {character.nameRu}{' '}
                    <span className="text-[11px] font-normal text-zinc-400">
                      ({character.roleRu})
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePlayTurn(turn)}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-600 transition cursor-pointer"
                    title="Прослушать фразу"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Текст на иврите */}
                <div
                  dir="rtl"
                  className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed mb-1"
                >
                  {showNikkud ? variant.hebrew : stripNikkud(variant.hebrew)}
                </div>

                {/* Транскрипция */}
                {showTranscription && (
                  <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium tracking-wide mb-1">
                    {variant.transcription}
                  </div>
                )}

                {/* Перевод */}
                {showTranslation && (
                  <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                    {variant.translation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Нижняя панель действий: переключатели отображения, словарь и кнопка перехода к роли */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => setShowTranscription(!showTranscription)}
            className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
              showTranscription
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            Транскрипция
          </button>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
              showTranslation
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            }`}
          >
            Перевод
          </button>

          {totalAvailableWordsCount > 0 && (
            <button
              type="button"
              onClick={onOpenWordsDrawer}
              className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
              title="Шпаргалка слов к диалогу"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Слова ({totalAvailableWordsCount})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onCompleteListenStage}
            className="px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Отметить диалог пройденным и перейти к следующему этапу (Звонок)"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Зачесть этап и</span>
            <span>к Звонку →</span>
          </button>

          <button
            type="button"
            onClick={onSelectRole}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <span>Ответить по ролям (голос)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
