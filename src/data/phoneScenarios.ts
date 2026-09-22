import type { Lesson, PhoneScenario, PhoneScenarioWord, UserGender } from '@/types';
import type { PhoneLessonContract } from './phone/contracts';
import { PHONE_CONTRACTS_01_50 } from './phone/lessons01_50';
import { PHONE_CONTRACTS_51_100 } from './phone/lessons51_100';
import supportData from './phone/support.json';

export const PHONE_LESSON_CONTRACTS: Record<number, PhoneLessonContract> = {
  ...PHONE_CONTRACTS_01_50, ...PHONE_CONTRACTS_51_100,
};

const support = supportData as Record<string, { avatarEmoji: string; usefulWords: PhoneScenarioWord[] }>;

export function getPhoneLessonContract(lessonNumber: number): PhoneLessonContract {
  const contract = PHONE_LESSON_CONTRACTS[lessonNumber];
  if (!contract) throw new Error(`No authored phone scenario for lesson ${lessonNumber}`);
  return contract;
}

function scenarioFromContract(lessonNumber: number, gender: UserGender, lesson?: Lesson): PhoneScenario {
  const c = getPhoneLessonContract(lessonNumber);
  const shared = support[String(lessonNumber)];
  const usefulWords = c.usefulWords || shared?.usefulWords || (lesson?.vocabulary || []).slice(0, 8).map(w => ({
    hebrew: w.hebrew, transcription: w.transcription || '', translation: w.translation,
  }));
  // Explicit variants belong to the speaker/addressed person; no global gender replacements.
  return JSON.parse(JSON.stringify({
    callerName: c.callerName, callerNameRu: c.callerNameRu, callerRole: c.callerRole,
    callerGender: c.callerGender, userRole: c.userRole, callType: c.callType,
    avatarEmoji: shared?.avatarEmoji || '📞', situationSummary: c.situationSummary,
    callerObjective: c.callerObjective, studentObjective: c.studentObjective,
    goals: c.goals, completionCondition: c.completionCondition, targetTurns: c.targetTurns,
    initialGreeting: c.greeting[gender], suggestedReplies: c.studentReplies[gender],
    vocabularyHints: c.vocabularyHints || usefulWords.map(w => w.hebrew), usefulWords,
    systemPromptAddition: '',
  }));
}

/** Compatibility export for consumers of the original ten authored phone situations. */
export const BESPOKE_PHONE_SCENARIOS: Record<number, PhoneScenario> = Object.fromEntries(
  [1, 2, 3, 4, 5, 6, 7, 15, 25, 40].map(id => [id, scenarioFromContract(id, 'male')]),
);

export function getLessonPhoneScenario(lesson: Lesson, gender: UserGender = 'male'): PhoneScenario {
  return scenarioFromContract(lesson.number, gender, lesson);
}

/** Retained for external consumers; scenario facts are no longer rewritten by regex. */
export function cleanGrammarJargon(text: string): string { return text?.trim() || ''; }
