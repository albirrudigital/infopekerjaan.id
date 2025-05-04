import { Router } from "express";
import { interviewPreparationService } from "../interview-preparation-service";
import {
  insertInterviewQuestionSchema,
  insertMockInterviewSchema,
  insertMockInterviewQuestionSchema,
  insertInterviewTipSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware untuk memeriksa apakah pengguna terotentikasi
function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Tidak terotentikasi" });
  }
  next();
}

// Middleware untuk memeriksa apakah pengguna adalah admin
function isAdmin(req, res, next) {
  if (!req.isAuthenticated() || req.user.type !== "admin") {
    return res.status(403).json({ message: "Tidak memiliki akses" });
  }
  next();
}

const router = Router();

/**
 * === INTERVIEW QUESTIONS ROUTES ===
 */

// Mendapatkan daftar pertanyaan wawancara dengan filter
router.get("/questions", async (req, res) => {
  try {
    const { category, difficulty, industry, jobRole, limit, offset } = req.query;
    
    const questions = await interviewPreparationService.getInterviewQuestions({
      category: category as string,
      difficulty: difficulty as string,
      industry: industry as string,
      jobRole: jobRole as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });
    
    res.json(questions);
  } catch (error) {
    console.error("Error fetching interview questions:", error);
    res.status(500).json({ message: "Gagal mengambil pertanyaan wawancara" });
  }
});

// Mendapatkan pertanyaan wawancara berdasarkan ID
router.get("/questions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const question = await interviewPreparationService.getInterviewQuestion(id);
    
    if (!question) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }
    
    res.json(question);
  } catch (error) {
    console.error("Error fetching interview question:", error);
    res.status(500).json({ message: "Gagal mengambil pertanyaan wawancara" });
  }
});

// Membuat pertanyaan wawancara baru (hanya untuk admin)
router.post("/questions", isAdmin, async (req, res) => {
  try {
    const validatedData = insertInterviewQuestionSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });
    
    const newQuestion = await interviewPreparationService.createInterviewQuestion(validatedData);
    res.status(201).json(newQuestion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
    }
    
    console.error("Error creating interview question:", error);
    res.status(500).json({ message: "Gagal membuat pertanyaan wawancara" });
  }
});

// Mengupdate pertanyaan wawancara (hanya untuk admin)
router.put("/questions/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validasi input
    const { industries, jobRoles, skillsRequired, ...restData } = req.body;
    
    // Tambahkan validasi tambahan jika diperlukan
    
    const updatedQuestion = await interviewPreparationService.updateInterviewQuestion(id, {
      ...restData,
      industries: Array.isArray(industries) ? industries : undefined,
      jobRoles: Array.isArray(jobRoles) ? jobRoles : undefined,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : undefined
    });
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating interview question:", error);
    res.status(500).json({ message: "Gagal mengupdate pertanyaan wawancara" });
  }
});

// Menghapus pertanyaan wawancara (hanya untuk admin)
router.delete("/questions/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await interviewPreparationService.deleteInterviewQuestion(id);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting interview question:", error);
    res.status(500).json({ message: "Gagal menghapus pertanyaan wawancara" });
  }
});

// Memverifikasi pertanyaan wawancara (hanya untuk admin)
router.patch("/questions/:id/verify", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { verify } = req.body;
    
    if (typeof verify !== "boolean") {
      return res.status(400).json({ message: "Parameter verifikasi tidak valid" });
    }
    
    const updatedQuestion = await interviewPreparationService.verifyInterviewQuestion(id, verify);
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error verifying interview question:", error);
    res.status(500).json({ message: "Gagal memverifikasi pertanyaan wawancara" });
  }
});

/**
 * === MOCK INTERVIEW ROUTES ===
 */

// Mendapatkan sesi mock interview untuk pengguna yang terotentikasi
router.get("/mock-interviews", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const interviews = await interviewPreparationService.getUserMockInterviews(userId);
    res.json(interviews);
  } catch (error) {
    console.error("Error fetching mock interviews:", error);
    res.status(500).json({ message: "Gagal mengambil sesi wawancara latihan" });
  }
});

