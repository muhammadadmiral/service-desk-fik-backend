// src/modules/users/users.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import { users, tickets } from '../../db/schema';
import { eq, and, or, like, sql, ne } from 'drizzle-orm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll(filters?: {
    role?: string;
    department?: string;
    search?: string;
    available?: boolean;
  }) {
    try {
      const conditions = [];

      if (filters?.role) {
        conditions.push(eq(users.role, filters.role));
      }

      if (filters?.department) {
        conditions.push(eq(users.department, filters.department));
      }

      if (filters?.search) {
        conditions.push(
          or(
            like(users.name, `%${filters.search}%`),
            like(users.email, `%${filters.search}%`),
            like(users.nim, `%${filters.search}%`),
            like(users.nip, `%${filters.search}%`)
          )
        );
      }

      const query = conditions.length > 0 
        ? db.select().from(users).where(and(...conditions))
        : db.select().from(users);

      const results = await query;

      // If checking for available dosen
      if (filters?.available && filters.role === 'dosen') {
        // Get dosen with their active ticket counts
        const dosenWithTicketCounts = await Promise.all(
          results.map(async (dosen) => {
            const activeTickets = await db
              .select({ count: sql<number>`count(*)::int` })
              .from(tickets)
              .where(
                and(
                  eq(tickets.assignedTo, dosen.id),
                  ne(tickets.status, 'completed'),
                  ne(tickets.status, 'cancelled')
                )
              );

            return {
              ...dosen,
              activeTicketCount: activeTickets[0]?.count || 0,
              isAvailable: (activeTickets[0]?.count || 0) < 5, // Consider available if less than 5 active tickets
            };
          })
        );

        return dosenWithTicketCounts.filter(d => d.isAvailable);
      }

      return results;
    } catch (error) {
      this.logger.error(`Error finding all users: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async findByNim(nim: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.nim, nim))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error finding user by NIM: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      throw error;
    }
  }

  async findAvailableAdmin() {
    try {
      // Find admin with least active tickets
      const admins = await this.findAll({ role: 'admin' });
      
      const adminWithLoads = await Promise.all(
        admins.map(async (admin) => {
          const activeTickets = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(tickets)
            .where(
              and(
                eq(tickets.assignedTo, admin.id),
                ne(tickets.status, 'completed'),
                ne(tickets.status, 'cancelled')
              )
            );

          return {
            ...admin,
            activeTicketCount: activeTickets[0]?.count || 0,
          };
        })
      );

      // Sort by load and return the one with least tickets
      adminWithLoads.sort((a, b) => a.activeTicketCount - b.activeTicketCount);
      return adminWithLoads[0];
    } catch (error) {
      this.logger.error(`Error finding available admin: ${error.message}`);
      throw error;
    }
  }

  async findAvailableDosen(department?: string) {
    try {
      const filters: any = { role: 'dosen', available: true };
      if (department) {
        filters.department = department;
      }

      return this.findAll(filters);
    } catch (error) {
      this.logger.error(`Error finding available dosen: ${error.message}`);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const userData = {
        nim: data.nim,
        nip: data.nip,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'mahasiswa',
        department: data.department || '',
        position: data.position,
      };

      const result = await db.insert(users).values(userData).returning();
      return result[0];
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async update(id: number, data: any) {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async remove(id: number) {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }
}