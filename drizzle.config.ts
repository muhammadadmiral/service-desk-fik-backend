import type { Config } from 'drizzle-kit';

export default {
  schema: "./src/db/schema/*.ts",
  out: "./src/db/migrations",
  driver: "pg",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD || "admin123",
    database: process.env.DATABASE_NAME || "service_desk_db",
  },
} satisfies Config;