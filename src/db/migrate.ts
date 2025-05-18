import { db } from './index';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('🔄 Starting database migration...');

  try {
    // Create indexes on existing tables
    console.log('📊 Creating optimized indexes...');
    
    // Users table indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS user_role_idx ON users (role)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS user_department_idx ON users (department)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS user_program_studi_idx ON users (program_studi)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS user_status_idx ON users (status)`);
    
    // Tickets table indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_status_idx ON tickets (status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_priority_idx ON tickets (priority)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_category_idx ON tickets (category)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_department_idx ON tickets (department)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_user_id_idx ON tickets (user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_assigned_to_idx ON tickets (assigned_to)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_created_at_idx ON tickets (created_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ticket_sla_status_idx ON tickets (sla_status)`);
    
    // Ticket messages indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS message_ticket_id_idx ON ticket_messages (ticket_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS message_user_id_idx ON ticket_messages (user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS message_type_idx ON ticket_messages (message_type)`);
    
    // Notifications indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS notification_user_id_idx ON notifications (user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS notification_is_read_idx ON notifications (is_read)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS notification_type_idx ON notifications (type)`);
    
    // Settings indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS settings_category_idx ON settings (category)`);
    
    console.log('✅ Indexes created successfully');

    // Check and add missing columns
    console.log('🔍 Checking for missing columns...');
    
    // Check if disposisi_chain column exists in tickets table
    const disposisiChainExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'disposisi_chain'
      ) as exists
    `);
    
    if (!disposisiChainExists.rows[0].exists) {
      console.log('Adding disposisi_chain column to tickets table...');
      await db.execute(sql`ALTER TABLE tickets ADD COLUMN disposisi_chain JSONB DEFAULT '[]'`);
    }
    
    // Check if metadata column exists in tickets table
    const metadataExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'metadata'
      ) as exists
    `);
    
    if (!metadataExists.rows[0].exists) {
      console.log('Adding metadata column to tickets table...');
      await db.execute(sql`ALTER TABLE tickets ADD COLUMN metadata JSONB DEFAULT '{}'`);
    }
    
    // Check if tags column exists in tickets table
    const tagsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'tags'
      ) as exists
    `);
    
    if (!tagsExists.rows[0].exists) {
      console.log('Adding tags column to tickets table...');
      await db.execute(sql`ALTER TABLE tickets ADD COLUMN tags JSONB DEFAULT '[]'`);
    }
    
    console.log('✅ Column checks completed');

    // Create missing tables if they don't exist
    console.log('🏗️ Creating missing tables...');
    
    // Check if disposisi_history table exists
    const disposisiHistoryExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'disposisi_history'
      ) as exists
    `);
    
    if (!disposisiHistoryExists.rows[0].exists) {
      console.log('Creating disposisi_history table...');
      await db.execute(sql`
        CREATE TABLE disposisi_history (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER NOT NULL REFERENCES tickets(id),
          from_user_id INTEGER REFERENCES users(id),
          to_user_id INTEGER NOT NULL REFERENCES users(id),
          reason TEXT,
          notes TEXT,
          progress_update INTEGER,
          action_type VARCHAR(50),
          expected_completion_time TIMESTAMP,
          sla_impact VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await db.execute(sql`CREATE INDEX disposisi_ticket_id_idx ON disposisi_history (ticket_id)`);
      await db.execute(sql`CREATE INDEX disposisi_to_user_id_idx ON disposisi_history (to_user_id)`);
    }
    
    // Check if ticket_templates table exists
    const ticketTemplatesExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ticket_templates'
      ) as exists
    `);
    
    if (!ticketTemplatesExists.rows[0].exists) {
      console.log('Creating ticket_templates table...');
      await db.execute(sql`
        CREATE TABLE ticket_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          subcategory VARCHAR(100),
          department VARCHAR(100) NOT NULL,
          priority VARCHAR(50) NOT NULL,
          template_content JSONB NOT NULL,
          auto_assignment_rules JSONB,
          sla_hours INTEGER DEFAULT 24,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await db.execute(sql`CREATE INDEX template_category_idx ON ticket_templates (category)`);
      await db.execute(sql`CREATE INDEX template_is_active_idx ON ticket_templates (is_active)`);
    }
    
    // Check if ticket_workflows table exists
    const ticketWorkflowsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ticket_workflows'
      ) as exists
    `);
    
    if (!ticketWorkflowsExists.rows[0].exists) {
      console.log('Creating ticket_workflows table...');
      await db.execute(sql`
        CREATE TABLE ticket_workflows (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          steps JSONB NOT NULL,
          conditions JSONB,
          is_default BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await db.execute(sql`CREATE INDEX workflow_category_idx ON ticket_workflows (category)`);
      await db.execute(sql`CREATE INDEX workflow_is_default_idx ON ticket_workflows (is_default)`);
      await db.execute(sql`CREATE INDEX workflow_is_active_idx ON ticket_workflows (is_active)`);
    }
    
    // Check if ticket_analytics table exists
    const ticketAnalyticsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ticket_analytics'
      ) as exists
    `);
    
    if (!ticketAnalyticsExists.rows[0].exists) {
      console.log('Creating ticket_analytics table...');
      await db.execute(sql`
        CREATE TABLE ticket_analytics (
          id SERIAL PRIMARY KEY,
          date TIMESTAMP NOT NULL,
          hour INTEGER,
          department VARCHAR(100),
          category VARCHAR(100),
          total_tickets INTEGER DEFAULT 0,
          open_tickets INTEGER DEFAULT 0,
          closed_tickets INTEGER DEFAULT 0,
          average_resolution_time INTEGER,
          average_response_time INTEGER,
          sla_breaches INTEGER DEFAULT 0,
          customer_satisfaction_average INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await db.execute(sql`CREATE INDEX analytics_date_idx ON ticket_analytics (date)`);
      await db.execute(sql`CREATE INDEX analytics_department_idx ON ticket_analytics (department)`);
      await db.execute(sql`CREATE INDEX analytics_category_idx ON ticket_analytics (category)`);
    }
    
    console.log('✅ Table creation completed');
    
    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run migration
migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});