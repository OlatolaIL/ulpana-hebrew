import {
  ScriptedDialogue,
  ScriptedDialogueTurn,
  GenderVariant,
  DialogueParticipant,
  Lesson,
} from '@/types';
import { DETAILED_LESSONS, getLessonById } from './lessonsData';
import { stripNikkud } from '@/lib/transcription';
import {
  getDialogueTurnVariant,
  makeTurn,
  adaptSentenceForGenders,
} from './dialogues/dialogueUtils';
import { DIALOGUES_01_10 } from './dialogues/dialogues_01_10';
import { DIALOGUES_11_25 } from './dialogues/dialogues_11_25';

// Реэкспорт вспомогательных функций для компонентов
export { getDialogueTurnVariant, makeTurn, adaptSentenceForGenders };

/**
 * Детально проработанные авторские диалоги для уроков Ульпана
 * Сценарии написаны вручную, проверены на естественность, логическую связность
 * и грамматическое согласование родов (זכר / נקבה).
 */
export const HANDCRAFTED_DIALOGUES: Record<number, ScriptedDialogue> = {
  ...DIALOGUES_01_10,
  ...DIALOGUES_11_25,
};

/**
 * Контекстно-осмысленная сборка диалога для уроков, у которых еще нет ручного сценария.
 * В отличие от слепого склеивания независимых упражнений, этот генератор создает
 * логичную вопросно-ответную цепочку бесед с учетом ролей и целей урока.
 */
