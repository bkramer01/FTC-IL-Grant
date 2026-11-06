// Replaces the local test database with a fresh copy of production's data. Production is only
// read, in a read-only transaction. Safe to re-run; it overwrites any local test edits.
//   npm run db:copy-prod            asks first
//   npm run db:copy-prod -- --yes   doesn't ask
import { config } from "dotenv";
import type { Pool } from "pg";
import { createPool, isLocalDatabaseUrl } from "../src/db";
import { runMigrations } from "./migrate";
import { confirm, productionDatabaseUrl } from "./prod-db";

config({ path: ".env.local", quiet: true });

// Parents before children: application_reviews.ask_id points at grant_asks.
const TABLES = [
  { name: "settings", identity: false },
  { name: "sheet_snapshots", identity: false },
  { name: "grant_asks", identity: true },
  { name: "application_reviews", identity: false },
  { name: "email_log", identity: true },
];

// Keep every value as Postgres's own text, so dates and JSON copy over exactly.
const asText = { getTypeParser: () => (value: string) => value };

/** Copies every table from source to target, replacing what's there. Returns rows per table. */
export async function copyDatabase(source: Pool, target: Pool): Promise<Record<string, number>> {
  const from = await source.connect();
  const rowsByTable = new Map<string, { columns: string[]; rows: unknown[][] }>();
  try {
    await from.query("begin transaction isolation level repeatable read read only");
    for (const { name } of TABLES) {
      const result = await from.query({ text: `select * from ${name}`, rowMode: "array", types: asText });
      rowsByTable.set(name, { columns: result.fields.map((f) => f.name), rows: result.rows });
    }
    await from.query("commit");
  } finally {
    from.release();
  }

  const to = await target.connect();
  const counts: Record<string, number> = {};
  try {
    await to.query("begin");
    await to.query(`truncate ${TABLES.map((t) => t.name).join(", ")} restart identity`);
    for (const { name, identity } of TABLES) {
      const { columns, rows } = rowsByTable.get(name)!;
      const list = columns.map((c) => `"${c}"`).join(", ");
      const params = columns.map((_, i) => `$${i + 1}`).join(", ");
      const override = identity ? "overriding system value" : "";
      for (const row of rows) await to.query(`insert into ${name} (${list}) ${override} values (${params})`, row);
      if (identity) {
        await to.query(`select setval(pg_get_serial_sequence('${name}', 'id'), coalesce(max(id), 1), max(id) is not null) from ${name}`);
      }
      counts[name] = rows.length;
    }
    await to.query("commit");
  } catch (err) {
    await to.query("rollback");
    throw err;
  } finally {
    to.release();
  }
  return counts;
}

async function main() {
  const targetUrl = process.env.DATABASE_URL;
  if (!isLocalDatabaseUrl(targetUrl)) {
    throw new Error("Refusing to copy: DATABASE_URL in .env.local isn't a database on this computer.");
  }
  const sourceUrl = productionDatabaseUrl();
  if (!process.argv.includes("--yes")) {
    await confirm("This replaces everything in the local test database, including your test edits. Production isn't changed.", "copy");
  }
  // Brings the test database up to date first, so it can hold changes production doesn't have yet.
  await runMigrations(targetUrl);
  const source = createPool(sourceUrl, 1);
  const target = createPool(targetUrl, 1);
  try {
    const counts = await copyDatabase(source, target);
    console.log("Copied from production:", counts);
  } finally {
    await Promise.all([source.end(), target.end()]);
  }
}

if (process.argv[1]?.endsWith("copy-prod.ts")) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
