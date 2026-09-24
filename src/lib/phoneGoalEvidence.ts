import type { PhoneInformationEvidenceRule } from '../data/phone/contracts';
import { resolveGoalTypes } from './goalTypeResolver';

export interface GoalEvidence {
  goalIndex: number;
  met: boolean;
  evidence: Array<{ role: 'user' | 'assistant'; quote: string; turnIndex?: number }>;
}

/** Goals that require information to be actually received from the interlocutor.
 *  Kept for backward compatibility with existing tests. */
export function isInformationRetrievalGoal(goalText: string): boolean {
  if (!goalText || typeof goalText !== 'string') return false;
  const trimmed = goalText.trim();
  return /^(?:узнать|выяснить|получить\s+(?:информацию|ответ|сведения))(?:\s+|,|$|:)/iu.test(trimmed);
}

/** Goals where the communicative action is performed by the student.
 *  Kept for backward compatibility with existing tests. */
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
  authoredGoalTypes?: import('../data/phone/contracts').GoalType[],
): GoalEvidence[] {
  const goalCount = Array.isArray(goalCountOrGoals) ? goalCountOrGoals.length : goalCountOrGoals;
  const goalTexts = Array.isArray(goalCountOrGoals) ? goalCountOrGoals : [];
  if (!Array.isArray(raw) || raw.length !== goalCount) throw new Error('Missing goal assessment');
  const seen = new Set<number>();
  const normalized = (s: string) => s.replace(/[\u0591-\u05C7]/g, '').replace(/\s+/g, ' ').trim();

  // Resolve goal types once for all goals (authored takes priority over inferred).
  const { types: goalTypes } = resolveGoalTypes(goalTexts, authoredGoalTypes);

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

    const goalType = goalTypes[item.goalIndex] ?? 'other';
    let isMet = item.met;

    if (isMet) {
      if (!evidence.some((e: { role: string }) => e.role === 'user')) throw new Error('No student evidence');

      // Information retrieval goals («узнать», «выяснить», «получить информацию»)
      // require that the interlocutor actually provided the facts in the conversation.
      // Asking a question without an assistant reply is only an attempt, not goal fulfillment.
      if (goalType === 'information_retrieval') {
        const clean = (s: string) => normalized(s).replace(/[.,!?;:"׳״]/g, ' ').replace(/\s+/g, ' ').trim();
        const matches = (patterns: string[], clause: string) =>
          patterns.some(p => new RegExp(`^(?:${p})$`, 'u').test(clean(clause)));

        /**
         * C2 FIX: check whether a specific clause is a negation/condition without a fact,
         * rather than blocking on any negative word in the full turn.
         * This allows «אין בעיה. נייר לפח הכחול.» (D14) while still blocking
         * «רק אם העירייה תאשר...» (D12) and hearsay phrases (D13).
         */
        const isNegationOrConditionOnly = (clause: string): boolean => {
          const c = clean(clause);
          // Pure negation with no factual content
          if (/^(?:לא|אין|אולי)\s*$/.test(c)) return true;
          // Conditional: «only if», «maybe if», general «if/when», «on condition that»
          if (/^(?:רק\s+אם|אולי\s+אם|אם\s|כש\s|בתנאי\s+ש)/.test(c)) return true;
          // Hearsay / erroneously attributed information
          if (/^(?:לפי\s+שמועה|לפי\s+מה\s+שאמרו|לפי\s+שמועה\s+שגויה)/.test(c)) return true;
          return false;
        };

        // Locate each evidence item to a specific turn index.
        const located = evidence.map(e => {
          const indices = transcript.flatMap((t, i) =>
            t.role === e.role && normalized(t.hebrew).includes(normalized(e.quote)) ? [i] : []);
          return { ...e, index: e.turnIndex ?? (indices.length === 1 ? indices[0] : -1) };
        }).filter(e => e.index >= 0);

        const users = located.filter(e => e.role === 'user');
        const rule = informationRules[item.goalIndex];

        // C3 FIX: unify the greeting-fact rule across all lessons (not only authored-rule lessons).
        // A complete fact in a greeting (before any student turn) is always a valid information source.
        const firstUserIndex = located.find(e => e.role === 'user')?.index ?? Infinity;

        isMet = located.filter(e => e.role === 'assistant').some(answer => {
          // A fact delivered before any student question (greeting) is valid for all lessons.
          const isGreetingFact = answer.index < firstUserIndex;
          // A fact delivered after a specific student question.
          const previous = users.find(u => u.index < answer.index &&
            !transcript.slice(u.index + 1, answer.index).some(t => t.role === 'user'));

          if (!rule) {
            // Without an authored rule, semantic relevance is model-assessed.
            // Both a preceding student question and a greeting fact are structurally valid.
            return !!previous || isGreetingFact;
          }

          const fullTurn = normalized(transcript[answer.index].hebrew);
          const clauses = fullTurn.match(/[^.!?;,]+[.!?;,]?/gu) || [];

          // D12: if ANY clause in the actor's turn is a conditional/caveat, the entire
          // turn is disqualified — a fact conditioned on «only if X» is not confirmed.
          // Note: «אין בעיה» alone is not a conditional clause (D14 preserved).
          if (clauses.some(c => isNegationOrConditionOnly(c))) return false;

          return clauses.some(clause => {
            if (clause.includes('?')) return false;
            if (!clean(answer.quote).includes(clean(clause))) return false;
            // A complete relevant fact may precede the question, including in a greeting.
            if (matches(rule.answerPatterns, clause)) return true;
            return (!!previous || isGreetingFact) &&
              new RegExp(rule.questionPattern, 'u').test(clean(previous?.quote ?? '')) &&
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
