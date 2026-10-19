// Starts a throwaway embedded Postgres for the test run and applies the migrations.
// Set TEST_DATABASE_URL to use an existing (empty, disposable) database instead.
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { TestProject } from "vitest/node";
import { runMigrations } from "../scripts/migrate";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

export default async function setup(project: TestProject) {
  if (process.env.TEST_DATABASE_URL) {
    await runMigrations(process.env.TEST_DATABASE_URL);
    project.provide("databaseUrl", process.env.TEST_DATABASE_URL);
    return;
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ftc-grant-test-pg-"));
  const port = 54900 + Math.floor(Math.random() * 500);
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: false,
    postgresFlags: ["-c", "max_connections=200"],
    onLog: () => {},
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("ftc_grant_test");
  const url = `postgres://postgres:postgres@localhost:${port}/ftc_grant_test`;
  await runMigrations(url);
  project.provide("databaseUrl", url);

  return async () => {
    await pg.stop();
    fs.rmSync(dir, { recursive: true, force: true });
  };
}
