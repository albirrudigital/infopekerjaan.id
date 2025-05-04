import { db } from '../db';
import { cv_profiles, documents, job_applications, application_documents } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pipelineAsync = promisify(pipeline);

interface CVProfile {
  title: string;
  summary?: string;
  experience: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
}

interface DocumentUpload {
  type: 'cv' | 'portfolio' | 'certificate' | 'transcript' | 'other';
  file: any;
  isPublic?: boolean;
}

export class CVService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async createCVProfile(userId: number, data: CVProfile) {
    const [profile] = await db.insert(cv_profiles).values({
      user_id: userId,
      ...data,
      is_default: false
    }).returning();

    return profile;
  }

  public async updateCVProfile(userId: number, profileId: number, data: Partial<CVProfile>) {
    const [profile] = await db.update(cv_profiles)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(and(
        eq(cv_profiles.id, profileId),
        eq(cv_profiles.user_id, userId)
      ))
      .returning();

    return profile;
  }

  public async getCVProfiles(userId: number) {
    return await db.query.cv_profiles.findMany({
      where: eq(cv_profiles.user_id, userId)
    });
  }

  public async getCVProfile(userId: number, profileId: number) {
    return await db.query.cv_profiles.findFirst({
      where: and(
        eq(cv_profiles.id, profileId),
        eq(cv_profiles.user_id, userId)
      )
    });
  }

  public async deleteCVProfile(userId: number, profileId: number) {
    await db.delete(cv_profiles)
      .where(and(
        eq(cv_profiles.id, profileId),
        eq(cv_profiles.user_id, userId)
      ));
  }

  public async setDefaultCVProfile(userId: number, profileId: number) {
    // Reset all profiles to non-default
    await db.update(cv_profiles)
      .set({ is_default: false })
      .where(eq(cv_profiles.user_id, userId));

    // Set the selected profile as default
    const [profile] = await db.update(cv_profiles)
      .set({ is_default: true })
      .where(and(
        eq(cv_profiles.id, profileId),
        eq(cv_profiles.user_id, userId)
      ))
      .returning();

    return profile;
  }

  public async uploadDocument(userId: number, data: DocumentUpload) {
    const { type, file, isPublic = false } = data;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Save file to disk
    await pipelineAsync(file.stream, fs.createWriteStream(filePath));

    // Save document record
    const [document] = await db.insert(documents).values({
      user_id: userId,
      type,
      file_name: file.originalname,
      file_path: filePath,
      file_size: file.size,
      file_type: file.mimetype,
      is_public: isPublic
    }).returning();

    return document;
  }

  public async getDocuments(userId: number) {
    return await db.query.documents.findMany({
      where: eq(documents.user_id, userId)
    });
  }

  public async getDocument(userId: number, documentId: number) {
    return await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        or(
          eq(documents.user_id, userId),
          eq(documents.is_public, true)
        )
      )
    });
  }

  public async deleteDocument(userId: number, documentId: number) {
    const document = await this.getDocument(userId, documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from disk
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete document record
    await db.delete(documents)
      .where(and(
        eq(documents.id, documentId),
        eq(documents.user_id, userId)
      ));
  }

  public async applyForJob(userId: number, jobId: number, data: {
    cvProfileId?: number;
    coverLetter?: string;
    documentIds?: number[];
  }) {
    const { cvProfileId, coverLetter, documentIds = [] } = data;

    // Create application
    const [application] = await db.insert(job_applications).values({
      user_id: userId,
      job_id: jobId,
      cv_profile_id: cvProfileId,
      cover_letter: coverLetter,
      status: 'pending'
    }).returning();

    // Attach documents if provided
    if (documentIds.length > 0) {
      await db.insert(application_documents).values(
        documentIds.map(docId => ({
          application_id: application.id,
          document_id: docId
        }))
      );
    }

    return application;
  }

  public async getApplications(userId: number) {
    return await db.query.job_applications.findMany({
      where: eq(job_applications.user_id, userId),
      with: {
        job: true,
        cv_profile: true,
        documents: {
          with: {
            document: true
          }
        }
      }
    });
  }

  public async getApplication(userId: number, applicationId: number) {
    return await db.query.job_applications.findFirst({
      where: and(
        eq(job_applications.id, applicationId),
        eq(job_applications.user_id, userId)
      ),
      with: {
        job: true,
        cv_profile: true,
        documents: {
          with: {
            document: true
          }
        }
      }
    });
  }
} 