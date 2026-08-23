const NIKKUD_REGEX = /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/g;

export function stripNikkud(text: string): string {
  if (!text) return '';
  return text.replace(NIKKUD_REGEX, '');
}

export function isHebrewText(text: string): boolean {
  if (!text) return false;
  return /[\u0590-\u05FF]/.test(text);
}

export function cleanHebrewToken(token: string): string {
  if (!token) return '';
  return token.replace(/^[.,!?;:"'״׳()[\]{}—\-]+|[.,!?;:"'״׳()[\]{}—\-]+$/g, '');
}

export interface TextToken {
  id: string;
  text: string;
  cleanText: string;
  isHebrew: boolean;
}

export function tokenizeText(text: string): TextToken[] {
  if (!text) return [];
  const parts = text.split(/(\s+)/);
  return parts.map((part, idx) => {
    const clean = cleanHebrewToken(stripNikkud(part));
    const isHeb = isHebrewText(part) && clean.length > 0;
    return {
      id: `tok-${idx}-${clean}`,
      text: part,
      cleanText: clean,
      isHebrew: isHeb,
    };
  });
}

export function normalizeTranscription(transcription: string): string {
  if (!transcription) return '';
  return transcription.trim();
}
