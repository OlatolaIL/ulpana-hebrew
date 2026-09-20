import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Timer,
  BookOpen,
  Eye,
  GitBranch,
  Check,
} from 'lucide-react';
import { Word, UserProfile, RootRelatedWord } from '@/types';
import { stripNikkud, tokenizeText, cleanHebrewToken, TextToken } from '@/lib/transcription';
import { speakHebrew, speakRussian, stopSpeech } from '@/lib/speech';
import {
  getVerbDrillSentences,
  VerbDrillSentence,
  VerbTense,
} from '@/data/verbSentencesData';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { WordLookupModal } from '@/components/WordLookupModal';
import { addWordToPersonalDict, isWordInPersonalDict, loadUserProfile } from '@/lib/storage';

interface ComplexVerbModeProps {
  currentWord: Word;
  userProfile: UserProfile;
  currentIndex: number;
  wordsLength?: number;
  onPrevWord: () => void;
  onAdvanceNext: () => void;
  onSpeakHebrew: (text: string, options?: { rate?: number }) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

type ComplexPhase = 'listening_he' | 'pause' | 'listening_confirm' | 'revealed';

export const ComplexVerbMode: React.FC<ComplexVerbModeProps> = ({
  currentWord,
  userProfile,
  currentIndex,
  wordsLength,
  onPrevWord,
  onAdvanceNext,
  onSpeakHebrew,
  onUpdateProfile,
}) => {
  // Настройки отображения из профиля (Инвариант R-17)
  const isCursive = userProfile.fontStyle === 'cursive';
  const showNikkud = userProfile.showNikkud !== false;
  const showTranscription = userProfile.showTranscription !== false;
  const speechRate = userProfile.speechRate || 0.7;

  // Извлекаем проверенные предложения для глагола из мастер-базы (Инвариант R-18, V-01..V-04)
  const drillSentences = useMemo(() => {
    const raw = currentWord.hebrewPlain || currentWord.hebrew;
    const list = getVerbDrillSentences(raw);
    if (list.length > 0) return list;

    // Резервный фолбэк для глаголов, еще не добавленных в базовую матрицу
    const fallback: VerbDrillSentence = {
      id: `fallback_${currentWord.id}`,
      verbInfinitive: currentWord.hebrew,
      verbForm: currentWord.hebrew,
      tense: 'present',
      tenseRu: 'настоящее',
      prepositionPlain: '',
      prepositionVocalized: '',
      sentenceHe: currentWord.hebrew,
      sentenceTranscription: currentWord.transcription || '',
      sentenceRu: currentWord.translation,
      drillAudioRu: `${currentWord.translation}. Глагол: ${currentWord.translation}.`,
      minLesson: 1,
      lessonTheme: 'Словарь',
    };
    return [fallback];
  }, [currentWord]);

  // Данные спряжений и семьи корня из оффлайн-базы (Инвариант R-01, R-02)
  const conjugation = useMemo(() => {
    const raw = currentWord.hebrewPlain || currentWord.hebrew;
    return findOfflineVerbConjugation(raw);
  }, [currentWord]);

  const rootFamily: RootRelatedWord[] = useMemo(() => {
    return conjugation?.rootFamily || [];
  }, [conjugation]);

  const rootLetters = conjugation?.root || currentWord.root;

  // Выбранное время (настоящее / прошедшее)
  const [selectedTense, setSelectedTense] = useState<VerbTense>('present');

  // Активная фраза в зависимости от выбранного времени
  const activeSentence = useMemo(() => {
    const match = drillSentences.find((s) => s.tense === selectedTense);
    return match || drillSentences[0];
  }, [drillSentences, selectedTense]);

  // Инфинитив на иврите и его русский перевод
  const verbInfinitiveHe = activeSentence.verbInfinitive || currentWord.hebrew;
  const verbInfinitiveRu =
    currentWord.translation || conjugation?.infinitive?.translation || '';

  // Длительность активной паузы: 3, 4 или 5 секунд (по умолчанию 4)
  const [pauseDurationSec, setPauseDurationSec] = useState<number>(4);
  const [phase, setPhase] = useState<ComplexPhase>('listening_he');
  const [countdown, setCountdown] = useState<number>(4);

  // Режим автовоспроизведения (Auto-play / Hands-free)
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);

