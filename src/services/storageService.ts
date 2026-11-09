import { Question, TryoutPackage, UserProfile, TryoutResultData } from '../types';
import { INITIAL_QUESTIONS } from '../data/mockQuestions';
import { INITIAL_TRYOUTS } from '../data/mockTryouts';
import { getLevelInfo } from '../data/badges';

const STORAGE_KEYS = {
  QUESTIONS: 'soalin_questions_v1',
  TRYOUTS: 'soalin_tryouts_v1',
  CURRENT_USER: 'soalin_user_profile_v1',
  USERS_LIST: 'soalin_users_list_v1',
  THEME: 'soalin_theme_mode'
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-catar-akmil',
  name: 'Budi Satria Wibowo',
  email: 'budi.satria@soalin.id',
  role: 'student',
  targetExam: 'Calon Taruna AKMIL 2026',
  institution: 'SMA Taruna Nusantara',
  avatarSeed: 'BudiSatria',
  xp: 1240,
  streakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalStudyMinutes: 340,
  favoriteQuestionIds: ['q-akmil-mat-01', 'q-stan-tpa-01'],
  wrongQuestionIds: ['q-akmil-mat-01', 'q-stis-mat-01'],
  historyResults: [
    {
      id: 'res-init-1',
      tryoutId: 'to-akmil-akademik',
      title: 'Latihan Mandiri Matematika & Pengetahuan Umum',
      date: '2026-09-18',
      mode: 'latihan',
      totalQuestions: 5,
      answeredCount: 5,
      correctCount: 4,
      wrongCount: 1,
      skippedCount: 0,
      totalScore: 80,
      percentage: 80,
      durationSpentSeconds: 480,
      isPassed: true,
      category: 'AKMIL (Akademi Militer)',
      subjectBreakdown: {
        'Matematika': { total: 2, correct: 1, percentage: 50 },
        'Wawasan Kebangsaan': { total: 2, correct: 2, percentage: 100 },
        'Psikotes': { total: 1, correct: 1, percentage: 100 }
      },
      answers: {},
      questions: [],
      recommendedTopics: ['Matematika Vektor & Aljabar']
    }
  ],
  unlockedBadgeIds: ['b-tryout-first', 'b-streak-7']
};

export const DEMO_PROFILES: UserProfile[] = [
  DEFAULT_USER,
  {
    id: 'usr-cpns-pejuang',
    name: 'Siti Rahmawati, S.Tr.Akun',
    email: 'siti.pejuang@soalin.id',
    role: 'student',
    targetExam: 'SKD CPNS Kemenkeu & BKN',
    institution: 'Universitas Indonesia',
    avatarSeed: 'SitiRahma',
    xp: 2890,
    streakDays: 12,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalStudyMinutes: 620,
    favoriteQuestionIds: ['q-cpns-twk-01', 'q-cpns-tiu-01'],
    wrongQuestionIds: ['q-cpns-tiu-01'],
    historyResults: [],
    unlockedBadgeIds: ['b-tryout-first', 'b-questions-100', 'b-skd-master']
  },
  {
    id: 'usr-admin-soalin',
    name: 'Kapten (Purn.) Hendra, M.Ed (Admin)',
    email: 'admin@soalin.id',
    role: 'admin',
    targetExam: 'Administrator Platform SOALIN',
    institution: 'Pusat Pengembangan Soal Terstandar',
    avatarSeed: 'AdminHendra',
    xp: 9999,
    streakDays: 45,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalStudyMinutes: 2400,
    favoriteQuestionIds: [],
    wrongQuestionIds: [],
    historyResults: [],
    unlockedBadgeIds: ['b-tryout-first', 'b-questions-500', 'b-tryout-10']
  }
];

export async function syncQuestionsWithServer(): Promise<Question[]> {
  try {
    const res = await fetch('/api/questions?limit=100');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(data.questions));
        return data.questions;
      }
    }
  } catch (err) {
    console.warn('Network sync for questions failed, using local cache:', err);
  }
  return getStoredQuestions();
}

