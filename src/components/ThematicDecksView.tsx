import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  ShoppingBag,
  Coffee,
  Heart,
  Home,
  Navigation,
  Users,
  Calendar,
  Layers,
  Briefcase,
  Landmark,
  Stethoscope,
  Radio,
  Plus,
  Check,
  Play,
  Volume2,
  Search,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Award,
  List,
  Copy,
  Download,
  X,
  CheckSquare,
  Square,
  FileText,
  Table,
  Filter,
} from 'lucide-react';
import { ThematicDeck, UserProfile, Word, VerbConjugation } from '@/types';
import {
  THEMATIC_DECKS,
  getDeckWordsAsText,
  exportDeckToTsv,
} from '@/data/thematicDecks';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud, getWordTranscription } from '@/lib/transcription';
import {
  calculateWordMastery,
  isWordInPersonalDict,
  addBatchWordsToPersonalDict,
  addWordToPersonalDict,
  sortWordsBySRSPriority,
} from '@/lib/storage';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';

interface ThematicDecksViewProps {
  userProfile: UserProfile;
  onStartTraining: (words: Word[], deckTitle: string) => void;
  onUpdateVocabulary: (newWords: Word[]) => void;
}

export const ThematicDecksView: React.FC<ThematicDecksViewProps> = ({
  userProfile,
  onStartTraining,
  onUpdateVocabulary,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'alef' | 'bet'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [addedBatchDeckId, setAddedBatchDeckId] = useState<string | null>(null);

  // Состояние модального окна подробного списка колоды
  const [listModalDeck, setListModalDeck] = useState<ThematicDeck | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());

  // Состояние модального окна Pealim (Спряжения глагола и семья корней)
  const [pealimModal, setPealimModal] = useState<{
    word: Word;
    conjugation: VerbConjugation | null;
    loading: boolean;
  } | null>(null);

  const isCursive = userProfile.fontStyle === 'cursive';

  // Сопоставление иконок
  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Zap':
        return <Zap className={className} />;
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      case 'Heart':
        return <Heart className={className} />;
      case 'Home':
        return <Home className={className} />;
      case 'Navigation':
        return <Navigation className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Calendar':
        return <Calendar className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'Stethoscope':
        return <Stethoscope className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Фильтрация колод
  const filteredDecks = useMemo(() => {
    return THEMATIC_DECKS.filter((deck) => {
      // Уровень
      if (selectedLevel !== 'all' && deck.level !== selectedLevel && deck.level !== 'all') {
        return false;
      }
      // Категория
      if (selectedCategory !== 'all' && deck.category !== selectedCategory) {
        return false;
      }
      // Поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = deck.title.toLowerCase().includes(q) || deck.titleHebrew.includes(q);
        const matchesDesc = deck.description.toLowerCase().includes(q);
        const matchesWord = deck.words.some(
          (w) =>
            w.translation.toLowerCase().includes(q) ||
            w.hebrew.includes(q) ||
            w.transcription.toLowerCase().includes(q)
        );
        return matchesTitle || matchesDesc || matchesWord;
      }
      return true;
    });
  }, [selectedLevel, selectedCategory, searchQuery]);

  // Вычисление прогресса по колоде
  const getDeckStats = (deck: ThematicDeck) => {
    let totalScore = 0;
    let masteredCount = 0;
    let dueCount = 0;

    deck.words.forEach((w) => {
      const stats =
        userProfile.flashcardStats?.[w.id] ||
        userProfile.flashcardProgress?.[w.id] ||
        (w.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(w.hebrewPlain)] : undefined) ||
        userProfile.flashcardStats?.[stripNikkud(w.hebrew)];
      const mastery = calculateWordMastery(stats);
      totalScore += mastery.score;
      if (mastery.level === 'mastered') masteredCount++;
      if (mastery.isDue) dueCount++;
    });

    const avgScore = deck.words.length > 0 ? Math.round(totalScore / deck.words.length) : 0;
    return { avgScore, masteredCount, dueCount, totalWords: deck.words.length };
  };

  const handleSpeak = (text: string, id: string) => {
    setSpeakingWordId(id);
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
    setTimeout(() => setSpeakingWordId(null), 1200);
  };

  // Добавление одного слова в персональный словарь
  const handleAddSingleWord = (word: Word) => {
    const added = addWordToPersonalDict({
      hebrew: word.hebrew,
      hebrewPlain: word.hebrewPlain || stripNikkud(word.hebrew),
      transcription: word.transcription,
      translation: word.translation,
      partOfSpeech: word.partOfSpeech || 'other',
      root: word.root,
      gender: word.gender,
      plural: word.plural,
      lessonId: word.lessonId || 0,
    });
    onUpdateVocabulary([added]);
  };

  // Добавление всех слов колоды в словарь (с защитой от дубликатов)
  const handleAddAllWordsToDict = (deck: ThematicDeck) => {
    const newlyAdded = addBatchWordsToPersonalDict(deck.words);
    setAddedBatchDeckId(deck.id);
    onUpdateVocabulary(newlyAdded.updatedProfile.personalVocabulary);
    setTimeout(() => setAddedBatchDeckId(null), 2500);
  };

  // Открыть модалку списка колоды
  const handleOpenListModal = (deck: ThematicDeck) => {
    setListModalDeck(deck);
    setModalSearch('');
    setSelectedWordIds(new Set(deck.words.map((w) => w.id)));
  };

  // Открыть систему Pealim (спряжения и семья корня) для глагола
  const handleOpenPealim = async (word: Word) => {
    const offlineMatch =
      findOfflineVerbConjugation(word.hebrew) ||
      findOfflineVerbConjugation(word.hebrewPlain || stripNikkud(word.hebrew));

    if (offlineMatch) {
      setPealimModal({
        word,
        conjugation: offlineMatch,
        loading: false,
      });
      return;
    }

    // Если нет в оффлайн-базе, запрашиваем через серверный API
    setPealimModal({
      word,
      conjugation: null,
      loading: true,
    });

    try {
      const res = await fetch('/api/ai/conjugate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verb: word.hebrew,
          provider: userProfile.aiProvider,
          apiKey:
            userProfile.aiProvider === 'groq'
              ? userProfile.groqApiKey
              : userProfile.geminiApiKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && data.present) {
          setPealimModal({
            word,
            conjugation: data,
            loading: false,
          });
          return;
        }
      }
    } catch (e) {
      console.error('Pealim fetch error:', e);
    }

    setPealimModal((prev) => (prev ? { ...prev, loading: false } : null));
  };

  // Копирование списка в буфер обмена
  const handleCopyList = (deck: ThematicDeck) => {
    const text = getDeckWordsAsText(deck.id, {
      withNikkud: userProfile.showNikkud,
      withTranscription: true,
      withRoot: true,
    });
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Скачать TSV
  const handleDownloadTsv = (deck: ThematicDeck) => {
    const tsvContent = exportDeckToTsv(deck.id);
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.id}_words.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Переключение выбора слова в чекбоксе
  const toggleSelectWord = (id: string) => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllModalWords = (words: Word[]) => {
    if (selectedWordIds.size === words.length) {
      setSelectedWordIds(new Set());
    } else {
      setSelectedWordIds(new Set(words.map((w) => w.id)));
    }
  };

  // Отфильтрованные слова внутри модалки списка
  const modalFilteredWords = useMemo(() => {
    if (!listModalDeck) return [];
    if (!modalSearch.trim()) return listModalDeck.words;
    const q = modalSearch.toLowerCase().trim();
    return listModalDeck.words.filter(
      (w) =>
        w.translation.toLowerCase().includes(q) ||
        w.hebrew.includes(q) ||
        (w.hebrewPlain && w.hebrewPlain.includes(q)) ||
        w.transcription.toLowerCase().includes(q) ||
        (w.root && w.root.includes(q))
    );
  }, [listModalDeck, modalSearch]);

  const isVerbWord = (w: Word) =>
    w.partOfSpeech === 'verb' ||
    w.hebrew.startsWith('לִ') ||
    w.hebrew.startsWith('לְ') ||
    w.hebrew.startsWith('לַ') ||
    w.hebrew.startsWith('לָ') ||
    Boolean(w.root);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Компактная шапка тематических словарей */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Тематические словари
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {filteredDecks.length} колод
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Специальные подборки слов: 100 глаголов с Pealim, еда, кафе, тело, транспорт, работа и сленг
          </p>
        </div>
      </div>

      {/* Быстрые фильтры по категориям */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Все темы ({THEMATIC_DECKS.length})
        </button>
        <button
          onClick={() => setSelectedCategory('verbs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            selectedCategory === 'verbs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
          }`}
        >
          <span>⚡ Глаголы</span>
        </button>
        <button
          onClick={() => setSelectedCategory('food')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            selectedCategory === 'food'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
          }`}
        >
          <span>🥐 Еда и кафе</span>
        </button>
        <button
          onClick={() => setSelectedCategory('body')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            selectedCategory === 'body'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
          }`}
        >
          <span>🏥 Здоровье</span>
        </button>
        <button
          onClick={() => setSelectedCategory('city')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            selectedCategory === 'city'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
          }`}
        >
          <span>🏙️ Город и быт</span>
        </button>
        <button
          onClick={() => setSelectedCategory('slang')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
            selectedCategory === 'slang'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60'
          }`}
        >
          <span>🗣️ Сленг</span>
        </button>
      </div>

      {/* Панель фильтров и переключатель вида */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Вкладки уровней */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedLevel === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Все уровни
          </button>
          <button
            onClick={() => setSelectedLevel('alef')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedLevel === 'alef'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
            }`}
          >
            <span>Алеф (א)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">1-50</span>
          </button>
          <button
            onClick={() => setSelectedLevel('bet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedLevel === 'bet'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
            }`}
          >
            <span>Бет (ב)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">51-100</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Поиск слов и тем */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск темы или слова..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
          </div>

          {/* Переключатель вида: Сетка карточек / Табличный список */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewLayout === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Вид: Сетка колод"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Сетка</span>
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewLayout === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Вид: Сводный список колод"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Списком</span>
            </button>
          </div>
        </div>
      </div>

      {/* РЕЖИМ 1: СЕТКА КОЛОД (GRID) */}
      {viewLayout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => {
            const stats = getDeckStats(deck);
            const isExpanded = expandedDeckId === deck.id;
            const isBatchAdded = addedBatchDeckId === deck.id;
            const isAlef = deck.level === 'alef';

            return (
              <div
                key={deck.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Верхняя строка: Иконка, Уровень, Кол-во слов */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isAlef
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {renderIcon(deck.icon, 'w-6 h-6')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isAlef
                                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                                : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {isAlef ? 'Алеф (א)' : 'Бет (ב)'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {deck.words.length} слов
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base mt-0.5">
                          {deck.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      dir="rtl"
                      className="font-hebrew font-bold text-base text-slate-400 dark:text-slate-500 hidden sm:inline-block"
                    >
                      {deck.titleHebrew}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {deck.description}
                  </p>

                  {/* Прогресс знания колоды */}
                  <div className="mb-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Освоение набора:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {stats.avgScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          stats.avgScore >= 80
                            ? 'bg-emerald-500'
                            : stats.avgScore >= 40
                            ? 'bg-blue-500'
                            : stats.avgScore > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        style={{ width: `${stats.avgScore}%` }}
                      />
                    </div>
                    {stats.dueCount > 0 && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                        ⚡ {stats.dueCount} слов требуют повторения сегодня
                      </div>
                    )}
                  </div>
                </div>

                {/* Действия: Тренировать / Список слов / В словарь */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onStartTraining(
                          sortWordsBySRSPriority(
                            deck.words,
                            userProfile.flashcardStats,
                            userProfile.flashcardProgress
                          ),
                          deck.title
                        )
                      }
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm text-white transition active:scale-98 ${
                        isAlef
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                          : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Тренировать
                    </button>

                    {/* КНОПКА «ВЫВЕСТИ КОЛОДУ СПИСКОМ» */}
                    <button
                      onClick={() => handleOpenListModal(deck)}
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                      title="Вывести полный список слов колоды таблицей"
                    >
                      <List className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Список ({deck.words.length})</span>
                    </button>

                    <button
                      onClick={() => handleAddAllWordsToDict(deck)}
                      disabled={isBatchAdded}
                      className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1 ${
                        isBatchAdded
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                      title="Добавить все слова набора в мой словарь"
                    >
                      {isBatchAdded ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <BookmarkPlus className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedDeckId(isExpanded ? null : deck.id)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title={isExpanded ? 'Свернуть быстрый список' : 'Быстрый просмотр'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Быстрый аккордеон-список */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-64 overflow-y-auto pr-1">
                      <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Слова в наборе ({deck.words.length}):</span>
                        <button
                          onClick={() => handleOpenListModal(deck)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Table className="w-3 h-3" />
                          Развернуть списком
                        </button>
                      </div>
                      {deck.words.map((word) => {
                        const isWordInDict = isWordInPersonalDict(
                          word.hebrew,
                          userProfile.personalVocabulary
                        );
                        const isSpeaking = speakingWordId === word.id;
                        const wordMastery = calculateWordMastery(
                          userProfile.flashcardStats?.[word.id] ||
                          userProfile.flashcardProgress?.[word.id] ||
                          (word.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(word.hebrewPlain)] : undefined) ||
                          userProfile.flashcardStats?.[stripNikkud(word.hebrew)]
                        );
                        const isVerb = isVerbWord(word);

                        return (
                          <div
                            key={word.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                {word.translation}
                              </div>
                              {getWordTranscription(word) && (
                                <div className="text-[11px] text-blue-600 dark:text-blue-400">
                                  [{getWordTranscription(word)}]
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* КНОПКА ПЕАЛИМ ДЛЯ ГЛАГОЛОВ */}
                              {isVerb && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPealim(word)}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition"
                                  title="Открыть спряжения и семью корней (Pealim)"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                  <span>Пеалим</span>
                                </button>
                              )}

                              {wordMastery.score > 0 && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${wordMastery.badgeBg}`}
                                >
                                  {wordMastery.score}%
                                </span>
                              )}

                              <span
                                dir="rtl"
                                className={`font-bold text-slate-900 dark:text-white ${
                                  isCursive ? 'font-cursive text-xl' : 'font-hebrew text-base'
                                }`}
                              >
                                {userProfile.showNikkud ? word.hebrew : word.hebrewPlain || stripNikkud(word.hebrew)}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleSpeak(word.hebrew, word.id)}
                                className={`p-1.5 rounded-full transition ${
                                  isSpeaking
                                    ? 'bg-blue-600 text-white animate-pulse'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => !isWordInDict && handleAddSingleWord(word)}
                                disabled={isWordInDict}
                                className={`p-1.5 rounded-lg transition ${
                                  isWordInDict
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                                }`}
                                title={isWordInDict ? 'Уже в словарике' : 'Добавить в словарик'}
                              >
                                {isWordInDict ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* РЕЖИМ 2: СВОДНЫЙ СПИСОК ВСЕХ КОЛОД (TABLE LIST VIEW) */}
      {viewLayout === 'table' && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Все тематические словари списком
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Кликните «Вывести список слов» для открытия полной таблицы слов любой колоды
              </p>
            </div>
            <span className="text-xs font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {filteredDecks.length} колод
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredDecks.map((deck) => {
              const stats = getDeckStats(deck);
              const isAlef = deck.level === 'alef';

              return (
                <div
                  key={deck.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isAlef
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {renderIcon(deck.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isAlef
                              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                              : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {isAlef ? 'Алеф (א)' : 'Бет (ב)'}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          {deck.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {deck.words.length} слов • Освоение: <span className="font-bold text-slate-700 dark:text-slate-300">{stats.avgScore}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleOpenListModal(deck)}
                      className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Вывести список слов</span>
                    </button>
                    <button
                      onClick={() =>
                        onStartTraining(
                          sortWordsBySRSPriority(
                            deck.words,
                            userProfile.flashcardStats,
                            userProfile.flashcardProgress
                          ),
                          deck.title
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Тренировать</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО «ВЫВЕСТИ КОЛОДУ СПИСКОМ» */}
      {listModalDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Шапка модалки */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    listModalDeck.level === 'alef'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {renderIcon(listModalDeck.icon, 'w-6 h-6')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Уровень {listModalDeck.level === 'alef' ? 'Алеф (א)' : 'Бет (ב)'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {listModalDeck.words.length} слов в наборе
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg truncate mt-0.5">
                    {listModalDeck.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyList(listModalDeck)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition"
                  title="Скопировать текстовый список в буфер"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Копировать список</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadTsv(listModalDeck)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition"
                  title="Экспорт в Anki / TSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">TSV (Anki)</span>
                </button>

                <button
                  onClick={() => setListModalDeck(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Фильтр поиска по списку и массовые операции */}
            <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Фильтр по слову, переводу или корню..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                <button
                  onClick={() => toggleSelectAllModalWords(modalFilteredWords)}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 font-semibold"
                >
                  {selectedWordIds.size === modalFilteredWords.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      <span>Снять выделение</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Выбрать все ({modalFilteredWords.length})</span>
                    </>
                  )}
                </button>

                <span className="text-slate-400">|</span>

                <span className="text-slate-500 font-medium">
                  Выбрано: <strong className="text-slate-800 dark:text-slate-200">{selectedWordIds.size}</strong>
                </span>
              </div>
            </div>

            {/* Таблица со списком слов */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Иврит (Инфинитив)</th>
                      <th className="py-2.5 px-3">Транскрипция</th>
                      <th className="py-2.5 px-3">Перевод на русский</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">Корень / Биньян</th>
                      <th className="py-2.5 px-3 text-center">Освоение</th>
                      <th className="py-2.5 px-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {modalFilteredWords.map((word, index) => {
                      const isWordInDict = isWordInPersonalDict(
                        word.hebrew,
                        userProfile.personalVocabulary
                      );
                      const isSpeaking = speakingWordId === word.id;
                      const wordMastery = calculateWordMastery(
                        userProfile.flashcardStats?.[word.id] ||
                        userProfile.flashcardProgress?.[word.id] ||
                        (word.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(word.hebrewPlain)] : undefined) ||
                        userProfile.flashcardStats?.[stripNikkud(word.hebrew)]
                      );
                      const isChecked = selectedWordIds.has(word.id);
                      const isVerb = isVerbWord(word);

                      return (
                        <tr
                          key={word.id}
                          onClick={() => toggleSelectWord(word.id)}
                          className={`hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition ${
                            isChecked ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                          }`}
                        >
                          {/* Чекбокс и номер */}
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectWord(word.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span>{index + 1}</span>
                            </div>
                          </td>

                          {/* Иврит */}
                          <td className="py-3 px-3">
                            <span
                              dir="rtl"
                              className={`font-bold text-slate-900 dark:text-white ${
                                isCursive
                                  ? 'font-cursive text-2xl text-blue-600 dark:text-blue-400'
                                  : 'font-hebrew text-base'
                              }`}
                            >
                              {userProfile.showNikkud ? word.hebrew : word.hebrewPlain || stripNikkud(word.hebrew)}
                            </span>
                          </td>

                          {/* Транскрипция */}
                          <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-medium">
                            {getWordTranscription(word) ? `[${getWordTranscription(word)}]` : '—'}
                          </td>

                          {/* Перевод */}
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {word.translation}
                          </td>

                          {/* Корень и доп инфо */}
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                            {word.root ? (
                              <span className="font-mono text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded">
                                {word.root}
                              </span>
                            ) : word.plural ? (
                              <span className="text-[11px] text-slate-400">
                                мн: {word.plural}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {word.partOfSpeech}
                              </span>
                            )}
                          </td>

                          {/* Освоение */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${wordMastery.badgeBg}`}
                            >
                              {wordMastery.score}%
                            </span>
                          </td>

                          {/* Действия: Пеалим, Звук и В словарь */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {/* КНОПКА ПЕАЛИМ */}
                              {isVerb && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPealim(word)}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition"
                                  title="Таблица спряжений и семья корня (Pealim)"
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-500" />
                                  <span>Пеалим</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSpeak(word.hebrew, word.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  isSpeaking
                                    ? 'bg-blue-600 text-white animate-pulse'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                                }`}
                                title="Озвучить"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => !isWordInDict && handleAddSingleWord(word)}
                                disabled={isWordInDict}
                                className={`p-1.5 rounded-lg transition ${
                                  isWordInDict
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                                }`}
                                title={isWordInDict ? 'Уже в словарике' : 'Добавить в личный словарь'}
                              >
                                {isWordInDict ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Футер модалки: Тренировать выбранные / Добавить выбранные */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                Слов для тренировки:{' '}
                <strong className="text-blue-600 dark:text-blue-400 font-bold">
                  {selectedWordIds.size} из {listModalDeck.words.length}
                </strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const selectedWords = listModalDeck.words.filter((w) => selectedWordIds.has(w.id));
                    if (selectedWords.length > 0) {
                      const newlyAdded = addBatchWordsToPersonalDict(selectedWords);
                      onUpdateVocabulary(newlyAdded.updatedProfile.personalVocabulary);
                    }
                  }}
                  disabled={selectedWordIds.size === 0}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Добавить выбранные в словарь</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const selectedWords = listModalDeck.words.filter((w) => selectedWordIds.has(w.id));
                    if (selectedWords.length > 0) {
                      onStartTraining(
                        sortWordsBySRSPriority(
                          selectedWords,
                          userProfile.flashcardStats,
                          userProfile.flashcardProgress
                        ),
                        listModalDeck.title
                      );
                      setListModalDeck(null);
                    }
                  }}
                  disabled={selectedWordIds.size === 0}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Тренировать ({selectedWordIds.size})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО PEALIM (Спряжения и Семья корней) */}
      {pealimModal && (
        <div
          onClick={() => setPealimModal(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 max-h-[90vh] overflow-y-auto relative"
          >
            {pealimModal.loading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">Загружаем спряжения и семью корня Pealim...</p>
              </div>
            ) : pealimModal.conjugation ? (
              <VerbConjugationView
                conjugation={pealimModal.conjugation}
                userProfile={userProfile}
                onBack={() => setPealimModal(null)}
                onAddToVocabulary={(w) => {
                  handleAddSingleWord(w);
                }}
                isWordInPersonalVocab={isWordInPersonalDict(pealimModal.word.hebrew, userProfile.personalVocabulary)}
              />
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Спряжения для глагола <strong className="font-hebrew text-base">{pealimModal.word.hebrew}</strong> генерируются.
                </p>
                <button
                  onClick={() => setPealimModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
