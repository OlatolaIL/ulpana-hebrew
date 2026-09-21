'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Filter,
  CheckSquare,
  Square as SquareOutline,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Check,
  X,
  Loader2,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { speakHebrew, stopSpeech } from '@/lib/speech';

export interface SentenceDrillItem {
  id: string;
  sentenceHe: string;
  sentencePlain: string;
  sentenceRu: string;
  sentenceTranscription?: string;
  category: 'verb' | 'noun' | 'adjective' | 'preposition' | 'mom';
  categoryRu: string;
  targetWord?: string;
  lessonTheme: string;
  minLesson: number;
  fileName: string;
  audioUrl: string;
  hasAudio: boolean;
  fileSizeBytes?: number;
}

export interface AudioSettings {
  sentenceAudioEngine: 'current' | 'google_cloud';
  lastUpdated: string;
}

export function AdminAudioSentencesTab() {
  // Data states
  const [items, setItems] = useState<SentenceDrillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats & Settings
  const [stats, setStats] = useState({ total: 0, generated: 0, missing: 0 });
  const [settings, setSettings] = useState<AudioSettings>({
    sentenceAudioEngine: 'current',
    lastUpdated: '',
  });
  const [isSavingEngine, setIsSavingEngine] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'generated'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Audio Playback
  const [playingCurrentId, setPlayingCurrentId] = useState<string | null>(null);
  const [playingGoogleId, setPlayingGoogleId] = useState<string | null>(null);
  const googleAudioRef = useRef<HTMLAudioElement | null>(null);

  // Single row generation loading
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  // Batch Generation
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentTitle: '' });
  const batchCancelRef = useRef(false);

  // Fetch items from API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
      });

      const res = await fetch(`/api/admin/audio-sentences?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }
      const data = await res.json();
      if (data.ok) {
        setItems(data.items || []);
        setStats(data.stats || { total: 0, generated: 0, missing: 0 });
        setSettings(data.settings || { sentenceAudioEngine: 'current', lastUpdated: '' });
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalFiltered(data.pagination?.total || 0);
      } else {
        throw new Error(data.error || 'Не удалось загрузить фразы');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка соединения с API');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (googleAudioRef.current) {
        googleAudioRef.current.pause();
        googleAudioRef.current = null;
      }
    };
  }, []);

  // Handle Master Switch toggle
  const handleToggleEngine = async (newEngine: 'current' | 'google_cloud') => {
    if (settings.sentenceAudioEngine === newEngine) return;
    setIsSavingEngine(true);
    try {
      const res = await fetch('/api/admin/audio-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_engine',
          engine: newEngine,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(data.settings);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sentence_audio_engine', newEngine);
        }
      }
    } catch (err) {
      console.error('Failed to update engine setting:', err);
    } finally {
      setIsSavingEngine(false);
    }
  };

  // Play Current Sound (as heard in app now via speech.ts)
  const handlePlayCurrent = async (item: SentenceDrillItem) => {
    // Stop any Google audio
    if (googleAudioRef.current) {
      googleAudioRef.current.pause();
      setPlayingGoogleId(null);
    }

    if (playingCurrentId === item.id) {
      stopSpeech();
      setPlayingCurrentId(null);
      return;
    }

    stopSpeech();
    setPlayingCurrentId(item.id);

    try {
      await speakHebrew(item.sentenceHe, { rate: 0.8, preferStudioAudio: true });
    } finally {
      setPlayingCurrentId((curr) => (curr === item.id ? null : curr));
    }
  };

  // Play Google TTS Audio (from public/audio/sentences)
  const handlePlayGoogle = (item: SentenceDrillItem) => {
    stopSpeech();
    setPlayingCurrentId(null);

    if (googleAudioRef.current) {
      googleAudioRef.current.pause();
      if (playingGoogleId === item.id) {
        setPlayingGoogleId(null);
        return;
      }
    }

    const audio = new Audio(`${item.audioUrl}?t=${Date.now()}`);
    googleAudioRef.current = audio;
    setPlayingGoogleId(item.id);

    audio.onended = () => {
      setPlayingGoogleId(null);
    };
    audio.onerror = () => {
      setPlayingGoogleId(null);
      alert('Не удалось воспроизвести файл Google TTS. Возможно, файл отсутствует или поврежден.');
    };

    audio.play().catch((err) => {
      console.warn('Audio play prevented:', err);
      setPlayingGoogleId(null);
    });
  };

  // Single sentence generate
  const handleGenerateSingle = async (item: SentenceDrillItem) => {
    setGeneratingIds((prev) => new Set(prev).add(item.id));
    try {
      const res = await fetch('/api/admin/audio-sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          id: item.id,
        }),
      });
      const data = await res.json();
      if (data.ok && data.results?.[0]?.success) {
        // Update local item status
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, hasAudio: true, fileSizeBytes: data.results[0].bytes }
              : i
          )
        );
        setStats((s) => ({
          ...s,
          generated: s.generated + (item.hasAudio ? 0 : 1),
          missing: Math.max(0, s.missing - (item.hasAudio ? 0 : 1)),
        }));
      } else {
        alert(data.results?.[0]?.error || 'Ошибка при генерации аудио');
      }
    } catch (err: any) {
      alert(`Ошибка соединения: ${err.message}`);
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // Batch generate selected
  const handleGenerateSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBatchGenerating(true);
    batchCancelRef.current = false;
    setBatchProgress({ current: 0, total: ids.length, currentTitle: '' });

    // Process in sequential chunks of 3 for smooth progress and zero rate-limiting
    for (let i = 0; i < ids.length; i++) {
      if (batchCancelRef.current) break;

      const currentId = ids[i];
      const sentenceItem = items.find((it) => it.id === currentId);
      setBatchProgress({
        current: i + 1,
        total: ids.length,
        currentTitle: sentenceItem?.sentenceHe || currentId,
      });

      try {
        const res = await fetch('/api/admin/audio-sentences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate', id: currentId }),
        });
        const data = await res.json();
        if (data.ok && data.results?.[0]?.success) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === currentId
                ? { ...it, hasAudio: true, fileSizeBytes: data.results[0].bytes }
                : it
            )
          );
        }
      } catch (e) {
        console.error(`Failed to generate ${currentId}:`, e);
      }
    }

    setIsBatchGenerating(false);
    setSelectedIds(new Set());
    fetchItems();
  };

  // Toggle selection for all items on page
  const handleToggleSelectAllPage = () => {
    const pageIds = items.map((i) => i.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Toggle single item selection
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllPageSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. MASTER SWITCH & HERO CARD */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                <Volume2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Студия озвучки предложений
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Только фразы
              </span>
            </div>
            <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
              Централизованное управление озвучкой всех предложений курса. Выберите, какой движок
              слышат ученики при воспроизведении фраз, сравнивайте звучание и генерируйте студийный
              Google Cloud TTS в 1 клик.
            </p>
            <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Одиночные слова всегда озвучиваются чистыми записями Pealim (SSOT).</span>
            </div>
          </div>

          {/* Master Engine Switcher Card */}
          <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 min-w-[320px] shadow-2xl">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Движок для фраз</span>
              {isSavingEngine && (
                <span className="flex items-center gap-1 text-blue-400 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" /> Сохранение...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => handleToggleEngine('current')}
                disabled={isSavingEngine}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  settings.sentenceAudioEngine === 'current'
                    ? 'bg-zinc-700 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Текущий синтез</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleEngine('google_cloud')}
                disabled={isSavingEngine}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  settings.sentenceAudioEngine === 'google_cloud'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Google Cloud TTS</span>
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 text-center">
              {settings.sentenceAudioEngine === 'google_cloud' ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Ученики слышат студийные MP3 от Google
                </span>
              ) : (
                <span className="text-zinc-400">
                  Активен браузерный синтез речи устройства (Web Speech)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Всего предложений
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {stats.total.toLocaleString()}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            {totalFiltered > 0 && totalFiltered !== stats.total ? `${totalFiltered}` : '100%'}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Сгенерировано Google TTS
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.generated.toLocaleString()}
            </div>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20">
            {stats.total > 0 ? `${Math.round((stats.generated / stats.total) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Требует генерации
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.missing.toLocaleString()}
            </div>
          </div>
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-500/20">
            {stats.total > 0 ? `${Math.round((stats.missing / stats.total) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60 overflow-x-auto">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Все фразы ({stats.total})
            </button>

            <button
              onClick={() => {
                setStatusFilter('missing');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'missing'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Только без озвучки ({stats.missing})</span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('generated');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'generated'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Только готовые ({stats.generated})</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 hidden sm:inline">Категория:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все категории (все 2475)</option>
              <option value="verb">Глаголы (verbSentences)</option>
              <option value="noun">Существительные (nounDrills)</option>
              <option value="adjective">Прилагательные (adjectiveDrills)</option>
              <option value="preposition">Предлоги (prepositionDrills)</option>
              <option value="mom">Мамы в Израиле (momDrills)</option>
            </select>
          </div>
        </div>

        {/* Search Bar and Mass Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Поиск по ивриту (בקבוק, מים) или русскому переводу..."
              className="w-full pl-9 pr-9 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mass Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedIds.size > 0 && (
              <button
                onClick={handleGenerateSelected}
                disabled={isBatchGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {isBatchGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Сгенерировать выбранные ({selectedIds.size})</span>
              </button>
            )}

            <button
              onClick={fetchItems}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition"
              title="Обновить список"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BATCH GENERATION PROGRESS BANNER */}
      {isBatchGenerating && (
        <div className="bg-blue-950/80 border border-blue-500/40 rounded-2xl p-4 flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-blue-200">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>
                Генерация аудио Google TTS: {batchProgress.current} из {batchProgress.total}
              </span>
            </span>
            <button
              onClick={() => {
                batchCancelRef.current = true;
              }}
              className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition"
            >
              Остановить
            </button>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-blue-900/50 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  batchProgress.total > 0
                    ? Math.round((batchProgress.current / batchProgress.total) * 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="text-[11px] text-zinc-300 truncate">
            Текущая фраза: <span className="font-semibold text-white">{batchProgress.currentTitle}</span>
          </div>
        </div>
      )}

      {/* 5. FLAT SENTENCES TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-zinc-500">Загрузка каталога предложений...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchItems}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
            >
              Повторить попытку
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Volume2 className="w-10 h-10 text-zinc-400" />
            <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">Фразы не найдены</p>
            <p className="text-xs text-zinc-400">
              Попробуйте изменить поисковый запрос или сбросить фильтры.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {/* Select Checkbox */}
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAllPage}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      title={isAllPageSelected ? 'Снять выделение' : 'Выбрать все на странице'}
                    >
                      {isAllPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <SquareOutline className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3 min-w-[280px]">Фраза на иврите</th>
                  <th className="p-3 min-w-[240px]">Русский перевод</th>
                  <th className="p-3 w-36 text-center">🔊 Текущий звук</th>
                  <th className="p-3 w-48 text-center">🌟 Google Cloud TTS</th>
                  <th className="p-3 w-32 text-center">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-xs">
                {items.map((item, idx) => {
                  const isSelected = selectedIds.has(item.id);
                  const isPlayingCurrent = playingCurrentId === item.id;
                  const isPlayingGoogle = playingGoogleId === item.id;
                  const isGenerating = generatingIds.has(item.id);
                  const rowNumber = (page - 1) * limit + idx + 1;

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Number */}
                      <td className="p-3 text-center text-zinc-400 font-mono text-[11px]">
                        {rowNumber}
                      </td>

                      {/* Hebrew Phrase */}
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <div
                            dir="rtl"
                            className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-wide font-sans select-text"
                          >
                            {item.sentenceHe}
                          </div>
                          {item.sentenceTranscription && (
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 select-text font-serif italic">
                              {item.sentenceTranscription}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                              {item.categoryRu}
                            </span>
                            {item.targetWord && (
                              <span className="text-[10px] text-zinc-400 font-medium">
                                • {item.targetWord}
                              </span>
                            )}
                            {item.lessonTheme && (
                              <span className="text-[10px] text-zinc-400 truncate max-w-[140px] hidden md:inline">
                                • {item.lessonTheme}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Russian Translation */}
                      <td className="p-3 text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {item.sentenceRu}
                      </td>

                      {/* Column 1: Current Audio Preview */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handlePlayCurrent(item)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                            isPlayingCurrent
                              ? 'bg-amber-500 text-white shadow-md animate-pulse'
                              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                          }`}
                          title="Воспроизвести текущий звук (как слышит ученик в приложении)"
                        >
                          {isPlayingCurrent ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Стоп</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Слушать</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Column 2: Google Cloud TTS Preview & Generate */}
                      <td className="p-3 text-center">
                        {item.hasAudio ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePlayGoogle(item)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                                isPlayingGoogle
                                  ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                              }`}
                              title="Воспроизвести сгенерированный студийный Google Cloud TTS"
                            >
                              {isPlayingGoogle ? (
                                <>
                                  <Square className="w-3.5 h-3.5 fill-current" />
                                  <span>Стоп</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Google TTS</span>
                                </>
                              )}
                            </button>

                            {/* Regenerate Icon */}
                            <button
                              type="button"
                              onClick={() => handleGenerateSingle(item)}
                              disabled={isGenerating}
                              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                              title="Перегенерировать этот файл"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                              />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateSingle(item)}
                            disabled={isGenerating}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            title="Сгенерировать MP3 через Google Cloud TTS"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Генерация...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Создать</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="p-3 text-center">
                        {item.hasAudio ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {item.fileSizeBytes
                                ? `${Math.round(item.fileSizeBytes / 1024)} KB`
                                : 'MP3 готов'}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            <span>Нет файла</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. PAGINATOR */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>
              Показано {items.length > 0 ? (page - 1) * limit + 1 : 0}–
              {Math.min(page * limit, totalFiltered)} из {totalFiltered.toLocaleString()} фраз
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <div className="flex items-center gap-1">
              <span>Строк на стр:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>

            <span className="px-3 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1"
            >
              <span>Вперёд</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
