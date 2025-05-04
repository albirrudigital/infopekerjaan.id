import { db } from '../db';
import { lowongan, premium_subscriptions, premium_features, user_premium_features, job_applications, analytics_metrics, users } from '@shared/schema';
import { eq, and, or, gte, lte, sql } from 'drizzle-orm';
import { Redis } from 'ioredis';
import { sendEmail } from '../utils/email';
import { sendNotification } from '../utils/notification';
import { getJobRecommendations } from '../utils/ai';
import { generateJobFairEvent } from '../utils/job-fair';
import { createMobileAppNotification } from '../utils/mobile';

export class JobPostingService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  public async createJobPosting(userId: number, data: {
    perusahaan: string;
    posisi: string;
    lokasi: string;
    deskripsi: string;
    kualifikasi: string;
    batas_lamaran: Date;
  }) {
    // Check if user has active premium subscription
    const subscription = await db.query.premium_subscriptions.findFirst({
      where: and(
        eq(premium_subscriptions.user_id, userId),
        eq(premium_subscriptions.status, 'active'),
        gte(premium_subscriptions.end_date, new Date())
      )
    });

    if (!subscription) {
      throw new Error('User does not have an active premium subscription');
    }

    const [job] = await db.insert(lowongan).values({
      ...data,
      created_by: userId,
      status: 'draft'
    }).returning();

    return job;
  }

  public async updateJobPosting(userId: number, jobId: number, data: Partial<typeof lowongan.$inferInsert>) {
    const [job] = await db.update(lowongan)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(and(
        eq(lowongan.id, jobId),
        eq(lowongan.created_by, userId)
      ))
      .returning();

    return job;
  }

  public async getJobPostings(userId: number) {
    return await db.query.lowongan.findMany({
      where: eq(lowongan.created_by, userId),
      with: {
        applications: {
          select: {
            id: true
          }
        }
      }
    });
  }

  public async getJobPosting(userId: number, jobId: number) {
    return await db.query.lowongan.findFirst({
      where: and(
        eq(lowongan.id, jobId),
        eq(lowongan.created_by, userId)
      ),
      with: {
        applications: {
          select: {
            id: true
          }
        }
      }
    });
  }

  public async deleteJobPosting(userId: number, jobId: number) {
    await db.delete(lowongan)
      .where(and(
        eq(lowongan.id, jobId),
        eq(lowongan.created_by, userId)
      ));
  }

  public async publishJobPosting(userId: number, jobId: number) {
    const job = await this.getJobPosting(userId, jobId);
    if (!job) {
      throw new Error('Job posting not found');
    }

    // Check if user has active premium subscription
    const subscription = await db.query.premium_subscriptions.findFirst({
      where: and(
        eq(premium_subscriptions.user_id, userId),
        eq(premium_subscriptions.status, 'active'),
        gte(premium_subscriptions.end_date, new Date())
      )
    });

    if (!subscription) {
      throw new Error('User does not have an active premium subscription');
    }

    const [updatedJob] = await db.update(lowongan)
      .set({
        status: 'active',
        updated_at: new Date()
      })
      .where(and(
        eq(lowongan.id, jobId),
        eq(lowongan.created_by, userId)
      ))
      .returning();

    return updatedJob;
  }

  public async unpublishJobPosting(userId: number, jobId: number) {
    const [job] = await db.update(lowongan)
      .set({
        status: 'draft',
        updated_at: new Date()
      })
      .where(and(
        eq(lowongan.id, jobId),
        eq(lowongan.created_by, userId)
      ))
      .returning();

    return job;
  }

  public async incrementJobViews(jobId: number) {
    const key = `job:${jobId}:views`;
    await this.redis.incr(key);
  }

  public async getJobViews(jobId: number) {
    const key = `job:${jobId}:views`;
    const views = await this.redis.get(key);
    return parseInt(views || '0');
  }

  public async getPremiumFeatures(userId: number) {
    const subscription = await db.query.premium_subscriptions.findFirst({
      where: and(
        eq(premium_subscriptions.user_id, userId),
        eq(premium_subscriptions.status, 'active'),
        gte(premium_subscriptions.end_date, new Date())
      )
    });

    if (!subscription) {
      return [];
    }

    return await db.query.premium_features.findMany({
      where: eq(premium_features.plan_type, subscription.plan_type),
      with: {
        user_features: {
          where: eq(user_premium_features.user_id, userId)
        }
      }
    });
  }

  public async checkJobPostingLimit(userId: number) {
    const subscription = await db.query.premium_subscriptions.findFirst({
      where: and(
        eq(premium_subscriptions.user_id, userId),
        eq(premium_subscriptions.status, 'active'),
        gte(premium_subscriptions.end_date, new Date())
      )
    });

    if (!subscription) {
      throw new Error('User does not have an active premium subscription');
    }

    const activeJobs = await db.query.lowongan.findMany({
      where: and(
        eq(lowongan.created_by, userId),
        eq(lowongan.status, 'active')
      )
    });

    let limit = 1; // Default limit for basic plan
    if (subscription.plan_type === 'premium') {
      limit = 5;
    } else if (subscription.plan_type === 'enterprise') {
      limit = 20;
    }

    if (activeJobs.length >= limit) {
      throw new Error(`You have reached the maximum number of active job postings for your plan (${limit})`);
    }

    return true;
  }

  public async checkExpiringJobs() {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringJobs = await db.query.lowongan.findMany({
      where: and(
        eq(lowongan.status, 'active'),
        lte(lowongan.batas_lamaran, threeDaysFromNow),
        gte(lowongan.batas_lamaran, new Date())
      ),
      with: {
        created_by_user: true
      }
    });

    for (const job of expiringJobs) {
      await sendEmail({
        to: job.created_by_user.email,
        subject: `Lowongan Anda akan segera berakhir: ${job.posisi}`,
        html: `
          <h2>Lowongan Anda akan segera berakhir</h2>
          <p>Lowongan "${job.posisi}" akan berakhir dalam 3 hari.</p>
          <p>Anda dapat memperpanjang masa aktif lowongan ini atau membuat lowongan baru.</p>
          <a href="${process.env.FRONTEND_URL}/job-postings/${job.id}">Lihat Lowongan</a>
        `
      });

      await sendNotification({
        userId: job.created_by,
        title: 'Lowongan Akan Berakhir',
        message: `Lowongan "${job.posisi}" akan berakhir dalam 3 hari.`,
        type: 'job_expiry'
      });
    }
  }

  public async boostJobPosting(userId: number, jobId: number, boostType: 'standard' | 'premium' | 'enterprise') {
    const job = await this.getJobPosting(userId, jobId);
    if (!job) {
      throw new Error('Job posting not found');
    }

    const boostConfig = {
      standard: { duration: 24, multiplier: 1.5 },
      premium: { duration: 72, multiplier: 2.5 },
      enterprise: { duration: 168, multiplier: 4 }
    };

    const config = boostConfig[boostType];
    const boostKey = `job:${jobId}:boost`;
    
    await this.redis.set(boostKey, JSON.stringify({
      type: boostType,
      multiplier: config.multiplier,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + config.duration * 3600000).toISOString()
    }), 'EX', config.duration * 3600);

    return {
      success: true,
      message: `Job posting boosted with ${boostType} package for ${config.duration} hours`,
      boostDetails: config
    };
  }

  public async getJobAnalytics(jobId: number) {
    const views = await this.getJobViews(jobId);
    const applications = await db.query.job_applications.findMany({
      where: eq(job_applications.job_id, jobId)
    });

    const trafficSources = await this.redis.hgetall(`job:${jobId}:traffic`);
    const dailyViews = await this.redis.hgetall(`job:${jobId}:daily_views`);

    return {
      totalViews: views,
      totalApplications: applications.length,
      trafficSources,
      dailyViews
    };
  }

  public async broadcastJobToCandidates(jobId: number) {
    const job = await db.query.lowongan.findFirst({
      where: eq(lowongan.id, jobId)
    });

    if (!job) {
      throw new Error('Job posting not found');
    }

    // Get active job seekers with matching skills
    const matchingCandidates = await getJobRecommendations(jobId);

    for (const candidate of matchingCandidates) {
      await sendEmail({
        to: candidate.email,
        subject: `Lowongan Baru yang Cocok untuk Anda: ${job.posisi}`,
        html: `
          <h2>Lowongan Baru yang Cocok untuk Anda</h2>
          <p>Kami menemukan lowongan yang mungkin cocok dengan profil Anda:</p>
          <h3>${job.posisi} di ${job.perusahaan}</h3>
          <p>${job.deskripsi.substring(0, 200)}...</p>
          <a href="${process.env.FRONTEND_URL}/jobs/${job.id}">Lihat Lowongan</a>
        `
      });

      await sendNotification({
        userId: candidate.id,
        title: 'Lowongan Baru yang Cocok',
        message: `Lowongan "${job.posisi}" mungkin cocok untuk Anda.`,
        type: 'job_match'
      });
    }
  }

  public async getJobSuggestions(jobId: number) {
    const job = await db.query.lowongan.findFirst({
      where: eq(lowongan.id, jobId)
    });

    if (!job) {
      throw new Error('Job posting not found');
    }

    // Get similar successful job postings
    const similarJobs = await db.query.lowongan.findMany({
      where: and(
        eq(lowongan.status, 'active'),
        sql`MATCH(posisi, deskripsi) AGAINST(${job.posisi} IN NATURAL LANGUAGE MODE)`
      ),
      limit: 5
    });

    // Analyze successful job postings
    const suggestions = {
      recommendedSkills: [],
      suggestedCategories: [],
      optimizationTips: []
    };

    // Add AI-driven suggestions based on similar successful jobs
    for (const similarJob of similarJobs) {
      // Analyze skills and categories
      const skills = similarJob.kualifikasi.split(',').map(s => s.trim());
      suggestions.recommendedSkills.push(...skills);

      // Add optimization tips
      if (similarJob.deskripsi.length > job.deskripsi.length) {
        suggestions.optimizationTips.push('Pertimbangkan untuk menambahkan detail lebih lanjut tentang tanggung jawab dan kualifikasi');
      }
    }

    return suggestions;
  }

  public async handleAutoExpiry() {
    const expiringJobs = await db.query.lowongan.findMany({
      where: and(
        eq(lowongan.status, 'active'),
        lte(lowongan.batas_lamaran, new Date())
      ),
      with: {
        created_by_user: true
      }
    });

    for (const job of expiringJobs) {
      // Update job status to expired
      await db.update(lowongan)
        .set({ status: 'expired' })
        .where(eq(lowongan.id, job.id));

      // Send notifications
      await this.sendExpiryNotifications(job);
    }
  }

  private async sendExpiryNotifications(job: any) {
    // Email notification
    await sendEmail({
      to: job.created_by_user.email,
      subject: `Lowongan Anda telah berakhir: ${job.posisi}`,
      html: `
        <h2>Lowongan Anda telah berakhir</h2>
        <p>Lowongan "${job.posisi}" telah berakhir pada ${job.batas_lamaran}.</p>
        <p>Anda dapat memperpanjang masa aktif lowongan ini atau membuat lowongan baru.</p>
        <a href="${process.env.FRONTEND_URL}/job-postings/${job.id}">Lihat Lowongan</a>
      `
    });

    // Mobile app notification
    await createMobileAppNotification({
      userId: job.created_by,
      title: 'Lowongan Telah Berakhir',
      message: `Lowongan "${job.posisi}" telah berakhir.`,
      type: 'job_expired',
      data: { jobId: job.id }
    });
  }

  public async getAdvancedJobAnalytics(jobId: number) {
    const views = await this.getJobViews(jobId);
    const applications = await db.query.job_applications.findMany({
      where: eq(job_applications.job_id, jobId)
    });

    // Get detailed traffic sources
    const trafficSources = await this.redis.hgetall(`job:${jobId}:traffic`);
    const dailyViews = await this.redis.hgetall(`job:${jobId}:daily_views`);
    const deviceTypes = await this.redis.hgetall(`job:${jobId}:devices`);
    const locations = await this.redis.hgetall(`job:${jobId}:locations`);

    // Get application funnel data
    const funnelData = {
      views: views,
      applications: applications.length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      interviewed: applications.filter(a => a.status === 'interviewed').length,
      hired: applications.filter(a => a.status === 'hired').length
    };

    // Get candidate demographics
    const candidateDemographics = await this.getCandidateDemographics(jobId);

    return {
      overview: {
        totalViews: views,
        totalApplications: applications.length,
        conversionRate: views > 0 ? (applications.length / views) * 100 : 0
      },
      traffic: {
        sources: trafficSources,
        dailyViews,
        deviceTypes,
        locations
      },
      funnel: funnelData,
      demographics: candidateDemographics
    };
  }

  private async getCandidateDemographics(jobId: number) {
    const applications = await db.query.job_applications.findMany({
      where: eq(job_applications.job_id, jobId),
      with: {
        user: true
      }
    });

    const demographics = {
      education: {},
      experience: {},
      skills: {},
      locations: {}
    };

    for (const app of applications) {
      // Analyze education levels
      const education = app.user.education || [];
      for (const edu of education) {
        demographics.education[edu.degree] = (demographics.education[edu.degree] || 0) + 1;
      }

      // Analyze experience levels
      const experience = app.user.experience || [];
      for (const exp of experience) {
        const years = exp.years || 0;
        const level = this.getExperienceLevel(years);
        demographics.experience[level] = (demographics.experience[level] || 0) + 1;
      }

      // Analyze skills
      const skills = app.user.skills || [];
      for (const skill of skills) {
        demographics.skills[skill] = (demographics.skills[skill] || 0) + 1;
      }

      // Analyze locations
      demographics.locations[app.user.location] = (demographics.locations[app.user.location] || 0) + 1;
    }

    return demographics;
  }

  private getExperienceLevel(years: number): string {
    if (years < 2) return 'Entry Level';
    if (years < 5) return 'Mid Level';
    if (years < 10) return 'Senior Level';
    return 'Expert Level';
  }

  public async createJobFairEvent(data: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    maxParticipants: number;
    features: string[];
  }) {
    const event = await generateJobFairEvent(data);
    
    // Create virtual event rooms
    const rooms = await this.createVirtualRooms(event.id, data.maxParticipants);
    
    return {
      ...event,
      rooms
    };
  }

  private async createVirtualRooms(eventId: number, maxParticipants: number) {
    const rooms = [];
    const roomCount = Math.ceil(maxParticipants / 50); // 50 participants per room

    for (let i = 0; i < roomCount; i++) {
      const room = {
        id: `${eventId}-${i}`,
        name: `Room ${i + 1}`,
        capacity: 50,
        participants: []
      };
      rooms.push(room);
    }

    return rooms;
  }

  public async enhanceJobMatching(jobId: number) {
    const job = await db.query.lowongan.findFirst({
      where: eq(lowongan.id, jobId)
    });

    if (!job) {
      throw new Error('Job posting not found');
    }

    // Get similar successful jobs
    const similarJobs = await db.query.lowongan.findMany({
      where: and(
        eq(lowongan.status, 'active'),
        sql`MATCH(posisi, deskripsi) AGAINST(${job.posisi} IN NATURAL LANGUAGE MODE)`
      ),
      limit: 5
    });

    // Analyze job requirements
    const requirements = this.analyzeJobRequirements(job);
    
    // Get matching candidates with enhanced scoring
    const candidates = await this.getEnhancedMatchingCandidates(requirements);

    return {
      jobAnalysis: {
        requirements,
        similarJobs: similarJobs.map(j => ({
          id: j.id,
          posisi: j.posisi,
          matchScore: this.calculateJobMatchScore(job, j)
        }))
      },
      matchingCandidates: candidates
    };
  }

  private analyzeJobRequirements(job: any) {
    return {
      skills: job.kualifikasi.split(',').map(s => s.trim()),
      experience: this.extractExperience(job.deskripsi),
      education: this.extractEducation(job.deskripsi),
      softSkills: this.extractSoftSkills(job.deskripsi)
    };
  }

  private async getEnhancedMatchingCandidates(requirements: any) {
    const candidates = await db.query.users.findMany({
      where: eq(users.role, 'jobseeker')
    });

    return candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      matchScore: this.calculateCandidateMatchScore(candidate, requirements),
      matchingSkills: this.findMatchingSkills(candidate, requirements.skills),
      experienceMatch: this.calculateExperienceMatch(candidate, requirements.experience)
    }));
  }

  private calculateCandidateMatchScore(candidate: any, requirements: any): number {
    let score = 0;
    
    // Skill matching
    const matchingSkills = this.findMatchingSkills(candidate, requirements.skills);
    score += (matchingSkills.length / requirements.skills.length) * 40;

    // Experience matching
    score += this.calculateExperienceMatch(candidate, requirements.experience) * 30;

    // Education matching
    score += this.calculateEducationMatch(candidate, requirements.education) * 20;

    // Soft skills matching
    score += this.calculateSoftSkillsMatch(candidate, requirements.softSkills) * 10;

    return Math.min(100, score);
  }

  private findMatchingSkills(candidate: any, requiredSkills: string[]): string[] {
    const candidateSkills = candidate.skills || [];
    return requiredSkills.filter(skill => 
      candidateSkills.some(cs => 
        cs.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(cs.toLowerCase())
      )
    );
  }

  private calculateExperienceMatch(candidate: any, requiredExperience: any): number {
    const candidateExperience = candidate.experience || [];
    const totalYears = candidateExperience.reduce((sum: number, exp: any) => 
      sum + (exp.years || 0), 0
    );
    
    return Math.min(1, totalYears / (requiredExperience.minYears || 1));
  }

  private calculateEducationMatch(candidate: any, requiredEducation: any): number {
    const candidateEducation = candidate.education || [];
    const hasRequiredDegree = candidateEducation.some(edu => 
      edu.degree === requiredEducation.degree
    );
    
    return hasRequiredDegree ? 1 : 0;
  }

  private calculateSoftSkillsMatch(candidate: any, requiredSoftSkills: string[]): number {
    const candidateSoftSkills = candidate.softSkills || [];
    const matchingSkills = requiredSoftSkills.filter(skill => 
      candidateSoftSkills.includes(skill)
    );
    
    return matchingSkills.length / requiredSoftSkills.length;
  }
} 