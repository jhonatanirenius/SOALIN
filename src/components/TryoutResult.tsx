import React, { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Share2, 
  ArrowLeft,
  AlertCircle,
  BarChart3,
  Bookmark,
  Zap,
  HelpCircle
} from 'lucide-react';
import { TryoutResultData, Question } from '../types';
import confetti from 'canvas-confetti';

interface TryoutResultProps {
  result: TryoutResultData;
  onRetakeWrongQuestions: (wrongQuestions: Question[]) => void;
  onBackToHome: () => void;
  onOpenAiTutor: (question: Question) => void;
  favoriteIds: string[];
  onToggleFavorite: (questionId: string) => void;
}

export const TryoutResult: React.FC<TryoutResultProps> = ({
  result,
  onRetakeWrongQuestions,
  onBackToHome,
  onOpenAiTutor,
  favoriteIds,
  onToggleFavorite
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'wrong' | 'correct' | 'skipped'>('all');

  // Trigger celebration confetti on high score
  React.useEffect(() => {
    if (result.percentage >= 70) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result.percentage]);

  const wrongQuestionsList = result.questions.filter(q => {
    const ans = result.answers[q.id];
    return ans && !ans.isCorrect && ans.selectedOption !== null;
  });

  const filteredQuestions = result.questions.filter(q => {
    const ans = result.answers[q.id];
    if (activeFilter === 'wrong') return ans && !ans.isCorrect && ans.selectedOption !== null;
    if (activeFilter === 'correct') return ans && ans.isCorrect;
    if (activeFilter === 'skipped') return !ans || ans.selectedOption === null;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const isPassingGradeAchieved = result.isPassed ?? (result.percentage >= 65);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xl shadow-slate-200/50 dark:shadow-none text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hasil Evaluasi {result.title}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          {isPassingGradeAchieved ? 'Selamat! Kamu Lolos Ambang Batas 🎉' : 'Tetap Semangat, Latihan Lagi! 💪'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
          {isPassingGradeAchieved 
            ? 'Skor simulasi kamu melampaui standar kelulusan. Pertahankan ritme belajarmu!'
            : 'Beberapa materi masih perlu diperkuat. Gunakan fitur ulangi soal salah untuk meningkatkan akurasi.'}
        </p>

        {/* Big Score Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {/* Nilai Total / Persentase */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
            <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 block">
              Nilai Total
            </span>
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {result.percentage}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Skor: {result.totalScore}
            </span>
          </div>

          {/* Jumlah Benar */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
              Jawaban Benar
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {result.correctCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              dari {result.totalQuestions} Soal
            </span>
          </div>

          {/* Jumlah Salah */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400 block">
              Jawaban Salah
            </span>
            <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {result.wrongCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Kosong: {result.skippedCount}
            </span>
          </div>

          {/* Waktu Pengerjaan */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 block">
              Waktu Pengerjaan
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">
              {formatSeconds(result.durationSpentSeconds)}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              Rata-rata: {Math.round(result.durationSpentSeconds / Math.max(1, result.totalQuestions))} dtk/soal
            </span>
          </div>
        </div>

        {/* Quick Action Button Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {wrongQuestionsList.length > 0 && (
            <button
              id="btn-retake-wrong-questions"
              onClick={() => onRetakeWrongQuestions(wrongQuestionsList)}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Latihan Ulangi Soal Salah ({wrongQuestionsList.length})</span>
            </button>
          )}

          <button
            onClick={onBackToHome}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>
        </div>
      </div>

      {/* Analisis Kemampuan & Rekomendasi Materi Sesuai Prompt */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Analisis per Materi */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span>Analisis Kemampuan per Materi</span>
          </h2>

          <div className="space-y-4">
            {Object.entries(result.subjectBreakdown).map(([subject, stats]) => (
              <div key={subject} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{subject}</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    {stats.correct}/{stats.total} Benar ({stats.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      stats.percentage >= 75 
                        ? 'bg-emerald-500' 
                        : stats.percentage >= 50 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rekomendasi Materi untuk Dipelajari Kembali */}
        <div className="md:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Rekomendasi Materi Perbaikan</span>
          </h2>

          {result.recommendedTopics.length > 0 ? (
            <ul className="space-y-3">
              {result.recommendedTopics.map((topic, i) => (
                <li 
                  key={i}
                  className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">{topic}</strong>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Akurasi masih di bawah target. Uji kembali konsep dasar dan latihan per topik.
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Luar biasa! Semua materi pada sesi ini telah kamu kuasai dengan sangat baik.
            </p>
          )}
        </div>
      </div>

      {/* Review Pembahasan Soal-Soal Sesuai Prompt */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Review & Pembahasan Soal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pelajari alasan jawaban yang tepat dan trik pengerjaannya.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Semua ({result.questions.length})
            </button>
            <button
              onClick={() => setActiveFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'wrong' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Salah ({result.wrongCount})
            </button>
            <button
              onClick={() => setActiveFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === 'correct' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Benar ({result.correctCount})
            </button>
          </div>
        </div>

        {/* Questions Discussion List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-4">
          {filteredQuestions.map((q, idx) => {
            const userAns = result.answers[q.id]?.selectedOption;
            const isCorrect = userAns === q.correct_answer;
            const isFav = favoriteIds.includes(q.id);

            return (
              <div key={q.id} className="py-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      isCorrect 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : userAns 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {result.questions.findIndex(item => item.id === q.id) + 1}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {q.category} • {q.subject}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        ({q.difficulty})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(q.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isFav 
                          ? 'bg-amber-50 text-amber-500 border-amber-300' 
                          : 'text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Simpan ke favorit"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => onOpenAiTutor(q)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Tanya Alin ✨</span>
                    </button>
                  </div>
                </div>

                {/* Question */}
                <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                  {q.question}
                </p>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => {
                    const txt = q.options[opt];
                    if (!txt) return null;
                    const isUserChoice = userAns === opt;
                    const isRealCorrect = q.correct_answer === opt;

                    let optBg = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                    if (isRealCorrect) {
                      optBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold';
                    } else if (isUserChoice && !isRealCorrect) {
                      optBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300';
                    }

                    return (
                      <div key={opt} className={`p-2.5 rounded-xl border flex items-start gap-2 ${optBg}`}>
                        <span className="font-bold shrink-0">{opt}.</span>
                        <span>{txt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pembahasan Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-indigo-600 dark:text-indigo-400">Pembahasan:</span>
                    <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                      Jawaban: {userAns || 'Kosong'} — {isCorrect ? 'Benar' : `Salah (Kunci: ${q.correct_answer})`}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {q.explanation}
                  </p>
                  {q.formula && (
                    <div className="font-mono text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <strong>Rumus:</strong> {q.formula}
                    </div>
                  )}
                  {q.quick_tip && (
                    <div className="text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Trik Cepat:</strong> {q.quick_tip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
