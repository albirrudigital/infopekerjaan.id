import { db } from "./db";
import { eq, desc, and, between } from "drizzle-orm";
import {
  interviewQuestions,
  mockInterviews,
  mockInterviewQuestions,
  interviewPerformance,
  interviewTips,
  InsertInterviewQuestion,
  InsertMockInterview,
  InsertMockInterviewQuestion,
  InsertInterviewPerformance,
  InsertInterviewTip,
  InterviewQuestion,
  MockInterview,
  MockInterviewQuestion,
  InterviewPerformance,
  InterviewTip
} from "@shared/schema";

/**
 * Service untuk mengelola Modul Persiapan Wawancara Cerdas
 */
export class InterviewPreparationService {
  /**
   * === INTERVIEW QUESTIONS MANAGEMENT ===
   */

  /**
   * Mendapatkan daftar pertanyaan wawancara dengan filter
   */
  async getInterviewQuestions(options?: {
    category?: string;
    difficulty?: string;
    industry?: string;
    jobRole?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select().from(interviewQuestions);
    
    if (options?.category) {
      query = query.where(eq(interviewQuestions.category, options.category));
    }
    
    if (options?.difficulty) {
      query = query.where(eq(interviewQuestions.difficulty, options.difficulty));
    }
    
    // Untuk industry dan jobRole, kita perlu menginspeksi array
    // Implementasi query tambahan jika diperlukan
    
    // Paginasi
    query = query.limit(options?.limit || 50).offset(options?.offset || 0);
    
    // Eksekusi query dan kembalikan hasilnya
    return await query;
  }

  /**
   * Mendapatkan pertanyaan wawancara berdasarkan ID
   */
  async getInterviewQuestion(id: number) {
    const [question] = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.id, id));
    
