'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Volume2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ArrowLeftRight,
} from 'lucide-react';
import { EssayEvaluationResult } from '@/types';
import { speakHebrew } from '@/lib/speech';

interface EssayEvaluationViewProps {
  evaluation: EssayEvaluationResult;
  userEssay: string;
  onTryAgain: () => void;
  onContinue: () => void;
}

export const EssayEvaluationView: React.FC<EssayEvaluationViewProps> = ({
  evaluation,
  userEssay,
  onTryAgain,
  onContinue,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayAudio = async () => {
    if (!evaluation.correctedVersion.hebrew || isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      await speakHebrew(evaluation.correctedVersion.hebrew, { rate: 0.75 });
    } catch (e) {
      console.warn('Speech error:', e);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const isHigh = evaluation.score >= 88;
  const isGood = evaluation.score >= 70 && evaluation.score < 88;

  const scoreBadgeBg = isHigh
    ? 'bg-emerald-500 text-white'
    : isGood
    ? 'bg-amber-500 text-white'
    : 'bg-rose-500 text-white';

  const ratingHebrew =
    evaluation.rating === 'excellent'
      ? 'מְצוּיָן!'
      : evaluation.rating === 'good'
      ? 'טוֹב מְאוֹד!'
      : 'דּוֹרֵשׁ שִׁפּוּר';

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-6 animate-in fade-in duration-300">
      {/* 1. Главная карточка с баллом и рецензией преподавателя */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-md ${scoreBadgeBg}`}
        >
          <span className="text-2xl sm:text-3xl font-black">{evaluation.score}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">из 100</span>
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-hebrew font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              {ratingHebrew}
            </span>
            <span className="text-xs text-zinc-400 font-medium">Рецензия преподавателя</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-100 leading-snug">
            {evaluation.summaryRu}
          </p>
        </div>
      </div>

      {/* 2. СПЕЦИАЛЬНЫЙ БЛОК: ПОРЯДОК СЛОВ (סֵדֶר הַמִּילִּים) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>Порядок слов</span>
              <span className="font-hebrew text-xs font-normal text-indigo-600 dark:text-indigo-400">(סֵדֶר הַמִּילִּים)</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Позиция прилагательных, отрицания «לא» и вопросительных слов
            </p>
          </div>
        </div>

        {evaluation.wordOrderFeedback.items && evaluation.wordOrderFeedback.items.length > 0 ? (
          <div className="space-y-2.5">
            {evaluation.wordOrderFeedback.items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2 flex-wrap font-hebrew text-sm sm:text-base" dir="rtl">
                  {item.issueSnippet && (
                    <span className="line-through text-rose-500 font-semibold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/50">
                      {item.issueSnippet}
                    </span>
                  )}
                  {item.correctionSnippet && (
                    <>
                      <span className="text-zinc-400 font-sans text-xs">➔</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50">
                        {item.correctionSnippet}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {item.explanationRu}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Отличная структура! Вы верно расставили слова и соблюли порядок иврита.</span>
          </div>
        )}

        {evaluation.wordOrderFeedback.generalAdviceRu && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 italic pt-1 border-t border-zinc-100 dark:border-zinc-800">
            {evaluation.wordOrderFeedback.generalAdviceRu}
          </p>
        )}
      </div>

      {/* 3. ГРАММАТИКА И РОД */}
      {(evaluation.grammarFeedback?.items?.length > 0 || evaluation.grammarFeedback?.genderAgreementRu) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Грамматика и согласование рода</span>
          </h3>

          {evaluation.grammarFeedback.items?.map((g, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-1"
            >
              <div className="flex items-center gap-2 font-hebrew" dir="rtl">
                <span className="line-through text-rose-500">{g.wrongSnippet}</span>
                <span className="text-zinc-400 font-sans text-xs">➔</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{g.correctionSnippet}</span>
              </div>
              <p>{g.explanationRu}</p>
            </div>
          ))}

          {evaluation.grammarFeedback.genderAgreementRu && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {evaluation.grammarFeedback.genderAgreementRu}
            </p>
          )}
        </div>
      )}

      {/* 4. ИСПОЛЬЗОВАННЫЕ СЛОВА УРОКА */}
      {evaluation.vocabularyAnalysis && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Лексика урока</span>
            </h3>
            {evaluation.vocabularyAnalysis.count > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Использовано: {evaluation.vocabularyAnalysis.count} слов
              </span>
            )}
          </div>

          {evaluation.vocabularyAnalysis.usedLessonWords && evaluation.vocabularyAnalysis.usedLessonWords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {evaluation.vocabularyAnalysis.usedLessonWords.map((word, i) => (
                <span
                  key={i}
                  dir="rtl"
                  className="px-2 py-1 rounded-lg text-xs font-hebrew font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  ✓ {word}
                </span>
              ))}
            </div>
          ) : null}

          {evaluation.vocabularyAnalysis.commentRu && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 pt-1">
              {evaluation.vocabularyAnalysis.commentRu}
            </p>
          )}
        </div>
      )}

      {/* 5. ОБРАЗЦОВАЯ ВЕРСИЯ НА ЖИВОМ ИВРИТЕ (С ОГЛАСОВКАМИ И ОЗВУЧКОЙ) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-blue-950/30 dark:via-zinc-900 dark:to-zinc-900 border border-blue-200/80 dark:border-blue-900/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Как это напишет израильтянин
            </h3>
          </div>

          <button
            type="button"
            onClick={handlePlayAudio}
            disabled={isPlayingAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isPlayingAudio
                ? 'bg-blue-600 text-white animate-pulse'
                : 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 border border-blue-200 dark:border-zinc-700'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Озвучивается...' : 'Послушать'}</span>
          </button>
        </div>

        {/* Иврит с огласовками */}
        <div
          dir="rtl"
          className="p-3 sm:p-4 rounded-xl bg-white dark:bg-zinc-800/90 border border-blue-100 dark:border-zinc-700 font-hebrew text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed shadow-2xs"
        >
          {evaluation.correctedVersion.hebrew}
        </div>

        {/* Транскрипция и перевод */}
        {evaluation.correctedVersion.transcription && (
          <div className="text-xs sm:text-sm font-serif italic text-blue-900 dark:text-blue-200/90 pl-1">
            [{evaluation.correctedVersion.transcription}]
          </div>
        )}

        {evaluation.correctedVersion.translation && (
          <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 pl-1">
            {evaluation.correctedVersion.translation}
          </div>
        )}
      </div>

      {/* 6. ЦЕННЫЕ СОВЕТЫ И РЕКОМЕНДАЦИИ ИИ */}
      {evaluation.valuableTipsRu && evaluation.valuableTipsRu.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Ценные советы преподавателя для дальнейшего роста</span>
          </h3>
          <ul className="space-y-2">
            {evaluation.valuableTipsRu.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. КНОПКИ ДЕЙСТВИЯ */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onTryAgain}
          className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Переписать сочинение</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Перейти к диалогу</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

