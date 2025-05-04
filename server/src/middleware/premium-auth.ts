import { Request, Response, NextFunction } from 'express';
import { PremiumService } from '../services/premium-service';

const premiumService = new PremiumService();

export const requirePremiumFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const hasAccess = await premiumService.hasFeatureAccess(userId, featureName);
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Premium feature required',
          feature: featureName,
          upgradeUrl: '/premium/upgrade'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const hasActiveSubscription = await premiumService.hasActiveSubscription(userId);
    if (!hasActiveSubscription) {
      return res.status(403).json({ 
        message: 'Subscription required',
        upgradeUrl: '/premium/upgrade'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}; 