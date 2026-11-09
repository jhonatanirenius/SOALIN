import React, { useState } from 'react';
import { 
  Trophy, 
  Clock, 
  Users, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Zap,
  Filter
} from 'lucide-react';
import { TryoutPackage, UserProfile } from '../types';

interface TryoutCatalogProps {
  tryouts: TryoutPackage[];
  currentUser: UserProfile;
  onStartTryout: (tryoutId: string) => void;
}

export const TryoutCatalog: React.FC<TryoutCatalogProps> = ({
  tryouts,
  currentUser,
  onStartTryout
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'akbar' | 'mingguan' | 'gratis' | 'premium'>('all');

  const filterTabs = [
    { id: 'all', label: 'Semua Tryout' },
    { id: 'akbar', label: 'Tryout Akbar 🏆' },
    { id: 'mingguan', label: 'Tryout Mingguan 📅' },
    { id: 'gratis', label: 'Tryout Gratis 🎁' },
    { id: 'premium', label: 'Simulasi Kedinasan & TNI 💎' }
  ];

  const filtered = tryouts.filter(t => {
    if (activeFilter === 'akbar') return t.name.toLowerCase().includes('akbar');
    if (activeFilter === 'mingguan') return t.name.toLowerCase().includes('mingguan') || t.questionCount <= 50;
    if (activeFilter === 'gratis') return !t.name.toLowerCase().includes('akmil') || t.questionCount <= 50;
    if (activeFilter === 'premium') return t.category.includes('AKMIL') || t.category.includes('Kedinasan') || t.category.includes('CPNS');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-900/60 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Simulasi Ujian Berstandar CAT Resmi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Tryout Akbar & Simulasi Seleksi Nasional
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Dilengkapi timer hitung mundur otomatis, sistem perankingan nasional, penilaian berbasis ambang batas (passing grade), dan analisis kelemahan materi.
          </p>
        </div>
      </div>

      {/* Filter Tabs as requested in Prompt */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tryout Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((to) => (
          <div
            key={to.id}
            id={`card-tryout-${to.id}`}
            className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Category & Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {to.category}
                </span>

                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CAT BKN Ready</span>
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {to.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {to.description}
              </p>

              {/* Key Specs Row as requested in Prompt:
                  - Nama tryout
                  - Jumlah soal
                  - Waktu pengerjaan
                  - Passing grade
                  - Jumlah peserta
                  - Peringkat peserta
              */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Jumlah Soal</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                    {to.questionCount} Butir Soal
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Waktu Ujian</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                    {to.durationMinutes} Menit
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block">Passing Grade</span>
                  <span className="text-sm font-bold text-emerald-600 block mt-0.5">
                    Ambang {to.passingScore}%
                  </span>
                </div>
              </div>

              {/* Participants & Ranking Status */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span><strong>{to.participantCount.toLocaleString('id-ID')}</strong> peserta terdaftar</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <span>Peringkat Real-Time 🏆</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Mode: Simulasi CBT Mandiri
              </span>

              <button
                id={`btn-start-tryout-${to.id}`}
                onClick={() => onStartTryout(to.id)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Mulai Tryout Sekarang</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
