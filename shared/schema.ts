import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USERS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  type: text("type", { enum: ["jobseeker", "employer", "admin"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// COMPANIES
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  employerId: integer("employer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verified: boolean("verified").default(false).notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// JOBS
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  companyId: integer("company_id").notNull(),
  location: text("location").notNull(),
  type: text("type", { enum: ["full-time", "part-time", "contract", "remote"] }).notNull(),
  salary: text("salary").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  industry: text("industry").notNull(),
  careerLevel: text("career_level").notNull(),
  skills: text("skills").array().notNull(),
  postedBy: integer("posted_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// JOB APPLICATIONS
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  jobseekerId: integer("jobseeker_id").notNull(),
  cv: text("cv").notNull(),
  coverLetter: text("cover_letter"),
  status: text("status", {
    enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
  }).default("pending").notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  status: true,
  appliedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// JOBSEEKER PROFILES
export const jobseekerProfiles = pgTable("jobseeker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  headline: text("headline"),
  summary: text("summary"),
  experiences: jsonb("experiences").array(),
  education: jsonb("education").array(),
  skills: text("skills").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobseekerProfileSchema = createInsertSchema(jobseekerProfiles).omit({
  id: true,
  createdAt: true,
});

export type InsertJobseekerProfile = z.infer<typeof insertJobseekerProfileSchema>;
export type JobseekerProfile = typeof jobseekerProfiles.$inferSelect;

// JOB CATEGORIES
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  jobCount: integer("job_count").default(0).notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// BLOG POSTS
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  category: text("category").notNull(),
  authorId: integer("author_id").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// LABOR REGULATIONS
export const laborRegulations = pgTable("labor_regulations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  province: text("province").notNull(),
  city: text("city"),
  category: text("category", {
    enum: ["upah_minimum", "tenaga_kerja_asing", "keselamatan_kerja", "asuransi", "phk", "lainnya"]
  }).notNull(),
  effectiveDate: date("effective_date").notNull(),
  expiryDate: date("expiry_date"),
  documentUrl: text("document_url"),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLaborRegulationSchema = createInsertSchema(laborRegulations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLaborRegulation = z.infer<typeof insertLaborRegulationSchema>;
export type LaborRegulation = typeof laborRegulations.$inferSelect;

// PROVINCES
export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
});

export const insertProvinceSchema = createInsertSchema(provinces).omit({
  id: true,
});

export type InsertProvince = z.infer<typeof insertProvinceSchema>;
export type Province = typeof provinces.$inferSelect;

// CITIES
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provinceId: integer("province_id").notNull(),
  code: text("code").notNull().unique(),
  minimumWage: integer("minimum_wage"),
  sectorMinimumWages: jsonb("sector_minimum_wages"),
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
});

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

// COMPANIES DATA FOR LABOR REGULATION
export const companyRegulations = pgTable("company_regulations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  district: text("district"),
  city: text("city"),
  province: text("province"),
  businessType: text("business_type"),
  status: text("status"),
  employeeCount: integer("employee_count").default(0),
  taxId: text("tax_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanyRegulationSchema = createInsertSchema(companyRegulations).omit({
  id: true,
  createdAt: true,
});

export type InsertCompanyRegulation = z.infer<typeof insertCompanyRegulationSchema>;
export type CompanyRegulation = typeof companyRegulations.$inferSelect;

// NOTIFICATIONS
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// USER NOTIFICATION PREFERENCES
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  email: boolean("email").default(true).notNull(),
  inApp: boolean("in_app").default(true).notNull(),
  push: boolean("push").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// ACHIEVEMENT EVENTS
export const achievementEvents = pgTable("achievement_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: text("achievement_id").notNull(),
  achievementName: text("achievement_name").notNull(),
  achievementType: text("achievement_type").notNull(), 
  achievementLevel: text("achievement_level", { 
    enum: ["bronze", "silver", "gold", "platinum"] 
  }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertAchievementEventSchema = createInsertSchema(achievementEvents).omit({
  id: true,
  unlockedAt: true,
});

export type InsertAchievementEvent = z.infer<typeof insertAchievementEventSchema>;
export type AchievementEvent = typeof achievementEvents.$inferSelect;

// MOOD AND MOTIVATION TRACKER
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  mood: text("mood", { 
    enum: ["very_high", "high", "moderate", "low", "very_low"] 
  }).notNull(),
  notes: text("notes"),
  activities: text("activities").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

// MOTIVATION TIPS
export const motivationTips = pgTable("motivation_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category", {
    enum: ["career_development", "mental_health", "job_search", "interview_preparation", "networking"]
  }).notNull(),
  targetMotivation: text("target_motivation", {
    enum: ["very_high", "high", "moderate", "low", "very_low"]
  }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMotivationTipSchema = createInsertSchema(motivationTips).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export type InsertMotivationTip = z.infer<typeof insertMotivationTipSchema>;
export type MotivationTip = typeof motivationTips.$inferSelect;

// PROFILE COMPLETION PROGRESS
export const profileCompletionItems = pgTable("profile_completion_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  pointValue: integer("point_value").notNull(),
  category: text("category", {
    enum: ["basic_info", "professional_info", "documents", "preferences", "verification"]
  }).notNull(),
  userType: text("user_type", { enum: ["jobseeker", "employer", "both"] }).notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  displayOrder: integer("display_order").notNull(),
  iconName: text("icon_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileCompletionItemSchema = createInsertSchema(profileCompletionItems).omit({
  id: true, 
  createdAt: true,
});

export type InsertProfileCompletionItem = z.infer<typeof insertProfileCompletionItemSchema>;
export type ProfileCompletionItem = typeof profileCompletionItems.$inferSelect;

// USER PROFILE COMPLETION STATUS
export const userProfileCompletions = pgTable("user_profile_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileCompletionSchema = createInsertSchema(userProfileCompletions).omit({
  id: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProfileCompletion = z.infer<typeof insertUserProfileCompletionSchema>;
export type UserProfileCompletion = typeof userProfileCompletions.$inferSelect;

// LEADERBOARD SYSTEM
export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type", { 
    enum: ["global", "achievement_category", "achievement_level", "seasonal"] 
  }).notNull(),
  category: text("category"), // Untuk leaderboard berdasarkan kategori achievement
  level: text("level", { 
    enum: ["bronze", "silver", "gold", "platinum"] 
  }), // Untuk leaderboard berdasarkan level
  timeframe: text("timeframe", { 
    enum: ["all_time", "yearly", "monthly", "weekly", "seasonal"] 
  }).notNull(),
  startDate: timestamp("start_date"), // Untuk leaderboard musiman
  endDate: timestamp("end_date"), // Untuk leaderboard musiman
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;

// LEADERBOARD ENTRIES
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").notNull(),
  userId: integer("user_id").notNull(),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(), // Total nilai achievement
  achievementCount: integer("achievement_count").notNull(), // Jumlah achievement
  categoryScores: jsonb("category_scores"), // Skor per kategori achievement
  levelCounts: jsonb("level_counts"), // Jumlah achievement per level
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  rank: true, // Peringkat dihitung otomatis saat update
  lastUpdated: true,
});

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

// CAREER PATH SIMULATOR ENTITIES

// Career Scenario table
export const careerScenarios = pgTable('career_scenarios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  currentRole: text('current_role').notNull(),
  targetRole: text('target_role').notNull(),
  timeframe: integer('timeframe').notNull(), // in years
  startingSalary: integer('starting_salary').notNull(),
  startingSkills: jsonb('starting_skills').notNull(),
  outcomes: jsonb('outcomes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Career Decision table
export const careerDecisions = pgTable('career_decisions', {
  id: serial('id').primaryKey(),
  scenarioId: integer('scenario_id').notNull().references(() => careerScenarios.id),
  decisionType: text('decision_type').notNull(),
  description: text('description').notNull(),
  timepoint: integer('timepoint').notNull(), // months from scenario start
  impact: jsonb('impact').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Alternative Decision table (for comparison)
export const alternativeDecisions = pgTable('alternative_decisions', {
  id: serial('id').primaryKey(),
  originalDecisionId: integer('original_decision_id').notNull().references(() => careerDecisions.id),
  decisionType: text('decision_type').notNull(),
  description: text('description').notNull(),
  impact: jsonb('impact').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Career Comparison table (for saved comparisons)
export const careerComparisons = pgTable('career_comparisons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  scenarioIds: jsonb('scenario_ids').notNull(),
  highlightedMetrics: jsonb('highlighted_metrics'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User Scenario Preferences table
export const scenarioPreferences = pgTable('scenario_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  salaryPriority: integer('salary_priority').default(3), // 1-5 importance
  workLifeBalancePriority: integer('work_life_balance_priority').default(3), // 1-5 importance
  growthPotentialPriority: integer('growth_potential_priority').default(3), // 1-5 importance
  jobSecurityPriority: integer('job_security_priority').default(3), // 1-5 importance
  locationPreferences: jsonb('location_preferences'),
  industryPreferences: jsonb('industry_preferences'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Insert Schemas for Career Path Simulator
export const insertCareerScenarioSchema = createInsertSchema(careerScenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCareerDecisionSchema = createInsertSchema(careerDecisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAlternativeDecisionSchema = createInsertSchema(alternativeDecisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCareerComparisonSchema = createInsertSchema(careerComparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertScenarioPreferencesSchema = createInsertSchema(scenarioPreferences).omit({
  id: true,
  updatedAt: true
});

// Types for Career Path Simulator
export type CareerScenario = typeof careerScenarios.$inferSelect;
export type InsertCareerScenario = z.infer<typeof insertCareerScenarioSchema>;

export type CareerDecision = typeof careerDecisions.$inferSelect;
export type InsertCareerDecision = z.infer<typeof insertCareerDecisionSchema>;

export type AlternativeDecision = typeof alternativeDecisions.$inferSelect;
export type InsertAlternativeDecision = z.infer<typeof insertAlternativeDecisionSchema>;

export type CareerComparison = typeof careerComparisons.$inferSelect;
export type InsertCareerComparison = z.infer<typeof insertCareerComparisonSchema>;

export type ScenarioPreference = typeof scenarioPreferences.$inferSelect;
export type InsertScenarioPreference = z.infer<typeof insertScenarioPreferencesSchema>;

// Decision types enum
export enum DecisionType {
  EDUCATION = 'education',
  JOB_CHANGE = 'job_change',
  SKILL_ACQUISITION = 'skill_acquisition',
  RELOCATION = 'relocation',
  OTHER = 'other'
}

// INTELLIGENT INTERVIEW PREPARATION MODULE

// Interview Questions Bank
export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answerGuidelines: text("answer_guidelines"),
  category: text("category", { 
    enum: ["technical", "behavioral", "situational", "general", "company_specific"] 
  }).notNull(),
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced", "expert"]
  }).notNull(),
  industries: text("industries").array(),
  jobRoles: text("job_roles").array(),
  skillsRequired: text("skills_required").array(),
  createdBy: integer("created_by").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions).omit({
  id: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true
});

export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;

// Mock Interview Sessions
export const mockInterviews = pgTable("mock_interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobRoleTarget: text("job_role_target").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced", "expert"]
  }).notNull(),
  status: text("status", {
    enum: ["scheduled", "completed", "cancelled"]
  }).notNull().default("scheduled"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(), // in minutes
  questionCount: integer("question_count").notNull(),
  settings: jsonb("settings"), // Custom settings for the session
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertMockInterviewSchema = createInsertSchema(mockInterviews).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

export type MockInterview = typeof mockInterviews.$inferSelect;
export type InsertMockInterview = z.infer<typeof insertMockInterviewSchema>;

// Mock Interview Questions (questions selected for a specific mock interview)
export const mockInterviewQuestions = pgTable("mock_interview_questions", {
  id: serial("id").primaryKey(),
  mockInterviewId: integer("mock_interview_id").notNull(),
  questionId: integer("question_id").notNull(),
  order: integer("order").notNull(),
  userResponse: text("user_response"),
  aiEvaluation: jsonb("ai_evaluation"),
  score: integer("score"),
  feedback: text("feedback"),
  responseTimeSec: integer("response_time_sec"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertMockInterviewQuestionSchema = createInsertSchema(mockInterviewQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type MockInterviewQuestion = typeof mockInterviewQuestions.$inferSelect;
export type InsertMockInterviewQuestion = z.infer<typeof insertMockInterviewQuestionSchema>;

// User Interview Performance
export const interviewPerformance = pgTable("interview_performance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalInterviews: integer("total_interviews").default(0).notNull(),
  averageScore: doublePrecision("average_score"),
  strengthCategories: jsonb("strength_categories"),
  improvementCategories: jsonb("improvement_categories"),
  technicalScore: doublePrecision("technical_score"),
  behavioralScore: doublePrecision("behavioral_score"),
  communicationScore: doublePrecision("communication_score"),
  responseTimeAvg: doublePrecision("response_time_avg"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertInterviewPerformanceSchema = createInsertSchema(interviewPerformance).omit({
  id: true,
  totalInterviews: true,
  lastUpdated: true
});

export type InterviewPerformance = typeof interviewPerformance.$inferSelect;
export type InsertInterviewPerformance = z.infer<typeof insertInterviewPerformanceSchema>;

// Interview Tips
export const interviewTips = pgTable("interview_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category", {
    enum: ["preparation", "during_interview", "follow_up", "technical", "behavioral", "remote_interview", "salary_negotiation"]
  }).notNull(),
  difficultyLevel: text("difficulty_level", {
    enum: ["beginner", "intermediate", "advanced", "expert"]
  }).notNull(),
  targetIndustries: text("target_industries").array(),
  targetRoles: text("target_roles").array(),
  authorId: integer("author_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertInterviewTipSchema = createInsertSchema(interviewTips).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
});

export type InterviewTip = typeof interviewTips.$inferSelect;
export type InsertInterviewTip = z.infer<typeof insertInterviewTipSchema>;
