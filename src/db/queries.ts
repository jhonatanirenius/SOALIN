import { db } from './index.ts';
import {
  profiles,
  user_progress,
  question_attempts,
  quiz_attempts,
  daily_activity,
  user_favorites,
  alin_profile,
  alin_conversations,
  alin_messages,
  questions,
  question_reports,
  learning_packages,
  generation_logs,
  generation_configs,
  user_activity,
} from './schema.ts';
import { eq, and, desc, sql, inArray, or, ilike } from 'drizzle-orm';
import type { Question } from '../types/index.ts';

// Helper to format Date to YYYY-MM-DD
export function formatDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper to get yesterday's date string YYYY-MM-DD
export function getYesterdayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return formatDate(dt);
}

// 1. SYNC / GET USER PROFILE & PROGRESS ON LOGIN
export async function syncUserProfile(userData: {
  auth_user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}) {
  try {
    const now = new Date();
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.auth_user_id, userData.auth_user_id));

    let profile;
    let isNewUser = false;

    if (existing.length === 0) {
      isNewUser = true;
      const inserted = await db
        .insert(profiles)
        .values({
          auth_user_id: userData.auth_user_id,
          email: userData.email,
          full_name: userData.full_name || userData.email.split('@')[0],
          avatar_url: userData.avatar_url || '',
          last_login_at: now,
          updated_at: now,
          created_at: now,
        })
        .returning();
      profile = inserted[0];

      // Create initial user_progress row with strict 0 defaults (NO fake streak 5)
      await db.insert(user_progress).values({
        user_id: userData.auth_user_id,
        total_questions: 0,
        correct_answers: 0,
        wrong_answers: 0,
        accuracy: 0,
        total_study_time: 0,
        total_completed_quizzes: 0,
        best_score: 0,
        average_score: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      });
    } else {
      // Existing user: Update last_login_at & metadata if provided
      const updated = await db
        .update(profiles)
        .set({
          email: userData.email,
          full_name: userData.full_name || existing[0].full_name,
          avatar_url: userData.avatar_url || existing[0].avatar_url,
          last_login_at: now,
          updated_at: now,
        })
        .where(eq(profiles.auth_user_id, userData.auth_user_id))
        .returning();
      profile = updated[0];
    }

    // Fetch progress and check if streak is broken
    const progress = await getUserProgress(userData.auth_user_id);

    return { profile, progress, isNewUser };
  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    throw new Error('Gagal memproses profil pengguna.', { cause: error });
  }
}

// 2. GET USER PROGRESS (With accurate streak calculation)
export async function getUserProgress(userId: string) {
  try {
    const existing = await db
      .select()
      .from(user_progress)
      .where(eq(user_progress.user_id, userId));

    if (existing.length === 0) {
      // Fallback create if somehow missing
      const inserted = await db
        .insert(user_progress)
        .values({
          user_id: userId,
          total_questions: 0,
          correct_answers: 0,
          wrong_answers: 0,
          accuracy: 0,
          total_study_time: 0,
          total_completed_quizzes: 0,
          best_score: 0,
          average_score: 0,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null,
        })
        .returning();
      return inserted[0];
    }

    const prog = existing[0];

    // Check if streak is stale (user missed yesterday and today)
    if (prog.last_activity_date && prog.current_streak > 0) {
      const today = formatDate();
      const yesterday = getYesterdayDate(today);

      // If last activity was before yesterday, streak resets to 0
      if (prog.last_activity_date !== today && prog.last_activity_date !== yesterday) {
        const updated = await db
          .update(user_progress)
          .set({
            current_streak: 0,
            updated_at: new Date(),
          })
          .where(eq(user_progress.user_id, userId))
          .returning();
        return updated[0];
      }
    }

    return prog;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    throw new Error('Gagal mengambil data progres pengguna.', { cause: error });
  }
}

