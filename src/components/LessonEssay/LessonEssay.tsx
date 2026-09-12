'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Info,
  Check,
} from 'lucide-react';
import { Lesson, UserProfile, EssayEvaluationResult } from '@/types';
import { getLessonEssayPrompt } from '@/data/essayTopics';
import { VirtualHebrewKeyboard } from './VirtualHebrewKeyboard';
import { EssayEvaluationView } from './EssayEvaluationView';
import { saveLessonEssay } from '@/lib/storage';

interface LessonEssayProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const LessonEssay: React.FC<LessonEssayProps> = ({
  lesson,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  const prompt = getLessonEssayPrompt(lesson.id);
  const savedEssay = userProfile.lessonProgress[lesson.id]?.essay;

  const [text, setText] = useState<string>(() => savedEssay?.text || '');
  const [cursorPos, setCursorPos] = useState<number>(() => (savedEssay?.text ? savedEssay.text.length : 0));
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EssayEvaluationResult | null>(() => savedEssay?.evaluation || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Считаем слова на иврите
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isMinWordsReached = wordCount >= prompt.minWords;

  // Вставка символа с экранной клавиатуры
  const handleChar = (char: string) => {
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);
    const updated = before + char + after;
    setText(updated);
    setCursorPos(cursorPos + char.length);
    setErrorMessage(null);
  };

  // Удаление символа (Backspace)
  const handleBackspace = () => {
    if (cursorPos === 0) return;
    const before = text.slice(0, cursorPos - 1);
    const after = text.slice(cursorPos);
    setText(before + after);
    setCursorPos(cursorPos - 1);
    setErrorMessage(null);
  };

  // Пробел
  const handleSpace = () => {
    handleChar(' ');
  };

  // Новая строка
  const handleEnter = () => {
    handleChar('\n');
  };

  // Поддержка физической клавиатуры (буквы иврита, пробел, backspace, enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (loading) return;
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleEnter();
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      handleSpace();
    } else if (e.key.length === 1) {
      // Иврит и знаки препинания
      if (/[\u0590-\u05FF.,!?"'־-]/.test(e.key)) {
        e.preventDefault();
        handleChar(e.key);
      }
    }
  };

  // Отправка на проверку ИИ
  const handleSubmit = async () => {
    if (words.length < 3) {
      setErrorMessage('Пожалуйста, напишите хотя бы одно или два законченных предложения.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/essay/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEssay: text,
          lessonId: lesson.id,
          topic: prompt,
          userGender: userProfile.gender,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
          lessonLevel: lesson.level,
          lessonTitle: lesson.titleRussian,
        }),
      });

      if (!res.ok) {
        throw new Error('Ошибка сервера при проверке сочинения');
      }

      const result: EssayEvaluationResult = await res.json();
      setEvaluation(result);

      // Сохраняем сочинение в профиле пользователя (localStorage + sync)
      const updatedProfile = saveLessonEssay(lesson.id, text, result);
      onUpdateProfile(updatedProfile);

      // Логируем в базу данных PostgreSQL
      fetch('/api/essays/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          topicTitle: prompt.topicRu,
          essayText: text,
          score: result.score,
          rating: result.rating,
          evaluation: result,
          userName: userProfile.name || 'Ученик',
        }),
      }).catch((err) => console.warn('Essay log error:', err));
    } catch (e: any) {
      console.error('Failed to evaluate essay:', e);
      setErrorMessage(e?.message || 'Не удалось связаться с сервером проверки.');
    } finally {
      setLoading(false);
    }
  };

  // Если результат уже получен — отображаем экран рецензии
  if (evaluation) {
    return (
      <EssayEvaluationView
        evaluation={evaluation}
        userEssay={text}
        onTryAgain={() => setEvaluation(null)}
        onContinue={onCompleted}
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto pb-6 animate-in fade-in duration-300">
      {/* 1. Карточка задания темы */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
              <PenTool className="w-3.5 h-3.5" />
              <span>Этап 4 • Написание сочинения (חִבּוּר)</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">
              {prompt.topicRu}
            </h2>
          </div>

          <span
            dir="rtl"
            className="text-base sm:text-lg font-hebrew font-bold text-zinc-800 dark:text-zinc-200 shrink-0 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl"
          >
            {prompt.topicHe}
          </span>
        </div>

        {/* Описание ситуации */}
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {prompt.situationRu}
        </p>

        {/* Фокус на порядок слов и грамматику */}
        <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{prompt.grammarFocusRu}</span>
        </div>
      </div>

      {/* 2. Поле набора сочинения (БЕЗ нативной клавиатуры телефона — 100% без подсказок) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
            <span>Ваш текст на иврите</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold">
              Встроенная клавиатура (без подсказок)
            </span>
          </span>

          <span
            className={`font-bold transition ${
              isMinWordsReached
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            Слов: {wordCount} / {prompt.minWords} {isMinWordsReached ? '✓' : ''}
          </span>
        </div>

        {/* Область отображения набранного текста */}
        <div
          ref={textContainerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          dir="rtl"
          onClick={() => {
            // Клик ставит курсор в конец текста
            setCursorPos(text.length);
          }}
          className="w-full min-h-[120px] max-h-[220px] overflow-y-auto p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-hebrew text-lg sm:text-xl text-zinc-900 dark:text-zinc-50 leading-relaxed cursor-text whitespace-pre-wrap select-none relative focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {text.length === 0 ? (
            <span className="text-zinc-400 dark:text-zinc-600 italic font-sans text-sm">
              Нажимайте буквы на экранной клавиатуре внизу, чтобы составить рассказ...
            </span>
          ) : (
            <>
              {text.slice(0, cursorPos)}
              <span className="inline-block w-0.5 h-5 sm:h-6 bg-blue-600 dark:bg-blue-400 align-middle animate-pulse mx-0.5" />
              {text.slice(cursorPos)}
            </>
          )}
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 3. Экранная клавиатура иврита (Virtual Hebrew Keyboard) */}
      <div className="space-y-2">
        <VirtualHebrewKeyboard
          onChar={handleChar}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
          onEnter={handleEnter}
          disabled={loading}
        />
      </div>

      {/* 4. Кнопка отправки на проверку ИИ */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="text-xs text-zinc-400 hidden sm:block">
          ИИ детально проверит порядок слов, род и даст полезные советы
        </div>

        <button
          type="button"
          disabled={loading || text.trim().length === 0}
          onClick={handleSubmit}
          className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ИИ проверяет сочинение и порядок слов...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Проверить сочинение с ИИ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

