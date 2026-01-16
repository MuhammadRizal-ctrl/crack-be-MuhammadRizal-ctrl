import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './websocket.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [PrismaModule, JwtModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class WebSocketModule {}

