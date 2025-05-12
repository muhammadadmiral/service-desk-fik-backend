import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nim: varchar('nim', { length: 20 }).unique(),
  nip: varchar('nip', { length: 20 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('mahasiswa'), // mahasiswa, dosen, admin, executive
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }), // Jabatan spesifik (Wadek 1, Wadek 2, etc)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;