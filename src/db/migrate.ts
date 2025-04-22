import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';
import * as dotenv from 'dotenv';

dotenv.config();

// For running migrations
async function main() {
  console.log('Running migrations...');

  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed');
  console.error(err);
  process.exit(1);
});