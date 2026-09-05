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

function renderFormattedText(
  text: string,
  onPlay?: (hebrew: string, key?: string) => void,
  isCursive?: boolean,
  showNikkud: boolean = true,
  playingKey?: string | null
) {
  if (!text) return null;
  // Находим жирный текст **...**, цитаты в кавычках «...» с ивритом или отдельные фразы на иврите
  const parts = text.split(/(\*\*[^*]+\*\*|«[^»]*[\u0590-\u05FF][^»]*»|[\u0590-\u05FF]+(?:[\s\-]+[\u0590-\u05FF]+)*)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    const isBold = part.startsWith('**') && part.endsWith('**');
    const isQuotedHebrew = part.startsWith('«') && part.endsWith('»') && /[\u0590-\u05FF]/.test(part);
    const isHebrewWord = /[\u0590-\u05FF]/.test(part) && !isBold && !isQuotedHebrew;

    if (isBold) {
      const inner = part.slice(2, -2);
      const hasHebrew = /[\u0590-\u05FF]/.test(inner);
      if (hasHebrew && onPlay) {
        const itemKey = `fmt-${index}-${inner.slice(0, 10)}`;
        const isPlaying = playingKey === itemKey;
        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(inner, itemKey);
            }}
            className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 my-0.5 rounded-xl border transition cursor-pointer select-text align-baseline mx-0.5 ${
              isPlaying
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                : 'text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/50 border-blue-200/90 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
            title="Прослушать произношение (как произносится)"
          >
            <span dir="rtl" className={isCursive ? 'font-cursive text-lg' : 'font-hebrew text-sm sm:text-base'}>
              {showNikkud ? inner : stripNikkud(inner)}
            </span>
            <Volume2 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-pulse text-white' : 'text-blue-600 dark:text-blue-400 opacity-80'}`} />
          </button>
        );
      }
      return (
        <strong key={index} className="font-bold text-zinc-900 dark:text-zinc-100">
          {inner}
        </strong>
      );
    }

    if (isQuotedHebrew && onPlay) {
      const inner = part.slice(1, -1);
      const itemKey = `quote-${index}-${inner.slice(0, 10)}`;
      const isPlaying = playingKey === itemKey;
      return (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(inner, itemKey);
          }}
          className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 my-0.5 rounded-lg border transition cursor-pointer select-text align-baseline mx-0.5 ${
            isPlaying
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
              : 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
          }`}
          title="Прослушать произношение (как произносится)"
        >
          <span dir="rtl" className={isCursive ? 'font-cursive text-base' : 'font-hebrew font-bold'}>
            «{showNikkud ? inner : stripNikkud(inner)}»
          </span>
          <Volume2 className={`w-3 h-3 shrink-0 ${isPlaying ? 'animate-pulse text-white' : 'text-blue-500 opacity-75'}`} />
        </button>
      );
    }

    if (isHebrewWord && onPlay && part.trim().length > 1) {
      const itemKey = `heb-${index}-${part.slice(0, 10)}`;
      const isPlaying = playingKey === itemKey;
      return (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(part, itemKey);
          }}
          className={`inline-flex items-center gap-1 font-semibold px-1 py-0.5 rounded transition cursor-pointer select-text align-baseline mx-0.5 ${
            isPlaying
              ? 'bg-blue-600 text-white shadow-xs scale-105'
              : 'text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 underline decoration-blue-300/70 dark:decoration-blue-700 underline-offset-2'
          }`}
          title="Прослушать произношение (как произносится)"
        >
          <span dir="rtl" className={isCursive ? 'font-cursive text-base' : 'font-hebrew font-medium'}>
            {showNikkud ? part : stripNikkud(part)}
          </span>
          <Volume2 className={`w-2.5 h-2.5 shrink-0 ${isPlaying ? 'animate-pulse text-white' : 'text-blue-500 opacity-60'}`} />
        </button>
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
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const handlePlay = (text: string, key?: string) => {
    if (!text) return;
    if (key) setPlayingKey(key);
    speakHebrew(text, { rate: userProfile.speechRate || 0.7 });
    if (key) {
      setTimeout(() => {
        setPlayingKey((curr) => (curr === key ? null : curr));
      }, 2200);
    }
  };

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
          {renderFormattedText(
            lesson.description,
            handlePlay,
            isCursive,
            userProfile.showNikkud,
            playingKey
          )}
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
              {renderFormattedText(
                topic.explanation,
                handlePlay,
                isCursive,
                userProfile.showNikkud,
                playingKey
              )}
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
                        const hebrewIdx = row.findIndex((c) => /[\u0590-\u05FF]/.test(c));
                        const hebrewWord = hebrewIdx !== -1 ? row[hebrewIdx] : row[0] || '';
                        const exampleIdx = row.findIndex((c, idx) => idx > hebrewIdx && /[\u0590-\u05FF]/.test(c));
                        const examplePhrase = exampleIdx !== -1 ? row[exampleIdx] : null;
                        const numberCol = row.find((c) => /^\d+$/.test(c.trim()));
                        const translation =
                          row.find((c) => /[а-яёА-ЯЁ]/.test(c) && !/[\u0590-\u05FF]/.test(c)) ||
                          row[2] ||
                          row[1] ||
                          '';
                        const genderRaw =
                          row[3] ||
                          (row.some((c) => c.includes('муж')) ? 'זכר' : row.some((c) => c.includes('жен')) ? 'נקבה' : 'כללי');
                        const genderInfo = getHebrewGenderLabel(genderRaw);
                        const details = getPictogramDetails(hebrewWord, genderRaw);
                        const hintKey = `hint-${i}-${tIdx}-${rIdx}`;
                        const isHintRevealed = Boolean(revealedHints[hintKey]);
                        const wordKey = `ulpan-word-${i}-${tIdx}-${rIdx}`;
                        const exampleKey = `ulpan-ex-${i}-${tIdx}-${rIdx}`;

                        return (
                          <div
                            key={rIdx}
                            className={`border rounded-2xl p-3.5 flex flex-col justify-between hover:scale-[1.01] transition shadow-xs group ${details.bgClass} ${details.borderClass}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              {/* Стильная направленная пиктограмма с цветовым акцентом */}
                              <div className="flex items-center gap-1.5">
                                <div className={`px-2.5 py-1 rounded-xl font-bold text-base sm:text-lg border shadow-xs select-none bg-white/90 dark:bg-zinc-800/90 ${details.textClass} ${details.borderClass}`}>
                                  {details.icon}
                                </div>
                                {numberCol && (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600">
                                    #{numberCol}
                                  </span>
                                )}
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
                                onClick={() => handlePlay(hebrewWord, wordKey)}
                                className={`font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-50 transition cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
                                  isCursive ? 'font-cursive text-3xl' : 'font-hebrew'
                                }`}
                                title="Нажмите на слово, чтобы прослушать произношение"
                              >
                                {userProfile.showNikkud ? hebrewWord : stripNikkud(hebrewWord)}
                              </div>

                              {/* Пример с числительным / формой при наличии */}
                              {examplePhrase && (
                                <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                                  <span
                                    dir="rtl"
                                    onClick={() => handlePlay(examplePhrase, exampleKey)}
                                    className="text-xs sm:text-sm font-hebrew text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
                                    title="Нажмите на пример, чтобы прослушать произношение"
                                  >
                                    {userProfile.showNikkud ? examplePhrase : stripNikkud(examplePhrase)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handlePlay(examplePhrase, exampleKey)}
                                    className={`p-1 rounded-lg shrink-0 transition ${
                                      playingKey === exampleKey
                                        ? 'bg-emerald-600 text-white scale-110'
                                        : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                                    }`}
                                    title="Озвучить пример"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Нижняя панель: озвучка и кнопка подсказки */}
                            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handlePlay(hebrewWord, wordKey)}
                                className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                                  playingKey === wordKey
                                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                }`}
                                title="השמע מילה (Озвучить слово)"
                              >
                                <Volume2 className={`w-3.5 h-3.5 ${playingKey === wordKey ? 'animate-pulse' : ''}`} />
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
                    /* СТАНДАРТНЫЙ РЕЖИМ: Таблица с русским переводом, транскрипцией и озвучкой */
                    <div className="w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                      <table className="w-full text-left border-collapse min-w-[340px]">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-[10px] sm:text-xs font-semibold uppercase">
                          <tr>
                            {table.headers.map((h, hIdx) => (
                              <th
                                key={hIdx}
                                className="px-2.5 sm:px-4 py-2 sm:py-2.5 border-b border-zinc-200 dark:border-zinc-800"
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
                                const cellKey = `table-${i}-${tIdx}-${rIdx}-${cIdx}`;
                                const isPlaying = playingKey === cellKey;
                                const colHeader = table.headers[cIdx] || '';
                                const isPrimaryHebrewCol =
                                  cIdx === 0 ||
                                  colHeader.toLowerCase().includes('иврит') ||
                                  colHeader.toLowerCase().includes('местоимение') ||
                                  colHeader.toLowerCase().includes('глагол') ||
                                  colHeader.toLowerCase().includes('форма') ||
                                  colHeader.toLowerCase().includes('инфинитив');

                                return (
                                  <td
                                    key={cIdx}
                                    className="px-2.5 sm:px-4 py-2.5 sm:py-3 align-middle"
                                  >
                                    {cell === 'Мужской' ? (
                                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 whitespace-nowrap border border-blue-200/80 dark:border-blue-900/60">
                                        Муж. ♂
                                      </span>
                                    ) : cell === 'Женский' ? (
                                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 whitespace-nowrap border border-rose-200/80 dark:border-rose-900/60">
                                        Жен. ♀
                                      </span>
                                    ) : cell === 'Общий' ? (
                                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap border border-zinc-200 dark:border-zinc-700">
                                        Общ. ⚥
                                      </span>
                                    ) : isHebrew ? (
                                      <div className="flex items-center justify-between gap-2 min-w-0">
                                        <span
                                          dir="rtl"
                                          onClick={() => handlePlay(cell, cellKey)}
                                          className={`min-w-0 cursor-pointer select-text hover:text-blue-600 dark:hover:text-blue-400 transition leading-snug ${
                                            isPrimaryHebrewCol
                                              ? isCursive
                                                ? 'font-cursive text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400'
                                                : 'font-hebrew text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50'
                                              : isCursive
                                              ? 'font-cursive text-lg sm:text-xl text-zinc-800 dark:text-zinc-200'
                                              : 'font-hebrew text-sm sm:text-base text-zinc-800 dark:text-zinc-200'
                                          }`}
                                          title="Нажмите на текст, чтобы прослушать произношение"
                                        >
                                          {userProfile.showNikkud ? cell : stripNikkud(cell)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlay(cell, cellKey);
                                          }}
                                          className={`p-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                                            isPlaying
                                              ? 'bg-blue-600 text-white shadow-xs scale-110'
                                              : 'text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/60'
                                          }`}
                                          title="Прослушать произношение (как произносится)"
                                          aria-label="Прослушать произношение"
                                        >
                                          <Volume2
                                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                              isPlaying ? 'animate-pulse text-white' : ''
                                            }`}
                                          />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-snug break-words font-medium">
                                        {renderFormattedText(
                                          cell,
                                          handlePlay,
                                          isCursive,
                                          userProfile.showNikkud,
                                          playingKey
                                        )}
                                      </span>
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
              <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                {topic.rules.map((rule, rIdx) => (
                  <li key={rIdx} className="leading-relaxed">
                    {renderFormattedText(
                      rule,
                      handlePlay,
                      isCursive,
                      userProfile.showNikkud,
                      playingKey
                    )}
                  </li>
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
              const sentPlayKey = `sent-${sIdx}`;
              const isSentPlaying = playingKey === sentPlayKey;

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
                        onClick={() => handlePlay(sentence.hebrew, sentPlayKey)}
                        className={`font-bold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition ${
                          isCursive
                            ? 'font-cursive text-2xl md:text-3xl text-blue-600 dark:text-blue-400'
                            : 'font-hebrew text-lg text-zinc-900 dark:text-zinc-50'
                        }`}
                        title="Нажмите на предложение, чтобы прослушать произношение"
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
                    onClick={() => handlePlay(sentence.hebrew, sentPlayKey)}
                    className={`p-2.5 rounded-xl shadow-sm transition active:scale-95 shrink-0 cursor-pointer ${
                      isSentPlaying
                        ? 'bg-emerald-600 text-white scale-105'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title="השמע משפט (Озвучить)"
                  >
                    <Volume2 className={`w-4 h-4 ${isSentPlaying ? 'animate-pulse text-white' : ''}`} />
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
