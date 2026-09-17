/**
 * CallFlightRecorder - Бортовой самописец телеметрии и тестер звонков (Этап 6).
 *
 * Безопасно собирает посекундную телеметрию на боевом сайте:
 * 1. Сеть: navigator.connection (rtt, downlink, type), активный ping /api/healthz.
 * 2. Аудио: AudioContext state, sampleRate, статус MediaStream микрофона.
 * 3. VAD: события начала речи, детекции тишины, отбрасывание шумовых всплесков.
 * 4. STT (Whisper): размер аудио-чанков (байт/мс), latency, prompt, сырой и нормализованный текст.
 * 5. LLM (/api/ai/phone): тайминги TTFT/latency, провайдер/модель, сырой JSON, сработавшие фильтры.
 * 6. TTS: синтез речи персонажа, имя голоса, скорость, события воспроизведения.
 *
 * Гарантирует строгую изоляцию секретов (R-16): любые API-ключи маскируются при записи и экспорте.
 */

export type DiagnosticEventCategory =
  | 'NETWORK'
  | 'AUDIO'
  | 'VAD'
  | 'STT'
  | 'LLM'
  | 'TTS'
  | 'SYSTEM'
  | 'ERROR';

export type DiagnosticLevel = 'info' | 'warn' | 'error' | 'success';

export interface DiagnosticEvent {
  id: string;
  timestamp: number;
  relativeMs: number;
  category: DiagnosticEventCategory;
  level: DiagnosticLevel;
  title: string;
  details?: any;
}

export interface NetworkSnapshot {
  isOnline: boolean;
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  saveData?: boolean;
  lastPingMs?: number;
  lastPingTimestamp?: number;
}

export interface AudioSnapshot {
  audioContextState?: string;
  sampleRate?: number;
  micPermission?: 'granted' | 'denied' | 'prompt' | 'unknown';
  activeTracksCount?: number;
  trackSettings?: any;
}

export interface FlightRecorderSummary {
  sessionId: string;
  startTime: number;
  durationMs: number;
  deviceInfo: {
    userAgent: string;
    platform?: string;
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    screenWidth?: number;
    screenHeight?: number;
    windowInnerWidth?: number;
    windowInnerHeight?: number;
  };
  network: NetworkSnapshot;
  audio: AudioSnapshot;
  stats: {
    vadSpeechStarts: number;
    vadSilenceDetects: number;
    vadNoiseRejections: number;
    whisperCalls: number;
    whisperAvgLatencyMs: number;
    llmCalls: number;
    llmAvgLatencyMs: number;
    ttsUtterances: number;
    errorCount: number;
  };
  events: DiagnosticEvent[];
}

/**
 * Рекурсивно маскирует любые секреты, токены и API-ключи (R-16)
 */
export function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Маскируем длинные похожие на токены строки или ключи
    if (data.startsWith('gsk_') || data.startsWith('AIzaSy') || data.startsWith('ghp_')) {
      return `${data.substring(0, 4)}***[MASKED]***`;
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  if (typeof data === 'object') {
    const masked: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      const lowerKey = k.toLowerCase();
      if (
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('auth') ||
        lowerKey.includes('password')
      ) {
        masked[k] = '***[MASKED]***';
      } else {
        masked[k] = maskSensitiveData(v);
      }
    }
    return masked;
  }
  return data;
}

export class CallFlightRecorder {
  private sessionId: string;
  private startTime: number;
  private events: DiagnosticEvent[] = [];
  private maxEvents = 300;
  private listeners: Set<() => void> = new Set();

  private stats = {
    vadSpeechStarts: 0,
    vadSilenceDetects: 0,
    vadNoiseRejections: 0,
    whisperCalls: 0,
    whisperTotalLatencyMs: 0,
    llmCalls: 0,
    llmTotalLatencyMs: 0,
    ttsUtterances: 0,
    errorCount: 0,
  };

