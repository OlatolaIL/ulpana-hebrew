import type { GoalType } from '@/data/phone/contracts';

/**
 * Infer a goal's semantic type from its Russian text.
 * Returns 'other' for ambiguous cases that need author review.
 * This is a fallback — authored goalTypes[] in the contract take priority.
 *
 * NOT a semantic evaluator. Only classifies what structural evidence is needed;
 * actual meaning assessment is performed by the LLM.
 */
export function inferGoalType(goalText: string): GoalType {
  if (!goalText || typeof goalText !== 'string') return 'other';
  const t = goalText.trim().toLowerCase();

  if (/^(?:узнать|выяснить|получить\s+(?:информацию|ответ|сведения))/.test(t))
    return 'information_retrieval';

  if (/^(?:спросить|попросить|уточнить|предложить|рассказать|сообщить|назвать|объяснить|выбрать|ответить|описать)/.test(t))
    return 'student_action';

  if (/^(?:договориться|согласовать)/.test(t))
    return 'agreement';

  if (/^(?:подтвердить|проверить\s+понимание)/.test(t))
    return 'acknowledgement';

  return 'other';
}

/**
 * Resolve goal types for all goals in a lesson.
 * Uses authored array if present; falls back to inferGoalType() per goal.
 * Returns resolved types AND the indices where inference was used
 * (so validate_phone_contracts.cjs can report them for author review).
 */
export function resolveGoalTypes(
  goals: string[],
  authored?: GoalType[],
): { types: GoalType[]; inferredIndices: number[] } {
  const inferredIndices: number[] = [];
  const types: GoalType[] = goals.map((g, i) => {
    if (authored && i < authored.length && authored[i] !== undefined) {
      return authored[i];
    }
    inferredIndices.push(i);
    return inferGoalType(g);
  });
  return { types, inferredIndices };
}
