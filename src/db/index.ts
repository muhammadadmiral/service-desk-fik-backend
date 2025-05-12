// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ← ganti semua opsi host/port/db
  ssl: { rejectUnauthorized: false }, // ← Neon wajib SSL
});

export const db = drizzle(pool, { schema });
