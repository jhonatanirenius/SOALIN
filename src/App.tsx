import React, { useState, useEffect } from 'react';
import { 
  getStoredQuestions, 
  getStoredTryouts, 
  saveQuestion, 
  deleteQuestion, 
  saveTryout,
  syncQuestionsWithServer
} from './services/storageService';
import { Question, TryoutPackage, UserProfile, CategoryInfo, ExamMode, TryoutResultData, UserAnswerRecord } from './types';
import { MAIN_CATEGORIES } from './data/categories';
import { useAuth } from './context/AuthContext';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Hero } from './components/Hero';
import { HomeFeed } from './components/HomeFeed';
import { CategoryBrowser } from './components/CategoryBrowser';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { TryoutCatalog } from './components/TryoutCatalog';
import { CBTQuiz } from './components/CBTQuiz';
import { TryoutResult } from './components/TryoutResult';
import { ProgressDashboard } from './components/ProgressDashboard';
import { FavoritesWrongReview } from './components/FavoritesWrongReview';
import { AlinFloatingButton } from './components/alin/AlinFloatingButton';
import { AlinChatWindow } from './components/alin/AlinChatWindow';
import { SearchModal } from './components/SearchModal';
import { GamificationModal } from './components/GamificationModal';
import { AdminPanel } from './components/AdminPanel';
import { Leaderboard } from './components/Leaderboard';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { AlinProfile } from './types';
import { fetchAlinProfile } from './services/apiClient';

