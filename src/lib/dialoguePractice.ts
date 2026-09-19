import type { DialogueEvaluationResult, ScriptedDialogueTurn } from '@/types';

// A failed service request is not an assessment of the student's answer.
export async function requestDialogueEvaluation(
  input: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<DialogueEvaluationResult> {
  const response = await fetch('/api/ai/dialogue/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });
  if (!response.ok) throw new Error('Dialogue evaluation unavailable');
  const value = await response.json();
  if (
    !value || typeof value.isCorrect !== 'boolean' ||
    typeof value.score !== 'number' || !Number.isFinite(value.score) ||
    value.score < 0 || value.score > 100 ||
    !['perfect', 'good', 'incorrect'].includes(value.assessment) ||
    typeof value.feedbackRu !== 'string' || !value.feedbackRu.trim() ||
    (value.isCorrect && value.assessment === 'incorrect')
  ) throw new Error('Invalid dialogue evaluation');

  return {
    isCorrect: value.isCorrect,
    score: value.score,
    assessment: value.assessment,
    feedbackRu: value.feedbackRu,
    userSpokenHebrew: String(input.userSpokenHebrew ?? ''),
    ...(typeof value.betterAlternative === 'string' ? { betterAlternative: value.betterAlternative } : {}),
    ...(typeof value.pronunciationScore === 'number' ? { pronunciationScore: value.pronunciationScore } : {}),
    ...(typeof value.pronunciationFeedbackRu === 'string' ? { pronunciationFeedbackRu: value.pronunciationFeedbackRu } : {}),
  };
}

export function isDialoguePracticeComplete(
  turns: Pick<ScriptedDialogueTurn, 'speaker'>[],
  side: 'a' | 'b',
  history: Record<number, DialogueEvaluationResult>,
): boolean {
  const ownTurns = turns.flatMap((turn, index) => turn.speaker === side ? [index] : []);
  return ownTurns.length > 0 && ownTurns.every(index => history[index]?.isCorrect === true);
}
