import { Badge } from '../types';

export interface LevelThreshold {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  color: string;
  badge: string;
}

export const LEVELS: LevelThreshold[] = [
  { level: 1, name: 'Pemula', minXp: 0, maxXp: 250, color: 'text-slate-500 border-slate-300', badge: '🌱' },
  { level: 2, name: 'Pelajar', minXp: 251, maxXp: 750, color: 'text-blue-500 border-blue-300', badge: '📚' },
  { level: 3, name: 'Pejuang', minXp: 751, maxXp: 1500, color: 'text-emerald-500 border-emerald-300', badge: '⚔️' },
  { level: 4, name: 'Kandidat', minXp: 1501, maxXp: 3000, color: 'text-purple-500 border-purple-300', badge: '🎖️' },
  { level: 5, name: 'Expert', minXp: 3001, maxXp: 6000, color: 'text-amber-500 border-amber-300', badge: '⭐' },
  { level: 6, name: 'Master', minXp: 6001, maxXp: 999999, color: 'text-rose-500 border-rose-300', badge: '👑' },
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'b-tryout-first',
    name: 'Tryout Pertama',
    description: 'Menyelesaikan tryout pertama kali di SOALIN.',
    icon: 'Target',
    category: 'tryout'
  },
  {
    id: 'b-questions-100',
    name: '100 Soal Selesai',
    description: 'Menjawab 100 butir soal latihan atau ujian.',
    icon: 'Zap',
    category: 'milestone'
  },
  {
    id: 'b-questions-500',
    name: '500 Soal Selesai',
    description: 'Menyelesaikan 500 butir soal latihan berbagai kategori.',
    icon: 'Flame',
    category: 'milestone'
  },
  {
    id: 'b-streak-7',
    name: '7 Hari Streak',
    description: 'Belajar dan latihan konsisten selama 7 hari berturut-turut.',
    icon: 'Calendar',
    category: 'streak'
  },
  {
    id: 'b-perfect-score',
    name: 'Perfect Score',
    description: 'Mencapai akurasi 100% pada sesi latihan atau tryout.',
    icon: 'Award',
    category: 'accuracy'
  },
  {
    id: 'b-tryout-10',
    name: '10 Tryout Selesai',
    description: 'Menyelesaikan 10 paket tryout dengan dedikasi tinggi.',
    icon: 'Trophy',
    category: 'tryout'
  },
  {
    id: 'b-ketelitian',
    name: 'Spesialis Ketelitian',
    description: 'Menyelesaikan soal psikotes ketelitian dengan akurasi di atas 90%.',
    icon: 'CheckCircle2',
    category: 'accuracy'
  },
  {
    id: 'b-skd-master',
    name: 'Pejuang Tangguh',
    description: 'Melampaui nilai passing grade pada simulasi SKD atau Kedinasan.',
    icon: 'ShieldCheck',
    category: 'tryout'
  }
];

export const USER_LEVELS = LEVELS;
export const BADGES = ALL_BADGES;

export interface LeaderboardUser {
  id: string;
  name: string;
  targetExam: string;
  avatarSeed: string;
  xp: number;
  level: number;
  rank: number;
  streakDays: number;
}

export const LEADERBOARD_USERS: LeaderboardUser[] = [
  { id: 'lb-1', name: 'Rizky Alamsyah', targetExam: 'Target: Lolos AKMIL 2026', avatarSeed: 'Rizky', xp: 7420, level: 6, rank: 1, streakDays: 45 },
  { id: 'lb-2', name: 'Nadia Safitri', targetExam: 'Target: SKD CPNS Kemenkeu', avatarSeed: 'Nadia', xp: 6890, level: 6, rank: 2, streakDays: 38 },
  { id: 'lb-3', name: 'Dimas Prasetyo', targetExam: 'Target: Akpol Taruna 2026', avatarSeed: 'Dimas', xp: 5950, level: 5, rank: 3, streakDays: 29 },
  { id: 'lb-4', name: 'Farhan Maulana', targetExam: 'Target: PKN STAN Bea Cukai', avatarSeed: 'Farhan', xp: 4800, level: 5, rank: 4, streakDays: 21 },
  { id: 'lb-5', name: 'Anisa Rahmawati', targetExam: 'Target: UTBK FK UI', avatarSeed: 'Anisa', xp: 4320, level: 5, rank: 5, streakDays: 19 },
  { id: 'lb-6', name: 'Budi Santoso', targetExam: 'Target: Lolos Seleksi 2026', avatarSeed: 'Budi', xp: 1250, level: 3, rank: 6, streakDays: 7 },
  { id: 'lb-7', name: 'Ilham Hidayat', targetExam: 'Target: Polstat STIS', avatarSeed: 'Ilham', xp: 950, level: 3, rank: 7, streakDays: 5 },
];

export function getLevelInfo(xp: number): { current: LevelThreshold; next?: LevelThreshold; progressPercent: number } {
  const current = LEVELS.find(l => xp >= l.minXp && xp <= l.maxXp) || LEVELS[LEVELS.length - 1];
  const next = LEVELS.find(l => l.level === current.level + 1);
  if (!next) {
    return { current, progressPercent: 100 };
  }
  const span = next.minXp - current.minXp;
  const earnedInLevel = xp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInLevel / span) * 100)));
  return { current, next, progressPercent };
}
