import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  type: string;

  @IsString()
  department: string;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high' = 'medium';

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  ticketNumber?: string;
}
