import { db } from '../db';
import { premiumSubscriptions, paymentTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import Midtrans from 'midtrans-client';

// Initialize Midtrans client
const snap = new Midtrans.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export class PaymentService {
  // Create payment transaction
  async createPaymentTransaction(userId: number, planType: string, duration: number) {
    const orderId = `ORDER-${uuidv4()}`;
    const amount = this.calculateAmount(planType, duration);

    // Create subscription first
    const subscription = await db.insert(premiumSubscriptions).values({
      userId,
      planType,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create payment transaction
    const transaction = await db.insert(paymentTransactions).values({
      userId,
      subscriptionId: subscription.insertId,
      orderId,
      amount,
      status: 'pending'
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

      return {
        ...midtransResponse,
        transactionId: transaction.insertId
      };
    } catch (error) {
      // If Midtrans fails, update transaction status
      await db.update(paymentTransactions)
        .set({ status: 'failed' })
        .where(eq(paymentTransactions.id, transaction.insertId));

      throw error;
    }
  }

  // Handle payment notification from Midtrans
  async handlePaymentNotification(payload: any) {
    const { order_id, transaction_status, fraud_status } = payload;

    // Get transaction
    const transaction = await db.query.paymentTransactions.findFirst({
      where: eq(paymentTransactions.orderId, order_id)
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

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
    } else if (transaction_status === 'expire') {
      await db.update(premiumSubscriptions)
        .set({
          status: 'expired',
          paymentStatus: 'expired'
        })
        .where(eq(premiumSubscriptions.id, transaction.subscriptionId));
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