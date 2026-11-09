import { db } from '../db/index.ts';
import { questions, learning_packages, generation_configs } from '../db/schema.ts';
import { INITIAL_QUESTIONS } from '../data/mockQuestions.ts';
import { sql } from 'drizzle-orm';
import { formatDate } from '../db/queries.ts';

export async function seedQuestionsDatabase() {
  try {
    console.log('[Seed] Memeriksa status bank soal di Cloud SQL...');
    const countRes = await db.select({ count: sql<number>`count(*)::int` }).from(questions);
    const currentCount = countRes[0]?.count || 0;

    if (currentCount >= 40) {
      console.log(`[Seed] Bank soal sudah terisi (${currentCount} soal). Melewati seeding awal.`);
      return;
    }

    console.log(`[Seed] Bank soal masih sedikit (${currentCount} soal). Melakukan seeding bank soal komprehensif...`);

    const questionsToInsert: any[] = [];
    const now = new Date();

    // 1. Insert INITIAL_QUESTIONS
    for (const q of INITIAL_QUESTIONS) {
      questionsToInsert.push({
        question_id: q.id,
        category: q.category.includes('CPNS') ? 'TIU' : (q.category.includes('AKMIL') || q.category.includes('TNI') ? 'TIU' : q.category),
        subcategory: q.subcategory || q.subject || 'Umum',
        subject: q.subject || q.subcategory || 'Umum',
        question_text: q.question,
        question_type: 'multiple_choice',
        options: JSON.stringify(q.options),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        hint: q.quick_tip || 'Analisis konsep dasar dan eliminasi opsi yang tidak logis.',
        difficulty: q.difficulty || 'Sedang',
        difficulty_score: q.difficulty === 'Mudah' ? 4 : (q.difficulty === 'Sulit' ? 8 : 6),
        topic: q.subject || q.subcategory || 'Materi Inti',
        tags: JSON.stringify(q.tags || ['Kurikulum Resmi', 'Terstandar']),
        source_type: 'CURATED',
        generator_version: 'v1.0',
        quality_score: 95,
        usage_count: 5,
        report_count: 0,
        status: 'published',
        normalized_hash: q.question.toLowerCase().replace(/[^\w]/g, '').slice(0, 100),
        concept_key: 'starter_catalog',
        created_at: now,
        updated_at: now,
      });
    }

    // 2. Add high-quality curated questions for each requested category
    const starterSet = [
      // TIU - Silogisme
      {
        id: 'q-tiu-silo-01',
        category: 'TIU',
        subcategory: 'Kemampuan Verbal',
        subject: 'Silogisme Logis',
        difficulty: 'Sedang',
        difficulty_score: 6,
        topic: 'Silogisme Deduktif',
        question: 'Semua calon taruna yang lulus tahap kesamaptaan memiliki daya tahan fisik yang prima. Sebagian peserta yang memiliki daya tahan fisik yang prima adalah perenang handal. Kesimpulan yang paling tepat adalah...',
        options: {
          A: 'Semua perenang handal pasti lulus tahap kesamaptaan.',
          B: 'Sebagian calon taruna yang lulus tahap kesamaptaan adalah perenang handal.',
          C: 'Tidak ada calon taruna yang bukan perenang handal.',
          D: 'Sebagian peserta yang memiliki daya tahan fisik prima bukan calon taruna yang lulus kesamaptaan.',
          E: 'Semua calon taruna yang lulus kesamaptaan bukan perenang handal.'
        },
        correct_answer: 'D',
        explanation: 'Analisis silogisme kategorik:\nPremis 1: Semua calon taruna lulus kesamaptaan (A) adalah memiliki fisik prima (B).\nPremis 2: Sebagian B adalah perenang handal (C).\nKesimpulan langsung yang sah: Karena A adalah bagian di dalam B, dan hanya sebagian B yang merupakan C, maka tidak dapat dipastikan bahwa calon taruna (A) adalah perenang (C). Namun secara ekuivalen logis: Sebagian yang memiliki fisik prima (B) belum tentu lulus kesamaptaan (A) atau ada peserta fisik prima selain yang lulus kesamaptaan.',
        hint: 'Gunakan diagram Venn untuk melihat irisan antara himpunan calon taruna, fisik prima, dan perenang.',
        tags: ['TIU', 'Silogisme', 'Verbal', 'SKD'],
      },
      // TIU - Deret Angka
      {
        id: 'q-tiu-deret-01',
        category: 'TIU',
        subcategory: 'Kemampuan Numerik',
        subject: 'Deret Angka Bertingkat',
        difficulty: 'Sedang',
        difficulty_score: 6,
        topic: 'Deret Aritmetika',
        question: 'Tentukan dua angka selanjutnya dari barisan bilangan berikut: 3, 5, 9, 17, 33, ..., ...',
        options: {
          A: '65, 129',
          B: '64, 128',
          C: '66, 131',
          D: '65, 133',
          E: '67, 135'
        },
        correct_answer: 'A',
        explanation: 'Analisis selisih antarsuku:\n5 - 3 = 2 (+2^1)\n9 - 5 = 4 (+2^2)\n17 - 9 = 8 (+2^3)\n33 - 17 = 16 (+2^4)\nSelisih berikutnya haruslah +32 (2^5) dan +64 (2^6):\nSuku berikutnya = 33 + 32 = 65.\nSuku setelahnya = 65 + 64 = 129.',
        hint: 'Perhatikan selisih antara suku-suku yang berdekatan yang membentuk barisan geometri kelipatan 2.',
        tags: ['TIU', 'Deret Angka', 'Numerik', 'Hitung Cepat'],
      },
      // TWK - UUD 1945
      {
        id: 'q-twk-uud-01',
        category: 'TWK',
        subcategory: 'UUD 1945',
        subject: 'Kewenangan Lembaga Negara',
        difficulty: 'Sulit',
        difficulty_score: 7,
        topic: 'Mahkamah Konstitusi & MA',
        question: 'Berdasarkan Pasal 24C UUD 1945 hasil amandemen, salah satu kewenangan absolut Mahkamah Konstitusi adalah memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh...',
        options: {
          A: 'Undang-Undang Republik Indonesia',
          B: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
          C: 'Ketetapan Majelis Permusyawaratan Rakyat (TAP MPR)',
          D: 'Peraturan Pemerintah Pengganti Undang-Undang (Perppu)',
          E: 'Instruksi Presiden Republik Indonesia'
        },
        correct_answer: 'B',
        explanation: 'Pasal 24C ayat (1) UUD 1945 menegaskan: "Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar, memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh Undang-Undang Dasar, memutus pembubaran partai politik, dan memutus perselisihan tentang hasil pemilihan umum."',
        hint: 'Perhatikan frasa kunci sumber kewenangan yang melahirkan lembaga negara tersebut (bukan UU biasa).',
        tags: ['TWK', 'UUD 1945', 'Mahkamah Konstitusi', 'Tata Negara'],
      },
      // TKP - Pelayanan Publik
      {
        id: 'q-tkp-yanlik-01',
        category: 'TKP',
        subcategory: 'Pelayanan Publik',
        subject: 'Integritas & Pelayanan Prima',
        difficulty: 'Sedang',
        difficulty_score: 5,
        topic: 'Pelayanan Prima',
        question: 'Ketika jam pelayanan kantor Anda sudah berakhir lima menit yang lalu, seorang warga lansia yang menempuh perjalanan jauh dari pelosok desa baru tiba di kantor dengan napas terengah-engah untuk mengurus surat penting. Sikap yang sebaiknya Anda ambil adalah...',
        options: {
          A: 'Menolaknya dengan halus dan memintanya datang kembali esok hari tepat waktu sesuai ketentuan.',
          B: 'Meminta satpam untuk melayani karena staf operasional berhak beristirahat tepat waktu.',
          C: 'Menyambut warga tersebut dengan ramah, mempersilakannya duduk, dan membantunya menyelesaikan pengurusan surat tersebut hingga tuntas.',
          D: 'Meminta biaya tambahan lembur sebagai kompensasi pelayanan di luar jam kerja resmi.',
          E: 'Menerima berkasnya namun meminta warga tersebut menunggu sampai minggu depan untuk prosesnya.'
        },
        correct_answer: 'C',
        explanation: 'Pada penilaian TKP (Sistem Poin 1-5), indikator Pelayanan Publik mengutamakan empati, solusi tuntas, dan kepedulian tulus terhadap warga berkebutuhan khusus/rentan tanpa pamrih. Opsi C mendapatkan poin tertinggi (Poin 5) karena menunjukkan dedikasi pelayanan tanpa membebani warga.',
        hint: 'Pilihlah tindakan yang mengedepankan empati dan penyelesaian tuntas tanpa pamrih.',
        tags: ['TKP', 'Pelayanan Publik', 'ASN BerAKHLAK'],
      },
      // Matematika - Aljabar & Persentase
      {
        id: 'q-mat-alj-01',
        category: 'Matematika',
        subcategory: 'Aljabar & Aritmetika Sosial',
        subject: 'Persentase Keuntungan',
        difficulty: 'Sedang',
        difficulty_score: 6,
        topic: 'Aritmetika Sosial',
        question: 'Seorang pedagang membeli 50 kg beras seharga Rp600.000. Pedagang tersebut kemudian menjual 30 kg beras dengan harga Rp15.000 per kg dan sisanya dijual dengan harga Rp14.000 per kg. Berapakah persentase keuntungan yang diperoleh pedagang tersebut?',
        options: {
          A: '18%',
          B: '20%',
          C: '21,67%',
          D: '25%',
          E: '22,5%'
        },
        correct_answer: 'C',
        explanation: 'Langkah penyelesaian:\n1. Total modal pembelian = Rp600.000.\n2. Penjualan bagian pertama: 30 kg × Rp15.000 = Rp450.000.\n3. Sisa beras = 50 - 30 = 20 kg.\n4. Penjualan sisa: 20 kg × Rp14.000 = Rp280.000.\n5. Total pendapatan = Rp450.000 + Rp280.000 = Rp730.000.\n6. Keuntungan bersih = Rp730.000 - Rp600.000 = Rp130.000.\n7. Persentase keuntungan = (130.000 / 600.000) × 100% = 21,666...% ≈ 21,67%.',
        hint: 'Hitung total hasil penjualan dari dua kelompok harga, cari selisihnya dengan modal, lalu bagi dengan modal awal.',
        tags: ['Matematika', 'Aritmetika Sosial', 'Persentase'],
      },
      // Bahasa Inggris - Structure & Grammar
      {
        id: 'q-eng-gram-01',
        category: 'Bahasa Inggris',
        subcategory: 'Grammar & Structure',
        subject: 'Conditional Sentence Type 3',
        difficulty: 'Sulit',
        difficulty_score: 7,
        topic: 'Subjunctive & Conditionals',
        question: 'If the rescue team ... earlier, the victims of the flash flood would not have suffered from hypothermia.',
        options: {
          A: 'arrived',
          B: 'has arrived',
          C: 'had arrived',
          D: 'would arrive',
          E: 'was arriving'
        },
        correct_answer: 'C',
        explanation: 'Kalimat ini merupakan Conditional Sentence Type 3 (situasi pengandaian di masa lampau yang tidak terwujud).\nRumus baku:\nIf + Subject + Past Perfect (had + V3), Subject + would have + V3.\nKlausa hasil menggunakan "would not have suffered", sehingga klausa syarat wajib menggunakan Past Perfect: "had arrived".',
        hint: 'Perhatikan klausa kedua yang menggunakan "would not have + V3" sebagai penanda Past Unreal Condition.',
        tags: ['Bahasa Inggris', 'Tenses', 'Conditionals', 'Structure'],
      },
      // Bahasa Indonesia - Kalimat Efektif
      {
        id: 'q-bina-efektif-01',
        category: 'Bahasa Indonesia',
        subcategory: 'Tata Kalimat & PUEBI',
        subject: 'Kalimat Efektif',
        difficulty: 'Sedang',
        difficulty_score: 5,
        topic: 'Kesejajaran & Kehematan Kata',
        question: 'Manakah di antara kalimat berikut yang memenuhi kaidah kalimat efektif dan hemat kata menurut PUEBI?',
        options: {
          A: 'Para hadirin sekalian dipersilakan untuk menempati tempat duduk yang telah disediakan oleh panitia.',
          B: 'Pemerintah daerah mengimbau agar supaya masyarakat membuang sampah pada tempatnya.',
          C: 'Penelitian ini bertujuan menganalisis dampak inflasi terhadap daya beli masyarakat berpenghasilan rendah.',
          D: 'Meskipun hujan lebat turun, tetapi acara gladi resik tetap dilanjutkan sampai tuntas.',
          E: 'Dalam rapat tersebut membicarakan mengenai rencana alokasi anggaran tahunan.'
        },
        correct_answer: 'C',
        explanation: 'Analisis ketidakefektifan opsi lain:\n- A: Pleonastis ("Para" dan "sekalian" berlebihan, "menempati tempat duduk").\n- B: Pleonastis ("agar" dan "supaya" memiliki fungsi ganda yang mubazir).\n- D: Pemborosan konjungsi intrakalimat ganda ("Meskipun ... tetapi ...").\n- E: Kehilangan subjek karena diawali keterangan "Dalam rapat tersebut".\nOpsi C adalah kalimat efektif sempurna dengan struktur S-P-O-K yang lugas dan hemat.',
        hint: 'Hindari kalimat yang menggunakan konjungsi ganda atau kata jamak yang diulang.',
        tags: ['Bahasa Indonesia', 'PUEBI', 'Kalimat Efektif'],
      },
      // Psikotes - Logika Spasial & Posisi
      {
        id: 'q-psiko-posisi-01',
        category: 'Psikotes',
        subcategory: 'Penalaran Analitis',
        subject: 'Logika Urutan & Posisi',
        difficulty: 'Sulit',
        difficulty_score: 8,
        topic: 'Penalaran Analitis',
        question: 'Enam calon perwira (A, B, C, D, E, F) duduk melingkar mengelilingi meja bundar. A duduk tepat berhadapan dengan D. B duduk di sebelah kanan A. E duduk tepat berhadapan dengan B. Di manakah posisi C jika C tidak boleh duduk di samping D?',
        options: {
          A: 'Tepat di antara A dan B',
          B: 'Tepat di antara A dan E',
          C: 'Tepat di sebelah kanan D',
          D: 'Tepat di antara D dan E',
          E: 'Tepat berhadapan dengan F'
        },
        correct_answer: 'B',
        explanation: 'Analisis formasi meja bundar 6 posisi (1 sampai 6 searah jarum jam):\n1. Misalkan A di posisi 1, maka D di posisi 4 (berhadapan).\n2. B di sebelah kanan A (posisi 2).\n3. E berhadapan dengan B, maka E berada di posisi 5.\n4. Tersisa posisi 3 (sebelah kanan B, samping D) dan posisi 6 (antara E dan A).\n5. Karena C tidak boleh di samping D, maka C tidak boleh di posisi 3.\n6. Jadi C harus di posisi 6 (tepat di antara E dan A).\n7. Posisi 3 diisi oleh F.',
        hint: 'Gambarkan diagram lingkaran dengan 6 titik bernomor untuk memetakan koordinat posisi satu per satu.',
        tags: ['Psikotes', 'Penalaran Analitis', 'Logika Posisi'],
      },
      // Pengetahuan Umum - Sains & Geografi
      {
        id: 'q-pu-geografi-01',
        category: 'Pengetahuan Umum',
        subcategory: 'Geografi & Kebencanaan',
        subject: 'Lempeng Tektonik Indonesia',
        difficulty: 'Sedang',
        difficulty_score: 6,
        topic: 'Geologi Nusantara',
        question: 'Wilayah Indonesia merupakan pertemuan tiga lempeng tektonik utama dunia yang menyebabkan tingginya aktivitas vulkanik dan gempa bumi. Ketiga lempeng tersebut adalah...',
        options: {
          A: 'Lempeng Indo-Australia, Lempeng Eurasia, dan Lempeng Pasifik',
          B: 'Lempeng Afrika, Lempeng Eurasia, dan Lempeng Antartika',
          C: 'Lempeng Nazca, Lempeng Pasifik, dan Lempeng Amerika Selatan',
          D: 'Lempeng Indo-Australia, Lempeng Arab, dan Lempeng Laut Filipina',
          E: 'Lempeng Cocos, Lempeng Eurasia, dan Lempeng Pasifik'
        },
        correct_answer: 'A',
        explanation: 'Indonesia secara geologis terletak pada batas pertemuan (ring of fire) tiga lempeng tektonik aktif utama dunia, yaitu Lempeng Indo-Australia di sebelah selatan, Lempeng Eurasia di sebelah utara dan barat laut, serta Lempeng Pasifik di sebelah timur laut. Tumbukan antar-lempeng ini menciptakan palung laut dalam, busur kepulauan vulkanik, dan zona subduksi aktif.',
        hint: 'Ingat lempeng benua Eropa-Asia di utara, lempeng samudra Pasifik di timur, dan lempeng benua Australia di selatan.',
        tags: ['Pengetahuan Umum', 'Geografi', 'Sains Nusantara'],
      },
      // Tes Fisik - Lari Samapta & Fisiologi
      {
        id: 'q-fisik-lari-01',
        category: 'Tes Fisik',
        subcategory: 'Kebugaran Jasmani',
        subject: 'Fisiologi Samapta Lari 12 Menit',
        difficulty: 'Sedang',
        difficulty_score: 6,
        topic: 'Kesamaptaan Jasmani',
        question: 'Dalam pelaksanaan Tes Kesamaptaan Jasmani Lari 12 Menit, seorang peserta sering mengalami "side stitch" (kram perut samping) pada menit ke-4. Penyebab fisiologis utama terjadinya kondisi ini dan cara pencegahannya yang benar adalah...',
        options: {
          A: 'Kelebihan gula darah; pencegahan dengan minum air dingin manis saat lari.',
          B: 'Iskemia sementara pada diafragma akibat pernapasan dangkal dan ritme langkah tidak teratur; pencegahan dengan pernapasan perut ritmis (2:2).',
          C: 'Penumpukan asam klorida di lambung; pencegahan dengan makan porsi besar 30 menit sebelum tes.',
          D: 'Kurangnya kadar hemoglobin; pencegahan dengan menahan napas setiap 100 meter.',
          E: 'Kelelahan tendon achilles; pencegahan dengan memperpendek ayunan tangan.'
        },
        correct_answer: 'B',
        explanation: 'Kram perut samping (side stitch atau Exercise-related Transient Abdominal Pain/ETAP) disebabkan oleh spasme atau hipoksia pada otot diafragma akibat pasokan darah dialihkan ke otot tungkai, diperparah oleh tarikan ligamen visceral saat hentakan kaki bertabrakan dengan hembusan napas yang tidak beraturan. Pencegahannya adalah mengatur pola napas ritmis (misal: 2 langkah tarik napas melalui hidung, 2 langkah hembus melalui mulut) serta penguatan otot inti (core muscles).',
        hint: 'Kaitkan dengan kerja otot diafragma penopang paru-paru dan ritme hembusan napas saat kaki menjejak tanah.',
        tags: ['Tes Fisik', 'Samapta', 'Kebugaran', 'Lari 12 Menit'],
      },
      // Tes Fisik - Pull Up
      {
        id: 'q-fisik-pullup-01',
        category: 'Tes Fisik',
        subcategory: 'Kebugaran Jasmani',
        subject: 'Standar Penilaian Pull Up Taruna',
        difficulty: 'Sulit',
        difficulty_score: 8,
        topic: 'Standar Samapta Taruna',
        question: 'Pada tes kesamaptaan jasmani B (Pull Up untuk pria standar Taruna Akmil/Polri), sebuah repetisi dinyatakan DISKUALIFIKASI (tidak dihitung oleh penguji) apabila peserta melakukan kesalahan berikut...',
        options: {
          A: 'Dagu melewati mistar palang tunggal dengan posisi kaki lurus diam.',
          B: 'Menarik badan ke atas dengan bantuan ayunan pinggul atau lentingan kaki (kipping).',
          C: 'Menghembuskan napas ketika badan diangkat ke atas.',
          D: 'Menggenggam palang dengan telapak tangan menghadap ke depan (overhand grip).',
          E: 'Melakukan jeda 1 detik di posisi menggantung penuh sebelum tarikan berikutnya.'
        },
        correct_answer: 'B',
        explanation: 'Standar resmi Pull Up TNI/Polri mensyaratkan gerakan murni kekuatan otot lengan dan punggung (strict pull up). Setiap bentuk ayunan badan, lentingan kaki (kipping), menyilangkan kaki sambil menghentak, atau dagu yang tidak melampaui mistar palang akan otomatis dianulir (tidak dihitung) oleh tim penguji jasmani.',
        hint: 'Pilihlah tindakan curang mekanis berupa pemanfaatan momentum ayunan badan.',
        tags: ['Tes Fisik', 'Pull Up', 'Akmil', 'Polri', 'Standar Penilaian'],
      },
    ];

    for (const sq of starterSet) {
      questionsToInsert.push({
        question_id: sq.id,
        category: sq.category,
        subcategory: sq.subcategory,
        subject: sq.subject,
        question_text: sq.question,
        question_type: 'multiple_choice',
        options: JSON.stringify(sq.options),
        correct_answer: sq.correct_answer,
        explanation: sq.explanation,
        hint: sq.hint,
        difficulty: sq.difficulty,
        difficulty_score: sq.difficulty_score,
        topic: sq.topic,
        tags: JSON.stringify(sq.tags),
        source_type: 'CURATED',
        generator_version: 'v1.0',
        quality_score: 96,
        usage_count: 2,
        report_count: 0,
        status: 'published',
        normalized_hash: sq.question.toLowerCase().replace(/[^\w]/g, '').slice(0, 100),
        concept_key: `${sq.category.toLowerCase()}_starter`,
        created_at: now,
        updated_at: now,
      });
    }

    // Insert all into PostgreSQL
    for (const q of questionsToInsert) {
      await db.insert(questions).values(q).onConflictDoNothing();
    }
    console.log(`[Seed] Berhasil memasukkan ${questionsToInsert.length} soal starter ke Cloud SQL!`);

    // 3. Seed Learning Packages (Daily Day 01, Day 02, Day 03, Weekly Tryout, Monthly Exam)
    const todayStr = formatDate();
    const allQIds = questionsToInsert.map(q => q.question_id);

    const packagesToSeed = [
      {
        package_id: `pkg-daily-${todayStr}-day01`,
        title: 'Paket Belajar Hari Ini — Day 01: Fundamental TIU & SKD',
        description: 'Paket adaptif harian berisi kombinasi penalaran numerik, verbal, wawasan kebangsaan, dan pemahaman konsep dasar.',
        package_type: 'daily',
        category: 'TIU',
        target_date: todayStr,
        difficulty: 'Campuran',
        duration_minutes: 30,
        question_ids: JSON.stringify(allQIds.slice(0, 8)),
        passing_score: 65,
        is_active: true,
      },
      {
        package_id: `pkg-daily-${todayStr}-day02`,
        title: 'Paket Belajar Hari Ini — Day 02: Intermediate Kedinasan & TPA',
        description: 'Fokus pada silogisme analitik, aritmetika bertingkat, dan pengamalan butir Pancasila studi kasus.',
        package_type: 'daily',
        category: 'Kedinasan',
        target_date: todayStr,
        difficulty: 'Sedang',
        duration_minutes: 40,
        question_ids: JSON.stringify(allQIds.slice(2, 10)),
        passing_score: 70,
        is_active: true,
      },
      {
        package_id: `pkg-weekly-tryout-${todayStr}`,
        title: '🏆 Weekly Tryout Akbar — Simulasi CAT Komprehensif',
        description: 'Simulasi tryout mingguan lengkap berstandar BKN dan Mabes TNI/Polri dengan pembobotan skor dan peringkat nasional.',
        package_type: 'weekly_tryout',
        category: 'Campuran',
        target_date: todayStr,
        difficulty: 'Sulit',
        duration_minutes: 100,
        question_ids: JSON.stringify(allQIds),
        passing_score: 65,
        is_active: true,
      },
      {
        package_id: `pkg-monthly-sim-${todayStr}`,
        title: '🎯 Monthly Simulation Test — Uji Ketahanan & Waktu',
        description: 'Simulasi bulanan bertekanan waktu tinggi dengan analisis kelemahan materi terperinci dari ALIN.',
        package_type: 'monthly_simulation',
        category: 'Campuran',
        target_date: todayStr,
        difficulty: 'Sangat Sulit',
        duration_minutes: 120,
        question_ids: JSON.stringify(allQIds),
        passing_score: 75,
        is_active: true,
      },
    ];

    for (const p of packagesToSeed) {
      await db.insert(learning_packages).values(p as any).onConflictDoNothing();
    }
    console.log('[Seed] Berhasil membuat paket belajar harian dan tryout mingguan/bulanan!');

    // 4. Initialize Generation Configs
    await db.insert(generation_configs).values({
      config_key: 'daily_generation_settings',
      daily_target_total: 120,
      category_distribution: JSON.stringify({
        'TIU': 35,
        'TWK': 35,
        'TKP': 25,
        'Bahasa Inggris': 20,
        'Matematika': 20,
        'Psikotes': 15,
        'Pengetahuan Umum': 15,
        'Tes Fisik': 15,
      }),
      difficulty_distribution: JSON.stringify({
        'Easy': 20,
        'Medium': 40,
        'Hard': 30,
        'Very Hard': 10,
      }),
      auto_schedule_enabled: true,
      min_stock_threshold: 30,
      quality_score_threshold: 80,
      similarity_threshold: 75,
      updated_at: now,
    }).onConflictDoNothing();

    console.log('[Seed] Konfigurasi auto generation berhasil diinisialisasi!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
}
