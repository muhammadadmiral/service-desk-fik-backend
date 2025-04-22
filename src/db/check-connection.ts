import { db } from './index';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  try {
    console.log('Checking database connection...');

    // Try to execute a simple query
    const result = await db.execute(sql`SELECT NOW()`);

    console.log('Database connection successful!');
    console.log('Current database time:', result[0].now);

    // List all tables
    console.log('\nListing database tables:');
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  process.exit(0);
}

checkConnection().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
