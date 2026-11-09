import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Save,
  X,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Check,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu,
  Archive,
  Eye,
  Sliders,
  Play
} from 'lucide-react';
import { 
  Question, 
  TryoutPackage, 
  UserProfile, 
  CategoryInfo, 
  QuestionReport, 
  GenerationLog, 
  GenerationConfig, 
  QuestionBankStats 
} from '../types';
import { 
  fetchQuestionsApi, 
  fetchQuestionBankStatsApi, 
  saveQuestionApi, 
  updateQuestionStatusApi, 
  bulkActionQuestionsApi, 
  deleteQuestionApi, 
  triggerAdminGenerateApi, 
  fetchGenerationLogsApi, 
  fetchGenerationConfigApi, 
  saveGenerationConfigApi, 
  fetchQuestionReportsApi, 
  resolveQuestionReportApi,
  fetchDailyPackagesApi
} from '../services/apiClient';

interface AdminPanelProps {
  questions: Question[];
  tryouts: TryoutPackage[];
  categories: CategoryInfo[];
  currentUser: UserProfile;
  onSaveQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onSaveTryout: (to: TryoutPackage) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions: initialLocalQuestions,
  tryouts,
  categories,
  currentUser,
  onSaveQuestion,
  onDeleteQuestion,
  onSaveTryout
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'generator' | 'reports' | 'packages'>('questions');

  // Question Bank server state
  const [serverQuestions, setServerQuestions] = useState<Question[]>([]);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [stats, setStats] = useState<QuestionBankStats>({
    totalQuestions: 0,
    newToday: 0,
    pendingReview: 0,
    reported: 0,
    published: 0,
    rejected: 0,
    categoryCounts: {},
  });
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 25;

  // Bulk actions selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Generation Modal & Real-time Runner
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [genTargetCount, setGenTargetCount] = useState<number>(20);
  const [genSelectedCategories, setGenSelectedCategories] = useState<string[]>([
    'TIU', 'TWK', 'TKP', 'Matematika', 'Bahasa Inggris', 'Tes Fisik'
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [generationResult, setGenerationResult] = useState<any>(null);

  // History Generation Logs & Config
  const [pastLogs, setPastLogs] = useState<GenerationLog[]>([]);
  const [genConfig, setGenConfig] = useState<GenerationConfig | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // User Reports State
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  // Learning packages
  const [dailyPackages, setDailyPackages] = useState<any[]>([]);

  // Question Edit Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question>>({
    category: 'TIU',
    subcategory: 'Kemampuan Numerik',
    subject: 'Aritmetika Sosial',
    difficulty: 'Sedang',
    difficulty_score: 5,
    question: '',
    options: { A: '', B: '', C: '', D: '', E: '' },
    correct_answer: 'A',
    explanation: '',
    hint: '',
    tags: []
  });

