import React from 'react';
import { 
  BookOpenCheck, 
  Search, 
  Flame, 
  Sun, 
  Moon, 
  ChevronDown,
  Bookmark,
  Play,
  Shield,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLevelInfo } from '../data/badges';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpenLevelXP: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  onOpenAuth,
  onOpenLevelXP,
  onNavigate,
  currentView,
  onReplayIntro
}) => {
  const { profile, progress, questionAttempts } = useAuth();
  
  // Real XP derived from Cloud SQL persistent data
  const totalQuestions = progress?.total_questions || 0;
  const correctAnswers = progress?.correct_answers || 0;
  const completedQuizzes = progress?.total_completed_quizzes || 0;
  const computedXp = (totalQuestions * 15) + (correctAnswers * 25) + (completedQuizzes * 100);
  const { current: levelInfo, progressPercent } = getLevelInfo(computedXp);

  const streakDays = progress?.current_streak || 0;
  const wrongCount = questionAttempts.filter(q => !q.is_correct).length;
  const userName = profile?.full_name || 'Pelajar SOALIN';
  const targetCategory = profile?.target_category || 'CPNS & Kedinasan';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div 
          id="nav-brand-logo"
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-cyan-400">
                SOALIN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                ID
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none mt-0.5 font-medium">
              Bank Soal & Tryout Indonesia
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            id="nav-link-home"
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              currentView === 'home' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Beranda
          </button>
          <button
            id="nav-link-categories"
            onClick={() => onNavigate('categories')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              currentView === 'categories' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Bank Soal
          </button>
          <button
            id="nav-link-tryout"
            onClick={() => onNavigate('tryout')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              currentView === 'tryout' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Tryout Akbar
          </button>
          <button
            id="nav-link-review"
            onClick={() => onNavigate('review')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentView === 'review' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Soal Favorit & Salah</span>
            {wrongCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                {wrongCount}
              </span>
            )}
          </button>
          <button
            id="nav-link-progress"
            onClick={() => onNavigate('progress')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              currentView === 'progress' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Progress & Rapor
          </button>
          <button
            id="nav-link-leaderboard"
            onClick={() => onNavigate('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentView === 'leaderboard' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
          <button
            id="nav-link-admin"
            onClick={() => onNavigate('admin')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentView === 'admin' 
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Admin &amp; Generator</span>
          </button>
        </nav>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            id="btn-nav-search"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60"
            title="Cari materi, topik, atau kata kunci soal"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Cari Soal...</span>
            <kbd className="hidden lg:inline text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Gamification Level & XP Badge */}
          <button
            id="btn-nav-level-xp"
            onClick={onOpenLevelXP}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors border border-slate-200 dark:border-slate-700 text-left"
            title="Klik untuk melihat detail Level, XP, dan Badge"
          >
            <span className="text-base leading-none">{levelInfo.badge}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {levelInfo.name}
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  {computedXp} XP
                </span>
              </div>
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Streak indicator */}
          <div 
            id="nav-streak-indicator"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 font-bold text-xs"
            title={`${streakDays} hari belajar berturut-turut!`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streakDays} Hari</span>
          </div>

          {/* Replay Intro Button */}
          {onReplayIntro && (
            <button
              id="btn-nav-replay-intro"
              onClick={onReplayIntro}
              className="p-2 rounded-lg text-slate-500 hover:text-cyan-500 dark:text-slate-400 dark:hover:text-cyan-400 bg-slate-100 dark:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
              title="Putar Ulang Intro SOALIN"
              aria-label="Putar Ulang Intro SOALIN"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
            title={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Account / Profile button */}
          <button
            id="btn-user-profile-menu"
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 pl-2 sm:pr-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={userName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-indigo-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userName.charAt(0)}
              </div>
            )}
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold leading-tight truncate max-w-[110px]">
                {userName.split(' ')[0]}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                {targetCategory.split(' ')[0]}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};
