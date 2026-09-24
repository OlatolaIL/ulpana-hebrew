import type { PhoneCallType, PhoneScenarioWord } from '@/types';

export type PhoneMemoryScope = 'social' | 'coffee' | 'rental' | 'delivery' | 'general';

/**
 * Semantic type of a single lesson goal.
 * Determines which structural evidence requirements apply in the evaluator.
 * 'other' = model-assessed with no additional structural constraint.
 */
export type GoalType =
  | 'information_retrieval'  // «Узнать…», «Выяснить…», «Получить информацию/ответ…»
  | 'student_action'         // «Спросить…», «Попросить…», «Рассказать…», «Сообщить…»
  | 'agreement'              // «Договориться…», «Согласовать…»
  | 'acknowledgement'        // «Подтвердить…», «Проверить понимание»
  | 'other';                 // All other goals; semantic evaluation by model only
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
  /** Optional explicit type per goal (index-aligned with goals[]).
   *  When absent, inferGoalType() from goalTypeResolver is used as fallback.
   *  'other' indices are reported by validate_phone_contracts.cjs for author review. */
  goalTypes?: GoalType[];
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