  // Load Question Bank from Cloud SQL
  const loadQuestionsData = async () => {
    try {
      setLoadingQuestions(true);
      const [qData, statsData] = await Promise.all([
        fetchQuestionsApi({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          status: selectedStatus,
          search: searchQuery,
          limit: pageSize,
          offset: currentPage * pageSize,
        }),
        fetchQuestionBankStatsApi().catch(() => null)
      ]);

      if (qData.success) {
        setServerQuestions(qData.questions);
        setTotalQuestionsCount(qData.total);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.warn('Failed to load server questions:', err);
      // Fallback to local
      setServerQuestions(initialLocalQuestions.slice(0, 30));
      setTotalQuestionsCount(initialLocalQuestions.length);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Load logs, configs, reports
  const loadAuxiliaryData = async () => {
    try {
      const [logs, config, reps, pkgs] = await Promise.all([
        fetchGenerationLogsApi().catch(() => []),
        fetchGenerationConfigApi().catch(() => null),
        fetchQuestionReportsApi().catch(() => []),
        fetchDailyPackagesApi().catch(() => [])
      ]);
      setPastLogs(logs);
      setGenConfig(config);
      setReports(reps);
      setDailyPackages(pkgs);
    } catch (e) {
      console.warn('Failed loading admin auxiliary data:', e);
    }
  };

  useEffect(() => {
    loadQuestionsData();
  }, [selectedCategory, selectedDifficulty, selectedStatus, currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadQuestionsData();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    loadAuxiliaryData();
  }, [activeTab]);

  // Handle Select All Checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(serverQuestions.map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleExecuteBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !confirm(`Hapus ${selectedIds.length} soal terpilih secara permanen?`)) {
      return;
    }

    try {
      await bulkActionQuestionsApi(action, selectedIds);
      setSelectedIds([]);
      await loadQuestionsData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses aksi');
    }
  };

  // Single Status Update
  const handleUpdateStatus = async (qId: string, status: string) => {
    try {
      await updateQuestionStatusApi(qId, status);
      await loadQuestionsData();
    } catch (err: any) {
      alert(err?.message || 'Gagal mengubah status');
    }
  };

  // Delete Single Question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Hapus soal ini dari bank soal?')) return;
    try {
      await deleteQuestionApi(qId);
      onDeleteQuestion(qId);
      await loadQuestionsData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus soal');
    }
  };

  // Save / Edit Question
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion({ ...q });
    setIsQuestionModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingQuestion({
      id: `q-custom-${Date.now()}`,
      question_id: `q-custom-${Date.now()}`,
      category: 'TIU',
      subcategory: 'Kemampuan Numerik',
      subject: 'Aritmetika Sosial',
      difficulty: 'Sedang',
      difficulty_score: 5,
      question: '',
      options: { A: '', B: '', C: '', D: '', E: '' },
      correct_answer: 'A',
      explanation: '',
      hint: '',
      tags: ['Admin', 'Manual']
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion.question || !editingQuestion.explanation) {
      alert('Pertanyaan dan pembahasan wajib diisi!');
      return;
    }

    try {
      await saveQuestionApi(editingQuestion);
      onSaveQuestion(editingQuestion as Question);
      setIsQuestionModalOpen(false);
      await loadQuestionsData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan soal');
    }
  };

