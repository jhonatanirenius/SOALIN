import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Target, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  User, 
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { UserProfile } from '../types';
import { fetchLeaderboardApi } from '../services/apiClient';

interface LeaderboardProps {
  currentUser: UserProfile;
  onNavigate: (view: string) => void;
  onStartPractice: () => void;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  xp: number;
  totalQuestions: number;
  totalCorrect: number;
  totalTryouts: number;
  streak: number;
  accuracy: number;
  targetCategory: string;
}

type TimeframeType = 'today' | 'week' | 'month' | 'all';

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Semua Kategori (Global)' },
  { id: 'CPNS', label: 'CPNS & PPPK' },
  { id: 'Kedinasan', label: 'Sekolah Kedinasan' },
  { id: 'TNI', label: 'TNI & POLRI' },
  { id: 'UTBK', label: 'UTBK - SNBT' },
  { id: 'BUMN', label: 'BUMN' },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  onNavigate,
  onStartPractice,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      setIsLoading(true);
      const res = await fetchLeaderboardApi({
        timeframe,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        page,
        limit: 20,
        userId: currentUser.id,
      });

      if (res.success) {
        setLeaderboard(res.leaderboard || []);
        setCurrentUserRank(res.currentUserRank || null);
        setTotalUsers(res.totalUsers || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.warn('Failed to load leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, selectedCategory, page, currentUser.id]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const filteredEntries = leaderboard.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.name.toLowerCase().includes(q) ||
      entry.username.toLowerCase().includes(q) ||
      entry.targetCategory.toLowerCase().includes(q)
    );
  });

  const top3 = leaderboard.slice(0, 3);

  // Helper for rank badge styling
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center font-black text-base shadow-md shadow-amber-500/30 border border-amber-300">
          <span className="leading-none">🥇</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-slate-300 via-slate-200 to-slate-100 text-slate-800 flex items-center justify-center font-black text-base shadow-md shadow-slate-400/20 border border-slate-300">
          <span className="leading-none">🥈</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-700 via-amber-600 to-orange-400 text-white flex items-center justify-center font-black text-base shadow-md shadow-amber-700/20 border border-amber-500">
          <span className="leading-none">🥉</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700">
        #{rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 pt-4 transition-colors">
      {/* Decorative Top Gradient */}
      <div className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-8 sm:py-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold mb-3 shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Peringkat Belajar Nasional • Database Real-time</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                🏆 Leaderboard{' '}
                <span className="bg-gradient-to-r from-amber-500 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-cyan-400">
                  SOALIN
                </span>
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Peringkat dihitung murni dari XP validasi server: pengerjaan soal latihan, akurasi jawaban, penyelesaian CBT tryout, dan konsistensi streak harian.
              </p>
            </div>

            {/* Quick Action / Real-time Status Card */}
            <div className="flex items-center gap-3">
              <button
                id="btn-refresh-leaderboard"
                onClick={() => loadLeaderboard(true)}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Menyinkronkan...' : 'Segarkan Peringkat'}</span>
              </button>

              <button
                id="btn-leaderboard-start-practice"
                onClick={onStartPractice}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Kejar XP Sekarang</span>
              </button>
            </div>
          </div>

          {/* Timeframe Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Hari Ini', icon: Clock },
              { id: 'week', label: 'Minggu Ini', icon: Calendar },
              { id: 'month', label: 'Bulan Ini', icon: TrendingUp },
              { id: 'all', label: 'Sepanjang Waktu', icon: Trophy },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = timeframe === t.id;
              return (
                <button
                  key={t.id}
                  id={`filter-timeframe-${t.id}`}
                  onClick={() => {
                    setTimeframe(t.id as TimeframeType);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-102'
                      : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Filters & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          {/* Target Exam Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Target Ujian:
            </span>
            <select
              id="select-leaderboard-category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search within Leaderboard */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Podium for Top 3 (on first page) */}
        {page === 1 && top3.length >= 3 && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
            {/* Rank 2 (Silver) */}
            <div className="order-2 md:order-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700/80 shadow-lg text-center relative hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-black border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                <span>🥈</span> Rank #2
              </div>
              <div className="relative w-16 h-16 mx-auto mt-2 mb-3">
                {top3[1].avatarUrl ? (
                  <img
                    src={top3[1].avatarUrl}
                    alt={top3[1].name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 dark:border-slate-600 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xl flex items-center justify-center">
                    {top3[1].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                {top3[1].name}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {top3[1].username}
              </p>
              <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 inline-block">
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {top3[1].xp.toLocaleString('id-ID')} XP
                </span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {top3[1].streak} hari
                </span>
                <span>•</span>
                <span className="font-semibold">{top3[1].accuracy}% Akurasi</span>
              </div>
            </div>

            {/* Rank 1 (Gold - Center & Elevated) */}
            <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 dark:from-slate-850 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-400 dark:border-amber-500/80 shadow-2xl text-center relative hover:-translate-y-1.5 transition-transform">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-md border border-amber-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                <span>🥇 JUARA 1 NASIONAL</span>
              </div>
              <div className="relative w-20 h-20 mx-auto mt-2 mb-3">
                {top3[0].avatarUrl ? (
                  <img
                    src={top3[0].avatarUrl}
                    alt={top3[0].name}
                    className="w-20 h-20 rounded-2xl object-cover border-3 border-amber-400 shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center">
                    {top3[0].name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 text-xl">👑</span>
              </div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">
                {top3[0].name}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate mt-0.5">
                {top3[0].username}
              </p>
              <div className="mt-3 py-2 px-4 rounded-xl bg-amber-500/15 border border-amber-400/40 inline-block">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {top3[0].xp.toLocaleString('id-ID')} XP
                </span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                  {top3[0].streak} hari streak
                </span>
                <span>•</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {top3[0].accuracy}% Akurasi
                </span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-600/60 dark:border-amber-700/60 shadow-lg text-center relative hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-black border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <span>🥉</span> Rank #3
              </div>
              <div className="relative w-16 h-16 mx-auto mt-2 mb-3">
                {top3[2].avatarUrl ? (
                  <img
                    src={top3[2].avatarUrl}
                    alt={top3[2].name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600/60 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-700 text-white font-black text-xl flex items-center justify-center">
                    {top3[2].name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                {top3[2].name}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {top3[2].username}
              </p>
              <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 inline-block">
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {top3[2].xp.toLocaleString('id-ID')} XP
                </span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {top3[2].streak} hari
                </span>
                <span>•</span>
                <span className="font-semibold">{top3[2].accuracy}% Akurasi</span>
              </div>
            </div>
          </div>
        )}

        {/* Complete Ranking List Table / Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Daftar Peringkat Peserta</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total {totalUsers} pembelajar terdaftar • Menampilkan halaman {page} dari {totalPages}
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
              Filter: <strong className="text-indigo-600 dark:text-indigo-400">{timeframe === 'all' ? 'Sepanjang Waktu' : timeframe === 'today' ? 'Hari Ini' : timeframe === 'week' ? 'Minggu Ini' : 'Bulan Ini'}</strong>
            </div>
          </div>

          {/* List Entries */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-600 mb-3" />
              <p className="text-sm font-semibold">Memuat data peringkat terbaru dari Cloud SQL...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Trophy className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada aktivitas di periode ini</p>
              <p className="text-xs text-slate-500 mt-1">Jadilah yang pertama mengumpulkan XP dengan mengerjakan latihan soal!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.map((user) => {
                const isCurrentUser = user.userId === currentUser.id;
                return (
                  <div
                    key={`${user.userId}-${user.rank}`}
                    className={`p-3.5 sm:p-4.5 flex items-center justify-between gap-3 transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                    }`}
                  >
                    {/* Rank Badge & Profile Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {renderRankBadge(user.rank)}

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        {isCurrentUser && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Names & Metadata */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {user.name}
                          </h3>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black shrink-0">
                              Kamu
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-mono text-slate-400 dark:text-slate-500">
                            {user.username}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline text-[11px] truncate max-w-[200px]">
                            {user.targetCategory}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & XP */}
                    <div className="flex items-center gap-3 sm:gap-6 text-right shrink-0">
                      {/* Secondary metrics (hidden on very small phones) */}
                      <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="text-center">
                          <span className="font-bold text-slate-700 dark:text-slate-200 block">
                            {user.totalQuestions}
                          </span>
                          <span className="text-[10px]">Soal</span>
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                            {user.accuracy}%
                          </span>
                          <span className="text-[10px]">Akurasi</span>
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                            {user.totalTryouts}
                          </span>
                          <span className="text-[10px]">Tryout</span>
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{user.streak}d</span>
                      </div>

                      {/* Main XP Badge */}
                      <div className="min-w-[70px] sm:min-w-[90px] text-right">
                        <span className="text-sm sm:text-base font-black font-mono text-indigo-600 dark:text-indigo-400 block">
                          {user.xp.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Halaman <strong className="text-indigo-600 dark:text-indigo-400">{page}</strong> dari {totalPages}
              </span>

              <button
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STICKY / FLOATING CURRENT USER BAR AT BOTTOM (Prompt Requirement) */}
      {currentUserRank && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 px-3 sm:px-6 pointer-events-none">
          <div className="max-w-4xl mx-auto bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 pointer-events-auto animate-in slide-in-from-bottom-3 duration-300">
            {/* User Info & Rank */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 border border-indigo-400 shadow-sm">
                #{currentUserRank.rank}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    👤 {currentUserRank.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shrink-0">
                    Posisi Kamu
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-amber-400">
                    #{currentUserRank.rank}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {currentUserRank.xp.toLocaleString('id-ID')} XP
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 font-medium flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    {currentUserRank.streak} hari
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Practice CTA to Boost Rank */}
            <div className="shrink-0">
              <button
                id="btn-floating-boost-rank"
                onClick={onStartPractice}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Tambah XP</span>
                <span className="sm:hidden">+XP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
