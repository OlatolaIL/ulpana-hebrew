/**
 * Бесплатный браузерный голосовой движок (Text-to-Speech и Speech-to-Text) для иврита
 */

import { stripNikkud } from './transcription';

let preferredHebrewVoice: SpeechSynthesisVoice | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechSafetyTimer: any = null;

/**
 * Инициализация и поиск лучшего голоса для иврита в системе
 */
export function initHebrewVoices(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Ищем голос с кодом he-IL или he
      const heVoice =
        voices.find((v) => v.lang === 'he-IL' || v.lang === 'he') ||
        voices.find((v) => v.lang.startsWith('he')) ||
        null;
      preferredHebrewVoice = heVoice;
      return heVoice;
    };

    const existing = findVoice();
    if (existing) {
      resolve(existing);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(findVoice());
    };

    // Таймаут на случай, если голоса уже загружены
    setTimeout(() => {
      resolve(findVoice());
    }, 500);
  });
}

/**
 * Воспроизведение текста на иврите с помощью встроенного движка браузера
 */
function fixHebrewPhonetics(text: string): string {
  let res = text;
  // 1. ספרי לי -> סַפְּרִי לִי (расскажи мне [ж.р.], чтобы движок не читал как sifri li)
  res = res.replace(/(^|\s)ספרי(\s+לי)/g, '$1סַפְּרִי$2');
  // 2. ספר לי -> סַפֵּר לִי (расскажи мне [м.р.], чтобы движок не читал как sefer li)
  res = res.replace(/(^|\s)ספר(\s+לי)/g, '$1סַפֵּר$2');
  // 3. תספרי לי -> תְּסַפְּרִי לִי
  res = res.replace(/(^|\s)תספרי(\s+לי)/g, '$1תְּסַפְּרִי$2');
  // 4. תספר לי -> תְּסַפֵּר לִי
  res = res.replace(/(^|\s)תספר(\s+לי)/g, '$1תְּסַפֵּר$2');

  // 5. Женские местоименные суффиксы с ך (браузерные TTS движки по умолчанию читают ך как мужской суффикс -cha / lecha):
  // לָךְ / לַךְ (lach - тебе/у тебя ж.р.) -> לַח (звучит строго как 'лах', а не 'леха')
  res = res.replace(/(?<=^|[^\u0590-\u05FF])\u05DC[\u0591-\u05C7]*[\u05B8\u05B7][\u0591-\u05C7]*\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, '\u05DC\u05B7\u05D7');

  // בָּךְ / בַּךְ (bach - в тебе ж.р.) -> בַּח (звучит как 'бах', а не 'беха')
  res = res.replace(/(?<=^|[^\u0590-\u05FF])\u05D1[\u0591-\u05C7]*[\u05B8\u05B7][\u0591-\u05C7]*\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, '\u05D1\u05B7\u05D7');

  // שֶׁלָּךְ / שֶׁלָךְ / שֶׁלַּךְ (shelach - твой/твоя ж.р.) -> שֶׁלָּח
  res = res.replace(/(?<=^|[^\u0590-\u05FF])(\u05E9[\u0591-\u05C7]*\u05DC[\u0591-\u05C7]*[\u05B8\u05B7][\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, (m, p1) => p1 + '\u05D7');

  // אוֹתָךְ / אֹתָךְ / אותָךְ (otach - тебя ж.р. вин.п.) -> אוֹתָח
  res = res.replace(/(?<=^|[^\u0590-\u05FF])(\u05D0[\u0591-\u05C7]*\u05D5?[\u0591-\u05C7]*\u05EA[\u0591-\u05C7]*[\u05B8\u05B7][\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, (m, p1) => p1 + '\u05D7');

  // אִתָּךְ / אִתָךְ / איתָךְ (itach - с тобой ж.р.) -> אִתָּח
  res = res.replace(/(?<=^|[^\u0590-\u05FF])(\u05D0[\u0591-\u05C7]*\u05D9?[\u0591-\u05C7]*\u05EA[\u0591-\u05C7]*[\u05B8\u05B7][\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, (m, p1) => p1 + '\u05D7');

  // כָּמוֹךְ / כְּמוֹךְ (kamoch - как ты ж.р.) -> כָּמוֹח
  res = res.replace(/(?<=^|[^\u0590-\u05FF])(\u05DB[\u0591-\u05C7]*\u05DE[\u0591-\u05C7]*[\u05D5\u05B9]+[\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, (m, p1) => p1 + '\u05D7');

  // מִמֵּךְ / מִמֶּךְ (mimech - от тебя ж.р.) -> מִמֵּח
  res = res.replace(/(?<=^|[^\u0590-\u05FF])(\u05DE[\u0591-\u05C7]*\u05DE[\u0591-\u05C7]*[\u05B5\u05B6][\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, (m, p1) => p1 + '\u05D7');

  // Формы множественного склонения ж.р. (-ayich): עָלַיִךְ, אֵלַיִךְ, בִּלְעָדַיִךְ, לְפָנַיִךְ, אַחֲרַיִךְ
  res = res.replace(/(?<=[\u0590-\u05FF]+\u05B7[\u0591-\u05C7]*\u05D9[\u05B4]?[\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, '\u05D7');

  // Суффикс -ech (ж.р.): שְׁלוֹמֵךְ, בִּשְׁבִילֵךְ, שְׁמֵךְ, לְבַדֵּךְ, אֶצְלֵךְ
  res = res.replace(/(?<=[\u0590-\u05FF]+[\u05B5\u05B6][\u0591-\u05C7]*)\u05DA[\u05B0]?(?=[^\u0590-\u05FF]|$)/g, '\u05D7');

  return res;
}

/**
 * Очищает текст от эмодзи, служебных символов и меток перед озвучкой
 */
export function cleanHebrewForSpeech(text: string): string {
  if (!text) return '';
  let res = text
    // 1. Удаляем все Emoji и расширенные графические символы (чтобы TTS не зачитывал их названия)
    .replace(/\p{Extended_Pictographic}/gu, '')
    // 2. Удаляем специфичные символы меток интерфейса (♂, ♀, ⚥, ✔️, ❌, ①, ②, и т.д.)
    .replace(/[♂♀⚥✔️❌①②③④⑤👉📦🌸🎙️👥↗️➡️⬅️⬆️⬇️✨💫\u200D\uFE0F\uFE0E]/g, '')
    // 3. Удаляем метаданные в скобках (например "(1)", "(2+)", "(мужчина)")
    .replace(/\([а-яёА-ЯЁ0-9+ \t,.-]+\)/gi, '')
    // 4. Очищаем кавычки и скобки
    .replace(/["'«»[\]{}()]/g, ' ')
    // 5. Удаляем кириллицу, если в строку случайно попал перевод
    .replace(/[а-яёА-ЯЁ]+/gi, '')
    // 6. Убираем дефисы, слэши и множественные пробелы
    .replace(/[—–\-_/\\|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return fixHebrewPhonetics(res);
}

export function speakHebrew(
  text: string,
  options: { rate?: number; pitch?: number } = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser.');
      resolve();
      return;
    }

    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }

    window.speechSynthesis.cancel(); // останавливаем предыдущую речь

    // Очищаем от эмодзи/символов и нормализуем огласовки (ניקוד) для четкого произношения
    const speechText = cleanHebrewForSpeech(text);
    if (!speechText) {
      resolve();
      return;
    }

    let userRate = 0.7;
    try {
      const stored = localStorage.getItem('hebrew_app_profile_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.speechRate === 'number') userRate = parsed.speechRate;
      }
    } catch {}

    const utterance = new SpeechSynthesisUtterance(speechText);
    activeUtterance = utterance; // Защита от Garbage Collection в Chrome
    utterance.lang = 'he-IL';
    utterance.rate = options.rate ?? userRate;
    utterance.pitch = options.pitch ?? 1.0;

    if (preferredHebrewVoice) {
      utterance.voice = preferredHebrewVoice;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find((voice) => voice.lang.startsWith('he'));
      if (v) utterance.voice = v;
    }

    let isResolved = false;
    const finish = () => {
      if (!isResolved) {
        isResolved = true;
        activeUtterance = null;
        if (speechSafetyTimer) {
          clearTimeout(speechSafetyTimer);
          speechSafetyTimer = null;
        }
        resolve();
      }
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      finish();
    };

    // Гарантированный защитный таймаут: промис завершится даже если браузер сбойнул
    const maxDurationMs = Math.max(3000, speechText.length * 220 + 2500);
    speechSafetyTimer = setTimeout(() => {
      finish();
    }, maxDurationMs);

    try {
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.error('Speech synthesis speak exception:', e);
      finish();
    }
  });
}

/**
 * Остановка любой воспроизводимой речи
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }
    activeUtterance = null;
    window.speechSynthesis.cancel();
  }
}

/**
 * Очистка текста от дублирующихся смежных фраз и слов
 */
export function cleanDuplicatePhrases(text: string): string {
  if (!text) return '';
  let cleaned = text.replace(/\s+/g, ' ').trim();

  // 1. Проверяем точный повтор двух одинаковых половин: "X X" -> "X"
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length >= 4 && words.length % 2 === 0) {
    const half = words.length / 2;
    const firstHalf = words.slice(0, half).join(' ');
    const secondHalf = words.slice(half).join(' ');
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      return firstHalf;
    }
  }

  // 2. Проверяем повторы подфраз длины от 2 до 8 слов: "A B C A B C" -> "A B C"
  for (let phraseLen = Math.min(8, Math.floor(words.length / 2)); phraseLen >= 2; phraseLen--) {
    let changed = false;
    for (let i = 0; i <= words.length - 2 * phraseLen; i++) {
      const p1 = words.slice(i, i + phraseLen).join(' ');
      const p2 = words.slice(i + phraseLen, i + 2 * phraseLen).join(' ');
      if (p1.toLowerCase() === p2.toLowerCase() && p1.length > 3) {
        words.splice(i + phraseLen, phraseLen);
        changed = true;
        break;
      }
    }
    if (changed) {
      cleaned = words.join(' ');
    }
  }

  return cleaned;
}

/**
 * Умная сшивка фрагментов распознавания (защита от багов WebKit / Android Chrome)
 */
export function stitchSpeechChunks(chunks: string[]): string {
  let accumulated = '';

  for (const rawChunk of chunks) {
    const chunk = rawChunk.trim();
    if (!chunk) continue;

    if (!accumulated) {
      accumulated = chunk;
      continue;
    }

    const normAcc = accumulated.replace(/\s+/g, ' ').trim();
    const normChunk = chunk.replace(/\s+/g, ' ').trim();

    // 1. Точный дубликат
    if (normAcc.toLowerCase() === normChunk.toLowerCase()) {
      continue;
    }

    // 2. Новый фрагмент уже содержится в конце или внутри накопленного
    if (normAcc.toLowerCase().endsWith(normChunk.toLowerCase()) || normAcc.toLowerCase().includes(normChunk.toLowerCase())) {
      continue;
    }

    // 3. Накопленный текст является префиксом нового фрагмента (Android cumulative)
    // Например: acc = "שלום", chunk = "שלום מה נשמע" -> заменяем на chunk
    if (normChunk.toLowerCase().startsWith(normAcc.toLowerCase())) {
      accumulated = normChunk;
      continue;
    }

    // 4. Проверяем частичное перекрытие слов на стыке (suffix-prefix overlap)
    // Например: acc = "אני רוצה קפה", chunk = "קפה עם חלב" -> "אני רוצה קפה עם חלב"
    const accWords = normAcc.split(' ');
    const chunkWords = normChunk.split(' ');
    let overlapFound = false;

    const maxOverlap = Math.min(accWords.length, chunkWords.length);
    for (let overlapLen = maxOverlap; overlapLen >= 1; overlapLen--) {
      const accSuffix = accWords.slice(-overlapLen).join(' ').toLowerCase();
      const chunkPrefix = chunkWords.slice(0, overlapLen).join(' ').toLowerCase();

      if (accSuffix === chunkPrefix) {
        const remainingChunk = chunkWords.slice(overlapLen).join(' ');
        accumulated = remainingChunk ? `${normAcc} ${remainingChunk}` : normAcc;
        overlapFound = true;
        break;
      }
    }

    // 5. Если перекрытия нет, просто соединяем через пробел
    if (!overlapFound) {
      accumulated = `${normAcc} ${normChunk}`;
    }
  }

  return cleanDuplicatePhrases(accumulated);
}

/**
 * Интерфейс распознавания речи (Speech-to-Text) через браузерный API с защитой от дублирования
 */
export class HebrewSpeechRecognizer {
  private recognition: any = null;
  private isListening = false;
  private lastTranscript = '';
  private onResultCb: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCb: ((error: string) => void) | null = null;
  private onEndCb: ((lastTranscript: string) => void) | null = null;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: (lastTranscript: string) => void
  ): void {
    if (!this.isSupported()) {
      onError('Распознавание речи не поддерживается в этом браузере.');
      return;
    }

    // Безопасно останавливаем предыдущий экземпляр перед созданием нового
    this.stop();

    this.onResultCb = onResult;
    this.onErrorCb = onError;
    this.onEndCb = onEnd;
    this.lastTranscript = '';

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const rec = new SpeechRecognition();
      rec.lang = 'he-IL';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event: any) => {
        const finalChunks: string[] = [];
        const interimChunks: string[] = [];

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const trans = result[0]?.transcript || '';
          if (!trans) continue;

          if (result.isFinal) {
            finalChunks.push(trans);
          } else {
            interimChunks.push(trans);
          }
        }

        const finalStitched = stitchSpeechChunks(finalChunks);
        const interimStitched = stitchSpeechChunks(interimChunks);

        let combined = '';
        if (finalStitched && interimStitched) {
          combined = stitchSpeechChunks([finalStitched, interimStitched]);
        } else {
          combined = finalStitched || interimStitched;
        }

        combined = combined.trim();
        if (combined) {
          this.lastTranscript = combined;
          this.onResultCb?.(combined, finalChunks.length > 0 && interimChunks.length === 0);
        }
      };

      rec.onerror = (event: any) => {
        // Игнорируем штатные паузы тишины
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        this.isListening = false;
        this.onErrorCb?.(event.error || 'Ошибка распознавания');
      };

      rec.onend = () => {
        const wasListening = this.isListening;
        this.isListening = false;
        this.recognition = null;
        if (wasListening) {
          this.onEndCb?.(this.lastTranscript);
        }
      };

      this.recognition = rec;
      this.isListening = true;
      rec.start();
    } catch (err: any) {
      this.isListening = false;
      this.recognition = null;
      if (err?.name !== 'InvalidStateError') {
        onError('Не удалось запустить микрофон');
      }
    }
  }

  public stop(): void {
    if (this.recognition) {
      this.isListening = false;
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
  }
}
