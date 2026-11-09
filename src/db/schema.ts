import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

// 1. User Profiles Table (Linked to authenticated Google OAuth UID)
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  auth_user_id: text('auth_user_id').notNull().unique(),
  email: text('email').notNull(),
  full_name: text('full_name').notNull().default(''),
  username: text('username'),
  avatar_url: text('avatar_url').default(''),
  target_category: text('target_category').default('CPNS & ASN'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  last_login_at: timestamp('last_login_at').defaultNow().notNull(),
});

// 2. Learning Progress Table (Persistent per authenticated user)
export const user_progress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().unique().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  xp: integer('xp').notNull().default(0),
  total_questions: integer('total_questions').notNull().default(0),
  correct_answers: integer('correct_answers').notNull().default(0),
  wrong_answers: integer('wrong_answers').notNull().default(0),
  accuracy: integer('accuracy').notNull().default(0),
  total_study_time: integer('total_study_time').notNull().default(0), // in seconds
  total_completed_quizzes: integer('total_completed_quizzes').notNull().default(0),
  best_score: integer('best_score').notNull().default(0),
  average_score: integer('average_score').notNull().default(0),
  current_streak: integer('current_streak').notNull().default(0),
  longest_streak: integer('longest_streak').notNull().default(0),
  last_activity_date: text('last_activity_date'), // Format YYYY-MM-DD
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('user_progress_xp_idx').on(table.xp),
]);

// 2b. User Activity Table (Anti-cheating XP audit ledger with unique attempt ID)
export const user_activity = pgTable('user_activity', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  activity_type: text('activity_type').notNull(),
  xp_earned: integer('xp_earned').notNull().default(0),
  question_id: text('question_id'),
  tryout_id: text('tryout_id'),
  attempt_id: text('attempt_id'),
  metadata: text('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_activity_attempt_id_idx').on(table.attempt_id),
  index('user_activity_user_created_idx').on(table.user_id, table.created_at),
  index('user_activity_created_idx').on(table.created_at),
]);

// 3. Question Attempts Table (Every single answered question attempt)
export const question_attempts = pgTable('question_attempts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  question_id: text('question_id').notNull(),
  selected_answer: text('selected_answer').notNull(),
  correct_answer: text('correct_answer').notNull(),
  is_correct: boolean('is_correct').notNull(),
  time_spent: integer('time_spent').notNull().default(0), // in seconds
  attempted_at: timestamp('attempted_at').defaultNow().notNull(),
});

// 4. Quiz / Tryout Attempts Table (Completed CBT sessions)
export const quiz_attempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  quiz_id: text('quiz_id').notNull(),
  quiz_title: text('quiz_title').notNull().default(''),
  total_questions: integer('total_questions').notNull(),
  correct_answers: integer('correct_answers').notNull(),
  wrong_answers: integer('wrong_answers').notNull(),
  score: integer('score').notNull(),
  duration: integer('duration').notNull(), // in seconds
  started_at: timestamp('started_at').defaultNow().notNull(),
  completed_at: timestamp('completed_at').defaultNow().notNull(),
});

// 5. Daily Activity Table (Ensures exact atomic 1-day streak increment)
export const daily_activity = pgTable('daily_activity', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  activity_date: text('activity_date').notNull(), // Format YYYY-MM-DD
  questions_answered: integer('questions_answered').notNull().default(0),
  correct_answers: integer('correct_answers').notNull().default(0),
  study_time: integer('study_time').notNull().default(0), // in seconds
  completed_session: integer('completed_session').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('daily_activity_user_date_idx').on(table.user_id, table.activity_date),
]);

// 6. User Bookmarked / Favorite Questions Table
export const user_favorites = pgTable('user_favorites', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  question_id: text('question_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_favorites_user_qid_idx').on(table.user_id, table.question_id),
]);

