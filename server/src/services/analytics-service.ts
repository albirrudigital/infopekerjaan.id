import { db } from '../db';
import { analyticsMetrics, premiumSubscriptions, paymentTransactions, users, companies } from '@shared/schema';
import { eq, gte, lte, and, sql, between } from 'drizzle-orm';
import { EmailService } from './email-service';

interface CompanyMetrics {
  companyId: string;
  totalRevenue: number;
  premiumUsers: number;
  conversionRate: number;
  mrr: number;
  churnRate: number;
  anomalies: string[];
}

export class AnalyticsService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // Update metrics for a specific company or global
  async updateMetrics(companyId?: string): Promise<CompanyMetrics> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Get total revenue for current month
    const revenueWhereClause = companyId
      ? and(
          eq(paymentTransactions.companyId, companyId),
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, startOfMonth),
          lte(paymentTransactions.createdAt, endOfMonth)
        )
      : and(
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, startOfMonth),
          lte(paymentTransactions.createdAt, endOfMonth)
        );

    const revenueResult = await db
      .select({ total: sql<number>`SUM(amount)` })
      .from(paymentTransactions)
      .where(revenueWhereClause);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Get premium users count
    const premiumWhereClause = companyId
      ? and(
          eq(premiumSubscriptions.companyId, companyId),
          eq(premiumSubscriptions.status, 'active')
        )
      : eq(premiumSubscriptions.status, 'active');

    const premiumUsers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(premiumSubscriptions)
      .where(premiumWhereClause);

    // Get total users
    const usersWhereClause = companyId
      ? eq(users.companyId, companyId)
      : undefined;

    const totalUsers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(usersWhereClause);

    // Calculate conversion rate
    const conversionRate = (premiumUsers[0]?.count || 0) / (totalUsers[0]?.count || 1) * 100;

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = await this.calculateMRR(companyId);

    // Calculate churn rate
    const churnRate = await this.calculateChurnRate(companyId);

    // Check for anomalies
    const anomalies = await this.checkAnomalies(totalRevenue, premiumUsers[0]?.count || 0, companyId);

    // Update metrics
    await db.transaction(async (tx) => {
      await tx.insert(analyticsMetrics).values({
        companyId,
        metricName: 'total_revenue',
        metricValue: totalRevenue,
        date: today
      });

      await tx.insert(analyticsMetrics).values({
        companyId,
        metricName: 'premium_users',
        metricValue: premiumUsers[0]?.count || 0,
        date: today
      });

      await tx.insert(analyticsMetrics).values({
        companyId,
        metricName: 'conversion_rate',
        metricValue: conversionRate,
        date: today
      });

      await tx.insert(analyticsMetrics).values({
        companyId,
        metricName: 'mrr',
        metricValue: mrr,
        date: today
      });

      await tx.insert(analyticsMetrics).values({
        companyId,
        metricName: 'churn_rate',
        metricValue: churnRate,
        date: today
      });
    });

    return {
      companyId: companyId || 'global',
      totalRevenue,
      premiumUsers: premiumUsers[0]?.count || 0,
      conversionRate,
      mrr,
      churnRate,
      anomalies
    };
  }

  // Calculate MRR for a specific company or global
  private async calculateMRR(companyId?: string): Promise<number> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const whereClause = companyId
      ? and(
          eq(paymentTransactions.companyId, companyId),
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, startOfMonth),
          lte(paymentTransactions.createdAt, endOfMonth)
        )
      : and(
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, startOfMonth),
          lte(paymentTransactions.createdAt, endOfMonth)
        );

    const result = await db
      .select({ mrr: sql<number>`SUM(amount)` })
      .from(paymentTransactions)
      .where(whereClause);

    return result[0]?.mrr || 0;
  }

  // Calculate churn rate for a specific company or global
  private async calculateChurnRate(companyId?: string): Promise<number> {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const whereClause = companyId
      ? and(
          eq(premiumSubscriptions.companyId, companyId),
          gte(premiumSubscriptions.startDate, startOfLastMonth),
          lte(premiumSubscriptions.startDate, endOfLastMonth)
        )
      : and(
          gte(premiumSubscriptions.startDate, startOfLastMonth),
          lte(premiumSubscriptions.startDate, endOfLastMonth)
        );

    // Get users who were active last month
    const activeLastMonth = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(premiumSubscriptions)
      .where(
        and(
          eq(premiumSubscriptions.status, 'active'),
          whereClause
        )
      );

    // Get users who didn't renew this month
    const notRenewed = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(premiumSubscriptions)
      .where(
        and(
          eq(premiumSubscriptions.status, 'expired'),
          gte(premiumSubscriptions.endDate, startOfLastMonth),
          lte(premiumSubscriptions.endDate, endOfLastMonth),
          companyId ? eq(premiumSubscriptions.companyId, companyId) : undefined
        )
      );

    const churnRate = (notRenewed[0]?.count || 0) / (activeLastMonth[0]?.count || 1) * 100;
    return churnRate;
  }

  // Check for anomalies for a specific company or global
  private async checkAnomalies(currentRevenue: number, currentUsers: number, companyId?: string): Promise<string[]> {
    const anomalies: string[] = [];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const whereClause = companyId
      ? and(
          eq(analyticsMetrics.companyId, companyId),
          eq(analyticsMetrics.date, lastMonth),
          eq(analyticsMetrics.metricName, 'total_revenue')
        )
      : and(
          eq(analyticsMetrics.date, lastMonth),
          eq(analyticsMetrics.metricName, 'total_revenue')
        );

    const lastMonthMetrics = await db.query.analyticsMetrics.findMany({
      where: whereClause
    });

    const lastMonthRevenue = lastMonthMetrics[0]?.metricValue || 0;
    const revenueChange = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    // Alert if revenue change is more than 30% up or down
    if (Math.abs(revenueChange) > 30) {
      anomalies.push(`Revenue has changed by ${revenueChange.toFixed(2)}% compared to last month`);
      await this.emailService.sendAlert(
        'Revenue Anomaly Detected',
        `Revenue has changed by ${revenueChange.toFixed(2)}% compared to last month.`
      );
    }

    // Check user count anomaly
    const userWhereClause = companyId
      ? and(
          eq(analyticsMetrics.companyId, companyId),
          eq(analyticsMetrics.date, lastMonth),
          eq(analyticsMetrics.metricName, 'premium_users')
        )
      : and(
          eq(analyticsMetrics.date, lastMonth),
          eq(analyticsMetrics.metricName, 'premium_users')
        );

    const lastMonthUsers = await db.query.analyticsMetrics.findMany({
      where: userWhereClause
    });

    const userChange = ((currentUsers - (lastMonthUsers[0]?.metricValue || 0)) / (lastMonthUsers[0]?.metricValue || 1)) * 100;

    // Alert if user count change is more than 20% up or down
    if (Math.abs(userChange) > 20) {
      anomalies.push(`Premium user count has changed by ${userChange.toFixed(2)}% compared to last month`);
      await this.emailService.sendAlert(
        'User Count Anomaly Detected',
        `Premium user count has changed by ${userChange.toFixed(2)}% compared to last month.`
      );
    }

    return anomalies;
  }

  // Get metrics for date range for a specific company or global
  async getMetrics(startDate: Date, endDate: Date, companyId?: string) {
    const whereClause = companyId
      ? and(
          eq(analyticsMetrics.companyId, companyId),
          gte(analyticsMetrics.date, startDate),
          lte(analyticsMetrics.date, endDate)
        )
      : and(
          gte(analyticsMetrics.date, startDate),
          lte(analyticsMetrics.date, endDate)
        );

    return await db.query.analyticsMetrics.findMany({
      where: whereClause,
      orderBy: (metrics, { asc }) => [asc(metrics.date)]
    });
  }

  // Get revenue by plan type for a specific company or global
  async getRevenueByPlan(startDate: Date, endDate: Date, companyId?: string) {
    const whereClause = companyId
      ? and(
          eq(paymentTransactions.companyId, companyId),
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, startDate),
          lte(paymentTransactions.createdAt, endDate)
        )
      : and(
          eq(paymentTransactions.status, 'success'),
          gte(paymentTransactions.createdAt, startDate),
          lte(paymentTransactions.createdAt, endDate)
        );

    return await db
      .select({
        planType: premiumSubscriptions.planType,
        revenue: sql<number>`SUM(payment_transactions.amount)`
      })
      .from(paymentTransactions)
      .innerJoin(
        premiumSubscriptions,
        eq(paymentTransactions.subscriptionId, premiumSubscriptions.id)
      )
      .where(whereClause)
      .groupBy(premiumSubscriptions.planType);
  }

  // Get cohort analysis data for a specific company or global
  async getCohortAnalysis(companyId?: string) {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

    const whereClause = companyId
      ? and(
          eq(premiumSubscriptions.companyId, companyId),
          gte(premiumSubscriptions.startDate, sixMonthsAgo),
          lte(premiumSubscriptions.startDate, today)
        )
      : and(
          gte(premiumSubscriptions.startDate, sixMonthsAgo),
          lte(premiumSubscriptions.startDate, today)
        );

    return await db
      .select({
        cohortMonth: sql<string>`DATE_FORMAT(start_date, '%Y-%m')`,
        userCount: sql<number>`COUNT(*)`,
        retentionRate: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) / COUNT(*) * 100`
      })
      .from(premiumSubscriptions)
      .where(whereClause)
      .groupBy(sql`DATE_FORMAT(start_date, '%Y-%m')`);
  }

  // Get conversion funnel data for a specific company or global
  async getConversionFunnel(companyId?: string) {
    const whereClause = companyId
      ? eq(users.companyId, companyId)
      : undefined;

    return await db
      .select({
        stage: users.role,
        count: sql<number>`COUNT(*)`,
        conversionRate: sql<number>`SUM(CASE WHEN role = 'premium' THEN 1 ELSE 0 END) / COUNT(*) * 100`
      })
      .from(users)
      .where(whereClause)
      .groupBy(users.role);
  }

  // Generate monthly report for a specific company or global
  async generateMonthlyReport(companyId?: string) {
    const metrics = await this.updateMetrics(companyId);
    const cohortData = await this.getCohortAnalysis(companyId);
    const funnelData = await this.getConversionFunnel(companyId);
    const revenueByPlan = await this.getRevenueByPlan(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
      companyId
    );

    return {
      metrics,
      cohortData,
      funnelData,
      revenueByPlan
    };
  }
} 