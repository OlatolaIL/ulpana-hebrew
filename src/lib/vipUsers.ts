import { Word, LessonProgress, UserProfile } from '@/types';

export const VIP_IDENTIFIERS = [
  'osa_il',
  'osa-il',
  'osail',
  'olatola',
  'azrie',
  '8215851',
];

export const VIP_EXPIRES_AT = 2088000000000; // 2036 year (~10 years)

export function isVipUser(
  username?: string | null,
  telegramId?: number | string | null,
  name?: string | null
): boolean {
  if (telegramId) {
    const idStr = String(telegramId).trim();
    if (idStr.includes('8215851') || VIP_IDENTIFIERS.includes(idStr)) {
      return true;
    }
  }

  const fields = [username, name].filter(Boolean) as string[];
  for (const field of fields) {
    const clean = field.toLowerCase().replace(/[@\s_-]/g, '').trim();
    for (const vip of VIP_IDENTIFIERS) {
      const cleanVip = vip.toLowerCase().replace(/[@\s_-]/g, '').trim();
      if (clean.includes(cleanVip) || cleanVip.includes(clean)) {
        return true;
      }
    }
  }

  return false;
}

export const DEFAULT_VIP_VOCABULARY: Word[] = [
  {
    id: 'vip-word-1',
    hebrew: 'שָׁלוֹם',
    hebrewPlain: 'שלום',
    transcription: 'шалóм',
    translation: 'мир, привет, здравствуйте, до свидания',
    partOfSpeech: 'noun',
    root: 'ש-ל-ם',
    lessonId: 1,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 5,
  },
  {
    id: 'vip-word-2',
    hebrew: 'תּוֹדָה',
    hebrewPlain: 'תודה',
    transcription: 'тодá',
    translation: 'спасибо, благодарность',
    partOfSpeech: 'noun',
    root: 'י-ד-ה',
    lessonId: 1,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 4,
  },
  {
    id: 'vip-word-3',
    hebrew: 'בְּבַקָּשָׁה',
    hebrewPlain: 'בבקשה',
    transcription: 'бэвакашá',
    translation: 'пожалуйста, прошу вас',
    partOfSpeech: 'expression',
    root: 'ב-ק-ש',
    lessonId: 1,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 4,
  },
  {
    id: 'vip-word-4',
    hebrew: 'בּוֹקֶר טוֹב',
    hebrewPlain: 'בוקר טוב',
    transcription: 'бóкер тов',
    translation: 'доброе утро',
    partOfSpeech: 'expression',
    lessonId: 1,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 3,
  },
  {
    id: 'vip-word-5',
    hebrew: 'עִבְרִית',
    hebrewPlain: 'עברית',
    transcription: 'иврúт',
    translation: 'иврит (язык)',
    partOfSpeech: 'noun',
    gender: 'f',
    lessonId: 2,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 3,
  },
  {
    id: 'vip-word-6',
    hebrew: 'אוּלְפָּן',
    hebrewPlain: 'אולפן',
    transcription: 'ульпáн',
    translation: 'ульпан, школа иврита, студия',
    partOfSpeech: 'noun',
    gender: 'm',
    lessonId: 2,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 2,
  },
  {
    id: 'vip-word-7',
    hebrew: 'מוֹרֶה',
    hebrewPlain: 'מורה',
    transcription: 'морé',
    translation: 'учитель, преподаватель',
    partOfSpeech: 'noun',
    gender: 'm',
    lessonId: 3,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 2,
  },
  {
    id: 'vip-word-8',
    hebrew: 'תַּלְמִיד',
    hebrewPlain: 'תלמיד',
    transcription: 'тальмúд',
    translation: 'ученик, студент',
    partOfSpeech: 'noun',
    gender: 'm',
    lessonId: 3,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 1,
  },
  {
    id: 'vip-word-9',
    hebrew: 'מְצוּיָּן',
    hebrewPlain: 'מצוין',
    transcription: 'мецуйáн',
    translation: 'отлично, превосходно',
    partOfSpeech: 'adjective',
    gender: 'm',
    lessonId: 4,
    isUserAdded: true,
    dateAdded: Date.now() - 86400000 * 1,
  },
  {
    id: 'vip-word-10',
    hebrew: 'לְהִתְרָאוֹת',
    hebrewPlain: 'להתראות',
    transcription: 'леhитраóт',
    translation: 'до свидания, до встречи',
    partOfSpeech: 'expression',
    root: 'ר-א-ה',
    lessonId: 4,
    isUserAdded: true,
    dateAdded: Date.now(),
  },
];

export function getVipDefaultProgress(): {
  completedLessons: number[];
  lessonProgress: Record<number, LessonProgress>;
  personalVocabulary: Word[];
} {
  const completedLessons: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const lessonProgress: Record<number, LessonProgress> = {};

  for (let i = 1; i <= 12; i++) {
    lessonProgress[i] = {
      completedTabs: ['vocabulary', 'grammar', 'dialogue', 'flashcards', 'ai_practice'],
      isCompleted: true,
      score: 100,
      lastVisited: Date.now() - (13 - i) * 3600000,
    };
  }

  // Также открываем 13-й урок как текущий в процессе
  lessonProgress[13] = {
    completedTabs: ['vocabulary', 'grammar'],
    isCompleted: false,
    score: 85,
    lastVisited: Date.now(),
  };

  return {
    completedLessons,
    lessonProgress,
    personalVocabulary: DEFAULT_VIP_VOCABULARY,
  };
}

export function applyVipProfileEnhancements(profile: UserProfile): UserProfile {
  const isVip = isVipUser(profile.username, profile.telegramId, profile.name);
  if (!isVip) return profile;

  const vipData = getVipDefaultProgress();

  // Объединяем существующий прогресс с VIP-прогрессом
  const mergedLessonProgress = {
    ...vipData.lessonProgress,
    ...(profile.lessonProgress || {}),
  };

  const mergedCompleted = Array.from(
    new Set([...vipData.completedLessons, ...(profile.completedLessons || [])])
  );

  const existingWordIds = new Set(profile.personalVocabulary?.map((w) => w.hebrewPlain) || []);
  const mergedVocab = [
    ...(profile.personalVocabulary || []),
    ...vipData.personalVocabulary.filter((w) => !existingWordIds.has(w.hebrewPlain)),
  ];

  return {
    ...profile,
    subscriptionTier: 'pro',
    subscriptionExpiresAt: VIP_EXPIRES_AT,
    completedLessons: mergedCompleted,
    lessonProgress: mergedLessonProgress,
    personalVocabulary: mergedVocab,
  };
}
