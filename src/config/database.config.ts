// src/config/database.config.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema/';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ← pastikan ini ada
  ssl: { rejectUnauthorized: false }, // Neon butuh SSL
});

export const db = drizzle(pool, { schema });
