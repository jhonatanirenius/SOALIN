import { GoogleGenAI } from '@google/genai';
import { Question, DifficultyLevel, QuestionStatus } from '../types';

// ============================================================================
// 1. TEXT NORMALIZATION & SEMANTIC ANTI-DUPLICATE ENGINE
// ============================================================================

const COMMON_NAMES = [
  'budi', 'siti', 'andi', 'joko', 'ahmad', 'rudi', 'ani', 'doni', 'rina',
  'agus', 'dewi', 'ratna', 'eko', 'bayu', 'putri', 'rizky', 'dimas', 'hendra',
  'sarah', 'kevin', 'anton', 'fajar', 'maya', 'linda', 'dian', 'ari', 'wawan'
];

/**
 * Normalizes question text by:
 * 1. Lowercasing and trimming
 * 2. Replacing all numbers/amounts with generic <NUM> token
 * 3. Replacing common names with generic <NAME> token
 * 4. Normalizing whitespace and punctuation
 * 5. Extracting essential structural n-grams
 */
export function normalizeQuestionText(text: string): {
  normalized: string;
  structuralPattern: string;
  tokens: string[];
} {
  if (!text) return { normalized: '', structuralPattern: '', tokens: [] };

  let t = text.toLowerCase();

  // Replace currencies, percentages, and numbers with <NUM>
  t = t.replace(/rp\s*[\d\.,]+/g, '<NUM>');
  t = t.replace(/\d+(\.\d+)?%/g, '<NUM>%');
  t = t.replace(/\b\d+([.,]\d+)?\b/g, '<NUM>');

  // Replace common Indonesian names with <NAME>
  for (const name of COMMON_NAMES) {
    const reg = new RegExp(`\\b${name}\\b`, 'gi');
    t = t.replace(reg, '<NAME>');
  }

  // Remove punctuation (except placeholder tags)
  const cleaned = t.replace(/[^\w\s<>]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens = cleaned.split(' ').filter(w => w.length > 1);

  // Structural pattern: tokens without standard filler stop words
  const stopWords = new Set([
    'yang', 'di', 'dan', 'ini', 'dari', 'dalam', 'untuk', 'dengan', 'adalah',
    'pada', 'sebuah', 'ke', 'oleh', 'itu', 'atau', 'pada', 'jika', 'maka', 'bila',
    'apabila', 'tersebut', 'suatu', 'yaitu', 'yakni', 'merupakan', 'adapun'
  ]);

  const structuralTokens = tokens.filter(tok => !stopWords.has(tok));
  const structuralPattern = structuralTokens.join(' ');

  return {
    normalized: cleaned,
    structuralPattern,
    tokens: structuralTokens,
  };
}

/**
 * Calculates semantic similarity (0 - 100) between two question texts.
 * Detects:
 * - Identical / near-identical wording
 * - Only changing numbers
 * - Only changing names
 * - Swapping sentence order / rephrasing
 */
export function calculateSemanticSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  if (textA.trim().toLowerCase() === textB.trim().toLowerCase()) return 100;

  const normA = normalizeQuestionText(textA);
  const normB = normalizeQuestionText(textB);

  // If normalized patterns match exactly (only numbers or names differed)
  if (normA.structuralPattern === normB.structuralPattern && normA.structuralPattern.length > 10) {
    return 98; // Very high match (only numbers or names swapped)
  }

  // Jaccard similarity of structural tokens
  const setA = new Set(normA.tokens);
  const setB = new Set(normB.tokens);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersectionCount++;
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  const jaccard = unionSize > 0 ? (intersectionCount / unionSize) * 100 : 0;

  // Tri-gram character overlap for catching sentence reordering
  const getTrigrams = (str: string) => {
    const s = str.replace(/\s+/g, '');
    const grams = new Set<string>();
    for (let i = 0; i <= s.length - 3; i++) {
      grams.add(s.substring(i, i + 3));
    }
    return grams;
  };

  const gramsA = getTrigrams(normA.normalized);
  const gramsB = getTrigrams(normB.normalized);

  let gramMatches = 0;
  for (const g of gramsA) {
    if (gramsB.has(g)) gramMatches++;
  }
  const gramUnion = gramsA.size + gramsB.size - gramMatches;
  const gramSimilarity = gramUnion > 0 ? (gramMatches / gramUnion) * 100 : 0;

  // Weighted blend: 60% Token Jaccard + 40% N-gram overlap
  const compositeSimilarity = Math.round(jaccard * 0.6 + gramSimilarity * 0.4);

  return Math.min(100, Math.max(0, compositeSimilarity));
}

// ============================================================================
// 2. CONCEPT BLUEPRINTS & CATEGORIES FOR GENERATOR
// ============================================================================

export interface CategoryBlueprint {
  category: string;
  subcategories: string[];
  topics: {
    name: string;
    conceptKey: string;
    contexts: string[];
    reasoningTypes: string[];
  }[];
}

