export interface GoalEvidence {
  goalIndex: number;
  met: boolean;
  evidence: Array<{ role: 'user' | 'assistant'; quote: string }>;
}

/** Goals that require information to be actually received from the interlocutor. */
export function isInformationRetrievalGoal(goalText: string): boolean {
  if (!goalText || typeof goalText !== 'string') return false;
  const trimmed = goalText.trim();
  return /^(?:узнать|выяснить|получить\s+(?:информацию|ответ|сведения))(?:\s+|,|$|:)/iu.test(trimmed);
}

/** Goals where the communicative action is performed by the student. */
export function isStudentActionGoal(goalText: string): boolean {
  if (!goalText || typeof goalText !== 'string') return false;
  const trimmed = goalText.trim();
  return /^(?:спросить|попросить|уточнить|предложить|рассказать|сообщить|назвать|объяснить|выбрать|подтвердить)(?:\s+|,|$|:)/iu.test(trimmed);
}

/** Evidence must be traceable to the actual transcript; an end flag is not evidence. */
export function validatePhoneGoalEvidence(
  raw: unknown,
  goalCountOrGoals: number | string[],
  transcript: Array<{ role: string; hebrew: string }>,
): GoalEvidence[] {
  const goalCount = Array.isArray(goalCountOrGoals) ? goalCountOrGoals.length : goalCountOrGoals;
  const goalTexts = Array.isArray(goalCountOrGoals) ? goalCountOrGoals : [];
  if (!Array.isArray(raw) || raw.length !== goalCount) throw new Error('Missing goal assessment');
  const seen = new Set<number>();
  const normalized = (s: string) => s.replace(/[\u0591-\u05C7]/g, '').replace(/\s+/g, ' ').trim();
  return raw.map(item => {
    if (!item || !Number.isInteger(item.goalIndex) || item.goalIndex < 0 || item.goalIndex >= goalCount ||
        seen.has(item.goalIndex) || typeof item.met !== 'boolean' || !Array.isArray(item.evidence)) {
      throw new Error('Invalid goal assessment');
    }
    seen.add(item.goalIndex);
    const evidence = item.evidence.map((e: { role: string; quote: string }) => {
      if (!e || !['user', 'assistant'].includes(e.role) || typeof e.quote !== 'string' || normalized(e.quote).length < 2 ||
          !transcript.some(t => t.role === e.role && normalized(t.hebrew).includes(normalized(e.quote)))) {
        throw new Error('Unverifiable goal evidence');
      }
      return { role: e.role as 'user' | 'assistant', quote: e.quote };
    });

    const goalText = goalTexts[item.goalIndex] || '';
    let isMet = item.met;

    if (isMet) {
      if (!evidence.some((e: { role: string }) => e.role === 'user')) throw new Error('No student evidence');

      // Information retrieval goals ("узнать", "выяснить", "получить информацию")
      // require that the interlocutor actually provided the facts in the conversation.
      // Asking a question without an assistant reply is only an attempt, not goal fulfillment.
      if (isInformationRetrievalGoal(goalText)) {
        const hasAssistantEvidence = evidence.some((e: { role: string }) => e.role === 'assistant');
        const firstUserIdx = transcript.findIndex(t => t.role === 'user');
        const hasAssistantReplyAfterUser = firstUserIdx !== -1 && transcript.slice(firstUserIdx + 1).some(t => t.role === 'assistant');

        if (!hasAssistantEvidence || !hasAssistantReplyAfterUser) {
          isMet = false;
        }
      }
    }

    return {
      goalIndex: item.goalIndex,
      met: isMet,
      evidence: isMet ? evidence : (item.met ? [] : evidence),
    };
  });
}