  // Real AI Generation Execution
  const handleStartGeneration = async () => {
    if (genSelectedCategories.length === 0) {
      alert('Pilih minimal satu kategori untuk generasi soal.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationLogs([`[${new Date().toLocaleTimeString('id-ID')}] Menginisiasi pipeline auto generation...`]);
      setGenerationResult(null);

      const result = await triggerAdminGenerateApi({
        categories: genSelectedCategories,
        totalTarget: genTargetCount,
      });

      setGenerationResult(result);
      if (result.logs) {
        setGenerationLogs(result.logs);
      }

      await loadQuestionsData();
      await loadAuxiliaryData();
    } catch (err: any) {
      setGenerationLogs(prev => [...prev, `[ERROR] ${err?.message || 'Gagal generasi soal'}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId: number, status: 'resolved' | 'dismissed') => {
    try {
      await resolveQuestionReportApi(reportId, status);
      await loadAuxiliaryData();
      await loadQuestionsData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui laporan');
    }
  };

  // Save Generator Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genConfig) return;

    try {
      setIsSavingConfig(true);
      const saved = await saveGenerationConfigApi(genConfig);
      setGenConfig(saved);
      alert('Pengaturan Auto Daily Generator berhasil disimpan!');
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Header & Main Stats Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sistem Manajemen Bank Soal & Auto Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Kontrol Bank Soal Terpadu
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kembangkan bank soal Soalin secara otomatis setiap hari dengan Multi-Pass Validation, Anti-Duplicate Semantik, dan Generator Paket Belajar Cerdas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Generate Soal AI Sekarang</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Manual</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Counters (User Request #18) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block">Total Questions</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
              {(stats.totalQuestions || totalQuestionsCount).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-amber-300 block flex items-center gap-1">
              🔥 New Today
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
              {stats.newToday}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-emerald-300 block flex items-center gap-1">
              ✅ Published
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
              {stats.published.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-indigo-300 block flex items-center gap-1">
              ⏳ Pending Review
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-400 mt-1 block">
              {stats.pendingReview}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-rose-300 block flex items-center gap-1">
              ⚠️ Reported
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
              {stats.reported}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block flex items-center gap-1">
              ❌ Rejected
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-300 mt-1 block">
              {stats.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bank Soal (Question Bank)</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'generator'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Auto Generator & Log</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap relative ${
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Laporan Soal User</span>
          {reports.filter(r => r.status === 'pending').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'packages'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Paket Belajar & Tryout</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: QUESTION BANK LIST                                            */}
      {/* ==================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Search */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari materi, kata kunci, topik, atau isi soal..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(0); }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="TIU">TIU (Tes Inteligensia Umum)</option>
                  <option value="TWK">TWK (Wawasan Kebangsaan)</option>
                  <option value="TKP">TKP (Karakteristik Pribadi)</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Psikotes">Psikotes</option>
                  <option value="Pengetahuan Umum">Pengetahuan Umum</option>
                  <option value="Tes Fisik">Tes Fisik (Samapta)</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(0); }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="all">Semua Difficulty</option>
                  <option value="Mudah">Mudah (Easy)</option>
                  <option value="Sedang">Sedang (Medium)</option>
                  <option value="Sulit">Sulit (Hard)</option>
                  <option value="Sangat Sulit">Sangat Sulit (Very Hard)</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(0); }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="all">Semua Status</option>
                  <option value="published">Published</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft / Validation</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="archived">Archived</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bulk Action Toolbar */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{selectedIds.length} soal terpilih</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExecuteBulkAction('published')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Bulk Approve & Publish
                  </button>
                  <button
                    onClick={() => handleExecuteBulkAction('rejected')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Bulk Reject
                  </button>
                  <button
                    onClick={() => handleExecuteBulkAction('archived')}
                    className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Bulk Archive
                  </button>
                  <button
                    onClick={() => handleExecuteBulkAction('delete')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Bulk Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Question Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={serverQuestions.length > 0 && selectedIds.length === serverQuestions.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="py-3 px-4">Pertanyaan & Topik</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Kualitas</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Laporan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {loadingQuestions ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        <span>Memuat bank soal dari server...</span>
                      </td>
                    </tr>
                  ) : serverQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada soal yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    serverQuestions.map((q) => {
                      const isSelected = selectedIds.includes(q.id);
                      return (
                        <tr 
                          key={q.id}
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors ${
                            isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(q.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-relaxed">
                              {q.question || q.question_text}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                              <span className="font-mono text-indigo-500 dark:text-indigo-400">ID: {q.id}</span>
                              <span>•</span>
                              <span>{q.subject || q.topic || q.subcategory}</span>
                              <span>•</span>
                              <span className="text-emerald-500">Kunci: {q.correct_answer}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                              {q.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              q.difficulty === 'Mudah' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                              q.difficulty === 'Sedang' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                              q.difficulty === 'Sulit' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                              'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            }`}>
                              {q.difficulty} ({q.difficulty_score || 5}/10)
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {q.quality_score || 90}<span className="text-slate-400 text-[10px]">/100</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              q.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              q.status === 'needs_review' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                              q.status === 'rejected' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                              'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}>
                              {q.status || 'published'}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {(q.report_count || 0) > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {q.report_count} Laporan
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit(q)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Edit Soal"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {q.status !== 'published' ? (
                                <button
                                  onClick={() => handleUpdateStatus(q.id, 'published')}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  title="Approve & Publish"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(q.id, 'archived')}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  title="Archive"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                title="Hapus Soal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500">
              <span>
                Menampilkan <strong>{Math.min(totalQuestionsCount, currentPage * pageSize + 1)}</strong> - <strong>{Math.min(totalQuestionsCount, (currentPage + 1) * pageSize)}</strong> dari <strong>{totalQuestionsCount}</strong> butir soal
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>Halaman {currentPage + 1}</span>
                <button
                  disabled={(currentPage + 1) * pageSize >= totalQuestionsCount}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: AUTO GENERATOR CONTROL & LOGS                                 */}
      {/* ==================================================================== */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Configuration Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pengaturan Auto Generator</h3>
                  <p className="text-xs text-slate-500">Konfigurasi kuota target, jadwal, dan threshold</p>
                </div>
              </div>

              {genConfig && (
                <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Harian Total (Soal Baru/Hari):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={genConfig.daily_target_total}
                      onChange={(e) => setGenConfig({ ...genConfig, daily_target_total: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">Saran: 100 - 300 soal/hari</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ambang Batas Stok Minimum (Low-Stock Trigger):
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={genConfig.min_stock_threshold}
                      onChange={(e) => setGenConfig({ ...genConfig, min_stock_threshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">Jika soal suatu kategori &lt; threshold, auto trigger aktif</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Min Quality Score:
                      </label>
                      <input
                        type="number"
                        min={60}
                        max={95}
                        value={genConfig.quality_score_threshold}
                        onChange={(e) => setGenConfig({ ...genConfig, quality_score_threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Max Similarity (%):
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={90}
                        value={genConfig.similarity_threshold}
                        onChange={(e) => setGenConfig({ ...genConfig, similarity_threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genConfig.auto_schedule_enabled}
                        onChange={(e) => setGenConfig({ ...genConfig, auto_schedule_enabled: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Aktifkan Background Scheduler Otomatis (Setiap Hari &amp; Low-Stock)
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {isSavingConfig ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Real-time Trigger & Logs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Eksekusi Generator Manual</h3>
                    <p className="text-xs text-slate-500">Jalankan generasi AI secara langsung dengan streaming log</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Jalankan Sekarang</span>
                </button>
              </div>

              {/* Past Generation Runs Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Riwayat Eksekusi Pembuatan Soal Terakhir
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                  {pastLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Belum ada riwayat generasi yang tersimpan.
                    </div>
                  ) : (
                    pastLogs.slice(0, 8).map((log) => (
                      <div key={log.id || log.batch_id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-xs flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {log.status}
                            </span>
                            <span className="font-mono text-slate-500">{log.batch_id}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-400">{log.trigger_type}</span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            Generated: <strong>{log.generated_count}</strong> | Lolos: <strong className="text-emerald-600">{log.passed_validation_count}</strong> | Duplikat: <strong className="text-amber-600">{log.duplicate_count}</strong> | Ditolak: <strong className="text-rose-600">{log.rejected_count}</strong>
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.started_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: USER REPORTS MANAGEMENT                                       */}
      {/* ==================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Laporan Soal dari Pengguna</h3>
                <p className="text-xs text-slate-500">Tinjau laporan jawaban salah, soal ambigu, typo, atau opsi bermasalah</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900">
                {reports.filter(r => r.status === 'pending').length} Menunggu Tindakan
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {reports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Belum ada laporan soal dari pengguna. Bank soal dalam kondisi prima!
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs">
                            {rep.reason}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Dilaporkan oleh: <strong>{rep.user_name}</strong>
                          </span>
                          <span className="text-xs text-slate-400">
                            • {new Date(rep.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {rep.details && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            "{rep.details}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {rep.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleResolveReport(rep.id, 'resolved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Tandai Selesai
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep.id, 'dismissed')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                            >
                              Abaikan
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
                            {rep.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {rep.question && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {rep.question.question || rep.question.question_text}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span>Kunci: <strong className="text-emerald-600">{rep.question.correct_answer}</strong></span>
                          <span>•</span>
                          <span>Kategori: {rep.question.category}</span>
                          <span>•</span>
                          <span>ID: {rep.question.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: LEARNING PACKAGES                                             */}
      {/* ==================================================================== */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyPackages.map((pkg) => (
              <div key={pkg.id || pkg.package_id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    {pkg.package_type}
                  </span>
                  <span className="text-xs text-slate-400">{pkg.target_date}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pkg.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{pkg.question_ids?.length || 0} Soal</span>
                  <span>{pkg.duration_minutes} Menit</span>
                  <span className="font-bold text-emerald-600">KKM: {pkg.passing_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* GENERATE QUESTIONS MODAL (Interactive with Real Gemini AI Execution) */}
      {/* ==================================================================== */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Auto Question Generator AI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menghasilkan soal baru terstandar dengan Multi-Pass Validation &amp; Anti-Duplicate
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Category Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Kategori Sasaran:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'TIU',
                    'TWK',
                    'TKP',
                    'Matematika',
                    'Bahasa Inggris',
                    'Bahasa Indonesia',
                    'Psikotes',
                    'Pengetahuan Umum',
                    'Tes Fisik'
                  ].map((cat) => {
                    const isChecked = genSelectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setGenSelectedCategories(prev =>
                            isChecked ? prev.filter(c => c !== cat) : [...prev, cat]
                          );
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-700 shadow-xs'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{cat}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Count */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Jumlah Soal yang Digenerate:
                  </label>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {genTargetCount} Soal
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={genTargetCount}
                  onChange={(e) => setGenTargetCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 soal (cepat)</span>
                  <span>20 soal (ideal)</span>
                  <span>60 soal (batch besar)</span>
                </div>
              </div>

              {/* Streaming Logs Viewer */}
              {generationLogs.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Log Pembuatan &amp; Validasi Real-time:
                  </label>
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-1 shadow-inner">
                    {generationLogs.map((lg, idx) => (
                      <div key={idx} className={lg.includes('Ditolak') || lg.includes('ERROR') ? 'text-rose-400' : (lg.includes('Lolos') ? 'text-emerald-300' : 'text-slate-300')}>
                        {lg}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Result Summary */}
              {generationResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Generasi Berhasil Diselesaikan!</span>
                  </div>
                  <p>
                    Dibuat: <strong>{generationResult.generated}</strong> | 
                    Lolos &amp; Terbit: <strong className="text-emerald-600 font-bold">{generationResult.published}</strong> | 
                    Duplikat Ditolak: <strong>{generationResult.duplicates}</strong> | 
                    Gagal Kualitas: <strong>{generationResult.rejected}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleStartGeneration}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Pipeline AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Mulai Generasi {genTargetCount} Soal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* QUESTION CREATE / EDIT MODAL                                         */}
      {/* ==================================================================== */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingQuestion.id?.startsWith('q-custom') ? 'Tambah Soal Baru' : 'Edit Soal'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori:</label>
                  <select
                    value={editingQuestion.category || 'TIU'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="TIU">TIU</option>
                    <option value="TWK">TWK</option>
                    <option value="TKP">TKP</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Psikotes">Psikotes</option>
                    <option value="Pengetahuan Umum">Pengetahuan Umum</option>
                    <option value="Tes Fisik">Tes Fisik</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subkategori / Topik:</label>
                  <input
                    type="text"
                    value={editingQuestion.subcategory || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, subcategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty:</label>
                  <select
                    value={editingQuestion.difficulty || 'Sedang'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                    <option value="Sangat Sulit">Sangat Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teks Pertanyaan:</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Pilihan Jawaban (A - E):</label>
                {(['A', 'B', 'C', 'D', 'E'] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {key}
                    </span>
                    <input
                      type="text"
                      value={editingQuestion.options?.[key] || ''}
                      onChange={(e) => {
                        const newOpts = { ...(editingQuestion.options || {}) };
                        newOpts[key] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts as any });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder={`Teks pilihan ${key}...`}
                    />
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={editingQuestion.correct_answer === key}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correct_answer: key })}
                      className="accent-indigo-600 w-4 h-4 cursor-pointer"
                      title={`Pilih ${key} sebagai kunci jawaban`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pembahasan Terperinci:</label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hint / Petunjuk (Tanpa Membocorkan Jawaban):</label>
                <input
                  type="text"
                  value={editingQuestion.hint || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, hint: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
