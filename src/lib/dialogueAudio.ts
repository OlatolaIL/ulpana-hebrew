/**
 * src/lib/dialogueAudio.ts
 *
 * 3-уровневый каскад озвучивания диалогов (3-Tier Audio Cascade):
 * 1. Tier 1 (Gemini Studio Audio) — чистовой золотой стандарт (когда дорожка верифицирована через Gemini TTS).
 * 2. Tier 2 (Microsoft Neural TTS) — рабочая нейросетевая база предзаписанных MP3 (he-IL-AvriNeural / he-IL-HilaNeural).
 * 3. Tier 3 (Web Speech API) — отказоустойчивая подушка безопасности на устройстве при сбое сети или отсутствии файлов.
 */

import { speakHebrew, stopSpeech } from './speech';

export interface DialogueAudioManifestEntry {
  lessonId: number;
  turnId: string;
  combo: 'mm' | 'mf' | 'fm' | 'ff';
  speakerGender: 'male' | 'female';
  voice: string;
  engine: 'gemini' | 'edge';
  fileName: string;
  bytes?: number;
  hebrew: string;
  translation?: string;
}

export type DialogueAudioManifest = Record<string, DialogueAudioManifestEntry>;

let cachedManifest: DialogueAudioManifest | null = null;
let activeDialogueAudio: HTMLAudioElement | null = null;
let manifestFetchPromise: Promise<DialogueAudioManifest | null> | null = null;

/**
 * Загрузка манифеста диалоговых аудиофайлов (с кэшированием в памяти)
 */
export async function getDialogueManifest(): Promise<DialogueAudioManifest | null> {
  if (cachedManifest) return cachedManifest;
  if (typeof window === 'undefined') return null;

  if (manifestFetchPromise) {
    return manifestFetchPromise;
  }

  manifestFetchPromise = fetch('/audio/dialogues/manifest.json')
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        cachedManifest = data;
        return data;
      }
      return null;
    })
    .catch((err) => {
      console.warn('[DialogueAudio] Could not load manifest:', err);
      return null;
    })
    .finally(() => {
      manifestFetchPromise = null;
    });

  return manifestFetchPromise;
}

/**
 * Получение уникального ключа реплики диалога
 */
export function getDialogueTurnKey(
  lessonId: number,
  turnId: string,
  speakerGender: 'male' | 'female',
  listenerGender: 'male' | 'female'
): string {
  const s = speakerGender === 'male' ? 'm' : 'f';
  const l = listenerGender === 'male' ? 'm' : 'f';
  return `d${lessonId}_${turnId}_${s}${l}`;
}

export interface PlayDialogueTurnAudioOptions {
  lessonId: number;
  turnId: string;
  speakerGender: 'male' | 'female';
  listenerGender: 'male' | 'female';
  text: string;
  speechRate?: number;
}

/**
 * Остановка текущего воспроизведения диалога (как MP3, так и Web Speech API)
 */
export function stopDialogueAudio(): void {
  if (activeDialogueAudio) {
    try {
      activeDialogueAudio.onended = null;
      activeDialogueAudio.onerror = null;
      activeDialogueAudio.pause();
      activeDialogueAudio.currentTime = 0;
      activeDialogueAudio.src = '';
    } catch {}
    activeDialogueAudio = null;
  }
  stopSpeech();
}

/**
 * Воспроизведение реплики диалога с гарантированным 3-уровневым каскадом
 */
export async function playDialogueTurnAudio(options: PlayDialogueTurnAudioOptions): Promise<void> {
  stopDialogueAudio();

  const { lessonId, turnId, speakerGender, listenerGender, text, speechRate = 0.75 } = options;
  const key = getDialogueTurnKey(lessonId, turnId, speakerGender, listenerGender);

  // 1. Пытаемся найти предзаписанный файл в манифесте
  const manifest = await getDialogueManifest();
  const entry = manifest?.[key];

  if (entry && entry.fileName) {
    // Формируем URL: для Gemini (Tier 1) или Edge Neural (Tier 2)
    const audioUrl = entry.engine === 'gemini'
      ? `/audio/dialogues/gemini/${entry.fileName}`
      : `/audio/dialogues/${entry.fileName}`;

    const playedSuccessfully = await new Promise<boolean>((resolve) => {
      let isSettled = false;
      const audio = new Audio(audioUrl);
      activeDialogueAudio = audio;

      // Применяем скорость из профиля (в разумных пределах для нормального звука 0.7 - 1.25)
      try {
        audio.playbackRate = Math.min(1.25, Math.max(0.7, speechRate));
      } catch {}

      // Защитный таймаут: если сеть подвисла, не блокируем интерфейс ученика более 4 секунд
      const safetyWatchdog = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          console.warn(`[DialogueAudio] Playback watchdog timed out for ${key}, falling back to Tier 3 TTS`);
          try {
            audio.pause();
            audio.src = '';
          } catch {}
          if (activeDialogueAudio === audio) activeDialogueAudio = null;
          resolve(false);
        }
      }, 4000);

      audio.onended = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(safetyWatchdog);
          if (activeDialogueAudio === audio) activeDialogueAudio = null;
          resolve(true);
        }
      };

      audio.onerror = (e) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(safetyWatchdog);
          console.warn(`[DialogueAudio] Audio playback error for ${key} (${audioUrl}), falling back to Tier 3 TTS`, e);
          if (activeDialogueAudio === audio) activeDialogueAudio = null;
          resolve(false);
        }
      };

      audio.play().catch((playErr) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(safetyWatchdog);
          console.warn(`[DialogueAudio] audio.play() rejected for ${key}:`, playErr);
          if (activeDialogueAudio === audio) activeDialogueAudio = null;
          resolve(false);
        }
      });
    });

    if (playedSuccessfully) {
      return;
    }
  }

  // 2. TIER 3 (Аварийный фолбэк): Web Speech API устройства
  // Вызывается если файла нет в манифесте, файл вернул 404 или произошел сбой сети
  await speakHebrew(text, {
    rate: speechRate,
    gender: speakerGender,
    pitch: speakerGender === 'female' ? 1.1 : 0.95,
  });
}
