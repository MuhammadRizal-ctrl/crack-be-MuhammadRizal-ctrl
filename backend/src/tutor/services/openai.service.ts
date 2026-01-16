import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TutorPersonality } from '@prisma/client';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  private model: string;
  private maxTokens: number;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4-turbo-preview';
    this.maxTokens = parseInt(this.configService.get<string>('OPENAI_MAX_TOKENS') || '1000', 10);

    if (apiKey && apiKey !== 'your-openai-api-key' && apiKey.startsWith('sk-')) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log(`OpenAI service initialized with model: ${this.model}`);
    } else {
      this.logger.warn('OpenAI API key not configured or invalid, using mock responses');
      this.logger.warn('To enable real AI responses, set OPENAI_API_KEY in your .env file');
    }
  }

  /**
   * Get system prompt based on personality
   */
  private getSystemPrompt(personality: TutorPersonality, context?: any): string {
    const basePrompt = 'You are a helpful coding tutor for a learning management system. ';
    
    const personalityPrompts: Record<TutorPersonality, string> = {
      balanced: basePrompt + 'Provide clear, balanced explanations that are easy to understand.',
      teacher: basePrompt + 'Act as a traditional teacher. Be thorough, structured, and educational. Use examples and analogies.',
      creative: basePrompt + 'Be creative and engaging! Use fun examples, analogies, and make learning enjoyable.',
      socratic: basePrompt + 'Use the Socratic method. Ask questions to guide the student to discover answers themselves.',
      genz: basePrompt + 'Use Gen Z language and style. Be relatable, use modern slang appropriately, but still be educational.',
      asian_buddy: basePrompt + 'Be friendly and encouraging like a supportive Asian friend. Use positive reinforcement and be patient.',
      strict: basePrompt + 'Be strict but fair. Demand precision and thoroughness. Challenge the student to think deeply.',
    };

    let prompt = personalityPrompts[personality] || personalityPrompts.balanced;

    if (context) {
      if (context.courseId) {
        prompt += ' The student is learning from a course.';
      }
      if (context.challengeId) {
        prompt += ' The student is working on a coding challenge.';
      }
      if (context.roadmapItemId) {
        prompt += ' The student is following a learning roadmap.';
      }
    }

    return prompt;
  }

  /**
   * Generate AI response using OpenAI API
   */
  async generateResponse(
    message: string,
    personality: TutorPersonality,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: any,
  ): Promise<string> {
    if (!this.openai) {
      this.logger.warn('OpenAI not configured, using mock response');
      // Fallback to mock response if OpenAI is not configured
      return this.getMockResponse(message, personality);
    }

    try {
      this.logger.log(`🤖 Generating AI response with personality: ${personality}`);
      this.logger.debug(`Message: ${message.substring(0, 100)}...`);
      this.logger.debug(`History length: ${conversationHistory.length} messages`);
      this.logger.debug(`Model: ${this.model}, Max tokens: ${this.maxTokens}`);

      const systemPrompt = this.getSystemPrompt(personality, context);
      const temperature = personality === 'creative' ? 0.9 : personality === 'strict' ? 0.5 : 0.7;

      this.logger.log(`📡 Sending request to OpenAI API...`);
      const startTime = Date.now();

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        temperature,
        max_tokens: this.maxTokens,
      });

      const duration = Date.now() - startTime;
      const response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      const tokensUsed = completion.usage?.total_tokens || 0;

      this.logger.log(`✅ OpenAI response received (${duration}ms, ${tokensUsed} tokens)`);
      this.logger.debug(`Response preview: ${response.substring(0, 100)}...`);

      return response;
    } catch (error: any) {
      this.logger.error('❌ OpenAI API error:', error.message);
      this.logger.error(`Error details: ${JSON.stringify({
        status: error.status,
        code: error.code,
        type: error.type,
      })}`);
      // Fallback to mock response on error
      this.logger.warn('Falling back to mock response');
      return this.getMockResponse(message, personality);
    }
  }

  /**
   * Mock response fallback (used when OpenAI is not configured)
   */
  private getMockResponse(message: string, personality: TutorPersonality): string {
    const responses: Record<TutorPersonality, string> = {
      balanced: `I understand you're asking about "${message}". Let me help you with that. This is a great question!`,
      teacher: `Excellent question! Let me explain this concept clearly. "${message}" relates to several important principles that we should understand step by step.`,
      creative: `Ooh, interesting! "${message}" - that's a fun one! Let's explore this together with some creative examples and see where it takes us!`,
      socratic: `That's a thoughtful question. What do you think "${message}" means? Let's work through this step by step together.`,
      genz: `Okay, so "${message}" - no cap, this is actually pretty important. Let me break it down for you in a way that makes sense.`,
      asian_buddy: `Ah, "${message}"! Very good question, friend! Let me explain this properly so you understand well.`,
      strict: `Regarding "${message}": This is a fundamental concept. Pay close attention as I explain the key principles.`,
    };

    return responses[personality] || responses.balanced;
  }
}

