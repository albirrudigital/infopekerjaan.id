import { db } from '../db';
import { users, premiumSubscriptions, paymentTransactions, userReferrals } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class LeaderboardService {
  async getActiveUsersLeaderboard(limit: number = 10) {
    const activeUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.lastActive)],
      limit
    });

    return activeUsers.map(user => ({
      userId: user.id,
      name: user.name,
      score: this.calculateActivityScore(user.lastActive),
      type: 'active' as const
    }));
  }

  async getTopReferrers(limit: number = 10) {
    const topReferrers = await db.query.userReferrals.findMany({
      orderBy: (referrals, { desc }) => [desc(referrals.referralCount)],
      limit
    });

    return Promise.all(topReferrers.map(async referral => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, referral.referrerId)
      });

      return {
        userId: referral.referrerId,
        name: user?.name || 'Unknown',
        score: referral.referralCount,
        type: 'referrer' as const
      };
    }));
  }

  async getTopPayingCustomers(limit: number = 10) {
    const topPaying = await db.query.paymentTransactions.findMany({
      orderBy: (transactions, { desc }) => [desc(transactions.amount)],
      limit
    });

    return Promise.all(topPaying.map(async transaction => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, transaction.userId)
      });

      return {
        userId: transaction.userId,
        name: user?.name || 'Unknown',
        score: transaction.amount,
        type: 'paying' as const
      };
    }));
  }

  private calculateActivityScore(lastActive: Date): number {
    const now = new Date();
    const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    // Score decreases with time since last activity
    // Max score is 100, decreases by 1 point per hour
    return Math.max(0, 100 - hoursSinceLastActive);
  }
} 