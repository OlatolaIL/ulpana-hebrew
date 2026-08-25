/**
 * Бесплатный браузерный голосовой движок (Text-to-Speech и Speech-to-Text) для иврита
 */

import { stripNikkud } from './transcription';

let preferredHebrewVoice: SpeechSynthesisVoice | null = null;

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

    window.speechSynthesis.cancel(); // останавливаем предыдущую речь

    // Сохраняем и нормализуем огласовки (ניקוד) для точного произношения
    const speechText = fixHebrewPhonetics(text.trim());
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

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Остановка любой воспроизводимой речи
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Интерфейс распознавания речи (Speech-to-Text) через браузерный API
 */
export class HebrewSpeechRecognizer {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'he-IL';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      onError('Распознавание речи не поддерживается в этом браузере.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      onResult(final || interim, final.length > 0);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Ошибка распознавания');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch {
      onError('Не удалось запустить микрофон');
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
