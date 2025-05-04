import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertJobSchema, insertCompanySchema, insertApplicationSchema, 
  insertJobseekerProfileSchema, insertCompanyRegulationSchema,
  insertNotificationSchema, insertNotificationPreferencesSchema,
  users, jobs, companies, applications
} from "@shared/schema";
import { setupNotificationServices } from "./email";
import { NotificationType } from "./email/notification-service";
import * as notificationStorage from "./storage_notification";
import { setupAchievementRoutes } from "./routes/achievement-routes";
import { moodRouter } from "./routes/mood-routes";
import { motivationTipsRouter } from "./routes/motivation-tips-routes";
import { registerProfileCompletionRoutes } from "./routes/profile-completion-routes";
import { setupLeaderboardRoutes } from "./routes/leaderboard-routes";
import careerSimulatorRoutes from "./routes/career-simulator-routes";
import interviewPreparationRoutes from "./routes/interview-preparation-routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { eq, sql, desc, and, like, or } from 'drizzle-orm';

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Check if user is authenticated and is an employer
function isEmployer(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user!.type !== "employer" && req.user!.type !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
}

// Check if user is authenticated and is a jobseeker
function isJobseeker(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user!.type !== "jobseeker" && req.user!.type !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
}

// Check if user is authenticated and is an admin
function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user!.type !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Setup email notification services
  const notificationService = setupNotificationServices(app);
  
  // Setup achievement routes
  setupAchievementRoutes(app);
  
  // Setup mood and motivation routes
  app.use("/api/mood", moodRouter);
  app.use("/api/motivation-tips", motivationTipsRouter);
  
  // Setup profile completion routes
  registerProfileCompletionRoutes(app);
  
  // Setup leaderboard routes
  setupLeaderboardRoutes(app);
  
  // Setup career simulator routes
  app.use("/api/career-simulator", careerSimulatorRoutes);
  
  // Setup interview preparation routes
  app.use("/api/interview-preparation", interviewPreparationRoutes);
  
  // Admin Routes
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Count users
      const usersCount = await db.select({ count: sql`count(*)` }).from(users);
      
      // Count jobs
      const jobsCount = await db.select({ count: sql`count(*)` }).from(jobs);
      
      // Count companies
      const companiesCount = await db.select({ count: sql`count(*)` }).from(companies);
      
      // Count applications
      const applicationsCount = await db.select({ count: sql`count(*)` }).from(applications);
      
      // User type statistics
      const userTypeStats = await db
        .select({
          type: users.type,
          count: sql`count(*)`
        })
        .from(users)
        .groupBy(users.type);
      
      // Job status (active/inactive) statistics
      const jobStatusStats = await db
        .select({
          status: jobs.isActive,
          count: sql`count(*)`
        })
        .from(jobs)
        .groupBy(jobs.isActive);
      
      // Application status statistics
      const applicationStatusStats = await db
        .select({
          status: applications.status,
          count: sql`count(*)`
        })
        .from(applications)
        .groupBy(applications.status);
      
      // Recent users (past 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsers = await db
        .select({
          date: sql`date_trunc('day', ${users.createdAt})`,
          count: sql`count(*)`
        })
        .from(users)
        .where(sql`${users.createdAt} >= ${sevenDaysAgo}`)
        .groupBy(sql`date_trunc('day', ${users.createdAt})`)
        .orderBy(sql`date_trunc('day', ${users.createdAt})`);
      
      res.json({
        counts: {
          users: parseInt(usersCount[0].count.toString()),
          jobs: parseInt(jobsCount[0].count.toString()),
          companies: parseInt(companiesCount[0].count.toString()),
          applications: parseInt(applicationsCount[0].count.toString())
        },
        userTypeStats,
        jobStatusStats,
        applicationStatusStats,
        recentUsers
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });
  
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { query, type } = req.query;
      
      let whereClause = sql`1=1`;
      
      if (query) {
        whereClause = and(
          whereClause,
          or(
            like(users.username, `%${query}%`),
            like(users.email, `%${query}%`),
            like(users.fullName, `%${query}%`)
          )
        );
      }
      
      if (type) {
        whereClause = and(whereClause, eq(users.type, type as string));
      }
      
      const usersList = await db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(50);
      
      res.json(usersList);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let result: any = { user };
      
      // Get additional data based on user type
      if (user.type === "jobseeker") {
        // Get jobseeker profile
        const profile = await storage.getJobseekerProfile(userId);
        
        // Get applications
        const applications = await storage.getApplicationsByJobseeker(userId);
        
        result = {
          ...result,
          profile,
          applications
        };
      } else if (user.type === "employer") {
        // Get companies owned by this employer
        const companies = await storage.getCompaniesByEmployer(userId);
        
        // Get jobs posted by this employer
        const jobs = await storage.getJobsByEmployer(userId);
        
        result = {
          ...result,
          companies,
          jobs
        };
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });
  
  app.post("/api/admin/login-as/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Store admin user in session for returning later
      req.session.adminId = req.user!.id;
      
      // Login as the requested user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to login as user" });
        }
        
        res.json({ success: true, user });
      });
    } catch (error) {
      console.error("Error logging in as user:", error);
      res.status(500).json({ message: "Failed to login as user" });
    }
  });
  
  app.post("/api/admin/return", async (req, res) => {
    try {
      if (!req.session.adminId) {
        return res.status(400).json({ message: "No admin session found" });
      }
      
      const adminId = req.session.adminId;
      
      const [adminUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, adminId));
      
      if (!adminUser || adminUser.type !== "admin") {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      // Clear the admin ID from session
      delete req.session.adminId;
      
      // Login as the admin user
      req.login(adminUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to return to admin" });
        }
        
        res.json({ success: true, user: adminUser });
      });
    } catch (error) {
      console.error("Error returning to admin:", error);
      res.status(500).json({ message: "Failed to return to admin" });
    }
  });
  
  // Admin Companies Management
  app.get("/api/admin/companies", isAdmin, async (req, res) => {
    try {
      const { query, status } = req.query;
      
      let whereClause = sql`1=1`;
      
      if (query) {
        whereClause = and(
          whereClause,
          or(
            like(companies.name, `%${query}%`),
            like(companies.description, `%${query}%`),
            like(companies.location, `%${query}%`),
            like(companies.industry, `%${query}%`)
          )
        );
      }
      
      if (status === "verified") {
        whereClause = and(whereClause, eq(companies.verified, true));
      } else if (status === "unverified") {
        whereClause = and(whereClause, eq(companies.verified, false));
      }
      
      const companiesList = await db
        .select({
          id: companies.id,
          name: companies.name,
          description: companies.description,
          location: companies.location,
          industry: companies.industry,
          logo: companies.logo,
          website: companies.website,
          employerId: companies.employerId,
          verified: companies.verified,
          createdAt: companies.createdAt
        })
        .from(companies)
        .where(whereClause)
        .orderBy(desc(companies.createdAt))
        .limit(50);
      
      res.json(companiesList);
    } catch (error) {
      console.error("Error fetching admin companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  
  app.get("/api/admin/companies/:id", isAdmin, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId));
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Get owner details
      const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.id, company.employerId));
      
      // Get jobs from this company
      const jobsList = await db
        .select()
        .from(jobs)
        .where(eq(jobs.companyId, companyId))
        .orderBy(desc(jobs.createdAt));
      
      res.json({
        company,
        owner,
        jobs: jobsList
      });
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });
  
  app.put("/api/admin/companies/:id/verify", isAdmin, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const { verified } = req.body;
      
      if (typeof verified !== "boolean") {
        return res.status(400).json({ message: "Invalid verified status" });
      }
      
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId));
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Update company verified status
      const [updatedCompany] = await db
        .update(companies)
        .set({ verified })
        .where(eq(companies.id, companyId))
        .returning();
      
      res.json(updatedCompany);
    } catch (error) {
      console.error("Error updating company verified status:", error);
      res.status(500).json({ message: "Failed to update company verified status" });
    }
  });
  
  // Admin Jobs Management
  app.get("/api/admin/jobs", isAdmin, async (req, res) => {
    try {
      const { query, status } = req.query;
      
      let whereClause = sql`1=1`;
      
      if (query) {
        whereClause = and(
          whereClause,
          or(
            like(jobs.title, `%${query}%`),
            like(jobs.description, `%${query}%`),
            like(jobs.location, `%${query}%`),
            like(jobs.industry, `%${query}%`)
          )
        );
      }
      
      if (status === "active") {
        whereClause = and(whereClause, eq(jobs.isActive, true));
      } else if (status === "inactive") {
        whereClause = and(whereClause, eq(jobs.isActive, false));
      }
      
      // Join with companies to get company names
      const jobsList = await db
        .select({
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          location: jobs.location,
          industry: jobs.industry,
          salary: jobs.salary,
          skills: jobs.skills,
          type: jobs.type,
          companyId: jobs.companyId,
          companyName: companies.name,
          isActive: jobs.isActive,
          createdAt: jobs.createdAt
        })
        .from(jobs)
        .leftJoin(companies, eq(jobs.companyId, companies.id))
        .where(whereClause)
        .orderBy(desc(jobs.createdAt))
        .limit(50);
      
      res.json(jobsList);
    } catch (error) {
      console.error("Error fetching admin jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  
  app.get("/api/admin/jobs/:id", isAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get company details
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, job.companyId));
      
      // Get applications for this job
      const jobApplications = await db
        .select({
          id: applications.id,
          status: applications.status,
          jobseekerId: applications.jobseekerId,
          cv: applications.cv,
          coverLetter: applications.coverLetter,
          appliedAt: applications.appliedAt,
          userName: users.fullName
        })
        .from(applications)
        .leftJoin(users, eq(applications.jobseekerId, users.id))
        .where(eq(applications.jobId, jobId))
        .orderBy(desc(applications.appliedAt));
      
      res.json({
        job,
        company,
        applications: jobApplications
      });
    } catch (error) {
      console.error("Error fetching job details:", error);
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });
  
  app.put("/api/admin/jobs/:id/toggle-active", isAdmin, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "Invalid isActive status" });
      }
      
      const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Update job active status
      const [updatedJob] = await db
        .update(jobs)
        .set({ isActive })
        .where(eq(jobs.id, jobId))
        .returning();
      
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job active status:", error);
      res.status(500).json({ message: "Failed to update job active status" });
    }
  });

  // API Routes
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const { 
        limit, 
        offset,
        query, 
        location, 
        companyId, 
        industry,
        type 
      } = req.query;
      
      const jobs = await storage.getJobs({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        query: query as string,
        location: location as string,
        companyId: companyId ? parseInt(companyId as string) : undefined,
        industry: industry as string,
        type: type as string
      });
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Get company information
      const company = await storage.getCompany(job.companyId);
      
      res.json({ job, company });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  app.post("/api/jobs", isEmployer, async (req, res) => {
    try {
      const validatedData = insertJobSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid job data", errors: validatedData.error.errors });
      }
      
      // Make sure the company belongs to the employer
      const company = await storage.getCompany(validatedData.data.companyId);
      if (!company || company.employerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to post jobs for this company" });
      }
      
      const job = await storage.createJob({
        ...validatedData.data,
        postedBy: req.user.id
      });
      
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", isEmployer, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if the job belongs to the employer
      if (job.postedBy !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to edit this job" });
      }
      
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const companies = await storage.getTopCompanies(limit);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Get jobs from this company
      const jobs = await storage.getJobsByCompany(companyId);
      
      res.json({ company, jobs });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  app.post("/api/companies", isEmployer, async (req, res) => {
    try {
      const validatedData = insertCompanySchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid company data", errors: validatedData.error.errors });
      }
      
      const company = await storage.createCompany({
        ...validatedData.data,
        employerId: req.user.id
      });
      
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", isEmployer, async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Check if the company belongs to the employer
      if (company.employerId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to edit this company" });
      }
      
      const updatedCompany = await storage.updateCompany(companyId, req.body);
      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.get("/api/my-companies", isEmployer, async (req, res) => {
    try {
      const companies = await storage.getCompaniesByEmployer(req.user.id);
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Applications
  app.post("/api/applications", isJobseeker, upload.single("cv"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "CV file is required" });
      }
      
      const applicationData = {
        ...req.body,
        jobId: parseInt(req.body.jobId),
        jobseekerId: req.user.id,
        cv: req.file.path
      };
      
      const validatedData = insertApplicationSchema.safeParse(applicationData);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid application data", errors: validatedData.error.errors });
      }
      
      // Check if the job exists
      const job = await storage.getJob(validatedData.data.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if the user already applied for this job
      const existingApplications = await storage.getApplicationsByJobseeker(req.user.id);
      const alreadyApplied = existingApplications.some(app => app.jobId === validatedData.data.jobId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }
      
      const application = await storage.createApplication(validatedData.data);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get("/api/my-applications", isJobseeker, async (req, res) => {
    try {
      const applications = await storage.getApplicationsByJobseeker(req.user.id);
      
      // Get job details for each application
      const applicationDetails = await Promise.all(
        applications.map(async (application) => {
          const job = await storage.getJob(application.jobId);
          const company = job ? await storage.getCompany(job.companyId) : null;
          
          return {
            ...application,
            job,
            company
          };
        })
      );
      
      res.json(applicationDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/jobs/:jobId/applications", isEmployer, async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if the job belongs to the employer
      if (job.postedBy !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to view these applications" });
      }
      
      const applications = await storage.getApplicationsByJob(jobId);
      
      // Get jobseeker details for each application
      const applicationDetails = await Promise.all(
        applications.map(async (application) => {
          const user = await storage.getUser(application.jobseekerId);
          const profile = user ? await storage.getJobseekerProfile(user.id) : null;
          
          return {
            ...application,
            user,
            profile
          };
        })
      );
      
      res.json(applicationDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put("/api/applications/:id/status", isEmployer, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "reviewed", "shortlisted", "rejected", "hired"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if the job belongs to the employer
      const job = await storage.getJob(application.jobId);
      
      if (!job || job.postedBy !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this application" });
      }
      
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Jobseeker Profile
  app.get("/api/profile", isJobseeker, async (req, res) => {
    try {
      const profile = await storage.getJobseekerProfile(req.user.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isJobseeker, async (req, res) => {
    try {
      // First check if user already has a profile
      const existingProfile = await storage.getJobseekerProfile(req.user.id);
      
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists. Use PUT to update" });
      }
      
      const profileData = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedData = insertJobseekerProfileSchema.safeParse(profileData);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid profile data", errors: validatedData.error.errors });
      }
      
      const profile = await storage.createJobseekerProfile(validatedData.data);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile", isJobseeker, async (req, res) => {
    try {
      const updatedProfile = await storage.updateJobseekerProfile(req.user.id, req.body);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Blog Posts
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getBlogPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getBlogPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Labor Regulations and Company Regulations
  app.get("/api/labor-regulations", async (req, res) => {
    try {
      const { limit, offset, province, city, category } = req.query;
      
      const regulations = await storage.getLaborRegulations({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        province: province as string,
        city: city as string,
        category: category as string
      });
      
      res.json(regulations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch labor regulations" });
    }
  });

  app.get("/api/labor-regulations/:id", async (req, res) => {
    try {
      const regulationId = parseInt(req.params.id);
      const regulation = await storage.getLaborRegulation(regulationId);
      
      if (!regulation) {
        return res.status(404).json({ message: "Labor regulation not found" });
      }
      
      res.json(regulation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch labor regulation details" });
    }
  });

  // Company Regulations for Bekasi area
  app.get("/api/company-regulations", async (req, res) => {
    try {
      const { limit, offset, district, city, businessType } = req.query;
      
      const companies = await storage.getCompanyRegulations({
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        district: district as string,
        city: city as string,
        businessType: businessType as string
      });
      
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company regulations" });
    }
  });

  app.get("/api/company-regulations/:id", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompanyRegulation(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company regulation not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company regulation details" });
    }
  });

  // Get Bekasi companies with pagination and filtering
  app.get("/api/bekasi-companies", async (req, res) => {
    try {
      const { limit = '20', offset = '0', district } = req.query;
      
      const options: {
        limit?: number;
        offset?: number;
        district?: string;
        city?: string;
      } = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        city: "Bekasi"
      };
      
      if (district) options.district = district as string;
      
      const companies = await storage.getCompanyRegulations(options);
      
      // Hitung total perusahaan di Bekasi dengan filter yang sama
      const countOptions = { city: "Bekasi" };
      if (district) countOptions.district = district as string;
      
      // Gunakan storage untuk mendapatkan jumlah total
      const totalCount = await storage.getCompanyRegulationsCount(countOptions);
      
      res.status(200).json({
        companies,
        meta: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: totalCount > (parseInt(offset as string) + companies.length)
        }
      });
    } catch (error) {
      console.error("Error fetching Bekasi companies:", error);
      res.status(500).json({ message: "Failed to fetch Bekasi companies" });
    }
  });

  // Import Bekasi company data
  app.post("/api/import-bekasi-companies", async (req, res) => {
    try {
      // This endpoint would be used to import the Bekasi company data
      // Data would be provided in the request body
      const companies = req.body;
      
      if (!Array.isArray(companies)) {
        return res.status(400).json({ message: "Invalid data format. Expected array of companies." });
      }
      
      console.log(`Received ${companies.length} companies for import`);
      
      const importedCompanies = [];
      
      for (const companyData of companies) {
        try {
          if (!companyData.nama_perusahaan || !companyData.alamat) {
            console.log("Skipping company with missing data:", companyData);
            continue;
          }
          
          // Clean up data
          const name = companyData.nama_perusahaan.trim();
          const address = companyData.alamat.trim();
          const district = companyData.kawasan_kecamatan ? companyData.kawasan_kecamatan.trim() : "Bekasi";
          
          const regulationData = {
            name,
            address,
            district,
            city: "Bekasi",
            province: "Jawa Barat",
            businessType: companyData.businessType || "Umum",
            status: "Aktif",
            employeeCount: companyData.employeeCount || 0,
            taxId: companyData.taxId || ""
          };
          
          const validatedData = insertCompanyRegulationSchema.safeParse(regulationData);
          
          if (validatedData.success) {
            const company = await storage.createCompanyRegulation(validatedData.data);
            importedCompanies.push(company);
          } else {
            console.log("Validation failed for company:", name);
            console.log("Validation errors:", validatedData.error.errors);
          }
        } catch (companyError) {
          console.error("Error processing company:", companyError);
          continue; // Skip this company and continue with the next
        }
      }
      
      console.log(`Successfully imported ${importedCompanies.length} companies out of ${companies.length}`);
      
      res.status(201).json({ 
        message: `Successfully imported ${importedCompanies.length} companies`,
        companies: importedCompanies
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Failed to import company data" });
    }
  });

  // Notifikasi
  // Mendapatkan semua notifikasi untuk pengguna yang login
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { limit, offset, unreadOnly } = req.query;
      
      const notifications = await notificationStorage.getNotifications(req.user.id, {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        unreadOnly: unreadOnly === 'true'
      });
      
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mendapatkan detail notifikasi berdasarkan ID
  app.get("/api/notifications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const notificationId = parseInt(req.params.id);
      const notification = await notificationStorage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Pastikan notifikasi milik pengguna yang login
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to view this notification" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error('Error fetching notification details:', error);
      res.status(500).json({ message: "Failed to fetch notification details" });
    }
  });

  // Menandai notifikasi sebagai telah dibaca
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const notificationId = parseInt(req.params.id);
      const notification = await notificationStorage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Pastikan notifikasi milik pengguna yang login
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this notification" });
      }
      
      const updatedNotification = await notificationStorage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Menandai semua notifikasi sebagai telah dibaca
  app.put("/api/notifications/read-all", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const success = await notificationStorage.markAllNotificationsAsRead(req.user.id);
      
      if (success) {
        res.json({ message: "All notifications marked as read" });
      } else {
        res.status(500).json({ message: "Failed to mark all notifications as read" });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Mendapatkan preferensi notifikasi
  app.get("/api/notification-preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      let preferences = await notificationStorage.getNotificationPreferences(req.user.id);
      
      // Jika preferensi belum ada, buat preferensi default
      if (!preferences) {
        preferences = await notificationStorage.createNotificationPreferences({
          userId: req.user.id,
          email: true,
          inApp: true,
          push: false
        });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  // Mengupdate preferensi notifikasi
  app.put("/api/notification-preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { email, inApp, push } = req.body;
      
      // Pastikan tipe data yang dikirim benar
      const updateData = {
        ...(typeof email === 'boolean' ? { email } : {}),
        ...(typeof inApp === 'boolean' ? { inApp } : {}),
        ...(typeof push === 'boolean' ? { push } : {})
      };
      
      // Cek jika preferensi sudah ada
      let preferences = await notificationStorage.getNotificationPreferences(req.user.id);
      
      if (!preferences) {
        // Jika belum ada, buat preferensi baru dengan nilai default diupdate dari input
        preferences = await notificationStorage.createNotificationPreferences({
          userId: req.user.id,
          email: typeof email === 'boolean' ? email : true,
          inApp: typeof inApp === 'boolean' ? inApp : true,
          push: typeof push === 'boolean' ? push : false
        });
      } else {
        // Jika sudah ada, update preferensi
        preferences = await notificationStorage.updateNotificationPreferences(req.user.id, updateData);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Send Test Email - Hanya untuk testing
  app.post("/api/test-email", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Hanya izinkan admin untuk testing fitur email
      if (req.user.type !== "admin") {
        return res.status(403).json({ message: "Only admin can test email feature" });
      }
      
      const { type } = req.body;
      let result = false;
      
      switch (type) {
        case "welcome":
          result = await notificationService.sendWelcomeNotification(req.user!.id);
          break;
        case "application_submitted":
          // Cari aplikasi terakhir dari user
          const applications = await storage.getApplicationsByJobseeker(req.user!.id);
          if (applications.length > 0) {
            const application = applications[0];
            const job = await storage.getJob(application.jobId);
            if (job) {
              result = await notificationService.sendApplicationSubmittedNotification(
                req.user!.id,
                job.id
              );
            }
          }
          break;
        default:
          return res.status(400).json({ message: "Invalid notification type" });
      }
      
      if (result) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Admin Dashboard endpoints
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { query, type, limit, offset } = req.query;
      
      // Ambil semua pengguna dengan opsi filter dan pagination
      const allUsers = await db.select().from(users)
        .where(query ? 
          or(
            like(users.username, `%${query}%`),
            like(users.email, `%${query}%`),
            like(users.fullName, `%${query}%`)
          ) : undefined)
        .where(type ? eq(users.type, type as string) : undefined)
        .limit(limit ? parseInt(limit as string) : 50)
        .offset(offset ? parseInt(offset as string) : 0)
        .orderBy(desc(users.createdAt));
      
      // Hapus password sebelum mengirim respons
      const usersWithoutPassword = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Gagal mengambil data pengguna" });
    }
  });

  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }
      
      // Hapus password sebelum mengirim respons
      const { password, ...userWithoutPassword } = user;
      
      // Ambil data tambahan berdasarkan tipe pengguna
      let additionalData = {};
      
      if (user.type === "jobseeker") {
        const profile = await storage.getJobseekerProfile(userId);
        const applications = await storage.getApplicationsByJobseeker(userId);
        additionalData = { profile, applications };
      } else if (user.type === "employer") {
        const companies = await storage.getCompaniesByEmployer(userId);
        // Ambil semua lowongan yang dimiliki oleh perusahaan-perusahaan
        const jobs = [];
        for (const company of companies) {
          const companyJobs = await storage.getJobsByCompany(company.id);
          jobs.push(...companyJobs);
        }
        additionalData = { companies, jobs };
      }
      
      res.json({ user: userWithoutPassword, ...additionalData });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Gagal mengambil detail pengguna" });
    }
  });

  // Login as another user (admin only)
  app.post("/api/admin/login-as/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const targetUser = await storage.getUser(userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      // Simpan ID admin asli dalam session untuk memungkinkan kembali ke akun admin
      req.session.adminId = req.user!.id;
      
      // Login sebagai pengguna target
      req.login(targetUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Gagal masuk sebagai pengguna" });
        }
        
        // Hapus password sebelum mengirim respons
        const { password, ...userWithoutPassword } = targetUser;
        res.json({ 
          message: "Berhasil masuk sebagai pengguna", 
          user: userWithoutPassword,
          adminMode: true
        });
      });
    } catch (error) {
      console.error("Error logging in as user:", error);
      res.status(500).json({ message: "Gagal masuk sebagai pengguna" });
    }
  });

  // Return to admin account
  app.post("/api/admin/return", async (req, res) => {
    try {
      // Periksa apakah ada adminId dalam session
      if (!req.session.adminId) {
        return res.status(400).json({ message: "Tidak ada sesi admin untuk dikembalikan" });
      }
      
      const adminId = req.session.adminId;
      const adminUser = await storage.getUser(adminId);
      
      if (!adminUser || adminUser.type !== "admin") {
        return res.status(404).json({ message: "Akun admin tidak ditemukan" });
      }
      
      // Hapus adminId dari session
      delete req.session.adminId;
      
      // Login kembali sebagai admin
      req.login(adminUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Gagal kembali ke akun admin" });
        }
        
        // Hapus password sebelum mengirim respons
        const { password, ...userWithoutPassword } = adminUser;
        res.json({ 
          message: "Berhasil kembali ke akun admin", 
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      console.error("Error returning to admin:", error);
      res.status(500).json({ message: "Gagal kembali ke akun admin" });
    }
  });

  // Admin stats dashboard
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      // Get total counts for various entities
      const [
        [{ count: totalUsers }], 
        [{ count: totalJobs }], 
        [{ count: totalCompanies }],
        [{ count: totalApplications }]
      ] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(users),
        db.select({ count: sql`count(*)` }).from(jobs),
        db.select({ count: sql`count(*)` }).from(companies),
        db.select({ count: sql`count(*)` }).from(applications)
      ]);
      
      // Get user counts by type
      const userTypeStats = await db.select({
        type: users.type,
        count: sql`count(*)`
      }).from(users).groupBy(users.type);
      
      // Get job counts by status (active/inactive)
      const jobStatusStats = await db.select({
        status: jobs.isActive,
        count: sql`count(*)`
      }).from(jobs).groupBy(jobs.isActive);
      
      // Get application counts by status
      const applicationStatusStats = await db.select({
        status: applications.status,
        count: sql`count(*)`
      }).from(applications).groupBy(applications.status);
      
      // Get recent registrations (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentUsers = await db.select({
        date: sql`date_trunc('day', ${users.createdAt})`,
        count: sql`count(*)`
      })
      .from(users)
      .where(sql`${users.createdAt} >= ${oneWeekAgo}`)
      .groupBy(sql`date_trunc('day', ${users.createdAt})`)
      .orderBy(sql`date_trunc('day', ${users.createdAt})`);
      
      res.json({
        counts: {
          users: totalUsers,
          jobs: totalJobs,
          companies: totalCompanies,
          applications: totalApplications
        },
        userTypeStats,
        jobStatusStats,
        applicationStatusStats,
        recentUsers
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Gagal mengambil statistik admin" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
