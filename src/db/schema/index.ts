// Re-export all schema files properly to avoid conflicts
export * from './users';
export * from './notifications';
export * from './settings';

// Export tables from tickets.ts individually to avoid conflicts
export {
  tickets,
  ticketMessages,
  ticketAttachments,
  disposisiHistory,
  ticketTemplates,
  ticketWorkflows,
  ticketAuditLogs,
  ticketAnalytics,
} from './tickets';

// Export types from tickets.ts
export type {
  Ticket,
  NewTicket,
  TicketMessage,
  NewTicketMessage,
  TicketAttachment,
  NewTicketAttachment,
  DisposisiHistory,
  NewDisposisiHistory,
  TicketTemplate,
  NewTicketTemplate,
  TicketWorkflow,
  NewTicketWorkflow,
  TicketAuditLog,
  NewTicketAuditLog,
  TicketAnalytic,
  NewTicketAnalytic,
} from './tickets';