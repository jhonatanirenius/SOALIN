import { db } from '../db/index.ts';
import { profiles, user_progress, user_activity } from '../db/schema.ts';
import { sql, eq } from 'drizzle-orm';

export interface SeedCompetitor {
  auth_user_id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  target_category: string;
  xp: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  total_study_time: number;
  total_completed_quizzes: number;
  best_score: number;
  average_score: number;
  current_streak: number;
  longest_streak: number;
  today_xp: number;
  week_xp: number;
  month_xp: number;
}

const COMPETITORS: SeedCompetitor[] = [
  {
    auth_user_id: 'seed_user_andi',
    email: 'andi.prasetyo@soalin.id',
    full_name: 'Andi Prasetyo',
    username: '@andiprasetyo',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    target_category: 'CPNS & PPPK 2026 (SKD TWK, TIU, TKP)',
    xp: 12540,
    total_questions: 380,
    correct_answers: 342,
    wrong_answers: 38,
    accuracy: 90,
    total_study_time: 4200,
    total_completed_quizzes: 28,
    best_score: 100,
    average_score: 91,
    current_streak: 18,
    longest_streak: 18,
    today_xp: 450,
    week_xp: 2600,
    month_xp: 7200,
  },
  {
    auth_user_id: 'seed_user_budi',
    email: 'budi.santoso@soalin.id',
    full_name: 'Budi Santoso',
    username: '@budisantoso',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    target_category: 'Sekolah Kedinasan (IPDN, STAN, STIS, STIN)',
    xp: 11920,
    total_questions: 350,
    correct_answers: 308,
    wrong_answers: 42,
    accuracy: 88,
    total_study_time: 3900,
    total_completed_quizzes: 25,
    best_score: 98,
    average_score: 89,
    current_streak: 15,
    longest_streak: 15,
    today_xp: 520,
    week_xp: 2450,
    month_xp: 6800,
  },
  {
    auth_user_id: 'seed_user_siska',
    email: 'siska.amelia@soalin.id',
    full_name: 'Siska Amelia',
    username: '@siskaamelia',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    target_category: 'TNI & POLRI (AKMIL, AAL, AAU, AKPOL)',
    xp: 10850,
    total_questions: 320,
    correct_answers: 275,
    wrong_answers: 45,
    accuracy: 86,
    total_study_time: 3600,
    total_completed_quizzes: 22,
    best_score: 96,
    average_score: 87,
    current_streak: 12,
    longest_streak: 14,
    today_xp: 380,
    week_xp: 2100,
    month_xp: 6100,
  },
  {
    auth_user_id: 'seed_user_rian',
    email: 'rian.hidayat@soalin.id',
    full_name: 'Rian Hidayat',
    username: '@rianhidayat',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    target_category: 'CPNS & PPPK 2026 (SKD TWK, TIU, TKP)',
    xp: 9720,
    total_questions: 290,
    correct_answers: 246,
    wrong_answers: 44,
    accuracy: 85,
    total_study_time: 3200,
    total_completed_quizzes: 19,
    best_score: 94,
    average_score: 85,
    current_streak: 10,
    longest_streak: 12,
    today_xp: 320,
    week_xp: 1850,
    month_xp: 5400,
  },
  {
    auth_user_id: 'seed_user_dwikartika',
    email: 'dwi.kartika@soalin.id',
    full_name: 'Dwi Kartika',
    username: '@dwikartika',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    target_category: 'UTBK - SNBT PTN Impian',
    xp: 8940,
    total_questions: 270,
    correct_answers: 224,
    wrong_answers: 46,
    accuracy: 83,
    total_study_time: 2900,
    total_completed_quizzes: 17,
    best_score: 92,
    average_score: 84,
    current_streak: 9,
    longest_streak: 10,
    today_xp: 290,
    week_xp: 1600,
    month_xp: 4900,
  },
  {
    auth_user_id: 'seed_user_mfajar',
    email: 'muhammad.fajar@soalin.id',
    full_name: 'Muhammad Fajar',
    username: '@mfajar_id',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    target_category: 'Sekolah Kedinasan (IPDN, STAN, STIS, STIN)',
    xp: 8150,
    total_questions: 245,
    correct_answers: 201,
    wrong_answers: 44,
    accuracy: 82,
    total_study_time: 2600,
    total_completed_quizzes: 16,
    best_score: 90,
    average_score: 83,
    current_streak: 8,
    longest_streak: 8,
    today_xp: 240,
    week_xp: 1450,
    month_xp: 4400,
  },
  {
    auth_user_id: 'seed_user_sitinur',
    email: 'siti.nurhaliza@soalin.id',
    full_name: 'Siti Nurhaliza',
    username: '@sitinur',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    target_category: 'Rekrutmen Bersama BUMN (TKD & Core Values)',
    xp: 7640,
    total_questions: 230,
    correct_answers: 186,
    wrong_answers: 44,
    accuracy: 81,
    total_study_time: 2400,
    total_completed_quizzes: 14,
    best_score: 90,
    average_score: 82,
    current_streak: 7,
    longest_streak: 9,
    today_xp: 200,
    week_xp: 1300,
    month_xp: 4100,
  },
  {
    auth_user_id: 'seed_user_rizky',
    email: 'rizky.pratama@soalin.id',
    full_name: 'Rizky Pratama',
    username: '@rizkypratama',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    target_category: 'TNI & POLRI (AKMIL, AAL, AAU, AKPOL)',
    xp: 6980,
    total_questions: 210,
    correct_answers: 168,
    wrong_answers: 42,
    accuracy: 80,
    total_study_time: 2100,
    total_completed_quizzes: 13,
    best_score: 88,
    average_score: 80,
    current_streak: 6,
    longest_streak: 8,
    today_xp: 180,
    week_xp: 1100,
    month_xp: 3700,
  },
  {
    auth_user_id: 'seed_user_putri',
    email: 'putri.maharani@soalin.id',
    full_name: 'Putri Maharani',
    username: '@putrimaharani',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    target_category: 'CPNS & PPPK 2026 (SKD TWK, TIU, TKP)',
    xp: 6320,
    total_questions: 190,
    correct_answers: 148,
    wrong_answers: 42,
    accuracy: 78,
    total_study_time: 1900,
    total_completed_quizzes: 12,
    best_score: 86,
    average_score: 79,
    current_streak: 5,
    longest_streak: 7,
    today_xp: 150,
    week_xp: 950,
    month_xp: 3300,
  },
  {
    auth_user_id: 'seed_user_dimas',
    email: 'dimas.wicaksono@soalin.id',
    full_name: 'Dimas Wicaksono',
    username: '@dimaswicak',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    target_category: 'Sekolah Kedinasan (IPDN, STAN, STIS, STIN)',
    xp: 5750,
    total_questions: 175,
    correct_answers: 133,
    wrong_answers: 42,
    accuracy: 76,
    total_study_time: 1700,
    total_completed_quizzes: 11,
    best_score: 85,
    average_score: 77,
    current_streak: 4,
    longest_streak: 6,
    today_xp: 120,
    week_xp: 850,
    month_xp: 2950,
  },
  {
    auth_user_id: 'seed_user_anisa',
    email: 'anisa.rahma@soalin.id',
    full_name: 'Anisa Rahma',
    username: '@anisa_rahma',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    target_category: 'UTBK - SNBT PTN Impian',
    xp: 4890,
    total_questions: 150,
    correct_answers: 112,
    wrong_answers: 38,
    accuracy: 75,
    total_study_time: 1400,
    total_completed_quizzes: 9,
    best_score: 84,
    average_score: 76,
    current_streak: 4,
    longest_streak: 5,
    today_xp: 90,
    week_xp: 700,
    month_xp: 2400,
  },
  {
    auth_user_id: 'seed_user_bayu',
    email: 'bayu.nugroho@soalin.id',
    full_name: 'Bayu Nugroho',
    username: '@bayunugroho',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    target_category: 'CPNS & PPPK 2026 (SKD TWK, TIU, TKP)',
    xp: 4210,
    total_questions: 130,
    correct_answers: 95,
    wrong_answers: 35,
    accuracy: 73,
    total_study_time: 1200,
    total_completed_quizzes: 8,
    best_score: 82,
    average_score: 74,
    current_streak: 3,
    longest_streak: 4,
    today_xp: 80,
    week_xp: 580,
    month_xp: 2100,
  },
  {
    auth_user_id: 'seed_user_hendra',
    email: 'hendra.saputra@soalin.id',
    full_name: 'Hendra Saputra',
    username: '@hendrasaputra',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    target_category: 'TNI & POLRI (AKMIL, AAL, AAU, AKPOL)',
    xp: 3650,
    total_questions: 115,
    correct_answers: 83,
    wrong_answers: 32,
    accuracy: 72,
    total_study_time: 1050,
    total_completed_quizzes: 7,
    best_score: 80,
    average_score: 73,
    current_streak: 2,
    longest_streak: 4,
    today_xp: 60,
    week_xp: 480,
    month_xp: 1800,
  },
  {
    auth_user_id: 'seed_user_fadhil',
    email: 'fadhil.rahman@soalin.id',
    full_name: 'Fadhil Rahman',
    username: '@fadhilr',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    target_category: 'Rekrutmen Bersama BUMN (TKD & Core Values)',
    xp: 2980,
    total_questions: 95,
    correct_answers: 67,
    wrong_answers: 28,
    accuracy: 71,
    total_study_time: 850,
    total_completed_quizzes: 6,
    best_score: 78,
    average_score: 71,
    current_streak: 2,
    longest_streak: 3,
    today_xp: 50,
    week_xp: 390,
    month_xp: 1400,
  },
  {
    auth_user_id: 'seed_user_tari',
    email: 'tari.anggraini@soalin.id',
    full_name: 'Tari Anggraini',
    username: '@tarianggraini',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    target_category: 'Sekolah Kedinasan (IPDN, STAN, STIS, STIN)',
    xp: 2450,
    total_questions: 80,
    correct_answers: 55,
    wrong_answers: 25,
    accuracy: 69,
    total_study_time: 700,
    total_completed_quizzes: 5,
    best_score: 75,
    average_score: 69,
    current_streak: 1,
    longest_streak: 3,
    today_xp: 40,
    week_xp: 320,
    month_xp: 1100,
  },
  {
    auth_user_id: 'seed_user_gilang',
    email: 'gilang.ramadhan@soalin.id',
    full_name: 'Gilang Ramadhan',
    username: '@gilangramadhan',
    avatar_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    target_category: 'CPNS & PPPK 2026 (SKD TWK, TIU, TKP)',
    xp: 1950,
    total_questions: 65,
    correct_answers: 44,
    wrong_answers: 21,
    accuracy: 68,
    total_study_time: 550,
    total_completed_quizzes: 4,
    best_score: 74,
    average_score: 68,
    current_streak: 1,
    longest_streak: 2,
    today_xp: 30,
    week_xp: 240,
    month_xp: 880,
  },
  {
    auth_user_id: 'seed_user_nadia',
    email: 'nadia.permata@soalin.id',
    full_name: 'Nadia Permata',
    username: '@nadiapermata',
    avatar_url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    target_category: 'UTBK - SNBT PTN Impian',
    xp: 1420,
    total_questions: 50,
    correct_answers: 33,
    wrong_answers: 17,
    accuracy: 66,
    total_study_time: 400,
    total_completed_quizzes: 3,
    best_score: 70,
    average_score: 65,
    current_streak: 1,
    longest_streak: 2,
    today_xp: 20,
    week_xp: 180,
    month_xp: 650,
  },
];

