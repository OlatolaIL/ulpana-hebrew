'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  Check,
  Send,
  Headphones,
  Info,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, UserProfile, Word, ChatMessage } from '@/types';
import { getLessonPhoneScenario } from '@/data/phoneScenarios';
import { phoneAudio } from '@/lib/phoneAudio';
import { speakHebrew, stopSpeech, HebrewSpeechRecognizer } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { isWordInPersonalDict, addWordToPersonalDict, markLessonTabCompleted, saveLocalCallLog } from '@/lib/storage';

interface PhoneCallSimulatorProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onBackToLesson?: () => void;
}

type CallState = 'idle' | 'dialing' | 'connected' | 'ended';

export const PhoneCallSimulator: React.FC<PhoneCallSimulatorProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onBackToLesson,
}) => {
  const scenario = getLessonPhoneScenario(lesson, userProfile.gender);

  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Добавленные слова в словарик
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});

  const recognizerRef = useRef<HebrewSpeechRecognizer | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const isAiSpeakingRef = useRef(false);
  const loadingAiRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isMutedRef = useRef(false);
  const timerRef = useRef<any>(null);
  const autoListenTimeoutRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const isSendingRef = useRef(false);
  const callActiveRef = useRef(false);
  const shouldListenRef = useRef(false);
  const lastAiSpokenTextRef = useRef('');
  const lastAiSpokenTimeRef = useRef(0);

  // Синхронизированные методы управления состоянием
  const setBothMessages = (msgs: ChatMessage[]) => {
    messagesRef.current = msgs;
    setMessages(msgs);
  };

  const setAiSpeaking = (val: boolean) => {
    isAiSpeakingRef.current = val;
    setIsAiSpeaking(val);
  };

  const setAiLoading = (val: boolean) => {
    loadingAiRef.current = val;
    setLoadingAi(val);
  };

  const setRecording = (val: boolean) => {
    isRecordingRef.current = val;
    setIsRecording(val);
  };

  // Инициализация распознавания речи
  useEffect(() => {
    recognizerRef.current = new HebrewSpeechRecognizer();
    return () => {
      callActiveRef.current = false;
      shouldListenRef.current = false;
      phoneAudio.stopAll();
      stopSpeech();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  // Таймер звонка
  useEffect(() => {
    if (callState === 'connected') {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Запуск вызова
  const handleStartCall = () => {
    // 1. Активируем разрешение на микрофон прямо по клику пользователя (User Gesture)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => console.warn('Mic permission check:', err));
    }

    setCallState('dialing');
    setBothMessages([]);
    setLastFeedback(null);
    setLiveTranscript('');
    setAudioLevel(0);
    setIsMuted(false);
    isMutedRef.current = false;
    isSendingRef.current = false;
    callActiveRef.current = false;
    shouldListenRef.current = false;
    phoneAudio.startRingingTone();

    // Через 2.4 секунды контакт "поднимает трубку"
    setTimeout(async () => {
      phoneAudio.stopAll();
      await phoneAudio.playPickupSound();

      const initialAiMsg: ChatMessage = {
        id: `ai-init-${Date.now()}`,
        role: 'assistant',
        hebrew: scenario.initialGreeting.hebrew,
        transcription: scenario.initialGreeting.transcription,
        translation: scenario.initialGreeting.translation,
        suggestedReplies: scenario.suggestedReplies || [],
        timestamp: Date.now(),
      };

      callActiveRef.current = true;
      setBothMessages([initialAiMsg]);
      setCallState('connected');

      // ИИ сразу озвучивает приветствие
      playAiVoice(initialAiMsg.hebrew);
    }, 2400);
  };

  // Озвучивание реплики ИИ с надежной защитой от самопрослушивания
  const playAiVoice = async (text: string) => {
    // 1. Глушим микрофон перед тем, как ИИ начнет говорить
    stopListening();
    setAiSpeaking(true);
    setAudioLevel(0);
    lastAiSpokenTextRef.current = stripNikkud(text).trim().toLowerCase();

    try {
      await speakHebrew(text, { rate: userProfile.speechRate || 0.75 });
    } catch (e) {
      console.error('Speech error:', e);
    } finally {
      setAiSpeaking(false);
      lastAiSpokenTimeRef.current = Date.now();

      // Безопасная пауза 500мс после того, как динамик затих, перед авто-включением микрофона
      if (callActiveRef.current && !isMutedRef.current) {
        if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
        autoListenTimeoutRef.current = setTimeout(() => {
          if (
            callActiveRef.current &&
            !isAiSpeakingRef.current &&
            !loadingAiRef.current &&
            !isSendingRef.current &&
            !isMutedRef.current
          ) {
            startListening();
          }
        }, 500);
      }
    }
  };

  // Проверка на эхо (не услышал ли микрофон сам динамик ИИ)
  const isEchoFromAi = (transcript: string): boolean => {
    const cleanUser = stripNikkud(transcript).trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 2) return true;

    // Если прошло меньше 350мс с момента окончания речи ИИ (хвост динамика)
    if (Date.now() - lastAiSpokenTimeRef.current < 350) {
      return true;
    }

    const cleanAi = lastAiSpokenTextRef.current;
    if (cleanAi) {
      // Игнорируем только если распознана В ТОЧНОСТИ идентичная длинная фраза ИИ (более 2 слов)
      const aiWords = cleanAi.split(/\s+/).filter(Boolean);
      const userWords = cleanUser.split(/\s+/).filter(Boolean);
      if (aiWords.length >= 3 && userWords.length >= 3 && cleanAi === cleanUser) {
        return true;
      }
    }

    return false;
  };

  // Запуск микрофона (автоматический hands-free режим)
  const startListening = (force = false) => {
    if (
      (isRecordingRef.current && !force) ||
      isAiSpeakingRef.current ||
      loadingAiRef.current ||
      isSendingRef.current ||
      !callActiveRef.current ||
      isMutedRef.current
    ) {
      return;
    }

    if (!recognizerRef.current || !recognizerRef.current.isSupported()) {
      setShowTextInput(true);
      return;
    }

    shouldListenRef.current = true;
    setRecording(true);
    setLiveTranscript('');

    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    // В первых 10 уроках увеличиваем паузу до 2.0 секунд, чтобы начинающим было комфортно формулировать фразы
    const silenceDelayMs = lesson.number && lesson.number <= 10 ? 2000 : 1300;

    recognizerRef.current.start(
      (transcript, isFinal) => {
        if (isAiSpeakingRef.current || isSendingRef.current || !callActiveRef.current || isMutedRef.current) return;

        setLiveTranscript(transcript);

        // Резервный таймер авто-отправки при паузе в речи (2.0 сек для уроков 1-10, 1.3 сек для остальных)
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (transcript.trim()) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (
              !isEchoFromAi(transcript) &&
              callActiveRef.current &&
              shouldListenRef.current &&
              !isSendingRef.current &&
              !isAiSpeakingRef.current &&
              !isMutedRef.current
            ) {
              handleSendMessage(transcript.trim());
            }
          }, silenceDelayMs);
        }
      },
      (error) => {
        console.warn('Speech recognition warning:', error);
      },
      (lastTranscript) => {
        // Завершение сессии распознавания: если все еще слушаем, проверяем наличие фразы
        if (
          callActiveRef.current &&
          shouldListenRef.current &&
          !isAiSpeakingRef.current &&
          !loadingAiRef.current &&
          !isSendingRef.current &&
          !isMutedRef.current
        ) {
          if (lastTranscript && lastTranscript.trim() && !isEchoFromAi(lastTranscript)) {
            handleSendMessage(lastTranscript.trim());
          }
        }
      },
      {
        vocabulary: (lesson.vocabulary || []).map((w) => w.hebrew),
        apiKey: userProfile.groqApiKey || undefined,
        continuous: true,
        silenceDurationMs: silenceDelayMs,
        speechThreshold: 10,
        onAudioLevel: (level) => {
          if (!isAiSpeakingRef.current && !loadingAiRef.current && !isMutedRef.current) {
            setAudioLevel(level);
          } else {
            setAudioLevel(0);
          }
        },
        onSilenceDetected: (transcript) => {
          if (
            callActiveRef.current &&
            shouldListenRef.current &&
            !isSendingRef.current &&
            !isAiSpeakingRef.current &&
            !loadingAiRef.current &&
            !isMutedRef.current
          ) {
            const textToSubmit = (transcript || liveTranscript).trim();
            if (textToSubmit && !isEchoFromAi(textToSubmit)) {
              handleSendMessage(textToSubmit);
            }
          }
        },
      }
    );
  };

  // Остановка микрофона
  const stopListening = () => {
    shouldListenRef.current = false;
    setAudioLevel(0);
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setRecording(false);
  };

  // Переключение Mute микрофона
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (nextMuted) {
      stopListening();
    } else if (callActiveRef.current && !isAiSpeakingRef.current && !loadingAiRef.current) {
      startListening(true);
    }
  };

  // Отправка реплики собеседнику
  const handleSendMessage = async (textToSend?: string) => {
    stopListening();
    const text = (textToSend || textInput || liveTranscript).trim();

    if (!text || loadingAiRef.current || isSendingRef.current || !callActiveRef.current) {
      return;
    }

    // Защита от эхо собственного голоса ИИ
    if (isEchoFromAi(text) && !textToSend && !textInput) {
      console.warn('Blocked AI echo loop detected:', text);
      setLiveTranscript('');
      setTimeout(() => {
        if (callActiveRef.current && !isAiSpeakingRef.current && !loadingAiRef.current && !isMutedRef.current) {
          startListening(true);
        }
      }, 200);
      return;
    }

    isSendingRef.current = true;
    setTextInput('');
    setLiveTranscript('');
    setAudioLevel(0);
    setAiLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messagesRef.current, userMsg];
    setBothMessages(newHistory);

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        content: m.hebrew,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          lessonNumber: lesson.number,
          level: lesson.level,
          userGender: userProfile.gender,
          scenarioTitle: `Телефонный разговор: ${scenario.callerRole}`,
          situation: scenario.situationSummary,
          aiRole: scenario.callerNameRu,
          userRole: 'Ученик (звонит или принимает звонок)',
          goals: scenario.goals,
          topic: lesson.titleRussian,
          vocabulary: (lesson.vocabulary || []).map((w) => `${w.hebrew} (${w.translation})`),
          grammarTopic: lesson.grammar?.[0]?.title || lesson.titleRussian,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
          isPhoneCall: true,
          ulpanMode: Boolean(userProfile.ulpanMode),
          systemPromptAddition: scenario.systemPromptAddition,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        hebrew: data.hebrew || 'בְּסֵדֶר גָּמוּר!',
        transcription: data.transcription,
        translation: data.translation,
        feedback: data.feedback,
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      if (data.feedback) {
        setLastFeedback(data.feedback);
      }

      const updatedHistory = [...messagesRef.current, aiMsg];
      setBothMessages(updatedHistory);
      setAiLoading(false);
      isSendingRef.current = false;

      // Озвучиваем ответ ИИ
      playAiVoice(aiMsg.hebrew);
    } catch (err) {
      console.error('Phone AI Error:', err);
      setAiLoading(false);
      isSendingRef.current = false;
      setTimeout(() => {
        if (callActiveRef.current && !isMutedRef.current) {
          startListening(true);
        }
      }, 500);
    }
  };

  // Завершение звонка
  const handleEndCall = async () => {
    callActiveRef.current = false;
    stopSpeech();
    stopListening();
    phoneAudio.stopAll();
    if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    await phoneAudio.playHangupTone(2);
    setCallState('ended');

    const currentMessages = messagesRef.current;
    const formattedTranscript = currentMessages.map((m) => ({
      role: m.role,
      hebrew: m.hebrew,
      translation: m.translation,
      transcription: m.transcription,
    }));

    // 1. Сохраняем в локальное хранилище (доступно мгновенно на любом устройстве)
    try {
      saveLocalCallLog({
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userProfile.name || 'local_user',
        user_name: userProfile.name || 'Ученик',
        lesson_id: lesson.id,
        caller_name: scenario.callerNameRu || scenario.callerName,
        caller_role: scenario.callerRole,
        duration_seconds: callDuration,
        messages_count: currentMessages.length,
        transcript: formattedTranscript,
        feedback: lastFeedback || undefined,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Local call log error:', e);
    }

    // 2. Логируем звонок в базу данных сервера
    try {
      fetch('/api/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson.id,
          callerName: scenario.callerNameRu || scenario.callerName,
          callerRole: scenario.callerRole,
          durationSeconds: callDuration,
          transcript: formattedTranscript,
          feedback: lastFeedback,
          userName: userProfile.name || 'Ученик',
        }),
      }).catch(() => {});
    } catch {}

    // Начисление прогресса в уроке
    const updated = markLessonTabCompleted(lesson.id, 'phone');
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    // Запуск конфетти
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Добавление слова в личный словарь
  const handleAddWord = (w: Word) => {
    addWordToPersonalDict(w);
    setAddedWords((prev) => ({ ...prev, [w.hebrew]: true }));
    if (onWordAdded) onWordAdded(w);
  };

  const latestAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  const getRelevantWordsForCall = (): Word[] => {
    const allTranscriptText = messages
      .map((m) => `${m.hebrew} ${m.translation || ''}`)
      .join(' ')
      .toLowerCase();

    const candidates: Word[] = [
      ...(scenario.usefulWords || []).map((w, idx) => ({
        id: `phone-sc-w-${idx}`,
        hebrew: w.hebrew,
        hebrewPlain: stripNikkud(w.hebrew),
        transcription: w.transcription,
        translation: w.translation,
        partOfSpeech: 'expression' as const,
        lessonId: lesson.id,
      })),
      ...(lesson.vocabulary || []),
    ];

    const uniqueMap = new Map<string, Word>();
    candidates.forEach((w) => {
      const plain = stripNikkud(w.hebrew).trim();
      if (plain && !uniqueMap.has(plain)) {
        uniqueMap.set(plain, w);
      }
    });

    const uniqueCandidates = Array.from(uniqueMap.values());

    const used = uniqueCandidates.filter((w) => {
      const plain = stripNikkud(w.hebrew).trim().toLowerCase();
      if (plain.length < 2) return false;
      return allTranscriptText.includes(plain);
    });

    if (used.length < 4) {
      for (const cand of uniqueCandidates) {
        if (!used.some((u) => stripNikkud(u.hebrew) === stripNikkud(cand.hebrew))) {
          used.push(cand);
          if (used.length >= 6) break;
        }
      }
    }

    return used.slice(0, 6);
  };

  return (
    <div className="space-y-4">
      {/* 1. СОСТОЯНИЕ: ДО ЗВОНКА (IDLE) */}
      {callState === 'idle' && (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
            {/* Аватар контакта */}
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700/80 flex items-center justify-center text-4xl shadow-inner">
                {scenario.avatarEmoji}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-white">
                <Phone className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Имя и роль */}
            <h2 className="text-2xl font-bold text-white font-hebrew tracking-wide">
              {scenario.callerName}
            </h2>
            {!userProfile.ulpanMode && (
              <p className="text-sm font-semibold text-blue-400 mt-0.5">
                {scenario.callerNameRu}
              </p>
            )}
            <p className="text-xs text-zinc-400 mt-1 max-w-sm font-hebrew">
              {userProfile.ulpanMode ? 'שׂוֹחֲחוּ בְּעִבְרִית עִם הַנָּצִיג' : scenario.callerRole}
            </p>

            {/* Контекст ситуации */}
            <div className="w-full bg-zinc-800/60 backdrop-blur border border-zinc-700/60 rounded-2xl p-4 my-4 text-left text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-1.5 font-bold text-zinc-200 mb-1.5 font-hebrew">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{userProfile.ulpanMode ? 'תַּרְחִישׁ הַשִּׂיחָה:' : 'Ситуация звонка:'}</span>
              </div>
              <p className="leading-relaxed font-hebrew">
                {userProfile.ulpanMode ? 'שִׂיחַת טֶלֶפוֹן מַעֲשִׂית בְּעִבְרִית. הַקְשִׁיבוּ לַנָּצִיג וַעֲנוּ בִּבְהִירוּת.' : scenario.situationSummary}
              </p>

              {/* Цели разговора */}
              <div className="mt-3 pt-3 border-t border-zinc-700/50">
                <span className="font-bold text-zinc-200 text-xs block mb-1.5 font-hebrew">
                  {userProfile.ulpanMode ? '🎯 מַטְּרוֹת הַשִּׂיחָה:' : '🎯 Ваши задачи в разговоре:'}
                </span>
                <ul className="space-y-1 text-xs text-zinc-400 font-hebrew">
                  {scenario.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Карточки полезных слов и подсказок к звонку */}
            {scenario.usefulWords && scenario.usefulWords.length > 0 && (
              <div className="w-full bg-zinc-800/60 backdrop-blur border border-zinc-700/60 rounded-2xl p-4 mb-5 text-left font-hebrew">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-200 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {userProfile.ulpanMode
                        ? `מִילִּים שֶׁיַּעַזְרוּ לָכֶם בַּשִּׂיחָה (${scenario.usefulWords.length}):`
                        : `Слова и подсказки к звонку (${scenario.usefulWords.length}):`}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {userProfile.ulpanMode ? 'הַשְׁמָעָה 🔊' : 'Нажмите 🔊 для озвучки'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scenario.usefulWords.map((word, idx) => {
                    const isAdded = addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew);
                    const displayHebrew = userProfile.showNikkud ? word.hebrew : stripNikkud(word.hebrew);

                    return (
                      <div
                        key={idx}
                        className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-700/70 hover:border-zinc-600 rounded-xl p-2.5 flex flex-col justify-between transition group shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <div
                              dir="rtl"
                              className="font-bold text-sm font-hebrew text-white group-hover:text-blue-300 transition"
                            >
                              {displayHebrew}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {word.isNew && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-hebrew">
                                  {userProfile.ulpanMode ? 'חָדָשׁ' : 'Новое'}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 });
                                }}
                                className="p-1 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 transition cursor-pointer"
                                title={userProfile.ulpanMode ? 'השמע מילה' : 'Прослушать произношение'}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {!userProfile.ulpanMode && userProfile.showTranscription && word.transcription && (
                            <div className="text-[11px] text-blue-400/90 font-mono mt-0.5">
                              [{word.transcription}]
                            </div>
                          )}

                          {!userProfile.ulpanMode && (
                            <div className="text-xs text-zinc-300 mt-1 line-clamp-2">
                              {word.translation}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-zinc-800 flex justify-end font-hebrew">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddWord({
                                id: `phone-w-${idx}`,
                                hebrew: word.hebrew,
                                hebrewPlain: stripNikkud(word.hebrew),
                                transcription: word.transcription,
                                translation: word.translation,
                                partOfSpeech: 'expression',
                                lessonId: lesson.id,
                                isUserAdded: true,
                                dateAdded: Date.now(),
                              });
                            }}
                            disabled={isAdded}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 transition ${
                              isAdded
                                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 cursor-default'
                                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 cursor-pointer'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>{userProfile.ulpanMode ? 'בַּמִּילוֹן ✔️' : 'В словаре'}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>{userProfile.ulpanMode ? 'לַמִּילוֹן' : 'В словарь'}</span>
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

            {/* Кнопка запуска звонка */}
            <button
              onClick={handleStartCall}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.98] transition font-bold text-white text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 cursor-pointer font-hebrew"
            >
              <PhoneCall className="w-6 h-6 animate-pulse" />
              <span>{userProfile.ulpanMode ? 'לְהִתְקַשֵּׁר כָּעֵת 📞' : 'Позвонить • לְהִתְקַשֵּׁר'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. СОСТОЯНИЕ: ВЫЗОВ / ГУДКИ (DIALING) */}
      {callState === 'dialing' && (
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 border border-zinc-800 shadow-2xl flex flex-col items-center justify-center min-h-[420px] text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse" />
            <div className="w-28 h-28 rounded-full bg-zinc-800 border-2 border-emerald-500/50 flex items-center justify-center text-5xl relative z-10 shadow-2xl">
              {scenario.avatarEmoji}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white font-hebrew">
            {scenario.callerName}
          </h3>
          {!userProfile.ulpanMode && (
            <p className="text-sm text-zinc-400 mt-1">{scenario.callerNameRu}</p>
          )}

          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mt-4 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40 font-hebrew">
            <Radio className="w-4 h-4 animate-spin text-emerald-400" />
            <span>{userProfile.ulpanMode ? '...מְחַיֵּג' : 'מְחַיֵּג... (Идут гудки)'}</span>
          </div>

          {/* Кнопка отмены */}
          <button
            onClick={() => {
              phoneAudio.stopAll();
              setCallState('idle');
            }}
            className="mt-10 p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition active:scale-95 cursor-pointer"
            title={userProfile.ulpanMode ? 'בטל שיחה' : 'Отменить вызов'}
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* 3. СОСТОЯНИЕ: АКТИВНЫЙ РАЗГОВОР (CONNECTED) — ПОЛНОСТЬЮ ГОЛОСОВОЙ HANDS-FREE РЕЖИМ */}
      {callState === 'connected' && (
        <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col min-h-[580px]">
          {/* Верхний бар вызова */}
          <div className="p-4 bg-zinc-800/60 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700/80 border border-zinc-600 flex items-center justify-center text-xl shadow-inner">
                {scenario.avatarEmoji}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white font-hebrew">
                  {scenario.callerName}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {formatTimer(callDuration)}
                  </span>
                  <span className="text-[10px] text-zinc-400 hidden sm:inline font-hebrew">
                    • {userProfile.ulpanMode ? 'שִׂיחָה קוֹלִית' : 'Голосовой звонок'}
                  </span>
                </div>
              </div>
            </div>

            {/* Быстрые переключатели: Субтитры */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  showSubtitles
                    ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
                title={showSubtitles ? (userProfile.ulpanMode ? 'הסתר כתוביות' : 'Скрыть субтитры (на слух)') : (userProfile.ulpanMode ? 'הצג כתוביות' : 'Показать субтитры')}
              >
                {showSubtitles ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-hebrew">
                  {userProfile.ulpanMode ? 'כְּתוּבִיּוֹת' : 'Субтитры'}
                </span>
              </button>
            </div>
          </div>

          {/* Центральная часть: Индикатор разговора и субтитры */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between items-center text-center">
            {/* Аниматор говорящего с динамическими аудио-волнами */}
            <div className="my-auto flex flex-col items-center">
              <div className="relative mb-5">
                {/* Пульсирующие волны при речи ИИ */}
                {isAiSpeaking && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                    <div className="absolute -inset-4 rounded-full bg-blue-500/10 animate-pulse" />
                  </>
                )}

                {/* Живые аудио-волны при речи пользователя (VAD) */}
                {isRecording && !isMuted && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-emerald-500/25 transition-transform duration-75 pointer-events-none"
                      style={{ transform: `scale(${1.08 + audioLevel * 0.45})` }}
                    />
                    <div
                      className="absolute -inset-3 rounded-full bg-emerald-500/15 transition-transform duration-100 pointer-events-none"
                      style={{ transform: `scale(${1.04 + audioLevel * 0.3})` }}
                    />
                  </>
                )}

                <div
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-4 transition-all duration-200 shadow-2xl relative z-10 ${
                    isAiSpeaking
                      ? 'border-blue-500 bg-blue-950/50 shadow-blue-500/30 scale-105 ring-4 ring-blue-500/20'
                      : isRecording && !isMuted
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-emerald-500/30 ring-4 ring-emerald-500/25'
                      : loadingAi
                      ? 'border-purple-500 bg-purple-950/40 shadow-purple-500/30'
                      : 'border-zinc-700 bg-zinc-800/90 shadow-black'
                  }`}
                  style={
                    isRecording && !isMuted
                      ? { transform: `scale(${1 + Math.min(0.12, audioLevel * 0.2)})` }
                      : undefined
                  }
                >
                  {scenario.avatarEmoji}
                </div>
              </div>

              {/* Статус речи и аудио-визуализатор */}
              <div className="h-10 flex flex-col items-center justify-center">
                {isAiSpeaking && (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-800/50 animate-pulse font-hebrew shadow-sm">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{userProfile.ulpanMode ? `...${scenario.callerName} מְדַבֵּר` : `${scenario.callerNameRu} говорит...`}</span>
                  </div>
                )}

                {loadingAi && (
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-800/50 font-hebrew shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>{userProfile.ulpanMode ? '...חוֹשֵׁב' : 'Собеседник думает...'}</span>
                  </div>
                )}

                {isRecording && !isMuted && !isAiSpeaking && !loadingAi && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-800/50 font-hebrew shadow-sm">
                      <Mic className="w-3.5 h-3.5 animate-pulse" />
                      <span>
                        {userProfile.ulpanMode
                          ? '...מַאֲזִין לָכֶם, דַּבְּרוּ בְּעִבְרִית'
                          : 'Слушаю вас... Говорите на иврите'}
                      </span>
                    </div>

                    {/* Живые полоски громкости голоса */}
                    <div className="flex items-center gap-1 h-3">
                      {[0.5, 0.9, 1.3, 0.9, 0.5].map((factor, i) => {
                        const barHeight = Math.max(3, Math.min(14, audioLevel * 16 * factor + 3));
                        return (
                          <div
                            key={i}
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${barHeight}px`, opacity: audioLevel > 0.05 ? 0.9 : 0.4 }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {isMuted && !isAiSpeaking && !loadingAi && (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/60 px-3.5 py-1.5 rounded-full border border-amber-800/50 font-hebrew shadow-sm">
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{userProfile.ulpanMode ? 'הַמִּיקְרוֹפוֹן מֻשְׁתָּק' : 'Микрофон выключен'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Текущие субтитры реплики собеседника */}
            {latestAiMessage && (
              <div
                className={`w-full max-w-lg bg-zinc-800/80 backdrop-blur rounded-2xl p-4 border border-zinc-700/80 text-center transition-all shadow-md ${
                  !showSubtitles ? 'filter blur-sm select-none opacity-40 hover:filter-none hover:opacity-100' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold font-hebrew text-white mb-1">
                  <span>{latestAiMessage.hebrew}</span>
                  <button
                    onClick={() => speakHebrew(latestAiMessage.hebrew)}
                    className="p-1 rounded-lg hover:bg-zinc-700 text-blue-400 transition cursor-pointer"
                    title={userProfile.ulpanMode ? 'השמע שוב' : 'Повторить фразу'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {!userProfile.ulpanMode && userProfile.showTranscription && latestAiMessage.transcription && (
                  <p className="text-xs sm:text-sm text-yellow-400/90 font-mono">
                    {latestAiMessage.transcription}
                  </p>
                )}
                {!userProfile.ulpanMode && latestAiMessage.translation && (
                  <p className="text-xs text-zinc-300 mt-1">
                    {latestAiMessage.translation}
                  </p>
                )}
              </div>
            )}

            {/* Живая речь пользователя во время записи — автоматическая отправка при паузе */}
            {liveTranscript && (
              <div className="w-full max-w-lg mt-3 bg-emerald-950/70 border border-emerald-700/70 rounded-2xl p-3 text-xs text-emerald-200 font-hebrew shadow-md animate-fade-in">
                <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-emerald-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    <span>{userProfile.ulpanMode ? 'אַתֶּם אוֹמְרִים:' : 'Вы говорите:'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/70 font-normal">
                    {userProfile.ulpanMode ? 'שְׁלִיחָה אוֹטוֹמָטִית בְּסִיּוּם דִּבּוּר...' : 'Отправится автоматически при паузе...'}
                  </span>
                </div>
                <div className="text-sm font-bold text-white text-right leading-relaxed font-hebrew pr-1">
                  {liveTranscript}
                </div>
              </div>
            )}

            {/* Подсказка об ошибке (Feedback) */}
            {lastFeedback && (
              <div className="w-full max-w-lg mt-2 bg-amber-950/50 border border-amber-800/50 rounded-xl p-2.5 text-xs text-amber-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lastFeedback}</span>
              </div>
            )}
          </div>

          {/* Пассивные подсказки, что сказать — без нажимаемых кнопок ответов */}
          {latestAiMessage?.suggestedReplies && latestAiMessage.suggestedReplies.length > 0 && (
            <div className="px-4 py-2.5 bg-zinc-900/90 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-1.5 font-hebrew text-[11px]">
                <span className="font-bold text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>
                    {userProfile.ulpanMode
                      ? 'רַעְיוֹנוֹת לִתְשׁוּבָה (אִמְרוּ בְּקוֹל):'
                      : 'Подсказка — что можно сказать вслух:'}
                  </span>
                </span>
                <span className="text-[10px] text-zinc-500">
                  {userProfile.ulpanMode ? 'דַּבְּרוּ בַּמִּיקְרוֹפוֹן 🎙️' : 'Говорите в микрофон 🎙️'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latestAiMessage.suggestedReplies.map((reply, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700/70 text-xs text-zinc-200 flex flex-col"
                  >
                    <span className="font-bold font-hebrew text-white">{reply.hebrew}</span>
                    {!userProfile.ulpanMode && reply.translation && (
                      <span className="text-[10px] text-zinc-400">{reply.translation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Текстовый ввод (только как скрытый резерв для случаев без микрофона) */}
          {showTextInput && (
            <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={userProfile.ulpanMode ? 'כִּתְבוּ תְּשׁוּבָה בְּעִבְרִית...' : 'Напишите ответ на иврите...'}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-hebrew"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Нижняя панель управления звонком — как в настоящем телефоне */}
          <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-around">
            {/* Кнопка Mute (Заглушить / включить микрофон) */}
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                isMuted
                  ? 'bg-amber-600/30 border-amber-500/60 text-amber-400'
                  : 'bg-zinc-800/90 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700'
              }`}
              title={isMuted ? (userProfile.ulpanMode ? 'הפעל מיקרופון' : 'Включить микрофон') : (userProfile.ulpanMode ? 'השתק מיקרופון' : 'Выключить микрофон')}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-amber-400" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Главная кнопка в звонке: КРАСНАЯ ТРУБКА (Положить трубку) */}
            <button
              onClick={() => handleEndCall()}
              className="px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-2.5 cursor-pointer font-hebrew"
              title={userProfile.ulpanMode ? 'סיום שיחה' : 'Положить трубку'}
            >
              <PhoneOff className="w-5 h-5" />
              <span className="text-sm">
                {userProfile.ulpanMode ? 'לְנַתֵּק' : 'Положить трубку'}
              </span>
            </button>

            {/* Резервная кнопка клавиатуры (если микрофон не работает) */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`p-3.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                showTextInput
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-zinc-800/90 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
              title={userProfile.ulpanMode ? 'מקלדת' : 'Резервная клавиатура'}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. СОСТОЯНИЕ: ЗАВЕРШЕНИЕ И РАЗБОР РАЗГОВОРА (ENDED) */}
      {callState === 'ended' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          {/* Поздравление */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
              🎉
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew">
              {userProfile.ulpanMode ? '!הַשִּׂיחָה הִסְתַּיְּמָה • כָּל הַכָּבוֹד' : 'Разговор завершен!'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-hebrew">
              {userProfile.ulpanMode ? 'אִמּוּן מְצוּיָן שֶׁל עִבְרִית בַּטֶּלֶפוֹן' : 'Отличная тренировка телефонного иврита'}
            </p>
          </div>

          {/* Метрики звонка */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-hebrew">
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center">
              <span className="text-xs text-zinc-400 block font-medium">
                {userProfile.ulpanMode ? 'מֶשֶׁךְ הַשִּׂיחָה' : 'Длительность'}
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {formatTimer(callDuration)}
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center">
              <span className="text-xs text-zinc-400 block font-medium">
                {userProfile.ulpanMode ? 'מִשְׁפָּטִים שֶׁנֶּאֶמְרוּ' : 'Реплик сказано'}
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {messages.filter((m) => m.role === 'user').length}
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-zinc-400 block font-medium">
                {userProfile.ulpanMode ? 'הֲבָנָה' : 'Понимание'}
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                100% 🏆
              </span>
            </div>
          </div>

          {/* Чек-лист целей */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 font-hebrew">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{userProfile.ulpanMode ? 'מַטְּרוֹת הַתַּרְחִישׁ:' : 'Цели сценария:'}</span>
            </h4>
            <ul className="space-y-2">
              {scenario.goals.map((goal, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                    ✓
                  </div>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Слова из урока для сохранения в личный словарик */}
          {getRelevantWordsForCall().length > 0 && (
            <div className="space-y-2 font-hebrew">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {userProfile.ulpanMode ? 'מִילִּים שֶׁנִּלְמְדוּ בַּשִּׂיחָה:' : 'Полезные слова из этого звонка:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getRelevantWordsForCall().map((word) => {
                  const isAdded = addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                  return (
                    <div
                      key={word.id || word.hebrew}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 font-hebrew truncate text-sm">
                          {word.hebrew}
                        </div>
                        {!userProfile.ulpanMode && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {word.translation}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddWord(word)}
                        disabled={isAdded}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition ${
                          isAdded
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        }`}
                        title={isAdded ? (userProfile.ulpanMode ? 'במילון' : 'Слово уже в словаре') : (userProfile.ulpanMode ? 'הוסף למילון' : 'Добавить в словарь')}
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{userProfile.ulpanMode ? 'לַמִּילוֹן' : 'В словарь'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 font-hebrew">
            <button
              onClick={handleStartCall}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{userProfile.ulpanMode ? 'שִׂיחָה חוֹזֶרֶת 🔄' : 'Позвонить еще раз'}</span>
            </button>

            {onBackToLesson && (
              <button
                onClick={onBackToLesson}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
              >
                <span>{userProfile.ulpanMode ? 'חֲזָרָה לַשִּׁיעוּרִים ➡️' : 'Вернуться к уроку'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
