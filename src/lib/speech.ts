/**
 * Бесплатный голосовой движок (Text-to-Speech и Speech-to-Text) для иврита
 */

import { stripNikkud } from './transcription';

let preferredHebrewVoice: SpeechSynthesisVoice | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechSafetyTimer: any = null;
let activeFallbackAudio: HTMLAudioElement | null = null;

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
      try {
        const voices = window.speechSynthesis.getVoices();
        const heVoice =
          voices.find((v) => v.lang === 'he-IL' || v.lang === 'he') ||
          voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('he')) ||
          null;
        if (heVoice) preferredHebrewVoice = heVoice;
        return heVoice;
      } catch {
        return null;
      }
    };

    const existing = findVoice();
    if (existing) {
      resolve(existing);
      return;
    }

    try {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(findVoice());
      };
    } catch {}

    setTimeout(() => {
      resolve(findVoice());
    }, 500);
  });
}

/**
 * Исправление базовой фонетики фраз для естественного звучания
 */
function fixHebrewPhonetics(text: string): string {
  if (!text) return '';
  let res = text;
  res = res.replace(/(^|\s)ספרי(\s+ли|\s+לי)/g, '$1סַפְּרִי$2');
  res = res.replace(/(^|\s)ספר(\s+ли|\s+לי)/g, '$1סַפֵּר$2');
  res = res.replace(/(^|\s)תספרי(\s+ли|\s+לי)/g, '$1תְּסַפְּרִי$2');
  res = res.replace(/(^|\s)תספר(\s+ли|\s+לי)/g, '$1תְּסַפֵּר$2');
  return res;
}

/**
 * Очищает текст от эмодзи, служебных символов и меток перед озвучкой
 */
export function cleanHebrewForSpeech(text: string): string {
  if (!text) return '';
  let res = text
    // Удаляем иконки, мета-метки и эмодзи
    .replace(/[♂♀⚥✔️❌①②③④⑤👉📦🌸🎙️👥↗️➡️⬅️⬆️⬇️✨💫\u200D\uFE0F\uFE0E]/g, '')
    // Удаляем комментарии в скобках (например "(мужчина)", "(1)")
    .replace(/\([а-яёА-ЯЁa-zA-Z0-9+ \t,.-]+\)/gi, '')
    // Удаляем кавычки и скобки
    .replace(/["'«»[\]{}()]/g, ' ')
    // Удаляем кириллицу
    .replace(/[а-яёА-ЯЁ]+/gi, '')
    // Удаляем дефисы и лишние разделители
    .replace(/[—–\-_/\\|•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return fixHebrewPhonetics(res);
}

/**
 * Высоконадежное воспроизведение произношения через Google TTS Audio fallback
 */
export function playFallbackAudio(text: string, rate: number = 0.75): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    try {
      if (activeFallbackAudio) {
        activeFallbackAudio.pause();
        activeFallbackAudio.src = '';
        activeFallbackAudio = null;
      }

      const cleanText = stripNikkud(text).replace(/[.,!?;:"'״׳()[\]{}—\-]/g, ' ').trim();
      if (!cleanText) {
        resolve();
        return;
      }

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=iw&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(url);
      activeFallbackAudio = audio;
      audio.playbackRate = Math.max(0.6, Math.min(1.3, rate || 0.75));

      let isEnded = false;
      const finish = () => {
        if (!isEnded) {
          isEnded = true;
          activeFallbackAudio = null;
          resolve();
        }
      };

      audio.onended = finish;
      audio.onerror = finish;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => finish());
      }

      setTimeout(finish, 4000);
    } catch {
      resolve();
    }
  });
}

/**
 * Универсальная озвучка иврита (браузерный Web Speech API + моментальный фолбэк на Audio)
 */
export function speakHebrew(
  text: string,
  options: { rate?: number; pitch?: number } = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }

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

    const rate = options.rate ?? userRate;

    // Если speechSynthesis не поддерживается в браузере — сразу запускаем fallback audio
    if (!('speechSynthesis' in window)) {
      playFallbackAudio(speechText, rate).then(() => resolve());
      return;
    }

    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {}

    let isFinished = false;
    const finish = () => {
      if (!isFinished) {
        isFinished = true;
        activeUtterance = null;
        if (speechSafetyTimer) {
          clearTimeout(speechSafetyTimer);
          speechSafetyTimer = null;
        }
        resolve();
      }
    };

    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      activeUtterance = utterance;
      utterance.lang = 'he-IL';
      utterance.rate = rate;
      utterance.pitch = options.pitch ?? 1.0;

      if (preferredHebrewVoice) {
        utterance.voice = preferredHebrewVoice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(
          (voice) => voice.lang === 'he-IL' || voice.lang === 'he' || (voice.lang && voice.lang.toLowerCase().startsWith('he'))
        );
        if (v) utterance.voice = v;
      }

      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn('Browser TTS error, using audio fallback:', e);
        playFallbackAudio(speechText, rate).then(() => finish());
      };

      // Защитный таймаут: если speechSynthesis завис (частый баг Chrome/iOS) — переключаемся на audio
      const maxDurationMs = Math.max(3000, speechText.length * 200 + 2000);
      speechSafetyTimer = setTimeout(() => {
        if (!isFinished) {
          playFallbackAudio(speechText, rate).then(() => finish());
        }
      }, maxDurationMs);

      // Запуск с микрозадержкой для предотвращения бага cancel()->speak() в Chromium
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch (err) {
          playFallbackAudio(speechText, rate).then(() => finish());
        }
      }, 15);
    } catch {
      playFallbackAudio(speechText, rate).then(() => finish());
    }
  });
}