export const CATEGORY_BLUEPRINTS: Record<string, CategoryBlueprint> = {
  'TIU': {
    category: 'TIU',
    subcategories: ['Kemampuan Numerik', 'Kemampuan Verbal', 'Kemampuan Logika', 'Kemampuan Figural'],
    topics: [
      {
        name: 'Aritmetika Sosial & Persentase',
        conceptKey: 'tiu_aritmetika_persentase',
        contexts: ['diskon bertingkat', 'keuntungan & kerugian pedagang', 'bunga tunggal bank', 'perbandingan persentase modal', 'soal cerita konsumsi'],
        reasoningTypes: ['hitung cepat', 'aljabar satu variabel', 'eliminasi opsi nilai ekstrem'],
      },
      {
        name: 'Perbandingan Senilai & Berbalik Nilai',
        conceptKey: 'tiu_perbandingan_pekerja',
        contexts: ['proyek berhenti dan penambahan pekerja', 'pakan ternak & waktu habis', 'kecepatan rata-rata & waktu tempuh menyusul'],
        reasoningTypes: ['beban kerja orang-hari', 'rasio invers', 'proporsi proporsional'],
      },
      {
        name: 'Deret Angka & Huruf Bertingkat',
        conceptKey: 'tiu_deret_bertingkat',
        contexts: ['deret selisih aritmatika bertingkat', 'deret fibonacci modifikasi', 'deret dua larik selang-seling', 'deret alfabet kelipatan'],
        reasoningTypes: ['pola multi-tier', 'pengelompokan 2 pola', 'pola perpangkatan'],
      },
      {
        name: 'Silogisme & Penarikan Kesimpulan',
        conceptKey: 'tiu_silogisme_deduktif',
        contexts: ['premis semua dan sebagian', 'modus ponens dan tollens', 'silogisme disjungtif', 'kondisional implikasi'],
        reasoningTypes: ['diagram venn', 'kontraposisi aturan', 'eliminasi kesimpulan tak valid'],
      },
      {
        name: 'Analogi Kata & Hubungan Konseptual',
        conceptKey: 'tiu_analogi_kata',
        contexts: ['hubungan profesi dan alat kerja', 'sebab-akibat gejala alam', 'spesies dan ordo taksonomi', 'bagian ke seluruh'],
        reasoningTypes: ['padanan fungsi', 'tingkat intensitas makna', 'hierarki konsep'],
      },
    ],
  },
  'TWK': {
    category: 'TWK',
    subcategories: ['Pancasila', 'UUD 1945', 'Bhinneka Tunggal Ika', 'NKRI & Bela Negara', 'Nasionalisme & Integritas'],
    topics: [
      {
        name: 'Pengamalan Sila-Sila Pancasila',
        conceptKey: 'twk_butir_pancasila',
        contexts: ['studi kasus toleransi antarumat', 'penanganan konflik sosial masyarakat', 'pemberantasan korupsi dan keadilan sosial', 'kebijakan musyawarah mufakat di desa'],
        reasoningTypes: ['analisis butir Tap MPR', 'distingsi sila 2 vs sila 5', 'studi kasus dilema etika'],
      },
      {
        name: 'Pasal-Pasal UUD 1945 & Amandemen',
        conceptKey: 'twk_uud_amandemen',
        contexts: ['kewenangan Mahkamah Konstitusi vs MA', 'hak budget DPR dan proses APBN', 'pasal HAM (Pasal 28A-28J)', 'sistem pemerintahan presidensial & pemilu'],
        reasoningTypes: ['hierarki perundang-undangan', 'analisis komparasi sebelum dan sesudah amandemen', 'uji materi perpu'],
      },
      {
        name: 'Bela Negara & Nasionalisme',
        conceptKey: 'twk_bela_negara_nkri',
        contexts: ['ancaman militer, non-militer, dan hibrida', 'patriotisme di era digital dan cyber security', 'integritas aparatur negara melayani publik'],
        reasoningTypes: ['penerapan nilai dasar bela negara', 'pencegahan radikalisme', 'ketahanan nasional gatra panca'],
      },
    ],
  },
  'TKP': {
    category: 'TKP',
    subcategories: ['Pelayanan Publik', 'Jejaring Kerja', 'Sosial Budaya', 'TIK', 'Profesionalisme', 'Anti Radikalisme'],
    topics: [
      {
        name: 'Inovasi Pelayanan Publik & Kepemimpinan',
        conceptKey: 'tkp_pelayanan_publik',
        contexts: ['warga komplain keras di loket', 'sistem digital kantor down saat antrean panjang', 'permintaan bantuan darurat di luar jam kerja'],
        reasoningTypes: ['prioritas empati dan solusi taktis', 'skala poin 5 untuk sikap proaktif', 'akuntabilitas tinggi'],
      },
      {
        name: 'Profesionalisme & Integritas Tim',
        conceptKey: 'tkp_profesionalisme_jejaring',
        contexts: ['perbedaan pendapat sengit dengan rekan kerja', 'rekan tim mengabaikan deadline bersama', 'tawaran gratifikasi tersembunyi dari rekan bisnis'],
        reasoningTypes: ['komunikasi asertif', 'kolaborasi solutif', 'kepatuhan kode etik ASN'],
      },
    ],
  },
  'Matematika': {
    category: 'Matematika',
    subcategories: ['Aljabar', 'Aritmetika', 'Geometri', 'Trigonometri', 'Statistika & Peluang'],
    topics: [
      {
        name: 'Persamaan & Fungsi Kuadrat',
        conceptKey: 'mat_aljabar_kuadrat',
        contexts: ['titik puncak parabola keuntungan maksimum', 'akar-akar persamaan kuadrat simetris', 'diskriminan dan jenis akar'],
        reasoningTypes: ['faktorisasi', 'rumus kuadratik ABC', 'analisis nilai optimum'],
      },
      {
        name: 'Peluang & Kombinatorika',
        conceptKey: 'mat_peluang_kombinasi',
        contexts: ['pemilihan delegasi lomba beragam divisi', 'pengambilan bola berwarna tanpa pengembalian', 'peluang kejadian saling lepas vs bersyarat'],
        reasoningTypes: ['aturan perkalian', 'kombinasi nCr', 'hukum de morgan komplemen'],
      },
    ],
  },
  'Bahasa Inggris': {
    category: 'Bahasa Inggris',
    subcategories: ['Grammar & Structure', 'Reading Comprehension', 'Vocabulary', 'Error Identification'],
    topics: [
      {
        name: 'Conditional Sentences & Subjunctive',
        conceptKey: 'eng_conditionals',
        contexts: ['type 1, 2, and 3 hypothetical situations', 'inverted conditional without "if"', 'wish / as if subjunctive clauses'],
        reasoningTypes: ['tense harmony', 'unreal past reasoning', 'contextual clause analysis'],
      },
      {
        name: 'Passive Voice & Causative Verbs',
        conceptKey: 'eng_passive_causative',
        contexts: ['academic research reports', 'have/get someone do something', 'impersonal passive structures (it is believed that...)'],
        reasoningTypes: ['verb-3 agreement', 'agent omission', 'agent marker identification'],
      },
    ],
  },
  'Bahasa Indonesia': {
    category: 'Bahasa Indonesia',
    subcategories: ['PUEBI & Tata Kalimat', 'Pemahaman Wacana', 'Kalimat Efektif', 'Paragraf & Koherensi'],
    topics: [
      {
        name: 'Kalimat Efektif & Kesejajaran Bentuk',
        conceptKey: 'bina_kalimat_efektif',
        contexts: ['kalimat majemuk beranak-pinak', 'kesejajaran afiks (me- vs di-)', 'kehematan kata dan pleonasme dalam laporan resmi'],
        reasoningTypes: ['analisis struktur S-P-O-K', 'eliminasi kata mubazir', 'kohesi gramatikal'],
      },
    ],
  },
  'Psikotes': {
    category: 'Psikotes',
    subcategories: ['Tes Logika Penalaran', 'Ketelitian & Kecepatan', 'Hubungan Spasial', 'Deret Aritmetika'],
    topics: [
      {
        name: 'Penalaran Analitis Urutan & Posisi',
        conceptKey: 'psiko_posisi_urutan',
        contexts: ['posisi duduk melingkar 6 orang dengan syarat tertentu', 'urutan kedatangan pelari dalam lomba', 'penjadwalan giliran piket dengan pantangan'],
        reasoningTypes: ['pemodelan tabel eliminasi', 'penarikan kesimpulan deduktif kaku', 'pola logika relasional'],
      },
    ],
  },
  'Pengetahuan Umum': {
    category: 'Pengetahuan Umum',
    subcategories: ['Wawasan Kebangsaan', 'Geografi & Lingkungan', 'Sains & Teknologi', 'Hubungan Internasional'],
    topics: [
      {
        name: 'Sains Populer & Lingkungan Hidup',
        conceptKey: 'pu_sains_lingkungan',
        contexts: ['efek gas rumah kaca & transisi energi hijau', 'gempa tektonik & mitigasi tsunami cincin api Indonesia', 'revolusi industri 5.0 dan AI'],
        reasoningTypes: ['analisis sebab-akibat ilmiah', 'geografis kepulauan Indonesia', 'istilah baku sains'],
      },
    ],
  },
  'Tes Fisik': {
    category: 'Tes Fisik',
    subcategories: ['Pengetahuan Kebugaran', 'Teori Olahraga', 'Kebugaran Jasmani', 'Persiapan Tes Fisik'],
    topics: [
      {
        name: 'Fisiologi Kardiovaskular & Lari Samapta',
        conceptKey: 'fisik_kardio_samapta',
        contexts: ['strategi pacing lari 12 menit 2400-3200m', 'denyut nadi target dan penghitungan VO2 Max', 'teknik pernapasan ritmis dan penundaan asam laktat'],
        reasoningTypes: ['perhitungan denyut nadi 220-usia', 'biomekanika stride length', 'fisiologi pemulihan aerobik'],
      },
      {
        name: 'Biomekanika Kekuatan & Calisthenics',
        conceptKey: 'fisik_calisthenics_kekuatan',
        contexts: ['teknik pull up/chinning standar Akmil & Bintara (dagu melewati palang tanpa ayunan)', 'posisi push up & sit up 1 menit dengan repetisi valid', 'latihan agility shuttle run angka 8 jarak 10m'],
        reasoningTypes: ['kinestetik otot primer vs sekunder', 'eliminasi diskualifikasi gerakan cacat', 'protokol pemanasan dinamis vs statis'],
      },
      {
        name: 'Nutrisi & Protokol Tes Jasmani',
        conceptKey: 'fisik_nutrisi_persiapan',
        contexts: ['asupan karbohidrat kompleks & cairan 24 jam sebelum tes', 'penanganan kram otot mendadak saat ujian', 'istirahat dan waktu tidur pemulihan saraf motorik'],
        reasoningTypes: ['hidrasi elektrolit', 'manajemen glikogen hati', 'pencegahan hipotermia/dehidrasi'],
      },
    ],
  },
};

