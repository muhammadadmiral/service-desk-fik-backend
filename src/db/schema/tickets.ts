// src/db/schema/tickets.ts
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from './users';

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, disposisi, in-progress, completed, cancelled
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  type: varchar('type', { length: 100 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  progress: integer('progress').default(0), // 0-100
  isSimple: boolean('is_simple').default(false), // Flag for simple tickets
  disposisiChain: jsonb('disposisi_chain').default('[]'), // Track forwarding history
  currentHandler: integer('current_handler').references(() => users.id), // Current person handling
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  assignedTo: integer('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  estimatedCompletion: timestamp('estimated_completion'),
  completedAt: timestamp('completed_at'),
  // New fields for enhanced backend
  slaDeadline: timestamp('sla_deadline'),
  slaStatus: varchar('sla_status', { length: 50 }), // on-time, at-risk, breached
  escalationLevel: integer('escalation_level').default(0),
  reopenCount: integer('reopen_count').default(0),
  customerSatisfaction: integer('customer_satisfaction'), // 1-5 rating
  resolutionTime: integer('resolution_time'), // in minutes
  firstResponseTime: integer('first_response_time'), // in minutes
  tags: jsonb('tags').default('[]'),
  metadata: jsonb('metadata').default('{}'),
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
  messageType: varchar('message_type', { length: 50 }).default('comment'), // comment, internal_note, status_change, assignment_change
  isInternal: boolean('is_internal').default(false),
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
  cloudinaryId: varchar('cloudinary_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// New table for disposisi history
export const disposisiHistory = pgTable('disposisi_history', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .references(() => tickets.id)
    .notNull(),
  fromUserId: integer('from_user_id')
    .references(() => users.id),
  toUserId: integer('to_user_id')
    .references(() => users.id)
    .notNull(),
  reason: text('reason'),
  notes: text('notes'),
  progressUpdate: integer('progress_update'),
  createdAt: timestamp('created_at').defaultNow(),
  // Enhanced fields
  actionType: varchar('action_type', { length: 50 }), // forward, return, escalate
  expectedCompletionTime: timestamp('expected_completion_time'),
  slaImpact: varchar('sla_impact', { length: 50 }), // extended, maintained, improved
});

// New tables for enhanced features
export const ticketTemplates = pgTable('ticket_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  department: varchar('department', { length: 100 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull(),
  templateContent: jsonb('template_content').notNull(),
  autoAssignmentRules: jsonb('auto_assignment_rules'),
  slaHours: integer('sla_hours').default(24),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ticketWorkflows = pgTable('ticket_workflows', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  steps: jsonb('steps').notNull(), // Array of workflow steps
  conditions: jsonb('conditions'), // Rules for workflow progression
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ticketAuditLogs = pgTable('ticket_audit_logs', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id')
    .references(() => tickets.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ticketAnalytics = pgTable('ticket_analytics', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  hour: integer('hour'),
  department: varchar('department', { length: 100 }),
  category: varchar('category', { length: 100 }),
  totalTickets: integer('total_tickets').default(0),
  openTickets: integer('open_tickets').default(0),
  closedTickets: integer('closed_tickets').default(0),
  averageResolutionTime: integer('average_resolution_time'),
  averageResponseTime: integer('average_response_time'),
  slaBreaches: integer('sla_breaches').default(0),
  customerSatisfactionAverage: integer('customer_satisfaction_average'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Ticket = InferSelectModel<typeof tickets>;
export type NewTicket = InferInsertModel<typeof tickets>;
export type TicketMessage = InferSelectModel<typeof ticketMessages>;
export type NewTicketMessage = InferInsertModel<typeof ticketMessages>;
export type TicketAttachment = InferSelectModel<typeof ticketAttachments>;
export type NewTicketAttachment = InferInsertModel<typeof ticketAttachments>;
export type DisposisiHistory = InferSelectModel<typeof disposisiHistory>;
export type NewDisposisiHistory = InferInsertModel<typeof disposisiHistory>;
export type TicketTemplate = InferSelectModel<typeof ticketTemplates>;
export type NewTicketTemplate = InferInsertModel<typeof ticketTemplates>;
export type TicketWorkflow = InferSelectModel<typeof ticketWorkflows>;
export type NewTicketWorkflow = InferInsertModel<typeof ticketWorkflows>;
export type TicketAuditLog = InferSelectModel<typeof ticketAuditLogs>;
export type NewTicketAuditLog = InferInsertModel<typeof ticketAuditLogs>;
export type TicketAnalytic = InferSelectModel<typeof ticketAnalytics>;
export type NewTicketAnalytic = InferInsertModel<typeof ticketAnalytics>;