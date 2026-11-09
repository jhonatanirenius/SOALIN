import React, { useState, useEffect, useMemo, useRef, Component, ErrorInfo } from 'react';
import { 
  Search, 
  X, 
  Play, 
  Bookmark, 
  AlertCircle,
  SlidersHorizontal,
  FolderOpen,
  Trophy,
  Loader2,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Question, UserProfile, CategoryInfo, TryoutPackage } from '../types';
import { fetchQuestionsApi } from '../services/apiClient';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  tryouts?: TryoutPackage[];
  categories: CategoryInfo[];
  currentUser: UserProfile;
  onSelectQuestion: (question: Question) => void;
  onSelectCategory?: (category: CategoryInfo) => void;
  onStartTryout?: (tryoutId: string) => void;
  onStartFilteredPractice: (filteredQuestions: Question[], filterLabel: string) => void;
  onToggleFavorite: (questionId: string) => void;
}

const POPULAR_KEYWORDS = [
  'TWK',
  'TIU',
  'Silogisme',
  'Pancasila',
  'Matematika',
  'Vektor',
  'Psikotes',
  'Akmil',
  'CPNS',
  'Deret Angka'
];

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class SearchErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Terjadi kesalahan saat memproses pencarian.' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SearchModal error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={this.props.onClose}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Terjadi kesalahan saat mencari.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Silakan coba lagi atau tutup pencarian.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
              <button
                onClick={this.props.onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SearchModalContent: React.FC<Omit<SearchModalProps, 'isOpen'>> = ({
  onClose,
  questions,
  tryouts = [],
  categories = [],
  currentUser,
  onSelectQuestion,
  onSelectCategory,
  onStartTryout,
  onStartFilteredPractice,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'categories' | 'tryouts'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);
  const [filterUnansweredOnly, setFilterUnansweredOnly] = useState(false);

  const [serverQuestions, setServerQuestions] = useState<Question[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut Esc closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounce user typing (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Live query to server database with debounce
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setServerQuestions([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    setSearchError(null);

    fetchQuestionsApi({ search: trimmed, limit: 30 })
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.questions)) {
          setServerQuestions(res.questions);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Server search query warning:', err);
        // Do not crash, keep local matches
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Merge local questions + server questions safely
  const allAvailableQuestions = useMemo(() => {
    const safePropQs = Array.isArray(questions) ? questions : [];
    const map = new Map<string, Question>();
    
    // Add server questions first
    for (const q of serverQuestions) {
      if (q && q.id) map.set(q.id, q);
    }
    // Add local questions
    for (const q of safePropQs) {
      if (q && q.id) map.set(q.id, q);
    }
    return Array.from(map.values());
  }, [questions, serverQuestions]);

  const safeWrongIds = useMemo(() => {
    return Array.isArray(currentUser?.wrongQuestionIds) ? currentUser.wrongQuestionIds : [];
  }, [currentUser?.wrongQuestionIds]);

  const safeFavIds = useMemo(() => {
    return Array.isArray(currentUser?.favoriteQuestionIds) ? currentUser.favoriteQuestionIds : [];
  }, [currentUser?.favoriteQuestionIds]);

  // Filter matched questions
  const matchedQuestions = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();

    return allAvailableQuestions.filter((q) => {
      if (!q) return false;
      const questionText = (q.question || q.question_text || '').toLowerCase();
      const subject = (q.subject || '').toLowerCase();
      const subcategory = (q.subcategory || '').toLowerCase();
      const category = (q.category || '').toLowerCase();
      const topic = (q.topic || '').toLowerCase();
      const explanation = (q.explanation || '').toLowerCase();
      const hint = (q.hint || '').toLowerCase();
      const qId = (q.id || q.question_id || '').toLowerCase();
      const tags = Array.isArray(q.tags) ? q.tags : [];

      const matchesSearch = !qLower ||
        questionText.includes(qLower) ||
        subject.includes(qLower) ||
        subcategory.includes(qLower) ||
        category.includes(qLower) ||
        topic.includes(qLower) ||
        explanation.includes(qLower) ||
        hint.includes(qLower) ||
        qId.includes(qLower) ||
        tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(qLower));

      const matchesCat = selectedCategory === 'all' || 
        category.includes(selectedCategory.toLowerCase());

      const matchesDiff = selectedDifficulty === 'all' || 
        (q.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase();

      const matchesWrong = !filterWrongOnly || safeWrongIds.includes(q.id);

      const matchesUnanswered = !filterUnansweredOnly ||
        (!safeWrongIds.includes(q.id) && !safeFavIds.includes(q.id));

      return matchesSearch && matchesCat && matchesDiff && matchesWrong && matchesUnanswered;
    });
  }, [allAvailableQuestions, searchQuery, selectedCategory, selectedDifficulty, filterWrongOnly, filterUnansweredOnly, safeWrongIds, safeFavIds]);

  // Filter matched categories
  const matchedCategories = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();
    const safeCats = Array.isArray(categories) ? categories : [];
    if (!qLower) return safeCats.slice(0, 6);

    return safeCats.filter((cat) => {
      if (!cat) return false;
      const name = (cat.name || '').toLowerCase();
      const code = (cat.code || '').toLowerCase();
      const desc = (cat.description || '').toLowerCase();
      const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
      const subjs = Array.isArray(cat.subjects) ? cat.subjects : [];

      return name.includes(qLower) ||
        code.includes(qLower) ||
        desc.includes(qLower) ||
        subs.some((s) => typeof s === 'string' && s.toLowerCase().includes(qLower)) ||
        subjs.some((s) => typeof s === 'string' && s.toLowerCase().includes(qLower));
    });
  }, [categories, searchQuery]);

  // Filter matched tryouts
  const matchedTryouts = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();
    const safeTos = Array.isArray(tryouts) ? tryouts : [];
    if (!qLower) return safeTos.slice(0, 4);

    return safeTos.filter((to) => {
      if (!to) return false;
      const name = (to.name || '').toLowerCase();
      const desc = (to.description || '').toLowerCase();
      const cat = (to.category || '').toLowerCase();
      const sub = (to.subcategory || '').toLowerCase();

      return name.includes(qLower) ||
        desc.includes(qLower) ||
        cat.includes(qLower) ||
        sub.includes(qLower);
    });
  }, [tryouts, searchQuery]);

  const hasQuery = searchQuery.trim().length > 0;
  const totalResults = matchedQuestions.length + (hasQuery ? (matchedCategories.length + matchedTryouts.length) : 0);

  const handleResetSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setFilterWrongOnly(false);
    setFilterUnansweredOnly(false);
    setActiveTab('all');
    inputRef.current?.focus();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="search-filter-modal-card"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[88vh] sm:max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          )}
          <input
            ref={inputRef}
            id="input-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari materi, soal, tryout (contoh: Integral, TWK, Silogisme, Vektor)..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              title="Bersihkan kata kunci"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="btn-close-search-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 cursor-pointer"
            title="Tutup Pencarian (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector & Filter Row */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Semua {hasQuery && `(${totalResults})`}
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'questions'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Soal ({matchedQuestions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FolderOpen className="w-3 h-3" />
              <span>Kategori ({matchedCategories.length})</span>
            </button>
            {matchedTryouts.length > 0 && (
              <button
                onClick={() => setActiveTab('tryouts')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'tryouts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>Tryout ({matchedTryouts.length})</span>
              </button>
            )}
          </div>

          {/* Quick Clear Filter if active */}
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || filterWrongOnly || filterUnansweredOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setFilterWrongOnly(false);
                setFilterUnansweredOnly(false);
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Detailed Filters (for Questions) */}
        {(activeTab === 'all' || activeTab === 'questions') && (
          <div className="p-3 sm:px-6 sm:py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Filter:</span>
            </div>

            {/* Kategori Filter */}
            <select
              id="select-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Tingkat Kesulitan Filter */}
            <select
              id="select-filter-difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
            >
              <option value="all">Semua Kesulitan</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="Sulit">Sulit</option>
              <option value="HOTS">HOTS</option>
            </select>

            {/* Toggle: Soal yang pernah salah */}
            <button
              onClick={() => setFilterWrongOnly(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-colors text-xs ${
                filterWrongOnly 
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-300 dark:border-rose-800' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Pernah Salah ({safeWrongIds.length})
            </button>

            {/* Toggle: Soal belum dikerjakan */}
            <button
              onClick={() => setFilterUnansweredOnly(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-colors text-xs ${
                filterUnansweredOnly 
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 border-indigo-300 dark:border-indigo-800' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Belum Dikerjakan
            </button>
          </div>
        )}

        {/* Results Header / Batch Practice Button */}
        {(activeTab === 'all' || activeTab === 'questions') && matchedQuestions.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Ditemukan <strong className="text-slate-900 dark:text-white font-bold">{matchedQuestions.length}</strong> butir soal latihan
            </span>

            <button
              onClick={() => {
                onClose();
                onStartFilteredPractice(
                  matchedQuestions, 
                  searchQuery ? `Hasil Cari: "${searchQuery}"` : 'Latihan Filter Terpilih'
                );
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Kerjakan Semua Soal Ini ({matchedQuestions.length})</span>
            </button>
          </div>
        )}

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* STATE 1: Empty Query -> Popular Suggestions & Quick Categories */}
          {!hasQuery && (
            <div className="space-y-6">
              {/* Popular Keywords */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pencarian Populer</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_KEYWORDS.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => setSearchQuery(kw)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              {categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                    <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Jelajahi Berdasarkan Kategori</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {categories.slice(0, 6).map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          if (onSelectCategory) {
                            onClose();
                            onSelectCategory(cat);
                          } else {
                            setSearchQuery(cat.name);
                          }
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="truncate mr-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {cat.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {cat.totalQuestions} soal latihan
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: Loading Indicator */}
          {isSearching && (
            <div className="py-4 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>Mencari di Bank Soal SOALIN...</span>
            </div>
          )}

          {/* SECTION A: Matched Categories (if 'all' or 'categories' tab) */}
          {(activeTab === 'all' || activeTab === 'categories') && hasQuery && matchedCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kategori Terkait ({matchedCategories.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (onSelectCategory) {
                        onClose();
                        onSelectCategory(cat);
                      } else {
                        setSelectedCategory(cat.name);
                        setActiveTab('questions');
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {cat.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {cat.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {cat.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: Matched Tryouts (if 'all' or 'tryouts' tab) */}
          {(activeTab === 'all' || activeTab === 'tryouts') && hasQuery && matchedTryouts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Paket Tryout Akbar ({matchedTryouts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedTryouts.map((to) => (
                  <div
                    key={to.id}
                    onClick={() => {
                      if (onStartTryout) {
                        onClose();
                        onStartTryout(to.id);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="truncate mr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {to.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                          {to.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {to.questionCount} Soal • {to.durationMinutes} Menit • {to.difficulty}
                      </p>
                    </div>
                    <button
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Mulai</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION C: Matched Questions (if 'all' or 'questions' tab) */}
          {(activeTab === 'all' || activeTab === 'questions') && matchedQuestions.length > 0 && (
            <div className="space-y-3">
              {hasQuery && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Daftar Butir Soal ({matchedQuestions.length})</span>
                </div>
              )}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
                {matchedQuestions.map((q) => {
                  const isFav = safeFavIds.includes(q.id);
                  const isWrong = safeWrongIds.includes(q.id);
                  const questionTags = Array.isArray(q.tags) ? q.tags : [];

                  return (
                    <div key={q.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {q.category || 'Umum'}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {q.subject || q.subcategory || 'Latihan'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            • {q.difficulty || 'Sedang'}
                          </span>
                          {isWrong && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Pernah Salah
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onToggleFavorite(q.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                              isFav 
                                ? 'bg-amber-50 text-amber-500 border-amber-300' 
                                : 'text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                            title="Simpan favorit"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => {
                              onClose();
                              onSelectQuestion(q);
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-indigo-600" />
                            <span>Latih Soal</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                        {q.question || q.question_text || 'Pertanyaan latihan SOALIN'}
                      </p>

                      {questionTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {questionTags.map((t, ti) => (
                            <span 
                              key={ti}
                              onClick={() => setSearchQuery(t)}
                              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 cursor-pointer"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STATE 3: 0 Results Found */}
          {hasQuery && totalResults === 0 && !isSearching && (
            <div className="py-12 px-4 text-center text-slate-500 space-y-3">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tidak ditemukan hasil untuk &apos;{searchQuery}&apos;.
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Coba periksa kembali ejaan kata kunci atau gunakan kata kunci lain (misal: TWK, TIU, Deret, Silogisme, Vektor).
                </p>
              </div>
              <button
                onClick={handleResetSearch}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  ...restProps
}) => {
  if (!isOpen) return null;

  return (
    <SearchErrorBoundary onClose={onClose}>
      <SearchModalContent onClose={onClose} {...restProps} />
    </SearchErrorBoundary>
  );
};
