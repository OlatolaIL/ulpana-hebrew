'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Send,
  Loader2,
  AlertCircle,
  Info,
  Keyboard,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';
import { Lesson, UserProfile, EssayEvaluationResult } from '@/types';
import { getLessonEssayPrompt } from '@/data/essayTopics';
import { VirtualHebrewKeyboard } from './VirtualHebrewKeyboard';
import { EssayEvaluationView } from './EssayEvaluationView';
import { saveLessonEssay, resetLessonEssay } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';

// Соответствие стандартной израильской раскладки клавиатуры (QWERTY -> עברית)
// Знаки препинания (. , ! ? и т.д.) НЕ маппятся в буквы, чтобы точка и запятая всегда оставались пунктуацией
const QWERTY_TO_HEBREW_MAP: Record<string, string> = {
  'e': 'ק',
  'r': 'ר',
  't': 'א',
  'y': 'ט',
  'u': 'ו',
  'i': 'ן',
  'o': 'ם',
  'p': 'פ',
  'a': 'ש',
  's': 'ד',
  'd': 'ג',
  'f': 'כ',
  'g': 'ע',
  'h': 'י',
  'j': 'ח',
  'k': 'ל',
  'l': 'ך',
  'z': 'ז',
  'x': 'ס',
  'c': 'ב',
  'v': 'ה',
  'b': 'נ',
  'n': 'מ',
  'm': 'צ',
  // Удобные соответствия для ввода с английской клавиатуры:
  'T': 'ת', // Shift+T -> ת (Тав)
  'M': 'ץ', // Shift+M -> ץ (Цади-софит)
  'P': 'ף', // Shift+P -> ף (Пей-софит)
  'N': 'ן', // Shift+N -> ן (Нун-софит)
  'K': 'ך', // Shift+K -> ך (Хаф-софит)
  'O': 'ם', // Shift+O -> ם (Мем-софит)
};

