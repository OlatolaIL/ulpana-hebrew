'use client';

import React, { useState } from 'react';
import { Volume2, CheckCircle2, Lightbulb, Table } from 'lucide-react';
import { Lesson, UserProfile } from '@/types';
import { speakHebrew } from '@/lib/speech';
import { markLessonTabCompleted } from '@/lib/storage';
import { stripNikkud } from '@/lib/transcription';
import { getHebrewPictogram } from '@/lib/pictograms';
import { SpokenHebrewDrawer } from './SpokenHebrewDrawer';

interface LessonTheoryProps {
  lesson: Lesson;
  userProfile: UserProfile;
  onCompleted?: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

/**
 * Изоляция BiDi для заголовков с ивритом в скобках,
 * предотвращающая выворачивание скобок (глитч UBA) на мобильных экранах
 */
function renderTitleWithBdi(title: string, isCursive?: boolean, showNikkud: boolean = true) {
  if (!title) return null;
  const match = title.match(/^(.*?)\s*\(([\u0590-\u05FF\s/]+)\)(.*?)$/);
  if (match) {
    const [, before, hebrew, after] = match;
    return (
      <span className="inline-flex items-center flex-wrap gap-x-1.5">
        <span>{before}</span>
        <span className="inline-flex items-center text-zinc-500 dark:text-zinc-400 font-normal text-sm sm:text-base" dir="ltr">
          (
          <bdi
            dir="rtl"
            className={
              isCursive
                ? 'font-cursive text-xl font-bold text-blue-600 dark:text-blue-400'
                : 'font-hebrew font-bold text-blue-600 dark:text-blue-400'
            }
          >
            {showNikkud ? hebrew : stripNikkud(hebrew)}
          </bdi>
          )
        </span>
        {after && <span>{after}</span>}
      </span>
    );
  }
  return title;
}

/**
 * Рендеринг инлайн-текста с поддержкой жирного шрифта, кавычек и ивритских слов.
 * Строго изолирует иврит (<bdi dir="rtl">) и транскрипцию (<bdi dir="ltr">),
 * не раздувая высоту строки (устранены тяжелые таблетки-кляксы).
 */
function renderFormattedText(
  text: string,
  onPlay?: (hebrew: string, key?: string) => void,
  isCursive?: boolean,
  showNikkud: boolean = true,
  playingKey?: string | null
) {
  if (!text) return null;

  // Разбиваем на жирный текст **...**, цитаты в «...» с ивритом или отдельные фразы на иврите
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
        // Проверяем наличие транскрипции в скобках, например: זֶה (зэ) или זֹאת / זוֹ (зот / зу)
        const hebrewMatch = inner.match(/([\u0590-\u05FF\s\-/"]+)/);
        const hebrewPart = hebrewMatch ? hebrewMatch[0].trim() : inner.trim();
        const extraPart = inner.replace(hebrewPart, '').trim();

        const itemKey = `fmt-${index}-${hebrewPart.slice(0, 10)}`;
        const isPlaying = playingKey === itemKey;

        return (
          <span key={index} className="inline-flex items-baseline gap-1 mx-0.5 align-baseline">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(hebrewPart, itemKey);
              }}
              className={`group inline-flex items-baseline gap-1 font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors cursor-pointer select-text rounded px-1 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 align-baseline ${
                isPlaying ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white' : ''
              }`}
              title="Прослушать произношение"
            >
              <bdi dir="rtl" className={isCursive ? 'font-cursive text-xl' : 'font-hebrew text-base sm:text-lg'}>
                {showNikkud ? hebrewPart : stripNikkud(hebrewPart)}
              </bdi>
              <Volume2
                className={`w-3.5 h-3.5 shrink-0 align-middle -mt-0.5 ${
                  isPlaying ? 'animate-pulse text-white' : 'opacity-60 group-hover:opacity-100'
                }`}
              />
            </button>
            {extraPart && (
              <bdi dir="ltr" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {extraPart}
              </bdi>
            )}
          </span>
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
          className={`group inline-flex items-baseline gap-1 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-text rounded px-1 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 align-baseline mx-0.5 ${
            isPlaying ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white' : ''
          }`}
          title="Прослушать произношение"
        >
          «<bdi dir="rtl" className={isCursive ? 'font-cursive text-lg' : 'font-hebrew font-bold'}>
            {showNikkud ? inner : stripNikkud(inner)}
          </bdi>»
          <Volume2
            className={`w-3 h-3 shrink-0 align-middle -mt-0.5 ${
              isPlaying ? 'animate-pulse text-white' : 'opacity-50 group-hover:opacity-100'
            }`}
          />
        </button>
      );
    }

    if (isHebrewWord && onPlay && part.trim().length > 1) {
      const cleanWord = part.trim();
      const itemKey = `heb-${index}-${cleanWord.slice(0, 10)}`;
      const isPlaying = playingKey === itemKey;

      return (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(cleanWord, itemKey);
          }}
          className={`group inline-flex items-baseline gap-1 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer select-text rounded px-1 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 align-baseline mx-0.5 ${
            isPlaying ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white' : ''
          }`}
          title="Прослушать произношение"
        >
          <bdi dir="rtl" className={isCursive ? 'font-cursive text-xl' : 'font-hebrew text-base sm:text-lg font-bold'}>
            {showNikkud ? cleanWord : stripNikkud(cleanWord)}
          </bdi>
          <Volume2
            className={`w-3 h-3 shrink-0 align-middle -mt-0.5 ${
              isPlaying ? 'animate-pulse text-white' : 'opacity-40 group-hover:opacity-100'
            }`}
          />
        </button>
      );
    }

    return part;
  });
}