// 7. ALIN AI Companion Profile & Familiarity Level
export const alin_profile = pgTable('alin_profile', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().unique().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  familiarity_xp: integer('familiarity_xp').notNull().default(0),
  familiarity_level: integer('familiarity_level').notNull().default(0), // 0: First Meeting, 1: Getting Comfortable, 2: Close, 3: Best Study Buddy
  total_conversations: integer('total_conversations').notNull().default(0),
  total_messages: integer('total_messages').notNull().default(0),
  last_chat_at: timestamp('last_chat_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 8. ALIN Conversations
export const alin_conversations = pgTable('alin_conversations', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Obrolan Belajar'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 9. ALIN Chat Messages
export const alin_messages = pgTable('alin_messages', {
  id: serial('id').primaryKey(),
  conversation_id: integer('conversation_id').notNull().references(() => alin_conversations.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => profiles.auth_user_id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 10. Questions Bank Table
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  question_id: text('question_id').notNull().unique(),
  category: text('category').notNull(),
  subcategory: text('subcategory').notNull().default(''),
  subject: text('subject').notNull().default(''),
  question_text: text('question_text').notNull(),
  question_type: text('question_type').notNull().default('multiple_choice'),
  options: text('options').notNull(), // JSON string: { "A": "...", "B": "...", ... }
  correct_answer: text('correct_answer').notNull(), // 'A' | 'B' | 'C' | 'D' | 'E'
  explanation: text('explanation').notNull(),
  hint: text('hint').notNull().default(''),
  difficulty: text('difficulty').notNull().default('Sedang'), // Easy, Medium, Hard, Very Hard / Mudah, Sedang, Sulit
  difficulty_score: integer('difficulty_score').notNull().default(5), // 1 - 10
  topic: text('topic').notNull().default(''),
  tags: text('tags').notNull().default('[]'), // JSON array of string tags
  source_type: text('source_type').notNull().default('AI'), // 'AI' | 'CURATED' | 'OFFICIAL'
  generator_version: text('generator_version').notNull().default('v1.2'),
  quality_score: integer('quality_score').notNull().default(90), // 0 - 100
  usage_count: integer('usage_count').notNull().default(0),
  report_count: integer('report_count').notNull().default(0),
  status: text('status').notNull().default('published'), // 'draft' | 'validation' | 'approved' | 'published' | 'active' | 'needs_review' | 'archived' | 'rejected'
  normalized_hash: text('normalized_hash').notNull().default(''),
  concept_key: text('concept_key').notNull().default(''),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('questions_cat_idx').on(table.category),
  index('questions_status_idx').on(table.status),
  index('questions_difficulty_idx').on(table.difficulty),
  index('questions_created_idx').on(table.created_at),
  index('questions_concept_idx').on(table.concept_key),
  index('questions_hash_idx').on(table.normalized_hash),
]);

// 11. Question User Reports Table
export const question_reports = pgTable('question_reports', {
  id: serial('id').primaryKey(),
  question_id: text('question_id').notNull().references(() => questions.question_id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull(),
  user_name: text('user_name').notNull().default('Pengguna'),
  reason: text('reason').notNull(),
  details: text('details').notNull().default(''),
  status: text('status').notNull().default('pending'), // 'pending' | 'resolved' | 'dismissed'
  created_at: timestamp('created_at').defaultNow().notNull(),
  resolved_at: timestamp('resolved_at'),
}, (table) => [
  index('reports_status_idx').on(table.status),
  index('reports_qid_idx').on(table.question_id),
]);

// 12. Learning Packages (Daily, Personalized, Weekly Mock, Monthly Exam)
export const learning_packages = pgTable('learning_packages', {
  id: serial('id').primaryKey(),
  package_id: text('package_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  package_type: text('package_type').notNull().default('daily'), // 'daily' | 'personalized' | 'weekly_tryout' | 'monthly_simulation' | 'custom'
  category: text('category').notNull().default('Campuran'),
  target_date: text('target_date').notNull().default(''), // YYYY-MM-DD
  difficulty: text('difficulty').notNull().default('Campuran'),
  duration_minutes: integer('duration_minutes').notNull().default(30),
  question_count: integer('question_count').notNull().default(0),
  question_ids: text('question_ids').notNull().default('[]'), // JSON array of string IDs
  passing_score: integer('passing_score').notNull().default(65),
  user_id: text('user_id'), // null for global package, user UID for personalized
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('packages_type_idx').on(table.package_type),
  index('packages_date_idx').on(table.target_date),
  index('packages_user_idx').on(table.user_id),
]);

// 13. Generation Logs
export const generation_logs = pgTable('generation_logs', {
  id: serial('id').primaryKey(),
  batch_id: text('batch_id').notNull().unique(),
  trigger_type: text('trigger_type').notNull().default('scheduler'), // 'scheduler' | 'manual' | 'low_stock'
  status: text('status').notNull().default('running'), // 'running' | 'completed' | 'failed'
  categories_targeted: text('categories_targeted').notNull().default('[]'),
  total_requested: integer('total_requested').notNull().default(0),
  generated_count: integer('generated_count').notNull().default(0),
  passed_validation_count: integer('passed_validation_count').notNull().default(0),
  duplicate_count: integer('duplicate_count').notNull().default(0),
  rejected_count: integer('rejected_count').notNull().default(0),
  published_count: integer('published_count').notNull().default(0),
  error_message: text('error_message'),
  details_json: text('details_json').notNull().default('{}'),
  started_at: timestamp('started_at').defaultNow().notNull(),
  completed_at: timestamp('completed_at'),
}, (table) => [
  index('gen_logs_started_idx').on(table.started_at),
  index('gen_logs_status_idx').on(table.status),
]);

// 14. Generation Configs (Admin configurable)
export const generation_configs = pgTable('generation_configs', {
  id: serial('id').primaryKey(),
  config_key: text('config_key').notNull().unique(),
  daily_target_total: integer('daily_target_total').notNull().default(100),
  category_distribution: text('category_distribution').notNull().default('{}'),
  difficulty_distribution: text('difficulty_distribution').notNull().default('{}'),
  auto_schedule_enabled: boolean('auto_schedule_enabled').notNull().default(true),
  min_stock_threshold: integer('min_stock_threshold').notNull().default(30),
  quality_score_threshold: integer('quality_score_threshold').notNull().default(80),
  similarity_threshold: integer('similarity_threshold').notNull().default(75),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

