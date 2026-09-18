import { cleanHebrewForSpeech, speakHebrew } from './speech';

export interface DeviceDiagnosticsReport {
  timestamp: string;
  clientTime: string;
  environment: {
    userAgent: string;
    platform: string;
    vendor: string;
    language: string;
    languages: readonly string[];
    isOnline: boolean;
    screenWidth: number;
    screenHeight: number;
    devicePixelRatio: number;
    isStandalonePwa: boolean;
  };
  pwaAndCache: {
    hasServiceWorker: boolean;
    swControllerState: string | null;
    swControllerScriptUrl: string | null;
    cacheNames: string[];
    hasV4Cache: boolean;
  };
  speechSynthesis: {
    supported: boolean;
    speaking: boolean;
    pending: boolean;
    paused: boolean;
    totalVoicesCount: number;
    hebrewVoices: Array<{
      name: string;
      lang: string;
      voiceURI: string;
      default: boolean;
      localService: boolean;
    }>;
    allVoicesNames: string[];
  };
  phoneticTransformations: Record<string, string>;
  userProfileSettings: {
    speechRate: number;
    showNikkud: boolean;
    showTranscription: boolean;
    fontStyle: string;
    subscriptionTier: string;
  };
  audioCapabilities: {
    hasAudioContext: boolean;
    audioContextState: string | null;
    sampleRate: number | null;
    hasMediaDevices: boolean;
    supportedMimeTypes: Record<string, boolean>;
  };
  liveSpeechTest: {
    testedText: string;
    cleanedSpeechText: string;
    durationMs: number;
    started: boolean;
    finished: boolean;
    error: string | null;
  };
}

/**
 * Опрашивает доступные голоса в браузере с ожиданием события voiceschanged (актуально для Chrome и iOS)
 */
async function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  let voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    return voices;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve(window.speechSynthesis.getVoices());
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 800);
  });
}

/**
 * Собирает полный снимок диагностических данных с устройства
 */
