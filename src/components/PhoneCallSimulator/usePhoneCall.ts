import { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import { Lesson, UserProfile, Word, ChatMessage, PhoneDebriefReport } from '@/types';
import { getLessonPhoneScenario } from '@/data/phoneScenarios';
import { phoneAudio } from '@/lib/phoneAudio';
import { speakHebrew, stopSpeech, HebrewSpeechRecognizer, isWhisperSilenceHallucination } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import {
  addWordToPersonalDict,
  markLessonTabCompleted,
  saveLocalCallLog,
  getStudentKnownVocabulary,
} from '@/lib/storage';
import { callFlightRecorder } from '@/lib/callDiagnostics';
import { CallState } from './types';

interface UsePhoneCallProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
}
const subscribeToHydration = () => () => {};

export function buildPhoneRecognitionVocabulary(params: {
  lessonVocabulary?: string[];
  usefulWords?: string[];
  suggestedReplies?: string[];
  vocabularyHints?: string[];
  callerName?: string;
  studentName?: string;
  knownWords?: string[];
}): string[] {
  const words = new Set<string>();

  // 1. Имя ученика и его варианты транслитерации (высший приоритет для Whisper, иначе искажает имена)
  if (params.studentName) {
    const rawName = params.studentName.trim();
    if (/[\u0590-\u05FF]/.test(rawName)) {
      words.add(stripNikkud(rawName));
    } else {
      const lower = rawName.toLowerCase();
      if (lower.includes('сергей') || lower.includes('сергий') || lower.includes('sergey') || lower.includes('sergei')) {
        words.add('סרגיי');
        words.add('סרגי');
      } else if (lower.includes('давид') || lower.includes('david')) {
        words.add('דוד');
        words.add('דויד');
      } else if (lower.includes('михаил') || lower.includes('миша') || lower.includes('michael')) {
        words.add('מיכאל');
      } else if (lower.includes('анна') || lower.includes('аня') || lower.includes('anna')) {
        words.add('אנה');
      } else if (lower.includes('александр') || lower.includes('саша') || lower.includes('alex')) {
        words.add('אלכס');
        words.add('אלכסנדר');
      } else if (lower.includes('елена') || lower.includes('лена') || lower.includes('elena')) {
        words.add('אלנה');
        words.add('ילנה');
      }
    }
  }

  // 2. Имя звонящего персонажа
  if (params.callerName) {
    words.add(stripNikkud(params.callerName).trim());
  }

  // 3. Ключевые слова сценария звонка и подсказок (то, что ожидается услышать прямо сейчас)
  (params.vocabularyHints || []).forEach((w) => words.add(stripNikkud(w).trim()));
  (params.usefulWords || []).forEach((w) => words.add(stripNikkud(w).trim()));

  (params.suggestedReplies || []).forEach((rep) => {
    const tokens = stripNikkud(rep).match(/[\u0590-\u05FF]+/g);
    if (tokens) {
      tokens.forEach((t) => {
        if (t.length >= 2) words.add(t);
      });
    }
  });

  // 4. Добираем слова текущего урока до лимита
  (params.lessonVocabulary || []).forEach((w) => words.add(stripNikkud(w).trim()));

  // 5. Ограничиваемся ровно 20 ключевыми словами (гарантия < 200 символов, исключает лимит Groq Whisper 896 символов)
  return Array.from(words).filter(Boolean).slice(0, 20);
}

