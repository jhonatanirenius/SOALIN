import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  HelpCircle, 
  Zap, 
  BookOpen, 
  Copy, 
  Check,
  AlertCircle
} from 'lucide-react';
import { Question } from '../types';
import { askAiTutor } from '../services/aiService';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  question
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Halo! Saya **SOALIN AI Tutor**, asisten belajar pintar dan analis soal.
Ada materi atau langkah soal yang ingin kamu diskusikan? Klik salah satu tombol cepat di bawah atau ketik langsung pertanyaanmu!`,
      timestamp: 'Baru saja'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset quick prompt chips as requested in prompt
  const quickPrompts = [
    { label: 'Jelaskan soal ini.', action: 'Jelaskan Soal Ini' },
    { label: question ? `Kenapa jawabannya ${question.correct_answer}?` : 'Kenapa jawabannya B?', action: 'Kenapa Jawabannya?' },
    { label: 'Kasih trik cepat mengerjakannya.', action: 'Trik Kilat' },
    { label: 'Jelaskan dengan cara yang lebih gampang.', action: 'Cara Gampang' },
    { label: 'Buat soal serupa.', action: 'Soal Serupa' },
    { label: 'Buat 5 soal tentang materi ini.', action: 'Buat 5 Soal' }
  ];

  const handleSend = async (customText?: string, actionType?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Sekarang'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const result = await askAiTutor({
        prompt: textToSend,
        question: question || undefined,
        actionType
      });

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: result.answer,
        timestamp: 'Baru saja'
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'tutor',
        text: 'Maaf, terjadi gangguan saat menghubungi mesin AI. Silakan coba kembali sesaat lagi.',
        timestamp: 'Baru saja'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div 
        id="ai-tutor-drawer-panel"
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">SOALIN AI Tutor</h3>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Didukung Gemini 3.8 Flash & Bank Pembahasan Soalin
              </p>
            </div>
          </div>

          <button
            id="btn-close-ai-tutor"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Educational Disclaimer Banner */}
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Materi dan jawaban bersifat edukatif terstandar, bukan bocoran seleksi resmi.</span>
        </div>

        {/* Active Question Preview Context (if opened from question) */}
        {question && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 text-xs">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
              Konteks Soal ({question.category} - {question.subject}):
            </span>
            <p className="text-slate-700 dark:text-slate-300 line-clamp-2 italic">
              "{question.question}"
            </p>
          </div>
        )}

        {/* Chat Messages Container */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'tutor' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1 shadow-xs">
                  AI
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}>
                <div className="whitespace-pre-line prose-sm dark:prose-invert">
                  {m.text}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/30 dark:border-slate-700/40 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {m.sender === 'tutor' && (
                    <button
                      onClick={() => handleCopy(m.text, m.id)}
                      className="hover:opacity-100 flex items-center gap-1 cursor-pointer"
                      title="Salin jawaban"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs p-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>SOALIN AI Tutor sedang menganalisis konsep dan menyusun trik cepat...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips as requested in Prompt */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
            Pilihan Pertanyaan Cepat:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                id={`ai-quick-chip-${idx}`}
                onClick={() => handleSend(chip.label, chip.action)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors cursor-pointer text-left truncate max-w-full"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="input-ai-tutor-prompt"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Tanyakan konsep, trik cepat, atau buat soal baru..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              id="btn-send-ai-tutor"
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
