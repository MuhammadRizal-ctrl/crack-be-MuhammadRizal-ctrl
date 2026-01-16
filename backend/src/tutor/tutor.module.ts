import { Module } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenAIService } from './services/openai.service';

@Module({
  imports: [PrismaModule],
  controllers: [TutorController],
  providers: [TutorService, OpenAIService],
  exports: [TutorService],
})
export class TutorModule {}

