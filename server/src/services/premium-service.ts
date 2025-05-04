import { db } from '../db';
import { premiumSubscriptions, premiumFeatures, userPremiumFeatures } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

export class PremiumService {
  // Check if user has active subscription
  async hasActiveSubscription(userId: number): Promise<boolean> {
    const now = new Date();
    const subscription = await db.query.premiumSubscriptions.findFirst({
      where: and(
        eq(premiumSubscriptions.userId, userId),
        eq(premiumSubscriptions.status, 'active'),
        or(
          eq(premiumSubscriptions.endDate, null),
          eq(premiumSubscriptions.endDate, now)
        )
      )
    });
    return !!subscription;
  }

  // Get user's subscription plan
  async getUserSubscription(userId: number) {
    return await db.query.premiumSubscriptions.findFirst({
      where: eq(premiumSubscriptions.userId, userId),
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)]
    });
  }

  // Get all premium features for a user
  async getUserPremiumFeatures(userId: number) {
    return await db.query.userPremiumFeatures.findMany({
      where: eq(userPremiumFeatures.userId, userId),
      with: {
        feature: true
      }
    });
  }

  // Check if user has access to a specific feature
  async hasFeatureAccess(userId: number, featureName: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;

    const feature = await db.query.premiumFeatures.findFirst({
      where: eq(premiumFeatures.name, featureName)
    });

    if (!feature) return false;

    // Check if feature is included in user's plan
    return feature.planType === subscription.planType;
  }

  // Create new subscription
  async createSubscription(userId: number, planType: string, duration: number) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    return await db.insert(premiumSubscriptions).values({
      userId,
      planType,
      startDate,
      endDate,
      status: 'active'
    });
  }

  // Cancel subscription
  async cancelSubscription(userId: number) {
    return await db.update(premiumSubscriptions)
      .set({ status: 'cancelled' })
      .where(eq(premiumSubscriptions.userId, userId));
  }

  // Get all available premium features
  async getAllPremiumFeatures() {
    return await db.query.premiumFeatures.findMany();
  }

  // Get features by plan type
  async getFeaturesByPlan(planType: string) {
    return await db.query.premiumFeatures.findMany({
      where: eq(premiumFeatures.planType, planType)
    });
  }
} 