/**
 * Остановка любой воспроизводимой речи
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined') {
    if (speechSafetyTimer) {
      clearTimeout(speechSafetyTimer);
      speechSafetyTimer = null;
    }
    activeUtterance = null;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    if (activeFallbackAudio) {
      try {
        activeFallbackAudio.pause();
        activeFallbackAudio.src = '';
      } catch {}
      activeFallbackAudio = null;
    }
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

export interface SpeechRecognizerOptions {
  vocabulary?: string[];
  apiKey?: string;
  provider?: 'groq' | 'gemini';
}

/**
 * Кроссплатформенный интерфейс распознавания речи (Speech-to-Text) для иврита
 * с поддержкой iPhone/Safari, Android и ПК через MediaRecorder + AI Transcription.
 */
export class HebrewSpeechRecognizer {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private isListening = false;
  private lastTranscript = '';
  private onResultCb: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCb: ((error: string) => void) | null = null;
  private onEndCb: ((lastTranscript: string) => void) | null = null;
  private currentOptions: SpeechRecognizerOptions = {};

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') ||
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public async start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: (lastTranscript: string) => void,
    options?: SpeechRecognizerOptions
  ): Promise<void> {
    if (!this.isSupported()) {
      onError('Запись звука не поддерживается в этом браузере.');
      return;
    }

    this.stop();

    this.onResultCb = onResult;
    this.onErrorCb = onError;
    this.onEndCb = onEnd;
    this.lastTranscript = '';
    this.currentOptions = options || {};
    this.audioChunks = [];
    this.isListening = true;

    // 1. Запускаем параллельно браузерное распознавание для живого превью текста (если доступно в Chrome)
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'he-IL';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onresult = (event: any) => {
          const interimChunks: string[] = [];
          for (let i = 0; i < event.results.length; ++i) {
            const result = event.results[i];
            const trans = result[0]?.transcript || '';
            if (trans) interimChunks.push(trans);
          }
          const stitched = stitchSpeechChunks(interimChunks).trim();
          if (stitched && this.isListening) {
            this.lastTranscript = stitched;
            this.onResultCb?.(stitched, false);
          }
        };

        rec.onerror = () => {};
        rec.onend = () => {
          this.recognition = null;
        };

        this.recognition = rec;
        rec.start();
      }
    } catch {
      // Игнорируем ошибки браузерного SpeechRecognition (например, в Safari)
    }

    // 2. Запускаем MediaRecorder для записи высококачественного звука (работает на iPhone, Safari, Android, Chrome)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!this.isListening) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        this.mediaStream = stream;

        // Выбираем лучший поддерживаемый формат (Safari на iPhone использует audio/mp4)
        let mimeType = '';
        if (typeof MediaRecorder !== 'undefined') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/aac')) {
            mimeType = 'audio/aac';
          }
        }

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        this.audioChunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const recordedChunks = [...this.audioChunks];
          this.audioChunks = [];

          if (recordedChunks.length > 0) {
            const blobType = mimeType || recordedChunks[0]?.type || 'audio/webm';
            const audioBlob = new Blob(recordedChunks, { type: blobType });

            // Если размер аудио больше 1KB, отправляем на серверную транскрибацию
            if (audioBlob.size > 1000) {
              try {
                const formData = new FormData();
                const ext = blobType.includes('mp4') ? 'mp4' : blobType.includes('aac') ? 'aac' : 'webm';
                formData.append('file', audioBlob, `speech.${ext}`);

                if (this.currentOptions.vocabulary && this.currentOptions.vocabulary.length > 0) {
                  formData.append('prompt', this.currentOptions.vocabulary.slice(0, 30).join(', '));
                }
                if (this.currentOptions.apiKey) {
                  formData.append('apiKey', this.currentOptions.apiKey);
                }

                const res = await fetch('/api/ai/transcribe', {
                  method: 'POST',
                  body: formData,
                });

                if (res.ok) {
                  const data = await res.json();
                  if (data.text && data.text.trim()) {
                    const cleanText = data.text.trim();
                    this.lastTranscript = cleanText;
                    this.onResultCb?.(cleanText, true);
                    this.onEndCb?.(cleanText);
                    return;
                  }
                }
              } catch (serverErr) {
                console.warn('Server transcription fallback:', serverErr);
              }
            }
          }

          // Fallback к результатам браузерного распознавания
          this.onEndCb?.(this.lastTranscript);
        };

        this.mediaRecorder = recorder;
        recorder.start(250);
      }
    } catch (err: any) {
      console.error('MediaRecorder start error:', err);
      // Если браузер заблокировал микрофон
      if (!this.recognition) {
        this.isListening = false;
        this.onErrorCb?.(err?.message || 'Не удалось получить доступ к микрофону');
      }
    }
  }

  public stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }
  }
}

