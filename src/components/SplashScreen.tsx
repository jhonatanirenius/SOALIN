import React, { useState, useEffect, useRef } from 'react';
import { BookOpenCheck, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const LOADING_STEPS = [
  'Menyiapkan bank soal...',
  'Memuat materi latihan...',
  'Menyiapkan simulasi ujian...',
  'Menyiapkan dashboard...'
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Phase management
  // 0: Initial wait (0 - 0.2s)
  // 1: Logo enters (0.2s - 1.2s)
  // 2: Tagline enters (1.2s - 2.0s)
  // 3: Developer credit enters (2.0s - 3.0s)
  // 4: Loading progress starts (3.0s - 5.2s)
  // 5: "Siap belajar?" appears (5.2s - 6.5s)
  // 6: Exit transition starts (6.5s - 7.2s)

  const [phase, setPhase] = useState<number>(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState<number>(0);
  const [loadingTextVisible, setLoadingTextVisible] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Check prefers-reduced-motion
  const isReducedMotion = useRef<boolean>(
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  // Complete and unmount intro
  const completeIntro = () => {
    try {
      sessionStorage.setItem('soalin_intro_completed', 'true');
    } catch {
      // Ignore sessionStorage issues
    }
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 650);
  };

  const handleSkip = () => {
    completeIntro();
  };

  // Particles canvas effect (GPU-friendly, runs only if not reduced motion)
  useEffect(() => {
    if (isReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = width < 640 ? 16 : 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.8,
      speedY: Math.random() * 0.35 + 0.15,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.35 + 0.1,
      color: Math.random() > 0.4 ? 'rgba(99, 102, 241, ' : 'rgba(6, 182, 212, '
    }));

    let isRunning = true;
    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color === 'rgba(99, 102, 241, ' ? '#6366f1' : '#06b6d4';
        ctx.fill();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isReducedMotion]);

  // Main Intro Sequence Timeline
  useEffect(() => {
    // If reduced motion is active, run brief 1.2s sequence
    if (isReducedMotion) {
      setPhase(4);
      setProgressPercent(100);
      const timer = setTimeout(() => {
        completeIntro();
      }, 1200);
      return () => clearTimeout(timer);
    }

    // 0.2s: Logo appears
    const t1 = setTimeout(() => setPhase(1), 200);

    // 1.3s: Tagline appears
    const t2 = setTimeout(() => setPhase(2), 1300);

    // 2.1s: Developer credit appears
    const t3 = setTimeout(() => setPhase(3), 2100);

    // 3.0s: Loading sequence begins
    const t4 = setTimeout(() => {
      setPhase(4);

      const startTime = Date.now();
      const duration = 2300; // 3.0s to 5.3s

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - rawProgress) * (1 - rawProgress);
        setProgressPercent(Math.round(eased * 100));

        if (rawProgress >= 1) {
          clearInterval(progressIntervalRef.current);
        }
      }, 40);
    }, 3000);

    // Rotating loading status messages
    const tText1 = setTimeout(() => {
      setLoadingTextVisible(false);
      setTimeout(() => {
        setLoadingTextIndex(1);
        setLoadingTextVisible(true);
      }, 200);
    }, 3700);

    const tText2 = setTimeout(() => {
      setLoadingTextVisible(false);
      setTimeout(() => {
        setLoadingTextIndex(2);
        setLoadingTextVisible(true);
      }, 200);
    }, 4400);

    const tText3 = setTimeout(() => {
      setLoadingTextVisible(false);
      setTimeout(() => {
        setLoadingTextIndex(3);
        setLoadingTextVisible(true);
      }, 200);
    }, 5000);

    // 5.3s: "Siap belajar?" text
    const t5 = setTimeout(() => {
      setPhase(5);
      setProgressPercent(100);
    }, 5300);

    // 6.6s: Complete intro and trigger smooth fade-out
    const t6 = setTimeout(() => {
      completeIntro();
    }, 6600);

    // Failsafe timer (never hang forever)
    const tSafety = setTimeout(() => {
      completeIntro();
    }, 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tSafety);
      clearTimeout(tText1);
      clearTimeout(tText2);
      clearTimeout(tText3);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div 
      id="soalin-splash-screen"
      role="dialog"
      aria-label="Memuat SOALIN — Bank Soal & Tryout Indonesia"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] bg-[#050811] text-white flex flex-col justify-between items-center p-6 sm:p-8 select-none transition-all duration-700 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Radial Ambient Lights */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full bg-gradient-to-b from-indigo-500/15 via-cyan-500/10 to-transparent blur-3xl opacity-75 animate-pulse" 
          style={{ animationDuration: '6s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] rounded-full bg-gradient-to-tr from-blue-600/10 via-indigo-600/15 to-transparent blur-3xl opacity-60"
        />
        <div 
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[300px] sm:w-[520px] h-[260px] rounded-full bg-cyan-500/10 blur-3xl opacity-40"
        />

        {/* Floating Particles Canvas */}
        {!isReducedMotion && (
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full opacity-60" 
          />
        )}

        {/* Subtle Matrix Overlay */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" 
        />
      </div>

      {/* Top Bar: Safe Area & Skip Button */}
      <div className="relative z-10 w-full max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-1.5 opacity-60 text-[11px] font-mono tracking-widest text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>SISTEM CAT VERSI 2026</span>
        </div>

        <button
          id="btn-skip-intro"
          onClick={handleSkip}
          className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800/90 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700 text-xs transition-all duration-200 cursor-pointer backdrop-blur-sm"
          title="Lewati intro dan langsung menuju aplikasi"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-cyan-400" />
        </button>
      </div>

      {/* Center Cinematic Container */}
      <div className="relative z-10 my-auto w-full max-w-md flex flex-col items-center text-center px-4">
        
        {/* 1. LOGO SOALIN (0.0s - 1.5s) */}
        <div 
          className={`flex flex-col items-center transition-all duration-1000 ease-out ${
            phase >= 1 
              ? 'opacity-100 scale-100 filter blur-0 translate-y-0' 
              : 'opacity-0 scale-95 filter blur-md translate-y-3'
          }`}
        >
          {/* Logo Emblem with Ambient Glow */}
          <div className="relative mb-4 group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-500/30 via-cyan-400/25 to-blue-600/30 blur-xl opacity-80" />
            
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-2xl shadow-indigo-500/35 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] sm:rounded-[22px] bg-slate-950/80 backdrop-blur-md flex items-center justify-center border border-white/20">
                <BookOpenCheck className="w-9 h-9 sm:w-11 sm:h-11 text-cyan-300 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
              </div>
            </div>

            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/50 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
            </div>
          </div>

          {/* Typography: SOALIN */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center gap-1">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                SOAL
              </span>
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-400 bg-clip-text text-transparent filter drop-shadow-[0_0_16px_rgba(6,182,212,0.4)]">
                IN
              </span>
            </h1>
          </div>
        </div>

        {/* 2. TAGLINE (1.2s - 2.8s) */}
        <div 
          className={`mt-3 transition-all duration-700 ease-out ${
            phase >= 2 
              ? 'opacity-100 translate-y-0 filter blur-0' 
              : 'opacity-0 translate-y-3 filter blur-sm'
          }`}
        >
          <p className="text-sm sm:text-base font-medium text-slate-300 tracking-wide">
            &ldquo;Latihan. Uji Diri. Jadi Lebih Siap.&rdquo;
          </p>
        </div>

        {/* 3. DEVELOPER CREDIT (2.0s - 3.5s) */}
        <div 
          className={`mt-2 transition-all duration-700 ease-out ${
            phase >= 3 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/70 text-[11px] sm:text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
            <span className="tracking-wider uppercase font-medium text-slate-300">
              By JNN Irenius Studio
            </span>
          </div>
        </div>

        {/* 4. LOADING SEQUENCE & PROGRESS BAR (3.0s - 5.5s) */}
        <div 
          className={`mt-10 w-full max-w-xs transition-all duration-500 ease-out ${
            phase >= 4 && phase < 5 
              ? 'opacity-100 scale-100' 
              : phase >= 5 
                ? 'opacity-0 scale-95 pointer-events-none h-0 mt-0 overflow-hidden' 
                : 'opacity-0 scale-95'
          }`}
        >
          {/* Progress Bar Container */}
          <div className="relative w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(6,182,212,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Dynamic Status Text & Percentage */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span 
              className={`transition-opacity duration-200 text-left font-medium text-slate-300 ${
                loadingTextVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {LOADING_STEPS[loadingTextIndex]}
            </span>
            <span className="font-mono text-[11px] font-semibold text-cyan-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* 5. "SIAP BELAJAR?" (5.0s - 6.5s) */}
        <div 
          className={`transition-all duration-600 ease-out ${
            phase >= 5 
              ? 'opacity-100 scale-100 translate-y-0 filter blur-0 mt-8' 
              : 'opacity-0 scale-95 translate-y-2 filter blur-sm pointer-events-none h-0 overflow-hidden'
          }`}
        >
          <div className="inline-flex flex-col items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-indigo-200 bg-clip-text text-transparent filter drop-shadow-[0_0_14px_rgba(6,182,212,0.4)]">
              Siap belajar?
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Membuka halaman utama...</span>
            </div>
          </div>
        </div>

        {/* Error Fallback */}
        {hasError && (
          <div className="mt-6 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-2">
            <p>Terjadi kendala saat memuat data. Coba lagi.</p>
            <button
              onClick={() => {
                setHasError(false);
                completeIntro();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

      </div>

      {/* Bottom Safe Area Branding & Version */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500 pb-2">
        <div className="flex items-center gap-2">
          <span>Bank Soal Terpadu & Tryout CAT Nasional</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">SD, SMP, SMA, PTN, Kedinasan, CPNS, TNI & Polri</span>
        </div>
        <div className="font-mono text-[10px] text-slate-600">
          SECURE SIMULATION ENGINE
        </div>
      </div>
    </div>
  );
};
