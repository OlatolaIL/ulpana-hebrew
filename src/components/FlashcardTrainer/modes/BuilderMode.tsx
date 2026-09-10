import React from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Delete,
  RotateCcw,
  Space,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { getWordTranscription } from '@/lib/transcription';
import { Tile } from '../types';
import { getCleanHebrewTarget } from '../helpers';

interface BuilderModeProps {
  currentWord: Word;
  userProfile: UserProfile;
  currentIndex: number;
  showHint: boolean;
  builderSuccess: boolean;
  builderError: boolean;
  builderSelected: Tile[];
  builderAvailable: Tile[];
  onToggleHint: () => void;
  onSelectTile: (tile: Tile) => void;
  onUnselectTile: (tile: Tile) => void;
  onBackspace: () => void;
  onResetBuilder: () => void;
  onAutoAssemble: () => void;
  onPrevWord: () => void;
  onNextWord: (quality?: number) => void;
  onSpeakHebrew: (text: string) => void;
}

export const BuilderMode: React.FC<BuilderModeProps> = ({
  currentWord,
  userProfile,
  currentIndex,
  showHint,
  builderSuccess,
  builderError,
  builderSelected,
  builderAvailable,
  onToggleHint,
  onSelectTile,
  onUnselectTile,
  onBackspace,
  onResetBuilder,
  onAutoAssemble,
  onPrevWord,
  onNextWord,
  onSpeakHebrew,
}) => {
  const targetText = getCleanHebrewTarget(currentWord);
  const hasSpaces = targetText.includes(' ');
  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs text-zinc-400 font-semibold">
          {hasSpaces
            ? 'Соберите фразу по буквам и пробелам:'
            : 'Соберите слово по буквам:'}
        </span>
        <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
          {currentWord.translation}
        </div>
        {userProfile.showTranscription && getWordTranscription(currentWord) && (
          <p className="text-xs text-blue-600 dark:text-blue-400">
            [{getWordTranscription(currentWord)}]
          </p>
        )}
      </div>

      {/* Блок подсказки "Показать правильно" */}
      {showHint && !builderSuccess && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 text-center space-y-2 animate-in fade-in zoom-in-95 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-hebrew">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Правильный ответ:</span>
            </span>
            <button
              type="button"
              onClick={() => onSpeakHebrew(currentWord.hebrew)}
              className="p-1.5 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:bg-amber-300 transition cursor-pointer"
              title="Прослушать произношение"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div
            dir="rtl"
            className={`text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 ${
              isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
            }`}
          >
            {userProfile.showNikkud ? currentWord.hebrew : targetText}
          </div>

          {getWordTranscription(currentWord) && (
            <p className="text-xs font-medium text-amber-900/80 dark:text-amber-300/80">
              [{getWordTranscription(currentWord)}]
            </p>
          )}

          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onAutoAssemble}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Автоматически собрать правильные буквы и пробелы"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Собрать правильно</span>
            </button>
          </div>
        </div>
      )}

      {/* Поле собранных букв */}
      <div
        dir="rtl"
        className={`min-h-[80px] p-4 rounded-2xl border-2 flex flex-wrap items-center justify-center gap-2 transition ${
          isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
        } ${
          builderSuccess
            ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40'
            : builderError
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 animate-shake'
            : 'border-dashed border-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
        }`}
      >
        {builderSelected.length > 0 ? (
          builderSelected.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => onUnselectTile(tile)}
              className={`px-3 py-1.5 rounded-xl font-bold shadow-sm transition active:scale-95 cursor-pointer ${
                tile.char === ' '
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs border border-amber-300 dark:border-amber-800 flex items-center gap-1'
                  : `bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 text-2xl md:text-3xl ${
                      isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
                    }`
              }`}
              title="Нажмите, чтобы вернуть символ"
            >
              {tile.char === ' ' ? (
                <>
                  <Space className="w-3 h-3" />
                  <span>Пробел</span>
                </>
              ) : (
                tile.char
              )}
            </button>
          ))
        ) : (
          <span className="text-zinc-400 text-sm font-sans font-medium">
            {hasSpaces
              ? 'Нажимайте на буквы и пробелы ниже...'
              : 'Нажимайте на буквы ниже...'}
          </span>
        )}
      </div>

      {/* Панель кнопок управления конструктором (Показать ответ / Стереть / Сброс) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-zinc-500 font-medium font-hebrew">
          {`${hasSpaces ? 'Символов' : 'Букв'}: ${builderSelected.length} из ${targetText.length}`}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleHint}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              showHint
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
            title="Показать правильный ответ"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {showHint
                ? 'Скрыть ответ'
                : 'Показать правильно'}
            </span>
          </button>

          <button
            type="button"
            disabled={builderSelected.length === 0 || builderSuccess}
            onClick={onBackspace}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition flex items-center gap-1.5 cursor-pointer"
            title="Удалить последний символ (Backspace)"
          >
            <Delete className="w-3.5 h-3.5" />
            <span>Стереть</span>
          </button>

          <button
            type="button"
            disabled={builderSelected.length === 0 || builderSuccess}
            onClick={onResetBuilder}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition flex items-center gap-1.5 cursor-pointer"
            title="Сбросить все буквы"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
        </div>
      </div>

      {/* Блок подтверждения успеха (Появляется сразу при верном сборе) */}
      {builderSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-3 animate-in zoom-in-95">
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg font-hebrew">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>!מְצוּיָן! נָכוֹן (Верно!)</span>
          </div>

          <div
            dir="rtl"
            className={`text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300 ${
              isCursive ? 'font-cursive' : 'font-hebrew'
            }`}
          >
            {userProfile.showNikkud ? currentWord.hebrew : targetText}
          </div>

          {userProfile.showTranscription && getWordTranscription(currentWord) && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              [{getWordTranscription(currentWord)}]
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={onPrevWord}
              className="py-3 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Предыдущее слово"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              type="button"
              onClick={() => onNextWord(5)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span>Следующее слово</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Плитки доступных букв и пробела */}
      {!builderSuccess && (
        <div dir="rtl" className="flex flex-wrap gap-2.5 justify-center pt-2">
          {builderAvailable.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => onSelectTile(tile)}
              className={`rounded-2xl font-bold shadow-sm transition active:scale-90 cursor-pointer ${
                tile.char === ' '
                  ? 'px-4 py-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white border-2 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm flex items-center gap-1.5'
                  : `w-13 h-13 min-w-[50px] min-h-[50px] bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-2xl md:text-3xl border border-zinc-200 dark:border-zinc-700 ${
                      isCursive
                        ? 'font-cursive text-3xl text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white'
                        : 'font-hebrew'
                    }`
              }`}
              title={
                tile.char === ' '
                  ? 'Пробел (Space)'
                  : `Буква ${tile.char}`
              }
            >
              {tile.char === ' ' ? (
                <>
                  <Space className="w-4 h-4 shrink-0" />
                  <span>Пробел</span>
                </>
              ) : (
                tile.char
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
