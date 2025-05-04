import { Router } from 'express';
import { CVController } from '../controllers/cv-controller';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();
const cvController = new CVController();

// Configure multer for file uploads
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

// CV Profile routes
router.post('/cv-profiles', authenticateToken, cvController.createCVProfile);
router.put('/cv-profiles/:id', authenticateToken, cvController.updateCVProfile);
router.get('/cv-profiles', authenticateToken, cvController.getCVProfiles);
router.get('/cv-profiles/:id', authenticateToken, cvController.getCVProfile);
router.delete('/cv-profiles/:id', authenticateToken, cvController.deleteCVProfile);
router.post('/cv-profiles/:id/set-default', authenticateToken, cvController.setDefaultCVProfile);

// Document routes
router.post('/documents', authenticateToken, upload.single('file'), cvController.uploadDocument);
router.get('/documents', authenticateToken, cvController.getDocuments);
router.get('/documents/:id', authenticateToken, cvController.getDocument);
router.delete('/documents/:id', authenticateToken, cvController.deleteDocument);

// Job application routes
router.post('/jobs/:jobId/apply', authenticateToken, cvController.applyForJob);
router.get('/applications', authenticateToken, cvController.getApplications);
router.get('/applications/:id', authenticateToken, cvController.getApplication);

export default router; 