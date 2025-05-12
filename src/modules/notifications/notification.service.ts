// src/modules/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import { notifications, users } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // Get notifications for a user
  async getUserNotifications(userId: number, unreadOnly = false) {
    try {
      const conditions = unreadOnly
        ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
        : eq(notifications.userId, userId);

      return await db
        .select()
        .from(notifications)
        .where(conditions)
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      this.logger.error(`Error fetching notifications: ${error.message}`);
      throw error;
    }
  }

  // Create notification
  async createNotification(data: {
    userId: number;
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }) {
    try {
      const result = await db.insert(notifications).values({
        ...data,
        isRead: false,
      }).returning();

      // Here you could also emit a real-time event using WebSockets
      // this.eventEmitter.emit('notification.created', result[0]);

      return result[0];
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number, userId: number) {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: number) {
    try {
      return await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );
    } catch (error) {
      this.logger.error(`Error marking all notifications as read: ${error.message}`);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: number, userId: number) {
    try {
      const result = await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        )
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error deleting notification: ${error.message}`);
      throw error;
    }
  }

  // Create notifications for multiple users
  async createBulkNotifications(userIds: number[], data: {
    type: string;
    title: string;
    message: string;
    relatedId?: number;
    relatedType?: string;
  }) {
    try {
      const notificationData = userIds.map(userId => ({
        userId,
        ...data,
        isRead: false,
      }));

      return await db.insert(notifications).values(notificationData).returning();
    } catch (error) {
      this.logger.error(`Error creating bulk notifications: ${error.message}`);
      throw error;
    }
  }

  // Notification helpers for tickets
  async notifyTicketCreated(ticket: any) {
    // Notify admins about new ticket
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'));

    const adminIds = admins.map(admin => admin.id);

    await this.createBulkNotifications(adminIds, {
      type: 'ticket_created',
      title: 'New Ticket Created',
      message: `New ticket #${ticket.ticketNumber}: ${ticket.subject}`,
      relatedId: ticket.id,
      relatedType: 'ticket',
    });

    // If ticket is assigned to specific user
    if (ticket.assignedTo) {
      await this.createNotification({
        userId: ticket.assignedTo,
        type: 'ticket_assigned',
        title: 'Ticket Assigned to You',
        message: `Ticket #${ticket.ticketNumber} has been assigned to you`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });
    }
  }

  async notifyTicketStatusChange(ticket: any, oldStatus: string) {
    // Notify ticket creator
    await this.createNotification({
      userId: ticket.userId,
      type: 'ticket_status_changed',
      title: 'Ticket Status Updated',
      message: `Your ticket #${ticket.ticketNumber} status changed from ${oldStatus} to ${ticket.status}`,
      relatedId: ticket.id,
      relatedType: 'ticket',
    });

    // Notify assigned person if any
    if (ticket.assignedTo) {
      await this.createNotification({
        userId: ticket.assignedTo,
        type: 'ticket_status_changed',
        title: 'Assigned Ticket Status Changed',
        message: `Ticket #${ticket.ticketNumber} status changed from ${oldStatus} to ${ticket.status}`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });
    }
  }

  async notifyNewMessage(ticket: any, message: any, senderName: string) {
    // Notify all participants except sender
    const participants = [ticket.userId];
    if (ticket.assignedTo) participants.push(ticket.assignedTo);
    
    const notifyUsers = participants.filter(id => id !== message.userId);

    await this.createBulkNotifications(notifyUsers, {
      type: 'new_message',
      title: 'New Message on Ticket',
      message: `${senderName} commented on ticket #${ticket.ticketNumber}`,
      relatedId: ticket.id,
      relatedType: 'ticket',
    });
  }
}