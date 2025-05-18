// src/modules/tickets/tickets.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import {
  tickets,
  ticketMessages,
  ticketAttachments,
  users,
  disposisiHistory,
  ticketTemplates,
  ticketWorkflows,
  ticketAuditLogs,
  ticketAnalytics,
} from '../../db/schema';
import { eq, and, desc, asc, or, like, ne, sql, gte, lte } from 'drizzle-orm';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notification.service';
import { SettingsService } from '../settings/setting.service';


@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  async findAll(status?: string, category?: string) {
    try {
      // Build query conditionally
      const conditions = [];
      if (status) conditions.push(eq(tickets.status, status));
      if (category) conditions.push(eq(tickets.category, category));

      return await db
        .select()
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tickets.createdAt));
    } catch (error) {
      this.logger.error(`Error finding tickets: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId: number, status?: string, category?: string) {
    try {
      const conditions = [eq(tickets.userId, userId)];
      if (status) conditions.push(eq(tickets.status, status));
      if (category) conditions.push(eq(tickets.category, category));

      return await db
        .select()
        .from(tickets)
        .where(and(...conditions))
        .orderBy(desc(tickets.createdAt));
    } catch (error) {
      this.logger.error(`Error finding tickets by user ID: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const result = await db
        .select()
        .from(tickets)
        .where(eq(tickets.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      // Get ticket attachments
      const attachments = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, id));

      return {
        ...result[0],
        attachments,
      };
    } catch (error) {
      this.logger.error(`Error finding ticket by ID: ${error.message}`);
      throw error;
    }
  }

  // Enhanced Ticket creation with SLA and analytics
  async create(data: any) {
    try {
      // Calculate SLA deadline based on priority
      const slaHours = await this.getSLAHours(data.priority);
      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + slaHours);

      const ticketData = {
        ...data,
        slaDeadline,
        slaStatus: 'on-time',
      };

      const result = await db.insert(tickets).values(ticketData).returning();
      const ticket = result[0];

      // Create audit log
      await this.createAuditLog({
        ticketId: ticket.id,
        userId: data.userId,
        action: 'ticket_created',
        newValue: ticket,
      });

      // Update analytics
      await this.updateAnalytics({
        department: ticket.department,
        category: ticket.category,
        action: 'created',
      });

      return ticket;
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      // Update the updatedAt timestamp
      data.updatedAt = new Date();

      const result = await db
        .update(tickets)
        .set(data)
        .where(eq(tickets.id, id))
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error updating ticket: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Delete related records first
      await db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
      await db
        .delete(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, id));

      // Then delete the ticket
      const result = await db
        .delete(tickets)
        .where(eq(tickets.id, id))
        .returning();

      return result[0];
    } catch (error) {
      this.logger.error(`Error removing ticket: ${error.message}`);
      throw error;
    }
  }

  async getTicketMessages(ticketId: number) {
    try {
      const messages = await db
        .select()
        .from(ticketMessages)
        .where(eq(ticketMessages.ticketId, ticketId))
        .orderBy(asc(ticketMessages.createdAt));

      // For each message, get the user info and attachments
      const messagesWithSender = await Promise.all(
        messages.map(async (message) => {
          // Get user info
          const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, message.userId))
            .limit(1);

          const sender =
            userResult.length > 0
              ? {
                  id: userResult[0].id,
                  name: userResult[0].name || 'Unknown User',
                  role: userResult[0].role || 'user',
                }
              : {
                  id: message.userId,
                  name: 'Unknown User',
                  role: 'user',
                };

          // Get attachments
          const attachments = await db
            .select()
            .from(ticketAttachments)
            .where(
              and(
                eq(ticketAttachments.ticketId, ticketId),
                eq(ticketAttachments.userId, message.userId),
              ),
            );

          return {
            ...message,
            sender,
            attachments,
          };
        }),
      );

      return messagesWithSender;
    } catch (error) {
      this.logger.error(`Error getting ticket messages: ${error.message}`);
      throw error;
    }
  }

  async addMessage(data: any) {
    try {
      const result = await db.insert(ticketMessages).values(data).returning();
      return result[0];
    } catch (error) {
      this.logger.error(`Error adding message: ${error.message}`);
      throw error;
    }
  }

  async addAttachments(attachments: any[]) {
    try {
      if (attachments.length === 0) {
        return [];
      }

      const result = await db
        .insert(ticketAttachments)
        .values(attachments)
        .returning();
      return result;
    } catch (error) {
      this.logger.error(`Error adding attachments: ${error.message}`);
      throw error;
    }
  }

  async getAttachment(attachmentId: number) {
    try {
      const result = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.id, attachmentId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.logger.error(`Error getting attachment: ${error.message}`);
      throw error;
    }
  }

  async deleteAttachment(attachmentId: number) {
    try {
      const result = await db
        .delete(ticketAttachments)
        .where(eq(ticketAttachments.id, attachmentId))
        .returning();
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error deleting attachment: ${error.message}`);
      throw error;
    }
  }

  async getAttachmentsByTicketId(ticketId: number) {
    try {
      const attachments = await db
        .select()
        .from(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, ticketId))
        .orderBy(desc(ticketAttachments.createdAt));
      
      return attachments;
    } catch (error) {
      this.logger.error(`Error getting attachments by ticket ID: ${error.message}`);
      throw error;
    }
  }

  async updateAttachment(attachmentId: number, data: any) {
    try {
      const result = await db
        .update(ticketAttachments)
        .set(data)
        .where(eq(ticketAttachments.id, attachmentId))
        .returning();
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error updating attachment: ${error.message}`);
      throw error;
    }
  }

  async findByAssignee(assigneeId: number) {
    try {
      return await db
        .select()
        .from(tickets)
        .where(eq(tickets.assignedTo, assigneeId))
        .orderBy(desc(tickets.createdAt));
    } catch (error) {
      this.logger.error(`Error finding tickets by assignee: ${error.message}`);
      throw error;
    }
  }

  async getTicketStats(userId?: number) {
    try {
      const conditions = userId ? eq(tickets.userId, userId) : undefined;

      const stats = await db
        .select({
          status: tickets.status,
          count: sql<number>`count(*)::int`,
        })
        .from(tickets)
        .where(conditions)
        .groupBy(tickets.status);

      const priorityStats = await db
        .select({
          priority: tickets.priority,
          count: sql<number>`count(*)::int`,
        })
        .from(tickets)
        .where(conditions)
        .groupBy(tickets.priority);

      const categoryStats = await db
        .select({
          category: tickets.category,
          count: sql<number>`count(*)::int`,
        })
        .from(tickets)
        .where(conditions)
        .groupBy(tickets.category);

      const totalTickets = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tickets)
        .where(conditions);

      return {
        total: totalTickets[0]?.count || 0,
        byStatus: stats,
        byPriority: priorityStats,
        byCategory: categoryStats,
      };
    } catch (error) {
      this.logger.error(`Error getting ticket stats: ${error.message}`);
      throw error;
    }
  }

  async findByDepartment(department: string) {
    try {
      return await db
        .select()
        .from(tickets)
        .where(eq(tickets.department, department))
        .orderBy(desc(tickets.createdAt));
    } catch (error) {
      this.logger.error(`Error finding tickets by department: ${error.message}`);
      throw error;
    }
  }

  async autoAssignTicket(ticketId: number, targetRole: string) {
    try {
      let assignee;

      if (targetRole === 'admin') {
        // Find available admin with least workload
        const availableAdmin = await this.usersService.findAvailableAdmin();
        assignee = availableAdmin;
      } else if (targetRole === 'dosen') {
        // Find available dosen in same department
        const ticket = await this.findOne(ticketId);
        const availableDosen = await this.usersService.findAvailableDosen(ticket.department);
        assignee = availableDosen[0]; // Pick first available
      }

      if (assignee) {
        return await this.update(ticketId, { assignedTo: assignee.id });
      }

      return null;
    } catch (error) {
      this.logger.error(`Error auto-assigning ticket: ${error.message}`);
      throw error;
    }
  }

  // Enhanced disposition functionality with SLA tracking
