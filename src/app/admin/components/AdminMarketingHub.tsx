'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Send,
  Video,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Phone,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
  Flame,
  CheckCircle2,
  XCircle,
  Archive,
  Layers,
  HelpCircle,
  Users,
  Globe,
  Play,
  Download,
  Film,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface TargetCommunity {
  id: string;
  title: string;
  username: string;
  inviteUrl: string;
  platform: 'telegram' | 'whatsapp' | 'facebook';
  category: 'repatriation' | 'moms' | 'city_haifa' | 'city_center' | 'it_jobs' | 'other';
  categoryLabel?: string;
  membersCount: string;
  status: 'active' | 'paused' | 'backlog';
  leadCount: number;
  notes?: string;
}

interface ServiceHealth {
  status: 'ok' | 'warning' | 'error' | 'disabled' | 'manual_mode';
  latencyMs?: number;
  message: string;
  details?: Record<string, unknown>;
}

interface HealthCheckData {
  timestamp: string;
  services: {
    telegram: ServiceHealth;
    groq: ServiceHealth;
    gemini: ServiceHealth;
    whatsapp: ServiceHealth;
    meta: ServiceHealth;
    youtube?: ServiceHealth;
  };
}

interface PublicationItem {
  id: string;
  date: string;
  channel: 'tiktok' | 'youtube' | 'telegram' | 'facebook' | 'instagram';
  channelAccount: string;
  format: 'short_video' | 'post' | 'story' | 'storytelling' | 'poll';
  title: string;
  campaignTitle?: string;
  version?: string;
  videoPath?: string;
  imagePath?: string;
  caption?: string;
  targetDeepLink: string;
  promoCode: string;
  fullUrlWithPromo: string;
  livePostUrl: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadItem {
  id: string;
  timestamp: string;
  sourceChannel: 'whatsapp' | 'telegram' | 'facebook';
  sourceChatName: string;
  authorName: string;
  authorContact?: string;
  postUrl?: string;
  rawText: string;
  aiAnalysis: {
    isTargetLead: boolean;
    painCategory: string;
    confidence: number;
    painSummary: string;
    targetDeepLink: string;
    suggestedReply: string;
  };
  status: 'new' | 'replied' | 'archived';
  repliedAt?: string;
  notes?: string;
}

export function AdminMarketingHub() {
  const [subTab, setSubTab] = useState<'registry' | 'radar' | 'channels'>('registry');

  // Health check state
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [isHealthExpanded, setIsHealthExpanded] = useState(false);

  // Publications state
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [pubLoading, setPubLoading] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [pubStatusFilter, setPubStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [isAddPubModalOpen, setIsAddPubModalOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string; version?: string; channel?: string } | null>(null);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [publishingRowId, setPublishingRowId] = useState<string | null>(null);

  // New Publication form
  const [newPubTitle, setNewPubTitle] = useState('');
  const [newPubCampaign, setNewPubCampaign] = useState('');
  const [newPubVersion, setNewPubVersion] = useState('v2.0');
  const [newPubVideoPath, setNewPubVideoPath] = useState('');
  const [newPubImagePath, setNewPubImagePath] = useState('');
  const [newPubCaption, setNewPubCaption] = useState('');
  const [newPubChannel, setNewPubChannel] = useState<'tiktok' | 'youtube' | 'telegram' | 'facebook' | 'instagram'>('tiktok');
  const [newPubAccount, setNewPubAccount] = useState('@ulpanaalef');
  const [newPubFormat, setNewPubFormat] = useState<'short_video' | 'post' | 'story' | 'storytelling' | 'poll'>('short_video');
  const [newPubDeepLink, setNewPubDeepLink] = useState('/lessons/1/call');
  const [newPubPromo, setNewPubPromo] = useState('TIKTOK');
  const [newPubLiveUrl, setNewPubLiveUrl] = useState('');
  const [newPubStatus, setNewPubStatus] = useState<'draft' | 'scheduled' | 'published'>('published');
  const [newPubNotes, setNewPubNotes] = useState('');
  const [pubSaving, setPubSaving] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [scanFrequency, setScanFrequency] = useState<'daily' | '6hours' | 'manual'>('daily');
  const [isScanning, setIsScanning] = useState(false);

  // Communities state (Мониторинг сообществ в радаре)
  const [communities, setCommunities] = useState<TargetCommunity[]>([]);
  const [commLoading, setCommLoading] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | 'telegram' | 'whatsapp' | 'facebook'>('all');
  const [isAddCommModalOpen, setIsAddCommModalOpen] = useState(false);
  const [newCommTitle, setNewCommTitle] = useState('');
  const [newCommUsername, setNewCommUsername] = useState('');
  const [newCommInviteUrl, setNewCommInviteUrl] = useState('');
  const [newCommPlatform, setNewCommPlatform] = useState<'telegram' | 'whatsapp' | 'facebook'>('telegram');
  const [newCommCategory, setNewCommCategory] = useState<'repatriation' | 'moms' | 'city_haifa' | 'city_center' | 'it_jobs' | 'other'>('repatriation');
  const [newCommMembers, setNewCommMembers] = useState('~1 000');
  const [newCommNotes, setNewCommNotes] = useState('');
  const [commSaving, setCommSaving] = useState(false);

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyCaption = (captionText: string, id: string) => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaptionId(id);
    setTimeout(() => setCopiedCaptionId(null), 2000);
  };

  const handlePublishRow = async (pub: PublicationItem) => {
    if (!['youtube', 'telegram', 'facebook'].includes(pub.channel)) return;
    setPublishingRowId(pub.id);
    try {
      const res = await fetch('/api/admin/marketing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: pub.channel,
          publicationId: pub.id,
          title: pub.title,
          description: pub.caption || pub.title,
          campaignTitle: pub.campaignTitle,
          version: pub.version,
          videoPath: pub.videoPath,
          privacy: 'public',
          register: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchPublications();
        checkHealth();
      } else {
        alert(data.error || 'Не удалось опубликовать материал');
      }
    } catch (err: any) {
      alert(`Сетевая ошибка: ${err.message}`);
    } finally {
      setPublishingRowId(null);
    }
  };

  // Quick Publish state (1-клик выгрузка на боевом сервере)
  const [isQuickPublishModalOpen, setIsQuickPublishModalOpen] = useState(false);
  const [quickChannel, setQuickChannel] = useState<'youtube' | 'telegram' | 'facebook'>('youtube');
  const [quickTitle, setQuickTitle] = useState('🇮🇱 Как не впасть в ступор, когда звонит израильский курьер #Shorts');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickVideo, setQuickVideo] = useState('public/demo/promo/reels_youtube.mp4');
  const [isQuickPublishing, setIsQuickPublishing] = useState(false);
  const [quickResult, setQuickResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);

