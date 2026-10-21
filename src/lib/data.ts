import "server-only";
import { getDb } from "@/db";
import sample from "@/mock/sample-data.json";
import type { GrantData } from "./applications";
import { loadAdminEntries } from "./store";

/**
 * The site's data: form responses and BioBuzz team names from the sheet snapshot in
 * src/mock/sample-data.json (until Refresh Data reads the Google Sheets), plus the Grant
 * Administrator's saved entries from the database.
 */
export async function loadGrantData(): Promise<GrantData> {
  const snapshot = sample as GrantData;
  const saved = await loadAdminEntries(getDb());
  return { ...snapshot, ...saved };
}

/** The data a page sends to the browser: BioBuzz trimmed to team number and name. */
export async function loadClientGrantData(): Promise<GrantData> {
  const data = await loadGrantData();
  return {
    ...data,
    biobuzz: { headers: data.biobuzz.headers.slice(0, 2), rows: data.biobuzz.rows.map((r) => r.slice(0, 2)) },
  };
}
