import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Timer,
  BookOpen,
  Info,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { speakHebrew, speakRussian, stopSpeech } from '@/lib/speech';
import {
  getVerbDrillSentences,
  VerbDrillSentence,
  VerbTense,
} from '@/data/verbSentencesData';

interface ComplexVerbModeProps {
  currentWord: Word;
  userProfile: UserProfile;
  currentIndex: number;
  wordsLength?: number;
  onPrevWord: () => void;
  onAdvanceNext: () => void;
  onSpeakHebrew: (text: string, options?: { rate?: number }) => void;
}

type ComplexPhase = 'listening_he' | 'pause' | 'listening_ru' | 'revealed';

export const ComplexVerbMode: React.FC<ComplexVerbModeProps> = ({
  currentWord,
  userProfile,
  currentIndex,
  wordsLength,
  onPrevWord,
  onAdvanceNext,
  onSpeakHebrew,
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

  // Выбранное время (настоящее / прошедшее)
  const [selectedTense, setSelectedTense] = useState<VerbTense>('present');

  // Активная фраза в зависимости от выбранного времени
  const activeSentence = useMemo(() => {
    const match = drillSentences.find((s) => s.tense === selectedTense);
    return match || drillSentences[0];
  }, [drillSentences, selectedTense]);

  // Длительность активной паузы: 3, 4 или 5 секунд (по умолчанию 4)
  const [pauseDurationSec, setPauseDurationSec] = useState<number>(4);
  const [phase, setPhase] = useState<ComplexPhase>('listening_he');
  const [countdown, setCountdown] = useState<number>(4);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);

  // Ссылки для таймеров
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const currentSentenceRef = useRef(activeSentence);
  currentSentenceRef.current = activeSentence;

  // Очистка при размонтировании
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
    };
  }, []);

  // Основной цикл активной слуховой паузы
  const startDrillCycle = (targetSentence: VerbDrillSentence = activeSentence) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopSpeech();

    // Шаг 1: Воспроизведение фразы на иврите
    setPhase('listening_he');
    setCountdown(pauseDurationSec);

    // Озвучиваем с учетом speechRate из профиля
    speakHebrew(targetSentence.sentenceHe, { rate: speechRate }).then(() => {
      if (!isMountedRef.current) return;

      // Шаг 2: Активная пауза студента (3–5 секунд)
      setPhase('pause');
      let remaining = pauseDurationSec;
      setCountdown(remaining);

      timerRef.current = setInterval(() => {
        if (!isMountedRef.current) {
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

          // Шаг 3: Слуховое подтверждение на русском языке (перевод + инфинитив)
          setPhase('listening_ru');
          speakRussian(targetSentence.drillAudioRu, { rate: 0.95 }).then(() => {
            if (!isMountedRef.current) return;

            // Шаг 4: Визуальное закрепление
            setPhase('revealed');

            if (autoAdvance) {
              setTimeout(() => {
                if (isMountedRef.current) {
                  onAdvanceNext();
                }
              }, 2500);
            }
          });
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
    setPhase('listening_ru');
    speakRussian(activeSentence.drillAudioRu, { rate: 0.95 }).then(() => {
      if (isMountedRef.current) {
        setPhase('revealed');
      }
    });
  };

  // Повтор иврита
  const handleReplayHebrew = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    onSpeakHebrew(activeSentence.sentenceHe, { rate: speechRate });
  };

  // Повтор русского аудиоразбора
  const handleReplayRussian = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopSpeech();
    speakRussian(activeSentence.drillAudioRu, { rate: 0.95 });
  };

  const isRevealed = phase === 'listening_ru' || phase === 'revealed';

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
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
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

              {/* Кнопка Показать сразу */}
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
            <div className="space-y-4 w-full animate-in fade-in duration-300">
              {/* Ивритская фраза (полный ктив мале) */}
              <div className="space-y-1.5">
                <p
                  className={`text-3xl sm:text-4xl font-extrabold leading-tight text-zinc-900 dark:text-zinc-100 ${
                    isCursive ? 'font-cursive' : 'font-print font-hebrew'
                  }`}
                  dir="rtl"
                >
                  {showNikkud
                    ? activeSentence.sentenceHe
                    : stripNikkud(activeSentence.sentenceHe)}
                </p>

                {/* Транскрипция Pealim */}
                {showTranscription && (
                  <p className="text-sm sm:text-base font-semibold text-amber-700 dark:text-amber-400 font-mono tracking-wide">
                    [{activeSentence.sentenceTranscription}]
                  </p>
                )}
              </div>

              {/* Русский перевод фразы */}
              <div className="pt-2">
                <p className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {activeSentence.sentenceRu}
                </p>
              </div>

              {/* Метаданные фразы: Глагол, Предлог, Время, Урок */}
              <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                {/* Бейдж глагола */}
                <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5">
                  <span className="text-blue-500 font-normal">Форма:</span>
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
                  <span>Урок {activeSentence.minLesson}: {activeSentence.lessonTheme}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Нижняя панель действий */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          {/* Кнопки повтора звука */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleReplayHebrew}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Повторить фразу на иврите"
            >
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Иврит</span>
            </button>

            <button
              type="button"
              onClick={handleReplayRussian}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Повторить русский аудиоразбор с инфинитивом"
            >
              <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Разбор</span>
            </button>

            <button
              type="button"
              onClick={() => startDrillCycle(activeSentence)}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs transition cursor-pointer shadow-xs"
              title="Начать слуховой цикл заново"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Навигация к следующему глаголу */}
          <div className="flex items-center gap-2 ml-auto">
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
    </div>
  );
};
