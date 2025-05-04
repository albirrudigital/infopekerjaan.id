import { db } from '../db';
import { notificationSettings } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from './email-service';
import { PaymentUtils } from './payment-utils';

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // Send payment success notification
  async sendPaymentSuccessNotification(userId: number, orderId: string, amount: number, planType: string) {
    const settings = await db.query.notificationSettings.findFirst({
      where: eq(notificationSettings.userId, userId)
    });

    if (!settings) return;

    const formattedAmount = PaymentUtils.formatCurrency(amount);

    // Send email
    if (settings.emailNotification) {
      await this.emailService.sendPaymentSuccessEmail(
        settings.email,
        orderId,
        amount,
        planType
      );
    }

    // Send WhatsApp
    if (settings.whatsappNotification && settings.whatsappNumber) {
      await this.sendWhatsAppMessage(
        settings.whatsappNumber,
        `Pembayaran berhasil! Order ID: ${orderId}, Jumlah: ${formattedAmount}, Plan: ${planType}`
      );
    }

    // Send SMS
    if (settings.smsNotification && settings.smsNumber) {
      await this.sendSMSMessage(
        settings.smsNumber,
        `Pembayaran berhasil! Order ID: ${orderId}, Jumlah: ${formattedAmount}, Plan: ${planType}`
      );
    }
  }

  // Send subscription expiration notification
  async sendSubscriptionExpirationNotification(userId: number, planType: string, daysLeft: number) {
    const settings = await db.query.notificationSettings.findFirst({
      where: eq(notificationSettings.userId, userId)
    });

    if (!settings) return;

    // Send email
    if (settings.emailNotification) {
      await this.emailService.sendSubscriptionExpiredEmail(
        settings.email,
        planType
      );
    }

    // Send WhatsApp
    if (settings.whatsappNotification && settings.whatsappNumber) {
      await this.sendWhatsAppMessage(
        settings.whatsappNumber,
        `Langganan ${planType} Anda akan berakhir dalam ${daysLeft} hari. Segera perpanjang untuk tetap menikmati fitur premium!`
      );
    }

    // Send SMS
    if (settings.smsNotification && settings.smsNumber) {
      await this.sendSMSMessage(
        settings.smsNumber,
        `Langganan ${planType} Anda akan berakhir dalam ${daysLeft} hari. Segera perpanjang untuk tetap menikmati fitur premium!`
      );
    }
  }

  // Send WhatsApp message (implement with your WhatsApp API provider)
  private async sendWhatsAppMessage(phoneNumber: string, message: string) {
    // Implement WhatsApp API integration here
    // Example: Twilio, WhatsApp Business API, etc.
    console.log(`WhatsApp message sent to ${phoneNumber}: ${message}`);
  }

  // Send SMS message (implement with your SMS API provider)
  private async sendSMSMessage(phoneNumber: string, message: string) {
    // Implement SMS API integration here
    // Example: Twilio, Nexmo, etc.
    console.log(`SMS sent to ${phoneNumber}: ${message}`);
  }
} 