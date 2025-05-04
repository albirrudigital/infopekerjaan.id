import express from 'express';
import { AnalyticsController } from '../controllers/analytics-controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const analyticsController = new AnalyticsController();

// Get current metrics for a specific company or global
router.get('/metrics/current', authenticateToken, analyticsController.getCurrentMetrics.bind(analyticsController));

// Get metrics for a date range for a specific company or global
router.get('/metrics/range', authenticateToken, analyticsController.getMetricsByDateRange.bind(analyticsController));

// Get revenue by plan type for a specific company or global
router.get('/revenue/plans', authenticateToken, analyticsController.getRevenueByPlan.bind(analyticsController));

// Get cohort analysis for a specific company or global
router.get('/cohorts', authenticateToken, analyticsController.getCohortAnalysis.bind(analyticsController));

// Get conversion funnel for a specific company or global
router.get('/funnel', authenticateToken, analyticsController.getConversionFunnel.bind(analyticsController));

// Generate monthly report for a specific company or global
router.post('/report/monthly', authenticateToken, analyticsController.generateMonthlyReport.bind(analyticsController));

// Get predictions
router.get('/predictions', authenticateToken, analyticsController.getPredictions.bind(analyticsController));

// Get churn risk
router.get('/churn-risk', authenticateToken, analyticsController.getChurnRisk.bind(analyticsController));

// Get leaderboard
router.get('/leaderboard', authenticateToken, analyticsController.getLeaderboard.bind(analyticsController));

export default router; 