function createScriptedDialogueFromLesson(lesson: Lesson): ScriptedDialogue {
  const lessonId = lesson.id;
  const diag = lesson.dialogue;
  const sents = lesson.basicSentences || [];
  const vocab = lesson.vocabulary || [];

  // 1. Определение персонажей
  const aiRoleName = diag.aiRole || 'Собеседник';
  const userRoleName = diag.userRole || 'Ученик';

  const speakerAMale: DialogueParticipant = {
    nameRu: aiRoleName.split(' ')[0] || 'Собеседник',
    nameHe: 'דָּנִי',
    roleRu: aiRoleName,
    roleHe: 'בֶּן שִׂיחָה',
    avatarEmoji: '💬',
    gender: 'male',
  };

  const speakerAFemale: DialogueParticipant = {
    nameRu: aiRoleName.split(' ')[0] ? `${aiRoleName.split(' ')[0]} (ж.р.)` : 'Собеседница',
    nameHe: 'מִיכַל',
    roleRu: aiRoleName,
    roleHe: 'בַּת שִׂיחָה',
    avatarEmoji: '👩‍💼',
    gender: 'female',
  };

  const speakerBMale: DialogueParticipant = {
    nameRu: userRoleName,
    nameHe: 'תַּלְמִיד',
    roleRu: userRoleName,
    roleHe: 'תַּלְמִיד',
    avatarEmoji: '🙋‍♂️',
    gender: 'male',
  };

  const speakerBFemale: DialogueParticipant = {
    nameRu: `${userRoleName} (ж.р.)`,
    nameHe: 'תַּלְמִידָה',
    roleRu: userRoleName,
    roleHe: 'תַּלְמִידָה',
    avatarEmoji: '🙋‍♀️',
    gender: 'female',
  };

  // 2. Сборка реплик диалога в логичной вопросно-ответной последовательности
  const turns: ScriptedDialogueTurn[] = [];

  // РЕПЛИКА 1 (Спикер А / Собеседник): Аутентичное начало разговора из сценария урока
  const initMsg = diag.initialMessage || {
    hebrew: 'שָׁלוֹם! מָה נִשְׁמַע? אֵיךְ הוֹלֵךְ הַיּוֹם?',
    transcription: 'шалóм! ма нишмá? эйх hолéх hайóм?',
    translation: 'Привет! Как дела? Как проходит день?',
  };

  const initVariants = adaptSentenceForGenders(
    initMsg.hebrew,
    initMsg.transcription,
    initMsg.translation
  );

  turns.push({
    id: `turn_${lessonId}_1`,
    speaker: 'a',
    intentRu: diag.situation || 'Поздороваться и начать разговор по теме урока',
    acceptableKeywords: diag.vocabularyHints || [stripNikkud(initMsg.hebrew).split(' ')[0]],
    sampleVariations: [initMsg.hebrew],
    variants: initVariants,
  });

  // РЕПЛИКА 2 (Спикер Б / Ученик): Прямой ответ на вопрос Спикера А по теме урока
  // Ищем подходящее утвердительное высказывание из словаря или базовых фраз
  const answerSentence = sents.find((s) => !s.hebrew.includes('?')) || sents[0] || {
    hebrew: 'שָׁלוֹם, הַכֹּל טוֹב מְאוֹד, תּוֹדָה רַבָּה!',
    transcription: 'шалóм, hакóль тов мэóд, тодá рабá!',
    translation: 'Здравствуйте, все отлично, большое спасибо!',
  };

  const s2Variants = adaptSentenceForGenders(
    answerSentence.hebrew,
    answerSentence.transcription,
    answerSentence.translation
  );

  turns.push({
    id: `turn_${lessonId}_2`,
    speaker: 'b',
    intentRu: diag.goals && diag.goals[0] ? diag.goals[0] : `Ответить собеседнику: ${answerSentence.translation}`,
    acceptableKeywords: vocab.slice(0, 4).map((w) => stripNikkud(w.hebrew)),
    sampleVariations: [answerSentence.hebrew],
    variants: s2Variants,
  });

  // РЕПЛИКА 3 (Спикер А / Собеседник): Логичный встречный вопрос / реакция собеседника
  const s3Base: GenderVariant = {
    hebrew: 'מְעֻלֶּה! וּמָה עוֹד אַתָּה יָכוֹל לְסַפֵּר עַל זֶה?',
    transcription: 'мэулé! у-ма од атá яхóль лэсапэ́р аль зэ?',
    translation: 'Отлично! А что еще вы можете рассказать об этом?',
  };

  const s3Variants = {
    mm: s3Base,
    mf: {
      hebrew: 'מְעֻלֶּה! וּמָה עוֹד אַתְּ יְכוֹלָה לְסַפֵּר עַל זֶה?',
      transcription: 'мэулé! у-ма од ат йэхолá лэсапэ́р аль зэ?',
      translation: 'Отлично! А что еще вы можете рассказать об этом? (к женщине)',
    },
    fm: s3Base,
    ff: {
      hebrew: 'מְעֻלֶּה! וּמָה עוֹד אַתְּ יְכוֹלָה לְסַפֵּר עַל זֶה?',
      transcription: 'мэулé! у-ма од ат йэхолá лэсапэ́р аль зэ?',
      translation: 'Отлично! А что еще вы можете рассказать об этом? (к женщине)',
    },
  };

  turns.push({
    id: `turn_${lessonId}_3`,
    speaker: 'a',
    intentRu: 'Похвалить за ответ и расспросить подробнее',
    acceptableKeywords: ['מעולה', 'יופי', 'ספר לי', 'מה עוד'],
    sampleVariations: [s3Base.hebrew],
    variants: s3Variants,
  });

  // РЕПЛИКА 4 (Спикер Б / Ученик): Развернутое высказывание по цели урока
  const secondSentence = sents.find((s) => s.id !== answerSentence.id && !s.hebrew.includes('?')) || sents[1] || {
    hebrew: 'אֲנִי מְאֹד שָׂמֵחַ לִלְמֹד וּלְדַבֵּר עִבְרִית בָּאוּלְפָּן.',
    transcription: 'анӣ мэóд самэ́ах лильмóд у-лэдабэ́р иврӣт ба-ульпáн.',
    translation: 'Я очень рад учиться и говорить на иврите в ульпане.',
  };

  const s4Variants = adaptSentenceForGenders(
    secondSentence.hebrew,
    secondSentence.transcription,
    secondSentence.translation
  );

  turns.push({
    id: `turn_${lessonId}_4`,
    speaker: 'b',
    intentRu: diag.goals && diag.goals[1] ? diag.goals[1] : `Рассказать подробнее: ${secondSentence.translation}`,
    acceptableKeywords: vocab.slice(2, 7).map((w) => stripNikkud(w.hebrew)),
    sampleVariations: [secondSentence.hebrew],
    variants: s4Variants,
  });

  // РЕПЛИКА 5 (Спикер А / Собеседник): Теплое одобрение и похвала
  const s5Base: GenderVariant = {
    hebrew: 'יוֹפִי מְאוֹד! הָעִבְרִית שֶׁלְּךָ מִשְׁתַּפֶּרֶת מִיּוֹם לְיוֹם.',
    transcription: 'йóфи мэóд! hа-иврӣт шельхá миштапэ́рет ми-йом лэ-йом.',
    translation: 'Очень хорошо! Твой иврит улучшается со дня на день.',
  };

  const s5Variants = {
    mm: s5Base,
    mf: {
      hebrew: 'יוֹפִי מְאוֹד! הָעִבְרִית שֶׁלָּךְ מִשְׁתַּפֶּרֶת מִיּוֹם לְיוֹם.',
      transcription: 'йóфи мэóд! hа-иврӣт шелáх миштапэ́рет ми-йом лэ-йом.',
      translation: 'Очень хорошо! Твой иврит улучшается со дня на день (к женщине).',
    },
    fm: s5Base,
    ff: {
      hebrew: 'יוֹפִי מְאוֹד! הָעִבְרִית שֶׁלָּךְ מִשְׁתַּפֶּרֶת מִיּוֹם לְיוֹם.',
      transcription: 'йóфи мэóд! hа-иврӣт шелáх миштапэ́рет ми-йом лэ-йом.',
      translation: 'Очень хорошо! Твой иврит улучшается со дня на день (к женщине).',
    },
  };

  turns.push({
    id: `turn_${lessonId}_5`,
    speaker: 'a',
    intentRu: 'Похвалить за отличный иврит и выразить поддержку',
    acceptableKeywords: ['יופי', 'עברית', 'משתפרת', 'כל הכבוד'],
    sampleVariations: [s5Base.hebrew],
    variants: s5Variants,
  });

  // РЕПЛИКА 6 (Спикер Б / Ученик): Вежливая благодарность и прощание
  const s6Variants = {
    mm: {
      hebrew: 'תּוֹדָה רַבָּה לְךָ! הָיָה מְאוֹד נָעִים, לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лэхá! hайá мэóд наӣм, лэhитраóт.',
      translation: 'Большое спасибо вам! Было очень приятно, до свидания.',
    },
    mf: {
      hebrew: 'תּוֹדָה רַבָּה לָךְ! הָיָה מְאוֹד נָעִים, לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лах! hайá мэóд наӣм, лэhитраóт.',
      translation: 'Большое спасибо вам! Было очень приятно, до свидания (к женщине).',
    },
    fm: {
      hebrew: 'תּוֹדָה רַבָּה לְךָ! הָיָה מְאוֹד נָעִים, לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лэхá! hайá мэóд наӣм, лэhитраóт.',
      translation: 'Большое спасибо вам! Было очень приятно, до свидания.',
    },
    ff: {
      hebrew: 'תּוֹדָה רַבָּה לָךְ! הָיָה מְאוֹד נָעִים, לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лах! hайá мэóд наӣм, лэhитраóт.',
      translation: 'Большое спасибо вам! Было очень приятно, до свидания (к женщине).',
    },
  };

  turns.push({
    id: `turn_${lessonId}_6`,
    speaker: 'b',
    intentRu: 'Поблагодарить собеседника и вежливо попрощаться',
    acceptableKeywords: ['תודה', 'להתראות', 'שלום', 'נעים'],
    sampleVariations: ['תודה רבה להתראות', 'תודה ולהתראות'],
    variants: s6Variants,
  });

  return {
    id: `dialogue_${lessonId}`,
    lessonId,
    titleRu: diag.title || lesson.titleRussian,
    titleHe: lesson.titleHebrew,
    situationRu: diag.situation || lesson.description,
    speakerA: {
      male: speakerAMale,
      female: speakerAFemale,
    },
    speakerB: {
      male: speakerBMale,
      female: speakerBFemale,
    },
    turns,
  };
}

/**
 * Получение полного структурированного диалога для любого урока (1-100)
 */
export function getScriptedDialogueForLesson(lessonId: number): ScriptedDialogue {
  // 1. Проверяем наличие детального ручного сценария
  if (HANDCRAFTED_DIALOGUES[lessonId]) {
    return HANDCRAFTED_DIALOGUES[lessonId];
  }

  // 2. Получаем данные урока из каталога 100 уроков
  const lesson = getLessonById(lessonId) || DETAILED_LESSONS[lessonId];
  if (!lesson) {
    // Безопасный фолбэк на 1 урок, если номер выходит за пределы
    return HANDCRAFTED_DIALOGUES[1];
  }

  return createScriptedDialogueFromLesson(lesson);
}
