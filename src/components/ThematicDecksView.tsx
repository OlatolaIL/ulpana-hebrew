'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { ThematicDeck, UserProfile, Word, VerbConjugation } from '@/types';
import { THEMATIC_DECKS } from '@/data/thematicDecks';
import { PROFESSIONAL_DECKS } from '@/data/professionalDecks';
import { calculateWordMastery, isWordInPersonalDict, addWordToPersonalDict } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { VerbConjugationView } from '@/components/VerbConjugationView';
import { useModalHistory } from '@/lib/useHistoryState';
import { TierBadge } from './TierBadge';
import { useBannerCooldown } from '@/lib/useBannerCooldown';
import { DeckCard, DeckFilterBar, DeckWordsModal, DeckStats, DeckFilter } from './ThematicDecks';

// Все колоды: тематические + профессиональные (слова могут пересекаться между профессиями)
export const ALL_DECKS = [...THEMATIC_DECKS, ...PROFESSIONAL_DECKS];

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
  const [filter, setFilter] = useState<DeckFilter>('all');
  const { isVisible: isBetaBannerVisible, dismiss: dismissBetaBanner } = useBannerCooldown('thematic_decks_beta');

  // Режим перемешивания слов для колод
  const [shuffleDecks] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deck_shuffle_mode') === 'true';
    }
    return false;
  });

  // Модалка списка слов
  const [listModalDeck, setListModalDeck] = useState<ThematicDeck | null>(() => {
    if (initialDeckId) {
      return ALL_DECKS.find((d) => d.id === initialDeckId) || null;
    }
    return null;
  });

  const handleCloseListModal = () => {
    setListModalDeck(null);
    if (onCloseInitialDeck) onCloseInitialDeck();
  };

  useEffect(() => {
    if (initialDeckId) {
      const found = ALL_DECKS.find((d) => d.id === initialDeckId);
      if (found) {
        setListModalDeck(found);
      }
    }
  }, [initialDeckId]);

  // Модалка спряжений Pealim
  const [pealimModal, setPealimModal] = useState<{
    word: Word;
    conjugation: VerbConjugation | null;
    loading: boolean;
  } | null>(null);

  useModalHistory(Boolean(pealimModal), () => setPealimModal(null), 'pealim-thematic');
  useModalHistory(Boolean(listModalDeck), handleCloseListModal, 'deck-detail');

  // Фильтрация колод (тематические + профессиональные)
  const filteredDecks = useMemo(() => {
    return ALL_DECKS.filter((deck) => {
      if (filter === 'all') return true;
      if (filter === 'alef') return deck.level === 'alef';
      if (filter === 'bet') return deck.level === 'bet';
      if (filter === 'caregiver') return deck.category === 'caregiver';
      if (filter === 'autoRepair') return deck.category === 'autoRepair';
      if (filter === 'kindergarten') return deck.category === 'kindergarten';
      if (filter === 'doctor') return deck.category === 'doctor';
      if (filter === 'accounting') return deck.category === 'accounting';
      return deck.category === filter;
    });
  }, [filter]);

  // Вычисление прогресса по колоде
  const getDeckStats = (deck: ThematicDeck): DeckStats => {
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

  const handleOpenListModal = (deck: ThematicDeck) => {
    setListModalDeck(deck);
  };

  const handleAddSingleVerb = (word: Word) => {
    const added = addWordToPersonalDict({
      hebrew: word.hebrew,
      hebrewPlain: word.hebrewPlain || stripNikkud(word.hebrew),
      translation: word.translation,
      transcription: word.transcription,
      partOfSpeech: word.partOfSpeech || 'verb',
      gender: word.gender,
      plural: word.plural,
      root: word.root,
      lessonId: word.lessonId ?? 0,
    });
    if (added) {
      onUpdateVocabulary([added, ...(userProfile.personalVocabulary || [])]);
    }
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Баннер режима бета-доступа к колодам */}
      {isBetaBannerVisible && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="font-bold">
                Тематические колоды в Бете:
              </strong>{' '}
              3 базовые колоды всегда бесплатны. Все остальные тематические колоды сейчас открыты в режиме PRO БЕТА.
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
            <TierBadge tier="pro-beta" size="xs" />
            <button
              type="button"
              onClick={dismissBetaBanner}
              className="p-1 rounded-lg text-amber-700/70 hover:text-amber-900 dark:text-amber-300/70 dark:hover:text-amber-100 hover:bg-amber-500/20 transition cursor-pointer"
              title="Скрыть на 5 дней"
              aria-label="Скрыть на 5 дней"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Быстрые фильтры по темам и уровням в одну компактную строку */}
      <DeckFilterBar
        filter={filter}
        onFilterChange={setFilter}
        totalDecksCount={ALL_DECKS.length}
      />

      {/* Компактный каталог колод */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            stats={getDeckStats(deck)}
            userProfile={userProfile}
            shuffleDecks={shuffleDecks}
            onOpenListModal={handleOpenListModal}
            onStartTraining={onStartTraining}
          />
        ))}
      </div>

      {/* Модальное окно списка слов колоды */}
      {listModalDeck && (
        <DeckWordsModal
          deck={listModalDeck}
          userProfile={userProfile}
          shuffleDecks={shuffleDecks}
          onClose={handleCloseListModal}
          onStartTraining={onStartTraining}
          onUpdateVocabulary={onUpdateVocabulary}
          onOpenPealim={handleOpenPealim}
        />
      )}

      {/* Модальное окно Pealim (Спряжения и Семья корней) */}
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
                onAddToVocabulary={handleAddSingleVerb}
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
