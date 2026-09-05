'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'words' | 'replies'>('words');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
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
      className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] h-full flex-1 min-h-0 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
    >
      {/* ЛЕВАЯ КОЛОНКА: ОСНОВНОЙ ЧАТ */}
      <div className="flex flex-col h-full min-w-0 min-h-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* ВЕРХНЯЯ ЗАКРЕПЛЕННАЯ ПАНЕЛЬ: Вводные данные шага + Переключение пола ♂ ♀ + Сброс ⟲ */}
        <div className="shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 sm:px-4 sm:py-2.5 z-10 shadow-2xs font-hebrew">
          <div className="flex items-center justify-between gap-2">
            {/* Слева: Текущий шаг + кнопка Вводные данные */}
            <div className="flex items-center gap-2 min-w-0">
              {activeStep ? (
                <>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2.5 py-1 rounded-lg shrink-0">
                    {userProfile.ulpanMode
                      ? `שָׁלָב ${activeStep.stepIndex}/${stepsCount}`
                      : `Шаг ${activeStep.stepIndex}/${stepsCount}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBriefingModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer active:scale-95 shadow-2xs truncate"
                    title="Открыть подробные вводные данные шага"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      {userProfile.ulpanMode ? 'הַקְשֵׁר וְעֻבְדּוֹת' : 'Вводные данные'}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {lesson.dialogue.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBriefingModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
                    title="Открыть вводные данные ситуации"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-bold truncate">
                      {userProfile.ulpanMode ? 'הַקְשֵׁר' : 'Вводные данные'}
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Справа: Смена пола ♂ ♀ + Кнопка сброса ⟲ */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Переключатель пола */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleGenderSwitch('male')}
                  className={`px-2 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                    userProfile.gender === 'male'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="זָכָר ♂ (Мужской род)"
                >
                  ♂
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSwitch('female')}
                  className={`px-2 py-1 rounded-md font-bold text-xs transition cursor-pointer ${
                    userProfile.gender === 'female'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="נְקֵבָה ♀ (Женский род)"
                >
                  ♀
                </button>
              </div>

              {/* Сброс диалога */}
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 hover:text-blue-600 dark:text-zinc-400 transition cursor-pointer shadow-2xs"
                title="Начать диалог сначала"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Быстрый факт шага (кликабельный) */}
          {activeStep ? (
            <div
              onClick={() => setShowBriefingModal(true)}
              className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs cursor-pointer group"
              title="Нажмите, чтобы открыть подробные вводные данные шага"
            >
              <div className="flex items-center gap-1.5 min-w-0 text-zinc-700 dark:text-zinc-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">📍 Факт:</span>
                <span className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {activeStep.fact}
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 group-hover:underline flex items-center gap-0.5">
                <span>Подробнее</span>
                <span>→</span>
              </span>
            </div>
          ) : (
            lesson.dialogue.situation && (
              <div
                onClick={() => setShowBriefingModal(true)}
                className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs cursor-pointer group"
                title="Нажмите, чтобы открыть вводные данные ситуации"
              >
                <div className="flex items-center gap-1.5 min-w-0 text-zinc-700 dark:text-zinc-300">
                  <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">📍 Ситуация:</span>
                  <span className="font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {lesson.dialogue.situation}
                  </span>
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 group-hover:underline flex items-center gap-0.5">
                  <span>Подробнее</span>
                  <span>→</span>
                </span>
              </div>
            )
          )}
        </div>

        {/* Просторная область сообщений чата */}
        <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3 bg-zinc-50/40 dark:bg-zinc-950/20">

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

        {/* 3. Нижняя зона: Фиксированная строка ввода со встроенным микрофоном */}
        <div className="shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 sticky bottom-0 z-20 pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
          {/* Если есть готовые примеры ответа — тонкая информативная плашка с кнопкой */}
          {lastAiMessage?.suggestedReplies && lastAiMessage.suggestedReplies.length > 0 && !isDialogueFinished && (
            <div className="px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setDrawerTab('replies');
                  setIsWordsDrawerOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                title="Показать готовые варианты ответа в шторке"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{userProfile.ulpanMode ? 'דֻּגְמָאוֹת לַתְּשׁוּבָה' : 'Готовые варианты ответа'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {lastAiMessage.suggestedReplies.length}
                </span>
              </button>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                {userProfile.ulpanMode ? 'לַחֲצוּ לִצְפִיָּה בַּשְּׁטוֹרְקָה' : 'нажмите для просмотра'}
              </span>
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
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700'
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
        <div className="h-12 px-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
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
                      className="group cursor-pointer bg-white dark:bg-zinc-800/90 hover:bg-blue-50/60 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-2 flex items-center justify-between gap-2 shadow-2xs transition active:scale-[0.99]"
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


      {/* БОКОВОЙ ЯРЛЫЧОК ШТОРКИ (Floating Drawer Tab справа) - всегда на виду на мобильных */}
      {lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setDrawerTab('words');
            setIsWordsDrawerOpen(true);
          }}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl rounded-l-2xl py-3 px-1.5 sm:px-2 flex flex-col items-center gap-1.5 cursor-pointer border-y border-l border-blue-400/60 lg:hidden group transition-all"
          title="Открыть боковую шторку со словами"
        >
          <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase [writing-mode:vertical-rl] tracking-widest text-blue-100">
            {userProfile.ulpanMode ? 'מִילִּים' : 'СЛОВА'}
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center shadow-xs">
            {lesson.dialogue.usefulWords.length}
          </span>
        </button>
      )}

      {/* БОКОВАЯ ШТОРКА (SIDE DRAWER СПРАВА) ЧЕРЕЗ CREATEPORTAL */}
      {mounted && isWordsDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Затемнение фона (Backdrop) */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer"
            onClick={() => setIsWordsDrawerOpen(false)}
          />

          {/* Панель шторки */}
          <div
            className="relative z-10 w-[88vw] max-w-sm sm:max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 font-hebrew"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка шторки */}
            <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">📖</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 truncate">
                    {userProfile.ulpanMode ? 'שִׁלְדַּת הַשִּׂיחָה' : 'Подсказки к шагу'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {userProfile.ulpanMode ? 'מִילִּים וּדֻּגְמָאוֹת' : 'Слова шага и готовые примеры'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Вкладки внутри шторки: Слова / Варианты */}
            {lastAiMessage?.suggestedReplies && lastAiMessage.suggestedReplies.length > 0 && !isDialogueFinished && (
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-3 pt-2 gap-2 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setDrawerTab('words')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    drawerTab === 'words'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{userProfile.ulpanMode ? 'מִילִּים' : 'Слова шага'}</span>
                  {lesson.dialogue.usefulWords && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                      {lesson.dialogue.usefulWords.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDrawerTab('replies')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    drawerTab === 'replies'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{userProfile.ulpanMode ? 'דֻּגְמָאוֹת' : 'Варианты'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {lastAiMessage.suggestedReplies.length}
                  </span>
                </button>
              </div>
            )}

            {/* Контент шторки с независимым скроллом */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {drawerTab === 'words' ? (
                /* Список слов */
                lesson.dialogue.usefulWords && lesson.dialogue.usefulWords.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-0.5">
                      {userProfile.ulpanMode ? 'מִילִּים לַתְּשׁוּבָה:' : 'Слова для ответа:'}
                    </p>
                    {lesson.dialogue.usefulWords.map((word, idx) => {
                      const isAdded =
                        addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                      return (
                        <div
                          key={idx}
                          className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-600 transition space-y-1.5"
                        >
                          {/* Верхняя строка: Иврит + бейдж + кнопки действий */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                dir="rtl"
                                className={`font-hebrew font-bold text-lg text-zinc-900 dark:text-zinc-50 ${
                                  isCursive ? 'font-cursive text-xl text-blue-600 dark:text-blue-400' : ''
                                }`}
                              >
                                {userProfile.showNikkud ? word.hebrew : stripNikkud(word.hebrew)}
                              </span>
                              {word.isNew && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
                                  {userProfile.ulpanMode ? 'חָדָשׁ' : 'Новое'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Озвучить */}
                              <button
                                type="button"
                                onClick={() => speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 })}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 transition cursor-pointer"
                                title="Озвучить"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              {/* В личный словарь */}
                              <button
                                type="button"
                                disabled={isAdded}
                                onClick={() => handleAddWordDirectly(word)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isAdded
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                                    : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-700'
                                }`}
                                title={isAdded ? 'В словаре' : 'В личный словарь'}
                              >
                                {isAdded ? <Check className="w-4 h-4 text-emerald-600" /> : <BookmarkPlus className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Нижняя строка: Транскрипция и ПОЛНЫЙ перевод (без truncate) */}
                          <div className="text-xs sm:text-sm leading-snug flex items-baseline gap-1.5 flex-wrap">
                            {!userProfile.ulpanMode && word.transcription && (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                                [{word.transcription}]
                              </span>
                            )}
                            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                              {word.translation}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-8">
                    {userProfile.ulpanMode ? 'אֵין מִילִּים נוֹסָפוֹת' : 'Для этого шага нет дополнительных слов'}
                  </p>
                )
              ) : (
                /* Список вариантов ответов */
                lastAiMessage?.suggestedReplies && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-0.5">
                      {userProfile.ulpanMode ? 'דֻּגְמָאוֹת לַתְּשׁוּבָה:' : 'Готовые варианты ответа:'}
                    </p>
                    {lastAiMessage.suggestedReplies.map((reply, rIdx) => (
                      <div
                        key={rIdx}
                        className="bg-white dark:bg-zinc-800/90 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl p-3 flex flex-col gap-2 shadow-2xs hover:border-indigo-400 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p dir="rtl" className="font-hebrew font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed text-right flex-1">
                            {reply.hebrew}
                          </p>
                          <button
                            type="button"
                            onClick={() => speakHebrew(reply.hebrew, { rate: userProfile.speechRate || 0.7 })}
                            className="p-1 rounded-md text-zinc-400 hover:text-blue-600 transition cursor-pointer shrink-0"
                            title="Озвучить"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        {reply.translation && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {reply.translation}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setInputText(reply.hebrew);
                            setIsWordsDrawerOpen(false);
                          }}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                        >
                          <span>Использовать эту фразу</span>
                          <span>↵</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Подвал шторки с кнопкой Закрыть */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-bold transition cursor-pointer active:scale-98 border border-zinc-200 dark:border-zinc-700"
              >
                {userProfile.ulpanMode ? 'סְגִירָה' : 'Закрыть подсказки'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* МОДАЛЬНОЕ ОКНО: ВВОДНЫЕ ДАННЫЕ ШАГА (ЧЕРЕЗ CREATEPORTAL) */}
      {mounted && showBriefingModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Затемнение фона */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 cursor-pointer"
            onClick={() => setShowBriefingModal(false)}
          />

          {/* Модальное окно */}
          <div
            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden font-hebrew flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модального окна */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl">📍</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                    {activeStep
                      ? (userProfile.ulpanMode
                          ? `שָׁלָב ${activeStep.stepIndex}: מַצָּב וְהַקְשֵׁר`
                          : `Вводные данные: Шаг ${activeStep.stepIndex} из ${stepsCount}`)
                      : (userProfile.ulpanMode
                          ? 'הַקְשֵׁר וּמַטָּרוֹת הַשִּׂיחָה'
                          : 'Вводные данные диалога')}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {lesson.dialogue.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Тело модального окна */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-left">
              {/* Общая ситуация диалога */}
              {lesson.dialogue.situation && (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3.5 border border-zinc-200 dark:border-zinc-700 text-xs">
                  <span className="font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    {userProfile.ulpanMode ? 'מַצָּב כְּלָלִי' : 'Общая ситуация диалога:'}
                  </span>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                    {lesson.dialogue.situation}
                  </p>
                </div>
              )}

              {/* Если есть activeStep (пошаговый режим) */}
              {activeStep ? (
                <>
                  {/* Факт текущего шага */}
                  <div className="bg-blue-50 dark:bg-blue-950/60 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <span>🎯</span>
                      <span>{userProfile.ulpanMode ? 'מַה שֶׁקּוֹרֶה עַכְשָׁו (עֻבְדָּה):' : 'Что происходит прямо сейчас (факт):'}</span>
                    </span>
                    <p className="text-sm sm:text-base font-bold text-blue-950 dark:text-blue-100 leading-relaxed">
                      {activeStep.fact}
                    </p>
                  </div>

                  {/* Вопрос учителя */}
                  {activeStep.aiQuestionHebrew && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                      <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block">
                        {userProfile.ulpanMode ? 'שְׁאֵלַת הַמּוֹרֶה:' : 'Вопрос учителя:'}
                      </span>
                      <div className="flex items-start justify-between gap-3">
                        <p dir="rtl" className="font-hebrew font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 leading-relaxed text-right flex-1">
                          {userProfile.showNikkud ? activeStep.aiQuestionHebrew : stripNikkud(activeStep.aiQuestionHebrew)}
                        </p>
                        <button
                          type="button"
                          onClick={() => speakHebrew(activeStep.aiQuestionHebrew, { rate: userProfile.speechRate || 0.7 })}
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer shrink-0"
                          title="Озвучить вопрос"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                      {activeStep.aiQuestionRu && !userProfile.ulpanMode && (
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 border-t border-zinc-200 dark:border-zinc-700 pt-2 italic">
                          {activeStep.aiQuestionRu}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Цель ответа ученика (без спойлеров на иврите) */}
                  {activeStep.expectedConcept && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3.5 border border-amber-200 dark:border-amber-900/60">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1">
                        💡 {userProfile.ulpanMode ? 'מַה מְּתַרְגְּלִים:' : 'Ваша задача:'}
                      </span>
                      <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium">
                        {activeStep.expectedConcept}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Для всех остальных уроков со свободным диалогом */
                <>
                  {/* Роли */}
                  {(lesson.dialogue.userRole || lesson.dialogue.aiRole) && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                          {userProfile.ulpanMode ? 'הַתַּפְקִיד שֶׁלְּךָ' : 'Ваша роль:'}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {lesson.dialogue.userRole || 'Ученик'}
                        </span>
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                          {userProfile.ulpanMode ? 'הַבֶּן זוּג לַשִּׂיחָה' : 'Собеседник:'}
                        </span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {lesson.dialogue.aiRole || 'Собеседник'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Цели диалога (без подсказок-спойлеров на иврите) */}
                  {lesson.dialogue.goals && lesson.dialogue.goals.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3.5 border border-amber-200 dark:border-amber-900/60">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-2">
                        💡 {userProfile.ulpanMode ? 'מַטָּרוֹת הַשִּׂיחָה:' : 'Цели диалога:'}
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                        {lesson.dialogue.goals.map((goal, idx) => {
                          const cleanGoal = goal
                            .replace(/\s*\([\u0590-\u05FF\s\.,;:!?'-/]+\)/g, '')
                            .replace(/«[\u0590-\u05FF\s\.,;:!?'-/]+»/g, '');
                          return (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                              <span className="font-medium">{cleanGoal}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Подвал с кнопкой Понятно */}
            <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{userProfile.ulpanMode ? 'הֵבַנְתִּי, לַשִּׂיחָה 💬' : 'Понятно, к диалогу 💬'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
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

