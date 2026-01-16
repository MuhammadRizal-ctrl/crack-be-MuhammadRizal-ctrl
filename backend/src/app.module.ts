import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { ChallengesModule } from './challenges/challenges.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { TutorModule } from './tutor/tutor.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ExportModule } from './export/export.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { OpenAIHealthService } from './tutor/services/openai-health.service';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ChallengesModule,
    RoadmapsModule,
    TutorModule,
    UploadModule,
    EmailModule,
    NotificationsModule,
    WebSocketModule,
    ExportModule,
  ],
  providers: [
    AppService,
    OpenAIHealthService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

