import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Target, 
  Play,
  ArrowUpRight,
  RotateCcw,
  Calendar,
  Database
} from 'lucide-react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';
import { getLevelInfo } from '../data/badges';

interface ProgressDashboardProps {
  allQuestions: Question[];
  onStartTargetPractice: (topicName: string) => void;
  onRetakeWrongQuestions: (questions: Question[]) => void;
  onOpenLevelXP: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  allQuestions,
  onStartTargetPractice,
  onRetakeWrongQuestions,
  onOpenLevelXP
}) => {
  const { profile, progress, quizHistory, questionAttempts, dailyActivities } = useAuth();

  const totalQuestions = progress?.total_questions || 0;
  const correctAnswers = progress?.correct_answers || 0;
  const wrongAnswers = progress?.wrong_answers || 0;
  const accuracy = progress?.accuracy || 0;
  const totalStudySeconds = progress?.total_study_time || 0;
  const studyHours = Math.floor(totalStudySeconds / 3600);
  const studyMins = Math.floor((totalStudySeconds % 3600) / 60);
  const streakDays = progress?.current_streak || 0;
  const longestStreak = progress?.longest_streak || 0;
  const totalCompletedQuizzes = progress?.total_completed_quizzes || 0;
  const bestScore = progress?.best_score || 0;
  const averageScore = progress?.average_score || 0;

  // Real XP derived from Cloud SQL persistent data
  const computedXp = (totalQuestions * 15) + (correctAnswers * 25) + (totalCompletedQuizzes * 100);
  const { current: levelInfo, progressPercent } = getLevelInfo(computedXp);

  // Wrong questions filtered from actual question attempts
  const wrongAttemptIds = new Set(
    questionAttempts.filter(qa => !qa.is_correct).map(qa => qa.question_id)
  );
  const wrongQuestions = allQuestions.filter(q => wrongAttemptIds.has(q.id));

  // Category accuracy derived from user's actual attempts
  const categoryStats: Record<string, { total: number; correct: number }> = {};
  questionAttempts.forEach(qa => {
    const qObj = allQuestions.find(q => q.id === qa.question_id);
    const cat = qObj?.category || 'Umum';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, correct: 0 };
    }
    categoryStats[cat].total += 1;
    if (qa.is_correct) categoryStats[cat].correct += 1;
  });

  const competencyList = Object.entries(categoryStats).map(([cat, stat]) => {
    const acc = Math.round((stat.correct / stat.total) * 100);
    let status = 'Kuasai';
    if (acc < 65) status = 'Perlu Ditingkatkan';
    else if (acc < 80) status = 'Cukup';
    return { name: cat, accuracy: acc, total: stat.total, status };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & User Hero Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 mb-2">
            <Database className="w-3.5 h-3.5 text-cyan-500" />
            <span>Tersinkronisasi Cloud SQL (PostgreSQL)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Rapor & Progres Belajar Pribadi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data autentik aktivitas pengerjaan soal dan tryout akun <strong>{profile?.full_name}</strong> ({profile?.email}).
          </p>
        </div>

        {/* Level XP Quick Trigger */}
        <button
          onClick={onOpenLevelXP}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left cursor-pointer"
        >
          <div className="text-2xl">{levelInfo.badge}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Level: {levelInfo.name}</span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                {computedXp} XP
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Lihat Badge & Gamifikasi →</span>
          </div>
        </button>
      </div>

      {/* Zero Progress Banner if completely new */}
      {totalQuestions === 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Belum ada data pengerjaan soal
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
              Akun Anda bersih dari data palsu. Selesaikan minimal 5 soal per hari atau 1 sesi tryout untuk menaikkan streak dan mencatat rapor belajar resmi Anda.
            </p>
          </div>
          <button
            onClick={() => onStartTargetPractice('TIU')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shrink-0 shadow-md transition-all cursor-pointer"
          >
            Mulai Latihan Sekarang
          </button>
        </div>
      )}

      {/* 8 Metric Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Soal Dikerjakan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Soal Dikerjakan</span>
            <Target className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalQuestions}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Tersimpan di Cloud Database
          </span>
        </div>

        {/* Akurasi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase">Tingkat Akurasi</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {accuracy}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {correctAnswers} Benar / {wrongAnswers} Salah
          </span>
        </div>

        {/* Waktu Belajar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-bold uppercase">Waktu Belajar</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {studyHours}j {studyMins}m
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Durasi Latihan Riil
          </span>
        </div>

        {/* Streak Belajar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-xs font-bold uppercase">Streak Belajar</span>
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {streakDays} Hari
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            Rekor Tertinggi: {longestStreak} Hari
          </span>
        </div>

        {/* Tryout yang Diselesaikan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
            <span className="text-xs font-bold uppercase">Tryout Selesai</span>
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalCompletedQuizzes} Paket
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Sesi CBT Lengkap
          </span>
        </div>

        {/* Nilai Terbaik */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-xs font-bold uppercase">Nilai Terbaik</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {bestScore}
          </div>
          <span className="text-[11px] text-teal-600 font-medium mt-1 block">
            Skor Tertinggi Tryout
          </span>
        </div>

        {/* Nilai Rata-rata */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
            <span className="text-xs font-bold uppercase">Nilai Rata-Rata</span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {averageScore}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Rerata Hasil Simulasi
          </span>
        </div>

        {/* Bank Soal Salah */}
        <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold uppercase">Soal Pernah Salah</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {wrongQuestions.length}
          </div>
          {wrongQuestions.length > 0 ? (
            <button
              onClick={() => onRetakeWrongQuestions(wrongQuestions)}
              className="text-[11px] text-rose-700 dark:text-rose-300 font-bold hover:underline mt-1 block cursor-pointer"
            >
              Latih Ulang Soal Salah →
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Belum ada soal salah
            </span>
          )}
        </div>
      </div>

      {/* Riwayat Tryout & Grafik Aktivitas Harian */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Tryout Terakhir */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Riwayat Tryout Resmi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data hasil tes yang tersimpan di PostgreSQL
              </p>
            </div>
            <Trophy className="w-5 h-5 text-indigo-500" />
          </div>

          {quizHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <p>Belum ada riwayat tryout yang diselesaikan.</p>
              <p className="text-[11px] text-slate-500">Mulai salah satu paket di tab "Tryout" untuk mencatat rekor pertama Anda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizHistory.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {q.quiz_title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{q.total_questions} Soal</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{q.correct_answers} Benar</span>
                      <span>•</span>
                      <span className="text-rose-600 dark:text-rose-400">{q.wrong_answers} Salah</span>
                      <span>•</span>
                      <span>{Math.round(q.duration / 60)} mnt</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                      Skor {q.score}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(q.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aktivitas Harian untuk Streak */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Catatan Aktivitas Harian
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Syarat streak: minimal 5 soal / 1 tryout per hari
              </p>
            </div>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>

          {dailyActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <p>Belum ada log aktivitas harian.</p>
              <p className="text-[11px] text-slate-500">Kerjakan soal hari ini untuk mencatat tanggal aktif!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dailyActivities.slice(0, 5).map((act) => {
                const meetsGoal = act.questions_answered >= 5 || act.completed_session >= 1;
                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {act.activity_date}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {act.questions_answered} soal dikerjakan ({act.correct_answers} benar)
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      meetsGoal 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {meetsGoal ? '✓ Memenuhi Streak' : `${act.questions_answered}/5 Soal`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Analisis Bidang Kompetensi Riil */}
      {competencyList.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Analisis Performa Berdasarkan Kategori Soal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dihitung dari riwayat jawaban nyata yang tersimpan di akun Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {competencyList.map((c) => (
              <div
                key={c.name}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {c.name}
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 dark:text-slate-400">{c.total} Soal Dikerjakan</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{c.accuracy}% Akurat</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.accuracy >= 80 ? 'bg-emerald-500' : c.accuracy >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${c.accuracy}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'Kuasai' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : c.status === 'Cukup'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {c.status}
                  </span>
                  <button
                    onClick={() => onStartTargetPractice(c.name)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Latih Materi</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
