import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Target, 
  CheckCircle2, 
  ShieldCheck, 
  LogOut,
  Database,
  Flame,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiUpdateTargetCategory } from '../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

const TARGET_PRESETS = [
  'CPNS & PPPK 2026 (SKD TWK, TIU, TKP)',
  'Sekolah Kedinasan (IPDN, STAN, STIS, STIN)',
  'TNI & POLRI (AKMIL, AAL, AAU, AKPOL)',
  'UTBK - SNBT PTN Impian',
  'Rekrutmen Bersama BUMN (TKD & Core Values)',
  'Umum & Pengembangan Kompetensi ASN',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { profile, progress, logout } = useAuth();
  const [targetExam, setTargetExam] = useState(profile?.target_category || TARGET_PRESETS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen || !profile) return null;

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiUpdateTargetCategory(targetExam);
      setStatusMessage('Target ujian berhasil disimpan ke database!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch {
      setStatusMessage('Gagal menyimpan target ujian.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const studyMinutes = progress ? Math.round(progress.total_study_time / 60) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="auth-modal-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-cyan-300 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Akun & Profil SOALIN</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            Profil Pengguna
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Terhubung resmi melalui Google OAuth & Cloud SQL
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                {profile.full_name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Verified</span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white truncate text-base">
                {profile.full_name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 shrink-0" />
                <span>{profile.email}</span>
              </p>
            </div>
          </div>

          {/* Persistent Stats Snapshot */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
              <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {progress?.total_questions || 0}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Soal Selesai
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
              <div className="flex items-center justify-center text-amber-500 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {progress?.current_streak || 0} Hari
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Streak Aktif
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <div className="flex items-center justify-center text-emerald-500 mb-1">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {progress?.accuracy || 0}%
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Akurasi
              </div>
            </div>
          </div>

          {/* Target Seleksi Settings */}
          <form onSubmit={handleSaveTarget} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Ujian Utama:
            </label>
            <select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {TARGET_PRESETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan ke Cloud...' : 'Perbarui Target Belajar'}
            </button>

            {statusMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs text-center font-medium">
                {statusMessage}
              </div>
            )}
          </form>

          {/* Database Security Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Database className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Penyimpanan Database Cloud SQL (PostgreSQL):
              </span>
              <p className="mt-0.5">
                Semua progres, akurasi, dan riwayat ujian Anda tersinkronisasi otomatis secara aman.
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            id="btn-logout-google"
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
