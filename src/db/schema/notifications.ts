// src/db/schema/notifications.ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(), // ticket_created, ticket_assigned, etc
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  relatedId: integer('related_id'), // ID of related entity (ticket, etc)
  relatedType: varchar('related_type', { length: 50 }), // Type of related entity
  createdAt: timestamp('created_at').defaultNow(),
});

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;