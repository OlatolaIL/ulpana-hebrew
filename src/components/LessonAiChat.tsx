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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, ChatMessage, Word } from '@/types';
import { tokenizeText, TextToken, stripNikkud } from '@/lib/transcription';
import { speakHebrew, HebrewSpeechRecognizer } from '@/lib/speech';
import { getDialogueHelpForLesson } from '@/lib/dialogueHints';
import { WordLookupModal } from './WordLookupModal';
import { markLessonTabCompleted, saveUserProfile } from '@/lib/storage';

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
        ? 'שָׁלוֹם! מָה תִּרְצִי לִשְׁתּוֹת הַיּוֹם?'
        : 'שָׁלוֹם! מָה תִּרְצֶה לִשְׁתּוֹת הַיּוֹם?',
      transcription: isFemale
        ? 'шалóм! ма тирцӣ лишто́т hайóм?'
        : 'шалóм! ма тирцé лишто́т hайóм?',
      translation: isFemale
        ? 'Здравствуйте! Что вы хотите выпить сегодня? (к женщине)'
        : 'Здравствуйте! Что вы хотите выпить сегодня? (к мужчине)',
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

  if (lesson.number === 4) {
    return {
      hebrew: isFemale
        ? 'שָׁלוֹם! תִּסְתַּכְּלִי עַל הַשֻּׁלְחָן: מָה זֶה וּמָה זֹאת?'
        : 'שָׁלוֹם! תִּסְתַּכֵּל עַל הַשֻּׁלְחָן: מָה זֶה וּמָה זֹאת?',
      transcription: isFemale
        ? 'шалóм! тистаклӣ аль hа-шульхáн: ма зэ у-ма зот?'
        : 'шалóм! тистакэ́ль аль hа-шульхáн: ма зэ у-ма зот?',
      translation: isFemale
        ? 'Привет! Посмотри на стол: что это (м.р.) и что это (ж.р.)? (к ученице)'
        : 'Привет! Посмотри на стол: что это (м.р.) и что это (ж.р.)? (к ученику)',
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
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

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
          ulpanMode: Boolean(userProfile.ulpanMode),
          turnIndex: currentUserTurns,
          targetTurns: TARGET_TURNS,
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
        timestamp: Date.now(),
      };

      const updatedHistory = [...messagesRef.current, aiMsg];
      messagesRef.current = updatedHistory;
      setMessages(updatedHistory);
      setShowSuggestions(true);

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
    initChat(userProfile.gender);
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  const userTurnsCount = messages.filter((m) => m.role === 'user').length;
  const isTabCompleted = Boolean(userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat'));
  const isDialogueFinished = isTabCompleted || userTurnsCount >= TARGET_TURNS || messages.some((m) => m.role === 'assistant' && m.isCompleted);

  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="flex flex-col h-[680px] max-h-[calc(100dvh-170px)] min-h-[460px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-zinc-800/90 dark:to-zinc-800/50 p-2.5 sm:p-3 border-b border-zinc-200 dark:border-zinc-700/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white shrink-0 font-hebrew">
              {userProfile.ulpanMode ? 'שִׂיחָה' : 'Диалог'}
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate" dir={userProfile.ulpanMode ? 'rtl' : 'ltr'}>
              {userProfile.ulpanMode ? (lesson.titleHebrew || lesson.dialogue.title) : lesson.dialogue.title}
            </h3>
            <button
              type="button"
              onClick={() => setShowSituation((prev) => !prev)}
              className={`p-1 rounded-md transition shrink-0 cursor-pointer ${
                showSituation
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  : 'text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700'
              }`}
              title={showSituation ? (userProfile.ulpanMode ? 'הסתר תיאור' : 'Скрыть описание ситуации') : (userProfile.ulpanMode ? 'הצג תיאור' : 'Показать описание ситуации')}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
                const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
                saveUserProfile(updated);
                if (onUpdateProfile) onUpdateProfile(updated);
              }}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold flex items-center gap-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              title={userProfile.ulpanMode ? 'החלף גופן' : 'Переключить шрифт диалога: Печатный / Рукописный'}
            >
              {isCursive ? (
                <span className="font-cursive font-bold text-sm text-blue-600 dark:text-blue-400 leading-none">כתב</span>
              ) : (
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
              )}
            </button>

            <div className="flex items-center bg-white dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-xs">
              <button
                type="button"
                onClick={() => handleGenderSwitch('male')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                  userProfile.gender === 'male'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="זָכָר ♂"
              >
                ♂
              </button>
              <button
                type="button"
                onClick={() => handleGenderSwitch('female')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                  userProfile.gender === 'female'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="נְקֵבָה ♀"
              >
                ♀
              </button>
            </div>

            <button
              onClick={handleResetChat}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition cursor-pointer"
              title={userProfile.ulpanMode ? 'התחל שיחה מחדש' : 'Начать диалог сначала'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showSituation && (
          <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed animate-in fade-in" dir={userProfile.ulpanMode ? 'rtl' : 'ltr'}>
            <p>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-hebrew">
                {userProfile.ulpanMode ? 'מַצָּב / תַּרְחִישׁ: ' : 'Ситуация: '}
              </span>
              {userProfile.ulpanMode ? (lesson.description || 'שִׂיחָה מַעֲשִׂית בְּעִבְרִית עִם הַמּוֹרֶה') : lesson.dialogue.situation}
            </p>
          </div>
        )}
      </div>

      {showTips && (
        <div className="bg-blue-500/10 px-3 py-1.5 border-b border-blue-500/20 text-[11px] text-blue-800 dark:text-blue-300 flex items-center justify-between gap-2 font-hebrew">
          <span className="flex items-center gap-1.5 min-w-0 truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="truncate">
              {userProfile.ulpanMode
                ? 'לַחֲצוּ עַל כָּל מִילָּה בְּעִבְרִית כְּדֵי לִשְׁמוֹעַ'
                : 'Нажмите на любое слово на иврите для перевода и словарика'}
            </span>
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
            title="✕"
          >
            ✕
          </button>
        </div>
      )}

      <div className="px-3 py-2 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-b border-emerald-300/40 dark:border-emerald-800/40 flex items-center justify-between gap-2 font-hebrew">
        <div className="flex items-center gap-2 min-w-0">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {userProfile.ulpanMode ? 'שָׁלָב 4/5: תִּרְגּוּל שִׂיחָה' : 'Этап 4/5: Практика диалога'}
              </p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isDialogueFinished
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
              }`}>
                {userProfile.ulpanMode
                  ? `${Math.min(userTurnsCount, TARGET_TURNS)}/${TARGET_TURNS} שְׁלָבִים`
                  : `Ход ${Math.min(userTurnsCount, TARGET_TURNS)} из ${TARGET_TURNS}`}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate hidden xs:block">
              {isDialogueFinished
                ? (userProfile.ulpanMode
                    ? 'הַשִּׂיחָה הוּשְׁלְמָה! אֶפְשָׁר לְהַמְשִׁיךְ אוֹ לַעֲבוֹר לְשִׂיחַת טֶלֶפוֹן.'
                    : 'Диалог зачтен! Можете продолжить беседу или перейти к звонку.')
                : (userProfile.ulpanMode
                    ? `שׂוֹחֲחוּ עִם הַבּוֹט (${Math.max(0, TARGET_TURNS - userTurnsCount)} תְּשׁוּבוֹת נוֹתְרוּ).`
                    : `Ответьте на вопросы ИИ (осталось ответов: ${Math.max(0, TARGET_TURNS - userTurnsCount)}).`)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const updated = markLessonTabCompleted(lesson.id, 'chat');
              if (onUpdateProfile) onUpdateProfile(updated);
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              isTabCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white animate-pulse'
            }`}
            title="Зачесть 4 этап"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isTabCompleted ? 'Диалог зачтен ✅' : 'Зачесть диалог 🎉'}</span>
          </button>

          {onGoToPhone && (
            <button
              type="button"
              onClick={onGoToPhone}
              className="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
              title="Перейти к этапу звонка"
            >
              <span>Звонок (этап 5/5) ➡️</span>
            </button>
          )}
        </div>
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

                  {/* Транскрипция с 'h' для ה (скрыта в режиме Ульпан) */}
                  {!userProfile.ulpanMode && userProfile.showTranscription && msg.transcription && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                      [{msg.transcription}]
                    </p>
                  )}

                  {/* Перевод на русский (скрыт в режиме Ульпан) */}
                  {!userProfile.ulpanMode && msg.translation && (
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
                        <span>{userProfile.ulpanMode ? 'שמע' : 'Прослушать'}</span>
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
                title={userProfile.ulpanMode ? 'התחל שיחה מחדש' : 'Начать диалог сначала'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Панель «Слова-подсказки для ответа» (Word Bank & Шаблон фразы) */}
      {helpData.usefulWords.length > 0 && (
        <div className="px-3 py-2 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-zinc-900/90 dark:via-zinc-800/80 dark:to-zinc-900/90 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 font-hebrew">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {userProfile.ulpanMode
                  ? 'מִילִּים מוֹעִילוֹת לִתְשׁוּבָה (דַּבְּרוּ בְּקוֹל 🎙️):'
                  : 'Слова-подсказки для ответа (скажите вслух 🎙️):'}
              </span>
            </span>

            {helpData.sentencePatterns.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                <span className="opacity-70 font-medium">{userProfile.ulpanMode ? 'דֻּגְמָה:' : 'Образец:'}</span>
                <span className="font-bold font-hebrew px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
                  {helpData.sentencePatterns[0]}
                </span>
              </div>
            )}
          </div>

          {/* Горизонтальная лента карточек слов с озвучкой и вставкой кликом */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {helpData.usefulWords.map((word, idx) => {
              const displayHebrew = userProfile.showNikkud ? word.hebrew : stripNikkud(word.hebrew);

              return (
                <div
                  key={idx}
                  onClick={() => handleAppendWord(word.hebrew)}
                  className="group shrink-0 cursor-pointer bg-white dark:bg-zinc-800 hover:bg-blue-50/80 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 px-2.5 py-1.5 rounded-xl transition shadow-2xs hover:shadow-xs active:scale-95 flex items-center gap-1.5"
                  title={userProfile.ulpanMode ? 'לַחֲצוּ לְהוֹסָפַת הַמִּילָּה לַתְּשׁוּבָה' : 'Нажмите, чтобы добавить слово в поле ответа'}
                >
                  <div className="text-right">
                    <div
                      dir="rtl"
                      className={`font-bold text-xs leading-none text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition ${
                        isCursive ? 'font-cursive text-sm' : 'font-hebrew'
                      }`}
                    >
                      {displayHebrew}
                    </div>
                    {!userProfile.ulpanMode && word.translation && (
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 max-w-[130px] truncate">
                        {word.translation}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 });
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/60 dark:hover:bg-zinc-700 transition shrink-0 cursor-pointer"
                    title={userProfile.ulpanMode ? 'הַשְׁמָעָה' : 'Прослушать произношение слова'}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Поле ввода сообщения с приоритетом устной речи (Voice-First) */}
      <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        {/* Большая заметная кнопка микрофона */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition duration-200 shadow-xs cursor-pointer ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/40 animate-pulse shadow-md'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md active:scale-[0.99]'
          }`}
          title={isRecording ? (userProfile.ulpanMode ? 'עצור הקלטה' : 'Остановить запись') : (userProfile.ulpanMode ? 'ענה בקול' : 'Ответить голосом')}
        >
          {isRecording ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <Mic className="w-4 h-4 text-white animate-pulse" />
              <span className="font-hebrew">
                {userProfile.ulpanMode
                  ? '🎙️ מַאֲזִין... דַּבְּרוּ בְּעִבְרִית! (לַחֲצוּ לְסִיּוּם)'
                  : '🎙️ Слушаю... Говорите на иврите! (нажмите для завершения)'}
              </span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span className="font-hebrew">
                {userProfile.ulpanMode
                  ? '🎙️ עֲנוּ בְּקוֹל בְּעִבְרִית (לַחֲצוּ לְהַקְלָטָה)'
                  : '🎙️ Ответьте голосом на иврите (нажмите микрофон)'}
              </span>
            </>
          )}
        </button>

        {/* Форма с текстовым полем и кнопкой отправки */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              dir="auto"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording
                  ? (userProfile.ulpanMode ? '🎙️ מַאֲזִין... דַּבְּרוּ בְּעִבְרִית' : '🎙️ Слушаю... говорите на иврите')
                  : (userProfile.ulpanMode ? 'כִּתְבוּ תְּשׁוּבָה אוֹ שַׁלְבוּ מִילִּים...' : 'Ваш ответ (или наберите текст)...')
              }
              className={`w-full pl-3 pr-8 py-2 sm:py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                isRecording
                  ? 'border-rose-400 ring-2 ring-rose-400/40 bg-rose-50/40 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 placeholder:text-rose-600 font-medium'
                  : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-600'
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
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            title="Отправить ответ"
          >
            <span>{userProfile.ulpanMode ? 'שְׁלַח' : 'Отправить'}</span>
            <Send className="w-3.5 h-3.5" />
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

