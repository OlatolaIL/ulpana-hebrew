import { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, ChatMessage, Word, DialogueWord } from '@/types';
import { stripNikkud, alignTranscriptToVocabulary } from '@/lib/transcription';
import {
  speakHebrew,
  stopSpeech,
  HebrewSpeechRecognizer,
  normalizeHebrewSpeechTranscript,
  isWhisperSilenceHallucination,
} from '@/lib/speech';
import { getDialogueHelpForLesson } from '@/lib/dialogueHints';
import { phoneAudio } from '@/lib/phoneAudio';
import {
  markLessonTabCompleted,
  unmarkLessonTabCompleted,
  saveUserProfile,
  loadUserProfile,
  saveLocalCallLog,
  getStudentKnownVocabulary,
  addWordToPersonalDict,
} from '@/lib/storage';
import { getStageNumber } from '@/lib/config';
import { getInitialMessageForGender } from './helpers';

export const TARGET_TURNS = 3;

export interface UseAiChatOptions {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
}

export interface ChatSession {
  id: string;
  lessonId: number;
  gender: 'male' | 'female';
  startTime: number;
}

export function createChatSession(lessonId: number, gender: 'male' | 'female'): ChatSession {
  return {
    id: `chat_${lessonId}_${gender}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    lessonId,
    gender,
    startTime: Date.now(),
  };
}

export function isChatResponseApplicable(
  requestSession: ChatSession,
  activeSession: ChatSession | null,
  isMounted: boolean
): boolean {
  if (!isMounted || !activeSession) return false;
  return (
    requestSession.id === activeSession.id &&
    requestSession.lessonId === activeSession.lessonId &&
    requestSession.gender === activeSession.gender
  );
}

export interface ValidatedAiChatResponse {
  hebrew: string;
  transcription?: string;
  translation?: string;
  feedback?: string | null;
  teacherReactionHebrew?: string | null;
  teacherReactionRu?: string | null;
  stepFact?: string | null;
  stepIndex?: number | null;
  engine?: string;
  isCompleted: boolean;
  suggestedReplies: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
  newWords?: DialogueWord[];
}

export function validateAiChatResponse(
  res: { ok: boolean; status: number },
  data: unknown
): ValidatedAiChatResponse {
  if (!res.ok) {
    const errorMsg =
      data && typeof data === 'object' && typeof (data as Record<string, unknown>).error === 'string'
        ? ((data as Record<string, unknown>).error as string)
        : `Собеседник сейчас недоступен (код ${res.status}). Попробуйте ещё раз.`;
    throw new Error(errorMsg);
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Некорректный ответ сервиса диалогов.');
  }

  const payload = data as Record<string, unknown>;

  if (typeof payload.error === 'string' && payload.error.trim()) {
    throw new Error(payload.error);
  }

  if (typeof payload.hebrew !== 'string' || !payload.hebrew.trim()) {
    throw new Error('Ответ собеседника не содержит текста на иврите.');
  }

  return {
    hebrew: payload.hebrew.trim(),
    transcription: typeof payload.transcription === 'string' ? payload.transcription : undefined,
    translation: typeof payload.translation === 'string' ? payload.translation : undefined,
    feedback: typeof payload.feedback === 'string' ? payload.feedback : null,
    teacherReactionHebrew:
      typeof payload.teacherReactionHebrew === 'string' ? payload.teacherReactionHebrew : null,
    teacherReactionRu:
      typeof payload.teacherReactionRu === 'string' ? payload.teacherReactionRu : null,
    stepFact: typeof payload.stepFact === 'string' ? payload.stepFact : null,
    stepIndex: typeof payload.stepIndex === 'number' ? payload.stepIndex : null,
    engine: typeof payload.engine === 'string' ? payload.engine : undefined,
    isCompleted: payload.isCompleted === true,
    suggestedReplies: Array.isArray(payload.suggestedReplies)
      ? (payload.suggestedReplies as Array<{ hebrew: string; transcription: string; translation: string }>)
      : [],
    newWords: Array.isArray(payload.newWords) ? (payload.newWords as DialogueWord[]) : undefined,
  };
}

export function shouldAwardChatCompletion(
  response: ValidatedAiChatResponse,
  userTurnsCount: number,
  targetTurns: number = TARGET_TURNS
): boolean {
  return response.isCompleted === true && userTurnsCount >= targetTurns;
}

export function formatChatTranscript(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role,
    hebrew: m.hebrew,
    translation: m.translation,
    transcription: m.transcription,
  }));
}

export function buildInitialMessage(lesson: Lesson, gender: 'male' | 'female'): ChatMessage {
  const data = getInitialMessageForGender(lesson, gender);
  const steps = lesson.dialogue.steps;
  const initialSuggestions = steps && steps[0]?.sampleAnswers ? steps[0].sampleAnswers : [];
  const initialFact = steps && steps[0]?.fact ? steps[0].fact : (lesson.dialogue.situation || undefined);

  return {
    id: 'init-1',
    role: 'assistant',
    hebrew: data.hebrew,
    transcription: data.transcription,
    translation: data.translation,
    stepFact: initialFact,
    stepIndex: 1,
    suggestedReplies: initialSuggestions,
    timestamp: 0,
  };
}

export function useAiChat({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
}: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildInitialMessage(lesson, userProfile.gender),
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});
  const [chatError, setChatError] = useState<string | null>(null);

  const recognizerRef = useRef<HebrewSpeechRecognizer | null>(null);
  const activeMicStreamRef = useRef<MediaStream | null>(null);
  const prevStepIndexRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const lastFeedbackRef = useRef<string | null>(null);
  const lastFailedTextRef = useRef<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const sessionRef = useRef<ChatSession | null>(null);
  const sessionIdRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speechRateRef = useRef(userProfile.speechRate || 0.7);
  useEffect(() => { speechRateRef.current = userProfile.speechRate || 0.7; }, [userProfile.speechRate]);

  const [prevLessonId, setPrevLessonId] = useState(lesson.id);
  const [prevGender, setPrevGender] = useState(userProfile.gender);
  if (lesson.id !== prevLessonId || userProfile.gender !== prevGender) {
    setPrevLessonId(lesson.id);
    setPrevGender(userProfile.gender);
    const initial = buildInitialMessage(lesson, userProfile.gender);
    setMessages([initial]);
    setRevealedTranslations({});
    setInputText('');
    setLoading(false);
    setIsRecording(false);
    setIsTranscribing(false);
    setChatError(null);
  }

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const toggleTranslation = (msgId: string) => {
    setRevealedTranslations((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

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

  const logSession = (
    session: ChatSession,
    history: ChatMessage[],
    feedback?: string | null
  ) => {
    const userMessages = history.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return;

    const formattedTranscript = formatChatTranscript(history);
    const durationSeconds = Math.max(1, Math.round((Date.now() - session.startTime) / 1000));
    const effectiveFeedback = feedback || lastFeedbackRef.current || undefined;

    // 1. Сохраняем в локальное хранилище (для админки и оффлайн-доступа)
    try {
      saveLocalCallLog({
        id: session.id,
        user_id: userProfile.name || 'local_user',
        user_name: userProfile.name || 'Ученик',
        lesson_id: session.lessonId,
        caller_name: lesson.dialogue.aiRole || 'Преподаватель ульпана',
        caller_role: `ИИ-чат (Этап ${getStageNumber('chat')})`,
        duration_seconds: durationSeconds,
        messages_count: history.length,
        transcript: formattedTranscript,
        feedback: effectiveFeedback,
        created_at: new Date(session.startTime).toISOString(),
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
          id: session.id,
          lessonId: session.lessonId,
          callerName: lesson.dialogue.aiRole || 'Преподаватель ульпана',
          callerRole: `ИИ-чат (Этап ${getStageNumber('chat')})`,
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

  const lessonVocabularyList = useMemo(() => {
    return Array.from(
      new Set([
        'זה עט',
        'זאת מחברת',
        'זה ספר',
        'אלה תלמידים',
        ...(lesson.vocabulary || []).flatMap((w) => [
          w.hebrew,
          stripNikkud(w.hebrew),
          ...w.hebrew.split('/').map((p) => p.trim()),
          ...stripNikkud(w.hebrew).split('/').map((p) => p.trim()),
        ]),
        ...(lesson.dialogue?.steps || []).flatMap((s) => [
          ...(s.targetWords || []),
          ...(s.sampleAnswers || []).map((a) => a.hebrew),
          ...(s.sampleAnswers || []).map((a) => stripNikkud(a.hebrew)),
        ]),
        ...(lesson.dialogue?.vocabularyHints || []),
        ...helpData.usefulWords.map((w) => w.hebrew),
        ...knownWords,
      ])
    ).filter(Boolean);
  }, [lesson, helpData, knownWords]);

  const normalizeUserInput = (raw: string): string => {
    if (!raw) return '';
    const step1 = normalizeHebrewSpeechTranscript(raw);
    return alignTranscriptToVocabulary(step1, lessonVocabularyList);
  };

  const handleAppendWord = (wordHebrew: string) => {
    const wordToAdd = userProfile.showNikkud ? wordHebrew : stripNikkud(wordHebrew);
    setInputText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return wordToAdd;
      return `${trimmed} ${wordToAdd}`;
    });
  };

  const logSessionRef = useRef(logSession);
  useEffect(() => {
    logSessionRef.current = logSession;
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const newSession = createChatSession(lesson.id, userProfile.gender);
    sessionRef.current = newSession;
    sessionIdRef.current = newSession.id;
    startTimeRef.current = newSession.startTime;
    lastFeedbackRef.current = null;
    lastFailedTextRef.current = null;
    prevStepIndexRef.current = 0;

    if (!recognizerRef.current) {
      recognizerRef.current = new HebrewSpeechRecognizer();
    }

    const initialData = getInitialMessageForGender(lesson, userProfile.gender);
    speakHebrew(initialData.hebrew, { rate: speechRateRef.current });

    return () => {
      abortController.abort();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      stopSpeech();
      if (activeMicStreamRef.current) {
        try {
          activeMicStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        activeMicStreamRef.current = null;
      }
      if (messagesRef.current.filter((m) => m.role === 'user').length > 0) {
        logSessionRef.current(newSession, messagesRef.current, lastFeedbackRef.current);
      }
    };
  }, [lesson, userProfile.gender]);

  const handleGenderSwitch = (newGender: 'male' | 'female') => {
    if (newGender === userProfile.gender && sessionRef.current?.gender === newGender) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    if (sessionRef.current && messagesRef.current.filter((m) => m.role === 'user').length > 0) {
      logSessionRef.current(sessionRef.current, messagesRef.current, lastFeedbackRef.current);
    }

    prevStepIndexRef.current = 0;
    lastFeedbackRef.current = null;
    lastFailedTextRef.current = null;

    const updated = { ...userProfile, gender: newGender };
    saveUserProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);

    const newSession = createChatSession(lesson.id, newGender);
    sessionRef.current = newSession;
    sessionIdRef.current = newSession.id;
    startTimeRef.current = newSession.startTime;

    setInputText('');
    setLoading(false);
    setIsRecording(false);
    setIsTranscribing(false);
    setChatError(null);
    setRevealedTranslations({});

    const initial = buildInitialMessage(lesson, newGender);
    messagesRef.current = [initial];
    setMessages([initial]);

    stopSpeech();
    speakHebrew(initial.hebrew, { rate: userProfile.speechRate || 0.7 });
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    if (recognizerRef.current) {
      recognizerRef.current.stop(true);
      setIsRecording(false);
    }

    const rawText = (textToSend || inputText || lastFailedTextRef.current || '').trim();
    if (!rawText || loading) return;

    const text = normalizeUserInput(rawText);
    setInputText('');
    setChatError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      timestamp: Date.now(),
    };

    const previousHistory = messagesRef.current;
    const newMessages = [...previousHistory, userMsg];
    messagesRef.current = newMessages;
    setMessages(newMessages);
    setLoading(true);

    const activeSession = sessionRef.current ?? createChatSession(lesson.id, userProfile.gender);
    if (!sessionRef.current) {
      sessionRef.current = activeSession;
      sessionIdRef.current = activeSession.id;
      startTimeRef.current = activeSession.startTime;
    }

    const activeSignal = abortControllerRef.current?.signal;
    const currentUserTurns = newMessages.filter((m) => m.role === 'user').length;
    const stepsCount = lesson.dialogue.steps?.length || TARGET_TURNS;
    const nextStepIndex = Math.min(currentUserTurns, stepsCount - 1);
    const previousStepIndex = Math.max(0, currentUserTurns - 1);
    const currentStep = lesson.dialogue.steps?.[nextStepIndex];
    const previousStep = currentUserTurns > 0 ? lesson.dialogue.steps?.[previousStepIndex] : undefined;

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.hebrew,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: activeSignal,
        body: JSON.stringify({
          messages: history,
          lessonNumber: lesson.number,
          level: lesson.level,
          userGender: activeSession.gender,
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
          turnIndex: currentUserTurns,
          targetTurns: TARGET_TURNS,
          currentStep,
          previousStep,
          allSteps: lesson.dialogue.steps,
          usefulWords: lesson.dialogue.usefulWords,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
        }),
      });

      const rawData = await res.json().catch(() => null);
      const data = validateAiChatResponse(res, rawData);

      if (!isChatResponseApplicable(activeSession, sessionRef.current, isMountedRef.current)) {
        return;
      }

      lastFailedTextRef.current = null;
      setChatError(null);

      const isFinished = shouldAwardChatCompletion(data, currentUserTurns, TARGET_TURNS);
      let stepFact: string | undefined = undefined;
      let stepIndex: number | undefined = undefined;

      if (isFinished) {
        const updated = markLessonTabCompleted(activeSession.lessonId, 'chat');
        if (onUpdateProfile) onUpdateProfile(updated);
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        const steps = lesson.dialogue.steps;
        if (steps && steps.length > 0) {
          const nextStepIdx = Math.min(currentUserTurns, steps.length - 1);
          if (nextStepIdx > prevStepIndexRef.current && nextStepIdx < steps.length) {
            prevStepIndexRef.current = nextStepIdx;
            stepFact = data.stepFact || steps[nextStepIdx].fact || undefined;
            stepIndex = data.stepIndex || steps[nextStepIdx].stepIndex || undefined;
          }
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        hebrew: data.hebrew,
        transcription: data.transcription,
        translation: data.translation,
        feedback: data.feedback || undefined,
        teacherReactionHebrew: data.teacherReactionHebrew,
        teacherReactionRu: data.teacherReactionRu,
        stepFact,
        stepIndex,
        engine: data.engine || 'Groq (Живой ИИ)',
        isCompleted: isFinished,
        suggestedReplies: data.suggestedReplies,
        newWords: data.newWords,
        timestamp: Date.now(),
      };

      const updatedHistory = [...messagesRef.current, aiMsg];
      messagesRef.current = updatedHistory;
      setMessages(updatedHistory);

      if (data.feedback) {
        lastFeedbackRef.current = data.feedback;
      }
      logSession(activeSession, updatedHistory, data.feedback);

      speakHebrew(aiMsg.hebrew, { rate: userProfile.speechRate || 0.7 });
    } catch (err) {
      if (!isChatResponseApplicable(activeSession, sessionRef.current, isMountedRef.current)) {
        return;
      }

      console.error('Chat AI Error:', err);

      lastFailedTextRef.current = rawText;
      setInputText(rawText);
      setChatError(
        err instanceof Error ? err.message : 'Собеседник временно недоступен. Нажмите «Отправить» для повтора.'
      );
      messagesRef.current = previousHistory;
      setMessages(previousHistory);
    } finally {
      if (isChatResponseApplicable(activeSession, sessionRef.current, isMountedRef.current)) {
        setLoading(false);
      }
    }
  };

  const handleRetry = async () => {
    if (loading) return;
    const textToRetry = lastFailedTextRef.current || inputText;
    if (textToRetry) {
      await handleSendMessage(textToRetry);
    }
  };

  const toggleRecording = async () => {
    if (!recognizerRef.current || !recognizerRef.current.isSupported()) {
      alert('Голосовой ввод не поддерживается вашим браузером.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      recognizerRef.current.stop();
      return;
    }

    const ctx = phoneAudio.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        if (!activeMicStreamRef.current || !activeMicStreamRef.current.active) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          activeMicStreamRef.current = stream;
        }
      } catch (err) {
        console.warn('Mic permission error:', err);
      }
    }

    setIsRecording(true);
    setIsTranscribing(false);
    setAudioLevel(0);

    const silenceDelayMs = lesson.number && lesson.number <= 10 ? 1600 : 1400;

    recognizerRef.current.start(
      (transcript, isFinal) => {
        if (transcript) {
          setInputText(normalizeUserInput(transcript));
        }
        if (isFinal) {
          setIsRecording(false);
          setIsTranscribing(false);
        }
      },
      (err) => {
        console.error('Speech error:', err);
        setIsRecording(false);
        setIsTranscribing(false);
      },
      (lastTranscript) => {
        if (lastTranscript && !isWhisperSilenceHallucination(lastTranscript)) {
          setInputText(normalizeUserInput(lastTranscript));
        }
        setIsRecording(false);
        setIsTranscribing(false);
      },
      {
        vocabulary: lessonVocabularyList,
        apiKey: userProfile.groqApiKey || undefined,
        continuous: true,
        silenceDurationMs: silenceDelayMs,
        speechThreshold: 10,
        audioContext: ctx,
        mediaStream: activeMicStreamRef.current,
        onAudioLevel: (level) => {
          setAudioLevel(level);
        },
        onSilenceDetected: (transcript) => {
          if (transcript && transcript.trim() && !isWhisperSilenceHallucination(transcript.trim())) {
            setInputText(normalizeUserInput(transcript.trim()));
          }
          setIsRecording(false);
          setIsTranscribing(false);
          recognizerRef.current?.stop();
        },
      }
    );
  };

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    if (sessionRef.current && messagesRef.current.filter((m) => m.role === 'user').length > 0) {
      logSessionRef.current(sessionRef.current, messagesRef.current, lastFeedbackRef.current);
    }

    prevStepIndexRef.current = 0;
    lastFeedbackRef.current = null;
    lastFailedTextRef.current = null;

    const newSession = createChatSession(lesson.id, userProfile.gender);
    sessionRef.current = newSession;
    sessionIdRef.current = newSession.id;
    startTimeRef.current = newSession.startTime;

    const updated = unmarkLessonTabCompleted(lesson.id, 'chat');
    if (onUpdateProfile) onUpdateProfile(updated);

    setInputText('');
    setLoading(false);
    setIsRecording(false);
    setIsTranscribing(false);
    setChatError(null);
    setRevealedTranslations({});

    const initial = buildInitialMessage(lesson, userProfile.gender);
    messagesRef.current = [initial];
    setMessages([initial]);

    stopSpeech();
    speakHebrew(initial.hebrew, { rate: userProfile.speechRate || 0.7 });
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const userTurnsCount = messages.filter((m) => m.role === 'user').length;
  const stepsCount = lesson.dialogue.steps?.length || TARGET_TURNS;
  const currentStepIndex = Math.min(Math.max(0, userTurnsCount), stepsCount - 1);
  const activeStep = lesson.dialogue.steps?.[currentStepIndex];
  const isTabCompleted = Boolean(userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat'));
  const isDialogueFinished =
    isTabCompleted ||
    messages.some((m) => m.role === 'assistant' && m.isCompleted);

  return {
    messages,
    inputText,
    setInputText,
    loading,
    isRecording,
    isTranscribing,
    audioLevel,
    revealedTranslations,
    toggleTranslation,
    addedWords,
    handleAddWordDirectly,
    handleAppendWord,
    handleSendMessage,
    handleRetry,
    chatError,
    toggleRecording,
    handleResetChat,
    handleGenderSwitch,
    lastAiMessage,
    userTurnsCount,
    stepsCount,
    currentStepIndex,
    activeStep,
    isTabCompleted,
    isDialogueFinished,
    inputRef,
    lastMessageRef,
    messagesEndRef,
    TARGET_TURNS,
    getSession: () => sessionRef.current,
  };
}
