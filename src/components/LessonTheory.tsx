'use client';

import React, { useState } from 'react';
import { Volume2, BookOpen, CheckCircle2, Lightbulb, Table, Sparkles, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Lesson, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { markLessonTabCompleted } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { getHebrewPictogram, getHebrewGenderLabel, getPictogramDetails } from '@/lib/pictograms';

interface LessonTheoryProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const LessonTheory: React.FC<LessonTheoryProps> = ({
  lesson,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  const handleToggleHint = (id: string) => {
    setRevealedHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarkDone = () => {
    const updated = markLessonTabCompleted(lesson.id, 'theory');
    if (onUpdateProfile) onUpdateProfile(updated);
    if (onCompleted) onCompleted();
  };

  const isCursive = userProfile.fontStyle === 'cursive';
  const isUlpan = Boolean(userProfile.ulpanMode);

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      {/* Баннер режима Ульпан (Визуальное обучение) */}
      {isUlpan && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-100 font-hebrew" dir="rtl">
                עִבְרִית בְּעִבְרִית • לְמִידָה חָזוּתִית (תְּמוּנוֹת וּצְלִילִים)
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                ללא תרגום • לחצו על הרמקול להאזנה ועל «רֶמֶז» לבדיקה עצמית במידת הצורך
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Краткое описание темы урока (только в стандартном режиме) */}
      {!isUlpan && lesson.description && (
        <div className="px-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
          {renderFormattedText(lesson.description)}
        </div>
      )}

      {/* Грамматические темы */}
      {lesson.grammar.map((topic, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sm:space-y-5"
        >
          <div className="space-y-1">
            <h3
              className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100"
              dir={isUlpan ? 'rtl' : 'ltr'}
            >
              {isUlpan ? `דִּקְדּוּק וּמִבְנֶה (${i + 1}): ${lesson.titleHebrew}` : topic.title}
            </h3>
            {!isUlpan && (
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">{topic.summary}</p>
            )}
          </div>

          {/* Текст объяснения (в обычном режиме) */}
          {!isUlpan && (
            <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {renderFormattedText(topic.explanation)}
            </div>
          )}

          {/* Визуальные таблицы спряжения и форм (с пиктограммами в режиме Ульпан) */}
          {topic.tables &&
            topic.tables.map((table, tIdx) => {
              const tableTitleHebrew = table.title
                .replace(/ЕДИНСТВЕННОЕ ЧИСЛО/i, 'יָחִיד / יְחִידָה (1👤)')
                .replace(/МНОЖЕСТВЕННОЕ ЧИСЛО/i, 'רַבִּים / רַבּוֹת (👥)')
                .replace(/МУЖСКОЙ РОД/i, 'זָכָר (👨)')
                .replace(/ЖЕНСКИЙ РОД/i, 'נְקֵבָה (👩)')
                .replace(/[()]/g, '');

              return (
                <div key={tIdx} className="space-y-2.5">
                  {/* Заголовок таблицы */}
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{isUlpan ? tableTitleHebrew : table.title}</span>
                  </h4>

                  {/* РЕЖИМ УЛЬПАН: Интерактивная визуальная сетка карточек с пиктограммами */}
                  {isUlpan ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {table.rows.map((row, rIdx) => {
                        const hebrewWord = row[0] || '';
                        const translation = row[2] || row[1] || '';
                        const genderRaw = row[3] || (row[1]?.includes('муж') ? 'זכר' : row[1]?.includes('жен') ? 'נקבה' : 'כללי');
                        const genderInfo = getHebrewGenderLabel(genderRaw);
                        const details = getPictogramDetails(hebrewWord, genderRaw);
                        const hintKey = `hint-${i}-${tIdx}-${rIdx}`;
                        const isHintRevealed = Boolean(revealedHints[hintKey]);

                        return (
                          <div
                            key={rIdx}
                            className={`border rounded-2xl p-3.5 flex flex-col justify-between hover:scale-[1.01] transition shadow-xs group ${details.bgClass} ${details.borderClass}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Стильная направленная пиктограмма с цветовым акцентом */}
                              <div className={`px-2.5 py-1 rounded-xl font-bold text-base sm:text-lg border shadow-xs select-none bg-white/90 dark:bg-zinc-800/90 ${details.textClass} ${details.borderClass}`}>
                                {details.icon}
                              </div>

                              {/* Цветной бейдж рода (Голубой ♂ / Розовый ♀ / Индиго ⚥) */}
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${genderInfo.badgeClass}`}>
                                {genderInfo.label} {genderInfo.icon}
                              </span>
                            </div>

                            {/* Крупное слово на иврите */}
                            <div className="my-2.5">
                              <div
                                dir="rtl"
                                className={`font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-50 transition ${
                                  isCursive ? 'font-cursive text-3xl' : 'font-hebrew'
                                }`}
                              >
                                {userProfile.showNikkud ? hebrewWord : stripNikkud(hebrewWord)}
                              </div>
                            </div>

                            {/* Нижняя панель: озвучка и кнопка подсказки */}
                            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => speakHebrew(hebrewWord)}
                                className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-semibold"
                                title="השמע מילה (Озвучить)"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>שְׁמַע</span>
                              </button>

                              {/* Кнопка רמז (подсказка перевода) */}
                              {isHintRevealed ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleHint(hintKey)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-700/60 flex items-center gap-1 transition"
                                  title="הסתר רמז"
                                >
                                  <span>{translation}</span>
                                  <EyeOff className="w-3 h-3 opacity-60" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleHint(hintKey)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 transition flex items-center gap-1"
                                  title="הצג רמז (Проверить перевод)"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>רֶמֶז</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* СТАНДАРТНЫЙ РЕЖИМ: Таблица с русским переводом и транскрипцией */
                    <div className="w-full rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-[10px] sm:text-xs font-semibold uppercase">
                          <tr>
                            {table.headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                className="px-2 sm:px-3.5 py-2 sm:py-2.5 border-b border-zinc-200 dark:border-zinc-800"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                          {table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition"
                            >
                              {row.map((cell, cIdx) => {
                                const isHebrew = /[\u0590-\u05FF]/.test(cell);
                                return (
                                  <td
                                    key={cIdx}
                                    dir={isHebrew ? 'rtl' : 'ltr'}
                                    className={`px-2 sm:px-3.5 py-2 sm:py-2.5 align-middle ${
                                      cIdx === 0
                                        ? `font-bold text-zinc-900 dark:text-zinc-100 ${
                                            isCursive
                                              ? 'font-cursive text-xl sm:text-2xl text-blue-600 dark:text-blue-400'
                                              : 'font-hebrew text-base sm:text-lg'
                                          }`
                                        : isHebrew && isCursive
                                        ? 'font-cursive text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400'
                                        : 'text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-snug break-words'
                                    }`}
                                  >
                                    {cell === 'Мужской' ? (
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                                        Муж.
                                      </span>
                                    ) : cell === 'Женский' ? (
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 whitespace-nowrap">
                                        Жен.
                                      </span>
                                    ) : cell === 'Общий' ? (
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                                        Общ.
                                      </span>
                                    ) : (
                                      renderFormattedText(
                                        userProfile.showNikkud ? cell : isHebrew ? stripNikkud(cell) : cell
                                      )
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Правила и памятки (только в обычном режиме) */}
          {!isUlpan && topic.rules && topic.rules.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3 sm:p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Lightbulb className="w-4 h-4" />
                <span>Важные правила ульпана</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-200">
                {topic.rules.map((rule, rIdx) => (
                  <li key={rIdx}>{renderFormattedText(rule)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Базовые примеры предложений с озвучкой */}
      {lesson.basicSentences.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100" dir={isUlpan ? 'rtl' : 'ltr'}>
            {isUlpan ? 'דֻּגְמָאוֹת וּמִשְׁפָּטִים (דִּיאָלוֹג)' : 'Базовые предложения темы'}
          </h3>

          <div className="space-y-3">
            {lesson.basicSentences.map((sentence, sIdx) => {
              const sentencePictogram = getHebrewPictogram(sentence.hebrew);
              const sentenceHintKey = `sent-hint-${sIdx}`;
              const isSentRevealed = Boolean(revealedHints[sentenceHintKey]);

              return (
                <div
                  key={sentence.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {sentencePictogram && (
                        <span className="text-xl select-none shrink-0">{sentencePictogram}</span>
                      )}
                      <p
                        dir="rtl"
                        className={`font-bold ${
                          isCursive
                            ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                            : 'font-hebrew text-lg text-zinc-900 dark:text-zinc-50'
                        }`}
                      >
                        {userProfile.showNikkud ? sentence.hebrew : stripNikkud(sentence.hebrew)}
                      </p>
                    </div>

                    {/* Транскрипция (только вне режима Ульпан) */}
                    {!isUlpan && userProfile.showTranscription && sentence.transcription && (
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        [{sentence.transcription}]
                      </p>
                    )}

                    {/* Перевод (в обычном режиме виден всегда, в Ульпане — по клику на רמז) */}
                    {isUlpan ? (
                      <div>
                        {isSentRevealed ? (
                          <button
                            type="button"
                            onClick={() => handleToggleHint(sentenceHintKey)}
                            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
                          >
                            <span>{sentence.translation}</span>
                            <EyeOff className="w-3 h-3 opacity-60" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleHint(sentenceHintKey)}
                            className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>רֶמֶז</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      sentence.translation && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                          {sentence.translation}
                        </p>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => speakHebrew(sentence.hebrew)}
                    className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition active:scale-95 shrink-0"
                    title="השמע משפט (Озвучить)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Завершение этапа теории */}
      <div className="text-center pt-2 pb-6">
        <button
          onClick={handleMarkDone}
          className="py-3.5 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>
            {isUlpan
              ? 'הֲבָנַת הַחֹמֶר • מַעֲבָר לְאוֹצַר מִילִּים (שָׁלָב 2/5) ➡️'
              : 'Я изучил теорию • Перейти к словарю (этап 2/5) ➡️'}
          </span>
        </button>
      </div>
    </div>
  );
};
