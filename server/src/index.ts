import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketService } from './services/websocket-service';
import analyticsRoutes from './routes/analytics-routes';
import chatbotRoutes from './routes/chatbot-routes';
import { authenticateToken } from './middleware/auth';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import Redis from 'ioredis';

const app = express();
const server = createServer(app);

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize WebSocket service
const wsService = new WebSocketService(8080);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(limiter);
app.use(authenticateToken);

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    redis.quit();
    process.exit(0);
  });
}); 