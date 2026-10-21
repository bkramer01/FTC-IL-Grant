import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { inject } from "vitest";
import { createDb, createPool } from "@/db";
import {
  addAsk,
  addEmail,
  deleteEmail,
  loadAdminEntries,
  loadSnapshots,
  removeAsk,
  saveReview,
  saveSnapshots,
  updateAsk,
} from "@/lib/store";
import { seed } from "../scripts/seed";

const pool = createPool(inject("databaseUrl"), 2);
const db = createDb(pool);
afterAll(() => pool.end());

beforeEach(async () => {
  await db.execute(sql`truncate application_reviews, email_log, grant_asks, sheet_snapshots restart identity`);
});

describe("seed", () => {
  test("loads the sample entries once", async () => {
    expect(await seed(db)).toEqual({ sheets: 2, reviews: 36, emails: 3, asks: 2 });
    // Re-running leaves filled tables alone.
    expect(await seed(db)).toEqual({ sheets: 0, reviews: 0, emails: 0, asks: 0 });
    const sheets = await loadSnapshots(db);
    expect([sheets.responses.rows.length, sheets.biobuzz.rows.length]).toEqual([36, 186]);
    const { reviews, emails, asks } = await loadAdminEntries(db);
    expect(Object.keys(reviews)).toHaveLength(36);
    expect(reviews["9/28/2026 19:07:48"]).toMatchObject({ approved: "Yes", raised: 500, checkAmount: 1050, raisedUpdatedOn: "2026-10-11" });
    expect(emails[0]).toMatchObject({ date: "2026-10-12", teamNumber: 38599, purpose: "Grant Award" });
    expect(asks.map((a) => [a.name, a.cumulative, a.ask])).toEqual([
      ["Ask 1", 20700, 20700],
      ["Ask 2", 40700, 20000],
    ]);
  });
});

describe("reviews", () => {
  test("first save creates the row; later saves change only the given fields", async () => {
    await saveReview(db, "10/19/2026 17:46:38", { title1: "Yes" });
    await saveReview(db, "10/19/2026 17:46:38", { approved: "Under Review", notes: "Waiting on letter" });
    const { reviews } = await loadAdminEntries(db);
    expect(reviews["10/19/2026 17:46:38"]).toMatchObject({
      title1: "Yes",
      approved: "Under Review",
      notes: "Waiting on letter",
      raised: null,
    });
    await saveReview(db, "10/19/2026 17:46:38", { approved: null });
    expect((await loadAdminEntries(db)).reviews["10/19/2026 17:46:38"].approved).toBeNull();
  });

  test("the database rejects answers that aren't allowed", async () => {
    await expect(saveReview(db, "x", { approved: "Maybe" as never })).rejects.toThrow();
    await expect(saveReview(db, "x", { raised: -5 })).rejects.toThrow();
  });
});

describe("email log", () => {
  test("add and delete", async () => {
    const e = await addEmail(db, { date: "2026-10-20", teamNumber: 38467, recipient: "Adam Lueken", purpose: "Grant Award", notes: "Line 1\nLine 2" });
    expect(e.id).toBeTypeOf("number");
    expect((await loadAdminEntries(db)).emails).toEqual([e]);
    await deleteEmail(db, e.id!);
    expect((await loadAdminEntries(db)).emails).toEqual([]);
  });
});

describe("grant asks", () => {
  test("add at the end, update, remove", async () => {
    const a1 = await addAsk(db, "Ask 1");
    const a2 = await addAsk(db, "Ask 2");
    await updateAsk(db, a2.id!, { start: "2026-10-21", cumulative: 40700, ask: 20000 });
    let { asks } = await loadAdminEntries(db);
    expect(asks.map((a) => a.name)).toEqual(["Ask 1", "Ask 2"]);
    expect(asks[1]).toMatchObject({ start: "2026-10-21", end: null, cumulative: 40700, ask: 20000 });
    await removeAsk(db, a1.id!);
    ({ asks } = await loadAdminEntries(db));
    expect(asks.map((a) => a.name)).toEqual(["Ask 2"]);
  });
});

describe("sheet snapshots", () => {
  test("nothing before the first refresh; a refresh replaces both tabs", async () => {
    expect(await loadSnapshots(db)).toEqual({
      responses: { headers: [], rows: [] },
      biobuzz: { headers: [], rows: [] },
      refreshedAt: null,
    });
    const at = new Date("2026-10-21T15:00:00Z");
    await saveSnapshots(db, { responses: { headers: ["Timestamp"], rows: [["10/1/2026 9:00:00"]] }, biobuzz: { headers: ["TeamNumber", "TeamName"], rows: [["1", "A"]] } }, at);
    await saveSnapshots(db, { responses: { headers: ["Timestamp"], rows: [] }, biobuzz: { headers: ["TeamNumber", "TeamName"], rows: [["2", "B"]] } }, at);
    expect(await loadSnapshots(db)).toEqual({
      responses: { headers: ["Timestamp"], rows: [] },
      biobuzz: { headers: ["TeamNumber", "TeamName"], rows: [["2", "B"]] },
      refreshedAt: at.toISOString(),
    });
  });
});
