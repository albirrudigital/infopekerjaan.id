import { Request, Response } from 'express';
import { CVService } from '../services/cv-service';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

export class CVController {
  private cvService: CVService;

  constructor() {
    this.cvService = new CVService();
  }

  public createCVProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      const profile = await this.cvService.createCVProfile(userId, data);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error creating CV profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create CV profile'
      });
    }
  };

  public updateCVProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const profileId = parseInt(req.params.id);
      const data = req.body;

      const profile = await this.cvService.updateCVProfile(userId, profileId, data);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error updating CV profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update CV profile'
      });
    }
  };

  public getCVProfiles = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const profiles = await this.cvService.getCVProfiles(userId);
      
      res.json({
        success: true,
        data: profiles
      });
    } catch (error) {
      console.error('Error getting CV profiles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get CV profiles'
      });
    }
  };

  public getCVProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const profileId = parseInt(req.params.id);
      const profile = await this.cvService.getCVProfile(userId, profileId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'CV profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error getting CV profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get CV profile'
      });
    }
  };

  public deleteCVProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const profileId = parseInt(req.params.id);
      await this.cvService.deleteCVProfile(userId, profileId);
      
      res.json({
        success: true,
        message: 'CV profile deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting CV profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete CV profile'
      });
    }
  };

  public setDefaultCVProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const profileId = parseInt(req.params.id);
      const profile = await this.cvService.setDefaultCVProfile(userId, profileId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error setting default CV profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set default CV profile'
      });
    }
  };

  public uploadDocument = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { type, isPublic } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const document = await this.cvService.uploadDocument(userId, {
        type,
        file,
        isPublic: isPublic === 'true'
      });
      
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload document'
      });
    }
  };

  public getDocuments = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const documents = await this.cvService.getDocuments(userId);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Error getting documents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get documents'
      });
    }
  };

  public getDocument = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const documentId = parseInt(req.params.id);
      const document = await this.cvService.getDocument(userId, documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.download(document.file_path, document.file_name);
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get document'
      });
    }
  };

  public deleteDocument = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const documentId = parseInt(req.params.id);
      await this.cvService.deleteDocument(userId, documentId);
      
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete document'
      });
    }
  };

  public applyForJob = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.jobId);
      const { cvProfileId, coverLetter, documentIds } = req.body;

      const application = await this.cvService.applyForJob(userId, jobId, {
        cvProfileId,
        coverLetter,
        documentIds
      });
      
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to apply for job'
      });
    }
  };

  public getApplications = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const applications = await this.cvService.getApplications(userId);
      
      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error getting applications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get applications'
      });
    }
  };

  public getApplication = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const applicationId = parseInt(req.params.id);
      const application = await this.cvService.getApplication(userId, applicationId);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error getting application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get application'
      });
    }
  };
} 