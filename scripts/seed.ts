// Local development / testing only: loads the sample data in src/mock/sample-data.json
// (a snapshot of both Google Sheets plus sample administrator entries) into the database
// at DATABASE_URL. Don't run it against the production database.
//   npm run db:seed            only fills empty tables (safe to re-run)
//   npm run db:seed -- --reset empties them first
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { createDb, createPool, type Db } from "../src/db";
import { applicationReviews, emailLog, grantAsks, sheetSnapshots } from "../src/db/schema";
import type { GrantData } from "../src/lib/applications";
import sample from "../src/mock/sample-data.json";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export async function seed(db: Db, { reset = false } = {}) {
  const data = sample as GrantData;
  if (reset) await db.execute(sql`truncate application_reviews, email_log, grant_asks, sheet_snapshots restart identity`);

  const counts = { sheets: 0, reviews: 0, emails: 0, asks: 0 };
  const isEmpty = async (
    table: typeof applicationReviews | typeof emailLog | typeof grantAsks | typeof sheetSnapshots,
  ) => (await db.select({ n: sql<number>`count(*)::int` }).from(table))[0].n === 0;

  if (await isEmpty(sheetSnapshots)) {
    const refreshedAt = new Date(data.refreshedAt ?? Date.now());
    await db.insert(sheetSnapshots).values([
      { source: "responses", ...data.responses, refreshedAt },
      { source: "biobuzz", ...data.biobuzz, refreshedAt },
    ]);
    counts.sheets = 2;
  }

  if (await isEmpty(applicationReviews)) {
    const rows = Object.entries(data.reviews).map(([responseTimestamp, r]) => ({ responseTimestamp, ...r }));
    if (rows.length) await db.insert(applicationReviews).values(rows);
    counts.reviews = rows.length;
  }
  if (await isEmpty(emailLog)) {
    const rows = data.emails.map((e) => ({
      emailDate: e.date,
      teamNumber: e.teamNumber,
      recipient: e.recipient,
      purpose: e.purpose,
      notes: e.notes,
    }));
    if (rows.length) await db.insert(emailLog).values(rows);
    counts.emails = rows.length;
  }
  if (await isEmpty(grantAsks)) {
    const rows = data.asks.map((a, i) => ({
      position: i + 1,
      name: a.name,
      startDate: a.start,
      endDate: a.end,
    }));
    if (rows.length) await db.insert(grantAsks).values(rows);
    counts.asks = rows.length;
  }
  return counts;
}

if (process.argv[1]?.endsWith("seed.ts")) {
  const pool = createPool(process.env.DATABASE_URL, 1);
  seed(createDb(pool), { reset: process.argv.includes("--reset") })
    .then((c) => console.log(`Seeded ${c.sheets} sheet snapshots, ${c.reviews} reviews, ${c.emails} emails, ${c.asks} asks (tables that already had rows were left alone).`))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