  // Fetch Health Check
  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error('Failed to fetch health check', e);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // DB Promos tracking
  const [dbPromos, setDbPromos] = useState<string[]>([]);
  const [creatingPromoForPubId, setCreatingPromoForPubId] = useState<string | null>(null);

  // Fetch Publications & Promos status
  const fetchPublications = useCallback(async () => {
    setPubLoading(true);
    try {
      const [pubRes, promoRes] = await Promise.all([
        fetch('/api/admin/marketing/publications'),
        fetch('/api/admin/promos')
      ]);
      if (pubRes.ok) {
        const data = await pubRes.json();
        setPublications(data.publications || []);
      }
      if (promoRes.ok) {
        const pData = await promoRes.json();
        setDbPromos((pData.promos || []).map((p: any) => String(p.code || '').toUpperCase()));
      }
    } catch (e) {
      console.error('Failed to fetch publications or promos', e);
    } finally {
      setPubLoading(false);
    }
  }, []);

  // 1-Click create promo code in DB for publication
  const handleQuickCreatePromoForPub = async (pub: PublicationItem) => {
    if (!pub.promoCode) return;
    setCreatingPromoForPubId(pub.id);
    const channelMap: Record<string, string> = {
      telegram: 'tg',
      facebook: 'fb',
      instagram: 'insta',
      tiktok: 'tiktok',
      youtube: 'yt',
    };
    const cleanChannel = channelMap[pub.channel] || 'other';
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: pub.promoCode.toUpperCase(),
          codeType: 'post',
          channel: cleanChannel,
          description: `${pub.campaignTitle || pub.title} (${pub.channelAccount})`,
          postLink: pub.livePostUrl || null,
          daysValid: 30,
          maxUses: 1000,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDbPromos((prev) => [...prev, pub.promoCode.toUpperCase()]);
        alert(`Промокод "${pub.promoCode}" успешно создан в базе данных и привязан к публикации!`);
      } else {
        alert(data.error || 'Ошибка при создании промокода');
      }
    } catch (err: any) {
      alert(`Ошибка связи с сервером: ${err.message}`);
    } finally {
      setCreatingPromoForPubId(null);
    }
  };

  // Fetch Leads
  const fetchLeads = useCallback(async () => {
    setLeadLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/radar');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error('Failed to fetch leads', e);
    } finally {
      setLeadLoading(false);
    }
  }, []);

  // Fetch Communities
  const fetchCommunities = useCallback(async () => {
    setCommLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/communities');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
      }
    } catch (e) {
      console.error('Failed to fetch communities', e);
    } finally {
      setCommLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    fetchPublications();
    fetchLeads();
    fetchCommunities();
  }, [checkHealth, fetchPublications, fetchLeads, fetchCommunities]);

  // Create Publication
  const handleCreatePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPubTitle.trim()) return;

    setPubSaving(true);
    try {
      const res = await fetch('/api/admin/marketing/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPubTitle,
          campaignTitle: newPubCampaign || undefined,
          version: newPubVersion || undefined,
          videoPath: newPubVideoPath || undefined,
          imagePath: newPubImagePath || undefined,
          caption: newPubCaption || undefined,
          channel: newPubChannel,
          channelAccount: newPubAccount,
          format: newPubFormat,
          targetDeepLink: newPubDeepLink,
          promoCode: newPubPromo,
          livePostUrl: newPubLiveUrl,
          status: newPubStatus,
          notes: newPubNotes,
        }),
      });

      if (res.ok) {
        setIsAddPubModalOpen(false);
        setNewPubTitle('');
        setNewPubCampaign('');
        setNewPubVersion('v2.0');
        setNewPubVideoPath('');
        setNewPubImagePath('');
        setNewPubCaption('');
        setNewPubLiveUrl('');
        setNewPubNotes('');
        fetchPublications();
      }
    } catch (e) {
      console.error('Error creating publication', e);
    } finally {
      setPubSaving(false);
    }
  };

  // Quick Publish Handler (Отправка на боевой сервер)
  const handleQuickPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsQuickPublishing(true);
    setQuickResult(null);

    try {
      const res = await fetch('/api/admin/marketing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: quickChannel,
          title: quickTitle,
          description: quickDesc || undefined,
          videoPath: quickVideo,
          privacy: 'public',
          register: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQuickResult({
          success: true,
          message: `Успешно выгружено на ${quickChannel.toUpperCase()}!`,
          url: data.livePostUrl || data.publicUrl,
        });
        fetchPublications();
        checkHealth();
      } else {
        setQuickResult({
          success: false,
          message: data.error || 'Не удалось опубликовать материал',
        });
      }
    } catch (err: any) {
      setQuickResult({
        success: false,
        message: `Сетевая ошибка: ${err.message}`,
      });
    } finally {
      setIsQuickPublishing(false);
    }
  };

  // Delete Publication
  const handleDeletePublication = async (id: string) => {
    if (!confirm('Удалить эту запись из реестра публикаций?')) return;
    try {
      const res = await fetch(`/api/admin/marketing/publications?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchPublications();
      }
    } catch (e) {
      console.error('Error deleting publication', e);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async (id: string, status: 'new' | 'replied' | 'archived') => {
    try {
      const res = await fetch('/api/admin/marketing/radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status, repliedAt: status === 'replied' ? new Date().toISOString() : l.repliedAt } : l))
        );
      }
    } catch (e) {
      console.error('Error updating lead status', e);
    }
  };

  // Refresh Radar (Синхронизация реальных лидов и каналов без генерации тестовых моков)
  const handleRefreshRadar = async () => {
    setIsScanning(true);
    try {
      await Promise.all([fetchLeads(), fetchCommunities()]);
    } catch (e) {
      console.error('Error refreshing radar', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Community Management Handlers
  const handleAddCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommTitle.trim() || !newCommUsername.trim()) return;
    setCommSaving(true);
    try {
      const res = await fetch('/api/admin/marketing/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCommTitle,
          username: newCommUsername,
          inviteUrl: newCommInviteUrl,
          platform: newCommPlatform,
          category: newCommCategory,
          membersCount: newCommMembers,
          notes: newCommNotes,
        }),
      });
      if (res.ok) {
        setIsAddCommModalOpen(false);
        setNewCommTitle('');
        setNewCommUsername('');
        setNewCommInviteUrl('');
        setNewCommNotes('');
        setNewCommMembers('~1 000');
        fetchCommunities();
      }
    } catch (e) {
      console.error('Failed to add community', e);
    } finally {
      setCommSaving(false);
    }
  };

  const handleToggleCommunityStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch('/api/admin/marketing/communities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setCommunities((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c))
        );
      }
    } catch (e) {
      console.error('Failed to toggle community status', e);
    }
  };

  const handleDeleteCommunity = async (id: string) => {
    if (!confirm('Удалить группу из списка мониторинга?')) return;
    try {
      const res = await fetch(`/api/admin/marketing/communities?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCommunities((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete community', e);
    }
  };

  // Helper channel badges
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'tiktok':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-pink-400 border border-pink-500/30">🎵 TikTok</span>;
      case 'telegram':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">✈️ Telegram</span>;
      case 'youtube':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">▶️ YouTube</span>;
      case 'facebook':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-300 border border-blue-600/30">📘 Facebook</span>;
      case 'instagram':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">📸 Instagram</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">{channel}</span>;
    }
  };

  const availableCampaigns = Array.from(
    new Set(publications.map((p) => p.campaignTitle).filter(Boolean))
  ) as string[];

  const filteredPublications = publications.filter((p) => {
    if (channelFilter !== 'all' && p.channel !== channelFilter) return false;
    if (pubStatusFilter !== 'all' && p.status !== pubStatusFilter) return false;
    if (campaignFilter !== 'all' && p.campaignTitle !== campaignFilter) return false;
    return true;
  });

  const filteredCommunities = communities.filter((c) => {
    if (selectedPlatformFilter !== 'all' && c.platform !== selectedPlatformFilter) return false;
    return true;
  });

  const filteredLeads = leads.filter((l) => {
    if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
    if (selectedPlatformFilter !== 'all' && l.sourceChannel !== selectedPlatformFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. ДИАГНОСТИЧЕСКИЙ СВЕТОФОР ПОДКЛЮЧЕНИЙ (HEALTH CHECK HUD) */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-3.5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-zinc-100">Монитор подключений</h2>
            </div>

            {/* Компактные статусные бейджи в одну строчку */}
            {health && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-medium text-zinc-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.services.telegram.status === 'ok'
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                        : health.services.telegram.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>TG</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-medium text-zinc-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.services.groq.status === 'ok'
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                        : 'bg-red-500'
                    }`}
                  />
                  <span>Groq</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-medium text-zinc-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.services.gemini.status === 'ok'
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                        : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                    }`}
                  />
                  <span>Gemini{health.services.gemini.status !== 'ok' ? ' (401)' : ''}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-medium text-zinc-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.services.whatsapp.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span>WA</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-medium text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Meta</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-[11px] font-medium text-zinc-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.services.youtube?.status === 'ok'
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>YouTube</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkHealth}
              disabled={healthLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition cursor-pointer border border-zinc-700"
              title="Проверить состояние всех API"
            >
              <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{healthLoading ? 'Проверка...' : 'Проверить'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHealthExpanded(!isHealthExpanded)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer border border-zinc-700"
              title={isHealthExpanded ? 'Свернуть карточки монитора' : 'Показать подробности по каждому сервису'}
            >
              <span>{isHealthExpanded ? 'Свернуть' : 'Подробнее'}</span>
              {isHealthExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Развернутая сетка подробностей (по клику на "Подробнее") */}
        {isHealthExpanded && health && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-3 mt-3 border-t border-zinc-800/80">
            {/* Telegram */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">✈️ Telegram Bot</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health.services.telegram.status === 'ok'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : health.services.telegram.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-medium line-clamp-2">{health.services.telegram.message}</p>
              {health.services.telegram.latencyMs !== undefined && (
                <span className="text-[10px] text-zinc-500 mt-1">{health.services.telegram.latencyMs} ms</span>
              )}
            </div>

            {/* Groq LLM */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">⚡ Groq LLM</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health.services.groq.status === 'ok'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-medium line-clamp-2">{health.services.groq.message}</p>
              {health.services.groq.latencyMs !== undefined && (
                <span className="text-[10px] text-zinc-500 mt-1">{health.services.groq.latencyMs} ms</span>
              )}
            </div>

            {/* Gemini LLM */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">✨ Gemini LLM</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health.services.gemini.status === 'ok'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'bg-amber-500'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-medium line-clamp-2">{health.services.gemini.message}</p>
              {health.services.gemini.latencyMs !== undefined && (
                <span className="text-[10px] text-zinc-500 mt-1">{health.services.gemini.latencyMs} ms</span>
              )}
            </div>

            {/* WhatsApp Radar */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">💬 WhatsApp Radar</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health.services.whatsapp.status === 'ok'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-medium line-clamp-2">{health.services.whatsapp.message}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Listen-Only</span>
            </div>

            {/* Meta Business */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">📘 Meta (FB & IG)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-medium line-clamp-2">{health.services.meta.message}</p>
              <span className="text-[10px] text-zinc-500 mt-1">Бесплатный 1-клик постинг</span>
            </div>

            {/* YouTube Data API v3 */}
            <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">▶️ YouTube API</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health.services.youtube?.status === 'ok'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : health.services.youtube?.status === 'manual_mode'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-medium line-clamp-2">
                {health.services.youtube?.message || 'YouTube Data API v3'}
              </p>
              <span className="text-[10px] text-zinc-500 mt-1">Shorts & Видео</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. ПОДВКЛАДКИ МАРКЕТИНГ-ХАБА */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('registry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            subTab === 'registry'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Реестр публикаций ({publications.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('radar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            subTab === 'radar'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Партизанский радар ({leads.filter((l) => l.status === 'new').length} новых)</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('channels')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            subTab === 'channels'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Каналы и Аккаунты</span>
        </button>
      </div>

      {/* 3. ВКЛАДКА 1: РЕЕСТР ПУБЛИКАЦИЙ */}
      {subTab === 'registry' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-zinc-400 font-medium">Площадка:</span>
                {['all', 'tiktok', 'telegram', 'youtube', 'facebook', 'instagram'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannelFilter(ch)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      channelFilter === ch
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80 hover:text-white border border-zinc-700/60'
                    }`}
                  >
                    {ch === 'all' ? 'Все' : ch.toUpperCase()}
                  </button>
                ))}
              </div>

              {availableCampaigns.length > 0 && (
                <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-3">
                  <span className="text-xs text-zinc-400 font-medium">Кампания:</span>
                  <select
                    value={campaignFilter}
                    onChange={(e) => setCampaignFilter(e.target.value)}
                    className="bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg px-2.5 py-1 border border-zinc-700 outline-none"
                  >
                    <option value="all">Все кампании ({publications.length})</option>
                    {availableCampaigns.map((camp) => (
                      <option key={camp} value={camp}>
                        {camp}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-3">
                <span className="text-xs text-zinc-400 font-medium">Статус:</span>
                <select
                  value={pubStatusFilter}
                  onChange={(e) => setPubStatusFilter(e.target.value)}
                  className="bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg px-2.5 py-1 border border-zinc-700 outline-none"
                >
                  <option value="all">Любой статус</option>
                  <option value="published">🟢 Опубликованные</option>
                  <option value="scheduled">🟡 Запланированные</option>
                  <option value="draft">⚪ Черновики / Готовы</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuickResult(null);
                  setIsQuickPublishModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>⚡ Быстрая публикация</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddPubModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Внести в реестр</span>
              </button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Дата и Канал</th>
                    <th className="px-4 py-3">Кампания и Версия</th>
                    <th className="px-4 py-3">Видео</th>
                    <th className="px-4 py-3 min-w-[280px]">Текст поста (Copywriting)</th>
                    <th className="px-4 py-3">Ссылка и Промокод</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredPublications.map((pub) => (
                    <tr key={pub.id} className="hover:bg-zinc-800/40 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {getChannelBadge(pub.channel)}
                          </div>
                          <span className="text-[10px] text-zinc-500">{pub.channelAccount}</span>
                          <span className="text-[10px] text-zinc-400">{pub.date}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-zinc-100 text-xs">
                            {pub.campaignTitle || 'Общая'}
                          </span>
                          {pub.version && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {pub.version}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-300 text-xs mt-0.5 line-clamp-2">{pub.title}</p>
                        <span className="text-[10px] text-zinc-500 uppercase">{pub.format}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pub.videoPath ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewVideo({
                                  url: pub.videoPath!,
                                  title: pub.title,
                                  version: pub.version,
                                  channel: pub.channel,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition cursor-pointer"
                              title="Смотреть видео прямо в админке"
                            >
                              <Play className="w-3.5 h-3.5 fill-blue-300 text-blue-300" />
                              <span>Плеер</span>
                            </button>
                            <a
                              href={pub.videoPath}
                              download
                              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                              title="Скачать исходный видеофайл .mp4"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : pub.imagePath ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={pub.imagePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                              title="Открыть фото в полном размере"
                            >
                              <Film className="w-3.5 h-3.5 text-amber-300" />
                              <span>Фото</span>
                            </a>
                            <a
                              href={pub.imagePath}
                              download
                              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                              title="Скачать фото для поста"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 min-w-[280px]">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyCaption(pub.caption || pub.title, pub.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer border border-zinc-700 w-fit"
                            title="Скопировать готовый авторский текст поста с хэштегами"
                          >
                            {copiedCaptionId === pub.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Скопировано!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                <span>📋 Скопировать текст</span>
                              </>
                            )}
                          </button>
                          <p
                            className="text-[12px] text-zinc-300 line-clamp-3 leading-relaxed"
                            title={pub.caption || pub.title}
                          >
                            {pub.caption || pub.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(pub.fullUrlWithPromo, pub.id)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer text-xs w-fit"
                            title="Скопировать готовую ссылку с промокодом"
                          >
                            {copiedId === pub.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            )}
                            <span className="font-mono text-[11px]">{pub.targetDeepLink}</span>
                          </button>

                          {pub.promoCode && (
                            <div className="flex items-center gap-1.5">
                              {dbPromos.includes(pub.promoCode.toUpperCase()) ? (
                                <span
                                  className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] w-fit flex items-center gap-1"
                                  title="Промокод существует и активен в базе данных"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Код: {pub.promoCode}</span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className="font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] w-fit"
                                    title="Код ещё не создан в базе промокодов"
                                  >
                                    Код: {pub.promoCode}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickCreatePromoForPub(pub)}
                                    disabled={creatingPromoForPubId === pub.id}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] transition disabled:opacity-50 cursor-pointer shadow-xs"
                                    title="Создать промокод в базе данных и привязать к этой публикации в 1 клик"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>{creatingPromoForPubId === pub.id ? 'Создаём...' : '+ Создать в БД'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold text-center ${
                              pub.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : pub.status === 'scheduled'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {pub.status === 'published'
                              ? '🟢 Вышел'
                              : pub.status === 'scheduled'
                              ? '🟡 План'
                              : '⚪ Готов'}
                          </span>
                          {pub.livePostUrl ? (
                            <a
                              href={pub.livePostUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs"
                            >
                              <span>В эфире</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {pub.status !== 'published' &&
                            ['youtube', 'telegram', 'facebook'].includes(pub.channel) && (
                              <button
                                type="button"
                                onClick={() => handlePublishRow(pub)}
                                disabled={publishingRowId === pub.id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] font-bold transition shadow shadow-red-600/20 cursor-pointer disabled:opacity-50"
                                title="Опубликовать этот пост через API боевого сервера в 1 клик"
                              >
                                <Flame
                                  className={`w-3.5 h-3.5 ${
                                    publishingRowId === pub.id ? 'animate-spin' : ''
                                  }`}
                                />
                                <span>{publishingRowId === pub.id ? '...' : '⚡ В 1 клик'}</span>
                              </button>
                            )}

                          <button
                            type="button"
                            onClick={() => handleDeletePublication(pub.id)}
                            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                            title="Удалить публикацию"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ВКЛАДКА 2: ПАРТИЗАНСКИЙ РАДАР (LEAD RADAR CRM) */}
      {subTab === 'radar' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Частота дайджеста:</span>
                <select
                  value={scanFrequency}
                  onChange={(e) => setScanFrequency(e.target.value as any)}
                  className="bg-zinc-800 text-xs font-semibold text-zinc-200 rounded-lg px-2.5 py-1 border border-zinc-700 outline-none"
                >
                  <option value="daily">Раз в сутки (09:00)</option>
                  <option value="6hours">Каждые 6 часов</option>
                  <option value="manual">Только вручную</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${leadStatusFilter === 'all' ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  Все ({leads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('new')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${leadStatusFilter === 'new' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-amber-400'}`}
                >
                  Новые ({leads.filter((l) => l.status === 'new').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('replied')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${leadStatusFilter === 'replied' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-emerald-400'}`}
                >
                  Отвечено ({leads.filter((l) => l.status === 'replied').length})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshRadar}
              disabled={isScanning || leadLoading || commLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold transition border border-zinc-700 shadow-md cursor-pointer"
              title="Обновить перехваченные сообщения и список каналов"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${(isScanning || leadLoading || commLoading) ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{(isScanning || leadLoading || commLoading) ? 'Синхронизация...' : '🔄 Обновить радар'}</span>
            </button>
          </div>

          {/* Блок мониторинга сообществ (Плоская таблица и честные статусы) */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span>Целевые чаты и каналы партизанского маркетинга</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🟢 {communities.filter((c) => c.status === 'active').length} активно
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Перехват Telegram работает 24/7 на Hetzner через MTProto. Группы WhatsApp и Facebook в режиме ручного учёта.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchCommunities}
                  disabled={commLoading}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                  title="Обновить список сообществ"
                >
                  <RefreshCw className={`w-4 h-4 ${commLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCommModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Добавить сообщество</span>
                </button>
              </div>
            </div>

            {/* Фильтры сетей (Все / Telegram / WhatsApp / Facebook) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedPlatformFilter === 'all'
                    ? 'bg-zinc-200 text-zinc-900 shadow'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
                }`}
              >
                Все сети ({communities.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('telegram')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedPlatformFilter === 'telegram'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span>✈️ Telegram ({communities.filter((c) => c.platform === 'telegram').length})</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 Hetzner 24/7
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('whatsapp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedPlatformFilter === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span>💬 WhatsApp ({communities.filter((c) => c.platform === 'whatsapp').length})</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-zinc-700 text-zinc-300">
                  ⚪ Ручной
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlatformFilter('facebook')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedPlatformFilter === 'facebook'
                    ? 'bg-blue-700 text-white shadow-lg shadow-blue-700/25'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span>📘 Facebook ({communities.filter((c) => c.platform === 'facebook').length})</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-zinc-700 text-zinc-300">
                  ⚪ Ручной
                </span>
              </button>
            </div>

            {/* Плоская таблица сообществ */}
            {filteredCommunities.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Сообществ в выбранной категории не найдено.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                      <th className="px-3.5 py-2.5 font-semibold">Сеть</th>
                      <th className="px-3.5 py-2.5 font-semibold">Сообщество / Ссылка</th>
                      <th className="px-3.5 py-2.5 font-semibold">Категория болей</th>
                      <th className="px-3.5 py-2.5 font-semibold">Аудитория</th>
                      <th className="px-3.5 py-2.5 font-semibold">Статус автоматики</th>
                      <th className="px-3.5 py-2.5 font-semibold text-center">Эфир</th>
                      <th className="px-3.5 py-2.5 font-semibold text-center">Лидов</th>
                      <th className="px-3.5 py-2.5 font-semibold text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                    {filteredCommunities.map((c) => {
                      const leadCountForChat = leads.filter(
                        (l) => l.sourceChatName === c.username || l.sourceChatName === c.title || l.sourceChatName === `@${c.username}`
                      ).length;

                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-zinc-800/40 transition ${
                            c.status === 'paused' ? 'opacity-60 bg-zinc-950/30' : ''
                          }`}
                        >
                          {/* 1. Сеть */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            {c.platform === 'telegram' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                ✈️ Telegram
                              </span>
                            ) : c.platform === 'whatsapp' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                💬 WhatsApp
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-600/10 text-blue-300 border border-blue-600/20">
                                📘 Facebook
                              </span>
                            )}
                          </td>

                          {/* 2. Сообщество / Ссылка */}
                          <td className="px-3.5 py-3">
                            <div className="font-bold text-zinc-100">{c.title}</div>
                            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] mt-0.5">
                              <a
                                href={c.inviteUrl || (c.platform === 'telegram' ? `https://t.me/${c.username}` : '#')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                              >
                                <span>{c.platform === 'telegram' ? `@${c.username}` : c.username}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              {c.notes && (
                                <span className="text-zinc-500 text-[10px] hidden md:inline truncate max-w-[200px]" title={c.notes}>
                                  • {c.notes}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 3. Категория */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                              {c.categoryLabel || c.category}
                            </span>
                          </td>

                          {/* 4. Аудитория */}
                          <td className="px-3.5 py-3 whitespace-nowrap text-zinc-300 font-medium">
                            👥 {c.membersCount}
                          </td>

                          {/* 5. Статус автоматики */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            {c.platform === 'telegram' ? (
                              c.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>🟢 Hetzner 24/7 (Автоперехват)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  ⏸ Приостановлен
                                </span>
                              )
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60"
                                title="Автоматический перехват не подключен. Группа для ручного учёта и посева."
                              >
                                ⚪ Ручной учёт (автомат off)
                              </span>
                            )}
                          </td>

                          {/* 6. Эфир */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleCommunityStatus(c.id, c.status)}
                              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                                c.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
                              }`}
                            >
                              {c.status === 'active' ? '🟢 В эфире' : '⏸ Пауза'}
                            </button>
                          </td>

                          {/* 7. Лидов */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap font-bold text-zinc-200">
                            {leadCountForChat > 0 ? (
                              <span className="text-amber-400">🔥 {leadCountForChat}</span>
                            ) : (
                              <span className="text-zinc-500">0</span>
                            )}
                          </td>

                          {/* 8. Действия */}
                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteCommunity(c.id)}
                              className="text-zinc-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                              title="Удалить из списка"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Перехваченные обращения (Leads Feed) */}
          {filteredLeads.length === 0 ? (
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                🛡️
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="text-sm font-bold text-zinc-200">
                  {selectedPlatformFilter === 'all' || selectedPlatformFilter === 'telegram'
                    ? 'Радар Telegram активен 24/7 на Hetzner'
                    : `Ручной учёт сообщений (${selectedPlatformFilter === 'whatsapp' ? 'WhatsApp' : 'Facebook'})`}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {selectedPlatformFilter === 'all' || selectedPlatformFilter === 'telegram'
                    ? 'Фоновый демон MTProto круглосуточно слушает входящие сообщения в целевых Telegram-группах. Как только участник задаст вопрос с маркерами языковых болей (курьер, садик, собеседование, ульпан), сообщение появится здесь с готовым черновиком ответа и придёт ботом в Telegram.'
                    : 'Для этой сети автоматический перехват не подключен. Здесь будут отображаться только реальные сообщения, зафиксированные вручную.'}
                </p>
                <div className="pt-2 text-[11px] text-zinc-500">
                  Синтетические моки отключены: отображаются исключительно подлинные перехваченные данные.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`bg-zinc-900 rounded-2xl border p-5 transition shadow-lg ${
                    lead.status === 'new'
                      ? 'border-amber-500/50 shadow-amber-500/5'
                      : lead.status === 'replied'
                      ? 'border-emerald-500/30 opacity-80'
                      : 'border-zinc-800 opacity-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          lead.sourceChannel === 'facebook'
                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                            : lead.sourceChannel === 'telegram'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {lead.sourceChannel === 'facebook'
                          ? '📘 FB: '
                          : lead.sourceChannel === 'telegram'
                          ? '✈️ TG: '
                          : '💬 WA: '}
                        {lead.sourceChatName}
                      </span>
                      <span className="text-xs text-zinc-400">• {lead.authorName} ({lead.authorContact || '—'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        🔥 {lead.aiAnalysis.confidence}/10
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          lead.status === 'new'
                            ? 'bg-amber-500/20 text-amber-300'
                            : lead.status === 'replied'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {lead.status === 'new' ? '🟡 Новый' : lead.status === 'replied' ? '🟢 Отвечено' : '⚪ В архиве'}
                      </span>
                    </div>
                  </div>

                  <div className="py-3">
                    <p className="text-sm text-zinc-200 italic bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                      «{lead.rawText}»
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2 text-xs">
                    <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60">
                      <span className="font-bold text-zinc-400 block mb-1">🧠 Анализ боли (Groq / Gemini):</span>
                      <p className="text-zinc-200">{lead.aiAnalysis.painSummary}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-blue-400">
                        <span className="font-bold">Целевой экран:</span>
                        <code className="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded text-[11px]">
                          {lead.aiAnalysis.targetDeepLink}
                        </code>
                      </div>
                    </div>

                    <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-zinc-400 block mb-1">✍️ Рекомендуемый черновик ответа:</span>
                        <p className="text-zinc-300 text-xs leading-relaxed">{lead.aiAnalysis.suggestedReply}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(lead.aiAnalysis.suggestedReply, `lead-${lead.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        {copiedId === `lead-${lead.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === `lead-${lead.id}` ? 'Скопировано!' : 'Скопировать ответ'}</span>
                      </button>

                      {lead.postUrl && (
                        <a
                          href={lead.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold transition border border-blue-500/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Открыть пост</span>
                        </a>
                      )}

                      {lead.authorContact && (
                        <a
                          href={
                            lead.authorContact.startsWith('+')
                              ? `https://wa.me/${lead.authorContact.replace(/[^0-9]/g, '')}`
                              : lead.authorContact.startsWith('@')
                              ? `https://t.me/${lead.authorContact.replace('@', '')}`
                              : `https://${lead.authorContact}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Открыть чат / Ответить</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {lead.status !== 'replied' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateLeadStatus(lead.id, 'replied')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Отвечено</span>
                        </button>
                      )}
                      {lead.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateLeadStatus(lead.id, 'archived')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-semibold transition cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>В архив</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. ВКЛАДКА 3: КАНАЛЫ И АККАУНТЫ */}
      {subTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-pink-400">🎵 TikTok</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">🟢 Запущен</span>
            </div>
            <p className="text-sm font-bold text-zinc-100">@ulpanaalef</p>
            <p className="text-xs text-zinc-400">Вход: azr2001.g@gmail.com. Промокод для био: TIKTOK (14 дней PRO).</p>
            <a
              href="https://www.tiktok.com/@ulpanaalef"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
            >
              <span>Открыть профиль</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400">✈️ Telegram</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">🟢 Автопостинг готов</span>
            </div>
            <p className="text-sm font-bold text-zinc-100">@ulpana_il</p>
            <p className="text-xs text-zinc-400">Бот: @Ulpinebot. Скрипт: growth/scripts/post_to_telegram.cjs. Промокод: TG_CHANNEL.</p>
            <a
              href="https://t.me/ulpana_il"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
            >
              <span>Открыть канал</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-500">📘 Meta (FB & Instagram)</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">🟢 1-клик постинг</span>
            </div>
            <p className="text-sm font-bold text-zinc-100">Meta Business Suite</p>
            <p className="text-xs text-zinc-400">Бесплатный одновременный постинг в Facebook и Instagram без сторонних платных шлюзов.</p>
            <a
              href="https://business.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
            >
              <span>Открыть Meta Business Suite</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400">▶️ YouTube (Shorts & Канал)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                health?.services.youtube?.status === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {health?.services.youtube?.status === 'ok' ? '🟢 API подключен' : '🟡 Настройка OAuth'}
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-100">Ульпан Алеф | Живой иврит</p>
            <p className="text-xs text-zinc-400">Публикация YouTube Shorts и обучающих роликов. Промокод для описаний: YT.</p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.youtube.com/channel/UC1kWxNhUydNncIRzTbBzWJw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:underline font-semibold"
              >
                <span>Открыть канал</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://studio.youtube.com/channel/UC1kWxNhUydNncIRzTbBzWJw"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                <span>YouTube Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ДОБАВИТЬ ПУБЛИКАЦИЮ */}
      {isAddPubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Новая публикация в реестр</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPubModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePublication} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Площадка:</label>
                <select
                  value={newPubChannel}
                  onChange={(e) => {
                    const ch = e.target.value as any;
                    setNewPubChannel(ch);
                    if (ch === 'tiktok') setNewPubAccount('@ulpanaalef');
                    if (ch === 'telegram') setNewPubAccount('@ulpana_il');
                  }}
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                >
                  <option value="tiktok">🎵 TikTok (@ulpanaalef)</option>
                  <option value="telegram">✈️ Telegram (@ulpana_il)</option>
                  <option value="youtube">▶️ YouTube (Shorts/Канал)</option>
                  <option value="facebook">📘 Facebook</option>
                  <option value="instagram">📸 Instagram</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Тема / Заголовок:</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Звонок курьера: ступор на «ани лемата»"
                  value={newPubTitle}
                  onChange={(e) => setNewPubTitle(e.target.value)}
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Формат:</label>
                  <select
                    value={newPubFormat}
                    onChange={(e) => setNewPubFormat(e.target.value as any)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                  >
                    <option value="short_video">Короткое видео 9:16</option>
                    <option value="post">Пост + карточка</option>
                    <option value="storytelling">Сторителлинг</option>
                    <option value="story">Stories</option>
                    <option value="poll">Опрос</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Промокод:</label>
                  <input
                    type="text"
                    value={newPubPromo}
                    onChange={(e) => setNewPubPromo(e.target.value.toUpperCase())}
                    placeholder="TIKTOK"
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-mono"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Целевой экран (Deep Link):</label>
                <input
                  type="text"
                  value={newPubDeepLink}
                  onChange={(e) => setNewPubDeepLink(e.target.value)}
                  placeholder="/lessons/1/call или /decks/it-interview"
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Кампания / Тема:</label>
                  <input
                    type="text"
                    placeholder="Например: Этап 5: Диалоги"
                    value={newPubCampaign}
                    onChange={(e) => setNewPubCampaign(e.target.value)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Версия:</label>
                  <input
                    type="text"
                    placeholder="v2.0"
                    value={newPubVersion}
                    onChange={(e) => setNewPubVersion(e.target.value)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Видеофайл (.mp4):</label>
                  <input
                    type="text"
                    placeholder="/demo/tutorials/...mp4"
                    value={newPubVideoPath}
                    onChange={(e) => setNewPubVideoPath(e.target.value)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Фотография (.jpg):</label>
                  <input
                    type="text"
                    placeholder="/images/marketing/...jpg"
                    value={newPubImagePath}
                    onChange={(e) => setNewPubImagePath(e.target.value)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Готовый текст поста (Copywriting):</label>
                <textarea
                  rows={3}
                  placeholder="Адаптированный текст с хэштегами и призывом к действию под эту соцсеть..."
                  value={newPubCaption}
                  onChange={(e) => setNewPubCaption(e.target.value)}
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Ссылка на опубликованный материал (URL):</label>
                <input
                  type="url"
                  value={newPubLiveUrl}
                  onChange={(e) => setNewPubLiveUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@ulpanaalef/video/..."
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddPubModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={pubSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  {pubSaving ? 'Сохранение...' : 'Сохранить публикацию'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* МОДАЛКА: БЫСТРАЯ ПУБЛИКАЦИЯ (1-КЛИК ПОСТИНГ НА БОЕВОМ СЕРВЕРЕ) */}
      {isQuickPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400" />
                <span>Быстрая публикация на боевом сервере</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickPublishModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quickResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  quickResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <p className="font-bold">{quickResult.message}</p>
                {quickResult.url && (
                  <a
                    href={quickResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-blue-400 hover:underline font-semibold"
                  >
                    <span>Перейти к публикации</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleQuickPublish} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Площадка для выгрузки:</label>
                <select
                  value={quickChannel}
                  onChange={(e) => setQuickChannel(e.target.value as any)}
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-semibold"
                >
                  <option value="youtube">▶️ YouTube (Shorts / Канал)</option>
                  <option value="telegram">✈️ Telegram (@ulpana_il)</option>
                  <option value="facebook">📘 Facebook (Страница)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Заголовок / Тема:</label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Заголовок для YouTube Shorts или поста"
                  required
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Описание / Текст поста:</label>
                <textarea
                  rows={3}
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="Текст с описанием, фразами на иврите и ссылкой (если пусто — используется стандартный шаблон)"
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none resize-none"
                />
              </div>

              {(quickChannel === 'youtube' || quickChannel === 'telegram') && (
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Видеофайл на сервере (public/demo/...):</label>
                  <select
                    value={quickVideo}
                    onChange={(e) => setQuickVideo(e.target.value)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                  >
                    <option value="public/demo/promo/reels_youtube.mp4">
                      promo/reels_youtube.mp4 (Wolt: плашка YOUTUBE, 9:16 Shorts)
                    </option>
                    <option value="public/demo/promo/reels_tg.mp4">
                      promo/reels_tg.mp4 (Wolt: плашка TG для Telegram)
                    </option>
                    <option value="public/demo/promo/reels_tiktok.mp4">
                      promo/reels_tiktok.mp4 (Wolt: плашка TIKTOK)
                    </option>
                    <option value="public/demo/promo/reels_insta.mp4">
                      promo/reels_insta.mp4 (Wolt: плашка INSTA)
                    </option>
                    <option value="public/demo/promo/reels_fb.mp4">
                      promo/reels_fb.mp4 (Wolt: плашка FB)
                    </option>
                    <option value="public/demo/tutorials/stage_05_dialogue_v2.mp4">
                      tutorials/stage_05_dialogue_v2.mp4 (Диалог с Бариста)
                    </option>
                    <option value="public/demo/ulpana_full_guide.mp4">
                      ulpana_full_guide.mp4 (Полный гид по ульпану)
                    </option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsQuickPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold cursor-pointer"
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  disabled={isQuickPublishing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  <Flame className="w-4 h-4" />
                  <span>{isQuickPublishing ? 'Выгрузка на сервер...' : '🚀 Запустить публикацию'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ДОБАВИТЬ СООБЩЕСТВО В МОНИТОРИНГ РАДАРА */}
      {isAddCommModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Добавить группу / канал для радара</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCommModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCommunity} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Название группы / чата:</label>
                <input
                  type="text"
                  value={newCommTitle}
                  onChange={(e) => setNewCommTitle(e.target.value)}
                  placeholder="Например: Чат репатриантов Тель-Авива"
                  required
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Сеть / Платформа:</label>
                  <select
                    value={newCommPlatform}
                    onChange={(e) => setNewCommPlatform(e.target.value as any)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-semibold"
                  >
                    <option value="telegram">✈️ Telegram (Супергруппа)</option>
                    <option value="whatsapp">💬 WhatsApp (Группа олим)</option>
                    <option value="facebook">📘 Facebook (Группа)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {newCommPlatform === 'telegram' ? 'Telegram @username:' : newCommPlatform === 'whatsapp' ? 'Имя / Чат ID:' : 'Группа / Страница:'}
                  </label>
                  <input
                    type="text"
                    value={newCommUsername}
                    onChange={(e) => setNewCommUsername(e.target.value)}
                    placeholder={newCommPlatform === 'telegram' ? 'ole_hadash_chat' : newCommPlatform === 'whatsapp' ? 'Чат Репатрианты' : 'groups/olim.israel'}
                    required
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Категория:</label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value as any)}
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none font-semibold"
                  >
                    <option value="repatriation">Репатриация и адаптация</option>
                    <option value="moms">Семья и дети (Мамы)</option>
                    <option value="city_haifa">Хайфа и Север</option>
                    <option value="city_center">Центр (Тель-Авив / Нетания)</option>
                    <option value="it_jobs">Хайтек и работа</option>
                    <option value="other">Общее</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Аудитория (примерно):</label>
                  <input
                    type="text"
                    value={newCommMembers}
                    onChange={(e) => setNewCommMembers(e.target.value)}
                    placeholder="~5,000"
                    className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Ссылка на вступление (опционально):</label>
                <input
                  type="url"
                  value={newCommInviteUrl}
                  onChange={(e) => setNewCommInviteUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Заметки / фокус болей:</label>
                <textarea
                  rows={2}
                  value={newCommNotes}
                  onChange={(e) => setNewCommNotes(e.target.value)}
                  placeholder="Какие боли тут обсуждают чаще всего..."
                  className="w-full bg-zinc-800 rounded-xl p-2.5 text-zinc-200 border border-zinc-700 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddCommModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={commSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  <span>{commSaving ? 'Сохранение...' : 'Добавить в радар'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛКА: ВСТРОЕННЫЙ ВИДЕОПЛЕЕР ПРЕДПРОСМОТРА */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-2 overflow-hidden">
                {previewVideo.channel && getChannelBadge(previewVideo.channel)}
                {previewVideo.version && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    {previewVideo.version}
                  </span>
                )}
                <h3 className="font-bold text-sm text-zinc-100 truncate" title={previewVideo.title}>
                  {previewVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Закрыть плеер"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex justify-center items-center min-h-[300px]">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                playsInline
                className="max-h-[65vh] max-w-full rounded-xl shadow-2xl border border-zinc-800 object-contain"
              />
            </div>

            <div className="p-3 bg-zinc-950 flex items-center justify-between border-t border-zinc-800 text-xs">
              <span className="text-zinc-500 font-mono text-[11px] truncate max-w-[200px]" title={previewVideo.url}>
                {previewVideo.url}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewVideo.url}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition font-semibold cursor-pointer border border-zinc-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать .mp4</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewVideo(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
