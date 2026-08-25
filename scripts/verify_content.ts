import { DETAILED_LESSONS, LESSONS_CATALOG } from '../src/data/lessonsData';
import { HEBREW_ALPHABET } from '../src/data/alphabetData';

interface Issue {
  lessonId?: number;
  section: string;
  item: string;
  error: string;
}

const issues: Issue[] = [];

console.log('🔍 ЗАПУСК ПОЛНОГО НЕЗАВИСИМОГО АУДИТА ВСЕХ 100 УРОКОВ И АЛФАВИТА...');

// 1. ПРОВЕРКА АЛФАВИТА
console.log('\n--- 1. Проверка алфавита ---');
const expectedLetterCount = 27; // 22 основные + 5 софитов
if (HEBREW_ALPHABET.length !== expectedLetterCount) {
  issues.push({
    section: 'Алфавит',
    item: `Количество букв: ${HEBREW_ALPHABET.length}`,
    error: `Ожидалось ${expectedLetterCount} букв`,
  });
}

HEBREW_ALPHABET.forEach((letter, index) => {
  if (!letter.letter || !letter.nameRussian || !letter.nameHebrew || !letter.sound || !letter.transcription) {
    issues.push({
      section: 'Алфавит',
      item: `Буква #${index + 1} (${letter.letter})`,
      error: 'Отсутствуют обязательные поля (имя, звук или транскрипция)',
    });
  }
  // Проверка кириллических букв-паразитов в ивритском поле
  if (/[а-яА-ЯёЁ]/.test(letter.letter) || /[а-яА-ЯёЁ]/.test(letter.nameHebrew)) {
    issues.push({
      section: 'Алфавит',
      item: `Буква #${index + 1} (${letter.letter})`,
      error: 'Обнаружены русские буквы в ивритском написании',
    });
  }
});

// 2. ПРОВЕРКА КАТАЛОГА (100 УРОКОВ)
console.log('\n--- 2. Проверка каталога уроков ---');
if (LESSONS_CATALOG.length !== 100) {
  issues.push({
    section: 'Каталог',
    item: `Количество уроков в каталоге: ${LESSONS_CATALOG.length}`,
    error: 'Ожидалось ровно 100 уроков в LESSONS_CATALOG',
  });
}

// 3. ПРОВЕРКА ВСЕХ 100 ДЕТАЛЬНЫХ УРОКОВ
console.log('\n--- 3. Проверка детальных уроков 1-100 ---');
const seenWordIds = new Set<string>();
const seenSentenceIds = new Set<string>();
const seenExerciseIds = new Set<string>();

