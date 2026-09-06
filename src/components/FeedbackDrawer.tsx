'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Mic,
  MicOff,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { useModalHistory } from '@/lib/useHistoryState';

export interface FeedbackPageContext {
  view: string;
  lessonId?: number;
  lessonTitle?: string;
  lessonTab?: string;
}

interface FeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  pageContext?: FeedbackPageContext;
}

type FeedbackCategory = 'bug' | 'idea' | 'question';

export const FeedbackDrawer: React.FC<FeedbackDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  pageContext,
}) => {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Голосовая диктовка (Speech-to-Text)
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'ru-RU' | 'he-IL'>('ru-RU');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Привязка к истории браузера (кнопка назад / свайп назад на смартфонах)
  useModalHistory(isOpen, onClose, 'feedback-drawer');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Закрытие по клавише Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopVoiceRecognition();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      stopVoiceRecognition();
      setIsSuccess(false);
      setErrorMsg(null);
      setSpeechError(null);
      setInterimText('');
    }
  }, [isOpen]);

  // Остановка распознавания речи при размонтировании
  useEffect(() => {
    return () => {
      stopVoiceRecognition();
    };
  }, []);

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  };

  const startVoiceRecognition = () => {
    setSpeechError(null);

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Голосовой ввод не поддерживается в вашем браузере. Вы можете ввести текст вручную.');
      return;
    }

    try {
      stopVoiceRecognition();

      const rec = new SpeechRecognition();
      rec.lang = speechLang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalChunk += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (finalChunk) {
          setMessage((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
          setInterimText('');
        } else {
          setInterimText(currentInterim);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'not-allowed') {
          setSpeechError('Доступ к микрофону заблокирован в настройках браузера.');
        } else {
          setSpeechError(`Ошибка распознавания: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setSpeechError(err?.message || 'Не удалось запустить микрофон');
      setIsListening(false);
    }
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  // Красивое текстовое описание текущей страницы для интерфейса
  const getDisplayPageContext = () => {
    if (!pageContext) return 'Главная страница';
    if (pageContext.lessonId) {
      const tabNames: Record<string, string> = {
        theory: 'Теория',
        vocab: 'Словарь',
        exercises: 'Упражнения',
        chat: 'Диалог с ИИ',
        phone: 'Звонок',
      };
      const tabLabel = pageContext.lessonTab ? tabNames[pageContext.lessonTab] || pageContext.lessonTab : '';
      return `Урок ${pageContext.lessonId}${pageContext.lessonTitle ? `: ${pageContext.lessonTitle}` : ''}${
        tabLabel ? ` (${tabLabel})` : ''
      }`;
    }
    const viewNames: Record<string, string> = {
      map: 'Карта уроков',
      flashcards: 'Карточки слов',
      dictionary: 'Личный словарик',
      alphabet: 'Прописи и алфавит',
    };
    return viewNames[pageContext.view] || pageContext.view;
  };

  const currentContextTitle = getDisplayPageContext();

  // Отправка через API в Telegram бота для @Osa_IL
  const handleSend = async () => {
    if (!message.trim()) {
      setErrorMsg('Пожалуйста, напишите текст или надиктуйте сообщение');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    stopVoiceRecognition();

    try {
      const payload = {
        message: message.trim(),
        category,
        pageInfo: {
          url: typeof window !== 'undefined' ? window.location.href : '',
          view: pageContext?.view || 'map',
          lessonId: pageContext?.lessonId,
          lessonTitle: pageContext?.lessonTitle,
          lessonTab: pageContext?.lessonTab,
        },
        user: {
          name: userProfile?.name,
          username: userProfile?.username,
          telegramId: userProfile?.telegramId,
          isLoggedIn: userProfile?.isLoggedIn,
          subscriptionTier: userProfile?.subscriptionTier,
        },
        deviceInfo: {
          platform: typeof navigator !== 'undefined' ? navigator.platform : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          screenSize:
            typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          isTelegramWebApp: typeof window !== 'undefined' && Boolean((window as any).Telegram?.WebApp?.initData),
        },
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Ошибка при отправке');
      }

      setIsSuccess(true);
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Не удалось отправить сообщение. Попробуйте написать напрямую в Telegram.');
    } finally {
      setIsSending(false);
    }
  };

  // Ссылка для прямого перехода в диалог с @Osa_IL в Telegram
  const getDirectTelegramLink = () => {
    const categoryLabels: Record<string, string> = {
      bug: '🐞 Сообщение об ошибке',
      idea: '💡 Предложение / Идея',
      question: '💬 Вопрос / Отзыв',
    };
    const prefix = `${categoryLabels[category]} [${currentContextTitle}]:\n`;
    const fullText = message ? `${prefix}${message}` : prefix;
    return `https://t.me/Osa_IL?text=${encodeURIComponent(fullText)}`;
  };

  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex justify-end items-end sm:items-stretch">
      {/* Затемненный фон (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
        onClick={() => {
          stopVoiceRecognition();
          onClose();
        }}
      />

      {/* Выезжающая шторка (снизу на смартфонах, справа на десктопе) */}
      <div
        className="relative z-10 w-full sm:w-[460px] max-h-[92vh] sm:max-h-full h-auto sm:h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none sm:rounded-l-3xl border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Мобильный индикатор свайпа (Drag Pill) */}
        <div className="sm:hidden w-full pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Шапка шторки */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 truncate flex items-center gap-1.5">
                <span>Обратная связь</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                  @Osa_IL
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Сообщите об ошибке или идее разработчику
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopVoiceRecognition();
              onClose();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело шторки */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isSuccess ? (
            <div className="py-10 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">
                  Сообщение отправлено!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto">
                  Спасибо за помощь! Ваше обращение с пометкой текущей страницы успешно доставлено администратору <b>@Osa_IL</b> в Telegram.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Написать ещё одно</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Готово
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Бейдж контекста страницы («с какой страницы написано») */}
              <div className="p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs min-w-0">
                  <div className="text-zinc-500 dark:text-zinc-400 font-medium">
                    Контекст страницы прикрепится автоматически:
                  </div>
                  <div className="font-bold text-blue-700 dark:text-blue-300 truncate">
                    📍 {currentContextTitle}
                  </div>
                </div>
              </div>

              {/* Выбор типа обращения */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Тип обращения
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCategory('bug')}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      category === 'bug'
                        ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 shadow-2xs font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Ошибка</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('idea')}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      category === 'idea'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 shadow-2xs font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Идея</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('question')}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      category === 'question'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Отзыв</span>
                  </button>
                </div>
              </div>

              {/* Поле ввода текста */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Текст сообщения
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    {message.length} симв.
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      category === 'bug'
                        ? 'Опишите, что пошло не так (например: ошибка в упражнении, не играет звук, опечатка в слове)...'
                        : category === 'idea'
                        ? 'Какую функцию или материал вы хотите добавить в Ульпану?...'
                        : 'Напишите ваш отзыв или вопрос по курсу...'
                    }
                    className="w-full p-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none"
                  />

                  {/* Кнопка очистки текста */}
                  {message.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMessage('')}
                      className="absolute top-2 right-2 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs transition"
                      title="Очистить текст"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Голосовая диктовка («надиктовать») */}
              <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Голосовая диктовка
                    </span>
                    {isListening && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Слушаю...
                      </span>
                    )}
                  </div>

                  {/* Переключатель языка диктовки: Русский / Иврит */}
                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSpeechLang('ru-RU')}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        speechLang === 'ru-RU'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      RU
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeechLang('he-IL')}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        speechLang === 'he-IL'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      HE
                    </button>
                  </div>
                </div>

                {/* Кнопка запуска микрофона */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleVoiceRecognition}
                    className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/20 animate-pulse'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Остановить запись</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Надиктовать голосом</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Живой распознанный промежуточный текст */}
                {interimText && (
                  <p className="text-xs italic text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-200 dark:border-blue-900/40">
                    «{interimText}...»
                  </p>
                )}

                {/* Ошибка микрофона */}
                {speechError && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {speechError}
                  </p>
                )}
              </div>

              {/* Сообщение об ошибке отправки */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Кнопки отправки */}
              <div className="space-y-2 pt-2">
                {/* 1. Основная кнопка: Отправить ботом сразу @Osa_IL */}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending || !message.trim()}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    isSending || !message.trim()
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-[0.99]'
                  }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Отправка в Telegram...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Отправить сообщение @Osa_IL</span>
                    </>
                  )}
                </button>

                {/* 2. Альтернатива: Написать напрямую в Telegram */}
                <a
                  href={getDirectTelegramLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-2xl border border-[#229ED9]/40 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
                  title="Открыть диалог с @Osa_IL в приложении Telegram"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Или открыть чат с @Osa_IL напрямую в Telegram</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