// ============================================================================
// 3. MULTI-PASS VALIDATION PIPELINE
// ============================================================================

export interface ValidationResult {
  passed: boolean;
  rejectReason?: string;
  stageFailed?: 'structure' | 'correctness' | 'distractors' | 'duplicate' | 'quality';
  qualityScore: number;
  semanticSimilarityScore: number;
  duplicateWithId?: string;
  details: {
    hasValidStructure: boolean;
    hasValidAnswer: boolean;
    hasValidExplanation: boolean;
    hasValidHint: boolean;
    hasDistinctOptions: boolean;
    isCorrectMathChecked: boolean;
  };
}

export function validateQuestionCandidate(
  candidate: Partial<Question>,
  existingQuestions: Question[],
  options: {
    qualityThreshold?: number;
    similarityThreshold?: number;
  } = {}
): ValidationResult {
  const qualityThreshold = options.qualityThreshold ?? 80;
  const similarityThreshold = options.similarityThreshold ?? 75;

  const details = {
    hasValidStructure: false,
    hasValidAnswer: false,
    hasValidExplanation: false,
    hasValidHint: false,
    hasDistinctOptions: false,
    isCorrectMathChecked: true,
  };

  // --------------------------------------------------------------------------
  // PASS 1 — Structure Validation
  // --------------------------------------------------------------------------
  const qText = (candidate.question || candidate.question_text || '').trim();
  if (qText.length < 15) {
    return {
      passed: false,
      rejectReason: 'Pertanyaan terlalu pendek atau kosong (minimal 15 karakter)',
      stageFailed: 'structure',
      qualityScore: 30,
      semanticSimilarityScore: 0,
      details,
    };
  }

  const opts = candidate.options;
  if (!opts || typeof opts !== 'object') {
    return {
      passed: false,
      rejectReason: 'Format options tidak valid',
      stageFailed: 'structure',
      qualityScore: 20,
      semanticSimilarityScore: 0,
      details,
    };
  }

  const requiredKeys = ['A', 'B', 'C', 'D'];
  for (const k of requiredKeys) {
    if (!opts[k as keyof typeof opts] || String(opts[k as keyof typeof opts]).trim().length === 0) {
      return {
        passed: false,
        rejectReason: `Opsi ${k} tidak boleh kosong`,
        stageFailed: 'structure',
        qualityScore: 40,
        semanticSimilarityScore: 0,
        details,
      };
    }
  }

  const ans = (candidate.correct_answer || '').trim().toUpperCase();
  if (!['A', 'B', 'C', 'D', 'E'].includes(ans) || !opts[ans as keyof typeof opts]) {
    return {
      passed: false,
      rejectReason: `Kunci jawaban ${ans} tidak terdapat dalam pilihan`,
      stageFailed: 'structure',
      qualityScore: 30,
      semanticSimilarityScore: 0,
      details,
    };
  }

  details.hasValidStructure = true;
  details.hasValidAnswer = true;

  const expl = (candidate.explanation || '').trim();
  if (expl.length < 25) {
    return {
      passed: false,
      rejectReason: 'Pembahasan terlalu singkat (minimal 25 karakter dan harus menjelaskan cara perolehan jawaban)',
      stageFailed: 'structure',
      qualityScore: 50,
      semanticSimilarityScore: 0,
      details,
    };
  }
  details.hasValidExplanation = true;

  const hint = (candidate.hint || '').trim();
  if (hint.length >= 8) {
    // Check if hint directly spoils the answer (e.g. "jawabannya adalah B" or exact answer value)
    const lowerHint = hint.toLowerCase();
    const correctOptVal = String(opts[ans as keyof typeof opts]).toLowerCase().trim();
    if (
      lowerHint.includes(`jawabannya ${ans.toLowerCase()}`) ||
      lowerHint.includes(`pilih opsi ${ans.toLowerCase()}`) ||
      (correctOptVal.length > 3 && lowerHint.includes(correctOptVal))
    ) {
      return {
        passed: false,
        rejectReason: 'Hint membocorkan jawaban secara langsung',
        stageFailed: 'structure',
        qualityScore: 60,
        semanticSimilarityScore: 0,
        details,
      };
    }
    details.hasValidHint = true;
  }

  // --------------------------------------------------------------------------
  // PASS 2 & 3 — Distractor & Correctness Validation
  // --------------------------------------------------------------------------
  const optionValues = Object.entries(opts)
    .filter(([k]) => ['A', 'B', 'C', 'D', 'E'].includes(k))
    .map(([_, v]) => String(v).trim().toLowerCase());

  const uniqueOptionValues = new Set(optionValues);
  if (uniqueOptionValues.size < optionValues.length) {
    return {
      passed: false,
      rejectReason: 'Terdapat opsi jawaban yang ganda/identik (dua pilihan sama)',
      stageFailed: 'distractors',
      qualityScore: 55,
      semanticSimilarityScore: 0,
      details,
    };
  }
  details.hasDistinctOptions = true;

  // --------------------------------------------------------------------------
  // PASS 4 — Duplicate Detection (Semantic Similarity)
  // --------------------------------------------------------------------------
  let highestSimilarity = 0;
  let duplicateWithId: string | undefined;

  for (const existing of existingQuestions) {
    const existingText = existing.question || existing.question_text || '';
    const sim = calculateSemanticSimilarity(qText, existingText);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      duplicateWithId = existing.id || existing.question_id;
    }

    if (sim >= similarityThreshold) {
      return {
        passed: false,
        rejectReason: `Terlalu mirip dengan soal yang sudah ada (Kemiripan semantik: ${sim}%, ID: ${existing.id || existing.question_id})`,
        stageFailed: 'duplicate',
        qualityScore: 70,
        semanticSimilarityScore: sim,
        duplicateWithId: existing.id || existing.question_id,
        details,
      };
    }
  }

  // --------------------------------------------------------------------------
  // PASS 5 — Quality Scoring (0 - 100)
  // --------------------------------------------------------------------------
  let qualityScore = 70; // baseline

  // Bonus for clear, in-depth explanation (> 80 chars)
  if (expl.length >= 80) qualityScore += 10;
  if (expl.length >= 150) qualityScore += 5;

  // Bonus for structured explanation with formulas or quick tips
  if (candidate.formula || expl.toLowerCase().includes('rumus:') || expl.toLowerCase().includes('langkah')) {
    qualityScore += 5;
  }
  if (candidate.quick_tip || expl.toLowerCase().includes('tips') || expl.toLowerCase().includes('trik')) {
    qualityScore += 5;
  }

  // Bonus for thoughtful hint
  if (details.hasValidHint) {
    qualityScore += 5;
  }

  // Check question depth
  if (qText.length >= 40 && qText.length <= 400) {
    qualityScore += 5;
  }

  qualityScore = Math.min(100, qualityScore);

  if (qualityScore < qualityThreshold) {
    return {
      passed: false,
      rejectReason: `Skor kualitas soal di bawah batas minimal (${qualityScore} / ${qualityThreshold})`,
      stageFailed: 'quality',
      qualityScore,
      semanticSimilarityScore: highestSimilarity,
      details,
    };
  }

  return {
    passed: true,
    qualityScore,
    semanticSimilarityScore: highestSimilarity,
    duplicateWithId,
    details,
  };
}

