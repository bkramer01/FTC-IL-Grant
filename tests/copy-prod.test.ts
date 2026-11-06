import { afterAll, beforeAll, expect, inject, test } from "vitest";
import { copyDatabase } from "../scripts/copy-prod";
import { runMigrations } from "../scripts/migrate";
import { createPool, isLocalDatabaseUrl } from "@/db";
import type { Pool } from "pg";

test("only databases on this computer count as local", () => {
  expect(isLocalDatabaseUrl("postgres://postgres:postgres@localhost:54339/ftc_grant")).toBe(true);
  expect(isLocalDatabaseUrl("postgres://u:p@127.0.0.1:5432/db")).toBe(true);
  expect(isLocalDatabaseUrl("postgres://u:p@[::1]:5432/db")).toBe(true);
  expect(isLocalDatabaseUrl("postgresql://u:p@aws-1-us-west-2.pooler.supabase.com:5432/postgres")).toBe(false);
  // A password can't make a remote database look local.
  expect(isLocalDatabaseUrl("postgresql://u:x@localhost:1@db.supabase.co:5432/postgres")).toBe(false);
  expect(isLocalDatabaseUrl("")).toBe(false);
  expect(isLocalDatabaseUrl(undefined)).toBe(false);
});

let admin: Pool;
let source: Pool;
let target: Pool;
const names = ["copy_source_test", "copy_target_test"];

beforeAll(async () => {
  const base = new URL(inject("databaseUrl"));
  admin = createPool(base.href, 1);
  const urls = [];
  for (const name of names) {
    await admin.query(`drop database if exists ${name}`);
    await admin.query(`create database ${name}`);
    const url = new URL(base.href);
    url.pathname = `/${name}`;
    await runMigrations(url.href);
    urls.push(url.href);
  }
  source = createPool(urls[0], 2);
  target = createPool(urls[1], 2);
});

afterAll(async () => {
  await Promise.all([source.end(), target.end()]);
  for (const name of names) await admin.query(`drop database if exists ${name}`);
  await admin.end();
});

test("copying replaces the target's data, keeps exact values and leaves the source alone", async () => {
  await source.query(`insert into grant_asks (position, name, start_date) values (1, 'Skip', null), (2, 'Ask 2', '2026-10-04')`);
  await source.query(`delete from grant_asks where name = 'Skip'`);
  await source.query(`insert into application_reviews (response_timestamp, approved, check_number, check_mailed_on, check_paid, ask_id)
    values ('10/1/2026 9:00:00', 'Yes', '10542', '2026-10-27', true, 2)`);
  await source.query(`insert into email_log (email_date, team_number, recipient, purpose) values ('2026-10-27', 8620, 'a@example.com', 'Grant Award')`);
  await source.query(`insert into sheet_snapshots (source, headers, rows) values ('responses', '["A","B"]', '[["1","x, \\"y\\""]]')`);
  await target.query(`insert into grant_asks (position, name) values (9, 'Old test ask')`);
  const before = (await source.query(`select * from application_reviews`)).rows;

  const counts = await copyDatabase(source, target);
  expect(counts).toEqual({ settings: 0, sheet_snapshots: 1, grant_asks: 1, application_reviews: 1, email_log: 1 });

  expect((await target.query(`select name from grant_asks`)).rows).toEqual([{ name: "Ask 2" }]);
  const [row] = (await target.query(`select *, check_mailed_on::text as mailed from application_reviews`)).rows;
  expect(row).toMatchObject({ check_number: "10542", mailed: "2026-10-27", check_paid: true, ask_id: "2" });
  const [sheet] = (await target.query(`select headers, rows from sheet_snapshots`)).rows;
  expect(sheet).toEqual({ headers: ["A", "B"], rows: [["1", 'x, "y"']] });

  // New rows carry on after the copied ids.
  const added = await target.query(`insert into grant_asks (position, name) values (3, 'New') returning id`);
  expect(Number(added.rows[0].id)).toBe(3);

  expect((await source.query(`select * from application_reviews`)).rows).toEqual(before);
  expect((await source.query(`select count(*)::int n from grant_asks`)).rows[0].n).toBe(1);
});
