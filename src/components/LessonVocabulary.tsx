import React, { useState } from 'react';
import {
  Volume2,
  Plus,
  Check,
  Search,
  Sparkles,
  Play,
  Layers,
  Filter,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Word, UserProfile, PartOfSpeech } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { stripNikkud } from '@/lib/transcription';
import { saveUserProfile, markLessonTabCompleted } from '@/lib/storage';

interface LessonVocabularyProps {
  lessonId?: number;
  words: Word[];
  userProfile: UserProfile;
  onCompleted?: () => void;
  onStartPractice?: (words: Word[]) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const LessonVocabulary: React.FC<LessonVocabularyProps> = ({
  lessonId,
  words,
  userProfile,
  onCompleted,
  onStartPractice,
  onUpdateProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [revealedRoots, setRevealedRoots] = useState<Record<string, boolean>>({});

  const handleMarkDone = () => {
    if (lessonId) {
      const updated = markLessonTabCompleted(lessonId, 'vocab');
      if (onUpdateProfile) onUpdateProfile(updated);
    }
    if (onCompleted) onCompleted();
  };

  const handleStartPracticeWithMark = (wordsToTrain: Word[]) => {
    if (lessonId) {
      const updated = markLessonTabCompleted(lessonId, 'vocab');
      if (onUpdateProfile) onUpdateProfile(updated);
    }
    if (onStartPractice) onStartPractice(wordsToTrain);
  };

  const filteredWords = words.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return selectedPos === 'all' || w.partOfSpeech === selectedPos;
    }
    const matchesSearch =
      (w.hebrew || '').toLowerCase().includes(q) ||
      (w.hebrewPlain || '').toLowerCase().includes(q) ||
      (w.translation || '').toLowerCase().includes(q) ||
      (w.transcription || '').toLowerCase().includes(q);

    const matchesPos = selectedPos === 'all' || w.partOfSpeech === selectedPos;
    return matchesSearch && matchesPos;
  });

  const wordsWithRoots = filteredWords.filter((w) => Boolean(w.root));
  const allRevealed =
    wordsWithRoots.length > 0 &&
    wordsWithRoots.every((w) => Boolean(revealedRoots[w.id]));

  const handleToggleAllRoots = () => {
    const nextState = !allRevealed;
    const nextMap: Record<string, boolean> = { ...revealedRoots };
    wordsWithRoots.forEach((w) => {
      nextMap[w.id] = nextState;
    });
    setRevealedRoots(nextMap);
  };

  const handleToggleDict = (word: Word) => {
    const cleanWordHeb = stripNikkud(word.hebrew);
    let updatedVocab = [...(userProfile.personalVocabulary || [])];
    const isAlreadyIn = updatedVocab.some(
      (pw) => stripNikkud(pw.hebrew) === cleanWordHeb
    );

    if (isAlreadyIn) {
      updatedVocab = updatedVocab.filter(
        (pw) => stripNikkud(pw.hebrew) !== cleanWordHeb
      );
    } else {
      const newWord: Word = {
        ...word,
        id: `user-word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        isUserAdded: true,
        dateAdded: Date.now(),
      };
      updatedVocab.unshift(newWord);
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      personalVocabulary: updatedVocab,
    };

    saveUserProfile(updatedProfile);
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
  };

  const getPosBadge = (pos: PartOfSpeech) => {
    switch (pos) {
      case 'noun':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">Сущ.</span>;
      case 'verb':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">Глагол</span>;
      case 'adjective':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200">Прил.</span>;
      case 'expression':
        return <span className="px-2 py-0.5 rounded text-[11px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">Фраза</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Слово</span>;
    }
  };

  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="space-y-6">
      {/* Верхняя панель управления */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по ивриту, транскрипции или переводу..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Все части речи</option>
            <option value="noun">Существительные</option>
            <option value="verb">Глаголы</option>
            <option value="adjective">Прилагательные</option>
            <option value="expression">Фразы и выражения</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {wordsWithRoots.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAllRoots}
              className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition ${
                allRevealed
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
              title={allRevealed ? 'Скрыть все корни (включить блюр)' : 'Показать все корни'}
            >
              {allRevealed ? (
                <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span className="hidden sm:inline">{allRevealed ? 'Скрыть корни' : 'Показать корни'}</span>
            </button>
          )}

          {onStartPractice && (
            <button
              onClick={() => onStartPractice(filteredWords)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
            >
              <Layers className="w-4 h-4" />
              <span>Тренировать карточками ({filteredWords.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Список слов карточками / таблицей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((word) => {
          const inDict = (userProfile.personalVocabulary || []).some(
            (pw) => stripNikkud(pw.hebrew) === stripNikkud(word.hebrew)
          );
          const isRootRevealed = Boolean(revealedRoots[word.id]);

          return (
            <div
              key={word.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getPosBadge(word.partOfSpeech)}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => speakHebrew(word.hebrew)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 transition"
                      title="Прослушать произношение"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleDict(word)}
                      className={`p-1.5 rounded-lg transition ${
                        inDict
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                      title={inDict ? 'Удалить из словарика' : 'Добавить в мой словарик'}
                    >
                      {inDict ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Слово на иврите */}
                <div
                  dir="rtl"
                  className={`font-bold ${
                    isCursive
                      ? 'font-cursive text-3xl md:text-4xl text-blue-600 dark:text-blue-400'
                      : 'font-hebrew text-2xl text-zinc-900 dark:text-zinc-50'
                  }`}
                >
                  {userProfile.showNikkud ? word.hebrew : word.hebrewPlain}
                </div>

                {/* Транскрипция с 'h' для ה */}
                {userProfile.showTranscription && (
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                    [{word.transcription}]
                  </p>
                )}

                {/* Перевод */}
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mt-2">
                  {word.translation}
                </p>
              </div>

              {/* Нижняя часть (корень / пример) */}
              {(word.root || word.exampleSentence) && (
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                  {word.root && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                      <span className="text-[11px] text-zinc-400">Шореш:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedRoots((prev) => ({
                            ...prev,
                            [word.id]: !prev[word.id],
                          }))
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all duration-200 cursor-pointer group text-left ${
                          isRootRevealed
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
                            : 'bg-zinc-100/80 dark:bg-zinc-800/80 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-700 text-zinc-600 dark:text-zinc-300'
                        }`}
                        title={
                          isRootRevealed
                            ? 'Нажмите, чтобы скрыть корень (блюр)'
                            : 'Нажмите, чтобы показать корень'
                        }
                      >
                        <span
                          dir="rtl"
                          className={`font-bold transition-all duration-300 select-none ${
                            isRootRevealed
                              ? 'blur-none'
                              : 'blur-[5px] group-hover:blur-[3px]'
                          } ${isCursive ? 'font-cursive text-xl' : ''}`}
                        >
                          {word.root}
                        </span>
                        {isRootRevealed ? (
                          <EyeOff className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
                        ) : (
                          <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {word.exampleSentence && (
                    <div className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg">
                      <p dir="rtl" className={`font-medium ${isCursive ? 'font-cursive text-xl text-blue-600 dark:text-blue-400' : 'font-hebrew text-zinc-800 dark:text-zinc-200'}`}>
                        {word.exampleSentence.hebrew}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {word.exampleSentence.translation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Завершение этапа словаря */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 pb-8 border-t border-zinc-200 dark:border-zinc-800">
        {onStartPractice && (
          <button
            onClick={() => handleStartPracticeWithMark(filteredWords)}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Тренировать в карточках ({filteredWords.length})</span>
          </button>
        )}

        <button
          onClick={handleMarkDone}
          className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>Я выучил слова • Перейти к упражнениям (этап 3/4) ➡️</span>
        </button>
      </div>
    </div>
  );
};
