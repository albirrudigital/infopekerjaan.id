import { db } from '../db';
import { promoCodes, userPromoUsage } from '@shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export class PromoService {
  // Validate and apply promo code
  async validateAndApplyPromo(userId: number, promoCode: string, amount: number, planType: string) {
    const promo = await db.query.promoCodes.findFirst({
      where: and(
        eq(promoCodes.code, promoCode),
        eq(promoCodes.isActive, true),
        eq(promoCodes.planType, planType),
        gte(promoCodes.endDate, new Date()),
        lte(promoCodes.startDate, new Date())
      )
    });

    if (!promo) {
      throw new Error('Invalid promo code');
    }

    // Check if promo has reached max uses
    if (promo.currentUses >= promo.maxUses) {
      throw new Error('Promo code has reached maximum usage');
    }

    // Check minimum purchase
    if (promo.minPurchase && amount < promo.minPurchase) {
      throw new Error(`Minimum purchase of ${promo.minPurchase} required`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.discountValue;
    }

    return {
      promoId: promo.id,
      discountAmount,
      finalAmount: amount - discountAmount
    };
  }

  // Record promo usage
  async recordPromoUsage(userId: number, promoId: number, transactionId: number, discountAmount: number) {
    await db.transaction(async (tx) => {
      // Record usage
      await tx.insert(userPromoUsage).values({
        userId,
        promoId,
        transactionId,
        discountAmount
      });

      // Increment promo usage count
      await tx.update(promoCodes)
        .set({
          currentUses: promoCodes.currentUses + 1
        })
        .where(eq(promoCodes.id, promoId));
    });
  }

  // Get user's promo usage history
  async getUserPromoHistory(userId: number) {
    return await db.query.userPromoUsage.findMany({
      where: eq(userPromoUsage.userId, userId),
      with: {
        promo: true,
        transaction: true
      }
    });
  }
} 