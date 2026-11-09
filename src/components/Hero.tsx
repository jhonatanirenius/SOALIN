import React from 'react';
import { 
  Play, 
  Trophy, 
  Sparkles, 
  Layers, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  BookOpenCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  onStartPractice: () => void;
  onStartTryout: () => void;
  onViewProgress: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartPractice,
  onStartTryout,
  onViewProgress
}) => {
  const { profile, progress } = useAuth();

  const totalQuestions = progress?.total_questions || 0;
  const correctAnswers = progress?.correct_answers || 0;
  const completedQuizzes = progress?.total_completed_quizzes || 0;
  const computedXp = (totalQuestions * 15) + (correctAnswers * 25) + (completedQuizzes * 100);
  const totalStudyMinutes = Math.round((progress?.total_study_time || 0) / 60);
  const streakDays = progress?.current_streak || 0;
  const targetCategory = profile?.target_category || 'CPNS & Kedinasan';

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Subtle decorative grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Column */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Platform Bank Soal & Tryout Terlengkap #1 Indonesia</span>
            </div>

            {/* Judul Besar Sesuai Prompt */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Latihan. Uji Diri.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Jadi Lebih Siap.
              </span>
            </h1>

            {/* Subjudul Sesuai Prompt */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Ribuan soal latihan untuk sekolah, ujian masuk, CPNS, TNI, Polri, dan berbagai seleksi lainnya. Lengkap dengan pembahasan langkah demi langkah, trik cepat, dan AI Tutor edukatif.
            </p>

            {/* CTA Buttons Sesuai Prompt */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                id="btn-hero-start-practice"
                onClick={onStartPractice}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Latihan</span>
              </button>

              <button
                id="btn-hero-tryout-now"
                onClick={onStartTryout}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 border border-slate-300 dark:border-slate-700 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Tryout Sekarang</span>
              </button>
            </div>

            {/* Official standards note */}
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Format CAT BKN, Standar Psikotes TNI-Polri & Kurikulum Merdeka</span>
            </p>
          </div>

          {/* Right Statistics & User Progress Card Sesuai Prompt */}
          <div className="lg:col-span-5">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-5">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Statistik Platform & Progres
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Data Latihan Terverifikasi
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* 4 Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3.5 mb-5">
                {/* 10.000+ Soal */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium">Bank Soal</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    10.000+
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Soal Berpembahasan
                  </div>
                </div>

                {/* 20+ Kategori */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-medium">Kategori</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    20+
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Akademik & Seleksi
                  </div>
                </div>

                {/* 100+ Tryout */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-medium">Paket Tryout</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    100+
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sistem Timer CAT
                  </div>
                </div>

                {/* Progress Pengguna */}
                <div 
                  onClick={onViewProgress}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                    <div className="flex items-center gap-1.5">
                      <BookOpenCheck className="w-4 h-4" />
                      <span className="text-xs font-medium">Progress Kamu</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {computedXp} XP
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {totalStudyMinutes} menit belajar
                  </div>
                </div>
              </div>

              {/* Progress Bar & Quick Goal */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Target: {targetCategory}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Streak {streakDays} Hari 🔥
                  </span>
                </div>
                <div className="w-full h-2 bg-indigo-200/60 dark:bg-indigo-900/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, (computedXp / 1500) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Level: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{totalQuestions > 50 ? 'Pejuang Tangguh' : 'Pemula'}</strong></span>
                  <button 
                    onClick={onViewProgress} 
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Buka Rapor Lengkap →
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