// 3. RECORD QUESTION ATTEMPT & UPDATE PROGRESS + DAILY ACTIVITY + STREAK ATOMICALLY
export async function recordQuestionAttempt(params: {
  userId: string;
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  clientDate?: string; // Optional client local date 'YYYY-MM-DD'
}) {
  try {
    const today = params.clientDate || formatDate();
    const now = new Date();

    // 1. Insert question attempt record
    await db.insert(question_attempts).values({
      user_id: params.userId,
      question_id: params.questionId,
      selected_answer: params.selectedAnswer,
      correct_answer: params.correctAnswer,
      is_correct: params.isCorrect,
      time_spent: params.timeSpent,
      attempted_at: now,
    });

    // 2. Fetch current user progress
    let prog = await getUserProgress(params.userId);

    const newTotal = prog.total_questions + 1;
    const newCorrect = prog.correct_answers + (params.isCorrect ? 1 : 0);
    const newWrong = prog.wrong_answers + (params.isCorrect ? 0 : 1);
    const newAccuracy = Math.round((newCorrect / newTotal) * 100);
    const newStudyTime = prog.total_study_time + params.timeSpent;

    // 3. Upsert daily activity
    const dailyRecords = await db
      .select()
      .from(daily_activity)
      .where(
        and(
          eq(daily_activity.user_id, params.userId),
          eq(daily_activity.activity_date, today)
        )
      );

    let currentDayQuestions = 1;
    let currentDayCorrect = params.isCorrect ? 1 : 0;
    let currentDayTime = params.timeSpent;

    if (dailyRecords.length === 0) {
      await db.insert(daily_activity).values({
        user_id: params.userId,
        activity_date: today,
        questions_answered: currentDayQuestions,
        correct_answers: currentDayCorrect,
        study_time: currentDayTime,
        completed_session: 0,
      });
    } else {
      currentDayQuestions = dailyRecords[0].questions_answered + 1;
      currentDayCorrect = dailyRecords[0].correct_answers + (params.isCorrect ? 1 : 0);
      currentDayTime = dailyRecords[0].study_time + params.timeSpent;

      await db
        .update(daily_activity)
        .set({
          questions_answered: currentDayQuestions,
          correct_answers: currentDayCorrect,
          study_time: currentDayTime,
        })
        .where(eq(daily_activity.id, dailyRecords[0].id));
    }

    // 4. Streak Calculation Rule:
    // Rule: User must answer at least 5 questions in a day OR complete a quiz session.
    // Duplicate protection: Only increment once per calendar day.
    let newStreak = prog.current_streak;
    let newLongest = prog.longest_streak;
    let newLastActivityDate = prog.last_activity_date;

    const meetsStreakCondition = currentDayQuestions >= 5;

    if (meetsStreakCondition && prog.last_activity_date !== today) {
      const yesterday = getYesterdayDate(today);

      if (prog.last_activity_date === yesterday) {
        newStreak = prog.current_streak + 1;
      } else {
        newStreak = 1;
      }

      newLongest = Math.max(newLongest, newStreak);
      newLastActivityDate = today;
    }

    // 5. Update user_progress
    const updated = await db
      .update(user_progress)
      .set({
        total_questions: newTotal,
        correct_answers: newCorrect,
        wrong_answers: newWrong,
        accuracy: newAccuracy,
        total_study_time: newStudyTime,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: newLastActivityDate,
        updated_at: now,
      })
      .where(eq(user_progress.user_id, params.userId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Error in recordQuestionAttempt:', error);
    throw new Error('Gagal menyimpan riwayat pengerjaan soal.', { cause: error });
  }
}

// 4. RECORD COMPLETED QUIZ / TRYOUT ATTEMPT
export async function recordQuizAttempt(params: {
  userId: string;
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  duration: number; // in seconds
  startedAt?: Date;
  clientDate?: string;
}) {
  try {
    const today = params.clientDate || formatDate();
    const now = new Date();
    const started = params.startedAt || new Date(now.getTime() - params.duration * 1000);

    // 1. Insert quiz attempt
    const insertedQuiz = await db
      .insert(quiz_attempts)
      .values({
        user_id: params.userId,
        quiz_id: params.quizId,
        quiz_title: params.quizTitle,
        total_questions: params.totalQuestions,
        correct_answers: params.correctAnswers,
        wrong_answers: params.wrongAnswers,
        score: params.score,
        duration: params.duration,
        started_at: started,
        completed_at: now,
      })
      .returning();

    // 2. Fetch current progress
    let prog = await getUserProgress(params.userId);

    const newCompletedQuizzes = prog.total_completed_quizzes + 1;
    const newBestScore = Math.max(prog.best_score, params.score);
    // Weighted/Running average score calculation
    const prevTotalScores = prog.average_score * prog.total_completed_quizzes;
    const newAverageScore = Math.round((prevTotalScores + params.score) / newCompletedQuizzes);

    const newTotal = prog.total_questions + params.totalQuestions;
    const newCorrect = prog.correct_answers + params.correctAnswers;
    const newWrong = prog.wrong_answers + params.wrongAnswers;
    const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;
    const newStudyTime = prog.total_study_time + params.duration;

    // 3. Upsert daily activity
    const dailyRecords = await db
      .select()
      .from(daily_activity)
      .where(
        and(
          eq(daily_activity.user_id, params.userId),
          eq(daily_activity.activity_date, today)
        )
      );

    if (dailyRecords.length === 0) {
      await db.insert(daily_activity).values({
        user_id: params.userId,
        activity_date: today,
        questions_answered: params.totalQuestions,
        correct_answers: params.correctAnswers,
        study_time: params.duration,
        completed_session: 1,
      });
    } else {
      await db
        .update(daily_activity)
        .set({
          questions_answered: dailyRecords[0].questions_answered + params.totalQuestions,
          correct_answers: dailyRecords[0].correct_answers + params.correctAnswers,
          study_time: dailyRecords[0].study_time + params.duration,
          completed_session: dailyRecords[0].completed_session + 1,
        })
        .where(eq(daily_activity.id, dailyRecords[0].id));
    }

    // 4. Streak update (Completing a quiz immediately qualifies as 1 valid daily activity session)
    let newStreak = prog.current_streak;
    let newLongest = prog.longest_streak;
    let newLastActivityDate = prog.last_activity_date;

    if (prog.last_activity_date !== today) {
      const yesterday = getYesterdayDate(today);

      if (prog.last_activity_date === yesterday) {
        newStreak = prog.current_streak + 1;
      } else {
        newStreak = 1;
      }

      newLongest = Math.max(newLongest, newStreak);
      newLastActivityDate = today;
    }

    // 5. Update user_progress
    const updated = await db
      .update(user_progress)
      .set({
        total_questions: newTotal,
        correct_answers: newCorrect,
        wrong_answers: newWrong,
        accuracy: newAccuracy,
        total_study_time: newStudyTime,
        total_completed_quizzes: newCompletedQuizzes,
        best_score: newBestScore,
        average_score: newAverageScore,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: newLastActivityDate,
        updated_at: now,
      })
      .where(eq(user_progress.user_id, params.userId))
      .returning();

    return {
      attempt: insertedQuiz[0],
      progress: updated[0],
    };
  } catch (error) {
    console.error('Error in recordQuizAttempt:', error);
    throw new Error('Gagal menyimpan hasil tryout.', { cause: error });
  }
}

// 5. GET USER'S QUIZ HISTORY
export async function getUserQuizHistory(userId: string) {
  try {
    return await db
      .select()
      .from(quiz_attempts)
      .where(eq(quiz_attempts.user_id, userId))
      .orderBy(desc(quiz_attempts.completed_at));
  } catch (error) {
    console.error('Error in getUserQuizHistory:', error);
    throw new Error('Gagal mengambil riwayat tryout.', { cause: error });
  }
}

// 6. GET USER'S QUESTION ATTEMPTS (For review, wrong answers, and analytics)
export async function getUserQuestionAttempts(userId: string) {
  try {
    return await db
      .select()
      .from(question_attempts)
      .where(eq(question_attempts.user_id, userId))
      .orderBy(desc(question_attempts.attempted_at));
  } catch (error) {
    console.error('Error in getUserQuestionAttempts:', error);
    throw new Error('Gagal mengambil riwayat pengerjaan soal.', { cause: error });
  }
}

// 7. GET DAILY ACTIVITIES (For accurate progress graph)
export async function getUserDailyActivities(userId: string) {
  try {
    return await db
      .select()
      .from(daily_activity)
      .where(eq(daily_activity.user_id, userId))
      .orderBy(desc(daily_activity.activity_date));
  } catch (error) {
    console.error('Error in getUserDailyActivities:', error);
    throw new Error('Gagal mengambil data aktivitas harian.', { cause: error });
  }
}

// 8. FAVORITES / BOOKMARKS
export async function getUserFavorites(userId: string) {
  try {
    const list = await db
      .select()
      .from(user_favorites)
      .where(eq(user_favorites.user_id, userId));
    return list.map((f) => f.question_id);
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    throw new Error('Gagal mengambil daftar soal favorit.', { cause: error });
  }
}

export async function toggleUserFavorite(userId: string, questionId: string) {
  try {
    const existing = await db
      .select()
      .from(user_favorites)
      .where(
        and(
          eq(user_favorites.user_id, userId),
          eq(user_favorites.question_id, questionId)
        )
      );

    if (existing.length > 0) {
      await db
        .delete(user_favorites)
        .where(eq(user_favorites.id, existing[0].id));
      return { favorited: false, questionId };
    } else {
      await db.insert(user_favorites).values({
        user_id: userId,
        question_id: questionId,
      });
      return { favorited: true, questionId };
    }
  } catch (error) {
    console.error('Error in toggleUserFavorite:', error);
    throw new Error('Gagal mengubah status favorit soal.', { cause: error });
  }
}

// 9. UPDATE USER PROFILE TARGET
export async function updateUserTargetCategory(userId: string, targetCategory: string) {
  try {
    const updated = await db
      .update(profiles)
      .set({
        target_category: targetCategory,
        updated_at: new Date(),
      })
      .where(eq(profiles.auth_user_id, userId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error in updateUserTargetCategory:', error);
    throw new Error('Gagal memperbarui target kategori.', { cause: error });
  }
}

// 10. ALIN COMPANION FUNCTIONS
export function calculateAlinLevel(xp: number): number {
  if (xp >= 600) return 3; // Best Study Buddy
  if (xp >= 300) return 2; // Close
  if (xp >= 100) return 1; // Getting Comfortable
  return 0; // First Meeting
}

export async function getOrCreateAlinProfile(userId: string) {
  try {
    const existing = await db
      .select()
      .from(alin_profile)
      .where(eq(alin_profile.user_id, userId));

    if (existing.length > 0) {
      return existing[0];
    }

    const now = new Date();
    const created = await db
      .insert(alin_profile)
      .values({
        user_id: userId,
        familiarity_xp: 0,
        familiarity_level: 0,
        total_conversations: 0,
        total_messages: 0,
        created_at: now,
        updated_at: now,
      })
      .returning();

    return created[0];
  } catch (error) {
    console.error('Error in getOrCreateAlinProfile:', error);
    throw new Error('Gagal memuat profil ALIN.', { cause: error });
  }
}

export async function addAlinFamiliarityXp(userId: string, xpDelta: number) {
  try {
    const current = await getOrCreateAlinProfile(userId);
    const newXp = Math.max(0, current.familiarity_xp + xpDelta);
    const newLevel = calculateAlinLevel(newXp);
    const now = new Date();

    const updated = await db
      .update(alin_profile)
      .set({
        familiarity_xp: newXp,
        familiarity_level: newLevel,
        updated_at: now,
      })
      .where(eq(alin_profile.user_id, userId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Error in addAlinFamiliarityXp:', error);
    throw new Error('Gagal menambah XP kedekatan ALIN.', { cause: error });
  }
}

export async function getAlinConversations(userId: string) {
  try {
    return await db
      .select()
      .from(alin_conversations)
      .where(eq(alin_conversations.user_id, userId))
      .orderBy(desc(alin_conversations.updated_at));
  } catch (error) {
    console.error('Error in getAlinConversations:', error);
    throw new Error('Gagal mengambil daftar percakapan ALIN.', { cause: error });
  }
}

export async function createAlinConversation(userId: string, title: string = 'Obrolan Belajar') {
  try {
    const now = new Date();
    const conversation = await db
      .insert(alin_conversations)
      .values({
        user_id: userId,
        title,
        created_at: now,
        updated_at: now,
      })
      .returning();

    // Increment total_conversations on alin_profile
    const currentProfile = await getOrCreateAlinProfile(userId);
    await db
      .update(alin_profile)
      .set({
        total_conversations: currentProfile.total_conversations + 1,
        updated_at: now,
      })
      .where(eq(alin_profile.user_id, userId));

    return conversation[0];
  } catch (error) {
    console.error('Error in createAlinConversation:', error);
    throw new Error('Gagal membuat percakapan baru dengan ALIN.', { cause: error });
  }
}

export async function deleteAlinConversation(userId: string, conversationId: number) {
  try {
    await db
      .delete(alin_conversations)
      .where(
        and(
          eq(alin_conversations.id, conversationId),
          eq(alin_conversations.user_id, userId)
        )
      );
    return { success: true };
  } catch (error) {
    console.error('Error in deleteAlinConversation:', error);
    throw new Error('Gagal menghapus percakapan ALIN.', { cause: error });
  }
}

export async function getAlinMessages(conversationId: number, userId: string) {
  try {
    // Confirm conversation ownership
    const conv = await db
      .select()
      .from(alin_conversations)
      .where(
        and(
          eq(alin_conversations.id, conversationId),
          eq(alin_conversations.user_id, userId)
        )
      );

    if (conv.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(alin_messages)
      .where(eq(alin_messages.conversation_id, conversationId))
      .orderBy(alin_messages.created_at);
  } catch (error) {
    console.error('Error in getAlinMessages:', error);
    throw new Error('Gagal mengambil pesan percakapan ALIN.', { cause: error });
  }
}

export async function saveAlinMessage(data: {
  conversationId: number;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
}) {
  try {
    const now = new Date();
    const inserted = await db
      .insert(alin_messages)
      .values({
        conversation_id: data.conversationId,
        user_id: data.userId,
        role: data.role,
        content: data.content,
        created_at: now,
      })
      .returning();

    // Touch conversation updated_at
    await db
      .update(alin_conversations)
      .set({ updated_at: now })
      .where(eq(alin_conversations.id, data.conversationId));

    // Update profile stats
    const currentProfile = await getOrCreateAlinProfile(data.userId);
    await db
      .update(alin_profile)
      .set({
        total_messages: currentProfile.total_messages + 1,
        last_chat_at: now,
        updated_at: now,
      })
      .where(eq(alin_profile.user_id, data.userId));

    return inserted[0];
  } catch (error) {
    console.error('Error in saveAlinMessage:', error);
    throw new Error('Gagal menyimpan pesan ALIN.', { cause: error });
  }
}

// ============================================================================
// 11. QUESTION BANK & AUTO GENERATOR QUERIES
// ============================================================================

export function mapDbQuestionToModel(row: any): Question {
  let opts = { A: '', B: '', C: '', D: '', E: '' };
  try {
    opts = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
  } catch {}

  let tags: string[] = [];
  try {
    tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
  } catch {}

  return {
    id: row.question_id,
    question_id: row.question_id,
    question: row.question_text,
    question_text: row.question_text,
    question_type: row.question_type || 'multiple_choice',
    options: opts,
    correct_answer: row.correct_answer,
    explanation: row.explanation,
    hint: row.hint || '',
    formula: '',
    quick_tip: '',
    category: row.category,
    subcategory: row.subcategory || '',
    subject: row.subject || row.topic || row.subcategory || 'Umum',
    topic: row.topic || '',
    difficulty: row.difficulty,
    difficulty_score: row.difficulty_score || 5,
    source: row.source_type === 'AI' ? 'SOALIN Auto Question Engine (AI)' : 'Bank Soal Terstandar',
    source_type: row.source_type || 'AI',
    year: row.created_at ? new Date(row.created_at).getFullYear() : 2026,
    tags: Array.isArray(tags) ? tags : [],
    generator_version: row.generator_version || 'v1.2',
    quality_score: row.quality_score || 90,
    usage_count: row.usage_count || 0,
    report_count: row.report_count || 0,
    status: row.status || 'published',
    normalized_hash: row.normalized_hash || '',
    concept_key: row.concept_key || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function getQuestionsList(params: {
  category?: string;
  difficulty?: string;
  status?: string;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const offset = Math.max(0, params.offset || 0);

    const conditions: any[] = [];
    if (params.category && params.category !== 'all') {
      conditions.push(eq(questions.category, params.category));
    }
    if (params.difficulty && params.difficulty !== 'all') {
      conditions.push(eq(questions.difficulty, params.difficulty));
    }
    if (params.status && params.status !== 'all') {
      conditions.push(eq(questions.status, params.status));
    }
    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      conditions.push(or(
        ilike(questions.question_text, q),
        ilike(questions.category, q),
        ilike(questions.subcategory, q),
        ilike(questions.subject, q),
        ilike(questions.topic, q),
        ilike(questions.explanation, q),
        ilike(questions.hint, q),
        ilike(questions.question_id, q),
        ilike(questions.tags, q)
      ));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalRes] = await Promise.all([
      db
        .select()
        .from(questions)
        .where(whereClause)
        .orderBy(desc(questions.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(questions)
        .where(whereClause),
    ]);

    const total = totalRes[0]?.count || 0;
    const items = rows.map(mapDbQuestionToModel);

    return {
      questions: items,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error in getQuestionsList:', error);
    return { questions: [], total: 0, limit: params.limit || 50, offset: params.offset || 0 };
  }
}

export async function getAllActiveQuestions(): Promise<Question[]> {
  try {
    const rows = await db
      .select()
      .from(questions)
      .where(or(eq(questions.status, 'published'), eq(questions.status, 'approved'), eq(questions.status, 'active')))
      .orderBy(desc(questions.created_at))
      .limit(1000);

    return rows.map(mapDbQuestionToModel);
  } catch (error) {
    console.error('Error in getAllActiveQuestions:', error);
    return [];
  }
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  try {
    const rows = await db
      .select()
      .from(questions)
      .where(eq(questions.question_id, questionId))
      .limit(1);

    if (rows.length === 0) return null;
    return mapDbQuestionToModel(rows[0]);
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    return null;
  }
}

export async function getQuestionBankStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRes, todayRes, pendingRes, reportedRes, publishedRes, rejectedRes, catGroupRes] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(questions),
      db.select({ count: sql<number>`count(*)::int` }).from(questions).where(sql`${questions.created_at} >= ${today}`),
      db.select({ count: sql<number>`count(*)::int` }).from(questions).where(or(eq(questions.status, 'draft'), eq(questions.status, 'validation'))),
      db.select({ count: sql<number>`count(*)::int` }).from(questions).where(or(eq(questions.status, 'needs_review'), sql`${questions.report_count} > 0`)),
      db.select({ count: sql<number>`count(*)::int` }).from(questions).where(or(eq(questions.status, 'published'), eq(questions.status, 'active'), eq(questions.status, 'approved'))),
      db.select({ count: sql<number>`count(*)::int` }).from(questions).where(eq(questions.status, 'rejected')),
      db.select({ category: questions.category, count: sql<number>`count(*)::int` }).from(questions).groupBy(questions.category),
    ]);

    const categoryCounts: Record<string, number> = {};
    for (const c of catGroupRes) {
      if (c.category) categoryCounts[c.category] = c.count;
    }

    return {
      totalQuestions: totalRes[0]?.count || 0,
      newToday: todayRes[0]?.count || 0,
      pendingReview: pendingRes[0]?.count || 0,
      reported: reportedRes[0]?.count || 0,
      published: publishedRes[0]?.count || 0,
      rejected: rejectedRes[0]?.count || 0,
      categoryCounts,
    };
  } catch (error) {
    console.error('Error in getQuestionBankStats:', error);
    return {
      totalQuestions: 0,
      newToday: 0,
      pendingReview: 0,
      reported: 0,
      published: 0,
      rejected: 0,
      categoryCounts: {},
    };
  }
}

export async function saveQuestionRecord(data: Partial<Question>): Promise<Question> {
  const now = new Date();
  const qId = data.question_id || data.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const optsStr = typeof data.options === 'object' ? JSON.stringify(data.options) : String(data.options || '{}');
  const tagsStr = Array.isArray(data.tags) ? JSON.stringify(data.tags) : String(data.tags || '[]');

  const existing = await db.select().from(questions).where(eq(questions.question_id, qId)).limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(questions)
      .set({
        category: data.category || existing[0].category,
        subcategory: data.subcategory ?? existing[0].subcategory,
        subject: data.subject ?? existing[0].subject,
        question_text: data.question || data.question_text || existing[0].question_text,
        question_type: data.question_type || existing[0].question_type,
        options: optsStr,
        correct_answer: data.correct_answer || existing[0].correct_answer,
        explanation: data.explanation || existing[0].explanation,
        hint: data.hint ?? existing[0].hint,
        difficulty: data.difficulty || existing[0].difficulty,
        difficulty_score: data.difficulty_score ?? existing[0].difficulty_score,
        topic: data.topic ?? existing[0].topic,
        tags: tagsStr,
        status: data.status || existing[0].status,
        quality_score: data.quality_score ?? existing[0].quality_score,
        concept_key: data.concept_key ?? existing[0].concept_key,
        updated_at: now,
      })
      .where(eq(questions.question_id, qId))
      .returning();

    return mapDbQuestionToModel(updated[0]);
  } else {
    const inserted = await db
      .insert(questions)
      .values({
        question_id: qId,
        category: data.category || 'TIU',
        subcategory: data.subcategory || '',
        subject: data.subject || data.topic || data.category || '',
        question_text: data.question || data.question_text || '',
        question_type: data.question_type || 'multiple_choice',
        options: optsStr,
        correct_answer: data.correct_answer || 'A',
        explanation: data.explanation || '',
        hint: data.hint || '',
        difficulty: data.difficulty || 'Sedang',
        difficulty_score: data.difficulty_score || 5,
        topic: data.topic || '',
        tags: tagsStr,
        source_type: data.source_type || 'AI',
        generator_version: data.generator_version || 'v1.2',
        quality_score: data.quality_score || 90,
        usage_count: 0,
        report_count: 0,
        status: data.status || 'published',
        normalized_hash: data.normalized_hash || '',
        concept_key: data.concept_key || '',
        created_at: now,
        updated_at: now,
      })
      .returning();

    return mapDbQuestionToModel(inserted[0]);
  }
}

export async function updateQuestionStatus(questionId: string, status: string) {
  const updated = await db
    .update(questions)
    .set({ status, updated_at: new Date() })
    .where(eq(questions.question_id, questionId))
    .returning();
  return updated.length > 0 ? mapDbQuestionToModel(updated[0]) : null;
}

export async function bulkUpdateQuestionStatus(questionIds: string[], status: string) {
  if (questionIds.length === 0) return 0;
  const res = await db
    .update(questions)
    .set({ status, updated_at: new Date() })
    .where(inArray(questions.question_id, questionIds))
    .returning({ id: questions.question_id });
  return res.length;
}

export async function deleteQuestionRecord(questionId: string) {
  await db.delete(questions).where(eq(questions.question_id, questionId));
  return true;
}

export async function bulkDeleteQuestions(questionIds: string[]) {
  if (questionIds.length === 0) return 0;
  const res = await db
    .delete(questions)
    .where(inArray(questions.question_id, questionIds))
    .returning({ id: questions.question_id });
  return res.length;
}

// ============================================================================
// 12. QUESTION REPORTING SYSTEM
// ============================================================================

export async function recordQuestionReport(data: {
  questionId: string;
  userId: string;
  userName?: string;
  reason: string;
  details?: string;
}) {
  const inserted = await db
    .insert(question_reports)
    .values({
      question_id: data.questionId,
      user_id: data.userId,
      user_name: data.userName || 'Pengguna SOALIN',
      reason: data.reason,
      details: data.details || '',
      status: 'pending',
      created_at: new Date(),
    })
    .returning();

  // Increment report count on question and auto-flag if threshold reached
  await db
    .update(questions)
    .set({
      report_count: sql`${questions.report_count} + 1`,
      status: sql`CASE WHEN ${questions.report_count} >= 1 THEN 'needs_review' ELSE ${questions.status} END`,
      updated_at: new Date(),
    })
    .where(eq(questions.question_id, data.questionId));

  return inserted[0];
}

export async function getQuestionReports(status = 'all') {
  try {
    const query = db
      .select({
        report: question_reports,
        question: questions,
      })
      .from(question_reports)
      .leftJoin(questions, eq(question_reports.question_id, questions.question_id))
      .orderBy(desc(question_reports.created_at))
      .limit(100);

    const rows = await query;
    return rows.map(r => ({
      ...r.report,
      question: r.question ? mapDbQuestionToModel(r.question) : null,
    }));
  } catch (error) {
    console.error('Error in getQuestionReports:', error);
    return [];
  }
}

export async function resolveQuestionReport(reportId: number, status: 'resolved' | 'dismissed') {
  const updated = await db
    .update(question_reports)
    .set({ status, resolved_at: new Date() })
    .where(eq(question_reports.id, reportId))
    .returning();
  return updated[0] || null;
}

// ============================================================================
// 13. LEARNING PACKAGES (Daily, Personalized, Weekly Mock, Monthly Exam)
// ============================================================================

export async function getLearningPackages(type?: string, userId?: string) {
  try {
    const conditions: any[] = [eq(learning_packages.is_active, true)];
    if (type) conditions.push(eq(learning_packages.package_type, type));

    if (userId) {
      conditions.push(or(sql`${learning_packages.user_id} IS NULL`, eq(learning_packages.user_id, userId)));
    } else {
      conditions.push(sql`${learning_packages.user_id} IS NULL`);
    }

    const rows = await db
      .select()
      .from(learning_packages)
      .where(and(...conditions))
      .orderBy(desc(learning_packages.created_at))
      .limit(30);

    return rows.map(r => {
      let qIds: string[] = [];
      try {
        qIds = typeof r.question_ids === 'string' ? JSON.parse(r.question_ids) : r.question_ids;
      } catch {}
      return {
        ...r,
        question_ids: Array.isArray(qIds) ? qIds : [],
      };
    });
  } catch (error) {
    console.error('Error in getLearningPackages:', error);
    return [];
  }
}

export async function saveLearningPackage(data: {
  package_id: string;
  title: string;
  description?: string;
  package_type: string;
  category: string;
  target_date?: string;
  difficulty?: string;
  duration_minutes?: number;
  question_ids: string[];
  passing_score?: number;
  user_id?: string | null;
}) {
  const qIdsStr = JSON.stringify(data.question_ids || []);
  const existing = await db
    .select()
    .from(learning_packages)
    .where(eq(learning_packages.package_id, data.package_id))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(learning_packages)
      .set({
        title: data.title,
        description: data.description || existing[0].description,
        difficulty: data.difficulty || existing[0].difficulty,
        duration_minutes: data.duration_minutes || existing[0].duration_minutes,
        question_count: data.question_ids.length,
        question_ids: qIdsStr,
        passing_score: data.passing_score || existing[0].passing_score,
      })
      .where(eq(learning_packages.package_id, data.package_id))
      .returning();
    return updated[0];
  } else {
    const inserted = await db
      .insert(learning_packages)
      .values({
        package_id: data.package_id,
        title: data.title,
        description: data.description || '',
        package_type: data.package_type || 'daily',
        category: data.category || 'Campuran',
        target_date: data.target_date || formatDate(),
        difficulty: data.difficulty || 'Campuran',
        duration_minutes: data.duration_minutes || 30,
        question_count: data.question_ids.length,
        question_ids: qIdsStr,
        passing_score: data.passing_score || 65,
        user_id: data.user_id || null,
        is_active: true,
        created_at: new Date(),
      })
      .returning();
    return inserted[0];
  }
}

// ============================================================================
// 14. GENERATION LOGS & CONFIGS
// ============================================================================

export async function getGenerationLogs(limit = 20) {
  try {
    const rows = await db
      .select()
      .from(generation_logs)
      .orderBy(desc(generation_logs.started_at))
      .limit(limit);

    return rows.map(r => {
      let cats: string[] = [];
      try {
        cats = typeof r.categories_targeted === 'string' ? JSON.parse(r.categories_targeted) : r.categories_targeted;
      } catch {}
      let details: any = {};
      try {
        details = typeof r.details_json === 'string' ? JSON.parse(r.details_json) : r.details_json;
      } catch {}

      return {
        ...r,
        categories_targeted: Array.isArray(cats) ? cats : [],
        details_json: details,
      };
    });
  } catch (error) {
    console.error('Error in getGenerationLogs:', error);
    return [];
  }
}

export async function saveGenerationLog(data: {
  batch_id: string;
  trigger_type: string;
  status: string;
  categories_targeted: string[];
  total_requested: number;
  generated_count: number;
  passed_validation_count: number;
  duplicate_count: number;
  rejected_count: number;
  published_count: number;
  error_message?: string | null;
  details_json?: any;
  started_at?: Date;
  completed_at?: Date | null;
}) {
  const catsStr = JSON.stringify(data.categories_targeted || []);
  const detailsStr = JSON.stringify(data.details_json || {});

  const existing = await db
    .select()
    .from(generation_logs)
    .where(eq(generation_logs.batch_id, data.batch_id))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(generation_logs)
      .set({
        status: data.status,
        generated_count: data.generated_count,
        passed_validation_count: data.passed_validation_count,
        duplicate_count: data.duplicate_count,
        rejected_count: data.rejected_count,
        published_count: data.published_count,
        error_message: data.error_message || null,
        details_json: detailsStr,
        completed_at: data.completed_at || new Date(),
      })
      .where(eq(generation_logs.batch_id, data.batch_id))
      .returning();
    return updated[0];
  } else {
    const inserted = await db
      .insert(generation_logs)
      .values({
        batch_id: data.batch_id,
        trigger_type: data.trigger_type || 'scheduler',
        status: data.status || 'running',
        categories_targeted: catsStr,
        total_requested: data.total_requested || 0,
        generated_count: data.generated_count || 0,
        passed_validation_count: data.passed_validation_count || 0,
        duplicate_count: data.duplicate_count || 0,
        rejected_count: data.rejected_count || 0,
        published_count: data.published_count || 0,
        error_message: data.error_message || null,
        details_json: detailsStr,
        started_at: data.started_at || new Date(),
        completed_at: data.completed_at || null,
      })
      .returning();
    return inserted[0];
  }
}

export async function getGenerationConfig() {
  try {
    const rows = await db
      .select()
      .from(generation_configs)
      .where(eq(generation_configs.config_key, 'daily_generation_settings'))
      .limit(1);

    if (rows.length > 0) {
      const r = rows[0];
      let catDist = { 'TIU': 35, 'TWK': 35, 'TKP': 25, 'Bahasa Inggris': 20, 'Matematika': 20, 'Psikotes': 15, 'Pengetahuan Umum': 15, 'Tes Fisik': 15 };
      let diffDist = { 'Easy': 20, 'Medium': 40, 'Hard': 30, 'Very Hard': 10 };
      try { catDist = JSON.parse(r.category_distribution); } catch {}
      try { diffDist = JSON.parse(r.difficulty_distribution); } catch {}

      return {
        ...r,
        category_distribution: catDist,
        difficulty_distribution: diffDist,
      };
    }

    // Default configuration
    return {
      id: 0,
      config_key: 'daily_generation_settings',
      daily_target_total: 120,
      category_distribution: {
        'TIU': 35,
        'TWK': 35,
        'TKP': 25,
        'Bahasa Inggris': 20,
        'Matematika': 20,
        'Psikotes': 15,
        'Pengetahuan Umum': 15,
        'Tes Fisik': 15,
      },
      difficulty_distribution: {
        'Easy': 20,
        'Medium': 40,
        'Hard': 30,
        'Very Hard': 10,
      },
      auto_schedule_enabled: true,
      min_stock_threshold: 30,
      quality_score_threshold: 80,
      similarity_threshold: 75,
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in getGenerationConfig:', error);
    return null;
  }
}

export async function updateGenerationConfig(data: {
  daily_target_total?: number;
  category_distribution?: Record<string, number>;
  difficulty_distribution?: Record<string, number>;
  auto_schedule_enabled?: boolean;
  min_stock_threshold?: number;
  quality_score_threshold?: number;
  similarity_threshold?: number;
}) {
  const catDistStr = JSON.stringify(data.category_distribution || {});
  const diffDistStr = JSON.stringify(data.difficulty_distribution || {});

  const existing = await db
    .select()
    .from(generation_configs)
    .where(eq(generation_configs.config_key, 'daily_generation_settings'))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db
      .update(generation_configs)
      .set({
        daily_target_total: data.daily_target_total ?? existing[0].daily_target_total,
        category_distribution: data.category_distribution ? catDistStr : existing[0].category_distribution,
        difficulty_distribution: data.difficulty_distribution ? diffDistStr : existing[0].difficulty_distribution,
        auto_schedule_enabled: data.auto_schedule_enabled ?? existing[0].auto_schedule_enabled,
        min_stock_threshold: data.min_stock_threshold ?? existing[0].min_stock_threshold,
        quality_score_threshold: data.quality_score_threshold ?? existing[0].quality_score_threshold,
        similarity_threshold: data.similarity_threshold ?? existing[0].similarity_threshold,
        updated_at: new Date(),
      })
      .where(eq(generation_configs.config_key, 'daily_generation_settings'))
      .returning();
    return updated[0];
  } else {
    const inserted = await db
      .insert(generation_configs)
      .values({
        config_key: 'daily_generation_settings',
        daily_target_total: data.daily_target_total || 120,
        category_distribution: catDistStr,
        difficulty_distribution: diffDistStr,
        auto_schedule_enabled: data.auto_schedule_enabled ?? true,
        min_stock_threshold: data.min_stock_threshold || 30,
        quality_score_threshold: data.quality_score_threshold || 80,
        similarity_threshold: data.similarity_threshold || 75,
        updated_at: new Date(),
      })
      .returning();
    return inserted[0];
  }
}

// ============================================================================
// 15. LEADERBOARD / PERINGKAT QUERIES
// ============================================================================

export interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  xp: number;
  totalQuestions: number;
  totalCorrect: number;
  totalTryouts: number;
  streak: number;
  accuracy: number;
  targetCategory: string;
}

export async function getLeaderboardData(params: {
  timeframe?: 'today' | 'week' | 'month' | 'all';
  category?: string;
  page?: number;
  limit?: number;
  currentUserId?: string;
}) {
  try {
    const timeframe = params.timeframe || 'all';
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 25));

    // 1. Fetch all profiles joined with their progress
    const userRows = await db
      .select({
        userId: profiles.auth_user_id,
        fullName: profiles.full_name,
        username: profiles.username,
        avatarUrl: profiles.avatar_url,
        targetCategory: profiles.target_category,
        xp: user_progress.xp,
        totalQuestions: user_progress.total_questions,
        correctAnswers: user_progress.correct_answers,
        wrongAnswers: user_progress.wrong_answers,
        accuracy: user_progress.accuracy,
        totalCompletedQuizzes: user_progress.total_completed_quizzes,
        currentStreak: user_progress.current_streak,
        longestStreak: user_progress.longest_streak,
        lastActivityDate: user_progress.last_activity_date,
      })
      .from(profiles)
      .innerJoin(user_progress, eq(profiles.auth_user_id, user_progress.user_id));

    // 2. Filter by category if requested
    let filteredUsers = userRows;
    if (params.category && params.category !== 'all') {
      const catLower = params.category.toLowerCase();
      filteredUsers = userRows.filter(u => 
        (u.targetCategory || '').toLowerCase().includes(catLower)
      );
    }

    // 3. Compute XP based on timeframe
    let timeframeXpMap: Record<string, number> = {};

    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      if (timeframe === 'today') {
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      } else if (timeframe === 'week') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        // month
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Query real user_activity grouped by user
      const activitySums = await db
        .select({
          userId: user_activity.user_id,
          totalPeriodXp: sql<number>`COALESCE(SUM(${user_activity.xp_earned}), 0)::int`,
        })
        .from(user_activity)
        .where(sql`${user_activity.created_at} >= ${cutoffDate}`)
        .groupBy(user_activity.user_id);

      for (const act of activitySums) {
        timeframeXpMap[act.userId] = act.totalPeriodXp;
      }
    }

    // 4. Map and rank users
    const rankedList: LeaderboardUserEntry[] = filteredUsers
      .map(u => {
        let displayXp: number;
        if (timeframe === 'all') {
          displayXp = (u.xp && u.xp > 0)
            ? u.xp
            : ((u.totalQuestions * 15) + (u.correctAnswers * 25) + (u.totalCompletedQuizzes * 100));
        } else {
          displayXp = timeframeXpMap[u.userId] || 0;
        }

        const totalQ = u.totalQuestions || 0;
        const totalC = u.correctAnswers || 0;
        const calculatedAccuracy = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
        const genUsername = u.username || ('@' + (u.fullName || 'user').toLowerCase().replace(/[^a-z0-9]/g, ''));

        return {
          rank: 0,
          userId: u.userId,
          name: u.fullName || 'Pelajar SOALIN',
          username: genUsername,
          avatarUrl: u.avatarUrl || '',
          xp: displayXp,
          totalQuestions: totalQ,
          totalCorrect: totalC,
          totalTryouts: u.totalCompletedQuizzes || 0,
          streak: u.currentStreak || 0,
          accuracy: calculatedAccuracy,
          targetCategory: u.targetCategory || 'Umum & Seleksi',
        };
      })
      .sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.streak - a.streak;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // 5. Locate current user rank (even if outside current page)
    let currentUserRank: LeaderboardUserEntry | null = null;
    if (params.currentUserId) {
      const found = rankedList.find(r => r.userId === params.currentUserId);
      if (found) {
        currentUserRank = found;
      } else {
        const userInAll = userRows.find(u => u.userId === params.currentUserId);
        if (userInAll) {
          currentUserRank = {
            rank: rankedList.length + 1,
            userId: userInAll.userId,
            name: userInAll.fullName || 'Pengguna SOALIN',
            username: userInAll.username || '@' + (userInAll.fullName || 'user').toLowerCase().replace(/[^a-z0-9]/g, ''),
            avatarUrl: userInAll.avatarUrl || '',
            xp: userInAll.xp || 0,
            totalQuestions: userInAll.totalQuestions || 0,
            totalCorrect: userInAll.correctAnswers || 0,
            totalTryouts: userInAll.totalCompletedQuizzes || 0,
            streak: userInAll.currentStreak || 0,
            accuracy: userInAll.totalQuestions > 0 ? Math.round((userInAll.correctAnswers / userInAll.totalQuestions) * 100) : 0,
            targetCategory: userInAll.targetCategory || 'Umum',
          };
        }
      }
    }

    // 6. Pagination slice
    const offset = (page - 1) * limit;
    const paginatedLeaderboard = rankedList.slice(offset, offset + limit);

    return {
      leaderboard: paginatedLeaderboard,
      totalUsers: rankedList.length,
      currentUserRank,
      page,
      limit,
      totalPages: Math.ceil(rankedList.length / limit) || 1,
      timeframe,
    };
  } catch (error) {
    console.error('Error in getLeaderboardData:', error);
    throw new Error('Gagal mengambil data papan peringkat.', { cause: error });
  }
}