  // Состояние для интерактивного разбора неизвестных слов предложения (WordLookupModal)
  const [selectedLookupWord, setSelectedLookupWord] = useState<string | null>(null);
  const [lookupContext, setLookupContext] = useState<string | undefined>(undefined);
  const [lookupSentenceTranslation, setLookupSentenceTranslation] = useState<string | undefined>(undefined);
  const [lookupSentenceTranscription, setLookupSentenceTranscription] = useState<string | undefined>(undefined);

  // Ссылки для таймеров и защита от гонок вызовов
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playCycleIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Очистка при размонтировании
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      stopSpeech();
    };
  }, []);

  // Запуск таймера автоперехода к следующему глаголу
  const triggerAutoAdvance = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    let seconds = 3;
    setAutoCountdown(seconds);

    autoTimerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        return;
      }
      seconds -= 1;
      if (seconds <= 0) {
        if (autoTimerRef.current) {
          clearInterval(autoTimerRef.current);
          autoTimerRef.current = null;
        }
        setAutoCountdown(null);
        onAdvanceNext();
      } else {
        setAutoCountdown(seconds);
      }
    }, 1000);
  };

  // Последовательность подтверждения:
  // «после фразы на иврите - перевод на русский фразы - потом инфинитив иврит и перевод его на русский»
  const runConfirmationSequence = (
    targetSentence: VerbDrillSentence,
    cycleId: number
  ) => {
    setPhase('listening_confirm');

    // Шаг 3.1: Перевод фразы на русский язык
    speakRussian(targetSentence.sentenceRu, { rate: 0.95 }).then(() => {
      if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;

      // Шаг 3.2: Инфинитив на иврите
      const infHe = targetSentence.verbInfinitive || currentWord.hebrew;
      speakHebrew(infHe, { rate: speechRate }).then(() => {
        if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;

        // Шаг 3.3: Перевод инфинитива на русский язык
        const infRu =
          currentWord.translation || conjugation?.infinitive?.translation || '';
        speakRussian(infRu, { rate: 0.95 }).then(() => {
          if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;

          // Шаг 4: Разбор завершен, карточка полностью открыта
          setPhase('revealed');

          // Если включен режим автовоспроизведения — запускаем обратный отсчет перехода
          if (autoAdvance) {
            triggerAutoAdvance();
          }
        });
      });
    });
  };

  // Основной цикл активной слуховой паузы
  const startDrillCycle = (targetSentence: VerbDrillSentence = activeSentence) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setAutoCountdown(null);
    stopSpeech();

    playCycleIdRef.current += 1;
    const currentCycleId = playCycleIdRef.current;

    // Шаг 1: Воспроизведение фразы на иврите
    setPhase('listening_he');
    setCountdown(pauseDurationSec);

    speakHebrew(targetSentence.sentenceHe, { rate: speechRate }).then(() => {
      if (!isMountedRef.current || playCycleIdRef.current !== currentCycleId) return;

      // Шаг 2: Активная пауза студента (3–5 секунд)
      setPhase('pause');
      let remaining = pauseDurationSec;
      setCountdown(remaining);

      timerRef.current = setInterval(() => {
        if (!isMountedRef.current || playCycleIdRef.current !== currentCycleId) {
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        remaining -= 1;
        setCountdown(remaining);

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          runConfirmationSequence(targetSentence, currentCycleId);
        }
      }, 1000);
    });
  };

  // Перезапуск цикла при смене карточки или смене времени
  useEffect(() => {
    startDrillCycle(activeSentence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, selectedTense]);

  // Немедленное открытие карточки
  const handleRevealImmediately = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopSpeech();
    playCycleIdRef.current += 1;
    runConfirmationSequence(activeSentence, playCycleIdRef.current);
  };

  // Повтор фразы на иврите
  const handleReplaySentenceHebrew = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    onSpeakHebrew(activeSentence.sentenceHe, { rate: speechRate });
  };

  // Повтор инфинитива на иврите
  const handleReplayInfinitiveHebrew = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    onSpeakHebrew(verbInfinitiveHe, { rate: speechRate });
  };

  // Повтор русского перевода фразы и инфинитива
  const handleReplayRussian = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    speakRussian(`${activeSentence.sentenceRu}. Инфинитив: ${verbInfinitiveRu}.`, {
      rate: 0.95,
    });
  };

  // Клик по слову предложения для открытия разбора и добавления в личный словарь
  const handleWordClick = (token: TextToken) => {
    if (!token.isHebrew || !token.cleanText) return;

    // Приостанавливаем автопереход, чтобы дать студенту изучить слово
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setAutoCountdown(null);
    stopSpeech();

    const vocalizedClean = cleanHebrewToken(token.text);
    setSelectedLookupWord(vocalizedClean || token.cleanText || token.text);
    setLookupContext(activeSentence.sentenceHe);
    setLookupSentenceTranslation(activeSentence.sentenceRu);
    setLookupSentenceTranscription(activeSentence.sentenceTranscription);
  };

  // Клик по однокоренному слову из семьи корня
  const handleRootFamilyWordClick = (rw: RootRelatedWord) => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    setAutoCountdown(null);
    stopSpeech();

    setSelectedLookupWord(rw.hebrew || rw.hebrewPlain || stripNikkud(rw.hebrew));
  };

  // Озвучка отдельного слова из семьи корня
  const handleRootFamilySpeak = (e: React.MouseEvent, hebrew: string) => {
    e.stopPropagation();
    stopSpeech();
    onSpeakHebrew(hebrew, { rate: speechRate });
  };

  // Токенизируем фразу на иврите для создания интерактивных слов
  const sentenceTokens = useMemo(() => {
    return tokenizeText(activeSentence.sentenceHe);
  }, [activeSentence.sentenceHe]);

  const isRevealed = phase === 'listening_confirm' || phase === 'revealed';

  return (
    <div className="space-y-4">
      {/* Карточка слухового тренажёра */}
      <div className="min-h-[360px] sm:min-h-[380px] bg-gradient-to-b from-white via-white to-amber-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
        {/* Верхняя строка статуса и настроек тренажера */}
        <div className="w-full flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Слуховой комплекс</span>
            </span>

            {/* Переключатель режима Автовоспроизведения (Auto-play / Hands-free) */}
            <button
              type="button"
              onClick={() => {
                const next = !autoAdvance;
                setAutoAdvance(next);
                if (!next) {
                  if (autoTimerRef.current) {
                    clearInterval(autoTimerRef.current);
                    autoTimerRef.current = null;
                  }
                  setAutoCountdown(null);
                } else if (phase === 'revealed') {
                  triggerAutoAdvance();
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                autoAdvance
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30 shadow-md ring-2 ring-emerald-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              title={
                autoAdvance
                  ? 'Автовоспроизведение включено (нажмите для остановки)'
                  : 'Включить автовоспроизведение (Hands-Free)'
              }
            >
              {autoAdvance ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                  <Pause className="w-3 h-3" />
                  <span>Авто: ВКЛ</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Авто: ВЫКЛ</span>
                </>
              )}
            </button>

            {/* Выбор длительности активной паузы */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-full border border-zinc-200/80 dark:border-zinc-700/80">
              <Timer className="w-3 h-3 text-zinc-400 ml-1.5 shrink-0" />
              {[3, 4, 5].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setPauseDurationSec(sec)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    pauseDurationSec === sec
                      ? 'bg-white dark:bg-zinc-700 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                  title={`Пауза на размышление: ${sec} секунды`}
                >
                  {sec}с
                </button>
              ))}
            </div>
          </div>

          {/* Переключатель времени глагола (если доступны разные времена) */}
          {drillSentences.length > 1 && (
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
              {drillSentences.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedTense(s.tense)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    selectedTense === s.tense
                      ? 'bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{s.tense === 'present' ? 'Настоящее' : 'Прошедшее'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Центральная интерактивная зона */}
        <div className="my-auto py-4 flex flex-col items-center justify-center text-center">
          {/* Фаза 1: Озвучка фразы на иврите */}
          {phase === 'listening_he' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <Volume2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">
                  Слушайте фразу
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  Воспроизводится ивритское микро-предложение...
                </p>
              </div>
            </div>
          )}

          {/* Фаза 2: Активная пауза (студент распознаёт фразу) */}
          {phase === 'pause' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-amber-200 dark:border-amber-900/50" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"
                  style={{ animationDuration: `${pauseDurationSec}s` }}
                />
                <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-300 font-mono">
                  {countdown}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                  Активная пауза
                </p>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Что вы услышали? Переведите мысленно.
                </p>
              </div>

              {/* Кнопка Проверить сразу */}
              <button
                type="button"
                onClick={handleRevealImmediately}
                className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-100 text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>Проверить сразу</span>
              </button>
            </div>
          )}

          {/* Фаза 3 & 4: Разбор и карточка открыты */}
          {isRevealed && (
            <div className="space-y-3.5 w-full animate-in fade-in duration-300">
              {/* Интерактивное ивритское предложение (кликабельные слова для словарика) */}
              <div className="space-y-1.5">
                <div
                  dir="rtl"
                  className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-relaxed text-zinc-900 dark:text-zinc-100 flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5 ${
                    isCursive ? 'font-cursive' : 'font-print font-hebrew'
                  }`}
                >
                  {sentenceTokens.map((token) => {
                    const displayWord = showNikkud ? token.text : stripNikkud(token.text);
                    if (token.isHebrew) {
                      const isInDict = isWordInPersonalDict(
                        token.cleanText,
                        userProfile.personalVocabulary
                      );
                      return (
                        <span
                          key={token.id}
                          onClick={() => handleWordClick(token)}
                          className={`inline-block px-1.5 py-0.5 rounded-lg transition cursor-pointer select-text border ${
                            isInDict
                              ? 'border-b-2 border-b-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                              : 'border-transparent hover:border-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 active:scale-95'
                          }`}
                          title={
                            isInDict
                              ? 'Слово уже в вашем словарике (нажмите для разбора)'
                              : 'Нажмите для перевода и добавления в личный словарик'
                          }
                        >
                          {displayWord}
                        </span>
                      );
                    }
                    return <span key={token.id}>{token.text}</span>;
                  })}
                </div>

                {/* Подсказка об интерактивности слов */}
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  💡 Нажмите на любое слово фразы, чтобы посмотреть перевод и добавить в словарик
                </p>

                {/* Транскрипция Pealim */}
                {showTranscription && (
                  <p className="text-sm sm:text-base font-semibold text-amber-700 dark:text-amber-400 font-mono tracking-wide pt-1">
                    [{activeSentence.sentenceTranscription}]
                  </p>
                )}
              </div>

              {/* Русский перевод фразы */}
              <div className="pt-1">
                <p className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {activeSentence.sentenceRu}
                </p>
              </div>

              {/* Метаданные фразы: Форма глагола, Предлог, Время, Инфинитив, Урок */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                {/* Бейдж инфинитива */}
                <div className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5">
                  <span className="text-amber-500 font-normal">Инфинитив:</span>
                  <span className="font-hebrew font-extrabold">{verbInfinitiveHe}</span>
                  <span className="text-amber-600/80 font-normal">({verbInfinitiveRu})</span>
                </div>

                {/* Бейдж формы глагола во фразе */}
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5">
                  <span className="text-blue-500 font-normal">В предложении:</span>
                  <span className="font-hebrew font-extrabold">{activeSentence.verbForm}</span>
                </div>

                {/* Бейдж предлога */}
                {activeSentence.prepositionPlain && (
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <span className="text-emerald-500 font-normal">Предлог:</span>
                    <span className="font-hebrew font-extrabold">
                      {activeSentence.prepositionVocalized || activeSentence.prepositionPlain}
                    </span>
                  </div>
                )}

                {/* Бейдж времени */}
                <div className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold">
                  {activeSentence.tenseRu}
                </div>

                {/* Бейдж урока курса */}
                <div className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-zinc-400" />
                  <span>
                    Урок {activeSentence.minLesson}: {activeSentence.lessonTheme}
                  </span>
                </div>
              </div>

              {/* Блок «Семья корня (משפחת השורש)» для глубокого изучения в ручном режиме */}
              {rootFamily && rootFamily.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 text-left w-full space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-purple-700 dark:text-purple-300">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Семья корня (משפחת השורש)</span>
                    </div>
                    {rootLetters && (
                      <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        שורש: {rootLetters}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {rootFamily.map((rw: RootRelatedWord, idx: number) => {
                      const cleanHe = stripNikkud(rw.hebrew);
                      const inDict = isWordInPersonalDict(
                        cleanHe,
                        userProfile.personalVocabulary
                      );
                      return (
                        <div
                          key={idx}
                          onClick={() => handleRootFamilyWordClick(rw)}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500 transition cursor-pointer shadow-xs group"
                          title="Нажмите для разбора и добавления в личный словарик"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {rw.translation}
                              </span>
                              {rw.partOfSpeech && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                    rw.partOfSpeech === 'noun'
                                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                      : rw.partOfSpeech === 'adjective'
                                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                      : rw.partOfSpeech === 'expression'
                                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                  }`}
                                >
                                  {rw.partOfSpeech === 'noun'
                                    ? 'сущ.'
                                    : rw.partOfSpeech === 'adjective'
                                    ? 'прил.'
                                    : rw.partOfSpeech === 'expression'
                                    ? 'выраж.'
                                    : rw.partOfSpeech === 'verb'
                                    ? 'гл.'
                                    : rw.partOfSpeech}
                                </span>
                              )}
                            </div>
                            {showTranscription && rw.transcription && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                                [{rw.transcription}]
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              dir="rtl"
                              className={`font-bold text-zinc-900 dark:text-zinc-100 ${
                                isCursive ? 'font-cursive text-lg' : 'font-hebrew text-sm'
                              }`}
                            >
                              {showNikkud ? rw.hebrew : rw.hebrewPlain || cleanHe}
                            </span>

                            {/* Кнопка воспроизведения аудио для слова семьи */}
                            <button
                              type="button"
                              onClick={(e) => handleRootFamilySpeak(e, rw.hebrew)}
                              className="p-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition cursor-pointer"
                              title="Озвучить слово"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Индикатор в словаре */}
                            {inDict && (
                              <span
                                title="Слово уже в вашем словарике"
                                className="text-emerald-600 dark:text-emerald-400"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Нижняя панель действий и статус автоперехода */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Кнопки повтора звука */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleReplaySentenceHebrew}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="Повторить фразу на иврите"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Фраза</span>
            </button>

            <button
              type="button"
              onClick={handleReplayInfinitiveHebrew}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="Повторить инфинитив на иврите"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Инфинитив</span>
            </button>

            <button
              type="button"
              onClick={handleReplayRussian}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="Повторить перевод на русском"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Перевод</span>
            </button>

            <button
              type="button"
              onClick={() => startDrillCycle(activeSentence)}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition cursor-pointer shadow-xs"
              title="Начать слуховой цикл заново"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Статус автоперехода к следующему слову */}
          {autoCountdown !== null && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium animate-pulse">
              <span>Следующий глагол через {autoCountdown}с...</span>
              <button
                type="button"
                onClick={() => {
                  if (autoTimerRef.current) {
                    clearInterval(autoTimerRef.current);
                    autoTimerRef.current = null;
                  }
                  setAutoCountdown(null);
                  setAutoAdvance(false);
                }}
                className="underline text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Пауза
              </button>
            </div>
          )}

          {/* Навигация к следующему глаголу */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={onPrevWord}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-xs"
              title="Предыдущий глагол"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              type="button"
              onClick={onAdvanceNext}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              title="Следующий глагол"
            >
              <span>Дальше</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Всплывающее модальное окно разбора неизвестного слова и добавления в словарь (WordLookupModal) */}
      {selectedLookupWord && (
        <WordLookupModal
          word={selectedLookupWord}
          isOpen={Boolean(selectedLookupWord)}
          context={lookupContext}
          sentenceTranslation={lookupSentenceTranslation}
          sentenceTranscription={lookupSentenceTranscription}
          userProfile={userProfile}
          onClose={() => setSelectedLookupWord(null)}
          onWordAdded={(newWord) => {
            addWordToPersonalDict(newWord);
            if (onUpdateProfile) {
              onUpdateProfile(loadUserProfile());
            }
          }}
        />
      )}
    </div>
  );
};
