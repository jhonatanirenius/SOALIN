import React from 'react';
import { BookOpenCheck, Shield, Heart, AlertTriangle, Play } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onReplayIntro?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onReplayIntro }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                SOALIN
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                INDONESIA
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Platform belajar dan bank soal terpadu untuk pelajar sekolah, mahasiswa, serta pejuang seleksi kedinasan, TNI, Polri, CPNS, dan ujian masuk perguruan tinggi.
            </p>

            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
              <span>Dikembangkan dengan dedikasi</span>
              <span>•</span>
              <span className="text-slate-400 font-semibold">By JNN Irenius Studio</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
              Bank Soal
            </h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">TNI & Polri (Akmil/Akpol)</button></li>
              <li><button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">CPNS & PPPK (SKD/SKB)</button></li>
              <li><button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">Kedinasan (STAN/STIS/IPDN)</button></li>
              <li><button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">UTBK SNBT & SIMAK UI</button></li>
              <li><button onClick={() => onNavigate('categories')} className="hover:text-white transition-colors">Sekolah (SD, SMP, SMA)</button></li>
            </ul>
          </div>

          {/* Fitur Utama */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
              Fitur Utama
            </h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('tryout')} className="hover:text-white transition-colors">Simulasi Tryout CAT</button></li>
              <li><button onClick={() => onNavigate('review')} className="hover:text-white transition-colors">Ulangi Soal Salah</button></li>
              <li><button onClick={() => onNavigate('progress')} className="hover:text-white transition-colors">Rapor Diagnostik Materi</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">SOALIN AI Study Tutor</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Leaderboard & Streak</button></li>
            </ul>
          </div>

          {/* Catatan Legal & Hak Cipta */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standar Edukasi</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Prinsip Orisinalitas</span>
              </div>
              <p>
                Semua butir soal disusun dengan konsep yang setara, domain publik, dan simulasi kurikulum resmi. SOALIN menjunjung tinggi integritas akademik dan bukan merupakan bocoran rahasia instansi manapun.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} SOALIN — Bank Soal & Tryout Indonesia. Hak cipta dilindungi.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {onReplayIntro && (
              <button
                id="btn-footer-replay-intro"
                onClick={onReplayIntro}
                className="hover:text-cyan-400 text-slate-400 cursor-pointer flex items-center gap-1.5 transition-colors font-medium"
                title="Tampilkan kembali animasi intro pembuka"
              >
                <Play className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
                <span>Putar Ulang Intro</span>
              </button>
            )}
            {onReplayIntro && <span>•</span>}
            <span className="hover:text-slate-400 cursor-pointer">Syarat & Ketentuan</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Bantuan</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