// Mendapatkan sesi mock interview berdasarkan ID
router.get("/mock-interviews/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    res.json(interview);
  } catch (error) {
    console.error("Error fetching mock interview:", error);
    res.status(500).json({ message: "Gagal mengambil sesi wawancara latihan" });
  }
});

// Membuat sesi mock interview baru
router.post("/mock-interviews", isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertMockInterviewSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    const newInterview = await interviewPreparationService.createMockInterview(validatedData);
    res.status(201).json(newInterview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
    }
    
    console.error("Error creating mock interview:", error);
    res.status(500).json({ message: "Gagal membuat sesi wawancara latihan" });
  }
});

// Mengupdate sesi mock interview
router.put("/mock-interviews/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    const updatedInterview = await interviewPreparationService.updateMockInterview(id, req.body);
    res.json(updatedInterview);
  } catch (error) {
    console.error("Error updating mock interview:", error);
    res.status(500).json({ message: "Gagal mengupdate sesi wawancara latihan" });
  }
});

// Menghapus sesi mock interview
router.delete("/mock-interviews/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    await interviewPreparationService.deleteMockInterview(id);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting mock interview:", error);
    res.status(500).json({ message: "Gagal menghapus sesi wawancara latihan" });
  }
});

// Memulai sesi mock interview
router.post("/mock-interviews/:id/start", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    const startedInterview = await interviewPreparationService.startMockInterview(id);
    res.json(startedInterview);
  } catch (error) {
    console.error("Error starting mock interview:", error);
    res.status(500).json({ message: "Gagal memulai sesi wawancara latihan" });
  }
});

// Mendapatkan pertanyaan untuk mock interview tertentu
router.get("/mock-interviews/:id/questions", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    const questions = await interviewPreparationService.getMockInterviewQuestions(id);
    res.json(questions);
  } catch (error) {
    console.error("Error fetching mock interview questions:", error);
    res.status(500).json({ message: "Gagal mengambil pertanyaan wawancara latihan" });
  }
});

// Menambahkan pertanyaan ke mock interview
router.post("/mock-interviews/:id/questions", isAuthenticated, async (req, res) => {
  try {
    const mockInterviewId = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(mockInterviewId);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    const validatedData = insertMockInterviewQuestionSchema.parse({
      ...req.body,
      mockInterviewId
    });
    
    const newQuestion = await interviewPreparationService.addQuestionToMockInterview(validatedData);
    res.status(201).json(newQuestion);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
    }
    
    console.error("Error adding question to mock interview:", error);
    res.status(500).json({ message: "Gagal menambahkan pertanyaan ke wawancara latihan" });
  }
});

// Memperbarui respons pengguna dan evaluasi untuk pertanyaan
router.put("/mock-interviews/:interviewId/questions/:questionId", isAuthenticated, async (req, res) => {
  try {
    const mockInterviewId = parseInt(req.params.interviewId);
    const questionId = parseInt(req.params.questionId);
    
    const interview = await interviewPreparationService.getMockInterview(mockInterviewId);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    const updatedQuestion = await interviewPreparationService.updateMockInterviewQuestion(
      mockInterviewId,
      questionId,
      req.body
    );
    
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating mock interview question:", error);
    res.status(500).json({ message: "Gagal mengupdate pertanyaan wawancara latihan" });
  }
});

// Menyelesaikan sesi mock interview dan menghitung skor
router.post("/mock-interviews/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const interview = await interviewPreparationService.getMockInterview(id);
    
    if (!interview) {
      return res.status(404).json({ message: "Sesi wawancara latihan tidak ditemukan" });
    }
    
    // Periksa apakah sesi ini milik pengguna yang terotentikasi atau admin
    if (interview.userId !== req.user.id && req.user.type !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki akses ke sesi ini" });
    }
    
    const result = await interviewPreparationService.completeMockInterview(id);
    res.json(result);
  } catch (error) {
    console.error("Error completing mock interview:", error);
    res.status(500).json({ message: "Gagal menyelesaikan sesi wawancara latihan" });
  }
});

