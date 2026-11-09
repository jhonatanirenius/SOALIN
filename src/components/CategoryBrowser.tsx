import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Shield, 
  Briefcase, 
  Languages, 
  Search, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CategoryInfo, CategoryType } from '../types';
import { MAIN_CATEGORIES } from '../data/categories';

interface CategoryBrowserProps {
  onSelectCategory: (category: CategoryInfo) => void;
  onQuickStartCategory: (categoryName: string) => void;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  onSelectCategory,
  onQuickStartCategory
}) => {
  const [activeGroup, setActiveGroup] = useState<CategoryType | 'all'>('all');
  const [filterQuery, setFilterQuery] = useState('');

  const groupTabs: { id: CategoryType | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'Semua Kategori', icon: Layers },
    { id: 'tni_polri', label: 'TNI & Polri', icon: Shield },
    { id: 'cpns_pppk', label: 'CPNS & PPPK', icon: Briefcase },
    { id: 'kedinasan', label: 'Sekolah Kedinasan', icon: Building2 },
    { id: 'ujian_masuk', label: 'Ujian Masuk PTN', icon: GraduationCap },
    { id: 'sekolah', label: 'Sekolah (SD-SMA)', icon: BookOpen },
    { id: 'bahasa', label: 'Sertifikasi Bahasa', icon: Languages },
  ];

  const filteredCategories = MAIN_CATEGORIES.filter(cat => {
    const matchesGroup = activeGroup === 'all' || cat.type === activeGroup;
    const q = filterQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      cat.name.toLowerCase().includes(q) ||
      cat.code.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.subcategories.some(s => s.toLowerCase().includes(q)) ||
      cat.subjects.some(s => s.toLowerCase().includes(q));

    return matchesGroup && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Taksonomi Lengkap Kurikulum & Seleksi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Bank Soal & Kategori Lengkap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pilih jenjang sekolah atau formasi ujian seleksi untuk mengakses silabus materi dan bank soal.
          </p>
        </div>

        {/* Search input in category page */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Cari kategori (misal: AKMIL, SKD, SMA)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Group Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {groupTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeGroup === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            id={`card-category-${cat.id}`}
            onClick={() => onSelectCategory(cat)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  {cat.code}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {cat.totalQuestions.toLocaleString('id-ID')} Soal
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              {/* Subcategories tags preview */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {cat.subcategories.slice(0, 3).map((sub, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                  >
                    {sub}
                  </span>
                ))}
                {cat.subcategories.length > 3 && (
                  <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                    +{cat.subcategories.length - 3} lainnya
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Card Action */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Standar: {cat.difficultyRange}
              </span>
              <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Buka Detail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
