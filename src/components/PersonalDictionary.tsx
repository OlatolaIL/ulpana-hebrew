'use client';

import React, { useState } from 'react';
import {
  Search,
  Volume2,
  Trash2,
  Plus,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Word, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';
import {
  removeWordFromPersonalDict,
  addWordToPersonalDict,
  loadUserProfile,
} from '@/lib/storage';

interface PersonalDictionaryProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onStartPractice: (words: Word[]) => void;
}

export const PersonalDictionary: React.FC<PersonalDictionaryProps> = ({
  userProfile,
  onUpdateProfile,
  onStartPractice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newHebrew, setNewHebrew] = useState('');
  const [newTranscription, setNewTranscription] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newRoot, setNewRoot] = useState('');

  const words = userProfile.personalVocabulary || [];

  const filteredWords = words.filter((w) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (w.hebrew || '').toLowerCase().includes(q) ||
      (w.hebrewPlain || '').toLowerCase().includes(q) ||
      (w.translation || '').toLowerCase().includes(q) ||
      (w.transcription || '').toLowerCase().includes(q)
    );
  });

  const handleDelete = (wordId: string) => {
    removeWordFromPersonalDict(wordId);
    onUpdateProfile(loadUserProfile());
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHebrew.trim() || !newTranslation.trim()) return;

    addWordToPersonalDict({
      hebrew: newHebrew.trim(),
      hebrewPlain: newHebrew.trim(),
      transcription: newTranscription.trim(),
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
    <div data-font-style={userProfile.fontStyle || 'print'} className="max-w-4xl mx-auto space-y-6">
      {/* Шапка страницы */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-yellow-300" />
            <h1 className="text-2xl font-bold">Мой личный словарик</h1>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            Слова, сохраненные во время уроков и живых диалогов с ИИ ({words.length})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFont}
            className="px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition"
            title="Переключить шрифт словарика: Печатный / Рукописный"
          >
            {isCursive ? (
              <>
                <span className="font-cursive font-bold text-base leading-none">כתב</span>
                <span>Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs leading-none">דפוס</span>
                <span>Печатный</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddingCustom(true)}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold flex items-center gap-2 backdrop-blur transition"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить слово</span>
          </button>
          {words.length > 0 && (
            <button
              onClick={() => onStartPractice(words)}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-sm font-semibold flex items-center gap-2 shadow transition"
            >
              <Layers className="w-4 h-4" />
              <span>Тренировать карточки</span>
            </button>
          )}
        </div>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по ивриту, транскрипции или переводу..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
        />
      </div>

      {/* Список слов */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
          <Sparkles className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
            В словарике пока нет слов
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Нажимайте на любые незнакомые слова во время диалога с ИИ в уроках, чтобы сохранять их сюда.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredWords.map((word) => (
            <div
              key={word.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-900 transition"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => speakHebrew(word.hebrew)}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 transition shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <div>
                  <div
                    dir="rtl"
                    className={`font-bold ${
                      isCursive
                        ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                        : 'font-hebrew text-xl text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    {userProfile.showNikkud ? word.hebrew : word.hebrewPlain}
                  </div>
                  {userProfile.showTranscription && word.transcription && (
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      [{word.transcription}]
                    </p>
                  )}
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    {word.translation}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {word.root && (
                  <span className={`hidden sm:inline-block px-2 py-0.5 rounded text-[11px] bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 ${isCursive ? 'font-cursive text-base' : 'font-mono'}`}>
                    {word.root}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(word.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  title="Удалить из словарика"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка добавления кастомного слова */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Добавить слово в словарик
            </h3>

            <form onSubmit={handleCreateWord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Слово на иврите (с огласовками или без)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newHebrew}
                  onChange={(e) => setNewHebrew(e.target.value)}
                  placeholder="לְמָשָׁל: חָבֵר"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base font-hebrew focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Транскрипция (русскими буквами с буквой h для ה)
                </label>
                <input
                  type="text"
                  value={newTranscription}
                  onChange={(e) => setNewTranscription(e.target.value)}
                  placeholder="хавéр / hа-бáйит"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Перевод на русский
                </label>
                <input
                  type="text"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="друг, товарищ"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Корень слова (Шореш, не обязательно)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newRoot}
                  onChange={(e) => setNewRoot(e.target.value)}
                  placeholder="ח-ב-ר"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-hebrew focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold"
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
    </div>
  );
};
