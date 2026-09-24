import type { PhoneInformationEvidenceRule } from '../data/phone/contracts';

export interface GoalEvidence {
  goalIndex: number;
  met: boolean;
  evidence: Array<{ role: 'user' | 'assistant'; quote: string; turnIndex?: number }>;
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
  informationRules: Record<number, PhoneInformationEvidenceRule> = {},
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
    const evidence: GoalEvidence['evidence'] = item.evidence.map((e: { role: string; quote: string; turnIndex?: number }) => {
      if (!e || !['user', 'assistant'].includes(e.role) || typeof e.quote !== 'string' || normalized(e.quote).length < 2 ||
          !transcript.some(t => t.role === e.role && normalized(t.hebrew).includes(normalized(e.quote)))) {
        throw new Error('Unverifiable goal evidence');
      }
      if (e.turnIndex !== undefined && (!Number.isInteger(e.turnIndex) || e.turnIndex < 0 ||
          transcript[e.turnIndex]?.role !== e.role || !normalized(transcript[e.turnIndex].hebrew).includes(normalized(e.quote)))) {
        throw new Error('Unverifiable evidence turn');
      }
      return { role: e.role as 'user' | 'assistant', quote: e.quote,
        ...(e.turnIndex === undefined ? {} : { turnIndex: e.turnIndex }) };
    });

    const goalText = goalTexts[item.goalIndex] || '';
    let isMet = item.met;

    if (isMet) {
      if (!evidence.some((e: { role: string }) => e.role === 'user')) throw new Error('No student evidence');

      // Information retrieval goals ("узнать", "выяснить", "получить информацию")
      // require that the interlocutor actually provided the facts in the conversation.
      // Asking a question without an assistant reply is only an attempt, not goal fulfillment.
      if (isInformationRetrievalGoal(goalText)) {
        // Resolve the quoted turns, not the first user/any later assistant. Repeated
        // quotes need an explicit index so a different exchange cannot prove this goal.
        const located = evidence.map(e => {
          const indices = transcript.flatMap((t, i) => t.role === e.role && normalized(t.hebrew).includes(normalized(e.quote)) ? [i] : []);
          return { ...e, index: e.turnIndex ?? (indices.length === 1 ? indices[0] : -1) };
        }).filter(e => e.index >= 0);
        const users = located.filter(e => e.role === 'user');
        const rule = informationRules[item.goalIndex];
        const clean = (s: string) => normalized(s).replace(/[.,!?;:"׳״]/g, ' ').replace(/\s+/g, ' ').trim();
        const matches = (patterns: string[], clause: string) => patterns.some(p => new RegExp(`^(?:${p})$`, 'u').test(clean(clause)));
        isMet = located.filter(e => e.role === 'assistant').some(answer => {
          const previous = users.find(u => u.index < answer.index &&
            !transcript.slice(u.index + 1, answer.index).some(t => t.role === 'user'));
          if (!rule) return !!previous; // Semantic relevance remains model-assessed without an authored rule.
          const fullTurn = normalized(transcript[answer.index].hebrew);
          // Check full clauses too: a quoted substring must not hide a negation/question.
          if (/(?:^|\s)(?:לא|אולי|אין)(?:\s|$)/u.test(fullTurn)) return false;
          const clauses = fullTurn.match(/[^.!?;,]+[.!?;,]?/gu) || [];
          return clauses.some(clause => {
            if (clause.includes('?') || !clean(answer.quote).includes(clean(clause))) return false;
            // A complete relevant fact may precede the question, including in a greeting.
            if (matches(rule.answerPatterns, clause)) return true;
            return !!previous && new RegExp(rule.questionPattern, 'u').test(clean(previous.quote)) &&
              matches(rule.shortAnswerPatterns, clause);
          });
        });
      }
    }

    return {
      goalIndex: item.goalIndex,
      met: isMet,
      evidence: isMet ? evidence : (item.met ? [] : evidence),
    };
  });
}
