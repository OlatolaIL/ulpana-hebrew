/**
 * Модуль для управления состоянием звука, превентивной разблокировки Web Audio
 * и перехвата блокировок браузера (Autoplay Policy / NotAllowedError).
 */

const AUDIO_BLOCKED_EVENT = 'app:audio-blocked';
const AUDIO_UNBLOCKED_EVENT = 'app:audio-unblocked';

let autoUnlockInitialized = false;

/**
 * Проверка, является ли устройство мобильным (iOS / Android / Touch)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0);
}

/**
 * Проверка на устройства Apple (iPhone, iPad, iPod)
 */
export function isIosDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Оповестить приложение о том, что браузер заблокировал воспроизведение звука
 */
export function notifyAudioBlocked(reason: string = 'autoplay_blocked'): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(AUDIO_BLOCKED_EVENT, { detail: { reason, timestamp: Date.now() } }));
  } catch {}
}

/**
 * Подписка на событие блокировки звука
 */
export function onAudioBlocked(callback: (detail: { reason: string; timestamp: number }) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail || { reason: 'unknown', timestamp: Date.now() });
  };
  window.addEventListener(AUDIO_BLOCKED_EVENT, handler);
  return () => {
    window.removeEventListener(AUDIO_BLOCKED_EVENT, handler);
  };
}

/**
 * Подписка на событие успешной разблокировки звука
 */
export function onAudioUnblocked(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUDIO_UNBLOCKED_EVENT, callback);
  return () => {
    window.removeEventListener(AUDIO_UNBLOCKED_EVENT, callback);
  };
}

/**
 * Принудительная разблокировка звуковой подсистемы браузера:
 * 1. Проигрывает неслышимый короткий буфер через AudioContext (User Activation).
 * 2. Возобновляет speechSynthesis при наличии.
 * 3. Оповещает слушателей о разблокировке.
 */
export async function unlockAudio(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  let success = false;

  // 1. Web Audio Context Unlock
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Проигрываем микро-буфер тишины для перевода аудио-сессии в активное состояние
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      success = true;
    }
  } catch (err) {
    console.warn('Web Audio unlock error:', err);
  }

  // 2. SpeechSynthesis Resume
  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      success = true;
    } catch {}
  }

  // Оповещаем об успешной разблокировке
  try {
    window.dispatchEvent(new CustomEvent(AUDIO_UNBLOCKED_EVENT));
  } catch {}

  return success;
}

/**
 * Превентивная инициализация: вешает одноразовые слушатели первого клика/тапа,
 * чтобы разблокировать аудио до того, как система попытается воспроизвести звук.
 */
export function initAudioAutoUnlock(): void {
  if (typeof window === 'undefined' || autoUnlockInitialized) return;
  autoUnlockInitialized = true;

  const unlockHandler = () => {
    unlockAudio().catch(() => {});
    window.removeEventListener('click', unlockHandler, true);
    window.removeEventListener('touchstart', unlockHandler, true);
    window.removeEventListener('keydown', unlockHandler, true);
  };

  window.addEventListener('click', unlockHandler, { capture: true, once: true, passive: true });
  window.addEventListener('touchstart', unlockHandler, { capture: true, once: true, passive: true });
  window.addEventListener('keydown', unlockHandler, { capture: true, once: true, passive: true });
}
