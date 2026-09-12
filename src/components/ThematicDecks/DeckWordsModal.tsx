import React, { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  Download,
  X,
  Search,
  LayoutGrid,
  Table,
  CheckSquare,
  Square,
  Shuffle,
  Sparkles,
  Volume2,
  Plus,
  BookmarkPlus,
  Play,
} from 'lucide-react';
import { ThematicDeck, UserProfile, Word } from '@/types';
import { getDeckWordsAsText, exportDeckToTsv } from '@/data/thematicDecks';
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
import { DeckIcon } from './DeckIcon';

interface DeckWordsModalProps {
  deck: ThematicDeck;
  userProfile: UserProfile;
  shuffleDecks: boolean;
  onClose: () => void;
  onStartTraining: (words: Word[], deckTitle: string, shuffle?: boolean) => void;
  onUpdateVocabulary: (newWords: Word[]) => void;
  onOpenPealim: (word: Word) => void;
}

export const DeckWordsModal: React.FC<DeckWordsModalProps> = ({
  deck,
  userProfile,
  shuffleDecks,
  onClose,
  onStartTraining,
  onUpdateVocabulary,
  onOpenPealim,
}) => {
  const [modalSearch, setModalSearch] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(
    () => new Set(deck.words.map((w) => w.id))
  );
  const [modalViewMode, setModalViewMode] = useState<'cards' | 'table'>('cards');
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  const isCursive = userProfile.fontStyle === 'cursive';

  const handleSpeak = (text: string, id: string) => {
    setSpeakingWordId(id);
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
    setTimeout(() => setSpeakingWordId(null), 1200);
  };

  const handleAddSingleWord = (word: Word) => {
    const added = addWordToPersonalDict({
      hebrew: word.hebrew,
      hebrewPlain: word.hebrewPlain || stripNikkud(word.hebrew),
      translation: word.translation,
      transcription: word.transcription,
      partOfSpeech: word.partOfSpeech || 'noun',
      gender: word.gender,
      plural: word.plural,
      root: word.root,
      lessonId: word.lessonId ?? 0,
    });
    if (added) {
      onUpdateVocabulary([added, ...(userProfile.personalVocabulary || [])]);
    }
  };

  const handleCopyList = (targetDeck: ThematicDeck) => {
    const text = getDeckWordsAsText(targetDeck.id, {
      withNikkud: userProfile.showNikkud,
      withTranscription: true,
      withRoot: true,
    });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const handleDownloadTsv = (targetDeck: ThematicDeck) => {
    const tsvContent = exportDeckToTsv(targetDeck.id);
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deck_${targetDeck.id}.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  const modalFilteredWords = useMemo(() => {
    if (!modalSearch.trim()) return deck.words;
    const q = modalSearch.toLowerCase().trim();
    return deck.words.filter(
      (w) =>
        w.hebrew.includes(q) ||
        (w.hebrewPlain && w.hebrewPlain.includes(q)) ||
        w.translation.toLowerCase().includes(q) ||
        (w.transcription && w.transcription.toLowerCase().includes(q)) ||
        (w.root && w.root.toLowerCase().includes(q))
    );
  }, [deck, modalSearch]);

  const isVerbWord = (w: Word) =>
    w.partOfSpeech === 'verb' ||
    w.hebrew.startsWith('לְ') ||
    w.hebrew.startsWith('לַ') ||
    w.hebrew.startsWith('לָ') ||
    Boolean(w.root);

  const getCategoryTitle = () => {
    if (deck.category === 'caregiver') return '👩‍⚕️ Метапелет';
    if (deck.category === 'autoRepair') return '🔧 Автомастерская';
    if (deck.category === 'kindergarten') return '👶 Детский сад';
    if (deck.category === 'doctor') return '🏥 Врач';
    if (deck.category === 'accounting') return '💼 Бухгалтер';
    if (deck.category === 'librarian') return '📚 Библиотекарь и архивариус';
    if (deck.category === 'carWash') return '🚿 Автомойка и детейлинг';
    return `Уровень ${deck.level === 'alef' ? 'Алеф (א)' : deck.level === 'bet' ? 'Бет (ב)' : 'Все'}`;
  };

  const getCategoryHeaderIconStyle = () => {
    if (deck.category === 'caregiver') return 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400';
    if (deck.category === 'autoRepair') return 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400';
    if (deck.category === 'kindergarten') return 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400';
    if (deck.category === 'doctor') return 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400';
    if (deck.category === 'accounting') return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
    if (deck.category === 'librarian') return 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400';
    if (deck.category === 'carWash') return 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400';
    if (deck.level === 'alef') return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
    return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
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
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${getCategoryHeaderIconStyle()}`}
            >
              <DeckIcon name={deck.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {getCategoryTitle()}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {deck.words.length} слов
                </span>
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-lg line-clamp-2 mt-0.5 leading-snug">
                {deck.title}
              </h3>
            </div>
          </div>

          {/* Действия шапки: Копировать слова, Экспорт TSV, Закрыть */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => handleCopyList(deck)}
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
              onClick={() => handleDownloadTsv(deck)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition"
              title="Экспорт в Anki / TSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">TSV (Anki)</span>
            </button>

            <button
              onClick={onClose}
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
                            onClick={() => onOpenPealim(word)}
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

                        <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                          {getWordTranscription(word) ? `[${getWordTranscription(word)}]` : '—'}
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words">
                          {word.translation}
                        </td>

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

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${wordMastery.badgeBg}`}
                          >
                            {wordMastery.score}%
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {isVerb && (
                              <button
                                type="button"
                                onClick={() => onOpenPealim(word)}
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
              {selectedWordIds.size} из {deck.words.length}
            </strong>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => {
                  const selectedWords = deck.words.filter((w) => selectedWordIds.has(w.id));
                  if (selectedWords.length > 0) {
                    onStartTraining(shuffleWords(selectedWords), deck.title, true);
                    onClose();
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
                  const selectedWords = deck.words.filter((w) => selectedWordIds.has(w.id));
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
                const selectedWords = deck.words.filter((w) => selectedWordIds.has(w.id));
                if (selectedWords.length > 0) {
                  onStartTraining(
                    shuffleDecks
                      ? shuffleWords(selectedWords)
                      : sortWordsBySRSPriority(
                          selectedWords,
                          userProfile.flashcardStats,
                          userProfile.flashcardProgress
                        ),
                    deck.title,
                    shuffleDecks
                  );
                  onClose();
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
  );
};
