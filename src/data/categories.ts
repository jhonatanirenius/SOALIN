import { CategoryInfo } from '../types';

export const OFFICIAL_DISCLAIMER = 
  'Materi latihan dan simulasi pada platform SOALIN disusun berdasarkan standar kompetensi, kisi-kisi resmi BKN/Panselnas/Mendikbudristek, dan silabus uji setara. Bukan dokumen rahasia ataupun bocoran seleksi resmi.';

export const MAIN_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cpns',
    name: 'CPNS & ASN',
    code: 'CPNS',
    type: 'cpns_pppk',
    iconName: 'Building2',
    description: 'Persiapan Seleksi Kompetensi Dasar (SKD) Calon Pegawai Negeri Sipil & Pegawai Pemerintah dengan Perjanjian Kerja (PPPK).',
    totalQuestions: 2450,
    subcategories: ['TWK', 'TIU', 'TKP', 'SKD', 'Simulasi SKD', 'Latihan Berdasarkan Materi', 'Tryout SKD'],
    subjects: [
      'Pancasila & UUD 1945',
      'Bhinneka Tunggal Ika & NKRI',
      'Nasionalisme & Integritas',
      'Kemampuan Verbal (Analogi, Silogisme, Analitis)',
      'Kemampuan Numerik (Deret, Aritmetika, Aljabar)',
      'Kemampuan Figural (Analogi, Ketidaksamaan, Serial)',
      'Pelayanan Publik & Jejaring Kerja',
      'Sosial Budaya & TIK',
      'Profesionalisme & Anti Radikalisme'
    ],
    popular: true,
    color: 'emerald',
    accentBg: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    difficultyRange: 'Sedang – Sulit',
    disclaimer: OFFICIAL_DISCLAIMER
  },
  {
    id: 'akmil',
    name: 'AKMIL (Akademi Militer)',
    code: 'AKMIL',
    type: 'tni_polri',
    iconName: 'ShieldAlert',
    description: 'Latihan soal persiapan seleksi Calon Taruna Akademi Militer TNI AD, meliputi Tes Potensi Akademik, Pengetahuan Umum, dan Psikotes.',
    totalQuestions: 1840,
    subcategories: [
      'Akademik',
      'Matematika',
      'Bahasa Inggris',
      'Bahasa Indonesia',
      'Pengetahuan Umum',
      'Psikotes',
      'Logika',
      'Numerik',
      'Verbal',
      'Ketelitian',
      'Tes Potensi Akademik'
    ],
    subjects: [
      'Matematika Vektor, Aljabar, Trigonometri',
      'Bahasa Inggris Grammar & Reading Comprehension',
      'Bahasa Indonesia Tata Makna & Paragraf',
      'Wawasan Nusantara & Sejarah Perjuangan Militer',
      'Psikotes Logika Aritmetika',
      'Tes Kecermatan & Angka Hilang',
      'Penalaran Mekanikal & Spasial'
    ],
    popular: true,
    color: 'amber',
    accentBg: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    difficultyRange: 'Sedang – Sangat Sulit',
    disclaimer: 'Soal latihan ini disesuaikan dengan kurikulum seleksi Calon Taruna/i Akmil TNI. Bukan soal resmi atau bocoran seleksi.'
  },
  {
    id: 'tni',
    name: 'TNI (AD, AL, AU)',
    code: 'TNI',
    type: 'tni_polri',
    iconName: 'Shield',
    description: 'Persiapan seleksi TNI tingkat Akmil, Bintara (Caba), dan Tamtama (Cata) untuk matra Angkatan Darat, Laut, dan Udara.',
    totalQuestions: 1920,
    subcategories: [
      'Psikotes TNI',
      'Tes Verbal',
      'Tes Numerik',
      'Tes Logika',
      'Tes Penalaran',
      'Tes Ketelitian',
      'Tes Kepribadian',
      'Tes Kemampuan Umum',
      'Simulasi Psikotes',
      'Latihan Persiapan Akmil',
      'Latihan Persiapan Bintara',
      'Latihan Persiapan Tamtama'
    ],
    subjects: [
      'Sinonim, Antonim, Analogi Verbal',
      'Deret Angka & Hitung Cepat',
      'Tes Logika Penalaran Gambar & Spasial',
      'Tes Kecermatan Simbol & Huruf Hilang',
      'Tes Kraepelin & Pauli Simulator',
      'Tes Sikap Kerja & Kepribadian'
    ],
    popular: true,
    color: 'red',
    accentBg: 'from-red-500/10 to-rose-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    difficultyRange: 'Mudah – Sulit',
    disclaimer: OFFICIAL_DISCLAIMER
  },
  {
    id: 'polri',
    name: 'POLRI (Akpol & Bintara)',
    code: 'POLRI',
    type: 'tni_polri',
    iconName: 'BadgeCheck',
    description: 'Bank soal dan simulasi psikotes Polri, tes akademik calon Akpol, Bintara PTU/Bakomsus, dan Tamtama Polri.',
    totalQuestions: 1780,
    subcategories: [
      'Psikotes Polri',
      'Tes Verbal',
      'Tes Numerik',
      'Tes Logika',
      'Tes Penalaran',
      'Tes Ketelitian',
      'Tes Kepribadian',
      'Tes Kemampuan Umum',
      'Simulasi Psikotes Polri'
    ],
    subjects: [
      'Penalaran Verbal & Wacana Hukum',
      'Matematika Dasar & Aritmetika Sosial',
      'Tes Logika Analitis',
      'Tes Kolom Angka / Huruf Berpasangan',
      'Tes Kecermatan & Ketelitian Mental',
      'Tes Karakteristik Pribadi Calon Bhayangkara'
    ],
    popular: true,
    color: 'blue',
    accentBg: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    difficultyRange: 'Sedang – Sulit',
    disclaimer: OFFICIAL_DISCLAIMER
  },
  {
    id: 'kedinasan',
    name: 'Sekolah Kedinasan',
    code: 'KEDINASAN',
    type: 'kedinasan',
    iconName: 'GraduationCap',
    description: 'Latihan seleksi perguruan tinggi kedinasan ikatan dinas favorit di Indonesia: PKN STAN, IPDN, Polstat STIS, STMKG, STIN, dan lainnya.',
    totalQuestions: 2150,
    subcategories: [
      'STAN',
      'IPDN',
      'STIS',
      'STMKG',
      'STIN',
      'Sekolah Kedinasan Lainnya',
      'Tes SKD Kedinasan',
      'TWK',
      'TIU',
      'TKP'
    ],
    subjects: [
      'SKD BKN Kedinasan (TWK, TIU, TKP)',
      'TPA Numerik & Logika Tinggi PKN STAN',
      'Tes Bahasa Inggris (TBI) & Grammar Analysis',
      'Matematika Statistik & Analisis Data STIS',
      'Fisika & Matematika Terapan STMKG',
      'Tes Intelijen & Analisis Kritis STIN'
    ],
    popular: true,
    color: 'purple',
    accentBg: 'from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    difficultyRange: 'Sedang – Sangat Sulit',
    disclaimer: OFFICIAL_DISCLAIMER
  },
  {
    id: 'tka',
    name: 'TKA (Tes Kemampuan Akademik)',
    code: 'TKA',
    type: 'ujian_masuk',
    iconName: 'BrainCircuit',
    description: 'Ujian seleksi masuk perguruan tinggi negeri (SNBT / UTBK / Ujian Mandiri) dan pemetaan kemampuan akademik.',
    totalQuestions: 1650,
    subcategories: [
      'TKA Matematika',
      'TKA Bahasa Indonesia',
      'TKA Bahasa Inggris',
      'TKA Sesuai Jenjang',
      'Latihan Per Topik',
      'Tryout TKA'
    ],
    subjects: [
      'Penalaran Matematika & Kuantitatif',
      'Literasi dalam Bahasa Indonesia',
      'Literasi dalam Bahasa Inggris',
      'Pemahaman Bacaan & Menulis (PBM)',
      'Kemampuan Memahami Bacaan Umum (PPU)'
    ],
    popular: true,
    color: 'cyan',
    accentBg: 'from-cyan-500/10 to-sky-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    difficultyRange: 'Sedang – Sulit',
    disclaimer: OFFICIAL_DISCLAIMER
  },
  {
    id: 'sekolah',
    name: 'Sekolah & Akademik',
    code: 'SEKOLAH',
    type: 'sekolah',
    iconName: 'BookOpen',
    description: 'Bank materi dan latihan soal berjenjang SD, SMP, hingga SMA untuk mata pelajaran sains, sosial, bahasa, dan teknologi informasi.',
    totalQuestions: 3100,
    subcategories: [
      'SD',
      'SMP',
      'SMA',
      'Matematika',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Fisika',
      'Kimia',
      'Biologi',
      'Ekonomi',
      'Geografi',
      'Sejarah',
      'Informatika'
    ],
    subjects: [
      'Matematika Wajib & Peminatan',
      'Fisika Mekanika, Listrik & Magnet, Termodinamika',
      'Kimia Stoikiometri, Larutan, Senyawa Karbon',
      'Biologi Genetika, Sel & Metabolisme, Ekologi',
      'Ekonomi Akuntansi & Pasar Modal',
      'Geografi Penginderaan Jauh & Dinamika Litosfer',
      'Informatika Algoritma & Berpikir Komputasional'
    ],
    popular: false,
    color: 'indigo',
    accentBg: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    difficultyRange: 'Mudah – Sedang',
    disclaimer: OFFICIAL_DISCLAIMER
  },
  {
    id: 'un_usbn',
    name: 'Ujian Nasional / Sekolah',
    code: 'UJIAN',
    type: 'sekolah',
    iconName: 'Award',
    description: 'Koleksi soal terstandar Ujian Sekolah (US), Asesmen Standar Pendidikan, dan arsip model ujian nasional per tahun dan mapel.',
    totalQuestions: 1420,
    subcategories: [
      'Soal UN',
      'Soal USBN',
      'Soal Ujian Sekolah',
      'Soal Berdasarkan Mata Pelajaran',
      'Soal Berdasarkan Tahun'
    ],
    subjects: [
      'Matematika Terstandar USBN',
      'Bahasa Indonesia Ujian Akhir',
      'Bahasa Inggris Reading & Structure',
      'IPA Terpadu & IPS Terpadu SMP',
      'Ujian Sekolah Berstandar Nasional SMA'
    ],
    popular: false,
    color: 'teal',
    accentBg: 'from-teal-500/10 to-emerald-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400',
    difficultyRange: 'Sedang',
    disclaimer: 'Soal disusun oleh tim edukator SOALIN berdasarkan kisi-kisi Ujian Sekolah dan domain publik edukasi.'
  }
];
