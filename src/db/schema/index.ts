import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';

// Users table - optimized with proper indexes and relations
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nim: varchar('nim', { length: 20 }).unique(),
  nip: varchar('nip', { length: 20 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('mahasiswa'),
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  programStudi: varchar('program_studi', { length: 100 }),
  fakultas: varchar('fakultas', { length: 100 }),
  angkatan: varchar('angkatan', { length: 10 }),
  status: varchar('status', { length: 20 }).default('active'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    roleIdx: index('user_role_idx').on(table.role),
    departmentIdx: index('user_department_idx').on(table.department),
    programStudiIdx: index('user_program_studi_idx').on(table.programStudi),
    statusIdx: index('user_status_idx').on(table.status),
  };
});

// Tickets table - optimized with proper indexes and JSON fields
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  type: varchar('type', { length: 100 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  progress: integer('progress').default(0),
  isSimple: boolean('is_simple').default(false),
  disposisiChain: jsonb('disposisi_chain').default('[]'),
  currentHandler: integer('current_handler').references(() => users.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  assignedTo: integer('assigned_to').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  estimatedCompletion: timestamp('estimated_completion'),
  completedAt: timestamp('completed_at'),
  slaDeadline: timestamp('sla_deadline'),
  slaStatus: varchar('sla_status', { length: 50 }),
  escalationLevel: integer('escalation_level').default(0),
  reopenCount: integer('reopen_count').default(0),
  customerSatisfaction: integer('customer_satisfaction'),
  resolutionTime: integer('resolution_time'),
  firstResponseTime: integer('first_response_time'),
  tags: jsonb('tags').default('[]'),
  metadata: jsonb('metadata').default('{}'),
}, (table) => {
  return {
    statusIdx: index('ticket_status_idx').on(table.status),
    priorityIdx: index('ticket_priority_idx').on(table.priority),
    categoryIdx: index('ticket_category_idx').on(table.category),
    departmentIdx: index('ticket_department_idx').on(table.department),
    userIdIdx: index('ticket_user_id_idx').on(table.userId),
    assignedToIdx: index('ticket_assigned_to_idx').on(table.assignedTo),
    createdAtIdx: index('ticket_created_at_idx').on(table.createdAt),
    slaStatusIdx: index('ticket_sla_status_idx').on(table.slaStatus),
  };
});

// Ticket messages - optimized with message type and internal flag
export const ticketMessages = pgTable('ticket_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  messageType: varchar('message_type', { length: 50 }).default('comment'),
  isInternal: boolean('is_internal').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    ticketIdIdx: index('message_ticket_id_idx').on(table.ticketId),
    userIdIdx: index('message_user_id_idx').on(table.userId),
    messageTypeIdx: index('message_type_idx').on(table.messageType),
  };
});

// Ticket attachments - optimized with cloudinary support
export const ticketAttachments = pgTable('ticket_attachments', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  filePath: varchar('file_path', { length: 255 }).notNull(),
  cloudinaryId: varchar('cloudinary_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    ticketIdIdx: index('attachment_ticket_id_idx').on(table.ticketId),
    fileTypeIdx: index('attachment_file_type_idx').on(table.fileType),
  };
});

// Disposisi history - optimized with action type and SLA impact
export const disposisiHistory = pgTable('disposisi_history', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
  fromUserId: integer('from_user_id').references(() => users.id),
  toUserId: integer('to_user_id').references(() => users.id).notNull(),
  reason: text('reason'),
  notes: text('notes'),
  progressUpdate: integer('progress_update'),
  actionType: varchar('action_type', { length: 50 }),
  expectedCompletionTime: timestamp('expected_completion_time'),
  slaImpact: varchar('sla_impact', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    ticketIdIdx: index('disposisi_ticket_id_idx').on(table.ticketId),
    toUserIdIdx: index('disposisi_to_user_id_idx').on(table.toUserId),
  };
});

// Ticket templates - optimized with JSON content
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
}, (table) => {
  return {
    categoryIdx: index('template_category_idx').on(table.category),
    isActiveIdx: index('template_is_active_idx').on(table.isActive),
  };
});

// Ticket workflows - optimized with JSON steps and conditions
export const ticketWorkflows = pgTable('ticket_workflows', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  steps: jsonb('steps').notNull(),
  conditions: jsonb('conditions'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    categoryIdx: index('workflow_category_idx').on(table.category),
    isDefaultIdx: index('workflow_is_default_idx').on(table.isDefault),
    isActiveIdx: index('workflow_is_active_idx').on(table.isActive),
  };
});

// Ticket audit logs - optimized with action indexing
export const ticketAuditLogs = pgTable('ticket_audit_logs', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => tickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    ticketIdIdx: index('audit_ticket_id_idx').on(table.ticketId),
    actionIdx: index('audit_action_idx').on(table.action),
    createdAtIdx: index('audit_created_at_idx').on(table.createdAt),
  };
});

// User audit logs - optimized with action indexing
export const userAuditLogs = pgTable('user_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  performedBy: integer('performed_by').references(() => users.id).notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('user_audit_user_id_idx').on(table.userId),
    actionIdx: index('user_audit_action_idx').on(table.action),
  };
});

// Notifications - optimized with read status indexing
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  relatedId: integer('related_id'),
  relatedType: varchar('related_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('notification_user_id_idx').on(table.userId),
    isReadIdx: index('notification_is_read_idx').on(table.isRead),
    typeIdx: index('notification_type_idx').on(table.type),
  };
});

// Settings - optimized with category indexing
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value').notNull(),
  type: varchar('type', { length: 50 }).default('string'),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    categoryIdx: index('settings_category_idx').on(table.category),
  };
});

// Ticket analytics - optimized with date and department indexing
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
}, (table) => {
  return {
    dateIdx: index('analytics_date_idx').on(table.date),
    departmentIdx: index('analytics_department_idx').on(table.department),
    categoryIdx: index('analytics_category_idx').on(table.category),
  };
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets, { relationName: 'user_tickets' }),
  assignedTickets: many(tickets, { relationName: 'assigned_tickets' }),
  handlingTickets: many(tickets, { relationName: 'handling_tickets' }),
  messages: many(ticketMessages),
  attachments: many(ticketAttachments),
  notifications: many(notifications),
  auditLogs: many(userAuditLogs, { relationName: 'user_audit_logs' }),
  performedAuditLogs: many(userAuditLogs, { relationName: 'performed_audit_logs' }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
    relationName: 'user_tickets',
  }),
  assignedUser: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: 'assigned_tickets',
  }),
  currentHandlerUser: one(users, {
    fields: [tickets.currentHandler],
    references: [users.id],
    relationName: 'handling_tickets',
  }),
  messages: many(ticketMessages),
  attachments: many(ticketAttachments),
  disposisiHistory: many(disposisiHistory),
  auditLogs: many(ticketAuditLogs),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketMessages.userId],
    references: [users.id],
  }),
}));

export const ticketAttachmentsRelations = relations(ticketAttachments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketAttachments.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [ticketAttachments.userId],
    references: [users.id],
  }),
}));

// Export all entities;