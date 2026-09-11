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

const TARGET_TURNS = 3;

interface UseAiChatOptions {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
}

export function useAiChat({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
}: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recognizer, setRecognizer] = useState<HebrewSpeechRecognizer | null>(null);
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});

  const activeMicStreamRef = useRef<MediaStream | null>(null);
  const prevStepIndexRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const sessionIdRef = useRef<string>(
    `chat_${lesson.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  );
  const startTimeRef = useRef<number>(Date.now());
  const lastFeedbackRef = useRef<string | null>(null);

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
        caller_role: `ИИ-чат (Этап ${getStageNumber('chat')})`,
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

  const initChat = (gender: 'male' | 'female') => {
    stopSpeech();
    sessionIdRef.current = `chat_${lesson.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    startTimeRef.current = Date.now();
    lastFeedbackRef.current = null;
    prevStepIndexRef.current = 0;
    setRevealedTranslations({});
    const data = getInitialMessageForGender(lesson, gender);
    const steps = lesson.dialogue.steps;
    const initialSuggestions = steps && steps[0]?.sampleAnswers ? steps[0].sampleAnswers : [];
    const initialFact = steps && steps[0]?.fact ? steps[0].fact : (lesson.dialogue.situation || undefined);

    const initial: ChatMessage = {
      id: 'init-1',
      role: 'assistant',
      hebrew: data.hebrew,
      transcription: data.transcription,
      translation: data.translation,
      stepFact: initialFact,
      stepIndex: 1,
      suggestedReplies: initialSuggestions,
      timestamp: Date.now(),
    };
    messagesRef.current = [initial];
    setMessages([initial]);

    // Audio-First: сразу озвучиваем приветствие собеседника!
    speakHebrew(initial.hebrew, { rate: userProfile.speechRate || 0.7 });
  };

  useEffect(() => {
    initChat(userProfile.gender);

    const rec = new HebrewSpeechRecognizer();
    setRecognizer(rec);

    return () => {
      rec.stop();
      stopSpeech();
      if (activeMicStreamRef.current) {
        try {
          activeMicStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        activeMicStreamRef.current = null;
      }
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

  const handleSendMessage = async (textToSend?: string) => {
    if (recognizer) {
      recognizer.stop(true);
      setIsRecording(false);
    }

    const rawText = (textToSend || inputText).trim();
    if (!rawText || loading) return;

    const text = normalizeUserInput(rawText);

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

      const data = await res.json();

      const isFinished = Boolean(data.isCompleted || currentUserTurns >= TARGET_TURNS);
      let stepFact: string | undefined = undefined;
      let stepIndex: number | undefined = undefined;

      if (isFinished) {
        const updated = markLessonTabCompleted(lesson.id, 'chat');
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
            stepFact = data.stepFact || steps[nextStepIdx].fact;
            stepIndex = data.stepIndex || steps[nextStepIdx].stepIndex;
          }
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        hebrew: data.hebrew || 'שָׁלוֹם!',
        transcription: data.transcription,
        translation: data.translation,
        feedback: data.feedback,
        teacherReactionHebrew: data.teacherReactionHebrew,
        teacherReactionRu: data.teacherReactionRu,
        stepFact,
        stepIndex,
        engine: data.engine || 'Groq (Живой ИИ)',
        isCompleted: Boolean(data.isCompleted),
        suggestedReplies: data.suggestedReplies || [],
        newWords: data.newWords,
        timestamp: Date.now(),
      };

      const updatedHistory = [...messagesRef.current, aiMsg];
      messagesRef.current = updatedHistory;
      setMessages(updatedHistory);

      if (data.feedback) {
        lastFeedbackRef.current = data.feedback;
      }
      logChatSession(updatedHistory, data.feedback);

      if (aiMsg.isCompleted || updatedHistory.filter((m) => m.role === 'user').length >= TARGET_TURNS) {
        const updated = markLessonTabCompleted(lesson.id, 'chat');
        if (onUpdateProfile) onUpdateProfile(updated);
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }

      // Audio-First: голос собеседника звучит сразу
      speakHebrew(aiMsg.hebrew, { rate: userProfile.speechRate || 0.7 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (!recognizer || !recognizer.isSupported()) {
      alert('Голосовой ввод не поддерживается вашим браузером.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      recognizer.stop();
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

    recognizer.start(
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
          recognizer.stop();
        },
      }
    );
  };

  const handleResetChat = () => {
    if (messagesRef.current.length > 1) {
      logChatSession(messagesRef.current);
    }
    prevStepIndexRef.current = 0;
    const updated = unmarkLessonTabCompleted(lesson.id, 'chat');
    if (onUpdateProfile) onUpdateProfile(updated);
    setInputText('');
    initChat(userProfile.gender);
  };

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const userTurnsCount = messages.filter((m) => m.role === 'user').length;
  const stepsCount = lesson.dialogue.steps?.length || TARGET_TURNS;
  const currentStepIndex = Math.min(Math.max(0, userTurnsCount), stepsCount - 1);
  const activeStep = lesson.dialogue.steps?.[currentStepIndex];
  const isTabCompleted = Boolean(userProfile.lessonProgress[lesson.id]?.completedTabs?.includes('chat'));
  const isDialogueFinished =
    isTabCompleted ||
    userTurnsCount >= TARGET_TURNS ||
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
  };
}
