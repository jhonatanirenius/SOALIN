import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  syncUserWithServer,
  fetchUserProgress,
  fetchQuizHistory,
  fetchQuestionAttempts,
  fetchDailyActivities,
  fetchFavorites,
  apiRecordQuestionAttempt,
  apiRecordQuizAttempt,
  apiToggleFavorite,
  apiUpdateTargetCategory,
} from '../services/apiClient';

export interface ProfileData {
  id: number;
  auth_user_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  target_category: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface ProgressData {
  id: number;
  user_id: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  total_study_time: number; // in seconds
  total_completed_quizzes: number;
  best_score: number;
  average_score: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptRecord {
  id: number;
  user_id: string;
  quiz_id: string;
  quiz_title: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  duration: number;
  started_at: string;
  completed_at: string;
}

export interface QuestionAttemptRecord {
  id: number;
  user_id: string;
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  time_spent: number;
  attempted_at: string;
}

export interface DailyActivityRecord {
  id: number;
  user_id: string;
  activity_date: string;
  questions_answered: number;
  correct_answers: number;
  study_time: number;
  completed_session: number;
  created_at: string;
}

interface AuthContextType {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  loading: boolean;
  user: User | null;
  profile: ProfileData | null;
  progress: ProgressData | null;
  quizHistory: QuizAttemptRecord[];
  questionAttempts: QuestionAttemptRecord[];
  dailyActivities: DailyActivityRecord[];
  favorites: string[];
  isNewUser: boolean;
  loginError: string | null;
  isLoggingIn: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (targetCategory: string) => Promise<void>;
  recordQuestionAnswer: (params: {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }) => Promise<ProgressData | null>;
  recordQuizFinish: (params: {
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    duration: number;
    startedAt?: string;
  }) => Promise<void>;
  toggleFavorite: (questionId: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizAttemptRecord[]>([]);
  const [questionAttempts, setQuestionAttempts] = useState<QuestionAttemptRecord[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivityRecord[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load all user database assets
  const loadUserDbData = async () => {
    try {
      const [prog, hist, attempts, activities, favs] = await Promise.all([
        fetchUserProgress(),
        fetchQuizHistory(),
        fetchQuestionAttempts(),
        fetchDailyActivities(),
        fetchFavorites(),
      ]);
      setProgress(prog);
      setQuizHistory(hist);
      setQuestionAttempts(attempts);
      setDailyActivities(activities);
      setFavorites(favs);
    } catch (err) {
      console.error('Error loading user database data:', err);
    }
  };

  // Listen to Firebase Auth state on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          setUser(firebaseUser);
          // Sync with database profile
          const syncRes = await syncUserWithServer();
          setProfile(syncRes.profile);
          setProgress(syncRes.progress);
          if (syncRes.isNewUser) {
            setIsNewUser(true);
          }
          await loadUserDbData();
          setAuthStatus('authenticated');
        } catch (err: any) {
          console.error('Sync failed for authenticated user:', err);
          setAuthStatus('unauthenticated');
        }
      } else {
        setUser(null);
        setProfile(null);
        setProgress(null);
        setQuizHistory([]);
        setQuestionAttempts([]);
        setDailyActivities([]);
        setFavorites([]);
        setAuthStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  // Google OAuth Login
  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      if (!credential.user) {
        throw new Error('Tidak ada akun Google yang dipilih.');
      }
      setUser(credential.user);

      // Validate & sync on backend server
      const syncRes = await syncUserWithServer();
      setProfile(syncRes.profile);
      setProgress(syncRes.progress);
      if (syncRes.isNewUser) {
        setIsNewUser(true);
      }
      await loadUserDbData();
      setAuthStatus('authenticated');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setLoginError('Login gagal. Silakan coba lagi.');
      setAuthStatus('unauthenticated');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setProgress(null);
      setQuizHistory([]);
      setQuestionAttempts([]);
      setDailyActivities([]);
      setFavorites([]);
      setIsNewUser(false);
      setAuthStatus('unauthenticated');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Finish Onboarding
  const completeOnboarding = async (targetCategory: string) => {
    try {
      const res = await apiUpdateTargetCategory(targetCategory);
      if (res.profile) {
        setProfile(res.profile);
      }
      setIsNewUser(false);
    } catch (err) {
      console.error('Failed completing onboarding:', err);
      setIsNewUser(false);
    }
  };

  // Record a single question answer attempt
  const recordQuestionAnswer = async (params: {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }) => {
    try {
      // Send client local date string (YYYY-MM-DD)
      const now = new Date();
      const clientDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const updatedProgress = await apiRecordQuestionAttempt({
        ...params,
        clientDate,
      });
      setProgress(updatedProgress);

      // Refresh attempts & daily activity in background
      fetchQuestionAttempts().then(setQuestionAttempts).catch(console.error);
      fetchDailyActivities().then(setDailyActivities).catch(console.error);

      return updatedProgress;
    } catch (err) {
      console.error('Failed recording question attempt:', err);
      return null;
    }
  };

  // Record tryout completion
  const recordQuizFinish = async (params: {
    quizId: string;
    quizTitle: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    duration: number;
    startedAt?: string;
  }) => {
    try {
      const now = new Date();
      const clientDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const res = await apiRecordQuizAttempt({
        ...params,
        clientDate,
      });
      if (res.progress) {
        setProgress(res.progress);
      }
      await Promise.all([
        fetchQuizHistory().then(setQuizHistory),
        fetchDailyActivities().then(setDailyActivities),
      ]);
    } catch (err) {
      console.error('Failed recording quiz finish:', err);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (questionId: string): Promise<boolean> => {
    try {
      const res = await apiToggleFavorite(questionId);
      const isFav = Boolean(res.favorited);
      setFavorites((prev) =>
        isFav ? [...prev, questionId] : prev.filter((id) => id !== questionId)
      );
      return isFav;
    } catch (err) {
      console.error('Failed toggling favorite:', err);
      return false;
    }
  };

  const refreshUserData = async () => {
    await loadUserDbData();
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        loading: authStatus === 'loading',
        user,
        profile,
        progress,
        quizHistory,
        questionAttempts,
        dailyActivities,
        favorites,
        isNewUser,
        loginError,
        isLoggingIn,
        loginWithGoogle,
        logout,
        completeOnboarding,
        recordQuestionAnswer,
        recordQuizFinish,
        toggleFavorite,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
