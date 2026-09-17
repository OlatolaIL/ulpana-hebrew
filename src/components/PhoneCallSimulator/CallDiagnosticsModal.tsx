import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  Wifi,
  WifiOff,
  Mic,
  Volume2,
  Bot,
  Download,
  Copy,
  Check,
  RotateCcw,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Zap,
} from 'lucide-react';
import {
  callFlightRecorder,
  DiagnosticEvent,
  DiagnosticEventCategory,
  FlightRecorderSummary,
} from '@/lib/callDiagnostics';

interface CallDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mounted: boolean;
  activeStream?: MediaStream | null;
  audioContext?: AudioContext | null;
  title?: string;
}

export const CallDiagnosticsModal: React.FC<CallDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  mounted,
  activeStream,
  audioContext,
  title,
}) => {
  const [summary, setSummary] = useState<FlightRecorderSummary>(() =>
    callFlightRecorder.exportSummary(activeStream, audioContext)
  );
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  // Подписка на обновление событий
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = callFlightRecorder.subscribe(() => {
      setSummary(callFlightRecorder.exportSummary(activeStream, audioContext));
    });
    setSummary(callFlightRecorder.exportSummary(activeStream, audioContext));
    return () => unsubscribe();
  }, [isOpen, activeStream, audioContext]);

  const toggleEventExpand = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePing = async () => {
    setPinging(true);
    await callFlightRecorder.measureNetworkPing('/api/healthz');
    setPinging(false);
    setSummary(callFlightRecorder.exportSummary(activeStream, audioContext));
  };

  const handleCopy = async () => {
    const ok = await callFlightRecorder.copyToClipboard(activeStream, audioContext);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    callFlightRecorder.downloadJsonFile(activeStream, audioContext);
  };

  const handleReset = () => {
    callFlightRecorder.reset();
    setSummary(callFlightRecorder.exportSummary(activeStream, audioContext));
  };

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return summary.events;
    if (selectedCategory === 'ERRORS') {
      return summary.events.filter((e) => e.level === 'error' || e.level === 'warn');
    }
    return summary.events.filter((e) => e.category === selectedCategory);
  }, [summary.events, selectedCategory]);

  if (!mounted || !isOpen || typeof document === 'undefined') {
    return null;
  }

  const { network, audio, stats, deviceInfo } = summary;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] bg-zinc-950 border border-zinc-700/80 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5 animate-pulse text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                  {title || 'Черный ящик и Смотритель (Телеметрия)'}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Сессия: {summary.sessionId} • {(summary.durationMs / 1000).toFixed(0)}с
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Скроллируемое тело */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Сводные плашки состояния систем */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Сеть */}
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="font-medium text-[11px] flex items-center gap-1">
                  {network.isOnline ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-400" />
                  )}
                  Сеть
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    network.isOnline ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <div className="font-bold text-zinc-100 text-xs">
                {network.effectiveType?.toUpperCase() || (network.isOnline ? 'ONLINE' : 'OFFLINE')}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                RTT: {network.rtt ? `${network.rtt}ms` : 'н/д'}
                {network.lastPingMs ? ` (ping: ${network.lastPingMs}ms)` : ''}
              </div>
            </div>

            {/* 2. Микрофон / Web Audio */}
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="font-medium text-[11px] flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-blue-400" />
                  Микрофон
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    audio.audioContextState === 'running'
                      ? 'bg-emerald-500'
                      : audio.audioContextState === 'suspended'
                      ? 'bg-amber-500'
                      : 'bg-zinc-600'
                  }`}
                />
              </div>
              <div className="font-bold text-zinc-100 text-xs truncate">
                {audio.audioContextState || 'нет потока'}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {audio.sampleRate ? `${audio.sampleRate} Hz` : 'VAD: активен'}
              </div>
            </div>

            {/* 3. Whisper STT */}
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="font-medium text-[11px] flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  Whisper STT
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  {stats.whisperCalls} вызов.
                </span>
              </div>
              <div className="font-bold text-zinc-100 text-xs">
                {stats.whisperAvgLatencyMs > 0 ? `${stats.whisperAvgLatencyMs} ms ср.` : 'Ожидание'}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Отброшено шумов: {stats.vadNoiseRejections}
              </div>
            </div>

            {/* 4. LLM Модель звонка */}
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="font-medium text-[11px] flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  ИИ-собеседник
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  {stats.llmCalls} отв.
                </span>
              </div>
              <div className="font-bold text-zinc-100 text-xs">
                {stats.llmAvgLatencyMs > 0 ? `${stats.llmAvgLatencyMs} ms ср.` : 'Готов'}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Ошибок: {stats.errorCount > 0 ? `⚠️ ${stats.errorCount}` : '0 ✅'}
              </div>
            </div>
          </div>

          {/* Кнопка мгновенной проверки пинга */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="text-zinc-300 text-[11px] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Устройство: <strong>{deviceInfo.isMobile ? 'Мобильный телефон' : 'Десктоп'}</strong> (
                {deviceInfo.isIOS ? 'iOS Safari' : deviceInfo.isAndroid ? 'Android' : 'Desktop'}) •{' '}
                {deviceInfo.windowInnerWidth}x{deviceInfo.windowInnerHeight}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePing}
              disabled={pinging}
              className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-[11px] flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Activity className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              {pinging ? 'Замер...' : 'Тест пинга сервера'}
            </button>
          </div>

          {/* Фильтры категорий событий */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {['ALL', 'VAD', 'STT', 'LLM', 'TTS', 'NETWORK', 'ERRORS'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-200 text-zinc-900 font-bold shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat === 'ALL'
                  ? `Все (${summary.events.length})`
                  : cat === 'ERRORS'
                  ? `Ошибки (${stats.errorCount})`
                  : cat}
              </button>
            ))}
          </div>

          {/* Хронологическая лента событий */}
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                В этой категории событий пока нет
              </div>
            ) : (
              filteredEvents
                .slice()
                .reverse()
                .map((evt) => {
                  const isExpanded = Boolean(expandedEvents[evt.id]);
                  const hasDetails = evt.details && Object.keys(evt.details).length > 0;

                  const badgeColor =
                    evt.category === 'VAD'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                      : evt.category === 'STT'
                      ? 'bg-purple-950/70 text-purple-300 border-purple-800/60'
                      : evt.category === 'LLM'
                      ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60'
                      : evt.category === 'TTS'
                      ? 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                      : evt.category === 'NETWORK'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700';

                  const levelIcon =
                    evt.level === 'error' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    ) : evt.level === 'warn' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : evt.level === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                    );

                  return (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition"
                    >
                      <div
                        className={`flex items-center justify-between gap-2 ${
                          hasDetails ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={() => hasDetails && toggleEventExpand(evt.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {levelIcon}
                          <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                            +{(evt.relativeMs / 1000).toFixed(1)}s
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${badgeColor}`}
                          >
                            {evt.category}
                          </span>
                          <span className="font-medium text-zinc-200 truncate text-[11px]">
                            {evt.title}
                          </span>
                        </div>
                        {hasDetails && (
                          <div className="text-zinc-400 shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Раскрывающийся блок деталей */}
                      {isExpanded && hasDetails && (
                        <div className="mt-2 pt-2 border-t border-zinc-800 font-mono text-[10px] text-zinc-300 overflow-x-auto bg-zinc-950/80 p-2 rounded-lg">
                          <pre>{JSON.stringify(evt.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Нижняя панель действий */}
        <div className="px-5 py-3 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border border-zinc-700 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-300" />
                  <span>Скопировать отчет</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border border-zinc-700 active:scale-95"
            >
              <Download className="w-4 h-4 text-zinc-300" />
              <span>Скачать JSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
            title="Очистить историю событий"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
