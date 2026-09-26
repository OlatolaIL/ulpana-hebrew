import { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Lesson,
  UserProfile,
  ScriptedDialogue,
  ScriptedDialogueTurn,
  GenderVariant,
  DialogueParticipant,
  DialogueEvaluationResult,
  Word,
} from '@/types';
import {
  getScriptedDialogueForLesson,
  getDialogueTurnVariant,
} from '@/data/dialogueLessons';
import {
  speakHebrew,
  stopSpeech,
  HebrewSpeechRecognizer,
} from '@/lib/speech';
import {
  playDialogueTurnAudio,
  stopDialogueAudio,
} from '@/lib/dialogueAudio';
import {
  markLessonTabCompleted,
  addWordToPersonalDict,
  loadUserProfile,
  normalizeHebrewWord,
  saveLocalCallLog,
} from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { phoneAudio } from '@/lib/phoneAudio';
import { TrainerMode } from './types';
import { isDialoguePracticeComplete, requestDialogueEvaluation } from '@/lib/dialoguePractice';
import { isWhisperSilenceHallucination } from '@/lib/speechTranscription';
import { callFlightRecorder } from '@/lib/callDiagnostics';

function createCombinedSignal(parentSignal?: AbortSignal, timeoutMs = 35000): AbortSignal {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error(`Timeout after ${timeoutMs}ms`));
  }, timeoutMs);

  if (parentSignal) {
    if (parentSignal.aborted) {
      clearTimeout(timer);
      controller.abort(parentSignal.reason);
    } else {
      parentSignal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          controller.abort(parentSignal.reason);
        },
        { once: true }
      );
    }
  }

  controller.signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
  return controller.signal;
}

interface UseScriptedDialogueProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onGoToNextTab?: () => void;
}

