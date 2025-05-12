// src/modules/settings/settings.module.ts
import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './setting.service';
@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}