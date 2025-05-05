// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load .env sebelum pakai process.env
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('⚠️  Missing env var DATABASE_URL');
}

export default defineConfig({
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',      // atau driver: 'pg'
  dbCredentials: {
    url,                       // langsung pakai connection string
  },
}) satisfies Config;
