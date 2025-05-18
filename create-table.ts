import { db } from './src/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function createTables() {
  console.log('🔄 Creating missing tables...');

  try {
    // Check if user_audit_logs table exists
    const userAuditLogsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_audit_logs'
      ) as exists
    `);
    
    if (!userAuditLogsExists.rows?.[0]?.exists) {
      console.log('Creating user_audit_logs table...');
      await db.execute(sql`
        CREATE TABLE user_audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          action VARCHAR(100) NOT NULL,
          performed_by INTEGER NOT NULL REFERENCES users(id),
          old_value JSONB,
          new_value JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ user_audit_logs table created successfully');
    } else {
      console.log('✅ user_audit_logs table already exists');
    }

    // Check if ticket_audit_logs table exists
    const ticketAuditLogsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ticket_audit_logs'
      ) as exists
    `);
    
    if (!ticketAuditLogsExists.rows?.[0]?.exists) {
      console.log('Creating ticket_audit_logs table...');
      await db.execute(sql`
        CREATE TABLE ticket_audit_logs (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER NOT NULL REFERENCES tickets(id),
          user_id INTEGER NOT NULL REFERENCES users(id),
          action VARCHAR(100) NOT NULL,
          old_value JSONB,
          new_value JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ ticket_audit_logs table created successfully');
    } else {
      console.log('✅ ticket_audit_logs table already exists');
    }

    // Check if disposisi_history table exists
    const disposisiHistoryExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'disposisi_history'
      ) as exists
    `);
    
    if (!disposisiHistoryExists.rows?.[0]?.exists) {
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
      console.log('✅ disposisi_history table created successfully');
    } else {
      console.log('✅ disposisi_history table already exists');
    }

    // Check if ticket_templates table exists
    const ticketTemplatesExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ticket_templates'
      ) as exists
    `);
    
    if (!ticketTemplatesExists.rows?.[0]?.exists) {
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
      console.log('✅ ticket_templates table created successfully');
    } else {
      console.log('✅ ticket_templates table already exists');
    }

    // Check if ticket_workflows table exists
    const ticketWorkflowsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ticket_workflows'
      ) as exists
    `);
    
    if (!ticketWorkflowsExists.rows?.[0]?.exists) {
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
      console.log('✅ ticket_workflows table created successfully');
    } else {
      console.log('✅ ticket_workflows table already exists');
    }

    // Check if ticket_analytics table exists
    const ticketAnalyticsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ticket_analytics'
      ) as exists
    `);
    
    if (!ticketAnalyticsExists.rows?.[0]?.exists) {
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
      console.log('✅ ticket_analytics table created successfully');
    } else {
      console.log('✅ ticket_analytics table already exists');
    }

    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run the function
createTables().catch((err) => {
  console.error('❌ Table creation failed:', err);
  process.exit(1);
});