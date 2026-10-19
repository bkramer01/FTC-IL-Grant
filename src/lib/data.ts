import "server-only";
import sample from "@/mock/sample-data.json";
import type { GrantData } from "./applications";

/**
 * MOCKUP: returns the sample data copied from FTC IL Grant Status.xlsx. The real site
 * will read this from the database, filled by the Refresh Data button from the two
 * Google Sheets plus the Grant Administrator's saved entries.
 */
export function loadGrantData(): GrantData {
  return sample as GrantData;
}

/** The data a page sends to the browser: BioBuzz trimmed to team number and name. */
export function loadClientGrantData(): GrantData {
  const data = loadGrantData();
  return {
    ...data,
    biobuzz: { headers: data.biobuzz.headers.slice(0, 2), rows: data.biobuzz.rows.map((r) => r.slice(0, 2)) },
  };
}
