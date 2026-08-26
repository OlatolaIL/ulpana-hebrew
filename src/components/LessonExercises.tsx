'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  RotateCcw,
  Sparkles,
  SkipForward,
  Bot,
  ListTodo,
  Undo2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, Exercise } from '@/types';
import { markLessonTabCompleted } from '@/lib/storage';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { getHebrewPictogram } from '@/lib/pictograms';
import { ULPAN_OFFLINE_DICTIONARY } from '@/lib/ulpanDictionary';
import { parseHebrewSentence, stripPunctuation, isPunctuationToken, areWordsEqual } from '@/lib/sentenceParser';

interface LessonExercisesProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const LessonExercises: React.FC<LessonExercisesProps> = ({
  lesson,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedSentenceIndices, setSelectedSentenceIndices] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});

  const isUlpan = Boolean(userProfile.ulpanMode);
  const exercises = lesson.exercises;
  const currentEx = exercises[currentIdx];

  const getUlpanOptionDisplay = (opt: string): string => {
    if (!isUlpan) {
      const isHeb = /[\u0590-\u05FF]/.test(opt);
      return isHeb && !userProfile.showNikkud ? stripNikkud(opt) : opt;
    }

    // If already Hebrew
    if (/[\u0590-\u05FF]/.test(opt)) {
      return userProfile.showNikkud ? opt : stripNikkud(opt);
    }

    const gramLower = opt.toLowerCase().trim();
    if (gramLower.includes('мужской') || gramLower === 'м.р.') return 'זָכָר ♂';
    if (gramLower.includes('женский') || gramLower === 'ж.р.') return 'נְקֵבָה ♀';
    if (gramLower.includes('общий')) return 'כְּלָלִי ⚥';
    if (gramLower.includes('единственное')) return 'יָחִיד (1)';
    if (gramLower.includes('множественное')) return 'רַבִּים (2+)';
    if (gramLower === 'да' || gramLower === 'верно' || gramLower === 'правильно') return 'כֵּן / נָכוֹן ✔️';
    if (gramLower === 'нет' || gramLower === 'неверно' || gramLower === 'неправильно') return 'לֹא / לֹא נָכוֹן ❌';

    // Look up in lesson vocabulary
    if (lesson && lesson.vocabulary) {
      for (const w of lesson.vocabulary) {
        const tr = (w.translation || '').toLowerCase();
        if (tr.includes(gramLower) || gramLower.includes(tr) || gramLower.split(';').some(s => tr.includes(s.trim()))) {
          const pic = getHebrewPictogram(w.hebrew);
          const heb = userProfile.showNikkud ? w.hebrew : (w.hebrewPlain || stripNikkud(w.hebrew));
          return pic ? `${pic} ${heb}` : heb;
        }
      }
    }

    // Look up in offline dictionary
    for (const entry of ULPAN_OFFLINE_DICTIONARY) {
      const tr = (entry.translation || '').toLowerCase();
      if (tr.includes(gramLower) || gramLower.includes(tr) || gramLower.split(';').some(s => tr.includes(s.trim()))) {
        const pic = getHebrewPictogram(entry.hebrew);
        const heb = userProfile.showNikkud ? entry.hebrew : (entry.hebrewPlain || stripNikkud(entry.hebrew));
        return pic ? `${pic} ${heb}` : heb;
      }
    }

    return opt;
  };

  const findHebrewForRussian = (ruText: string): { hebrew: string; icon?: string } | null => {
    const cleanRu = ruText.toLowerCase().trim();
    if (!cleanRu) return null;

    if (lesson && lesson.vocabulary) {
      for (const w of lesson.vocabulary) {
        const tr = (w.translation || '').toLowerCase();
        if (tr.includes(cleanRu) || cleanRu.includes(tr) || cleanRu.split(/[,;/]/).some((s) => s.trim() && tr.includes(s.trim()))) {
          const pic = getHebrewPictogram(w.hebrew);
          return {
            hebrew: userProfile.showNikkud ? w.hebrew : (w.hebrewPlain || stripNikkud(w.hebrew)),
            icon: pic || undefined,
          };
        }
      }
    }

    for (const entry of ULPAN_OFFLINE_DICTIONARY) {
      const tr = (entry.translation || '').toLowerCase();
      if (tr.includes(cleanRu) || cleanRu.includes(tr) || cleanRu.split(/[,;/]/).some((s) => s.trim() && tr.includes(s.trim()))) {
        const pic = getHebrewPictogram(entry.hebrew);
        return {
          hebrew: userProfile.showNikkud ? entry.hebrew : (entry.hebrewPlain || stripNikkud(entry.hebrew)),
          icon: pic || undefined,
        };
      }
    }

    return null;
  };

  const getUlpanQuestionText = (question: string): string => {
    // ⚠️ Normal mode: returned completely unchanged — do NOT remove this guard
    if (!isUlpan) return question;

    // ── 1. Russian-to-Hebrew questions: "Как переводится «вода» на иврит?" / "Какое ивритское слово означает «рынок»?"
    if (
      (question.includes('Как переводится') && question.includes('на иврит')) ||
      question.includes('Какое ивритское слово означает') ||
      question.includes('Как сказать')
    ) {
      const m = question.match(/«([^»]+)»/);
      if (m) {
        const inner = m[1].trim();
        // If the quoted term is already Hebrew
        if (/[\u0590-\u05FF]/.test(inner)) {
          return `?אֵיךְ אוֹמְרִים «${inner}» בְּעִבְרִית`;
        }
        // If Russian, look up the Hebrew counterpart and its visual pictogram
        const found = findHebrewForRussian(inner);
        if (found?.icon) {
          return `?אֵיךְ אוֹמְרִים ${found.icon} בְּעִבְרִית`;
        }
      }
      return '?בַּחֲרוּ אֶת הַמִּילָּה הָעִבְרִית הַנְּכוֹנָה';
    }

    // ── 2. "Выберите правильный перевод для слова «HEBREW»:" / "Что означает слово «HEBREW»?"
    if (
      question.includes('Выберите правильный перевод') ||
      question.includes('Выберите верный перевод') ||
      question.includes('Что означает слово')
    ) {
      const m = question.match(/«([^»]+)»/);
      if (m && /[\u0590-\u05FF]/.test(m[1])) {
        return `?מָה פֵּרוּשׁ הַמִּילָּה «${m[1]}»`;
      }
      return '?בַּחֲרוּ אֶת הַתַּרְגּוּם הַנָּכוֹן';
    }

    // ── 3. Grammatical gender / form questions
    if (question.includes('Выберите правильный род')) {
      return question.replace(/Выберите правильный род для\s*(«[^»]+»|местоимения «[^»]+»)\s*:/i, 'בַּחֲרוּ זָכָר ♂ אוֹ נְקֵבָה ♀ עֲבוּר $1 :');
    }
    if (question.includes('Выберите правильную форму')) {
      return 'בַּחֲרוּ אֶת הַצּוּרָה הַנְּכוֹנָה:';
    }
    if (question.includes('Что изучается в уроке')) {
      return 'מַהוּ נוֹשֵׂא הַשִּׁיעוּר?';
    }

    // ── 4. Fill in the blank: "Вставьте пропущенное слово: «...» (...):"
    if (question.includes('Вставьте') || question.includes('Заполните') || question.includes('пропуск')) {
      const m = question.match(/«([^»]+)»/);
      if (m && /[\u0590-\u05FF]/.test(m[1])) {
        // Strip the parenthetical Russian translation: «... (translation).»
        const sentencePart = m[1].replace(/\s*\([^)]+\)\.?$/, '').trim();
        return `הַשְׁלִימוּ אֶת הַמִּשְׁפָּט: «${sentencePart}»`;
      }
      return 'הַשְׁלִימוּ אֶת הַמִּילָּה הַחֲסֵרָה:';
    }

    // ── 5. Sentence builder: "Соберите предложение «...» на иврите:"
    if (question.includes('Соберите предложение') || question.includes('Соберите фразу') || question.includes('порядок')) {
      return 'סַדְּרוּ אֶת הַמִּשְׁפָּט בְּסֵדֶר נָכוֹן:';
    }

    // ── 6. Audio listening: "Послушайте аудиозапись и определите перевод слова «...»:"
    if (question.includes('Послушайте') || question.includes('аудио')) {
      const m = question.match(/«([^»]+)»/);
      if (m && /[\u0590-\u05FF]/.test(m[1])) {
        return `?🔊 הַאֲזִינוּ — מָה פֵּרוּשׁ «${m[1]}»`;
      }
      return '?🔊 הַאֲזִינוּ וּבַחֲרוּ אֶת הַתַּרְגּוּם הַנָּכוֹן';
    }

    // ── 7. Fallback for any remaining Russian text
    if (/[а-яёА-ЯЁ]/.test(question)) {
      const m = question.match(/«([^»]+)»/);
      if (m && /[\u0590-\u05FF]/.test(m[1])) {
        return `?בַּחֲרוּ אֶת הַתַּשׁוּבָה הַנְּכוֹנָה עֲבוּר «${m[1]}»`;
      }
      return '?בַּחֲרוּ אֶת הַתַּשׁוּבָה הַנְּכוֹנָה';
    }

    return question;
  };

  const resetCurrentAnswerState = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setSelectedSentenceIndices([]);
    setIsCorrect(false);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentEx.correctAnswer;
    setIsCorrect(correct);
    setAnsweredMap((prev) => ({ ...prev, [currentIdx]: true }));

    if (correct) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  // Вычисляем структуру предложения для режима build_sentence
  const sentenceStructure = React.useMemo(() => {
    if (!currentEx || currentEx.type !== 'build_sentence') {
      return null;
    }

    // Ищем полное предложение на иврите из объяснения или correctAnswer
    let targetSentenceText = '';
    if (currentEx.explanation) {
      const m = currentEx.explanation.match(/:\s*([^()]+?)(?:\s*\(|$)/);
      if (m && /[\u0590-\u05FF]/.test(m[1])) {
        targetSentenceText = m[1].trim();
      }
    }

    if (!targetSentenceText) {
      if (Array.isArray(currentEx.correctAnswer)) {
        targetSentenceText = currentEx.correctAnswer.join(' ');
      } else if (typeof currentEx.correctAnswer === 'string') {
        targetSentenceText = currentEx.correctAnswer;
      }
    }

    const parsed = parseHebrewSentence(targetSentenceText);

    // Очищаем options от знаков препинания и standalone тире
    const rawOptions = currentEx.options || [];
    const cleanOptions = rawOptions
      .map((w) => stripPunctuation(w))
      .filter((w) => w.length > 0 && !isPunctuationToken(w));

    return {
      parsed,
      cleanOptions,
      targetWords: parsed.cleanWords,
      fullSentence: parsed.fullSentence || targetSentenceText,
    };
  }, [currentEx]);

  const handleSentenceWordClick = (poolIndex: number) => {
    if (isAnswered || !sentenceStructure) return;
    const { cleanOptions, targetWords } = sentenceStructure;
    const nextIndices = [...selectedSentenceIndices, poolIndex];
    setSelectedSentenceIndices(nextIndices);

    if (nextIndices.length === targetWords.length) {
      setIsAnswered(true);
      const nextWords = nextIndices.map((idx) => cleanOptions[idx]);

      const correct =
        nextWords.length === targetWords.length &&
        nextWords.every((w, idx) => areWordsEqual(w, targetWords[idx], false));

      setIsCorrect(correct);
      setAnsweredMap((prev) => ({ ...prev, [currentIdx]: true }));
      if (correct) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }
  };

  const handleUnselectSentenceWord = (sentencePosition: number) => {
    if (isAnswered) return;
    setSelectedSentenceIndices((prev) => prev.filter((_, i) => i !== sentencePosition));
  };

  const handleRemoveLastWord = () => {
    if (isAnswered || selectedSentenceIndices.length === 0) return;
    setSelectedSentenceIndices((prev) => prev.slice(0, -1));
  };

  const handleResetSentence = () => {
    if (isAnswered) return;
    setSelectedSentenceIndices([]);
  };

  const handleNext = () => {
    resetCurrentAnswerState();

    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      const updated = markLessonTabCompleted(lesson.id, 'exercises');
      if (onUpdateProfile) onUpdateProfile(updated);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      resetCurrentAnswerState();
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleJumpTo = (idx: number) => {
    if (idx >= 0 && idx < exercises.length && idx !== currentIdx) {
      resetCurrentAnswerState();
      setCurrentIdx(idx);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleCompleteAndGoToChat = () => {
    const updated = markLessonTabCompleted(lesson.id, 'exercises');
    if (onUpdateProfile) onUpdateProfile(updated);
    if (onCompleted) {
      onCompleted();
    }
  };

  if (!currentEx || isFinished) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-hebrew">
            !מְצוּיָן
          </h2>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {userProfile.ulpanMode
              ? 'כָּל הַתַּרְגִּילִים הוּשְׁלְמוּ בְּהַצְלָחָה!'
              : `Все упражнения урока ${lesson.number} успешно выполнены!`}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {userProfile.ulpanMode
              ? 'שָׁלָב 3 מִתּוֹךְ 5 הוּשְׁלַם. עִבְרוּ לְשִׂיחָה עִם בּוֹט!'
              : 'Этап 3 из 5 завершен. Переходите к ролевому диалогу с ИИ!'}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {onCompleted && (
            <button
              onClick={onCompleted}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {userProfile.ulpanMode
                  ? 'מַעֲבָר לְשִׂיחָה עִם בּוֹט (שָׁלָב 4/5) ➡️'
                  : 'Перейти к ИИ-чату (этап 4/5) ➡️'}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setCurrentIdx(0);
              setIsFinished(false);
              setAnsweredMap({});
              resetCurrentAnswerState();
            }}
            className="w-full py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
          >
            {userProfile.ulpanMode ? 'לַחֲזוֹר עַל הַתַּרְגִּילִים' : 'Пройти упражнения еще раз'}
          </button>
        </div>
      </div>
    );
  }

  const isCursive = userProfile.fontStyle === 'cursive';

  const handleToggleFont = () => {
    const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
    try {
      localStorage.setItem('ulpana_user_profile', JSON.stringify(updated));
    } catch {}
    if (onUpdateProfile) onUpdateProfile(updated);
  };

  const renderFormattedQuestion = (questionText: string, cursive: boolean) => {
    const parts = questionText.split(/(«[^»]+»)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('«') && part.endsWith('»')) {
        const inner = part.slice(1, -1);
        const isHeb = /[\u0590-\u05FF]/.test(inner);
        if (isHeb) {
          return (
            <span key={idx} className="inline-flex items-center mx-1 align-baseline">
              «
              <bdi
                dir="rtl"
                className={`px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold inline-block mx-0.5 ${
                  cursive ? 'font-cursive text-xl' : 'font-hebrew text-base'
                }`}
              >
                {inner}
              </bdi>
              »
            </span>
          );
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const isLastQuestion = currentIdx + 1 >= exercises.length;

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="max-w-xl mx-auto space-y-4 sm:space-y-5">
      {/* 1. Верхняя панель этапа с прямым переходом к ИИ-чату и переключателем шрифта */}
      <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                {userProfile.ulpanMode
                  ? `שָׁלָב 3/5: תַּרְגִּילִים`
                  : 'Этап 3/5: Тесты'}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                ({currentIdx + 1} / {exercises.length})
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate hidden xs:block">
              {userProfile.ulpanMode
                ? 'תִּרְגּוּל וְהַבָנָה'
                : 'Закрепление темы и грамматики'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Переключатель шрифта */}
          <button
            type="button"
            onClick={handleToggleFont}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xs text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={isUlpan ? 'שינוי גופן' : 'Переключить шрифт упражнений: Печатный / Рукописный'}
          >
            {isCursive ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">{isUlpan ? 'כְּתַב יָד' : 'Рукописный'}</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">{isUlpan ? 'דְּפוּס' : 'Печатный'}</span>
              </>
            )}
          </button>

          {/* Прямой переход к следующему этапу (ИИ-чат) */}
          {onCompleted && (
            <button
              type="button"
              onClick={handleCompleteAndGoToChat}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition shadow-xs flex items-center gap-1 cursor-pointer"
              title="Перейти к этапу 4 (ИИ-чат)"
            >
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">{isUlpan ? 'לְבּוֹט' : 'К ИИ-чату'}</span>
              <span>➡️</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Верхний блок быстрой навигации по вопросам + кнопка перехода */}
      <div className="bg-white dark:bg-zinc-900 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Кнопка «Назад» */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 shrink-0 cursor-pointer"
            title={isUlpan ? 'שאלה קודמת' : 'Предыдущий вопрос'}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">{isUlpan ? 'אָחוֹרָה' : 'Назад'}</span>
          </button>

          {/* Интерактивные индикаторы номеров вопросов */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-1 scrollbar-none max-w-full justify-center">
            {exercises.map((_, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnsweredItem = Boolean(answeredMap[idx]);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleJumpTo(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40 scale-105'
                      : isAnsweredItem
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                  title={isUlpan ? `מעבר לשאלה ${idx + 1}` : `Перейти к вопросу ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* ВЕРХНЯЯ КНОПКА ПЕРЕХОДА / СЛЕДУЮЩИЙ ВОПРОС */}
          <button
            type="button"
            onClick={isAnswered ? handleNext : handleSkip}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
              isAnswered
                ? isLastQuestion
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
            title={isAnswered ? (isLastQuestion ? (isUlpan ? 'סיום תרגילים' : 'Завершить тесты') : (isUlpan ? 'השאלה הבאה' : 'Следующий вопрос')) : (isUlpan ? 'דלג על שאלה זו' : 'Пропустить вопрос и перейти к следующему')}
          >
            <span>
              {isAnswered
                ? isLastQuestion
                  ? (isUlpan ? 'סִיּוּם 🎉' : 'Завершить 🎉')
                  : (isUlpan ? 'הַבָּא ➡️' : 'Далее ➡️')
                : (isUlpan ? 'דַּלֵּג ⏩' : 'Пропустить ⏩')}
            </span>
          </button>
        </div>

        {/* Тонкий прогресс-бар */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIdx + 1) / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3. Карточка вопроса */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <h3
          dir={isUlpan ? 'rtl' : 'ltr'}
          className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed ${
            isUlpan ? 'font-hebrew text-lg sm:text-xl' : ''
          }`}
        >
          {renderFormattedQuestion(getUlpanQuestionText(currentEx.question), isCursive)}
        </h3>

        {/* Для типа listening: кнопка прослушивания аудио */}
        {currentEx.type === 'listening' && (
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={() => {
                const textToSpeak =
                  currentEx.hebrewSnippet ||
                  (currentEx.correctAnswer &&
                  typeof currentEx.correctAnswer === 'string' &&
                  /[\u0590-\u05FF]/.test(currentEx.correctAnswer)
                    ? currentEx.correctAnswer
                    : '');
                if (textToSpeak) speakHebrew(textToSpeak);
              }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition shadow-sm cursor-pointer active:scale-95 text-xs sm:text-sm"
            >
              <Volume2 className="w-5 h-5" />
              <span>{isUlpan ? '🔊 לַחֲצוּ לַהַשְׁמָעַת שְׁמִיעָה' : '🔊 Нажмите, чтобы прослушать аудио'}</span>
            </button>
          </div>
        )}

        {/* Варианты выбора (word_match, fill_blank, listening) */}
        {(currentEx.type === 'word_match' || currentEx.type === 'fill_blank' || currentEx.type === 'listening') &&
          currentEx.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentEx.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt === currentEx.correctAnswer;
                const displayOpt = getUlpanOptionDisplay(opt);
                const isDisplayHebrew = /[\u0590-\u05FF]/.test(displayOpt);

                let btnClass =
                  'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200';

                if (isAnswered) {
                  if (isCorrectOpt) {
                    btnClass =
                      'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnClass =
                      'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${btnClass}`}
                  >
                    <span
                      dir={isDisplayHebrew ? 'rtl' : 'ltr'}
                      className={
                        isDisplayHebrew
                          ? isCursive
                            ? 'font-cursive text-2xl md:text-3xl font-bold'
                            : 'font-hebrew text-lg font-bold'
                          : 'text-xs sm:text-sm font-medium'
                      }
                    >
                      {displayOpt}
                    </span>
                    <div className="flex items-center gap-2">
                      {isDisplayHebrew && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const toSpeak = opt && /[\u0590-\u05FF]/.test(opt) ? opt : displayOpt;
                            speakHebrew(toSpeak);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                          title={isUlpan ? 'הַשְׁמַע' : 'Прослушать произношение'}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                      {isAnswered && isCorrectOpt && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrectOpt && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        {/* Режим сборки предложения из слов (build_sentence) */}
        {currentEx.type === 'build_sentence' && sentenceStructure && (
          <div className="space-y-3.5 sm:space-y-4">
            {/* 1. Поле сборки предложения на 100% ширины с фиксированными знаками препинания */}
            <div
              dir="rtl"
              className={`w-full min-h-[64px] p-3.5 sm:p-4 rounded-2xl border-2 border-dashed ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-blue-400 dark:border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20'
              } flex flex-wrap gap-2 items-center leading-relaxed transition-colors duration-200`}
            >
              {sentenceStructure.parsed.tokens.map((token, tIdx) => {
                if (token.type === 'punct') {
                  return (
                    <span
                      key={`punct-${tIdx}`}
                      className="text-zinc-700 dark:text-zinc-300 font-bold text-lg sm:text-xl px-0.5 select-none font-hebrew"
                    >
                      {token.text}
                    </span>
                  );
                }

                const slotIdx = token.slotIndex ?? 0;
                const poolIdx = selectedSentenceIndices[slotIdx];
                const isFilled = poolIdx !== undefined;

                if (isFilled) {
                  const wordText = sentenceStructure.cleanOptions[poolIdx] || '';
                  return (
                    <button
                      key={`slot-${slotIdx}-${poolIdx}`}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleUnselectSentenceWord(slotIdx)}
                      className={`px-3.5 py-1.5 bg-white dark:bg-zinc-800 rounded-xl shadow-xs border transition cursor-pointer active:scale-95 font-bold ${
                        isCursive
                          ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                          : 'font-hebrew text-base sm:text-lg text-zinc-900 dark:text-zinc-50'
                      } ${
                        isAnswered
                          ? isCorrect
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-rose-400 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                      title={isUlpan ? 'לַחֲצוּ לַהֲסָרַת מִילָּה זוֹ' : 'Нажмите, чтобы убрать слово'}
                    >
                      {userProfile.showNikkud ? wordText : stripNikkud(wordText)}
                    </button>
                  );
                }

                return (
                  <span
                    key={`empty-${slotIdx}`}
                    className="inline-flex items-center justify-center min-w-[48px] h-9 px-3 py-1 rounded-xl border-2 border-dashed border-blue-300/80 dark:border-blue-700/60 bg-blue-100/30 dark:bg-blue-950/30 text-blue-400/60 dark:text-blue-500/50 select-none text-xs font-mono"
                    title={isUlpan ? 'מקום למילה' : 'Место для слова'}
                  >
                    ···
                  </span>
                );
              })}
            </div>

            {/* 2. Панель вспомогательных действий под зоной сборки */}
            {selectedSentenceIndices.length > 0 && !isAnswered && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-zinc-400 font-medium">
                  {isUlpan
                    ? `${selectedSentenceIndices.length} / ${sentenceStructure.targetWords.length} מִילִּים`
                    : `Выбрано: ${selectedSentenceIndices.length} из ${sentenceStructure.targetWords.length}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveLastWord}
                    className="px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs transition active:scale-95 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                    title={isUlpan ? 'מחק מילה אחרונה' : 'Стереть последнее выбранное слово'}
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{isUlpan ? 'אָחוֹרָה' : 'Назад'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSentence}
                    className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-xs transition active:scale-95 cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                    title={isUlpan ? 'אפס משפט' : 'Очистить всю фразу'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isUlpan ? 'אִפּוּס' : 'Сброс'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Кнопка озвучки — появляется ТОЛЬКО ПОСЛЕ полной сборки / ответа */}
            {isAnswered && sentenceStructure.fullSentence && (
              <div className="flex items-center justify-end px-1">
                <button
                  type="button"
                  onClick={() => speakHebrew(sentenceStructure.fullSentence)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900 shadow-xs transition active:scale-95 cursor-pointer text-xs flex items-center gap-1.5"
                  title={isUlpan ? 'השמע משפט' : 'Прослушать полное предложение'}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isUlpan ? '🔊 הַשְׁמָעַת הַמִּשְׁפָּט' : '🔊 Прослушать фразу целиком'}</span>
                </button>
              </div>
            )}

            {/* 4. Банк чистых слов (без знаков препинания и тире) */}
            <div dir="rtl" className="flex flex-wrap gap-2 justify-center pt-1">
              {sentenceStructure.cleanOptions.map((w, i) => {
                const isUsed = selectedSentenceIndices.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isUsed || isAnswered}
                    onClick={() => handleSentenceWordClick(i)}
                    className={`px-4 py-2 rounded-xl font-bold border transition cursor-pointer ${
                      isCursive ? 'font-cursive text-2xl md:text-3xl' : 'font-hebrew text-base sm:text-lg'
                    } ${
                      isUsed
                        ? 'opacity-20 border-transparent bg-zinc-100 dark:bg-zinc-800 pointer-events-none scale-95'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 hover:shadow-xs text-zinc-900 dark:text-zinc-50 active:scale-95'
                    }`}
                  >
                    {userProfile.showNikkud ? w : stripNikkud(w)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Пояснение после ответа */}
        {isAnswered && (currentEx.explanation || isUlpan) && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold mb-1 font-hebrew">
                  {isUlpan
                    ? isCorrect
                      ? '!נָכוֹן מְאוֹד • כָּל הַכָּבוֹד 🎉'
                      : '!שִׂימוּ לֵב לַתְּשׁוּבָה הַנְּכוֹנָה 💡'
                    : isCorrect
                    ? 'Верно! Отличный ответ.'
                    : 'Почти получилось! Обратите внимание:'}
                </p>
                {!isUlpan && currentEx.explanation && <p>{currentEx.explanation}</p>}
              </div>
              {currentEx.type !== 'build_sentence' && currentEx.type !== 'listening' && (
                <button
                  type="button"
                  onClick={() => {
                    const textToSpeak =
                      currentEx.hebrewSnippet ||
                      (currentEx.correctAnswer && typeof currentEx.correctAnswer === 'string' && /[\u0590-\u05FF]/.test(currentEx.correctAnswer)
                        ? currentEx.correctAnswer
                        : '');
                    if (textToSpeak) speakHebrew(textToSpeak);
                  }}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                  title="Прослушать"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Нижний блок кнопок перехода */}
        <div className="pt-2 space-y-2">
          {isAnswered ? (
            <button
              onClick={handleNext}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95 ${
                isLastQuestion
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>
                {isLastQuestion
                  ? (userProfile.ulpanMode ? 'סִיּוּם תַּרְגִּילִים 🎉' : 'Завершить упражнения 🎉')
                  : (userProfile.ulpanMode
                      ? `הַשְּׁאֵלָה הַבָּאָה (${currentIdx + 2}/${exercises.length})`
                      : `Следующий вопрос (${currentIdx + 2}/${exercises.length})`)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{userProfile.ulpanMode ? 'דַּלֵּג עַל שְׁאֵלָה' : 'Пропустить вопрос'}</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {onCompleted && (
                <button
                  onClick={handleCompleteAndGoToChat}
                  className="py-3 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200 dark:border-purple-800/80 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-500" />
                  <span>
                    {userProfile.ulpanMode
                      ? 'לְשִׂיחָה עִם בּוֹט (שָׁלָב 4/5) ➡️'
                      : 'К ИИ-чату (этап 4/5) ➡️'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
