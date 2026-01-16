import { Injectable, Logger, NotFoundException, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  COURSE_ENROLLMENT = 'course_enrollment',
  CHALLENGE_FEEDBACK = 'challenge_feedback',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system',
  COURSE_COMPLETED = 'course_completed',
  CHALLENGE_SUBMITTED = 'challenge_submitted',
  ROADMAP_PROGRESS = 'roadmap_progress',
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private notificationsGateway: any;

  constructor(private prisma: PrismaService) {}

  setGateway(gateway: any) {
    this.notificationsGateway = gateway;
  }

  async createNotification(
    userId: string,
    type: NotificationType | string,
    title: string,
    message: string,
    link?: string,
  ) {
    this.logger.log(`Creating notification for user ${userId}: ${type}`);

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });

    // Send real-time notification via WebSocket if gateway is available
    if (this.notificationsGateway) {
      this.notificationsGateway.sendNotificationToUser(userId, notification);
    }

    return notification;
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  // Helper methods for creating specific notification types
  async notifyCourseEnrollment(userId: string, courseTitle: string, courseId: string) {
    return this.createNotification(
      userId,
      NotificationType.COURSE_ENROLLMENT,
      'Course Enrolled',
      `You have successfully enrolled in "${courseTitle}"`,
      `/courses/${courseId}`,
    );
  }

  async notifyChallengeFeedback(
    userId: string,
    challengeTitle: string,
    challengeId: string,
    passed: boolean,
  ) {
    return this.createNotification(
      userId,
      NotificationType.CHALLENGE_FEEDBACK,
      'Challenge Submission Reviewed',
      `Your submission for "${challengeTitle}" has been ${passed ? 'accepted' : 'reviewed'}`,
      `/challenges/${challengeId}`,
    );
  }

  async notifyCourseCompleted(userId: string, courseTitle: string, courseId: string) {
    return this.createNotification(
      userId,
      NotificationType.COURSE_COMPLETED,
      'Course Completed! 🎉',
      `Congratulations! You have completed "${courseTitle}"`,
      `/courses/${courseId}`,
    );
  }

  async notifySystemAnnouncement(userId: string, title: string, message: string, link?: string) {
    return this.createNotification(
      userId,
      NotificationType.SYSTEM,
      title,
      message,
      link,
    );
  }
}