async createDisposisiHistory(data: {
  ticketId: number;
  fromUserId: number;
  toUserId: number;
  reason?: string;
  notes?: string;
  progressUpdate?: number;
  actionType?: string;
}) {
  try {
    // Add expected resolution time based on SLA
    const ticket = await this.findOne(data.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Calculate expected completion time
    let expectedCompletionTime = null;
    if (ticket.slaDeadline) {
      expectedCompletionTime = ticket.slaDeadline;
    } else {
      const slaHours = await this.getSLAHours(ticket.priority, ticket.category);
      expectedCompletionTime = new Date();
      expectedCompletionTime.setHours(expectedCompletionTime.getHours() + slaHours);
    }

    // Determine SLA impact based on disposition type
    let slaImpact = 'maintained';
    if (data.actionType === 'escalate') {
      slaImpact = 'improved'; 
    } else if (data.actionType === 'forward') {
      const targetUserWorkload = await this.getUserWorkload(data.toUserId);
      if (targetUserWorkload.activeTicketCount > 5) {
        slaImpact = 'extended';
      }
    }

    const disposisiData = {
      ...data,
      expectedCompletionTime,
      slaImpact,
      createdAt: new Date(),
    };

    const result = await db.insert(disposisiHistory).values(disposisiData).returning();
    
    // Send notification to new handler
    await this.notificationsService.createNotification({
      userId: data.toUserId,
      type: 'ticket_disposisi',
      title: 'Ticket Forwarded to You',
      message: `Ticket #${ticket.ticketNumber} has been forwarded to you. ${data.reason ? `Reason: ${data.reason}` : ''}`,
      relatedId: data.ticketId,
      relatedType: 'ticket',
    });

    return result[0];
  } catch (error) {
    this.logger.error(`Error creating disposisi history: ${error.message}`);
    throw error;
  }
}

  async getDisposisiHistory(ticketId: number) {
    try {
      const history = await db
        .select({
          id: disposisiHistory.id,
          ticketId: disposisiHistory.ticketId,
          fromUserId: disposisiHistory.fromUserId,
          toUserId: disposisiHistory.toUserId,
          reason: disposisiHistory.reason,
          notes: disposisiHistory.notes,
          progressUpdate: disposisiHistory.progressUpdate,
          actionType: disposisiHistory.actionType,
          createdAt: disposisiHistory.createdAt,
        })
        .from(disposisiHistory)
        .where(eq(disposisiHistory.ticketId, ticketId))
        .orderBy(desc(disposisiHistory.createdAt));
      
      // Get user info for each history entry
      const historyWithUsers = await Promise.all(
        history.map(async (entry) => {
          const fromUser = entry.fromUserId ? await this.usersService.findOne(entry.fromUserId) : null;
          const toUser = await this.usersService.findOne(entry.toUserId);
          
          return {
            ...entry,
            fromUser: fromUser ? {
              id: fromUser.id,
              name: fromUser.name,
              role: fromUser.role,
              position: fromUser.position,
            } : null,
            toUser: {
              id: toUser.id,
              name: toUser.name,
              role: toUser.role,
              position: toUser.position,
            },
          };
        })
      );
      
      return historyWithUsers;
    } catch (error) {
      this.logger.error(`Error getting disposisi history: ${error.message}`);
      throw error;
    }
  }

  async getTicketList(filters: {
    status?: string;
    category?: string;
    priority?: string;
    department?: string;
    assignedTo?: string;
    userId?: string;
    assignedOrCreated?: string;
    search?: string;
    page?: string;
    limit?: string;
  }) {
    try {
      const page = parseInt(filters.page || '1');
      const limit = parseInt(filters.limit || '10');
      const offset = (page - 1) * limit;
      
      const conditions = [];
      
      if (filters.status) {
        conditions.push(eq(tickets.status, filters.status));
      }
      
      if (filters.category) {
        conditions.push(eq(tickets.category, filters.category));
      }
      
      if (filters.priority) {
        conditions.push(eq(tickets.priority, filters.priority));
      }
      
      if (filters.department) {
        conditions.push(eq(tickets.department, filters.department));
      }
      
      if (filters.assignedTo) {
        conditions.push(eq(tickets.assignedTo, parseInt(filters.assignedTo)));
      }
      
      if (filters.userId) {
        conditions.push(eq(tickets.userId, parseInt(filters.userId)));
      }
      
      if (filters.assignedOrCreated) {
        const id = parseInt(filters.assignedOrCreated);
        conditions.push(
          or(
            eq(tickets.userId, id),
            eq(tickets.assignedTo, id),
            eq(tickets.currentHandler, id)
          )
        );
      }
      
      if (filters.search) {
        conditions.push(
          or(
            like(tickets.ticketNumber, `%${filters.search}%`),
            like(tickets.subject, `%${filters.search}%`),
            like(tickets.description, `%${filters.search}%`)
          )
        );
      }
      
      const countQuery = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const results = await db
        .select()
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tickets.createdAt))
        .limit(limit)
        .offset(offset);
      
      return {
        data: results,
        total: countQuery[0]?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((countQuery[0]?.count || 0) / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting ticket list: ${error.message}`);
      throw error;
    }
  }

  async updateProgress(ticketId: number, progress: number) {
    try {
      const result = await db
        .update(tickets)
        .set({ 
          progress,
          updatedAt: new Date(),
        })
        .where(eq(tickets.id, ticketId))
        .returning();
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error updating progress: ${error.message}`);
      throw error;
    }
  }

 async getTicketFlowStats() {
    try {
      // Get stats for executive dashboard
      const stats = await db
        .select({
          status: tickets.status,
          count: sql<number>`count(*)::int`,
          avgProgress: sql<number>`avg(progress)::int`,
        })
        .from(tickets)
        .groupBy(tickets.status);
      
      const departmentStats = await db
        .select({
          department: tickets.department,
          count: sql<number>`count(*)::int`,
          avgProgress: sql<number>`avg(progress)::int`,
        })
        .from(tickets)
        .groupBy(tickets.department);
      
      const handlerStats = await db
        .select({
          handlerId: tickets.currentHandler,
          handlerName: users.name,
          role: users.role,
          count: sql<number>`count(*)::int`,
        })
        .from(tickets)
        .leftJoin(users, eq(users.id, tickets.currentHandler))
        .where(ne(tickets.currentHandler, null))
        .groupBy(tickets.currentHandler, users.name, users.role);
      
      // Disposisi flow for Ticket Flow Stats - FIXED VERSION
      const disposisiFlowRaw = await db
        .select({
          fromUserId: disposisiHistory.fromUserId,
          toUserId: disposisiHistory.toUserId,
          count: sql<number>`count(*)::int`,
        })
        .from(disposisiHistory)
        .groupBy(disposisiHistory.fromUserId, disposisiHistory.toUserId);
      
      // Get roles for flow statistics
      const disposisiFlow = await Promise.all(
        disposisiFlowRaw.map(async (flow) => {
          const fromUser = flow.fromUserId ? 
            await db.select({ role: users.role }).from(users).where(eq(users.id, flow.fromUserId)).limit(1) : 
            null;
          const toUser = await db.select({ role: users.role }).from(users).where(eq(users.id, flow.toUserId)).limit(1);
          
          return {
            fromRole: fromUser?.[0]?.role || 'system',
            toRole: toUser[0]?.role || 'unknown',
            count: flow.count,
          };
        })
      );
      
      return {
        statusStats: stats,
        departmentStats,
        handlerStats,
        disposisiFlow,
      };
    } catch (error) {
      this.logger.error(`Error getting ticket flow stats: ${error.message}`);
      throw error;
    }
  }

  // Enhanced analytics and reporting
  async getExecutiveDashboard(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    department?: string;
  }) {
    try {
      const conditions = [];
      
      if (filters?.dateFrom) {
        conditions.push(gte(tickets.createdAt, filters.dateFrom));
      }
      
      if (filters?.dateTo) {
        conditions.push(lte(tickets.createdAt, filters.dateTo));
      }
      
      if (filters?.department) {
        conditions.push(eq(tickets.department, filters.department));
      }

      // Overall metrics
      const overallMetrics = await db
        .select({
          totalTickets: sql<number>`count(*)::int`,
          openTickets: sql<number>`count(*) filter (where status not in ('completed', 'cancelled'))::int`,
          averageResolutionTime: sql<number>`avg(resolution_time)::int`,
          slaBreachRate: sql<number>`(count(*) filter (where sla_status = 'breached') * 100.0 / count(*))::float`,
          customerSatisfactionAvg: sql<number>`avg(customer_satisfaction)::float`,
        })
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Department performance
      const departmentPerformance = await db
        .select({
          department: tickets.department,
          ticketCount: sql<number>`count(*)::int`,
          avgResolutionTime: sql<number>`avg(resolution_time)::int`,
          slaBreachCount: sql<number>`count(*) filter (where sla_status = 'breached')::int`,
          satisfaction: sql<number>`avg(customer_satisfaction)::float`,
        })
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(tickets.department);

      // Category breakdown
      const categoryBreakdown = await db
        .select({
          category: tickets.category,
          subcategory: tickets.subcategory,
          count: sql<number>`count(*)::int`,
          avgProgress: sql<number>`avg(progress)::int`,
        })
        .from(tickets)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(tickets.category, tickets.subcategory);

      // User performance (for executives to evaluate staff)
      const userPerformance = await db
        .select({
          userId: tickets.assignedTo,
          userName: users.name,
          role: users.role,
          ticketsHandled: sql<number>`count(*)::int`,
          avgResolutionTime: sql<number>`avg(resolution_time)::int`,
          satisfaction: sql<number>`avg(customer_satisfaction)::float`,
        })
        .from(tickets)
        .leftJoin(users, eq(users.id, tickets.assignedTo))
        .where(
          and(
            ne(tickets.assignedTo, null),
            ...(conditions.length > 0 ? conditions : [])
          )
        )
        .groupBy(tickets.assignedTo, users.name, users.role);

          const disposisiFlowData = await db
        .select({
          fromUserId: disposisiHistory.fromUserId,
          toUserId: disposisiHistory.toUserId,
          count: sql<number>`count(*)::int`,
        })
        .from(disposisiHistory)
        .groupBy(disposisiHistory.fromUserId, disposisiHistory.toUserId);
        
      // Get user roles and calculate metrics
      const disposisiFlow = await Promise.all(
        disposisiFlowData.map(async (flow) => {
          const fromUser = flow.fromUserId ? await this.usersService.findOne(flow.fromUserId) : null;
          const toUser = await this.usersService.findOne(flow.toUserId);
          
          return {
            fromRole: fromUser?.role || 'system',
            toRole: toUser?.role || 'unknown',
            fromUserId: flow.fromUserId,
            toUserId: flow.toUserId,
            count: flow.count,
          };
        })
      );

      return {
        overallMetrics: overallMetrics[0],
        departmentPerformance,
        categoryBreakdown,
        userPerformance,
        disposisiFlow,
      };
    } catch (error) {
      this.logger.error(`Error getting executive dashboard: ${error.message}`);
      throw error;
    }
  }

