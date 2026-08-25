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

type ConjugationViewMode = 'pealimTable' | 'rootFamily' | 'cards';

export const VerbConjugationView: React.FC<VerbConjugationViewProps> = ({
  conjugation,
  userProfile,
  onBack,
  onAddToVocabulary,
  isWordInPersonalVocab,
}) => {
  const [viewMode, setViewMode] = useState<ConjugationViewMode>('pealimTable');
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
  // Парсинг форм в стандартную 2D-матрицу Pealim
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
  // Рендерер ячейки Pealim с акцентом ударения и звуком
  // =========================================================================
  const renderPealimCell = (form: ConjugationForm | undefined, cellKey: string, customPronounLabel?: string) => {
    if (!form) {
      return (
        <div className="p-2 text-center text-slate-300 dark:text-slate-600 text-xs">—</div>
      );
    }

    const isSpeaking = speakingForm === cellKey;
    const isAdded =
      addedMap[stripNikkud(form.hebrew)] ||
      isWordInPersonalDict(form.hebrew, userProfile.personalVocabulary);

    // Подсветка ударного гласного в транскрипции (по образцу Pealim)
    const renderTranscription = (t: string) => {
      // Ищем гласные с ударением: á, é, ó, ӣ, ӯ, или русские а́, е́, и́, о́, у́, э́, ю́, я́
      const parts = t.split(/([áéóíúӣӯА́Е́И́О́У́Э́Ю́Я́а́е́и́о́у́э́ю́я́])/g);
      return parts.map((part, i) =>
        /[áéóíúӣӯА́Е́И́О́У́Э́Ю́Я́а́е́и́о́у́э́ю́я́]/.test(part) ? (
          <span key={i} className="text-red-500 font-bold">
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
        className="group relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer select-text"
      >
        {/* Кнопка динамика и плюс в словарь */}
        <div className="flex items-center gap-1.5 mb-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSpeak(form.hebrew, cellKey);
            }}
            className={`p-1 rounded-full transition ${
              isSpeaking
                ? 'bg-blue-600 text-white animate-pulse'
                : 'text-slate-400 group-hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
            title="Озвучить форму"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Иврит с никкудом */}
          <span
            dir="rtl"
            className={`font-bold text-slate-900 dark:text-white ${
              isCursive
                ? 'font-cursive text-xl sm:text-2xl text-blue-600 dark:text-blue-400'
                : 'font-hebrew text-base sm:text-lg'
            }`}
          >
            {userProfile.showNikkud ? form.hebrew : stripNikkud(form.hebrew)}
          </span>

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
            className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition ${
              isAdded
                ? 'bg-emerald-50 text-emerald-600 opacity-100'
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title={isAdded ? 'Уже в словаре' : 'Добавить эту форму в словарь'}
          >
            {isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>

        {/* Транскрипция с ударением */}
        <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium text-center">
          {renderTranscription(form.transcription)}
        </div>

        {/* Подсказка местоимения / перевода */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-full text-center mt-0.5">
          {customPronounLabel || form.pronoun}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Шапка глагола Pealim */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 sm:p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition shrink-0"
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

      {/* Навигационные вкладки Pealim */}
      <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setViewMode('pealimTable')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              viewMode === 'pealimTable'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4 text-blue-500" />
            <span>Таблица Pealim (Классическая)</span>
          </button>

          {conjugation.rootFamily && conjugation.rootFamily.length > 0 && (
            <button
              onClick={() => setViewMode('rootFamily')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                viewMode === 'rootFamily'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
              }`}
            >
              <GitBranch className="w-4 h-4 text-purple-500" />
              <span>Семья корня ({conjugation.rootFamily.length})</span>
            </button>
          )}

          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">По карточкам</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. КЛАССИЧЕСКАЯ 2D ТАБЛИЦА PEALIM (1 В 1 КАК НА PEALIM.COM) */}
      {/* ========================================================================= */}
      {viewMode === 'pealimTable' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              {/* Верхняя строка заголовков: Единственное и Множественное число */}
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th rowSpan={2} className="py-2.5 px-3 w-32 border-r border-slate-200 dark:border-slate-800 text-center bg-slate-100/70 dark:bg-slate-800">
                  Форма глагола
                </th>
                <th rowSpan={2} className="py-2.5 px-2 w-14 border-r border-slate-200 dark:border-slate-800 text-center bg-slate-100/70 dark:bg-slate-800">
                  Лицо
                </th>
                <th colSpan={2} className="py-2 px-3 text-center border-r border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                  Единственное число
                </th>
                <th colSpan={2} className="py-2 px-3 text-center text-purple-600 dark:text-purple-400 bg-purple-50/40 dark:bg-purple-950/20">
                  Множественное число
                </th>
              </tr>
              {/* Вторая строка заголовков: Мужской и Женский род */}
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-1.5 px-2 text-center border-r border-slate-100 dark:border-slate-800 text-xs">
                  Мужской род
                </th>
                <th className="py-1.5 px-2 text-center border-r border-slate-200 dark:border-slate-800 text-xs">
                  Женский род
                </th>
                <th className="py-1.5 px-2 text-center border-r border-slate-100 dark:border-slate-800 text-xs">
                  Мужской род
                </th>
                <th className="py-1.5 px-2 text-center text-xs">
                  Женский род
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {/* ---------------------------------------------------- */}
              {/* СЕКЦИЯ 1: НАСТОЯЩЕЕ ВРЕМЯ (הוֹוֶה / בֵּינוֹנִי) */}
              {/* ---------------------------------------------------- */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Настоящее время / причастие</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center text-slate-400 border-r border-slate-200 dark:border-slate-800 font-medium">
                  —
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(presMs, 'pres_ms', 'זָכָר יָחִיד (он / я / ты)')}
                </td>
                <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(presFs, 'pres_fs', 'נְקֵבָה יְחִידָה (она / я / ты)')}
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(presMp, 'pres_mp', 'זָכָר רַבִּים (они / мы / вы)')}
                </td>
                <td className="p-1.5">
                  {renderPealimCell(presFp, 'pres_fp', 'נְקֵבָה רַבּוֹת (они / мы / вы)')}
                </td>
              </tr>

              {/* ---------------------------------------------------- */}
              {/* СЕКЦИЯ 2: ПРОШЕДШЕЕ ВРЕМЯ (עָבָר) */}
              {/* ---------------------------------------------------- */}
              {/* 1-е лицо: я / мы */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition border-t-2 border-slate-200 dark:border-slate-700">
                <td rowSpan={3} className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 align-top">
                  <div className="flex items-center gap-1.5 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Прошедшее время</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                  1-е
                </td>
                <td colSpan={2} className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(past1s, 'past_1s', 'אֲנִי (я)')}
                </td>
                <td colSpan={2} className="p-1.5">
                  {renderPealimCell(past1p, 'past_1p', 'אֲנַחְנוּ (мы)')}
                </td>
              </tr>
              {/* 2-е лицо: ты / вы */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                  2-е
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(past2ms, 'past_2ms', 'אַתָּה (ты м.р.)')}
                </td>
                <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(past2fs, 'past_2fs', 'אַתְּ (ты ж.р.)')}
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(past2mp, 'past_2mp', 'אַתֶּם (вы м.р.)')}
                </td>
                <td className="p-1.5">
                  {renderPealimCell(past2fp, 'past_2fp', 'אַתֶּן (вы ж.р.)')}
                </td>
              </tr>
              {/* 3-е лицо: он / она / они */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                  3-е
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(past3ms, 'past_3ms', 'הוּא (он)')}
                </td>
                <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(past3fs, 'past_3fs', 'הִיא (она)')}
                </td>
                <td colSpan={2} className="p-1.5">
                  {renderPealimCell(past3p, 'past_3p', 'הֵם / הֵן (они)')}
                </td>
              </tr>

              {/* ---------------------------------------------------- */}
              {/* СЕКЦИЯ 3: БУДУЩЕЕ ВРЕМЯ (עָתִיד) */}
              {/* ---------------------------------------------------- */}
              {/* 1-е лицо */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition border-t-2 border-slate-200 dark:border-slate-700">
                <td rowSpan={3} className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 align-top">
                  <div className="flex items-center gap-1.5 mt-2">
                    <Zap className="w-3.5 h-3.5 text-purple-500" />
                    <span>Будущее время</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                  1-е
                </td>
                <td colSpan={2} className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(fut1s, 'fut_1s', 'אֲנִי (я)')}
                </td>
                <td colSpan={2} className="p-1.5">
                  {renderPealimCell(fut1p, 'fut_1p', 'אֲנַחְנוּ (мы)')}
                </td>
              </tr>
              {/* 2-е лицо */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                  2-е
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(fut2ms, 'fut_2ms', 'אַתָּה (ты м.р.)')}
                </td>
                <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(fut2fs, 'fut_2fs', 'אַתְּ (ты ж.р.)')}
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(fut2mp, 'fut_2mp', 'אַתֶּם (вы м.р.)')}
                </td>
                <td className="p-1.5">
                  {renderPealimCell(fut2fp, 'fut_2fp', 'אַתֶּן (вы ж.р.)')}
                </td>
              </tr>
              {/* 3-е лицо */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                  3-е
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(fut3ms, 'fut_3ms', 'הוּא (он)')}
                </td>
                <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                  {renderPealimCell(fut3fs, 'fut_3fs', 'הִיא (она)')}
                </td>
                <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                  {renderPealimCell(fut3mp, 'fut_3mp', 'הֵם (они м.р.)')}
                </td>
                <td className="p-1.5">
                  {renderPealimCell(fut3fp, 'fut_3fp', 'הֵן (они ж.р.)')}
                </td>
              </tr>

              {/* ---------------------------------------------------- */}
              {/* СЕКЦИЯ 4: ПОВЕЛИТЕЛЬНОЕ НАКЛОНЕНИЕ (צִוּוּי) */}
              {/* ---------------------------------------------------- */}
              {impMs && (
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition border-t-2 border-slate-200 dark:border-slate-700">
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Повелительное наклонение</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                    2-е
                  </td>
                  <td className="p-1.5 border-r border-slate-100 dark:border-slate-800">
                    {renderPealimCell(impMs, 'imp_ms', 'אַתָּה (м.р.)')}
                  </td>
                  <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                    {renderPealimCell(impFs, 'imp_fs', 'אַתְּ (ж.р.)')}
                  </td>
                  <td colSpan={2} className="p-1.5">
                    {renderPealimCell(impP, 'imp_p', 'אַתֶּם / אַתֶּן (мн.ч.)')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. СЕМЬЯ КОРНЯ PEALIM (משפחת השורש) */}
      {/* ========================================================================= */}
      {viewMode === 'rootFamily' && conjugation.rootFamily && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-600" />
                <span>Семья корня (משפחת השורש): {conjugation.root}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Однокоренные существительные, прилагательные и другие биньяны
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
              {conjugation.rootFamily.length} слов
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
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-purple-400 transition cursor-pointer"
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
                          : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
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
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 hover:border-purple-400 hover:text-purple-600'
                      }`}
                      title={isAdded ? 'Уже в словаре' : 'Добавить в словарь'}
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

      {/* ========================================================================= */}
      {/* 3. РЕЖИМ СПИСКА КАРТОЧЕК */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {/* Настоящее */}
          {conjugation.present && conjugation.present.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Настоящее время (הוֹוֶה)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conjugation.present.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleSpeak(item.hebrew, `p_${i}`)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.translation}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.pronoun} • [{item.transcription}]
                      </div>
                    </div>
                    <span dir="rtl" className="font-hebrew font-bold text-base">
                      {userProfile.showNikkud ? item.hebrew : stripNikkud(item.hebrew)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Прошедшее */}
          {conjugation.past && conjugation.past.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Прошедшее время (עָבָר)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conjugation.past.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleSpeak(item.hebrew, `pst_${i}`)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.translation}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.pronoun} • [{item.transcription}]
                      </div>
                    </div>
                    <span dir="rtl" className="font-hebrew font-bold text-base">
                      {userProfile.showNikkud ? item.hebrew : stripNikkud(item.hebrew)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Будущее */}
          {conjugation.future && conjugation.future.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>Будущее время (עָתִיד)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conjugation.future.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => handleSpeak(item.hebrew, `f_${i}`)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.translation}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.pronoun} • [{item.transcription}]
                      </div>
                    </div>
                    <span dir="rtl" className="font-hebrew font-bold text-base">
                      {userProfile.showNikkud ? item.hebrew : stripNikkud(item.hebrew)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
