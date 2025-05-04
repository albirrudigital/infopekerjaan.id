import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation-controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const recommendationController = new RecommendationController();

// Get job recommendations for current user
router.get('/recommendations', authenticateToken, recommendationController.getRecommendations);

// Train recommendation model (admin only)
router.post('/recommendations/train', authenticateToken, recommendationController.trainModel);

export default router; 