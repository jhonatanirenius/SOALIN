import React, { useState } from 'react';
import { 
  Bookmark, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Trash2, 
  Play, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';

interface FavoritesWrongReviewProps {
  allQuestions: Question[];
  onStartPracticeWithQuestions: (questions: Question[], title: string) => void;
  onOpenAiTutor: (question: Question) => void;
  onToggleFavorite: (questionId: string) => void;
}

export const FavoritesWrongReview: React.FC<FavoritesWrongReviewProps> = ({
  allQuestions,
  onStartPracticeWithQuestions,
  onOpenAiTutor,
  onToggleFavorite
}) => {
  const { favorites, questionAttempts } = useAuth();
  const [activeTab, setActiveTab] = useState<'wrong' | 'favorite' | 'difficult' | 'review'>('wrong');

  const wrongQuestionIds = Array.from(new Set(
    questionAttempts.filter(q => !q.is_correct).map(q => q.question_id)
  ));
  const favoriteQuestionIds = favorites;

  const wrongQuestions = allQuestions.filter(q => wrongQuestionIds.includes(q.id));
  const favoriteQuestions = allQuestions.filter(q => favoriteQuestionIds.includes(q.id));
  const difficultQuestions = allQuestions.filter(q => q.difficulty === 'Sulit');
  const reviewQuestions = allQuestions.filter(q => 
    wrongQuestionIds.includes(q.id) || favoriteQuestionIds.includes(q.id)
  );

  let currentList: Question[] = [];
  let tabTitle = '';
  let tabDescription = '';

  switch (activeTab) {
    case 'wrong':
      currentList = wrongQuestions;
      tabTitle = 'Soal yang Pernah Salah';
      tabDescription = 'Daftar soal yang kamu jawab kurang tepat saat latihan atau tryout. Kerjakan ulang untuk memperkuat memori.';
      break;
    case 'favorite':
      currentList = favoriteQuestions;
      tabTitle = 'Soal Favorit';
      tabDescription = 'Koleksi soal yang kamu tandai sebagai bahan rujukan dan referensi belajar pilihan.';
      break;
    case 'difficult':
      currentList = difficultQuestions;
      tabTitle = 'Soal Kategori Sulit (HOTS)';
      tabDescription = 'Kumpulan soal berbobot tinggi untuk menguji penalaran dan daya analisis tingkat lanjut.';
      break;
    case 'review':
      currentList = reviewQuestions;
      tabTitle = 'Soal untuk Dipelajari Ulang';
      tabDescription = 'Kombinasi soal favorit dan soal yang butuh pendalaman kembali sebelum ujian resmi.';
      break;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bank Review & Kurasi Mandiri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Soal Favorit & Review Salah
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fokus pada evaluasi titik lemah dan simpan konsep penting dalam satu tempat.
          </p>
        </div>

        {/* Action Button: "Latihan Ulangi Soal Salah" Sesuai Prompt */}
        {wrongQuestions.length > 0 && (
          <button
            id="btn-action-retake-wrong-all"
            onClick={() => onStartPracticeWithQuestions(wrongQuestions, 'Latihan Ulangi Soal Salah')}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Latihan Ulangi Soal Salah ({wrongQuestions.length})</span>
          </button>
        )}
      </div>

      {/* 4 Tabs Sesuai Prompt */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('wrong')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'wrong'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Pernah Salah ({wrongQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorite')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'favorite'
              ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Soal Favorit ({favoriteQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('difficult')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'difficult'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Soal Sulit ({difficultQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'review'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Untuk Dipelajari Ulang ({reviewQuestions.length})</span>
        </button>
      </div>

      {/* Description of current tab */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <strong>{tabTitle}:</strong> {tabDescription}
        </p>

        {currentList.length > 0 && (
          <button
            onClick={() => onStartPracticeWithQuestions(currentList, `Sesi Latihan: ${tabTitle}`)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Latih Semua ({currentList.length})</span>
          </button>
        )}
      </div>

      {/* List of Questions */}
      {currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((q, idx) => {
            const isFav = favoriteQuestionIds.includes(q.id);

            return (
              <div 
                key={q.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {q.category} • {q.subcategory}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({q.difficulty})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(q.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isFav 
                          ? 'bg-amber-50 text-amber-500 border-amber-300' 
                          : 'text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title={isFav ? 'Hapus favorit' : 'Tambah favorit'}
                    >
                      <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onOpenAiTutor(q)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tanya Alin ✨</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                  {q.question}
                </p>

                {/* Options preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(optKey => {
                    const text = q.options[optKey];
                    if (!text) return null;
                    const isKunci = q.correct_answer === optKey;

                    return (
                      <div 
                        key={optKey}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          isKunci 
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold">{optKey}.</span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Snippet */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                    Kunci Jawaban: {q.correct_answer}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {q.explanation}
                  </p>
                  {q.quick_tip && (
                    <p className="text-amber-700 dark:text-amber-400 font-semibold pt-1">
                      ⚡ {q.quick_tip}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Belum Ada Soal di Kategori Ini
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === 'wrong' 
              ? 'Hebat! Kamu belum memiliki catatan jawaban salah pada bank soal.' 
              : 'Tandai soal saat latihan atau gunakan fitur bookmark untuk mengisinya.'}
          </p>
        </div>
      )}
    </div>
  );
};
