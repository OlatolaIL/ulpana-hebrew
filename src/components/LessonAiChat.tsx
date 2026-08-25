'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  AlertCircle,
  Info,
  X,
  Award,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, ChatMessage, Word } from '@/types';
import { tokenizeText, TextToken, stripNikkud } from '@/lib/transcription';
import { speakHebrew, HebrewSpeechRecognizer } from '@/lib/speech';
import { WordLookupModal } from './WordLookupModal';
import { markLessonTabCompleted, saveUserProfile } from '@/lib/storage';

interface LessonAiChatProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
}

function getInitialMessageForGender(lesson: Lesson, gender: 'male' | 'female'): {
  hebrew: string;
  transcription: string;
  translation: string;
  suggestedReplies: Array<{ hebrew: string; transcription: string; translation: string }>;
} {
  const isFemale = gender === 'female';

  if (lesson.number === 1) {
    return {
      hebrew: isFemale
        ? 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לָךְ?'
        : 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לְךָ?',
      transcription: isFemale
        ? 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лах?'
        : 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лэхá?',
      translation: isFemale
        ? 'Привет! Доброе утро. Я Ноам. Как тебя зовут? (к женщине)'
        : 'Привет! Доброе утро. Я Ноам. Как тебя зовут? (к мужчине)',
      suggestedReplies: [
        {
          hebrew: 'שָׁלוֹם, קוֹרְאִים לִי...',
          transcription: 'шалóм, коръӣм ли...',
          translation: 'Привет, меня зовут...',
        },
        {
          hebrew: 'בּוֹקֶר טוֹב! מָה נִשְׁמַע?',
          transcription: 'бóкер тов! ма нишмá?',
          translation: 'Доброе утро! Как дела?',
        },
        {
          hebrew: isFemale ? 'אֲנִי לוֹמֶדֶת עִבְרִית.' : 'אֲנִי לוֹמֵד עִבְרִית.',
          transcription: isFemale ? 'анӣ ломéдет иврӣт.' : 'анӣ ломéд иврӣт.',
          translation: isFemale ? 'Я учу иврит (женщина).' : 'Я учу иврит (мужчина).',
        },
      ],
    };
  }

  if (lesson.number === 2) {
    return {
      hebrew: isFemale
        ? 'שָׁלוֹם! מָה תִּרְצִי לִשְׁתּוֹת הַיּוֹם?'
        : 'שָׁלוֹם! מָה תִּרְצֶה לִשְׁתּוֹת הַיּוֹם?',
      transcription: isFemale
        ? 'шалóм! ма тирцӣ лишто́т hайóм?'
        : 'шалóм! ма тирцé лишто́т hайóм?',
      translation: isFemale
        ? 'Здравствуйте! Что вы хотите выпить сегодня? (к женщине)'
        : 'Здравствуйте! Что вы хотите выпить сегодня? (к мужчине)',
      suggestedReplies: [
        {
          hebrew: isFemale
            ? 'אֲנִי רוֹצָה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.'
            : 'אֲנִי רוֹצֶה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
          transcription: isFemale
            ? 'анӣ роцá кафэ́ им халáв, бэвакашá.'
            : 'анӣ роцé кафэ́ им халáв, бэвакашá.',
          translation: isFemale
            ? 'Я хочу кофе с молоком, пожалуйста (женщина).'
            : 'Я хочу кофе с молоком, пожалуйста (мужчина).',
        },
        {
          hebrew: 'אֶפְשָׁר תֵּה עִם סוּכָּר?',
          transcription: 'эфшáр тэ им сукáр?',
          translation: 'Можно чай с сахаром?',
        },
        {
          hebrew: 'מַיִם קָרִים, בְּבַקָּשָׁה.',
          transcription: 'мáйим карӣм, бэвакашá.',
          translation: 'Холодную воду, пожалуйста.',
        },
      ],
    };
  }

  // Общий шаблон для остальных уроков
  let heb = lesson.dialogue.initialMessage.hebrew;
  let tr = lesson.dialogue.initialMessage.transcription;
  if (!isFemale) {
    heb = heb.replace(/לָךְ \/ לְךָ/g, 'לְךָ').replace(/תִּרְצֶה \/ תִּרְצִי/g, 'תִּרְצֶה');
    tr = tr.replace(/лах \/ лэхá/g, 'лэхá').replace(/тирцé \/ тирцӣ/g, 'тирцé');
  } else {
    heb = heb.replace(/לָךְ \/ לְךָ/g, 'לָךְ').replace(/תִּרְצֶה \/ תִּרְצִי/g, 'תִּרְצִי');
    tr = tr.replace(/лах \/ лэхá/g, 'лах').replace(/тирцé \/ тирцӣ/g, 'тирцӣ');
  }

  return {
    hebrew: heb,
    transcription: tr,
    translation: lesson.dialogue.initialMessage.translation,
    suggestedReplies: [
      {
        hebrew: isFemale ? 'שָׁלוֹם, אֲנִי כָּאן.' : 'שָׁלוֹם, אֲנִי כָּאן.',
        transcription: 'шалóм, анӣ кан.',
        translation: 'Привет, я здесь.',
      },
    ],
  };
}

