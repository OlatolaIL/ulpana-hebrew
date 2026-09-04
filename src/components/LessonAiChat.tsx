'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Check,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, ChatMessage, Word, DialogueWord, DialogueStep } from '@/types';
import { tokenizeText, TextToken, stripNikkud } from '@/lib/transcription';
import { speakHebrew, HebrewSpeechRecognizer } from '@/lib/speech';
import { getDialogueHelpForLesson } from '@/lib/dialogueHints';
import { WordLookupModal } from './WordLookupModal';
import {
  markLessonTabCompleted,
  unmarkLessonTabCompleted,
  saveUserProfile,
  loadUserProfile,
  saveLocalCallLog,
  getStudentKnownVocabulary,
  addWordToPersonalDict,
  isWordInPersonalDict,
} from '@/lib/storage';

interface LessonAiChatProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onGoToPhone?: () => void;
}

function getInitialMessageForGender(lesson: Lesson, gender: 'male' | 'female'): {
  hebrew: string;
  transcription: string;
  translation: string;
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
    };
  }

  if (lesson.number === 2) {
    return {
      hebrew: isFemale
        ? 'שָׁלוֹם! בְּרוּכָה הַבָּאָה לַקָּפֶה שֶׁלָּנוּ. הַקָּפֶה הַיּוֹם מְעֻלֶּה! מָה תִּרְצִי לִשְׁתּוֹת?'
        : 'שָׁלוֹם! בָּרוּךְ הַבָּא לַקָּפֶה שֶׁלָּנוּ. הַקָּפֶה הַיּוֹם מְעֻלֶּה! מָה תִּרְצֶה לִשְׁתּוֹת?',
      transcription: isFemale
        ? 'шалóм! брухá hа-баá ла-кафэ́ шелáну. hа-кафэ́ hайóм мэулé! ма тирцӣ лишто́т?'
        : 'шалóм! барӯх hа-ба ла-кафэ́ шелáну. hа-кафэ́ hайóм мэулé! ма тирцé лишто́т?',
      translation: isFemale
        ? 'Здравствуйте! Добро пожаловать в наше кафе. Кофе сегодня отличный! Что вы хотите выпить? (к женщине)'
        : 'Здравствуйте! Добро пожаловать в наше кафе. Кофе сегодня отличный! Что вы хотите выпить? (к мужчине)',
    };
  }

  if (lesson.number === 3) {
    return {
      hebrew: isFemale
        ? 'שָׁלוֹם! נָעִים מְאוֹד. אֲנִי שָׂרָה מִצָּרְפַת. מֵאֵיפֹה אַתְּ?'
        : 'שָׁלוֹם! נָעִים מְאוֹד. אֲנִי שָׂרָה מִצָּרְפַת. מֵאֵיפֹה אַתָּה?',
      transcription: isFemale
        ? 'шалóм! наӣм мэóд. анӣ Сáра ми-Царфáт. мэ-э́йфо ат?'
        : 'шалóм! наӣм мэóд. анӣ Сáра ми-Царфáт. мэ-э́йфо атá?',
      translation: isFemale
        ? 'Привет! Очень приятно. Я Сара из Франции. Откуда ты? (к женщине)'
        : 'Привет! Очень приятно. Я Сара из Франции. Откуда ты? (к мужчине)',
    };
  }

  if (lesson.number === 4 || lesson.id === 4) {
    return {
      hebrew: 'שָׁלוֹם! הִנֵּה הַשֻּׁלְחָן שֶׁלָּנוּ. עַל הַשֻּׁלְחָן יֵשׁ סֵפֶר: זֶה סֵפֶר. וְמָה יֵשׁ לְיַד הַסֵּפֶר? מָה זֹאת?',
      transcription: 'шалóм! hинэ́ hа-шульхáн шелáну. аль hа-шульхáн йеш сéфер: зэ сéфер. вэ-ма йеш лэ-йáд hа-сéфер? ма зот?',
      translation: isFemale
        ? 'Привет! Вот наш стол. На столе лежит книга: это книга (זֶה סֵפֶר). А что лежит рядом с книгой? Что это (ж.р.)? (к ученице)'
        : 'Привет! Вот наш стол. На столе лежит книга: это книга (זֶה סֵפֶר). А что лежит рядом с книгой? Что это (ж.р.)? (к ученику)',
    };
  }

  // Общий шаблон для остальных уроков с автозаменой обращений
  let heb = lesson.dialogue.initialMessage.hebrew;
  let tr = lesson.dialogue.initialMessage.transcription;
  let transl = lesson.dialogue.initialMessage.translation;

  if (!isFemale) {
    heb = heb.replace(/לָךְ \/ לְךָ/g, 'לְךָ')
             .replace(/תִּרְצֶה \/ תִּרְצִי/g, 'תִּרְצֶה')
             .replace(/תִּסְתַּכֵּל \/ תִּסְתַּכְּלִי/g, 'תִּסְתַּכֵּל')
             .replace(/אַתָּה \/ אַתְּ/g, 'אַתָּה')
             .replace(/שֶׁלְּךָ \/ שֶׁלָּךְ/g, 'שֶׁלְּךָ');
    tr = tr.replace(/лах \/ лэхá/g, 'лэхá')
           .replace(/тирцé \/ тирцӣ/g, 'тирцé')
           .replace(/тистакэ́ль \/ тистаклӣ/g, 'тистакэ́ль')
           .replace(/атá \/ ат/g, 'атá')
           .replace(/шельхá \/ шелáх/g, 'шельхá');
  } else {
    heb = heb.replace(/לָךְ \/ לְךָ/g, 'לָךְ')
             .replace(/תִּרְצֶה \/ תִּרְצִי/g, 'תִּרְצִי')
             .replace(/תִּסְתַּכֵּל \/ תִּסְתַּכְּלִי/g, 'תִּסְתַּכְּלִי')
             .replace(/אַתָּה \/ אַתְּ/g, 'אַתְּ')
             .replace(/שֶׁלְּךָ \/ שֶׁלָּךְ/g, 'שֶׁלָּךְ');
    tr = tr.replace(/лах \/ лэхá/g, 'лах')
           .replace(/тирцé \/ тирцӣ/g, 'тирцӣ')
           .replace(/тистакэ́ль \/ тистаклӣ/g, 'тистаклӣ')
           .replace(/атá \/ ат/g, 'ат')
           .replace(/шельхá \/ шелáх/g, 'шелáх');
  }

  return {
    hebrew: heb,
    transcription: tr,
    translation: transl,
  };
}

