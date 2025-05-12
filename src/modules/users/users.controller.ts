import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
    @Query('available') available?: string,
    @Req() req?: any,
  ) {
    // Only admin and executive can see all users
    // Mahasiswa can only see available dosen
    if (req.user.role === 'mahasiswa') {
      if (role !== 'dosen') {
        throw new HttpException(
          'You can only view available dosen',
          HttpStatus.FORBIDDEN,
        );
      }
      return this.usersService.findAll({
        role: 'dosen',
        department,
        search,
        available: true,
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'executive') {
      throw new HttpException(
        'Access denied',
        HttpStatus.FORBIDDEN,
      );
    }

    const filters = {
      role,
      department,
      search,
      available: available === 'true',
    };

    return this.usersService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dosen/available')
  async getAvailableDosen(
    @Query('department') department?: string,
  ) {
    return this.usersService.findAvailableDosen(department);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}