export function usePhoneCall({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
}: UsePhoneCallProps) {
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

  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [isAiHangingUp, setIsAiHangingUp] = useState(false);
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [showDialogueReviewModal, setShowDialogueReviewModal] = useState(false);
  const [debriefReport, setDebriefReport] = useState<PhoneDebriefReport | null>(null);
  const [loadingDebrief, setLoadingDebrief] = useState(false);
  const [showAudioHelp, setShowAudioHelp] = useState(false);
  const [audioHelpUnlocked, setAudioHelpUnlocked] = useState(false);

  const recognizerRef = useRef<HebrewSpeechRecognizer | null>(null);
  const activeMicStreamRef = useRef<MediaStream | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const isAiSpeakingRef = useRef(false);
  const isAiHangingUpRef = useRef(false);
  const loadingAiRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isMutedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoListenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callStartTimeRef = useRef<number>(0);
  const callDurationRef = useRef<number>(0);
  const callLogIdRef = useRef<string>('');
  const isSendingRef = useRef(false);
  const callActiveRef = useRef(false);
  const callGenerationRef = useRef(0);
  const endingCallRef = useRef(false);
  const shouldListenRef = useRef(false);
  const lastAiSpokenTextRef = useRef('');
  const lastAiSpokenTimeRef = useRef(0);
  const lastRecordedAudioUrlRef = useRef<string | null>(null);
  const lastRecordedAudioBlobRef = useRef<Blob | null>(null);
  const liveTranscriptRef = useRef('');
  const watchdogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const knownWords = useMemo(
    () => getStudentKnownVocabulary(userProfile, 50),
    [userProfile]
  );

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
      callGenerationRef.current += 1;
      callActiveRef.current = false;
      shouldListenRef.current = false;
      phoneAudio.stopAll();
      stopSpeech();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if (activeMicStreamRef.current) {
        try {
          activeMicStreamRef.current.getTracks().forEach((track) => track.stop());
        } catch {}
        activeMicStreamRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (watchdogTimeoutRef.current) clearTimeout(watchdogTimeoutRef.current);
      if (watchdogRestartTimeoutRef.current) clearTimeout(watchdogRestartTimeoutRef.current);
    };
  }, []);

  // Таймер звонка
  useEffect(() => {
    if (callState === 'connected') {
      if (!callStartTimeRef.current) {
        callStartTimeRef.current = Date.now();
      }
      timerRef.current = setInterval(() => {
        const sec = Math.max(0, Math.round((Date.now() - (callStartTimeRef.current || Date.now())) / 1000));
        callDurationRef.current = sec;
        setCallDuration(sec);
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

  // Остановка микрофона
  const stopListening = () => {
    shouldListenRef.current = false;
    setAudioLevel(0);
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (watchdogTimeoutRef.current) {
      clearTimeout(watchdogTimeoutRef.current);
      watchdogTimeoutRef.current = null;
    }
    if (watchdogRestartTimeoutRef.current) {
      clearTimeout(watchdogRestartTimeoutRef.current);
      watchdogRestartTimeoutRef.current = null;
    }
    if (recognizerRef.current) {
      recognizerRef.current.stop(true);
    }
    setRecording(false);
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
      setSpeechNotice('Распознавание речи не поддерживается в этом браузере. Для звонка используйте Chrome или Safari.');
      return;
    }

    shouldListenRef.current = true;
    setRecording(true);
    setLiveTranscript('');
    liveTranscriptRef.current = '';

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (watchdogTimeoutRef.current) {
      clearTimeout(watchdogTimeoutRef.current);
      watchdogTimeoutRef.current = null;
    }
    if (watchdogRestartTimeoutRef.current) {
      clearTimeout(watchdogRestartTimeoutRef.current);
      watchdogRestartTimeoutRef.current = null;
    }

    // В первых 5 уроках пауза 2 сек, в уроках 6-10 — 1.5 сек, далее 1.3 сек
    const silenceDelayMs = lesson.number && lesson.number <= 5 ? 2000
      : lesson.number && lesson.number <= 10 ? 1500 : 1300;

    // Сторожевой таймер (12 сек): предотвращает бесконечное зависание микрофона на мобильных
    watchdogTimeoutRef.current = setTimeout(() => {
      if (
        callActiveRef.current &&
        shouldListenRef.current &&
        !isSendingRef.current &&
        !isAiSpeakingRef.current &&
        !isMutedRef.current
      ) {
        // Если ученик активно говорит или идет финализация/обработка STT — не прерываем речь!
        if (recognizerRef.current?.isSpeechActive()) {
          callFlightRecorder.record('VAD', 'Watchdog deferred: user is actively speaking or STT is running', {}, 'info');
          return;
        }

        const text = (liveTranscriptRef.current || '').trim();
        if (text.length >= 2 && !isEchoFromAi(text) && !isWhisperSilenceHallucination(text)) {
          if (recognizerRef.current) {
            recognizerRef.current.commitSpeech();
          } else {
            handleSendMessage(text);
          }
        } else {
          setSpeechNotice('Собеседник вас не расслышал. Скажите фразу громче');
          callFlightRecorder.record('VAD', 'Watchdog triggered: no speech after 12s, scheduling restart', {}, 'warn');
          if (watchdogRestartTimeoutRef.current) {
            clearTimeout(watchdogRestartTimeoutRef.current);
          }
          watchdogRestartTimeoutRef.current = setTimeout(() => {
            if (callActiveRef.current && shouldListenRef.current && !isSendingRef.current && !isAiSpeakingRef.current) {
              startListening(true);
            }
          }, 1500);
        }
      }
    }, 12000);

    recognizerRef.current.start(
      (transcript) => {
        if (isAiSpeakingRef.current || isSendingRef.current || !callActiveRef.current || isMutedRef.current) return;

        liveTranscriptRef.current = transcript;
        setLiveTranscript(transcript);
        setSpeechNotice(null);
        if (watchdogRestartTimeoutRef.current) {
          clearTimeout(watchdogRestartTimeoutRef.current);
          watchdogRestartTimeoutRef.current = null;
        }

        // Резервный таймер тишины при паузе после сказанных слов
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        const trimmed = (transcript || '').trim();
        if (trimmed.length >= 2 && !isWhisperSilenceHallucination(trimmed) && !isEchoFromAi(trimmed)) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (
              callActiveRef.current &&
              shouldListenRef.current &&
              !isSendingRef.current &&
              !isAiSpeakingRef.current &&
              !isMutedRef.current
            ) {
              if (recognizerRef.current) {
                recognizerRef.current.commitSpeech();
              } else {
                handleSendMessage(trimmed);
              }
            }
          }, silenceDelayMs);
        }
      },
      (error: unknown) => {
        console.warn('Speech recognition warning:', error);
        const errStr = error instanceof Error ? error.message || error.name : String(error || '');
        const lower = errStr.toLowerCase();
        if (
          lower.includes('not-allowed') ||
          lower.includes('permission') ||
          lower.includes('заблокирован') ||
          lower.includes('доступ к микрофону')
        ) {
          setSpeechNotice('Доступ к микрофону заблокирован. Разрешите микрофон в настройках браузера.');
        } else if (
          lower.includes('network') ||
          lower.includes('сеть') ||
          lower.includes('интернет') ||
          lower.includes('offline')
        ) {
          setSpeechNotice('Сбой сети или проблемы с интернетом. Проверьте подключение.');
        } else if (lower.includes('no-speech') || lower.includes('тишина')) {
          // Пауза или отсутствие речи не требуют тревожных сообщений
        } else {
          setSpeechNotice(`Ошибка микрофона: ${errStr || 'проверьте подключение микрофона'}`);
        }
      },
      (lastTranscript, recordedBlob, recordedUrl) => {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        if (watchdogTimeoutRef.current) {
          clearTimeout(watchdogTimeoutRef.current);
          watchdogTimeoutRef.current = null;
        }
        if (watchdogRestartTimeoutRef.current) {
          clearTimeout(watchdogRestartTimeoutRef.current);
          watchdogRestartTimeoutRef.current = null;
        }

        // Завершение сессии распознавания: если все еще слушаем, проверяем наличие фразы
        if (
          callActiveRef.current &&
          shouldListenRef.current &&
          !isAiSpeakingRef.current &&
          !loadingAiRef.current &&
          !isSendingRef.current &&
          !isMutedRef.current
        ) {
          if (
            lastTranscript &&
            lastTranscript.trim() &&
            !isEchoFromAi(lastTranscript) &&
            !isWhisperSilenceHallucination(lastTranscript)
          ) {
            handleSendMessage(lastTranscript.trim(), {
              audioBlob: recordedBlob || lastRecordedAudioBlobRef.current,
              audioUrl: recordedUrl || lastRecordedAudioUrlRef.current,
            });
          }
        }
      },
      {
        vocabulary: buildPhoneRecognitionVocabulary({
          lessonVocabulary: (lesson.vocabulary || []).map((w) => w.hebrew),
          usefulWords: (scenario.usefulWords || []).map((w) => w.hebrew),
          suggestedReplies: (scenario.suggestedReplies || []).map((r) => r.hebrew),
          vocabularyHints: scenario.vocabularyHints || [],
          callerName: scenario.callerName,
          studentName: userProfile.name,
          knownWords,
        }),
        apiKey: userProfile.groqApiKey || undefined,
        continuous: true,
        silenceDurationMs: silenceDelayMs,
        speechThreshold: 16,
        energyThresholdDb: -35,
        audioContext: phoneAudio.getContext(),
        mediaStream: activeMicStreamRef.current,
        onAudioRecorded: (blob, url) => {
          if (url) {
            lastRecordedAudioUrlRef.current = url;
            lastRecordedAudioBlobRef.current = blob;
          }
        },
        onAudioLevel: (level) => {
          if (!isAiSpeakingRef.current && !loadingAiRef.current && !isMutedRef.current) {
            setAudioLevel(level);
          } else {
            setAudioLevel(0);
          }
        },
        onSilenceDetected: (transcript, audioBlob, audioUrl) => {
          if (
            callActiveRef.current &&
            shouldListenRef.current &&
            !isSendingRef.current &&
            !isAiSpeakingRef.current &&
            !loadingAiRef.current &&
            !isMutedRef.current
          ) {
            const textToSubmit = (transcript || '').trim();
            if (
              textToSubmit &&
              textToSubmit.length >= 2 &&
              !isEchoFromAi(textToSubmit) &&
              !isWhisperSilenceHallucination(textToSubmit)
            ) {
              handleSendMessage(textToSubmit, {
                audioBlob: audioBlob || lastRecordedAudioBlobRef.current,
                audioUrl: audioUrl || lastRecordedAudioUrlRef.current,
              });
            }
          }
        },
      }
    );
  };

  // Озвучивание реплики ИИ с надежной защитой от самопрослушивания
  const playAiVoice = async (text: string, willHangUp: boolean = false) => {
    // 1. Глушим микрофон перед тем, как ИИ начнет говорить
    stopListening();
    setAiSpeaking(true);
    setAudioLevel(0);
    lastAiSpokenTextRef.current = stripNikkud(text).trim().toLowerCase();
    callFlightRecorder.record('TTS', 'AI speech started', {
      text,
      rate: userProfile.speechRate || 0.75,
      gender: scenario.callerGender || 'male',
      callerName: scenario.callerName,
    }, 'info');

    try {
      await speakHebrew(text, {
        rate: userProfile.speechRate || 0.75,
        gender: scenario.callerGender || 'male',
      });
    } catch (e) {
      console.error('Speech error:', e);
      callFlightRecorder.record('TTS', 'Speech synthesis error', { error: String(e) }, 'error');
    } finally {
      setAiSpeaking(false);
      lastAiSpokenTimeRef.current = Date.now();
      callFlightRecorder.record('TTS', 'AI speech finished', { willHangUp }, 'info');

      if (willHangUp) {
        // Собеседник прощается и САМ вешает трубку!
        if (callActiveRef.current) {
          if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
          autoListenTimeoutRef.current = setTimeout(async () => {
            if (callActiveRef.current) {
              await handleEndCall();
            }
          }, 1200);
        }
        return;
      }

      // Безопасная пауза 500мс после того, как динамик затих, перед авто-включением микрофона
      if (callActiveRef.current && !isMutedRef.current && !isAiHangingUpRef.current) {
        if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
        autoListenTimeoutRef.current = setTimeout(() => {
          if (
            callActiveRef.current &&
            !isAiSpeakingRef.current &&
            !loadingAiRef.current &&
            !isSendingRef.current &&
            !isMutedRef.current &&
            !isAiHangingUpRef.current
          ) {
            startListening(true);
          }
        }, 500);
      }
    }
  };

  // Запуск вызова
  const handleStartCall = async () => {
    const generation = ++callGenerationRef.current;
    endingCallRef.current = false;
    setDebriefReport(null);
    setLoadingDebrief(false);
    callLogIdRef.current = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    callFlightRecorder.reset(callLogIdRef.current);
    callFlightRecorder.record('SYSTEM', 'Call initiated (dialing)', {
      lessonNumber: lesson.number,
      callerName: scenario.callerName,
      callType: scenario.callType,
      userGender: userProfile.gender,
    }, 'info');

    // 1. Активируем AudioContext прямо по клику пользователя (User Gesture)
    const ctx = phoneAudio.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // 2. Запрашиваем микрофон сразу в момент клика и держим активным на время звонка
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        if (generation !== callGenerationRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        activeMicStreamRef.current = stream;
        callFlightRecorder.record('AUDIO', 'Microphone stream acquired', {
          trackCount: stream.getAudioTracks().length,
          settings: stream.getAudioTracks()[0]?.getSettings?.(),
        }, 'success');
      } catch (err) {
        console.warn('Mic permission error:', err);
        callFlightRecorder.record('AUDIO', 'Microphone permission error', { error: String(err) }, 'error');
      }
    }

    if (generation !== callGenerationRef.current) return;
    setCallState('dialing');
    setBothMessages([]);
    setLastFeedback(null);
    setLiveTranscript('');
    setSpeechNotice(null);
    setAudioLevel(0);
    setIsMuted(false);
    isMutedRef.current = false;
    isSendingRef.current = false;
    callActiveRef.current = false;
    shouldListenRef.current = false;
    setIsAiHangingUp(false);
    isAiHangingUpRef.current = false;
    callStartTimeRef.current = 0;
    callDurationRef.current = 0;
    setCallDuration(0);
    phoneAudio.startRingingTone();

    // Через 2.4 секунды контакт "поднимает трубку"
    setTimeout(async () => {
      if (generation !== callGenerationRef.current) return;
      phoneAudio.stopAll();
      await phoneAudio.playPickupSound();
      if (generation !== callGenerationRef.current) return;

      const initialAiMsg: ChatMessage = {
        id: `ai-init-${Date.now()}`,
        role: 'assistant',
        hebrew: scenario.initialGreeting.hebrew,
        transcription: scenario.initialGreeting.transcription,
        translation: scenario.initialGreeting.translation,
        suggestedReplies: scenario.suggestedReplies || [],
        timestamp: Date.now(),
      };

      callStartTimeRef.current = Date.now();
      callDurationRef.current = 0;
      setCallDuration(0);
      callActiveRef.current = true;
      setBothMessages([initialAiMsg]);
      setCallState('connected');
      callFlightRecorder.record('SYSTEM', 'Call connected (contact picked up)', {
        greeting: scenario.initialGreeting.hebrew,
      }, 'success');

      // ИИ сразу озвучивает приветствие
      playAiVoice(initialAiMsg.hebrew);
    }, 2400);
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
  async function handleSendMessage(
    textToSend?: string,
    meta?: {
      translation?: string;
      transcription?: string;
      audioBlob?: Blob | null;
      audioUrl?: string | null;
    }
  ) {
    stopListening();
    setSpeechNotice(null);
    const text = (textToSend || textInput || liveTranscript).trim();

    if (!text || loadingAiRef.current || isSendingRef.current || !callActiveRef.current) {
      return;
    }
    const generation = callGenerationRef.current;

    // Защита от эхо собственного голоса ИИ и галлюцинаций тишины Whisper
    if ((isEchoFromAi(text) || isWhisperSilenceHallucination(text)) && !textToSend && !textInput) {
      console.warn('Blocked AI echo or silence hallucination:', text);
      callFlightRecorder.record('VAD', 'Blocked AI echo or silence hallucination', { text }, 'warn');
      setLiveTranscript('');
      setTimeout(() => {
        if (callActiveRef.current && !isAiSpeakingRef.current && !loadingAiRef.current && !isMutedRef.current) {
          startListening(true);
        }
      }, 300);
      return;
    }

    isSendingRef.current = true;
    setTextInput('');
    setLiveTranscript('');
    setAudioLevel(0);
    setAiLoading(true);

    const userAudioBlob = meta?.audioBlob || lastRecordedAudioBlobRef.current || undefined;
    const userAudioUrl = meta?.audioUrl || lastRecordedAudioUrlRef.current || undefined;
    lastRecordedAudioBlobRef.current = null;
    lastRecordedAudioUrlRef.current = null;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      hebrew: text,
      transcription: meta?.transcription,
      translation: meta?.translation,
      userAudioUrl,
      userAudioBlob,
      timestamp: Date.now(),
    };

    // A failed provider request leaves its user turn visible. A spoken retry replaces
    // that pending turn, rather than counting the same unanswered turn twice.
    const acknowledgedHistory = messagesRef.current.at(-1)?.role === 'user'
      ? messagesRef.current.slice(0, -1)
      : messagesRef.current;
    const newHistory = [...acknowledgedHistory, userMsg];
    setBothMessages(newHistory);

    const requestId = `phone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
    callFlightRecorder.record('LLM', 'Sending user turn to /api/ai/phone', {
      requestId,
      round: newHistory.length,
      text,
      provider: userProfile.aiProvider,
    }, 'info');

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        content: m.hebrew,
      }));

      const res = await fetch('/api/ai/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          requestId,
          messages: historyPayload,
          lessonNumber: lesson.number,
          level: lesson.level,
          userGender: userProfile.gender,
          userName: userProfile.name,
          callType: scenario.callType || 'incoming',
          callerName: scenario.callerName,
          callerNameRu: scenario.callerNameRu,
          callerRole: scenario.callerRole,
          userRole: scenario.userRole,
          situationSummary: scenario.situationSummary,
          callerObjective: scenario.callerObjective,
          studentObjective: scenario.studentObjective,
          completionCondition: scenario.completionCondition,
          goals: scenario.goals,
          systemPromptAddition: scenario.systemPromptAddition,
          targetTurns: scenario.targetTurns || 3,
          vocabularyHints: scenario.vocabularyHints || [],
          knownWords: knownWords.slice(0, 10),
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
        }),
      });

      const latencyMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - tStart);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const serverRequestId = errData.requestId || requestId;
        const errCategory = errData.category || (res.status === 429 ? 'app_rate_limit' : 'provider_unavailable');
        const errMsg = errData.error || 'Собеседник сейчас недоступен. Попробуйте ещё раз.';

        callFlightRecorder.record('LLM', `Phone API error ${res.status} (${latencyMs}ms)`, {
          requestId: serverRequestId,
          latencyMs,
          status: res.status,
          category: errCategory,
          error: errMsg,
        }, 'error');

        throw new Error(errMsg);
      }

      callFlightRecorder.record('LLM', `Phone API response status ${res.status} (${latencyMs}ms)`, {
        requestId,
        latencyMs,
        status: res.status,
      }, 'success');

      const data = await res.json();
      if (generation !== callGenerationRef.current) return;
      if (typeof data.hebrew !== 'string' || !data.hebrew.trim()) throw new Error('Не удалось получить ответ собеседника.');

      callFlightRecorder.record('LLM', 'AI response parsed successfully', {
        requestId,
        aiHebrew: data.hebrew,
        isCompleted: Boolean(data.isCompleted),
        shouldHangUp: Boolean(data.shouldHangUp),
      }, 'info');

      const willHangUp = Boolean(data.shouldHangUp || data.isCompleted);

      if (willHangUp) {
        setIsAiHangingUp(true);
        isAiHangingUpRef.current = true;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        hebrew: data.hebrew || 'בְּסֵדֶר גָּמוּר!',
        transcription: data.transcription,
        translation: data.translation,
        suggestedReplies: willHangUp ? [] : (data.suggestedReplies || []),
        timestamp: Date.now(),
      };

      const updatedHistory = [...messagesRef.current, aiMsg];
      setBothMessages(updatedHistory);

      // Озвучиваем ответ ИИ (если willHangUp = true, после реплики ИИ сам повесит трубку)
      playAiVoice(aiMsg.hebrew, willHangUp);
    } catch (err) {
      if (generation !== callGenerationRef.current) return;
      console.error('Phone AI Error:', err);
      const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
      const latencyMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - tStart);
      callFlightRecorder.record('ERROR', `Phone AI error (${latencyMs}ms)`, {
        requestId,
        latencyMs,
        error: String(err),
        isTimeout,
      }, 'error');

      setSpeechNotice(
        isTimeout
          ? 'Задержка сети: собеседник не ответил вовремя. Разговор сохранён. Повторите фразу голосом.'
          : 'Ответ собеседника не получен. Разговор сохранён. Повторите фразу голосом.'
      );
      setTimeout(() => {
        if (callActiveRef.current && !isMutedRef.current && !isAiHangingUpRef.current) {
          startListening(true);
        }
      }, 500);
    } finally {
      if (generation === callGenerationRef.current) {
        setAiLoading(false);
      }
      isSendingRef.current = false;
    }
  };

  // Педагогический разбор звонка (Debrief)
  const requestDebrief = useCallback(
    async (
      transcriptPayload: Array<{ role: 'user' | 'assistant'; hebrew: string; translation?: string; transcription?: string; userAudioUrl?: string }>,
      durationSec: number,
      logId: string,
      gen: number,
    ) => {
      setLoadingDebrief(true);
      setSpeechNotice(null);
      const debriefRequestId = `debrief_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        const res = await fetch('/api/ai/phone/debrief', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': debriefRequestId,
          },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            requestId: debriefRequestId,
            lessonNumber: lesson.id,
            level: lesson.level,
            userGender: userProfile.gender,
            callerRole: scenario.callerRole,
            callerNameRu: scenario.callerNameRu,
            callType: scenario.callType || 'incoming',
            situationSummary: scenario.situationSummary,
            studentObjective: scenario.studentObjective,
            transcript: transcriptPayload,
            durationSeconds: durationSec,
            provider: userProfile.aiProvider,
            apiKey:
              userProfile.aiProvider === 'groq'
                ? userProfile.groqApiKey
                : userProfile.geminiApiKey,
          }),
        });

        if (!res.ok) throw new Error('Проверка разговора недоступна');
        const debrief: PhoneDebriefReport = await res.json();
        if (gen !== callGenerationRef.current) return;
        setDebriefReport(debrief);
        if (debrief.isSuccess === true) {
          const updated = markLessonTabCompleted(lesson.id, 'phone');
          onUpdateProfile?.(updated);
        }
        // Обновляем лог в БД с готовым отзывом учителя и свежими audio URLs
        fetch('/api/calls/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: logId,
            lessonId: lesson.id,
            callerName: scenario.callerNameRu || scenario.callerName,
            callerRole: scenario.callerRole,
            durationSeconds: durationSec,
            transcript: messagesRef.current.map((m) => ({
              role: m.role,
              hebrew: m.hebrew,
              translation: m.translation,
              transcription: m.transcription,
              userAudioUrl: m.userAudioUrl,
            })),
            feedback: debrief.summaryRu || 'Звонок успешно завершен',
            userName: userProfile.name || 'Ученик',
          }),
        }).catch(() => {});
      } catch (err) {
        console.warn('Debrief fetch error:', err);
        if (gen === callGenerationRef.current) {
          setSpeechNotice('Разговор сохранён локально. Оценка недоступна, этап не зачтён.');
        }
      } finally {
        if (gen === callGenerationRef.current) {
          setLoadingDebrief(false);
        }
      }
    },
    [lesson.id, lesson.level, userProfile, scenario, onUpdateProfile]
  );

  const retryDebrief = useCallback(() => {
    const currentMessages = messagesRef.current;
    const userMessages = currentMessages.filter((m) => m.role === 'user');
    if (userMessages.length === 0 || loadingDebrief) return;
    const formattedTranscript = currentMessages.map((m) => ({
      role: m.role,
      hebrew: m.hebrew,
      translation: m.translation,
      transcription: m.transcription,
      userAudioUrl: m.userAudioUrl,
    }));
    const logId = callLogIdRef.current || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    callLogIdRef.current = logId;
    requestDebrief(formattedTranscript, callDurationRef.current || callDuration, logId, callGenerationRef.current);
  }, [loadingDebrief, callDuration, requestDebrief]);

  // Завершение звонка
  async function handleEndCall() {
    if (endingCallRef.current) return;
    endingCallRef.current = true;
    const generation = ++callGenerationRef.current;
    callActiveRef.current = false;
    setIsAiHangingUp(false);
    isAiHangingUpRef.current = false;
    stopSpeech();
    stopListening();
    phoneAudio.stopAll();
    if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    callFlightRecorder.record('SYSTEM', 'Call ended (hangup)', {
      durationSeconds: callDurationRef.current,
      totalMessages: messagesRef.current.length,
    }, 'info');

    if (activeMicStreamRef.current) {
      try {
        activeMicStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      activeMicStreamRef.current = null;
    }

    // Вычисляем точную продолжительность звонка по временной метке старта
    const finalDurationSeconds =
      callStartTimeRef.current > 0
        ? Math.max(1, Math.round((Date.now() - callStartTimeRef.current) / 1000))
        : Math.max(1, callDurationRef.current, callDuration);
    callDurationRef.current = finalDurationSeconds;
    setCallDuration(finalDurationSeconds);

    const currentCallLogId =
      callLogIdRef.current || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    callLogIdRef.current = currentCallLogId;

    await phoneAudio.playHangupTone(2);
    if (generation !== callGenerationRef.current) return;
    setCallState('ended');
    setShowDialogueReviewModal(true);

    const currentMessages = messagesRef.current;

    // Выгрузка аудиозаписей реплик ученика на сервер/в облако (строго 1 последняя попытка)
    await Promise.all(
      currentMessages.map(async (m, idx) => {
        if (m.role === 'user' && m.userAudioBlob) {
          try {
            const form = new FormData();
            form.append('file', m.userAudioBlob);
            form.append('lessonId', String(lesson.id));
            form.append('stage', 'phone');
            form.append('turnIndex', String(idx));
            form.append('durationSeconds', String(finalDurationSeconds));
            if (userProfile.id) form.append('userId', userProfile.id);

            const upRes = await fetch('/api/audio/upload', {
              method: 'POST',
              body: form,
            });
            if (upRes.ok) {
              const data = await upRes.json();
              if (generation === callGenerationRef.current && data.url) {
                m.userAudioUrl = data.url;
              }
            }
          } catch (e) {
            console.warn('[PhoneCall] Failed to upload audio turn', idx, e);
          }
        }
      })
    );
    setBothMessages([...messagesRef.current]);

    const formattedTranscript = currentMessages.map((m) => ({
      role: m.role,
      hebrew: m.hebrew,
      translation: m.translation,
      transcription: m.transcription,
      userAudioUrl: m.userAudioUrl,
    }));

    const userMessages = currentMessages.filter((m) => m.role === 'user');

    // 1. Сохраняем в локальное хранилище
    try {
      saveLocalCallLog({
        id: currentCallLogId,
        user_id: userProfile.name || 'local_user',
        user_name: userProfile.name || 'Ученик',
        lesson_id: lesson.id,
        caller_name: scenario.callerNameRu || scenario.callerName,
        caller_role: scenario.callerRole,
        duration_seconds: finalDurationSeconds,
        messages_count: currentMessages.length,
        transcript: formattedTranscript,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Local call log error:', e);
    }

    // 2. Сразу логируем звонок на сервер в БД (не дожидаясь разбора debrief), чтобы длительность не потерялась
    try {
      fetch('/api/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentCallLogId,
          lessonId: lesson.id,
          callerName: scenario.callerNameRu || scenario.callerName,
          callerRole: scenario.callerRole,
          durationSeconds: finalDurationSeconds,
          transcript: formattedTranscript,
          feedback: userMessages.length ? 'Разговор завершён, оценка ещё не получена' : 'Разговор прерван без ответов ученика',
          userName: userProfile.name || 'Ученик',
        }),
      }).catch((e) => console.warn('[PhoneCall] Immediate call log warning:', e));
    } catch (e) {
      console.warn('[PhoneCall] Immediate call log fetch error:', e);
    }

    // 3. Запрашиваем педагогический разбор звонка (Debriefing)
    if (userMessages.length > 0) {
      requestDebrief(formattedTranscript, finalDurationSeconds, currentCallLogId, generation);
    }
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

  return {
    scenario,
    callState,
    setCallState,
    callDuration,
    formatTimer,
    messages,
    isAiSpeaking,
    isRecording,
    audioLevel,
    isMuted,
    liveTranscript,
    loadingAi,
    showSubtitles,
    setShowSubtitles,
    textInput,
    setTextInput,
    showTextInput,
    setShowTextInput,
    lastFeedback,
    speechNotice,
    addedWords,
    isAiHangingUp,
    mounted,
    isWordsDrawerOpen,
    setIsWordsDrawerOpen,
    showDialogueReviewModal,
    setShowDialogueReviewModal,
    debriefReport,
    loadingDebrief,
    showAudioHelp,
    setShowAudioHelp,
    audioHelpUnlocked,
    setAudioHelpUnlocked,
    latestAiMessage,
    isEchoFromAi,
    handleStartCall,
    handleEndCall,
    handleSendMessage,
    retryDebrief,
    toggleMute,
    handleAddWord,
    getRelevantWordsForCall,
    activeMicStream: activeMicStreamRef.current,
    audioContext: phoneAudio.getContext(),
  };
}