for (let i = 1; i <= 100; i++) {
  const lesson = DETAILED_LESSONS[i];
  if (!lesson) {
    issues.push({
      lessonId: i,
      section: 'Каталог',
      item: `Урок ${i}`,
      error: 'Урок отсутствует в базе данных DETAILED_LESSONS',
    });
    continue;
  }

  // Проверка номера и ID
  if (lesson.id !== i || lesson.number !== i) {
    issues.push({
      lessonId: i,
      section: 'Метаданные',
      item: `Урок ${i}`,
      error: `Некорректный id (${lesson.id}) или number (${lesson.number})`,
    });
  }

  // Проверка уровня
  const expectedLevel = i <= 50 ? 'alef' : 'bet';
  if (lesson.level !== expectedLevel) {
    issues.push({
      lessonId: i,
      section: 'Метаданные',
      item: `Урок ${i}`,
      error: `Неверный уровень: ${lesson.level}, ожидался ${expectedLevel}`,
    });
  }

  // Проверка заголовков и метаданных
  if (!lesson.titleHebrew || !lesson.titleRussian || !lesson.description) {
    issues.push({
      lessonId: i,
      section: 'Метаданные',
      item: `Урок ${i}`,
      error: 'Пустой заголовок или описание урока',
    });
  }

  // Проверка грамматики
  if (!lesson.grammar || lesson.grammar.length === 0) {
    issues.push({
      lessonId: i,
      section: 'Грамматика',
      item: `Урок ${i}`,
      error: 'Отсутствует раздел грамматики',
    });
  } else {
    lesson.grammar.forEach((topic, tIdx) => {
      if (!topic.title || !topic.summary || !topic.explanation) {
        issues.push({
          lessonId: i,
          section: 'Грамматика',
          item: `Тема #${tIdx + 1}: ${topic.title || 'без названия'}`,
          error: 'Отсутствует название, саммари или объяснение правила',
        });
      }
      if (topic.tables) {
        topic.tables.forEach((table) => {
          const colCount = table.headers.length;
          table.rows.forEach((row, rIdx) => {
            if (row.length !== colCount) {
              issues.push({
                lessonId: i,
                section: 'Таблицы грамматики',
                item: `Таблица "${table.title}", строка ${rIdx + 1}`,
                error: `Несовпадение колонок: в строке ${row.length}, в шапке ${colCount}`,
              });
            }
          });
        });
      }
    });
  }

  // Проверка словаря
  if (!lesson.vocabulary || lesson.vocabulary.length === 0) {
    issues.push({
      lessonId: i,
      section: 'Словарь',
      item: `Урок ${i}`,
      error: 'Словарь пуст',
    });
  } else {
    lesson.vocabulary.forEach((word) => {
      // Уникальность ID
      if (seenWordIds.has(word.id)) {
        issues.push({
          lessonId: i,
          section: 'Словарь',
          item: `Слово ID ${word.id} (${word.hebrewPlain})`,
          error: 'Дубликат ID слова',
        });
      }
      seenWordIds.add(word.id);

      // Наличие обязательных полей
      if (!word.hebrew || !word.hebrewPlain || !word.transcription || !word.translation) {
        issues.push({
          lessonId: i,
          section: 'Словарь',
          item: `Слово ID ${word.id} (${word.hebrew || '??'})`,
          error: 'Отсутствует обязательное поле (hebrew, plain, transcription или translation)',
        });
      }

      // Проверка паразитной кириллицы/латиницы в корне
      if (word.root) {
        if (/[a-zA-Zа-яА-ЯёЁ]/.test(word.root)) {
          issues.push({
            lessonId: i,
            section: 'Словарь (Корни)',
            item: `Слово ${word.hebrewPlain} (корень: ${word.root})`,
            error: 'Обнаружены не-ивритские буквы в корне',
          });
        }
      }

      // Проверка паразитной кириллицы в иврите
      if (/[а-яА-ЯёЁ]/.test(word.hebrew) || /[а-яА-ЯёЁ]/.test(word.hebrewPlain)) {
        issues.push({
          lessonId: i,
          section: 'Словарь (Иврит)',
          item: `Слово ${word.hebrew}`,
          error: 'Обнаружена кириллица в ивритском написании слова',
        });
      }
    });
  }

  // Проверка базовых предложений
  if (!lesson.basicSentences || lesson.basicSentences.length === 0) {
    issues.push({
      lessonId: i,
      section: 'Базовые фразы',
      item: `Урок ${i}`,
      error: 'Отсутствуют базовые предложения',
    });
  } else {
    lesson.basicSentences.forEach((s) => {
      if (seenSentenceIds.has(s.id)) {
        issues.push({
          lessonId: i,
          section: 'Базовые фразы',
          item: `Фраза ID ${s.id}`,
          error: 'Дубликат ID фразы',
        });
      }
      seenSentenceIds.add(s.id);

      if (!s.hebrew || !s.transcription || !s.translation) {
        issues.push({
          lessonId: i,
          section: 'Базовые фразы',
          item: `Фраза ID ${s.id}`,
          error: 'Неполные данные предложения',
        });
      }
    });
  }

  // Проверка диалога
  if (!lesson.dialogue) {
    issues.push({
      lessonId: i,
      section: 'Диалог',
      item: `Урок ${i}`,
      error: 'Отсутствует сценарий диалога',
    });
  } else {
    const d = lesson.dialogue;
    if (!d.title || !d.situation || !d.aiRole || !d.userRole || !d.initialMessage || !d.goals || d.goals.length === 0) {
      issues.push({
        lessonId: i,
        section: 'Диалог',
        item: `Урок ${i} (${d.title || 'без названия'})`,
        error: 'Неполные параметры диалога или отсутствуют цели',
      });
    }
  }

  // Проверка упражнений
  if (!lesson.exercises || lesson.exercises.length === 0) {
    issues.push({
      lessonId: i,
      section: 'Упражнения',
      item: `Урок ${i}`,
      error: 'Отсутствуют упражнения',
    });
  } else {
    lesson.exercises.forEach((ex) => {
      if (seenExerciseIds.has(ex.id)) {
        issues.push({
          lessonId: i,
          section: 'Упражнения',
          item: `Упражнение ID ${ex.id}`,
          error: 'Дубликат ID упражнения',
        });
      }
      seenExerciseIds.add(ex.id);

      if (!ex.question || !ex.options || ex.options.length < 2 || !ex.explanation) {
        issues.push({
          lessonId: i,
          section: 'Упражнения',
          item: `Упражнение ID ${ex.id}`,
          error: 'Отсутствует вопрос, объяснение или недостаточно вариантов ответов (< 2)',
        });
      }

      // Проверка валидности правильного ответа
      if (ex.options) {
        if (Array.isArray(ex.correctAnswer)) {
          for (const ansItem of ex.correctAnswer) {
            if (!ex.options.includes(ansItem)) {
              issues.push({
                lessonId: i,
                section: 'Упражнения (Сборка фразы)',
                item: `Упражнение ID ${ex.id}`,
                error: `Элемент ответа "${ansItem}" отсутствует в опциях [${ex.options.join(', ')}]`,
              });
            }
          }
        } else {
          if (!ex.options.includes(ex.correctAnswer)) {
            issues.push({
              lessonId: i,
              section: 'Упражнения (Выбор ответа)',
              item: `Упражнение ID ${ex.id}`,
              error: `Правильный ответ "${ex.correctAnswer}" отсутствует в опциях [${ex.options.join(', ')}]`,
            });
          }
        }
      }
    });
  }
}

