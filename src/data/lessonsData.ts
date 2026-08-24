/**
 * База данных программы обучения ивриту (100 уроков: Алеф 1-50, Бет 51-100)
 * Методика классического израильского ульпана с транскрипцией по стандарту (h для ה).
 */

import { Lesson, Level } from '@/types';
import { ALEF_LESSONS_01_10 } from './lessons/alef_01_10';
import { ALEF_LESSONS_11_25 } from './lessons/alef_11_25';
import { ALEF_LESSONS_26_35 } from './lessons/alef_26_35';
import { ALEF_LESSONS_36_50 } from './lessons/alef_36_50';
import { BET_LESSONS_51_65 } from './lessons/bet_51_65';
import { BET_LESSONS_66_80 } from './lessons/bet_66_80';
import { BET_LESSONS_81_90 } from './lessons/bet_81_90';
import { BET_LESSONS_91_100 } from './lessons/bet_91_100';

// Детально проработанные данные для всех 100 уроков (Алеф 1-50 + Бет 51-100)
export const DETAILED_LESSONS: Record<number, Lesson> = {
  ...ALEF_LESSONS_01_10,
  ...ALEF_LESSONS_11_25,
  ...ALEF_LESSONS_26_35,
  ...ALEF_LESSONS_36_50,
  ...BET_LESSONS_51_65,
  ...BET_LESSONS_66_80,
  ...BET_LESSONS_81_90,
  ...BET_LESSONS_91_100,
};

// Полный каталог 100 уроков программы Ульпана
export const LESSONS_CATALOG: Array<{
  id: number;
  level: Level;
  number: number;
  titleHebrew: string;
  titleRussian: string;
  category: string;
  description: string;
}> = Array.from({ length: 100 }, (_, i) => {
  const num = i + 1;
  const lesson = DETAILED_LESSONS[num];
  if (lesson) {
    return {
      id: lesson.id,
      level: lesson.level,
      number: lesson.number,
      titleHebrew: lesson.titleHebrew,
      titleRussian: lesson.titleRussian,
      category: lesson.category,
      description: lesson.description,
    };
  }
  return {
    id: num,
    level: (num <= 50 ? 'alef' : 'bet') as Level,
    number: num,
    titleHebrew: `שִׁיעוּר ${num}`,
    titleRussian: `Урок ${num}`,
    category: num <= 50 ? 'Уровень Алеф' : 'Уровень Бет',
    description: `Урок ${num} курса иврита.`,
  };
});

/**
 * Получение урока по ID (возвращает детальный урок)
 */
export function getLessonById(id: number): Lesson {
  if (DETAILED_LESSONS[id]) {
    return DETAILED_LESSONS[id];
  }

  const catalogItem = LESSONS_CATALOG.find((l) => l.id === id) || LESSONS_CATALOG[0];

  return {
    id: catalogItem.id,
    level: catalogItem.level,
    number: catalogItem.number,
    titleHebrew: catalogItem.titleHebrew,
    titleRussian: catalogItem.titleRussian,
    category: catalogItem.category,
    description: catalogItem.description,
    grammar: [
      {
        title: `Тема урока ${catalogItem.number}: ${catalogItem.titleRussian}`,
        summary: `Основные правила и грамматические структуры для уровня ${catalogItem.level === 'alef' ? 'Алеф (א)' : 'Бет (ב)'}.`,
        explanation: `В этом уроке мы изучаем грамматические конструкции по теме «${catalogItem.titleRussian}».
        
Обратите внимание на построение фраз и использование предлогов в живой речи.`,
        rules: [
          'Соблюдайте согласование в роде и числе.',
          'Буква ה в транскрипции передается символом "h".',
        ],
      },
    ],
    vocabulary: [
      {
        id: `w${id}-1`,
        hebrew: catalogItem.titleHebrew.split(' ')[0] || 'מִלָּה',
        hebrewPlain: catalogItem.titleHebrew.split(' ')[0] || 'מלה',
        transcription: 'милá',
        translation: 'слово / тема урока',
        partOfSpeech: 'noun',
        lessonId: id,
      },
    ],
    basicSentences: [
      {
        id: `s${id}-1`,
        hebrew: `${catalogItem.titleHebrew} - שִׁיעוּר חָשׁוּב.`,
        transcription: `${catalogItem.titleRussian} - шиӯр хашӯв.`,
        translation: 'Это важный урок в программе ульпана.',
      },
    ],
    dialogue: {
      title: `Диалог по теме: ${catalogItem.titleRussian}`,
      situation: `Практическая ситуация по теме ${catalogItem.titleRussian}.`,
      aiRole: 'Преподаватель или собеседник',
      userRole: 'Ученик ульпана',
      initialMessage: {
        hebrew: `שָׁלוֹם! בָּרוּךְ הַבָּא לְשִׁיעוּר ${catalogItem.number}. מָה נִשְׁמַע הַיּוֹם?`,
        transcription: `шалóм! барӯх hабá лэ-шиӯр ${catalogItem.number}. ма нишмá hайóм?`,
        translation: `Привет! Добро пожаловать на урок ${catalogItem.number}. Как твои дела сегодня?`,
      },
      goals: ['Ответить на приветствие', 'Потренировать выражения урока'],
      vocabularyHints: ['שָׁלוֹם', 'תוֹדָה', 'בְּבַקָּשָׁה'],
    },
    exercises: [
      {
        id: `ex${id}-1`,
        type: 'word_match',
        question: `Что изучается в уроке №${catalogItem.number}?`,
        options: [catalogItem.titleRussian, 'Погода', 'Космос', 'Автомобили'],
        correctAnswer: catalogItem.titleRussian,
      },
    ],
  };
}
