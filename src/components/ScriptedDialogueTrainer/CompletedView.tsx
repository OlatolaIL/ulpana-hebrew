import React from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { DialogueParticipant, DialogueEvaluationResult } from '@/types';

interface CompletedViewProps {
  userRoleSide: 'a' | 'b';
  characterA: DialogueParticipant;
  characterB: DialogueParticipant;
  turnHistory: Record<number, DialogueEvaluationResult>;
  onGoToNextTab?: () => void;
  onSwitchRole: () => void;
  onBackToListen: () => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({
  userRoleSide,
  characterA,
  characterB,
  turnHistory,
  onGoToNextTab,
  onSwitchRole,
  onBackToListen,
}) => {
  const scores = Object.values(turnHistory)
    .map((t) => t.pronunciationScore)
    .filter((s): s is number => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-4 overflow-y-auto">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-3xl mx-auto shadow-md">
        🏆
      </div>

      <div className="max-w-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Этап 4/5 (Диалог) успешно зачтён!</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
          Диалог успешно пройден!
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Вы успешно провели разговор на иврите за роль{' '}
          <strong>{userRoleSide === 'a' ? characterA.nameRu : characterB.nameRu}</strong>.
        </p>

        {avgScore !== null && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
            <span>🎙️ Чёткость произношения в диалоге:</span>
            <span className="text-sm">{avgScore}%</span>
          </div>
        )}
      </div>

      {/* Главные кнопки действий */}
      <div className="max-w-sm w-full space-y-2.5 pt-2">
        {/* ГЛАВНАЯ КНОПКА: Переход к 5 этапу (Звонок) */}
        {onGoToNextTab && (
          <button
            type="button"
            onClick={onGoToNextTab}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Перейти к этапу 5: Звонок →</span>
          </button>
        )}

        {/* Дополнительные действия */}
        <button
          type="button"
          onClick={onSwitchRole}
          className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>
            Сыграть за другую сторону ({userRoleSide === 'a' ? characterB.nameRu : characterA.nameRu})
          </span>
        </button>

        <button
          type="button"
          onClick={onBackToListen}
          className="w-full py-2 px-4 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-medium transition cursor-pointer"
        >
          Вернуться к тексту диалога
        </button>
      </div>
    </div>
  );
};
