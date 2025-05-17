// src/db/schema/users.ts 

import { pgTable, serial, varchar, timestamp, text, integer, jsonb } from 'drizzle-orm/pg-core';
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
  programStudi: varchar('program_studi', { length: 100 }),
  fakultas: varchar('fakultas', { length: 100 }),
  angkatan: varchar('angkatan', { length: 10 }),
  status: varchar('status', { length: 20 }), // Active, Inactive, etc.
  lastLogin: timestamp('last_login'),
});

// Add to schema/users.ts
export const userAuditLogs = pgTable('user_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  performedBy: integer('performed_by')
    .references(() => users.id)
    .notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type UserAuditLog = InferSelectModel<typeof userAuditLogs>;
export type NewUserAuditLog = InferInsertModel<typeof userAuditLogs>;
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;