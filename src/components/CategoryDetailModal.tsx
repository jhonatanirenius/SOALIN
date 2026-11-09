import React from 'react';
import { 
  X, 
  BookOpen, 
  Layers, 
  Trophy, 
  Gauge, 
  CheckCircle2, 
  Play, 
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CategoryInfo, Question, TryoutPackage, UserProfile } from '../types';

interface CategoryDetailModalProps {
  category: CategoryInfo | null;
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  tryouts: TryoutPackage[];
  currentUser: UserProfile;
  onStartCategoryPractice: (categoryName: string, subcategory?: string) => void;
  onStartTryout: (tryoutId: string) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  isOpen,
  onClose,
  questions,
  tryouts,
  currentUser,
  onStartCategoryPractice,
  onStartTryout
}) => {
  if (!isOpen || !category) return null;

  // Filter questions & tryouts for this category
  const categoryQuestions = questions.filter(q => q.category.toLowerCase().includes(category.name.toLowerCase()) || q.category.toLowerCase().includes(category.code.toLowerCase()));
  const categoryTryouts = tryouts.filter(t => t.category.toLowerCase().includes(category.name.toLowerCase()) || t.category.toLowerCase().includes(category.code.toLowerCase()));

  // Calculate user progress in this category
  const answeredInCat = categoryQuestions.filter(q => !currentUser.wrongQuestionIds.includes(q.id) && currentUser.favoriteQuestionIds.includes(q.id)).length;
  const userProgressPercent = categoryQuestions.length > 0 
    ? Math.min(100, Math.round((answeredInCat / categoryQuestions.length) * 100)) 
    : 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="category-detail-modal-card"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
      >
        {/* Header with category styling */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            id="btn-close-category-detail"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3">
            <span>{category.code}</span>
            <span>•</span>
            <span>Bank Soal Persiapan</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {category.name} — Bank Soal Persiapan
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {category.id === 'akmil' 
              ? 'Latihan soal untuk membantu kamu mempersiapkan diri menghadapi berbagai materi yang relevan dengan proses seleksi.' 
              : category.description}
          </p>
        </div>

        {/* Mandatory Disclaimer as requested */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p>
            <strong>Catatan Penting:</strong> Soal-soal latihan ini adalah simulasi edukatif berstandar kurikulum & kompetensi seleksi, <em>bukan merupakan dokumen rahasia ataupun bocoran seleksi resmi</em>.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Metrics Grid: Total Soal, Materi, Tingkat Kesulitan, Tryout Tersedia, Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Bank Soal</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {category.totalQuestions.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Berpembahasan
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Tingkat Kesulitan</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {category.difficultyRange}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Standar Uji CAT
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Tryout Tersedia</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {categoryTryouts.length > 0 ? `${categoryTryouts.length} Paket` : '4 Paket Aktif'}
              </span>
              <span className="text-[11px] text-amber-500 font-medium">
                Dengan Timer Ujian
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="text-xs text-indigo-700 dark:text-indigo-300 block">Progress Pengguna</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {userProgressPercent}%
              </span>
              <div className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full" 
                  style={{ width: `${userProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Materi / Silabus Yang Diuji */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Daftar Materi & Subkategori Ujian</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {category.subcategories.map((sub, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    onClose();
                    onStartCategoryPractice(category.name, sub);
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sub}
                    </span>
                  </div>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Mata Pelajaran / Topik Spesifik */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Cakupan Kisi-Kisi Materi Pokok</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.subjects.map((subj, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>

          {/* Tryout Terkait */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Paket Tryout Siap Uji</span>
            </h3>

            {categoryTryouts.length > 0 ? (
              <div className="space-y-2.5">
                {categoryTryouts.map((to) => (
                  <div 
                    key={to.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {to.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>⏱️ {to.durationMinutes} Menit</span>
                        <span>•</span>
                        <span>📋 {to.questionCount} Soal</span>
                        <span>•</span>
                        <span>👥 {to.participantCount.toLocaleString('id-ID')} Peserta</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onStartTryout(to.id);
                      }}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Mulai Tryout</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
                Gunakan latihan per materi di atas untuk mengasah pemahaman sebelum masuk ke paket simulasi.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Kategori: <strong className="text-slate-700 dark:text-slate-200">{category.name}</strong>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Tutup
            </button>
            <button
              id="btn-modal-start-category-practice"
              onClick={() => {
                onClose();
                onStartCategoryPractice(category.name);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Mulai Latihan Kategori Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