/**
 * === INTERVIEW PERFORMANCE ROUTES ===
 */

// Mendapatkan data performa wawancara pengguna
router.get("/performance", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const performance = await interviewPreparationService.getUserPerformance(userId);
    
    if (!performance) {
      return res.json({ message: "Belum ada data performa wawancara" });
    }
    
    res.json(performance);
  } catch (error) {
    console.error("Error fetching interview performance:", error);
    res.status(500).json({ message: "Gagal mengambil data performa wawancara" });
  }
});

/**
 * === INTERVIEW TIPS ROUTES ===
 */

// Mendapatkan daftar tips wawancara
router.get("/tips", async (req, res) => {
  try {
    const { category, difficultyLevel, targetIndustry, targetRole, limit, offset } = req.query;
    
    const tips = await interviewPreparationService.getInterviewTips({
      category: category as string,
      difficultyLevel: difficultyLevel as string,
      targetIndustry: targetIndustry as string,
      targetRole: targetRole as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });
    
    res.json(tips);
  } catch (error) {
    console.error("Error fetching interview tips:", error);
    res.status(500).json({ message: "Gagal mengambil tips wawancara" });
  }
});

// Mendapatkan tip wawancara berdasarkan ID
router.get("/tips/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tip = await interviewPreparationService.getInterviewTip(id);
    
    if (!tip) {
      return res.status(404).json({ message: "Tip tidak ditemukan" });
    }
    
    res.json(tip);
  } catch (error) {
    console.error("Error fetching interview tip:", error);
    res.status(500).json({ message: "Gagal mengambil tip wawancara" });
  }
});

// Membuat tip wawancara baru (hanya untuk admin)
router.post("/tips", isAdmin, async (req, res) => {
  try {
    const validatedData = insertInterviewTipSchema.parse({
      ...req.body,
      authorId: req.user.id
    });
    
    const newTip = await interviewPreparationService.createInterviewTip(validatedData);
    res.status(201).json(newTip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
    }
    
    console.error("Error creating interview tip:", error);
    res.status(500).json({ message: "Gagal membuat tip wawancara" });
  }
});

// Mengupdate tip wawancara (hanya untuk admin)
router.put("/tips/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validasi input
    const { targetIndustries, targetRoles, ...restData } = req.body;
    
    const updatedTip = await interviewPreparationService.updateInterviewTip(id, {
      ...restData,
      targetIndustries: Array.isArray(targetIndustries) ? targetIndustries : undefined,
      targetRoles: Array.isArray(targetRoles) ? targetRoles : undefined
    });
    
    if (!updatedTip) {
      return res.status(404).json({ message: "Tip tidak ditemukan" });
    }
    
    res.json(updatedTip);
  } catch (error) {
    console.error("Error updating interview tip:", error);
    res.status(500).json({ message: "Gagal mengupdate tip wawancara" });
  }
});

// Menghapus tip wawancara (hanya untuk admin)
router.delete("/tips/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedTip = await interviewPreparationService.deleteInterviewTip(id);
    
    if (!deletedTip) {
      return res.status(404).json({ message: "Tip tidak ditemukan" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting interview tip:", error);
    res.status(500).json({ message: "Gagal menghapus tip wawancara" });
  }
});

// Mendapatkan rekomendasi tips wawancara berdasarkan performa pengguna
router.get("/recommended-tips", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const tips = await interviewPreparationService.getRecommendedTips(userId, limit);
    res.json(tips);
  } catch (error) {
    console.error("Error fetching recommended tips:", error);
    res.status(500).json({ message: "Gagal mengambil rekomendasi tips wawancara" });
  }
});

export default router;