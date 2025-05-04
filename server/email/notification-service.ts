import { sendEmail } from './sendgrid';
import { storage } from '../storage';
import * as notificationStorage from '../storage_notification';
import { User, Job, JobseekerProfile, Company, Application } from '@shared/schema';

// Tipe notifikasi yang didukung
export enum NotificationType {
  WELCOME = 'welcome',
  JOB_APPLICATION_SUBMITTED = 'job_application_submitted',
  JOB_APPLICATION_STATUS_CHANGE = 'job_application_status_change',
  NEW_JOB_POSTING = 'new_job_posting',
  PROFILE_COMPLETE_REMINDER = 'profile_complete_reminder',
  INTERVIEW_INVITATION = 'interview_invitation',
  ACCOUNT_VERIFICATION = 'account_verification',
  PASSWORD_RESET = 'password_reset',
  WEEKLY_JOB_DIGEST = 'weekly_job_digest'
}

export class NotificationService {
  private readonly fromEmail = 'info@infopekerjaan.id';
  
  constructor() {
    // Bisa digunakan untuk inisialisasi jika diperlukan
  }
  
  /**
   * Mengirim notifikasi berdasarkan tipe
   */
  async sendNotification(userId: number, type: NotificationType, data: any = {}): Promise<boolean> {
    try {
      // Dapatkan preferensi notifikasi user
      const preferences = await notificationStorage.getNotificationPreferences(userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.error(`User with ID ${userId} not found`);
        return false;
      }
      
      // Default preferences jika belum diatur
      const defaultPreferences = {
        email: true,
        inApp: true,
        push: false
      };
      
      // Gunakan default jika preferensi belum ada
      const shouldSendEmail = preferences ? preferences.email : defaultPreferences.email;
      const shouldSendInApp = preferences ? preferences.inApp : defaultPreferences.inApp;
      
      // Buat notifikasi in-app
      if (shouldSendInApp) {
        await this.createInAppNotification(userId, type, data);
      }
      
      // Kirim email jika diizinkan
      if (shouldSendEmail) {
        return await this.sendEmailNotification(user, type, data);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
  
  /**
   * Membuat notifikasi in-app
   */
  private async createInAppNotification(userId: number, type: NotificationType, data: any = {}): Promise<boolean> {
    try {
      const { title, message } = this.getNotificationContent(type, data);
      
      // Checking schema for the notification table
      await notificationStorage.createNotification({
        userId,
        type: type.toString(),
        title,
        message,
        data: data || {},
        createdAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('Error creating in-app notification:', error);
      return false;
    }
  }
  
  /**
   * Mengirim email notifikasi
   */
  private async sendEmailNotification(user: User, type: NotificationType, data: any = {}): Promise<boolean> {
    try {
      if (!user.email) {
        console.error('User email is not available');
        return false;
      }
      
      const { title, message, htmlContent } = this.getEmailContent(user, type, data);
      
      const apiKey = process.env.SENDGRID_API_KEY || '';
      if (!apiKey) {
        console.error('SENDGRID_API_KEY not set');
        return false;
      }
      
      return await sendEmail(
        apiKey,
        {
          to: user.email,
          from: this.fromEmail,
          subject: title,
          text: message,
          html: htmlContent
        }
      );
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }
  
  /**
   * Mendapatkan konten notifikasi in-app
   */
  private getNotificationContent(type: NotificationType, data: any = {}): { title: string; message: string } {
    switch (type) {
      case NotificationType.WELCOME:
        return {
          title: 'Selamat Datang di InfoPekerjaan.id',
          message: 'Terima kasih telah bergabung dengan platform kami. Silakan lengkapi profil Anda untuk memulai.'
        };
        
      case NotificationType.JOB_APPLICATION_SUBMITTED:
        return {
          title: 'Lamaran Pekerjaan Terkirim',
          message: `Lamaran Anda untuk posisi ${data.jobTitle || 'yang dipilih'} telah berhasil dikirim.`
        };
        
      case NotificationType.JOB_APPLICATION_STATUS_CHANGE:
        return {
          title: 'Status Lamaran Diperbarui',
          message: `Status lamaran Anda untuk posisi ${data.jobTitle || 'yang dipilih'} telah diperbarui menjadi ${this.getStatusInIndonesian(data.status)}.`
        };
        
      case NotificationType.NEW_JOB_POSTING:
        return {
          title: 'Lowongan Kerja Baru',
          message: `Lowongan baru untuk posisi ${data.jobTitle || 'yang mungkin sesuai'} telah tersedia.`
        };
        
      case NotificationType.PROFILE_COMPLETE_REMINDER:
        return {
          title: 'Lengkapi Profil Anda',
          message: 'Profil Anda belum lengkap. Lengkapi sekarang untuk meningkatkan peluang Anda mendapatkan pekerjaan.'
        };
        
      case NotificationType.INTERVIEW_INVITATION:
        return {
          title: 'Undangan Wawancara',
          message: `Anda diundang untuk wawancara oleh ${data.companyName || 'perusahaan'} untuk posisi ${data.jobTitle || 'yang dilamar'}.`
        };
        
      case NotificationType.ACCOUNT_VERIFICATION:
        return {
          title: 'Verifikasi Akun Anda',
          message: 'Silakan verifikasi akun Anda untuk mengakses semua fitur InfoPekerjaan.id.'
        };
        
      case NotificationType.PASSWORD_RESET:
        return {
          title: 'Permintaan Reset Password',
          message: 'Kami menerima permintaan untuk mereset password akun Anda.'
        };
        
      case NotificationType.WEEKLY_JOB_DIGEST:
        return {
          title: 'Lowongan Kerja Mingguan',
          message: 'Lihat daftar lowongan kerja terbaru yang mungkin sesuai dengan profil Anda.'
        };
        
      default:
        return {
          title: 'Notifikasi InfoPekerjaan.id',
          message: 'Anda memiliki pemberitahuan baru dari InfoPekerjaan.id'
        };
    }
  }
  
  /**
   * Mendapatkan konten email
   */
  private getEmailContent(user: User, type: NotificationType, data: any = {}): { title: string; message: string; htmlContent: string } {
    const { title, message } = this.getNotificationContent(type, data);
    let htmlContent = '';
    
    // Warna utama tema
    const primaryColor = '#003366'; // navy blue
    const accentColor = '#DC143C'; // crimson
    
    // Template dasar untuk semua email
    const emailTemplate = (title: string, greeting: string, mainContent: string, ctaText: string = '', ctaUrl: string = '') => {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: ${primaryColor};
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .btn {
              display: inline-block;
              background-color: ${accentColor};
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>InfoPekerjaan.id</h1>
            </div>
            <div class="content">
              <p>${greeting}</p>
              ${mainContent}
              ${ctaText && ctaUrl ? `<p><a href="${ctaUrl}" class="btn">${ctaText}</a></p>` : ''}
              <p>Salam,<br>Tim InfoPekerjaan.id</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} InfoPekerjaan.id. Semua hak dilindungi undang-undang.</p>
              <p>Jika Anda tidak ingin menerima email ini, Anda dapat <a href="#">berhenti berlangganan</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    };
    
    // Membangun konten email berdasarkan tipe notifikasi
    switch (type) {
      case NotificationType.WELCOME:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Selamat datang di InfoPekerjaan.id!</p>
            <p>Kami sangat senang Anda telah bergabung dengan komunitas kami. Platform kami dirancang untuk membantu Anda menemukan pekerjaan impian Anda atau menemukan kandidat terbaik untuk posisi yang Anda buka.</p>
            <p>Untuk memulai, silakan lengkapi profil Anda agar mendapatkan rekomendasi pekerjaan yang lebih relevan.</p>
          `,
          'Lengkapi Profil Sekarang',
          'https://infopekerjaan.id/profile'
        );
        break;
        
      case NotificationType.JOB_APPLICATION_SUBMITTED:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Kami ingin mengkonfirmasi bahwa lamaran Anda untuk posisi <strong>${data.jobTitle || 'yang Anda pilih'}</strong> di <strong>${data.companyName || 'perusahaan'}</strong> telah berhasil dikirim.</p>
            <p>Tim rekrutmen akan meninjau lamaran Anda dan akan menghubungi Anda jika kualifikasi Anda sesuai dengan kebutuhan mereka.</p>
            <p>Anda dapat melacak status lamaran Anda melalui dasbor InfoPekerjaan.id Anda.</p>
          `,
          'Lihat Status Lamaran',
          'https://infopekerjaan.id/my-applications'
        );
        break;
        
      case NotificationType.JOB_APPLICATION_STATUS_CHANGE:
        const statusText = this.getStatusInIndonesian(data.status);
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Kami ingin memberitahu Anda bahwa status lamaran Anda untuk posisi <strong>${data.jobTitle || 'yang Anda lamar'}</strong> di <strong>${data.companyName || 'perusahaan'}</strong> telah diperbarui.</p>
            <p>Status lamaran Anda saat ini: <strong>${statusText}</strong>.</p>
            ${data.feedbackMessage ? `<p>Pesan dari perekrut: "${data.feedbackMessage}"</p>` : ''}
            <p>Anda dapat melacak status lamaran Anda melalui dasbor InfoPekerjaan.id Anda.</p>
          `,
          'Lihat Status Lamaran',
          'https://infopekerjaan.id/my-applications'
        );
        break;
        
      case NotificationType.NEW_JOB_POSTING:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Kami menemukan lowongan pekerjaan baru yang mungkin sesuai dengan keahlian dan minat Anda:</p>
            <p>
              <strong>${data.jobTitle || 'Posisi Baru'}</strong><br>
              ${data.companyName || 'Perusahaan'}<br>
              ${data.location || 'Lokasi'}<br>
              ${data.salary ? `Gaji: ${data.salary}` : ''}
            </p>
            <p>Jangan lewatkan kesempatan ini! Kirimkan lamaran Anda sekarang.</p>
          `,
          'Lihat Lowongan',
          `https://infopekerjaan.id/jobs/${data.jobId || ''}`
        );
        break;
        
      case NotificationType.PROFILE_COMPLETE_REMINDER:
        const missingFields = data.missingFields || ['Ringkasan Diri', 'Pengalaman Kerja', 'Pendidikan', 'Keterampilan'];
        const missingFieldsList = Array.isArray(missingFields) 
          ? missingFields.map((field: string) => `<li>${field}</li>`).join('') 
          : '<li>Profil belum lengkap</li>';
          
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Kami melihat bahwa profil Anda di InfoPekerjaan.id belum lengkap. Profil yang lengkap dapat meningkatkan peluang Anda untuk mendapatkan pekerjaan impian.</p>
            <p>Bagian yang perlu dilengkapi:</p>
            <ul>
              ${missingFieldsList}
            </ul>
            <p>Luangkan waktu sejenak untuk melengkapi profil Anda agar mendapatkan rekomendasi yang lebih relevan dan meningkatkan visibilitas profil Anda kepada perekrut.</p>
          `,
          'Lengkapi Profil Sekarang',
          'https://infopekerjaan.id/profile'
        );
        break;
        
      case NotificationType.INTERVIEW_INVITATION:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Selamat! Anda telah dipilih untuk wawancara oleh <strong>${data.companyName || 'perusahaan'}</strong> untuk posisi <strong>${data.jobTitle || 'yang Anda lamar'}</strong>.</p>
            <p>Detail wawancara:</p>
            <p>
              Tanggal: ${data.interviewDate || 'Akan dikonfirmasi'}<br>
              Waktu: ${data.interviewTime || 'Akan dikonfirmasi'}<br>
              Lokasi: ${data.interviewLocation || 'Akan dikonfirmasi'}<br>
              ${data.interviewType ? `Jenis: ${data.interviewType}` : ''}
            </p>
            <p>${data.additionalInfo || 'Silakan persiapkan diri Anda dan jangan ragu untuk menghubungi perusahaan jika Anda memiliki pertanyaan.'}</p>
          `,
          'Konfirmasi Kehadiran',
          'https://infopekerjaan.id/interviews'
        );
        break;
        
      case NotificationType.ACCOUNT_VERIFICATION:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Terima kasih telah mendaftar di InfoPekerjaan.id. Untuk melanjutkan penggunaan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah.</p>
            <p>Jika Anda tidak melakukan pendaftaran, silakan abaikan email ini.</p>
          `,
          'Verifikasi Akun Saya',
          `https://infopekerjaan.id/verify-account?token=${data.verificationToken || ''}`
        );
        break;
        
      case NotificationType.PASSWORD_RESET:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Kami menerima permintaan untuk mereset password akun InfoPekerjaan.id Anda. Klik tombol di bawah untuk melanjutkan proses reset password.</p>
            <p>Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini atau hubungi tim dukungan kami.</p>
          `,
          'Reset Password',
          `https://infopekerjaan.id/reset-password?token=${data.resetToken || ''}`
        );
        break;
        
      case NotificationType.WEEKLY_JOB_DIGEST:
        const jobListings = data.jobs || [];
        let jobsHtml = '';
        
        if (Array.isArray(jobListings) && jobListings.length > 0) {
          // Build HTML list items for each job
          const jobItems = jobListings.map((job: any) => {
            return `
              <li style="margin-bottom: 15px; list-style-type: none; padding-left: 0;">
                <strong>${job.title || 'Posisi Tersedia'}</strong> - ${job.companyName || 'Perusahaan'}<br>
                ${job.location || ''} ${job.salary ? `| Gaji: ${job.salary}` : ''}<br>
                <a href="https://infopekerjaan.id/jobs/${job.id || ''}">Lihat Detail</a>
              </li>
            `;
          }).join('');
          
          jobsHtml = `
            <p>Berikut adalah beberapa lowongan kerja terbaru yang mungkin sesuai dengan profil Anda:</p>
            <ul style="padding-left: 0;">
              ${jobItems}
            </ul>
          `;
        } else {
          jobsHtml = '<p>Jelajahi lebih banyak lowongan kerja di platform kami yang sesuai dengan minat dan keahlian Anda.</p>';
        }
        
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `
            <p>Kami telah mempersiapkan daftar lowongan kerja mingguan berdasarkan preferensi dan keterampilan Anda.</p>
            ${jobsHtml}
            <p>Jangan lewatkan kesempatan ini! Kunjungi InfoPekerjaan.id untuk melihat lebih banyak lowongan yang sesuai.</p>
          `,
          'Jelajahi Semua Lowongan',
          'https://infopekerjaan.id/jobs'
        );
        break;
        
      default:
        htmlContent = emailTemplate(
          title,
          `Halo ${user.fullName},`,
          `<p>${message}</p>`,
          'Kunjungi InfoPekerjaan.id',
          'https://infopekerjaan.id'
        );
    }
    
    return { title, message, htmlContent };
  }
  
