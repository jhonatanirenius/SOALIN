import React from 'react';
import { Plus, MessageSquare, Trash2, X, Clock, Loader2 } from 'lucide-react';
import { AlinConversation } from '../../types';

interface AlinConversationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: AlinConversation[];
  activeConversationId: number | null;
  onSelectConversation: (conv: AlinConversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (convId: number) => void;
  isLoading: boolean;
}

export const AlinConversationsDrawer: React.FC<AlinConversationsDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end sm:justify-start">
      <div className="h-full w-full sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Riwayat Obrolan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            title="Tutup riwayat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Obrolan Baru</span>
          </button>
        </div>

        {/* List of Conversations */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-xs">Memuat obrolan...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">Belum ada obrolan tersimpan</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Kirim pesan pertama kamu ke Alin sekarang!
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const dateStr = conv.created_at
                ? new Date(conv.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Baru';

              return (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => {
                    onSelectConversation(conv);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{conv.title || 'Obrolan Belajar'}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Hapus obrolan ini?')) {
                        onDeleteConversation(conv.id);
                      }
                    }}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 text-slate-400 transition-all shrink-0 ml-1"
                    title="Hapus obrolan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
