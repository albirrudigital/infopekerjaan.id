import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class PaymentUtils {
  // Generate unique order ID
  static generateOrderId(userId: number): string {
    const timestamp = Date.now();
    const random = uuidv4().split('-')[0];
    return `ORDER-${userId}-${timestamp}-${random}`;
  }

  // Calculate expiration time (1 hour from now)
  static getExpirationTime(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  }

  // Verify Midtrans webhook signature
  static verifyWebhookSignature(payload: any, signatureKey: string): boolean {
    const expectedSignature = crypto
      .createHash('sha512')
      .update(
        payload.order_id +
        payload.status_code +
        payload.gross_amount +
        process.env.MIDTRANS_SERVER_KEY
      )
      .digest('hex');

    return expectedSignature === signatureKey;
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
} 