export async function seedLeaderboardDatabase() {
  try {
    console.log('[Leaderboard Seed] Memeriksa data leaderboard di Cloud SQL...');
    
    // Check if competitors already seeded
    const seededCountRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(profiles)
      .where(sql`${profiles.auth_user_id} LIKE 'seed_user_%'`);
    
    const count = seededCountRes[0]?.count || 0;
    if (count >= 10) {
      console.log(`[Leaderboard Seed] Data leaderboard sudah tersedia (${count} profil komunitas).`);
      return;
    }

    console.log('[Leaderboard Seed] Menambahkan profil komunitas dan aktivitas belajar...');
    const now = new Date();

    for (const c of COMPETITORS) {
      // 1. Upsert profile
      const existingProfile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.auth_user_id, c.auth_user_id));

      if (existingProfile.length === 0) {
        await db.insert(profiles).values({
          auth_user_id: c.auth_user_id,
          email: c.email,
          full_name: c.full_name,
          username: c.username,
          avatar_url: c.avatar_url,
          target_category: c.target_category,
          created_at: now,
          updated_at: now,
          last_login_at: now,
        });
      }

      // 2. Upsert user_progress
      const existingProg = await db
        .select()
        .from(user_progress)
        .where(eq(user_progress.user_id, c.auth_user_id));

      if (existingProg.length === 0) {
        await db.insert(user_progress).values({
          user_id: c.auth_user_id,
          xp: c.xp,
          total_questions: c.total_questions,
          correct_answers: c.correct_answers,
          wrong_answers: c.wrong_answers,
          accuracy: c.accuracy,
          total_study_time: c.total_study_time,
          total_completed_quizzes: c.total_completed_quizzes,
          best_score: c.best_score,
          average_score: c.average_score,
          current_streak: c.current_streak,
          longest_streak: c.longest_streak,
          last_activity_date: new Date().toISOString().split('T')[0],
          created_at: now,
          updated_at: now,
        });
      } else {
        await db
          .update(user_progress)
          .set({
            xp: c.xp,
            total_questions: c.total_questions,
            correct_answers: c.correct_answers,
            wrong_answers: c.wrong_answers,
            accuracy: c.accuracy,
            current_streak: c.current_streak,
            total_completed_quizzes: c.total_completed_quizzes,
            updated_at: now,
          })
          .where(eq(user_progress.user_id, c.auth_user_id));
      }

      // 3. Insert real time-segmented user_activity for today, this week, this month
      // Today activity
      const todayDate = new Date();
      await db.insert(user_activity).values({
        user_id: c.auth_user_id,
        activity_type: 'daily_learning',
        xp_earned: c.today_xp,
        attempt_id: `seed_act_today_${c.auth_user_id}`,
        metadata: JSON.stringify({ note: 'Aktivitas Belajar Hari Ini' }),
        created_at: todayDate,
      }).onConflictDoNothing();

      // Week activity (3 days ago)
      const weekDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      await db.insert(user_activity).values({
        user_id: c.auth_user_id,
        activity_type: 'weekly_tryout',
        xp_earned: Math.max(0, c.week_xp - c.today_xp),
        attempt_id: `seed_act_week_${c.auth_user_id}`,
        metadata: JSON.stringify({ note: 'Tryout Mingguan Selesai' }),
        created_at: weekDate,
      }).onConflictDoNothing();

      // Month activity (15 days ago)
      const monthDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      await db.insert(user_activity).values({
        user_id: c.auth_user_id,
        activity_type: 'monthly_practice',
        xp_earned: Math.max(0, c.month_xp - c.week_xp),
        attempt_id: `seed_act_month_${c.auth_user_id}`,
        metadata: JSON.stringify({ note: 'Sesi Latihan Bulanan' }),
        created_at: monthDate,
      }).onConflictDoNothing();
    }

    // Also update existing user Joni Vernandez's XP & username if not set
    const joniProg = await db
      .select()
      .from(user_progress)
      .where(sql`${user_progress.user_id} NOT LIKE 'seed_user_%'`);

    for (const jp of joniProg) {
      if (jp.xp === 0 && jp.total_questions > 0) {
        const computed = (jp.total_questions * 15) + (jp.correct_answers * 25) + (jp.total_completed_quizzes * 100);
        await db.update(user_progress).set({ xp: computed }).where(eq(user_progress.id, jp.id));
      }
    }

    console.log('[Leaderboard Seed] Seeding data komunitas selesai.');
  } catch (error) {
    console.error('Error seeding leaderboard:', error);
  }
}
