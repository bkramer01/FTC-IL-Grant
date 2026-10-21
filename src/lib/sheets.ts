// Reads the two Google Sheet tabs the site uses, with the Google service account in
// GOOGLE_SERVICE_ACCOUNT_KEY (the key's JSON file, base64-encoded or as-is).
// Tabs are found by their tab ID (gid), because the BioBuzz tab names carry a date.
import type { SheetTable } from "./applications";

export type SheetSource = "responses" | "biobuzz";

export const SHEETS: Record<
  SheetSource,
  { label: string; spreadsheetId: string; gid: number; expect: Record<number, string> }
> = {
  responses: {
    label: "Grant form responses",
    spreadsheetId: "1b7nY9zdAcAE2zjmlmY_qk7wl69xO2UfHdN7yLbEr8MA",
    gid: 370691157,
    // The columns the site reads by position (see COL in applications.ts).
    expect: { 0: "Timestamp", 4: "Team Number", 5: "Coach Name", 14: "Street Address", 15: "City State", 18: "Zip" },
  },
  biobuzz: {
    label: "BioBuzz team list",
    spreadsheetId: "1ydZLnPGo8iGmWBToRH0Qa6lMbiWpNrz3oZW3__-tt7c",
    gid: 1750695360,
    expect: { 0: "TeamNumber", 1: "TeamName" },
  },
};

/** Header row plus data rows, each padded to the header length; blank rows are dropped. */
export function normalizeTable(values: string[][]): SheetTable {
  const [headerRow = [], ...rest] = values;
  const headers = headerRow.map((h) => String(h ?? ""));
  const width = headers.length;
  const rows = rest
    .map((r) => Array.from({ length: width }, (_, i) => String(r[i] ?? "")))
    .filter((r) => r[0].trim() !== "");
  return { headers, rows };
}

/** Throws a plain-English error if a column the site relies on has moved or been renamed. */
export function checkLayout(source: SheetSource, table: SheetTable) {
  const { label, expect } = SHEETS[source];
  const problems = Object.entries(expect)
    .filter(([i, name]) => (table.headers[Number(i)] ?? "").trim().toLowerCase() !== name.toLowerCase())
    .map(([i, name]) => `column ${String.fromCharCode(65 + Number(i))} should be "${name}" but is "${table.headers[Number(i)] ?? "(missing)"}"`);
  if (problems.length) {
    throw new Error(`${label}: the sheet's columns have changed (${problems.join("; ")}). Nothing was refreshed.`);
  }
}

function serviceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not set, so the site can't read the Google Sheets.");
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const key = JSON.parse(json) as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY isn't a service account key.");
  return { email: key.client_email, key: key.private_key };
}

async function accessToken() {
  const { JWT } = await import("google-auth-library");
  const { email, key } = serviceAccount();
  const jwt = new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  const { token } = await jwt.getAccessToken();
  if (!token) throw new Error("Google didn't return an access token for the service account.");
  return { token, email };
}

async function readTab(source: SheetSource, token: string, email: string): Promise<SheetTable> {
  const { label, spreadsheetId, gid } = SHEETS[source];
  const get = async (url: string) => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const body = await res.json();
    if (res.status === 403 || res.status === 404) {
      throw new Error(`${label}: Google refused access. Share the sheet with ${email} as Viewer.`);
    }
    if (!res.ok) throw new Error(`${label}: Google Sheets error ${res.status} (${body.error?.message ?? "unknown"}).`);
    return body;
  };
  const meta = await get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
  );
  const tab = (meta.sheets as { properties: { sheetId: number; title: string } }[]).find(
    (s) => s.properties.sheetId === gid,
  );
  if (!tab) throw new Error(`${label}: the tab the site reads (tab ID ${gid}) is missing from the spreadsheet.`);
  const range = encodeURIComponent(`'${tab.properties.title.replace(/'/g, "''")}'`);
  const values = await get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`);
  const table = normalizeTable(values.values ?? []);
  checkLayout(source, table);
  return table;
}

/** Reads both tabs. Throws (and nothing should be saved) if either one fails. */
export async function fetchSheets(): Promise<Record<SheetSource, SheetTable>> {
  const { token, email } = await accessToken();
  const [responses, biobuzz] = await Promise.all([readTab("responses", token, email), readTab("biobuzz", token, email)]);
  return { responses, biobuzz };
}
