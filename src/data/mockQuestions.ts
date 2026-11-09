import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // 1. CPNS - TWK
  {
    id: 'q-cpns-twk-01',
    category: 'CPNS & ASN',
    subcategory: 'TWK',
    subject: 'Pancasila & UUD 1945',
    difficulty: 'Sedang',
    source: 'Kisi-kisi Resmi PermenPAN-RB No. 27 & Simulasi BKN',
    year: 2026,
    tags: ['Pancasila', 'UUD 1945', 'Sila Ke-5', 'Keadilan Sosial'],
    question: 'Sikap mengutamakan keseimbangan antara hak dan kewajiban serta tidak menggunakan hak milik untuk usaha-usaha yang bersifat pemerasan terhadap orang lain merupakan pengamalan butir sila ke-...',
    options: {
      A: 'Kedua: Kemanusiaan yang adil dan beradab',
      B: 'Ketiga: Persatuan Indonesia',
      C: 'Keempat: Kerakyatan yang dipimpin oleh hikmat kebijaksanaan',
      D: 'Kelima: Keadilan sosial bagi seluruh rakyat Indonesia',
      E: 'Pertama: Ketuhanan Yang Maha Esa'
    },
    correct_answer: 'D',
    explanation: 'Butir-butir pengamalan Sila Kelima (Keadilan Sosial bagi Seluruh Rakyat Indonesia) menegaskan: 1) Mengembangkan perbuatan yang luhur yang mencerminkan sikap kekeluargaan dan gotong royong; 2) Menjaga keseimbangan antara hak dan kewajiban; 3) Menghormati hak orang lain; 4) Tidak menggunakan hak milik untuk usaha-usaha yang bersifat pemerasan terhadap orang lain.',
    formula: 'Konsep Butir Sila Pancasila (Tap MPR No. I/MPR/2003)',
    quick_tip: 'Ingat kata kunci: "Keseimbangan hak & kewajiban", "tidak memeras", "hemat & tidak bergaya hidup mewah" selalu merujuk pada Sila ke-5.'
  },

  // 2. CPNS - TIU (Aritmetika / Hitung Cepat)
  {
    id: 'q-cpns-tiu-01',
    category: 'CPNS & ASN',
    subcategory: 'TIU',
    subject: 'Kemampuan Numerik (Deret, Aritmetika, Aljabar)',
    difficulty: 'Sedang',
    source: 'Bank Soal Standar TIU SKD BKN',
    year: 2026,
    tags: ['Aritmetika Sosial', 'Pekerja Tambahan', 'Perbandingan Berbalik Nilai'],
    question: 'Sebuah proyek pembangunan jembatan direncanakan selesai dalam waktu 40 hari oleh 15 orang pekerja. Setelah bekerja selama 10 hari, pekerjaan terhenti selama 5 hari karena cuaca buruk. Agar proyek tetap selesai tepat waktu sesuai jadwal semula, berapakah jumlah pekerja tambahan yang harus ditambahkan?',
    options: {
      A: '2 orang',
      B: '3 orang',
      C: '4 orang',
      D: '5 orang',
      E: '6 orang'
    },
    correct_answer: 'B',
    explanation: 'Gunakan konsep beban kerja (orang × hari):\n1. Total beban kerja rencana = 40 hari × 15 orang = 600 beban kerja.\n2. Pekerjaan yang telah selesai (10 hari pertama) = 10 × 15 = 150 beban kerja.\n3. Sisa beban kerja yang belum selesai = 600 - 150 = 450 beban kerja.\n4. Waktu yang tersisa = Total hari (40) - Hari berjalan (10) - Libur (5) = 25 hari.\n5. Jumlah pekerja yang dibutuhkan = Sisa beban / Sisa hari = 450 / 25 = 18 orang.\n6. Pekerja tambahan = 18 - 15 = 3 orang.',
    formula: 'Beban = Hari × Pekerja; Tambahan = (Pekerja_butuh - Pekerja_awal)',
    quick_tip: 'Trik Kilat: Tambahan = (Pekerja Awal × Hari Libur) / Sisa Hari Aktif = (15 × 5) / 25 = 75 / 25 = 3 orang!'
  },

  // 3. CPNS - TIU (Silogisme Logika)
  {
    id: 'q-cpns-tiu-02',
    category: 'CPNS & ASN',
    subcategory: 'TIU',
    subject: 'Kemampuan Verbal (Analogi, Silogisme, Analitis)',
    difficulty: 'Mudah',
    source: 'Simulasi TIU Penalaran Logis BKN',
    year: 2026,
    tags: ['Silogisme', 'Penalaran Logis', 'Kuantor'],
    question: 'Premis 1: Semua atlet yang lolos pelatnas memiliki disiplin tinggi dan fisik prima.\nPremis 2: Sebagian mahasiswa universitas X lolos pelatnas.\n\nKesimpulan yang paling tepat adalah...',
    options: {
      A: 'Semua mahasiswa universitas X memiliki disiplin tinggi dan fisik prima.',
      B: 'Sebagian mahasiswa universitas X memiliki disiplin tinggi dan fisik prima.',
      C: 'Semua yang memiliki disiplin tinggi adalah mahasiswa universitas X.',
      D: 'Sebagian atlet pelatnas bukan merupakan mahasiswa universitas X.',
      E: 'Mahasiswa universitas X yang tidak lolos pelatnas tidak memiliki fisik prima.'
    },
    correct_answer: 'B',
    explanation: 'Aturan silogisme kuantor:\n- Premis Universal ("Semua") + Premis Partikular ("Sebagian") menghasilkan kesimpulan Partikular ("Sebagian").\n- Karena sebagian mahasiswa universitas X lolos pelatnas, dan semua yang lolos pelatnas berdisiplin tinggi serta berfisik prima, maka sebagian mahasiswa universitas X tersebut dipastikan berdisiplin tinggi dan berfisik prima.',
    formula: 'Semua A adalah B + Sebagian C adalah A → Sebagian C adalah B',
    quick_tip: 'Jika ada premis "Sebagian", kesimpulan WAJIB diawali dengan kata "Sebagian / Beberapa", tidak boleh "Semua".'
  },

  // 4. CPNS - TKP (Pelayanan Publik)
  {
    id: 'q-cpns-tkp-01',
    category: 'CPNS & ASN',
    subcategory: 'TKP',
    subject: 'Pelayanan Publik & Jejaring Kerja',
    difficulty: 'Sedang',
    source: 'Indikator Kompetensi ASN BKN',
    year: 2026,
    tags: ['TKP', 'Pelayanan Publik', 'Sikap Solutif'],
    question: 'Anda adalah petugas loket pelayanan terpadu. Pada saat jam istirahat siang tersisa 5 menit lagi dan loket belum resmi dibuka, seorang lansia datang dengan terengah-engah meminta tolong dicetakkan berkas bantuan darurat karena ia harus segera mengejar mobil jemputan di puskesmas. Sikap Anda yang paling tepat adalah...',
    options: {
      A: 'Menolak dengan sopan dan memintanya menunggu sampai tepat pukul 13.00 sesuai SOP.',
      B: 'Meminta satpam untuk membantu menenangkan lansia tersebut sembari Anda menyelesaikan santap siang Anda.',
      C: 'Segera melayani lansia tersebut dengan ramah, mencetakkan berkasnya, dan memastikan keperluannya selesai sebelum jam buka resmi.',
      D: 'Meminta lansia tersebut mencari petugas lain yang mungkin sudah selesai makan siang.',
      E: 'Mencetakkan berkas tersebut namun menegurnya agar lain kali datang tepat pada jam operasional kerja.'
    },
    correct_answer: 'C',
    explanation: 'Dalam tes TKP aspek Pelayanan Publik, ASN dituntut berempati tinggi, responsif, dan mengutamakan kepentingan warga yang membutuhkan bantuan mendesak (terutama kelompok rentan seperti lansia) tanpa menunda-nunda apalagi waktu jeda istirahat hanya tersisa 5 menit. Pilihan C memiliki poin tertinggi (poin 5).',
    quick_tip: 'Kunci TKP: Pilih opsi yang menunjukkan inisiatif, empati tanpa arogansi, ramah, dan tuntas menyelesaikan masalah publik.'
  },

  // 5. AKMIL - Matematika (Vektor & Aljabar)
  {
    id: 'q-akmil-mat-01',
    category: 'AKMIL (Akademi Militer)',
    subcategory: 'Matematika',
    subject: 'Matematika Vektor, Aljabar, Trigonometri',
    difficulty: 'Sulit',
    source: 'Bank Latihan TPA Akademik Calon Taruna AKMIL',
    year: 2026,
    tags: ['Vektor', 'Dot Product', 'Sudut Dua Vektor', 'Akademi Militer'],
    question: 'Diketahui vektor u = (2, -1, 2) dan vektor v = (1, 2, -2). Berapakah besar sudut antara vektor u dan vektor v?',
    options: {
      A: 'arccos(-4/9)',
      B: 'arccos(-2/9)',
      C: 'arccos(4/9)',
      D: 'arccos(-1/3)',
      E: '90 derajat'
    },
    correct_answer: 'A',
    explanation: 'Langkah perhitungan sudut dua vektor:\n1. Rumus cos θ = (u · v) / (|u| × |v|)\n2. Perkalian titik (dot product): u · v = (2)(1) + (-1)(2) + (2)(-2) = 2 - 2 - 4 = -4\n3. Panjang vektor |u| = √(2² + (-1)² + 2²) = √(4 + 1 + 4) = √9 = 3\n4. Panjang vektor |v| = √(1² + 2² + (-2)²) = √(1 + 4 + 4) = √9 = 3\n5. cos θ = -4 / (3 × 3) = -4/9\n6. Maka sudut θ = arccos(-4/9).',
    formula: 'cos(θ) = (u · v) / (|u| · |v|)',
    quick_tip: 'Hitung dot product terlebih dahulu: jika hasilnya negatif, sudutnya tumpul (> 90°), otomatis jawaban E (90°) gugur.'
  },

  // 6. AKMIL - Pengetahuan Umum & Doktrin Pertahanan
  {
    id: 'q-akmil-pu-01',
    category: 'AKMIL (Akademi Militer)',
    subcategory: 'Pengetahuan Umum',
    subject: 'Wawasan Nusantara & Sejarah Perjuangan Militer',
    difficulty: 'Sedang',
    source: 'Materi Uji Wawasan Kebangsaan & Sejarah Pertahanan',
    year: 2026,
    tags: ['Doktrin Hankamrata', 'Sistem Pertahanan', 'TNI AD'],
    question: 'Sistem pertahanan dan keamanan yang dianut oleh Negara Kesatuan Republik Indonesia sebagaimana diamanatkan dalam Pasal 30 ayat (2) UUD 1945 adalah...',
    options: {
      A: 'Sistem Pertahanan Teritorial Aktif (Sishanta)',
      B: 'Sistem Pertahanan dan Keamanan Rakyat Semesta (Sishankamrata)',
      C: 'Sistem Pertahanan Koalisi Regional Asia Tenggara',
      D: 'Sistem Kekuatan Militer Mandiri Terpusat',
      E: 'Sistem Keamanan Swakarsa Terpadu'
    },
    correct_answer: 'B',
    explanation: 'Berdasarkan UUD 1945 Pasal 30 ayat (2): "Usaha pertahanan dan keamanan negara dilaksanakan melalui sistem pertahanan dan keamanan rakyat semesta oleh Tentara Nasional Indonesia dan Kepolisian Negara Republik Indonesia, sebagai kekuatan utama, dan rakyat, sebagai kekuatan pendukung."',
    formula: 'Pasal 30 ayat (2) UUD 1945',
    quick_tip: 'Kata kunci Pasal 30 UUD 1945: TNI & POLRI = Kekuatan Utama, Rakyat = Kekuatan Pendukung dalam Sishankamrata.'
  },

  // 7. TNI - Psikotes (Tes Kecermatan & Ketelitian Huruf Hilang)
  {
    id: 'q-tni-ketelitian-01',
    category: 'TNI (AD, AL, AU)',
    subcategory: 'Tes Ketelitian',
    subject: 'Tes Kecermatan Simbol & Huruf Hilang',
    difficulty: 'Sedang',
    source: 'Standar Psikotes Matra TNI AD/AL/AU',
    year: 2026,
    tags: ['Kecermatan', 'Angka Hilang', 'Psikotes TNI'],
    question: 'Diberikan kolom kunci petunjuk:\n[A = 7]  [B = 4]  [C = 9]  [D = 2]  [E = 5]\n\nSoal:\nBaris angka: 9   7   5   4\n\nManakah huruf yang TIDAK terdapat pada baris angka di atas?',
    options: {
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D',
      E: 'E'
    },
    correct_answer: 'D',
    explanation: 'Pemeriksaan:\n- 9 = C (ada)\n- 7 = A (ada)\n- 5 = E (ada)\n- 4 = B (ada)\n- Angka 2 (yang bernilai D) tidak ada dalam baris soal.\nMaka huruf yang hilang/tidak terdapat adalah D.',
    quick_tip: 'Trik kecepatan psikotes kecermatan: Lirik cepat angka kunci 2 tidak muncul sama sekali di soal, langsung pilih D.'
  },

  // 8. POLRI - Psikotes (Penalaran Verbal & Hubungan Kata)
  {
    id: 'q-polri-verbal-01',
    category: 'POLRI (Akpol & Bintara)',
    subcategory: 'Tes Verbal',
    subject: 'Sinonim, Antonim, Analogi Verbal',
    difficulty: 'Mudah',
    source: 'Psikotes Calon Bintara & Akpol Polri',
    year: 2026,
    tags: ['Analogi Kata', 'Hubungan Logis', 'Polri'],
    question: 'VONIS : HAKIM = ... : ...',
    options: {
      A: 'Buku : Penulis',
      B: 'Resep : Dokter',
      C: 'Hukum : Polisi',
      D: 'Pasien : Rumah Sakit',
      E: 'Surat : Pos'
    },
    correct_answer: 'B',
    explanation: 'Hubungan analogi fungsi:\n- HAKIM mengeluarkan keputusan resmi berupa VONIS.\n- DOKTER mengeluarkan instruksi pengobatan resmi berupa RESEP.\nPola: [Produk Keputusan Resmi : Profesi yang Berwenang].',
    quick_tip: 'Buat kalimat penghubung singkat: "Hakim menetapkan vonis, sebagaimana dokter mengeluarkan resep."'
  },

  // 9. KEDINASAN - STAN (TPA Numerik & Kecepatan Kerja)
  {
    id: 'q-stan-tpa-01',
    category: 'Sekolah Kedinasan',
    subcategory: 'STAN',
    subject: 'TPA Numerik & Logika Tinggi PKN STAN',
    difficulty: 'Sulit',
    source: 'Bank Latihan Seleksi Mahasiswa Baru PKN STAN',
    year: 2026,
    tags: ['PKN STAN', 'Kecepatan Kerja', 'Aritmetika Kuantitatif'],
    question: 'Pipa A dapat mengisi penuh sebuah tandon air dalam waktu 6 jam. Pipa B dapat mengisi penuh tandon yang sama dalam waktu 4 jam. Jika kedua pipa dibuka bersamaan, berapa waktu yang dibutuhkan untuk mengisi penuh tandon tersebut?',
    options: {
      A: '2 jam 12 menit',
      B: '2 jam 24 menit',
      C: '2 jam 30 menit',
      D: '2 jam 48 menit',
      E: '3 jam 00 menit'
    },
    correct_answer: 'B',
    explanation: 'Langkah perhitungan kerja gabungan:\n1. Debit Pipa A = 1/6 tandon/jam\n2. Debit Pipa B = 1/4 tandon/jam\n3. Debit bersama = 1/6 + 1/4 = (2 + 3) / 12 = 5/12 tandon/jam\n4. Waktu yang diperlukan = 1 / (5/12) = 12/5 jam\n5. Konversi pecahan ke jam & menit:\n   12/5 jam = 2 2/5 jam = 2 jam + (2/5 × 60 menit) = 2 jam 24 menit.',
    formula: 't_gabungan = (t1 × t2) / (t1 + t2)',
    quick_tip: 'Rumus Cepat Kerja Bersama: (6 × 4) / (6 + 4) = 24 / 10 = 2,4 jam. 0,4 × 60 = 24 menit → 2 jam 24 menit!'
  },

  // 10. KEDINASAN - STIS (Statistika & Peluang)
  {
    id: 'q-stis-mat-01',
    category: 'Sekolah Kedinasan',
    subcategory: 'STIS',
    subject: 'Matematika Statistik & Analisis Data STIS',
    difficulty: 'Sulit',
    source: 'Simulasi Seleksi Polstat STIS Statistika Terapan',
    year: 2026,
    tags: ['Peluang', 'Kombinasi', 'Polstat STIS'],
    question: 'Dalam sebuah kotak terdapat 5 bola merah dan 3 bola putih. Jika diambil 2 bola secara acak sekaligus tanpa pengembalian, berapakah peluang terambilnya sekurang-kurangnya 1 bola putih?',
    options: {
      A: '10/28',
      B: '15/28',
      C: '18/28',
      D: '25/28',
      E: '9/14'
    },
    correct_answer: 'C',
    explanation: 'Gunakan prinsip komplemen peluang:\n1. Total bola = 5 merah + 3 putih = 8 bola.\n2. Banyak cara memilih 2 bola dari 8: n(S) = C(8, 2) = (8 × 7) / 2 = 28 cara.\n3. Komplemen dari "sekurang-kurangnya 1 bola putih" adalah "sama sekali tidak ada bola putih" (yaitu keduanya bola merah).\n4. Cara memilih 2 bola merah dari 5: n(Merah) = C(5, 2) = (5 × 4) / 2 = 10 cara.\n5. Peluang keduanya merah: P(Merah) = 10/28.\n6. Peluang sekurang-kurangnya 1 putih = 1 - P(Merah) = 1 - 10/28 = 18/28 (atau 9/14). Karena di pilihan tertera 18/28, jawaban C tepat.',
    formula: 'P(A) = 1 - P(A_komplemen); C(n, r) = n! / (r!(n-r)!)',
    quick_tip: 'Jika ada kata "sekurang-kurangnya 1", selalu cari lawannya (0 kejadian) lalu hitung: 1 - P(lawan).'
  },

  // 11. TKA - Penalaran Matematika
  {
    id: 'q-tka-mat-01',
    category: 'TKA (Tes Kemampuan Akademik)',
    subcategory: 'TKA Matematika',
    subject: 'Penalaran Matematika & Kuantitatif',
    difficulty: 'Sedang',
    source: 'Format Standar SNBT & TKA Perguruan Tinggi',
    year: 2026,
    tags: ['Eksponen', 'Persamaan Aljabar', 'TKA'],
    question: 'Jika 3^(2x - 1) = 27^(x - 2), maka nilai x yang memenuhi persamaan tersebut adalah...',
    options: {
      A: '3',
      B: '4',
      C: '5',
      D: '6',
      E: '7'
    },
    correct_answer: 'C',
    explanation: 'Langkah penyelesaian persamaan eksponen:\n1. Samakan basis eksponen ke basis 3:\n   27 = 3³\n2. Maka persamaan menjadi:\n   3^(2x - 1) = (3³)^(x - 2)\n   3^(2x - 1) = 3^(3x - 6)\n3. Karena basis sama (3), samakan pangkatnya:\n   2x - 1 = 3x - 6\n   -1 + 6 = 3x - 2x\n   5 = x\n   x = 5.',
    formula: 'a^f(x) = a^g(x) ⇔ f(x) = g(x)',
    quick_tip: 'Ubah angka besar ke bentuk pangkat prima terkecil terlebih dahulu (27 = 3³).'
  },

  // 12. TKA - Literasi Bahasa Indonesia
  {
    id: 'q-tka-bind-01',
    category: 'TKA (Tes Kemampuan Akademik)',
    subcategory: 'TKA Bahasa Indonesia',
    subject: 'Literasi dalam Bahasa Indonesia',
    difficulty: 'Sedang',
    source: 'Silabus SNBT Balai Pengelolaan Pengujian Pendidikan (BP3)',
    year: 2026,
    tags: ['Gagasan Utama', 'Literasi Membaca', 'Bahasa Indonesia'],
    question: 'Cermati paragraf berikut:\n"Transisi energi baru dan terbarukan di Indonesia menghadapi tantangan pendanaan dan kesiapan infrastruktur jaringan listrik. Kendati potensi energi surya dan panas bumi di tanah air sangat melimpah, biaya modal awal pembangunan pembangkit masih relatif tinggi dibandingkan energi fosil. Oleh sebab itu, diperlukan skema insentif fiskal dan kepastian regulasi investasi jangka panjang guna menarik minat pelaku industri swasta."\n\nIde pokok paragraf di atas adalah...',
    options: {
      A: 'Melimpahnya potensi energi surya dan panas bumi di seluruh Indonesia.',
      B: 'Tantangan transisi energi terbarukan di Indonesia dan perlunya insentif regulasi.',
      C: 'Perbandingan biaya modal energi fosil dan energi surya yang tidak seimbang.',
      D: 'Dominasi industri swasta dalam proyek infrastruktur energi baru terbarukan.',
      E: 'Kegagalan pembangunan pembangkit listrik energi ramah lingkungan.'
    },
    correct_answer: 'B',
    explanation: 'Ide pokok mencakup keseluruhan pesan dalam paragraf campuran tersebut: kalimat pertama memaparkan tantangan (pendanaan dan infrastruktur), kalimat kedua mempertegas biaya modal, dan kalimat terakhir memberikan simpulan solusi yang dibutuhkan (insentif regulasi dan investasi). Pilihan B merangkum utuh ide tersebut.',
    quick_tip: 'Ide pokok yang tepat tidak boleh terlalu sempit (hanya mengambil 1 contoh kalimat) dan tidak boleh berasumsi liar di luar teks.'
  },

  // 13. SEKOLAH - Fisika SMA (Dinamika Gerak)
  {
    id: 'q-sekolah-fisika-01',
    category: 'Sekolah & Akademik',
    subcategory: 'Fisika',
    subject: 'Fisika Mekanika, Listrik & Magnet, Termodinamika',
    difficulty: 'Sedang',
    source: 'Kurikulum Merdeka / Bank Soal Fisika SMA',
    year: 2026,
    tags: ['Hukum Newton', 'Gaya Gesek', 'Fisika SMA'],
    question: 'Sebuah balok bermassa 4 kg berada di atas lantai mendatar yang kasar dengan koefisien gesekan kinetik μk = 0,2. Balok ditarik dengan gaya horizontal konstan F = 20 N. Jika percepatan gravitasi g = 10 m/s², percepatan balok tersebut adalah...',
    options: {
      A: '2 m/s²',
      B: '3 m/s²',
      C: '4 m/s²',
      D: '5 m/s²',
      E: '6 m/s²'
    },
    correct_answer: 'B',
    explanation: 'Langkah perhitungan Hukum II Newton:\n1. Gaya normal N = w = m × g = 4 kg × 10 m/s² = 40 N.\n2. Gaya gesek kinetik fk = μk × N = 0,2 × 40 N = 8 N.\n3. Resultan gaya searah sumbu X:\n   ΣF = F - fk = 20 N - 8 N = 12 N.\n4. Berdasarkan Hukum II Newton: a = ΣF / m\n   a = 12 N / 4 kg = 3 m/s².',
    formula: 'ΣF = m × a ; fk = μk × N',
    quick_tip: 'Percepatan a = (F_tarik - F_gesek) / m = (20 - 0,2×40) / 4 = 12/4 = 3 m/s².'
  },

  // 14. SEKOLAH - Biologi SMA (Genetika)
  {
    id: 'q-sekolah-bio-01',
    category: 'Sekolah & Akademik',
    subcategory: 'Biologi',
    subject: 'Biologi Genetika, Sel & Metabolisme, Ekologi',
    difficulty: 'Mudah',
    source: 'Materi Standar Olimpiade & Ujian Sekolah Biologi',
    year: 2026,
    tags: ['Sintesis Protein', 'Kodon', 'Transkripsi'],
    question: 'Jika untai cetakan (template/antisense) DNA memiliki urutan basa nitrogen 3\'- TAC GGC TTA CGA - 5\', maka urutan basa nitrogen pada mRNA (kodon) hasil transkripsi adalah...',
    options: {
      A: '5\'- AUG CCG AAU GCU - 3\'',
      B: '5\'- ATG CCG AAT GCT - 3\'',
      C: '5\'- UAC GGC UUA CGA - 3\'',
      D: '5\'- AUC GGC UUA GCU - 3\'',
      E: '5\'- TAC GGC TTA CGA - 3\''
    },
    correct_answer: 'A',
    explanation: 'Aturan transkripsi DNA antisense (3\' → 5\') menjadi mRNA (5\' → 3\'):\n- T (Timin) berpasangan dengan A (Adenin)\n- A (Adenin) berpasangan dengan U (Urasil, karena RNA tidak memiliki Timin)\n- C (Sitosin) berpasangan dengan G (Guanin)\n- G (Guanin) berpasangan dengan C (Sitosin)\nMaka:\nTAC → AUG\nGGC → CCG\nTTA → AAU\nCGA → GCU\nHasil mRNA = 5\'- AUG CCG AAU GCU - 3\'.',
    formula: 'Transkripsi: T↔A, A→U, C↔G',
    quick_tip: 'Ingat! RNA tidak pernah punya basa T (Timin), semua diganti U (Urasil). Jawaban B langsung salah.'
  },

  // 15. UJIAN NASIONAL / SEKOLAH - Matematika Terstandar
  {
    id: 'q-ujian-un-01',
    category: 'Ujian Nasional / Sekolah',
    subcategory: 'Soal Berdasarkan Mata Pelajaran',
    subject: 'Matematika Terstandar USBN',
    difficulty: 'Sedang',
    source: 'Arsip Ujian Sekolah Terstandar Nasional',
    year: 2025,
    tags: ['Matriks', 'Determinan', 'Aljabar Linear'],
    question: 'Diketahui matriks A = [[2, 3], [1, 4]]. Nilai dari determinan invers matriks A atau det(A⁻¹) adalah...',
    options: {
      A: '5',
      B: '1/5',
      C: '-5',
      D: '-1/5',
      E: '1/11'
    },
    correct_answer: 'B',
    explanation: 'Sifat determinan:\n1. Determinan matriks A (ordo 2x2):\n   det(A) = (ad - bc) = (2 × 4) - (3 × 1) = 8 - 3 = 5.\n2. Sifat determinan matriks invers:\n   det(A⁻¹) = 1 / det(A)\n3. Maka det(A⁻¹) = 1/5.',
    formula: 'det(A⁻¹) = 1 / det(A)',
    quick_tip: 'Tidak perlu mencari matriks inversnya satu per satu! Cukup cari determinan A lalu balik jadi 1/det(A).'
  }
];
