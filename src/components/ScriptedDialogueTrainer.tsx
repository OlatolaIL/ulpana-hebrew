'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Users,
  Eye,
  EyeOff,
  Lightbulb,
  Award,
  RefreshCw,
  FastForward,
  Info,
  X,
  BookOpen,
  Plus,
  Check,
  Square,
} from 'lucide-react';
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
  normalizeHebrewSpeechTranscript,
} from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import {
  markLessonTabCompleted,
  isWordInPersonalDict,
  addWordToPersonalDict,
} from '@/lib/storage';
import { phoneAudio } from '@/lib/phoneAudio';

interface ScriptedDialogueTrainerProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onWordAdded?: (word: Word) => void;
  onGoToNextTab?: () => void;
}

type TrainerMode = 'listen' | 'select_role' | 'practice' | 'completed';

export const ScriptedDialogueTrainer: React.FC<ScriptedDialogueTrainerProps> = ({
  lesson,
  userProfile,
  onUpdateProfile,
  onWordAdded,
  onGoToNextTab,
}) => {
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
  const [spokenText, setSpokenText] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<DialogueEvaluationResult | null>(null);
  const [turnHistory, setTurnHistory] = useState<Record<number, DialogueEvaluationResult>>({});
  const [showSituationModal, setShowSituationModal] = useState<boolean>(false);

  // 8. Состояние шторки словаря (по аналогии с 5 этапом - PhoneCallSimulator)
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

  // -------------------------------------------------------------
  // Режим 1: Непрерывное прослушивание всего диалога («Play All»)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Режим 2: Запуск ролевой практики
  // -------------------------------------------------------------
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
      markLessonTabCompleted(lesson.id, 'chat');
      if (onUpdateProfile) {
        onUpdateProfile({ ...userProfile });
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

  // -------------------------------------------------------------
  // Голосовой ввод ученика (Только микрофон)
  // -------------------------------------------------------------
  const handleFinalSpeechResult = (recognizedHebrew: string) => {
    const text = recognizedHebrew.trim();
    if (!text) {
      setIsRecording(false);
      setIsEvaluating(false);
      return;
    }

    // Защита от повторной или конкурирующей отправки одной и той же реплики
    if (evaluatingTurnRef.current === practiceTurnIndex && isEvaluating) {
      return;
    }

    evaluatingTurnRef.current = practiceTurnIndex;
    setIsRecording(false);
    setSpokenText(text);
    spokenTextRef.current = text;
    evaluateStudentResponse(text);
  };

  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    stopSpeech();
    setSpokenText('');
    spokenTextRef.current = '';
    setLastEvaluation(null);
    evaluatingTurnRef.current = null;
    setIsRecording(true);
    setIsEvaluating(false);

    const recognizer = new HebrewSpeechRecognizer();
    recognizerRef.current = recognizer;

    recognizer.start(
      (transcript) => {
        if (transcript) {
          setSpokenText(transcript);
          spokenTextRef.current = transcript;
        }
        // Запись контролируется учеником: отправка происходит по клику на кнопку «Готово, проверить ответ»
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsRecording(false);
        setIsEvaluating(false);
      },
      (finalTranscript) => {
        // Вызывается после нажатия кнопки стоп учеником и расшифровки полной дорожки через Whisper
        const text = (finalTranscript && finalTranscript.trim()) || spokenTextRef.current.trim();
        if (text) {
          handleFinalSpeechResult(text);
        } else {
          setIsRecording(false);
          setIsEvaluating(false);
        }
      },
      {
        continuous: true, // Постоянный режим прослушивания: паузы ученика не обрывают речь
        silenceDurationMs: 30000, // Страховочный таймаут (30 сек) только если ученик вообще забыл выключить микрофон
      }
    );
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setIsEvaluating(true);

    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }

    // Страховочный таймаут: если рекогнайзер/Whisper не вызвал onEnd в течение 1.5 сек
    setTimeout(() => {
      if (evaluatingTurnRef.current !== practiceTurnIndex) {
        const text = spokenTextRef.current.trim();
        if (text) {
          handleFinalSpeechResult(text);
        } else {
          setIsEvaluating(false);
        }
      }
    }, 1500);
  };

  // -------------------------------------------------------------
  // Оценка реплики ученика по смыслу через API
  // -------------------------------------------------------------
  const evaluateStudentResponse = async (recognizedHebrew: string) => {
    const currentTurn = dialogue.turns[practiceTurnIndex];
    if (!currentTurn) return;

    setIsEvaluating(true);
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
        setLastEvaluation(evalResult);
        setTurnHistory((prev) => ({ ...prev, [practiceTurnIndex]: evalResult }));

        if (evalResult.isCorrect) {
          try {
            phoneAudio.playSuccessChime();
          } catch {}
        }
      } else {
        // Локальная оценка при ошибке сети
        const fallbackResult: DialogueEvaluationResult = {
          isCorrect: true,
          score: 85,
          assessment: 'good',
          feedbackRu: 'Хорошо! Смысл передан понятно.',
          betterAlternative: variant.hebrew,
          userSpokenHebrew: recognizedHebrew,
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
      };
      setLastEvaluation(fallbackResult);
      setTurnHistory((prev) => ({ ...prev, [practiceTurnIndex]: fallbackResult }));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleProceedToNextTurn = () => {
    setLastEvaluation(null);
    setSpokenText('');
    setPracticeTurnIndex((prev) => prev + 1);
  };

  // Рендер карточки слова в шторке подсказок
  const renderWordItem = (word: Word, key: string, isDialogueHighlight?: boolean) => {
    const isAdded =
      addedWords[word.hebrew] || isWordInPersonalDict(word.hebrew, userProfile.personalVocabulary);
    const isCursive = userProfile.fontStyle === 'cursive';

    return (
      <div
        key={key}
        className={`rounded-2xl p-3 shadow-2xs transition space-y-1.5 border ${
          isDialogueHighlight
            ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400'
            : 'bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-600'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              dir="rtl"
              className={`font-hebrew font-bold text-lg text-zinc-900 dark:text-zinc-50 ${
                isCursive ? 'font-cursive text-xl text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {showNikkud ? word.hebrew : stripNikkud(word.hebrew)}
            </span>
            {isDialogueHighlight && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                К диалогу
              </span>
            )}
            {word.gender && (
              <span className="text-[10px] text-zinc-400 font-mono">
                ({word.gender === 'm' ? 'ז' : 'נ'})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => speakHebrew(word.hebrew, { rate: speechRate })}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
              title="Озвучить слово"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={isAdded}
              onClick={() => handleAddWordToDict(word)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                isAdded
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-blue-500 hover:text-blue-600 cursor-pointer shadow-2xs'
              }`}
              title={isAdded ? 'Слово уже в вашем личном словаре' : 'Добавить слово в личный словарь для карточек'}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>В словаре</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>В словарь</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showTranscription && word.transcription && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {word.transcription}
          </div>
        )}

        <div className="text-xs text-zinc-700 dark:text-zinc-300 font-normal">
          {word.translation}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // РЕНДЕР
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800">
      {/* 1. Верхняя панель управления: заголовок, ситуация, полы, скорость */}
      <div className="shrink-0 p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        {/* Заголовок диалога и кнопка информации о ситуации */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            💬
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                {dialogue.titleRu}
              </h3>
              <button
                type="button"
                onClick={() => setShowSituationModal(!showSituationModal)}
                className={`p-1 rounded-lg transition shrink-0 ${
                  showSituationModal
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : 'text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title={showSituationModal ? 'Скрыть контекст ситуации' : 'Показать контекст ситуации'}
              >
                <Info className="w-4 h-4" />
              </button>

              {/* Кнопка открытия шторки словаря */}
              {totalAvailableWordsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsWordsDrawerOpen(true)}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                  title="Открыть шторку полезных слов и выражений"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Слова</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                    {totalAvailableWordsCount}
                  </span>
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate font-hebrew" dir="rtl">
              {dialogue.titleHe}
            </p>
          </div>
        </div>

        {/* Управление и переключатели */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Быстрый запуск прослушивания в шапке */}
          {mode === 'listen' && (
            <button
              type="button"
              onClick={handleTogglePlayAll}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition ${
                isPlayingAll
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={isPlayingAll ? 'Приостановить' : 'Слушать все реплики'}
            >
              {isPlayingAll ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Слушать всё</span>
                </>
              )}
            </button>
          )}

          {/* Пол собеседника */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs">
            <span className="text-[11px] text-zinc-400 px-1.5 hidden sm:inline">Собеседник:</span>
            <button
              type="button"
              onClick={() => setOpponentGender('male')}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                opponentGender === 'male'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Собеседник-мужчина"
            >
              <span>👨</span>
              <span className="hidden md:inline">Мужчина</span>
            </button>
            <button
              type="button"
              onClick={() => setOpponentGender('female')}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                opponentGender === 'female'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Собеседница-женщина"
            >
              <span>👩</span>
              <span className="hidden md:inline">Женщина</span>
            </button>
          </div>

          {/* Пол ученика */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs">
            <span className="text-[11px] text-zinc-400 px-1.5 hidden sm:inline">Вы:</span>
            <button
              type="button"
              onClick={() => {
                setUserGender('male');
                if (onUpdateProfile) onUpdateProfile({ ...userProfile, gender: 'male' });
              }}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                userGender === 'male'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Вы говорите за мужчину"
            >
              <span>זָכָר</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserGender('female');
                if (onUpdateProfile) onUpdateProfile({ ...userProfile, gender: 'female' });
              }}
              className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                userGender === 'female'
                  ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Вы говорите за женщину"
            >
              <span>נְקֵבָה</span>
            </button>
          </div>

          {/* Скорость озвучки */}
          <button
            type="button"
            onClick={() => {
              const nextRate = speechRate === 0.7 ? 0.85 : speechRate === 0.85 ? 1.0 : 0.7;
              setSpeechRate(nextRate);
            }}
            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition"
            title="Скорость речи"
          >
            {speechRate}x
          </button>
        </div>
      </div>

      {/* Баннер ситуации (показывается только по нажатию на ℹ️ и не занимает место постоянно) */}
      {showSituationModal && (
        <div className="p-2.5 px-3 bg-blue-50/90 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-800/70 flex items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold shrink-0">Ситуация:</span>
            <span className="truncate sm:whitespace-normal">{dialogue.situationRu}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSituationModal(false)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 p-0.5 rounded shrink-0 cursor-pointer"
            title="Скрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Основное тело: переключение между режимами */}

      {/* РЕЖИМ 1: ПРОСЛУШИВАНИЕ ДИАЛОГА (LISTEN) */}
      {mode === 'listen' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Список реплик диалога в стиле чата — занимает 100% высоты без лишних баннеров */}

          {/* Список реплик диалога в стиле чата */}
          <div
            ref={turnsScrollRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5"
          >
            {dialogue.turns.map((turn, idx) => {
              const isSpeakerA = turn.speaker === 'a';
              const variant = getTurnText(turn);
              const isTurnActive = isPlayingAll && activeListeningTurnIndex === idx;
              const character = isSpeakerA ? characterA : characterB;

              return (
                <div
                  key={turn.id}
                  id={`listen-turn-${idx}`}
                  className={`flex gap-2.5 sm:gap-3 transition-all duration-300 ${
                    isSpeakerA ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Аватар персонажа */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs ${
                      isSpeakerA
                        ? 'bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900'
                        : 'bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900'
                    }`}
                    title={`${character.nameRu} (${character.roleRu})`}
                  >
                    {character.avatarEmoji}
                  </div>

                  {/* Пузырь сообщения */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 sm:p-3.5 transition-all shadow-xs ${
                      isTurnActive
                        ? 'ring-2 ring-blue-500 shadow-md scale-[1.01] bg-blue-50/90 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700'
                        : isSpeakerA
                        ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                        : 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60'
                    }`}
                  >
                    {/* Имя и роль спикера */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {character.nameRu}{' '}
                        <span className="text-[11px] font-normal text-zinc-400">
                          ({character.roleRu})
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlayTurn(turn)}
                        className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-600 transition"
                        title="Прослушать фразу"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Текст на иврите */}
                    <div
                      dir="rtl"
                      className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed mb-1"
                    >
                      {showNikkud ? variant.hebrew : stripNikkud(variant.hebrew)}
                    </div>

                    {/* Транскрипция */}
                    {showTranscription && (
                      <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium tracking-wide mb-1">
                        {variant.transcription}
                      </div>
                    )}

                    {/* Перевод */}
                    {showTranslation && (
                      <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                        {variant.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Нижняя панель действий: переключатели отображения, словарь и кнопка перехода к роли */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-500">

              <button
                type="button"
                onClick={() => setShowTranscription(!showTranscription)}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                  showTranscription
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                }`}
              >
                Транскрипция
              </button>
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                  showTranslation
                    ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                }`}
              >
                Перевод
              </button>

              {totalAvailableWordsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsWordsDrawerOpen(true)}
                  className="px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  title="Шпаргалка слов к диалогу"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Слова ({totalAvailableWordsCount})</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                setIsPlayingAll(false);
                setMode('select_role');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>Выбрать роль и ответить голосом</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* РЕЖИМ 2: ВЫБОР РОЛИ (SELECT ROLE) */}
      {mode === 'select_role' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Users className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                За какую сторону вы хотите сыграть?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Вы будете отвечать ГОЛОСОМ через микрофон. ИИ оценит смысл ваших ответов.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {/* Карточка Сторона А */}
              <button
                type="button"
                onClick={() => startRoleplay('a')}
                className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-zinc-900 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer group shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2">{characterA.avatarEmoji}</div>
                  <div className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {characterA.nameRu}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    {characterA.roleRu}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>Играть за роль А</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Карточка Сторона Б */}
              <button
                type="button"
                onClick={() => startRoleplay('b')}
                className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-zinc-900 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all cursor-pointer group shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2">{characterB.avatarEmoji}</div>
                  <div className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {characterB.nameRu}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    {characterB.roleRu}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Играть за роль Б</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setMode('listen')}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline cursor-pointer"
              >
                ← Вернуться к прослушиванию диалога
              </button>
            </div>
          </div>
        </div>
      )}

      {/* РЕЖИМ 3: РОЛЕВАЯ ПРАКТИКА С ГОЛОСОМ (PRACTICE) */}
      {mode === 'practice' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Прогресс-бар ходов диалога */}
          <div className="px-3 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Реплика {practiceTurnIndex + 1} из {dialogue.turns.length}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-medium">
                Вы: {userRoleSide === 'a' ? characterA.nameRu : characterB.nameRu}
              </span>
            </div>

            <div className="w-24 sm:w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((practiceTurnIndex + 1) / dialogue.turns.length) * 100}%` }}
              />
            </div>
          </div>

          {/* История реплик до текущего момента */}
          <div
            ref={practiceScrollRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
          >
            {dialogue.turns.slice(0, practiceTurnIndex + 1).map((turn, idx) => {
              const isSpeakerUser = turn.speaker === userRoleSide;
              const variant = getTurnText(turn);
              const character = turn.speaker === 'a' ? characterA : characterB;
              const isCurrentTurn = idx === practiceTurnIndex;

              return (
                <div
                  key={turn.id}
                  className={`flex gap-2.5 sm:gap-3 transition-all ${
                    isSpeakerUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs ${
                      isSpeakerUser
                        ? 'bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900'
                        : 'bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900'
                    }`}
                  >
                    {character.avatarEmoji}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 shadow-xs ${
                      isSpeakerUser
                        ? 'bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {character.nameRu} {isSpeakerUser && ' (Вы)'}
                      </span>
                      {!isSpeakerUser && (
                        <button
                          type="button"
                          onClick={() => handlePlayTurn(turn)}
                          className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-600 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Если говорит собеседник или реплика ученика уже пройдена */}
                    {(!isSpeakerUser || idx < practiceTurnIndex || lastEvaluation?.isCorrect) ? (
                      <>
                        <div
                          dir="rtl"
                          className="text-base sm:text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed mb-0.5"
                        >
                          {showNikkud ? variant.hebrew : stripNikkud(variant.hebrew)}
                        </div>
                        {showTranscription && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                            {variant.transcription}
                          </div>
                        )}
                        <div className="text-xs text-zinc-600 dark:text-zinc-300">
                          {variant.translation}
                        </div>
                      </>
                    ) : (
                      // Текущий ход ученика в ожидании озвучки
                      <div className="space-y-1.5 py-1">
                        <div className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <span>Ваша очередь:</span>
                          <span className="font-normal text-zinc-600 dark:text-zinc-300">{turn.intentRu}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Интерактивная нижняя консоль для ответа ученика ГОЛОСОМ */}
          {dialogue.turns[practiceTurnIndex] && dialogue.turns[practiceTurnIndex].speaker === userRoleSide && (
            <div
              ref={bottomConsoleRef}
              className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto shrink-0 shadow-lg"
            >
              {/* Коммуникативная подсказка */}
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="truncate sm:whitespace-normal">
                    Ваша задача: <strong>{dialogue.turns[practiceTurnIndex].intentRu}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {totalAvailableWordsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsWordsDrawerOpen(true)}
                      className="text-xs text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 font-medium flex items-center gap-1 cursor-pointer transition"
                      title="Открыть шторку со всеми словами к диалогу"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Слова ({totalAvailableWordsCount})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Скрыть подсказку' : 'Подсказка'}</span>
                  </button>
                </div>
              </div>

              {/* Карточка подсказки (если открыта) */}
              {showHint && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Пример фразы:</span>
                    <button
                      type="button"
                      onClick={() => handlePlayTurn(dialogue.turns[practiceTurnIndex])}
                      className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded"
                      title="Прослушать подсказку"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div dir="rtl" className="text-sm font-bold font-hebrew text-zinc-900 dark:text-zinc-100">
                    {getTurnText(dialogue.turns[practiceTurnIndex]).hebrew}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    {getTurnText(dialogue.turns[practiceTurnIndex]).transcription}
                  </div>
                </div>
              )}

              {/* Поле того, что произнес ученик (показывается во время распознавания) */}
              {spokenText && !lastEvaluation && (
                <div className="p-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 space-y-1.5 animate-fadeIn shadow-2xs overflow-hidden">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>Распознанная речь:</span>
                  </span>
                  <div className="flex items-start gap-1 text-lg sm:text-xl font-extrabold font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed min-w-0">
                    <span className="text-blue-400 select-none shrink-0">«</span>
                    <bdi dir="rtl" className="break-words whitespace-pre-wrap text-right flex-1 min-w-0">
                      {spokenText}
                    </bdi>
                    <span className="text-blue-400 select-none shrink-0">»</span>
                  </div>
                </div>
              )}

              {/* Результат семантической и фонетической проверки ИИ */}
              {lastEvaluation && (
                <div
                  ref={evaluationRef}
                  className={`p-3.5 sm:p-4 rounded-2xl space-y-3 transition-all animate-fadeIn ${
                    lastEvaluation.isCorrect
                      ? 'bg-emerald-50/95 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-50'
                      : 'bg-amber-50/95 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-50'
                  }`}
                >
                  {/* Шапка оценки: Статус + Процент чёткости */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black flex items-center gap-2 text-base sm:text-lg">
                        {lastEvaluation.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>{lastEvaluation.assessment === 'perfect' ? '🎉 Отлично!' : '👍 Хорошо, вас поняли!'}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>Попробуйте ещё раз</span>
                          </>
                        )}
                      </span>

                      {/* Индикатор четкости произношения в % */}
                      {typeof lastEvaluation.pronunciationScore === 'number' && (
                        <span className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5 shadow-2xs shrink-0">
                          <span>🎙️ Произношение:</span>
                          <span className="text-sm sm:text-base font-extrabold">{lastEvaluation.pronunciationScore}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1. Как ИИ распознал сказанную фразу */}
                  {(lastEvaluation.userSpokenHebrew || spokenText) && (
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white/95 dark:bg-black/40 border border-black/10 dark:border-white/10 shadow-2xs space-y-1.5 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🎯</span>
                          <span>ИИ распознал вашу фразу:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => speakHebrew(lastEvaluation.userSpokenHebrew || spokenText, { rate: speechRate })}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                          title="Прослушать как это прозвучало"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-start gap-1 text-lg sm:text-xl font-black font-hebrew text-zinc-900 dark:text-zinc-50 leading-relaxed min-w-0">
                        <span className="text-zinc-400 select-none shrink-0">«</span>
                        <bdi dir="rtl" className="break-words whitespace-pre-wrap text-right flex-1 min-w-0">
                          {lastEvaluation.userSpokenHebrew || spokenText}
                        </bdi>
                        <span className="text-zinc-400 select-none shrink-0">»</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Оценка смысла (крупный читаемый шрифт) */}
                  <div className="text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-100 font-medium px-0.5">
                    {lastEvaluation.feedbackRu}
                  </div>

                  {/* 3. Рекомендация по произношению (крупный шрифт и детальные звуки) */}
                  {lastEvaluation.pronunciationFeedbackRu && (
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white/95 dark:bg-black/40 border border-black/10 dark:border-white/10 space-y-1.5 shadow-2xs">
                      <div className="font-bold flex items-center gap-2 text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                        <span className="text-base">🗣️</span>
                        <span>Рекомендация по произношению:</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed font-normal text-zinc-700 dark:text-zinc-200">
                        {lastEvaluation.pronunciationFeedbackRu}
                      </p>
                    </div>
                  )}

                  {/* 4. Как лучше сказать (эталон) */}
                  {lastEvaluation.betterAlternative && (
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-black/30 border border-black/10 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-0.5">
                          Как лучше сказать:
                        </span>
                        <span dir="rtl" className="font-hebrew font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
                          {lastEvaluation.betterAlternative}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakHebrew(lastEvaluation.betterAlternative!, { rate: speechRate })}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                        title="Прослушать эталонную фразу"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Кнопки управления ответом */}
              {lastEvaluation?.isCorrect ? (
                /* Если ответ верный — заметная зеленая кнопка перехода к следующей реплике + кнопка повторить */
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleProceedToNextTurn}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <span>Следующая реплика</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    disabled={isEvaluating}
                    className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Сказать ещё раз</span>
                  </button>
                </div>
              ) : lastEvaluation && !lastEvaluation.isCorrect ? (
                /* Если ответ не подошел — кнопка повторить попытку */
                <div className="pt-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    disabled={isEvaluating}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-white animate-pulse" />
                        <span>Готово, проверить ответ</span>
                      </>
                    ) : isEvaluating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>ИИ проверяет смысл...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Попробовать снова (голос)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Первоначальное состояние — кнопка записи голоса */
                <div className="pt-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    disabled={isEvaluating}
                    className={`relative w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-900'
                        : isEvaluating
                        ? 'bg-zinc-400 text-white cursor-wait'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-5 h-5 fill-white animate-pulse" />
                        <span>Готово, проверить ответ</span>
                      </>
                    ) : isEvaluating ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span>ИИ проверяет смысл ответа...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Нажмите и говорите на иврите</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Индикатор речи оппонента */}
          {isOpponentSpeaking && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 shrink-0">
              <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>{userRoleSide === 'a' ? characterB.nameRu : characterA.nameRu} говорит...</span>
            </div>
          )}
        </div>
      )}

      {/* РЕЖИМ 4: ИТОГИ ДИАЛОГА И СМЕНА РОЛЕЙ (COMPLETED) */}
      {mode === 'completed' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-4 overflow-y-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-3xl mx-auto shadow-md">
            🏆
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              Диалог успешно пройден!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Вы успешно провели разговор на иврите за роль{' '}
              <strong>{userRoleSide === 'a' ? characterA.nameRu : characterB.nameRu}</strong>.
            </p>

            {(() => {
              const scores = Object.values(turnHistory)
                .map((t) => t.pronunciationScore)
                .filter((s): s is number => typeof s === 'number');
              if (scores.length === 0) return null;
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs">
                  <span>🎙️ Чёткость произношения в диалоге:</span>
                  <span className="text-sm">{avg}%</span>
                </div>
              );
            })()}
          </div>

          {/* Кнопка смены роли (Сыграть за другую сторону) */}
          <div className="max-w-sm w-full space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                const otherSide = userRoleSide === 'a' ? 'b' : 'a';
                startRoleplay(otherSide);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>
                Сыграть за другую сторону ({userRoleSide === 'a' ? characterB.nameRu : characterA.nameRu})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('listen')}
              className="w-full py-2.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
            >
              Вернуться к прослушиванию диалога
            </button>

            {onGoToNextTab && (
              <button
                type="button"
                onClick={onGoToNextTab}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 transition cursor-pointer"
              >
                Перейти к следующему этапу (Звонок) →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. БОКОВОЙ ЯРЛЫЧОК ШТОРКИ (Floating Drawer Tab справа) - как на 5 этапе */}
      {totalAvailableWordsCount > 0 && (
        <button
          type="button"
          onClick={() => setIsWordsDrawerOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl rounded-l-2xl py-3 px-1.5 sm:px-2 flex flex-col items-center gap-1.5 cursor-pointer border-y border-l border-blue-400/60 transition-all group font-hebrew"
          title={userProfile.ulpanMode ? 'מִילִּים שֶׁיַּעַזְרוּ בַּשִּׂיחָה' : 'Полезные слова и подсказки к диалогу'}
        >
          <BookOpen className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase [writing-mode:vertical-rl] tracking-widest text-blue-100">
            {userProfile.ulpanMode ? 'מִילִּים' : 'СЛОВА'}
          </span>
          <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-black flex items-center justify-center shadow-xs">
            {totalAvailableWordsCount}
          </span>
        </button>
      )}

      {/* 6. БОКОВАЯ ШТОРКА (SIDE DRAWER СПРАВА) ЧЕРЕЗ CREATEPORTAL */}
      {mounted && isWordsDrawerOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
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
                    {userProfile.ulpanMode ? 'מִילִּים לַשִּׂיחָה' : 'Словарь к диалогу'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {userProfile.ulpanMode
                      ? 'מִילִּים וּבִיטּוּיִים שֶׁיַּעַזְרוּ בַּדִּיאָלוֹג'
                      : `Полезные выражения и слова урока ${lesson.number}`}
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

            {/* Контент шторки: список фраз и слов с независимым скроллом */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {/* Секция 1: Новые и полезные выражения диалога */}
              {dialogueUsefulWords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Новые и ключевые выражения:</span>
                    </p>
                    <span className="text-[10px] text-zinc-400">{dialogueUsefulWords.length} шт.</span>
                  </div>

                  <div className="space-y-2">
                    {dialogueUsefulWords.map((word, idx) =>
                      renderWordItem(word, `dial-w-${idx}`, true)
                    )}
                  </div>
                </div>
              )}

              {/* Секция 2: Слова урока */}
              {lessonVocabularyWords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📚</span>
                      <span>Слова урока {lesson.number}:</span>
                    </p>
                    <span className="text-[10px] text-zinc-400">{lessonVocabularyWords.length} шт.</span>
                  </div>

                  <div className="space-y-2">
                    {lessonVocabularyWords.map((word, idx) =>
                      renderWordItem(word, `lesson-w-${idx}`, false)
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
