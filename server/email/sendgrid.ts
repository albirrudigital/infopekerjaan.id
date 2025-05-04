import { MailService } from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Mengirim email menggunakan SendGrid API
 * 
 * @param apiKey SendGrid API key
 * @param params Parameter email (to, from, subject, text, html)
 * @returns Boolean yang menunjukkan keberhasilan pengiriman
 */
export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<boolean> {
  try {
    if (!apiKey) {
      console.error('SendGrid API key is not provided');
      return false;
    }
    
    const mailService = new MailService();
    mailService.setApiKey(apiKey);
    
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}