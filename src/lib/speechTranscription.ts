export function normalizeHebrewHomophones(text: string): string {
  if (!text) return '';
  let res = text.trim();
  res = res.replace(/(^|[\s.,!?:;])(זֶ?ה|הִ?נֵּ?ה|כֵּ?ן\s+זֶ?ה)\s+(?:עֵ?ת|אֵ?ט|טֵ?ת|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עֵט');
  res = res.replace(/(^|[\s.,!?:;])(זה|הנה|כן\s+זה)\s+(?:עת|אט|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עט');
  res = res.replace(/^(?:עת|אט|טת)[.!?]?$/gi, 'עט');
  res = res.replace(/^(?:עֵת|אֵט|טֵת)[.!?]?$/gi, 'עֵט');
  return res;
}

export function isWhisperSilenceHallucination(text: string): boolean {
  if (!text) return true;
  const clean = text
    .replace(/[.,!?:;״"'\-_/\\]/g, '')
    .trim()
    .toLowerCase();

  const hallucinations = new Set([
    'תודה על הצפייה',
    'תודה שצפיתם',
    'צפייה מהנה',
    'thanks for watching',
    'thank you for watching',
    'спасибо за просмотр',
    'субтитры',
  ]);

  return hallucinations.has(clean);
}