export const LessonAiChat: React.FC<LessonAiChatProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onGoToPhone,
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
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [showUsefulWords, setShowUsefulWords] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const sessionIdRef = useRef<string>(`chat_${lesson.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  const startTimeRef = useRef<number>(Date.now());
  const lastFeedbackRef = useRef<string | null>(null);

  const handleAddWordDirectly = (wordItem: DialogueWord) => {
    const newWord: Omit<Word, 'id' | 'dateAdded' | 'isUserAdded'> = {
      hebrew: wordItem.hebrew,
      hebrewPlain: stripNikkud(wordItem.hebrew),
      transcription: wordItem.transcription,
      translation: wordItem.translation,
      partOfSpeech: 'other',
      lessonId: lesson.id,
    };
    const added = addWordToPersonalDict(newWord);
    setAddedWords((prev) => ({ ...prev, [wordItem.hebrew]: true }));
    if (onWordAdded) onWordAdded(added);
    if (onUpdateProfile) onUpdateProfile(loadUserProfile());
  };

  const logChatSession = (history: ChatMessage[], feedback?: string | null) => {
    const userMessages = history.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const formattedTranscript = history.map((m) => ({
      role: m.role,
      hebrew: m.hebrew,
      translation: m.translation,
      transcription: m.transcription,
    }));

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const effectiveFeedback = feedback || lastFeedbackRef.current || undefined;

    // 1. Сохраняем в локальное хранилище (для админки и оффлайн-доступа)
    try {
      saveLocalCallLog({
        id: sessionIdRef.current,
        user_id: userProfile.name || 'local_user',
        user_name: userProfile.name || 'Ученик',
        lesson_id: lesson.id,
        caller_name: lesson.dialogue.aiRole || 'Преподаватель ульпана',
        caller_role: 'ИИ-чат (Этап 4)',
        duration_seconds: durationSeconds,
        messages_count: history.length,
        transcript: formattedTranscript,
        feedback: effectiveFeedback,
        created_at: new Date(startTimeRef.current).toISOString(),
      });
    } catch (e) {
      console.warn('Chat local log error:', e);
    }

    // 2. Логируем в базу данных сервера
    try {
      fetch('/api/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionIdRef.current,
          lessonId: lesson.id,
          callerName: lesson.dialogue.aiRole || 'Преподаватель ульпана',
          callerRole: 'ИИ-чат (Этап 4)',
          durationSeconds,
          transcript: formattedTranscript,
          feedback: effectiveFeedback,
          userName: userProfile.name || 'Ученик',
        }),
      }).catch(() => {});
    } catch {}
  };

  const knownWords = useMemo(
    () => getStudentKnownVocabulary(userProfile, 60, 25),
    [userProfile]
  );

  const helpData = useMemo(
    () => getDialogueHelpForLesson(lesson, userProfile.gender),
    [lesson, userProfile.gender]
  );

  const handleAppendWord = (wordHebrew: string) => {
    const wordToAdd = userProfile.showNikkud ? wordHebrew : stripNikkud(wordHebrew);
    setInputText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return wordToAdd;
      return `${trimmed} ${wordToAdd}`;
    });
  };

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const initChat = (gender: 'male' | 'female') => {
    sessionIdRef.current = `chat_${lesson.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    startTimeRef.current = Date.now();
    lastFeedbackRef.current = null;
    const data = getInitialMessageForGender(lesson, gender);
    const initial: ChatMessage = {
      id: 'init-1',
      role: 'assistant',
      hebrew: data.hebrew,
      transcription: data.transcription,
      translation: data.translation,
      timestamp: Date.now(),
    };
    messagesRef.current = [initial];
    setMessages([initial]);
  };

  useEffect(() => {
    initChat(userProfile.gender);

    const rec = new HebrewSpeechRecognizer();
    setRecognizer(rec);

    return () => {
      rec.stop();
      if (messagesRef.current.length > 1) {
        logChatSession(messagesRef.current);
      }
    };
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

  const TARGET_TURNS = 3;

  const handleSendMessage = async (textToSend?: string) => {
    if (recognizer) {
      recognizer.stop(true);
      setIsRecording(false);
    }

    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messagesRef.current, userMsg];
    messagesRef.current = newMessages;
    setMessages(newMessages);
    setLoading(true);

    const currentUserTurns = newMessages.filter((m) => m.role === 'user').length;
    const stepsCount = lesson.dialogue.steps?.length || TARGET_TURNS;
    const currentStepIndex = Math.min(Math.max(0, currentUserTurns - 1), stepsCount - 1);
    const currentStep = lesson.dialogue.steps?.[currentStepIndex];

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
          vocabularyHints: lesson.dialogue?.vocabularyHints || [],
          grammarTopic: lesson.grammar?.[0]?.title || lesson.titleRussian,
          studentKnownWords: knownWords,
          ulpanMode: Boolean(userProfile.ulpanMode),
          turnIndex: currentUserTurns,
          targetTurns: TARGET_TURNS,
          currentStep,
          allSteps: lesson.dialogue.steps,
          usefulWords: lesson.dialogue.usefulWords,
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
        isCompleted: Boolean(data.isCompleted),
        suggestedReplies: data.suggestedReplies || [],
        newWords: data.newWords,
        timestamp: Date.now(),
      };

      const updatedHistory = [...messagesRef.current, aiMsg];
      messagesRef.current = updatedHistory;
      setMessages(updatedHistory);
      setShowSuggestions(true);

      if (data.feedback) {
        lastFeedbackRef.current = data.feedback;
      }
      logChatSession(updatedHistory, data.feedback);

      const isFinished = Boolean(data.isCompleted || currentUserTurns >= TARGET_TURNS);
      if (isFinished) {
        const updated = markLessonTabCompleted(lesson.id, 'chat');
        if (onUpdateProfile) onUpdateProfile(updated);
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }

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
      alert('Голосовой ввод не поддерживается вашим браузером.');
      return;
    }

    if (isRecording) {
      recognizer.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognizer.start(
        (transcript) => {
          if (transcript) {
            setInputText(transcript);
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
        },
        {
          vocabulary: Array.from(
            new Set([
              ...(lesson.vocabulary || []).map((w) => w.hebrew),
              ...(lesson.dialogue?.vocabularyHints || []),
              ...helpData.usefulWords.map((w) => w.hebrew),
              ...knownWords,
            ])
          ),
          apiKey: userProfile.groqApiKey || undefined,
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
    if (messagesRef.current.length > 1) {
      logChatSession(messagesRef.current);
    }
    // 1. Снимаем зачёт 4 этапа в профиле, чтобы ученик мог пройти его заново с нуля
    const updated = unmarkLessonTabCompleted(lesson.id, 'chat');
    if (onUpdateProfile) onUpdateProfile(updated);
    // 2. Очищаем поле ввода и инициализируем диалог с начальной реплики
    setInputText('');
    initChat(userProfile.gender);
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  const userTurnsCount = messages.filter((m) => m.role === 'user').length;
  const stepsCount = lesson.dialogue.steps?.length || TARGET_TURNS;
  const currentStepIndex = Math.min(Math.max(0, userTurnsCount), stepsCount - 1);
  const activeStep = lesson.dialogue.steps?.[currentStepIndex];
  const isTabCompleted = Boolean(userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat'));
  const isDialogueFinished = isTabCompleted || userTurnsCount >= TARGET_TURNS || messages.some((m) => m.role === 'assistant' && m.isCompleted);

  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div
      data-font-style={userProfile.fontStyle || 'print'}
      className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] h-[720px] max-h-[calc(100dvh-140px)] min-h-[520px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
    >
      {/* ЛЕВАЯ КОЛОНКА: ОСНОВНОЙ ЧАТ */}
      <div className="flex flex-col h-full min-w-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* 1. Единый компактный верхний бар (Header) */}
        <div className="h-12 px-3 sm:px-4 bg-zinc-50/90 dark:bg-zinc-850/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white shrink-0 font-hebrew">
              {userProfile.ulpanMode ? 'שִׂיחָה' : 'Диалог'}
            </span>
            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {lesson.dialogue.aiRole || (userProfile.ulpanMode ? 'מוֹרֶה' : 'Учитель')}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isDialogueFinished
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
              }`}
            >
              {userProfile.ulpanMode
                ? `שָׁלָב ${Math.min(userTurnsCount, TARGET_TURNS)}/${TARGET_TURNS}`
                : `Шаг ${Math.min(userTurnsCount, TARGET_TURNS)} из ${TARGET_TURNS}`}
            </span>

            {/* Кнопка шпаргалки для мобильных устройств */}
            {((lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0) || activeStep) && (
              <button
                type="button"
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                title="Шпаргалка: словарь и факт шага"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Шпаргалка</span>
              </button>
            )}
          </div>

          {/* Правые контролы */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
                const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
                saveUserProfile(updated);
                if (onUpdateProfile) onUpdateProfile(updated);
              }}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
              title="Шрифт: Печатный / Рукописный"
            >
              {isCursive ? (
                <span className="font-cursive font-bold text-sm text-blue-500">כתב</span>
              ) : (
                <span className="font-hebrew font-bold text-xs">דפוס</span>
              )}
            </button>

            <div className="flex items-center bg-white dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => handleGenderSwitch('male')}
                className={`px-1.5 py-0.5 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                  userProfile.gender === 'male' ? 'bg-blue-600 text-white shadow-2xs' : 'text-zinc-400'
                }`}
                title="זָכָר ♂"
              >
                ♂
              </button>
              <button
                type="button"
                onClick={() => handleGenderSwitch('female')}
                className={`px-1.5 py-0.5 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                  userProfile.gender === 'female' ? 'bg-blue-600 text-white shadow-2xs' : 'text-zinc-400'
                }`}
                title="נְקֵבָה ♀"
              >
                ♀
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 transition cursor-pointer"
              title="Начать диалог сначала"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                const updated = markLessonTabCompleted(lesson.id, 'chat');
                if (onUpdateProfile) onUpdateProfile(updated);
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                isTabCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Зачесть 4 этап"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isTabCompleted ? 'Зачтен' : 'Зачесть'}</span>
            </button>

            {onGoToPhone && isDialogueFinished && (
              <button
                type="button"
                onClick={onGoToPhone}
                className="px-2.5 py-1 rounded-lg font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                title="Перейти к этапу звонка"
              >
                <span>Звонок ➡️</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Просторная область сообщений чата */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-zinc-50/40 dark:bg-zinc-950/20">
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
                              title="Нажмите для перевода и словарика"
                            >
                              {displayWord}
                            </span>
                          );
                        }
                        return <span key={token.id}>{token.text}</span>;
                      })}
                    </div>

                    {/* Транскрипция с 'h' для ה */}
                    {!userProfile.ulpanMode && userProfile.showTranscription && msg.transcription && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                        [{msg.transcription}]
                      </p>
                    )}

                    {/* Перевод на русский */}
                    {!userProfile.ulpanMode && msg.translation && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                        {msg.translation}
                      </p>
                    )}

                    {/* Карточки новых/полезных слов этой реплики */}
                    {isAi && msg.newWords && msg.newWords.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/70 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-2 font-hebrew">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{userProfile.ulpanMode ? 'מִילִּים חֲדָשׁוֹת:' : 'Новые слова в реплике:'}</span>
                        </div>
                        <div className="space-y-1">
                          {msg.newWords.map((nw, nwIdx) => {
                            const isAdded = addedWords[nw.hebrew] || isWordInPersonalDict(nw.hebrew, userProfile.personalVocabulary);
                            return (
                              <div
                                key={nwIdx}
                                className="flex items-center justify-between gap-1.5 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-amber-200/50 dark:border-amber-800/30 text-xs shadow-2xs"
                              >
                                <div className="flex items-baseline gap-1.5 min-w-0">
                                  <span dir="rtl" className="font-hebrew font-bold text-zinc-900 dark:text-zinc-100">
                                    {userProfile.showNikkud ? nw.hebrew : stripNikkud(nw.hebrew)}
                                  </span>
                                  {!userProfile.ulpanMode && nw.transcription && (
                                    <span className="text-[10px] text-blue-500">[{nw.transcription}]</span>
                                  )}
                                  <span className="text-zinc-600 dark:text-zinc-300 text-[11px] truncate">— {nw.translation}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => speakHebrew(nw.hebrew, { rate: userProfile.speechRate || 0.7 })}
                                    className="p-1 text-zinc-400 hover:text-blue-500 rounded cursor-pointer"
                                    title="Озвучить"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isAdded}
                                    onClick={() => handleAddWordDirectly(nw)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer flex items-center gap-0.5 ${
                                      isAdded
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <>
                                        <Check className="w-2.5 h-2.5" />
                                        <span>{userProfile.ulpanMode ? 'בַּמִּילּוֹן' : 'В словаре'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <BookmarkPlus className="w-2.5 h-2.5" />
                                        <span>{userProfile.ulpanMode ? 'הוֹסֵף' : '+ В словарик'}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
                          className="text-xs text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition shrink-0 cursor-pointer"
                          title="Прослушать фразу"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{userProfile.ulpanMode ? 'שמע' : 'Прослушать'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 pt-1.5 border-t border-blue-500/40 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => speakHebrew(msg.hebrew, { rate: userProfile.speechRate || 0.7 })}
                          className="text-[11px] text-blue-100 hover:text-white flex items-center gap-1 transition shrink-0 cursor-pointer"
                          title="Прослушать вашу фразу"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{userProfile.ulpanMode ? 'שמע' : 'Прослушать'}</span>
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
                      <span className="font-bold">{userProfile.ulpanMode ? 'מִשׁוּב / תִּיקּוּן: ' : 'Пояснение: '}</span>
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
              <span className="font-hebrew">{userProfile.ulpanMode ? 'הַבּוֹט כּוֹתֵב...' : 'Собеседник печатает...'}</span>
            </div>
          )}

          {isDialogueFinished && userTurnsCount >= TARGET_TURNS && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-400/40 dark:border-emerald-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-in fade-in shadow-xs my-2 font-hebrew">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
                    {userProfile.ulpanMode ? '🎉 הַשִּׂיחָה הוּשְׁלְמָה בִּמְלוֹאָהּ!' : '🎉 Диалог успешно завершён!'}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    {userProfile.ulpanMode
                      ? 'הִשְׁלַמְתֶּם אֶת יַעֲדֵי הַשִּׂיחָה. כָּעֵת מוּמלָץ לַעֲבוֹר לְשִׂיחַת טֶלֶפוֹן!'
                      : 'Вы успешно пообщались с ИИ! Теперь закрепите живую речь в звонке.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {onGoToPhone && (
                  <button
                    type="button"
                    onClick={onGoToPhone}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{userProfile.ulpanMode ? 'לְשִׂיחַת טֶלֶפוֹן 📞' : 'Звонок (этап 5/5) 📞 ➡️'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Начать сначала"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Нижняя зона: быстрые пилюли ответа + аккуратная строка ввода */}
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          {/* Быстрые подсказки прямо над строкой ввода */}
          {showSuggestions && lastAiMessage?.suggestedReplies && lastAiMessage.suggestedReplies.length > 0 && !isDialogueFinished && (
            <div className="px-3 pt-2 pb-1 bg-zinc-50/70 dark:bg-zinc-850/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-zinc-400 shrink-0">
                {userProfile.ulpanMode ? 'תְּשׁוּבָה מְהִירָה:' : 'Быстрый ответ:'}
              </span>
              {lastAiMessage.suggestedReplies.map((reply, rIdx) => (
                <button
                  key={rIdx}
                  type="button"
                  onClick={() => setInputText(reply.hebrew)}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-hebrew font-medium transition active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span dir="rtl">{reply.hebrew}</span>
                </button>
              ))}
            </div>
          )}

          {/* Строка ввода со встроенным микрофоном */}
          <div className="p-2.5 sm:p-3">
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
                className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center ${
                  isRecording
                    ? 'bg-rose-600 text-white ring-4 ring-rose-400/40 animate-pulse shadow-md'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700'
                }`}
                title={isRecording ? 'Остановить запись' : 'Ответить голосом на иврите'}
              >
                <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce' : ''}`} />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  dir="auto"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isRecording
                      ? (userProfile.ulpanMode ? '🎙️ מַאֲזִין... דַּבְּרוּ בְּעִבְרִית' : '🎙️ Слушаю... говорите на иврите')
                      : (userProfile.ulpanMode ? 'הַקְלִידוּ אוֹ דַּבְּרוּ בְּעִבְרִית...' : 'Напишите или продиктуйте ответ на иврите...')
                  }
                  className={`w-full py-2.5 pl-3.5 pr-8 rounded-xl border text-sm transition focus:outline-none ${
                    isRecording
                      ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900/50 bg-rose-50/30 text-rose-950 dark:text-rose-100 font-medium'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800'
                  }`}
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition cursor-pointer"
                    title="Очистить"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition active:scale-95 shrink-0 cursor-pointer flex items-center justify-center"
                title="Отправить ответ"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ПРАВАЯ КОЛОНКА: БОКОВАЯ ПАНЕЛЬ ШПАРГАЛКИ (DESKTOP SIDEBAR) */}
      <div className="hidden lg:flex flex-col h-full bg-zinc-50/70 dark:bg-zinc-900/90 overflow-hidden">
        {/* Шапка боковой панели */}
        <div className="h-12 px-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-850/50">
          <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-zinc-100 font-hebrew">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{userProfile.ulpanMode ? 'שִׁלְדַּת הַשִּׂיחָה וּמִילּוֹן' : 'Шпаргалка к диалогу'}</span>
          </div>
          {lesson.dialogue.usefulWords && (
            <span className="text-[10px] text-zinc-400 font-medium">
              {lesson.dialogue.usefulWords.length} слов
            </span>
          )}
        </div>

        {/* Скроллируемое тело боковой панели */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {/* 1. Карточка текущего факта (Fact First) */}
          {activeStep && (
            <div className="bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl p-3 shadow-2xs font-hebrew">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                <span>📌</span>
                <span>
                  {userProfile.ulpanMode ? `שָׁלָב ${activeStep.stepIndex}:` : `Шаг ${activeStep.stepIndex} из ${stepsCount}`}
                </span>
              </div>
              <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
                {activeStep.fact}
              </p>
              {activeStep.expectedConcept && (
                <div className="mt-2 pt-1.5 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300">
                  <span className="font-bold">🎯 Фокус: </span>
                  <span>{activeStep.expectedConcept}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. Словарь диалога */}
          {lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-0.5 font-hebrew">
                {userProfile.ulpanMode ? 'מִילִּים שֶׁיַּעַזְרוּ לָכֶם:' : 'Слова для ответа:'}
              </p>
              <div className="space-y-1.5">
                {lesson.dialogue.usefulWords.map((word, idx) => {
                  const isAdded =
                    addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleAppendWord(word.hebrew)}
                      className="group cursor-pointer bg-white dark:bg-zinc-800/90 hover:bg-blue-50/60 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs transition active:scale-[0.99]"
                      title="Нажмите, чтобы вставить в поле ответа"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            dir="rtl"
                            className="font-hebrew font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition"
                          >
                            {userProfile.showNikkud ? word.hebrew : stripNikkud(word.hebrew)}
                          </span>
                          {word.isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
                              {userProfile.ulpanMode ? 'חָדָשׁ' : 'Новое'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {!userProfile.ulpanMode && word.transcription && (
                            <span className="text-blue-500 mr-1">[{word.transcription}]</span>
                          )}
                          <span>{word.translation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 });
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                          title="Озвучить"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddWordDirectly(word);
                          }}
                          className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-0.5 ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-zinc-100 hover:bg-amber-500 hover:text-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          }`}
                          title={isAdded ? 'В словаре' : 'В словарик'}
                        >
                          {isAdded ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <BookmarkPlus className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* МОБИЛЬНАЯ ШТОРКА (ДЛЯ ЭКРАНОВ МЕНЬШЕ 1024px) */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Шпаргалка к диалогу</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {activeStep && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                    📌 Шаг {activeStep.stepIndex} из {stepsCount}
                  </p>
                  <p className="text-xs text-blue-950 dark:text-blue-100">{activeStep.fact}</p>
                </div>
              )}

              {lesson.dialogue.usefulWords && (
                <div className="space-y-1.5">
                  {lesson.dialogue.usefulWords.map((word, idx) => {
                    const isAdded =
                      addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          handleAppendWord(word.hebrew);
                          setShowMobileSidebar(false);
                        }}
                        className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <span dir="rtl" className="font-hebrew font-bold text-base text-zinc-900 dark:text-zinc-100">
                            {word.hebrew}
                          </span>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {word.transcription && <span className="text-blue-500 mr-1">[{word.transcription}]</span>}
                            <span>{word.translation}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 });
                            }}
                            className="p-1.5 text-zinc-400 hover:text-blue-500 cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isAdded}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddWordDirectly(word);
                            }}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              isAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {isAdded ? 'В словаре' : '+ В словарик'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

