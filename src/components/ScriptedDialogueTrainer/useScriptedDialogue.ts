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
  markLessonTabCompleted,
  addWordToPersonalDict,
} from '@/lib/storage';
import { phoneAudio } from '@/lib/phoneAudio';
import { TrainerMode } from './types';

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
  const [turnHistory, setTurnHistory] = useState<Record<number, DialogueEvaluationResult>>({});
  const [showSituationModal, setShowSituationModal] = useState<boolean>(false);

  // Аудиозапись ученика для прослушивания
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const isPlayingUserAudio = Boolean(playingAudioUrl);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const evaluationSafetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 8. Состояние шторки словаря
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState<boolean>(false);
  const [addedWords, setAddedWords] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Список слов для шторки:
  // 1. Полезные выражения и новые слова конкретного диалога (dialogue.usefulWords)
  // 2. Слова текущего урока (lesson.vocabulary)
  const dialogueUsefulWords: Word[] = useMemo(() => {
    return dialogue.usefulWords || [];
  }, [dialogue]);

  const lessonVocabularyWords: Word[] = useMemo(() => {
    return lesson.vocabulary || [];
  }, [lesson.vocabulary]);

  const totalAvailableWordsCount = dialogueUsefulWords.length + lessonVocabularyWords.length;

  const handleAddWordToDict = (w: Word) => {
    addWordToPersonalDict(w);
    setAddedWords((prev) => ({ ...prev, [w.hebrew]: true }));
    if (onWordAdded) onWordAdded(w);
    if (onUpdateProfile) onUpdateProfile({ ...userProfile });
  };

  // Рекогнайзер речи для микрофона и рефы для скролла
  const recognizerRef = useRef<HebrewSpeechRecognizer | null>(null);
  const spokenTextRef = useRef<string>('');
  const evaluatingTurnRef = useRef<number | null>(null);
  const turnsScrollRef = useRef<HTMLDivElement>(null);
  const practiceScrollRef = useRef<HTMLDivElement>(null);
  const evaluationRef = useRef<HTMLDivElement>(null);
  const bottomConsoleRef = useRef<HTMLDivElement>(null);

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
      stopSpeech();
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

  // Озвучивание конкретной реплики
  const handlePlayTurn = (turn: ScriptedDialogueTurn) => {
    stopSpeech();
    const variant = getTurnText(turn);
    const isSpeakerFemale = turn.speaker === userRoleSide ? userGender === 'female' : opponentGender === 'female';
    speakHebrew(variant.hebrew, {
      rate: speechRate,
      pitch: isSpeakerFemale ? 1.1 : 0.95,
    });
  };

  // Режим 1: Непрерывное прослушивание всего диалога («Play All»)
  const handleTogglePlayAll = async () => {
    if (isPlayingAll) {
      isCancelledRef.current = true;
      setIsPlayingAll(false);
      setActiveListeningTurnIndex(null);
      stopSpeech();
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

      await speakHebrew(variant.hebrew, {
        rate: speechRate,
        pitch: isFemale ? 1.1 : 0.95,
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
    stopSpeech();
    isCancelledRef.current = true;
    setIsPlayingAll(false);
    setUserRoleSide(chosenRole);
    setPracticeTurnIndex(0);
    setLastEvaluation(null);
    setTurnHistory({});
    setSpokenText('');
    setShowHint(false);
    setMode('practice');
  };

  // Автоматический шаг в ролевой практике
  useEffect(() => {
    if (mode !== 'practice') return;
    if (practiceTurnIndex >= dialogue.turns.length) {
      // Завершение диалога!
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
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
    setSpokenText('');
    setShowHint(false);

    if (!isUserTurn) {
      // Ход виртуального оппонента — озвучиваем автоматически
      setIsOpponentSpeaking(true);
      const variant = getTurnText(currentTurn);
      const isFemale = opponentGender === 'female';

      const timer = setTimeout(async () => {
        await speakHebrew(variant.hebrew, {
          rate: speechRate,
          pitch: isFemale ? 1.1 : 0.95,
        });
        setIsOpponentSpeaking(false);
        // Передаем ход ученику
        setPracticeTurnIndex((prev) => prev + 1);
      }, 600);

      return () => clearTimeout(timer);
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

    if (!text) {
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
    setSpokenText(text);
    spokenTextRef.current = text;
    evaluateStudentResponse(text, finalAudioUrl);
  };

  const startVoiceRecording = () => {
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
    setUserAudioUrl(null);
    setLastEvaluation(null);
    evaluatingTurnRef.current = null;
    setIsRecording(true);
    setIsEvaluating(false);
    setEvaluatingPhase('idle');

    const recognizer = new HebrewSpeechRecognizer();
    recognizerRef.current = recognizer;

    recognizer.start(
      (transcript) => {
        if (transcript) {
          setSpokenText(transcript);
          spokenTextRef.current = transcript;
        }
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsRecording(false);
        setIsEvaluating(false);
        setEvaluatingPhase('idle');
      },
      (finalTranscript, audioBlob, audioUrl) => {
        const text = (finalTranscript && finalTranscript.trim()) || spokenTextRef.current.trim();
        const finalUrl = audioUrl || userAudioUrl;
        if (finalUrl) {
          setUserAudioUrl(finalUrl);
        }
        if (text) {
          handleFinalSpeechResult(text, audioBlob, finalUrl);
        } else {
          setIsRecording(false);
          setIsEvaluating(false);
          setEvaluatingPhase('idle');
        }
      },
      {
        continuous: true,
        silenceDurationMs: 30000,
        onAudioRecorded: (audioBlob, audioUrl) => {
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

    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }

    if (evaluationSafetyTimerRef.current) {
      clearTimeout(evaluationSafetyTimerRef.current);
    }
    evaluationSafetyTimerRef.current = setTimeout(() => {
      if (evaluatingTurnRef.current !== practiceTurnIndex) {
        const text = spokenTextRef.current.trim();
        if (text) {
          handleFinalSpeechResult(text, null, userAudioUrl);
        } else {
          setIsEvaluating(false);
          setEvaluatingPhase('idle');
        }
      }
    }, 25000);
  };

  // Оценка реплики ученика по смыслу через API
  const evaluateStudentResponse = async (recognizedHebrew: string, audioUrl?: string | null) => {
    const currentTurn = dialogue.turns[practiceTurnIndex];
    if (!currentTurn) return;

    setIsEvaluating(true);
    setEvaluatingPhase('evaluating');
    const variant = getTurnText(currentTurn);

    try {
      const res = await fetch('/api/ai/dialogue/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSpokenHebrew: recognizedHebrew,
          targetIntentRu: currentTurn.intentRu,
          referenceHebrew: variant.hebrew,
          acceptableKeywords: currentTurn.acceptableKeywords,
          sampleVariations: currentTurn.sampleVariations,
          userGender,
          opponentGender,
          lessonNumber: lesson.number,
          level: lesson.level,
        }),
      });

      if (res.ok) {
        const evalResult: DialogueEvaluationResult = await res.json();
        if (audioUrl) {
          evalResult.userAudioUrl = audioUrl;
        }
        setLastEvaluation(evalResult);
        setTurnHistory((prev) => ({ ...prev, [practiceTurnIndex]: evalResult }));

        if (evalResult.isCorrect) {
          try {
            phoneAudio.playSuccessChime();
          } catch {}
        }
      } else {
        const fallbackResult: DialogueEvaluationResult = {
          isCorrect: true,
          score: 85,
          assessment: 'good',
          feedbackRu: 'Хорошо! Смысл передан понятно.',
          betterAlternative: variant.hebrew,
          userSpokenHebrew: recognizedHebrew,
          userAudioUrl: audioUrl || undefined,
        };
        setLastEvaluation(fallbackResult);
        setTurnHistory((prev) => ({ ...prev, [practiceTurnIndex]: fallbackResult }));
      }
    } catch {
      const fallbackResult: DialogueEvaluationResult = {
        isCorrect: true,
        score: 85,
        assessment: 'good',
        feedbackRu: 'Ответ принят.',
        betterAlternative: variant.hebrew,
        userSpokenHebrew: recognizedHebrew,
        userAudioUrl: audioUrl || undefined,
      };
      setLastEvaluation(fallbackResult);
      setTurnHistory((prev) => ({ ...prev, [practiceTurnIndex]: fallbackResult }));
    } finally {
      setIsEvaluating(false);
      setEvaluatingPhase('idle');
      if (evaluationSafetyTimerRef.current) {
        clearTimeout(evaluationSafetyTimerRef.current);
        evaluationSafetyTimerRef.current = null;
      }
    }
  };

  const handleProceedToNextTurn = () => {
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
    setIsPlayingAll(false);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    const updated = markLessonTabCompleted(lesson.id, 'chat');
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    if (onGoToNextTab) {
      onGoToNextTab();
    } else {
      setMode('completed');
    }
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
