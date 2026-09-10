import React from 'react';
import { Play, Pause, Info, BookOpen, X } from 'lucide-react';
import { ScriptedDialogue, UserProfile } from '@/types';
import { TrainerMode } from './types';

interface DialogueHeaderProps {
  dialogue: ScriptedDialogue;
  userProfile: UserProfile;
  mode: TrainerMode;
  showSituationModal: boolean;
  setShowSituationModal: React.Dispatch<React.SetStateAction<boolean>>;
  totalAvailableWordsCount: number;
  onOpenWordsDrawer: () => void;
  isPlayingAll: boolean;
  onTogglePlayAll: () => void;
  opponentGender: 'male' | 'female';
  setOpponentGender: (gender: 'male' | 'female') => void;
  userGender: 'male' | 'female';
  setUserGender: (gender: 'male' | 'female') => void;
  onUpdateProfile?: (profile: UserProfile) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
}

export const DialogueHeader: React.FC<DialogueHeaderProps> = ({
  dialogue,
  userProfile,
  mode,
  showSituationModal,
  setShowSituationModal,
  totalAvailableWordsCount,
  onOpenWordsDrawer,
  isPlayingAll,
  onTogglePlayAll,
  opponentGender,
  setOpponentGender,
  userGender,
  setUserGender,
  onUpdateProfile,
  speechRate,
  setSpeechRate,
}) => {
  return (
    <>
      <div className="shrink-0 p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        {/* Заголовок диалога и кнопка информации о ситуации */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            💬
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                {dialogue.titleRu}
              </h3>
              <button
                type="button"
                onClick={() => setShowSituationModal(!showSituationModal)}
                className={`p-1 rounded-lg transition shrink-0 cursor-pointer ${
                  showSituationModal
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title={showSituationModal ? 'Скрыть контекст ситуации' : 'Показать контекст ситуации'}
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Кнопка открытия шторки словаря */}
              {totalAvailableWordsCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenWordsDrawer}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                  title="Открыть шторку полезных слов и выражений"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Слова</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                    {totalAvailableWordsCount}
                  </span>
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate font-hebrew" dir="rtl">
              {dialogue.titleHe}
            </p>
          </div>
        </div>

        {/* Управление и переключатели */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Быстрый запуск прослушивания в шапке */}
          {mode === 'listen' && (
            <button
              type="button"
              onClick={onTogglePlayAll}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
                isPlayingAll
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={isPlayingAll ? 'Приостановить' : 'Слушать все реплики'}
            >
              {isPlayingAll ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Слушать всё</span>
                </>
              )}
            </button>
          )}

          {/* Пол собеседника */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs">
            <span className="text-[11px] text-zinc-400 px-1.5 hidden sm:inline">Собеседник:</span>
            <button
              type="button"
              onClick={() => setOpponentGender('male')}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                opponentGender === 'male'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Собеседник-мужчина"
            >
              <span>👨</span>
              <span className="hidden md:inline">Мужчина</span>
            </button>
            <button
              type="button"
              onClick={() => setOpponentGender('female')}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                opponentGender === 'female'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Собеседница-женщина"
            >
              <span>👩</span>
              <span className="hidden md:inline">Женщина</span>
            </button>
          </div>

          {/* Пол ученика */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs">
            <span className="text-[11px] text-zinc-400 px-1.5 hidden sm:inline">Вы:</span>
            <button
              type="button"
              onClick={() => {
                setUserGender('male');
                if (onUpdateProfile) onUpdateProfile({ ...userProfile, gender: 'male' });
              }}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                userGender === 'male'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Вы говорите за мужчину"
            >
              <span>זָכָר</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserGender('female');
                if (onUpdateProfile) onUpdateProfile({ ...userProfile, gender: 'female' });
              }}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                userGender === 'female'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Вы говорите за женщину"
            >
              <span>נְקֵבָה</span>
            </button>
          </div>

          {/* Скорость озвучки */}
          <button
            type="button"
            onClick={() => {
              const nextRate = speechRate === 0.7 ? 0.85 : speechRate === 0.85 ? 1.0 : 0.7;
              setSpeechRate(nextRate);
            }}
            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Скорость речи"
          >
            {speechRate}x
          </button>
        </div>
      </div>

      {/* Баннер ситуации (показывается только по нажатию на ℹ️) */}
      {showSituationModal && (
        <div className="p-2.5 px-3 bg-blue-50/90 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-800/70 flex items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold shrink-0">Ситуация:</span>
            <span className="truncate sm:whitespace-normal">{dialogue.situationRu}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSituationModal(false)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 p-0.5 rounded shrink-0 cursor-pointer"
            title="Скрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
