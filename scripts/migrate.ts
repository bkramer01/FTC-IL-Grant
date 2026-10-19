import { config } from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb, createPool } from "../src/db";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export async function runMigrations(connectionString = process.env.DATABASE_URL) {
  const pool = createPool(connectionString, 1);
  try {
    await migrate(createDb(pool), { migrationsFolder: "./drizzle" });
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  runMigrations()
    .then(() => console.log("Migrations applied."))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
