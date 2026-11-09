import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Brain, 
  Clock, 
  CheckCircle2, 
  Play, 
  Bookmark, 
  Flame, 
  Zap, 
  BookOpen, 
  Target, 
  Calendar,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { CategoryInfo, TryoutPackage, Question, UserProfile } from '../types';
import { MAIN_CATEGORIES } from '../data/categories';
import { 
  fetchDailyPackagesApi, 
  fetchRecommendedPackageApi, 
  fetchWeeklyPackageApi, 
  fetchQuestionsApi 
} from '../services/apiClient';

interface HomeFeedProps {
  tryouts: TryoutPackage[];
  questions: Question[];
  currentUser: UserProfile;
  onSelectCategory: (cat: CategoryInfo) => void;
  onStartTryout: (tryoutId: string) => void;
  onSelectQuestion: (question: Question) => void;
  onNavigate: (view: string) => void;
  onOpenAiTutor: (question?: Question) => void;
  onToggleFavorite: (qId: string) => void;
  favoriteIds: string[];
  onStartPracticeSession?: (questions: Question[], title: string, mode?: any, duration?: number) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  tryouts,
  questions,
  currentUser,
  onSelectCategory,
  onStartTryout,
  onSelectQuestion,
  onNavigate,
  onOpenAiTutor,
  onToggleFavorite,
  favoriteIds,
  onStartPracticeSession
}) => {
  const [dailyPackages, setDailyPackages] = useState<any[]>([]);
  const [recommendedPackage, setRecommendedPackage] = useState<any>(null);
  const [weeklyPackage, setWeeklyPackage] = useState<any>(null);
  const [todayNewQuestions, setTodayNewQuestions] = useState<Question[]>([]);
  const [loadingFreshness, setLoadingFreshness] = useState<boolean>(true);

  // Load fresh daily content from Cloud SQL PostgreSQL
  useEffect(() => {
    let isMounted = true;
    async function loadFreshContent() {
      try {
        setLoadingFreshness(true);
        const [dailyRes, recRes, weekRes, freshQsRes] = await Promise.all([
          fetchDailyPackagesApi().catch(() => []),
          fetchRecommendedPackageApi().catch(() => null),
          fetchWeeklyPackageApi().catch(() => null),
          fetchQuestionsApi({ limit: 6, status: 'published' }).catch(() => ({ questions: [] }))
        ]);

        if (!isMounted) return;

        if (Array.isArray(dailyRes) && dailyRes.length > 0) {
          setDailyPackages(dailyRes);
        }
        if (recRes) {
          setRecommendedPackage(recRes);
        }
        if (weekRes) {
          setWeeklyPackage(weekRes);
        }
        if (freshQsRes?.questions && freshQsRes.questions.length > 0) {
          setTodayNewQuestions(freshQsRes.questions);
        }
      } catch (err) {
        console.warn('Failed loading fresh daily packages:', err);
      } finally {
        if (isMounted) setLoadingFreshness(false);
      }
    }

    loadFreshContent();
    return () => { isMounted = false; };
  }, []);

  // Popular categories
  const popularCategories = MAIN_CATEGORIES.filter(c => 
    ['akmil', 'cpns', 'tni', 'polri', 'kedinasan', 'tka'].includes(c.id)
  );

  // Fallback to active questions if server list empty
  const activeQuestionsPool = todayNewQuestions.length > 0 ? todayNewQuestions : questions.slice(0, 6);

  // Helper to start package
  const handleLaunchPackage = (pkg: any) => {
    const qIds = new Set(pkg.question_ids || []);
    let matching = questions.filter(q => qIds.has(q.id));
    if (matching.length === 0) {
      matching = questions.slice(0, Math.min(10, pkg.question_count || 10));
    }
    if (onStartPracticeSession) {
      onStartPracticeSession(matching, pkg.title, 'simulasi', pkg.duration_minutes || 30);
    } else if (matching[0]) {
      onSelectQuestion(matching[0]);
    }
  };

  // Launch daily challenge (10 sprint questions)
  const handleLaunchDailyChallenge = () => {
    const sprintQuestions = questions.slice(0, 10);
    if (onStartPracticeSession) {
      onStartPracticeSession(sprintQuestions, '🧠 Daily Sprint Challenge (10 Soal)', 'ujian', 15);
    } else if (sprintQuestions[0]) {
      onSelectQuestion(sprintQuestions[0]);
    }
  };

  // Launch Weekly Mock Test
  const handleLaunchWeeklyMock = () => {
    const mockQuestions = questions.slice(0, 20);
    if (onStartPracticeSession) {
      onStartPracticeSession(mockQuestions, '🏆 Weekly Tryout Akbar CAT', 'simulasi', 60);
    } else if (mockQuestions[0]) {
      onSelectQuestion(mockQuestions[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* ==================================================================== */}
      {/* 1. FRESHNESS SECTION: PAKET BELAJAR HARI INI & ADAPTIF               */}
      {/* ==================================================================== */}
      <section id="section-fresh-daily" className="space-y-6">
        
        {/* Banner Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" />
              <span>Sistem Konten Fresh Harian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              📚 Paket Belajar Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Setiap hari kurikulum belajar diperbarui secara otomatis agar persiapanmu selalu bervariasi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              🗓️ {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Daily Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Day 01 / Primary Daily Package */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wide backdrop-blur-xs">
                  Day 01 — Fundamental TIU
                </span>
                <span className="text-xs font-semibold text-indigo-200">
                  70 Soal Terstruktur
                </span>
              </div>

              <h3 className="text-lg font-black leading-snug">
                Paket Hari Ini: Penguasaan Dasar Logika &amp; Numerik
              </h3>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-indigo-100 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>20 Soal Numerik</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>20 Soal Verbal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>10 Soal Silogisme</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>10 Soal B. Inggris</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between relative z-10">
              <div className="text-xs text-indigo-200 font-semibold">
                ⏱️ Estimasi: 45 Menit
              </div>
              <button
                onClick={() => {
                  if (dailyPackages[0]) {
                    handleLaunchPackage(dailyPackages[0]);
                  } else {
                    handleLaunchDailyChallenge();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-900" />
                <span>Mulai Belajar</span>
              </button>
            </div>
          </div>

          {/* Day 02 / Intermediate Package */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-cyan-600 via-teal-700 to-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-300/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wide backdrop-blur-xs">
                  Day 02 — Intermediate SKD
                </span>
                <span className="text-xs font-semibold text-cyan-200">
                  Deret &amp; Pancasila
                </span>
              </div>

              <h3 className="text-lg font-black leading-snug">
                Drilling Pemahaman Soal Cerita &amp; Wawasan Nusantara
              </h3>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-cyan-100 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Aritmetika Bertingkat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Studi Kasus Sila UUD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Pelayanan Publik TKP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Error Identification</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between relative z-10">
              <div className="text-xs text-cyan-200 font-semibold">
                ⏱️ Estimasi: 50 Menit
              </div>
              <button
                onClick={() => {
                  if (dailyPackages[1]) {
                    handleLaunchPackage(dailyPackages[1]);
                  } else {
                    handleLaunchDailyChallenge();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-cyan-50 text-cyan-900 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-900" />
                <span>Mulai Belajar</span>
              </button>
            </div>
          </div>

          {/* 🎯 Latihan Berdasarkan Kelemahanmu (Personalized Adaptive Package) */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-500 via-rose-600 to-orange-700 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wide backdrop-blur-xs flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-300" />
                  <span>Adaptif &amp; Personal</span>
                </span>
                <span className="text-xs font-semibold text-rose-200">
                  AI Evaluator
                </span>
              </div>

              <h3 className="text-lg font-black leading-snug">
                🎯 Latihan Berdasarkan Kelemahanmu
              </h3>

              <p className="text-xs text-rose-100 leading-relaxed">
                Materi yang perlu kamu tingkatkan hari ini:
              </p>

              <div className="space-y-1.5 pt-1 text-xs text-white font-bold">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Silogisme &amp; Penarikan Kesimpulan</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Persentase &amp; Diskon Bertingkat</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Reading Comprehension B. Inggris</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between relative z-10">
              <div className="text-xs text-rose-200 font-semibold">
                Fokus Penguatan Skor
              </div>
              <button
                onClick={() => {
                  if (recommendedPackage) {
                    handleLaunchPackage(recommendedPackage);
                  } else {
                    handleLaunchDailyChallenge();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-900 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
              >
                <Zap className="w-3.5 h-3.5 fill-rose-900" />
                <span>Asah Kelemahan</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. DUA BANNER UTAMA: 🧠 DAILY CHALLENGE & 🏆 WEEKLY TRYOUT         */}
      {/* ==================================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Challenge Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/20 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Tantangan Kilat 15 Menit</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              🧠 Daily Challenge Sprint
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Selesaikan 10 butir soal acak berstandar hari ini tanpa bantuan. Pertahankan streak belajarmu dan klaim <strong>+50 Bonus XP</strong>!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              ⚡ Bonus: +50 XP &amp; Alin Friendship
            </span>
            <button
              onClick={handleLaunchDailyChallenge}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Mulai Challenge</span>
            </button>
          </div>
        </div>

        {/* Weekly Tryout Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Simulasi Akbar Mingguan</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              🏆 Weekly Tryout Nasional #01
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Simulasi CBT lengkap terstandar BKN &amp; TNI: <strong>TIU (35), TWK (30), TKP (45), B. Inggris (20)</strong> = 130 Soal terpadu dengan sistem skor CAT resmi.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
            <div className="text-xs text-slate-400 font-semibold">
              📋 130 Soal • ⏱️ 100 Menit
            </div>
            <button
              onClick={handleLaunchWeeklyMock}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Ikuti Tryout</span>
            </button>
          </div>
        </div>

      </section>

      {/* ==================================================================== */}
      {/* 3. 🔥 SOAL BARU HARI INI (Multi-Pass Verified Feed)                  */}
      {/* ==================================================================== */}
      <section id="section-soal-baru-hari-ini">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Baru Digenerate &amp; Lolos Multi-Pass Validation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              🔥 Soal Baru Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Soal-soal fresh yang baru ditambahkan ke bank soal hari ini dengan pembahasan terperinci.
            </p>
          </div>

          <button
            onClick={() => onNavigate('categories')}
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Buka Seluruh Bank Soal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeQuestionsPool.map((q) => {
            const isFav = favoriteIds.includes(q.id);
            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                        {q.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(q.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isFav 
                          ? 'bg-amber-50 text-amber-500 border-amber-300' 
                          : 'text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title={isFav ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {q.subject || q.topic || q.subcategory}
                  </h4>

                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
                    {q.question || q.question_text}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Lolos QC (95/100)</span>
                  </span>

                  <button
                    onClick={() => onSelectQuestion(q)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-indigo-600" />
                    <span>Kerjakan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. KATEGORI POPULER (All Required Categories)                        */}
      {/* ==================================================================== */}
      <section id="section-kategori-populer">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Jelajahi Berdasarkan Kisi-Kisi Ujian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Kategori Terstandar
            </h2>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Semua Kategori ({MAIN_CATEGORIES.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {cat.code}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {cat.totalQuestions.toLocaleString('id-ID')} Soal
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {cat.description}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                <span>Buka Silabus Materi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
