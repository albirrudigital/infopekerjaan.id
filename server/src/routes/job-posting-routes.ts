import { Router } from 'express';
import { JobPostingController } from '../controllers/job-posting-controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const jobPostingController = new JobPostingController();

// Job posting routes
router.post('/job-postings', authenticateToken, jobPostingController.createJobPosting);
router.put('/job-postings/:id', authenticateToken, jobPostingController.updateJobPosting);
router.get('/job-postings', authenticateToken, jobPostingController.getJobPostings);
router.get('/job-postings/:id', authenticateToken, jobPostingController.getJobPosting);
router.delete('/job-postings/:id', authenticateToken, jobPostingController.deleteJobPosting);
router.post('/job-postings/:id/publish', authenticateToken, jobPostingController.publishJobPosting);
router.post('/job-postings/:id/unpublish', authenticateToken, jobPostingController.unpublishJobPosting);

// Premium features routes
router.get('/premium-features', authenticateToken, jobPostingController.getPremiumFeatures);

// Job expiry routes
router.post('/job-postings/expiry', authenticateToken, jobPostingController.handleJobExpiry);

// Boosted job routes
router.post('/job-postings/:id/boost', authenticateToken, jobPostingController.boostJobPosting);

// Analytics routes
router.get('/job-postings/:id/analytics', authenticateToken, jobPostingController.getJobAnalytics);

// Job fair routes
router.post('/job-fair/events', authenticateToken, jobPostingController.createJobFairEvent);

// AI matching routes
router.get('/job-postings/:id/enhanced-matching', authenticateToken, jobPostingController.enhanceJobMatching);

// Email broadcast routes
router.post('/job-postings/:id/broadcast', authenticateToken, jobPostingController.broadcastJobToCandidates);

// AI suggestions routes
router.get('/job-postings/:id/suggestions', authenticateToken, jobPostingController.getJobSuggestions);

export default router; 