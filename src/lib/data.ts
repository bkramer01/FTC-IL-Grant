import "server-only";
import { getDb } from "@/db";
import type { GrantData } from "./applications";
import { loadAdminEntries, loadSnapshots } from "./store";

/**
 * Everything the pages show, from the database: the latest copies of the Google Sheets
 * (saved by Refresh Data) and the Grant Administrator's entries.
 */
export async function loadGrantData(): Promise<GrantData> {
  const db = getDb();
  const [sheets, saved] = await Promise.all([loadSnapshots(db), loadAdminEntries(db)]);
  return { ...sheets, ...saved };
}

/** The data a page sends to the browser: BioBuzz trimmed to team number and name. */
export async function loadClientGrantData(): Promise<GrantData> {
  const data = await loadGrantData();
  return {
    ...data,
    biobuzz: { headers: data.biobuzz.headers.slice(0, 2), rows: data.biobuzz.rows.map((r) => r.slice(0, 2)) },
  };
}
