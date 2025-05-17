// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { NotificationsModule } from './modules/notifications/notification.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UniversityApiModule } from './modules/university-api/university-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    TicketsModule,
    CloudinaryModule,
    AuthModule,
    NotificationsModule,
    SettingsModule,
    UniversityApiModule, // New module for university API integration
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}