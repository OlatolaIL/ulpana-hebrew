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
  const [liveTranscript, setLiveTranscript] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [handsFree, setHandsFree] = useState(true); // Автоматический разговор по громкой связи включен по умолчанию
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Добавленные слова в словарик
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});

  const recognizerRef = useRef<HebrewSpeechRecognizer | null>(null);
  const timerRef = useRef<any>(null);
  const handsFreeTimeoutRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const isSendingRef = useRef(false);
  const callActiveRef = useRef(false);
  const shouldListenRef = useRef(false);
  const lastAiSpokenTextRef = useRef('');
  const lastAiSpokenTimeRef = useRef(0);

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
      if (handsFreeTimeoutRef.current) clearTimeout(handsFreeTimeoutRef.current);
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
    setMessages([]);
    setLastFeedback(null);
    setLiveTranscript('');
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
      setMessages([initialAiMsg]);
      setCallState('connected');

      // ИИ сразу озвучивает приветствие
      playAiVoice(initialAiMsg.hebrew);
    }, 2400);
  };

  // Озвучивание реплики ИИ с надежной защитой от самопрослушивания
  const playAiVoice = async (text: string) => {
    // 1. Глушим микрофон перед тем, как ИИ начнет говорить
    stopListening();
    setIsAiSpeaking(true);
    lastAiSpokenTextRef.current = stripNikkud(text).trim().toLowerCase();

    try {
      await speakHebrew(text, { rate: userProfile.speechRate || 0.75 });
    } catch (e) {
      console.error('Speech error:', e);
    } finally {
      setIsAiSpeaking(false);
      lastAiSpokenTimeRef.current = Date.now();

      // Безопасная пауза 650мс после того, как динамик затих, перед авто-включением микрофона
      if (handsFree && callActiveRef.current) {
        if (handsFreeTimeoutRef.current) clearTimeout(handsFreeTimeoutRef.current);
        handsFreeTimeoutRef.current = setTimeout(() => {
          if (callActiveRef.current && !isAiSpeaking && !loadingAi) {
            startListening();
          }
        }, 650);
      }
    }
  };

  // Проверка на эхо (не услышал ли микрофон сам динамик ИИ)
  const isEchoFromAi = (transcript: string): boolean => {
    const cleanUser = stripNikkud(transcript).trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 2) return true;

    // Если прошло меньше 600мс с момента окончания речи ИИ
    if (Date.now() - lastAiSpokenTimeRef.current < 600) {
      return true;
    }

    const cleanAi = lastAiSpokenTextRef.current;
    if (cleanAi) {
      // Прямое совпадение или подстрока
      if (cleanAi === cleanUser || cleanAi.includes(cleanUser) || cleanUser.includes(cleanAi)) {
        return true;
      }
    }

    return false;
  };

  // Запуск микрофона
  const startListening = () => {
    if (isRecording || isAiSpeaking || loadingAi || isSendingRef.current || !callActiveRef.current) {
      return;
    }

    if (!recognizerRef.current || !recognizerRef.current.isSupported()) {
      setShowTextInput(true);
      return;
    }

    shouldListenRef.current = true;
    setIsRecording(true);
    setLiveTranscript('');

    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    recognizerRef.current.start(
      (transcript, isFinal) => {
        if (isAiSpeaking || isSendingRef.current || !callActiveRef.current) return;

        setLiveTranscript(transcript);

        // Таймер авто-отправки при паузе в речи (1.6 секунды тишины)
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (transcript.trim() && handsFree) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (!isEchoFromAi(transcript) && callActiveRef.current && shouldListenRef.current) {
              handleSendMessage(transcript.trim());
            }
          }, 1600);
        }
      },
      (error) => {
        console.warn('Speech recognition warning:', error);
      },
      (lastTranscript) => {
        // Если браузер завершил сессию распознавания, но мы все еще в режиме ожидания ответа:
        if (callActiveRef.current && shouldListenRef.current && !isAiSpeaking && !loadingAi && !isSendingRef.current) {
          if (lastTranscript && lastTranscript.trim() && !isEchoFromAi(lastTranscript)) {
            handleSendMessage(lastTranscript.trim());
          } else {
            // Перезапускаем распознавание без необходимости нажимать кнопку
            setTimeout(() => {
              if (callActiveRef.current && shouldListenRef.current && !isAiSpeaking && !loadingAi) {
                startListening();
              }
            }, 120);
          }
        } else {
          setIsRecording(false);
        }
      }
    );
  };

  // Остановка микрофона
  const stopListening = () => {
    shouldListenRef.current = false;
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsRecording(false);
  };

  // Отправка реплики собеседнику
  const handleSendMessage = async (textToSend?: string) => {
    stopListening();
    const text = (textToSend || textInput || liveTranscript).trim();

    if (!text || loadingAi || isSendingRef.current || !callActiveRef.current) {
      return;
    }

    // Защита от эхо собственного голоса ИИ
    if (isEchoFromAi(text) && !textToSend && !textInput) {
      console.warn('Blocked AI echo loop detected:', text);
      setLiveTranscript('');
      return;
    }

    isSendingRef.current = true;
    setTextInput('');
    setLiveTranscript('');
    setLoadingAi(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

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

      setMessages((prev) => [...prev, aiMsg]);
      setLoadingAi(false);
      isSendingRef.current = false;

      // Озвучиваем ответ ИИ
      playAiVoice(aiMsg.hebrew);
    } catch (err) {
      console.error('Phone AI Error:', err);
      setLoadingAi(false);
      isSendingRef.current = false;
    }
  };

  // Завершение звонка
  const handleEndCall = async () => {
    callActiveRef.current = false;
    stopSpeech();
    stopListening();
    phoneAudio.stopAll();
    if (handsFreeTimeoutRef.current) clearTimeout(handsFreeTimeoutRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    await phoneAudio.playHangupTone(2);
    setCallState('ended');

    const formattedTranscript = messages.map((m) => ({
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
        messages_count: messages.length,
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
            <p className="text-sm font-semibold text-blue-400 mt-0.5">
              {scenario.callerNameRu}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {scenario.callerRole}
            </p>

            {/* Контекст ситуации */}
            <div className="w-full bg-zinc-800/60 backdrop-blur border border-zinc-700/60 rounded-2xl p-4 my-5 text-left text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center gap-1.5 font-bold text-zinc-200 mb-1.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Ситуация звонка:</span>
              </div>
              <p className="leading-relaxed">{scenario.situationSummary}</p>

              {/* Цели разговора */}
              <div className="mt-3 pt-3 border-t border-zinc-700/50">
                <span className="font-bold text-zinc-200 text-xs block mb-1.5">
                  🎯 Ваши задачи в разговоре:
                </span>
                <ul className="space-y-1 text-xs text-zinc-400">
                  {scenario.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Кнопка запуска звонка */}
            <button
              onClick={handleStartCall}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.98] transition font-bold text-white text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <PhoneCall className="w-6 h-6 animate-pulse" />
              <span>Позвонить • לְהִתְקַשֵּׁר</span>
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
          <p className="text-sm text-zinc-400 mt-1">{scenario.callerNameRu}</p>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mt-4 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/40">
            <Radio className="w-4 h-4 animate-spin text-emerald-400" />
            <span>מְחַיֵּג... (Идут гудки)</span>
          </div>

          {/* Кнопка отмены */}
          <button
            onClick={() => {
              phoneAudio.stopAll();
              setCallState('idle');
            }}
            className="mt-10 p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition active:scale-95 cursor-pointer"
            title="Отменить вызов"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* 3. СОСТОЯНИЕ: АКТИВНЫЙ РАЗГОВОР (CONNECTED) */}
      {callState === 'connected' && (
        <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col min-h-[560px]">
          {/* Верхний бар вызова */}
          <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-700/80 border border-zinc-600 flex items-center justify-center text-xl">
                {scenario.avatarEmoji}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white font-hebrew">
                  {scenario.callerName}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400">
                    {formatTimer(callDuration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Быстрые переключатели режима */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHandsFree(!handsFree)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                  handsFree
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
                title={handsFree ? 'Громкая связь (Автоматический ответ)' : 'Ручной режим по кнопке'}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {handsFree ? 'Авто-разговор' : 'По кнопке'}
                </span>
              </button>

              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-1.5 rounded-xl border text-xs transition ${
                  showSubtitles
                    ? 'bg-purple-600/30 text-purple-400 border-purple-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
                title={showSubtitles ? 'Скрыть субтитры (режим на слух)' : 'Показать субтитры'}
              >
                {showSubtitles ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Центральная часть: Анимация речи и субтитры */}
          <div className="flex-1 p-5 flex flex-col justify-between items-center text-center">
            {/* Аниматор говорящего */}
            <div className="my-auto flex flex-col items-center">
              <div className="relative mb-4">
                {isAiSpeaking && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                )}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                )}
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-4 transition-all duration-300 shadow-2xl ${
                    isAiSpeaking
                      ? 'border-blue-500 bg-blue-950/40 shadow-blue-500/30 scale-105'
                      : isRecording
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-emerald-500/30 scale-105'
                      : 'border-zinc-700 bg-zinc-800/80 shadow-black'
                  }`}
                >
                  {scenario.avatarEmoji}
                </div>
              </div>

              {/* Статус речи */}
              <div className="h-7">
                {isAiSpeaking && (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full border border-blue-800/50 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{scenario.callerNameRu} говорит...</span>
                  </div>
                )}
                {isRecording && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/50 animate-pulse">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Слушаю вас... Говорите на иврите</span>
                  </div>
                )}
                {loadingAi && (
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-800/50">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Собеседник думает...</span>
                  </div>
                )}
                {!isAiSpeaking && !isRecording && !loadingAi && (
                  <div className="text-xs text-zinc-400">
                    {handsFree
                      ? 'Говорите вслух на иврите...'
                      : 'Нажмите на микрофон или выберите ответ ниже 👇'}
                  </div>
                )}
              </div>
            </div>

            {/* Текущие субтитры реплики собеседника */}
            {latestAiMessage && (
              <div
                className={`w-full max-w-lg bg-zinc-800/80 backdrop-blur rounded-2xl p-4 border border-zinc-700/80 text-center transition-all ${
                  !showSubtitles ? 'filter blur-sm select-none opacity-40 hover:filter-none hover:opacity-100' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold font-hebrew text-white mb-1">
                  <span>{latestAiMessage.hebrew}</span>
                  <button
                    onClick={() => speakHebrew(latestAiMessage.hebrew)}
                    className="p-1 rounded-lg hover:bg-zinc-700 text-blue-400 transition"
                    title="Повторить фразу"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {userProfile.showTranscription && latestAiMessage.transcription && (
                  <p className="text-xs sm:text-sm text-yellow-400/90 font-mono">
                    {latestAiMessage.transcription}
                  </p>
                )}
                <p className="text-xs text-zinc-300 mt-1">
                  {latestAiMessage.translation}
                </p>
              </div>
            )}

            {/* Живая речь пользователя во время записи */}
            {liveTranscript && (
              <div className="w-full max-w-lg mt-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-2.5 text-xs text-emerald-300 font-hebrew flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="opacity-70">Вы говорите: </span>
                  <span className="font-bold">{liveTranscript}</span>
                </div>
                <button
                  onClick={() => handleSendMessage(liveTranscript)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition"
                >
                  Отправить
                </button>
              </div>
            )}

            {/* Подсказка об ошибке (Feedback) */}
            {lastFeedback && (
              <div className="w-full max-w-lg mt-2 bg-amber-950/50 border border-amber-800/50 rounded-xl p-2 text-xs text-amber-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lastFeedback}</span>
              </div>
            )}
          </div>

          {/* Быстрые варианты ответов (Suggested Replies) */}
          {latestAiMessage?.suggestedReplies && latestAiMessage.suggestedReplies.length > 0 && (
            <div className="px-4 py-2 bg-zinc-900/90 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Быстрый ответ (нажмите, чтобы сказать):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {latestAiMessage.suggestedReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    disabled={isAiSpeaking || loadingAi}
                    onClick={() => handleSendMessage(reply.hebrew)}
                    className="text-left px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-200 hover:text-white transition flex flex-col cursor-pointer disabled:opacity-50"
                  >
                    <span className="font-bold font-hebrew text-white">{reply.hebrew}</span>
                    <span className="text-[10px] text-zinc-400">{reply.translation}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Текстовый ввод (если микрофон выключен или недоступен) */}
          {showTextInput && (
            <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Напишите ответ на иврите..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-hebrew"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Нижняя панель управления звонком */}
          <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around">
            {/* Кнопка клавиатуры/текста */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`p-3.5 rounded-full border transition cursor-pointer ${
                showTextInput
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title="Текстовый ввод"
            >
              <Send className="w-5 h-5" />
            </button>

            {/* Главная кнопка: МИКРОФОН (Tap-to-Talk / Индикатор) */}
            <button
              onClick={isRecording ? stopListening : startListening}
              disabled={isAiSpeaking || loadingAi}
              className={`px-6 py-4 rounded-full font-bold transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer ${
                isRecording
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/30 animate-pulse'
                  : isAiSpeaking || loadingAi
                  ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
              }`}
              title={isRecording ? 'Идет запись (нажмите, чтобы остановить)' : 'Нажмите, чтобы говорить'}
            >
              <Mic className="w-6 h-6" />
              <span className="text-sm font-semibold">
                {isRecording ? 'Слушаю...' : 'Говорить'}
              </span>
            </button>

            {/* Кнопка: ЗАВЕРШИТЬ ЗВОНОК (Красная трубка) */}
            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
              title="Завершить разговор"
            >
              <PhoneOff className="w-6 h-6" />
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
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Разговор завершен!
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Отличная тренировка телефонного иврита
            </p>
          </div>

          {/* Метрики звонка */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center">
              <span className="text-xs text-zinc-400 block font-medium">Длительность</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {formatTimer(callDuration)}
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center">
              <span className="text-xs text-zinc-400 block font-medium">Реплик сказано</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {messages.filter((m) => m.role === 'user').length}
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-zinc-400 block font-medium">Понимание</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                100% 🏆
              </span>
            </div>
          </div>

          {/* Чек-лист целей */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Цели сценария:
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
          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Полезные слова из этого звонка:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.vocabulary.slice(0, 6).map((word) => {
                  const isAdded = addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
                  return (
                    <div
                      key={word.id}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 font-hebrew truncate text-sm">
                          {word.hebrew}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {word.translation}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddWord(word)}
                        disabled={isAdded}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition ${
                          isAdded
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        title={isAdded ? 'Слово уже в словаре' : 'Добавить в словарь'}
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[11px]">В словарь</span>
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
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleStartCall}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Позвонить еще раз</span>
            </button>

            {onBackToLesson && (
              <button
                onClick={onBackToLesson}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
              >
                <span>Вернуться к уроку</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
