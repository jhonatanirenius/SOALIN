import React, { useState } from 'react';
import { X, Sparkles, Check, Image as ImageIcon, Grid } from 'lucide-react';
import { AlinExpression } from '../../types';
import { AlinCharacterAsset, ALIN_EXPRESSIONS_LIST, AlinExpressionMeta } from './AlinCharacterAsset';

interface AlinExpressionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExpression: AlinExpression;
  onSelectExpression: (exp: AlinExpression) => void;
}

export const AlinExpressionSheetModal: React.FC<AlinExpressionSheetModalProps> = ({
  isOpen,
  onClose,
  currentExpression,
  onSelectExpression,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'fullSheet'>('grid');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Semua (24)' },
    { id: 'positive', label: 'Ceria & Semangat' },
    { id: 'thinking', label: 'Mikir & Analisa' },
    { id: 'reaction', label: 'Reaksi & Kejutan' },
    { id: 'emotional', label: 'Emosional & Sedih' },
    { id: 'affection', label: 'Kasih & Sayang' },
    { id: 'tired', label: 'Lelah & Tidur' },
  ];

  const filteredList = filterCategory === 'all'
    ? ALIN_EXPRESSIONS_LIST
    : ALIN_EXPRESSIONS_LIST.filter((item) => item.category === filterCategory);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
              ✨
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  24 Ekspresi Karakter ALIN
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-semibold">
                  Official Sheet
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pilih ekspresi untuk mengubah ekspresi ALIN di ruang chat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Tampilan Grid 24 Kartu"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline text-[11px]">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('fullSheet')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
                  viewMode === 'fullSheet'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Tampilan Lembar Asli Penuh"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline text-[11px]">Sheet</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <>
            {/* Category Filter Chips */}
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                    filterCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 24 Expressions Grid */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {filteredList.map((item: AlinExpressionMeta) => {
                const isSelected = currentExpression === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectExpression(item.id);
                      onClose();
                    }}
                    className={`group relative flex flex-col items-center p-2 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-400/40 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                    }`}
                  >
                    {/* Active Checkmark Pill */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs z-10">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Number Badge */}
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono z-10">
                      #{item.num}
                    </span>

                    {/* Chibi Character Graphic using cropped image with fallback */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 my-1 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                      <img
                        src={`/alin_expressions/${item.id}.png`}
                        alt={item.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }} className="w-full h-full p-1">
                        <AlinCharacterAsset expression={item.id} showCardBackground={false} />
                      </div>
                    </div>

                    {/* Title and Emoji */}
                    <div className="w-full text-center mt-0.5">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs">{item.emoji}</span>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 dark:text-slate-500 truncate mt-0.5 px-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Full Sheet View */
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md max-w-full">
              <img
                src="/alin_expressions/sheet.jpg"
                alt="ALIN 24 Expression Sheet"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[60vh] rounded-2xl"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Lembar Asli 24 Ekspresi Karakter ALIN (Teman Belajar SOALIN)
            </p>
          </div>
        )}

        {/* Modal Footer / Hint */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ekspresi berganti otomatis saat chat berlangsung</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
