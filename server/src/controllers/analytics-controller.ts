import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics-service';
import { PredictiveAnalyticsService } from '../services/predictive-analytics-service';
import { LeaderboardService } from '../services/leaderboard-service';
import { isAdmin } from '../middleware/auth';

export class AnalyticsController {
  private analyticsService: AnalyticsService;
  private predictiveService: PredictiveAnalyticsService;
  private leaderboardService: LeaderboardService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.predictiveService = new PredictiveAnalyticsService();
    this.leaderboardService = new LeaderboardService();
  }

  // Get current metrics
  async getCurrentMetrics(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const companyId = req.query.companyId as string;
      const metrics = await this.analyticsService.updateMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error('Error getting current metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get metrics for date range
  async getMetricsByDateRange(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate, companyId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const metrics = await this.analyticsService.getMetrics(
        new Date(startDate as string),
        new Date(endDate as string),
        companyId as string
      );

      res.json(metrics);
    } catch (error) {
      console.error('Error getting metrics by date range:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get revenue by plan type
  async getRevenueByPlan(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate, companyId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const revenue = await this.analyticsService.getRevenueByPlan(
        new Date(startDate as string),
        new Date(endDate as string),
        companyId as string
      );

      res.json(revenue);
    } catch (error) {
      console.error('Error getting revenue by plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get cohort analysis
  async getCohortAnalysis(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const companyId = req.query.companyId as string;
      const cohortData = await this.analyticsService.getCohortAnalysis(companyId);
      res.json(cohortData);
    } catch (error) {
      console.error('Error getting cohort analysis:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get conversion funnel
  async getConversionFunnel(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const companyId = req.query.companyId as string;
      const funnelData = await this.analyticsService.getConversionFunnel(companyId);
      res.json(funnelData);
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate monthly report
  async generateMonthlyReport(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const companyId = req.query.companyId as string;
      const report = await this.analyticsService.generateMonthlyReport(companyId);
      res.json(report);
    } catch (error) {
      console.error('Error generating monthly report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPredictions(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await this.predictiveService.trainModel();
      const predictions = await this.predictiveService.predictNextMonthMetrics();
      res.json(predictions);
    } catch (error) {
      console.error('Error getting predictions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getChurnRisk(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const churnRisks = await this.predictiveService.predictChurnRisk();
      res.json(churnRisks);
    } catch (error) {
      console.error('Error getting churn risk:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { type } = req.query;
      let leaderboard;

      switch (type) {
        case 'active':
          leaderboard = await this.leaderboardService.getActiveUsersLeaderboard();
          break;
        case 'referrer':
          leaderboard = await this.leaderboardService.getTopReferrers();
          break;
        case 'paying':
          leaderboard = await this.leaderboardService.getTopPayingCustomers();
          break;
        default:
          return res.status(400).json({ error: 'Invalid leaderboard type' });
      }

      res.json(leaderboard);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 