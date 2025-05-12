// src/modules/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req, @Query('unread') unread: string) {
    const unreadOnly = unread === 'true';
    return this.notificationsService.getUserNotifications(req.user.id, unreadOnly);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    const notificationId = parseInt(id);
    return this.notificationsService.markAsRead(notificationId, req.user.id);
  }

  @Put('read-all')
  async markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req) {
    const notificationId = parseInt(id);
    return this.notificationsService.deleteNotification(notificationId, req.user.id);
  }
}