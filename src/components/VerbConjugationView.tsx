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
  GitBranch,
} from 'lucide-react';
import { VerbConjugation, UserProfile, Word, RootRelatedWord } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict, addWordToPersonalDict } from '@/lib/storage';

interface VerbConjugationViewProps {
  conjugation: VerbConjugation;
  userProfile: UserProfile;
  onBack: () => void;
  onAddToVocabulary?: (word: Word) => void;
  isWordInPersonalVocab?: boolean;
}

type TenseTab = 'all' | 'present' | 'past' | 'future' | 'imperative' | 'rootFamily';

export const VerbConjugationView: React.FC<VerbConjugationViewProps> = ({
  conjugation,
  userProfile,
  onBack,
  onAddToVocabulary,
  isWordInPersonalVocab,
}) => {
  const [activeTab, setActiveTab] = useState<TenseTab>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingForm, setSpeakingForm] = useState<string | null>(null);

  // Локальный трекинг добавленных слов для мгновенного обновления UI
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (conjugation.infinitive?.hebrew) {
      map[stripNikkud(conjugation.infinitive.hebrew)] = isWordInPersonalDict(conjugation.infinitive.hebrew, userProfile.personalVocabulary);
    }
    if (conjugation.rootFamily) {
      conjugation.rootFamily.forEach((rw) => {
        map[stripNikkud(rw.hebrew)] = isWordInPersonalDict(rw.hebrew, userProfile.personalVocabulary);
      });
    }
    return map;
  });

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

  const handleAddWord = (wordData: {
    hebrew: string;
    hebrewPlain?: string;
    transcription: string;
    translation: string;
    partOfSpeech: any;
    root?: string;
  }) => {
    const clean = stripNikkud(wordData.hebrew);
    const newWord = addWordToPersonalDict({
      hebrew: wordData.hebrew,
      hebrewPlain: wordData.hebrewPlain || clean,
      transcription: wordData.transcription,
      translation: wordData.translation,
      partOfSpeech: wordData.partOfSpeech || 'other',
      root: wordData.root || conjugation.root,
      lessonId: 0,
    });

    setAddedMap((prev) => ({ ...prev, [clean]: true }));
    if (onAddToVocabulary) {
      onAddToVocabulary(newWord);
    }
  };

  const isInfAdded = addedMap[stripNikkud(conjugation.infinitive.hebrew)] || isWordInPersonalDict(conjugation.infinitive.hebrew, userProfile.personalVocabulary);

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

            const isFormAdded = addedMap[stripNikkud(item.hebrew)] || isWordInPersonalDict(item.hebrew, userProfile.personalVocabulary);

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

                {/* Правая часть: Иврит, транскрипция и кнопки */}
                <div className="flex items-center gap-1.5 shrink-0">
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isFormAdded) {
                        handleAddWord({
                          hebrew: item.hebrew,
                          hebrewPlain: stripNikkud(item.hebrew),
                          transcription: item.transcription,
                          translation: item.translation,
                          partOfSpeech: 'verb',
                          root: conjugation.root,
                        });
                      }
                    }}
                    disabled={isFormAdded}
                    className={`p-1.5 rounded-lg transition ${
                      isFormAdded
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                    title={isFormAdded ? 'Уже в вашем словарике' : 'Добавить форму в словарик'}
                  >
                    {isFormAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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
          Таблица спряжений & Pealim
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

      {/* Вкладки переключения времен + Семья корня */}
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
        {conjugation.rootFamily && conjugation.rootFamily.length > 0 && (
          <button
            onClick={() => setActiveTab('rootFamily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'rootFamily'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Семья корня ({conjugation.rootFamily.length})</span>
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

        {/* Секция семьи корня (Pealim-style) */}
        {(activeTab === 'all' || activeTab === 'rootFamily') &&
          conjugation.rootFamily &&
          conjugation.rootFamily.length > 0 && (
            <div className="bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl p-3 sm:p-4 border border-purple-200 dark:border-purple-900/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200/80 dark:border-purple-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                    Семья корня {conjugation.root ? `(${conjugation.root})` : ''}
                  </h4>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                  מִשְׁפַּחַת מִלִּים
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conjugation.rootFamily.map((rw, idx) => {
                  const isWordAdded = addedMap[stripNikkud(rw.hebrew)] || isWordInPersonalDict(rw.hebrew, userProfile.personalVocabulary);
                  const isCurrentlySpeaking = speakingForm === `rf_${idx}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSpeak(rw.hebrew, `rf_${idx}`)}
                      className="group relative flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-purple-200/60 dark:border-purple-900/40 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer select-text active:scale-[0.99]"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                          {rw.translation}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {rw.binyan || rw.partOfSpeech}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex flex-col items-end">
                          <span
                            dir="rtl"
                            className={`font-bold text-slate-900 dark:text-white leading-tight ${
                              isCursive ? 'font-cursive text-xl text-purple-600' : 'font-hebrew text-lg'
                            }`}
                          >
                            {userProfile.showNikkud ? rw.hebrew : rw.hebrewPlain}
                          </span>
                          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-sans">
                            [{rw.transcription}]
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(rw.hebrew, `rf_${idx}`);
                          }}
                          className={`p-1.5 rounded-full transition-all ${
                            isCurrentlySpeaking
                              ? 'bg-purple-600 text-white animate-pulse'
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isWordAdded) {
                              handleAddWord({
                                hebrew: rw.hebrew,
                                hebrewPlain: rw.hebrewPlain,
                                transcription: rw.transcription,
                                translation: rw.translation,
                                partOfSpeech: rw.partOfSpeech,
                                root: rw.root || conjugation.root,
                              });
                            }
                          }}
                          disabled={isWordAdded}
                          className={`p-1.5 rounded-lg transition ${
                            isWordAdded
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800'
                          }`}
                          title={isWordAdded ? 'Уже в вашем словарике' : 'Добавить в словарик'}
                        >
                          {isWordAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Нижняя кнопка добавления инфинитива в словарик */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (!isInfAdded) {
              handleAddWord({
                hebrew: conjugation.infinitive.hebrew,
                hebrewPlain: stripNikkud(conjugation.infinitive.hebrew),
                transcription: conjugation.infinitive.transcription,
                translation: conjugation.infinitive.translation,
                partOfSpeech: 'verb',
                root: conjugation.root,
              });
            }
          }}
          disabled={isInfAdded}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
            isInfAdded
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isInfAdded ? (
            <>
              <Check className="w-4 h-4" />
              Глагол «{conjugation.infinitive.hebrew}» уже в вашем словарике
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Добавить инфинитив «{conjugation.infinitive.hebrew}» в словарик
            </>
          )}
        </button>
      </div>
    </div>
  );
};