// Questions Storage
export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    const parsed: Question[] = JSON.parse(raw);
    // Ensure all initial questions exist
    const existingIds = new Set(parsed.map(q => q.id));
    const missingInit = INITIAL_QUESTIONS.filter(q => !existingIds.has(q.id));
    if (missingInit.length > 0) {
      const merged = [...parsed, ...missingInit];
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    console.error('Failed reading stored questions', e);
    return INITIAL_QUESTIONS;
  }
}

export function saveQuestion(question: Question): void {
  const current = getStoredQuestions();
  const index = current.findIndex(q => q.id === question.id);
  if (index >= 0) {
    current[index] = question;
  } else {
    current.unshift(question);
  }
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(current));
}

export function deleteQuestion(questionId: string): void {
  const current = getStoredQuestions();
  const filtered = current.filter(q => q.id !== questionId);
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));
}

// Tryouts Storage
export function getStoredTryouts(): TryoutPackage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRYOUTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRYOUTS, JSON.stringify(INITIAL_TRYOUTS));
      return INITIAL_TRYOUTS;
    }
    const parsed: TryoutPackage[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map(t => t.id));
    const missingInit = INITIAL_TRYOUTS.filter(t => !existingIds.has(t.id));
    if (missingInit.length > 0) {
      const merged = [...parsed, ...missingInit];
      localStorage.setItem(STORAGE_KEYS.TRYOUTS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    return INITIAL_TRYOUTS;
  }
}

export function saveTryout(tryout: TryoutPackage): void {
  const current = getStoredTryouts();
  const idx = current.findIndex(t => t.id === tryout.id);
  if (idx >= 0) {
    current[idx] = tryout;
  } else {
    current.unshift(tryout);
  }
  localStorage.setItem(STORAGE_KEYS.TRYOUTS, JSON.stringify(current));
}

// User Profile Storage
export function getCurrentUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USER;
  }
}

export function saveUserProfile(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function switchUserProfile(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Toggle Favorite Question
export function toggleFavoriteQuestion(questionId: string): boolean {
  const user = getCurrentUserProfile();
  const exists = user.favoriteQuestionIds.includes(questionId);
  if (exists) {
    user.favoriteQuestionIds = user.favoriteQuestionIds.filter(id => id !== questionId);
  } else {
    user.favoriteQuestionIds.push(questionId);
  }
  saveUserProfile(user);
  return !exists;
}

// Register Question as Answered (Wrong or Correct) & update XP
export function recordQuizCompletion(result: TryoutResultData): UserProfile {
  const user = getCurrentUserProfile();
  
  // XP gains
  let xpGained = 50; // base completion
  xpGained += result.correctCount * 25;
  if (result.percentage >= 80) xpGained += 100;
  if (result.percentage === 100) xpGained += 200;

  user.xp += xpGained;
  const { current } = getLevelInfo(user.xp);
  user.targetExam = user.targetExam || 'Persiapan Seleksi Terpadu';

  // Update wrong questions
  const wrongIds = Object.values(result.answers)
    .filter(a => !a.isCorrect && a.selectedOption !== null)
    .map(a => a.questionId);

  const newWrongSet = new Set([...user.wrongQuestionIds, ...wrongIds]);
  // Remove correctly answered ones from wrong pool
  Object.values(result.answers).forEach(a => {
    if (a.isCorrect) {
      newWrongSet.delete(a.questionId);
    }
  });
  user.wrongQuestionIds = Array.from(newWrongSet);

  // Time & streak
  user.totalStudyMinutes += Math.max(1, Math.round(result.durationSpentSeconds / 60));
  user.historyResults.unshift(result);

  // Check achievements
  if (user.historyResults.length >= 1 && !user.unlockedBadgeIds.includes('b-tryout-first')) {
    user.unlockedBadgeIds.push('b-tryout-first');
  }
  if (result.percentage === 100 && !user.unlockedBadgeIds.includes('b-perfect-score')) {
    user.unlockedBadgeIds.push('b-perfect-score');
  }
  if (user.historyResults.length >= 10 && !user.unlockedBadgeIds.includes('b-tryout-10')) {
    user.unlockedBadgeIds.push('b-tryout-10');
  }

  saveUserProfile(user);
  return user;
}
