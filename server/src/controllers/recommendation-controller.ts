import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation-service';
import { authenticateToken } from '../middleware/auth';

export class RecommendationController {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
  }

  public getRecommendations = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await this.recommendationService.generateRecommendations(userId, limit);
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommendations'
      });
    }
  };

  public trainModel = async (req: Request, res: Response) => {
    try {
      // Only allow admin users to train model
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      await this.recommendationService.trainModel();
      
      res.json({
        success: true,
        message: 'Model trained successfully'
      });
    } catch (error) {
      console.error('Error training model:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to train model'
      });
    }
  };
} 