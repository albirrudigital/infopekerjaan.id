import { Request, Response } from 'express';
import { JobPostingService } from '../services/job-posting-service';
import { authenticateToken } from '../middleware/auth';

export class JobPostingController {
  private jobPostingService: JobPostingService;

  constructor() {
    this.jobPostingService = new JobPostingService();
  }

  public createJobPosting = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Check job posting limit
      await this.jobPostingService.checkJobPostingLimit(userId);

      const job = await this.jobPostingService.createJobPosting(userId, {
        ...data,
        batas_lamaran: new Date(data.batas_lamaran)
      });

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public updateJobPosting = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      const data = req.body;

      const job = await this.jobPostingService.updateJobPosting(userId, jobId, {
        ...data,
        batas_lamaran: data.batas_lamaran ? new Date(data.batas_lamaran) : undefined
      });

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error updating job posting:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public getJobPostings = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobs = await this.jobPostingService.getJobPostings(userId);

      // Get views for each job
      const jobsWithViews = await Promise.all(
        jobs.map(async (job) => {
          const views = await this.jobPostingService.getJobViews(job.id);
          return {
            ...job,
            views,
            applications: job.applications.length
          };
        })
      );

      res.json({
        success: true,
        data: jobsWithViews
      });
    } catch (error) {
      console.error('Error getting job postings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public getJobPosting = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);

      const job = await this.jobPostingService.getJobPosting(userId, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job posting not found'
        });
      }

      const views = await this.jobPostingService.getJobViews(jobId);

      res.json({
        success: true,
        data: {
          ...job,
          views,
          applications: job.applications.length
        }
      });
    } catch (error) {
      console.error('Error getting job posting:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public deleteJobPosting = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);

      await this.jobPostingService.deleteJobPosting(userId, jobId);

      res.json({
        success: true,
        message: 'Job posting deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job posting:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public publishJobPosting = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);

      // Check job posting limit
      await this.jobPostingService.checkJobPostingLimit(userId);

      const job = await this.jobPostingService.publishJobPosting(userId, jobId);

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error publishing job posting:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public unpublishJobPosting = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);

      const job = await this.jobPostingService.unpublishJobPosting(userId, jobId);

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error unpublishing job posting:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public getPremiumFeatures = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const features = await this.jobPostingService.getPremiumFeatures(userId);

      res.json({
        success: true,
        data: features
      });
    } catch (error) {
      console.error('Error getting premium features:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  public handleJobExpiry = async (req: Request, res: Response) => {
    try {
      const { action } = req.query;
      
      if (action === 'check') {
        // Check for jobs expiring in 3 days
        await this.jobPostingService.checkExpiringJobs();
        res.json({ success: true, message: 'Expiry check completed' });
      } else if (action === 'process') {
        // Process expired jobs
        await this.jobPostingService.handleAutoExpiry();
        res.json({ success: true, message: 'Auto expiry processing completed' });
      } else {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use "check" or "process"' 
        });
      }
    } catch (error) {
      console.error('Error handling job expiry:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public boostJobPosting = async (req: Request, res: Response) => {
    try {
      const { jobId, boostType } = req.body;
      const userId = req.user.id;

      // Validate boost type
      if (!['standard', 'premium', 'enterprise'].includes(boostType)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid boost type. Use standard, premium, or enterprise' 
        });
      }

      const result = await this.jobPostingService.boostJobPosting(userId, jobId, boostType);
      res.json(result);
    } catch (error) {
      console.error('Error boosting job posting:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getJobAnalytics = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;
      const { type = 'basic' } = req.query;

      // Verify job ownership
      const job = await this.jobPostingService.getJobPosting(userId, parseInt(jobId));
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job posting not found' });
      }

      let analytics;
      if (type === 'advanced') {
        analytics = await this.jobPostingService.getAdvancedJobAnalytics(parseInt(jobId));
      } else {
        analytics = await this.jobPostingService.getJobAnalytics(parseInt(jobId));
      }

      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error('Error getting job analytics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public broadcastJobToCandidates = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      // Verify job ownership
      const job = await this.jobPostingService.getJobPosting(userId, parseInt(jobId));
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job posting not found' });
      }

      await this.jobPostingService.broadcastJobToCandidates(parseInt(jobId));
      res.json({ success: true, message: 'Job broadcasted to matching candidates' });
    } catch (error) {
      console.error('Error broadcasting job:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public getJobSuggestions = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;

      // Verify job ownership
      const job = await this.jobPostingService.getJobPosting(userId, parseInt(jobId));
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job posting not found' });
      }

      const suggestions = await this.jobPostingService.getJobSuggestions(parseInt(jobId));
      res.json({ success: true, data: suggestions });
    } catch (error) {
      console.error('Error getting job suggestions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public createJobFairEvent = async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const userId = req.user.id;

      // Verify user is employer
      if (req.user.role !== 'employer') {
        return res.status(403).json({ 
          success: false, 
          error: 'Only employers can create job fair events' 
        });
      }

      // Validate required fields
      const requiredFields = ['title', 'description', 'startDate', 'endDate', 'maxParticipants'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      const event = await this.jobPostingService.createJobFairEvent({
        ...data,
        createdBy: userId
      });

      res.json({ success: true, data: event });
    } catch (error) {
      console.error('Error creating job fair event:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  public enhanceJobMatching = async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      // Verify job ownership
      const job = await this.jobPostingService.getJobPosting(userId, parseInt(jobId));
      if (!job) {
        return res.status(404).json({ success: false, error: 'Job posting not found' });
      }

      const matchingResults = await this.jobPostingService.enhanceJobMatching(parseInt(jobId));
      
      // Apply limit to matching candidates
      if (matchingResults.matchingCandidates) {
        matchingResults.matchingCandidates = matchingResults.matchingCandidates
          .slice(0, parseInt(limit as string));
      }

      res.json({ success: true, data: matchingResults });
    } catch (error) {
      console.error('Error enhancing job matching:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
} 