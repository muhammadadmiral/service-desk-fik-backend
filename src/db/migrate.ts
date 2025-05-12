// src/db/migrate.ts
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
    
    // Debug log to see result structure
    console.log(`Checking table ${tableName}:`, result);
    
    // Different ways to access the result depending on structure
    if (Array.isArray(result)) {
      return result[0]?.table_exists || false;
    } else if (result.rows) {
      return result.rows[0]?.table_exists || false;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
    return false;
  }
}

async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
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
    
    // Debug log
    console.log(`Checking column ${columnName} in ${tableName}:`, result);
    
    if (Array.isArray(result)) {
      return result[0]?.column_exists || false;
    } else if (result.rows) {
      return result.rows[0]?.column_exists || false;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error checking column ${columnName} in ${tableName}:`, error);
    return false;
  }
}

async function runMigrations() {
  console.log('Running migrations...');

  try {
    // Check which tables already exist
    const usersExists = await checkTableExists('users');
    const ticketsExists = await checkTableExists('tickets');
    const ticketMessagesExists = await checkTableExists('ticket_messages');
    const ticketAttachmentsExists = await checkTableExists('ticket_attachments');

    console.log('\nTable status:');
    console.log('- users:', usersExists ? 'exists' : 'not found');
    console.log('- tickets:', ticketsExists ? 'exists' : 'not found');
    console.log('- ticket_messages:', ticketMessagesExists ? 'exists' : 'not found');
    console.log('- ticket_attachments:', ticketAttachmentsExists ? 'exists' : 'not found');

    // If all core tables exist, only run incremental migrations
    if (usersExists && ticketsExists && ticketMessagesExists && ticketAttachmentsExists) {
      console.log('\nAll core tables exist. Running incremental migrations...');
      
      // Check if nip column exists in users table
      const nipExists = await checkColumnExists('users', 'nip');
      if (!nipExists) {
        console.log('Adding nip column to users table...');
        await db.execute(sql`
          ALTER TABLE users
          ADD COLUMN nip VARCHAR(20) UNIQUE
        `);
        console.log('✓ Added nip column successfully');
      } else {
        console.log('✓ nip column already exists');
      }

      // Check if cloudinary_id column exists in ticket_attachments table
      const cloudinaryIdExists = await checkColumnExists('ticket_attachments', 'cloudinary_id');
      if (!cloudinaryIdExists) {
        console.log('Adding cloudinary_id column to ticket_attachments table...');
        await db.execute(sql`
          ALTER TABLE ticket_attachments
          ADD COLUMN cloudinary_id VARCHAR(255)
        `);
        console.log('✓ Added cloudinary_id column successfully');
      } else {
        console.log('✓ cloudinary_id column already exists');
      }

      console.log('\nIncremental migrations completed successfully');
    } else {
      console.log('\nSome tables are missing. Database needs to be initialized first.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
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