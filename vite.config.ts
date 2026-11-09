import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

function geminiTutorPlugin(): Plugin {
  return {
    name: 'gemini-tutor-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini/tutor', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const data = JSON.parse(bodyStr || '{}');
            const { prompt, questionContext, actionType } = data;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({
                text: null,
                fallback: true,
                message: 'Kunci GEMINI_API_KEY belum disetel. Menggunakan mode edukasi SOALIN AI Engine.'
              }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemInstruction = `Kamu adalah "SOALIN AI Tutor", asisten belajar pintar dan ramah untuk platform edukasi SOALIN Indonesia.
Tugasmu adalah membantu pelajar, mahasiswa, serta pejuang seleksi CPNS, TNI, Polri, dan Kedinasan memahami materi dan strategi pengerjaan soal.

PENTING:
1. Soal-soal latihan ini adalah bahan latihan edukatif berstandar kurikulum/format uji setara, bukan merupakan dokumen rahasia atau bocoran seleksi resmi. Jangan pernah mengklaim ini soal bocoran resmi.
2. Jelaskan dengan bahasa Indonesia yang jelas, runut, menyemangati, dan mudah dipahami.
3. Untuk soal numerik/matematika: tampilkan langkah perhitungan terstruktur dan rumus yang dipakai.
4. Sertakan "Trik Kilat / Tips Cepat" jika relevan agar pengguna bisa menghemat waktu saat ujian CBT.
5. Format jawaban dengan markdown rapi.`;

            let combinedPrompt = '';
            if (questionContext) {
              combinedPrompt += `Konteks Soal Saat Ini:
- Pertanyaan: ${questionContext.question}
- Pilihan Jawaban:
${Object.entries(questionContext.options || {}).map(([k, v]) => `  ${k}. ${v}`).join('\n')}
- Kunci Jawaban Resmi: ${questionContext.correct_answer}
- Pembahasan Singkat: ${questionContext.explanation || '-'}
- Kategori/Materi: ${questionContext.category} / ${questionContext.subject || ''}\n\n`;
            }

            combinedPrompt += `Permintaan Pengguna (${actionType || 'Tanya Tutor'}): ${prompt}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: combinedPrompt,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });

            res.statusCode = 200;
            res.end(JSON.stringify({
              text: response.text || 'Maaf, tidak ada respon yang dihasilkan.',
              success: true
            }));
          } catch (err: any) {
            console.error('Error calling Gemini API:', err);
            res.statusCode = 200;
            res.end(JSON.stringify({
              error: err?.message || 'Gagal menghubungi Gemini API',
              fallback: true
            }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiTutorPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
