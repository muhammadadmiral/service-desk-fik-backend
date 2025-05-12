// src/modules/tickets/tickets.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import {
  tickets,
  ticketMessages,
  ticketAttachments,
  users,
} from '../../db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  async findAll(status?: string, category?: string) {
    try {
      // Build query conditionally
      if (status && category) {
        return await db
          .select()
          .from(tickets)
          .where(
            and(eq(tickets.status, status), eq(tickets.category, category)),
          )
          .orderBy(desc(tickets.createdAt));
      } else if (status) {
        return await db
          .select()
          .from(tickets)
          .where(eq(tickets.status, status))
          .orderBy(desc(tickets.createdAt));
      } else if (category) {
        return await db
          .select()
          .from(tickets)
          .where(eq(tickets.category, category))
          .orderBy(desc(tickets.createdAt));
      } else {
        return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
      }
    } catch (error) {
      this.logger.error(`Error finding tickets: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId: number, status?: string, category?: string) {
    try {
      // Build query conditionally
      if (status && category) {
        return await db
          .select()
          .from(tickets)
          .where(
            and(
              eq(tickets.userId, userId),
              eq(tickets.status, status),
              eq(tickets.category, category),
            ),
          )
          .orderBy(desc(tickets.createdAt));
      } else if (status) {
        return await db
          .select()
          .from(tickets)
          .where(and(eq(tickets.userId, userId), eq(tickets.status, status)))
          .orderBy(desc(tickets.createdAt));
      } else if (category) {
        return await db
          .select()
          .from(tickets)
          .where(
            and(eq(tickets.userId, userId), eq(tickets.category, category)),
          )
          .orderBy(desc(tickets.createdAt));
      } else {
        return await db
          .select()
          .from(tickets)
          .where(eq(tickets.userId, userId))
          .orderBy(desc(tickets.createdAt));
      }
    } catch (error) {
      this.logger.error(`Error finding tickets by user ID: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const result = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      // Get ticket attachments
      const attachments = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, id));

      return {
        ...result[0],
        attachments,
      };
    } catch (error) {
      this.logger.error(`Error finding ticket by ID: ${error.message}`);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const result = await db.insert(tickets).values(data).returning();
      return result[0];
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      // Update the updatedAt timestamp
      data.updatedAt = new Date();

      const result = await db
        .update(tickets)
        .set(data)
        .where(eq(tickets.id, id))
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error updating ticket: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Delete related records first
      await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
      await db
        .delete(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, id));

      // Then delete the ticket
      const result = await db
        .delete(tickets)
        .where(eq(tickets.id, id))
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error removing ticket: ${error.message}`);
      throw error;
    }
  }

  async getTicketMessages(ticketId: number) {
    try {
      const messages = await db
        .select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticketId))
        .orderBy(asc(ticketMessages.createdAt));

      // For each message, get the user info and attachments
      const messagesWithSender = await Promise.all(
        messages.map(async (message) => {
          // Get user info - Fix: Query the users table instead of tickets
          const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, message.userId))
            .limit(1);

          const sender =
            userResult.length > 0
              ? {
                  id: userResult[0].id,
                  name: userResult[0].name || 'Unknown User', // Now this will work
                  role: userResult[0].role || 'user', // Now this will work
                }
              : {
                  id: message.userId,
                  name: 'Unknown User',
                  role: 'user',
                };

          // Get attachments
          const attachments = await db
            .select()
            .from(ticketAttachments)
            .where(
              and(
                eq(ticketAttachments.ticketId, ticketId),
                eq(ticketAttachments.userId, message.userId),
              ),
            );

          return {
            ...message,
            sender,
            attachments,
          };
        }),
      );

      return messagesWithSender;
    } catch (error) {
      this.logger.error(`Error getting ticket messages: ${error.message}`);
      throw error;
    }
  }

  async addMessage(data: any) {
    try {
      const result = await db.insert(ticketMessages).values(data).returning();
      return result[0];
    } catch (error) {
      this.logger.error(`Error adding message: ${error.message}`);
      throw error;
    }
  }

  async addAttachments(attachments: any[]) {
    try {
      if (attachments.length === 0) {
        return [];
      }

      const result = await db
        .insert(ticketAttachments)
        .values(attachments)
        .returning();
      return result;
    } catch (error) {
      this.logger.error(`Error adding attachments: ${error.message}`);
      throw error;
    }

  }
    async getAttachment(attachmentId: number) {
    try {
      const result = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.id, attachmentId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.logger.error(`Error getting attachment: ${error.message}`);
      throw error;
    }
  }

  async deleteAttachment(attachmentId: number) {
    try {
      const result = await db
        .delete(ticketAttachments)
        .where(eq(ticketAttachments.id, attachmentId))
        .returning();
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error deleting attachment: ${error.message}`);
      throw error;
    }
  }

  async getAttachmentsByTicketId(ticketId: number) {
    try {
      const attachments = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, ticketId))
        .orderBy(desc(ticketAttachments.createdAt));
      
      return attachments;
    } catch (error) {
      this.logger.error(`Error getting attachments by ticket ID: ${error.message}`);
      throw error;
    }
  }

  async updateAttachment(attachmentId: number, data: any) {
    try {
      const result = await db
        .update(ticketAttachments)
        .set(data)
        .where(eq(ticketAttachments.id, attachmentId))
        .returning();
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error updating attachment: ${error.message}`);
      throw error;
    }
  }
}
