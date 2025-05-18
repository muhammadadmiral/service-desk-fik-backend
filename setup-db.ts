import { db } from './src/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();
const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🔄 Setting up database...');

  try {
    // 1. Create tables if they don't exist
    console.log('Step 1: Creating missing tables...');
    // 1.b. Ensure columns exist in users
const userColumnsToAdd = [
  { name: 'last_login', type: 'timestamp' },
  { name: 'program_studi', type: 'varchar(100)' },
  { name: 'fakultas', type: 'varchar(100)' },
  { name: 'angkatan', type: 'varchar(10)' },
  { name: 'status', type: 'varchar(20)' },
];

for (const column of userColumnsToAdd) {
  const columnExists = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name = ${column.name}
    ) as exists;
  `);

  if (!columnExists.rows?.[0]?.exists) {
    console.log(`Adding column '${column.name}' to users...`);
    await db.execute(sql.raw(`
      ALTER TABLE users ADD COLUMN ${column.name} ${column.type};
    `));
    console.log(`✅ Column '${column.name}' added.`);
  } else {
    console.log(`✅ Column '${column.name}' already exists.`);
  }
}

    
    const tables = [
      {
        name: 'user_audit_logs',
        sql: `
          CREATE TABLE user_audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            action VARCHAR(100) NOT NULL,
            performed_by INTEGER NOT NULL REFERENCES users(id),
            old_value JSONB,
            new_value JSONB,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `
      },
      {
        name: 'ticket_audit_logs',
        sql: `
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
        `
      },
      {
        name: 'disposisi_history',
        sql: `
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
        `
      },
      {
        name: 'ticket_templates',
        sql: `
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
        `
      },
      {
        name: 'ticket_workflows',
        sql: `
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
        `
      },
      {
        name: 'ticket_analytics',
        sql: `
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
        `
      }
    ];
    
    for (const table of tables) {
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = ${table.name}
        ) as exists
      `);
      
      if (!tableExists.rows?.[0]?.exists) {
        console.log(`Creating ${table.name} table...`);
        await db.execute(sql.raw(table.sql));
        console.log(`✅ ${table.name} table created successfully`);
      } else {
        console.log(`✅ ${table.name} table already exists`);
      }
    }
    
    // 2. Run the seed script
    console.log('\nStep 2: Running seed script...');
    try {
      await execAsync('npx ts-node seed-2.ts');
      console.log('✅ Seed script executed successfully');
    } catch (error) {
      console.error('❌ Error running seed script:', error);
      throw error;
    }
    
    console.log('\n🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

// Run the setup
setupDatabase().catch((err) => {
  console.error('❌ Database setup failed:', err);
  process.exit(1);
});