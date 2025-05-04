import { WebSocketServer, WebSocket } from 'ws';
import { RedisService } from './redis-service';
import { AnalyticsService } from './analytics-service';

interface Client {
  ws: WebSocket;
  companyId?: string;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, Client>;
  private redisService: RedisService;
  private analyticsService: AnalyticsService;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.clients = new Map();
    this.redisService = new RedisService();
    this.analyticsService = new AnalyticsService();

    this.setupWebSocketServer();
    this.setupRedisSubscriber();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = req.headers['client-id'] as string;
      if (!clientId) {
        ws.close(1008, 'Client ID required');
        return;
      }

      this.clients.set(clientId, { ws });

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          switch (data.type) {
            case 'subscribe':
              await this.handleSubscribe(clientId, data.companyId);
              break;
            case 'unsubscribe':
              await this.handleUnsubscribe(clientId, data.companyId);
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }

  private setupRedisSubscriber(): void {
    this.redisService.subscribe('analytics', async (message) => {
      const { type, companyId, data } = message;
      
      // Send to all clients subscribed to the specific company or global
      for (const [clientId, client] of this.clients.entries()) {
        if (client.companyId === companyId || !companyId) {
          try {
            client.ws.send(JSON.stringify({ type, data }));
          } catch (error) {
            console.error('Error sending message to client:', error);
            this.clients.delete(clientId);
          }
        }
      }
    });
  }

  private async handleSubscribe(clientId: string, companyId?: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client) {
      client.companyId = companyId;

      // Send initial data
      const metrics = await this.analyticsService.getCurrentMetrics(companyId);
      client.ws.send(JSON.stringify({
        type: 'metrics',
        data: metrics
      }));

      // Add to Redis set for company-specific updates
      if (companyId) {
        await this.redisService.set(`company:${companyId}:clients`, clientId);
      }
    }
  }

  private async handleUnsubscribe(clientId: string, companyId?: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client) {
      client.companyId = undefined;

      // Remove from Redis set
      if (companyId) {
        await this.redisService.del(`company:${companyId}:clients`);
      }
    }
  }

  public async broadcastUpdate(type: string, data: any, companyId?: string): Promise<void> {
    await this.redisService.publish('analytics', {
      type,
      companyId,
      data
    });
  }

  public async cleanup(): Promise<void> {
    this.wss.close();
    await this.redisService.cleanup();
  }
} 