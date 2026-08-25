'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Search,
  RefreshCw,
  ArrowLeft,
  Crown,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  BookMarked,
  Activity,
  AlertCircle,
  Database,
  Calendar,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { getLessonById } from '@/data/lessonsData';
import { loadLocalCallLogs } from '@/lib/storage';

interface AdminStats {
  totalUsers: number;
  todayUsers: number;
  weekUsers: number;
  proUsers: number;
  totalCompletedLessons: number;
  activeUsersWeek: number;
}

interface RecentActivityItem {
  id: number;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar?: string;
  lessonId: number;
  isCompleted: boolean;
  score: number;
  updatedAt: string;
}

interface AdminCallLog {
  id: string;
  user_id: string;
  user_name: string;
  lesson_id: number;
  caller_name: string;
  caller_role: string;
  duration_seconds: number;
  messages_count: number;
  transcript: Array<{
    role: string;
    hebrew: string;
    translation?: string;
    transcription?: string;
  }>;
  feedback?: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  telegramId?: number;
  email?: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  gender: string;
  fontStyle: string;
  subscriptionTier: string;
  subscriptionExpiresAt?: number | null;
  createdAt: string;
  lastActiveAt: string;
  completedLessonsCount: number;
  maxLessonId: number;
  avgScore: number;
  vocabWordsCount: number;
}

