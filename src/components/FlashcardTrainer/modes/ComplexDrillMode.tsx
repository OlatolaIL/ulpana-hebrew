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
  Layers,
  AlertTriangle,
  Grid,
  Users,
} from 'lucide-react';
import { Word, UserProfile, RootRelatedWord } from '@/types';
import { stripNikkud, tokenizeText, cleanHebrewToken, TextToken } from '@/lib/transcription';
import {
  speakHebrew,
  speakRussian,
  stopSpeech,
  getRecordedSentenceAudio,
} from '@/lib/speech';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { WordLookupModal } from '@/components/WordLookupModal';
import { addWordToPersonalDict, isWordInPersonalDict } from '@/lib/storage';
import {
  ComplexDrillItem,
  VerbDrillItem,
  NounDrillItem,
  AdjectiveDrillItem,
  PrepositionDrillItem,
} from '@/types/complexDrills';
import { getDrillDataForWord } from '@/data/drills';
import { adaptSentenceForGender } from '@/lib/drills/sentenceGenderAdapter';

interface ComplexDrillModeProps {
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

export const ComplexDrillMode: React.FC<ComplexDrillModeProps> = ({
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

  // Локальная скорость озвучки в режиме «Комплекс» (не перезаписывает глобальный профиль)
  const [localSpeechRate, setLocalSpeechRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('complex_drill_speech_rate');
        if (saved) {
          const val = parseFloat(saved);
          if (!isNaN(val) && val >= 0.5 && val <= 1.5) return val;
        }
      } catch {}
    }
    return userProfile.speechRate || 0.7;
  });

  const handleSetLocalSpeed = (rate: number) => {
    setLocalSpeechRate(rate);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('complex_drill_speech_rate', rate.toString());
      } catch {}
    }
  };

  // Извлекаем обучающие данные из реестра (Инварианты R-01, R-18, полиморфный диспетчер)
  const drillItems = useMemo(() => {
    if (!currentWord) return [];
    return getDrillDataForWord(currentWord);
  }, [currentWord]);

  // Спряжения и семья корня (для глаголов или слов с корнем)
  const conjugation = useMemo(() => {
    if (!currentWord) return null;
    const raw = currentWord.hebrewPlain || currentWord.hebrew;
    return findOfflineVerbConjugation(raw);
  }, [currentWord]);

  const rootFamily: RootRelatedWord[] = useMemo(() => {
    return conjugation?.rootFamily || [];
  }, [conjugation]);

  const rootLetters = conjugation?.root || currentWord?.root;

  // Выбранное время (для глаголов с несколькими временами)
  const [selectedTense, setSelectedTense] = useState<'present' | 'past' | 'future'>('present');

  // Активный drill item
  const activeDrill: ComplexDrillItem = useMemo(() => {
    if (!currentWord) {
      return {
        id: 'fallback_empty',
        type: 'adverb',
        targetWordPlain: '',
        targetWordVocalized: '',
        targetWordTranscription: '',
        targetWordTranslation: '',
        sentenceHe: '',
        sentenceTranscription: '',
        sentenceRu: '',
        minLesson: 1,
      };
    }
    let item: ComplexDrillItem;
    if (drillItems.length === 0) {
      item = {
        id: `fallback_${currentWord.id}`,
        type: 'adverb',
        targetWordPlain: currentWord.hebrewPlain || currentWord.hebrew,
        targetWordVocalized: currentWord.hebrew,
        targetWordTranscription: currentWord.transcription || '',
        targetWordTranslation: currentWord.translation || '',
        sentenceHe: currentWord.hebrew,
        sentenceTranscription: currentWord.transcription || '',
        sentenceRu: currentWord.translation,
        minLesson: 1,
      };
    } else if (drillItems[0].type === 'verb') {
      const match = (drillItems as VerbDrillItem[]).find((s) => s.tense === selectedTense);
      item = match || drillItems[0];
    } else {
      item = drillItems[0];
    }

    // Адаптация под выбранный пол ученика (Инвариант R-17)
    if (userProfile.gender === 'female' && item.sentenceHe) {
      const adapted = adaptSentenceForGender(
        item.sentenceHe,
        item.sentenceTranscription || '',
        'female'
      );
      if (adapted.sentenceHe !== item.sentenceHe) {
        return {
          ...item,
          sentenceHe: adapted.sentenceHe,
          sentenceTranscription: adapted.sentenceTranscription,
        };
      }
    }

    return item;
  }, [drillItems, selectedTense, currentWord, userProfile.gender]);

  // Длительность паузы: 3, 4 или 5 секунд
  const [pauseDurationSec, setPauseDurationSec] = useState<number>(4);
  const [phase, setPhase] = useState<ComplexPhase>('listening_he');
  const [countdown, setCountdown] = useState<number>(4);

  // Режим автовоспроизведения (Hands-free)
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);

  // Интерактивный разбор неизвестных слов (WordLookupModal, R-20)
  const [selectedLookupWord, setSelectedLookupWord] = useState<string | null>(null);
  const [lookupContext, setLookupContext] = useState<string | undefined>(undefined);
  const [lookupSentenceTranslation, setLookupSentenceTranslation] = useState<string | undefined>(undefined);
  const [lookupSentenceTranscription, setLookupSentenceTranscription] = useState<string | undefined>(undefined);
  // Ссылки на таймеры
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playCycleIdRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const [audioMeta, setAudioMeta] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/audio/sentences/audio_metadata.json')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data === 'object') {
            setAudioMeta(data);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Синхронизация файлов из базы для текущей фразы — не нужна без Admin Lab

  // Проверка: озвучена ли текущая фраза студийным ИИ Gemini 3.5 (R-24)
  const currentSentenceMeta = useMemo(() => {
    if (!audioMeta || !activeDrill.sentenceHe) return null;
    const cleanCurrent = stripNikkud(activeDrill.sentenceHe)
      .replace(/["״׳']/g, '')
      .replace(/[.,!?:;«»()[\]{}—\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    for (const item of Object.values(audioMeta)) {
      if (!item || !item.sentenceHe) continue;
      const cleanItem = stripNikkud(item.sentenceHe)
        .replace(/["״׳']/g, '')
        .replace(/[.,!?:;«»()[\]{}—\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanItem === cleanCurrent) {
        return item;
      }
    }
    return null;
  }, [audioMeta, activeDrill.sentenceHe]);



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

  // Таймер автоперехода
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

  // Слуховая цепочка подтверждения по типам слов
  const runConfirmationSequence = (targetItem: ComplexDrillItem, cycleId: number) => {
    setPhase('listening_confirm');

    // Шаг 3.1: Перевод фразы на русский
    speakRussian(targetItem.sentenceRu, { rate: 0.95 }).then(() => {
      if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;

      if (targetItem.type === 'verb') {
        // Для глагола: Инфинитив на иврите -> Перевод инфинитива
        const infHe = targetItem.verbInfinitive || currentWord.hebrew;
        speakHebrew(infHe, { rate: localSpeechRate }).then(() => {
          if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
          const infRu = currentWord.translation || targetItem.targetWordTranslation;
          speakRussian(infRu, { rate: 0.95 }).then(() => {
            if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
            finishConfirmation();
          });
        });
      } else if (targetItem.type === 'noun') {
        // Для существительного: Озвучиваем разбираемое слово на иврите (без дублирования) -> Перевод
        const wordHe = targetItem.targetWordVocalized || targetItem.singularHe;
        speakHebrew(wordHe, { rate: localSpeechRate }).then(() => {
          if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
          const confirmText = targetItem.targetWordTranslation;
          speakRussian(confirmText, { rate: 0.95 }).then(() => {
            if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
            finishConfirmation();
          });
        });
      } else if (targetItem.type === 'adjective') {
        // Для прилагательного: Базовая форма на иврите -> Перевод
        speakHebrew(targetItem.forms.ms.hebrew, { rate: localSpeechRate }).then(() => {
          if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
          const confirmText = targetItem.targetWordTranslation;
          speakRussian(confirmText, { rate: 0.95 }).then(() => {
            if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
            finishConfirmation();
          });
        });
      } else if (targetItem.type === 'preposition') {
        // Для предлога: Форма со склонением -> Перевод
        speakHebrew(targetItem.inflectedFormHe, { rate: localSpeechRate }).then(() => {
          if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
          const confirmText = targetItem.targetWordTranslation;
          speakRussian(confirmText, { rate: 0.95 }).then(() => {
            if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
            finishConfirmation();
          });
        });
      } else {
        // Для прочих: Слово на иврите -> Перевод
        speakHebrew(targetItem.targetWordVocalized, { rate: localSpeechRate }).then(() => {
          if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
          speakRussian(targetItem.targetWordTranslation, { rate: 0.95 }).then(() => {
            if (!isMountedRef.current || playCycleIdRef.current !== cycleId) return;
            finishConfirmation();
          });
        });
      }
    });
  };

  const finishConfirmation = () => {
    setPhase('revealed');
    if (autoAdvance) {
      triggerAutoAdvance();
    }
  };

  // Основной цикл активной слуховой паузы
  const startDrillCycle = (targetItem: ComplexDrillItem = activeDrill) => {
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
    // Приоритет: студийный MP3 из manifest (Gemini 3.5 / Edge Neural) → TTS браузера
    setPhase('listening_he');
    setCountdown(pauseDurationSec);

    const playHebrewSentence = async (): Promise<void> => {
      const gender = userProfile.gender ?? 'male';
      const mp3Url = await getRecordedSentenceAudio(targetItem.sentenceHe, gender);
      if (mp3Url) {
        return new Promise<void>((resolve) => {
          const audio = new Audio(mp3Url);
          audio.playbackRate = Math.max(0.5, Math.min(1.5, localSpeechRate));
          audio.onended = () => resolve();
          audio.onerror = () => {
            // Если MP3 не загрузился — TTS как запасной вариант
            speakHebrew(targetItem.sentenceHe, { rate: localSpeechRate, gender }).then(resolve).catch(resolve);
          };
          audio.play().catch(() => {
            speakHebrew(targetItem.sentenceHe, { rate: localSpeechRate, gender }).then(resolve).catch(resolve);
          });
        });
      }
      return speakHebrew(targetItem.sentenceHe, { rate: localSpeechRate, gender });
    };

    playHebrewSentence().then(() => {
      if (!isMountedRef.current || playCycleIdRef.current !== currentCycleId) return;

      // Шаг 2: Активная пауза студента (3–5 сек)
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
          if (timerRef.current) clearInterval(timerRef.current);
          runConfirmationSequence(targetItem, currentCycleId);
        }
      }, 1000);
    });
  };

  // Автостарт при смене слова
  useEffect(() => {
    if (activeDrill.id.startsWith('fallback_')) {
      stopSpeech();
      return;
    }
    startDrillCycle(activeDrill);
    return () => {
      stopSpeech();
    };
  }, [currentWord]);

  // Токенизация фразы (R-20)
  const tokens = useMemo(() => {
    return tokenizeText(activeDrill.sentenceHe);
  }, [activeDrill.sentenceHe]);

  const handleTokenClick = (token: TextToken) => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      setAutoCountdown(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playCycleIdRef.current += 1;
    stopSpeech();

    const vocalizedClean = cleanHebrewToken(token.text);
    setSelectedLookupWord(vocalizedClean || token.cleanText || token.text);
    setLookupContext(activeDrill.sentenceHe);
    setLookupSentenceTranslation(activeDrill.sentenceRu);
    setLookupSentenceTranscription(activeDrill.sentenceTranscription);
  };

  // Клик по слову из семьи корня (открытие модальной карточки разбора слова, R-20)
  const handleRootFamilyWordClick = (rw: RootRelatedWord) => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      setAutoCountdown(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playCycleIdRef.current += 1;
    stopSpeech();

    setSelectedLookupWord(rw.hebrew || rw.hebrewPlain || stripNikkud(rw.hebrew));
    setLookupContext(undefined);
    setLookupSentenceTranslation(undefined);
    setLookupSentenceTranscription(undefined);
  };

  // Озвучка слова из семьи корня (изолированная озвучка без открытия модалки)
  const handleRootFamilySpeak = (e: React.MouseEvent, hebrew: string) => {
    e.stopPropagation();
    stopSpeech();
    onSpeakHebrew(hebrew, { rate: localSpeechRate });
  };

  const handleToggleAutoAdvance = () => {
    const next = !autoAdvance;
    setAutoAdvance(next);
    if (!next && autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
      setAutoCountdown(null);
    } else if (next && phase === 'revealed') {
      triggerAutoAdvance();
    }
  };

  if (!currentWord) return null;

  const isCurrentInDict = isWordInPersonalDict(currentWord.hebrew);

  if (activeDrill.id.startsWith('fallback_')) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Фраза для режима «Комплекс» в разработке
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Для слова <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentWord.hebrew}</span> ({currentWord.translation}) контекстная фраза ещё составляется методистами.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onPrevWord}
              disabled={currentIndex <= 0}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
            <button
              onClick={onAdvanceNext}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <span>Следующее слово</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* ПЛАШКА УПРАВЛЕНИЯ ТРЕНАЖЕРОМ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Слуховой комплекс</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                {activeDrill.type === 'verb' ? 'Глагол' : activeDrill.type === 'noun' ? 'Существительное' : activeDrill.type === 'adjective' ? 'Прилагательное' : 'Предлог'}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500">
              {currentIndex + 1} из {wordsLength || 1}
            </div>
          </div>
        </div>

        {/* ПЕРЕКЛЮЧАТЕЛЬ ДЛИТЕЛЬНОСТИ ПАУЗЫ, СКОРОСТИ И АВТО-РЕЖИМ */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Пауза */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 text-xs">
            <span className="px-2 text-zinc-500 flex items-center gap-1" title="Длительность паузы">
              <Timer className="w-3.5 h-3.5" />
            </span>
            {[3, 4, 5].map((sec) => (
              <button
                key={sec}
                onClick={() => setPauseDurationSec(sec)}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  pauseDurationSec === sec
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {sec}с
              </button>
            ))}
          </div>

          {/* 2. Скорость речи в Комплексе (R-17, изолированная от глобального профиля) */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 text-xs">
            <span className="px-1.5 text-zinc-500 flex items-center gap-1" title="Скорость озвучки в тренажёре">
              <Volume2 className="w-3.5 h-3.5" />
            </span>
            {[
              { label: '0.7x', value: 0.7 },
              { label: '0.85x', value: 0.85 },
              { label: '1.0x', value: 1.0 },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => handleSetLocalSpeed(s.value)}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  localSpeechRate === s.value
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title={`Скорость озвучки: ${s.label}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 3. Авто-переход */}
          <button
            onClick={handleToggleAutoAdvance}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              autoAdvance
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            {autoAdvance ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span>Авто</span>
          </button>
        </div>
      </div>

      {/* ГЛАВНЫЙ ЭКРАН СЛУХОВОГО КОМПЛЕКСА */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden">
        {/* Индикатор этапа и источника аудио */}
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {phase === 'listening_he' && (
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                <Volume2 className="w-4 h-4" /> 1. Слушаем фразу на иврите...
              </span>
            )}
            {phase === 'pause' && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Timer className="w-4 h-4 animate-spin" /> 2. Вспомните смысл (пауза {countdown}с)
              </span>
            )}
            {phase === 'listening_confirm' && (
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold animate-pulse">
                <Volume2 className="w-4 h-4" /> 3. Аудио-подтверждение...
              </span>
            )}
            {phase === 'revealed' && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-4 h-4" /> 4. Разбор карточки
              </span>
            )}

            {/* МЕТКА ДВИЖКА ОЗВУЧКИ: GEMINI 3.5 VS СТАНДАРТНЫЙ */}
            {currentSentenceMeta?.status === 'verified_gemini_3.5' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/15 to-amber-500/15 border border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span>✨ Студия Gemini 3.5 ({currentSentenceMeta.voice || 'Aoede'})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">
                <Volume2 className="w-3 h-3 opacity-60" />
                <span>Стандартный синтез</span>
              </span>
            )}
          </div>

          <button
            onClick={() => startDrillCycle(activeDrill)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold transition"
            title="Повторить аудио-цикл"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Повторить
          </button>
        </div>

        {/* ОБЛАСТЬ ФРАЗЫ (ЗАКРЫТА / БЛЮР НА ПАУЗЕ) */}
        <div className="py-6 px-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 text-center space-y-3 min-h-[140px] flex flex-col justify-center items-center">
          {phase === 'listening_he' || phase === 'pause' ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg shadow-inner">
                {countdown}
              </div>
              <p className="text-xs text-zinc-500">
                Декодируйте услышанное на слух в тишине...
              </p>
            </div>
          ) : (
            <div className="space-y-3 w-full animate-in fade-in duration-300">
              {/* Интерактивная ивритская фраза */}
              <div
                dir="rtl"
                className={`text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-wide flex flex-wrap justify-center gap-2 ${
                  isCursive ? 'font-cursive' : 'font-print'
                }`}
              >
                {tokens.map((tok, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTokenClick(tok)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 underline decoration-dotted decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-blue-500 transition cursor-pointer"
                  >
                    {showNikkud ? tok.text : stripNikkud(tok.text)}
                  </button>
                ))}
              </div>

              {/* Транскрипция */}
              {showTranscription && activeDrill.sentenceTranscription && (
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {activeDrill.sentenceTranscription}
                </div>
              )}

              {/* Русский перевод фразы */}
              <div className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                «{activeDrill.sentenceRu}»
              </div>
            </div>
          )}
        </div>

        {/* СПЕЦИАЛИЗИРОВАННЫЙ БЛОК ГРАММАТИКИ (ОТКРЫВАЕТСЯ НА ФАЗЕ REVEALED) */}
        {phase === 'revealed' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 1. ЕСЛИ ЭТО СУЩЕСТВИТЕЛЬНОЕ */}
            {activeDrill.type === 'noun' && (() => {
              const hasDistinctPlural = Boolean(
                activeDrill.pluralHe &&
                stripNikkud(activeDrill.pluralHe).trim() !== stripNikkud(activeDrill.singularHe).trim()
              );

              return (
                <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          activeDrill.gender === 'm'
                            ? 'bg-blue-600 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {activeDrill.gender === 'm' ? 'זָכָר · Мужской род' : 'נְקֵבָה · Женский род'}
                      </span>
                      {activeDrill.isPluralException && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          Исключение во мн.ч.!
                        </span>
                      )}
                      {!hasDistinctPlural && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          Неисчисляемое / Без мн.ч.
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        hasDistinctPlural
                          ? speakHebrew(`${activeDrill.singularHe}, ${activeDrill.pluralHe}`, {
                              rate: localSpeechRate,
                            })
                          : speakHebrew(activeDrill.singularHe, {
                              rate: localSpeechRate,
                            })
                      }
                      className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition cursor-pointer"
                      title={hasDistinctPlural ? "Озвучить пару ед.ч. и мн.ч." : "Озвучить слово"}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Если есть отдельная форма множественного числа — показываем 2 колонки */}
                  {hasDistinctPlural ? (
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <button
                        type="button"
                        onClick={() => speakHebrew(activeDrill.singularHe, { rate: localSpeechRate })}
                        className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-blue-100 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer text-center group"
                        title="Нажмите для озвучки единственного числа"
                      >
                        <span className="text-[11px] text-zinc-500 block group-hover:text-blue-600">Единственное число (יָחִיד)</span>
                        <span
                          dir="rtl"
                          className={`text-xl font-black text-zinc-900 dark:text-zinc-50 block ${
                            isCursive ? 'font-cursive' : 'font-print'
                          }`}
                        >
                          {showNikkud ? activeDrill.singularHe : stripNikkud(activeDrill.singularHe)}
                        </span>
                        {showTranscription && activeDrill.singularTranscription && (
                          <span className="text-xs text-zinc-500 block mt-0.5">
                            {activeDrill.singularTranscription}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => speakHebrew(activeDrill.pluralHe, { rate: localSpeechRate })}
                        className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-blue-100 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer text-center group"
                        title="Нажмите для озвучки множественного числа"
                      >
                        <span className="text-[11px] text-zinc-500 block group-hover:text-blue-600">Множественное число (רַבִּים)</span>
                        <span
                          dir="rtl"
                          className={`text-xl font-black text-zinc-900 dark:text-zinc-50 block ${
                            isCursive ? 'font-cursive' : 'font-print'
                          }`}
                        >
                          {showNikkud ? activeDrill.pluralHe : stripNikkud(activeDrill.pluralHe)}
                        </span>
                        {showTranscription && activeDrill.pluralTranscription && (
                          <span className="text-xs text-zinc-500 block mt-0.5">
                            {activeDrill.pluralTranscription}
                          </span>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Если формы мн.ч. нет (неисчисляемое, קפה, תה, מים) — показываем аккуратную 1 карточку без дублирования */
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => speakHebrew(activeDrill.singularHe, { rate: localSpeechRate })}
                        className="w-full p-3 bg-white dark:bg-zinc-800 rounded-xl border border-blue-100 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition cursor-pointer text-center group"
                        title="Нажмите для озвучки"
                      >
                        <span className="text-[11px] text-zinc-500 block group-hover:text-blue-600">Словарная форма</span>
                        <span
                          dir="rtl"
                          className={`text-2xl font-black text-zinc-900 dark:text-zinc-50 block ${
                            isCursive ? 'font-cursive' : 'font-print'
                          }`}
                        >
                          {showNikkud ? activeDrill.singularHe : stripNikkud(activeDrill.singularHe)}
                        </span>
                        {showTranscription && activeDrill.singularTranscription && (
                          <span className="text-xs text-zinc-500 block mt-0.5">
                            {activeDrill.singularTranscription}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {activeDrill.pluralNote && (
                    <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 font-medium">
                      💡 {activeDrill.pluralNote}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. ЕСЛИ ЭТО ПРИЛАГАТЕЛЬНОЕ (МАТРИЦА 4 ФОРМ) */}
            {activeDrill.type === 'adjective' && (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Grid className="w-4 h-4" /> Матрица 4 форм согласования:
                  </span>
                  <span className="text-[11px] text-zinc-500">Нажмите на форму для озвучки</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'ms', label: 'Муж. ед.ч.', data: activeDrill.forms.ms },
                    { key: 'fs', label: 'Жен. ед.ч.', data: activeDrill.forms.fs },
                    { key: 'mp', label: 'Муж. мн.ч.', data: activeDrill.forms.mp },
                    { key: 'fp', label: 'Жен. мн.ч.', data: activeDrill.forms.fp },
                  ].map((item) => {
                    const isUsed = activeDrill.usedGenderNumber === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => speakHebrew(item.data.hebrew, { rate: localSpeechRate })}
                        className={`p-2.5 rounded-xl text-center transition cursor-pointer border ${
                          isUsed
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <span className={`text-[10px] block ${isUsed ? 'text-emerald-100' : 'text-zinc-500'}`}>
                          {item.label} {isUsed && '• во фразе'}
                        </span>
                        <span
                          dir="rtl"
                          className={`text-base font-black block ${
                            isCursive ? 'font-cursive' : 'font-print'
                          }`}
                        >
                          {showNikkud ? item.data.hebrew : stripNikkud(item.data.hebrew)}
                        </span>
                        {showTranscription && item.data.transcription && (
                          <span className={`text-[11px] block ${isUsed ? 'text-emerald-200' : 'text-zinc-400'}`}>
                            {item.data.transcription}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. ЕСЛИ ЭТО ПРЕДЛОГ СО СКЛОНЕНИЕМ */}
            {activeDrill.type === 'preposition' && (
              <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-purple-800 dark:text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Склонение предлога {activeDrill.basePrepositionHe}:
                  </span>
                  <span className="text-[11px] text-zinc-500">{activeDrill.personTitle}</span>
                </div>

                {activeDrill.inflectionsTable && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeDrill.inflectionsTable.map((row, idx) => {
                      const isCurrent = row.hebrew === activeDrill.inflectedFormHe;
                      return (
                        <button
                          key={idx}
                          onClick={() => speakHebrew(row.hebrew, { rate: localSpeechRate })}
                          className={`p-2 rounded-xl text-center transition cursor-pointer border ${
                            isCurrent
                              ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-purple-50'
                          }`}
                        >
                          <span className={`text-[10px] block ${isCurrent ? 'text-purple-100' : 'text-zinc-400'}`}>
                            {row.person}
                          </span>
                          <span
                            dir="rtl"
                            className={`text-sm font-bold block ${
                              isCursive ? 'font-cursive' : 'font-print'
                            }`}
                          >
                            {showNikkud ? row.hebrew : stripNikkud(row.hebrew)}
                          </span>
                          <span className={`text-[10px] block ${isCurrent ? 'text-purple-200' : 'text-zinc-500'}`}>
                            {row.transcription}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. ЕСЛИ ЭТО ГЛАГОЛ (ВРЕМЕНА, БИНЬЯН, СЕМЬЯ КОРНЯ) */}
            {activeDrill.type === 'verb' && (
              <div className="space-y-3">
                {/* Переключатель времён */}
                {drillItems.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    {(['present', 'past'] as const).map((t) => {
                      const hasTense = (drillItems as VerbDrillItem[]).some((s) => s.tense === t);
                      if (!hasTense) return null;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedTense(t);
                            const nextDrill = (drillItems as VerbDrillItem[]).find((s) => s.tense === t);
                            if (nextDrill) startDrillCycle(nextDrill);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedTense === t
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                          }`}
                        >
                          {t === 'present' ? 'Настоящее время' : 'Прошедшее время'}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Бейджи инфинитива, биньяна и предлога */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-300">Инфинитив:</span>
                    <button
                      onClick={() => speakHebrew(activeDrill.verbInfinitive, { rate: localSpeechRate })}
                      className="font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {activeDrill.verbInfinitive} <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {activeDrill.prepositionPlain && (
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500">Управление:</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                        +{activeDrill.prepositionPlain}
                      </span>
                    </div>
                  )}
                </div>

                {/* Семья корня (Инвариант R-01, V-09) */}
                {rootFamily.length > 0 && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Семья корня {rootLetters ? `(${rootLetters})` : ''}:</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                        нажмите для карточки
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                      {rootFamily.slice(0, 8).map((rf, idx) => {
                        const cleanHe = stripNikkud(rf.hebrew);
                        const inDict = isWordInPersonalDict(
                          rf.hebrewPlain || cleanHe,
                          userProfile.personalVocabulary
                        );
                        return (
                          <div
                            key={idx}
                            onClick={() => handleRootFamilyWordClick(rf)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-500 transition cursor-pointer shadow-2xs group"
                            title={`Открыть карточку слова: ${rf.translation}`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {rf.translation}
                                </span>
                                {rf.partOfSpeech && (
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                      rf.partOfSpeech === 'noun'
                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                        : rf.partOfSpeech === 'adjective'
                                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                        : rf.partOfSpeech === 'expression'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                    }`}
                                  >
                                    {rf.partOfSpeech === 'noun'
                                      ? 'сущ.'
                                      : rf.partOfSpeech === 'adjective'
                                      ? 'прил.'
                                      : rf.partOfSpeech === 'expression'
                                      ? 'выраж.'
                                      : rf.partOfSpeech === 'verb'
                                      ? 'гл.'
                                      : rf.partOfSpeech}
                                  </span>
                                )}
                              </div>
                              {showTranscription && rf.transcription && (
                                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
                                  [{rf.transcription}]
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
                                {showNikkud ? rf.hebrew : (rf.hebrewPlain || cleanHe)}
                              </span>

                              {/* Кнопка озвучки */}
                              <button
                                type="button"
                                onClick={(e) => handleRootFamilySpeak(e, rf.hebrew)}
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
        )}

        {/* НИЖНЯЯ НАВИГАЦИЯ */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onPrevWord}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          {autoCountdown !== null && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
              Автопереход через {autoCountdown}с...
            </span>
          )}

          <button
            onClick={onAdvanceNext}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            Вперёд <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО РАЗБОРА СЛОВА (R-20) */}
      {selectedLookupWord && (
        <WordLookupModal
          word={selectedLookupWord}
          isOpen={Boolean(selectedLookupWord)}
          userProfile={userProfile}
          context={lookupContext}
          sentenceTranslation={lookupSentenceTranslation}
          sentenceTranscription={lookupSentenceTranscription}
          onClose={() => setSelectedLookupWord(null)}
          onWordAdded={(newWord) => {
            if (onUpdateProfile) {
              const currentVocab = userProfile.personalVocabulary || [];
              if (!currentVocab.some((w) => w.id === newWord.id)) {
                onUpdateProfile({
                  ...userProfile,
                  personalVocabulary: [newWord, ...currentVocab],
                });
              }
            }
          }}
        />
      )}
    </div>
  );
};

// Экспорт алиаса для обратной совместимости
export const ComplexVerbMode = ComplexDrillMode;
