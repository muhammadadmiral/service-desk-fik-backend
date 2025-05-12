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
import { TicketsService } from './tickets.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllTickets(@Req() req, @Query() query: any) {
    try {
      const { status, category } = query;
      if (req.user?.role === 'admin' || req.user?.role === 'staff') {
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

      if (req.user.role !== 'admin') {
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
}