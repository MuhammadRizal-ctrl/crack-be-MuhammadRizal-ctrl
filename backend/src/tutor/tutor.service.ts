import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { TutorPersonality } from '@prisma/client';
import { OpenAIService } from './services/openai.service';

@Injectable()
export class TutorService {
  private readonly logger = new Logger('TutorService');

  constructor(
    private prisma: PrismaService,
    private openaiService: OpenAIService,
  ) {}

  async sendMessage(userId: string, chatMessageDto: ChatMessageDto) {
    const { message, conversationId, personality, context } = chatMessageDto;

    let conversation;

    if (conversationId) {
      conversation = await this.prisma.tutorConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      if (conversation.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
    } else {
      // Create new conversation
      conversation = await this.prisma.tutorConversation.create({
        data: {
          userId,
          title: message.substring(0, 50),
          personality: personality || 'balanced',
          context: context || {},
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      });
    }

    // Save user message
    const userMessage = await this.prisma.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Get conversation history for context
    const history = conversation.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Generate AI response using OpenAI
    this.logger.log(`💬 Processing AI Tutor message for user ${userId}`);
    this.logger.debug(`Conversation ID: ${conversation.id}, Personality: ${conversation.personality}`);
    
    const assistantResponse = await this.openaiService.generateResponse(
      message,
      conversation.personality,
      history,
      conversation.context as any,
    );
    
    this.logger.log(`✅ AI response generated successfully`);

    const assistantMessage = await this.prisma.tutorMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    // Update conversation title if it's the first message
    if (conversation.messages.length === 0) {
      await this.prisma.tutorConversation.update({
        where: { id: conversation.id },
        data: {
          title: message.substring(0, 50),
          updatedAt: new Date(),
        },
      });
    }

    return {
      conversationId: conversation.id,
      messages: [userMessage, assistantMessage],
    };
  }

  async getHistory(userId: string) {
    const conversations = await this.prisma.tutorConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      personality: conv.personality,
      lastMessage: conv.messages[0]?.content,
      messageCount: conv._count.messages,
      updatedAt: conv.updatedAt,
    }));
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.tutorConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.tutorConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.tutorConversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversation deleted successfully' };
  }

}

