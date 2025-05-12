// src/modules/settings/settings.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SettingsService } from './setting.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'executive')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('category/:category')
  async getSettingsByCategory(@Param('category') category: string) {
    return this.settingsService.getSettingsByCategory(category);
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    const value = await this.settingsService.getSetting(key);
    
    if (value === null) {
      throw new HttpException('Setting not found', HttpStatus.NOT_FOUND);
    }
    
    return { key, value };
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() body: { value: any; description?: string }
  ) {
    return this.settingsService.updateSetting(key, body.value, body.description);
  }

  @Put()
  async updateMultipleSettings(@Body() settings: Record<string, any>) {
    return this.settingsService.updateMultipleSettings(settings);
  }

  @Delete(':key')
  async deleteSetting(@Param('key') key: string) {
    const result = await this.settingsService.deleteSetting(key);
    
    if (!result) {
      throw new HttpException('Setting not found', HttpStatus.NOT_FOUND);
    }
    
    return { message: 'Setting deleted successfully' };
  }

  @Post('initialize-defaults')
  async initializeDefaults() {
    await this.settingsService.initializeDefaultSettings();
    return { message: 'Default settings initialized' };
  }

  @Get('ticket-categories')
  @UseGuards(JwtAuthGuard)
  @Roles('mahasiswa', 'dosen', 'admin', 'executive')
  async getTicketCategories() {
    return this.settingsService.getTicketCategories();
  }
}