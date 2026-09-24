import type { PhoneCallType, PhoneScenarioWord } from '@/types';

export type PhoneMemoryScope = 'social' | 'coffee' | 'rental' | 'delivery' | 'general';
/** Optional authored checks for a known ambiguous information goal. Patterns match
 * complete, unpointed clauses; a short answer is allowed only after its question. */
export interface PhoneInformationEvidenceRule {
  questionPattern: string;
  answerPatterns: string[];
  shortAnswerPatterns: string[];
}
export interface PhonePhrase {
  hebrew: string;
  transcription: string;
  translation: string;
}

/** Authored phone context. Student examples are never instructions for the actor. */
export interface PhoneLessonContract {
  callerName: string;
  callerNameRu: string;
  callerRole: string;
  callerGender: 'male' | 'female';
  userRole: string;
  callType: PhoneCallType;
  situationSummary: string;
  callerObjective: string;
  studentObjective: string;
  goals: string[];
  informationEvidence?: Record<number, PhoneInformationEvidenceRule>;
  completionCondition: string;
  /** Facts the actor owns. Unknown prices/times must not be invented as agreements. */
  facts: string[];
  /** Details the actor may ask the student, if not already answered. */
  studentDetails: string[];
  forbiddenActions: string[];
  memoryScope: PhoneMemoryScope;
  targetTurns: 3 | 4;
  greeting: { male: PhonePhrase; female: PhonePhrase };
  studentReplies: { male: PhonePhrase[]; female: PhonePhrase[] };
  vocabularyHints?: string[];
  usefulWords?: PhoneScenarioWord[];
}

export const phrase = (hebrew: string, transcription: string, translation: string): PhonePhrase =>
  ({ hebrew, transcription, translation });

/** Use only for a phrase that addresses neither a male nor a female specifically. */
export const both = (value: PhonePhrase): { male: PhonePhrase; female: PhonePhrase } =>
  ({ male: value, female: value });

export const replies = (...values: PhonePhrase[]): { male: PhonePhrase[]; female: PhonePhrase[] } =>
  ({ male: values, female: values });