export async function collectDeviceDiagnostics(): Promise<DeviceDiagnosticsReport> {
  const timestamp = new Date().toISOString();
  const clientTime = new Date().toLocaleString();

  // 1. Окружение и экран
  const environment = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    vendor: typeof navigator !== 'undefined' ? navigator.vendor : 'unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    languages: typeof navigator !== 'undefined' ? navigator.languages || [] : [],
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
    screenWidth: typeof window !== 'undefined' && window.screen ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' && window.screen ? window.screen.height : 0,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    isStandalonePwa:
      typeof window !== 'undefined'
        ? window.matchMedia('(display-mode: standalone)').matches ||
          (navigator as any).standalone === true
        : false,
  };

  // 2. PWA, ServiceWorker и Cache Storage
  let cacheNames: string[] = [];
  try {
    if (typeof caches !== 'undefined') {
      cacheNames = await caches.keys();
    }
  } catch {}

  const pwaAndCache = {
    hasServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    swControllerState:
      typeof navigator !== 'undefined' && navigator.serviceWorker?.controller
        ? navigator.serviceWorker.controller.state
        : null,
    swControllerScriptUrl:
      typeof navigator !== 'undefined' && navigator.serviceWorker?.controller
        ? navigator.serviceWorker.controller.scriptURL
        : null,
    cacheNames,
    hasV4Cache: cacheNames.includes('ulpana-hebrew-v4'),
  };

  // 3. Web Speech API и голоса
  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voices = await getAvailableVoices();
  const hebrewVoices = voices
    .filter(
      (v) =>
        v.lang === 'he-IL' ||
        v.lang === 'he' ||
        (v.lang && v.lang.toLowerCase().startsWith('he'))
    )
    .map((v) => ({
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
      default: v.default,
      localService: v.localService,
    }));

  const speechSynthesisData = {
    supported: hasSpeechSynthesis,
    speaking: hasSpeechSynthesis ? window.speechSynthesis.speaking : false,
    pending: hasSpeechSynthesis ? window.speechSynthesis.pending : false,
    paused: hasSpeechSynthesis ? window.speechSynthesis.paused : false,
    totalVoicesCount: voices.length,
    hebrewVoices,
    allVoicesNames: voices.map((v) => `${v.name} (${v.lang})`),
  };

  // 4. Проверка трансформаций cleanHebrewForSpeech
  const testWords = [
    'סבבה',
    'סַבָּבָה',
    'סַבָּבָּה',
    'סַבָּ-בָּה',
    'סַבָּבַּה',
    'סָבָא',
    'מים',
    'מַיִם',
    'בַּיִת',
    'אוּלְפָן',
    'סוכר',
    'בסדר',
  ];
  const phoneticTransformations: Record<string, string> = {};
  for (const word of testWords) {
    phoneticTransformations[word] = cleanHebrewForSpeech(word);
  }

  // 5. Настройки профиля пользователя
  let userProfileSettings = {
    speechRate: 0.7,
    showNikkud: true,
    showTranscription: true,
    fontStyle: 'print',
    subscriptionTier: 'free',
  };
  try {
    const rawProfile = localStorage.getItem('hebrew_app_profile_v1');
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile);
      userProfileSettings = {
        speechRate: typeof parsed.speechRate === 'number' ? parsed.speechRate : 0.7,
        showNikkud: parsed.showNikkud ?? true,
        showTranscription: parsed.showTranscription ?? true,
        fontStyle: parsed.fontStyle || 'print',
        subscriptionTier: parsed.subscriptionTier || 'free',
      };
    }
  } catch {}

  // 6. Аудио возможности браузера
  let audioContextState: string | null = null;
  let sampleRate: number | null = null;
  const hasAudioContext =
    typeof window !== 'undefined' &&
    ('AudioContext' in window || 'webkitAudioContext' in window);
  if (hasAudioContext) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextState = ctx.state;
      sampleRate = ctx.sampleRate;
      ctx.close().catch(() => {});
    } catch {}
  }

  const supportedMimeTypes: Record<string, boolean> = {};
  if (typeof window !== 'undefined' && 'MediaRecorder' in window) {
    const typesToCheck = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/aac',
      'audio/ogg',
      'audio/wav',
    ];
    for (const t of typesToCheck) {
      try {
        supportedMimeTypes[t] = MediaRecorder.isTypeSupported(t);
      } catch {
        supportedMimeTypes[t] = false;
      }
    }
  }

  const audioCapabilities = {
    hasAudioContext,
    audioContextState,
    sampleRate,
    hasMediaDevices:
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia,
    supportedMimeTypes,
  };

  // 7. Живой тест произношения на устройстве
  const testedWord = 'סַבָּבָה';
  const cleanedSpeechText = cleanHebrewForSpeech(testedWord);
  const speechTestStartTime = Date.now();
  let started = false;
  let finished = false;
  let errorMsg: string | null = null;

  try {
    const speakPromise = speakHebrew(testedWord);
    started = true;
    await Promise.race([
      speakPromise,
      new Promise((r) => setTimeout(r, 4000)), // не блокируем сбор более 4 секунд
    ]);
    finished = true;
  } catch (err: any) {
    errorMsg = err?.message || String(err);
  }

  const durationMs = Date.now() - speechTestStartTime;

  return {
    timestamp,
    clientTime,
    environment,
    pwaAndCache,
    speechSynthesis: speechSynthesisData,
    phoneticTransformations,
    userProfileSettings,
    audioCapabilities,
    liveSpeechTest: {
      testedText: testedWord,
      cleanedSpeechText,
      durationMs,
      started,
      finished,
      error: errorMsg,
    },
  };
}

/**
 * Скачивает отчет в виде файла JSON
 */
export function downloadDiagnosticsFile(report: DeviceDiagnosticsReport): void {
  try {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulpana-speech-diag-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err) {
    console.error('Failed to trigger download', err);
  }
}
