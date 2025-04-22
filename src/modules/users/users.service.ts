import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll() {
    return db.select().from(users);
  }

  async findOne(id: number) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async findByUid(uid: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(data: any) {
    try {
      const userData = {
        uid: data.uid,
        name: data.name,
        email: data.email,
        role: data.role || 'mahasiswa',
        department: data.department || '',
        profilePicture: data.profilePicture || '',
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
      .set(data)
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
