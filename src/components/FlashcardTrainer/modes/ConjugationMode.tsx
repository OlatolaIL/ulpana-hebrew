import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  GitBranch,
  Link2,
} from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { extractVerbTriad, VerbTriadInfo } from '@/lib/verbTriad';
import { stripNikkud } from '@/lib/transcription';

interface ConjugationModeProps {
  currentWord: Word;
  userProfile: UserProfile;
  currentIndex: number;
  wordsLength: number;
  onAdvanceNext: (quality?: number) => void;
  onSpeakHebrew: (text: string) => void;
  onOpenPealim: (word: Word) => void;
}

type DrillType = 'tense_shift' | 'preposition';

interface OptionItem {
  id: string;
  hebrew: string;
  transcription?: string;
  label?: string;
  isCorrect: boolean;
}

export const ConjugationMode: React.FC<ConjugationModeProps> = ({
  currentWord,
  userProfile,
  currentIndex,
  wordsLength,
  onAdvanceNext,
  onSpeakHebrew,
  onOpenPealim,
}) => {
  const isCursive = userProfile.fontStyle === 'cursive';
  const triad = useMemo(() => extractVerbTriad(currentWord), [currentWord]);

  // Выбранный тип вопроса для этого глагола
  const [drillType, setDrillType] = useState<DrillType>('tense_shift');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Сброс при смене слова
  useEffect(() => {
    setSelectedOptionId(null);
    setIsAnswered(false);
  }, [currentWord]);

  // Генерация вариантов ответов
  const options = useMemo<OptionItem[]>(() => {
    if (!triad) return [];

    if (drillType === 'preposition' && triad.prepositionInfo) {
      const allPreps = ['לְ...', 'בְּ...', 'אֶת...', 'עַל...', 'עִם...', 'מִ...'];
      const correctPrep = triad.prepositionInfo.preposition;
      const distractors = allPreps.filter((p) => p !== correctPrep).slice(0, 3);
      const combined = [
        { id: 'correct', hebrew: correctPrep, isCorrect: true },
        ...distractors.map((p, idx) => ({ id: `dist-${idx}`, hebrew: p, isCorrect: false })),
      ];
      // Перемешиваем детерминированно относительно слова
      return combined.sort(() => (currentWord.id.charCodeAt(0) % 2 === 0 ? 0.5 - Math.random() : Math.random() - 0.5));
    }

    // По умолчанию: «Мостик времён: Настоящее (он) -> Прошедшее (он)»
    const correctHebrew = triad.pastHe.hebrew;
    const correctTrans = triad.pastHe.transcription;

    // Дистракторы из форм глагола
    const distList: OptionItem[] = [];

    // 1. Инфинитив
    if (stripNikkud(triad.infinitive.hebrew) !== stripNikkud(correctHebrew)) {
      distList.push({
        id: 'inf',
        hebrew: triad.infinitive.hebrew,
        transcription: triad.infinitive.transcription,
        label: 'Инфинитив',
        isCorrect: false,
      });
    }

    // 2. 1-е лицо прошедшего («Я»)
    const pastAni = triad.conjugation.past?.find((f) => f.pronoun.includes('אֲנִי'));
    if (pastAni && stripNikkud(pastAni.hebrew) !== stripNikkud(correctHebrew)) {
      distList.push({
        id: 'ani',
        hebrew: pastAni.hebrew,
        transcription: pastAni.transcription,
        label: 'Я в прошлом',
        isCorrect: false,
      });
    }

    // 3. Множественное число настоящего или прошедшего
    const pastHem = triad.conjugation.past?.find((f) => f.pronoun.includes('הֵם') || f.pronoun.includes('они'));
    if (pastHem && stripNikkud(pastHem.hebrew) !== stripNikkud(correctHebrew)) {
      distList.push({
        id: 'hem',
        hebrew: pastHem.hebrew,
        transcription: pastHem.transcription,
        label: 'Они в прошлом',
        isCorrect: false,
      });
    }

    // 4. Будущее время (он)
    const futureHu = triad.conjugation.future?.find((f) => f.pronoun.includes('הוּא') || f.pronoun.includes('он'));
    if (futureHu && stripNikkud(futureHu.hebrew) !== stripNikkud(correctHebrew)) {
      distList.push({
        id: 'future',
        hebrew: futureHu.hebrew,
        transcription: futureHu.transcription,
        label: 'Будущее время',
        isCorrect: false,
      });
    }

    const uniqueDistractors = distList.slice(0, 3);
    const combined: OptionItem[] = [
      {
        id: 'correct',
        hebrew: correctHebrew,
        transcription: correctTrans,
        label: 'Он в прошлом',
        isCorrect: true,
      },
      ...uniqueDistractors,
    ];

    return combined.sort(() => 0.5 - Math.random());
  }, [triad, drillType, currentWord]);

  const handleSelectOption = (opt: OptionItem) => {
    if (isAnswered) return;
    setSelectedOptionId(opt.id);
    setIsAnswered(true);

    if (opt.isCorrect) {
      onSpeakHebrew(opt.hebrew);
    } else {
      const correctOpt = options.find((o) => o.isCorrect);
      if (correctOpt) {
        setTimeout(() => onSpeakHebrew(correctOpt.hebrew), 300);
      }
    }
  };

  const handleNext = () => {
    const isCorrect = options.find((o) => o.id === selectedOptionId)?.isCorrect;
    onAdvanceNext(isCorrect ? 5 : 2);
  };

  // Горячие клавиши (цифры 1-4 и пробел/Enter для далее)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= options.length) {
          handleSelectOption(options[num - 1]);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, options, selectedOptionId]);

  if (!triad) {
    return (
      <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          Слово не найдено в глагольной базе
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          Слово «{currentWord.hebrew}» ({currentWord.translation}) не имеет спряжений. Вы можете изучить его в режиме «Флип» или перейти дальше.
        </p>
        <button
          onClick={() => onAdvanceNext()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          Следующее слово →
        </button>
      </div>
    );
  }

  const hasPreposition = Boolean(triad.prepositionInfo);

  return (
    <div className="space-y-4">
      {/* Карточка задания */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-blue-200 dark:border-blue-900/60 rounded-3xl p-5 sm:p-7 flex flex-col items-center justify-between text-center relative select-none shadow-xl min-h-[360px]">
        {/* Верхняя панель: Переключатель типа тренировки и информация */}
        <div className="w-full flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setDrillType('tense_shift');
                setIsAnswered(false);
                setSelectedOptionId(null);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                drillType === 'tense_shift'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Мостик: Наст. → Прош.</span>
            </button>

            {hasPreposition && (
              <button
                type="button"
                onClick={() => {
                  setDrillType('preposition');
                  setIsAnswered(false);
                  setSelectedOptionId(null);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  drillType === 'preposition'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Предлог (+ {triad.prepositionInfo?.preposition})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {triad.binyanClean || triad.binyan}
            </span>
            {triad.root && (
              <span
                dir="rtl"
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                שורש: {triad.root}
              </span>
            )}
          </div>
        </div>

        {/* Вопрос и фокус */}
        <div className="my-auto py-3 space-y-3 w-full max-w-md">
          {drillType === 'tense_shift' ? (
            <>
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 dark:text-blue-400">
                  Сегодня он:
                </span>
                <div
                  dir="rtl"
                  className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                    isCursive ? 'font-cursive text-blue-600 dark:text-blue-400' : 'font-hebrew'
                  }`}
                >
                  {triad.presentMasc.hebrew}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  [{triad.presentMasc.transcription}] · {triad.infinitive.translation}
                </div>
              </div>

              <p className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300 pt-1">
                Как сказать: <span className="text-amber-600 dark:text-amber-400 font-extrabold">«Вчера он...»</span> (прошедшее время)?
              </p>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
                  Глагол и перевод:
                </span>
                <div
                  dir="rtl"
                  className={`text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 ${
                    isCursive ? 'font-cursive text-emerald-600 dark:text-emerald-400' : 'font-hebrew'
                  }`}
                >
                  {triad.infinitive.hebrew}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  [{triad.infinitive.transcription}] · {triad.infinitive.translation}
                </div>
              </div>

              <p className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-300 pt-1">
                С каким <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">предлогом управления</span> используется глагол?
              </p>
            </>
          )}

          {/* Варианты ответов */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              let btnStyle =
                'bg-zinc-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200';

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnStyle =
                    'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/40';
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle =
                    'bg-rose-100 dark:bg-rose-950/80 border-rose-400 dark:border-rose-600 text-rose-900 dark:text-rose-100';
                } else {
                  btnStyle =
                    'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3 rounded-2xl border-2 font-bold transition flex items-center justify-between gap-2 text-left relative cursor-pointer active:scale-[0.98] ${btnStyle}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div
                        dir="rtl"
                        className={`text-lg sm:text-xl font-bold font-hebrew ${
                          isCursive ? 'font-cursive' : ''
                        }`}
                      >
                        {opt.hebrew}
                      </div>
                      {opt.transcription && (
                        <div className="text-[10px] text-zinc-500 font-normal">
                          {opt.transcription}
                        </div>
                      )}
                    </div>
                  </div>

                  {isAnswered && (
                    <div>
                      {opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {isSelected && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Результат и пояснение после ответа */}
          {isAnswered && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2 text-center space-y-2">
              {options.find((o) => o.id === selectedOptionId)?.isCorrect ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-300/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Отлично! Точно в цель.</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-3 py-1 rounded-full border border-rose-300/60">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    Правильно: {options.find((o) => o.isCorrect)?.hebrew}
                  </span>
                </div>
              )}

              {drillType === 'preposition' && triad.prepositionInfo && (
                <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 max-w-sm mx-auto">
                  <span>Пример: </span>
                  <strong dir="rtl" className="font-hebrew font-bold text-zinc-800 dark:text-zinc-200">
                    {triad.prepositionInfo.exampleHe}
                  </strong>{' '}
                  ({triad.prepositionInfo.exampleRu})
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center gap-2 mx-auto cursor-pointer active:scale-95"
                >
                  <span>Дальше</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Нижняя панель: кнопка Пеалим и быстрые подсказки */}
        <div className="w-full flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onOpenPealim(currentWord)}
            className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Пеалим (таблица спряжений)</span>
          </button>
          <span className="hidden sm:inline">Горячие клавиши: 1-4 выбор ответа, Enter — далее</span>
        </div>
      </div>
    </div>
  );
};