// 4. ВЫВОД ИТОГОВОГО ОТЧЕТА
console.log('\n==========================================');
console.log('      РЕЗУЛЬТАТЫ ПОЛНОГО АУДИТА (1-100)');
console.log('==========================================');
console.log(`Всего детальных уроков: ${Object.keys(DETAILED_LESSONS).length} / 100`);
console.log(`Всего уроков в каталоге: ${LESSONS_CATALOG.length} / 100`);
console.log(`Всего слов в словарях: ${seenWordIds.size}`);
console.log(`Всего базовых предложений: ${seenSentenceIds.size}`);
console.log(`Всего упражнений: ${seenExerciseIds.size}`);
console.log(`Проверено букв алфавита: ${HEBREW_ALPHABET.length}`);

if (issues.length === 0) {
  console.log('\n🎉 ПОЛНЫЙ АУДИТ УСПЕШНО ПРОЙДЕН! 0 ОШИБОК, 0 НЕСООТВЕТСТВИЙ.');
} else {
  console.error(`\n❌ ОБНАРУЖЕНО ОШИБОК: ${issues.length}`);
  issues.forEach((iss, idx) => {
    console.error(`\n[Ошибка #${idx + 1}]`);
    if (iss.lessonId) console.error(`  Урок: ${iss.lessonId}`);
    console.error(`  Раздел: ${iss.section}`);
    console.error(`  Элемент: ${iss.item}`);
    console.error(`  Проблема: ${iss.error}`);
  });
  process.exit(1);
}
