CREATE DATABASE IF NOT EXISTS infopekerjaan;
USE infopekerjaan;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'employer', 'jobseeker') DEFAULT 'jobseeker',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255)
);

-- Tabel lowongan
CREATE TABLE IF NOT EXISTS lowongan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  perusahaan VARCHAR(150),
  posisi VARCHAR(100),
  lokasi VARCHAR(100),
  deskripsi TEXT,
  kualifikasi TEXT,
  batas_lamaran DATE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel premium_subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_type ENUM('basic', 'premium', 'enterprise') NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  payment_status ENUM('pending', 'success', 'failed', 'expired') DEFAULT 'pending',
  order_id VARCHAR(100),
  payment_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel premium_features
CREATE TABLE IF NOT EXISTS premium_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  plan_type ENUM('basic', 'premium', 'enterprise') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel user_premium_features
CREATE TABLE IF NOT EXISTS user_premium_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  feature_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (feature_id) REFERENCES premium_features(id) ON DELETE CASCADE
);

-- Tabel chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel job_recommendations
CREATE TABLE IF NOT EXISTS job_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  score FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES lowongan(id) ON DELETE CASCADE
);

-- Tabel payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT,
  order_id VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status ENUM('pending', 'success', 'failed', 'expired') DEFAULT 'pending',
  payment_token VARCHAR(255),
  payment_url VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES premium_subscriptions(id) ON DELETE SET NULL
);

-- Tabel payment_history
CREATE TABLE IF NOT EXISTS payment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
);

-- Tabel promo_codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount DECIMAL(10,2),
  min_purchase DECIMAL(10,2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  plan_type ENUM('basic', 'premium', 'enterprise') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel user_promo_usage
CREATE TABLE IF NOT EXISTS user_promo_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  promo_id INT NOT NULL,
  transaction_id INT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (promo_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE
);

-- Tabel notification_settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email_notification BOOLEAN DEFAULT TRUE,
  whatsapp_notification BOOLEAN DEFAULT FALSE,
  sms_notification BOOLEAN DEFAULT FALSE,
  whatsapp_number VARCHAR(20),
  sms_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel analytics_metrics
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(20,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel user_referrals
CREATE TABLE IF NOT EXISTS user_referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_id INT NOT NULL,
  referred_id INT NOT NULL,
  referral_code VARCHAR(50) NOT NULL,
  status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
  reward_amount DECIMAL(10,2),
  reward_type ENUM('free_month', 'discount') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel subscription_actions
CREATE TABLE IF NOT EXISTS subscription_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscription_id INT NOT NULL,
  action_type ENUM('cancel', 'pause', 'resume', 'upgrade', 'downgrade') NOT NULL,
  action_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES premium_subscriptions(id) ON DELETE CASCADE
);

-- Tabel cv_profiles
CREATE TABLE IF NOT EXISTS cv_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  summary TEXT,
  experience JSON,
  education JSON,
  skills JSON,
  languages JSON,
  certifications JSON,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel documents
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('cv', 'portfolio', 'certificate', 'transcript', 'other') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel job_applications
CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  cv_profile_id INT,
  cover_letter TEXT,
  status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES lowongan(id) ON DELETE CASCADE,
  FOREIGN KEY (cv_profile_id) REFERENCES cv_profiles(id) ON DELETE SET NULL
);

-- Tabel application_documents
CREATE TABLE IF NOT EXISTS application_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  document_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Insert default premium features
INSERT INTO premium_features (name, description, plan_type) VALUES
('Chat System', 'Sistem chat antara user dan perusahaan', 'basic'),
('Job Recommendations', 'Rekomendasi pekerjaan berdasarkan profil', 'premium'),
('Multi-language Support', 'Dukungan multi bahasa', 'premium'),
('Advanced Analytics', 'Analitik lanjutan untuk perusahaan', 'enterprise'),
('Priority Support', 'Dukungan prioritas', 'enterprise');

-- Insert default promo codes
INSERT INTO promo_codes (code, description, discount_type, discount_value, max_discount, min_purchase, start_date, end_date, max_uses, plan_type) VALUES
('WELCOME50', 'Diskon 50% untuk pengguna baru', 'percentage', 50.00, 250000.00, 100000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1000, 'premium'),
('FIRSTMONTH', 'Bulan pertama gratis', 'fixed', 150000.00, 150000.00, 150000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1000, 'premium'),
('ENTERPRISE20', 'Diskon 20% untuk Enterprise', 'percentage', 20.00, 1000000.00, 500000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 'enterprise');

-- Insert default analytics metrics
INSERT INTO analytics_metrics (metric_name, metric_value, date) VALUES
('total_revenue', 0, CURDATE()),
('premium_users', 0, CURDATE()),
('conversion_rate', 0, CURDATE()),
('mrr', 0, CURDATE());

-- Add environment variables
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Insert environment variables
INSERT INTO `env_variables`