export const LessonAiChat: React.FC<LessonAiChatProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSituation, setShowSituation] = useState(false);
  const [showTips, setShowTips] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem('ulpana_chat_tips_hidden') !== 'true';
    } catch {
      return true;
    }
  });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordContext, setWordContext] = useState<string>('');
  const [recognizer, setRecognizer] = useState<HebrewSpeechRecognizer | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initChat = (gender: 'male' | 'female') => {
    const data = getInitialMessageForGender(lesson, gender);
    const initial: ChatMessage = {
      id: 'init-1',
      role: 'assistant',
      hebrew: data.hebrew,
      transcription: data.transcription,
      translation: data.translation,
      timestamp: Date.now(),
      suggestedReplies: data.suggestedReplies,
    };
    setMessages([initial]);
    setShowSuggestions(true);
  };

  useEffect(() => {
    initChat(userProfile.gender);

    const rec = new HebrewSpeechRecognizer();
    setRecognizer(rec);
  }, [lesson, userProfile.gender]);

  const handleGenderSwitch = (newGender: 'male' | 'female') => {
    if (newGender === userProfile.gender) return;
    const updated = { ...userProfile, gender: newGender };
    saveUserProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);
    initChat(newGender);
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.hebrew,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          lessonNumber: lesson.number,
          level: lesson.level,
          userGender: userProfile.gender,
          scenarioTitle: lesson.dialogue.title,
          situation: lesson.dialogue.situation,
          aiRole: lesson.dialogue.aiRole,
          userRole: lesson.dialogue.userRole,
          goals: lesson.dialogue.goals,
          topic: lesson.titleRussian,
          vocabulary: (lesson.vocabulary || []).map((w) => `${w.hebrew} (${w.translation})`),
          grammarTopic: lesson.grammar?.[0]?.title || lesson.titleRussian,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        hebrew: data.hebrew || 'שָׁלוֹם!',
        transcription: data.transcription,
        translation: data.translation,
        feedback: data.feedback,
        engine: data.engine || 'Groq (Живой ИИ)',
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setShowSuggestions(true);
      const updated = markLessonTabCompleted(lesson.id, 'chat');
      if (onUpdateProfile) onUpdateProfile(updated);

      // Автоматически озвучиваем ответ ИИ
      speakHebrew(aiMsg.hebrew, { rate: userProfile.speechRate || 0.7 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognizer || !recognizer.isSupported()) {
      alert('Голосовой ввод не поддерживается вашим браузером. Попробуйте Chrome или Safari.');
      return;
    }

    if (isRecording) {
      recognizer.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognizer.start(
        (transcript, isFinal) => {
          if (transcript) {
            setInputText(transcript);
          }
          if (isFinal) {
            setIsRecording(false);
          }
        },
        (err) => {
          console.error('Speech error:', err);
          setIsRecording(false);
        },
        (lastTranscript) => {
          if (lastTranscript) {
            setInputText(lastTranscript);
          }
          setIsRecording(false);
        }
      );
    }
  };

  const handleWordClick = (token: TextToken, fullSentence: string) => {
    if (!token.isHebrew || !token.cleanText) return;
    setSelectedWord(token.cleanText);
    setWordContext(fullSentence);
  };

  const handleResetChat = () => {
    initChat(userProfile.gender);
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="flex flex-col h-[680px] max-h-[calc(100dvh-170px)] min-h-[460px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Компактная шапка сценария с переключателями */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-zinc-800/90 dark:to-zinc-800/50 p-2.5 sm:p-3 border-b border-zinc-200 dark:border-zinc-700/80">
        <div className="flex items-center justify-between gap-2">
          {/* Левая часть: Бейдж, название и кнопка раскрытия описания */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white shrink-0">
              Диалог
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {lesson.dialogue.title}
            </h3>
            <button
              type="button"
              onClick={() => setShowSituation((prev) => !prev)}
              className={`p-1 rounded-md transition shrink-0 ${
                showSituation
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700'
              }`}
              title={showSituation ? 'Скрыть описание ситуации' : 'Показать описание ситуации'}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Правая часть: Переключатель шрифта, пола и сброс */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Быстрый переключатель шрифта диалога */}
            <button
              type="button"
              onClick={() => {
                const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
                const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
                saveUserProfile(updated);
                if (onUpdateProfile) onUpdateProfile(updated);
              }}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold flex items-center gap-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              title="Переключить шрифт диалога: Печатный / Рукописный"
            >
              {isCursive ? (
                <span className="font-cursive font-bold text-sm text-blue-600 dark:text-blue-400 leading-none">כתב</span>
              ) : (
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
              )}
            </button>

            {/* Интерактивный переключатель пола говорящего */}
            <div className="flex items-center bg-white dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-xs">
              <button
                type="button"
                onClick={() => handleGenderSwitch('male')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                  userProfile.gender === 'male'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="Переключить на обращение к мужчине (זָכָר)"
              >
                👨
              </button>
              <button
                type="button"
                onClick={() => handleGenderSwitch('female')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[11px] transition ${
                  userProfile.gender === 'female'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="Переключить на обращение к женщине (נְקֵבָה)"
              >
                👩
              </button>
            </div>

            {/* Кнопка сброса */}
            <button
              onClick={handleResetChat}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition"
              title="Начать диалог сначала"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Раскрывающееся описание ситуации */}
        {showSituation && (
          <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed animate-in fade-in">
            <p>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Ситуация: </span>
              {lesson.dialogue.situation}
            </p>
          </div>
        )}
      </div>

      {/* Компактная подсказка для клика по словам (сворачиваемая) */}
      {showTips && (
        <div className="bg-blue-500/10 px-3 py-1.5 border-b border-blue-500/20 text-[11px] text-blue-800 dark:text-blue-300 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="truncate">Нажмите на любое слово на иврите для перевода и словарика</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setShowTips(false);
              try {
                localStorage.setItem('ulpana_chat_tips_hidden', 'true');
              } catch {}
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 text-xs font-bold px-1 rounded transition shrink-0 cursor-pointer"
            title="Закрыть подсказку"
          >
            ✕
          </button>
        </div>
      )}

      {/* Панель завершения 4-го этапа урока (ИИ-диалог) */}
      <div className="px-3 py-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-b border-emerald-300/40 dark:border-emerald-800/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              Этап 4/4: Практика диалога
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate hidden xs:block">
              {userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat')
                ? 'Диалог зачтен! Можете продолжить беседу или завершить урок.'
                : 'Пообщайтесь с ИИ и нажмите «Зачесть урок».'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const updated = markLessonTabCompleted(lesson.id, 'chat');
            if (onUpdateProfile) onUpdateProfile(updated);
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer ${
            userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat')
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white animate-pulse'
          }`}
          title="Зачесть 4 этап и завершить урок"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat') ? 'Урок зачтен ✅' : 'Зачесть урок 🎉'}</span>
        </button>
      </div>

      {/* Список сообщений */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-950/30">
        {messages.map((msg, index) => {
          const isAi = msg.role === 'assistant';
          const isLastMessage = index === messages.length - 1;
          const tokens = tokenizeText(msg.hebrew);

          return (
            <div
              key={msg.id}
              ref={isLastMessage ? lastMessageRef : null}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
            >
              <div className="flex items-end gap-1.5 sm:gap-2 max-w-[92%] sm:max-w-[85%]">
                {isAi && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                <div
                  className={`p-3 sm:p-3.5 rounded-2xl shadow-sm ${
                    isAi
                      ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                      : 'bg-blue-600 text-white rounded-br-sm'
                  }`}
                >
                  {/* Текст на иврите с учетом настройки showNikkud */}
                  <div
                    dir="rtl"
                    className={`font-bold leading-relaxed text-right ${
                      isCursive
                        ? 'font-cursive text-xl sm:text-2xl text-blue-600 dark:text-blue-400'
                        : 'font-hebrew text-lg sm:text-xl'
                    }`}
                  >
                    {tokens.map((token) => {
                      const displayWord = userProfile.showNikkud
                        ? token.text
                        : stripNikkud(token.text);

                      if (token.isHebrew) {
                        return (
                          <span
                            key={token.id}
                            onClick={() => handleWordClick(token, msg.hebrew)}
                            className={`inline-block px-1 py-0.5 rounded-md transition cursor-pointer select-text ${
                              isAi
                                ? 'hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:bg-blue-100/70 dark:hover:bg-blue-900/50 active:scale-95'
                                : 'hover:text-yellow-200 hover:underline hover:bg-blue-700/60 active:scale-95'
                            }`}
                            title="Нажмите, чтобы посмотреть перевод и добавить в словарик"
                          >
                            {displayWord}
                          </span>
                        );
                      }
                      return <span key={token.id}>{token.text}</span>;
                    })}
                  </div>

                  {/* Транскрипция с 'h' для ה */}
                  {userProfile.showTranscription && msg.transcription && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                      [{msg.transcription}]
                    </p>
                  )}

                  {/* Перевод на русский */}
                  {msg.translation && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      {msg.translation}
                    </p>
                  )}

                  {/* Кнопка озвучки и бейдж движка */}
                  {isAi ? (
                    <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                      {msg.engine ? (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{msg.engine}</span>
                        </div>
                      ) : <div />}
                      <button
                        type="button"
                        onClick={() => speakHebrew(msg.hebrew, { rate: userProfile.speechRate || 0.7 })}
                        className="text-xs text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition shrink-0"
                        title="Прослушать фразу собеседника"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Прослушать</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 pt-1.5 border-t border-blue-500/40 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => speakHebrew(msg.hebrew, { rate: userProfile.speechRate || 0.7 })}
                        className="text-[11px] text-blue-100 hover:text-white flex items-center gap-1 transition shrink-0"
                        title="Прослушать вашу фразу"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Прослушать</span>
                      </button>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>

              {/* Обратная связь от ИИ по грамматике */}
              {msg.feedback && (
                <div className="ml-8 sm:ml-10 max-w-[85%] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2 sm:p-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Пояснение: </span>
                    <span>{msg.feedback}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
            <span>Собеседник печатает...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Горизонтальная панель быстрых вариантов ответов (Quick-Reply Chips) */}
      {lastAiMessage && lastAiMessage.suggestedReplies && lastAiMessage.suggestedReplies.length > 0 && showSuggestions && (
        <div className="px-3 py-2 bg-zinc-50/95 dark:bg-zinc-900/95 border-t border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Варианты ответа ({lastAiMessage.suggestedReplies.length}):</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition font-medium"
            >
              Скрыть
            </button>
          </div>
          <div className="flex items-stretch gap-2 overflow-x-auto pb-1 scrollbar-none">
            {lastAiMessage.suggestedReplies.map((reply, i) => (
              <div
                key={i}
                onClick={() => handleSendMessage(reply.hebrew)}
                className="group shrink-0 max-w-[280px] sm:max-w-[320px] cursor-pointer text-left bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900 hover:border-blue-500 dark:hover:border-blue-400 p-2.5 rounded-xl text-xs transition shadow-sm hover:scale-[1.01] active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div
                    dir="rtl"
                    className={`font-bold text-sm leading-snug ${
                      isCursive
                        ? 'font-cursive text-lg text-blue-600 dark:text-blue-400'
                        : 'font-hebrew text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {userProfile.showNikkud ? reply.hebrew : stripNikkud(reply.hebrew)}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakHebrew(reply.hebrew, { rate: userProfile.speechRate || 0.7 });
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 transition shrink-0"
                    title="Прослушать этот ответ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {userProfile.showTranscription && reply.transcription && (
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5 truncate">
                    [{reply.transcription}]
                  </div>
                )}
                <div className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5 line-clamp-2">
                  {reply.translation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Поле ввода сообщения */}
      <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        {!showSuggestions && lastAiMessage?.suggestedReplies && lastAiMessage.suggestedReplies.length > 0 && (
          <div className="mb-2 flex items-center justify-start">
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>Показать варианты ответов ({lastAiMessage.suggestedReplies.length})</span>
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl border transition duration-200 shrink-0 ${
              isRecording
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-400/40 shadow-lg shadow-emerald-500/30 scale-105 animate-pulse'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title={isRecording ? 'Идет запись... Нажмите для остановки' : 'Голосовой ввод на иврите'}
          >
            {isRecording ? <Mic className="w-5 h-5 animate-pulse text-white" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            dir="auto"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? '🎙️ Слушаю... говорите на иврите' : 'Напишите ответ на иврите...'}
            className={`min-w-0 flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
              isRecording
                ? 'border-emerald-500 ring-2 ring-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 placeholder:text-emerald-600 font-medium'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600'
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 shadow-sm"
            title="Отправить сообщение"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Модалка разбора слова */}
      {selectedWord && (
        <WordLookupModal
          word={selectedWord}
          context={wordContext}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          userProfile={userProfile}
          onWordAdded={onWordAdded}
        />
      )}
    </div>
  );
};

