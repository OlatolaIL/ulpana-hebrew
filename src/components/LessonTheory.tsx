'use client';

import React from 'react';
import { Volume2, BookOpen, CheckCircle2, Lightbulb, Table } from 'lucide-react';
import { Lesson, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { markLessonTabCompleted } from '@/lib/storage';

interface LessonTheoryProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const LessonTheory: React.FC<LessonTheoryProps> = ({
  lesson,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  const handleMarkDone = () => {
    markLessonTabCompleted(lesson.id, 'theory');
    if (onCompleted) onCompleted();
  };

  const handleToggleFont = () => {
    const nextStyle: 'print' | 'cursive' = userProfile.fontStyle === 'cursive' ? 'print' : 'cursive';
    const updated: UserProfile = { ...userProfile, fontStyle: nextStyle };
    markLessonTabCompleted(lesson.id, 'theory');
    // Save to LocalStorage immediately
    try {
      localStorage.setItem('ulpana_user_profile', JSON.stringify(updated));
    } catch {}
    if (onUpdateProfile) onUpdateProfile(updated);
  };

  const isCursive = userProfile.fontStyle === 'cursive';

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="space-y-8 max-w-3xl mx-auto">
      {/* Описание темы урока */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800/60 p-6 rounded-3xl border border-blue-100 dark:border-zinc-700/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Теория урока {lesson.number} ({lesson.level === 'alef' ? 'Алеф' : 'Бет'})
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleFont}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
            title="Переключить шрифт теории: Печатный / Рукописный"
          >
            {isCursive ? (
              <>
                <span className="font-cursive font-bold text-base text-blue-600 dark:text-blue-400 leading-none">כתב</span>
                <span className="text-zinc-700 dark:text-zinc-300">Рукописный</span>
              </>
            ) : (
              <>
                <span className="font-hebrew font-bold text-xs text-zinc-700 dark:text-zinc-300 leading-none">דפוס</span>
                <span className="text-zinc-700 dark:text-zinc-300">Печатный</span>
              </>
            )}
          </button>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {lesson.titleRussian}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {lesson.description}
        </p>
      </div>

      {/* Грамматические темы */}
      {lesson.grammar.map((topic, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {topic.title}
            </h3>
            <p className="text-sm text-zinc-500 font-medium">{topic.summary}</p>
          </div>

          {/* Текст объяснения */}
          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {topic.explanation}
          </div>

          {/* Таблицы спряжения или форм */}
          {topic.tables &&
            topic.tables.map((table, tIdx) => (
              <div key={tIdx} className="space-y-2">
                {table.title && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Table className="w-4 h-4" />
                    <span>{table.title}</span>
                  </h4>
                )}
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase">
                      <tr>
                        {table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {table.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition"
                        >
                          {row.map((cell, cIdx) => {
                            const isHebrew = /[\u0590-\u05FF]/.test(cell);
                            return (
                              <td
                                key={cIdx}
                                dir={isHebrew ? 'rtl' : 'ltr'}
                                className={`px-4 py-3 ${
                                  cIdx === 0
                                    ? `font-bold text-zinc-900 dark:text-zinc-100 ${
                                        isCursive
                                          ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                                          : 'font-hebrew text-lg'
                                      }`
                                    : isHebrew && isCursive
                                    ? 'font-cursive text-xl font-bold text-blue-600 dark:text-blue-400'
                                    : 'text-zinc-600 dark:text-zinc-400'
                                }`}
                              >
                                {cell}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

          {/* Правила и памятки */}
          {topic.rules && topic.rules.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Lightbulb className="w-4 h-4" />
                <span>Важные правила ульпана</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-200">
                {topic.rules.map((rule, rIdx) => (
                  <li key={rIdx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Базовые примеры предложений с озвучкой */}
      {lesson.basicSentences.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Базовые предложения темы
          </h3>

          <div className="space-y-3">
            {lesson.basicSentences.map((sentence) => (
              <div
                key={sentence.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p
                    dir="rtl"
                    className={`font-bold ${
                      isCursive
                        ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                        : 'font-hebrew text-lg text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    {userProfile.showNikkud ? sentence.hebrew : sentence.hebrew}
                  </p>
                  {userProfile.showTranscription && sentence.transcription && (
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      [{sentence.transcription}]
                    </p>
                  )}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                    {sentence.translation}
                  </p>
                </div>

                <button
                  onClick={() => speakHebrew(sentence.hebrew)}
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition active:scale-95 shrink-0"
                  title="Прослушать предложение"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Завершение этапа теории */}
      <div className="text-center pt-2">
        <button
          onClick={handleMarkDone}
          className="py-3.5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Я изучил теорию • Перейти к практике</span>
        </button>
      </div>
    </div>
  );
};
