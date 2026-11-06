// Shared by the scripts that deliberately reach production. The production connection string
// lives only in .env.prod-db (not committed), never in .env.local, so the local site and the
// everyday db:* commands can't reach production by accident.
import { parse } from "dotenv";
import fs from "node:fs";
import readline from "node:readline/promises";
import { isLocalDatabaseUrl } from "../src/db";

export function productionDatabaseUrl(): string {
  const file = ".env.prod-db";
  const url = fs.existsSync(file) ? parse(fs.readFileSync(file)).PROD_DATABASE_URL : undefined;
  if (!url) throw new Error(`PROD_DATABASE_URL isn't set in ${file}. See "Test and production databases" in the README.`);
  if (isLocalDatabaseUrl(url)) throw new Error(`PROD_DATABASE_URL in ${file} points at this computer, not production.`);
  process.env.DATABASE_SSL = "true"; // Supabase needs SSL; createPool never uses it for a local database.
  return url;
}

/** Stops unless the person types the given word. */
export async function confirm(warning: string, word: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${warning}\nType "${word}" to continue: `);
  rl.close();
  if (answer.trim() !== word) {
    console.log("Nothing changed.");
    process.exit(1);
  }
}
