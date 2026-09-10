import React from 'react';
import { Volume2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Word, UserProfile } from '@/types';

interface ListeningModeProps {
  currentWord: Word;
  isUlpan: boolean;
  currentIndex: number;
  quizOptions: string[];
  selectedAnswer: string | null;
  userProfile: UserProfile;
  onQuizSelect: (option: string) => void;
  onPrevWord: () => void;
  onAdvanceNext: () => void;
  onSpeakHebrew: (text: string) => void;
}

export const ListeningMode: React.FC<ListeningModeProps> = ({
  currentWord,
  isUlpan,
  currentIndex,
  quizOptions,
  selectedAnswer,
  userProfile,
  onQuizSelect,
  onPrevWord,
  onAdvanceNext,
  onSpeakHebrew,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="text-center py-4">
        <button
          onClick={() => onSpeakHebrew(currentWord.hebrew)}
          className="w-20 h-20 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
          title={isUlpan ? 'השמע שוב' : 'Прослушать снова'}
        >
          <Volume2 className="w-8 h-8" />
        </button>
        <p className="text-xs text-zinc-400 mt-3 font-hebrew">
          {isUlpan ? 'לַחֲצוּ לַהַשְׁמָעָה חוֹזֶרֶת' : 'Нажмите, чтобы прослушать слово еще раз'}
        </p>
      </div>

      {/* Варианты ответов */}
      <div className="grid grid-cols-1 gap-2.5">
        {quizOptions.map((opt, i) => {
          const isSelected = selectedAnswer === opt;
          const correctOpt = isUlpan
            ? userProfile.showNikkud
              ? currentWord.hebrew
              : currentWord.hebrewPlain
            : currentWord.translation;
          const isCorrect = opt === correctOpt;

          let btnClass =
            'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';

          if (selectedAnswer) {
            if (isCorrect) {
              btnClass = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
            } else if (isSelected) {
              btnClass = 'bg-red-600 text-white border-red-600';
            }
          }

          return (
            <button
              key={i}
              disabled={selectedAnswer !== null}
              onClick={() => onQuizSelect(opt)}
              dir={isUlpan ? 'rtl' : 'ltr'}
              className={`p-3.5 rounded-xl border text-sm transition cursor-pointer ${
                isUlpan ? 'text-right font-hebrew text-lg' : 'text-left'
              } ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Навигация в режиме аудирования */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={onPrevWord}
          className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
          title={isUlpan ? 'חֲזֹר לַמִּילָּה הַקּוֹדֶמֶת' : 'Предыдущее слово'}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isUlpan ? 'מִילָּה קוֹדֶמֶת' : 'Предыдущее слово'}</span>
        </button>

        <button
          type="button"
          onClick={onAdvanceNext}
          className="py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
          title={isUlpan ? 'דַּלֵּג לַמִּילָּה הַבָּאָה' : 'Перейти к следующему слову'}
        >
          <span>{isUlpan ? 'דַּלֵּג (הַבָּא)' : 'Пропустить (далее)'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
