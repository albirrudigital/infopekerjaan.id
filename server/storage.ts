import { eq, sql, desc, and, like, or } from 'drizzle-orm';
import session from 'express-session';
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from './db';
import {
  users, companies, jobs, applications, jobseekerProfiles, categories, blogPosts,
  laborRegulations, provinces, cities, companyRegulations, notifications, 
  notificationPreferences, achievementEvents, moodEntries, motivationTips,
  profileCompletionItems, userProfileCompletions, leaderboards, leaderboardEntries,
  type User, type InsertUser,
  type Company, type InsertCompany,
  type Job, type InsertJob,
  type Application, type InsertApplication,
  type JobseekerProfile, type InsertJobseekerProfile,
  type Category, type InsertCategory,
  type BlogPost, type InsertBlogPost,
  type LaborRegulation, type InsertLaborRegulation,
  type Province, type InsertProvince,
  type City, type InsertCity,
  type CompanyRegulation, type InsertCompanyRegulation,
  type Notification, type InsertNotification,
  type NotificationPreferences, type InsertNotificationPreferences,
  type AchievementEvent, type InsertAchievementEvent,
  type MoodEntry, type InsertMoodEntry,
  type MotivationTip, type InsertMotivationTip,
  type ProfileCompletionItem, type InsertProfileCompletionItem,
  type UserProfileCompletion, type InsertUserProfileCompletion,
  type Leaderboard, type InsertLeaderboard,
  type LeaderboardEntry, type InsertLeaderboardEntry
} from '@shared/schema';

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Define the interface for storage operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile Completion operations
  getProfileCompletionItems(userType?: string): Promise<ProfileCompletionItem[]>;
  getProfileCompletionItem(id: number): Promise<ProfileCompletionItem | undefined>;
  createProfileCompletionItem(item: InsertProfileCompletionItem): Promise<ProfileCompletionItem>;
  
  getUserProfileCompletions(userId: number): Promise<UserProfileCompletion[]>;
  getUserProfileCompletion(userId: number, itemId: number): Promise<UserProfileCompletion | undefined>;
  createUserProfileCompletion(completion: InsertUserProfileCompletion): Promise<UserProfileCompletion>;
  updateUserProfileCompletion(userId: number, itemId: number, completed: boolean): Promise<UserProfileCompletion | undefined>;
  calculateProfileCompletionPercentage(userId: number): Promise<number>;
  
  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompaniesByEmployer(employerId: number): Promise<Company[]>;
  getTopCompanies(limit?: number): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<Company>): Promise<Company | undefined>;
  
  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(options?: { 
    limit?: number, 
    offset?: number, 
    query?: string, 
    location?: string, 
    companyId?: number, 
    industry?: string,
    type?: string
  }): Promise<Job[]>;
  getJobsByCompany(companyId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  
  // Application operations
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByJobseeker(jobseekerId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Jobseeker Profile operations
  getJobseekerProfile(userId: number): Promise<JobseekerProfile | undefined>;
  createJobseekerProfile(profile: InsertJobseekerProfile): Promise<JobseekerProfile>;
  updateJobseekerProfile(userId: number, profile: Partial<JobseekerProfile>): Promise<JobseekerProfile | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Blog operations
  getBlogPosts(limit?: number): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Labor Regulation operations
  getLaborRegulations(options?: { 
    limit?: number, 
    offset?: number, 
    province?: string, 
    city?: string, 
    category?: string 
  }): Promise<LaborRegulation[]>;
  getLaborRegulation(id: number): Promise<LaborRegulation | undefined>;
  createLaborRegulation(regulation: InsertLaborRegulation): Promise<LaborRegulation>;
  updateLaborRegulation(id: number, regulation: Partial<LaborRegulation>): Promise<LaborRegulation | undefined>;
  
  // Provinces and Cities operations
  getProvinces(): Promise<Province[]>;
  getProvince(id: number): Promise<Province | undefined>;
  getProvinceByCode(code: string): Promise<Province | undefined>;
  createProvince(province: InsertProvince): Promise<Province>;
  
  getCities(provinceId?: number): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;
  getCityByCode(code: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: number, city: Partial<City>): Promise<City | undefined>;
  
  // Company Regulation operations
  getCompanyRegulations(options?: { 
    limit?: number, 
    offset?: number, 
    district?: string, 
    city?: string,
    businessType?: string
  }): Promise<CompanyRegulation[]>;
  getCompanyRegulationsCount(options?: { 
    district?: string, 
    city?: string,
    businessType?: string
  }): Promise<number>;
  getCompanyRegulation(id: number): Promise<CompanyRegulation | undefined>;
  createCompanyRegulation(company: InsertCompanyRegulation): Promise<CompanyRegulation>;
  updateCompanyRegulation(id: number, company: Partial<CompanyRegulation>): Promise<CompanyRegulation | undefined>;
  
  // Notification operations
  getNotifications(userId: number, options?: {
    limit?: number,
    offset?: number,
    unreadOnly?: boolean
  }): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Notification Preferences operations
  getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined>;
  createNotificationPreferences(preferences: InsertNotificationPreferences): Promise<NotificationPreferences>;
  updateNotificationPreferences(userId: number, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences | undefined>;
  
  // Achievement operations
  getAchievementEvents(userId: number): Promise<AchievementEvent[]>;
  createAchievementEvent(event: InsertAchievementEvent): Promise<AchievementEvent>;
  
  // User by Company operations
  getUsersByCompany(companyId: number): Promise<User[]>;
  
  // Mood and Motivation Tracker operations
  getMoodEntries(userId: number, options?: {
    limit?: number,
    offset?: number,
    startDate?: Date,
    endDate?: Date
  }): Promise<MoodEntry[]>;
  getMoodEntry(id: number): Promise<MoodEntry | undefined>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  updateMoodEntry(id: number, entry: Partial<MoodEntry>): Promise<MoodEntry | undefined>;
  
  // Motivation Tips operations
  getMotivationTips(options?: {
    limit?: number,
    targetMood?: string,
    targetMotivation?: string,
    category?: string
  }): Promise<MotivationTip[]>;
  getMotivationTip(id: number): Promise<MotivationTip | undefined>;
  createMotivationTip(tip: InsertMotivationTip): Promise<MotivationTip>;
  updateMotivationTip(id: number, tip: Partial<MotivationTip>): Promise<MotivationTip | undefined>;
  
  // Leaderboard operations
  getLeaderboards(options?: {
    type?: string,
    category?: string,
    level?: string,
    timeframe?: string,
    isActive?: boolean
  }): Promise<Leaderboard[]>;
  getLeaderboard(id: number): Promise<Leaderboard | undefined>;
  createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard>;
  updateLeaderboard(id: number, leaderboard: Partial<Leaderboard>): Promise<Leaderboard | undefined>;
  
  // Leaderboard Entry operations
  getLeaderboardEntries(leaderboardId: number, options?: {
    limit?: number,
    offset?: number
  }): Promise<LeaderboardEntry[]>;
  getUserLeaderboardEntry(leaderboardId: number, userId: number): Promise<LeaderboardEntry | undefined>;
  createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  updateLeaderboardEntry(leaderboardId: number, userId: number, data: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | undefined>;
  calculateUserRank(leaderboardId: number, userId: number): Promise<number>;
  refreshLeaderboard(leaderboardId: number): Promise<boolean>;
}

// This is the in-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private companies: Map<number, Company> = new Map();
  private jobs: Map<number, Job> = new Map();
  private applications: Map<number, Application> = new Map();
  private jobseekerProfiles: Map<number, JobseekerProfile> = new Map();
  private categories: Map<number, Category> = new Map();
  private blogPosts: Map<number, BlogPost> = new Map();
  private laborRegulations: Map<number, LaborRegulation> = new Map();
  private provinces: Map<number, Province> = new Map();
  private cities: Map<number, City> = new Map();
  private companyRegulations: Map<number, CompanyRegulation> = new Map();
  
  sessionStore: session.Store;
  
  private userIdCounter: number = 1;
  private companyIdCounter: number = 1;
  private jobIdCounter: number = 1;
  private applicationIdCounter: number = 1;
  private profileIdCounter: number = 1;
  private categoryIdCounter: number = 1;
  private blogPostIdCounter: number = 1;
  private laborRegulationIdCounter: number = 1;
  private provinceIdCounter: number = 1;
  private cityIdCounter: number = 1;
  private companyRegulationIdCounter: number = 1;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async getCompaniesByEmployer(employerId: number): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(c => c.ownerId === employerId);
  }
  
  async getTopCompanies(limit: number = 10): Promise<Company[]> {
    return Array.from(this.companies.values()).slice(0, limit);
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const createdAt = new Date();
    const company: Company = { ...insertCompany, id, createdAt };
    this.companies.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, updateData: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updateData };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async getJobs(options: { 
    limit?: number, 
    offset?: number, 
    query?: string, 
    location?: string, 
    companyId?: number, 
    industry?: string,
    type?: string
  } = {}): Promise<Job[]> {
    let filteredJobs = Array.from(this.jobs.values());
    
    if (options.query) {
      const lowerQuery = options.query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) || 
        (job.description && job.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (options.location) {
      const lowerLocation = options.location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location && job.location.toLowerCase().includes(lowerLocation)
      );
    }
    
    if (options.companyId) {
      filteredJobs = filteredJobs.filter(job => job.companyId === options.companyId);
    }
    
    if (options.industry) {
      filteredJobs = filteredJobs.filter(job => job.industry === options.industry);
    }
    
    if (options.type) {
      filteredJobs = filteredJobs.filter(job => job.type === options.type);
    }
    
    // Sort by newest first
    filteredJobs = filteredJobs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filteredJobs.length;
    
    return filteredJobs.slice(offset, offset + limit);
  }
  
  async getJobsByCompany(companyId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(j => j.companyId === companyId);
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const createdAt = new Date();
    const job: Job = { ...insertJob, id, createdAt };
    this.jobs.set(id, job);
    return job;
  }
  
  async updateJob(id: number, updateData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updateData };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  
  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(a => a.jobId === jobId);
  }
  
  async getApplicationsByJobseeker(jobseekerId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(a => a.userId === jobseekerId);
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const createdAt = new Date();
    const status = 'pending';
    const application: Application = { ...insertApplication, id, status, createdAt };
    this.applications.set(id, application);
    return application;
  }
  
  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Jobseeker Profile operations
  async getJobseekerProfile(userId: number): Promise<JobseekerProfile | undefined> {
    return Array.from(this.jobseekerProfiles.values()).find(p => p.userId === userId);
  }
  
  async createJobseekerProfile(insertProfile: InsertJobseekerProfile): Promise<JobseekerProfile> {
    const id = this.profileIdCounter++;
    const createdAt = new Date();
    const profile: JobseekerProfile = { ...insertProfile, id, createdAt };
    this.jobseekerProfiles.set(id, profile);
    return profile;
  }
  
  async updateJobseekerProfile(userId: number, updateData: Partial<JobseekerProfile>): Promise<JobseekerProfile | undefined> {
    const profile = Array.from(this.jobseekerProfiles.values()).find(p => p.userId === userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updateData };
    this.jobseekerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.name === name);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Blog operations
  async getBlogPosts(limit: number = 10): Promise<BlogPost[]> {
    const posts = Array.from(this.blogPosts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return posts.slice(0, limit);
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const createdAt = new Date();
    const post: BlogPost = { ...insertPost, id, createdAt };
    this.blogPosts.set(id, post);
    return post;
  }
  
  // Labor Regulation operations
  async getLaborRegulations(options: { 
    limit?: number, 
    offset?: number, 
    province?: string, 
    city?: string, 
    category?: string 
  } = {}): Promise<LaborRegulation[]> {
    let regulations = Array.from(this.laborRegulations.values());
    
    if (options.province) {
      regulations = regulations.filter(r => r.province === options.province);
    }
    
    if (options.city) {
      regulations = regulations.filter(r => r.city === options.city);
    }
    
    if (options.category) {
      regulations = regulations.filter(r => r.category === options.category);
    }
    
    // Sort by newest first
    regulations = regulations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || regulations.length;
    
    return regulations.slice(offset, offset + limit);
  }
  
  async getLaborRegulation(id: number): Promise<LaborRegulation | undefined> {
    return this.laborRegulations.get(id);
  }
  
  async createLaborRegulation(insertRegulation: InsertLaborRegulation): Promise<LaborRegulation> {
    const id = this.laborRegulationIdCounter++;
    const createdAt = new Date();
    const regulation: LaborRegulation = { ...insertRegulation, id, createdAt };
    this.laborRegulations.set(id, regulation);
    return regulation;
  }
  
  async updateLaborRegulation(id: number, updateData: Partial<LaborRegulation>): Promise<LaborRegulation | undefined> {
    const regulation = this.laborRegulations.get(id);
    if (!regulation) return undefined;
    
    const updatedRegulation = { ...regulation, ...updateData };
    this.laborRegulations.set(id, updatedRegulation);
    return updatedRegulation;
  }
  
  // Province operations
  async getProvinces(): Promise<Province[]> {
    return Array.from(this.provinces.values());
  }
  
  async getProvince(id: number): Promise<Province | undefined> {
    return this.provinces.get(id);
  }
  
  async getProvinceByCode(code: string): Promise<Province | undefined> {
    return Array.from(this.provinces.values()).find(p => p.code === code);
  }
  
  async createProvince(insertProvince: InsertProvince): Promise<Province> {
    const id = this.provinceIdCounter++;
    const province: Province = { ...insertProvince, id };
    this.provinces.set(id, province);
    return province;
  }
  
  // City operations
  async getCities(provinceId?: number): Promise<City[]> {
    let cities = Array.from(this.cities.values());
    if (provinceId) {
      cities = cities.filter(c => c.provinceId === provinceId);
    }
    return cities;
  }
  
  async getCity(id: number): Promise<City | undefined> {
    return this.cities.get(id);
  }
  
  async getCityByCode(code: string): Promise<City | undefined> {
    return Array.from(this.cities.values()).find(c => c.code === code);
  }
  
  async createCity(insertCity: InsertCity): Promise<City> {
    const id = this.cityIdCounter++;
    const city: City = { ...insertCity, id };
    this.cities.set(id, city);
    return city;
  }
  
  async updateCity(id: number, updateData: Partial<City>): Promise<City | undefined> {
    const city = this.cities.get(id);
    if (!city) return undefined;
    
    const updatedCity = { ...city, ...updateData };
    this.cities.set(id, updatedCity);
    return updatedCity;
  }
  
  // Company Regulation operations
  async getCompanyRegulations(options: { 
    limit?: number, 
    offset?: number, 
    district?: string, 
    city?: string,
    businessType?: string
  } = {}): Promise<CompanyRegulation[]> {
    let regulations = Array.from(this.companyRegulations.values());
    
    // Apply filters
    if (options.district) {
      regulations = regulations.filter(reg => 
        reg.district && reg.district.toLowerCase().includes(options.district!.toLowerCase())
      );
    }
    
    if (options.city) {
      regulations = regulations.filter(reg => 
        reg.city && reg.city.toLowerCase().includes(options.city!.toLowerCase())
      );
    }
    
    if (options.businessType) {
      regulations = regulations.filter(reg => 
        reg.businessType && reg.businessType.toLowerCase().includes(options.businessType!.toLowerCase())
      );
    }
    
    // Sort by newest first
    regulations = regulations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || regulations.length;
    
    return regulations.slice(offset, offset + limit);
  }
  
  async getCompanyRegulationsCount(options: { 
    district?: string, 
    city?: string,
    businessType?: string
  } = {}): Promise<number> {
    let regulations = Array.from(this.companyRegulations.values());
    
    // Apply filters
    if (options.district) {
      regulations = regulations.filter(reg => 
        reg.district && reg.district.toLowerCase().includes(options.district!.toLowerCase())
      );
    }
    
    if (options.city) {
      regulations = regulations.filter(reg => 
        reg.city && reg.city.toLowerCase().includes(options.city!.toLowerCase())
      );
    }
    
    if (options.businessType) {
      regulations = regulations.filter(reg => 
        reg.businessType && reg.businessType.toLowerCase().includes(options.businessType!.toLowerCase())
      );
    }
    
    return regulations.length;
  }
  
  async getCompanyRegulation(id: number): Promise<CompanyRegulation | undefined> {
    return this.companyRegulations.get(id);
  }
  
  async createCompanyRegulation(insertCompany: InsertCompanyRegulation): Promise<CompanyRegulation> {
    const id = this.companyRegulationIdCounter++;
    const createdAt = new Date();
    const company: CompanyRegulation = { ...insertCompany, id, createdAt };
    this.companyRegulations.set(id, company);
    return company;
  }
  
  async updateCompanyRegulation(id: number, updateData: Partial<CompanyRegulation>): Promise<CompanyRegulation | undefined> {
    const company = this.companyRegulations.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updateData };
    this.companyRegulations.set(id, updatedCompany);
    return updatedCompany;
  }
}

