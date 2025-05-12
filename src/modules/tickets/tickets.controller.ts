import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Logger,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TicketsService } from './tickets.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notification.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllTickets(@Req() req, @Query() query: any) {
    try {
      const { status, category } = query;
      if (req.user?.role === 'admin' || req.user?.role === 'staff' || req.user?.role === 'executive') {
        return this.ticketsService.findAll(status, category);
      }
      return this.ticketsService.findByUserId(req.user.id, status, category);
    } catch (error) {
      this.logger.error(`Error getting all tickets: ${error.message}`);
      throw new HttpException(
        'Failed to get tickets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Req() req) {
    try {
      if (!req.user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return this.ticketsService.findByUserId(req.user.id);
    } catch (error) {
      this.logger.error(`Error getting user tickets: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get tickets',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTicketById(@Param('id') id: string, @Req() req) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));

      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'staff' &&
        req.user.role !== 'executive' &&
        ticket.userId !== req.user.id
      ) {
        throw new HttpException(
          'You do not have permission to view this ticket',
          HttpStatus.FORBIDDEN,
        );
      }

      return ticket;
    } catch (error) {
      this.logger.error(`Error getting ticket by ID: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async createTicket(
    @Body() createTicketDto: any,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    try {
      if (!req.user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const ticketNumber = `TIK-${Date.now().toString().slice(-6)}`;

      const ticketData = {
        ...createTicketDto,
        ticketNumber,
        userId: req.user.id,
        status: 'pending',
        progress: 0,
      };

      const ticket = await this.ticketsService.create(ticketData);

      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          try {
            const result = await this.cloudinaryService.uploadFile(
              file,
              `service-desk/tickets/${ticket.ticketNumber}`,
            );

            return {
              ticketId: ticket.id,
              userId: req.user.id,
              fileName: file.originalname,
              fileSize: file.size,
              fileType: file.mimetype,
              filePath: result.secure_url,
              cloudinaryId: result.public_id,
            };
          } catch (uploadError) {
            this.logger.error(`Failed to upload file: ${uploadError.message}`);
            throw new HttpException(
              'Failed to upload attachment',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        });

        const attachments = await Promise.all(uploadPromises);
        await this.ticketsService.addAttachments(attachments);
      }

      return ticket;
    } catch (error) {
      this.logger.error(`Error creating ticket: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to create ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: any,
    @Req() req,
  ) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));

      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'staff' &&
        req.user.role !== 'executive' &&
        ticket.userId !== req.user.id
      ) {
        throw new HttpException(
          'You do not have permission to update this ticket',
          HttpStatus.FORBIDDEN,
        );
      }

      return this.ticketsService.update(Number.parseInt(id), updateTicketDto);
    } catch (error) {
      this.logger.error(`Error updating ticket: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to update ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTicket(@Param('id') id: string, @Req() req) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));

      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      if (req.user.role !== 'admin' && req.user.role !== 'executive') {
        throw new HttpException(
          'You do not have permission to delete this ticket',
          HttpStatus.FORBIDDEN,
        );
      }

      // Delete attachments from Cloudinary
      if (ticket.attachments && ticket.attachments.length > 0) {
        const deletePromises = ticket.attachments.map(async (attachment) => {
          if (attachment.cloudinaryId) {
            try {
              await this.cloudinaryService.deleteFile(attachment.cloudinaryId);
            } catch (error) {
              this.logger.error(`Failed to delete file from Cloudinary: ${error.message}`);
            }
          }
        });
        await Promise.all(deletePromises);
      }

      return this.ticketsService.remove(Number.parseInt(id));
    } catch (error) {
      this.logger.error(`Error deleting ticket: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to delete ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  async getTicketMessages(@Param('id') id: string, @Req() req) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));

      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'staff' &&
        req.user.role !== 'executive' &&
        ticket.userId !== req.user.id
      ) {
        throw new HttpException(
          'You do not have permission to view messages for this ticket',
          HttpStatus.FORBIDDEN,
        );
      }

      return this.ticketsService.getTicketMessages(Number.parseInt(id));
    } catch (error) {
      this.logger.error(`Error getting ticket messages: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get ticket messages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('attachments', 5, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async addTicketMessage(
    @Param('id') id: string,
    @Body() messageDto: any,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));

      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'staff' &&
        req.user.role !== 'executive' &&
        ticket.userId !== req.user.id
      ) {
        throw new HttpException(
          'You do not have permission to add messages to this ticket',
          HttpStatus.FORBIDDEN,
        );
      }

      const message = await this.ticketsService.addMessage({
        ticketId: Number.parseInt(id),
        userId: req.user.id,
        message: messageDto.message,
      });

      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          try {
            const result = await this.cloudinaryService.uploadFile(
              file,
              `service-desk/tickets/${ticket.ticketNumber}/messages`,
            );

            return {
              ticketId: Number.parseInt(id),
              userId: req.user.id,
              fileName: file.originalname,
              fileSize: file.size,
              fileType: file.mimetype,
              filePath: result.secure_url,
              cloudinaryId: result.public_id,
            };
          } catch (uploadError) {
            this.logger.error(`Failed to upload file: ${uploadError.message}`);
            throw new HttpException(
              'Failed to upload attachment',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        });

        const attachments = await Promise.all(uploadPromises);
        await this.ticketsService.addAttachments(attachments);
      }

      return {
        ...message,
        sender: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Error adding ticket message: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to add ticket message',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('attachments/:attachmentId')
  @UseGuards(JwtAuthGuard)
  async deleteAttachment(
    @Param('attachmentId') attachmentId: string,
    @Req() req,
  ) {
    try {
      const attachment = await this.ticketsService.getAttachment(
        Number.parseInt(attachmentId),
      );

      if (!attachment) {
        throw new HttpException('Attachment not found', HttpStatus.NOT_FOUND);
      }

      const ticket = await this.ticketsService.findOne(attachment.ticketId);

      if (
        req.user.role !== 'admin' &&
        attachment.userId !== req.user.id
      ) {
        throw new HttpException(
          'You do not have permission to delete this attachment',
          HttpStatus.FORBIDDEN,
        );
      }

      // Delete from Cloudinary
      if (attachment.cloudinaryId) {
        try {
          await this.cloudinaryService.deleteFile(attachment.cloudinaryId);
        } catch (error) {
          this.logger.error(`Failed to delete from Cloudinary: ${error.message}`);
        }
      }

      await this.ticketsService.deleteAttachment(Number.parseInt(attachmentId));

      return { message: 'Attachment deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting attachment: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to delete attachment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/disposisi')
  @UseGuards(JwtAuthGuard)
  async disposisiTicket(
    @Param('id') id: string,
    @Body() body: {
      toUserId: number;
      reason?: string;
      notes?: string;
      updateProgress?: number;
    },
    @Req() req,
  ) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));
      
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      
      // Check permissions - only executives, admins, and current handler can disposisi
      const canDisposisi = 
        req.user.role === 'executive' || 
        req.user.role === 'admin' ||
        ticket.currentHandler === req.user.id ||
        ticket.assignedTo === req.user.id;
        
      if (!canDisposisi) {
        throw new HttpException(
          'You do not have permission to forward this ticket',
          HttpStatus.FORBIDDEN,
        );
      }
      
      // Get target user
      const targetUser = await this.usersService.findOne(body.toUserId);
      if (!targetUser) {
        throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);
      }
      
      // Create disposisi history record
      await this.ticketsService.createDisposisiHistory({
        ticketId: ticket.id,
        fromUserId: req.user.id,
        toUserId: body.toUserId,
        reason: body.reason,
        notes: body.notes,
        progressUpdate: body.updateProgress,
      });
      
      // Update disposisi chain
      const disposisiChain = JSON.parse(ticket.disposisiChain as string) || [];
      disposisiChain.push({
        from: req.user.id,
        to: body.toUserId,
        timestamp: new Date(),
        reason: body.reason,
      });
      
      // Update ticket
      const updateData: any = {
        currentHandler: body.toUserId,
        assignedTo: body.toUserId,
        status: 'disposisi',
        disposisiChain: JSON.stringify(disposisiChain),
      };
      
      if (body.updateProgress) {
        updateData.progress = body.updateProgress;
      }
      
      const updatedTicket = await this.ticketsService.update(
        Number.parseInt(id),
        updateData
      );
      
      // Add system message
      await this.ticketsService.addMessage({
        ticketId: Number.parseInt(id),
        userId: req.user.id,
        message: `Tiket di-disposisi ke ${targetUser.name}. ${body.reason ? `Alasan: ${body.reason}` : ''}`,
      });
      
      // Send notifications
      await this.notificationsService.createNotification({
        userId: body.toUserId,
        type: 'ticket_disposisi',
        title: 'Tiket Disposisi',
        message: `Tiket #${ticket.ticketNumber} telah di-disposisi kepada Anda`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });
      
      return updatedTicket;
    } catch (error) {
      this.logger.error(`Error in disposisi: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to disposisi ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/quick-resolve')
  @UseGuards(JwtAuthGuard)
  async quickResolve(
    @Param('id') id: string,
    @Body() body: { solution: string },
    @Req() req,
  ) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));
      
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      
      // Check if user can resolve
      const canResolve = 
        req.user.role === 'executive' || 
        req.user.role === 'admin' ||
        ticket.currentHandler === req.user.id ||
        ticket.assignedTo === req.user.id;
        
      if (!canResolve) {
        throw new HttpException(
          'You do not have permission to resolve this ticket',
          HttpStatus.FORBIDDEN,
        );
      }
      
      // Mark as simple ticket
      await this.ticketsService.update(Number.parseInt(id), {
        isSimple: true,
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      });
      
      // Add solution message
      await this.ticketsService.addMessage({
        ticketId: Number.parseInt(id),
        userId: req.user.id,
        message: `Solusi: ${body.solution}`,
      });
      
      // Notify ticket creator
      await this.notificationsService.createNotification({
        userId: ticket.userId,
        type: 'ticket_resolved',
        title: 'Tiket Selesai',
        message: `Tiket #${ticket.ticketNumber} telah diselesaikan`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });
      
      return { message: 'Ticket resolved successfully' };
    } catch (error) {
      this.logger.error(`Error in quick resolve: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to resolve ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/disposisi-history')
  @UseGuards(JwtAuthGuard)
  async getDisposisiHistory(@Param('id') id: string, @Req() req) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));
      
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      
      // Check permissions
      const canView =
        req.user.role === 'executive' || 
        req.user.role === 'admin' ||
        ticket.userId === req.user.id ||
        ticket.currentHandler === req.user.id ||
        ticket.assignedTo === req.user.id;
        
      if (!canView) {
        throw new HttpException(
          'You do not have permission to view this history',
          HttpStatus.FORBIDDEN,
        );
      }
      
      return this.ticketsService.getDisposisiHistory(Number.parseInt(id));
    } catch (error) {
      this.logger.error(`Error getting disposisi history: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get disposisi history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getTicketList(
    @Query() query: {
      status?: string;
      category?: string;
      priority?: string;
      department?: string;
      assignedTo?: string;
      search?: string;
      page?: string;
      limit?: string;
    },
    @Req() req,
  ) {
    try {
      // Executive can see all tickets
      if (req.user.role === 'executive') {
        return this.ticketsService.getTicketList(query);
      }
      
      // Others see based on permissions
      const filters: any = { ...query };
      
      if (req.user.role === 'mahasiswa') {
        filters.userId = req.user.id.toString();
      } else if (req.user.role === 'dosen') {
        filters.assignedOrCreated = req.user.id.toString();
      }
      
      return this.ticketsService.getTicketList(filters);
    } catch (error) {
      this.logger.error(`Error getting ticket list: ${error.message}`);
      throw new HttpException(
        'Failed to get ticket list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Executive Dashboard - Advanced Analytics
  @Get('executive/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive')
  async getExecutiveDashboard(
    @Query() query: {
      dateFrom?: string;
      dateTo?: string;
      department?: string;
    },
  ) {
    try {
      const filters: any = {};
      
      if (query.dateFrom) {
        filters.dateFrom = new Date(query.dateFrom);
      }
      
      if (query.dateTo) {
        filters.dateTo = new Date(query.dateTo);
      }
      
      if (query.department) {
        filters.department = query.department;
      }
      
      return this.ticketsService.getExecutiveDashboard(filters);
    } catch (error) {
      this.logger.error(`Error getting executive dashboard: ${error.message}`);
      throw new HttpException(
        'Failed to get executive dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Performance Metrics
  @Get('metrics/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive', 'admin')
  async getUserPerformanceMetrics(
    @Param('userId') userId: string,
    @Query() query: { dateFrom?: string; dateTo?: string },
  ) {
    try {
      const dateRange = query.dateFrom && query.dateTo ? {
        from: new Date(query.dateFrom),
        to: new Date(query.dateTo),
      } : undefined;
      
      return this.ticketsService.getUserPerformanceMetrics(
        parseInt(userId),
        dateRange
      );
    } catch (error) {
      this.logger.error(`Error getting user metrics: ${error.message}`);
      throw new HttpException(
        'Failed to get user performance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Disposisi Override
  @Post(':id/override-disposisi')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive')
  async overrideDisposisi(
    @Param('id') id: string,
    @Body() body: {
      toUserId: number;
      reason: string;
      skipLevels?: boolean;
    },
    @Req() req,
  ) {
    try {
      const ticket = await this.ticketsService.findOne(parseInt(id));
      
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }
      
      // Executive can override normal disposisi flow
      const targetUser = await this.usersService.findOne(body.toUserId);
      if (!targetUser) {
        throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);
      }
      
      // Create override disposisi
      await this.ticketsService.createDisposisiHistory({
        ticketId: ticket.id,
        fromUserId: req.user.id,
        toUserId: body.toUserId,
        reason: `Executive Override: ${body.reason}`,
        notes: body.skipLevels ? 'Skipped normal flow levels' : null,
        actionType: 'override',
      });
      
      // Update ticket
      const updatedTicket = await this.ticketsService.update(parseInt(id), {
        currentHandler: body.toUserId,
        assignedTo: body.toUserId,
        status: 'disposisi',
      });
      
      // Send notification
      await this.notificationsService.createNotification({
        userId: body.toUserId,
        type: 'executive_override',
        title: 'Executive Ticket Assignment',
        message: `Ticket #${ticket.ticketNumber} assigned directly by executive`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });
      
      return updatedTicket;
    } catch (error) {
      this.logger.error(`Error in executive override: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to override disposisi',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Bulk Operations
  @Post('bulk/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive', 'admin')
  async bulkUpdate(
    @Body() body: {
      ticketIds: number[];
      updates: any;
    },
    @Req() req,
  ) {
    try {
      return this.ticketsService.bulkUpdate(
        body.ticketIds,
        body.updates,
        req.user.id
      );
    } catch (error) {
      this.logger.error(`Error in bulk update: ${error.message}`);
      throw new HttpException(
        'Failed to bulk update tickets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Export Tickets
  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive', 'admin')
  async exportTickets(
    @Query() query: any,
    @Query('format') format: 'csv' | 'json' | 'excel' = 'csv',
  ) {
    try {
      return this.ticketsService.exportTickets(query, format);
    } catch (error) {
      this.logger.error(`Error exporting tickets: ${error.message}`);
      throw new HttpException(
        'Failed to export tickets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // SLA Management
  @Get('sla/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive', 'admin')
  async getSLAStatus() {
    try {
      return this.ticketsService.updateSLAStatus();
    } catch (error) {
      this.logger.error(`Error getting SLA status: ${error.message}`);
      throw new HttpException(
        'Failed to get SLA status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Workflow Management
  @Post('workflows')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive', 'admin')
  async createWorkflow(@Body() workflowData: any, @Req() req) {
    try {
      return this.ticketsService.createWorkflow({
        ...workflowData,
        createdBy: req.user.id,
      });
    } catch (error) {
      this.logger.error(`Error creating workflow: ${error.message}`);
      throw new HttpException(
        'Failed to create workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('workflows')
  @UseGuards(JwtAuthGuard)
  async getWorkflows(@Query('category') category?: string) {
    try {
      return this.ticketsService.getWorkflows(category);
    } catch (error) {
      this.logger.error(`Error getting workflows: ${error.message}`);
      throw new HttpException(
        'Failed to get workflows',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Template Management
  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('executive', 'admin')
  async createTemplate(@Body() templateData: any, @Req() req) {
    try {
      return this.ticketsService.createTemplate({
        ...templateData,
        createdBy: req.user.id,
      });
    } catch (error) {
      this.logger.error(`Error creating template: ${error.message}`);
      throw new HttpException(
        'Failed to create template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard)
  async getTemplates(@Query('category') category?: string) {
    try {
      return this.ticketsService.getTemplates(category);
    } catch (error) {
      this.logger.error(`Error getting templates: ${error.message}`);
      throw new HttpException(
        'Failed to get templates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/reassign')
  @UseGuards(JwtAuthGuard)
  async reassignTicket(
    @Param('id') id: string,
    @Body() body: { assignedTo: number; reason?: string },
    @Req() req,
  ) {
    try {
      // Only admin and executive can reassign tickets
      if (req.user.role !== 'admin' && req.user.role !== 'executive') {
        throw new HttpException(
          'Only admins and executives can reassign tickets',
          HttpStatus.FORBIDDEN,
        );
      }

      const ticket = await this.ticketsService.findOne(Number.parseInt(id));
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      const oldAssignee = ticket.assignedTo;
      
      // Update ticket assignment
      const updatedTicket = await this.ticketsService.update(Number.parseInt(id), {
        assignedTo: body.assignedTo,
        updatedAt: new Date(),
      });

      // Create reassignment message
      await this.ticketsService.addMessage({
        ticketId: Number.parseInt(id),
        userId: req.user.id,
        message: `Ticket reassigned from user #${oldAssignee} to user #${body.assignedTo}. ${body.reason ? `Reason: ${body.reason}` : ''}`,
      });

      // Send notifications
      await this.notificationsService.createNotification({
        userId: body.assignedTo,
        type: 'ticket_reassigned',
        title: 'Ticket Reassigned to You',
        message: `Ticket #${ticket.ticketNumber} has been reassigned to you`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });

      if (oldAssignee) {
        await this.notificationsService.createNotification({
          userId: oldAssignee,
          type: 'ticket_reassigned',
          title: 'Ticket Reassigned',
          message: `Ticket #${ticket.ticketNumber} has been reassigned to another user`,
          relatedId: ticket.id,
          relatedType: 'ticket',
        });
      }

      await this.notificationsService.createNotification({
        userId: ticket.userId,
        type: 'ticket_reassigned',
        title: 'Your Ticket Was Reassigned',
        message: `Your ticket #${ticket.ticketNumber} has been reassigned to a different support agent`,
        relatedId: ticket.id,
        relatedType: 'ticket',
      });

      return updatedTicket;
    } catch (error) {
      this.logger.error(`Error reassigning ticket: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to reassign ticket',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getTicketStats(@Req() req) {
    try {
      // Admin and executive get all stats, others get their own
      const userId = (req.user.role === 'admin' || req.user.role === 'executive') ? null : req.user.id;
      return this.ticketsService.getTicketStats(userId);
    } catch (error) {
      this.logger.error(`Error getting ticket stats: ${error.message}`);
      throw new HttpException(
        'Failed to get ticket statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('assigned-to-me')
  @UseGuards(JwtAuthGuard)
  async getAssignedTickets(@Req() req) {
    try {
      if (req.user.role === 'mahasiswa') {
        throw new HttpException(
          'Students cannot be assigned tickets',
          HttpStatus.FORBIDDEN,
        );
      }

      return this.ticketsService.findByAssignee(req.user.id);
    } catch (error) {
      this.logger.error(`Error getting assigned tickets: ${error.message}`);
      throw new HttpException(
        'Failed to get assigned tickets',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}