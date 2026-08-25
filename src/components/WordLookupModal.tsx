'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Plus, Check, X, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { UserProfile, Word, VerbConjugation } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { addWordToPersonalDict, isWordInPersonalDict } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { lookupOfflineWord } from '@/lib/ulpanDictionary';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';

interface WordLookupModalProps {
  word: string;
  context?: string;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onWordAdded?: (word: Word) => void;
}

export const WordLookupModal: React.FC<WordLookupModalProps> = ({
  word,
  context,
  isOpen,
  onClose,
  userProfile,
  onWordAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'conjugation'>('summary');
  const [conjugationData, setConjugationData] = useState<VerbConjugation | null>(null);
  const [loadingConjugation, setLoadingConjugation] = useState(false);

  const [wordData, setWordData] = useState<{
    hebrew: string;
    transcription: string;
    translation: string;
    root?: string | null;
    partOfSpeech?: string;
    exampleSentence?: {
      hebrew: string;
      transcription: string;
      translation: string;
    } | null;
  } | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  // Обработка закрытия по Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !word) return;

    setViewMode('summary');
    setLoadingConjugation(false);
    setIsAdded(isWordInPersonalDict(word));

    // Проверяем встроенную оффлайн-базу спряжений
    const offlineConj = findOfflineVerbConjugation(word);
    setConjugationData(offlineConj);

    // 1. Мгновенная проверка по встроенному оффлайн-словарю (0 мс)
    const localMatch = lookupOfflineWord(word);
    if (localMatch) {
      setWordData({
        hebrew: localMatch.hebrew,
        transcription: localMatch.transcription,
        translation: localMatch.translation,
        root: localMatch.root || null,
        partOfSpeech: localMatch.partOfSpeech,
        exampleSentence: localMatch.exampleSentence || null,
      });
      setIsAdded(isWordInPersonalDict(localMatch.hebrew || word));
      setLoading(false);
      return;
    }

    // 2. Если в оффлайн-словаре нет — запрашиваем через серверный API
    setLoading(true);

    fetch('/api/ai/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word,
        context,
        provider: userProfile.aiProvider,
        apiKey:
          userProfile.aiProvider === 'groq'
            ? userProfile.groqApiKey
            : userProfile.geminiApiKey,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data && !data.error && data.translation) {
          setWordData(data);
          setIsAdded(isWordInPersonalDict(data.hebrew || word));
        } else {
          // Запасной вариант при ошибке API
          setWordData({
            hebrew: word,
            transcription: '',
            translation: data?.error || 'Слово на иврите',
            root: null,
            partOfSpeech: 'other',
            exampleSentence: null,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Word lookup fetch error:', err);
        setWordData({
          hebrew: word,
          transcription: '',
          translation: 'Не удалось загрузить перевод',
          root: null,
          partOfSpeech: 'other',
          exampleSentence: null,
        });
        setLoading(false);
      });
  }, [isOpen, word, context, userProfile]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!wordData) return;
    const cleanHebrew = wordData.hebrew || word;
    const newWord = addWordToPersonalDict({
      hebrew: cleanHebrew,
      hebrewPlain: stripNikkud(cleanHebrew),
      transcription: wordData.transcription || '',
      translation: wordData.translation || '',
      partOfSpeech: (wordData.partOfSpeech as any) || 'other',
      root: wordData.root || undefined,
      lessonId: 0,
      exampleSentence: wordData.exampleSentence || undefined,
    });
    setIsAdded(true);
    if (onWordAdded) onWordAdded(newWord);
  };

  const handleSpeak = (text: string) => {
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
  };

  const handleOpenConjugations = async () => {
    if (conjugationData) {
      setViewMode('conjugation');
      return;
    }

    const currentWord = wordData?.hebrew || word;
    const offlineMatch = findOfflineVerbConjugation(currentWord);
    if (offlineMatch) {
      setConjugationData(offlineMatch);
      setViewMode('conjugation');
      return;
    }

    setLoadingConjugation(true);
    try {
      const res = await fetch('/api/ai/conjugate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verb: currentWord,
          context,
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
          setConjugationData(data);
          setViewMode('conjugation');
        }
      }
    } catch (e) {
      console.error('Conjugation fetch error:', e);
    } finally {
      setLoadingConjugation(false);
    }
  };

  const isCursive = userProfile.fontStyle === 'cursive';
  const isVerb =
    wordData?.partOfSpeech === 'verb' ||
    Boolean(conjugationData) ||
    Boolean(findOfflineVerbConjugation(wordData?.hebrew || word));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in cursor-default"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 ${
          viewMode === 'conjugation' ? 'max-w-2xl' : 'max-w-md'
        } w-full overflow-hidden animate-in zoom-in-95 duration-150 transition-all`}
      >
        {/* Если открыт режим спряжений глагола */}
        {viewMode === 'conjugation' && conjugationData ? (
          <div className="p-4 sm:p-6">
            <VerbConjugationView
              conjugation={conjugationData}
              userProfile={userProfile}
              onBack={() => setViewMode('summary')}
              onAddToVocabulary={handleAdd}
              isWordInPersonalVocab={isAdded}
            />
          </div>
        ) : (
          <>
            {/* Шапка разбора слова */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold text-sm">Словарный разбор</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Закрыть (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Тело модалки */}
            <div className="p-5 sm:p-6 space-y-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm font-medium">Анализируем слово на иврите...</p>
                </div>
              ) : wordData ? (
                <>
                  {/* Главная карточка слова */}
                  <div className="text-center py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center justify-center gap-3">
                      <span
                        dir="rtl"
                        className={`text-3xl font-bold text-zinc-900 dark:text-zinc-50 ${
                          isCursive
                            ? 'font-cursive text-4xl text-blue-600 dark:text-blue-400'
                            : 'font-hebrew'
                        }`}
                      >
                        {userProfile.showNikkud
                          ? wordData.hebrew || word
                          : stripNikkud(wordData.hebrew || word)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(wordData.hebrew || word)}
                        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition active:scale-95 cursor-pointer"
                        title="Прослушать произношение"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {wordData.transcription && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-1">
                        [{wordData.transcription}]
                      </p>
                    )}

                    <p className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-2">
                      {wordData.translation}
                    </p>

                    {wordData.root && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                        <span>Шореш (корень):</span>
                        <span dir="rtl" className="font-bold">
                          {userProfile.showNikkud
                            ? wordData.root
                            : stripNikkud(wordData.root)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Кнопка таблицы спряжений для глаголов */}
                  {isVerb && (
                    <button
                      type="button"
                      onClick={handleOpenConjugations}
                      disabled={loadingConjugation}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 hover:from-amber-500/25 hover:via-orange-500/25 hover:to-purple-500/25 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer active:scale-98"
                    >
                      {loadingConjugation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                          <span>Загружаем таблицу спряжений...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>Таблица спряжения глагола (как в Pealim)</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Пример предложения */}
                  {wordData.exampleSentence && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <span>Пример в речи:</span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(wordData.exampleSentence!.hebrew)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>слушать</span>
                        </button>
                      </div>
                      <p
                        dir="rtl"
                        className={`text-base font-semibold text-zinc-900 dark:text-zinc-100 text-right ${
                          isCursive
                            ? 'font-cursive text-xl text-blue-600 dark:text-blue-400'
                            : 'font-hebrew'
                        }`}
                      >
                        {userProfile.showNikkud
                          ? wordData.exampleSentence.hebrew
                          : stripNikkud(wordData.exampleSentence.hebrew)}
                      </p>
                      {wordData.exampleSentence.transcription && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          [{wordData.exampleSentence.transcription}]
                        </p>
                      )}
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        {wordData.exampleSentence.translation}
                      </p>
                    </div>
                  )}

                  {/* Кнопка добавления в словарик */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={isAdded}
                      className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>В вашем словарике</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Добавить в мой словарик</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-zinc-500 py-6">
                  Не удалось загрузить перевод слова.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