// Improved SLA tracking and notification
async updateSLAStatus() {
  try {
    const now = new Date();
    
    // Get SLA warning threshold from settings or use default (80%)
    const slaWarningThreshold = await this.settingsService.getSetting('sla.warning_threshold') || 0.8;
    
    // Update at-risk tickets
    await db
      .update(tickets)
      .set({ slaStatus: 'at-risk' })
      .where(
        and(
          ne(tickets.status, 'completed'),
          ne(tickets.status, 'cancelled'),
          sql`extract(epoch from (${now} - created_at)) > extract(epoch from (sla_deadline - created_at)) * ${slaWarningThreshold}`,
          eq(tickets.slaStatus, 'on-time')
        )
      );

    // Update breached tickets and notify stakeholders
    const breachedTickets = await db
      .select()
      .from(tickets)
      .where(
        and(
          ne(tickets.status, 'completed'),
          ne(tickets.status, 'cancelled'),
          lte(tickets.slaDeadline, now),
          ne(tickets.slaStatus, 'breached')
        )
      );

    // Process each breached ticket
    for (const ticket of breachedTickets) {
      // Update status
      await db
        .update(tickets)
        .set({ slaStatus: 'breached' })
        .where(eq(tickets.id, ticket.id));

      // Send notifications to relevant parties
      if (ticket.assignedTo) {
        await this.notificationsService.createNotification({
          userId: ticket.assignedTo,
          type: 'sla_breach',
          title: 'SLA Breach Alert',
          message: `Ticket #${ticket.ticketNumber} has breached its SLA deadline!`,
          relatedId: ticket.id,
          relatedType: 'ticket',
        });
      }
    }

    return { 
      updated: breachedTickets.length,
      breachedTickets: breachedTickets.map(t => t.ticketNumber)
    };
  } catch (error) {
    this.logger.error(`Error updating SLA status: ${error.message}`);
    throw error;
  }
}

  // Get next user for round-robin assignment
  private async getNextRoundRobinAssignee(role: string, department: string) {
    try {
      // Implementation of round-robin logic
      const lastAssigned = await this.settingsService.getSetting(`last_assigned_${role}_${department}`);
      const availableUsers = await this.usersService.findAll({ role, department, available: true });
      
      if (!availableUsers.length) return null;
      
      let nextIndex = 0;
      if (lastAssigned) {
        const lastIndex = availableUsers.findIndex(u => u.id === lastAssigned);
        nextIndex = (lastIndex + 1) % availableUsers.length;
      }
      
      const nextUser = availableUsers[nextIndex];
      await this.settingsService.updateSetting(`last_assigned_${role}_${department}`, nextUser.id);
      
      return nextUser;
    } catch (error) {
      this.logger.error(`Error in round-robin assignment: ${error.message}`);
      throw error;
    }
  }

  // Get least loaded user for assignment
  private async getLeastLoadedAssignee(role: string, department: string) {
    try {
      const users = await this.usersService.findAll({ role, department, available: true });
      
      const userLoads = await Promise.all(
        users.map(async (user) => {
          const activeTickets = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(tickets)
            .where(
              and(
                eq(tickets.assignedTo, user.id),
                ne(tickets.status, 'completed'),
                ne(tickets.status, 'cancelled')
              )
            );
          
          return {
            user,
            load: activeTickets[0]?.count || 0,
          };
        })
      );
      
      userLoads.sort((a, b) => a.load - b.load);
      return userLoads[0]?.user || null;
    } catch (error) {
      this.logger.error(`Error finding least loaded assignee: ${error.message}`);
      throw error;
    }
  }

  // Create audit log entry
  private async createAuditLog(data: {
    ticketId: number;
    userId: number;
    action: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await db.insert(ticketAuditLogs).values(data);
    } catch (error) {
      this.logger.error(`Error creating audit log: ${error.message}`);
    }
  }

  // Update analytics
  private async updateAnalytics(data: {
    department: string;
    category: string;
    action: string;
  }) {
    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Update or create analytics record
      const existing = await db
        .select()
        .from(ticketAnalytics)
        .where(
          and(
            eq(ticketAnalytics.date, now),
            eq(ticketAnalytics.hour, hour),
            eq(ticketAnalytics.department, data.department),
            eq(ticketAnalytics.category, data.category)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        const updates: any = {};
        if (data.action === 'created') updates.totalTickets = sql`total_tickets + 1`;
        if (data.action === 'opened') updates.openTickets = sql`open_tickets + 1`;
        if (data.action === 'closed') updates.closedTickets = sql`closed_tickets + 1`;
        
        await db
          .update(ticketAnalytics)
          .set(updates)
          .where(eq(ticketAnalytics.id, existing[0].id));
      } else {
        const newAnalytics: any = {
          date: now,
          hour,
          department: data.department,
          category: data.category,
        };
        
        if (data.action === 'created') {
          newAnalytics.totalTickets = 1;
          newAnalytics.openTickets = 1;
        }
        
        await db.insert(ticketAnalytics).values(newAnalytics);
      }
    } catch (error) {
      this.logger.error(`Error updating analytics: ${error.message}`);
    }
  }

  // Get SLA hours based on priority
  private async getSLAHours(priority: string, category?: string): Promise<number> {
  const slaSettings = await this.settingsService.getSetting('sla_hours');
  
  if (category && slaSettings?.[category]?.[priority]) {
    return slaSettings[category][priority];
  }
  
  return slaSettings?.[priority] || 24; // Default 24 hours
}

