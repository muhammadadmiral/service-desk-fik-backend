// src/modules/settings/settings.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { db } from '../../db';
import { settings } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private cachedSettings: Map<string, any> = new Map();

  // Get all settings
  async getAllSettings() {
    try {
      const allSettings = await db.select().from(settings);
      
      // Convert to key-value object
      const settingsObject = {};
      allSettings.forEach(setting => {
        settingsObject[setting.key] = this.parseValue(setting.value, setting.type);
      });
      
      return settingsObject;
    } catch (error) {
      this.logger.error(`Error fetching settings: ${error.message}`);
      throw error;
    }
  }

  // Get single setting
  async getSetting(key: string) {
    try {
      // Check cache first
      if (this.cachedSettings.has(key)) {
        return this.cachedSettings.get(key);
      }

      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const value = this.parseValue(result[0].value, result[0].type);
      this.cachedSettings.set(key, value);
      
      return value;
    } catch (error) {
      this.logger.error(`Error fetching setting ${key}: ${error.message}`);
      throw error;
    }
  }

  // Update setting
  async updateSetting(key: string, value: any, description?: string) {
    try {
      const type = this.detectType(value);
      const stringValue = this.stringifyValue(value, type);

      const result = await db
        .update(settings)
        .set({
          value: stringValue,
          type,
          description,
          updatedAt: new Date(),
        })
        .where(eq(settings.key, key))
        .returning();

      if (result.length === 0) {
        // Create new setting if doesn't exist
        const newSetting = await db
          .insert(settings)
          .values({
            key,
            value: stringValue,
            type,
            description,
          })
          .returning();
        
        this.cachedSettings.set(key, value);
        return newSetting[0];
      }

      // Clear cache
      this.cachedSettings.delete(key);
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error updating setting ${key}: ${error.message}`);
      throw error;
    }
  }

  // Delete setting
  async deleteSetting(key: string) {
    try {
      const result = await db
        .delete(settings)
        .where(eq(settings.key, key))
        .returning();

      this.cachedSettings.delete(key);
      
      return result[0];
    } catch (error) {
      this.logger.error(`Error deleting setting ${key}: ${error.message}`);
      throw error;
    }
  }

  // Batch update settings
  async updateMultipleSettings(settingsData: Record<string, any>) {
    try {
      const updates = [];

      for (const [key, value] of Object.entries(settingsData)) {
        updates.push(this.updateSetting(key, value));
      }

      return await Promise.all(updates);
    } catch (error) {
      this.logger.error(`Error updating multiple settings: ${error.message}`);
      throw error;
    }
  }

  // Get settings by category
  async getSettingsByCategory(category: string) {
    try {
      const allSettings = await db
        .select()
        .from(settings)
        .where(eq(settings.category, category));

      const settingsObject = {};
      allSettings.forEach(setting => {
        settingsObject[setting.key] = this.parseValue(setting.value, setting.type);
      });
      
      return settingsObject;
    } catch (error) {
      this.logger.error(`Error fetching settings by category: ${error.message}`);
      throw error;
    }
  }

  // Get ticket categories
  async getTicketCategories() {
    try {
      const categoriesJson = await this.getSetting('ticket.categories');
      return categoriesJson || {};
    } catch (error) {
      this.logger.error(`Error fetching ticket categories: ${error.message}`);
      throw error;
    }
  }

  // Update ticket categories
  async updateTicketCategories(categories: any) {
    try {
      return await this.updateSetting('ticket.categories', categories);
    } catch (error) {
      this.logger.error(`Error updating ticket categories: ${error.message}`);
      throw error;
    }
  }

  // Get disposisi flow rules
  async getDisposisiFlowRules() {
    try {
      const rulesJson = await this.getSetting('disposisi.flow_rules');
      return rulesJson || {};
    } catch (error) {
      this.logger.error(`Error fetching disposisi flow rules: ${error.message}`);
      throw error;
    }
  }

  // Helper methods
  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return parseFloat(value);
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  private stringifyValue(value: any, type: string): string {
    switch (type) {
      case 'json':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  private detectType(value: any): string {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    return 'string';
  }

  // Initialize default settings
  async initializeDefaultSettings() {
    const defaults = {
      // General
      'system.name': 'Service Desk FIK',
      'system.email': 'support@fik.upnvj.ac.id',
      'system.timezone': 'Asia/Jakarta',
      
      // Ticket settings
      'ticket.auto_assign': false,
      'ticket.default_priority': 'medium',
      'ticket.allow_attachments': true,
      'ticket.max_attachment_size': 10485760, // 10MB
      
      // Ticket categories with subcategories
      'ticket.categories': {
        'Academic': {
          name: 'Akademik',
          subcategories: [
            'Nilai tidak muncul',
            'Error KRS',
            'Jadwal kuliah',
            'Wisuda',
            'Transkrip nilai',
            'Others'
          ]
        },
        'Financial': {
          name: 'Keuangan',
          subcategories: [
            'Pembayaran UKT',
            'Beasiswa',
            'Refund',
            'Tagihan',
            'Others'
          ]
        },
        'Technical': {
          name: 'Teknis',
          subcategories: [
            'SIAKAD error',
            'Email kampus',
            'WiFi/Network',
            'Lab komputer',
            'Proyektor rusak',
            'Others'
          ]
        },
        'Facility': {
          name: 'Fasilitas',
          subcategories: [
            'Ruang kelas',
            'AC rusak',
            'Listrik mati',
            'Kebersihan',
            'Parkir',
            'Others'
          ]
        },
        'Administrative': {
          name: 'Administrasi',
          subcategories: [
            'Surat keterangan',
            'Legalisir',
            'Cuti akademik',
            'Pindah prodi',
            'Others'
          ]
        }
      },
      
      'ticket.priorities': ['low', 'medium', 'high', 'urgent'],
      
      // Departments
      'ticket.departments': [
        'Akademik',
        'Keuangan',
        'IT Support',
        'Fasilitas',
        'Administrasi',
        'Kemahasiswaan'
      ],
      
      // Disposisi flow rules
      'disposisi.flow_rules': {
        'Financial': {
          defaultFlow: ['executive:Wadek 2', 'admin:Keuangan', 'staff:TU Keuangan'],
          escalationTime: 24, // hours
        },
        'Technical': {
          defaultFlow: ['admin:IT', 'staff:Technical Support'],
          escalationTime: 4,
        },
        'Academic': {
          defaultFlow: ['executive:Wadek 1', 'admin:Akademik', 'staff:TU Akademik'],
          escalationTime: 48,
        },
        'Facility': {
          defaultFlow: ['admin:Fasilitas', 'staff:Maintenance'],
          escalationTime: 8,
        },
        'Administrative': {
          defaultFlow: ['admin:Administrasi', 'staff:TU'],
          escalationTime: 24,
        }
      },
      
      // Progress tracking
      'progress.stages': {
        'pending': 0,
        'disposisi': 20,
        'in_review': 40,
        'in_progress': 60,
        'testing': 80,
        'completed': 100
      },
      
      // Email settings
      'email.enabled': true,
      'email.smtp_host': 'smtp.gmail.com',
      'email.smtp_port': 587,
      'email.smtp_secure': false,
      'email.smtp_user': '',
      'email.smtp_pass': '',
      
      // Notification settings
      'notification.email': true,
      'notification.in_app': true,
      'notification.ticket_created': true,
      'notification.ticket_disposisi': true,
      'notification.ticket_updated': true,
      'notification.new_message': true,
    };

    for (const [key, value] of Object.entries(defaults)) {
      const existing = await this.getSetting(key);
      if (!existing) {
        await this.updateSetting(key, value);
      }
    }
  }
}