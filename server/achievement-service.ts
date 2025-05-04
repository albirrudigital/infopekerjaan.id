import { db } from "./db";
import { achievementEvents, users, jobs, applications, jobseekerProfiles } from "@shared/schema";
import { eq, count, and, gte, gt } from "drizzle-orm";

// Define achievement types
export enum AchievementType {
  PROFILE_COMPLETION = "profile_completion",
  APPLICATION_MILESTONE = "application_milestone",
  JOB_POSTING_MILESTONE = "job_posting_milestone",
  PLATFORM_ENGAGEMENT = "platform_engagement",
  RESPONSE_RATE = "response_rate",
  APPLICATION_QUALITY = "application_quality",
  INTERVIEW_SUCCESS = "interview_success",
  NETWORKING_CHAMPION = "networking_champion",
  SKILL_BUILDER = "skill_builder",
  MENTOR_BADGE = "mentor_badge"
}

// Define level thresholds
export const ACHIEVEMENT_LEVELS = {
  [AchievementType.PROFILE_COMPLETION]: {
    bronze: 50,   // % profile completion
    silver: 75,
    gold: 90,
    platinum: 100
  },
  [AchievementType.APPLICATION_MILESTONE]: {
    bronze: 5,    // # of applications
    silver: 15,
    gold: 30,
    platinum: 50
  },
  [AchievementType.JOB_POSTING_MILESTONE]: {
    bronze: 3,    // # of job postings
    silver: 10,
    gold: 20,
    platinum: 30
  },
  [AchievementType.PLATFORM_ENGAGEMENT]: {
    bronze: 7,    // days active
    silver: 30,
    gold: 90,
    platinum: 180
  },
  [AchievementType.RESPONSE_RATE]: {
    bronze: 50,   // % response rate
    silver: 70,
    gold: 85,
    platinum: 95
  },
  [AchievementType.APPLICATION_QUALITY]: {
    bronze: 1,    // # of shortlisted applications
    silver: 5,
    gold: 10,
    platinum: 20
  },
  [AchievementType.INTERVIEW_SUCCESS]: {
    bronze: 1,    // # of interview calls
    silver: 3,
    gold: 5,
    platinum: 10
  },
  [AchievementType.NETWORKING_CHAMPION]: {
    bronze: 3,    // # of connections/follows
    silver: 10,
    gold: 20,
    platinum: 50
  },
  [AchievementType.SKILL_BUILDER]: {
    bronze: 1,    // # of skills added
    silver: 5,
    gold: 10,
    platinum: 15
  },
  [AchievementType.MENTOR_BADGE]: {
    bronze: 3,    // # of feedback provided
    silver: 10,
    gold: 20,
    platinum: 30
  }
};

