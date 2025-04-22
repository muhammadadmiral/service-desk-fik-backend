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
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.uid, uid)) // Menggunakan uid untuk pencarian
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.error(`Error finding user by UID: ${error.message}`);
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

  async create(data: any) {
    try {
      const userData = {
        uid: data.uid, // Memastikan uid digunakan saat pembuatan
        name: data.name,
        email: data.email,
        password: data.password, // Pastikan password sudah terenkripsi sebelum disimpan
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
