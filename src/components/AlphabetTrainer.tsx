'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  PenTool,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HEBREW_ALPHABET } from '@/data/alphabetData';
import { HebrewLetter, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';

interface AlphabetTrainerProps {
  userProfile: UserProfile;
  onOpenLetterPractice?: (letter: HebrewLetter) => void;
}

type TabMode = 'grid' | 'canvas' | 'quiz';
type ViewDisplay = 'both' | 'print' | 'cursive';

export const AlphabetTrainer: React.FC<AlphabetTrainerProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<TabMode>('grid');
  const [displayMode, setDisplayMode] = useState<ViewDisplay>('both');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'regular' | 'sofit'>('all');
  const [selectedLetter, setSelectedLetter] = useState<HebrewLetter>(HEBREW_ALPHABET[0]);

  // Холст для рисования
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showStencil, setShowStencil] = useState(true);
  const [penColor, setPenColor] = useState('#2563eb');
  const [penWidth, setPenWidth] = useState(6);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Квиз
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState<HebrewLetter[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const filteredLetters = HEBREW_ALPHABET.filter((item) => {
    if (selectedCategory === 'regular') return !item.isSofit;
    if (selectedCategory === 'sofit') return item.isSofit;
    return true;
  });

  // --- Инициализация холста ---
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  useEffect(() => {
    if (activeTab === 'canvas') {
      clearCanvas();
    }
  }, [selectedLetter, activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleNextLetter = () => {
    const currentIndex = HEBREW_ALPHABET.findIndex((l) => l.id === selectedLetter.id);
    if (currentIndex < HEBREW_ALPHABET.length - 1) {
      setSelectedLetter(HEBREW_ALPHABET[currentIndex + 1]);
    } else {
      setSelectedLetter(HEBREW_ALPHABET[0]);
    }
  };

  const handlePrevLetter = () => {
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
  }, [quizIndex]);

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
              В Израиле все пишут от руки рукописным шрифтом. Изучайте начертание 27 букв, слушайте звучание и тренируйтесь рисовать на холсте.
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
            {filteredLetters.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedLetter(item);
                  setActiveTab('canvas');
                }}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between text-center relative overflow-hidden"
              >
                {/* Бейдж гематрии */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>№{item.gematria}</span>
                  {item.isSofit && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      софит
                    </span>
                  )}
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
                    <span>Писать</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ВКЛАДКА 2: ИНТЕРАКТИВНЫЙ ХОЛСТ-ПРОПИСЬ --- */}
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
                if (found) setSelectedLetter(found);
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

          {/* Рабочая зона: Сравнение и Холст */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Левая колонка: Эталоны печатного и рукописного вида */}
            <div className="md:col-span-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Печатная форма */}
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-center space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Печатная (דפוס)
                  </span>
                  <div className="text-6xl font-bold font-hebrew text-zinc-900 dark:text-zinc-50 py-2">
                    {selectedLetter.letter}
                  </div>
                  <p className="text-xs text-zinc-500">Книги, газеты, сайты</p>
                </div>

                {/* Рукописная форма */}
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-center space-y-2">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Рукописная (כתב)
                  </span>
                  <div className="text-7xl font-cursive text-blue-600 dark:text-blue-400 font-bold py-1">
                    {selectedLetter.cursiveLetter}
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Записки, школа, жизнь
                  </p>
                </div>
              </div>

              {/* Подсказка по штрихам */}
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <HelpCircle className="w-4 h-4" />
                  <span>Как правильно вести руку:</span>
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed">
                  {selectedLetter.strokeHint}
                </p>
              </div>

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

            {/* Правая колонка: Интерактивный холст для письма */}
            <div className="md:col-span-7 flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-[360px] h-[360px] rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-inner overflow-hidden flex items-center justify-center select-none">
                {/* Трафаретная подложка с рукописной буквой */}
                {showStencil && (
                  <div
                    className="absolute inset-0 flex items-center justify-center font-cursive text-[200px] font-bold text-blue-500/20 dark:text-blue-400/15 pointer-events-none select-none transition"
                    style={{ lineHeight: 1 }}
                  >
                    {selectedLetter.cursiveLetter}
                  </div>
                )}

                {/* Линейка строки */}
                <div className="absolute w-full h-[1px] bg-zinc-200 dark:bg-zinc-800 top-1/2 pointer-events-none" />
                <div className="absolute w-full h-[1px] bg-zinc-200 dark:bg-zinc-800 top-3/4 pointer-events-none" />

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="relative z-10 w-full h-full cursor-crosshair touch-none"
                />

                {!hasDrawn && (
                  <div className="absolute bottom-3 text-center pointer-events-none z-20 text-[11px] text-zinc-400 bg-white/80 dark:bg-zinc-900/80 px-3 py-1 rounded-full backdrop-blur">
                    Обведите букву пальцем или мышкой
                  </div>
                )}
              </div>

              {/* Панель инструментов холста */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                {/* Выбор цвета чернил */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {['#2563eb', '#18181b', '#9333ea', '#059669'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      className={'w-6 h-6 rounded-lg transition transform active:scale-90 ' + (penColor === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'opacity-70')}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Переключатель трафарета */}
                <button
                  onClick={() => setShowStencil(!showStencil)}
                  className={'px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ' + (showStencil ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-900' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500')}
                >
                  {showStencil ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Трафарет</span>
                </button>

                {/* Кнопка очистки */}
                <button
                  onClick={clearCanvas}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 transition flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Стереть</span>
                </button>

                {/* Следующая буква */}
                <button
                  onClick={handleNextLetter}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Дальше</span>
                  <ChevronRight className="w-3.5 h-3.5" />
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
                  style={{ width: (((quizIndex + 1) / 10) * 100) + '%' }}
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