// This is the database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set for DatabaseStorage");
    }
    
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  
  async getCompaniesByEmployer(employerId: number): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.ownerId, employerId));
  }
  
  async getTopCompanies(limit: number = 10): Promise<Company[]> {
    return await db.select().from(companies).limit(limit);
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }
  
  async updateCompany(id: number, updateData: Partial<Company>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }
  
  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }
  
  async getJobs(options: { 
    limit?: number, 
    offset?: number, 
    query?: string, 
    location?: string, 
    companyId?: number, 
    industry?: string,
    type?: string
  } = {}): Promise<Job[]> {
    let query = db.select().from(jobs);
    
    if (options.query) {
      query = query.where(
        or(
          like(jobs.title, `%${options.query}%`),
          like(jobs.description, `%${options.query}%`)
        )
      );
    }
    
    if (options.location) {
      query = query.where(like(jobs.location, `%${options.location}%`));
    }
    
    if (options.companyId) {
      query = query.where(eq(jobs.companyId, options.companyId));
    }
    
    if (options.industry) {
      query = query.where(eq(jobs.industry, options.industry));
    }
    
    if (options.type) {
      query = query.where(eq(jobs.type, options.type));
    }
    
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    
    if (options.offset !== undefined) {
      query = query.offset(options.offset);
    }
    
    query = query.orderBy(desc(jobs.createdAt));
    
    return await query;
  }
  
  async getJobsByCompany(companyId: number): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.companyId, companyId));
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }
  
  async updateJob(id: number, updateData: Partial<Job>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }
  
  // Application operations
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }
  
  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }
  
  async getApplicationsByJobseeker(jobseekerId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, jobseekerId));
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }
  
  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }
  
  // Jobseeker Profile operations
  async getJobseekerProfile(userId: number): Promise<JobseekerProfile | undefined> {
    const [profile] = await db.select().from(jobseekerProfiles).where(eq(jobseekerProfiles.userId, userId));
    return profile;
  }
  
  async createJobseekerProfile(insertProfile: InsertJobseekerProfile): Promise<JobseekerProfile> {
    const [profile] = await db
      .insert(jobseekerProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }
  
  async updateJobseekerProfile(userId: number, updateData: Partial<JobseekerProfile>): Promise<JobseekerProfile | undefined> {
    const [updatedProfile] = await db
      .update(jobseekerProfiles)
      .set(updateData)
      .where(eq(jobseekerProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }
  
  // Blog operations
  async getBlogPosts(limit: number = 10): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(limit);
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  
  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values(insertPost)
      .returning();
    return post;
  }
  
  // Labor Regulation operations
  async getLaborRegulations(options: { 
    limit?: number, 
    offset?: number, 
    province?: string, 
    city?: string, 
    category?: string 
  } = {}): Promise<LaborRegulation[]> {
    let query = db.select().from(laborRegulations);
    
    if (options.province) {
      query = query.where(eq(laborRegulations.province, options.province));
    }
    
    if (options.city) {
      query = query.where(eq(laborRegulations.city, options.city));
    }
    
    if (options.category) {
      query = query.where(eq(laborRegulations.category, options.category));
    }
    
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    
    if (options.offset !== undefined) {
      query = query.offset(options.offset);
    }
    
    query = query.orderBy(desc(laborRegulations.createdAt));
    
    return await query;
  }
  
  async getLaborRegulation(id: number): Promise<LaborRegulation | undefined> {
    const [regulation] = await db.select().from(laborRegulations).where(eq(laborRegulations.id, id));
    return regulation;
  }
  
  async createLaborRegulation(insertRegulation: InsertLaborRegulation): Promise<LaborRegulation> {
    const [regulation] = await db
      .insert(laborRegulations)
      .values(insertRegulation)
      .returning();
    return regulation;
  }
  
  async updateLaborRegulation(id: number, updateData: Partial<LaborRegulation>): Promise<LaborRegulation | undefined> {
    const [updatedRegulation] = await db
      .update(laborRegulations)
      .set(updateData)
      .where(eq(laborRegulations.id, id))
      .returning();
    return updatedRegulation;
  }
  
  // Province operations
  async getProvinces(): Promise<Province[]> {
    return await db.select().from(provinces);
  }
  
  async getProvince(id: number): Promise<Province | undefined> {
    const [province] = await db.select().from(provinces).where(eq(provinces.id, id));
    return province;
  }
  
  async getProvinceByCode(code: string): Promise<Province | undefined> {
    const [province] = await db.select().from(provinces).where(eq(provinces.code, code));
    return province;
  }
  
  async createProvince(insertProvince: InsertProvince): Promise<Province> {
    const [province] = await db
      .insert(provinces)
      .values(insertProvince)
      .returning();
    return province;
  }
  
  // City operations
  async getCities(provinceId?: number): Promise<City[]> {
    let query = db.select().from(cities);
    if (provinceId) {
      query = query.where(eq(cities.provinceId, provinceId));
    }
    return await query;
  }
  
  async getCity(id: number): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }
  
  async getCityByCode(code: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.code, code));
    return city;
  }
  
  async createCity(insertCity: InsertCity): Promise<City> {
    const [city] = await db
      .insert(cities)
      .values(insertCity)
      .returning();
    return city;
  }
  
  async updateCity(id: number, updateData: Partial<City>): Promise<City | undefined> {
    const [updatedCity] = await db
      .update(cities)
      .set(updateData)
      .where(eq(cities.id, id))
      .returning();
    return updatedCity;
  }
  
  // Company Regulation operations
  async getCompanyRegulations(options: { 
    limit?: number, 
    offset?: number, 
    district?: string, 
    city?: string,
    businessType?: string
  } = {}): Promise<CompanyRegulation[]> {
    let query = db.select().from(companyRegulations);
    
    // Apply filters
    if (options.district) {
      query = query.where(eq(companyRegulations.district, options.district));
    }
    
    if (options.city) {
      query = query.where(eq(companyRegulations.city, options.city));
    }
    
    if (options.businessType) {
      query = query.where(eq(companyRegulations.businessType, options.businessType));
    }
    
    // Apply pagination
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    
    if (options.offset !== undefined) {
      query = query.offset(options.offset);
    }
    
    // Sort by newest first
    query = query.orderBy(desc(companyRegulations.createdAt));
    
    return await query;
  }
  
  async getCompanyRegulationsCount(options: { 
    district?: string, 
    city?: string,
    businessType?: string
  } = {}): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(companyRegulations);
    
    // Apply filters
    if (options.district) {
      query = query.where(eq(companyRegulations.district, options.district));
    }
    
    if (options.city) {
      query = query.where(eq(companyRegulations.city, options.city));
    }
    
    if (options.businessType) {
      query = query.where(eq(companyRegulations.businessType, options.businessType));
    }
    
    const result = await query;
    return result[0].count;
  }
  
  async getCompanyRegulation(id: number): Promise<CompanyRegulation | undefined> {
    const [company] = await db.select().from(companyRegulations).where(eq(companyRegulations.id, id));
    return company;
  }
  
  async createCompanyRegulation(insertCompany: InsertCompanyRegulation): Promise<CompanyRegulation> {
    const [company] = await db
      .insert(companyRegulations)
      .values(insertCompany)
      .returning();
    return company;
  }
  
  async updateCompanyRegulation(id: number, updateData: Partial<CompanyRegulation>): Promise<CompanyRegulation | undefined> {
    const [updatedCompany] = await db
      .update(companyRegulations)
      .set(updateData)
      .where(eq(companyRegulations.id, id))
      .returning();
    return updatedCompany;
  }
  
  // Notification operations
  async getNotifications(userId: number, options: {
    limit?: number,
    offset?: number,
    unreadOnly?: boolean
  } = {}): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (options.unreadOnly) {
      query = query.where(eq(notifications.isRead, false));
    }
    
    query = query.orderBy(desc(notifications.createdAt));
    
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    
    if (options.offset !== undefined) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
  
  // Notification Preferences operations
  async getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }
  
  async createNotificationPreferences(insertPreferences: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [preferences] = await db
      .insert(notificationPreferences)
      .values(insertPreferences)
      .returning();
    return preferences;
  }
  
  async updateNotificationPreferences(userId: number, updateData: Partial<NotificationPreferences>): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .update(notificationPreferences)
      .set(updateData)
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return preferences;
  }
  
  // Achievement operations
  async getAchievementEvents(userId: number): Promise<AchievementEvent[]> {
    return await db
      .select()
      .from(achievementEvents)
      .where(eq(achievementEvents.userId, userId))
      .orderBy(desc(achievementEvents.unlockedAt));
  }
  
  async createAchievementEvent(insertEvent: InsertAchievementEvent): Promise<AchievementEvent> {
    const [event] = await db
      .insert(achievementEvents)
      .values(insertEvent)
      .returning();
    return event;
  }
  
  // User by Company operations
  async getUsersByCompany(companyId: number): Promise<User[]> {
    // Mendapatkan daftar perusahaan
    const company = await this.getCompany(companyId);
    if (!company) return [];
    
    // Mendapatkan employer (pemilik perusahaan)
    const employer = await this.getUser(company.employerId);
    if (!employer) return [];
    
    return [employer];
  }
  
  // Mood and Motivation Tracker operations
  async getMoodEntriesByUserId(userId: number, options: {
    limit?: number,
    offset?: number,
    startDate?: Date,
    endDate?: Date
  } = {}): Promise<MoodEntry[]> {
    let query = db.select().from(moodEntries).where(eq(moodEntries.userId, userId));
    
    if (options.startDate) {
      query = query.where(sql`${moodEntries.date} >= ${options.startDate}`);
    }
    
    if (options.endDate) {
      query = query.where(sql`${moodEntries.date} <= ${options.endDate}`);
    }
    
    query = query.orderBy(desc(moodEntries.date));
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async getMoodEntry(id: number): Promise<MoodEntry | undefined> {
    const [entry] = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.id, id));
    return entry;
  }
  
  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const [entry] = await db
      .insert(moodEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }
  
  async updateMoodEntry(id: number, updateData: Partial<MoodEntry>): Promise<MoodEntry | undefined> {
    const [updatedEntry] = await db
      .update(moodEntries)
      .set(updateData)
      .where(eq(moodEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteMoodEntry(id: number): Promise<void> {
    await db
      .delete(moodEntries)
      .where(eq(moodEntries.id, id));
  }
  
  // Motivation Tips operations
  async getAllMotivationTips(limit?: number): Promise<MotivationTip[]> {
    let query = db.select().from(motivationTips).where(eq(motivationTips.isActive, true));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getMotivationTipsByMood(mood: string, limit?: number): Promise<MotivationTip[]> {
    let query = db.select().from(motivationTips)
      .where(eq(motivationTips.isActive, true))
      .where(eq(motivationTips.targetMotivation, mood as any));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getMotivationTipsByCategory(category: string, limit?: number): Promise<MotivationTip[]> {
    let query = db.select().from(motivationTips)
      .where(eq(motivationTips.isActive, true))
      .where(eq(motivationTips.category, category as any));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getMotivationTip(id: number): Promise<MotivationTip | undefined> {
    const [tip] = await db
      .select()
      .from(motivationTips)
      .where(eq(motivationTips.id, id));
    return tip;
  }
  
  async createMotivationTip(insertTip: InsertMotivationTip): Promise<MotivationTip> {
    const [tip] = await db
      .insert(motivationTips)
      .values(insertTip)
      .returning();
    return tip;
  }
  
  async updateMotivationTip(id: number, updateData: Partial<MotivationTip>): Promise<MotivationTip | undefined> {
    const [updatedTip] = await db
      .update(motivationTips)
      .set(updateData)
      .where(eq(motivationTips.id, id))
      .returning();
    return updatedTip;
  }
  
  // Profile Completion operations
  async getProfileCompletionItems(userType?: string): Promise<ProfileCompletionItem[]> {
    if (userType) {
      return db
        .select()
        .from(profileCompletionItems)
        .where(
          or(
            eq(profileCompletionItems.userType, userType),
            eq(profileCompletionItems.userType, 'both')
          )
        )
        .orderBy(profileCompletionItems.displayOrder);
    } else {
      return db
        .select()
        .from(profileCompletionItems)
        .orderBy(profileCompletionItems.displayOrder);
    }
  }
  
  async getProfileCompletionItem(id: number): Promise<ProfileCompletionItem | undefined> {
    const [item] = await db
      .select()
      .from(profileCompletionItems)
      .where(eq(profileCompletionItems.id, id));
    
    return item;
  }
  
  async createProfileCompletionItem(item: InsertProfileCompletionItem): Promise<ProfileCompletionItem> {
    const [newItem] = await db
      .insert(profileCompletionItems)
      .values(item)
      .returning();
    
    return newItem;
  }
  
  async getUserProfileCompletions(userId: number): Promise<UserProfileCompletion[]> {
    return db
      .select()
      .from(userProfileCompletions)
      .where(eq(userProfileCompletions.userId, userId));
  }
  
  async getUserProfileCompletion(userId: number, itemId: number): Promise<UserProfileCompletion | undefined> {
    const [completion] = await db
      .select()
      .from(userProfileCompletions)
      .where(
        and(
          eq(userProfileCompletions.userId, userId),
          eq(userProfileCompletions.itemId, itemId)
        )
      );
    
    return completion;
  }
  
  async createUserProfileCompletion(completion: InsertUserProfileCompletion): Promise<UserProfileCompletion> {
    const [newCompletion] = await db
      .insert(userProfileCompletions)
      .values({
        ...completion,
        completedAt: completion.completed ? new Date() : null
      })
      .returning();
    
    return newCompletion;
  }
  
  async updateUserProfileCompletion(userId: number, itemId: number, completed: boolean): Promise<UserProfileCompletion | undefined> {
    const [updatedCompletion] = await db
      .update(userProfileCompletions)
      .set({
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userProfileCompletions.userId, userId),
          eq(userProfileCompletions.itemId, itemId)
        )
      )
      .returning();
    
    return updatedCompletion;
  }
  
  async calculateProfileCompletionPercentage(userId: number): Promise<number> {
    // Dapatkan user untuk mengetahui tipenya
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return 0;
    }
    
    // Dapatkan semua item yang relevan berdasarkan tipe user
    const items = await this.getProfileCompletionItems(user.type);
    
    if (items.length === 0) {
      return 0;
    }
    
    // Dapatkan semua status completion user
    const completions = await this.getUserProfileCompletions(userId);
    
    // Hitung jumlah item yang sudah selesai
    const completedItems = completions.filter(c => c.completed).length;
    
    // Hitung persentase
    return Math.round((completedItems / items.length) * 100);
  }

  // Leaderboard operations
  async getLeaderboards(options: {
    type?: string,
    category?: string,
    level?: string,
    timeframe?: string,
    isActive?: boolean
  } = {}): Promise<Leaderboard[]> {
    let query = db.select().from(leaderboards);
    
    if (options.type) {
      query = query.where(eq(leaderboards.type, options.type));
    }
    
    if (options.category) {
      query = query.where(eq(leaderboards.category, options.category));
    }
    
    if (options.level) {
      query = query.where(eq(leaderboards.level, options.level));
    }
    
    if (options.timeframe) {
      query = query.where(eq(leaderboards.timeframe, options.timeframe));
    }
    
    if (options.isActive !== undefined) {
      query = query.where(eq(leaderboards.isActive, options.isActive));
    }
    
    return await query.orderBy(desc(leaderboards.createdAt));
  }
  
  async getLeaderboard(id: number): Promise<Leaderboard | undefined> {
    const [leaderboard] = await db.select()
      .from(leaderboards)
      .where(eq(leaderboards.id, id));
    
    return leaderboard;
  }
  
  async createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard> {
    const [newLeaderboard] = await db.insert(leaderboards)
      .values(leaderboard)
      .returning();
      
    return newLeaderboard;
  }
  
  async updateLeaderboard(id: number, data: Partial<Leaderboard>): Promise<Leaderboard | undefined> {
    const [updatedLeaderboard] = await db.update(leaderboards)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(leaderboards.id, id))
      .returning();
      
    return updatedLeaderboard;
  }
  
  // Leaderboard Entry operations
  async getLeaderboardEntries(leaderboardId: number, options: {
    limit?: number,
    offset?: number
  } = {}): Promise<LeaderboardEntry[]> {
    let query = db.select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.leaderboardId, leaderboardId))
      .orderBy(leaderboardEntries.rank);
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }
  
  async getUserLeaderboardEntry(leaderboardId: number, userId: number): Promise<LeaderboardEntry | undefined> {
    const [entry] = await db.select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.leaderboardId, leaderboardId),
          eq(leaderboardEntries.userId, userId)
        )
      );
      
    return entry;
  }
  
  async createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    // Calculate rank before inserting
    const rank = await this.calculateUserRank(entry.leaderboardId, entry.userId);
    
    const [newEntry] = await db.insert(leaderboardEntries)
      .values({
        ...entry,
        rank,
        lastUpdated: new Date()
      })
      .returning();
      
    return newEntry;
  }
  
  async updateLeaderboardEntry(leaderboardId: number, userId: number, data: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | undefined> {
    const [updatedEntry] = await db.update(leaderboardEntries)
      .set({
        ...data,
        lastUpdated: new Date()
      })
      .where(
        and(
          eq(leaderboardEntries.leaderboardId, leaderboardId),
          eq(leaderboardEntries.userId, userId)
        )
      )
      .returning();
      
    return updatedEntry;
  }
  
  async calculateUserRank(leaderboardId: number, userId: number): Promise<number> {
    // Get user's score first
    const userEntry = await this.getUserLeaderboardEntry(leaderboardId, userId);
    
    if (!userEntry) {
      // If user doesn't have an entry yet, get count of all entries + 1
      const count = await db.select({ count: sql`count(*)` })
        .from(leaderboardEntries)
        .where(eq(leaderboardEntries.leaderboardId, leaderboardId));
      
      return count[0].count as number + 1;
    }
    
    // Count entries with higher score
    const betterScores = await db.select({ count: sql`count(*)` })
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.leaderboardId, leaderboardId),
          sql`${leaderboardEntries.score} > ${userEntry.score}`
        )
      );
      
    // Rank is number of better scores + 1
    return (betterScores[0].count as number) + 1;
  }
  
  async refreshLeaderboard(leaderboardId: number): Promise<boolean> {
    // Get all entries for this leaderboard
    const entries = await db.select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.leaderboardId, leaderboardId))
      .orderBy(desc(leaderboardEntries.score)); // Sort by score descending
    
    // Update ranks
    let currentRank = 1;
    let lastScore = Number.MAX_SAFE_INTEGER;
    
    for (const entry of entries) {
      // If scores are tied, give same rank
      if (entry.score < lastScore) {
        currentRank = entries.indexOf(entry) + 1;
        lastScore = entry.score;
      }
      
      // Update rank
      await db.update(leaderboardEntries)
        .set({
          rank: currentRank,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(leaderboardEntries.leaderboardId, leaderboardId),
            eq(leaderboardEntries.userId, entry.userId)
          )
        );
    }
    
    return true;
  }
}

export const storage = new DatabaseStorage();