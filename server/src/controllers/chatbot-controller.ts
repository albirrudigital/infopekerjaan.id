import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot-service';
import { isAdmin } from '../middleware/auth';

export class ChatbotController {
  private chatbotService: ChatbotService;

  constructor() {
    this.chatbotService = new ChatbotService();
  }

  async handleCommand(req: Request, res: Response) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      const response = await this.chatbotService.handleCommand(command);
      res.json({ response });
    } catch (error) {
      console.error('Error handling chatbot command:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 