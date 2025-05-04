import express from 'express';
import { ChatbotController } from '../controllers/chatbot-controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const chatbotController = new ChatbotController();

// Handle chatbot command
router.post('/command', authenticateToken, chatbotController.handleCommand.bind(chatbotController));

export default router; 