import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CodeExecutionService } from './services/code-execution.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ChallengesController],
  providers: [ChallengesService, CodeExecutionService],
  exports: [ChallengesService],
})
export class ChallengesModule {}

