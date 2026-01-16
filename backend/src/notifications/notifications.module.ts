import { Module, OnModuleInit } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsGateway } from '../websocket/websocket.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule implements OnModuleInit {
  constructor(
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  onModuleInit() {
    // Inject gateway into service after module initialization
    this.notificationsService.setGateway(this.notificationsGateway);
  }
}

