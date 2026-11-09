import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Award, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Users, 
  Star,
  Zap,
  TrendingUp
} from 'lucide-react';
import { UserProfile } from '../types';
import { BADGES, getLevelInfo, LEADERBOARD_USERS, USER_LEVELS } from '../data/badges';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onNavigate?: (view: string) => void;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'badges' | 'leaderboard'>('levels');

  if (!isOpen) return null;

  const { current: currentLevel, next: nextLevel, progressPercent } = getLevelInfo(currentUser.xp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="gamification-modal-card"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            id="btn-close-gamification-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-300 mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistem Gamifikasi & Motivasi Belajar</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                {currentLevel.name} {currentLevel.badge}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {currentUser.name} • Total Perolehan: <strong className="text-amber-300 font-bold">{currentUser.xp} XP</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-xs self-start sm:self-auto">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>Streak {currentUser.streakDays} Hari Berturut-turut</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-5 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center text-xs mb-1.5 text-slate-300">
              <span>Level Saat Ini: <strong className="text-white">{currentLevel.name}</strong></span>
              <span>
                {nextLevel ? `Menuju ${nextLevel.name} (${nextLevel.minXp - currentUser.xp} XP lagi)` : 'Tingkat Tertinggi!'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'levels'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Jenjang Level</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badge Pencapaian ({currentUser.unlockedBadgeIds.length}/{BADGES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leaderboard Nasional</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: LEVELS */}
          {activeTab === 'levels' && (
            <div className="space-y-3">
              {USER_LEVELS.map((lvl) => {
                const isCurrent = lvl.name === currentLevel.name;
                const isUnlocked = currentUser.xp >= lvl.minXp;

                return (
                  <div 
                    key={lvl.name}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      isCurrent 
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800' 
                        : isUnlocked 
                        ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' 
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{lvl.badge}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {lvl.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                              Level Kamu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Rentang XP: {lvl.minXp} - {lvl.maxXp >= 99999 ? 'Tak Terbatas' : `${lvl.maxXp} XP`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {lvl.minXp.toLocaleString('id-ID')} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: BADGES */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {BADGES.map((b) => {
                const isUnlocked = currentUser.unlockedBadgeIds.includes(b.id);

                return (
                  <div 
                    key={b.id}
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                      isUnlocked 
                        ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs' 
                        : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      isUnlocked ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' : 'bg-slate-200 dark:bg-slate-800'
                    }`}>
                      {isUnlocked ? '🎖️' : '🔒'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {b.name}
                        </h4>
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terbuka</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Terkunci</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {b.description}
                      </p>

                      <div className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        Kategori: {b.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
                <span>🏆 Peringkat dihitung berdasarkan total akumulasi XP mingguan.</span>
                <span className="font-bold">Update Real-time</span>
              </div>

              {onNavigate && (
                <button
                  id="btn-gamification-open-full-leaderboard"
                  onClick={() => {
                    onClose();
                    onNavigate('leaderboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 fill-white" />
                  <span>Buka Halaman Penuh Papan Peringkat (Leaderboard)</span>
                </button>
              )}

              {LEADERBOARD_USERS.map((usr) => (
                <div 
                  key={usr.rank}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    usr.rank === 1 
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' 
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                      usr.rank === 1 ? 'bg-amber-400 text-slate-950' : usr.rank === 2 ? 'bg-slate-300 text-slate-900' : usr.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {usr.rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {usr.name}
                        </span>
                        <span className="text-xs">Level {usr.level}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {usr.targetExam}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 block">
                      {usr.xp.toLocaleString('id-ID')} XP
                    </span>
                    <span className="text-[10px] text-amber-500 font-medium">
                      🔥 {usr.streakDays} Hari
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
