import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import { tickets } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  // Perbaiki findAll untuk menerima parameter
  async findAll(status?: string, category?: string): Promise<any[]> {
    try {
      let query = db.select().from(tickets);

      // Tambahkan filter jika ada
      if (status && category) {
        query = query.where(
          and(eq(tickets.status, status), eq(tickets.category, category)),
        );
      } else if (status) {
        query = query.where(eq(tickets.status, status));
      } else if (category) {
        query = query.where(eq(tickets.category, category));
      }

      return query;
    } catch (error) {
      this.logger.error(`Error finding tickets: ${error.message}`);
      throw error;
    }
  }

  // Tambahkan method findByUserId
  async findByUserId(userId: number): Promise<any[]> {
    try {
      return db.select().from(tickets).where(eq(tickets.userId, userId));
    } catch (error) {
      this.logger.error(`Error finding tickets by user ID: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    const result = await db.select().from(tickets).where(eq(tickets.id, id));
    return result[0] || null;
  }

  async create(data: any): Promise<any> {
    try {
      // Pastikan field yang dimasukkan sesuai dengan schema tickets
      // Ambil dari schema/tickets.ts
      const result = await db
        .insert(tickets)
        .values({
          subject: data.subject,
          description: data.description,
          category: data.category,
          type: data.type,
          department: data.department,
          userId: data.userId,
          ticketNumber: data.ticketNumber,
          // Jangan tambahkan field lain yang tidak ada di schema
        })
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, data: any): Promise<any> {
    const result = await db
      .update(tickets)
      .set(data)
      .where(eq(tickets.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number): Promise<boolean> {
    const result = await db
      .delete(tickets)
      .where(eq(tickets.id, id))
      .returning({ id: tickets.id });

    return result.length > 0;
  }
}
