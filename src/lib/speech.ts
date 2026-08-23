import { stripNikkud } from './transcription';

let preferredHebrewVoice: SpeechSynthesisVoice | null = null;

export function initHebrewVoices(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
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

    setTimeout(() => {
      resolve(findVoice());
    }, 500);
  });
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

    window.speechSynthesis.cancel();

    const cleanText = stripNikkud(text);
    if (!cleanText.trim()) {
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

    const utterance = new SpeechSynthesisUtterance(cleanText);
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

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

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