/**
 * Структурированный парсер и рендерер объяснений.
 * Преобразует сырой markdown со стрелками `->` и дефисами в эстетичные учебные карточки.
 */
function renderStructuredExplanation(
  explanation: string,
  onPlay?: (hebrew: string, key?: string) => void,
  isCursive?: boolean,
  showNikkud: boolean = true,
  playingKey?: string | null
) {
  if (!explanation) return null;

  const lines = explanation.split('\n');
  const renderedElements: React.ReactNode[] = [];

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const rawLine = lines[lIdx];
    const trimmed = rawLine.trim();
    if (!trimmed) {
      renderedElements.push(<div key={`empty-${lIdx}`} className="h-2" />);
      continue;
    }

    // 1. Проверяем паттерн структурированных примеров:
    // - Мужской род: **זֶה (зэ)** -> זֶה סֵפֶר (Это книга - м.р. на иврите), זֶה מוֹרֶה (Это учитель).
    const exampleMatch = trimmed.match(/^[-*]\s*([^:]+):\s*(\*\*[^*]+\*\*|[^\s]+)\s*(?:->|—|–)\s*(.+)$/);
    if (exampleMatch) {
      const [, category, keywordRaw, examplesRaw] = exampleMatch;
      const isMale = /муж/i.test(category);
      const isFemale = /жен/i.test(category);
      const isPlural = /множ/i.test(category);

      // Извлекаем пары пример-перевод
      // Регулярка ищет ивритские слова (включая аббревиатуры с гершайим " / ״ и апострофы ' / ׳)
      // и последующий русский перевод в скобках
      const exampleItems: Array<{ hebrew: string; translation: string }> = [];
      const itemRegex = /([\u0590-\u05FF"״'׳\-־]+(?:\s+[\u0590-\u05FF"״'׳\-־]+)*)\s*(?:\(([^)]+)\))?/g;
      let match;
      while ((match = itemRegex.exec(examplesRaw)) !== null) {
        const rawHebrew = match[1].replace(/^[,\s]+|[,\s]+$/g, '').trim();
        if (rawHebrew) {
          exampleItems.push({
            hebrew: rawHebrew,
            translation: match[2] ? match[2].trim() : '',
          });
        }
      }

      renderedElements.push(
        <div
          key={`example-card-${lIdx}`}
          className={`rounded-2xl p-4 sm:p-5 border shadow-2xs space-y-3 transition ${
            isMale
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/50'
              : isFemale
              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50'
              : isPlural
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50'
              : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          {/* Верхняя плашка карточки: Бейдж рода + Ключевое местоимение */}
          <div className="flex items-center justify-between gap-2 flex-wrap border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                isMale
                  ? 'bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                  : isFemale
                  ? 'bg-rose-100/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                  : isPlural
                  ? 'bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                  : 'bg-zinc-200/70 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
              }`}
            >
              <span>{isMale ? '♂️' : isFemale ? '♀️' : isPlural ? '👥' : '📌'}</span>
              <span>{category.trim()}</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Форма:</span>
              <span className="text-sm font-bold">
                {renderFormattedText(keywordRaw, onPlay, isCursive, showNikkud, playingKey)}
              </span>
            </div>
          </div>

          {/* Примеры предложений в виде аккуратных мини-карточек */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {exampleItems.map((ex, exIdx) => {
              const exPlayKey = `ex-${lIdx}-${exIdx}`;
              const isPlaying = playingKey === exPlayKey;

              return (
                <div
                  key={exIdx}
                  onClick={() => onPlay?.(ex.hebrew, exPlayKey)}
                  className={`p-3 rounded-xl border bg-white dark:bg-zinc-900/90 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition flex items-center justify-between gap-3 group ${
                    isPlaying ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-200/80 dark:border-zinc-800'
                  }`}
                  title="Нажмите, чтобы прослушать пример"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p
                      dir="rtl"
                      className={`font-bold transition ${
                        isCursive
                          ? 'font-cursive text-xl sm:text-2xl text-blue-600 dark:text-blue-400'
                          : 'font-hebrew text-lg font-extrabold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}
                    >
                      <bdi dir="rtl">{showNikkud ? ex.hebrew : stripNikkud(ex.hebrew)}</bdi>
                    </p>
                    {ex.translation && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                        {ex.translation}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay?.(ex.hebrew, exPlayKey);
                    }}
                    className={`p-1.5 rounded-lg shrink-0 transition ${
                      isPlaying
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60'
                    }`}
                    title="Озвучить пример"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-white' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
      continue;
    }

    // 2. Проверяем обычные списки (- пункт или * пункт)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2);
      renderedElements.push(
        <div key={`bullet-${lIdx}`} className="flex items-start gap-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
          <div className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed flex-1">
            {renderFormattedText(content, onPlay, isCursive, showNikkud, playingKey)}
          </div>
        </div>
      );
      continue;
    }

    // 3. Обычный абзац текста
    renderedElements.push(
      <p key={`p-${lIdx}`} className="text-sm sm:text-base text-zinc-700 dark:text-zinc-200 leading-relaxed">
        {renderFormattedText(rawLine, onPlay, isCursive, showNikkud, playingKey)}
      </p>
    );
  }

  return <div className="space-y-3">{renderedElements}</div>;
}

export const LessonTheory: React.FC<LessonTheoryProps> = ({
  lesson,
  userProfile,
  onCompleted,
  onUpdateProfile,
}) => {
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isSpokenDrawerOpen, setIsSpokenDrawerOpen] = useState(false);

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

  return (
    <div data-font-style={userProfile.fontStyle || 'print'} className="space-y-5 sm:space-y-6 max-w-3xl mx-auto pb-10">
      {/* 0. Презентабельный Hero-блок урока */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-transparent border border-blue-200/80 dark:border-blue-900/60 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-blue-600 text-white shadow-xs">
              Урок {lesson.number} • {lesson.level === 'bet' ? 'Уровень Бет (ב)' : 'Уровень Алеф (א)'}
            </span>
            {lesson.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                {lesson.category}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-3">
            <h1
              dir="rtl"
              onClick={() => handlePlay(lesson.titleHebrew, 'hero-hebrew')}
              className={`cursor-pointer select-text transition leading-tight ${
                isCursive
                  ? 'font-cursive text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400'
                  : 'font-hebrew text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title="Нажмите, чтобы прослушать название урока"
            >
              <bdi dir="rtl">{userProfile.showNikkud ? lesson.titleHebrew : stripNikkud(lesson.titleHebrew)}</bdi>
            </h1>
            <button
              type="button"
              onClick={() => handlePlay(lesson.titleHebrew, 'hero-hebrew')}
              className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                playingKey === 'hero-hebrew'
                  ? 'bg-blue-600 text-white shadow-xs scale-105'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/50'
              }`}
              title="Прослушать название темы"
              aria-label="Прослушать название темы"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-200">
            {lesson.titleRussian}
          </p>
        </div>

        {lesson.description && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1 border-t border-blue-100/80 dark:border-blue-900/40">
            {renderFormattedText(
              lesson.description,
              handlePlay,
              isCursive,
              userProfile.showNikkud,
              playingKey
            )}
          </div>
        )}
      </div>

      {/* 1. Грамматические темы */}
      {lesson.grammar.map((topic, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sm:space-y-5"
        >
          <div className="space-y-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {renderTitleWithBdi(topic.title, isCursive, userProfile.showNikkud)}
            </h3>
            {topic.summary && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                {renderFormattedText(
                  topic.summary,
                  handlePlay,
                  isCursive,
                  userProfile.showNikkud,
                  playingKey
                )}
              </p>
            )}
          </div>

          {/* Текст объяснения через структурированный парсер */}
          {topic.explanation && (
            <div className="pt-1">
              {renderStructuredExplanation(
                topic.explanation,
                handlePlay,
                isCursive,
                userProfile.showNikkud,
                playingKey
              )}
            </div>
          )}

          {/* Таблицы спряжения и форм */}
          {topic.tables &&
            topic.tables.map((table, tIdx) => (
              <div key={tIdx} className="space-y-2.5">
                {/* Заголовок таблицы */}
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{table.title}</span>
                </h4>

                {/* Адаптивные карточки на смартфонах и таблица на десктопе */}
                <div className="space-y-2.5">
                      {/* МОБИЛЬНЫЙ ВИД: Карточки без горизонтальной прокрутки */}
                      <div className="sm:hidden space-y-2">
                        {table.rows.map((row, rIdx) => {
                          const hebrewIdx = row.findIndex((c) => /[\u0590-\u05FF]/.test(c));
                          const transIdx = table.headers.findIndex((h) => /транскрип|произнош/i.test(h));
                          const translIdx = table.headers.findIndex((h) => /перевод|значен/i.test(h));
                          const genderIdx =
                            table.headers.findIndex((h) => /род/i.test(h)) !== -1
                              ? table.headers.findIndex((h) => /род/i.test(h))
                              : row.findIndex((c) => /^(Мужской|Женский|Общий)/i.test(c));
                          const formIdx = table.headers.findIndex((h) => /форма/i.test(h));

                          const hebrewCell = hebrewIdx !== -1 ? row[hebrewIdx] : null;
                          const transCell = transIdx !== -1 && transIdx !== hebrewIdx ? row[transIdx] : null;
                          const translCell = translIdx !== -1 && translIdx !== hebrewIdx ? row[translIdx] : null;
                          const genderCell = genderIdx !== -1 ? row[genderIdx] : null;
                          const formCell = formIdx !== -1 && formIdx !== hebrewIdx ? row[formIdx] : null;

                          const cellKey = `card-${i}-${tIdx}-${rIdx}`;
                          const isPlaying = playingKey === cellKey;

                          if (hebrewCell) {
                            const badge = genderCell || (formCell && !formCell.includes(hebrewCell) ? formCell : null);
                            const otherIndices = row.map((_, idx) => idx).filter(
                              (idx) =>
                                idx !== hebrewIdx &&
                                idx !== transIdx &&
                                idx !== translIdx &&
                                idx !== genderIdx &&
                                idx !== formIdx
                            );

                            return (
                              <div
                                key={rIdx}
                                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      dir="rtl"
                                      onClick={() => handlePlay(hebrewCell, cellKey)}
                                      className={`cursor-pointer select-text transition leading-tight ${
                                        isCursive
                                          ? 'font-cursive text-2xl font-bold text-blue-600 dark:text-blue-400'
                                          : 'font-hebrew text-xl font-bold text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400'
                                      }`}
                                      title="Нажмите на текст, чтобы прослушать произношение"
                                    >
                                      {userProfile.showNikkud ? hebrewCell : stripNikkud(hebrewCell)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlay(hebrewCell, cellKey);
                                      }}
                                      className={`p-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                                        isPlaying
                                          ? 'bg-blue-600 text-white shadow-xs scale-110'
                                          : 'text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 dark:hover:text-blue-300'
                                      }`}
                                      title="Прослушать произношение"
                                    >
                                      <Volume2
                                        className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-white' : ''}`}
                                      />
                                    </button>
                                    {transCell && userProfile.showTranscription && (
                                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                        [{transCell}]
                                      </span>
                                    )}
                                  </div>

                                  {badge && (
                                    <span
                                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold shrink-0 border ${
                                        badge.includes('Муж')
                                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/60'
                                          : badge.includes('Жен')
                                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60'
                                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                    >
                                      {badge === 'Мужской'
                                        ? 'Муж. ♂'
                                        : badge === 'Женский'
                                        ? 'Жен. ♀'
                                        : badge === 'Общий'
                                        ? 'Общ. ⚥'
                                        : badge}
                                    </span>
                                  )}
                                </div>

                                {translCell && (
                                  <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                    {renderFormattedText(
                                      translCell,
                                      handlePlay,
                                      isCursive,
                                      userProfile.showNikkud,
                                      playingKey
                                    )}
                                  </div>
                                )}

                                {otherIndices.length > 0 && (
                                  <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                                    {otherIndices.map((idx) => (
                                      <span key={idx}>
                                        <strong className="text-zinc-400">{table.headers[idx]}:</strong>{' '}
                                        {row[idx]}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          // Карточка для строк без иврита
                          return (
                            <div
                              key={rIdx}
                              className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-1.5"
                            >
                              {row.map((cell, cIdx) => (
                                <div key={cIdx} className="text-xs flex justify-between gap-2">
                                  <span className="text-zinc-400 font-semibold">{table.headers[cIdx]}:</span>
                                  <span className="text-zinc-800 dark:text-zinc-200 font-medium text-right">
                                    {cell}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>

                      {/* ДЕСКТОПНЫЙ ВИД: Полноразмерная таблица */}
                      <div className="hidden sm:block w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                        <table className="w-full text-left border-collapse table-auto">
                          <thead className="bg-zinc-50/90 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
                            <tr>
                              {table.headers.map((h, hIdx) => (
                                <th
                                  key={hIdx}
                                  className={`px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 ${
                                    hIdx === 0
                                      ? 'min-w-[140px]'
                                      : hIdx === 1
                                      ? 'min-w-[120px]'
                                      : hIdx === 2
                                      ? 'min-w-[170px]'
                                      : 'min-w-[160px]'
                                  }`}
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
                                    colHeader.toLowerCase().includes('инфинитив') ||
                                    colHeader.toLowerCase().includes('вопрос');

                                  return (
                                    <td
                                      key={cIdx}
                                      className="px-4 py-3.5 align-middle"
                                    >
                                      {cell === 'Мужской' ? (
                                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 whitespace-nowrap border border-blue-200/80 dark:border-blue-900/60">
                                          Муж. ♂
                                        </span>
                                      ) : cell === 'Женский' ? (
                                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 whitespace-nowrap border border-rose-200/80 dark:border-rose-900/60">
                                          Жен. ♀
                                        </span>
                                      ) : cell === 'Общий' ? (
                                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap border border-zinc-200 dark:border-zinc-700">
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
                                                  ? 'font-cursive text-2xl font-bold text-blue-600 dark:text-blue-400'
                                                  : 'font-hebrew text-lg font-bold text-zinc-900 dark:text-zinc-50'
                                                : isCursive
                                                ? 'font-cursive text-xl text-zinc-800 dark:text-zinc-200'
                                                : 'font-hebrew text-base text-zinc-800 dark:text-zinc-200'
                                            }`}
                                            title="Нажмите на текст, чтобы прослушать произношение"
                                          >
                                            <bdi dir="rtl">{userProfile.showNikkud ? cell : stripNikkud(cell)}</bdi>
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
                                              className={`w-4 h-4 ${
                                                isPlaying ? 'animate-pulse text-white' : ''
                                              }`}
                                            />
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words font-medium">
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
                    </div>
                </div>
            ))}

          {/* Правила и памятки */}
          {topic.rules && topic.rules.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50/90 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-200/90 dark:border-amber-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-100 font-bold text-sm sm:text-base">
                  <div className="p-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span>Важные правила темы</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpokenDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs active:scale-95 shrink-0"
                  title="Открыть шторку живой речи и ударений"
                >
                  <span>🗣️ Живая речь</span>
                  <span className="text-xs">→</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {topic.rules.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {rIdx + 1}
                    </div>
                    <div className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal flex-1">
                      {renderFormattedText(
                        rule,
                        handlePlay,
                        isCursive,
                        userProfile.showNikkud,
                        playingKey
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Разговорная речь (шторка) — для уроков без отдельного блока правил */}
      {!lesson.grammar.some((t) => t.rules && t.rules.length > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl sm:rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xl shrink-0">
              🗣️
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
                Живая речь и секреты ударения
              </h4>
              <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80">
                Сленг, разговорные сокращения и правила ударения
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSpokenDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <span>Открыть</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Базовые примеры предложений с озвучкой */}
      {lesson.basicSentences.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Базовые предложения темы
          </h3>

          <div className="space-y-3">
            {lesson.basicSentences.map((sentence, sIdx) => {
              const sentencePictogram = getHebrewPictogram(sentence.hebrew);
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
                            : 'font-hebrew text-xl sm:text-2xl text-zinc-900 dark:text-zinc-50'
                        }`}
                        title="Нажмите на предложение, чтобы прослушать произношение"
                      >
                        {userProfile.showNikkud ? sentence.hebrew : stripNikkud(sentence.hebrew)}
                      </p>
                    </div>

                    {/* Транскрипция */}
                    {userProfile.showTranscription && sentence.transcription && (
                      <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                        [{sentence.transcription}]
                      </p>
                    )}

                    {/* Перевод */}
                    {sentence.translation && (
                      <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-200 font-medium">
                        {sentence.translation}
                      </p>
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
                    title="Озвучить"
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
          <span>Я изучил теорию • Перейти к словарю (этап 2/6) ➡️</span>
        </button>
      </div>

      {/* ВЫЕЗЖАЮЩАЯ ШТОРКА ЖИВОЙ РЕЧИ */}
      <SpokenHebrewDrawer
        isOpen={isSpokenDrawerOpen}
        onClose={() => setIsSpokenDrawerOpen(false)}
        lessonId={lesson.id}
        category={lesson.category}
        lessonTitle={lesson.titleRussian || lesson.titleRu}
        userProfile={userProfile}
      />
    </div>
  );
};
