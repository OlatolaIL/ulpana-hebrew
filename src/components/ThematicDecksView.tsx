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
} from 'lucide-react';
import { ThematicDeck, UserProfile, Word } from '@/types';
import { THEMATIC_DECKS } from '@/data/thematicDecks';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import {
  calculateWordMastery,
  isWordInPersonalDict,
  addBatchWordsToPersonalDict,
  addWordToPersonalDict,
} from '@/lib/storage';

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
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [addedBatchDeckId, setAddedBatchDeckId] = useState<string | null>(null);

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
      const stats = userProfile.flashcardProgress?.[w.id];
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
    onUpdateVocabulary(newlyAdded);
    setTimeout(() => setAddedBatchDeckId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Шапка с описанием */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Тематические словари Ульпана
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">
            Специальные наборы слов по темам
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Тренируйте глаголы всех биньянов, покупки на Шуке, заказ в кафе, общение в банке и сленг.
            Каждую колоду можно учить отдельно на карточках или добавить в свой личный словарик.
          </p>
        </div>
      </div>

      {/* Фильтры по уровню и категориям */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Вкладки уровней */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedLevel === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Все уровни
          </button>
          <button
            onClick={() => setSelectedLevel('alef')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedLevel === 'alef'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
            }`}
          >
            <span>Уровень Алеф (א)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">1-50</span>
          </button>
          <button
            onClick={() => setSelectedLevel('bet')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedLevel === 'bet'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
            }`}
          >
            <span>Уровень Бет (ב)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">51-100</span>
          </button>
        </div>

        {/* Поиск слов и тем */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по теме или слову..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Список колод */}
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

              {/* Действия: Тренировать / Развернуть слова / Добавить всё */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartTraining(deck.words, deck.title)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm text-white transition active:scale-98 ${
                      isAlef
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                        : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Тренировать колоду
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
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-bold">Добавлено</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        <span className="text-[11px] hidden sm:inline">В словарь</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setExpandedDeckId(isExpanded ? null : deck.id)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title={isExpanded ? 'Свернуть слова' : 'Показать список слов'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Развернутый список слов колоды */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-72 overflow-y-auto pr-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Слова в наборе ({deck.words.length}):
                    </div>
                    {deck.words.map((word) => {
                      const isWordInDict = isWordInPersonalDict(
                        word.hebrew,
                        userProfile.personalVocabulary
                      );
                      const isSpeaking = speakingWordId === word.id;
                      const wordMastery = calculateWordMastery(
                        userProfile.flashcardProgress?.[word.id]
                      );

                      return (
                        <div
                          key={word.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                              {word.translation}
                            </div>
                            <div className="text-[11px] text-blue-600 dark:text-blue-400">
                              [{word.transcription}]
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Оценка знания слова */}
                            {wordMastery.score > 0 && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${wordMastery.badgeColor}`}
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
    </div>
  );
};
