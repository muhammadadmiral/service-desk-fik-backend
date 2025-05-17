// src/modules/university-api/university-api.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UniversityApiService } from './university-api.service';

@Module({
  imports: [HttpModule],
  providers: [UniversityApiService],
  exports: [UniversityApiService],
})
export class UniversityApiModule {}