'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2,
  PenTool,
  RotateCcw,
  Undo2,
  BookOpen,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Play,
  Square,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HEBREW_ALPHABET } from '@/data/alphabetData';
import { HEBREW_STROKE_RULES } from '@/data/hebrewStrokeRules';
import { HebrewLetter, UserProfile, LetterWritingRule } from '@/types';
import { speakHebrew } from '@/lib/speech';

interface AlphabetTrainerProps {
  userProfile: UserProfile;
  onOpenLetterPractice?: (letter: HebrewLetter) => void;
}

type TabMode = 'grid' | 'canvas' | 'quiz';
type ViewDisplay = 'both' | 'print' | 'cursive';

export const AlphabetTrainer: React.FC<AlphabetTrainerProps> = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('grid');
  const [displayMode, setDisplayMode] = useState<ViewDisplay>('both');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'regular' | 'sofit'>('all');
  const [selectedLetter, setSelectedLetter] = useState<HebrewLetter>(HEBREW_ALPHABET[0]);

  // Холст для рисования
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#2563eb');
  const [penWidth, setPenWidth] = useState(8);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Переключатели слоёв и ориентиров
  const [showStencil, setShowStencil] = useState(true);
  const [showStartingPoints, setShowStartingPoints] = useState(true);
  const [showDirectionArrows, setShowDirectionArrows] = useState(true);
  const [showNotebookLines, setShowNotebookLines] = useState(true);

  // Анимация демонстрации начертания
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeAnimStroke, setActiveAnimStroke] = useState<number | null>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Точки для сглаживания текущего штриха (Bézier curves)
  const currentPointsRef = useRef<Array<{ x: number; y: number }>>([]);

  // Квиз
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState<HebrewLetter[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentRule: LetterWritingRule | undefined = HEBREW_STROKE_RULES[selectedLetter.id];

  const filteredLetters = HEBREW_ALPHABET.filter((item) => {
    if (selectedCategory === 'regular') return !item.isSofit;
    if (selectedCategory === 'sofit') return item.isSofit;
    return true;
  });

  // --- Сохранение и очистка холста ---
  const saveStateToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-15), imageData]);
    } catch {}
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setHistory([]);
  }, []);

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Удаляем последнее состояние

    if (newHistory.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      setHistory([]);
    } else {
      const previousState = newHistory[newHistory.length - 1];
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  useEffect(() => {
    if (activeTab === 'canvas') {
      clearCanvas();
      stopAnimation();
    }
  }, [selectedLetter, activeTab, clearCanvas]);

  // --- Точный расчёт координат (Pointer Events + Retina) ---
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Захват указателя для непрерывного рисования даже при быстром выходе за край
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCanvasCoords(e);
    currentPointsRef.current = [{ x, y }];

    ctx.beginPath();
    ctx.arc(x, y, penWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = penColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    const points = currentPointsRef.current;
    points.push({ x, y });

    // Сглаживание линий через квадратичные кривые Безье
    if (points.length > 2) {
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    currentPointsRef.current = [];
    saveStateToHistory();
  };

  // --- Анимация демонстрации начертания ---
  const stopAnimation = () => {
    setIsAnimating(false);
    setActiveAnimStroke(null);
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
  };

  const playDemoAnimation = () => {
    if (!currentRule || currentRule.strokes.length === 0) return;
    stopAnimation();
    setIsAnimating(true);
    setActiveAnimStroke(1);

    if (currentRule.strokes.length === 2) {
      animTimeoutRef.current = setTimeout(() => {
        setActiveAnimStroke(2);
        animTimeoutRef.current = setTimeout(() => {
          stopAnimation();
        }, 2200);
      }, 2200);
    } else {
      animTimeoutRef.current = setTimeout(() => {
        stopAnimation();
      }, 2500);
    }
  };

  const handleNextLetter = () => {
    stopAnimation();
    const currentIndex = HEBREW_ALPHABET.findIndex((l) => l.id === selectedLetter.id);
    if (currentIndex < HEBREW_ALPHABET.length - 1) {
      setSelectedLetter(HEBREW_ALPHABET[currentIndex + 1]);
    } else {
      setSelectedLetter(HEBREW_ALPHABET[0]);
    }
  };

  const handlePrevLetter = () => {
    stopAnimation();
    const currentIndex = HEBREW_ALPHABET.findIndex((l) => l.id === selectedLetter.id);
    if (currentIndex > 0) {
      setSelectedLetter(HEBREW_ALPHABET[currentIndex - 1]);
    } else {
      setSelectedLetter(HEBREW_ALPHABET[HEBREW_ALPHABET.length - 1]);
    }
  };

  // --- Квиз по прописям ---
  const currentQuizLetter = HEBREW_ALPHABET[quizIndex];

  useEffect(() => {
    if (!currentQuizLetter) return;
    setSelectedOption(null);

    const others = HEBREW_ALPHABET.filter((l) => l.id !== currentQuizLetter.id);
    const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [...shuffledOthers, currentQuizLetter].sort(() => Math.random() - 0.5);
    setQuizOptions(all);
  }, [quizIndex, currentQuizLetter]);

  const handleQuizAnswer = (chosenLetterId: string) => {
    setSelectedOption(chosenLetterId);
    const isCorrect = chosenLetterId === currentQuizLetter.id;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      speakHebrew(currentQuizLetter.exampleWord.hebrew);
    }

    setTimeout(() => {
      if (quizIndex + 1 < 10) {
        setQuizIndex((prev) => prev + 1);
      } else {
        setQuizCompleted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setSelectedOption(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Главный заголовок */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-6 md:p-8 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Алефбет и Ктав Яд (כְּתַב יָד)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Алфавит и Рукописные прописи
            </h1>
            <p className="text-sm text-blue-100 max-w-xl mt-1">
              В Израиле все пишут от руки рукописным шрифтом. Изучайте правила начертания, точки начала, направление штрихов и тренируйтесь на точном интерактивном холсте.
            </p>
          </div>

          {/* Быстрые вкладки */}
          <div className="flex flex-wrap p-1 bg-black/20 rounded-2xl backdrop-blur gap-1">
            <button
              onClick={() => setActiveTab('grid')}
              className={'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ' + (activeTab === 'grid' ? 'bg-white text-blue-900 shadow-md' : 'text-white/80 hover:text-white')}
            >
              <BookOpen className="w-4 h-4" />
              <span>Алфавит</span>
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ' + (activeTab === 'canvas' ? 'bg-white text-blue-900 shadow-md' : 'text-white/80 hover:text-white')}
            >
              <PenTool className="w-4 h-4" />
              <span>Тренажер прописей</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                resetQuiz();
              }}
              className={'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ' + (activeTab === 'quiz' ? 'bg-white text-blue-900 shadow-md' : 'text-white/80 hover:text-white')}
            >
              <Award className="w-4 h-4" />
              <span>Тест прописей</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- ВКЛАДКА 1: КАТАЛОГ ВСЕХ БУКВ --- */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          {/* Панель фильтров */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedCategory('all')}
                className={'px-3 py-1.5 rounded-lg transition ' + (selectedCategory === 'all' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500')}
              >
                Все 27 букв
              </button>
              <button
                onClick={() => setSelectedCategory('regular')}
                className={'px-3 py-1.5 rounded-lg transition ' + (selectedCategory === 'regular' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500')}
              >
                Основные (22)
              </button>
              <button
                onClick={() => setSelectedCategory('sofit')}
                className={'px-3 py-1.5 rounded-lg transition ' + (selectedCategory === 'sofit' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500')}
              >
                Конечные Софит (5)
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-zinc-400">Отображать:</span>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setDisplayMode('both')}
                  className={'px-2.5 py-1 rounded-lg transition ' + (displayMode === 'both' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400')}
                >
                  Оба вида
                </button>
                <button
                  onClick={() => setDisplayMode('print')}
                  className={'px-2.5 py-1 rounded-lg transition ' + (displayMode === 'print' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400')}
                >
                  Печатный (דפוס)
                </button>
                <button
                  onClick={() => setDisplayMode('cursive')}
                  className={'px-2.5 py-1 rounded-lg transition ' + (displayMode === 'cursive' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400')}
                >
                  Рукописный (כתב)
                </button>
              </div>
            </div>
          </div>

          {/* Сетка карточек букв */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredLetters.map((item) => {
              const rule = HEBREW_STROKE_RULES[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedLetter(item);
                    setActiveTab('canvas');
                  }}
                  className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between text-center relative overflow-hidden"
                >
                  {/* Бейдж гематрии и софита */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>№{item.gematria}</span>
                    <div className="flex items-center gap-1">
                      {rule && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                          {rule.strokesCount === 1 ? '1 штрих' : '2 штриха'}
                        </span>
                      )}
                      {item.isSofit && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                          софит
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Начертание буквы */}
                  <div className="my-3 py-2 flex items-center justify-center gap-3">
                    {(displayMode === 'both' || displayMode === 'print') && (
                      <div className="text-4xl font-bold font-hebrew text-zinc-900 dark:text-zinc-50 group-hover:scale-105 transition">
                        {item.letter}
                      </div>
                    )}

                    {displayMode === 'both' && (
                      <span className="text-xs font-light text-zinc-300 dark:text-zinc-600">/</span>
                    )}

                    {(displayMode === 'both' || displayMode === 'cursive') && (
                      <div className="text-5xl font-cursive text-blue-600 dark:text-blue-400 font-bold group-hover:scale-110 transition">
                        {item.cursiveLetter}
                      </div>
                    )}
                  </div>

                  {/* Название и пример */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {item.nameRussian}
                    </h3>
                    <p dir="rtl" className="text-[11px] font-hebrew text-zinc-400 mt-0.5">
                      {item.nameHebrew}
                    </p>
                  </div>

                  {/* Кнопка озвучки и действия */}
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakHebrew(item.exampleWord.hebrew);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                      title="Прослушать пример слова"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                      <span>Учить пропись</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- ВКЛАДКА 2: ИНТЕРАКТИВНЫЙ ХОЛСТ С ПРАВИЛАМИ И НАПРАВЛЕНИЯМИ --- */}
      {activeTab === 'canvas' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
          {/* Верхняя панель переключения буквы */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevLetter}
                className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Предыдущая буква"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    Буква {selectedLetter.nameRussian} ({selectedLetter.nameHebrew})
                  </h2>
                  <button
                    onClick={() => speakHebrew(selectedLetter.exampleWord.hebrew)}
                    className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition"
                    title="Озвучить пример слова"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Звук: <span className="font-semibold text-blue-600">[{selectedLetter.transcription}]</span> • Гематрия: {selectedLetter.gematria}
                  {selectedLetter.isSofit && ' • Конечная форма (Софит)'}
                </p>
              </div>

              <button
                onClick={handleNextLetter}
                className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Следующая буква"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Выбор буквы из выпадающего списка */}
            <select
              value={selectedLetter.id}
              onChange={(e) => {
                const found = HEBREW_ALPHABET.find((l) => l.id === e.target.value);
                if (found) {
                  setSelectedLetter(found);
                  stopAnimation();
                }
              }}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {HEBREW_ALPHABET.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.letter} / {item.cursiveLetter} — {item.nameRussian}
                </option>
              ))}
            </select>
          </div>

          {/* Рабочая зона: Правила слева + Холст справа */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Левая колонка: Правила написания и пошаговые подсказки */}
            <div className="lg:col-span-5 space-y-4">
              {/* Карточка сравнения форм */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-center">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Печатная (דפוס)
                  </span>
                  <div className="text-5xl font-bold font-hebrew text-zinc-900 dark:text-zinc-50 py-1">
                    {selectedLetter.letter}
                  </div>
                  <p className="text-[11px] text-zinc-500">Книги и сайты</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-center">
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Рукописная (כתב)
                  </span>
                  <div className="text-6xl font-cursive text-blue-600 dark:text-blue-400 font-bold py-0.5">
                    {selectedLetter.cursiveLetter}
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                    Живое письмо от руки
                  </p>
                </div>
              </div>

              {/* Блок правил написания (Ктав Яд) */}
              {currentRule && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Правила написания буквы:</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                      {currentRule.strokesCount === 1 ? '1 слитный штрих' : '2 штриха с отрывом руки'}
                    </span>
                  </div>

                  <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                    {currentRule.description}
                  </p>

                  {/* Пошаговые штрихи */}
                  <div className="space-y-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                    {currentRule.strokes.map((s) => (
                      <div
                        key={s.id}
                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition ${
                          activeAnimStroke === s.id
                            ? 'bg-amber-200/90 dark:bg-amber-800/80 ring-2 ring-amber-500'
                            : 'bg-white/80 dark:bg-zinc-900/70'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                            s.id === 1
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {s.id}
                        </span>
                        <div className="space-y-0.5">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            <span>{s.label}</span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-normal">
                            {s.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Особенности пропорций строки */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold">
                    {currentRule.proportions.ascender && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        ▲ Выходит над строкой (высокий флажок)
                      </span>
                    )}
                    {currentRule.proportions.descender && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        ▼ Уходит глубоко под строку (хвостик)
                      </span>
                    )}
                    {currentRule.proportions.baseline && !currentRule.proportions.descender && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ Опирается на базовую строку
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Пример слова с этой буквой */}
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400">Пример слова:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span dir="rtl" className="text-lg font-bold font-hebrew text-zinc-900 dark:text-zinc-100">
                      {selectedLetter.exampleWord.hebrew}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      [{selectedLetter.exampleWord.transcription}]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{selectedLetter.exampleWord.translation}</p>
                </div>

                <div className="text-3xl font-cursive text-blue-600 dark:text-blue-400 font-bold pr-2">
                  {selectedLetter.exampleWord.hebrew}
                </div>
              </div>
            </div>

            {/* Правая колонка: Интерактивный точный холст + Векторные слои */}
            <div className="lg:col-span-7 flex flex-col items-center space-y-4">
              {/* Контейнер холста 360x360 с адаптивной подгонкой */}
              <div className="relative w-full max-w-[360px] aspect-square rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-inner overflow-hidden flex items-center justify-center select-none">
                {/* 1. Слой линовки израильской школьной тетради (מחברת שורות) */}
                {showNotebookLines && (
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Надстрочная линия (для Ламед) - y ≈ 12.5% */}
                    <div className="absolute w-full top-[12.5%] border-b border-purple-300/60 dark:border-purple-800/60 border-dashed">
                      <span className="absolute left-2 -top-3.5 text-[9px] font-semibold text-purple-600 dark:text-purple-400">
                        Надстрочная (Ламед ל)
                      </span>
                    </div>

                    {/* Верхняя линия строки (Top line) - y ≈ 32% */}
                    <div className="absolute w-full top-[32%] border-b border-zinc-300 dark:border-zinc-700">
                      <span className="absolute left-2 -top-3.5 text-[9px] font-semibold text-zinc-400">
                        Верх строки
                      </span>
                    </div>

                    {/* Средняя линия (Mid line) - y ≈ 50% */}
                    <div className="absolute w-full top-[50%] border-b border-zinc-200/70 dark:border-zinc-800/80 border-dotted" />

                    {/* Базовая линия строки (Baseline) - y ≈ 69% */}
                    <div className="absolute w-full top-[69%] border-b-2 border-indigo-400/80 dark:border-indigo-600/80">
                      <span className="absolute left-2 -top-3.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                        Базовая линия строки
                      </span>
                    </div>

                    {/* Подстрочная линия (Descender) - y ≈ 89% */}
                    <div className="absolute w-full top-[89%] border-b border-rose-300/60 dark:border-rose-800/60 border-dashed">
                      <span className="absolute left-2 -top-3.5 text-[9px] font-semibold text-rose-500 dark:text-rose-400">
                        Подстрочная (софиты ך, ן, ף, ץ)
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Трафаретная подложка с рукописной буквой шрифта Gveret Levin */}
                {showStencil && (
                  <div
                    className="absolute inset-0 flex items-center justify-center font-cursive text-[200px] font-bold text-blue-500/15 dark:text-blue-400/10 pointer-events-none select-none transition"
                    style={{ lineHeight: 1 }}
                  >
                    {selectedLetter.cursiveLetter}
                  </div>
                )}

                {/* 3. SVG-слой траекторий штрихов, стрелок и точек начала */}
                {currentRule && (
                  <svg
                    viewBox="0 0 360 360"
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="7"
                        markerHeight="7"
                        refX="4"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 7 3.5, 0 7" fill="#0284c7" />
                      </marker>
                      <marker
                        id="arrowhead-active"
                        markerWidth="8"
                        markerHeight="8"
                        refX="5"
                        refY="4"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 4, 0 8" fill="#e11d48" />
                      </marker>
                    </defs>

                    {/* Отрисовка траекторий штрихов */}
                    {showDirectionArrows &&
                      currentRule.strokes.map((stroke) => {
                        const isCurrentActive = isAnimating && activeAnimStroke === stroke.id;
                        return (
                          <g key={stroke.id}>
                            {/* Направляющая пунктирная траектория */}
                            <path
                              d={stroke.path}
                              fill="none"
                              stroke={isCurrentActive ? '#e11d48' : '#0284c7'}
                              strokeWidth={isCurrentActive ? '4.5' : '3'}
                              strokeDasharray={isCurrentActive ? '6 4' : '4 4'}
                              strokeLinecap="round"
                              strokeOpacity={isCurrentActive ? '0.9' : '0.45'}
                              className={isCurrentActive ? 'animate-pulse' : ''}
                            />

                            {/* Стрелка направления */}
                            {stroke.arrow && (
                              <line
                                x1={stroke.arrow.from.x}
                                y1={stroke.arrow.from.y}
                                x2={stroke.arrow.to.x}
                                y2={stroke.arrow.to.y}
                                stroke={isCurrentActive ? '#e11d48' : '#0284c7'}
                                strokeWidth="2.5"
                                strokeOpacity="0.8"
                                markerEnd={isCurrentActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                              />
                            )}
                          </g>
                        );
                      })}

                    {/* Начальные точки с номерами (❶, ❷) */}
                    {showStartingPoints &&
                      currentRule.strokes.map((stroke) => {
                        const isCurrentActive = isAnimating && activeAnimStroke === stroke.id;
                        const isFirst = stroke.id === 1;
                        const mainColor = isFirst ? '#059669' : '#2563eb';

                        return (
                          <g
                            key={`start-${stroke.id}`}
                            className="transition-all duration-300"
                          >
                            {/* Пульсирующий внешний ореол */}
                            <circle
                              cx={stroke.startPoint.x}
                              cy={stroke.startPoint.y}
                              r={isCurrentActive ? '18' : '14'}
                              fill={mainColor}
                              fillOpacity="0.25"
                              className="animate-ping"
                              style={{ transformOrigin: `${stroke.startPoint.x}px ${stroke.startPoint.y}px` }}
                            />

                            {/* Основной кружок точки старта */}
                            <circle
                              cx={stroke.startPoint.x}
                              cy={stroke.startPoint.y}
                              r="10"
                              fill={mainColor}
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="drop-shadow-sm"
                            />

                            {/* Номер штриха */}
                            <text
                              x={stroke.startPoint.x}
                              y={stroke.startPoint.y + 3.5}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              {stroke.id}
                            </text>

                            {/* Подпись "Старт" */}
                            <text
                              x={stroke.startPoint.x}
                              y={stroke.startPoint.y - 13}
                              textAnchor="middle"
                              fill={mainColor}
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              Старт {stroke.id}
                            </text>
                          </g>
                        );
                      })}
                  </svg>
                )}

                {/* 4. Canvas для точного рисования пользователем (HiDPI 720x720) */}
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={720}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="relative z-20 w-full h-full cursor-crosshair touch-none select-none"
                  style={{ touchAction: 'none' }}
                />

                {!hasDrawn && (
                  <div className="absolute bottom-3 text-center pointer-events-none z-30 text-[11px] text-zinc-500 dark:text-zinc-400 bg-white/90 dark:bg-zinc-900/90 px-3 py-1 rounded-full shadow-sm backdrop-blur border border-zinc-200/50 dark:border-zinc-800/50">
                    Начните с зеленой точки ❶ и ведите по стрелке
                  </div>
                )}
              </div>

              {/* Панель инструментов холста */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-[440px]">
                {/* Кнопка "Анимация написания" */}
                <button
                  onClick={isAnimating ? stopAnimation : playDemoAnimation}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                    isAnimating
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title="Показать правильное начертание буквы"
                >
                  {isAnimating ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isAnimating ? 'Остановить' : 'Показать как писать'}</span>
                </button>

                {/* Выбор цвета чернил */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {['#2563eb', '#18181b', '#9333ea', '#059669'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      className={`w-6 h-6 rounded-lg transition transform active:scale-90 ${
                        penColor === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Толщина кисти */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-[11px] font-bold">
                  {[6, 8, 12].map((w) => (
                    <button
                      key={w}
                      onClick={() => setPenWidth(w)}
                      className={`px-2 py-1 rounded-lg transition ${
                        penWidth === w ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm' : 'text-zinc-500'
                      }`}
                    >
                      {w === 6 ? 'Тонко' : w === 8 ? 'Норм' : 'Жирно'}
                    </button>
                  ))}
                </div>

                {/* Отмена последнего штриха (Undo) */}
                <button
                  onClick={undoLastStroke}
                  disabled={history.length === 0}
                  className="p-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition text-zinc-600 dark:text-zinc-300"
                  title="Отменить последний штрих"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                {/* Кнопка очистки холста */}
                <button
                  onClick={clearCanvas}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 transition flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"
                  title="Стереть все нарисованное"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Стереть</span>
                </button>

                {/* Следующая буква */}
                <button
                  onClick={handleNextLetter}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1 shadow-sm"
                >
                  <span>Дальше</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Переключатели ориентиров и слоев */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                <button
                  onClick={() => setShowStartingPoints(!showStartingPoints)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                    showStartingPoints
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Точки ❶ ❷: {showStartingPoints ? 'Вкл' : 'Выкл'}
                </button>

                <button
                  onClick={() => setShowDirectionArrows(!showDirectionArrows)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                    showDirectionArrows
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Стрелки: {showDirectionArrows ? 'Вкл' : 'Выкл'}
                </button>

                <button
                  onClick={() => setShowNotebookLines(!showNotebookLines)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                    showNotebookLines
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  Линовка тетради: {showNotebookLines ? 'Вкл' : 'Выкл'}
                </button>

                <button
                  onClick={() => setShowStencil(!showStencil)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                    showStencil
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {showStencil ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                  Трафарет буквы
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ВКЛАДКА 3: ТЕСТ НА ЗНАНИЕ ПРОПИСЕЙ --- */}
      {activeTab === 'quiz' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-lg max-w-xl mx-auto space-y-6">
          {!quizCompleted ? (
            <div className="space-y-6">
              {/* Шапка квиза */}
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                <span>Вопрос {quizIndex + 1} из 10</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  Правильно: {quizScore}
                </span>
              </div>

              {/* Прогресс-бар */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((quizIndex + 1) / 10) * 100}%` }}
                />
              </div>

              {/* Карточка задания */}
              <div className="text-center py-6 bg-blue-50 dark:bg-blue-950/30 rounded-3xl border border-blue-100 dark:border-blue-900/50 space-y-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                  Найдите рукописную пару для буквы:
                </span>
                <div className="text-7xl font-bold font-hebrew text-zinc-900 dark:text-zinc-50 py-2">
                  {currentQuizLetter.letter}
                </div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Буква {currentQuizLetter.nameRussian} ({currentQuizLetter.nameHebrew})
                </p>
              </div>

              {/* Варианты рукописных ответов */}
              <div className="grid grid-cols-2 gap-3.5">
                {quizOptions.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isCorrect = opt.id === currentQuizLetter.id;

                  let btnStyle =
                    'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-blue-400';

                  if (selectedOption) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-600 text-white border-red-600';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={selectedOption !== null}
                      onClick={() => handleQuizAnswer(opt.id)}
                      className={'p-6 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1 active:scale-95 ' + btnStyle}
                    >
                      <span className="text-6xl font-cursive font-bold leading-tight">
                        {opt.cursiveLetter}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in zoom-in-95 py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold font-hebrew text-zinc-900 dark:text-zinc-50">
                  !כָּל הַכָּבוֹד
                </h2>
                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  Тест по прописям завершен!
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  Ваш результат: <span className="font-bold text-zinc-900 dark:text-zinc-50">{quizScore}</span> из 10 букв.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Пройти снова
                </button>
                <button
                  onClick={() => setActiveTab('canvas')}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
                >
                  Тренировать прописи
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