// Соответствие русской клавиатуры (ЙЦУКЕН) буквам иврита
// Все 22 буквы + 5 софитов строго на русских буквенных клавишах.
// Пунктуация (точка, запятая на крайней нижней клавише) НЕ перехватывается и вводится штатно.
const RUSSIAN_TO_HEBREW_MAP: Record<string, string> = {
  'у': 'ק',
  'к': 'ר',
  'е': 'א',
  'н': 'ט',
  'г': 'ו',
  'ш': 'ן',
  'щ': 'ם',
  'з': 'פ',
  'ф': 'ש',
  'ы': 'ד',
  'в': 'ג',
  'а': 'כ',
  'п': 'ע',
  'р': 'י',
  'о': 'ח',
  'л': 'ל',
  'д': 'ך',
  'ж': 'ף',
  'я': 'ז',
  'ч': 'ס',
  'с': 'ב',
  'м': 'ה',
  'и': 'נ',
  'т': 'מ',
  'ь': 'צ',
  'б': 'ת',
  'ю': 'ץ',
};

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
  const isEssayCompleted = userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('essay');
  const savedEssay = isEssayCompleted ? userProfile.lessonProgress[lesson.id]?.essay : undefined;

  const [text, setText] = useState<string>(() => savedEssay?.text || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EssayEvaluationResult | null>(() => savedEssay?.evaluation || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAutoHebrew, setIsAutoHebrew] = useState<boolean>(true);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);

  // Определение мобильного устройства (по ширине экрана или сигнатуре смартфона)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setShowVirtualKeyboard(true);
      }
    }
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Автоматический фокус поля при открытии на компьютере, чтобы курсор был виден сразу
  useEffect(() => {
    if (!isMobileDevice && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isMobileDevice]);

  // Скролл к экранной клавиатуре на мобильных устройствах при необходимости
  const handleScrollToKeyboard = () => {
    if (isMobileDevice) {
      if (!showVirtualKeyboard) {
        setShowVirtualKeyboard(true);
      }
      setTimeout(() => {
        if (keyboardRef.current) {
          keyboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    }
  };

  // Считаем слова на иврите
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isMinWordsReached = wordCount >= prompt.minWords;

  // Вставка символа (с экранной клавиатуры или перехватчика физической клавиатуры)
  const handleChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((prev) => prev + char);
      setErrorMessage(null);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const nextText = before + char + after;

    setText(nextText);
    setErrorMessage(null);

    requestAnimationFrame(() => {
      textarea.focus();
      const nextPos = start + char.length;
      textarea.setSelectionRange(nextPos, nextPos);
    });
  };

  // Удаление символа (Backspace)
  const handleBackspace = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText((prev) => prev.slice(0, -1));
      setErrorMessage(null);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;

    if (start !== end) {
      const nextText = text.slice(0, start) + text.slice(end);
      setText(nextText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      });
    } else if (start > 0) {
      const nextText = text.slice(0, start - 1) + text.slice(start);
      setText(nextText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 1, start - 1);
      });
    }
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

  // Поддержка физической клавиатуры компьютера (включая авто-раскладку для пользователей без иврита в Windows)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (loading) return;

    // Не перехватываем системные горячие клавиши (Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+Z и т.д.)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Знаки препинания, цифры и пробелы всегда вводятся нативно (точка, запятая, кавычки и т.д.)
    if (
      e.key === '.' ||
      e.key === ',' ||
      e.key === '!' ||
      e.key === '?' ||
      e.key === ':' ||
      e.key === ';' ||
      e.key === '-' ||
      e.key === '–' ||
      e.key === '—' ||
      e.key === '"' ||
      e.key === '\'' ||
      e.key === '(' ||
      e.key === ')' ||
      e.key === '/' ||
      e.key === '\\' ||
      (e.key >= '0' && e.key <= '9')
    ) {
      return;
    }

    // Если включена авто-раскладка иврита, переводим нажатия буквенных клавиш QWERTY / ЙЦУКЕН в буквы иврита
    if (isAutoHebrew && e.key.length === 1) {
      // 1. Проверяем точный регистр (например, Shift+T -> ת или Shift+M -> ץ)
      const exactMapped = QWERTY_TO_HEBREW_MAP[e.key] || RUSSIAN_TO_HEBREW_MAP[e.key];
      if (exactMapped) {
        e.preventDefault();
        handleChar(exactMapped);
        return;
      }

      // 2. Проверяем строчный регистр
      const lower = e.key.toLowerCase();
      const mapped = QWERTY_TO_HEBREW_MAP[lower] || RUSSIAN_TO_HEBREW_MAP[lower];
      if (mapped) {
        e.preventDefault();
        handleChar(mapped);
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
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Ошибка сервера при проверке сочинения');
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

  // Сброс этапа сочинения: сброс зачёта этапа в профиле, очистка поля и рецензии
  const handleTryAgain = () => {
    const updatedProfile = resetLessonEssay(lesson.id);
    onUpdateProfile(updatedProfile);
    setText('');
    setEvaluation(null);
    setErrorMessage(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  // Если результат уже получен — отображаем экран рецензии
  if (evaluation) {
    return (
      <EssayEvaluationView
        evaluation={evaluation}
        userEssay={text}
        userProfile={userProfile}
        onTryAgain={handleTryAgain}
        onContinue={onCompleted}
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto pb-6 animate-in fade-in duration-300">
      {/* 1. Карточка задания темы */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
            <PenTool className="w-3.5 h-3.5" />
            <span>Этап 4 • Написание сочинения</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {prompt.topicRu}
          </h2>
        </div>

        {/* Описание ситуации */}
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {prompt.situationRu}
        </p>

        {/* Кнопка раскрытия полезной шпаргалки к уроку (правило + опорные слова) */}
        {(prompt.grammarFocusRu || (prompt.suggestedWords && prompt.suggestedWords.length > 0)) && (
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                showCheatSheet
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  : 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/80 dark:border-amber-800/50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{showCheatSheet ? 'Скрыть шпаргалку к уроку' : 'Шпаргалка к уроку (правило и слова)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCheatSheet ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* Раскрывающийся блок шпаргалки: грамматика урока + опорные слова */}
        {showCheatSheet && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-2.5 animate-in fade-in duration-200">
            {/* Грамматический фокус урока */}
            {prompt.grammarFocusRu && (
              <div className="flex items-start gap-2 text-xs text-amber-950 dark:text-amber-100 leading-snug">
                <span className="font-bold shrink-0 text-amber-700 dark:text-amber-400">Фокус урока:</span>
                <span>{prompt.grammarFocusRu}</span>
              </div>
            )}

            {/* Опорные слова урока */}
            {prompt.suggestedWords && prompt.suggestedWords.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40">
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                  Полезные слова урока (нажмите, чтобы вставить):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prompt.suggestedWords.map((item, idx) => {
                    const variants = item.hebrew
                      .split('/')
                      .map((v) => v.trim())
                      .filter(Boolean);

                    if (variants.length > 1) {
                      return (
                        <div
                          key={idx}
                          className="inline-flex flex-wrap items-center rounded-lg bg-white dark:bg-zinc-800 border border-amber-200/80 dark:border-zinc-700 shadow-2xs text-xs text-zinc-800 dark:text-zinc-100 p-0.5 gap-1 max-w-full"
                        >
                          <div className="inline-flex flex-wrap items-center rounded-md bg-amber-50/70 dark:bg-zinc-900/60 p-0.5 gap-0.5 max-w-full">
                            {variants.map((v, vIdx) => {
                              const cleanWord = stripNikkud(v);
                              return (
                                <React.Fragment key={vIdx}>
                                  {vIdx > 0 && (
                                    <span
                                      className="text-zinc-300 dark:text-zinc-600 text-xs select-none px-0.5"
                                      aria-hidden="true"
                                    >
                                      /
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      handleChar(cleanWord + ' ');
                                    }}
                                    className="px-2 py-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 text-blue-700 dark:text-blue-300 font-hebrew font-bold text-sm transition cursor-pointer text-right focus-visible:ring-1.5 focus-visible:ring-amber-500 focus-visible:outline-none"
                                    dir="rtl"
                                    title={`Вставить: ${cleanWord}`}
                                  >
                                    {v}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </div>
                          {item.translation && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans px-1 leading-tight break-words text-left">
                              ({item.translation})
                            </span>
                          )}
                        </div>
                      );
                    }

                    const cleanWord = stripNikkud(item.hebrew.trim());
                    return (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleChar(cleanWord + ' ');
                        }}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-zinc-800 dark:text-zinc-100 text-xs border border-amber-200/80 dark:border-zinc-700 shadow-2xs transition active:scale-95 inline-flex flex-wrap items-center gap-1.5 cursor-pointer max-w-full text-left focus-visible:ring-1.5 focus-visible:ring-amber-500 focus-visible:outline-none"
                        title={`Нажмите, чтобы вставить «${cleanWord}»`}
                      >
                        <span className="font-hebrew font-bold text-sm text-blue-700 dark:text-blue-300" dir="rtl">
                          {item.hebrew}
                        </span>
                        {item.translation && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans break-words text-left">
                            ({item.translation})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Поле набора сочинения (поддержка клавиатуры ПК + экранной клавиатуры) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              Ваш текст на иврите
            </span>

            {/* На смартфонах бейдж "Экранная клавиатура (без подсказок)" */}
            {isMobileDevice ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
                Экранная клавиатура (без подсказок)
              </span>
            ) : (
              <>
                {/* Переключатель авто-раскладки для ПК */}
                <button
                  type="button"
                  onClick={() => setIsAutoHebrew(!isAutoHebrew)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isAutoHebrew
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                  title="Если в вашей системе нет раскладки иврита, этот режим автоматически переводит нажатия клавиш QWERTY / ЙЦУКЕН в буквы иврита"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{isAutoHebrew ? 'Авто-иврит: Вкл (QWERTY)' : 'Раскладка: Системная'}</span>
                </button>

                {/* Кнопка показа/скрытия экранной клавиатуры на ПК */}
                <button
                  type="button"
                  onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
                    showVirtualKeyboard
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                  }`}
                  title="Показать или скрыть экранные клавиши"
                >
                  <span>{showVirtualKeyboard ? 'Скрыть экранные клавиши' : 'Экранные клавиши'}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {text.length > 0 && !loading && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  textareaRef.current?.focus();
                }}
                className="text-[11px] text-zinc-400 hover:text-rose-500 transition px-1.5 py-0.5 rounded cursor-pointer select-none"
                title="Очистить поле сочинения"
              >
                Очистить
              </button>
            )}
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
        </div>

        {/* Текстовое поле: на ПК и смартфонах с четко видимым синим курсором и навигацией */}
        <textarea
          ref={textareaRef}
          dir="rtl"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setErrorMessage(null);
          }}
          onKeyDown={handleKeyDown}
          inputMode={isMobileDevice ? 'none' : undefined}
          placeholder={
            isMobileDevice
              ? 'Нажимайте буквы на экранных клавишах внизу, чтобы составить сочинение...'
              : 'Печатайте текст сочинения на иврите с клавиатуры компьютера...'
          }
          rows={5}
          disabled={loading}
          style={{ caretColor: '#2563eb' }}
          className="w-full min-h-[130px] max-h-[250px] p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-hebrew text-lg sm:text-xl text-zinc-900 dark:text-zinc-50 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-600 caret-blue-600 dark:caret-blue-400 resize-y placeholder:text-zinc-400 dark:placeholder:text-zinc-600 placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm placeholder:italic"
        />

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Кнопка отправки на проверку ИИ: расположена НАД клавиатурой (под текстом), чтобы не нажимать её случайно вместо пробела! */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              {wordCount < prompt.minWords
                ? `Рекомендуемый объём: от ${prompt.minWords} слов (написано ${wordCount})`
                : 'Отличный объём! Сочинение готово к отправке на проверку.'}
            </span>
          </div>

          <button
            type="button"
            disabled={loading || wordCount < 3}
            onClick={handleSubmit}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
              isMinWordsReached
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ИИ проверяет сочинение...</span>
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

      {/* 3. Экранная клавиатура иврита (Virtual Hebrew Keyboard) - внизу, под кнопкой отправки */}
      {showVirtualKeyboard && (
        <div ref={keyboardRef} id="essay-virtual-keyboard" className="space-y-2 animate-in fade-in duration-200">
          <VirtualHebrewKeyboard
            onChar={handleChar}
            onBackspace={handleBackspace}
            onSpace={handleSpace}
            onEnter={handleEnter}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
};
