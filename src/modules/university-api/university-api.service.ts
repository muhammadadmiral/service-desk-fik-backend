// src/modules/university-api/university-api.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { AxiosResponse } from 'axios';

@Injectable()
export class UniversityApiService {
  private readonly logger = new Logger(UniversityApiService.name);

  private readonly apiBaseUrl: string;
  private readonly basicAuth: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('CAMPUS_API_BASE_URL') || 'https://api.upnvj.ac.id/data';
    const rawAuth = this.configService.get<string>('CAMPUS_API_BASIC_AUTH') || 'uakademik:VTUzcjRrNGRlbTFrMjAyNCYh';
    this.basicAuth = Buffer.from(rawAuth).toString('base64');
    this.apiKey = this.configService.get<string>('CAMPUS_API_KEY') || 'Cspwwxq5SyTOMkq8XYcwZ1PMpYrYCwrv';
  }

  async authenticateStudent(nim: string, password: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('username', nim);
      formData.append('password', password);

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(`${this.apiBaseUrl}/auth_mahasiswa`, formData, {
          headers: {
            'Authorization': `Basic ${this.basicAuth}`,
            'X-UPNVJ-API-KEY': this.apiKey,
            ...formData.getHeaders(), // penting!
          },
        }),
      );

      if (response.data?.success) {
        this.logger.log(`Login success for NIM ${nim}`);
        return response.data.data;
      }

      this.logger.warn(`Login failed for NIM ${nim}: ${response.data?.message || 'Unknown error'}`);
      return null;
    } catch (error) {
      this.logger.error(`Error authenticating student: ${error.message}`);
      return null;
    }
  }
}