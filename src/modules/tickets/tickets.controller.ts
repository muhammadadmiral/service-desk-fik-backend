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
  Query,
  Logger,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    this.logger.log(
      `Finding all tickets with status: ${status}, category: ${category}`,
    );
    return this.ticketsService.findAll(status, category);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('my')
  findMyTickets(@Req() req) {
    const userId = req.user.dbUser.id;
    this.logger.log(`Finding tickets for user ID: ${userId}`);
    return this.ticketsService.findByUserId(userId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Finding ticket with ID: ${id}`);
    return this.ticketsService.findOne(+id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Req() req) {
    const userId = req.user.dbUser.id;
    this.logger.log(`Creating ticket for user ID: ${userId}`);

    // Generate ticket number if not provided
    if (!createTicketDto.ticketNumber) {
      createTicketDto.ticketNumber = `TIK-${Date.now().toString().slice(-6)}`;
    }

    return this.ticketsService.create({
      ...createTicketDto,
      userId,
    });
  }

  @UseGuards(FirebaseAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req,
  ) {
    this.logger.log(`Updating ticket with ID: ${id}`);
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`Removing ticket with ID: ${id}`);
    return this.ticketsService.remove(+id);
  }
}
