// src/modules/tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { UsersModule } from '../users/users.module'; // KEEP THIS
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // ADD THIS

@Module({
  imports: [
    UsersModule, // KEEP THIS
    CloudinaryModule, // ADD THIS
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}