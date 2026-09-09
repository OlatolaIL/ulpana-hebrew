'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  Plus,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  Filter,
} from 'lucide-react';
import { Word, UserProfile, VerbConjugation } from '@/types';
import { speakHebrew } from '@/lib/speech';
import {
  removeWordFromPersonalDict,
  addWordToPersonalDict,
  loadUserProfile,
  calculateWordMastery,
  isWordInPersonalDict,
  sortWordsBySRSPriority,
} from '@/lib/storage';
import { stripNikkud, getWordTranscription, generateHebrewTranscription } from '@/lib/transcription';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';
import { THEMATIC_DECKS } from '@/data/thematicDecks';
import { ThematicDecksView } from './ThematicDecksView';
import { useModalHistory } from '@/lib/useHistoryState';

interface PersonalDictionaryProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onStartPractice: (
    words: Word[],
    title?: string,
    mode?: 'flip' | 'builder' | 'listening',
    shuffle?: boolean
  ) => void;
  onOpenMultiLessonSetup?: () => void;
}

type DictTab = 'personal' | 'thematic' | 'lessons';
type MasteryFilter = 'all' | 'due' | 'learning' | 'mastered';

export const PersonalDictionary: React.FC<PersonalDictionaryProps> = ({
  userProfile,
  onUpdateProfile,
  onStartPractice,
  onOpenMultiLessonSetup,
}) => {
  const [activeTab, setActiveTab] = useState<DictTab>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
  const [revealedRoots, setRevealedRoots] = useState<Record<string, boolean>>({});
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newHebrew, setNewHebrew] = useState('');
  const [newTranscription, setNewTranscription] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newRoot, setNewRoot] = useState('');

  const [selectedThematicDeckId, setSelectedThematicDeckId] = useState<string | null>(null);

  const handleOpenThematicDeck = (deckId: string) => {
    setSelectedThematicDeckId(deckId);
    setActiveTab('thematic');
  };

  // Состояние модального окна Pealim для просмотра спряжений и корней
  const [pealimModalVerb, setPealimModalVerb] = useState<{
    word: Word;
    conjugation: VerbConjugation | null;
    loading: boolean;
  } | null>(null);

  useModalHistory(Boolean(pealimModalVerb), () => setPealimModalVerb(null), 'pealim-dict');
  useModalHistory(isAddingCustom, () => setIsAddingCustom(false), 'add-custom-word');

  const handleOpenPealim = async (word: Word) => {
    const offlineMatch =
      findOfflineVerbConjugation(word.hebrew) ||
      findOfflineVerbConjugation(word.hebrewPlain || stripNikkud(word.hebrew));

    if (offlineMatch) {
      setPealimModalVerb({
        word,
        conjugation: offlineMatch,
        loading: false,
      });
      return;
    }

    setPealimModalVerb({
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
          setPealimModalVerb({
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

    setPealimModalVerb((prev) => (prev ? { ...prev, loading: false } : null));
  };

  const words = userProfile.personalVocabulary || [];

  // Статистика личного словарика
  const dictStats = useMemo(() => {
    let totalScore = 0;
    let dueCount = 0;
    let masteredCount = 0;
    let learningCount = 0;

    words.forEach((w) => {
      const stats =
        userProfile.flashcardStats?.[w.id] ||
        userProfile.flashcardProgress?.[w.id] ||
        (w.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(w.hebrewPlain)] : undefined) ||
        userProfile.flashcardStats?.[stripNikkud(w.hebrew)];
      const m = calculateWordMastery(stats);
      totalScore += m.score;
      if (m.isDue) dueCount++;
      if (m.level === 'mastered') masteredCount++;
      if (m.level === 'learning' || m.level === 'reviewing') learningCount++;
    });

    const avgScore = words.length > 0 ? Math.round(totalScore / words.length) : 0;
    return { avgScore, dueCount, masteredCount, learningCount, total: words.length };
  }, [words, userProfile.flashcardStats, userProfile.flashcardProgress]);

  // Фильтрация слов по поиску и уровню знания
  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      // Поиск
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          (w.hebrew || '').toLowerCase().includes(q) ||
          (w.hebrewPlain || '').toLowerCase().includes(q) ||
          (w.translation || '').toLowerCase().includes(q) ||
          (w.transcription || '').toLowerCase().includes(q) ||
          (w.root || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Фильтр мастерства
      if (masteryFilter !== 'all') {
        const stats =
          userProfile.flashcardStats?.[w.id] ||
          userProfile.flashcardProgress?.[w.id] ||
          (w.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(w.hebrewPlain)] : undefined) ||
          userProfile.flashcardStats?.[stripNikkud(w.hebrew)];
        const m = calculateWordMastery(stats);
        if (masteryFilter === 'due' && !m.isDue) return false;
        if (masteryFilter === 'mastered' && m.level !== 'mastered') return false;
        if (masteryFilter === 'learning' && m.level !== 'learning' && m.level !== 'reviewing') return false;
      }

      return true;
    });
  }, [words, searchQuery, masteryFilter, userProfile.flashcardStats, userProfile.flashcardProgress]);

  const handleDelete = (wordId: string) => {
    removeWordFromPersonalDict(wordId);
    onUpdateProfile(loadUserProfile());
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHebrew.trim() || !newTranslation.trim()) return;

    addWordToPersonalDict({
      hebrew: newHebrew.trim(),
      hebrewPlain: stripNikkud(newHebrew.trim()),
      transcription: newTranscription.trim() || generateHebrewTranscription(newHebrew.trim()),
      translation: newTranslation.trim(),
      partOfSpeech: 'other',
      root: newRoot.trim() || undefined,
      lessonId: 0,
    });

    onUpdateProfile(loadUserProfile());
    setNewHebrew('');
    setNewTranscription('');
    setNewTranslation('');
    setNewRoot('');
    setIsAddingCustom(false);
  };

  const isCursive = userProfile.fontStyle === 'cursive';

  const handleToggleFont = () => {
    const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
    try {
      localStorage.setItem('ulpana_user_profile', JSON.stringify(updated));
    } catch {}
    onUpdateProfile(updated);
  };

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Главные вкладки раздела: Личный словарь / Тематические колоды */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-2xl border border-slate-300/70 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
              : 'text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-700/60'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>{userProfile.ulpanMode ? 'הַמִּילוֹן שֶׁלִּי' : 'Мой словарик'}</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'personal'
                ? 'bg-white/20 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            {words.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('thematic')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'thematic'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
              : 'text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-700/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{userProfile.ulpanMode ? 'עֶרְכּוֹת נוֹשְׂאִיּוֹת' : 'Тематические колоды'}</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
              activeTab === 'thematic'
                ? 'bg-white/20 text-white'
                : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-800'
            }`}
          >
            {THEMATIC_DECKS.length}
          </span>
        </button>
      </div>

      {/* РЕНДЕР ВКЛАДКИ «ТЕМАТИЧЕСКИЕ КОЛОДЫ» */}
      {activeTab === 'thematic' && (
        <ThematicDecksView
          userProfile={userProfile}
          initialDeckId={selectedThematicDeckId}
          onCloseInitialDeck={() => setSelectedThematicDeckId(null)}
          onStartTraining={(deckWords, title, shuffle) =>
            onStartPractice(deckWords, title, undefined, shuffle)
          }
          onUpdateVocabulary={(newWords) => {
            onUpdateProfile(loadUserProfile());
          }}
        />
      )}

      {/* РЕНДЕР ВКЛАДКИ «МОЙ ЛИЧНЫЙ СЛОВАРЬ» */}
      {activeTab === 'personal' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Компактная панель поиска и действий */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  userProfile.ulpanMode
                    ? 'חִפּוּשׂ מִילָּה בַּמִּילוֹן...'
                    : 'Поиск по ивриту, транскрипции или переводу...'
                }
                className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleToggleFont}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition shrink-0 cursor-pointer"
              title={userProfile.ulpanMode ? 'החלף גופן' : 'Переключить шрифт: Печатный / Рукописный'}
            >
              <span className={isCursive ? 'font-cursive text-base font-bold text-blue-600 dark:text-blue-400 leading-none' : 'font-hebrew text-xs font-bold leading-none'}>
                {isCursive ? 'כתב' : 'דפוס'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="h-9 sm:h-10 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition shrink-0 cursor-pointer"
              title={userProfile.ulpanMode ? 'הוֹסֵף מִילָּה' : 'Добавить слово'}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline font-hebrew">
                {userProfile.ulpanMode ? 'הוֹסֵף' : 'Добавить'}
              </span>
            </button>
          </div>

          {/* Панель фильтров и кнопка тренировки карточек */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {/* Фильтры по знанию */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 font-hebrew">
              <button
                onClick={() => setMasteryFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  masteryFilter === 'all'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {userProfile.ulpanMode ? `הַכֹּל (${words.length})` : `Все (${words.length})`}
              </button>

              <button
                onClick={() => setMasteryFilter('due')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  masteryFilter === 'due'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : dictStats.dueCount > 0
                    ? 'text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800'
                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>⚡</span>
                <span>
                  {userProfile.ulpanMode
                    ? `לַחֲזָרָה (${dictStats.dueCount})`
                    : `К повторению (${dictStats.dueCount})`}
                </span>
              </button>

              <button
                onClick={() => setMasteryFilter('learning')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  masteryFilter === 'learning'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {userProfile.ulpanMode
                  ? `בְּלְמִידָה (${dictStats.learningCount})`
                  : `Изучаю (${dictStats.learningCount})`}
              </button>

              <button
                onClick={() => setMasteryFilter('mastered')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  masteryFilter === 'mastered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {userProfile.ulpanMode
                  ? `הוּשְׁלַם (${dictStats.masteredCount})`
                  : `Выучено (${dictStats.masteredCount})`}
              </button>
            </div>

            {/* Главная кнопка тренировки карточек */}
            {words.length > 0 && (
              <button
                onClick={() => {
                  const pool = filteredWords.length > 0 ? filteredWords : words;
                  const sorted = sortWordsBySRSPriority(
                    pool,
                    userProfile.flashcardStats,
                    userProfile.flashcardProgress
                  );
                  onStartPractice(
                    sorted,
                    userProfile.ulpanMode ? 'הַמִּילוֹן שֶׁלִּי' : 'Мой словарик'
                  );
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer shrink-0 font-hebrew"
              >
                <Layers className="w-4 h-4" />
                <span>
                  {dictStats.dueCount > 0 && masteryFilter === 'all'
                    ? (userProfile.ulpanMode ? `חֲזָרָה עַל מִילִּים (${dictStats.dueCount})` : `Повторить карточки (⚡ ${dictStats.dueCount})`)
                    : (userProfile.ulpanMode ? `תִּרְגּוּל (${filteredWords.length})` : `Тренировать карточки (${filteredWords.length})`)}
                </span>
              </button>
            )}
          </div>

          {/* Список слов */}
          {filteredWords.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 space-y-3">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                {words.length === 0 ? 'В словарике пока нет слов' : 'Ничего не найдено по фильтру'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {words.length === 0
                  ? 'Слова добавляются автоматически при прохождении уроков, из тематических колод или вручную.'
                  : 'Попробуйте изменить поисковый запрос или сбросить фильтр.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWords.map((word) => {
                const stats =
                  userProfile.flashcardStats?.[word.id] ||
                  userProfile.flashcardProgress?.[word.id] ||
                  (word.hebrewPlain ? userProfile.flashcardStats?.[stripNikkud(word.hebrewPlain)] : undefined) ||
                  userProfile.flashcardStats?.[stripNikkud(word.hebrew)];
                const mastery = calculateWordMastery(stats);

                return (
                  <div
                    key={word.id}
                    className="bg-white dark:bg-slate-800/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <button
                        onClick={() => speakHebrew(word.hebrew, { rate: userProfile.speechRate || 0.7 })}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 transition shrink-0"
                        title="Озвучить слово"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            dir="rtl"
                            className={`font-bold ${
                              isCursive
                                ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                                : 'font-hebrew text-lg sm:text-xl text-slate-900 dark:text-slate-50'
                            }`}
                          >
                            {userProfile.showNikkud ? word.hebrew : word.hebrewPlain || stripNikkud(word.hebrew)}
                          </div>

                          {/* Бейдж оценки знания (Mastery Score) */}
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${mastery.badgeColor}`}
                            title={`Освоение: ${mastery.score}% (${mastery.label})`}
                          >
                            {mastery.score}%
                          </span>

                          {mastery.isDue && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                              ⚡
                            </span>
                          )}
                        </div>

                        {!userProfile.ulpanMode && userProfile.showTranscription && getWordTranscription(word) && (
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            [{getWordTranscription(word)}]
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
                          {word.translation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Кнопка ПЕАЛИМ для глаголов */}
                      {(word.partOfSpeech === 'verb' || word.hebrew.startsWith('לִ') || word.hebrew.startsWith('לְ') || word.hebrew.startsWith('לַ') || word.hebrew.startsWith('לָ') || Boolean(word.root)) && (
                        <button
                          type="button"
                          onClick={() => handleOpenPealim(word)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-800/60 transition"
                          title="Таблица спряжений и семья корня (Pealim)"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>Пеалим</span>
                        </button>
                      )}

                      {word.root && (
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedRoots((prev) => ({
                              ...prev,
                              [word.id]: !prev[word.id],
                            }))
                          }
                          className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border transition-all cursor-pointer group ${
                            revealedRoots[word.id]
                              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-100/80 dark:bg-slate-800/80 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-300 text-slate-600 dark:text-slate-300'
                          }`}
                          title={
                            revealedRoots[word.id]
                              ? 'Нажмите, чтобы скрыть корень (блюр)'
                              : 'Нажмите, чтобы показать корень'
                          }
                        >
                          <span className="text-[10px] text-slate-400">Корень:</span>
                          <span
                            dir="rtl"
                            className={`transition-all duration-300 select-none ${
                              revealedRoots[word.id]
                                ? 'blur-none font-bold'
                                : 'blur-[4px] group-hover:blur-[2px]'
                            } ${isCursive ? 'font-cursive text-base' : 'font-mono'}`}
                          >
                            {word.root}
                          </span>
                          {revealedRoots[word.id] ? (
                            <EyeOff className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(word.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Удалить из словарика"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Модалка добавления кастомного слова */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Добавить слово в словарик
            </h3>

            <form onSubmit={handleCreateWord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Слово на иврите (с огласовками или без)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newHebrew}
                  onChange={(e) => setNewHebrew(e.target.value)}
                  placeholder="לְמָשָׁל: חָבֵר"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-hebrew focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Транскрипция (с буквой h для ה)
                </label>
                <input
                  type="text"
                  value={newTranscription}
                  onChange={(e) => setNewTranscription(e.target.value)}
                  placeholder="хавéр / hа-бáйит"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Перевод на русский
                </label>
                <input
                  type="text"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="друг, товарищ"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Корень слова (Шореш, не обязательно)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newRoot}
                  onChange={(e) => setNewRoot(e.target.value)}
                  placeholder="ח-ב-ר"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-hebrew focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно PEALIM (Спряжения и Семья корней) */}
      {pealimModalVerb && (
        <div
          onClick={() => setPealimModalVerb(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 max-h-[90vh] overflow-y-auto relative"
          >
            {pealimModalVerb.loading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">Загружаем спряжения и семью корня Pealim...</p>
              </div>
            ) : pealimModalVerb.conjugation ? (
              <VerbConjugationView
                conjugation={pealimModalVerb.conjugation}
                userProfile={userProfile}
                onBack={() => setPealimModalVerb(null)}
                onAddToVocabulary={(w) => {
                  addWordToPersonalDict(w);
                  onUpdateProfile(loadUserProfile());
                }}
                isWordInPersonalVocab={isWordInPersonalDict(pealimModalVerb.word.hebrew, userProfile.personalVocabulary)}
              />
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Спряжения для глагола <strong className="font-hebrew text-base">{pealimModalVerb.word.hebrew}</strong> пока недоступны.
                </p>
                <button
                  onClick={() => setPealimModalVerb(null)}
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


