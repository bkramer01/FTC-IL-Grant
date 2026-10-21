import { sql } from "drizzle-orm";
import { bigint, check, date, index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Grant site tables. Edit here, run `npm run db:generate`, and commit the new file in
// drizzle/. Every table has row-level security on with no policies (added in the
// migration), so Supabase's public API exposes nothing; the Next.js server reads and
// writes through DATABASE_URL.

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

const yesNo = (column: string) => sql`${sql.identifier(column)} in ('Yes', 'No')`;

/**
 * The Grant Administrator's entries for one grant form response, keyed by the response's
 * Timestamp (the form's own row key). Blank means "not entered yet".
 * Dollar amounts are whole dollars.
 */
export const applicationReviews = pgTable(
  "application_reviews",
  {
    responseTimestamp: text("response_timestamp").primaryKey(),
    title1: text("title1"),
    letterReceived: text("letter_received"),
    volunteering: text("volunteering"),
    qualifiedPurchase: text("qualified_purchase"),
    vrsCompleted: text("vrs_completed"),
    approved: text("approved"),
    notes: text("notes").notNull().default(""),
    raised: integer("raised"),
    raisedUpdatedOn: date("raised_updated_on"),
    checkAmount: integer("check_amount"),
    checkNumber: text("check_number"),
    checkMailedOn: date("check_mailed_on"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("application_reviews_title1_check", yesNo("title1")),
    check("application_reviews_letter_received_check", yesNo("letter_received")),
    check("application_reviews_volunteering_check", yesNo("volunteering")),
    check("application_reviews_qualified_purchase_check", yesNo("qualified_purchase")),
    check("application_reviews_vrs_completed_check", sql`${t.vrsCompleted} in ('Yes', 'In Progress', 'No')`),
    check("application_reviews_approved_check", sql`${t.approved} in ('Yes', 'Under Review', 'No')`),
    check("application_reviews_amounts_check", sql`${t.raised} >= 0 and ${t.checkAmount} >= 0`),
  ],
);

/** Grant emails sent to coaches (entered by hand). */
export const emailLog = pgTable(
  "email_log",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    emailDate: date("email_date").notNull(),
    teamNumber: integer("team_number").notNull(),
    recipient: text("recipient").notNull(),
    purpose: text("purpose").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("email_log_purpose_check", sql`${t.purpose} in ('Additional Info Needed', 'Grant Award', 'Other')`),
    // "Email sent" columns look up the latest email by team and purpose.
    index("email_log_team_purpose_idx").on(t.teamNumber, t.purpose),
  ],
);

/** Grant Ask Tracker: requests for money from the Donor Fund, shown in `position` order. */
export const grantAsks = pgTable(
  "grant_asks",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    position: integer("position").notNull(),
    name: text("name").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    cumulative: integer("cumulative"),
    ask: integer("ask"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("grant_asks_amounts_check", sql`${t.cumulative} >= 0 and ${t.ask} >= 0`)],
);

/**
 * The latest copy of each Google Sheet tab the site reads, replaced by Refresh Data:
 * "responses" (grant form, Form Responses 1) and "biobuzz" (team list). Cells are the
 * sheet's formatted values, one array per row, padded to the header length.
 */
export const sheetSnapshots = pgTable(
  "sheet_snapshots",
  {
    source: text("source").primaryKey(),
    headers: jsonb("headers").$type<string[]>().notNull(),
    rows: jsonb("rows").$type<string[][]>().notNull(),
    refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("sheet_snapshots_source_check", sql`${t.source} in ('responses', 'biobuzz')`)],
);