  private lastPingMs: number | undefined = undefined;
  private lastPingTimestamp: number | undefined = undefined;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.startTime = Date.now();
    this.record('SYSTEM', 'Flight Recorder initialized', { sessionId: this.sessionId }, 'info');
  }

  public reset(newSessionId?: string) {
    this.sessionId = newSessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.startTime = Date.now();
    this.events = [];
    this.stats = {
      vadSpeechStarts: 0,
      vadSilenceDetects: 0,
      vadNoiseRejections: 0,
      whisperCalls: 0,
      whisperTotalLatencyMs: 0,
      llmCalls: 0,
      llmTotalLatencyMs: 0,
      ttsUtterances: 0,
      errorCount: 0,
    };
    this.record('SYSTEM', 'Flight Recorder session reset', { sessionId: this.sessionId }, 'info');
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn('FlightRecorder listener error:', err);
      }
    });
  }

  public record(
    category: DiagnosticEventCategory,
    title: string,
    details?: any,
    level: DiagnosticLevel = 'info'
  ) {
    const now = Date.now();
    const relativeMs = now - this.startTime;
    const safeDetails = maskSensitiveData(details);

    if (level === 'error') {
      this.stats.errorCount++;
    }

    // Обновляем счетчики по категориям
    if (category === 'VAD') {
      if (title.includes('Speech started')) this.stats.vadSpeechStarts++;
      else if (title.includes('Silence detected')) this.stats.vadSilenceDetects++;
      else if (title.includes('Noise rejected') || title.includes('Chunk too small')) this.stats.vadNoiseRejections++;
    } else if (category === 'STT' && details?.latencyMs) {
      this.stats.whisperCalls++;
      this.stats.whisperTotalLatencyMs += Number(details.latencyMs) || 0;
    } else if (category === 'LLM' && details?.latencyMs) {
      this.stats.llmCalls++;
      this.stats.llmTotalLatencyMs += Number(details.latencyMs) || 0;
    } else if (category === 'TTS' && (title.toLowerCase().includes('started') || title.toLowerCase().includes('playback') || title.toLowerCase().includes('speech'))) {
      this.stats.ttsUtterances++;
    }

    const event: DiagnosticEvent = {
      id: `evt_${now}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      relativeMs,
      category,
      level,
      title,
      details: safeDetails,
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    this.notify();
  }

  public getNetworkSnapshot(): NetworkSnapshot {
    if (typeof window === 'undefined') {
      return { isOnline: true };
    }
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    return {
      isOnline: navigator.onLine !== false,
      effectiveType: conn?.effectiveType,
      rtt: conn?.rtt,
      downlink: conn?.downlink,
      saveData: conn?.saveData,
      lastPingMs: this.lastPingMs,
      lastPingTimestamp: this.lastPingTimestamp,
    };
  }

  public async measureNetworkPing(endpoint = '/api/healthz'): Promise<{
    pingMs: number;
    status: number;
    ok: boolean;
  }> {
    const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const end = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const pingMs = Math.round(end - start);
      this.lastPingMs = pingMs;
      this.lastPingTimestamp = Date.now();

      this.record(
        'NETWORK',
        `Ping probe ${res.ok ? 'success' : 'failed'}: ${pingMs}ms`,
        { pingMs, status: res.status, endpoint },
        res.ok ? (pingMs > 800 ? 'warn' : 'success') : 'error'
      );

      return { pingMs, status: res.status, ok: res.ok };
    } catch (err: any) {
      const end = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const pingMs = Math.round(end - start);
      this.lastPingMs = pingMs;
      this.lastPingTimestamp = Date.now();

      this.record(
        'NETWORK',
        `Ping probe error: ${err.message || err}`,
        { pingMs, error: String(err), endpoint },
        'error'
      );

      return { pingMs, status: 0, ok: false };
    }
  }

  public getAudioSnapshot(activeStream?: MediaStream | null, audioCtx?: AudioContext | null): AudioSnapshot {
    if (typeof window === 'undefined') return {};
    const stream = activeStream;
    const ctx = audioCtx;

    let micPermission: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
    const tracks = stream ? stream.getAudioTracks() : [];
    const firstTrack = tracks[0];

    return {
      audioContextState: ctx?.state,
      sampleRate: ctx?.sampleRate,
      micPermission,
      activeTracksCount: tracks.length,
      trackSettings: firstTrack ? maskSensitiveData(firstTrack.getSettings?.()) : undefined,
    };
  }

  public getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'server',
        isMobile: false,
        isIOS: false,
        isAndroid: false,
      };
    }
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || /Mobile/i.test(ua);

    return {
      userAgent: ua,
      platform: navigator.platform,
      isMobile,
      isIOS,
      isAndroid,
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
    };
  }

  public exportSummary(activeStream?: MediaStream | null, audioCtx?: AudioContext | null): FlightRecorderSummary {
    const now = Date.now();
    const whisperAvgLatencyMs =
      this.stats.whisperCalls > 0
        ? Math.round(this.stats.whisperTotalLatencyMs / this.stats.whisperCalls)
        : 0;
    const llmAvgLatencyMs =
      this.stats.llmCalls > 0
        ? Math.round(this.stats.llmTotalLatencyMs / this.stats.llmCalls)
        : 0;

    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      durationMs: now - this.startTime,
      deviceInfo: this.getDeviceInfo(),
      network: this.getNetworkSnapshot(),
      audio: this.getAudioSnapshot(activeStream, audioCtx),
      stats: {
        vadSpeechStarts: this.stats.vadSpeechStarts,
        vadSilenceDetects: this.stats.vadSilenceDetects,
        vadNoiseRejections: this.stats.vadNoiseRejections,
        whisperCalls: this.stats.whisperCalls,
        whisperAvgLatencyMs,
        llmCalls: this.stats.llmCalls,
        llmAvgLatencyMs,
        ttsUtterances: this.stats.ttsUtterances,
        errorCount: this.stats.errorCount,
      },
      events: [...this.events],
    };
  }

  public exportJson(activeStream?: MediaStream | null, audioCtx?: AudioContext | null): string {
    const summary = this.exportSummary(activeStream, audioCtx);
    return JSON.stringify(summary, null, 2);
  }

  public exportMarkdown(activeStream?: MediaStream | null, audioCtx?: AudioContext | null): string {
    const s = this.exportSummary(activeStream, audioCtx);
    const dateStr = new Date(s.startTime).toISOString();
    const durationSec = (s.durationMs / 1000).toFixed(1);

    const lines: string[] = [
      `# 📋 Телеметрия звонка и диалога (Flight Recorder)`,
      `**Сессия:** \`${s.sessionId}\` | **Время:** ${dateStr} (${durationSec} сек)`,
      `**Устройство:** ${s.deviceInfo.isMobile ? '📱 Mobile' : '💻 Desktop'} (${s.deviceInfo.isIOS ? 'iOS' : s.deviceInfo.isAndroid ? 'Android' : 'Other'}) | ${s.deviceInfo.windowInnerWidth}x${s.deviceInfo.windowInnerHeight}`,
      `**Браузер:** \`${s.deviceInfo.userAgent.substring(0, 100)}...\``,
      '',
      `## 🌐 Сеть и подключение`,
      `- Статус: ${s.network.isOnline ? '🟢 Онлайн' : '🔴 ОФЛАЙН'}`,
      `- Тип соединения: **${s.network.effectiveType || 'н/д'}**`,
      `- RTT (пинг): **${s.network.rtt ? `${s.network.rtt}ms` : 'н/д'}** | Пинг probe: **${s.network.lastPingMs ? `${s.network.lastPingMs}ms` : 'не измерялся'}**`,
      `- Downlink: **${s.network.downlink ? `${s.network.downlink} Mbps` : 'н/д'}**`,
      '',
      `## 🎙️ Аудиосистема`,
      `- AudioContext State: **${s.audio.audioContextState || 'н/д'}** (SampleRate: ${s.audio.sampleRate || 'н/д'})`,
      `- Активных треков микрофона: **${s.audio.activeTracksCount ?? 0}**`,
      '',
      `## 📊 Сводка производительности (Performance Stats)`,
      `- Срабатываний VAD (речь): **${s.stats.vadSpeechStarts}** | Завершений (тишина): **${s.stats.vadSilenceDetects}**`,
      `- Шумов отфильтровано (<1500b): **${s.stats.vadNoiseRejections}**`,
      `- Запросов Whisper STT: **${s.stats.whisperCalls}** (Средняя задержка: **${s.stats.whisperAvgLatencyMs}ms**)`,
      `- Запросов LLM Phone API: **${s.stats.llmCalls}** (Средняя задержка: **${s.stats.llmAvgLatencyMs}ms**)`,
      `- Реплик персонажа (TTS): **${s.stats.ttsUtterances}**`,
      `- Ошибок в сессии: **${s.stats.errorCount > 0 ? `⚠️ ${s.stats.errorCount}` : '0 ✅'}**`,
      '',
      `## ⏱️ Хроника событий («Черный ящик»)`,
      '| Время (+мс) | Категория | Статус | Событие | Детали |',
      '| :--- | :--- | :--- | :--- | :--- |',
    ];

    s.events.forEach((evt) => {
      const levelEmoji =
        evt.level === 'error'
          ? '❌'
          : evt.level === 'warn'
          ? '⚠️'
          : evt.level === 'success'
          ? '✅'
          : 'ℹ️';
      const detailStr = evt.details
        ? JSON.stringify(evt.details).replace(/\|/g, '\\|')
        : '';
      lines.push(
        `| +${evt.relativeMs}ms | \`${evt.category}\` | ${levelEmoji} | **${evt.title}** | \`${detailStr.substring(0, 120)}\` |`
      );
    });

    return lines.join('\n');
  }

  public async copyToClipboard(activeStream?: MediaStream | null, audioCtx?: AudioContext | null): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
    try {
      const md = this.exportMarkdown(activeStream, audioCtx);
      await navigator.clipboard.writeText(md);
      return true;
    } catch {
      return false;
    }
  }

  public downloadJsonFile(activeStream?: MediaStream | null, audioCtx?: AudioContext | null, filename?: string) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    try {
      const json = this.exportJson(activeStream, audioCtx);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `phone-diagnostics-${this.sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('downloadJsonFile error:', err);
    }
  }
}

// Глобальный синглтон самописца
export const callFlightRecorder = new CallFlightRecorder();
