import { db } from '../db';
import { analyticsMetrics, premiumSubscriptions, paymentTransactions } from '@shared/schema';
import { eq, gte, lte, and, sql } from 'drizzle-orm';
import * as tf from '@tensorflow/tfjs-node';

export class PredictiveAnalyticsService {
  private model: tf.Sequential;

  constructor() {
    this.model = this.createModel();
  }

  private createModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [6] }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
  }

  async trainModel() {
    // Get historical data for training
    const historicalData = await db.query.analyticsMetrics.findMany({
      where: and(
        gte(analyticsMetrics.date, new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)), // Last 6 months
        lte(analyticsMetrics.date, new Date())
      ),
      orderBy: (metrics, { asc }) => [asc(metrics.date)]
    });

    // Prepare training data
    const features = [];
    const labels = [];

    for (let i = 0; i < historicalData.length - 1; i++) {
      const current = historicalData[i];
      const next = historicalData[i + 1];
      
      features.push([
        current.metricValue,
        current.date.getMonth(),
        current.date.getDay(),
        current.date.getHours(),
        current.date.getMinutes(),
        current.date.getSeconds()
      ]);
      
      labels.push(next.metricValue);
    }

    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels);

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  async predictNextMonthMetrics() {
    // Get current metrics
    const currentMetrics = await db.query.analyticsMetrics.findMany({
      where: eq(analyticsMetrics.date, new Date()),
      limit: 1
    });

    if (!currentMetrics.length) {
      throw new Error('No current metrics available');
    }

    const currentMetric = currentMetrics[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Prepare input for prediction
    const input = tf.tensor2d([[
      currentMetric.metricValue,
      nextMonth.getMonth(),
      nextMonth.getDay(),
      nextMonth.getHours(),
      nextMonth.getMinutes(),
      nextMonth.getSeconds()
    ]]);

    // Make prediction
    const prediction = this.model.predict(input) as tf.Tensor;
    const predictedValue = prediction.dataSync()[0];

    // Clean up tensors
    input.dispose();
    prediction.dispose();

    return {
      metricName: currentMetric.metricName,
      currentValue: currentMetric.metricValue,
      predictedValue,
      date: nextMonth
    };
  }

  async predictChurnRisk() {
    // Get recent subscription data
    const subscriptions = await db.query.premiumSubscriptions.findMany({
      where: eq(premiumSubscriptions.status, 'active'),
      limit: 100
    });

    const churnRisks = [];

    for (const sub of subscriptions) {
      // Simple churn risk calculation based on:
      // 1. Time since last payment
      // 2. Usage frequency
      // 3. Plan type
      const lastPayment = await db.query.paymentTransactions.findFirst({
        where: eq(paymentTransactions.subscriptionId, sub.id),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
      });

      const daysSinceLastPayment = lastPayment 
        ? (Date.now() - lastPayment.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        : 0;

      const riskScore = this.calculateChurnRisk(
        daysSinceLastPayment,
        sub.planType,
        sub.startDate
      );

      churnRisks.push({
        userId: sub.userId,
        riskScore,
        lastPaymentDate: lastPayment?.createdAt,
        planType: sub.planType
      });
    }

    return churnRisks.sort((a, b) => b.riskScore - a.riskScore);
  }

  private calculateChurnRisk(
    daysSinceLastPayment: number,
    planType: string,
    startDate: Date
  ): number {
    let riskScore = 0;

    // Higher risk if no payment in last 30 days
    if (daysSinceLastPayment > 30) {
      riskScore += 0.5;
    }

    // Higher risk for basic plan users
    if (planType === 'basic') {
      riskScore += 0.2;
    }

    // Higher risk for new users (first 30 days)
    const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart < 30) {
      riskScore += 0.3;
    }

    return Math.min(riskScore, 1);
  }
} 