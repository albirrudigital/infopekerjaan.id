import nodemailer from 'nodemailer';
import { PaymentUtils } from './payment-utils';
import { createPdf } from './pdf-service';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPaymentSuccessEmail(email: string, orderId: string, amount: number, planType: string) {
    const formattedAmount = PaymentUtils.formatCurrency(amount);
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Pembayaran Berhasil - InfoPekerjaan',
      html: `
        <h1>Pembayaran Berhasil!</h1>
        <p>Terima kasih telah berlangganan layanan premium InfoPekerjaan.</p>
        <p>Detail Pembayaran:</p>
        <ul>
          <li>Order ID: ${orderId}</li>
          <li>Plan: ${planType}</li>
          <li>Jumlah: ${formattedAmount}</li>
        </ul>
        <p>Anda sekarang dapat menikmati semua fitur premium yang tersedia.</p>
      `
    });
  }

  async sendPaymentFailedEmail(email: string, orderId: string, amount: number) {
    const formattedAmount = PaymentUtils.formatCurrency(amount);
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Pembayaran Gagal - InfoPekerjaan',
      html: `
        <h1>Pembayaran Gagal</h1>
        <p>Maaf, pembayaran Anda tidak dapat diproses.</p>
        <p>Detail Pembayaran:</p>
        <ul>
          <li>Order ID: ${orderId}</li>
          <li>Jumlah: ${formattedAmount}</li>
        </ul>
        <p>Silakan coba lagi atau hubungi tim support kami.</p>
      `
    });
  }

  async sendSubscriptionExpiredEmail(email: string, planType: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Langganan Anda Telah Berakhir - InfoPekerjaan',
      html: `
        <h1>Langganan Anda Telah Berakhir</h1>
        <p>Langganan ${planType} Anda telah berakhir.</p>
        <p>Untuk melanjutkan akses ke fitur premium, silakan perpanjang langganan Anda.</p>
      `
    });
  }

  async sendAlert(subject: string, message: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `[Alert] ${subject}`,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff4d4f;">${subject}</h2>
            <p>${message}</p>
            <p style="color: #666; font-size: 12px;">This is an automated alert from the analytics system.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  }

  async sendMonthlyReport(report: any) {
    try {
      // Generate PDF report
      const pdfBuffer = await createPdf(report);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: `Monthly Analytics Report - ${new Date().toLocaleDateString()}`,
        text: 'Please find attached the monthly analytics report.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Monthly Analytics Report</h2>
            <p>Please find attached the monthly analytics report for ${new Date().toLocaleDateString()}.</p>
            <h3>Key Metrics</h3>
            <ul>
              <li>Total Revenue: $${report.metrics.totalRevenue.toLocaleString()}</li>
              <li>Premium Users: ${report.metrics.premiumUsers}</li>
              <li>Conversion Rate: ${report.metrics.conversionRate.toFixed(2)}%</li>
              <li>Churn Rate: ${report.metrics.churnRate.toFixed(2)}%</li>
              <li>MRR: $${report.metrics.mrr.toLocaleString()}</li>
            </ul>
          </div>
        `,
        attachments: [
          {
            filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (error) {
      console.error('Error sending monthly report:', error);
    }
  }
} 