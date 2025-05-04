import { Router } from 'express';
import { PremiumService } from '../services/premium-service';
import { requireAuth } from '../middleware/auth';
import { requirePremiumFeature, checkSubscriptionStatus } from '../middleware/premium-auth';

const router = Router();
const premiumService = new PremiumService();

// Get all available premium features
router.get('/features', requireAuth, async (req, res) => {
  try {
    const features = await premiumService.getAllPremiumFeatures();
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching premium features' });
  }
});

// Get user's subscription status
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const subscription = await premiumService.getUserSubscription(req.user.id);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
});

// Create new subscription
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { planType, duration } = req.body;
    const subscription = await premiumService.createSubscription(req.user.id, planType, duration);
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    await premiumService.cancelSubscription(req.user.id);
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

// Chat system (premium feature)
router.get('/chat/messages', requireAuth, checkSubscriptionStatus, async (req, res) => {
  try {
    // Implement chat message retrieval
    res.json({ message: 'Chat messages retrieved' });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chat messages' });
  }
});

// Job recommendations (premium feature)
router.get('/recommendations', requireAuth, requirePremiumFeature('Job Recommendations'), async (req, res) => {
  try {
    // Implement job recommendations
    res.json({ message: 'Job recommendations retrieved' });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving job recommendations' });
  }
});

export default router; 