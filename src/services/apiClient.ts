import { auth } from '../lib/firebase';

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sesi autentikasi tidak ditemukan. Harap login kembali.');
  }

  const token = await user.getIdToken();
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function syncUserWithServer(targetCategory?: string) {
  const res = await authFetch('/api/auth/sync', {
    method: 'POST',
    body: JSON.stringify({ targetCategory }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal sinkronisasi profil pengguna');
  }
  return res.json();
}

export async function fetchUserProgress() {
  const res = await authFetch('/api/user/progress');
  if (!res.ok) throw new Error('Gagal mengambil progres');
  const data = await res.json();
  return data.progress;
}

export async function apiRecordQuestionAttempt(payload: {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  clientDate?: string;
  attemptId?: string;
}) {
  const attemptId = payload.attemptId || `att_q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const res = await authFetch('/api/user/question-attempt', {
    method: 'POST',
    body: JSON.stringify({ ...payload, attemptId }),
  });
  if (!res.ok) throw new Error('Gagal menyimpan pengerjaan soal');
  const data = await res.json();
  return data.progress;
}

export async function apiRecordQuizAttempt(payload: {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  duration: number;
  startedAt?: string | Date;
  clientDate?: string;
  attemptId?: string;
}) {
  const attemptId = payload.attemptId || `att_quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const res = await authFetch('/api/user/quiz-attempt', {
    method: 'POST',
    body: JSON.stringify({ ...payload, attemptId }),
  });
  if (!res.ok) throw new Error('Gagal menyimpan hasil tryout');
  return res.json();
}

export async function fetchQuizHistory() {
  const res = await authFetch('/api/user/quiz-history');
  if (!res.ok) throw new Error('Gagal mengambil riwayat tryout');
  const data = await res.json();
  return data.history;
}

export async function fetchQuestionAttempts() {
  const res = await authFetch('/api/user/question-attempts');
  if (!res.ok) throw new Error('Gagal mengambil riwayat pengerjaan');
  const data = await res.json();
  return data.attempts;
}

export async function fetchDailyActivities() {
  const res = await authFetch('/api/user/daily-activities');
  if (!res.ok) throw new Error('Gagal mengambil aktivitas harian');
  const data = await res.json();
  return data.activities;
}

export async function fetchFavorites() {
  const res = await authFetch('/api/user/favorites');
  if (!res.ok) throw new Error('Gagal mengambil favorit');
  const data = await res.json();
  return data.favorites;
}

export async function apiToggleFavorite(questionId: string) {
  const res = await authFetch('/api/user/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ questionId }),
  });
  if (!res.ok) throw new Error('Gagal mengubah favorit');
  return res.json();
}

export async function apiUpdateTargetCategory(targetCategory: string) {
  const res = await authFetch('/api/user/target-category', {
    method: 'POST',
    body: JSON.stringify({ targetCategory }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui target');
  return res.json();
}

export async function apiAskAiTutor(message: string, questionContext?: any) {
  const res = await authFetch('/api/ai/tutor', {
    method: 'POST',
    body: JSON.stringify({ message, questionContext }),
  });
  if (!res.ok) throw new Error('Gagal terhubung dengan AI Tutor');
  return res.json();
}

// ==========================================
// ALIN AI COMPANION API METHODS
// ==========================================

export async function fetchAlinProfile() {
  const res = await authFetch('/api/alin/profile');
  if (!res.ok) throw new Error('Gagal memuat profil ALIN');
  const data = await res.json();
  return data.profile;
}

export async function awardAlinXp(xpDelta: number = 5) {
  const res = await authFetch('/api/alin/xp', {
    method: 'POST',
    body: JSON.stringify({ xpDelta }),
  });
  if (!res.ok) throw new Error('Gagal menambah XP ALIN');
  const data = await res.json();
  return data.profile;
}

export async function fetchAlinConversations() {
  const res = await authFetch('/api/alin/conversations');
  if (!res.ok) throw new Error('Gagal memuat daftar percakapan ALIN');
  const data = await res.json();
  return data.conversations;
}

export async function createAlinConversation(title?: string) {
  const res = await authFetch('/api/alin/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Gagal membuat percakapan baru');
  const data = await res.json();
  return data.conversation;
}

export async function deleteAlinConversation(conversationId: number) {
  const res = await authFetch(`/api/alin/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal menghapus percakapan');
  return res.json();
}

export async function fetchAlinMessages(conversationId: number) {
  const res = await authFetch(`/api/alin/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error('Gagal memuat pesan ALIN');
  const data = await res.json();
  return data.messages;
}

export async function sendAlinChatMessage(params: {
  conversationId?: number;
  message: string;
  questionContext?: any;
  actionType?: string;
}) {
  const res = await authFetch('/api/alin/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Gagal berkomunikasi dengan ALIN');
  return res.json();
}

// ==========================================
// QUESTION BANK & GENERATOR API METHODS
// ==========================================

export async function fetchQuestionsApi(params: {
  category?: string;
  difficulty?: string;
  status?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.category && params.category !== 'all') q.set('category', params.category);
  if (params.difficulty && params.difficulty !== 'all') q.set('difficulty', params.difficulty);
  if (params.status && params.status !== 'all') q.set('status', params.status);
  if (params.topic) q.set('topic', params.topic);
  if (params.search) q.set('search', params.search);
  if (params.limit) q.set('limit', String(params.limit));
  if (params.offset) q.set('offset', String(params.offset));

  const res = await fetch(`/api/questions?${q.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat bank soal dari server');
  return res.json();
}

export async function fetchQuestionBankStatsApi() {
  const res = await fetch('/api/questions/stats');
  if (!res.ok) throw new Error('Gagal memuat statistik bank soal');
  const data = await res.json();
  return data.stats;
}

export async function saveQuestionApi(question: any) {
  const res = await authFetch('/api/questions', {
    method: 'POST',
    body: JSON.stringify(question),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal menyimpan soal');
  }
  return res.json();
}

export async function updateQuestionStatusApi(questionId: string, status: string) {
  const res = await authFetch(`/api/questions/${questionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui status soal');
  return res.json();
}

export async function bulkActionQuestionsApi(action: string, questionIds: string[]) {
  const res = await authFetch('/api/questions/bulk-action', {
    method: 'POST',
    body: JSON.stringify({ action, questionIds }),
  });
  if (!res.ok) throw new Error('Gagal memproses aksi massal soal');
  return res.json();
}

export async function deleteQuestionApi(questionId: string) {
  const res = await authFetch(`/api/questions/${questionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Gagal menghapus soal');
  return res.json();
}

export async function submitQuestionReportApi(payload: {
  questionId: string;
  reason: string;
  details?: string;
}) {
  const res = await authFetch('/api/questions/report', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengirim laporan soal');
  }
  return res.json();
}

export async function fetchQuestionReportsApi() {
  const res = await authFetch('/api/questions/reports/list');
  if (!res.ok) throw new Error('Gagal memuat daftar laporan soal');
  const data = await res.json();
  return data.reports;
}

export async function resolveQuestionReportApi(reportId: number, status: 'resolved' | 'dismissed') {
  const res = await authFetch(`/api/questions/reports/${reportId}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui status laporan');
  return res.json();
}

export async function triggerAdminGenerateApi(payload: {
  categories?: string[];
  totalTarget?: number;
  difficultyMix?: any;
}) {
  const res = await authFetch('/api/admin/generate-questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal menjalankan generasi soal');
  }
  return res.json();
}

export async function fetchGenerationLogsApi() {
  const res = await authFetch('/api/admin/generation-logs');
  if (!res.ok) throw new Error('Gagal memuat log generasi');
  const data = await res.json();
  return data.logs;
}

export async function fetchGenerationConfigApi() {
  const res = await authFetch('/api/admin/generation-config');
  if (!res.ok) throw new Error('Gagal memuat pengaturan generator');
  const data = await res.json();
  return data.config;
}

export async function saveGenerationConfigApi(config: any) {
  const res = await authFetch('/api/admin/generation-config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Gagal menyimpan konfigurasi generator');
  return res.json();
}

export async function fetchDailyPackagesApi() {
  const res = await fetch('/api/packages/daily');
  if (!res.ok) throw new Error('Gagal memuat paket belajar harian');
  const data = await res.json();
  return data.packages;
}

export async function fetchRecommendedPackageApi() {
  const res = await authFetch('/api/packages/recommended');
  if (!res.ok) throw new Error('Gagal memuat rekomendasi latihan');
  const data = await res.json();
  return data.package;
}

export async function fetchWeeklyPackageApi() {
  const res = await fetch('/api/packages/weekly');
  if (!res.ok) throw new Error('Gagal memuat weekly tryout');
  const data = await res.json();
  return data.package;
}

export async function fetchMonthlyPackageApi() {
  const res = await fetch('/api/packages/monthly');
  if (!res.ok) throw new Error('Gagal memuat simulasi bulanan');
  const data = await res.json();
  return data.package;
}

// ============================================================================
// LEADERBOARD API CLIENT
// ============================================================================

export async function fetchLeaderboardApi(params: {
  timeframe?: 'today' | 'week' | 'month' | 'all';
  category?: string;
  page?: number;
  limit?: number;
  userId?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.timeframe) query.set('timeframe', params.timeframe);
  if (params.category) query.set('category', params.category);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.userId) query.set('userId', params.userId);

  const user = auth.currentUser;
  const headers: Record<string, string> = {};
  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {}
  }

  const res = await fetch(`/api/leaderboard?${query.toString()}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memuat peringkat leaderboard');
  }
  return res.json();
}


