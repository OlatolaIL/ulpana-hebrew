import React, { useState, useMemo, useEffect } from 'react';
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
  Shuffle,
  LayoutGrid,
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
  shuffleWords,
} from '@/lib/storage';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';
import { useModalHistory } from '@/lib/useHistoryState';
import { isDeckAlwaysFree } from '@/lib/permissions';
import { TierBadge } from './TierBadge';
import { useBannerCooldown } from '@/lib/useBannerCooldown';

interface ThematicDecksViewProps {
  userProfile: UserProfile;
  onStartTraining: (words: Word[], deckTitle: string, shuffle?: boolean) => void;
  onUpdateVocabulary: (newWords: Word[]) => void;
  initialDeckId?: string | null;
  onCloseInitialDeck?: () => void;
}

export const ThematicDecksView: React.FC<ThematicDecksViewProps> = ({
  userProfile,
  onStartTraining,
  onUpdateVocabulary,
  initialDeckId,
  onCloseInitialDeck,
}) => {
  type DeckFilter = 'all' | 'alef' | 'bet' | 'verbs' | 'food' | 'body' | 'city' | 'slang';
  const [filter, setFilter] = useState<DeckFilter>('all');
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const { isVisible: isBetaBannerVisible, dismiss: dismissBetaBanner } = useBannerCooldown('thematic_decks_beta');

  // Режим перемешивания слов для колод
  const [shuffleDecks, setShuffleDecks] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deck_shuffle_mode') === 'true';
    }
    return false;
  });

  // Состояние модального окна подробного списка колоды
  const [listModalDeck, setListModalDeck] = useState<ThematicDeck | null>(() => {
    if (initialDeckId) {
      return THEMATIC_DECKS.find((d) => d.id === initialDeckId) || null;
    }
    return null;
  });
  const [modalSearch, setModalSearch] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(() => {
    if (initialDeckId) {
      const found = THEMATIC_DECKS.find((d) => d.id === initialDeckId);
      if (found) return new Set(found.words.map((w) => w.id));
    }
    return new Set();
  });
  const [modalViewMode, setModalViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'table';
    }
    return 'cards';
  });

  const handleCloseListModal = () => {
    setListModalDeck(null);
    if (onCloseInitialDeck) {
      onCloseInitialDeck();
    }
  };

  useEffect(() => {
    if (initialDeckId) {
      const found = THEMATIC_DECKS.find((d) => d.id === initialDeckId);
      if (found) {
        setListModalDeck(found);
        setModalSearch('');
        setSelectedWordIds(new Set(found.words.map((w) => w.id)));
      }
    }
  }, [initialDeckId]);

  // Состояние модального окна Pealim (Спряжения глагола и семья корней)
  const [pealimModal, setPealimModal] = useState<{
    word: Word;
    conjugation: VerbConjugation | null;
    loading: boolean;
  } | null>(null);

  useModalHistory(Boolean(pealimModal), () => setPealimModal(null), 'pealim-thematic');
  useModalHistory(Boolean(listModalDeck), handleCloseListModal, 'deck-detail');

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
      if (filter === 'all') return true;
      if (filter === 'alef') return deck.level === 'alef';
      if (filter === 'bet') return deck.level === 'bet';
      return deck.category === filter;
    });
  }, [filter]);

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
      {/* Баннер режима бета-доступа к колодам */}
      {isBetaBannerVisible && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="font-bold">
                {userProfile.ulpanMode ? 'עֶרְכּוֹת בֵּטָא:' : 'Тематические колоды в Бете:'}
              </strong>{' '}
              {userProfile.ulpanMode
                ? '3 עֶרְכּוֹת בְּסִיסִיּוֹת חִנָּמִיּוֹת תָּמִיד. כָּל שְׁאָר הָעֶרְכּוֹת פְּתוּחוֹת בִּתְקוּפַת הַבֵּטָא (בְּגִרְסָה סוֹפִית — PRO).'
                : '3 базовые колоды всегда бесплатны. Все остальные тематические колоды сейчас открыты в режиме PRO БЕТА.'}
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
            <TierBadge tier="pro-beta" size="xs" isUlpan={userProfile.ulpanMode} />
            <button
              type="button"
              onClick={dismissBetaBanner}
              className="p-1 rounded-lg text-amber-700/70 hover:text-amber-900 dark:text-amber-300/70 dark:hover:text-amber-100 hover:bg-amber-500/20 transition cursor-pointer"
              title={userProfile.ulpanMode ? 'הַסְתֵּר לְ-5 יָמִים' : 'Скрыть на 5 дней'}
              aria-label={userProfile.ulpanMode ? 'הַסְתֵּר לְ-5 יָמִים' : 'Скрыть на 5 дней'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Быстрые фильтры по темам и уровням в одну компактную строку */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-hebrew">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Все ({THEMATIC_DECKS.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('alef')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'alef'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
          }`}
        >
          Алеф (א)
        </button>
        <button
          type="button"
          onClick={() => setFilter('bet')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'bet'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
          }`}
        >
          Бет (ב)
        </button>
        <button
          type="button"
          onClick={() => setFilter('verbs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'verbs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
          }`}
        >
          ⚡ Глаголы
        </button>
        <button
          type="button"
          onClick={() => setFilter('food')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'food'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
          }`}
        >
          🥐 Еда и кафе
        </button>
        <button
          type="button"
          onClick={() => setFilter('body')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'body'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
          }`}
        >
          🏥 Здоровье
        </button>
        <button
          type="button"
          onClick={() => setFilter('city')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'city'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
        >
          🏙️ Город
        </button>
        <button
          type="button"
          onClick={() => setFilter('slang')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            filter === 'slang'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
          }`}
        >
          🗣️ Сленг
        </button>
      </div>

      {/* Компактный каталог колод */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredDecks.map((deck) => {
          const stats = getDeckStats(deck);
          const isAlef = deck.level === 'alef';

          return (
            <div
              key={deck.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 sm:p-4 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition flex flex-col justify-between gap-3"
            >
              <div
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => handleOpenListModal(deck)}
                title={`Открыть слова «${deck.title}»`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition group-hover:scale-105 ${
                    isAlef
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {renderIcon(deck.icon, 'w-5 h-5')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {deck.title}
                      </h3>
                      {isDeckAlwaysFree(deck.id) ? (
                        <TierBadge tier="always-free" size="xs" isUlpan={userProfile.ulpanMode} customLabel={userProfile.ulpanMode ? 'חִנָּם' : 'Бесплатно'} />
                      ) : (
                        <TierBadge tier="pro-beta" size="xs" isUlpan={userProfile.ulpanMode} />
                      )}
                    </div>
                    {stats.avgScore > 0 && (
                      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
                        {stats.avgScore}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isAlef
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800'
                      }`}
                    >
                      {isAlef ? 'Алеф (א)' : 'Бет (ב)'}
                    </span>
                    <span>•</span>
                    <span>{deck.words.length} слов</span>
                    {stats.dueCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          ⚡ {stats.dueCount} на повтор
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Две аккуратные кнопки */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() =>
                    onStartTraining(
                      shuffleDecks
                        ? shuffleWords(deck.words)
                        : sortWordsBySRSPriority(
                            deck.words,
                            userProfile.flashcardStats,
                            userProfile.flashcardProgress
                          ),
                      deck.title,
                      shuffleDecks
                    )
                  }
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white shadow-xs transition active:scale-98 cursor-pointer ${
                    isAlef
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Тренировать</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenListModal(deck)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Посмотреть список слов"
                >
                  <List className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Слова ({deck.words.length})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>



      {/* МОДАЛЬНОЕ ОКНО «ВЫВЕСТИ КОЛОДУ СПИСКОМ» */}
      {listModalDeck && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden"
          onClick={handleCloseListModal}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-4xl min-w-0 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden mx-auto"
            style={{ maxWidth: 'calc(100vw - 16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модалки */}
            <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                    listModalDeck.level === 'alef'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {renderIcon(listModalDeck.icon, 'w-5 h-5 sm:w-6 sm:h-6')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Уровень {listModalDeck.level === 'alef' ? 'Алеф (א)' : 'Бет (ב)'}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {listModalDeck.words.length} слов
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-lg line-clamp-2 mt-0.5 leading-snug">
                    {listModalDeck.title}
                  </h3>
                </div>
              </div>

              {/* Действия шапки: Копировать слова, Экспорт TSV, Закрыть */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => handleCopyList(listModalDeck)}
                  className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    copiedNotification
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Скопировать все слова набора в буфер обмена"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden md:inline">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Копировать список</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadTsv(listModalDeck)}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition"
                  title="Экспорт в Anki / TSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">TSV (Anki)</span>
                </button>

                <button
                  onClick={handleCloseListModal}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                  title="Закрыть"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Фильтр поиска по списку и массовые операции */}
            <div className="p-2.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Поиск по слову или переводу..."
                    className="w-full min-w-0 pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Переключатель вида: Карточки / Таблица */}
                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalViewMode('cards')}
                    className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      modalViewMode === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Вид: Карточки (удобно для мобильных)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Карточки</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalViewMode('table')}
                    className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      modalViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Вид: Таблица (сводный список)"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Таблица</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 text-xs min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelectAllModalWords(modalFilteredWords)}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                  >
                    {selectedWordIds.size === modalFilteredWords.length ? (
                      <>
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        <span>Снять</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Все ({modalFilteredWords.length})</span>
                      </>
                    )}
                  </button>

                  {modalFilteredWords.length > 10 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          const shuffled = shuffleWords(modalFilteredWords);
                          const picked = shuffled.slice(0, 10).map((w) => w.id);
                          setSelectedWordIds(new Set(picked));
                        }}
                        className="text-slate-600 dark:text-slate-400 hover:text-purple-600 flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                        title="Выбрать 10 случайных слов для быстрой тренировки"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>10 вразброс</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    Выбрано: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedWordIds.size}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Содержимое списка слов: Карточки или Таблица */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-4">
              {modalFilteredWords.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Ничего не найдено по запросу «{modalSearch}»
                </div>
              ) : modalViewMode === 'cards' ? (
                /* РЕЖИМ 1: КАРТОЧКИ (максимально понятная адаптивная верстка, крупный перевод) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
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
                      <div
                        key={word.id}
                        onClick={() => toggleSelectWord(word.id)}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 min-w-0 w-full ${
                          isChecked
                            ? 'bg-blue-50/50 dark:bg-blue-950/25 border-blue-300 dark:border-blue-800 shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Верхняя строка карточки */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectWord(word.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {word.root && (
                              <span
                                dir="rtl"
                                className="font-mono text-[11px] text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200/60 dark:border-purple-800/60"
                                title={`Корень: ${word.root}`}
                              >
                                {word.root}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${wordMastery.badgeBg}`}
                            >
                              {wordMastery.score}%
                            </span>
                          </div>
                        </div>

                        {/* Центральный блок: Иврит, Транскрипция, ПОЛНЫЙ перевод */}
                        <div className="space-y-1 my-0.5 min-w-0">
                          <div className="flex items-baseline gap-2.5 flex-wrap min-w-0">
                            <span
                              dir="rtl"
                              className={`font-bold text-slate-900 dark:text-white ${
                                isCursive
                                  ? 'font-cursive text-2xl text-blue-600 dark:text-blue-400'
                                  : 'font-hebrew text-lg sm:text-xl'
                              }`}
                            >
                              {userProfile.showNikkud ? word.hebrew : word.hebrewPlain || stripNikkud(word.hebrew)}
                            </span>

                            {getWordTranscription(word) && (
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                [{getWordTranscription(word)}]
                              </span>
                            )}
                          </div>

                          {/* РУССКИЙ ПЕРЕВОД: крупный, четкий, занимает всю ширину без обрезания */}
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                            {word.translation}
                          </p>
                        </div>

                        {/* Нижняя панель действий */}
                        <div
                          className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-1.5 min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="shrink-0">
                            {isVerb ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPealim(word)}
                                className="px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 transition"
                                title="Таблица спряжений и семья корня (Pealim)"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                <span>Пеалим</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {word.plural ? `мн: ${word.plural}` : word.partOfSpeech}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSpeak(word.hebrew, word.id)}
                              className={`p-1.5 rounded-lg transition ${
                                isSpeaking
                                  ? 'bg-blue-600 text-white animate-pulse'
                                  : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                              }`}
                              title="Озвучить"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => !isWordInDict && handleAddSingleWord(word)}
                              disabled={isWordInDict}
                              className={`p-1.5 px-2 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                isWordInDict
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200/60 dark:border-emerald-800/60'
                                  : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-blue-50 hover:text-blue-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                              }`}
                              title={isWordInDict ? 'Уже в словарике' : 'Добавить в личный словарь'}
                            >
                              {isWordInDict ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">В словаре</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">В словарь</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* РЕЖИМ 2: ТАБЛИЦА С ГОРИЗОНТАЛЬНОЙ ПРОКРУТКОЙ И МИНИМАЛЬНОЙ ШИРИНОЙ ПЕРЕВОДА */
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-xs text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-3 w-40">Иврит (Инфинитив)</th>
                        <th className="py-2.5 px-3 w-36">Транскрипция</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Перевод на русский</th>
                        <th className="py-2.5 px-3 w-32 hidden md:table-cell">Корень / Биньян</th>
                        <th className="py-2.5 px-3 w-20 text-center">Освоение</th>
                        <th className="py-2.5 px-3 w-44 text-right">Действия</th>
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
                            <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                              {getWordTranscription(word) ? `[${getWordTranscription(word)}]` : '—'}
                            </td>

                            {/* Перевод на русский */}
                            <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words">
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
              )}
            </div>

            {/* Футер модалки: Тренировать выбранные / Добавить выбранные */}
            <div className="p-3 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Слов для тренировки:{' '}
                <strong className="text-blue-600 dark:text-blue-400 font-bold">
                  {selectedWordIds.size} из {listModalDeck.words.length}
                </strong>
              </div>

              {/* На мобильном: Сетка из 2 кнопок (Вразброс / В словарь) + большая главная кнопка Тренировать. На sm+: все 3 кнопки в один ряд */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const selectedWords = listModalDeck.words.filter((w) => selectedWordIds.has(w.id));
                      if (selectedWords.length > 0) {
                        onStartTraining(
                          shuffleWords(selectedWords),
                          listModalDeck.title,
                          true
                        );
                        handleCloseListModal();
                      }
                    }}
                    disabled={selectedWordIds.size === 0}
                    className="px-2 sm:px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 disabled:opacity-50 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Тренировать выбранные слова в случайном порядке (Shuffle)"
                  >
                    <Shuffle className="w-4 h-4 shrink-0" />
                    <span>Вразброс ({selectedWordIds.size})</span>
                  </button>

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
                    className="px-2 sm:px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <BookmarkPlus className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span>В словарь ({selectedWordIds.size})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const selectedWords = listModalDeck.words.filter((w) => selectedWordIds.has(w.id));
                    if (selectedWords.length > 0) {
                      onStartTraining(
                        shuffleDecks
                          ? shuffleWords(selectedWords)
                          : sortWordsBySRSPriority(
                              selectedWords,
                              userProfile.flashcardStats,
                              userProfile.flashcardProgress
                            ),
                        listModalDeck.title,
                        shuffleDecks
                      );
                      handleCloseListModal();
                    }
                  }}
                  disabled={selectedWordIds.size === 0}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition active:scale-98 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>{shuffleDecks ? 'Тренировать вразброс' : 'Тренировать'} ({selectedWordIds.size})</span>
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
