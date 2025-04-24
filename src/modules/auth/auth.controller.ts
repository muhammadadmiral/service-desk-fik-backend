import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    if (!loginDto.email || !loginDto.password) {
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('login/nim')
  async loginWithNim(@Body() loginDto: { nim: string; password: string }) {
    if (!loginDto.nim || !loginDto.password) {
      throw new HttpException(
        'NIM and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.loginWithNim(loginDto.nim, loginDto.password);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    if (!registerDto.email || !registerDto.password || !registerDto.name) {
      throw new HttpException(
        'Email, password, and name are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
