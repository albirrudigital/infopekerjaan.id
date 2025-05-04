import { Router } from 'express';
import { PaymentController } from '../controllers/payment-controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Create payment transaction
router.post('/create', requireAuth, PaymentController.createPayment);

// Midtrans payment notification webhook
router.post('/notification', PaymentController.handleNotification);

// Get payment status
router.get('/status/:orderId', requireAuth, PaymentController.getStatus);

// Get user payment history
router.get('/history', requireAuth, PaymentController.getUserHistory);

// Get available promo codes
router.get('/promos', requireAuth, PaymentController.getPromoCodes);

export default router; 