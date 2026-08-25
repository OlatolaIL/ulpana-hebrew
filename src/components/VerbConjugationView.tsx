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
  GitBranch,
  Table,
  LayoutGrid,
} from 'lucide-react';
import { VerbConjugation, UserProfile, Word, RootRelatedWord, ConjugationForm } from '@/types';
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

type TenseTab = 'all' | 'present' | 'past' | 'future' | 'rootFamily';

export const VerbConjugationView: React.FC<VerbConjugationViewProps> = ({
  conjugation,
  userProfile,
  onBack,
  onAddToVocabulary,
  isWordInPersonalVocab,
}) => {
  const [activeTab, setActiveTab] = useState<TenseTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [speakingForm, setSpeakingForm] = useState<string | null>(null);

  // Локальный трекинг добавленных слов
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (conjugation.infinitive?.hebrew) {
      map[stripNikkud(conjugation.infinitive.hebrew)] = isWordInPersonalDict(
        conjugation.infinitive.hebrew,
        userProfile.personalVocabulary
      );
    }
    if (conjugation.rootFamily) {
      conjugation.rootFamily.forEach((rw) => {
        map[stripNikkud(rw.hebrew)] = isWordInPersonalDict(
          rw.hebrew,
          userProfile.personalVocabulary
        );
      });
    }
    return map;
  });

  const isCursive = userProfile.fontStyle === 'cursive';

  const handleSpeak = (text: string, idKey?: string) => {
    if (idKey) setSpeakingForm(idKey);
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
    setTimeout(() => {
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

  const isInfAdded =
    addedMap[stripNikkud(conjugation.infinitive.hebrew)] ||
    isWordInPersonalDict(conjugation.infinitive.hebrew, userProfile.personalVocabulary);

  // =========================================================================
  // Парсинг форм в слоты
  // =========================================================================
  const findForm = (list: ConjugationForm[] | undefined, matchers: string[]): ConjugationForm | undefined => {
    if (!list || list.length === 0) return undefined;
    for (const m of matchers) {
      const found = list.find((item) =>
        item.pronoun.toLowerCase().includes(m.toLowerCase())
      );
      if (found) return found;
    }
    return undefined;
  };

  // Настоящее время
  const presList = conjugation.present || [];
  const presMs = findForm(presList, ['זָכָר יָחִיד', 'он', 'м.р. ед', 'я (м.р.)']) || presList[0];
  const presFs = findForm(presList, ['נְקֵבָה יְחִידָה', 'она', 'ж.р. ед', 'я (ж.р.)']) || presList[1];
  const presMp = findForm(presList, ['זָכָר רַבִּים', 'они (м.р.)', 'м.р. мн', 'мы (м.р.)']) || presList[2];
  const presFp = findForm(presList, ['נְקֵבָה רַבּוֹת', 'они (ж.р.)', 'ж.р. мн', 'мы (ж.р.)']) || presList[3];

  // Прошедшее время
  const pastList = conjugation.past || [];
  const past1s = findForm(pastList, ['אֲנִי', 'я', '1-е ед', '1s']) || pastList[0];
  const past1p = findForm(pastList, ['אֲנַחְנוּ', 'мы', '1-е мн', '1p']) || pastList[5];

  const past2ms = findForm(pastList, ['אַתָּה', 'ты (м.р.)', '2-е м.р. ед', 'ты м.р.']) || pastList[1];
  const past2fs = findForm(pastList, ['אַתְּ', 'ты (ж.р.)', '2-е ж.р. ед', 'ты ж.р.']) || pastList[2];
  const past2mp = findForm(pastList, ['אַתֶּם', 'вы (м.р.)', '2-е м.р. мн', 'вы м.р.', 'אַתֶּם / אַתֶּן']) || pastList[6];
  const past2fp = findForm(pastList, ['אַתֶּן', 'вы (ж.р.)', '2-е ж.р. мн', 'вы ж.р.']) || past2mp;

  const past3ms = findForm(pastList, ['הוּא', 'он', '3-е м.р. ед', 'он']) || pastList[3];
  const past3fs = findForm(pastList, ['הִיא', 'она', '3-е ж.р. ед', 'она']) || pastList[4];
  const past3p = findForm(pastList, ['הֵם', 'הֵן', 'они', '3-е мн', '3p', 'הֵם / הֵן']) || pastList[7] || pastList[pastList.length - 1];

  // Будущее время
  const futList = conjugation.future || [];
  const fut1s = findForm(futList, ['אֲנִי', 'я', '1-е ед', '1s']) || futList[0];
  const fut1p = findForm(futList, ['אֲנַחְנוּ', 'мы', '1-е мн', '1p']) || futList[4];

  const fut2ms = findForm(futList, ['אַתָּה', 'ты (м.р.)', 'ты м.р.', 'אַתָּה / הִיא']) || futList[1];
  const fut2fs = findForm(futList, ['אַתְּ', 'ты (ж.р.)', 'ты ж.р.']) || futList[2];
  const fut2mp = findForm(futList, ['אַתֶּם', 'вы (м.р.)', 'вы', 'אַתֶּם / אַתֶּן']) || futList[5];
  const fut2fp = findForm(futList, ['אַתֶּן', 'вы (ж.р.)']) || fut2mp;

  const fut3ms = findForm(futList, ['הוּא', 'он', '3-е м.р.']) || futList[3];
  const fut3fs = findForm(futList, ['הִיא', 'она', '3-е ж.р.', 'אַתָּה / הִיא']) || fut2ms;
  const fut3mp = findForm(futList, ['הֵם', 'они (м.р.)', 'они', 'הֵם / הֵן']) || futList[6] || futList[futList.length - 1];
  const fut3fp = findForm(futList, ['הֵן', 'они (ж.р.)']) || fut3mp;

  // Повелительное наклонение
  const impList = conjugation.imperative || [];
  const impMs = findForm(impList, ['אַתָּה', 'м.р.', 'ты (м.р.)']) || impList[0];
  const impFs = findForm(impList, ['אַתְּ', 'ж.р.', 'ты (ж.р.)']) || impList[1];
  const impP = findForm(impList, ['אַתֶּם', 'мн.ч.', 'вы', 'אַתֶּם / אַתֶּן']) || impList[2];

  // =========================================================================
  // Рендерер ячейки Pealim (Адаптивный 2-колоночный тайл без наложения текста)
  // =========================================================================
  const renderPealimCell = (
    form: ConjugationForm | undefined,
    cellKey: string,
    pronounLabel: string,
    hebrewPronoun?: string
  ) => {
    if (!form) {
      return (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs flex items-center justify-center">
          —
        </div>
      );
    }

    const isSpeaking = speakingForm === cellKey;
    const isAdded =
      addedMap[stripNikkud(form.hebrew)] ||
      isWordInPersonalDict(form.hebrew, userProfile.personalVocabulary);

    const renderTranscription = (t: string) => {
      const parts = t.split(/([áéóíúӣӯА́Е́И́О́У́Э́Ю́Я́а́е́и́о́у́э́ю́я́])/g);
      return parts.map((part, i) =>
        /[áéóíúӣӯА́Е́И́О́У́Э́Ю́Я́а́е́и́о́у́э́ю́я́]/.test(part) ? (
          <span key={i} className="text-red-500 dark:text-red-400 font-bold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    };

    return (
      <div
        onClick={() => handleSpeak(form.hebrew, cellKey)}
        className="group relative flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-text active:scale-[0.98] shadow-sm"
      >
        {/* Верхняя строка: Местоимение/Лицо и кнопки действий */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 truncate">
              {pronounLabel}
            </span>
            {hebrewPronoun && (
              <span dir="rtl" className="text-[10px] font-hebrew font-bold text-slate-400 hidden sm:inline">
                ({hebrewPronoun})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(form.hebrew, cellKey);
              }}
              className={`p-1 rounded-lg transition ${
                isSpeaking
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
              title="Озвучить форму"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isAdded) {
                  handleAddWord({
                    hebrew: form.hebrew,
                    transcription: form.transcription,
                    translation: form.translation,
                    partOfSpeech: 'verb',
                  });
                }
              }}
              disabled={isAdded}
              className={`p-1 rounded-lg transition ${
                isAdded
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
              title={isAdded ? 'Уже в словаре' : 'Добавить эту форму в словарь'}
            >
              {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Центр: Иврит крупно */}
        <div className="text-center my-1.5">
          <span
            dir="rtl"
            className={`font-bold block tracking-wide text-slate-900 dark:text-slate-100 ${
              isCursive
                ? 'font-cursive text-2xl sm:text-3xl text-blue-600 dark:text-blue-400 leading-tight'
                : 'font-hebrew text-lg sm:text-xl'
            }`}
          >
            {userProfile.showNikkud ? form.hebrew : stripNikkud(form.hebrew)}
          </span>
        </div>

        {/* Низ: Транскрипция с ударением + русский перевод */}
        <div className="text-center space-y-0.5 mt-1 border-t border-slate-100 dark:border-slate-700/60 pt-1">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
            {renderTranscription(form.transcription)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 truncate">
            {form.translation}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      {/* Шапка глагола Pealim */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 sm:p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition shrink-0 cursor-pointer"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                {conjugation.binyan}
              </span>
              {conjugation.root && (
                <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400/30 text-yellow-200 border border-yellow-300/30">
                  שורש: {conjugation.root}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2.5">
              <h2
                dir="rtl"
                className={`font-black text-2xl sm:text-3xl ${
                  isCursive ? 'font-cursive text-3xl sm:text-4xl' : 'font-hebrew'
                }`}
              >
                {userProfile.showNikkud
                  ? conjugation.infinitive.hebrew
                  : stripNikkud(conjugation.infinitive.hebrew)}
              </h2>
              <span className="text-blue-200 text-xs sm:text-sm font-semibold">
                [{conjugation.infinitive.transcription}]
              </span>
            </div>
            <p className="text-white/90 text-xs sm:text-sm font-medium mt-0.5">
              {conjugation.infinitive.translation}
            </p>
          </div>
        </div>

        {/* Действия в шапке */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleSpeak(conjugation.infinitive.hebrew, 'inf')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 text-xs font-bold"
            title="Озвучить инфинитив"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Озвучить</span>
          </button>

          <button
            type="button"
            onClick={() =>
              !isInfAdded &&
              handleAddWord({
                hebrew: conjugation.infinitive.hebrew,
                transcription: conjugation.infinitive.transcription,
                translation: conjugation.infinitive.translation,
                partOfSpeech: 'verb',
              })
            }
            disabled={isInfAdded}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isInfAdded
                ? 'bg-emerald-500/30 text-white border border-emerald-400/50'
                : 'bg-white text-blue-600 hover:bg-blue-50 shadow-md'
            }`}
          >
            {isInfAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>В словаре</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>В словарь</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Навигационные вкладки времен (Адаптивные) */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Все формы
          </button>
          <button
            onClick={() => setActiveTab('present')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'present'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Настоящее
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'past'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Прошедшее
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'future'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Будущее
          </button>
          {conjugation.rootFamily && conjugation.rootFamily.length > 0 && (
            <button
              onClick={() => setActiveTab('rootFamily')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
                activeTab === 'rootFamily'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Семья ({conjugation.rootFamily.length})</span>
            </button>
          )}
        </div>

        {/* Переключатель вида на десктопе */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Вид: Сетка карточек"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Вид: Плоская таблица"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. СЕТКА КАРТОЧЕК (СИММЕТРИЧНАЯ 2-КОЛОНОЧНАЯ БЕЗ НАЛОЖЕНИЯ ТЕКСТА) */}
      {/* ========================================================================= */}
      {(viewMode === 'grid' || true) && (
        <div className="space-y-4">
          {/* НАСТОЯЩЕЕ ВРЕМЯ */}
          {(activeTab === 'all' || activeTab === 'present') && (
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                  <span>Настоящее время / Причастие (הוֹוֶה)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  4 формы
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {renderPealimCell(presMs, 'pres_ms', 'Ед.ч. Мужской', 'זָכָר יָחִיד')}
                {renderPealimCell(presFs, 'pres_fs', 'Ед.ч. Женский', 'נְקֵבָה יְחִידָה')}
                {renderPealimCell(presMp, 'pres_mp', 'Мн.ч. Мужской', 'זָכָר רַבִּים')}
                {renderPealimCell(presFp, 'pres_fp', 'Мн.ч. Женский', 'נְקֵבָה רַבּוֹת')}
              </div>
            </div>
          )}

          {/* ПРОШЕДШЕЕ ВРЕМЯ */}
          {(activeTab === 'all' || activeTab === 'past') && (
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                  <Calendar className="w-4 h-4" />
                  <span>Прошедшее время (עָבָר)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  8 форм
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {renderPealimCell(past1s, 'past_1s', '1-е: Я', 'אֲנִי')}
                {renderPealimCell(past1p, 'past_1p', '1-е: Мы', 'אֲנַחְנוּ')}
                {renderPealimCell(past2ms, 'past_2ms', '2-е: Ты м.р.', 'אַתָּה')}
                {renderPealimCell(past2fs, 'past_2fs', '2-е: Ты ж.р.', 'אַתְּ')}
                {renderPealimCell(past2mp, 'past_2mp', '2-е: Вы м.р.', 'אַתֶּם')}
                {renderPealimCell(past2fp, 'past_2fp', '2-е: Вы ж.р.', 'אַתֶּן')}
                {renderPealimCell(past3ms, 'past_3ms', '3-е: Он', 'הוּא')}
                {renderPealimCell(past3fs, 'past_3fs', '3-е: Она', 'הִיא')}
                <div className="col-span-2">
                  {renderPealimCell(past3p, 'past_3p', '3-е: Они (м./ж.)', 'הֵם / הֵן')}
                </div>
              </div>
            </div>
          )}

          {/* БУДУЩЕЕ ВРЕМЯ */}
          {(activeTab === 'all' || activeTab === 'future') && (
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                  <Zap className="w-4 h-4" />
                  <span>Будущее время (עָתִיד)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                  Формы будущего
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {renderPealimCell(fut1s, 'fut_1s', '1-е: Я', 'אֲנִי')}
                {renderPealimCell(fut1p, 'fut_1p', '1-е: Мы', 'אֲנַחְנוּ')}
                {renderPealimCell(fut2ms, 'fut_2ms', '2-е: Ты м.р.', 'אַתָּה')}
                {renderPealimCell(fut2fs, 'fut_2fs', '2-е: Ты ж.р.', 'אַתְּ')}
                {renderPealimCell(fut2mp, 'fut_2mp', '2-е: Вы м.р.', 'אַתֶּם')}
                {renderPealimCell(fut2fp, 'fut_2fp', '2-е: Вы ж.р.', 'אַתֶּן')}
                {renderPealimCell(fut3ms, 'fut_3ms', '3-е: Он', 'הוּא')}
                {renderPealimCell(fut3fs, 'fut_3fs', '3-е: Она', 'הִיא')}
                {renderPealimCell(fut3mp, 'fut_3mp', '3-е: Они м.р.', 'הֵם')}
                {renderPealimCell(fut3fp, 'fut_3fp', '3-е: Они ж.р.', 'הֵן')}
              </div>
            </div>
          )}

          {/* ПОВЕЛИТЕЛЬНОЕ НАКЛОНЕНИЕ */}
          {impMs && (activeTab === 'all' || activeTab === 'present') && (
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Повелительное наклонение (צִוּוּי)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {renderPealimCell(impMs, 'imp_ms', '2-е: Ты м.р.', 'אַתָּה')}
                {renderPealimCell(impFs, 'imp_fs', '2-е: Ты ж.р.', 'אַתְּ')}
                <div className="col-span-2 sm:col-span-1">
                  {renderPealimCell(impP, 'imp_p', '2-е: Вы (мн.ч.)', 'אַתֶּם / אַתֶּן')}
                </div>
              </div>
            </div>
          )}

          {/* СЕМЬЯ КОРНЯ */}
          {(activeTab === 'all' || activeTab === 'rootFamily') && conjugation.rootFamily && conjugation.rootFamily.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-3xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                  <GitBranch className="w-4 h-4" />
                  <span>Семья корня (משפחת השורש)</span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  שורש: {conjugation.root}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {conjugation.rootFamily.map((rw, idx) => {
                  const clean = stripNikkud(rw.hebrew);
                  const isAdded =
                    addedMap[clean] || isWordInPersonalDict(rw.hebrew, userProfile.personalVocabulary);
                  const isSpeaking = speakingForm === `rf_${idx}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSpeak(rw.hebrew, `rf_${idx}`)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-purple-400 transition cursor-pointer shadow-sm"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {rw.translation}
                          </span>
                          {rw.binyan && (
                            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-semibold">
                              {rw.binyan}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          [{rw.transcription}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          dir="rtl"
                          className={`font-bold text-slate-900 dark:text-white ${
                            isCursive ? 'font-cursive text-xl' : 'font-hebrew text-base'
                          }`}
                        >
                          {userProfile.showNikkud ? rw.hebrew : rw.hebrewPlain}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(rw.hebrew, `rf_${idx}`);
                          }}
                          className={`p-1.5 rounded-full transition ${
                            isSpeaking
                              ? 'bg-purple-600 text-white animate-pulse'
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAdded) {
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
                          disabled={isAdded}
                          className={`p-1.5 rounded-xl border transition ${
                            isAdded
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-400'
                          }`}
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
