import { db } from './index';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as table_exists
    `);
    console.log(`Checking table ${tableName}:`, result);
    if (Array.isArray(result)) {
      return result[0]?.table_exists || false;
    } else if ((result as any).rows) {
      return (result as any).rows[0]?.table_exists || false;
    }
    return false;
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

async function checkColumnExists(
  tableName: string,
  columnName: string,
): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
      ) as column_exists
    `);
    console.log(`Checking column ${columnName} in ${tableName}:`, result);
    if (Array.isArray(result)) {
      return result[0]?.column_exists || false;
    } else if ((result as any).rows) {
      return (result as any).rows[0]?.column_exists || false;
    }
    return false;
  } catch (error) {
    console.error(`Error checking column ${columnName} in ${tableName}:`, error);
    return false;
  }
}

async function runMigrations() {
  console.log('Running migrations...');

  // Core tables
  const usersExists = await checkTableExists('users');
  const ticketsExists = await checkTableExists('tickets');
  const ticketMessagesExists = await checkTableExists('ticket_messages');
  const ticketAttachmentsExists = await checkTableExists('ticket_attachments');

  console.log('\nTable status:');
  console.log('- users:', usersExists ? 'exists' : 'not found');
  console.log('- tickets:', ticketsExists ? 'exists' : 'not found');
  console.log('- ticket_messages:', ticketMessagesExists ? 'exists' : 'not found');
  console.log('- ticket_attachments:', ticketAttachmentsExists ? 'exists' : 'not found');

  if (usersExists && ticketsExists && ticketMessagesExists && ticketAttachmentsExists) {
    console.log('\nAll core tables exist. Running incremental migrations...');

    // Users table columns
    const userColumns = [
      { name: 'nip', definition: 'VARCHAR(20) UNIQUE' },
      { name: 'program_studi', definition: 'VARCHAR(100)' },
      { name: 'fakultas', definition: 'VARCHAR(100)' },
      { name: 'angkatan', definition: 'VARCHAR(10)' },
      { name: 'status', definition: 'VARCHAR(20)' },
      { name: 'last_login', definition: 'TIMESTAMP' },
    ];

    for (const col of userColumns) {
      if (!(await checkColumnExists('users', col.name))) {
        console.log(`Adding ${col.name} column to users table...`);
        await db.execute(sql`
          ALTER TABLE users ADD COLUMN ${sql.identifier(col.name)} ${sql.raw(col.definition)}
        `);
        console.log(`✓ Added ${col.name} column successfully`);
      }
    }

    // Tickets table columns
    const ticketColumns = [
      { name: 'subcategory', definition: 'VARCHAR(100)' },
      { name: 'is_simple', definition: 'BOOLEAN DEFAULT false' },
      { name: 'disposisi_chain', definition: "JSONB DEFAULT '[]'" },
      { name: 'current_handler', definition: 'INTEGER' },
      { name: 'sla_deadline', definition: 'TIMESTAMP' },
      { name: 'sla_status', definition: 'VARCHAR(50)' },
      { name: 'escalation_level', definition: 'INTEGER DEFAULT 0' },
      { name: 'reopen_count', definition: 'INTEGER DEFAULT 0' },
      { name: 'customer_satisfaction', definition: 'INTEGER' },
      { name: 'resolution_time', definition: 'INTEGER' },
      { name: 'first_response_time', definition: 'INTEGER' },
      { name: 'tags', definition: "JSONB DEFAULT '[]'" },
      { name: 'metadata', definition: "JSONB DEFAULT '{}'" },
    ];

    for (const col of ticketColumns) {
      if (!(await checkColumnExists('tickets', col.name))) {
        console.log(`Adding ${col.name} column to tickets table...`);
        await db.execute(sql`
          ALTER TABLE tickets ADD COLUMN ${sql.identifier(col.name)} ${sql.raw(col.definition)}
        `);
        console.log(`✓ Added ${col.name} column successfully`);
      }
    }

    // Ticket messages table columns
    const messageColumns = [
      { name: 'message_type', definition: "VARCHAR(50) DEFAULT 'comment'" },
      { name: 'is_internal', definition: 'BOOLEAN DEFAULT false' },
    ];

    for (const col of messageColumns) {
      if (!(await checkColumnExists('ticket_messages', col.name))) {
        console.log(`Adding ${col.name} column to ticket_messages table...`);
        await db.execute(sql`
          ALTER TABLE ticket_messages ADD COLUMN ${sql.identifier(col.name)} ${sql.raw(col.definition)}
        `);
        console.log(`✓ Added ${col.name} column successfully`);
      }
    }

    // Ticket attachments table
    if (!(await checkColumnExists('ticket_attachments', 'cloudinary_id'))) {
      console.log('Adding cloudinary_id column to ticket_attachments table...');
      await db.execute(sql`
        ALTER TABLE ticket_attachments ADD COLUMN cloudinary_id VARCHAR(255)
      `);
      console.log('✓ Added cloudinary_id column successfully');
    }

    // Notifications table
    if (!(await checkTableExists('notifications'))) {
      console.log('Creating notifications table...');
      await db.execute(sql`
        CREATE TABLE notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          read_at TIMESTAMP,
          related_id INTEGER,
          related_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT now()
        )
      `);
      console.log('✓ notifications table created successfully');
    }

    console.log('\nIncremental migrations completed successfully');
  } else {
    console.log('\nSome tables are missing. Database needs to be initialized first.');
  }
}

async function main() {
  try {
    await runMigrations();
    console.log('\nAll migrations completed successfully');
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
