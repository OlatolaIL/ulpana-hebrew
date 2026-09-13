import { Exercise } from '@/types';
import { parseHebrewSentence, stripPunctuation, isPunctuationToken, areWordsEqual } from './sentenceParser';

/** The answer key defines the grade; explanatory prose may only supply punctuation. */
export function getExerciseSentence(exercise: Exercise) {
  if (exercise.type !== 'build_sentence') return null;
  const answer = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer.join(' ')
    : exercise.correctAnswer;
  const canonical = parseHebrewSentence(answer);
  const match = exercise.explanation?.match(/:\s*([^()]+?)(?:\s*\(|$)/);
  const described = match && /[\u0590-\u05FF]/.test(match[1])
    ? parseHebrewSentence(match[1].trim()) : null;
  const parsed = described && described.cleanWords.length === canonical.cleanWords.length &&
    described.cleanWords.every((word, index) => areWordsEqual(word, canonical.cleanWords[index]))
    ? described : canonical;
  return {
    parsed,
    cleanOptions: (exercise.options || []).map(stripPunctuation).filter(word => word && !isPunctuationToken(word)),
    targetWords: canonical.cleanWords,
    fullSentence: parsed.fullSentence,
  };
}