// Achievement metadata with friendly names and descriptions
export const ACHIEVEMENT_METADATA = {
  [AchievementType.PROFILE_COMPLETION]: {
    id: "profile-master",
    name: "Profile Master",
    description: {
      bronze: "Melengkapi 50% profil Anda",
      silver: "Melengkapi 75% profil Anda",
      gold: "Melengkapi 90% profil Anda",
      platinum: "Melengkapi 100% profil Anda"
    },
    icon: "user-check"
  },
  [AchievementType.APPLICATION_MILESTONE]: {
    id: "application-hunter",
    name: "Application Hunter",
    description: {
      bronze: "Mengirim 5 lamaran pekerjaan",
      silver: "Mengirim 15 lamaran pekerjaan",
      gold: "Mengirim 30 lamaran pekerjaan",
      platinum: "Mengirim 50 lamaran pekerjaan"
    },
    icon: "send"
  },
  [AchievementType.JOB_POSTING_MILESTONE]: {
    id: "job-creator",
    name: "Job Creator",
    description: {
      bronze: "Posting 3 lowongan pekerjaan",
      silver: "Posting 10 lowongan pekerjaan",
      gold: "Posting 20 lowongan pekerjaan",
      platinum: "Posting 30 lowongan pekerjaan"
    },
    icon: "briefcase"
  },
  [AchievementType.PLATFORM_ENGAGEMENT]: {
    id: "platform-enthusiast",
    name: "Platform Enthusiast",
    description: {
      bronze: "Aktif di platform selama 7 hari",
      silver: "Aktif di platform selama 30 hari",
      gold: "Aktif di platform selama 90 hari",
      platinum: "Aktif di platform selama 180 hari"
    },
    icon: "calendar"
  },
  [AchievementType.RESPONSE_RATE]: {
    id: "responsive-employer",
    name: "Responsive Employer",
    description: {
      bronze: "Merespon 50% dari semua lamaran",
      silver: "Merespon 70% dari semua lamaran",
      gold: "Merespon 85% dari semua lamaran",
      platinum: "Merespon 95% dari semua lamaran"
    },
    icon: "message-circle"
  },
  [AchievementType.APPLICATION_QUALITY]: {
    id: "quality-applications",
    name: "Quality Applicant",
    description: {
      bronze: "1 lamaran masuk tahap shortlisted",
      silver: "5 lamaran masuk tahap shortlisted",
      gold: "10 lamaran masuk tahap shortlisted",
      platinum: "20 lamaran masuk tahap shortlisted"
    },
    icon: "award"
  },
  [AchievementType.INTERVIEW_SUCCESS]: {
    id: "interview-ace",
    name: "Interview Ace",
    description: {
      bronze: "Mendapatkan 1 panggilan interview",
      silver: "Mendapatkan 3 panggilan interview",
      gold: "Mendapatkan 5 panggilan interview",
      platinum: "Mendapatkan 10 panggilan interview"
    },
    icon: "phone-call"
  },
  [AchievementType.NETWORKING_CHAMPION]: {
    id: "networking-champion",
    name: "Networking Champion",
    description: {
      bronze: "Membangun 3 koneksi profesional",
      silver: "Membangun 10 koneksi profesional",
      gold: "Membangun 20 koneksi profesional",
      platinum: "Membangun 50 koneksi profesional"
    },
    icon: "users"
  },
  [AchievementType.SKILL_BUILDER]: {
    id: "skill-builder",
    name: "Skill Builder",
    description: {
      bronze: "Menambahkan 1 keterampilan baru",
      silver: "Menambahkan 5 keterampilan baru",
      gold: "Menambahkan 10 keterampilan baru",
      platinum: "Menambahkan 15 keterampilan baru"
    },
    icon: "book"
  },
  [AchievementType.MENTOR_BADGE]: {
    id: "mentor-badge",
    name: "Mentor Badge",
    description: {
      bronze: "Memberikan 3 feedback berkualitas",
      silver: "Memberikan 10 feedback berkualitas",
      gold: "Memberikan 20 feedback berkualitas",
      platinum: "Memberikan 30 feedback berkualitas"
    },
    icon: "star"
  }
};

