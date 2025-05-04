import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Script untuk membuat tabel-tabel untuk modul interview preparation
 */
async function createInterviewTables() {
  console.log("Membuat tabel untuk modul Persiapan Wawancara Cerdas...");
  
  // Tabel Interview Questions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS interview_questions (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer_guidelines TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      industries TEXT[] DEFAULT '{}',
      job_roles TEXT[] DEFAULT '{}',
      skills_required TEXT[] DEFAULT '{}',
      is_verified BOOLEAN DEFAULT FALSE,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Tabel interview_questions berhasil dibuat.");
  
  // Tabel Interview Tips
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS interview_tips (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty_level TEXT NOT NULL,
      target_industries TEXT[] DEFAULT '{}',
      target_roles TEXT[] DEFAULT '{}',
      author_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Tabel interview_tips berhasil dibuat.");
  
  // Tabel Mock Interviews
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mock_interviews (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      job_role TEXT,
      industry TEXT,
      difficulty TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      user_id INTEGER NOT NULL,
      score INTEGER,
      feedback TEXT,
      duration INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE
    )
  `);
  console.log("Tabel mock_interviews berhasil dibuat.");
  
  // Tabel Mock Interview Questions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mock_interview_questions (
      id SERIAL PRIMARY KEY,
      mock_interview_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      order_number INTEGER NOT NULL,
      user_response TEXT,
      evaluation_score INTEGER,
      evaluation_feedback TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_mock_interview FOREIGN KEY (mock_interview_id) REFERENCES mock_interviews(id) ON DELETE CASCADE,
      CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
    )
  `);
  console.log("Tabel mock_interview_questions berhasil dibuat.");
  
  // Tabel Interview Performance
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS interview_performance (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      sessions_completed INTEGER DEFAULT 0,
      technical_score INTEGER,
      behavioral_score INTEGER,
      communication_score INTEGER,
      preparation_score INTEGER,
      overall_score INTEGER,
      strength_areas TEXT[],
      improvement_areas TEXT[],
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Tabel interview_performance berhasil dibuat.");
  
  console.log("Semua tabel untuk modul Persiapan Wawancara Cerdas berhasil dibuat!");
}

async function main() {
  try {
    await createInterviewTables();
  } catch (error) {
    console.error("Error creating interview tables:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();