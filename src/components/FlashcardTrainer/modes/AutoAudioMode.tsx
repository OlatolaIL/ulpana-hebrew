import React from 'react';
import {
  Volume2,
  Repeat,
  Timer,
  Sparkles,
  Pause,
  Play,
  ArrowLeft,
  Square,
  ArrowRight,
  Shuffle,
} from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { getWordTranscription } from '@/lib/transcription';

interface AutoAudioModeProps {
  currentWord: Word;
  userProfile: UserProfile;
  isCurrentCardFrontRussian: boolean;
  cardDirection: 'he-ru' | 'ru-he' | 'carousel';
  currentIndex: number;
  isAutoPlaying: boolean;
  isAutoLooping: boolean;
  autoLoopCount: number;
  autoPhase: 'idle' | 'prompt' | 'pause' | 'reveal' | 'paused';
  autoCountdown: number;
  autoPauseSec: number;
  onToggleAutoLooping: () => void;
  onSetAutoPauseSec: (sec: number) => void;
  onAutoStart: () => void;
  onAutoPause: () => void;
  onAutoStop: () => void;
  onPrevWord: () => void;
  onAdvanceNext: () => void;
  onSpeakHebrew: (text: string) => void;
  onShuffleWords?: () => void;
}

export const AutoAudioMode: React.FC<AutoAudioModeProps> = ({
  currentWord,
  userProfile,
  isCurrentCardFrontRussian,
  cardDirection,
  currentIndex,
  isAutoPlaying,
  isAutoLooping,
  autoLoopCount,
  autoPhase,
  autoCountdown,
  autoPauseSec,
  onToggleAutoLooping,
  onSetAutoPauseSec,
  onAutoStart,
  onAutoPause,
  onAutoStop,
  onPrevWord,
  onAdvanceNext,
  onSpeakHebrew,
  onShuffleWords,
}) => {
  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div className="space-y-4">
      <div className="min-h-[260px] sm:min-h-[300px] bg-gradient-to-b from-white to-blue-50/30 dark:from-zinc-900 dark:to-blue-950/20 border-2 border-blue-200 dark:border-blue-900/60 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-between text-center relative select-none shadow-xl">
        {/* Верхний статус-бейдж фазы */}
        <div className="w-full flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Volume2
                className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${
                  isAutoPlaying ? 'animate-pulse' : ''
                }`}
              />
              <span>Авто на слух</span>
            </span>

            {/* Переключатель «Бесконечный цикл» */}
            <button
              type="button"
              onClick={onToggleAutoLooping}
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                isAutoLooping
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
              title={
                isAutoLooping
                  ? 'Бесконечный цикл включён (нажмите для выключения)'
                  : 'Включить бесконечный цикл'
              }
            >
              <Repeat
                className={`w-3.5 h-3.5 ${isAutoLooping ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
              />
              <span>
                {isAutoLooping ? 'Бесконечный цикл' : 'Без цикла'}
              </span>
              {autoLoopCount > 1 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px]">
                  Круг {autoLoopCount}
                </span>
              )}
            </button>

            {cardDirection === 'carousel' && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center gap-1 border border-purple-200 dark:border-purple-800/60">
                <span>🔀 Карусель:</span>
                <span className="font-extrabold text-purple-900 dark:text-purple-200">
                  {isCurrentCardFrontRussian ? 'Рус → Ивр' : 'Ивр → Рус'}
                </span>
              </span>
            )}

            {onShuffleWords && (
              <button
                type="button"
                onClick={onShuffleWords}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                title="Перемешать порядок слов"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Перемешать</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-zinc-400 mr-1 hidden sm:inline">Пауза:</span>
            {[2, 3, 4].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onSetAutoPauseSec(sec)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  autoPauseSec === sec
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
                title={`Пауза ${sec} секунды для размышления`}
              >
                {sec}с
              </button>
            ))}
          </div>
        </div>

        {/* Центральная часть: Слово и индикатор паузы */}
        <div className="my-auto py-4 space-y-3 max-w-lg w-full">
          {/* Статус текущего шага */}
          <div className="flex items-center justify-center">
            {autoPhase === 'prompt' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {isCurrentCardFrontRussian
                    ? 'Слушайте русский...'
                    : 'Слушайте иврит...'}
                </span>
              </span>
            )}
            {autoPhase === 'pause' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {isCurrentCardFrontRussian
                    ? `Вспомните на иврите! (${autoCountdown}с)`
                    : `Вспомните перевод! (${autoCountdown}с)`}
                </span>
              </span>
            )}
            {autoPhase === 'reveal' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isCurrentCardFrontRussian
                    ? 'Ответ на иврите'
                    : 'Правильный перевод'}
                </span>
              </span>
            )}
            {autoPhase === 'paused' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                <Pause className="w-3.5 h-3.5" />
                <span>
                  На паузе. Нажмите «Старт» / «Продолжить»
                </span>
              </span>
            )}
            {autoPhase === 'idle' && (
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-zinc-400" />
                <span>
                  Нажмите «Старт», чтобы запустить бесконечный цикл
                </span>
              </span>
            )}
          </div>

          {/* Отображение слова с фокусом на вопросе и скрытием ответа до reveal */}
          <div className="space-y-3">
            {isCurrentCardFrontRussian ? (
              /* Направление: Русский (вопрос) → Иврит (ответ) */
              <>
                <div className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 font-sans tracking-wide">
                  {currentWord.translation}
                </div>

                <div
                  className={`space-y-1 transition-all duration-500 ${
                    autoPhase === 'reveal' || autoPhase === 'idle' || autoPhase === 'paused'
                      ? 'opacity-100 filter-none'
                      : 'opacity-10 filter blur-md select-none pointer-events-none'
                  }`}
                >
                  <div
                    dir="rtl"
                    className={`text-3xl sm:text-5xl font-bold ${
                      isCursive
                        ? 'font-cursive text-blue-600 dark:text-blue-400'
                        : 'font-hebrew text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                  </div>

                  {getWordTranscription(currentWord) && (
                    <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400">
                      [{getWordTranscription(currentWord)}]
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Направление: Иврит (вопрос) → Русский (ответ) */
              <>
                <div className="space-y-1">
                  <div
                    dir="rtl"
                    className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                      isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
                    }`}
                  >
                    {userProfile.showNikkud ? currentWord.hebrew : currentWord.hebrewPlain}
                  </div>

                  {getWordTranscription(currentWord) && (
                    <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400">
                      [{getWordTranscription(currentWord)}]
                    </p>
                  )}
                </div>

                <div
                  className={`text-2xl sm:text-3xl font-bold transition-all duration-500 ${
                    autoPhase === 'reveal' || autoPhase === 'idle' || autoPhase === 'paused'
                      ? 'text-zinc-700 dark:text-zinc-200 opacity-100 filter-none'
                      : 'opacity-10 filter blur-md select-none pointer-events-none'
                  }`}
                >
                  {currentWord.translation}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Нижняя панель управления плеером (Назад, Старт, Пауза, Стоп, Озвучить, Далее) */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
          <button
            type="button"
            disabled={currentIndex === 0 && !isAutoLooping}
            onClick={onPrevWord}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 transition flex items-center gap-1 cursor-pointer shrink-0"
            title="Предыдущее слово"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
            {/* Кнопка Старт / Продолжить */}
            <button
              type="button"
              onClick={onAutoStart}
              disabled={isAutoPlaying}
              className={`py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
                isAutoPlaying
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 opacity-60 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
              }`}
              title={
                autoPhase === 'paused'
                  ? 'Продолжить воспроизведение'
                  : 'Запустить авторежим'
              }
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {autoPhase === 'paused' ? 'Продолжить' : 'Старт'}
              </span>
            </button>

            {/* Кнопка Пауза */}
            <button
              type="button"
              onClick={onAutoPause}
              disabled={!isAutoPlaying}
              className={`py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 ${
                isAutoPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 opacity-40 cursor-not-allowed'
              }`}
              title="Приостановить воспроизведение"
            >
              <Pause className="w-4 h-4" />
              <span>Пауза</span>
            </button>

            {/* Кнопка Стоп */}
            <button
              type="button"
              onClick={onAutoStop}
              className="py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 transition active:scale-95 cursor-pointer"
              title="Остановить и сбросить в начало"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Стоп</span>
            </button>

            {/* Повторить озвучку текущего слова */}
            <button
              type="button"
              onClick={() => onSpeakHebrew(currentWord.hebrew)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Повторить произношение"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onAdvanceNext}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer shrink-0"
            title="Следующее слово"
          >
            <span className="hidden sm:inline">Далее</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
