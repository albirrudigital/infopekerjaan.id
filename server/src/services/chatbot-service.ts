import { AnalyticsService } from './analytics-service';
import { PredictiveAnalyticsService } from './predictive-analytics-service';

export class ChatbotService {
  private analyticsService: AnalyticsService;
  private predictiveService: PredictiveAnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.predictiveService = new PredictiveAnalyticsService();
  }

  async handleCommand(command: string): Promise<string> {
    const [cmd, ...args] = command.split(' ');

    switch (cmd.toLowerCase()) {
      case '/revenue':
        return this.handleRevenueCommand(args);
      case '/churn':
        return this.handleChurnCommand(args);
      case '/predict':
        return this.handlePredictCommand(args);
      case '/help':
        return this.getHelpMessage();
      default:
        return 'Unknown command. Type /help for available commands.';
    }
  }

  private async handleRevenueCommand(args: string[]): Promise<string> {
    const period = args[0]?.toLowerCase();
    const metrics = await this.analyticsService.updateMetrics();

    switch (period) {
      case 'today':
        return `Today's Revenue: $${metrics.totalRevenue.toLocaleString()}`;
      case 'month':
        return `This Month's Revenue: $${metrics.totalRevenue.toLocaleString()}`;
      case 'year':
        return `This Year's Revenue: $${metrics.totalRevenue.toLocaleString()}`;
      default:
        return `Current Revenue: $${metrics.totalRevenue.toLocaleString()}`;
    }
  }

  private async handleChurnCommand(args: string[]): Promise<string> {
    const period = args[0]?.toLowerCase();
    const metrics = await this.analyticsService.updateMetrics();
    const churnRisks = await this.predictiveService.predictChurnRisk();

    switch (period) {
      case 'today':
        return `Today's Churn Rate: ${metrics.churnRate.toFixed(2)}%`;
      case 'month':
        return `This Month's Churn Rate: ${metrics.churnRate.toFixed(2)}%`;
      case 'risk':
        const topRisks = churnRisks.slice(0, 5);
        return `Top 5 Churn Risks:\n${topRisks.map(risk => 
          `User ${risk.userId} (${risk.planType}): ${(risk.riskScore * 100).toFixed(2)}%`
        ).join('\n')}`;
      default:
        return `Current Churn Rate: ${metrics.churnRate.toFixed(2)}%`;
    }
  }

  private async handlePredictCommand(args: string[]): Promise<string> {
    const metric = args[0]?.toLowerCase();
    const predictions = await this.predictiveService.predictNextMonthMetrics();

    switch (metric) {
      case 'revenue':
        return `Next Month Revenue Prediction: $${predictions.predictedValue.toLocaleString()}`;
      case 'users':
        return `Next Month User Prediction: ${predictions.predictedValue.toFixed(0)}`;
      default:
        return `Next Month ${predictions.metricName} Prediction: ${predictions.predictedValue.toLocaleString()}`;
    }
  }

  private getHelpMessage(): string {
    return `
Available Commands:
/revenue [today|month|year] - Get revenue metrics
/churn [today|month|risk] - Get churn metrics
/predict [revenue|users] - Get predictions
/help - Show this help message
    `.trim();
  }
} 