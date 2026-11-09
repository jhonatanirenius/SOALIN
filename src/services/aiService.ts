import { Question } from '../types';

export interface AiTutorRequest {
  prompt: string;
  question?: Question;
  actionType?: string;
}

export interface AiTutorResponse {
  answer: string;
  isAiGenerated: boolean;
  modelUsed: string;
}

export async function askAiTutor(request: AiTutorRequest): Promise<AiTutorResponse> {
  const { prompt, question, actionType } = request;

  try {
    const res = await fetch('/api/gemini/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        questionContext: question ? {
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          category: question.category,
          subject: question.subject
        } : undefined,
        actionType
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return {
          answer: data.text,
          isAiGenerated: true,
          modelUsed: 'gemini-3.8-flash'
        };
      }
    }
  } catch (err) {
    console.warn('Backend tutor call failed, using intelligent fallback tutor engine', err);
  }

  // Smart educational fallback engine if offline or API key is pending
  return generateIntelligentTutorFallback(request);
}

function generateIntelligentTutorFallback(request: AiTutorRequest): AiTutorResponse {
  const { prompt, question, actionType } = request;

  if (!question) {
    return {
      answer: `### 💡 Panduan Belajar SOALIN AI\n\nUntuk memulai latihan efektif:\n1. **Kuasai Konsep Dasar**: Pahami kisi-kisi resmi (BKN / Disdik / Mabes TNI-Polri).\n2. **Manajemen Waktu**: Dalam ujian CBT, alokasikan rata-rata 50-60 detik per soal.\n3. **Analisis Kesalahan**: Selalu buka menu *Ulangi Soal Salah* di SOALIN untuk menutup celah kelemahanmu.`,
      isAiGenerated: false,
      modelUsed: 'SOALIN Educational Engine'
    };
  }

  const correctOptText = question.options[question.correct_answer] || '';

  if (actionType === 'Kenapa Jawabannya?') {
    return {
      answer: `### 🎯 Mengapa Kuncinya Adalah **${question.correct_answer}**?\n\n**Jawaban Tepat:** ${question.correct_answer}. ${correctOptText}\n\n**Alasan Rasional:**\n${question.explanation}\n\n${question.formula ? `**Rumus / Aturan Kunci:**\n\`${question.formula}\`\n\n` : ''}**Mengapa opsi lain kurang tepat?**\nOpsi lainnya tidak memenuhi kriteria konsep materi *${question.subject}* atau merupakan jebakan pengecoh (*distractor*) yang umum dibuat pembuat soal ujian.`,
      isAiGenerated: false,
      modelUsed: 'SOALIN Intelligent Rule Base'
    };
  }

  if (actionType === 'Trik Kilat') {
    return {
      answer: `### ⚡ Trik Cepat & Shortcut CBT\n\n${question.quick_tip || 'Analisis eliminasi opsi yang tidak logis terlebih dahulu.'}\n\n**Langkah Efisien:**\n1. Perhatikan kata kunci utama dalam pertanyaan.\n2. Coret opsi yang secara ekstrem bertentangan dengan prinsip *${question.category}*.\n3. Gunakan rumus ringkas: \`${question.formula || 'Logika Eliminasi Pengecoh'}\` untuk memangkas waktu hitung hingga < 30 detik!`,
      isAiGenerated: false,
      modelUsed: 'SOALIN Speed-Method'
    };
  }

  if (actionType === 'Soal Serupa') {
    return {
      answer: `### 📝 Latihan Soal Serupa (*Drilling Mode*)\n\n**Materi:** ${question.subject} (${question.category})\n\n**Pertanyaan Latihan Baru:**\n"Dalam konteks yang setara dengan soal ini, jika terdapat skenario dengan variabel dinaikkan 2 kali lipat, bagaimana implikasi logis terhadap hasil akhirnya?"\n\n**Petunjuk:**\n- Terapkan rumus dasar: \`${question.formula || 'Konsep Proporsi / Teori Pokok'}\`\n- Coba kerjakan secara mandiri di lembar buram, lalu cocokkan dengan prinsip pada pembahasan soal utama!`,
      isAiGenerated: false,
      modelUsed: 'SOALIN Question Generator'
    };
  }

  // Default: Jelaskan Soal Ini
  return {
    answer: `### 📖 Penjelasan Edukatif Komprehensif\n\n**Materi yang Diuji:** ${question.subject} (${question.difficulty})\n\n**Analisis Langkah demi Langkah:**\n${question.explanation}\n\n${question.formula ? `**Formula / Landasan Teori:**\n\`${question.formula}\`\n\n` : ''}${question.quick_tip ? `**Tips Ujian CBT:**\n${question.quick_tip}\n\n` : ''}*Catatan: Selalu perhatikan instruksi soal secara teliti sebelum memilih opsi jawaban.*`,
    isAiGenerated: false,
    modelUsed: 'SOALIN Educational Engine'
  };
}
