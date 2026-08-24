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
}

export const LessonTheory: React.FC<LessonTheoryProps> = ({
  lesson,
  userProfile,
  onCompleted,
}) => {
  const handleMarkDone = () => {
    markLessonTabCompleted(lesson.id, 'theory');
    if (onCompleted) onCompleted();
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Описание темы урока */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800/60 p-6 rounded-3xl border border-blue-100 dark:border-zinc-700/80 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Теория урока {lesson.number} ({lesson.level === 'alef' ? 'Алеф' : 'Бет'})
          </span>
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
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-3 ${
                                cIdx === 0
                                  ? 'font-medium text-zinc-900 dark:text-zinc-100'
                                  : 'text-zinc-600 dark:text-zinc-400'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
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
                    className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-hebrew"
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