export default function App() {
  const { 
    user, 
    profile, 
    progress, 
    quizHistory, 
    questionAttempts,
    favorites, 
    loading, 
    recordQuizFinish, 
    recordQuestionAnswer, 
    toggleFavorite,
    refreshUserData
  } = useAuth();

  // Application questions and tryouts
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tryouts, setTryouts] = useState<TryoutPackage[]>([]);
  const [currentView, setCurrentView] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('soalin_theme') === 'dark' || 
      (!('soalin_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Splash screen state (runs once per browser session, or when replayed)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('soalin_intro_completed') !== 'true';
    } catch {
      return true;
    }
  });

  // Modal / Drawer states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [isAlinMinimized, setIsAlinMinimized] = useState(false);
  const [activeAiQuestion, setActiveAiQuestion] = useState<Question | null>(null);
  const [alinProfile, setAlinProfile] = useState<AlinProfile | null>(null);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<CategoryInfo | null>(null);

  // Load ALIN profile when user is authenticated or changed
  useEffect(() => {
    if (user) {
      fetchAlinProfile()
        .then((p) => setAlinProfile(p))
        .catch((err) => console.warn('Failed to load Alin profile:', err));
    }
  }, [user]);

  // Active CBT Quiz session state
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>('Latihan Soal');
  const [activeQuizMode, setActiveQuizMode] = useState<ExamMode>('latihan');
  const [activeQuizDuration, setActiveQuizDuration] = useState<number>(30);
  const [lastResult, setLastResult] = useState<TryoutResultData | null>(null);

  // Initialize questions and tryouts catalog
  useEffect(() => {
    setQuestions(getStoredQuestions());
    setTryouts(getStoredTryouts());

    // Sync with Cloud SQL PostgreSQL backend
    syncQuestionsWithServer()
      .then((qs) => {
        if (qs && qs.length > 0) setQuestions(qs);
      })
      .catch((err) => console.warn('Failed to sync questions on load:', err));
  }, []);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('soalin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('soalin_theme', 'light');
    }
  }, [darkMode]);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Construct real Cloud SQL user profile adapter
  const totalQuestions = progress?.total_questions || 0;
  const correctAnswers = progress?.correct_answers || 0;
  const completedQuizzes = progress?.total_completed_quizzes || 0;
  const computedXp = (totalQuestions * 15) + (correctAnswers * 25) + (completedQuizzes * 100);
  const wrongIds = Array.from(new Set(questionAttempts.filter(q => !q.is_correct).map(q => q.question_id)));

  const currentUser: UserProfile = {
    id: profile?.id ? String(profile.id) : (user?.uid || 'guest'),
    name: profile?.full_name || user?.displayName || 'Pengguna SOALIN',
    email: profile?.email || user?.email || '',
    role: 'student' as const,
    targetExam: profile?.target_category || 'CPNS & Kedinasan',
    institution: '',
    avatarSeed: profile?.avatar_url || user?.photoURL || 'avatar-1',
    xp: computedXp,
    streakDays: progress?.current_streak || 0,
    lastActiveDate: progress?.last_activity_date || new Date().toISOString(),
    totalStudyMinutes: Math.round((progress?.total_study_time || 0) / 60),
    favoriteQuestionIds: favorites,
    wrongQuestionIds: wrongIds,
    historyResults: quizHistory.map(q => ({
      id: String(q.id),
      tryoutId: q.quiz_id,
      title: q.quiz_title,
      date: new Date(q.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      mode: 'simulasi' as ExamMode,
      totalQuestions: q.total_questions,
      answeredCount: q.correct_answers + q.wrong_answers,
      correctCount: q.correct_answers,
      wrongCount: q.wrong_answers,
      skippedCount: Math.max(0, q.total_questions - (q.correct_answers + q.wrong_answers)),
      totalScore: q.score,
      percentage: Math.round((q.correct_answers / Math.max(1, q.total_questions)) * 100),
      durationSpentSeconds: q.duration,
      category: 'Tryout',
      subjectBreakdown: {},
      answers: {},
      questions: [],
      recommendedTopics: []
    })),
    unlockedBadgeIds: []
  };

  // Handlers for user interactions
  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleToggleFavorite = async (questionId: string) => {
    await toggleFavorite(questionId);
  };

  const handleOpenAiTutorWithQuestion = (q?: Question | null) => {
    setActiveAiQuestion(q || null);
    setIsAlinMinimized(false);
    setIsAiTutorOpen(true);
  };

  // Start CBT practice with specific questions
  const startPracticeSession = (qs: Question[], title: string, mode: ExamMode = 'latihan', duration = 30) => {
    if (qs.length === 0) {
      alert('Tidak ada soal yang tersedia untuk materi ini.');
      return;
    }
    setActiveQuizQuestions(qs);
    setActiveQuizTitle(title);
    setActiveQuizMode(mode);
    setActiveQuizDuration(duration);
    setCurrentView('cbt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start Tryout Package
  const handleStartTryout = (tryoutId: string) => {
    const foundTo = tryouts.find(t => t.id === tryoutId);
    if (!foundTo) return;

    // Filter questions by category, or fallback to pool
    const matchingQs = questions.filter(q => 
      q.category.toLowerCase().includes(foundTo.category.toLowerCase()) ||
      foundTo.category.toLowerCase().includes(q.category.toLowerCase())
    );

    const questionsToUse = matchingQs.length >= 5 ? matchingQs : questions.slice(0, 10);
    
    startPracticeSession(
      questionsToUse,
      foundTo.name,
      'simulasi',
      foundTo.durationMinutes
    );
  };

  // Start Category Practice
  const handleStartCategoryPractice = (categoryName: string, subcategory?: string) => {
    let filtered = questions.filter(q => 
      q.category.toLowerCase().includes(categoryName.toLowerCase())
    );

    if (subcategory) {
      const subFiltered = filtered.filter(q => 
        q.subcategory.toLowerCase().includes(subcategory.toLowerCase()) ||
        q.subject.toLowerCase().includes(subcategory.toLowerCase())
      );
      if (subFiltered.length > 0) filtered = subFiltered;
    }

    if (filtered.length === 0) {
      filtered = questions.slice(0, 5);
    }

    startPracticeSession(
      filtered,
      subcategory ? `${categoryName} — ${subcategory}` : `Latihan ${categoryName}`,
      'latihan',
      25
    );
  };

  // CBT Completed -> persist to Cloud SQL PostgreSQL
  const handleCBTFinish = async (data: {
    answers: Record<string, UserAnswerRecord>;
    durationSpentSeconds: number;
    mode: ExamMode;
  }) => {
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const subjectBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};

    activeQuizQuestions.forEach(q => {
      const ans = data.answers[q.id];
      const subj = q.subject || 'Umum';

      if (!subjectBreakdown[subj]) {
        subjectBreakdown[subj] = { total: 0, correct: 0, percentage: 0 };
      }
      subjectBreakdown[subj].total += 1;

      if (!ans || ans.selectedOption === null) {
        skippedCount += 1;
      } else if (ans.isCorrect) {
        correctCount += 1;
        subjectBreakdown[subj].correct += 1;
      } else {
        wrongCount += 1;
      }
    });

    Object.keys(subjectBreakdown).forEach(s => {
      const item = subjectBreakdown[s];
      item.percentage = Math.round((item.correct / item.total) * 100);
    });

    const recommendedTopics = Object.entries(subjectBreakdown)
      .filter(([_, stats]) => stats.percentage < 70)
      .map(([subj]) => subj);

    const percentage = Math.round((correctCount / Math.max(1, activeQuizQuestions.length)) * 100);
    const totalScore = correctCount * 5;

    const newResult: TryoutResultData = {
      id: `res-${Date.now()}`,
      tryoutId: `to-session-${Date.now()}`,
      title: activeQuizTitle,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      mode: data.mode,
      totalQuestions: activeQuizQuestions.length,
      answeredCount: correctCount + wrongCount,
      correctCount,
      wrongCount,
      skippedCount,
      totalScore,
      percentage,
      durationSpentSeconds: data.durationSpentSeconds,
      isPassed: percentage >= 65,
      category: activeQuizQuestions[0]?.category || 'Umum',
      subjectBreakdown,
      answers: data.answers,
      questions: activeQuizQuestions,
      recommendedTopics: recommendedTopics.length > 0 ? recommendedTopics : ['Pemantapan Waktu CBT']
    };

    setLastResult(newResult);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Persist attempt to PostgreSQL asynchronously
    try {
      // Record quiz completion
      await recordQuizFinish({
        quizId: activeQuizTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50),
        quizTitle: activeQuizTitle,
        totalQuestions: activeQuizQuestions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        score: percentage,
        duration: data.durationSpentSeconds
      });

      // Record each individual answered question
      for (const q of activeQuizQuestions) {
        const ans = data.answers[q.id];
        if (ans && ans.selectedOption) {
          await recordQuestionAnswer({
            questionId: q.id,
            selectedAnswer: ans.selectedOption,
            correctAnswer: q.correct_answer,
            isCorrect: ans.isCorrect,
            timeSpent: ans.timeSpentSeconds || 10
          });
        }
      }
      // Refresh ALIN familiarity profile
      fetchAlinProfile()
        .then(p => setAlinProfile(p))
        .catch(e => console.warn('Failed to refresh Alin profile after quiz:', e));
    } catch (err) {
      console.error('Failed to persist quiz to Cloud SQL:', err);
    }
  };

  // Question CRUD for Admin
  const handleSaveQuestion = (q: Question) => {
    saveQuestion(q);
    setQuestions(getStoredQuestions());
  };

  const handleDeleteQuestion = (qId: string) => {
    deleteQuestion(qId);
    setQuestions(getStoredQuestions());
  };

  const handleSaveTryout = (to: TryoutPackage) => {
    saveTryout(to);
    setTryouts(getStoredTryouts());
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-100">Menghubungkan ke SOALIN Cloud</h2>
        <p className="text-xs text-slate-400 mt-1">
          Memeriksa autentikasi Google dan mengambil profil dari Cloud SQL...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated -> Show real Google OAuth Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      {/* Fullscreen Cinematic Intro Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Onboarding for target selection */}
      <OnboardingModal />

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
        
        {/* Top Navigation Bar */}
        <Navbar
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenLevelXP={() => setIsGamificationOpen(true)}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentView={currentView}
          onReplayIntro={() => setShowSplash(true)}
        />

        {/* Main Content View Switcher */}
        <main className="flex-1 pb-16 md:pb-0">
          {/* VIEW 1: HOME PAGE */}
          {currentView === 'home' && (
            <div>
              <Hero
                onStartPractice={() => {
                  setCurrentView('categories');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onStartTryout={() => {
                  setCurrentView('tryout');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewProgress={() => {
                  setCurrentView('progress');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              <HomeFeed
                tryouts={tryouts}
                questions={questions}
                currentUser={currentUser}
                onSelectCategory={(cat) => setSelectedCategoryDetail(cat)}
                onStartTryout={handleStartTryout}
                onSelectQuestion={(q) => startPracticeSession([q], `Latihan: ${q.subject}`, 'latihan')}
                onStartPracticeSession={(qs, title, mode, duration) => startPracticeSession(qs, title, mode, duration)}
                onNavigate={(v) => {
                  setCurrentView(v);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAiTutor={handleOpenAiTutorWithQuestion}
                onToggleFavorite={handleToggleFavorite}
                favoriteIds={currentUser.favoriteQuestionIds}
              />
            </div>
          )}

          {/* VIEW 2: BANK SOAL & CATEGORIES */}
          {currentView === 'categories' && (
            <CategoryBrowser
              onSelectCategory={(cat) => setSelectedCategoryDetail(cat)}
              onQuickStartCategory={handleStartCategoryPractice}
            />
          )}

          {/* VIEW 3: TRYOUT CATALOG */}
          {currentView === 'tryout' && (
            <TryoutCatalog
              tryouts={tryouts}
              currentUser={currentUser}
              onStartTryout={handleStartTryout}
            />
          )}

          {/* VIEW 4: CBT INTERFACE */}
          {currentView === 'cbt' && (
            <CBTQuiz
              questions={activeQuizQuestions}
              title={activeQuizTitle}
              initialMode={activeQuizMode}
              durationMinutes={activeQuizDuration}
              onFinish={handleCBTFinish}
              onCancel={() => setCurrentView('home')}
              onOpenAiTutor={handleOpenAiTutorWithQuestion}
              favoriteIds={currentUser.favoriteQuestionIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* VIEW 5: TRYOUT RESULT & PEMBAHASAN */}
          {currentView === 'result' && lastResult && (
            <TryoutResult
              result={lastResult}
              onRetakeWrongQuestions={(wrongList) => {
                startPracticeSession(wrongList, 'Latihan Ulangi Soal Salah', 'latihan');
              }}
              onBackToHome={() => setCurrentView('home')}
              onOpenAiTutor={handleOpenAiTutorWithQuestion}
              favoriteIds={currentUser.favoriteQuestionIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* VIEW 6: PROGRESS DASHBOARD & RAPOR */}
          {currentView === 'progress' && (
            <ProgressDashboard
              allQuestions={questions}
              onStartTargetPractice={(topicName) => {
                const matched = questions.filter(q => 
                  q.subject.toLowerCase().includes(topicName.toLowerCase()) ||
                  q.subcategory.toLowerCase().includes(topicName.toLowerCase())
                );
                startPracticeSession(
                  matched.length > 0 ? matched : questions.slice(0, 5),
                  `Pemantapan: ${topicName}`,
                  'latihan'
                );
              }}
              onRetakeWrongQuestions={(wrongList) => {
                startPracticeSession(wrongList, 'Latihan Ulangi Soal Salah', 'latihan');
              }}
              onOpenLevelXP={() => setIsGamificationOpen(true)}
            />
          )}

          {/* VIEW 7: SOAL FAVORIT & REVIEW SALAH */}
          {currentView === 'review' && (
            <FavoritesWrongReview
              allQuestions={questions}
              onStartPracticeWithQuestions={(qs, title) => {
                startPracticeSession(qs, title, 'latihan');
              }}
              onOpenAiTutor={handleOpenAiTutorWithQuestion}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* VIEW 8: ADMIN DASHBOARD */}
          {currentView === 'admin' && (
            <AdminPanel
              questions={questions}
              tryouts={tryouts}
              categories={MAIN_CATEGORIES}
              currentUser={currentUser}
              onSaveQuestion={handleSaveQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onSaveTryout={handleSaveTryout}
            />
          )}

          {/* VIEW 9: LEADERBOARD / PAPAN PERINGKAT NASIONAL */}
          {currentView === 'leaderboard' && (
            <Leaderboard
              currentUser={currentUser}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartPractice={() => {
                startPracticeSession(
                  questions.slice(0, 10),
                  'Latihan Mandiri: Kejar XP Leaderboard',
                  'latihan'
                );
              }}
            />
          )}
        </main>

        {/* Footer */}
        <Footer 
          onNavigate={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          onReplayIntro={() => setShowSplash(true)}
        />

        {/* Mobile Bottom Navigation Bar (Home | Latihan | Tryout | Progress | Profil) */}
        <BottomNav
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProfile={() => setIsAuthOpen(true)}
        />

        {/* MODAL 1: Detail Kategori */}
        <CategoryDetailModal
          category={selectedCategoryDetail}
          isOpen={!!selectedCategoryDetail}
          onClose={() => setSelectedCategoryDetail(null)}
          questions={questions}
          tryouts={tryouts}
          currentUser={currentUser}
          onStartCategoryPractice={handleStartCategoryPractice}
          onStartTryout={handleStartTryout}
        />

        {/* ALIN AI COMPANION (Floating Button & Draggable Chat Window) */}
        <AlinFloatingButton
          isOpen={isAiTutorOpen}
          isMinimized={isAlinMinimized}
          onOpen={() => {
            setIsAlinMinimized(false);
            setIsAiTutorOpen(true);
          }}
          onRestore={() => {
            setIsAlinMinimized(false);
            setIsAiTutorOpen(true);
          }}
          questionContext={activeAiQuestion}
          alinProfile={alinProfile}
        />

        <AlinChatWindow
          isOpen={isAiTutorOpen}
          onClose={() => {
            setIsAiTutorOpen(false);
            setIsAlinMinimized(false);
            setActiveAiQuestion(null);
          }}
          onMinimize={() => {
            setIsAlinMinimized(true);
          }}
          questionContext={activeAiQuestion}
          onClearQuestionContext={() => setActiveAiQuestion(null)}
          alinProfile={alinProfile}
          onUpdateProfile={(newProfile) => setAlinProfile(newProfile)}
        />

        {/* MODAL 3: Global Search & Multi-facet Filter */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          questions={questions}
          tryouts={tryouts}
          categories={MAIN_CATEGORIES}
          currentUser={currentUser}
          onSelectQuestion={(q) => startPracticeSession([q], `Latihan: ${q.subject}`, 'latihan')}
          onSelectCategory={(cat) => setSelectedCategoryDetail(cat)}
          onStartTryout={handleStartTryout}
          onStartFilteredPractice={(qs, label) => startPracticeSession(qs, label, 'latihan')}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* MODAL 4: Gamifikasi (Level, XP, Badges, Leaderboard) */}
        <GamificationModal
          isOpen={isGamificationOpen}
          onClose={() => setIsGamificationOpen(false)}
          currentUser={currentUser}
          onNavigate={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* MODAL 5: Authentication & User Exam Target Setting */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onNavigate={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

      </div>
    </>
  );
}
