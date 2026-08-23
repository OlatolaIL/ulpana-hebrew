'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Plus, Check, X, Loader2, Sparkles } from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { addWordToPersonalDict, isWordInPersonalDict } from '@/lib/storage';

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
    };
  } | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isOpen || !word) return;

    setIsAdded(isWordInPersonalDict(word));
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
      .then((res) => res.json())
      .then((data) => {
        setWordData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isOpen, word, context, userProfile]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!wordData) return;
    const newWord = addWordToPersonalDict({
      hebrew: wordData.hebrew || word,
      hebrewPlain: word,
      transcription: wordData.transcription || '',
      translation: wordData.translation || '',
      partOfSpeech: (wordData.partOfSpeech as any) || 'other',
      root: wordData.root || undefined,
      lessonId: 0,
      exampleSentence: wordData.exampleSentence,
    });
    setIsAdded(true);
    if (onWordAdded) onWordAdded(newWord);
  };

  const handleSpeak = (text: string) => {
    speakHebrew(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold text-sm">Словарный разбор</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm">Анализируем слово на иврите...</p>
            </div>
          ) : wordData ? (
            <>
              <div className="text-center py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center justify-center gap-3">
                  <span
                    dir="rtl"
                    className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 font-hebrew"
                  >
                    {wordData.hebrew || word}
                  </span>
                  <button
                    onClick={() => handleSpeak(wordData.hebrew || word)}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition active:scale-95"
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

                <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-2">
                  {wordData.translation}
                </p>

                {wordData.root && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                    <span>Шореш (корень):</span>
                    <span dir="rtl" className="font-bold">
                      {wordData.root}
                    </span>
                  </div>
                )}
              </div>

              {wordData.exampleSentence && (
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Пример в речи:</span>
                    <button
                      onClick={() => handleSpeak(wordData.exampleSentence!.hebrew)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>слушать</span>
                    </button>
                  </div>
                  <p
                    dir="rtl"
                    className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-hebrew text-right"
                  >
                    {wordData.exampleSentence.hebrew}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    [{wordData.exampleSentence.transcription}]
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {wordData.exampleSentence.translation}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleAdd}
                  disabled={isAdded}
                  className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-sm ${
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
      </div>
    </div>
  );
};
