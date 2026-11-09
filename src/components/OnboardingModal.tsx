import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, ArrowRight, Target, GraduationCap } from 'lucide-react';

const TARGET_PRESETS = [
  { id: 'cpns', label: 'CPNS & PPPK 2026', desc: 'SKD TWK, TIU, TKP terstandar BKN' },
  { id: 'kedinasan', label: 'Sekolah Kedinasan (IPDN, STAN, STIS, STIN)', desc: 'Seleksi Kemampuan Dasar & Akademik' },
  { id: 'tni_polri', label: 'TNI & POLRI (AKMIL, AAL, AAU, AKPOL, Bintara)', desc: 'Psikotes & Akademik Terpadu' },
  { id: 'utbk', label: 'UTBK - SNBT PTN Impian', desc: 'Tes Potensi Skolastik & Literasi' },
  { id: 'bumn', label: 'Rekrutmen Bersama BUMN', desc: 'TKD, Core Values AKHLAK & Bahasa Inggris' },
];

export const OnboardingModal: React.FC = () => {
  const { isNewUser, profile, completeOnboarding } = useAuth();
  const [selectedTarget, setSelectedTarget] = useState<string>(TARGET_PRESETS[0].label);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewUser || !profile) return null;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(selectedTarget);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        id="onboarding-modal-card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-cyan-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selamat Datang</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat datang di SOALIN 👋
          </h2>
          <p className="text-sm text-indigo-100 mt-1">
            Mari tentukan fokus persiapan ujian Anda untuk rekomendasi soal yang tepat.
          </p>
        </div>

        {/* User preview from Google */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {profile.full_name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Akun Terverifikasi
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {profile.full_name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Target className="w-4 h-4 text-cyan-500" />
              <span>Pilih Target Seleksi Utama Anda:</span>
            </div>

            <div className="space-y-2.5">
              {TARGET_PRESETS.map((t) => {
                const isSelected = selectedTarget === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTarget(t.label)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.desc}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Status Confirmation */}
          <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span>
              Data awal Anda diset bersih: <strong>0 soal dikerjakan</strong>, <strong>0% akurasi</strong>, dan <strong>0 streak</strong>.
            </span>
          </div>

          {/* Action button */}
          <button
            id="btn-complete-onboarding"
            type="button"
            disabled={isSubmitting}
            onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            <span>Mulai latihan pertama kamu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