// Add getUserWorkload method
async getUserWorkload(userId: number): Promise<any> {
  try {
    const activeTickets = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(
        and(
          eq(tickets.assignedTo, userId),
          ne(tickets.status, 'completed'),
          ne(tickets.status, 'cancelled')
        )
      );
      
    const urgentTickets = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(
        and(
          eq(tickets.assignedTo, userId),
          ne(tickets.status, 'completed'),
          ne(tickets.status, 'cancelled'),
          eq(tickets.priority, 'urgent')
        )
      );
      
    return {
      activeTicketCount: activeTickets[0]?.count || 0,
      urgentTicketCount: urgentTickets[0]?.count || 0
    };
  } catch (error) {
    this.logger.error(`Error getting user workload: ${error.message}`);
    return {
      activeTicketCount: 0,
      urgentTicketCount: 0
    };
  }
}

// Add getExpertiseScore method
private async getExpertiseScore(userId: number, category: string): Promise<number> {
  try {
    // Get completed tickets by this user in this category
    const completedInCategory = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(
        and(
          eq(tickets.assignedTo, userId),
          eq(tickets.status, 'completed'),
          eq(tickets.category, category)
        )
      );
      
    // Get average satisfaction rating for this user
    const satisfaction = await db
      .select({ 
        avgSatisfaction: sql<number>`avg(customer_satisfaction)::float` 
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.assignedTo, userId),
          eq(tickets.status, 'completed'),
          ne(tickets.customerSatisfaction, null)
        )
      );
      
    // Calculate expertise score based on completed tickets and satisfaction
    const completedCount = completedInCategory[0]?.count || 0;
    const satisfactionScore = satisfaction[0]?.avgSatisfaction || 3;
    
    // Formula: base score + completed tickets score + satisfaction adjustment
    return 5 + Math.min(10, completedCount) + (satisfactionScore - 3);
  } catch (error) {
    this.logger.error(`Error calculating expertise score: ${error.message}`);
    return 5; // Default score
  }
}

  // Bulk operations
  async bulkUpdate(ticketIds: number[], updates: any, userId: number) {
    try {
      const results = [];
      
      for (const ticketId of ticketIds) {
        const oldTicket = await this.findOne(ticketId);
        const updated = await this.update(ticketId, updates);
        
        await this.createAuditLog({
          ticketId,
          userId,
          action: 'bulk_update',
          oldValue: oldTicket,
          newValue: updated,
        });
        
        results.push(updated);
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Error in bulk update: ${error.message}`);
      throw error;
    }
  }

  // Export tickets
  async exportTickets(filters: any, format: 'csv' | 'json' | 'excel') {
    try {
      const tickets = await this.getTicketList(filters);
      
      // Transform data based on format
      if (format === 'csv') {
        // Convert to CSV
        const headers = Object.keys(tickets.data[0]).join(',');
        const rows = tickets.data.map(ticket => 
          Object.values(ticket).map(val => 
            typeof val === 'string' ? `"${val}"` : val
          ).join(',')
        );
        return [headers, ...rows].join('\n');
      } else if (format === 'json') {
        return JSON.stringify(tickets.data, null, 2);
      } else if (format === 'excel') {
        // Would need a library like xlsx for Excel export
        throw new Error('Excel export not implemented');
      }
    } catch (error) {
      this.logger.error(`Error exporting tickets: ${error.message}`);
      throw error;
    }
  }

  // Enhanced workflow management
  async createWorkflow(workflowData: any) {
    try {
      const result = await db.insert(ticketWorkflows).values(workflowData).returning();
      return result[0];
    } catch (error) {
      this.logger.error(`Error creating workflow: ${error.message}`);
      throw error;
    }
  }

  async getWorkflows(category?: string) {
    try {
      const conditions = [eq(ticketWorkflows.isActive, true)];
      if (category) {
        conditions.push(eq(ticketWorkflows.category, category));
      }
      
      return await db
        .select()
        .from(ticketWorkflows)
        .where(and(...conditions))
        .orderBy(desc(ticketWorkflows.isDefault), desc(ticketWorkflows.createdAt));
    } catch (error) {
      this.logger.error(`Error getting workflows: ${error.message}`);
      throw error;
    }
  }

  // Template management
  async createTemplate(templateData: any) {
    try {
      const result = await db.insert(ticketTemplates).values(templateData).returning();
      return result[0];
    } catch (error) {
      this.logger.error(`Error creating template: ${error.message}`);
      throw error;
    }
  }

  async getTemplates(category?: string) {
    try {
      const conditions = [eq(ticketTemplates.isActive, true)];
      if (category) {
        conditions.push(eq(ticketTemplates.category, category));
      }
      
      return await db
        .select()
        .from(ticketTemplates)
        .where(and(...conditions))
        .orderBy(desc(ticketTemplates.createdAt));
    } catch (error) {
      this.logger.error(`Error getting templates: ${error.message}`);
      throw error;
    }
  }

  // Performance metrics
  async getUserPerformanceMetrics(userId: number, dateRange?: { from: Date; to: Date }) {
    try {
      const conditions = [eq(tickets.assignedTo, userId)];
      
      if (dateRange) {
        conditions.push(
          and(
            gte(tickets.createdAt, dateRange.from),
            lte(tickets.createdAt, dateRange.to)
          )
        );
      }
      
      const metrics = await db
        .select({
          totalTickets: sql<number>`count(*)::int`,
          completedTickets: sql<number>`count(*) filter (where status = 'completed')::int`,
          avgResolutionTime: sql<number>`avg(resolution_time)::int`,
          avgFirstResponseTime: sql<number>`avg(first_response_time)::int`,
          slaBreaches: sql<number>`count(*) filter (where sla_status = 'breached')::int`,
          customerSatisfaction: sql<number>`avg(customer_satisfaction)::float`,
          reopenedTickets: sql<number>`sum(reopen_count)::int`,
        })
        .from(tickets)
        .where(and(...conditions));
      
      return metrics[0];
    } catch (error) {
      this.logger.error(`Error getting user performance metrics: ${error.message}`);
      throw error;
    }
  }

  // Smart ticket assignment based on workload and expertise
async findBestAssignee(department: string, category: string): Promise<any> {
  try {
    // Get staff with relevant expertise
    const relevantStaff = await this.usersService.findAll({
      role: 'dosen',
      department,
      available: true,
    });

    if (!relevantStaff || relevantStaff.length === 0) {
      // Fallback to any admin if no relevant staff found
      return this.usersService.findAvailableAdmin();
    }

    // Calculate staff workloads and expertise scores
    const staffWithWorkloads = await Promise.all(
      relevantStaff.map(async (staff) => {
        const activeTickets = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(tickets)
          .where(
            and(
              eq(tickets.assignedTo, staff.id),
              ne(tickets.status, 'completed'),
              ne(tickets.status, 'cancelled')
            )
          );

        // Calculate expertise score
        const expertiseScore = await this.getExpertiseScore(staff.id, category);

        return {
          staff,
          workload: activeTickets[0]?.count || 0,
          expertiseScore,
          assignmentScore: expertiseScore - (activeTickets[0]?.count || 0) * 0.5,
        };
      })
    );

    // Sort by assignment score (higher is better)
    staffWithWorkloads.sort((a, b) => b.assignmentScore - a.assignmentScore);

    // Return the best candidate
    return staffWithWorkloads[0]?.staff || null;
  } catch (error) {
    this.logger.error(`Error finding best assignee: ${error.message}`);
    return null;
  }
}
}