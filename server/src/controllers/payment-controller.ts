import { Request, Response } from 'express';
import { MidtransService } from '../services/midtrans-service';
import { db } from '../db';
import { paymentTransactions, paymentHistory, promoCodes } from '@shared/schema';
import { eq } from 'drizzle-orm';

const midtransService = new MidtransService();

export class PaymentController {
  // Create payment transaction
  static async createPayment(req: Request, res: Response) {
    try {
      const { planType, duration, promoCode } = req.body;
      const userId = req.user.id;

      const payment = await midtransService.createSnapTransaction(
        userId,
        planType,
        duration,
        promoCode
      );

      res.json({
        success: true,
        data: {
          token: payment.token,
          redirectUrl: payment.redirect_url,
          orderId: payment.order_id
        }
      });
    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment transaction'
      });
    }
  }

  // Handle Midtrans notification
  static async handleNotification(req: Request, res: Response) {
    try {
      const signatureKey = req.headers['x-signature-key'] as string;
      await midtransService.handlePaymentNotification(req.body, signatureKey);
      res.json({ success: true });
    } catch (error) {
      console.error('Payment notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment notification'
      });
    }
  }

  // Get payment status
  static async getStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const transaction = await db.query.paymentTransactions.findFirst({
        where: eq(paymentTransactions.orderId, orderId)
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Get transaction history
      const history = await db.query.paymentHistory.findMany({
        where: eq(paymentHistory.transactionId, transaction.id),
        orderBy: (history, { desc }) => [desc(history.createdAt)]
      });

      res.json({
        success: true,
        data: {
          ...transaction,
          history
        }
      });
    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status'
      });
    }
  }

  // Get user payment history
  static async getUserHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const transactions = await db.query.paymentTransactions.findMany({
        where: eq(paymentTransactions.userId, userId),
        orderBy: (transaction, { desc }) => [desc(transaction.createdAt)]
      });

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment history'
      });
    }
  }

  // Get available promo codes
  static async getPromoCodes(req: Request, res: Response) {
    try {
      const { planType } = req.query;
      const promos = await db.query.promoCodes.findMany({
        where: eq(promoCodes.planType, planType as string)
      });

      res.json({
        success: true,
        data: promos
      });
    } catch (error) {
      console.error('Promo codes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get promo codes'
      });
    }
  }
} 