interface PromoCode {
  id: string;
  code: string;
  daysValid: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

interface UserDetailData {
  user: AdminUser;
  progress: Array<{
    lessonId: number;
    completedTabs: string[];
    isCompleted: boolean;
    score: number;
    lastVisited: number;
    updatedAt: string;
  }>;
  vocabulary: Array<{
    id: string;
    hebrew: string;
    hebrewPlain: string;
    transcription?: string;
    translation: string;
    partOfSpeech: string;
    root?: string;
    lessonId: number;
    createdAt: string;
  }>;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'calls' | 'promos'>('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(true);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [calls, setCalls] = useState<AdminCallLog[]>([]);
  const [selectedCall, setSelectedCall] = useState<AdminCallLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [promos, setPromos] = useState<PromoCode[]>([]);

  // User details modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New Promo form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDays, setNewPromoDays] = useState('30');
  const [newPromoUses, setNewPromoUses] = useState('100');
  const [promoCreating, setPromoCreating] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sub action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 401 || res.status === 403) {
        setError('Доступ запрещен. Админ-панель доступна только для пользователя @osa_il.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setIsDbConnected(data.isDbConnected ?? true);
      setStats(data.stats || null);
      setRecentActivity(data.recentActivity || []);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки статистики');
    }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : '/api/admin/users';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchCalls = useCallback(async () => {
    try {
      let serverCalls: AdminCallLog[] = [];
      try {
        const res = await fetch('/api/admin/calls');
        if (res.ok) {
          const data = await res.json();
          serverCalls = data.calls || [];
        }
      } catch {}

      const localCalls = loadLocalCallLogs();
      const allCallsMap = new Map<string, AdminCallLog>();
      serverCalls.forEach((c) => allCallsMap.set(c.id, c));
      localCalls.forEach((c) => {
        if (!allCallsMap.has(c.id)) {
          allCallsMap.set(c.id, c as any);
        }
      });
      const combined = Array.from(allCallsMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setCalls(combined);
    } catch (e) {
      console.error(e);
      setCalls(loadLocalCallLogs() as any);
    }
  }, []);

  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promos');
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promos || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchUsers(), fetchCalls(), fetchPromos()]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchCalls, fetchPromos]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Load user details
  const handleOpenUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setUserDetail(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Change user subscription
  const handleSubscriptionAction = async (userId: string, action: 'grant_pro' | 'grant_vip' | 'revoke_pro', days = 30) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, days }),
      });
      if (res.ok) {
        await fetchUsers(searchQuery);
        if (selectedUserId === userId) {
          handleOpenUserDetail(userId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Create promo code
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    setPromoCreating(true);
    setPromoSuccess(null);
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromoCode,
          daysValid: parseInt(newPromoDays, 10),
          maxUses: parseInt(newPromoUses, 10),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoSuccess(`Промокод "${data.promo.code}" успешно создан!`);
        setNewPromoCode('');
        fetchPromos();
      } else {
        alert(data.error || 'Ошибка при создании промокода');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPromoCreating(false);
    }
  };

  // Toggle promo active
  const handleTogglePromo = async (id: string, currentActive: boolean) => {
    try {
      await fetch('/api/admin/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      fetchPromos();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete promo
  const handleDeletePromo = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот промокод?')) return;
    try {
      await fetch('/api/admin/promos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchPromos();
    } catch (e) {
      console.error(e);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white animate-pulse mb-4 shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium animate-pulse">
          Загрузка панели администратора...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Доступ ограничен
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {error}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться на главную</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition"
              title="Вернуться к курсу"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                  Панель администратора
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>osa_il</span>
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-medium hidden sm:block">
                Управление учениками, подписками и аналитика Ульпана
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* DB Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isDbConnected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isDbConnected ? 'PostgreSQL подключена' : 'Offline / Локальный'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadAllData}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition"
              title="Обновить данные"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Метрики & KPI</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ученики & Прогресс</span>
            {users.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'users' ? 'bg-blue-700 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                {users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'calls'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Логи звонков ИИ</span>
            {calls.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'calls' ? 'bg-blue-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'}`}>
                {calls.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'promos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Промокоды & Оплаты</span>
            {promos.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'promos' ? 'bg-blue-700 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                {promos.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: STATS & DASHBOARD */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Всего учеников</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {stats?.totalUsers || 0}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <span>+{stats?.todayUsers || 0} сегодня</span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span>+{stats?.weekUsers || 0} за 7 дней</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">PRO Подписки</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-amber-500">
                    {stats?.proUsers || 0}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium mt-1">
                    {stats?.totalUsers
                      ? `${Math.round(((stats.proUsers || 0) / stats.totalUsers) * 100)}% от всех учеников`
                      : '0%'}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Пройдено уроков</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {stats?.totalCompletedLessons || 0}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium mt-1">
                    Суммарно по всем 80 урокам курса
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Активные за неделю</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                    {stats?.activeUsersWeek || 0}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                    Занимались за последние 7 дней
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                    Лента активности учеников в реальном времени
                  </h2>
                </div>
                <span className="text-xs text-zinc-400">Последние 10 действий</span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-sm">
                  Активности пока не зафиксировано. Как только ученики начнут проходить уроки, данные появятся здесь.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Ученик</th>
                        <th className="px-5 py-3.5">Урок</th>
                        <th className="px-5 py-3.5">Статус</th>
                        <th className="px-5 py-3.5">Балл</th>
                        <th className="px-5 py-3.5">Время</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {recentActivity.map((act) => {
                        const lessonInfo = getLessonById(act.lessonId);
                        return (
                          <tr key={act.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                {act.userAvatar ? (
                                  <img
                                    src={act.userAvatar}
                                    alt={act.userName}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                    {act.userName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {act.userName}
                                  </div>
                                  {act.userUsername && (
                                    <div className="text-xs text-zinc-400">
                                      @{act.userUsername}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-medium">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                Урок {act.lessonId}
                              </span>
                              {lessonInfo && (
                                <span className="text-zinc-500 text-xs ml-1.5 hidden sm:inline">
                                  ({lessonInfo.titleRussian || lessonInfo.titleRu})
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              {act.isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Завершен</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>В процессе</span>
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 font-bold">
                              {act.score}%
                            </td>
                            <td className="px-5 py-3.5 text-zinc-400 text-xs">
                              {new Date(act.updatedAt).toLocaleString('ru-RU')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERS & PROGRESS */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Поиск ученика по имени, @username или Telegram ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchUsers(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              {users.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 text-sm">
                  {searchQuery ? 'Учеников по вашему запросу не найдено' : 'Список учеников пуст.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Ученик</th>
                        <th className="px-5 py-3.5">Тариф</th>
                        <th className="px-5 py-3.5">Пройдено уроков</th>
                        <th className="px-5 py-3.5">Слов в словаре</th>
                        <th className="px-5 py-3.5">Средний балл</th>
                        <th className="px-5 py-3.5">Посл. активность</th>
                        <th className="px-5 py-3.5 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {users.map((u) => {
                        const isPro = u.subscriptionTier === 'pro';
                        return (
                          <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {u.avatarUrl ? (
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.name}
                                    className="w-9 h-9 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.username?.toLowerCase() === 'osa_il' && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-600 text-white">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                    {u.username ? <span>@{u.username}</span> : <span>ID: {u.id}</span>}
                                    {u.telegramId && (
                                      <span className="text-[10px] text-zinc-500">
                                        (TG: {u.telegramId})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              {isPro ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-sm">
                                  <span>👑</span>
                                  <span>PRO</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  Бесплатный
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (u.completedLessonsCount / 80) * 100)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                                  {u.completedLessonsCount} / 80
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-3.5 font-medium">
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                {u.vocabWordsCount}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 font-bold">
                              {u.avgScore > 0 ? `${u.avgScore}%` : '—'}
                            </td>

                            <td className="px-5 py-3.5 text-zinc-400 text-xs">
                              {new Date(u.lastActiveAt).toLocaleDateString('ru-RU')}
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenUserDetail(u.id)}
                                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1"
                                >
                                  <span>Карточка</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>

                                {isPro ? (
                                  <button
                                    onClick={() => handleSubscriptionAction(u.id, 'revoke_pro')}
                                    disabled={actionLoading === u.id}
                                    className="px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold transition"
                                    title="Отозвать PRO"
                                  >
                                    Снять PRO
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSubscriptionAction(u.id, 'grant_pro', 30)}
                                    disabled={actionLoading === u.id}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                    title="Выдать PRO подписку на 30 дней"
                                  >
                                    <span>+ PRO 30д</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROMOS & PAYMENTS */}
        {activeTab === 'promos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Promo Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                  Создать новый промокод
                </h2>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Сгенерируйте уникальный промокод для акций в Telegram-канале или персональной выдачи ученикам.
              </p>

              {promoSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{promoSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreatePromo} className="flex flex-col gap-3.5 mt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                    Код промокода
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: SHALOM2026"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 font-mono font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                      Срок (дней)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      required
                      value={newPromoDays}
                      onChange={(e) => setNewPromoDays(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
                      Лимит активаций
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      required
                      value={newPromoUses}
                      onChange={(e) => setNewPromoUses(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={promoCreating}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{promoCreating ? 'Создание...' : 'Создать промокод'}</span>
                </button>
              </form>
            </div>

            {/* Promo Codes List */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                  Активные промокоды
                </h2>
                <span className="text-xs text-zinc-400">Всего: {promos.length}</span>
              </div>

              {promos.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 text-sm">
                  Промокодов пока нет. Создайте первый промокод в форме слева.
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Код</th>
                        <th className="px-5 py-3.5">Период PRO</th>
                        <th className="px-5 py-3.5">Использовано</th>
                        <th className="px-5 py-3.5">Статус</th>
                        <th className="px-5 py-3.5 text-right">Управление</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {promos.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                          <td className="px-5 py-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span>{p.code}</span>
                              <button
                                onClick={() => handleCopyCode(p.code)}
                                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                                title="Скопировать промокод"
                              >
                                {copiedCode === p.code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-5 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300">
                            {p.daysValid} дней
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                {p.usedCount} / {p.maxUses}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleTogglePromo(p.id, p.isActive)}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold transition ${
                                p.isActive
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {p.isActive ? 'Активен' : 'Отключен'}
                            </button>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDeletePromo(p.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                              title="Удалить промокод"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CALL LOGS */}
        {activeTab === 'calls' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  <span>История телефонных звонков с ИИ</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Полная стенограмма реальных голосовых разговоров учеников с AI-собеседником
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold text-xs">
                  Всего звонков: {calls.length}
                </span>
              </div>
            </div>

            {calls.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-400 text-sm">
                <Phone className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Звонков пока нет</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Как только вы или ученики совершите первый звонок в любом из 100 уроков, полная стенограмма разговора появится здесь.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {calls.map((call) => {
                  const lesson = getLessonById(call.lesson_id);
                  const isExpanded = selectedCall?.id === call.id;

                  return (
                    <div
                      key={call.id}
                      className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4 hover:border-blue-400/50 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                            📞
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                Урок {call.lesson_id}
                              </span>
                              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                {call.caller_name}
                              </span>
                              <span className="text-xs text-zinc-400">
                                ({call.caller_role})
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                              <span>Ученик: <strong className="text-zinc-700 dark:text-zinc-300">{call.user_name || 'Ученик'}</strong></span>
                              <span>•</span>
                              <span>{new Date(call.created_at).toLocaleString('ru-RU')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right text-xs">
                            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 block">
                              ⏱️ {Math.floor(call.duration_seconds / 60)}:{(call.duration_seconds % 60).toString().padStart(2, '0')}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              {call.messages_count} реплик
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedCall(isExpanded ? null : call)}
                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isExpanded ? 'Скрыть диалог' : 'Смотреть диалог'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Transcript */}
                      {isExpanded && (
                        <div className="pt-2 space-y-3">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Стенограмма разговора:
                          </h4>

                          <div className="space-y-2.5 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            {Array.isArray(call.transcript) && call.transcript.length > 0 ? (
                              call.transcript.map((msg: any, idx: number) => {
                                const isUser = msg.role === 'user';
                                return (
                                  <div
                                    key={idx}
                                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                  >
                                    <div
                                      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm ${
                                        isUser
                                          ? 'bg-emerald-600 text-white rounded-tr-xs'
                                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-xs shadow-xs'
                                      }`}
                                    >
                                      <div className="font-bold text-xs opacity-75 mb-1 font-sans">
                                        {isUser ? 'Ученик (голос)' : call.caller_name}
                                      </div>
                                      <div className="font-hebrew font-bold text-base leading-relaxed">
                                        {msg.hebrew}
                                      </div>
                                      {msg.transcription && (
                                        <div className="text-[11px] opacity-85 font-mono mt-0.5">
                                          {msg.transcription}
                                        </div>
                                      )}
                                      {msg.translation && (
                                        <div className="text-xs opacity-90 mt-1">
                                          {msg.translation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-zinc-400 text-center py-2">
                                Нет текстовых записей
                              </div>
                            )}
                          </div>

                          {call.feedback && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                              <span>Подсказка грамматики: {call.feedback}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: USER DETAIL PROGRESS CARD */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                  {userDetail?.user.name.charAt(0).toUpperCase() || 'У'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">
                    Карточка ученика: {userDetail?.user.name}
                  </h3>
                  <div className="text-xs text-zinc-400">
                    {userDetail?.user.username ? `@${userDetail.user.username}` : userDetail?.user.id}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setUserDetail(null);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {loadingDetail ? (
                <div className="py-12 text-center text-zinc-400 text-sm animate-pulse">
                  Загрузка данных ученика...
                </div>
              ) : userDetail ? (
                <>
                  {/* Quick Student Stats */}
                  <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                    <div>
                      <div className="text-xs text-zinc-400 font-medium">Статус</div>
                      <div className="text-sm font-bold mt-0.5 text-zinc-900 dark:text-zinc-100">
                        {userDetail.user.subscriptionTier === 'pro' ? '👑 PRO' : 'Бесплатный'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 font-medium">Пройдено уроков</div>
                      <div className="text-sm font-bold mt-0.5 text-blue-600 dark:text-blue-400">
                        {userDetail.progress.filter((p) => p.isCompleted).length} / 80
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 font-medium">Слов в словаре</div>
                      <div className="text-sm font-bold mt-0.5 text-amber-500">
                        {userDetail.vocabulary.length}
                      </div>
                    </div>
                  </div>

                  {/* Lessons Progress Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Пройденные уроки и этапы</span>
                    </h4>

                    {userDetail.progress.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 text-center text-zinc-400 text-xs">
                        Ученик еще не начал прохождение уроков.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {userDetail.progress.map((p) => {
                          const lesson = getLessonById(p.lessonId);
                          return (
                            <div
                              key={p.lessonId}
                              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                  Урок {p.lessonId}: {lesson?.titleRussian || lesson?.titleRu || 'Урок курса'}
                                </span>
                                <div className="text-[11px] text-zinc-400 mt-0.5">
                                  Вкладки: {p.completedTabs.join(', ') || 'нет данных'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-bold">{p.score}%</span>
                                {p.isCompleted ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-[10px]">
                                    Завершен
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold text-[10px]">
                                    В процессе
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Vocabulary Added */}
                  {userDetail.vocabulary.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Слова в личном словарике ({userDetail.vocabulary.length})</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {userDetail.vocabulary.map((w) => (
                          <div
                            key={w.id}
                            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col text-xs"
                          >
                            <span dir="rtl" className="font-hebrew font-bold text-sm text-blue-600 dark:text-blue-400">
                              {w.hebrew}
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                              {w.translation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {userDetail?.user.subscriptionTier !== 'pro' ? (
                  <button
                    onClick={() => userDetail && handleSubscriptionAction(userDetail.user.id, 'grant_pro', 30)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                  >
                    <span>Выдать PRO на 30 дней</span>
                  </button>
                ) : (
                  <button
                    onClick={() => userDetail && handleSubscriptionAction(userDetail.user.id, 'revoke_pro')}
                    className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 text-xs font-bold transition"
                  >
                    <span>Отозвать PRO</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setUserDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
