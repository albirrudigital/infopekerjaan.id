import { db } from '../db';
import { premiumSubscriptions, paymentTransactions, paymentHistory } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { PaymentUtils } from './payment-utils';
import { EmailService } from './email-service';
import { PromoService } from './promo-service';
import { NotificationService } from './notification-service';
import Midtrans from 'midtrans-client';

// Initialize services
const snap = new Midtrans.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const emailService = new EmailService();
const promoService = new PromoService();
const notificationService = new NotificationService();

export class MidtransService {
  // Create Snap transaction
  async createSnapTransaction(userId: number, planType: string, duration: number, promoCode?: string) {
    const orderId = PaymentUtils.generateOrderId(userId);
    let amount = this.calculateAmount(planType, duration);
    let discountAmount = 0;

    // Apply promo code if provided
    if (promoCode) {
      const promoResult = await promoService.validateAndApplyPromo(
        userId,
        promoCode,
        amount,
        planType
      );
      amount = promoResult.finalAmount;
      discountAmount = promoResult.discountAmount;
    }

    const expirationTime = PaymentUtils.getExpirationTime();

    // Create subscription first
    const subscription = await db.insert(premiumSubscriptions).values({
      userId,
      planType,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      status: 'pending',
      paymentStatus: 'pending',
      orderId
    });

    // Create payment transaction
    const transaction = await db.insert(paymentTransactions).values({
      userId,
      subscriptionId: subscription.insertId,
      orderId,
      amount,
      status: 'pending',
      expiresAt: new Date(expirationTime)
    });

    // Record transaction history
    await db.insert(paymentHistory).values({
      transactionId: transaction.insertId,
      status: 'requested',
      metadata: { planType, duration, promoCode, discountAmount }
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        user_id: userId.toString()
      },
      expiry: {
        unit: 'hour',
        duration: 1
      }
    };

    try {
      const midtransResponse = await snap.createTransaction(parameter);
      
      // Update transaction with payment token and URL
      await db.update(paymentTransactions)
        .set({
          paymentToken: midtransResponse.token,
          paymentUrl: midtransResponse.redirect_url
        })
        .where(eq(paymentTransactions.id, transaction.insertId));

      // Record transaction history
      await db.insert(paymentHistory).values({
        transactionId: transaction.insertId,
        status: 'pending',
        metadata: midtransResponse
      });

      // Record promo usage if applicable
      if (promoCode) {
        const promo = await db.query.promoCodes.findFirst({
          where: eq(promoCodes.code, promoCode)
        });
        if (promo) {
          await promoService.recordPromoUsage(
            userId,
            promo.id,
            transaction.insertId,
            discountAmount
          );
        }
      }

      return {
        ...midtransResponse,
        transactionId: transaction.insertId
      };
    } catch (error) {
      // If Midtrans fails, update transaction status
      await db.update(paymentTransactions)
        .set({ status: 'failed' })
        .where(eq(paymentTransactions.id, transaction.insertId));

      // Record transaction history
      await db.insert(paymentHistory).values({
        transactionId: transaction.insertId,
        status: 'failed',
        metadata: { error: error.message }
      });

      throw error;
    }
  }

  // Handle payment notification from Midtrans
  async handlePaymentNotification(payload: any, signatureKey: string) {
    // Verify webhook signature
    if (!PaymentUtils.verifyWebhookSignature(payload, signatureKey)) {
      throw new Error('Invalid webhook signature');
    }

    const { order_id, transaction_status, fraud_status } = payload;

    // Get transaction
    const transaction = await db.query.paymentTransactions.findFirst({
      where: eq(paymentTransactions.orderId, order_id)
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Record transaction history
    await db.insert(paymentHistory).values({
      transactionId: transaction.id,
      status: transaction_status,
      metadata: payload
    });

    // Update transaction status
    await db.update(paymentTransactions)
      .set({
        status: transaction_status,
        paymentMethod: payload.payment_type,
        metadata: payload
      })
      .where(eq(paymentTransactions.orderId, order_id));

    // If payment is successful, activate subscription
    if (transaction_status === 'capture' && fraud_status === 'accept') {
      await db.update(premiumSubscriptions)
        .set({
          status: 'active',
          paymentStatus: 'success'
        })
        .where(eq(premiumSubscriptions.id, transaction.subscriptionId));

      // Send notifications
      await notificationService.sendPaymentSuccessNotification(
        transaction.userId,
        order_id,
        transaction.amount,
        transaction.planType
      );
    } else if (transaction_status === 'expire') {
      await db.update(premiumSubscriptions)
        .set({
          status: 'expired',
          paymentStatus: 'expired'
        })
        .where(eq(premiumSubscriptions.id, transaction.subscriptionId));

      // Send notifications
      await notificationService.sendSubscriptionExpirationNotification(
        transaction.userId,
        transaction.planType,
        0
      );
    }

    return { success: true };
  }

  // Calculate subscription amount
  private calculateAmount(planType: string, duration: number): number {
    const basePrices = {
      basic: 50000,
      premium: 150000,
      enterprise: 500000
    };

    return basePrices[planType] * duration;
  }
} 