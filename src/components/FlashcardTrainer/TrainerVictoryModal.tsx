import React from 'react';
import { CheckCircle2, Sparkles, Award, Columns2, Shuffle } from 'lucide-react';
import { Word } from '@/types';

interface TrainerVictoryModalProps {
  status: 'part_completed' | 'all_parts_completed' | 'completed';
  isUlpan: boolean;
  lessonId?: number;
  activePartIndex: number;
  parts: Word[][];
  wordsLength: number;
  masterWordsLength: number;
  completedPartIndices: number[];
  canSplit: boolean;
  onNextPart: (nextPartIdx: number) => void;
  onRepeatPart: () => void;
  onAllWordsTogether: () => void;
  onContinueLesson?: (
    lessonId: number,
    nextTab: 'theory' | 'vocab' | 'exercises' | 'chat' | 'phone'
  ) => void;
  onClose?: () => void;
  onRestart: () => void;
  onStartSplitMode: () => void;
  onShuffleRestart: () => void;
}

export const TrainerVictoryModal: React.FC<TrainerVictoryModalProps> = ({
  status,
  isUlpan,
  lessonId,
  activePartIndex,
  parts,
  wordsLength,
  masterWordsLength,
  completedPartIndices,
  canSplit,
  onNextPart,
  onRepeatPart,
  onAllWordsTogether,
  onContinueLesson,
  onClose,
  onRestart,
  onStartSplitMode,
  onShuffleRestart,
}) => {
  // ЭКРАН 1: Завершена отдельная часть (не последняя)
  if (status === 'part_completed') {
    const nextPartIdx = activePartIndex + 1;
    const nextPartWordsCount = parts[nextPartIdx]?.length || 0;
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isUlpan
                ? `חֵלֶק ${activePartIndex + 1} מִתּוֹךְ ${parts.length} הוּשְׁלַם!`
                : `Часть ${activePartIndex + 1} из ${parts.length} пройдена!`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !כָּל הַכָּבוֹד
          </h2>
          <p className="text-base font-bold text-blue-600 dark:text-blue-400">
            {isUlpan
              ? `עֲבוֹדָה מְצוּיֶנֶת! שְׁלַטְתֶּם בְּ-${wordsLength} מִילִּים.`
              : `Отлично! Вы повторили ${wordsLength} слов(а).`}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isUlpan
              ? `מוּכָנִים לַעֲבוֹר לַחֵלֶק הַבָּא אוֹ לַחֲזוֹר עַל חֵלֶק זֶה?`
              : `Готовы перейти к следующей части или хотите повторить эту ещё раз?`}
          </p>
        </div>

        {/* Индикатор всех частей */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-1 flex-wrap">
          {parts.map((p, idx) => {
            const isFinished = completedPartIndices.includes(idx);
            const isCurrent = activePartIndex === idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isFinished
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                {isFinished && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                <span>{isUlpan ? `חלק ${idx + 1}` : `Ч. ${idx + 1}`}</span>
                <span className="text-[10px] opacity-75">({p.length})</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2.5 pt-2">
          {nextPartIdx < parts.length && (
            <button
              type="button"
              onClick={() => onNextPart(nextPartIdx)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isUlpan
                  ? `הַמְשֵׁךְ לְחֵלֶק ${nextPartIdx + 1} (${nextPartWordsCount} מִילִּים) ➡️`
                  : `Перейти к части ${nextPartIdx + 1} (${nextPartWordsCount} слов) ➡️`}
              </span>
            </button>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onRepeatPart}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              {isUlpan ? 'חֲזֹר עַל חֵלֶק זֶה' : 'Повторить эту часть'}
            </button>

            <button
              type="button"
              onClick={onAllWordsTogether}
              className="flex-1 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
            >
              {isUlpan ? 'הַכֹּל יַחַד עַכְשָׁו' : 'Все слова сразу'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ЭКРАН 2: Завершены все части — объединить и закрепить всё вместе
  if (status === 'all_parts_completed') {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-100 to-indigo-100 dark:from-amber-950/60 dark:to-indigo-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUlpan ? '!כָּל הַחֲלָקִים הוּשְׁלְמוּ' : 'Все части успешно пройдены!'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
            !כָּל הַכָּבוֹד
          </h2>
          <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            {isUlpan
              ? `עֲבַרְתֶּם עַל כָּל ${parts.length} הַחֲלָקִים (${masterWordsLength} מִילִּים)!`
              : `Вы последовательно выучили все ${parts.length} частей (${masterWordsLength} слов)!`}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isUlpan
              ? 'עַכְשָׁו מֻמְלָץ לְאַחֵד אֶת כָּל הַמִּילִּים וּלְחַזֵּק אֶת הַזִּכָּרוֹן יַחַד.'
              : 'Теперь закрепим результат: объедините все слова колоды для финального повторения!'}
          </p>
        </div>

        {/* Главная кнопка объединения */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onAllWordsTogether}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {isUlpan
                ? `🚀 אֲחֵד וְתַרְגֵּל אֶת כָּל ${masterWordsLength} הַמִּילִּים`
                : `🚀 Объединить и повторить всё вместе (${masterWordsLength} слов)`}
            </span>
          </button>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              {isUlpan ? 'חֲזֹר עַל חֵלֶק אַחֲרוֹן' : 'Повторить последнюю часть'}
            </button>

            {lessonId ? (
              <button
                type="button"
                onClick={() => {
                  if (onContinueLesson) {
                    onContinueLesson(lessonId, 'exercises');
                  } else if (onClose) {
                    onClose();
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'מַעֲבָר לְתַרְגִּילִים ➡️' : 'К упражнениям ➡️'}
              </button>
            ) : onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'סְגוֹר' : 'Завершить'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ЭКРАН 3: Завершение полной колоды («Все вместе» или без деления)
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
        <Award className="w-10 h-10" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
          !כָּל הַכָּבוֹד
        </h2>
        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
          {isUlpan
            ? lessonId
              ? `עֲבוֹדָה מְצוּיֶנֶת! שִׁיעוּר ${lessonId} הוּשְׁלַם בְּהַצְלָחָה!`
              : 'עֲבוֹדָה מְצוּיֶנֶת! הַתִּרְגּוּל הֻשְׁלַם.'
            : lessonId
            ? `Отличная работа! Словарь урока ${lessonId} успешно пройден!`
            : 'Отличная работа! Тренировка завершена.'}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isUlpan
            ? lessonId
              ? `חֲזַרְתֶּם עַל כָּל ${masterWordsLength} הַמִּילִּים. שָׁלָב 2/5 הוּשְׁלַם.`
              : `חֲזַרְתֶּם עַל ${masterWordsLength} מִילִּים.`
            : lessonId
            ? `Вы повторили все ${masterWordsLength} слов(а). Раздел «Словарь» зачтен (этап 2/5).`
            : `Вы повторили ${masterWordsLength} слов(а). Прогресс сохранен в интервальной памяти.`}
        </p>
      </div>

      <div className="space-y-2.5 pt-2">
        {lessonId ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (onContinueLesson) {
                  onContinueLesson(lessonId, 'exercises');
                } else if (onClose) {
                  onClose();
                }
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isUlpan ? 'מַעֲבָר לְתַרְגִּילִים (שָׁלָב 3/5) ➡️' : 'Перейти к упражнениям (этап 3/5) ➡️'}</span>
            </button>

            <div className="flex gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (onContinueLesson) {
                    onContinueLesson(lessonId, 'vocab');
                  } else if (onClose) {
                    onClose();
                  }
                }}
                className="flex-1 min-w-[110px] py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'חֲזָרָה לַשִּׁיעוּר' : 'Вернуться в урок'}
              </button>

              <button
                type="button"
                onClick={onRestart}
                className="flex-1 min-w-[110px] py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              >
                {isUlpan ? 'תִּרְגּוּל נוֹסָף' : 'Повторить'}
              </button>

              {canSplit && (
                <button
                  type="button"
                  onClick={onStartSplitMode}
                  className="flex-1 min-w-[110px] py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs sm:text-sm hover:bg-blue-100 dark:hover:bg-blue-900/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Columns2 className="w-4 h-4" />
                  <span>{isUlpan ? 'בַּחֲלָקִים' : 'По частям'}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              {isUlpan ? 'תִּרְגּוּל שׁוּב' : 'Повторить снова'}
            </button>
            {canSplit && (
              <button
                type="button"
                onClick={onStartSplitMode}
                className="flex-1 py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 font-semibold text-sm text-blue-700 dark:text-blue-300 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Columns2 className="w-4 h-4" />
                <span>{isUlpan ? 'בַּחֲלָקִים' : 'По частям'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onShuffleRestart}
              className="flex-1 py-3 px-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 font-semibold text-sm text-purple-700 dark:text-purple-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>{isUlpan ? 'עַרְבֵּב וְהַתְחֵל' : 'Перемешать и учить'}</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition cursor-pointer"
              >
                {isUlpan ? 'סְגוֹר' : 'Вернуться'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