  /**
   * Menerjemahkan status aplikasi ke bahasa Indonesia
   */
  private getStatusInIndonesian(status: string): string {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'reviewed':
        return 'Ditinjau';
      case 'shortlisted':
        return 'Masuk Seleksi';
      case 'rejected':
        return 'Ditolak';
      case 'hired':
        return 'Diterima';
      default:
        return status;
    }
  }
  
  // ----- Helper methods for specific notification types -----
  
  /**
   * Mengirim notifikasi selamat datang
   */
  async sendWelcomeNotification(userId: number): Promise<boolean> {
    return this.sendNotification(userId, NotificationType.WELCOME);
  }
  
  /**
   * Mengirim notifikasi lamaran terkirim
   */
  async sendApplicationSubmittedNotification(userId: number, jobId: number): Promise<boolean> {
    try {
      const job = await storage.getJob(jobId);
      if (!job) return false;
      
      const company = await storage.getCompany(job.companyId);
      if (!company) return false;
      
      return this.sendNotification(userId, NotificationType.JOB_APPLICATION_SUBMITTED, {
        jobId: job.id,
        jobTitle: job.title,
        companyId: company.id,
        companyName: company.name
      });
    } catch (error) {
      console.error('Error sending application submitted notification:', error);
      return false;
    }
  }
  
  /**
   * Mengirim notifikasi perubahan status lamaran
   */
  async sendApplicationStatusChangeNotification(applicationId: number, newStatus: string, feedbackMessage?: string): Promise<boolean> {
    try {
      const application = await storage.getApplication(applicationId);
      if (!application) return false;
      
      const job = await storage.getJob(application.jobId);
      if (!job) return false;
      
      const company = await storage.getCompany(job.companyId);
      if (!company) return false;
      
      return this.sendNotification(application.jobseekerId, NotificationType.JOB_APPLICATION_STATUS_CHANGE, {
        applicationId: application.id,
        jobId: job.id,
        jobTitle: job.title,
        companyId: company.id,
        companyName: company.name,
        status: newStatus,
        feedbackMessage
      });
    } catch (error) {
      console.error('Error sending application status change notification:', error);
      return false;
    }
  }
  
  /**
   * Mengirim notifikasi lowongan baru
   */
  async sendNewJobPostingNotification(jobId: number): Promise<boolean> {
    try {
      const job = await storage.getJob(jobId);
      if (!job) return false;
      
      const company = await storage.getCompany(job.companyId);
      if (!company) return false;
      
      // Dapatkan list jobseeker yang mungkin tertarik dengan lowongan ini
      // Implementasi sederhana: mendapatkan semua jobseeker
      const users = await storage.getAllUsers({ type: 'jobseeker' });
      
      let success = true;
      for (const user of users) {
        // Kirim notifikasi ke setiap jobseeker
        const result = await this.sendNotification(user.id, NotificationType.NEW_JOB_POSTING, {
          jobId: job.id,
          jobTitle: job.title,
          companyId: company.id,
          companyName: company.name,
          location: job.location,
          salary: job.salary
        });
        
        if (!result) success = false;
      }
      
      return success;
    } catch (error) {
      console.error('Error sending new job posting notification:', error);
      return false;
    }
  }
  
  /**
   * Mengirim notifikasi undangan wawancara
   */
  async sendInterviewInvitationNotification(
    userId: number, 
    jobId: number, 
    interviewDetails: {
      date?: string;
      time?: string;
      location?: string;
      type?: string;
      additionalInfo?: string;
    }
  ): Promise<boolean> {
    try {
      const job = await storage.getJob(jobId);
      if (!job) return false;
      
      const company = await storage.getCompany(job.companyId);
      if (!company) return false;
      
      return this.sendNotification(userId, NotificationType.INTERVIEW_INVITATION, {
        jobId: job.id,
        jobTitle: job.title,
        companyId: company.id,
        companyName: company.name,
        interviewDate: interviewDetails.date,
        interviewTime: interviewDetails.time,
        interviewLocation: interviewDetails.location,
        interviewType: interviewDetails.type,
        additionalInfo: interviewDetails.additionalInfo
      });
    } catch (error) {
      console.error('Error sending interview invitation notification:', error);
      return false;
    }
  }
  
  /**
   * Mengirim email test (untuk keperluan debugging/testing)
   */
  async sendTestEmail(userId: number, typeStr: string, data: any = {}): Promise<boolean> {
    try {
      // Convert string to NotificationType
      const typeMap: { [key: string]: NotificationType } = {
        'welcome': NotificationType.WELCOME,
        'job_application_submitted': NotificationType.JOB_APPLICATION_SUBMITTED,
        'job_application_status_change': NotificationType.JOB_APPLICATION_STATUS_CHANGE,
        'new_job_posting': NotificationType.NEW_JOB_POSTING,
        'profile_complete_reminder': NotificationType.PROFILE_COMPLETE_REMINDER,
        'interview_invitation': NotificationType.INTERVIEW_INVITATION,
        'account_verification': NotificationType.ACCOUNT_VERIFICATION,
        'password_reset': NotificationType.PASSWORD_RESET,
        'weekly_job_digest': NotificationType.WEEKLY_JOB_DIGEST
      };
      
      const type = typeMap[typeStr.toLowerCase()] || NotificationType.WELCOME;
      
      // Dapatkan user
      const user = await this.storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found`);
        return false;
      }
      
      // Kirim email saja (tanpa membuat in-app notification)
      return await this.sendEmailNotification(user, type, data);
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }
  
  /**
   * Bisa ditambahkan implementasi helper method untuk tipe notifikasi lainnya
   */
}