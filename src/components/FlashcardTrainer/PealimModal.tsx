import React from 'react';
import { Word, UserProfile, VerbConjugation } from '@/types';
import { VerbConjugationView } from '@/components/VerbConjugationView';
import { addWordToPersonalDict, isWordInPersonalDict, loadUserProfile } from '@/lib/storage';

interface PealimModalProps {
  verbData: {
    word: Word;
    conjugation: VerbConjugation | null;
    loading: boolean;
  } | null;
  userProfile: UserProfile;
  isUlpan: boolean;
  onClose: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const PealimModal: React.FC<PealimModalProps> = ({
  verbData,
  userProfile,
  isUlpan,
  onClose,
  onUpdateProfile,
}) => {
  if (!verbData) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-6 max-h-[90vh] overflow-y-auto relative"
      >
        {verbData.loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">
              {isUlpan ? '⏳ טוֹעֵן פְּעָלִים...' : 'Загружаем спряжения и семью корня Pealim...'}
            </p>
          </div>
        ) : verbData.conjugation ? (
          <VerbConjugationView
            conjugation={verbData.conjugation}
            userProfile={userProfile}
            onBack={onClose}
            onAddToVocabulary={(w) => {
              addWordToPersonalDict(w);
              if (onUpdateProfile) onUpdateProfile(loadUserProfile());
            }}
            isWordInPersonalVocab={isWordInPersonalDict(
              verbData.word.hebrew,
              userProfile.personalVocabulary
            )}
          />
        ) : (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isUlpan ? (
                <>
                  <span className="font-hebrew text-base">{verbData.word.hebrew}</span>
                  {' — הַנְטָיָה אֵינָהּ זְמִינָה.'}
                </>
              ) : (
                <>
                  {'Спряжения для глагола '}
                  <strong className="font-hebrew text-base">{verbData.word.hebrew}</strong>
                  {' пока недоступны.'}
                </>
              )}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
            >
              {isUlpan ? 'סְגוֹר' : 'Закрыть'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
