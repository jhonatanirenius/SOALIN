import React, { useState } from 'react';
import { Sparkles, Heart, Zap, Award, Info } from 'lucide-react';

interface AlinFamiliarityBadgeProps {
  level: number;
  xp: number;
  compact?: boolean;
}

export const getLevelInfo = (level: number) => {
  switch (level) {
    case 3:
      return {
        level: 3,
        name: 'Best Study Buddy',
        tag: 'Sahabat Sejati ❤️',
        color: 'from-pink-500 to-rose-400',
        textColor: 'text-pink-600 dark:text-pink-400',
        bgLight: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800',
        accentBg: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
        minXp: 600,
        nextXp: 1000,
        icon: Heart,
        desc: 'Alin udah super akrab & selalu support kamu kapanpun!',
      };
    case 2:
      return {
        level: 2,
        name: 'Close Friend',
        tag: 'Sahabat Ambis ✨',
        color: 'from-purple-500 to-pink-500',
        textColor: 'text-purple-600 dark:text-purple-400',
        bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
        accentBg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        minXp: 300,
        nextXp: 600,
        icon: Sparkles,
        desc: 'Makin kompak belajarnya bareng Alin!',
      };
    case 1:
      return {
        level: 1,
        name: 'Getting Comfortable',
        tag: 'Teman Belajar 🌟',
        color: 'from-cyan-500 to-blue-500',
        textColor: 'text-cyan-600 dark:text-cyan-400',
        bgLight: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
        accentBg: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
        minXp: 100,
        nextXp: 300,
        icon: Zap,
        desc: 'Udah mulai nyaman saling kenal & diskusi soal bareng.',
      };
    case 0:
    default:
      return {
        level: 0,
        name: 'First Meeting',
        tag: 'Kenalan Baru 👋',
        color: 'from-sky-500 to-teal-500',
        textColor: 'text-sky-600 dark:text-sky-400',
        bgLight: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
        accentBg: 'bg-gradient-to-r from-sky-500 to-teal-500 text-white',
        minXp: 0,
        nextXp: 100,
        icon: Award,
        desc: 'Mulai petualangan belajar kamu bareng Alin!',
      };
  }
};

export const AlinFamiliarityBadge: React.FC<AlinFamiliarityBadgeProps> = ({
  level = 0,
  xp = 0,
  compact = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = getLevelInfo(level);
  const Icon = info.icon;

  // Calculate percentage within current level range
  let progressPct = 100;
  if (level < 3) {
    const range = info.nextXp - info.minXp;
    const currentInRange = Math.max(0, xp - info.minXp);
    progressPct = Math.min(100, Math.round((currentInRange / range) * 100));
  }

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${info.bgLight} ${info.textColor} hover:opacity-90`}
          title={`Kedekatan: Level ${level} (${xp} XP)`}
        >
          <Icon className="w-3 h-3" />
          <span>Lv.{level}</span>
        </button>

        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 w-56 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-left z-50 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 mb-1">
              <span>{info.tag}</span>
              <span className="text-[10px] text-slate-500">{xp} XP</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">{info.desc}</p>
            {level < 3 ? (
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Progress ke Lv.{level + 1}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${info.color} transition-all duration-500`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-pink-600 font-semibold">Tingkat Kedekatan Maksimal ❤️</span>
            )}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              <span>Naik XP saat ngerjain soal & tryout</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-2.5 rounded-xl border ${info.bgLight} transition-all`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className={`p-1 rounded-lg ${info.accentBg}`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <span>{info.tag}</span>
              <span className="text-[10px] text-slate-500 font-normal">• Lv.{level}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{xp}</span>
          <span className="text-[10px] text-slate-500 font-normal"> XP</span>
        </div>
      </div>

      {level < 3 ? (
        <div>
          <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${info.color} transition-all duration-500`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>{info.desc}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              {info.nextXp - xp} XP lagi ke Lv.{level + 1}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">
          Alin udah jadi Best Study Buddy sejati kamu! ❤️
        </p>
      )}
    </div>
  );
};
