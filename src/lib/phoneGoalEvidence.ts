export interface GoalEvidence {
  goalIndex: number;
  met: boolean;
  evidence: Array<{ role: 'user' | 'assistant'; quote: string }>;
}

/** Evidence must be traceable to the actual transcript; an end flag is not evidence. */
export function validatePhoneGoalEvidence(
  raw: unknown,
  goalCount: number,
  transcript: Array<{ role: string; hebrew: string }>,
): GoalEvidence[] {
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
    if (item.met && !evidence.some((e: { role: string }) => e.role === 'user')) throw new Error('No student evidence');
    return { goalIndex: item.goalIndex, met: item.met, evidence };
  });
}
