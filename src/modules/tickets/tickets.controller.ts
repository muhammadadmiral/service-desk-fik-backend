// src/modules/tickets/tickets.controller.ts
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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Define the File type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllTickets(@Req() req, @Param() params: any) {
    try {
      const { status, category } = params;
      // Admin or staff can see all tickets
      if (req.user?.role === 'admin' || req.user?.role === 'staff') {
        return this.ticketsService.findAll(status, category);
      }

      // Regular users can only see their own tickets
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

      // Check if ticket exists
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has access to this ticket
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
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          // Create directory if it doesn't exist
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createTicket(
    @Body() createTicketDto: any,
    @Req() req,
    @UploadedFiles() files: MulterFile[] = [],
  ) {
    try {
      if (!req.user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Generate a ticket number
      const ticketNumber = `TIK-${Date.now().toString().slice(-6)}`;

      // Prepare ticket data
      const ticketData = {
        ...createTicketDto,
        ticketNumber,
        userId: req.user.id,
        status: 'pending',
        progress: 0,
      };

      // Create the ticket
      const ticket = await this.ticketsService.create(ticketData);

      // Handle attachments if any
      if (files && files.length > 0) {
        const attachments = files.map((file) => ({
          ticketId: ticket.id,
          userId: req.user.id,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          filePath: file.path,
        }));

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

      // Check if ticket exists
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has permission to update this ticket
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

      // Update the ticket
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

      // Check if ticket exists
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      // Only admins can delete tickets
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'You do not have permission to delete this ticket',
          HttpStatus.FORBIDDEN,
        );
      }

      // Delete the ticket
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

      // Check if ticket exists
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has access to this ticket
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

      // Get ticket messages
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
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          // Create directory if it doesn't exist
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async addTicketMessage(
    @Param('id') id: string,
    @Body() messageDto: any,
    @Req() req,
    @UploadedFiles() files: MulterFile[] = [],
  ) {
    try {
      const ticket = await this.ticketsService.findOne(Number.parseInt(id));

      // Check if ticket exists
      if (!ticket) {
        throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has access to this ticket
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

      // Add message to ticket
      const message = await this.ticketsService.addMessage({
        ticketId: Number.parseInt(id),
        userId: req.user.id,
        message: messageDto.message,
      });

      // Handle attachments if any
      if (files && files.length > 0) {
        const attachments = files.map((file) => ({
          ticketId: Number.parseInt(id),
          userId: req.user.id,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          filePath: file.path,
        }));

        await this.ticketsService.addAttachments(attachments);
      }

      // Return message with sender info
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
}