export function useScriptedDialogue({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onGoToNextTab,
}: UseScriptedDialogueProps) {
  // 1. Получаем структурированный диалог для данного урока
  const dialogue: ScriptedDialogue = useMemo(() => {
    return getScriptedDialogueForLesson(lesson.id);
  }, [lesson.id]);

  // 2. Настройки пола: ученик (userGender) и оппонент (opponentGender)
  const [userGender, setUserGender] = useState<'male' | 'female'>(() => userProfile.gender || 'female');
  const [opponentGender, setOpponentGender] = useState<'male' | 'female'>('male');

  // 3. Выбор роли в режиме практики ('a' или 'b')
  const [userRoleSide, setUserRoleSide] = useState<'a' | 'b'>('b');

  // 4. Текущий режим тренажера
  const [mode, setMode] = useState<TrainerMode>('listen');

  // 5. Настройки отображения
  const [showNikkud, setShowNikkud] = useState<boolean>(userProfile.showNikkud ?? true);
  const [showTranscription, setShowTranscription] = useState<boolean>(userProfile.showTranscription ?? true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(userProfile.speechRate || 0.75);

  // 6. Состояние воспроизведения в режиме «Прослушивание»
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [activeListeningTurnIndex, setActiveListeningTurnIndex] = useState<number | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // 7. Состояние ролевой практики
  const [practiceTurnIndex, setPracticeTurnIndex] = useState<number>(0);
  const [isOpponentSpeaking, setIsOpponentSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluatingPhase, setEvaluatingPhase] = useState<'idle' | 'transcribing' | 'evaluating'>('idle');
  const [spokenText, setSpokenText] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<DialogueEvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [turnHistory, setTurnHistory] = useState<Record<number, DialogueEvaluationResult>>({});
  const [savedTurnAudio, setSavedTurnAudio] = useState<Record<number, string>>({});
  const acceptedTurnsRef = useRef<Record<number, DialogueEvaluationResult>>({});
  const practiceSessionRef = useRef(0);
  const evaluationControllerRef = useRef<AbortController | null>(null);
  const [showSituationModal, setShowSituationModal] = useState<boolean>(false);

  // Аудиозапись ученика для прослушивания
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const isPlayingUserAudio = Boolean(playingAudioUrl);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const evaluationSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioBlobRef = useRef<Blob | null>(null);
  const practiceStartTimeRef = useRef<number>(Date.now());

  // 8. Состояние шторки словаря
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState<boolean>(false);
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (!userProfile.isLoggedIn) return;
    let active = true;
    // Загрузка последней сохраненной попытки аудиозаписей для урока
    fetch(`/api/audio/recording?lessonId=${lesson.id}&stage=chat${userProfile?.id ? `&userId=${userProfile.id}` : ''}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (active && data?.recording?.turnsAudio) {
          setSavedTurnAudio(data.recording.turnsAudio);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [lesson.id, userProfile.id, userProfile.isLoggedIn]);

  // Список слов для шторки:
  // 1. Полезные выражения и новые слова конкретного диалога (dialogue.usefulWords)
  // 2. Слова текущего урока (lesson.vocabulary)
  const dialogueUsefulWords: Word[] = useMemo(() => {
    return dialogue.usefulWords || [];
  }, [dialogue]);

  const lessonVocabularyWords: Word[] = useMemo(() => {
    return lesson.vocabulary || [];
  }, [lesson.vocabulary]);

  const customLessonWords: Word[] = useMemo(() => {
    const seen = new Set<string>();
    (lesson.vocabulary || []).forEach((lv) => {
      const k = normalizeHebrewWord(lv.hebrewPlain || lv.hebrew);
      if (k) seen.add(k);
    });
    (dialogue.usefulWords || []).forEach((dw) => {
      const k = normalizeHebrewWord(dw.hebrewPlain || dw.hebrew);
      if (k) seen.add(k);
    });
    const result: Word[] = [];
    for (const w of userProfile.personalVocabulary || []) {
      if (w.lessonId === lesson.id) {
        const key = normalizeHebrewWord(w.hebrewPlain || w.hebrew);
        if (key && !seen.has(key)) {
          seen.add(key);
          result.push(w);
        }
      }
    }
    return result;
  }, [userProfile.personalVocabulary, lesson.id, lesson.vocabulary, dialogue.usefulWords]);

  const totalAvailableWordsCount =
    dialogueUsefulWords.length + lessonVocabularyWords.length + customLessonWords.length;

  const handleAddWordToDict = (w: Word) => {
    const saved = addWordToPersonalDict(w);
    const clean = normalizeHebrewWord(w.hebrew);
    const plain = normalizeHebrewWord(w.hebrewPlain || w.hebrew);
    setAddedWords((prev) => ({
      ...prev,
      [w.hebrew]: true,
      [clean]: true,
      [plain]: true,
    }));
    const freshProfile = loadUserProfile();
    if (onWordAdded) onWordAdded(saved);
    if (onUpdateProfile) onUpdateProfile(freshProfile);
  };

  // Рекогнайзер речи для микрофона и рефы для скролла
  const recognizerRef = useRef<HebrewSpeechRecognizer | null>(null);
  const spokenTextRef = useRef<string>('');
  const evaluatingTurnRef = useRef<number | null>(null);
  const turnsScrollRef = useRef<HTMLDivElement>(null);
  const practiceScrollRef = useRef<HTMLDivElement>(null);
  const evaluationRef = useRef<HTMLDivElement>(null);
  const bottomConsoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    practiceSessionRef.current += 1;
    evaluationControllerRef.current?.abort();
    recognizerRef.current?.stop();
  }, [mode]);

  // Воспроизведение / пауза записи ученика
  const handleToggleUserAudio = (audioUrlToPlay?: string) => {
    const targetUrl = audioUrlToPlay || userAudioUrl || lastEvaluation?.userAudioUrl;
    if (!targetUrl) return;

    stopSpeech();

    if (userAudioPlayerRef.current) {
      const isSameSrc = userAudioPlayerRef.current.src === targetUrl || userAudioPlayerRef.current.src.endsWith(targetUrl);
      if (!userAudioPlayerRef.current.paused) {
        userAudioPlayerRef.current.pause();
        setPlayingAudioUrl(null);
        if (isSameSrc) {
          return;
        }
      }
    }

    try {
      const audio = new Audio(targetUrl);
      userAudioPlayerRef.current = audio;
      setPlayingAudioUrl(targetUrl);

      audio.onended = () => {
        setPlayingAudioUrl(null);
      };
      audio.onerror = () => {
        setPlayingAudioUrl(null);
      };

      audio.play().catch((err) => {
        console.warn('Playback error:', err);
        setPlayingAudioUrl(null);
      });
    } catch (e) {
      console.warn('Audio init error:', e);
      setPlayingAudioUrl(null);
    }
  };

  // Автоматическая прокрутка к блоку оценки при ее получении
  useEffect(() => {
    if (lastEvaluation) {
      setShowHint(false);
      const timer = setTimeout(() => {
        evaluationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [lastEvaluation]);

  // Автоматическая прокрутка истории реплик вниз при обновлении хода в практике
  useEffect(() => {
    if (mode === 'practice' && practiceScrollRef.current) {
      practiceScrollRef.current.scrollTop = practiceScrollRef.current.scrollHeight;
    }
  }, [practiceTurnIndex, mode]);

  // Остановка звука при размонтировании
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      stopDialogueAudio();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if (evaluationSafetyTimerRef.current) {
        clearTimeout(evaluationSafetyTimerRef.current);
      }
      if (userAudioPlayerRef.current) {
        userAudioPlayerRef.current.pause();
        userAudioPlayerRef.current = null;
      }
    };
  }, []);

  // Персонажи с учетом выбранных полов
  const characterA: DialogueParticipant = dialogue.speakerA[userRoleSide === 'a' ? userGender : opponentGender];
  const characterB: DialogueParticipant = dialogue.speakerB[userRoleSide === 'b' ? userGender : opponentGender];

  // Хелпер получения текста реплики с учетом ролей говорящего и слушающего
  const getTurnText = (turn: ScriptedDialogueTurn): GenderVariant => {
    const isTurnUser = turn.speaker === userRoleSide;
    const speakerGen = isTurnUser ? userGender : opponentGender;
    const listenerGen = isTurnUser ? opponentGender : userGender;
    return getDialogueTurnVariant(turn, speakerGen, listenerGen);
  };

  // Озвучивание конкретной реплики (3-уровневый каскад: Gemini -> Edge Neural -> Web Speech)
  const handlePlayTurn = (turn: ScriptedDialogueTurn) => {
    stopDialogueAudio();
    const variant = getTurnText(turn);
    const isSpeakerFemale = turn.speaker === userRoleSide ? userGender === 'female' : opponentGender === 'female';
    const isTurnUser = turn.speaker === userRoleSide;
    const speakerGender = isSpeakerFemale ? 'female' : 'male';
    const listenerGender = isTurnUser ? opponentGender : userGender;

    playDialogueTurnAudio({
      lessonId: lesson.id,
      turnId: turn.id,
      speakerGender,
      listenerGender,
      text: variant.hebrew,
      speechRate,
    });
  };

  // Режим 1: Непрерывное прослушивание всего диалога («Play All»)
  const handleTogglePlayAll = async () => {
    if (isPlayingAll) {
      isCancelledRef.current = true;
      setIsPlayingAll(false);
      setActiveListeningTurnIndex(null);
      stopDialogueAudio();
      return;
    }

    isCancelledRef.current = false;
    setIsPlayingAll(true);

    for (let i = 0; i < dialogue.turns.length; i++) {
      if (isCancelledRef.current) break;
      const turn = dialogue.turns[i];
      setActiveListeningTurnIndex(i);

      // Прокрутка к активной реплике
      const el = document.getElementById(`listen-turn-${i}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const variant = getTurnText(turn);
      const isFemale = turn.speaker === userRoleSide ? userGender === 'female' : opponentGender === 'female';
      const isTurnUser = turn.speaker === userRoleSide;
      const speakerGender = isFemale ? 'female' : 'male';
      const listenerGender = isTurnUser ? opponentGender : userGender;

      await playDialogueTurnAudio({
        lessonId: lesson.id,
        turnId: turn.id,
        speakerGender,
        listenerGender,
        text: variant.hebrew,
        speechRate,
      });

      // Пауза между репликами
      if (!isCancelledRef.current && i < dialogue.turns.length - 1) {
        await new Promise((r) => setTimeout(r, 900));
      }
    }

    setIsPlayingAll(false);
    setActiveListeningTurnIndex(null);
  };

  // Режим 2: Запуск ролевой практики
  const startRoleplay = (chosenRole: 'a' | 'b') => {
    practiceSessionRef.current += 1;
    evaluationControllerRef.current?.abort();
    acceptedTurnsRef.current = {};
    stopDialogueAudio();
    isCancelledRef.current = true;
    setIsPlayingAll(false);
    setUserRoleSide(chosenRole);
    setPracticeTurnIndex(0);
    setLastEvaluation(null);
    setEvaluationError(null);
    setIsEvaluating(false);
    setIsRecording(false);
    setTurnHistory({});
    setSpokenText('');
    setShowHint(false);
    practiceStartTimeRef.current = Date.now();
    setMode('practice');
  };

  // Автоматический шаг в ролевой практике
  useEffect(() => {
    if (mode !== 'practice') return;
    if (practiceTurnIndex >= dialogue.turns.length) {
      if (!isDialoguePracticeComplete(dialogue.turns, userRoleSide, acceptedTurnsRef.current)) {
        setMode('select_role');
        return;
      }
      // Завершение диалога!
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

      const durationSeconds = Math.max(1, Math.round((Date.now() - practiceStartTimeRef.current) / 1000));
      const opponentSide = userRoleSide === 'a' ? 'speakerB' : 'speakerA';
      const userSide = userRoleSide === 'a' ? 'speakerA' : 'speakerB';
      const opponentInfo = dialogue[opponentSide]?.[opponentGender];
      const opponentName = opponentInfo?.nameRu || lesson.dialogue?.aiRole || 'Собеседник';
      const userCharacterName = dialogue[userSide]?.[userGender]?.nameRu || userProfile.name || 'Ученик';

      const formattedTranscript = dialogue.turns.map((turn, idx) => {
        const variant = getDialogueTurnVariant(turn, userGender, opponentGender);
        const isUser = turn.speaker === userRoleSide;
        const evalResult = acceptedTurnsRef.current[idx];
        return {
          role: isUser ? 'user' : 'assistant',
          speaker: isUser ? 'user' : 'ai',
          speakerName: isUser ? userCharacterName : opponentName,
          hebrew: variant.hebrew,
          translation: variant.translation,
          transcription: variant.transcription,
          userAudioUrl: savedTurnAudio[idx] || undefined,
          spokenText: evalResult?.userSpokenHebrew || undefined,
        };
      });

      const callLogId = `dialogue_${lesson.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // 1. Локальное сохранение (для мгновенного доступа и оффлайн режима)
      try {
        saveLocalCallLog({
          id: callLogId,
          user_id: userProfile.id || userProfile.name || 'local_user',
          user_name: userProfile.name || 'Ученик',
          lesson_id: lesson.id,
          caller_name: opponentName,
          caller_role: `Диалог по ролям (Этап 4)`,
          duration_seconds: durationSeconds,
          messages_count: formattedTranscript.length,
          transcript: formattedTranscript,
          feedback: 'Диалог успешно пройден по ролям',
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Dialogue local call log error:', e);
      }

      // 2. Отправка в базу данных PostgreSQL
      try {
        fetch('/api/calls/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: callLogId,
            lessonId: lesson.id,
            callerName: opponentName,
            callerRole: `Диалог по ролям (Этап 4)`,
            durationSeconds,
            transcript: formattedTranscript,
            feedback: 'Диалог успешно пройден по ролям',
            userName: userProfile.name || 'Ученик',
          }),
        }).catch(() => {});
      } catch {}

      const updated = markLessonTabCompleted(lesson.id, 'chat');
      if (onUpdateProfile) {
        onUpdateProfile(updated);
      }
      setMode('completed');
      return;
    }

    const currentTurn = dialogue.turns[practiceTurnIndex];
    const isUserTurn = currentTurn.speaker === userRoleSide;

    setLastEvaluation(null);
    setEvaluationError(null);
    setSpokenText('');
    setShowHint(false);

    if (!isUserTurn) {
      // Ход виртуального оппонента — озвучиваем автоматически
      setIsOpponentSpeaking(true);
      const variant = getTurnText(currentTurn);
      const isFemale = opponentGender === 'female';

      callFlightRecorder.record('TTS', `Opponent speech started: ${variant.hebrew}`, {
        turnIndex: practiceTurnIndex,
        speaker: currentTurn.speaker,
        text: variant.hebrew,
        rate: speechRate,
      }, 'info');

      let active = true;
      const timer = setTimeout(async () => {
        const isTurnUser = currentTurn.speaker === userRoleSide;
        const speakerGender = isFemale ? 'female' : 'male';
        const listenerGender = isTurnUser ? opponentGender : userGender;

        await playDialogueTurnAudio({
          lessonId: lesson.id,
          turnId: currentTurn.id,
          speakerGender,
          listenerGender,
          text: variant.hebrew,
          speechRate,
        });
        if (!active) return;
        setIsOpponentSpeaking(false);
        // Передаем ход ученику
        setPracticeTurnIndex((prev) => prev + 1);
      }, 600);

      return () => { active = false; clearTimeout(timer); stopDialogueAudio(); };
    }
  }, [mode, practiceTurnIndex, userRoleSide, dialogue.turns, opponentGender, speechRate]);

  // Голосовой ввод ученика
  const handleFinalSpeechResult = (
    recognizedHebrew: string,
    audioBlob?: Blob | null,
    audioUrl?: string | null
  ) => {
    if (evaluationSafetyTimerRef.current) {
      clearTimeout(evaluationSafetyTimerRef.current);
      evaluationSafetyTimerRef.current = null;
    }

    const text = recognizedHebrew.trim();
    const finalAudioUrl = audioUrl || userAudioUrl;
    if (finalAudioUrl) {
      setUserAudioUrl(finalAudioUrl);
    }

    const blob = audioBlob || lastAudioBlobRef.current;
    if (!text && !blob) {
      setIsRecording(false);
      setIsEvaluating(false);
      setEvaluatingPhase('idle');
      return;
    }

    // Защита от повторной или конкурирующей отправки одной и той же реплики
    if (evaluatingTurnRef.current === practiceTurnIndex && isEvaluating && evaluatingPhase === 'evaluating') {
      return;
    }

    evaluatingTurnRef.current = practiceTurnIndex;
    setIsRecording(false);
    setIsEvaluating(true);
    setEvaluatingPhase('evaluating');
    if (text) {
      setSpokenText(text);
      spokenTextRef.current = text;
    }
    evaluateStudentResponse(text, finalAudioUrl, blob);
  };

  const startVoiceRecording = () => {
    if (isEvaluating || mode !== 'practice') return;
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    stopSpeech();
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
    }
    setPlayingAudioUrl(null);
    if (evaluationSafetyTimerRef.current) {
      clearTimeout(evaluationSafetyTimerRef.current);
      evaluationSafetyTimerRef.current = null;
    }

    setSpokenText('');
    spokenTextRef.current = '';
    lastAudioBlobRef.current = null;
    setUserAudioUrl(null);
    setLastEvaluation(null);
    setEvaluationError(null);
    delete acceptedTurnsRef.current[practiceTurnIndex];
    evaluatingTurnRef.current = null;
    setIsRecording(true);
    setIsEvaluating(false);
    setEvaluatingPhase('idle');

    const currentTurn = dialogue.turns[practiceTurnIndex];
    const variant = currentTurn ? getTurnText(currentTurn) : null;

    callFlightRecorder.record('SYSTEM', 'Dialogue voice recording started', {
      turnIndex: practiceTurnIndex,
      userRoleSide,
      expectedHebrew: variant?.hebrew,
      intentRu: currentTurn?.intentRu,
    }, 'info');

    const recognizer = new HebrewSpeechRecognizer();
    recognizerRef.current = recognizer;
    const session = practiceSessionRef.current;
    const isCurrent = () => session === practiceSessionRef.current && recognizerRef.current === recognizer;

    recognizer.start(
      (transcript) => {
        if (!isCurrent()) return;
        if (transcript) {
          setSpokenText(transcript);
          spokenTextRef.current = transcript;
        }
      },
      (error) => {
        if (!isCurrent()) return;
        console.warn('Speech recognition error:', error);
        callFlightRecorder.record('AUDIO', 'Speech recognition error', { error: String(error) }, 'error');
        setIsRecording(false);
        setIsEvaluating(false);
        setEvaluatingPhase('idle');
      },
      (finalTranscript, audioBlob, audioUrl) => {
        if (!isCurrent()) return;
        const blob = audioBlob || lastAudioBlobRef.current;
        const text = (finalTranscript && finalTranscript.trim()) || spokenTextRef.current.trim();
        const finalUrl = audioUrl || userAudioUrl;
        if (finalUrl) {
          setUserAudioUrl(finalUrl);
        }
        if (text || blob) {
          handleFinalSpeechResult(text, blob, finalUrl);
        } else {
          callFlightRecorder.record('AUDIO', 'Voice recording finished with empty speech and blob', {}, 'warn');
          setIsRecording(false);
          setIsEvaluating(false);
          setEvaluatingPhase('idle');
          setEvaluationError('Голос не распознан. Пожалуйста, удерживайте кнопку и произнесите фразу на иврите.');
        }
      },
      {
        continuous: true,
        disableAutoSilenceStop: true, // R-19: Отправка строго по кнопке, без отсечки по паузе
        vocabulary: [
          ...(currentTurn?.acceptableKeywords || []),
          variant?.hebrew || '',
        ].filter(Boolean),
        onAudioRecorded: (audioBlob, audioUrl) => {
          if (!isCurrent()) return;
          if (audioBlob) {
            lastAudioBlobRef.current = audioBlob;
            callFlightRecorder.record('AUDIO', 'Dialogue audio blob recorded', {
              sizeBytes: audioBlob.size,
              mimeType: audioBlob.type,
              hasUrl: Boolean(audioUrl),
            }, 'info');
          }
          if (audioUrl) {
            setUserAudioUrl(audioUrl);
          }
        },
      }
    );
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setIsEvaluating(true);
    setEvaluatingPhase('transcribing');

    callFlightRecorder.record('SYSTEM', 'Dialogue voice recording stopped by user', {
      turnIndex: practiceTurnIndex,
    }, 'info');

    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }

    if (evaluationSafetyTimerRef.current) {
      clearTimeout(evaluationSafetyTimerRef.current);
    }
    evaluationSafetyTimerRef.current = setTimeout(() => {
      callFlightRecorder.record('ERROR', 'Dialogue evaluation safety timeout triggered (>18s)', {
        practiceTurnIndex,
        evaluatingTurn: evaluatingTurnRef.current,
      }, 'error');
      setIsEvaluating(false);
      setEvaluatingPhase('idle');
      setEvaluationError('Время ожидания ответа истекло (18с). Нажмите «Смотритель» для просмотра лога или запишите ответ ещё раз.');
    }, 18000);
  };

  // Оценка реплики ученика по смыслу через API
  const evaluateStudentResponse = async (
    recognizedHebrew: string,
    audioUrl?: string | null,
    audioBlob?: Blob | null
  ) => {
    const currentTurn = dialogue.turns[practiceTurnIndex];
    if (!currentTurn || currentTurn.speaker !== userRoleSide || mode !== 'practice') return;
    const session = practiceSessionRef.current;
    evaluationControllerRef.current?.abort();
    const controller = new AbortController();
    evaluationControllerRef.current = controller;
    const isCurrent = () => session === practiceSessionRef.current && evaluationControllerRef.current === controller;
    setLastEvaluation(null);
    setEvaluationError(null);
    delete acceptedTurnsRef.current[practiceTurnIndex];

    // Фоновая выгрузка аудиозаписи реплики ученика на сервер/в облако (строго 1 последняя попытка)
    if (audioBlob && userProfile.isLoggedIn) {
      try {
        const form = new FormData();
        form.append('file', audioBlob);
        form.append('lessonId', String(lesson.id));
        form.append('stage', 'chat');
        form.append('turnIndex', String(practiceTurnIndex));
        if (userProfile.id) form.append('userId', userProfile.id);

        fetch('/api/audio/upload', {
          method: 'POST',
          body: form,
          signal: controller.signal,
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (isCurrent() && data?.url) {
              setUserAudioUrl(data.url);
              setTurnHistory((prev) => {
                const cur = prev[practiceTurnIndex];
                if (!cur) return prev;
                return {
                  ...prev,
                  [practiceTurnIndex]: { ...cur, userAudioUrl: data.url },
                };
              });
            }
          })
          .catch((err) => console.warn('[ScriptedDialogue] Upload error:', err));
      } catch (err) {
        console.warn('[ScriptedDialogue] Form error:', err);
      }
    }

    setIsEvaluating(true);
    setEvaluatingPhase('evaluating');
    const variant = getTurnText(currentTurn);

    try {
      let finalEvalResult: DialogueEvaluationResult | null = null;
      let textToEvaluate = recognizedHebrew.trim();

      const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

      // R-19: 1. ОСНОВНОЙ ДВИЖОК — Серверный Whisper-large-v3 через /api/ai/transcribe с контекстной подсказкой урока
      if (!textToEvaluate && isOnline && audioBlob && audioBlob.size > 500 && isCurrent()) {
        const tWhisper = Date.now();
        try {
          const form = new FormData();
          const mime = audioBlob.type || 'audio/webm';
          const ext = mime.includes('mp4') ? 'm4a' : mime.includes('aac') ? 'aac' : 'webm';
          form.append('file', audioBlob, `speech.${ext}`);
          const vocabPrompt = [
            ...(currentTurn.acceptableKeywords || []),
            variant.hebrew,
          ].filter(Boolean).slice(0, 20).join(', ').slice(0, 250);
          if (vocabPrompt) {
            form.append('prompt', vocabPrompt);
          }

          callFlightRecorder.record('STT', 'Dialogue Whisper STT request sent', {
            sizeBytes: audioBlob.size,
            mime,
            promptLength: vocabPrompt.length,
          }, 'info');

          const transcribeRes = await fetch('/api/ai/transcribe', {
            method: 'POST',
            body: form,
            signal: createCombinedSignal(controller.signal, 20000),
          });

          const whisperLatencyMs = Date.now() - tWhisper;

          if (transcribeRes.ok && isCurrent()) {
            const data = await transcribeRes.json();
            const whisperText = (data.text || '').trim();
            if (whisperText && !isWhisperSilenceHallucination(whisperText)) {
              callFlightRecorder.record('STT', `Dialogue Whisper STT success (${whisperLatencyMs}ms)`, {
                text: whisperText,
                latencyMs: whisperLatencyMs,
              }, 'success');
              textToEvaluate = whisperText;
              setSpokenText(whisperText);
              spokenTextRef.current = whisperText;
            } else {
              callFlightRecorder.record('STT', `Dialogue Whisper silence hallucination filtered (${whisperLatencyMs}ms)`, {
                rawText: data.text,
                latencyMs: whisperLatencyMs,
              }, 'warn');
            }
          } else {
            let errPreview = '';
            try { errPreview = await transcribeRes.text(); } catch {}
            callFlightRecorder.record('STT', `Dialogue Whisper STT HTTP ${transcribeRes.status} (${whisperLatencyMs}ms)`, {
              status: transcribeRes.status,
              latencyMs: whisperLatencyMs,
              error: errPreview.slice(0, 150),
            }, 'error');
          }
        } catch (transcribeErr: any) {
          const whisperLatencyMs = Date.now() - tWhisper;
          callFlightRecorder.record('STT', `Dialogue Whisper STT exception (${whisperLatencyMs}ms)`, {
            error: String(transcribeErr?.message || transcribeErr),
            latencyMs: whisperLatencyMs,
          }, 'error');
          console.warn('[ScriptedDialogue] Whisper transcribe error, fallback to device speech:', transcribeErr);
        }
      }

      // R-19: 2. РЕЗЕРВНЫЙ ФОЛБЭК — Распознавание на устройстве (Web Speech API) только если офлайн или Whisper не ответил
      if (!textToEvaluate && recognizedHebrew.trim()) {
        textToEvaluate = recognizedHebrew.trim();
        callFlightRecorder.record('STT', 'Fallback to device speech recognition', {
          text: textToEvaluate,
        }, 'info');
      }

      if (textToEvaluate) {
        setSpokenText(textToEvaluate);
        spokenTextRef.current = textToEvaluate;
      }

      if (textToEvaluate && isCurrent()) {
        const tEval = Date.now();
        callFlightRecorder.record('LLM', 'Sending turn to /api/ai/dialogue/evaluate', {
          turnIndex: practiceTurnIndex,
          userSpokenHebrew: textToEvaluate,
          targetIntentRu: currentTurn.intentRu,
          referenceHebrew: variant.hebrew,
        }, 'info');

        finalEvalResult = await requestDialogueEvaluation({
          userSpokenHebrew: textToEvaluate,
          targetIntentRu: currentTurn.intentRu,
          referenceHebrew: variant.hebrew,
          acceptableKeywords: currentTurn.acceptableKeywords,
          sampleVariations: currentTurn.sampleVariations,
          userGender,
          opponentGender,
          lessonNumber: lesson.number,
          level: lesson.level,
        }, createCombinedSignal(controller.signal, 30000));

        const evalLatencyMs = Date.now() - tEval;
        callFlightRecorder.record('LLM', `Dialogue evaluated (${evalLatencyMs}ms)`, {
          score: finalEvalResult.score,
          isCorrect: finalEvalResult.isCorrect,
          assessment: finalEvalResult.assessment,
          feedbackRu: finalEvalResult.feedbackRu,
          latencyMs: evalLatencyMs,
        }, finalEvalResult.isCorrect ? 'success' : 'warn');
      }

      if (isCurrent() && finalEvalResult) {
        if (audioUrl) {
          finalEvalResult.userAudioUrl = audioUrl;
        }
        setLastEvaluation(finalEvalResult);
        setTurnHistory((prev) => ({ ...prev, [practiceTurnIndex]: finalEvalResult! }));

        if (finalEvalResult.isCorrect) {
          try {
            phoneAudio.playSuccessChime();
          } catch {}
        }
      } else if (isCurrent() && !finalEvalResult) {
        callFlightRecorder.record('ERROR', 'No speech recognized for dialogue evaluation', {
          isOnline,
          audioBlobSize: audioBlob?.size,
          deviceSpeech: recognizedHebrew,
        }, 'warn');
        setEvaluationError(
          !isOnline
            ? 'Нет подключения к интернету. Проверьте соединение и повторите запись.'
            : 'Не удалось распознать речь. Попробуйте сказать фразу ещё раз.'
        );
      }
    } catch (err: any) {
      if (isCurrent()) {
        callFlightRecorder.record('ERROR', 'Dialogue evaluation exception', {
          error: String(err?.message || err),
        }, 'error');
        setEvaluationError('Проверка сейчас недоступна. Ответ не оценён. Можно открыть «Смотритель» для просмотра лога или повторить запись.');
      }
    } finally {
      if (isCurrent()) {
      setIsEvaluating(false);
      setEvaluatingPhase('idle');
      if (evaluationSafetyTimerRef.current) {
        clearTimeout(evaluationSafetyTimerRef.current);
        evaluationSafetyTimerRef.current = null;
      }
      }
    }
  };

  const handleProceedToNextTurn = () => {
    if (isEvaluating || !lastEvaluation?.isCorrect || mode !== 'practice') return;
    acceptedTurnsRef.current[practiceTurnIndex] = lastEvaluation;
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
    }
    setPlayingAudioUrl(null);
    setUserAudioUrl(null);
    setLastEvaluation(null);
    setSpokenText('');
    setPracticeTurnIndex((prev) => prev + 1);
  };

  const isFinalTurn = practiceTurnIndex >= dialogue.turns.length - 1;
  const isLastUserTurn = useMemo(() => {
    for (let i = practiceTurnIndex + 1; i < dialogue.turns.length; i++) {
      if (dialogue.turns[i].speaker === userRoleSide) return false;
    }
    return true;
  }, [practiceTurnIndex, dialogue.turns, userRoleSide]);

  const handleCompleteListenStage = () => {
    stopSpeech();
    isCancelledRef.current = true;
    setIsPlayingAll(false);
    onGoToNextTab?.();
  };

  return {
    dialogue,
    userGender,
    setUserGender,
    opponentGender,
    setOpponentGender,
    userRoleSide,
    setUserRoleSide,
    mode,
    setMode,
    showNikkud,
    setShowNikkud,
    showTranscription,
    setShowTranscription,
    showTranslation,
    setShowTranslation,
    speechRate,
    setSpeechRate,
    isPlayingAll,
    activeListeningTurnIndex,
    practiceTurnIndex,
    isOpponentSpeaking,
    isRecording,
    isEvaluating,
    evaluatingPhase,
    spokenText,
    showHint,
    setShowHint,
    lastEvaluation,
    evaluationError,
    retryEvaluation: () => { if (!isEvaluating && spokenText.trim()) void evaluateStudentResponse(spokenText, userAudioUrl); },
    savedTurnAudio,
    turnHistory,
    showSituationModal,
    setShowSituationModal,
    userAudioUrl,
    playingAudioUrl,
    isPlayingUserAudio,
    userAudioPlayerRef,
    isWordsDrawerOpen,
    setIsWordsDrawerOpen,
    addedWords,
    mounted,
    dialogueUsefulWords,
    lessonVocabularyWords,
    customLessonWords,
    totalAvailableWordsCount,
    characterA,
    characterB,
    turnsScrollRef,
    practiceScrollRef,
    evaluationRef,
    bottomConsoleRef,
    isFinalTurn,
    isLastUserTurn,
    getTurnText,
    handlePlayTurn,
    handleTogglePlayAll,
    startRoleplay,
    handleToggleUserAudio,
    handleAddWordToDict,
    startVoiceRecording,
    stopVoiceRecording,
    handleProceedToNextTurn,
    handleCompleteListenStage,
  };
}
