import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { tickets, users, Ticket, NewTicket } from '../../db/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  async findAll(status?: string, category?: string): Promise<any[]> {
    try {
      let query = db
        .select({
          ticket: tickets,
          userName: users.name,
          userEmail: users.email,
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.userId, users.id));

      if (status || category) {
        const filters = [];
        if (status) {
          filters.push(eq(tickets.status, status));
        }
        if (category) {
          filters.push(eq(tickets.category, category));
        }

        query = query.where(and(...filters));
      }

      const result = await query;

      return result.map((item) => ({
        ...item.ticket,
        userName: item.userName,
        userEmail: item.userEmail,
      }));
    } catch (error) {
      this.logger.error(`Error finding tickets: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.userId, userId));
  }

  async findOne(id: number): Promise<any> {
    try {
      const result = await db
        .select({
          ticket: tickets,
          userName: users.name,
          userEmail: users.email,
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.userId, users.id))
        .where(eq(tickets.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      return {
        ...result[0].ticket,
        userName: result[0].userName,
        userEmail: result[0].userEmail,
      };
    } catch (error) {
      this.logger.error(`Error finding ticket ${id}: ${error.message}`);
      throw error;
    }
  }

  async create(data: any): Promise<Ticket> {
    try {
      const result = await db
        .insert(tickets)
        .values({
          subject: data.subject,
          description: data.description,
          category: data.category,
          type: data.type,
          department: data.department,
          priority: data.priority || 'medium',
          userId: data.userId,
          ticketNumber: data.ticketNumber,
          status: 'pending',
          progress: 0,
        })
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, data: any): Promise<Ticket | null> {
    try {
      const ticket = await this.findOne(id);
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      const updateData = { ...data };

      const result = await db
        .update(tickets)
        .set(updateData)
        .where(eq(tickets.id, id))
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error updating ticket ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const ticket = await this.findOne(id);
      if (!ticket) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      const result = await db
        .delete(tickets)
        .where(eq(tickets.id, id))
        .returning({ id: tickets.id });

      return result.length > 0;
    } catch (error) {
      this.logger.error(`Error removing ticket ${id}: ${error.message}`);
      throw error;
    }
  }
}
