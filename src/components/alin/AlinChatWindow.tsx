import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Send,
  History,
  Plus,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
  Zap,
  BookOpen,
  Brain,
  Lightbulb,
  Coffee,
  GripHorizontal,
  Smile,
} from 'lucide-react';
import { AlinAvatar } from './AlinAvatar';
import { AlinFamiliarityBadge, getLevelInfo } from './AlinFamiliarityBadge';
import { AlinConversationsDrawer } from './AlinConversationsDrawer';
import { AlinExpressionSheetModal } from './AlinExpressionSheetModal';
import {
  AlinExpression,
  AlinProfile,
  AlinConversation,
  AlinMessage,
  Question,
} from '../../types';
import {
  sendAlinChatMessage,
  fetchAlinConversations,
  fetchAlinMessages,
  createAlinConversation,
  deleteAlinConversation,
} from '../../services/apiClient';

interface AlinChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  questionContext?: Question | null;
  onClearQuestionContext?: () => void;
  alinProfile: AlinProfile | null;
  onUpdateProfile: (profile: AlinProfile) => void;
}

export const AlinChatWindow: React.FC<AlinChatWindowProps> = ({
  isOpen,
  onClose,
  onMinimize,
  questionContext,
  onClearQuestionContext,
  alinProfile,
  onUpdateProfile,
}) => {
  const [messages, setMessages] = useState<AlinMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<AlinExpression>('normal');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Conversations state
  const [conversations, setConversations] = useState<AlinConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExpressionSheetOpen, setIsExpressionSheetOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Draggable window state for desktop
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on initial mount or when opened
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // When question context changes and is non-null, initialize greeting with question context
  useEffect(() => {
    if (isOpen && questionContext) {
      setCurrentExpression('thinking');
      // If we don't have active conversation, start one
      if (messages.length === 0) {
        setMessages([
          {
            id: 0,
            conversation_id: 0,
            user_id: '',
            role: 'assistant',
            content: `Haii! Alin perhatiin kamu lagi buka soal **${questionContext.subject || 'Latihan'}** nih 👀\n\nMau Alin bantu bedah pembahasannya, cari cara cepatnya, atau mau tes pemahaman dulu? Klik tombol cepat di bawah atau tanya apa aja yaa!`,
            created_at: new Date().toISOString(),
          },
        ]);
        setCurrentExpression('happy');
      }
    }
  }, [questionContext, isOpen]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      setIsLoadingHistory(true);
      const list = await fetchAlinConversations();
      setConversations(list || []);
      if (list && list.length > 0 && !activeConversationId) {
        // Load latest conversation messages
        const latest = list[0];
        setActiveConversationId(latest.id);
        const msgs = await fetchAlinMessages(latest.id);
        setMessages(msgs || []);
      } else if (!list || list.length === 0) {
        // Default initial greeting message
        setMessages([
          {
            id: 0,
            conversation_id: 0,
            user_id: '',
            role: 'assistant',
            content: `Haii! Aku **ALIN**, teman belajar kamu di SOALIN ✨\n\nAda materi yang lagi bikin bingung, soal yang mau dibedah bareng, atau butuh tips ujian? Sini tumpahin ke Alin, kita belajar santai bareng yaa! 💪`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to load Alin conversations:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectConversation = async (conv: AlinConversation) => {
    try {
      setActiveConversationId(conv.id);
      setIsLoading(true);
      const msgs = await fetchAlinMessages(conv.id);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to select conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      let title = 'Obrolan Belajar';
      if (questionContext?.subject) {
        title = `Bahas ${questionContext.subject}`;
      }
      const newConv = await createAlinConversation(title);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([
        {
          id: Date.now(),
          conversation_id: newConv.id,
          user_id: '',
          role: 'assistant',
          content: `Haii! Obrolan baru dimulai nih ✨ Mau bahas materi apa kita sekarang?`,
          created_at: new Date().toISOString(),
        },
      ]);
      setCurrentExpression('happy');
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleDeleteConversation = async (convId: number) => {
    try {
      await deleteAlinConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string, actionType?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setIsLoading(true);
    setCurrentExpression('thinking');

    // Optimistically add user message
    const tempUserMsg: AlinMessage = {
      id: Date.now(),
      conversation_id: activeConversationId || 0,
      user_id: '',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await sendAlinChatMessage({
        conversationId: activeConversationId || undefined,
        message: text,
        questionContext: questionContext
          ? {
              question: questionContext.question,
              options: questionContext.options,
              correctAnswer: questionContext.correct_answer,
              explanation: questionContext.explanation,
              category: questionContext.category,
              subject: questionContext.subject,
            }
          : undefined,
        actionType,
      });

      if (response && response.reply) {
        if (!activeConversationId && response.conversationId) {
          setActiveConversationId(response.conversationId);
          // Refresh conversation list in background
          fetchAlinConversations().then((list) => setConversations(list || []));
        }

        const alinMsg: AlinMessage = {
          id: Date.now() + 1,
          conversation_id: response.conversationId || activeConversationId || 0,
          user_id: '',
          role: 'assistant',
          content: response.reply,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, alinMsg]);

        if (response.expression) {
          setCurrentExpression(response.expression);
        } else {
          setCurrentExpression('senyum');
        }

        if (response.profile) {
          onUpdateProfile(response.profile);
        }
      } else {
        throw new Error(response?.error || 'Tidak ada balasan yang diterima dari server AI');
      }
    } catch (error: any) {
      console.error('Error sending message to Alin:', error);
      setCurrentExpression('sedih');
      const errorMsg = error?.message || 'Koneksi ke server AI terganggu';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          conversation_id: activeConversationId || 0,
          user_id: '',
          role: 'assistant',
          content: `⚠️ Maaf, permintaan ke AI gagal diproses (${errorMsg}). Silakan coba kirim ulang pesan kamu ya! 🥺`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dragging handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click and when clicking header bar (not buttons)
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      // Limit dragging bounds so window stays within viewport
      const newX = dragStartRef.current.initX + deltaX;
      const newY = dragStartRef.current.initY + deltaY;

      // Constrain within bounds roughly
      const maxX = window.innerWidth / 2;
      const minX = -window.innerWidth / 2;
      const maxY = 200;
      const minY = -window.innerHeight + 400;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const currentLevel = alinProfile?.familiarity_level || 0;
  const currentXp = alinProfile?.familiarity_xp || 0;
  const levelInfo = getLevelInfo(currentLevel);

  // Background style based on Relationship Level
  const getWindowThemeStyles = () => {
    switch (currentLevel) {
      case 3: // Best Study Buddy
        return {
          windowBg: 'bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-white dark:to-slate-900',
          headerBg: 'bg-white/90 dark:bg-slate-900/90 border-pink-200 dark:border-pink-900/50',
          accentBorder: 'border-pink-300 dark:border-pink-800 shadow-pink-500/10',
          decor: '🌸 ✨ ❤️',
        };
      case 2: // Close Friend
        return {
          windowBg: 'bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-white dark:to-slate-900',
          headerBg: 'bg-white/90 dark:bg-slate-900/90 border-purple-200 dark:border-purple-900/50',
          accentBorder: 'border-purple-300 dark:border-purple-800 shadow-purple-500/10',
          decor: '✨ 💜',
        };
      case 1: // Getting Comfortable
        return {
          windowBg: 'bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-white dark:to-slate-900',
          headerBg: 'bg-white/90 dark:bg-slate-900/90 border-cyan-200 dark:border-cyan-900/50',
          accentBorder: 'border-cyan-300 dark:border-cyan-800 shadow-cyan-500/10',
          decor: '⭐ 🌟',
        };
      case 0: // First Meeting
      default:
        return {
          windowBg: 'bg-gradient-to-b from-sky-500/10 via-blue-500/5 to-white dark:to-slate-900',
          headerBg: 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800',
          accentBorder: 'border-slate-200 dark:border-slate-800 shadow-slate-500/10',
          decor: '📚 👋',
        };
    }
  };

  const theme = getWindowThemeStyles();

  // Quick Action Chips
  const questionActionChips = [
    { label: '💡 Jelaskan Soal Ini', prompt: 'Alin, tolong jelaskan soal ini langkah demi langkah yaa!', action: 'explain' },
    { label: '⚡ Kasih Trik Cepat', prompt: 'Ada trik kilat atau cara cepat ngerjain tipe soal begini gk?', action: 'trick' },
    { label: '🧠 Buat Soal Serupa', prompt: 'Coba bikinin 1 soal serupa materi ini buat latihan pemahaman dong!', action: 'similar' },
    { label: '📚 Jelaskan Materinya', prompt: 'Bisa jelaskan ringkasan materi dan konsep fundamental dari soal ini?', action: 'concept' },
    { label: '🔄 Coba Lagi', prompt: 'Alin, kasih petunjuk dulu dong tanpa ngasih tahu jawabannya langsung!', action: 'hint' },
  ];

  const generalActionChips = [
    { label: '🎯 Tips Lolos Ujian', prompt: 'Alin, kasih tips ampuh biar konsisten belajar dan lolos ujian dong!', action: 'study_tips' },
    { label: '⏱️ Manajemen Waktu', prompt: 'Gimana cara bagi waktu yang efektif pas ngerjain tryout?', action: 'time_mgmt' },
    { label: '💡 Trik Hafalan Cepat', prompt: 'Ada cara gampang mengingat materi ujian yang banyak gk?', action: 'memory' },
    { label: '☕ Semangatin Dong!', prompt: 'Lagi agak lelah nih, semangatin Alin dong biar balik fokus lagi!', action: 'cheer' },
  ];

  return (
    <div
      ref={chatContainerRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className={`fixed z-50 flex flex-col transition-shadow duration-300 shadow-2xl
        /* Mobile: full bottom panel */
        inset-x-0 bottom-0 top-12 sm:top-auto sm:inset-x-auto
        /* Desktop: floating bottom-right window */
        sm:right-6 sm:bottom-6 sm:w-[410px] sm:h-[620px] sm:max-h-[85vh]
        rounded-t-3xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90
        overflow-hidden ${theme.windowBg} backdrop-blur-md`}
    >
      {/* 1. Header (Draggable on Desktop) */}
      <div
        onMouseDown={handleMouseDown}
        className={`px-3.5 py-3 border-b flex items-center justify-between select-none ${theme.headerBg} ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } transition-colors`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <AlinAvatar
            expression={currentExpression}
            isThinking={isLoading}
            size="sm"
            showBadge={true}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                ALIN
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                AI Companion
              </span>
              <AlinFamiliarityBadge level={currentLevel} xp={currentXp} compact={true} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              {isLoading ? (
                <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                  <span>Alin sedang mikir</span>
                  <span className="flex gap-0.5 tracking-tighter">● ● ●</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Teman belajar kamu ✨</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpressionSheetOpen(true)}
            className={`p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 ${
              isExpressionSheetOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950' : ''
            }`}
            title="Lihat 24 Ekspresi ALIN"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isHistoryOpen ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950' : ''
            }`}
            title="Riwayat Percakapan"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={handleNewConversation}
            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Percakapan Baru"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onMinimize}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Tutup Alin"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conversations Drawer Layer */}
      <AlinConversationsDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isLoading={isLoadingHistory}
      />

      {/* 24 Expressions Sheet Modal Layer */}
      <AlinExpressionSheetModal
        isOpen={isExpressionSheetOpen}
        onClose={() => setIsExpressionSheetOpen(false)}
        currentExpression={currentExpression}
        onSelectExpression={(newExp) => setCurrentExpression(newExp)}
      />

      {/* 2. Active Question Context Banner (if user opened via 'Tanya Alin' on a question) */}
      {questionContext && (
        <div className="px-3.5 py-2 bg-indigo-50/95 dark:bg-indigo-950/80 border-b border-indigo-100 dark:border-indigo-900/60 flex items-start justify-between gap-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] mb-0.5">
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>Konteks Soal Aktif: {questionContext.subject || questionContext.category}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 truncate text-[11px]">
              "{questionContext.question}"
            </p>
          </div>
          {onClearQuestionContext && (
            <button
              onClick={onClearQuestionContext}
              className="text-[10px] text-slate-400 hover:text-rose-500 px-1.5 py-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Lepas konteks soal"
            >
              Lepas
            </button>
          )}
        </div>
      )}

      {/* 3. Messages Chat Thread */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-white/70 dark:bg-slate-900/70">
        {messages.map((msg, index) => {
          const isAlin = msg.role === 'assistant';

          return (
            <div
              key={msg.id || index}
              className={`flex gap-2.5 ${isAlin ? 'justify-start' : 'justify-end'} animate-in fade-in-50 duration-200`}
            >
              {isAlin && (
                <AlinAvatar
                  expression={index === messages.length - 1 ? currentExpression : 'normal'}
                  size="xs"
                  showBadge={false}
                  className="mt-0.5 shrink-0"
                />
              )}

              <div className={`relative group max-w-[85%] sm:max-w-[80%]`}>
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-xs ${
                    isAlin
                      ? 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                      : 'bg-indigo-600 text-white font-medium rounded-tr-sm shadow-indigo-600/20'
                  }`}
                >
                  {/* Clean Formatted Output */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Copy button on Alin responses */}
                  {isAlin && (
                    <div className="flex justify-end mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id || index)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                        title="Salin penjelasan"
                      >
                        {copiedId === (msg.id || index) ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[9px] text-slate-400 mt-1 px-1 ${
                    isAlin ? 'text-left' : 'text-right'
                  }`}
                >
                  {msg.created_at
                    ? new Date(msg.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Baru saja'}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
            <AlinAvatar expression="thinking" isThinking={true} size="xs" showBadge={false} />
            <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs flex items-center gap-2 shadow-xs">
              <span className="text-indigo-600 font-semibold text-[11px]">Alin lagi ngetik</span>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Action Chips Carousel */}
      <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {(questionContext ? questionActionChips : generalActionChips).map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt, chip.action)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs transition-all disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 5. Input Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              questionContext
                ? 'Tanya Alin tentang soal ini...'
                : 'Ketik pesan atau curhat belajar ke Alin...'
            }
            disabled={isLoading}
            className="flex-1 py-2 px-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all border border-transparent focus:border-indigo-400"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all shrink-0"
            title="Kirim pesan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
