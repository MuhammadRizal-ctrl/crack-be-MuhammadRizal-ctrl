import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIHealthService {
  private readonly logger = new Logger(OpenAIHealthService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your-openai-api-key' && apiKey.startsWith('sk-')) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Check if OpenAI API is configured and accessible
   */
  async checkHealth(): Promise<{
    configured: boolean;
    accessible: boolean;
    model?: string;
    error?: string;
  }> {
    if (!this.openai) {
      return {
        configured: false,
        accessible: false,
        error: 'OpenAI API key not configured',
      };
    }

    try {
      // Make a simple test request to verify the API key works
      const response = await this.openai.models.list();
      const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4-turbo-preview';
      
      return {
        configured: true,
        accessible: true,
        model,
      };
    } catch (error: any) {
      this.logger.error('OpenAI health check failed:', error.message);
      return {
        configured: true,
        accessible: false,
        error: error.message || 'Unable to connect to OpenAI API',
      };
    }
  }
}