export class AchievementService {
  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: number) {
    return db
      .select()
      .from(achievementEvents)
      .where(eq(achievementEvents.userId, userId))
      .orderBy(achievementEvents.unlockedAt);
  }

  /**
   * Get achievement counts by level for a user
   */
  async getUserAchievementCounts(userId: number) {
    const userAchievements = await this.getUserAchievements(userId);
    
    const counts = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      total: userAchievements.length
    };
    
    userAchievements.forEach(achievement => {
      counts[achievement.achievementLevel as keyof typeof counts] += 1;
    });
    
    return counts;
  }

  /**
   * Check and award profile completion achievement
   */
  async checkProfileCompletion(userId: number, profileCompletionPercent: number) {
    const type = AchievementType.PROFILE_COMPLETION;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (profileCompletionPercent >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (profileCompletionPercent >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (profileCompletionPercent >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (profileCompletionPercent >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check and award application milestone achievement
   */
  async checkApplicationMilestone(userId: number) {
    const type = AchievementType.APPLICATION_MILESTONE;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Count user's applications
    const [result] = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.jobseekerId, userId));
    
    const applicationCount = Number(result.count);
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (applicationCount >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (applicationCount >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (applicationCount >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (applicationCount >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check and award job posting milestone achievement
   */
  async checkJobPostingMilestone(userId: number) {
    const type = AchievementType.JOB_POSTING_MILESTONE;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Count user's job postings
    const [result] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.postedBy, userId));
    
    const jobCount = Number(result.count);
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (jobCount >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (jobCount >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (jobCount >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (jobCount >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check application quality achievement (shortlisted applications)
   */
  async checkApplicationQuality(userId: number) {
    const type = AchievementType.APPLICATION_QUALITY;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Count user's shortlisted applications
    const [result] = await db
      .select({ count: count() })
      .from(applications)
      .where(
        and(
          eq(applications.jobseekerId, userId),
          eq(applications.status, "shortlisted")
        )
      );
    
    const shortlistedCount = Number(result.count);
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (shortlistedCount >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (shortlistedCount >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (shortlistedCount >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (shortlistedCount >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check and award networking champion achievement
   */
  async checkNetworkingChampion(userId: number) {
    const type = AchievementType.NETWORKING_CHAMPION;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Placeholder: Count connections from the database
    // Note: This is a simplified implementation. In the real implementation, we
    // would count connections from a dedicated connections or follows table
    // For now, this will always return 0 since the feature doesn't exist yet
    let connectionCount = 0;
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (connectionCount >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (connectionCount >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (connectionCount >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (connectionCount >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check and award skill builder achievement
   */
  async checkSkillBuilder(userId: number) {
    const type = AchievementType.SKILL_BUILDER;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Count skills from user's profile
    // Check if the user has a jobseeker profile
    const profile = await db
      .select()
      .from(jobseekerProfiles)
      .where(eq(jobseekerProfiles.userId, userId))
      .limit(1);
    
    // Count skills if the profile exists and has skills listed
    let skillCount = 0;
    if (profile.length > 0 && profile[0].skills) {
      skillCount = profile[0].skills.length;
    }
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (skillCount >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (skillCount >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (skillCount >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (skillCount >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check and award mentor badge achievement
   */
  async checkMentorBadge(userId: number) {
    const type = AchievementType.MENTOR_BADGE;
    const thresholds = ACHIEVEMENT_LEVELS[type];
    const metadata = ACHIEVEMENT_METADATA[type];
    
    // Placeholder: Count feedback provided by this employer
    // Note: This is a simplified implementation. In the real implementation, we
    // would count feedback from a feedback or application_feedback table
    // For now, this will always return 0 since the feature doesn't exist yet
    let feedbackCount = 0;
    
    // Find highest level achieved
    let highestLevelAchieved: null | string = null;
    
    if (feedbackCount >= thresholds.platinum) {
      highestLevelAchieved = 'platinum';
    } else if (feedbackCount >= thresholds.gold) {
      highestLevelAchieved = 'gold';
    } else if (feedbackCount >= thresholds.silver) {
      highestLevelAchieved = 'silver';
    } else if (feedbackCount >= thresholds.bronze) {
      highestLevelAchieved = 'bronze';
    }
    
    if (!highestLevelAchieved) return null;
    
    // Check if user already has this achievement at this level or higher
    const existingAchievements = await db
      .select()
      .from(achievementEvents)
      .where(
        and(
          eq(achievementEvents.userId, userId),
          eq(achievementEvents.achievementId, metadata.id)
        )
      );
    
    const existingLevels = existingAchievements.map(a => a.achievementLevel);
    
    // Don't award if user already has equal or higher level
    if (
      (highestLevelAchieved === 'bronze' && existingLevels.some(l => ['bronze', 'silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'silver' && existingLevels.some(l => ['silver', 'gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'gold' && existingLevels.some(l => ['gold', 'platinum'].includes(l))) ||
      (highestLevelAchieved === 'platinum' && existingLevels.includes('platinum'))
    ) {
      return null;
    }
    
    // Award new achievement
    const [newAchievement] = await db
      .insert(achievementEvents)
      .values({
        userId,
        achievementId: metadata.id,
        achievementName: metadata.name,
        achievementType: type,
        achievementLevel: highestLevelAchieved
      })
      .returning();
    
    return newAchievement;
  }

  /**
   * Check all applicable achievements for a user
   */
  async checkAllAchievements(userId: number, profileCompletionPercent: number = 0) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user || user.length === 0) {
      throw new Error("User not found");
    }
    
    const userType = user[0].type;
    const achievements = [];
    
    // Check profile completion for all user types
    const profileAchievement = await this.checkProfileCompletion(userId, profileCompletionPercent);
    if (profileAchievement) achievements.push(profileAchievement);
    
    // Check skill builder (applicable for all users)
    const skillBuilderAchievement = await this.checkSkillBuilder(userId);
    if (skillBuilderAchievement) achievements.push(skillBuilderAchievement);
    
    // Check networking champion (applicable for all users)
    const networkingAchievement = await this.checkNetworkingChampion(userId);
    if (networkingAchievement) achievements.push(networkingAchievement);
    
    // Check user type specific achievements
    if (userType === "jobseeker") {
      // Application milestones
      const applicationAchievement = await this.checkApplicationMilestone(userId);
      if (applicationAchievement) achievements.push(applicationAchievement);
      
      // Application quality
      const qualityAchievement = await this.checkApplicationQuality(userId);
      if (qualityAchievement) achievements.push(qualityAchievement);
    }
    
    if (userType === "employer") {
      // Job posting milestones
      const jobPostingAchievement = await this.checkJobPostingMilestone(userId);
      if (jobPostingAchievement) achievements.push(jobPostingAchievement);
      
      // Mentor badge (for employers only)
      const mentorAchievement = await this.checkMentorBadge(userId);
      if (mentorAchievement) achievements.push(mentorAchievement);
    }
    
    return achievements;
  }
  
  /**
   * Get visible badges for a user to display on profile
   */
  async getProfileBadges(userId: number) {
    const userAchievements = await this.getUserAchievements(userId);
    
    // Group by achievement ID and get highest level for each
    const achievementMap: Record<string, any> = {};
    
    userAchievements.forEach(achievement => {
      const currentLevel = achievement.achievementLevel;
      const achievementId = achievement.achievementId;
      
      if (!achievementMap[achievementId] || 
          this.getLevelValue(currentLevel) > this.getLevelValue(achievementMap[achievementId].achievementLevel)) {
        achievementMap[achievementId] = achievement;
      }
    });
    
    // Convert to array and enrich with metadata
    return Object.values(achievementMap).map(achievement => {
      const type = achievement.achievementType;
      const metadata = ACHIEVEMENT_METADATA[type as AchievementType];
      
      return {
        ...achievement,
        description: metadata.description[achievement.achievementLevel as keyof typeof metadata.description],
        icon: metadata.icon
      };
    });
  }
  
  /**
   * Helper to compare achievement levels
   */
  private getLevelValue(level: string): number {
    switch (level) {
      case 'platinum': return 4;
      case 'gold': return 3;
      case 'silver': return 2;
      case 'bronze': return 1;
      default: return 0;
    }
  }
  
  /**
   * Add a few achievements to users for testing
   */
  async seedAchievements(userId: number) {
    // Get user type
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) throw new Error("User not found");
    
    const achievementsToSeed = [];
    
    // Add profile completion achievement
    achievementsToSeed.push({
      userId,
      achievementId: ACHIEVEMENT_METADATA[AchievementType.PROFILE_COMPLETION].id,
      achievementName: ACHIEVEMENT_METADATA[AchievementType.PROFILE_COMPLETION].name,
      achievementType: AchievementType.PROFILE_COMPLETION,
      achievementLevel: "bronze"
    });
    
    // Add Networking Champion achievement for all user types
    achievementsToSeed.push({
      userId,
      achievementId: ACHIEVEMENT_METADATA[AchievementType.NETWORKING_CHAMPION].id,
      achievementName: ACHIEVEMENT_METADATA[AchievementType.NETWORKING_CHAMPION].name,
      achievementType: AchievementType.NETWORKING_CHAMPION,
      achievementLevel: "bronze"
    });
    
    // Add user type specific achievements
    if (user.type === "jobseeker") {
      achievementsToSeed.push({
        userId,
        achievementId: ACHIEVEMENT_METADATA[AchievementType.APPLICATION_MILESTONE].id,
        achievementName: ACHIEVEMENT_METADATA[AchievementType.APPLICATION_MILESTONE].name,
        achievementType: AchievementType.APPLICATION_MILESTONE,
        achievementLevel: "bronze"
      });
      
      // Add Skill Builder achievement for jobseekers
      achievementsToSeed.push({
        userId,
        achievementId: ACHIEVEMENT_METADATA[AchievementType.SKILL_BUILDER].id,
        achievementName: ACHIEVEMENT_METADATA[AchievementType.SKILL_BUILDER].name,
        achievementType: AchievementType.SKILL_BUILDER,
        achievementLevel: "bronze"
      });
    } else if (user.type === "employer") {
      achievementsToSeed.push({
        userId,
        achievementId: ACHIEVEMENT_METADATA[AchievementType.JOB_POSTING_MILESTONE].id,
        achievementName: ACHIEVEMENT_METADATA[AchievementType.JOB_POSTING_MILESTONE].name,
        achievementType: AchievementType.JOB_POSTING_MILESTONE,
        achievementLevel: "bronze"
      });
      
      // Add Mentor Badge achievement for employers
      achievementsToSeed.push({
        userId,
        achievementId: ACHIEVEMENT_METADATA[AchievementType.MENTOR_BADGE].id,
        achievementName: ACHIEVEMENT_METADATA[AchievementType.MENTOR_BADGE].name,
        achievementType: AchievementType.MENTOR_BADGE,
        achievementLevel: "bronze"
      });
    }
    
    // Filter hanya achievement yang belum dimiliki user
    const newAchievements = [];
    
    for (const achievement of achievementsToSeed) {
      const existingAchievements = await db
        .select()
        .from(achievementEvents)
        .where(
          and(
            eq(achievementEvents.userId, userId),
            eq(achievementEvents.achievementId, achievement.achievementId),
            eq(achievementEvents.achievementLevel, achievement.achievementLevel as any)
          )
        );
      
      if (existingAchievements.length === 0) {
        const [newAchievement] = await db
          .insert(achievementEvents)
          .values(achievement)
          .returning();
        
        newAchievements.push(newAchievement);
      }
    }
    
    return newAchievements;
  }
}

export const achievementService = new AchievementService();