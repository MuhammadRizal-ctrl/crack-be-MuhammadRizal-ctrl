import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TutorPersonality } from '@prisma/client';

export class ChatMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsEnum(TutorPersonality)
  personality?: TutorPersonality;

  @IsOptional()
  context?: {
    courseId?: string;
    challengeId?: string;
    roadmapItemId?: string;
  };
}

