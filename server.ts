import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';
import {
  syncUserProfile,
  getUserProgress,
  recordQuestionAttempt,
  recordQuizAttempt,
  getUserQuizHistory,
  getUserQuestionAttempts,
  getUserDailyActivities,
  getUserFavorites,
  toggleUserFavorite,
  updateUserTargetCategory,
  getOrCreateAlinProfile,
  addAlinFamiliarityXp,
  getAlinConversations,
  createAlinConversation,
  deleteAlinConversation,
  getAlinMessages,
  saveAlinMessage,
  getQuestionsList,
  getAllActiveQuestions,
  getQuestionById,
  getQuestionBankStats,
  saveQuestionRecord,
  updateQuestionStatus,
  bulkUpdateQuestionStatus,
  deleteQuestionRecord,
  bulkDeleteQuestions,
  recordQuestionReport,
  getQuestionReports,
  resolveQuestionReport,
  getLearningPackages,
  saveLearningPackage,
  getGenerationLogs,
  saveGenerationLog,
  getGenerationConfig,
  updateGenerationConfig,
  formatDate,
  getLeaderboardData,
} from './src/db/queries.ts';
import { GoogleGenAI } from '@google/genai';
import { QuestionGeneratorEngine } from './src/services/questionGeneratorEngine.ts';
import { seedQuestionsDatabase } from './src/services/seedQuestions.ts';
import { seedLeaderboardDatabase } from './src/services/seedLeaderboard.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. AUTH SYNC: Sync authenticated Google user to PostgreSQL
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { targetCategory } = req.body || {};

      const result = await syncUserProfile({
        auth_user_id: user.uid,
        email: user.email || '',
        full_name: user.name || user.email?.split('@')[0] || 'Pelajar SOALIN',
        avatar_url: user.picture || '',
      });

      if (targetCategory && result.isNewUser) {
        await updateUserTargetCategory(user.uid, targetCategory);
      }

      res.json({
        success: true,
        profile: result.profile,
        progress: result.progress,
        isNewUser: result.isNewUser,
      });
    } catch (error: any) {
      console.error('Error in /api/auth/sync:', error);
      res.status(500).json({ error: error.message || 'Gagal sinkronisasi autentikasi' });
    }
  });

  // 2. GET USER PROGRESS
  app.get('/api/user/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const progress = await getUserProgress(user.uid);
      res.json({ success: true, progress });
    } catch (error: any) {
      console.error('Error in /api/user/progress:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil progres' });
    }
  });

  // 3. RECORD QUESTION ATTEMPT
  app.post('/api/user/question-attempt', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const {
        questionId,
        selectedAnswer,
        correctAnswer,
        isCorrect,
        timeSpent,
        clientDate,
      } = req.body;

      if (!questionId || selectedAnswer === undefined || correctAnswer === undefined) {
        return res.status(400).json({ error: 'Data pengerjaan soal tidak lengkap' });
      }

      const updatedProgress = await recordQuestionAttempt({
        userId: user.uid,
        questionId: String(questionId),
        selectedAnswer: String(selectedAnswer),
        correctAnswer: String(correctAnswer),
        isCorrect: Boolean(isCorrect),
        timeSpent: Number(timeSpent) || 10,
        clientDate,
      });

      // Award Alin Familiarity XP (+5 for active practice)
      try {
        await addAlinFamiliarityXp(user.uid, 5);
      } catch (err) {
        console.warn('Failed to award Alin XP on question attempt:', err);
      }

      res.json({ success: true, progress: updatedProgress });
    } catch (error: any) {
      console.error('Error in /api/user/question-attempt:', error);
      res.status(500).json({ error: error.message || 'Gagal menyimpan jawaban soal' });
    }
  });

  // 4. RECORD QUIZ / TRYOUT ATTEMPT
  app.post('/api/user/quiz-attempt', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const {
        quizId,
        quizTitle,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        score,
        duration,
        startedAt,
        clientDate,
      } = req.body;

      if (!quizId || totalQuestions === undefined || score === undefined) {
        return res.status(400).json({ error: 'Data hasil tryout tidak lengkap' });
      }

      const result = await recordQuizAttempt({
        userId: user.uid,
        quizId: String(quizId),
        quizTitle: String(quizTitle || 'Tryout SOALIN'),
        totalQuestions: Number(totalQuestions),
        correctAnswers: Number(correctAnswers),
        wrongAnswers: Number(wrongAnswers),
        score: Number(score),
        duration: Number(duration) || 60,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        clientDate,
      });

      // Award Alin Familiarity XP (+35 for completed CBT tryout session)
      try {
        await addAlinFamiliarityXp(user.uid, 35);
      } catch (err) {
        console.warn('Failed to award Alin XP on quiz attempt:', err);
      }

      res.json({ success: true, attempt: result.attempt, progress: result.progress });
    } catch (error: any) {
      console.error('Error in /api/user/quiz-attempt:', error);
      res.status(500).json({ error: error.message || 'Gagal menyimpan hasil tryout' });
    }
  });

  // 5. GET QUIZ HISTORY
  app.get('/api/user/quiz-history', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const history = await getUserQuizHistory(user.uid);
      res.json({ success: true, history });
    } catch (error: any) {
      console.error('Error in /api/user/quiz-history:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil riwayat tryout' });
    }
  });

  // 6. GET QUESTION ATTEMPTS (For wrong answer review)
  app.get('/api/user/question-attempts', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const attempts = await getUserQuestionAttempts(user.uid);
      res.json({ success: true, attempts });
    } catch (error: any) {
      console.error('Error in /api/user/question-attempts:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil riwayat soal' });
    }
  });

  // 7. GET DAILY ACTIVITIES (For accurate progress chart)
  app.get('/api/user/daily-activities', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const activities = await getUserDailyActivities(user.uid);
      res.json({ success: true, activities });
    } catch (error: any) {
      console.error('Error in /api/user/daily-activities:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil aktivitas harian' });
    }
  });

  // 8. FAVORITES
  app.get('/api/user/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const favorites = await getUserFavorites(user.uid);
      res.json({ success: true, favorites });
    } catch (error: any) {
      console.error('Error in /api/user/favorites:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil daftar favorit' });
    }
  });

  app.post('/api/user/favorites/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { questionId } = req.body;
      if (!questionId) {
        return res.status(400).json({ error: 'Question ID required' });
      }
      const result = await toggleUserFavorite(user.uid, String(questionId));
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error in /api/user/favorites/toggle:', error);
      res.status(500).json({ error: error.message || 'Gagal mengubah favorit' });
    }
  });

  // 9. UPDATE TARGET CATEGORY
  app.post('/api/user/target-category', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { targetCategory } = req.body;
      const updated = await updateUserTargetCategory(user.uid, targetCategory);
      res.json({ success: true, profile: updated });
    } catch (error: any) {
      console.error('Error in /api/user/target-category:', error);
      res.status(500).json({ error: error.message || 'Gagal memperbarui target' });
    }
  });

  // =========================================================================
  // 10. ALIN AI COMPANION ROUTES
  // =========================================================================

  let aiClient: GoogleGenAI | null = null;
  function getAIClient() {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // 10.1 Get ALIN Profile (Familiarity XP & Level)
  app.get('/api/alin/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const profile = await getOrCreateAlinProfile(user.uid);
      res.json({ success: true, profile });
    } catch (error: any) {
      console.error('Error in /api/alin/profile:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil profil ALIN' });
    }
  });

  // 10.2 Add Familiarity XP
  app.post('/api/alin/xp', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { xpDelta = 5 } = req.body;
      const updated = await addAlinFamiliarityXp(user.uid, Number(xpDelta) || 5);
      res.json({ success: true, profile: updated });
    } catch (error: any) {
      console.error('Error in /api/alin/xp:', error);
      res.status(500).json({ error: error.message || 'Gagal menambah XP ALIN' });
    }
  });

  // 10.3 Get ALIN Conversations
  app.get('/api/alin/conversations', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const conversations = await getAlinConversations(user.uid);
      res.json({ success: true, conversations });
    } catch (error: any) {
      console.error('Error in /api/alin/conversations:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil riwayat obrolan' });
    }
  });

  // 10.4 Create new ALIN Conversation
  app.post('/api/alin/conversations', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { title } = req.body || {};
      const conversation = await createAlinConversation(user.uid, title || 'Obrolan Belajar');
      res.json({ success: true, conversation });
    } catch (error: any) {
      console.error('Error in POST /api/alin/conversations:', error);
      res.status(500).json({ error: error.message || 'Gagal membuat percakapan baru' });
    }
  });

  // 10.5 Delete ALIN Conversation
  app.delete('/api/alin/conversations/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const conversationId = Number(req.params.id);
      if (!conversationId) {
        return res.status(400).json({ error: 'ID percakapan tidak valid' });
      }
      await deleteAlinConversation(user.uid, conversationId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error in DELETE /api/alin/conversations:', error);
      res.status(500).json({ error: error.message || 'Gagal menghapus percakapan' });
    }
  });

  // 10.6 Get Messages of a Conversation
  app.get('/api/alin/conversations/:id/messages', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const conversationId = Number(req.params.id);
      const messages = await getAlinMessages(conversationId, user.uid);
      res.json({ success: true, messages });
    } catch (error: any) {
      console.error('Error in /api/alin/conversations/:id/messages:', error);
      res.status(500).json({ error: error.message || 'Gagal memuat pesan obrolan' });
    }
  });

  // 10.7 Interactive ALIN Chat (Server-side Gemini + Persistence + Gen Z Persona)
  app.post('/api/alin/chat', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      let { conversationId, message, questionContext, actionType } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
      }

      // Ensure conversation exists or create one
      let activeConvId = Number(conversationId);
      if (!activeConvId) {
        let title = 'Obrolan Belajar';
        if (questionContext?.subject) {
          title = `Bahas ${questionContext.subject}`;
        } else if (message.length > 0) {
          title = message.slice(0, 32).trim() + (message.length > 32 ? '...' : '');
        }
        const newConv = await createAlinConversation(user.uid, title);
        activeConvId = newConv.id;
      }

      // 1. Save user message to database
      await saveAlinMessage({
        conversationId: activeConvId,
        userId: user.uid,
        role: 'user',
        content: message,
      });

      // 2. Fetch past conversation messages for short-term memory (last 8 messages)
      const pastMessages = await getAlinMessages(activeConvId, user.uid);
      const recentHistory = pastMessages.slice(-8, -1); // exclude the one just saved

      // 3. Prepare persona and context
      const alinSystemPrompt = `Kamu adalah ALIN, AI Learning Companion perempuan di platform SOALIN (Bank Soal & Tryout Indonesia).
Kamu adalah teman belajar yang asik, ceria, suportif, dan pintar untuk persiapan ujian (CPNS, Kedinasan, AKMIL, POLRI, BUMN, UTBK-SNBT, dll).

IDENTITAS DAN KEPRIBADIAN:
- Nama: ALIN
- Gender: Perempuan
- Kepribadian: Ramah, ceria, santai, responsif, sedikit playful, supportive, tidak kaku. Kamu seperti teman sebaya yang seru diajak ngobrol dan jago belajar.
- Kamu TIDAK kaku seperti robot.
- Kamu BISA serius, teliti, dan runtut saat menjelaskan materi pelajaran, soal rumus, atau penalaran logis.
- TIDAK manipulatif secara emosional (jangan gunakan kata-kata posesif atau ketergantungan semu).

GAYA BICARA (GEN Z SANTAI & NATURAL):
- Gunakan bahasa Indonesia kasual yang relatable: "yg", "gk", "bgt", "kalo", "udah", "nih", "wkwk", "hehe", "nah", "btw", "santai", dll.
- Gunakan emoji yang pas untuk menghidupkan suasana.
- Variasikan pembuka chat: "Haii!", "Nahh, bagian ini seru nih!", "Wkwk santai, pelan-pelan yaa", "Sini Alin bantu bedah soalnya."
- Jika user bingung / salah: beri afirmasi positif dan jangan menghakimi. Contoh: "Gapapa woi 😭 namanya juga latihan. Salah sekarang malah bagus, jadi tau mana yg perlu diasah. Sini Alin kasih trik gampangnya."
- Jika user dapat nilai bagus / berhasil: apresiasi dengan bangga. Contoh: "WOII mantapp bgt 😭🔥 Tuh kan, lu sebenernya jago kalo teliti!"

ATURAN PEMBAHASAN SOAL (JIKA MEMBAHAS SOAL / PILIHAN GANDA):
Jika ada soal atau user minta penjelasan soal, sajikan dengan struktur:
Jawaban: [Pilihan Jawaban, misal: B] ✅
Pembahasan:
(Penjelasan langkah demi langkah yang logis, jernih, dan mudah dipahami)
Tips Alin 💡
(Trik kilat, kata kunci eliminasi, atau cara cepat mengingat konsep)

FORMAT WAJIB OUTPUT:
Pada baris paling awal response, wajib sertakan tag ekspresi ALIN dari 24 ekspresi resmi:
[EXPRESSION: normal | senyum | happy | tertawa | thinking | confused | shock | sedih | menangis | marah | blushing | excited | semangat | encouraging | lelah | kaget_lucu | playful | ngelirik | kangen | cemas | yakin | penasaran | tidur | love]

PANDUAN PEMILIHAN EKSPRESI SESUAI KONTEKS:
- Greeting / sapaan awal / santai: normal | senyum
- Jawaban benar / apresiasi positif: happy | semangat
- User berhasil jawab benar / paham materi: excited | encouraging
- Menjelaskan materi / rumus / analisa soal: thinking | penasaran
- User tanya hal membingungkan / kontradiktif: confused | penasaran
- Ada skor luar biasa / kejutan besar: shock
- User kesulitan / down / sedih: sedih | encouraging
- Candaan / humor / santai seru: tertawa | kaget_lucu
- Sesi belajar panjang / lelah: lelah
- User minta motivasi / booster ujian: semangat | yakin
- Obrolan emosional / curhat / kangen: cemas | sedih | kangen
- Interaksi lucu / gemas / pujian: blushing | playful | love
- Mau istirahat / ngantuk / malam: ngelirik | tidur
Pilih salah satu ekspresi yang paling pas untuk situasi ini.`;

      let promptContent = `${alinSystemPrompt}\n\n`;

      if (questionContext) {
        promptContent += `--- KONTEKS SOAL YG SEDANG DIBUKA USER ---\n`;
        if (questionContext.category) promptContent += `Kategori: ${questionContext.category}\n`;
        if (questionContext.subject) promptContent += `Subjek: ${questionContext.subject}\n`;
        if (questionContext.question) promptContent += `Soal: ${questionContext.question}\n`;
        if (questionContext.options) promptContent += `Pilihan Jawaban: ${JSON.stringify(questionContext.options)}\n`;
        if (questionContext.correctAnswer || questionContext.correct_answer) {
          promptContent += `Kunci Jawaban: ${questionContext.correctAnswer || questionContext.correct_answer}\n`;
        }
        if (questionContext.explanation) promptContent += `Pembahasan resmi: ${questionContext.explanation}\n`;
        promptContent += `-------------------------------------------\n\n`;
      }

      if (actionType) {
        promptContent += `Aksi Cepat yg dipilih user: "${actionType}"\n\n`;
      }

      if (recentHistory.length > 0) {
        promptContent += `Riwayat percakapan sebelumnya:\n`;
        for (const m of recentHistory) {
          promptContent += `${m.role === 'user' ? 'User' : 'ALIN'}: ${m.content}\n`;
        }
        promptContent += `\n`;
      }

      promptContent += `Pesan terbaru dari User: "${message}"\n\nBalaslah sebagai ALIN sesuai persona dan aturan di atas:`;

      let replyText = '';
      let detectedExpression = 'normal';

      const client = getAIClient();
      let lastAiError: any = null;

      if (client) {
        // Models ordered by speed, quota reliability, and availability
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
        
        for (const modelName of candidateModels) {
          try {
            const aiResponse = await client.models.generateContent({
              model: modelName,
              contents: promptContent,
            });

            if (aiResponse && aiResponse.text && aiResponse.text.trim()) {
              replyText = aiResponse.text.trim();
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Gemini model ${modelName} encountered an error:`, modelErr?.message || modelErr);
            lastAiError = modelErr;
          }
        }
      } else {
        lastAiError = new Error('GEMINI_API_KEY is not configured on the server');
      }

      // If AI failed, return an explicit error instead of a static greeting
      if (!replyText) {
        const errorMsg = lastAiError?.message || 'Server AI tidak dapat menghasilkan balasan saat ini';
        console.error('Failed to get response from Gemini AI:', errorMsg);
        return res.status(503).json({
          success: false,
          error: `Gagal memproses pesan: ${errorMsg}. Silakan coba kirim ulang beberapa saat lagi!`,
        });
      }

      // Parse expression tag from text (support all 24 expressions and aliases)
      const expMatch = replyText.match(/\[EXPRESSION:\s*([a-zA-Z_]+)\]/i);
      if (expMatch) {
        const raw = expMatch[1].toLowerCase();
        replyText = replyText.replace(/\[EXPRESSION:\s*[a-zA-Z_]+\]/i, '').trim();

        // Alias mapping
        const aliasMap: Record<string, string> = {
          pikiran: 'thinking',
          berpikir: 'thinking',
          bingung: 'confused',
          kaget: 'shock',
          kesal: 'marah',
          malu: 'blushing',
          blush: 'blushing',
          antusias: 'excited',
          menyemangati: 'encouraging',
          capek: 'lelah',
          kagetlucu: 'kaget_lucu',
          genit: 'playful',
          ngiler: 'ngelirik',
          khawatir: 'cemas',
          percaya_diri: 'yakin',
          percayadiri: 'yakin',
          ngantuk: 'tidur',
          sleep: 'tidur',
          sayang: 'love',
          sad: 'sedih',
        };

        const canonical = aliasMap[raw] || raw;
        const validExpressions = [
          'normal', 'senyum', 'happy', 'tertawa', 'thinking', 'confused',
          'shock', 'sedih', 'menangis', 'marah', 'blushing', 'excited',
          'semangat', 'encouraging', 'lelah', 'kaget_lucu', 'playful',
          'ngelirik', 'kangen', 'cemas', 'yakin', 'penasaran', 'tidur', 'love'
        ];

        if (validExpressions.includes(canonical)) {
          detectedExpression = canonical;
        }
      }

      // 4. Save ALIN message to database
      await saveAlinMessage({
        conversationId: activeConvId,
        userId: user.uid,
        role: 'assistant',
        content: replyText,
      });

      // 5. Award +10 XP for active tutoring interaction
      const updatedProfile = await addAlinFamiliarityXp(user.uid, 10);

      res.json({
        success: true,
        conversationId: activeConvId,
        reply: replyText,
        expression: detectedExpression,
        profile: updatedProfile,
      });
    } catch (error: any) {
      console.error('Error in /api/alin/chat:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Terjadi gangguan saat memproses pesan di server ALIN',
      });
    }
  });

  // Legacy /api/ai/tutor and /api/gemini/tutor compatibility forwarder
  app.post(['/api/ai/tutor', '/api/gemini/tutor'], requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { message, prompt, questionContext, actionType } = req.body;
      const text = message || prompt || 'Halo Alin, jelaskan ini.';

      // Forward to Alin chat logic
      const conv = await createAlinConversation(user.uid, questionContext?.subject ? `Bahas ${questionContext.subject}` : 'Obrolan Belajar');
      await saveAlinMessage({ conversationId: conv.id, userId: user.uid, role: 'user', content: text });

      let reply = `Jawaban: ${questionContext?.correct_answer || questionContext?.correctAnswer || 'B'} ✅\n\nPembahasan:\nBerdasarkan materi ${questionContext?.subject || 'terkait'}, konsep kuncinya berfokus pada pemahaman fundamental soal. Kita bisa langsung eliminasi opsi yang tidak relevan.\n\nTips Alin 💡\nIngat selalu pola eliminasi cepat saat latihan!`;
      let expression = 'happy';

      const client = getAIClient();
      if (client) {
        try {
          const resp = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Kamu adalah ALIN, asisten belajar santai Gen Z tapi akurat di SOALIN. Jawab pertanyaan user:\n${text}\nKonteks: ${JSON.stringify(questionContext || {})}`,
          });
          if (resp && resp.text) reply = resp.text;
        } catch (e) {
          console.warn('Gemini call in legacy route:', e);
        }
      }

      await saveAlinMessage({ conversationId: conv.id, userId: user.uid, role: 'assistant', content: reply });
      await addAlinFamiliarityXp(user.uid, 10);

      res.json({ reply, text: reply, expression });
    } catch (error: any) {
      res.status(500).json({ reply: 'Maaf, ALIN sedang sibuk sebentar. Coba lagi ya!' });
    }
  });

  // =========================================================================
  // 11. QUESTION BANK & AUTO GENERATION SYSTEM
  // =========================================================================

  const generatorEngine = new QuestionGeneratorEngine(process.env.GEMINI_API_KEY);

  // Background Auto Daily Generation & Low-Stock Trigger
  let isGeneratingInBackground = false;
  async function runScheduledGeneration(triggerType: 'scheduler' | 'low_stock' = 'scheduler') {
    if (isGeneratingInBackground) {
      console.log('[AutoGenerator] Generasi sedang berjalan, lewati jadwal ini.');
      return;
    }

    try {
      isGeneratingInBackground = true;
      const config = await getGenerationConfig();
      if (!config || (triggerType === 'scheduler' && !config.auto_schedule_enabled)) {
        console.log('[AutoGenerator] Auto schedule dinonaktifkan di pengaturan.');
        return;
      }

      console.log(`[AutoGenerator] Menjalankan proses generasi konten (${triggerType})...`);
      const existingQs = await getAllActiveQuestions();
      const stats = await getQuestionBankStats();

      let targetCategories: string[] = Object.keys(config.category_distribution);

      // Low stock trigger: check categories with counts below threshold
      if (triggerType === 'low_stock') {
        const threshold = config.min_stock_threshold || 30;
        const lowCategories = targetCategories.filter(cat => (stats.categoryCounts[cat] || 0) < threshold);
        if (lowCategories.length === 0) {
          console.log('[AutoGenerator] Stok semua kategori mencukupi (di atas batas minimum).');
          return;
        }
        targetCategories = lowCategories;
        console.log(`[AutoGenerator] Low-stock terdeteksi pada kategori: ${lowCategories.join(', ')}`);
      }

      const totalTarget = triggerType === 'low_stock'
        ? targetCategories.length * 5
        : Math.min(100, Math.max(10, Math.round(config.daily_target_total / 2))); // healthy batch size

      const genResult = await generatorEngine.generateQuestionsBatch(existingQs, {
        categories: targetCategories,
        totalTarget,
        triggerType,
      });

      // Save approved questions into Cloud SQL PostgreSQL
      for (const q of genResult.publishedQuestions) {
        await saveQuestionRecord(q);
      }

      // Automatically generate / update Daily Learning Package if questions were published
      if (genResult.publishedQuestions.length > 0) {
        const todayStr = formatDate();
        const publishedIds = genResult.publishedQuestions.map(q => q.id);
        const dayNumber = (new Date().getDate() % 30) + 1;
        const padDay = String(dayNumber).padStart(2, '0');

        await saveLearningPackage({
          package_id: `pkg-daily-${todayStr}-day${padDay}`,
          title: `Paket Belajar Hari Ini — Day ${padDay}: Update ${todayStr}`,
          description: `Koleksi ${publishedIds.length} soal baru terverifikasi otomatis hasil kurasi multi-pass AI untuk persiapan ujianmu hari ini.`,
          package_type: 'daily',
          category: 'Campuran',
          target_date: todayStr,
          difficulty: 'Campuran',
          duration_minutes: Math.max(15, publishedIds.length * 2),
          question_ids: publishedIds,
          passing_score: 65,
        });
      }

      // Record generation run log
      await saveGenerationLog({
        batch_id: genResult.batchId,
        trigger_type: triggerType,
        status: 'completed',
        categories_targeted: targetCategories,
        total_requested: totalTarget,
        generated_count: genResult.generatedCount,
        passed_validation_count: genResult.passedCount,
        duplicate_count: genResult.duplicateCount,
        rejected_count: genResult.rejectedCount,
        published_count: genResult.publishedQuestions.length,
        details_json: { logs: genResult.logs },
        completed_at: new Date(),
      });

      console.log(`[AutoGenerator] Selesai! Berhasil mempublikasikan ${genResult.publishedQuestions.length} soal baru.`);
    } catch (err: any) {
      console.error('[AutoGenerator] Error during generation run:', err);
    } finally {
      isGeneratingInBackground = false;
    }
  }

  // Periodic scheduler: Check low-stock every hour, and run daily generation
  setInterval(() => {
    runScheduledGeneration('low_stock');
  }, 60 * 60 * 1000); // every 1 hour

  // Initial seed and first check after server startup
  setTimeout(async () => {
    try {
      await seedQuestionsDatabase();
      await seedLeaderboardDatabase();
      // Run low-stock check once after startup
      await runScheduledGeneration('low_stock');
    } catch (e) {
      console.warn('Initial seed/check error:', e);
    }
  }, 4000);

  // 10.9 GET LEADERBOARD (Real-time database ranking with anti-cheat & pagination)
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const timeframe = (req.query.timeframe as any) || 'all';
      const category = (req.query.category as string) || 'all';
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 25;
      
      let currentUserId = req.query.userId as string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        try {
          const decoded = await adminAuth.verifyIdToken(token);
          if (decoded && decoded.uid) {
            currentUserId = decoded.uid;
          }
        } catch {}
      }

      const result = await getLeaderboardData({
        timeframe,
        category,
        page,
        limit,
        currentUserId,
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error in /api/leaderboard:', error);
      res.status(500).json({ error: error.message || 'Gagal mengambil data papan peringkat' });
    }
  });

  // 11.1 GET QUESTIONS (Paginated, filtered, scalable)
  app.get('/api/questions', async (req, res) => {
    try {
      const { category, difficulty, status, topic, search, limit = '50', offset = '0' } = req.query;
      const result = await getQuestionsList({
        category: category as string,
        difficulty: difficulty as string,
        status: status as string,
        topic: topic as string,
        search: search as string,
        limit: parseInt(limit as string, 10) || 50,
        offset: parseInt(offset as string, 10) || 0,
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error in GET /api/questions:', error);
      res.status(500).json({ success: false, error: 'Gagal mengambil bank soal' });
    }
  });

  // 11.2 GET QUESTION BANK STATS
  app.get('/api/questions/stats', async (req, res) => {
    try {
      const stats = await getQuestionBankStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      console.error('Error in GET /api/questions/stats:', error);
      res.status(500).json({ success: false, error: 'Gagal mengambil statistik bank soal' });
    }
  });

  // 11.3 GET SINGLE QUESTION
  app.get('/api/questions/:id', async (req, res) => {
    try {
      const q = await getQuestionById(req.params.id);
      if (!q) {
        return res.status(404).json({ success: false, error: 'Soal tidak ditemukan' });
      }
      res.json({ success: true, question: q });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.4 SAVE / CREATE / UPDATE QUESTION
  app.post('/api/questions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const questionData = req.body;
      if (!questionData.question && !questionData.question_text) {
        return res.status(400).json({ error: 'Teks pertanyaan wajib diisi' });
      }
      const saved = await saveQuestionRecord(questionData);
      res.json({ success: true, question: saved });
    } catch (error: any) {
      console.error('Error in POST /api/questions:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal menyimpan soal' });
    }
  });

  // 11.5 UPDATE QUESTION STATUS (Approve, Reject, Archive, Needs Review)
  app.patch('/api/questions/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status wajib ditentukan' });
      }
      const updated = await updateQuestionStatus(req.params.id, status);
      res.json({ success: true, question: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/questions/:id/status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.6 BULK ACTIONS ON QUESTIONS
  app.post('/api/questions/bulk-action', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { action, questionIds } = req.body;
      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ error: 'Daftar ID soal tidak boleh kosong' });
      }

      if (action === 'delete') {
        const deletedCount = await bulkDeleteQuestions(questionIds);
        return res.json({ success: true, count: deletedCount, action: 'delete' });
      } else if (['approved', 'rejected', 'published', 'archived'].includes(action)) {
        const updatedCount = await bulkUpdateQuestionStatus(questionIds, action);
        return res.json({ success: true, count: updatedCount, action });
      }

      res.status(400).json({ error: 'Aksi tidak valid' });
    } catch (error: any) {
      console.error('Error in POST /api/questions/bulk-action:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.7 DELETE QUESTION
  app.delete('/api/questions/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteQuestionRecord(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error in DELETE /api/questions/:id:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.8 USER REPORT SYSTEM ("Laporkan Soal")
  app.post('/api/questions/report', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { questionId, reason, details } = req.body;

      if (!questionId || !reason) {
        return res.status(400).json({ error: 'ID Soal dan alasan laporan wajib diisi' });
      }

      const report = await recordQuestionReport({
        questionId: String(questionId),
        userId: user.uid,
        userName: user.name || user.email?.split('@')[0] || 'Peserta',
        reason: String(reason),
        details: String(details || ''),
      });

      res.json({
        success: true,
        message: 'Laporan berhasil dikirim ke tim editor SOALIN. Terima kasih atas kontribusi Anda!',
        report,
      });
    } catch (error: any) {
      console.error('Error in POST /api/questions/report:', error);
      res.status(500).json({ success: false, error: error.message || 'Gagal mengirim laporan' });
    }
  });

  // 11.9 GET REPORTS (Admin)
  app.get('/api/questions/reports/list', requireAuth, async (req: AuthRequest, res) => {
    try {
      const reports = await getQuestionReports();
      res.json({ success: true, reports });
    } catch (error: any) {
      console.error('Error in GET /api/questions/reports/list:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.10 RESOLVE REPORT (Admin)
  app.patch('/api/questions/reports/:id/resolve', requireAuth, async (req: AuthRequest, res) => {
    try {
      const reportId = Number(req.params.id);
      const { status = 'resolved' } = req.body;
      const updated = await resolveQuestionReport(reportId, status);
      res.json({ success: true, report: updated });
    } catch (error: any) {
      console.error('Error in PATCH /api/questions/reports/:id/resolve:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.11 MANUAL / ADMIN TRIGGER QUESTION GENERATION
  app.post('/api/admin/generate-questions', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { categories, totalTarget = 10, difficultyMix } = req.body;

      console.log(`[Admin] Manual trigger generasi: ${totalTarget} soal, kategori: ${JSON.stringify(categories)}`);

      const existingQs = await getAllActiveQuestions();

      const genResult = await generatorEngine.generateQuestionsBatch(existingQs, {
        categories: Array.isArray(categories) && categories.length > 0 ? categories : undefined,
        totalTarget: Math.min(100, Math.max(1, Number(totalTarget) || 10)),
        triggerType: 'manual',
        difficultyMix,
      });

      // Save approved questions into Cloud SQL PostgreSQL
      for (const q of genResult.publishedQuestions) {
        await saveQuestionRecord(q);
      }

      // Update Daily Learning Package
      if (genResult.publishedQuestions.length > 0) {
        const todayStr = formatDate();
        const publishedIds = genResult.publishedQuestions.map(q => q.id);
        const dayNumber = (new Date().getDate() % 30) + 1;
        const padDay = String(dayNumber).padStart(2, '0');

        await saveLearningPackage({
          package_id: `pkg-daily-${todayStr}-day${padDay}`,
          title: `Paket Belajar Hari Ini — Day ${padDay}: ${todayStr}`,
          description: `Koleksi ${publishedIds.length} soal baru terverifikasi multi-pass AI untuk persiapan ujianmu hari ini.`,
          package_type: 'daily',
          category: 'Campuran',
          target_date: todayStr,
          difficulty: 'Campuran',
          duration_minutes: Math.max(15, publishedIds.length * 2),
          question_ids: publishedIds,
          passing_score: 65,
        });
      }

      // Save generation log
      await saveGenerationLog({
        batch_id: genResult.batchId,
        trigger_type: 'manual',
        status: 'completed',
        categories_targeted: categories || ['TIU', 'TWK', 'TKP', 'Matematika', 'Bahasa Inggris'],
        total_requested: totalTarget,
        generated_count: genResult.generatedCount,
        passed_validation_count: genResult.passedCount,
        duplicate_count: genResult.duplicateCount,
        rejected_count: genResult.rejectedCount,
        published_count: genResult.publishedQuestions.length,
        details_json: { logs: genResult.logs },
        completed_at: new Date(),
      });

      res.json({
        success: true,
        batchId: genResult.batchId,
        generated: genResult.generatedCount,
        passed: genResult.passedCount,
        duplicates: genResult.duplicateCount,
        rejected: genResult.rejectedCount,
        published: genResult.publishedQuestions.length,
        questions: genResult.publishedQuestions,
        logs: genResult.logs,
      });
    } catch (error: any) {
      console.error('Error in /api/admin/generate-questions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Gagal menjalankan proses generasi soal',
      });
    }
  });

  // 11.12 GENERATION LOGS
  app.get('/api/admin/generation-logs', requireAuth, async (req: AuthRequest, res) => {
    try {
      const logs = await getGenerationLogs(30);
      res.json({ success: true, logs });
    } catch (error: any) {
      console.error('Error in GET /api/admin/generation-logs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.13 GENERATION CONFIGURATION
  app.get('/api/admin/generation-config', requireAuth, async (req: AuthRequest, res) => {
    try {
      const config = await getGenerationConfig();
      res.json({ success: true, config });
    } catch (error: any) {
      console.error('Error in GET /api/admin/generation-config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/admin/generation-config', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateGenerationConfig(req.body);
      res.json({ success: true, config: updated });
    } catch (error: any) {
      console.error('Error in POST /api/admin/generation-config:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 11.14 LEARNING PACKAGES (Daily, Personalized, Weekly, Monthly)
  app.get('/api/packages/daily', async (req, res) => {
    try {
      const packages = await getLearningPackages('daily');
      res.json({ success: true, packages });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Adaptive personalized package based on user's wrong topics
  app.get('/api/packages/recommended', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const attempts = await getUserQuestionAttempts(user.uid);
      const wrongAttempts = attempts.filter(a => !a.is_correct);

      // Find weak topics
      const allActive = await getAllActiveQuestions();
      const wrongQIds = new Set(wrongAttempts.map(w => w.question_id));
      const wrongQuestions = allActive.filter(q => wrongQIds.has(q.id));

      const topicCounts: Record<string, number> = {};
      for (const q of wrongQuestions) {
        const top = q.subject || q.topic || q.category;
        topicCounts[top] = (topicCounts[top] || 0) + 1;
      }

      // Sort weak topics
      const sortedWeak = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
      const primaryWeak = sortedWeak[0]?.[0] || 'Kemampuan Numerik & Silogisme';

      // Pick questions matching the weak topic, plus general practice
      const recommendedQs = allActive.filter(q => 
        (q.subject && q.subject.toLowerCase().includes(primaryWeak.toLowerCase())) ||
        (q.topic && q.topic.toLowerCase().includes(primaryWeak.toLowerCase())) ||
        (q.category && q.category.toLowerCase().includes(primaryWeak.toLowerCase()))
      );

      const qIds = recommendedQs.slice(0, 15).map(q => q.id);

      const personalizedPkg = {
        package_id: `pkg-adaptive-${user.uid}-${formatDate()}`,
        title: `Latihan Adaptif: Penguatan ${primaryWeak}`,
        description: `Berdasarkan analisis performamu, topik "${primaryWeak}" memerlukan latihan tambahan untuk mendongkrak akurasimu.`,
        package_type: 'personalized',
        category: recommendedQs[0]?.category || 'TIU',
        target_date: formatDate(),
        difficulty: 'Sedang',
        duration_minutes: 25,
        question_count: qIds.length,
        question_ids: qIds,
        passing_score: 70,
        weakTopics: sortedWeak.slice(0, 3).map(s => s[0]),
      };

      res.json({ success: true, package: personalizedPkg });
    } catch (error: any) {
      console.error('Error in /api/packages/recommended:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/packages/weekly', async (req, res) => {
    try {
      const packages = await getLearningPackages('weekly_tryout');
      res.json({ success: true, package: packages[0] || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/packages/monthly', async (req, res) => {
    try {
      const packages = await getLearningPackages('monthly_simulation');
      res.json({ success: true, package: packages[0] || null });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });


  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SOALIN running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
