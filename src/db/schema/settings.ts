// src/db/schema/settings.ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value').notNull(),
  type: varchar('type', { length: 50 }).default('string'), // string, number, boolean, json
  category: varchar('category', { length: 100 }), // system, email, ticket, etc
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Setting = InferSelectModel<typeof settings>;
export type NewSetting = InferInsertModel<typeof settings>;