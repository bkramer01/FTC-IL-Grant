import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

export function createPool(connectionString = process.env.DATABASE_URL, max = 10) {
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  // SSL for Supabase (DATABASE_SSL=true), never for a database on this computer (local
  // development and the tests' throwaway Postgres don't speak SSL).
  const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(connectionString);
  return new Pool({
    connectionString,
    max,
    ssl: process.env.DATABASE_SSL === "true" && !local ? { rejectUnauthorized: false } : undefined,
  });
}

export function createDb(pool: Pool): Db {
  return drizzle(pool, { schema });
}

// One pool per server process (survives dev hot reloads).
const globalForDb = globalThis as unknown as { __ftcGrantPool?: Pool; __ftcGrantDb?: Db };

export function getDb(): Db {
  if (!globalForDb.__ftcGrantDb) {
    globalForDb.__ftcGrantPool = createPool();
    globalForDb.__ftcGrantDb = createDb(globalForDb.__ftcGrantPool);
  }
  return globalForDb.__ftcGrantDb;
}

export { schema };
