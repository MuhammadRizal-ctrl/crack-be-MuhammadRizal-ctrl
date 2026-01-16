import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`Client ${client.id} disconnected: Invalid user`);
        client.disconnect();
        return;
      }

      // Store user socket mapping
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      // Join user-specific room
      client.join(`user:${userId}`);

      this.logger.log(`User ${userId} connected (socket: ${client.id})`);

      // Send unread count
      const unreadCount = await this.prisma.notification.count({
        where: { userId, read: false },
      });

      client.emit('unread-count', { count: unreadCount });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { notificationId: string }) {
    const userId = client.data?.userId;
    if (!userId) return;

    try {
      await this.prisma.notification.update({
        where: { id: data.notificationId },
        data: { read: true, readAt: new Date() },
      });

      // Update unread count
      const unreadCount = await this.prisma.notification.count({
        where: { userId, read: false },
      });

      client.emit('unread-count', { count: unreadCount });
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('new-notification', notification);
    
    // Update unread count
    this.prisma.notification.count({
      where: { userId, read: false },
    }).then((count) => {
      this.server.to(`user:${userId}`).emit('unread-count', { count });
    });
  }

  // Method to broadcast to all connected users
  broadcastNotification(notification: any) {
    this.server.emit('new-notification', notification);
  }
}