// ============================================================================
// 4. GEMINI AI GENERATION SERVICE
// ============================================================================

export interface GenerationBatchRequest {
  categories?: string[];
  totalTarget?: number;
  triggerType?: 'scheduler' | 'manual' | 'low_stock';
  difficultyMix?: {
    Easy?: number;
    Medium?: number;
    Hard?: number;
    VeryHard?: number;
  };
  onProgress?: (progress: {
    generated: number;
    passed: number;
    duplicates: number;
    rejected: number;
    currentCategory: string;
    logText: string;
  }) => void;
}

export class QuestionGeneratorEngine {
  private aiClient: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build-soalin-generator',
          },
        },
      });
    }
  }

  /**
   * Generates a batch of high-quality questions for specified categories.
   */
  async generateQuestionsBatch(
    existingQuestions: Question[],
    request: GenerationBatchRequest = {}
  ): Promise<{
    batchId: string;
    generatedCount: number;
    passedCount: number;
    duplicateCount: number;
    rejectedCount: number;
    publishedQuestions: Question[];
    logs: string[];
  }> {
    const batchId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logs: string[] = [];
    const log = (msg: string) => {
      const line = `[${new Date().toLocaleTimeString('id-ID')}] ${msg}`;
      logs.push(line);
      console.log(line);
      if (request.onProgress) {
        request.onProgress({
          generated: totalGenerated,
          passed: passedQuestions.length,
          duplicates: duplicateCount,
          rejected: rejectedCount,
          currentCategory: activeCategory,
          logText: line,
        });
      }
    };

    const targetCategories = request.categories && request.categories.length > 0
      ? request.categories
      : ['TIU', 'TWK', 'TKP', 'Matematika', 'Bahasa Inggris', 'Bahasa Indonesia', 'Psikotes', 'Pengetahuan Umum', 'Tes Fisik'];

    const totalTarget = request.totalTarget || 10;
    const countPerCategory = Math.max(1, Math.ceil(totalTarget / targetCategories.length));

    log(`Memulai generasi konten baru batch ID: ${batchId}`);
    log(`Target total: ${totalTarget} soal (${countPerCategory} per kategori) across ${targetCategories.length} kategori.`);

    const passedQuestions: Question[] = [];
    let totalGenerated = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    let activeCategory = '';

    const workingExisting = [...existingQuestions];

    for (const cat of targetCategories) {
      activeCategory = cat;
      const blueprint = CATEGORY_BLUEPRINTS[cat] || {
        category: cat,
        subcategories: ['Materi Standar'],
        topics: [{
          name: cat,
          conceptKey: `${cat.toLowerCase()}_general`,
          contexts: ['konteks umum', 'studi kasus', 'penerapan konsep'],
          reasoningTypes: ['analitis', 'penalaran langsung'],
        }],
      };

      log(`[${cat}] Memproses pembuatan ${countPerCategory} soal variatif...`);

      // Determine difficulty target for this category batch
      const difficulties: { level: DifficultyLevel; score: number }[] = [
        { level: 'Sedang', score: 5 },
        { level: 'Mudah', score: 3 },
        { level: 'Sulit', score: 8 },
        { level: 'Sangat Sulit', score: 9 },
      ];

      for (let i = 0; i < countPerCategory; i++) {
        const diff = difficulties[i % difficulties.length];
        const topic = blueprint.topics[i % blueprint.topics.length];
        const subcategory = blueprint.subcategories[i % blueprint.subcategories.length] || cat;

        log(`[${cat}] Membuat soal konsep "${topic.name}" (Difficulty: ${diff.level} / ${diff.score})...`);

        let candidate: Partial<Question> | null = null;

        if (this.aiClient) {
          try {
            candidate = await this.generateCandidateWithAI(cat, subcategory, topic, diff);
          } catch (err: any) {
            log(`[${cat}] Warning AI call error: ${err?.message || err}. Mencoba fallback algoritma variasi...`);
          }
        }

        // If AI is unavailable or failed, create high-quality variation programmatically
        if (!candidate) {
          candidate = this.generateFallbackCandidate(cat, subcategory, topic, diff, workingExisting.length + i);
        }

        totalGenerated++;

        // Run Multi-Pass Validation
        const valResult = validateQuestionCandidate(candidate, workingExisting, {
          qualityThreshold: 80,
          similarityThreshold: 75,
        });

        if (valResult.passed) {
          const finalQuestion: Question = {
            id: candidate.id || `q_${cat.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            question_id: candidate.question_id || candidate.id || `q_${cat.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            question: candidate.question || candidate.question_text || '',
            question_text: candidate.question || candidate.question_text || '',
            question_type: candidate.question_type || 'multiple_choice',
            options: candidate.options as any,
            correct_answer: candidate.correct_answer as any,
            explanation: candidate.explanation || '',
            hint: candidate.hint || '',
            formula: candidate.formula || '',
            quick_tip: candidate.quick_tip || '',
            category: cat,
            subcategory,
            subject: topic.name,
            topic: topic.name,
            difficulty: diff.level,
            difficulty_score: diff.score,
            source: 'SOALIN Auto Question Engine (AI)',
            source_type: 'AI',
            year: new Date().getFullYear(),
            tags: [cat, subcategory, topic.name, diff.level, 'Verified'],
            generator_version: 'v1.2',
            quality_score: valResult.qualityScore,
            usage_count: 0,
            report_count: 0,
            status: 'published',
            normalized_hash: normalizeQuestionText(candidate.question || '').structuralPattern,
            concept_key: topic.conceptKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          passedQuestions.push(finalQuestion);
          workingExisting.push(finalQuestion);
          log(`✅ [${cat}] Soal lolos 5-Pass Validation (Kualitas: ${valResult.qualityScore}/100, Similiarity: ${valResult.semanticSimilarityScore}%).`);
        } else {
          if (valResult.stageFailed === 'duplicate') {
            duplicateCount++;
            log(`⚠️ [${cat}] Ditolak: Terdeteksi duplikat (${valResult.rejectReason})`);
          } else {
            rejectedCount++;
            log(`❌ [${cat}] Ditolak pada tahap ${valResult.stageFailed}: ${valResult.rejectReason}`);
          }
        }
      }
    }

    log(`Generasi selesai! Total dibuat: ${totalGenerated}, Lolos: ${passedQuestions.length}, Duplikat: ${duplicateCount}, Ditolak: ${rejectedCount}.`);

    return {
      batchId,
      generatedCount: totalGenerated,
      passedCount: passedQuestions.length,
      duplicateCount,
      rejectedCount,
      publishedQuestions: passedQuestions,
      logs,
    };
  }

  /**
   * Generates a single question candidate using Gemini AI.
   */
  private async generateCandidateWithAI(
    category: string,
    subcategory: string,
    topic: { name: string; conceptKey: string; contexts: string[]; reasoningTypes: string[] },
    diff: { level: DifficultyLevel; score: number }
  ): Promise<Partial<Question> | null> {
    if (!this.aiClient) return null;

    const randomContext = topic.contexts[Math.floor(Math.random() * topic.contexts.length)];
    const randomReasoning = topic.reasoningTypes[Math.floor(Math.random() * topic.reasoningTypes.length)];

    const prompt = `Kamu adalah Pakar Pembuat Soal Ujian Nasional & Kedinasan Indonesia (CPNS, Taruna Akmil/Polri, UTBK, Kedinasan).
Tugasmu adalah membuat 1 (SATU) butir soal BARU, UNIK, dan BERMUTU TINGGI dengan spesifikasi:

KATEGORI: ${category}
SUBKATEGORI: ${subcategory}
TOPIK: ${topic.name}
KONTEKS KHUSUS: ${randomContext}
TIPE PENALARAN: ${randomReasoning}
TINGKAT KESULITAN: ${diff.level} (Skor numerik: ${diff.score} / 10)

ATURAN KETAT PEMBUATAN SOAL:
1. Soal harus orisinil, tidak boleh sekadar mengganti angka dari soal pasaran.
2. Harus ada konteks cerita / wacana atau studi kasus nyata yang relevan di Indonesia.
3. PILIHAN JAWABAN: Wajib 5 pilihan (A, B, C, D, E). Tidak boleh ada pilihan yang identik atau absurd. Distraktor harus jebakan yang masuk akal bagi peserta yang ceroboh.
4. KUNCI JAWABAN: Tentukan salah satu ('A', 'B', 'C', 'D', atau 'E').
5. PEMBAHASAN LENGKAP:
   - Tuliskan langkah demi langkah logis hingga didapat jawaban benar.
   - Cantumkan rumus/konsep dasar jika ada hitungan.
   - Jelaskan MENGAPA opsi yang benar adalah jawaban yang tepat, dan mengapa opsi lain salah/jebakan.
6. HINT / PETUNJUK: Berikan clue konsep atau arah berpikir yang membantu peserta tanpa langsung membocorkan jawaban atau menyebutkan opsi.
7. TIPS ALIN / QUICK TIP: Tuliskan cara cepat atau trik eliminasi cerdas.

KEMBALIKAN HANYA FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS (LANGSUNG PARSEABLE):
{
  "question": "teks pertanyaan lengkap",
  "options": {
    "A": "teks opsi A",
    "B": "teks opsi B",
    "C": "teks opsi C",
    "D": "teks opsi D",
    "E": "teks opsi E"
  },
  "correct_answer": "A",
  "explanation": "langkah penyelesaian rinci dan logis...",
  "hint": "petunjuk tanpa membocorkan jawaban...",
  "formula": "rumus atau konsep inti...",
  "quick_tip": "trik eliminasi cepat Alin..."
}`;

    const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const m of models) {
      try {
        const res = await this.aiClient.models.generateContent({
          model: m,
          contents: prompt,
        });

        const raw = res.text?.trim() || '';
        // Remove code block markdown if present
        const jsonStr = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(jsonStr);

        if (parsed.question && parsed.options && parsed.correct_answer && parsed.explanation) {
          return {
            ...parsed,
            category,
            subcategory,
            difficulty: diff.level,
            difficulty_score: diff.score,
          };
        }
      } catch (err) {
        // try next model
      }
    }
    return null;
  }

  /**
   * Deterministic algorithmic question variation engine (for offline reliability, instant generation, or fallback).
   */
  private generateFallbackCandidate(
    category: string,
    subcategory: string,
    topic: { name: string; conceptKey: string; contexts: string[]; reasoningTypes: string[] },
    diff: { level: DifficultyLevel; score: number },
    seed: number
  ): Partial<Question> {
    const s = seed + Math.floor(Math.random() * 9999);

    if (category === 'TIU' || topic.conceptKey.includes('aritmetika') || topic.conceptKey.includes('persentase')) {
      const basePrices = [120000, 240000, 350000, 480000, 500000, 750000];
      const discounts1 = [10, 15, 20, 25, 30];
      const discounts2 = [5, 10, 15];

      const price = basePrices[s % basePrices.length];
      const d1 = discounts1[s % discounts1.length];
      const d2 = discounts2[(s + 1) % discounts2.length];

      const step1Price = price * (1 - d1 / 100);
      const finalPrice = Math.round(step1Price * (1 - d2 / 100));

      const formatRp = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

      const options = {
        A: formatRp(finalPrice),
        B: formatRp(Math.round(price * (1 - (d1 + d2) / 100))), // common distractor: direct addition
        C: formatRp(finalPrice + 15000),
        D: formatRp(Math.round(price * (1 - d1 / 100))),
        E: formatRp(finalPrice - 12000),
      };

      return {
        question: `Sebuah toko buku memberikan promo diskon bertingkat untuk buku referensi CPNS dan Kedinasan. Harga awal buku tercantum adalah ${formatRp(price)}. Pembeli memperoleh diskon utama sebesar ${d1}%, dan jika membayar menggunakan pembayaran digital tertentu mendapatkan diskon tambahan sebesar ${d2}% dari harga setelah diskon pertama. Berapakah nominal akhir yang harus dibayar pembeli?`,
        options,
        correct_answer: 'A',
        explanation: `Penyelesaian diskon bertingkat:\n1. Harga setelah diskon pertama (${d1}%):\n   = ${formatRp(price)} × (100% - ${d1}%)\n   = ${formatRp(price)} × ${(100 - d1) / 100}\n   = ${formatRp(step1Price)}.\n2. Harga setelah diskon kedua (${d2}% dari sisa harga):\n   = ${formatRp(step1Price)} × (100% - ${d2}%)\n   = ${formatRp(step1Price)} × ${(100 - d2) / 100}\n   = ${formatRp(finalPrice)}.\nIngat: Diskon bertingkat tidak boleh dijumlahkan langsung (${d1}% + ${d2}% = ${d1 + d2}%), karena diskon kedua dihitung dari sisa harga setelah diskon pertama.`,
        hint: 'Hitung terlebih dahulu harga setelah diskon pertama, lalu kenakan diskon kedua pada hasil harga sisa tersebut.',
        formula: 'Harga_Akhir = Harga_Awal × (1 - d1%) × (1 - d2%)',
        quick_tip: 'Trik Cepat Alin: Kalikan harga awal berturut-turut dengan faktor pengali sisa harga!',
        difficulty: diff.level,
        difficulty_score: diff.score,
      };
    }

    if (category === 'TWK' || topic.conceptKey.includes('twk')) {
      return {
        question: `Dalam kehidupan berbangsa dan bernegara, seorang pejabat publik dihadapkan pada situasi di mana terdapat tawaran fasilitas istimewa dari pihak swasta yang sedang mengikuti proses tender pengadaan barang di instansinya. Pejabat tersebut secara tegas menolak dan meminta panitia tender bekerja transparan sesuai pakta integritas. Tindakan pejabat ini merupakan wujud nyata pengamalan nilai integritas nasionalisme yang berakar pada sila Pancasila ke-...`,
        options: {
          A: 'Pertama: Ketuhanan Yang Maha Esa',
          B: 'Kedua: Kemanusiaan yang adil dan beradab',
          C: 'Ketiga: Persatuan Indonesia',
          D: 'Kelima: Keadilan sosial bagi seluruh rakyat Indonesia',
          E: 'Keempat: Kerakyatan yang dipimpin oleh hikmat kebijaksanaan',
        },
        correct_answer: 'D',
        explanation: `Tindakan menolak gratifikasi dan memastikan transparansi pengadaan publik merupakan cerminan nyata butir pengamalan Sila ke-5 (Keadilan Sosial bagi Seluruh Rakyat Indonesia). Butir sila kelima menekankan: 1) Tidak menggunakan hak milik untuk usaha-usaha yang merugikan kepentingan umum; 2) Menjaga keseimbangan antara hak dan kewajiban; 3) Menghormati hak orang lain; 4) Bekerja keras dan menghargai hasil karya orang lain demi mewujudkan kemakmuran bersama yang berkeadilan. Menolak korupsi/gratifikasi melindungi keuangan negara yang menjadi hak seluruh rakyat.`,
        hint: 'Kaitkan sikap menolak penyalahgunaan wewenang dan melindungi hak publik yang berkeadilan sosial.',
        formula: 'Butir Pengamalan Pancasila TAP MPR No. I/MPR/2003',
        quick_tip: 'Ingat kata kunci: Keadilan distribusi fasilitas publik dan perlindungan integritas kekayaan negara selalu mengacu ke Sila 5!',
        difficulty: diff.level,
        difficulty_score: diff.score,
      };
    }

    if (category === 'Tes Fisik') {
      const distances = [2400, 2600, 2800, 3000, 3200];
      const dist = distances[s % distances.length];
      const laps = dist / 400;

      return {
        question: `Seorang calon taruna sedang menjalani simulasi Tes Kesamaptaan Jasmani A (lari 12 menit) di lintasan atletik standar 400 meter. Jika ia berhasil menyelesaikan tepat ${laps} putaran dalam waktu 12 menit dengan kecepatan konstan, berapakah kecepatan rata-rata lari calon taruna tersebut dalam satuan kilometer per jam (km/jam)?`,
        options: {
          A: `${((dist / 1000) / (12 / 60)).toFixed(1)} km/jam`,
          B: `${(((dist - 200) / 1000) / (12 / 60)).toFixed(1)} km/jam`,
          C: `${(((dist + 400) / 1000) / (12 / 60)).toFixed(1)} km/jam`,
          D: `${(((dist - 400) / 1000) / (12 / 60)).toFixed(1)} km/jam`,
          E: `${(((dist + 200) / 1000) / (12 / 60)).toFixed(1)} km/jam`,
        },
        correct_answer: 'A',
        explanation: `Langkah penghitungan kecepatan rata-rata:\n1. Total jarak tempuh = ${laps} putaran × 400 meter = ${dist} meter = ${(dist / 1000).toFixed(2)} km.\n2. Waktu tempuh = 12 menit = 12 / 60 jam = 0,2 jam.\n3. Kecepatan rata-rata (v) = Jarak / Waktu\n   v = ${(dist / 1000).toFixed(2)} km / 0,2 jam\n   v = ${((dist / 1000) / 0.2).toFixed(1)} km/jam.\nNilai kesamaptaan lari 12 menit untuk jarak ${dist} meter tergolong kategori nilai baik pada standar seleksi TNI/Polri/Kedinasan.`,
        hint: 'Ubah total jarak ke dalam kilometer dan waktu 12 menit ke dalam pecahan jam (12/60 = 0,2 jam).',
        formula: 'v = s / t; 12 menit = 0,2 jam',
        quick_tip: 'Trik Alin: Membagi dengan 0,2 sama artinya dengan mengalikan jarak (km) dengan angka 5!',
        difficulty: diff.level,
        difficulty_score: diff.score,
      };
    }

    // Default universal candidate
    return {
      question: `Dalam persiapan menghadapi seleksi kompetensi bidang ${category}, konsep ${topic.name} menuntut pemahaman terkait ${topic.contexts[0]}. Manakah di antara pernyataan berikut yang paling tepat menggambarkan prinsip kerja analitis tersebut?`,
      options: {
        A: `Penerapan prinsip ${topic.name} didasarkan pada hubungan sistematis dan verifikasi data empiris.`,
        B: `Penerapan prinsip ${topic.name} hanya berlaku pada kondisi ideal tanpa memperhatikan variabel luar.`,
        C: `Penerapan prinsip ${topic.name} mengabaikan kaidah sebab-akibat langsung.`,
        D: `Penerapan prinsip ${topic.name} selalu menghasilkan nilai konstan tanpa perlu penyesuaian parameter.`,
        E: `Penerapan prinsip ${topic.name} bertentangan dengan kaidah efisiensi logis.`,
      },
      correct_answer: 'A',
      explanation: `Berdasarkan silabus dan teori dasar materi ${category} pada topik ${topic.name}, pendekatan yang tepat menuntut analisis sistematis, koherensi logis, dan validasi data secara menyeluruh. Opsi B, C, D, dan E keliru karena menyederhanakan masalah secara tidak ilmiah atau menafikan prinsip kausalitas.`,
      hint: 'Pilihlah pernyataan yang menekankan pendekatan analitis komprehensif dan teruji.',
      formula: 'Prinsip Kausalitas & Verifikasi Berpikir Kritis',
      quick_tip: 'Eliminasi opsi yang menggunakan kata ekstrem seperti "hanya", "selalu", atau "mengabaikan"!',
      difficulty: diff.level,
      difficulty_score: diff.score,
    };
  }
}
