import React, { useState } from 'react';
import {
  Volume2,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Layers,
  Clock,
  Calendar,
  Zap,
  Check,
  Plus,
  Loader2,
} from 'lucide-react';
import { VerbConjugation, UserProfile, Word } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';

interface VerbConjugationViewProps {
  conjugation: VerbConjugation;
  userProfile: UserProfile;
  onBack: () => void;
  onAddToVocabulary?: (word: Word) => void;
  isWordInPersonalVocab?: boolean;
}

type TenseTab = 'all' | 'present' | 'past' | 'future' | 'imperative';

export const VerbConjugationView: React.FC<VerbConjugationViewProps> = ({
  conjugation,
  userProfile,
  onBack,
  onAddToVocabulary,
  isWordInPersonalVocab,
}) => {
  const [activeTab, setActiveTab] = useState<TenseTab>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAdded, setIsAdded] = useState(isWordInPersonalVocab || false);
  const [speakingForm, setSpeakingForm] = useState<string | null>(null);

  const isCursive = userProfile.fontStyle === 'cursive';

  const handleSpeak = (text: string, idKey?: string) => {
    if (idKey) setSpeakingForm(idKey);
    else setIsPlayingAudio(true);

    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });

    setTimeout(() => {
      setIsPlayingAudio(false);
      setSpeakingForm(null);
    }, 1200);
  };

  const handleAddInfinitive = () => {
    if (!onAddToVocabulary) return;
    const newWord: Word = {
      id: `custom_v_${Date.now()}`,
      hebrew: conjugation.infinitive.hebrew,
      hebrewPlain: stripNikkud(conjugation.infinitive.hebrew),
      transcription: conjugation.infinitive.transcription,
      translation: conjugation.infinitive.translation,
      partOfSpeech: 'verb',
      root: conjugation.root,
      lessonId: 0,
      isUserAdded: true,
      dateAdded: Date.now(),
    };
    onAddToVocabulary(newWord);
    setIsAdded(true);
  };

  const renderConjugationSection = (
    title: string,
    badgeText: string,
    icon: React.ReactNode,
    forms: typeof conjugation.present,
    tenseKey: string
  ) => {
    if (!forms || forms.length === 0) return null;

    return (
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">{icon}</span>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {title}
            </h4>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            {badgeText}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {forms.map((item, idx) => {
            const formKey = `${tenseKey}_${idx}`;
            const isCurrentlySpeaking = speakingForm === formKey;
            const displayHebrew = userProfile.showNikkud
              ? item.hebrew
              : stripNikkud(item.hebrew);

            return (
              <div
                key={idx}
                onClick={() => handleSpeak(item.hebrew, formKey)}
                className="group relative flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer select-text active:scale-[0.99]"
              >
                {/* Левая часть: Местоимение и перевод */}
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.pronoun}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    {item.translation}
                  </span>
                </div>

                {/* Правая часть: Иврит, транскрипция и кнопка звука */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end">
                    <span
                      dir="rtl"
                      className={`font-bold text-slate-900 dark:text-white leading-tight ${
                        isCursive
                          ? 'font-cursive text-xl text-blue-600 dark:text-blue-400'
                          : 'font-hebrew text-lg'
                      }`}
                    >
                      {displayHebrew}
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-sans tracking-wide">
                      [{item.transcription}]
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(item.hebrew, formKey);
                    }}
                    aria-label={`Озвучить ${item.hebrew}`}
                    className={`p-1.5 rounded-full transition-all ${
                      isCurrentlySpeaking
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] text-slate-900 dark:text-white">
      {/* Навигация назад и заголовок */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 px-2 -ml-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к слову
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
          <Sparkles className="w-3.5 h-3.5" />
          Таблица спряжений (Pealim)
        </div>
      </div>

      {/* Карточка инфинитива */}
      <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/80 dark:border-blue-800/60 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                dir="rtl"
                className={`font-black text-slate-900 dark:text-white ${
                  isCursive ? 'font-cursive text-3xl' : 'font-hebrew text-2xl'
                }`}
              >
                {userProfile.showNikkud
                  ? conjugation.infinitive.hebrew
                  : stripNikkud(conjugation.infinitive.hebrew)}
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(conjugation.infinitive.hebrew)}
                className={`p-1.5 rounded-full transition-all ${
                  isPlayingAudio
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              [{conjugation.infinitive.transcription}]
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-bold text-slate-800 dark:text-slate-100">
              {conjugation.infinitive.translation}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Инфинитив (שֵׁם הַפּוֹעַל)
            </div>
          </div>
        </div>

        {/* Бейджи биньяна и корня */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-blue-200/50 dark:border-blue-800/40">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
            Биньян: {conjugation.binyan}
          </span>
          {conjugation.root && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-100/80 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
              Корень: {conjugation.root}
            </span>
          )}
        </div>
      </div>

      {/* Вкладки переключения времен */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Все времена
        </button>
        <button
          onClick={() => setActiveTab('present')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'present'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Настоящее (הווה)
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'past'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Прошедшее (עבר)
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'future'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Будущее (עתיד)
        </button>
        {conjugation.imperative && conjugation.imperative.length > 0 && (
          <button
            onClick={() => setActiveTab('imperative')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'imperative'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Повелительное (ציווי)
          </button>
        )}
      </div>

      {/* Список таблиц с прокруткой */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2">
        {(activeTab === 'all' || activeTab === 'present') &&
          renderConjugationSection(
            'Настоящее время',
            'הוֹוֶה',
            <Clock className="w-4 h-4" />,
            conjugation.present,
            'present'
          )}

        {(activeTab === 'all' || activeTab === 'past') &&
          renderConjugationSection(
            'Прошедшее время',
            'עָבַר',
            <Calendar className="w-4 h-4" />,
            conjugation.past,
            'past'
          )}

        {(activeTab === 'all' || activeTab === 'future') &&
          renderConjugationSection(
            'Будущее время',
            'עָתִיד',
            <Zap className="w-4 h-4" />,
            conjugation.future,
            'future'
          )}

        {(activeTab === 'all' || activeTab === 'imperative') &&
          conjugation.imperative &&
          conjugation.imperative.length > 0 &&
          renderConjugationSection(
            'Повелительное наклонение',
            'צִוּוּי',
            <Sparkles className="w-4 h-4" />,
            conjugation.imperative,
            'imperative'
          )}
      </div>

      {/* Нижняя кнопка добавления в словарик */}
      {onAddToVocabulary && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleAddInfinitive}
            disabled={isAdded}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
              isAdded
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                Глагол уже в вашем словарике
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Добавить глагол «{conjugation.infinitive.hebrew}» в словарик
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
