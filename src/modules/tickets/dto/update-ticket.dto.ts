import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsOptional, IsEnum, IsNumber, IsDate } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsEnum(['pending', 'in-progress', 'completed', 'closed'])
  @IsOptional()
  status?: 'pending' | 'in-progress' | 'completed' | 'closed';

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsDate()
  @IsOptional()
  estimatedCompletion?: Date;

  @IsDate()
  @IsOptional()
  completedAt?: Date;
}
