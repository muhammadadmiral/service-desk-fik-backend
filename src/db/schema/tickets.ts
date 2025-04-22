import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from './users';

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  category: varchar('category', { length: 100 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  progress: integer('progress').default(0),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  assignedTo: integer('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  estimatedCompletion: timestamp('estimated_completion'),
  completedAt: timestamp('completed_at'),
});

export const ticketMessages = pgTable('ticket_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .references(() => tickets.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ticketAttachments = pgTable('ticket_attachments', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .references(() => tickets.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  filePath: varchar('file_path', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Ticket = InferSelectModel<typeof tickets>;
export type NewTicket = InferInsertModel<typeof tickets>;
export type TicketMessage = InferSelectModel<typeof ticketMessages>;
export type NewTicketMessage = InferInsertModel<typeof ticketMessages>;
export type TicketAttachment = InferSelectModel<typeof ticketAttachments>;
export type NewTicketAttachment = InferInsertModel<typeof ticketAttachments>;
