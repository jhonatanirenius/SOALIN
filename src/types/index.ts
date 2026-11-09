export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sulit' | 'Sangat Sulit' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type QuestionStatus = 'draft' | 'validation' | 'approved' | 'published' | 'active' | 'needs_review' | 'archived' | 'rejected';

export type ExamMode = 'santai' | 'latihan' | 'ujian' | 'simulasi';

export interface Question {
  id: string;
  question_id?: string;
  question: string;
  question_text?: string;
  question_type?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  hint?: string;
  formula?: string;
  quick_tip?: string;
  category: string;
  subcategory: string;
  subject: string;
  topic?: string;
  difficulty: DifficultyLevel;
  difficulty_score?: number; // 1 - 10
  source?: string;
  source_type?: 'AI' | 'CURATED' | 'OFFICIAL';
  year?: number | string;
  tags: string[];
  generator_version?: string;
  quality_score?: number; // 0 - 100
  usage_count?: number;
  report_count?: number;
  status?: QuestionStatus;
  normalized_hash?: string;
  concept_key?: string;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionReport {
  id: number;
  question_id: string;
  user_id: string;
  user_name: string;
  reason: 'Jawaban salah' | 'Soal ambigu' | 'Pembahasan salah' | 'Typo' | 'Pilihan jawaban bermasalah' | 'Terlalu mudah' | 'Terlalu sulit' | 'Soal tidak relevan' | string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string | null;
  question?: Question;
}

export interface LearningPackage {
  id: number;
  package_id: string;
  title: string;
  description: string;
  package_type: 'daily' | 'personalized' | 'weekly_tryout' | 'monthly_simulation' | 'custom';
  category: string;
  target_date: string; // YYYY-MM-DD
  difficulty: string;
  duration_minutes: number;
  question_count: number;
  question_ids: string[];
  passing_score: number;
  user_id?: string | null;
  is_active: boolean;
  created_at: string;
  questions?: Question[];
}

export interface GenerationLog {
  id: number;
  batch_id: string;
  trigger_type: 'scheduler' | 'manual' | 'low_stock';
  status: 'running' | 'completed' | 'failed';
  categories_targeted: string[];
  total_requested: number;
  generated_count: number;
  passed_validation_count: number;
  duplicate_count: number;
  rejected_count: number;
  published_count: number;
  error_message?: string | null;
  details_json?: any;
  started_at: string;
  completed_at?: string | null;
}

export interface GenerationConfig {
  id: number;
  config_key: string;
  daily_target_total: number;
  category_distribution: Record<string, number>;
  difficulty_distribution: Record<string, number>;
  auto_schedule_enabled: boolean;
  min_stock_threshold: number;
  quality_score_threshold: number;
  similarity_threshold: number;
  updated_at: string;
}

export interface QuestionBankStats {
  totalQuestions: number;
  newToday: number;
  pendingReview: number;
  reported: number;
  published: number;
  rejected: number;
  categoryCounts: Record<string, number>;
}

export type CategoryType = 'all' | 'tni_polri' | 'cpns_pppk' | 'kedinasan' | 'ujian_masuk' | 'sekolah' | 'bahasa';

export interface CategoryInfo {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description: string;
  totalQuestions: number;
  subcategories: string[];
  subjects: string[];
  popular?: boolean;
  color: string;
  accentBg: string;
  difficultyRange: string;
  disclaimer?: string;
  type?: CategoryType;
}

export interface TryoutPackage {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  questionCount: number;
  durationMinutes: number;
  difficulty: DifficultyLevel | 'Campuran';
  participantCount: number;
  passingScore?: number;
  questionIds: string[];
  tag?: string;
  updatedAt: string;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOption: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  markedForReview: boolean;
}

export interface TryoutResultData {
  id: string;
  tryoutId?: string;
  title: string;
  date: string;
  mode: ExamMode;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalScore: number;
  percentage: number;
  durationSpentSeconds: number;
  isPassed?: boolean;
  passingScoreThreshold?: number;
  category: string;
  subjectBreakdown: Record<string, { total: number; correct: number; percentage: number }>;
  answers: Record<string, UserAnswerRecord>;
  questions: Question[];
  recommendedTopics: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredXp?: number;
  category: 'milestone' | 'streak' | 'accuracy' | 'tryout';
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  targetExam: string;
  institution?: string;
  avatarSeed: string;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  favoriteQuestionIds: string[];
  wrongQuestionIds: string[];
  historyResults: TryoutResultData[];
  unlockedBadgeIds: string[];
}

export interface TopicPerformance {
  topic: string;
  category: string;
  accuracy: number;
  totalAnswered: number;
  status: 'Perlu Ditingkatkan' | 'Cukup' | 'Kuasai';
}

export interface SearchFilterState {
  keyword: string;
  category: string;
  subject: string;
  difficulty: string;
  status: 'all' | 'unanswered' | 'wrong' | 'favorite';
}

export type AlinExpression = 
  | 'normal' 
  | 'senyum' 
  | 'happy' 
  | 'tertawa' 
  | 'thinking' 
  | 'confused' 
  | 'shock' 
  | 'sedih' 
  | 'menangis' 
  | 'marah' 
  | 'blushing' 
  | 'excited' 
  | 'semangat' 
  | 'encouraging' 
  | 'lelah' 
  | 'kaget_lucu' 
  | 'playful' 
  | 'ngelirik' 
  | 'kangen' 
  | 'cemas' 
  | 'yakin' 
  | 'penasaran' 
  | 'tidur' 
  | 'love';

export interface AlinProfile {
  id: number;
  user_id: string;
  familiarity_xp: number;
  familiarity_level: number;
  total_conversations: number;
  total_messages: number;
  last_chat_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AlinConversation {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AlinMessage {
  id: number;
  conversation_id: number;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