    return question;
  }

  /**
   * Membuat pertanyaan wawancara baru
   */
  async createInterviewQuestion(data: InsertInterviewQuestion) {
    const [question] = await db
      .insert(interviewQuestions)
      .values(data)
      .returning();
    
    return question;
  }

  /**
   * Mengupdate pertanyaan wawancara
   */
  async updateInterviewQuestion(id: number, data: Partial<InterviewQuestion>) {
    const [updatedQuestion] = await db
      .update(interviewQuestions)
      .set(data)
      .where(eq(interviewQuestions.id, id))
      .returning();
    
    return updatedQuestion;
  }

  /**
   * Menghapus pertanyaan wawancara
   */
  async deleteInterviewQuestion(id: number) {
    await db
      .delete(interviewQuestions)
      .where(eq(interviewQuestions.id, id));
    
    return true;
  }

  /**
   * Memverifikasi pertanyaan wawancara (hanya admin)
   */
  async verifyInterviewQuestion(id: number, verify: boolean = true) {
    const [updatedQuestion] = await db
      .update(interviewQuestions)
      .set({ isVerified: verify })
      .where(eq(interviewQuestions.id, id))
      .returning();
    
    return updatedQuestion;
  }

  /**
   * === MOCK INTERVIEW MANAGEMENT ===
   */

  /**
   * Mendapatkan sesi mock interview untuk pengguna tertentu
   */
  async getUserMockInterviews(userId: number) {
    return await db
      .select()
      .from(mockInterviews)
      .where(eq(mockInterviews.userId, userId))
      .orderBy(desc(mockInterviews.scheduledFor));
  }

  /**
   * Mendapatkan mock interview berdasarkan ID
   */
  async getMockInterview(id: number) {
    const [interview] = await db
      .select()
      .from(mockInterviews)
      .where(eq(mockInterviews.id, id));
    
    return interview;
  }

  /**
   * Membuat sesi mock interview baru
   */
  async createMockInterview(data: InsertMockInterview) {
    const [interview] = await db
      .insert(mockInterviews)
      .values(data)
      .returning();
    
    return interview;
  }

  /**
   * Mengupdate sesi mock interview
   */
  async updateMockInterview(id: number, data: Partial<MockInterview>) {
    const [updatedInterview] = await db
      .update(mockInterviews)
      .set(data)
      .where(eq(mockInterviews.id, id))
      .returning();
    
    return updatedInterview;
  }

  /**
   * Menghapus sesi mock interview
   */
  async deleteMockInterview(id: number) {
    await db
      .delete(mockInterviews)
      .where(eq(mockInterviews.id, id));
    
    return true;
  }

  /**
   * Mendapatkan pertanyaan untuk mock interview tertentu
   */
  async getMockInterviewQuestions(mockInterviewId: number) {
    return await db
      .select({
        miq: mockInterviewQuestions,
        q: interviewQuestions
      })
      .from(mockInterviewQuestions)
      .innerJoin(
        interviewQuestions,
        eq(mockInterviewQuestions.questionId, interviewQuestions.id)
      )
      .where(eq(mockInterviewQuestions.mockInterviewId, mockInterviewId))
      .orderBy(mockInterviewQuestions.order);
  }

  /**
   * Menambahkan pertanyaan ke mock interview
   */
  async addQuestionToMockInterview(data: InsertMockInterviewQuestion) {
    const [mockInterviewQuestion] = await db
      .insert(mockInterviewQuestions)
      .values(data)
      .returning();
    
    return mockInterviewQuestion;
  }

  /**
   * Memperbarui respons pengguna dan evaluasi untuk pertanyaan mock interview
   */
  async updateMockInterviewQuestion(
    mockInterviewId: number,
    questionId: number,
    data: Partial<MockInterviewQuestion>
  ) {
    const [updatedQuestion] = await db
      .update(mockInterviewQuestions)
      .set(data)
      .where(
        and(
          eq(mockInterviewQuestions.mockInterviewId, mockInterviewId),
          eq(mockInterviewQuestions.questionId, questionId)
        )
      )
      .returning();
    
    return updatedQuestion;
  }

  /**
   * Memulai sesi mock interview
   */
  async startMockInterview(id: number) {
    const mockInterview = await this.getMockInterview(id);
    
    if (!mockInterview) {
      throw new Error("Mock interview tidak ditemukan");
    }
    
    // Memperbarui status jika diperlukan
    
    // Secara otomatis menghasilkan set pertanyaan berdasarkan pengaturan sesi
    // Ini contoh sederhana, implementasi sebenarnya akan lebih kompleks
    const questions = await this.getInterviewQuestions({
      limit: mockInterview.questionCount,
      // Tambahkan filter berdasarkan jobRoleTarget, dll.
    });
    
    // Tambahkan pertanyaan ke sesi mock interview
    for (let i = 0; i < questions.length; i++) {
      await this.addQuestionToMockInterview({
        mockInterviewId: id,
        questionId: questions[i].id,
        order: i + 1
      });
    }
    
    return this.getMockInterview(id);
  }

  /**
   * Menyelesaikan sesi mock interview dan menghitung skor
   */
  async completeMockInterview(id: number) {
    const mockInterview = await this.getMockInterview(id);
    
    if (!mockInterview) {
      throw new Error("Mock interview tidak ditemukan");
    }
    
    const mockInterviewQuestions = await this.getMockInterviewQuestions(id);
    
    // Menghitung skor dan statistik
    let totalScore = 0;
    let responseTimes = 0;
    
    mockInterviewQuestions.forEach(item => {
      if (item.miq.score) {
        totalScore += item.miq.score;
      }
      
      if (item.miq.responseTimeSec) {
        responseTimes += item.miq.responseTimeSec;
      }
    });
    
    const averageScore = totalScore / mockInterviewQuestions.length;
    const averageResponseTime = responseTimes / mockInterviewQuestions.length;
    
    // Memperbarui status sesi
    await this.updateMockInterview(id, {
      status: "completed"
    });
    
    // Memperbarui performa wawancara pengguna
    await this.updatePerformance(mockInterview.userId, {
      averageScore,
      responseTimeAvg: averageResponseTime
      // Tambahkan metrik lain seperti kekuatan dan area perbaikan
    });
    
    return {
      interview: await this.getMockInterview(id),
      performance: {
        averageScore,
        averageResponseTime
      }
    };
  }

  /**
   * === INTERVIEW PERFORMANCE MANAGEMENT ===
   */

  /**
   * Mendapatkan data performa wawancara pengguna
   */
  async getUserPerformance(userId: number) {
    const [performance] = await db
      .select()
      .from(interviewPerformance)
      .where(eq(interviewPerformance.userId, userId));
    
    return performance;
  }

  /**
   * Memperbarui data performa wawancara pengguna
   */
  async updatePerformance(userId: number, data: Partial<InterviewPerformance>) {
    // Cek apakah data performa sudah ada
    const existingPerformance = await this.getUserPerformance(userId);
    
    if (existingPerformance) {
      // Update data yang sudah ada
      const [updatedPerformance] = await db
        .update(interviewPerformance)
        .set({
          ...data,
          totalInterviews: existingPerformance.totalInterviews + 1,
          lastUpdated: new Date()
        })
        .where(eq(interviewPerformance.userId, userId))
        .returning();
      
      return updatedPerformance;
    } else {
      // Buat data performa baru
      const [newPerformance] = await db
        .insert(interviewPerformance)
        .values({
          userId,
          totalInterviews: 1,
          ...data
        })
        .returning();
      
      return newPerformance;
    }
  }

  /**
   * === INTERVIEW TIPS MANAGEMENT ===
   */

  /**
   * Mendapatkan daftar tips wawancara dengan filter
   */
  async getInterviewTips(options?: {
    category?: string;
    difficultyLevel?: string;
    targetIndustry?: string;
    targetRole?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select().from(interviewTips).where(eq(interviewTips.isActive, true));
    
    if (options?.category) {
      query = query.where(eq(interviewTips.category, options.category));
    }
    
    if (options?.difficultyLevel) {
      query = query.where(eq(interviewTips.difficultyLevel, options.difficultyLevel));
    }
    
    // Filter tambahan untuk targetIndustry dan targetRole jika diperlukan
    
    // Paginasi
    query = query.limit(options?.limit || 50).offset(options?.offset || 0);
    
    // Eksekusi query dan kembalikan hasilnya
    return await query;
  }

  /**
   * Mendapatkan tip wawancara berdasarkan ID
   */
  async getInterviewTip(id: number) {
    const [tip] = await db
      .select()
      .from(interviewTips)
      .where(eq(interviewTips.id, id));
    
    return tip;
  }

  /**
   * Membuat tip wawancara baru
   */
  async createInterviewTip(data: InsertInterviewTip) {
    const [tip] = await db
      .insert(interviewTips)
      .values(data)
      .returning();
    
    return tip;
  }

  /**
   * Mengupdate tip wawancara
   */
  async updateInterviewTip(id: number, data: Partial<InterviewTip>) {
    const [updatedTip] = await db
      .update(interviewTips)
      .set(data)
      .where(eq(interviewTips.id, id))
      .returning();
    
    return updatedTip;
  }

  /**
   * Menghapus tip wawancara
   */
  async deleteInterviewTip(id: number) {
    // Soft delete dengan mengubah isActive menjadi false
    const [deactivatedTip] = await db
      .update(interviewTips)
      .set({ isActive: false })
      .where(eq(interviewTips.id, id))
      .returning();
    
    return deactivatedTip;
  }

  /**
   * Mendapatkan rekomendasi tips wawancara berdasarkan performa pengguna
   */
  async getRecommendedTips(userId: number, limit: number = 5) {
    // Dapatkan performa wawancara pengguna
    const performance = await this.getUserPerformance(userId);
    
    if (!performance) {
      // Jika belum ada data performa, berikan tips umum
      return this.getInterviewTips({
        category: "preparation",
        limit
      });
    }
    
    // Dapatkan tips yang fokus pada area yang perlu ditingkatkan
    // Ini contoh sederhana, implementasi sebenarnya akan lebih kompleks
    let targetCategories = [];
    
    // Cek skor teknis
    if (performance.technicalScore && performance.technicalScore < 70) {
      targetCategories.push("technical");
    }
    
    // Cek skor perilaku
    if (performance.behavioralScore && performance.behavioralScore < 70) {
      targetCategories.push("behavioral");
    }
    
    // Jika tidak ada area spesifik yang perlu ditingkatkan, berikan tips umum
    if (targetCategories.length === 0) {
      targetCategories.push("preparation");
    }
    
    // Dapatkan tips berdasarkan kategori
    let tips = [];
    for (const category of targetCategories) {
      const categoryTips = await this.getInterviewTips({
        category,
        limit: Math.floor(limit / targetCategories.length)
      });
      
      tips = [...tips, ...categoryTips];
    }
    
    return tips.slice(0, limit);
  }
}

export const interviewPreparationService = new InterviewPreparationService();