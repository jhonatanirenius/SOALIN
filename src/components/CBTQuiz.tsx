import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  Sparkles, 
  Send, 
  HelpCircle,
  RotateCcw,
  Zap,
  Info,
  Maximize2,
  X,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Question, ExamMode, UserAnswerRecord } from '../types';
import { submitQuestionReportApi } from '../services/apiClient';
import confetti from 'canvas-confetti';

interface CBTQuizProps {
  questions: Question[];
  title: string;
  initialMode?: ExamMode;
  durationMinutes?: number;
  onFinish: (result: {
    answers: Record<string, UserAnswerRecord>;
    durationSpentSeconds: number;
    mode: ExamMode;
  }) => void;
  onCancel: () => void;
  onOpenAiTutor: (question: Question) => void;
  favoriteIds: string[];
  onToggleFavorite: (questionId: string) => void;
}

export const CBTQuiz: React.FC<CBTQuizProps> = ({
  questions,
  title,
  initialMode = 'latihan',
  durationMinutes = 30,
  onFinish,
  onCancel,
  onOpenAiTutor,
  favoriteIds,
  onToggleFavorite
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<ExamMode>(initialMode);
  const [answers, setAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  
  // Timer state
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);

  // Question Report & Hint states
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('Jawaban salah');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  const handleSendReport = async () => {
    if (!currentQ) return;
    try {
      setIsSubmittingReport(true);
      await submitQuestionReportApi({
        questionId: currentQ.id || (currentQ as any).question_id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSuccessMsg('Laporan berhasil dikirim ke editor SOALIN. Terima kasih!');
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccessMsg(null);
        setReportDetails('');
      }, 1600);
    } catch (err: any) {
      alert(err?.message || 'Gagal mengirim laporan');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const currentQ = questions[currentIndex] || questions[0];

  // Timer effect
  useEffect(() => {
    if (mode === 'santai') return;

    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
      if (mode === 'ujian' || mode === 'simulasi') {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode]);

  // Handle time up auto-submit
  useEffect(() => {
    if (isTimeUp) {
      handleFinalSubmit();
    }
  }, [isTimeUp]);

  // Handle selecting an option
  const handleSelectOption = (optKey: string) => {
    if (!currentQ) return;

    const isCorrect = optKey === currentQ.correct_answer;
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        selectedOption: optKey,
        isCorrect,
        timeSpentSeconds: (prev[currentQ.id]?.timeSpentSeconds || 0) + 5,
        markedForReview: !!markedQuestions[currentQ.id]
      }
    }));

    // In 'latihan' mode, immediately reveal explanation for this question
    if (mode === 'latihan') {
      setShowExplanation(prev => ({
        ...prev,
        [currentQ.id]: true
      }));

      // Small joyful sound/confetti if correct
      if (isCorrect) {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.8 }
        });
      }
    }
  };

  // Toggle mark/ragu-ragu
  const toggleMarkQuestion = () => {
    if (!currentQ) return;
    setMarkedQuestions(prev => {
      const nextVal = !prev[currentQ.id];
      if (answers[currentQ.id]) {
        setAnswers(ans => ({
          ...ans,
          [currentQ.id]: {
            ...ans[currentQ.id],
            markedForReview: nextVal
          }
        }));
      }
      return {
        ...prev,
        [currentQ.id]: nextVal
      };
    });
  };

  const handleFinalSubmit = () => {
    onFinish({
      answers,
      durationSpentSeconds: secondsElapsed,
      mode
    });
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k]?.selectedOption !== null).length;
  const currentAnswer = currentQ ? answers[currentQ.id]?.selectedOption : null;
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null;
  const isMarked = currentQ ? !!markedQuestions[currentQ.id] : false;
  const isFavorite = currentQ ? favoriteIds.includes(currentQ.id) : false;
  const isExplRevealed = (mode === 'latihan' && showExplanation[currentQ?.id]) || false;

  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <p className="text-slate-500">Tidak ada soal dalam sesi ini.</p>
        <button onClick={onCancel} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top CBT Header Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 mb-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {currentQ.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {currentQ.subject}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {title}
            </h1>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['santai', 'latihan', 'ujian', 'simulasi'] as ExamMode[]).map(m => (
              <button
                key={m}
                id={`btn-mode-${m}`}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  mode === m 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center gap-3">
            {mode !== 'santai' && (
              <div 
                id="cbt-timer-display"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-base border ${
                  mode === 'simulasi' && secondsRemaining < 300
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-300 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{mode === 'latihan' ? formatTime(secondsElapsed) : formatTime(secondsRemaining)}</span>
              </div>
            )}

            <button
              id="btn-submit-cbt"
              onClick={() => setConfirmSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Selesai Ujian</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Terjawab: <strong className="text-slate-900 dark:text-white font-bold">{answeredCount}</strong> dari {questions.length} Soal</span>
          <span>{Math.round((answeredCount / questions.length) * 100)}% Selesai</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main CBT Workspace: Left Question Area + Right Question Grid Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Question & Options */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
            
            {/* Question Meta Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                  {currentIndex + 1}
                </span>
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Tingkat: <span className="text-indigo-600 dark:text-indigo-400">{currentQ.difficulty}</span>
                  </span>
                  {currentQ.source && (
                    <span className="text-[11px] text-slate-400 block truncate max-w-xs sm:max-w-md">
                      Sumber: {currentQ.source}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Save to Favorites */}
                <button
                  id="btn-toggle-favorite"
                  onClick={() => onToggleFavorite(currentQ.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isFavorite 
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-300 dark:border-amber-800' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                  title={isFavorite ? 'Hapus dari Soal Favorit' : 'Simpan ke Soal Favorit'}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
                </button>

                {/* Mark Question (Ragu-ragu) */}
                <button
                  id="btn-mark-question"
                  onClick={toggleMarkQuestion}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                    isMarked 
                      ? 'bg-amber-500 text-white border-amber-500' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{isMarked ? 'Ditandai' : 'Tandai Soal'}</span>
                </button>

                {/* Laporkan Soal */}
                <button
                  id="btn-report-question"
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Laporkan Soal Ini Jika Ada Masalah"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Laporkan</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line mb-6 select-text">
              {currentQ.question}
            </div>

            {/* Hint / Petunjuk Clue */}
            {currentQ.hint && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowHint(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showHint[currentQ.id] ? 'Tutup Petunjuk' : 'Butuh Petunjuk? (Hint) 💡'}</span>
                </button>
                {showHint[currentQ.id] && (
                  <div className="mt-2.5 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 leading-relaxed animate-in fade-in duration-200">
                    <strong className="font-bold">Petunjuk Berpikir:</strong> {currentQ.hint}
                  </div>
                )}
              </div>
            )}

            {/* Options A - E */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D', 'E'] as const).map((optKey) => {
                const optText = currentQ.options[optKey];
                if (!optText) return null;

                const isSelected = currentAnswer === optKey;
                const isCorrect = optKey === currentQ.correct_answer;
                
                // Styling depends on mode and whether explanation is revealed
                let borderClass = 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-800';
                let bgClass = 'bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30';
                let badgeClass = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                if (isSelected) {
                  borderClass = 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20';
                  bgClass = 'bg-indigo-50 dark:bg-indigo-950/60';
                  badgeClass = 'bg-indigo-600 text-white border-indigo-600';
                }

                if (isExplRevealed) {
                  if (isCorrect) {
                    borderClass = 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50';
                    badgeClass = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isSelected && !isCorrect) {
                    borderClass = 'border-rose-500 dark:border-rose-500 bg-rose-50/80 dark:bg-rose-950/50';
                    badgeClass = 'bg-rose-600 text-white border-rose-600';
                  }
                }

                return (
                  <button
                    key={optKey}
                    id={`option-${currentQ.id}-${optKey}`}
                    onClick={() => handleSelectOption(optKey)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${borderClass} ${bgClass}`}
                  >
                    <span className={`w-7 h-7 rounded-lg border font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 ${badgeClass}`}>
                      {optKey}
                    </span>
                    <span className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-normal pt-0.5">
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Discussion in 'Latihan' Mode */}
            {isExplRevealed && (
              <div 
                id="instant-discussion-box"
                className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/80 space-y-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                      Pembahasan Resmi
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      currentAnswer === currentQ.correct_answer 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      Jawabanmu: {currentAnswer || 'Kosong'} — {currentAnswer === currentQ.correct_answer ? 'Benar 🎉' : `Salah (Kunci: ${currentQ.correct_answer})`}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenAiTutor(currentQ)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Tanya Alin ✨</span>
                  </button>
                </div>

                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-normal">
                  {currentQ.explanation}
                </div>

                {currentQ.formula && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900 text-xs font-mono text-indigo-700 dark:text-indigo-300">
                    <strong>Rumus Kunci:</strong> {currentQ.formula}
                  </div>
                )}

                {currentQ.quick_tip && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Trik Cepat / Shortcut:</strong> {currentQ.quick_tip}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation Buttons (Sebelumnya & Berikutnya) */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                id="btn-cbt-prev"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                {mode === 'ujian' && (
                  <button
                    onClick={() => onOpenAiTutor(currentQ)}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tanya Alin</span>
                  </button>
                )}

                <button
                  id="btn-cbt-next"
                  onClick={() => {
                    if (currentIndex < questions.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                    } else {
                      setConfirmSubmitModal(true);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span>{currentIndex === questions.length - 1 ? 'Selesai' : 'Berikutnya'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: CBT Question Grid Sheet */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs sticky top-24">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Lembar Jawaban Soal</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                {answeredCount}/{questions.length}
              </span>
            </h3>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-5 gap-2.5 max-h-[380px] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id]?.selectedOption;
                const isCurrent = idx === currentIndex;
                const isMarkedItem = !!markedQuestions[q.id];

                let itemClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

                if (ans) {
                  itemClass = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                }

                if (isMarkedItem) {
                  itemClass = 'bg-amber-500 text-white border-amber-500 font-bold';
                }

                if (isCurrent) {
                  itemClass += ' ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900';
                }

                return (
                  <button
                    key={q.id}
                    id={`nav-sheet-q-${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center relative transition-all cursor-pointer ${itemClass}`}
                  >
                    <span>{idx + 1}</span>
                    {ans && (
                      <span className="text-[10px] uppercase leading-none opacity-90 font-mono">
                        ({ans})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-indigo-600 inline-block" />
                <span className="text-slate-600 dark:text-slate-400">Terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-400">Ragu-ragu / Ditandai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 inline-block" />
                <span className="text-slate-600 dark:text-slate-400">Belum Terjawab</span>
              </div>
            </div>

            <div className="mt-5 pt-3">
              <button
                onClick={() => setConfirmSubmitModal(true)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-colors"
              >
                Kumpulkan Jawaban Sekarang
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal Before Submit */}
      {confirmSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Konfirmasi Selesai Ujian?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Kamu telah menjawab <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{answeredCount}</strong> dari {questions.length} butir soal.
              {answeredCount < questions.length && (
                <span className="block mt-1 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  ⚠️ Masih ada {questions.length - answeredCount} soal yang belum terjawab.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmSubmitModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cek Kembali
              </button>
              <button
                id="btn-confirm-final-submit"
                onClick={() => {
                  setConfirmSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Ya, Kumpulkan Jawaban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Report Modal ("Laporkan Soal") */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Laporkan Soal Ini</h3>
                  <p className="text-[11px] text-slate-500">Soal #{currentIndex + 1} — {currentQ.category}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{reportSuccessMsg}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Alasan Masalah:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Jawaban salah',
                      'Soal ambigu',
                      'Pembahasan salah',
                      'Typo',
                      'Pilihan jawaban bermasalah',
                      'Terlalu mudah',
                      'Terlalu sulit',
                      'Soal tidak relevan'
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setReportReason(reason)}
                        className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-left border transition-all cursor-pointer ${
                          reportReason === reason
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-700'
                            : 'bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detail / Catatan Tambahan (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Contoh: Pada opsi C angka seharusnya 45 bukan 54..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReport}
                    disabled={isSubmittingReport}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
