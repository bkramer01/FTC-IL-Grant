// Reads and writes the Grant Administrator's entries (reviews, email log, grant asks).
// Server-side only: callers pass the database from getDb() (or a test database).
import { asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { applicationReviews, emailLog, grantAsks, sheetSnapshots } from "@/db/schema";
import { hqAmountFromRow, responseTimestamp, type EmailEntry, type GrantAsk, type Review, type SheetTable } from "./applications";
import { todayCentral } from "./format";

type ReviewRow = typeof applicationReviews.$inferSelect;

function toReview(r: ReviewRow): Review {
  return {
    title1: r.title1 as Review["title1"],
    letterReceived: r.letterReceived as Review["letterReceived"],
    volunteering: r.volunteering as Review["volunteering"],
    qualifiedPurchase: r.qualifiedPurchase as Review["qualifiedPurchase"],
    vrsCompleted: r.vrsCompleted as Review["vrsCompleted"],
    approved: r.approved as Review["approved"],
    notes: r.notes,
    raised: r.raised,
    raisedUpdatedOn: r.raisedUpdatedOn,
    raisedSet: r.raisedSet,
    checkAmount: r.checkAmount,
    checkAmountFor: r.checkAmountFor,
    checkNumber: r.checkNumber,
    checkMailedOn: r.checkMailedOn,
    checkPaid: r.checkPaid,
    askId: r.askId,
  };
}

/** Everything the administrator has entered, in the shapes the pages use. */
export async function loadAdminEntries(db: Db) {
  const [reviewRows, emailRows, askRows] = await Promise.all([
    db.select().from(applicationReviews),
    db.select().from(emailLog).orderBy(desc(emailLog.emailDate), desc(emailLog.id)),
    db.select().from(grantAsks).orderBy(asc(grantAsks.position), asc(grantAsks.id)),
  ]);
  const reviews: Record<string, Review> = {};
  for (const r of reviewRows) reviews[r.responseTimestamp] = toReview(r);
  const emails: EmailEntry[] = emailRows.map((e) => ({
    id: e.id,
    date: e.emailDate,
    teamNumber: e.teamNumber,
    recipient: e.recipient,
    purpose: e.purpose,
    notes: e.notes,
  }));
  const asks: GrantAsk[] = askRows.map((a) => ({
    id: a.id,
    name: a.name,
    start: a.startDate,
    end: a.endDate,
  }));
  return { reviews, emails, asks };
}

/** Saves some fields of one application's review, creating the row if it's the first entry. */
export async function saveReview(db: Db, responseTimestamp: string, patch: Partial<Review>) {
  const values = { ...patch, updatedAt: new Date() };
  await db
    .insert(applicationReviews)
    .values({ responseTimestamp, ...values })
    .onConflictDoUpdate({ target: applicationReviews.responseTimestamp, set: values });
}

export async function addEmail(db: Db, e: Omit<EmailEntry, "id">): Promise<EmailEntry> {
  const [row] = await db
    .insert(emailLog)
    .values({ emailDate: e.date, teamNumber: e.teamNumber, recipient: e.recipient, purpose: e.purpose, notes: e.notes })
    .returning();
  return { id: row.id, date: row.emailDate, teamNumber: row.teamNumber, recipient: row.recipient, purpose: row.purpose, notes: row.notes };
}

export async function deleteEmail(db: Db, id: number) {
  await db.delete(emailLog).where(eq(emailLog.id, id));
}

/** Adds an ask at the end of the list and returns it. */
export async function addAsk(db: Db, name: string): Promise<GrantAsk> {
  const [row] = await db
    .insert(grantAsks)
    .values({ name, position: sql`coalesce((select max(${grantAsks.position}) from ${grantAsks}), 0) + 1` })
    .returning();
  return { id: row.id, name: row.name, start: null, end: null };
}

export async function updateAsk(db: Db, id: number, patch: Partial<Omit<GrantAsk, "id">>) {
  const set: Partial<typeof grantAsks.$inferInsert> = { updatedAt: new Date() };
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.start !== undefined) set.startDate = patch.start;
  if (patch.end !== undefined) set.endDate = patch.end;
  await db.update(grantAsks).set(set).where(eq(grantAsks.id, id));
}

/** Deletes an ask; teams assigned to it become unassigned (the foreign key clears ask_id). */
export async function removeAsk(db: Db, id: number) {
  await db.delete(grantAsks).where(eq(grantAsks.id, id));
}

/**
 * Replaces both sheet snapshots and, in the same transaction, copies each form response's HQ
 * grant amount into Raised by Team where that hasn't been set yet (blank and non-numeric
 * amounts are skipped until the sheet has a number). Returns the refresh time.
 */
export async function saveSnapshots(db: Db, tables: Record<"responses" | "biobuzz", SheetTable>, now = new Date()) {
  const today = todayCentral(now);
  await db.transaction(async (tx) => {
    for (const row of tables.responses.rows) {
      const amount = hqAmountFromRow(row);
      if (amount === null || amount === "error") continue;
      const values = { raised: amount, raisedUpdatedOn: today, raisedSet: true, updatedAt: now };
      await tx
        .insert(applicationReviews)
        .values({ responseTimestamp: responseTimestamp(row), ...values })
        .onConflictDoUpdate({
          target: applicationReviews.responseTimestamp,
          set: values,
          setWhere: eq(applicationReviews.raisedSet, false),
        });
    }
    for (const source of ["responses", "biobuzz"] as const) {
      const { headers, rows } = tables[source];
      await tx
        .insert(sheetSnapshots)
        .values({ source, headers, rows, refreshedAt: now })
        .onConflictDoUpdate({ target: sheetSnapshots.source, set: { headers, rows, refreshedAt: now } });
    }
  });
  return now;
}

/** The saved sheet snapshots; empty tables (and no refresh time) before the first refresh. */
export async function loadSnapshots(db: Db) {
  const rows = await db.select().from(sheetSnapshots);
  const empty: SheetTable = { headers: [], rows: [] };
  const by = Object.fromEntries(rows.map((r) => [r.source, r]));
  const times = rows.map((r) => r.refreshedAt.getTime());
  return {
    responses: by.responses ? { headers: by.responses.headers, rows: by.responses.rows } : empty,
    biobuzz: by.biobuzz ? { headers: by.biobuzz.headers, rows: by.biobuzz.rows } : empty,
    refreshedAt: times.length === 2 ? new Date(Math.min(...times)).toISOString() : null,
  };
}
