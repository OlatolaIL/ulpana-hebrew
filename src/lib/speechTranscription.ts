export function normalizeHebrewHomophones(text: string): string {
  if (!text) return '';
  let res = text.trim();
  res = res.replace(/(^|[\s.,!?:;])(זֶ?ה|הִ?נֵּ?ה|כֵּ?ן\s+זֶ?ה)\s+(?:עֵ?ת|אֵ?ט|טֵ?ת|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עֵט');
  res = res.replace(/(^|[\s.,!?:;])(זה|הנה|כן\s+זה)\s+(?:עת|אט|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עט');
  res = res.replace(/^(?:עת|אט|טת)[.!?]?$/gi, 'עט');
  res = res.replace(/^(?:עֵת|אֵט|טֵת)[.!?]?$/gi, 'עֵט');
  return res;
}

export function isWhisperSilenceHallucination(text: string, avgLogprob?: number): boolean {
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
    'subtitles by',
    'amara.org',
  ]);

  if (hallucinations.has(clean)) return true;

  // Классические короткие фантомы тишины Whisper при низкой лог-вероятности (< -0.85)
  if (typeof avgLogprob === 'number' && avgLogprob < -0.85) {
    const lowConfidenceSilencePhantoms = new Set([
      'תודה',
      'תודה רבה',
      'שלום',
      'ביי',
      'להתראות',
      'יום טוב',
      'ערב טוב',
      'בוקר טוב',
    ]);
    if (lowConfidenceSilencePhantoms.has(clean)) {
      return true;
    }
  }

  return false;
}

/**
 * Детекция галлюцинации Whisper по словарному промпту (Prompt Conditioning Hallucination).
 * Возникает, когда на вход Whisper подается тишина/шум вместе со списком подсказок:
 * декодер нейросети «достраивает» фоновый шум под переданные слова с низкой вероятностью лог-правдоподобия.
 * Стандартный порог ошибки Whisper (OpenAI logprob_threshold): -1.0.
 */
export function isWhisperPromptHallucination(
  text: string,
  prompt?: string,
  avgLogprob?: number
): boolean {
  if (!text) return true;
  if (typeof avgLogprob !== 'number') return false;

  // 1. Официальный порог сбоя Whisper (OpenAI logprob_threshold = -1.0):
  // Если средняя лог-вероятность падает ниже -1.00 — это чистый акустический шум/галлюцинация
  if (avgLogprob < -1.00) {
    return true;
  }

  // 2. Если модель крайне неуверенна (avg_logprob < -0.80) и был передан prompt:
  // проверяем, не собрана ли фраза из ключевых слов подсказки (דירה, סלון, חדרים и т.д.)
  if (prompt && avgLogprob < -0.80) {
    const textWords = text
      .replace(/[.,!?:;״"'\-_/\\]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length >= 2);

    if (textWords.length === 0) return true;

    const promptClean = prompt.replace(/[.,!?:;״"'\-_/\\]/g, ' ').toLowerCase();
    const promptWords = new Set(promptClean.split(/\s+/).filter((w) => w.length >= 2));

    let matchingWords = 0;
    for (const tw of textWords) {
      if (promptWords.has(tw)) {
        matchingWords++;
        continue;
      }
      // Проверяем снятие однобуквенных и двухбуквенных префиксов иврита (ש, ל, ב, מ, ה, כ, ו, כש, וש, ול, וב)
      const strippedPrefix = tw.replace(/^(?:כש|וש|ול|וב|[בלמהשכו])/, '');
      if (strippedPrefix.length >= 2 && promptWords.has(strippedPrefix)) {
        matchingWords++;
        continue;
      }
      // Проверяем множественное число иврита (דירות -> דירה)
      const singularFeminine = tw.replace(/ות$/, 'ה');
      if (promptWords.has(singularFeminine)) {
        matchingWords++;
        continue;
      }
    }

    // Если 2 и более ключевых слова или >= 35% слов взяты из подсказки при avgLogprob < -0.80
    if (matchingWords >= 2 || (matchingWords / textWords.length >= 0.35)) {
      return true;
    }
  }

  return false;
}
