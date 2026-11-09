import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginError, isLoggingIn } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-200">
      
      {/* Background Subtle Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bank Soal & Tryout Terstandar Indonesia</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 font-black text-2xl tracking-tighter">
              S
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              SOAL<span className="text-cyan-600 dark:text-cyan-400">IN</span>
            </h1>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Masuk untuk mengakses bank soal CAT resmi, tryout berwaktu, dan sinkronisasi kemajuan belajar Anda.
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Autentikasi Akun
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem menggunakan Google OAuth 2.0 resmi. Tidak ada password terpisah yang perlu diingat.
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div 
              id="login-error-banner"
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">
                {loginError}
              </div>
            </div>
          )}

          {/* Official Google Login Button */}
          <button
            id="btn-google-login"
            type="button"
            disabled={isLoggingIn}
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                  Masuk dengan Google
                </span>
              </>
            )}
          </button>

          {/* Security Guarantee */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Privasi terjamin. Kami tidak pernah meminta atau menyimpan kata sandi Google Anda.
            </span>
          </div>

        </div>

        {/* Feature Checkpoints */}
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs space-y-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            <span>Database Cloud Relasional & Sinkronisasi Lintas Perangkat</span>
          </div>
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Soal Terstandar AKMIL, POLRI, CPNS, Kedinasan & UTBK</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Perhitungan Streak Nyata Berdasarkan Aktivitas Belajar Harian</span>
          </div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Analisis Nilai & Review Soal Tersimpan Permanen</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} SOALIN Indonesia. Hak cipta dilindungi.
        </div>

      </div>
    </div>
  );
};
