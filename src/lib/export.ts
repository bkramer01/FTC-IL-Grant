// Exports: the Applications table as CSV, and the Fundraising Status table's contents for
// its Excel file (built in report.ts).
import type { Application, FundGroup, FundTotals } from "./applications";
import { shortDate } from "./format";
import { maxFundraisingTarget, maxGrantAward, multiplierLabel } from "./grant";

type AskName = (id: number | null) => string | null;

/** Team # as a number, or as typed on the form when it isn't a single number. */
function teamNumberValue(a: Application): string | number {
  return Number.isFinite(a.teamNumber) ? a.teamNumber : a.teamNumberText;
}
type Column = [string, (a: Application, askName: AskName) => string | number | null];

const APPLICATION_COLUMNS: Column[] = [
  ["Team #", (a) => teamNumberValue(a)],
  ["Team Name", (a) => a.teamName ?? "not found"],
  ["Coach Name", (a) => a.coach],
  ["Coach Email", (a) => a.email],
  ["Rookie/Veteran Status Provided", (a) => a.categoryProvided],
  ["Calculated Team Age", (a) => a.age],
  ["Raised by Team", (a) => a.review.raised],
  ["Possible Grant Award", (a) => a.possibleAward],
  ["Rookie/Veteran Status for Grant", (a) => a.category],
  ["School Title 1 Status", (a) => a.review.title1],
  ["Fundraising Letter Rec'd", (a) => a.review.letterReceived],
  ["Fundraising Letter Link", (a) => a.letterUrl],
  ["List of Volunteers", (a) => a.volunteers],
  ["Fully Registered? (from Team)", (a) => a.fullyRegistered],
  ["End of Season Survey Completed?", (a) => a.surveyCompleted],
  ["VRS Task Completed", (a) => a.review.vrsCompleted],
  ["VRS Screenshot Link", (a) => a.vrsUrl],
  ["Add'l Info Email Sent", (a) => shortDate(a.additionalInfoEmailOn)],
  ["Submissions from Team", (a) => a.duplicateCount],
  ["Grant Approved", (a) => a.review.approved ?? "Not reviewed"],
  ["Review Notes", (a) => a.review.notes],
  ["Timestamp", (a) => a.timestamp],
];

/** Both Fundraising Status tabs, in on-screen order: Fundraising Status, then Check Status. */
const FUNDRAISING_COLUMNS: Column[] = [
  ["Team #", (a) => teamNumberValue(a)],
  ["Team Name", (a) => a.teamName ?? "not found"],
  ["Coach Name", (a) => a.coach],
  ["Approved", (a) => a.review.approved ?? "Not reviewed"],
  ["Rookie/Veteran Status", (a) => a.category],
  ["Matching Multiplier", (a) => multiplierLabel(a.category)],
  ["Max Grant Award", (a) => maxGrantAward(a.category)],
  ["Team Target", (a) => maxFundraisingTarget(a.category)],
  ["Raised by Team", (a) => a.review.raised],
  ["Possible Grant Award", (a) => a.possibleAward],
  ["Unused Grant Match", (a) => a.unusedMatch],
  ["Last Update", (a) => shortDate(a.review.raisedUpdatedOn)],
  ["Check Addressee", (a) => a.checkPayee],
  ["Street Address", (a) => a.street],
  ["City, State", (a) => a.cityState],
  ["Zip", (a) => a.zip],
  ["Ask Period", (a, askName) => (a.review.approved === "Yes" ? askName(a.review.askId) : null)],
  ["Amount of Check", (a) => a.checkAmount],
  ["Check #", (a) => a.review.checkNumber],
  ["Date Check Mailed", (a) => shortDate(a.review.checkMailedOn)],
  ["Check Status", (a) => a.checkStatus],
  ["Grant Award Email Sent", (a) => shortDate(a.awardEmailOn)],
];

/** One CSV field: quoted when needed, and text that Excel would run as a formula is neutralized. */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  let s = value;
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(columns: Column[], rows: Application[], askName: AskName = () => null): string {
  const lines = [columns.map(([h]) => csvField(h)).join(",")];
  for (const a of rows) lines.push(columns.map(([, get]) => csvField(get(a, askName))).join(","));
  return lines.join("\r\n") + "\r\n";
}

/** Every application, newest first, with the same columns as the table plus emails and file links. */
export function applicationsCsv(apps: Application[]): string {
  return toCsv(APPLICATION_COLUMNS, [...apps].sort((a, b) => b.submittedAt - a.submittedAt));
}

/** Which total goes in each Fundraising Status column of the summary rows (the dollar columns). */
export const FUNDRAISING_TOTALS: Record<string, keyof FundTotals> = {
  "Max Grant Award": "maxGrant",
  "Team Target": "target",
  "Raised by Team": "raised",
  "Possible Grant Award": "possible",
  "Unused Grant Match": "unused",
  "Amount of Check": "checks",
};

export type CellValue = string | number | null;
export type FundraisingTable = { headers: string[]; rows: CellValue[][]; summary: CellValue[][] };

/**
 * The rows shown in Fundraising Status (in their current order), with the columns of both
 * tabs, plus `summary` rows (the Total, then each Ask Period) with the label in the first
 * column and each amount in its own column, as under the table.
 */
export function fundraisingTable(rows: Application[], askName: AskName = () => null, summary: FundGroup[] = []): FundraisingTable {
  return {
    headers: FUNDRAISING_COLUMNS.map(([h]) => h),
    rows: rows.map((a) => FUNDRAISING_COLUMNS.map(([, get]) => get(a, askName))),
    summary: summary.map((g, i) =>
      FUNDRAISING_COLUMNS.map(([h], c) => {
        if (c === 0) return i === 0 ? g.label : `${g.label} (${g.count})`;
        const key = FUNDRAISING_TOTALS[h];
        return key ? g.totals[key] : null;
      }),
    ),
  };
}

/** Saves CSV text as a file in the browser. The byte-order mark tells Excel the file is UTF-8. */
export function downloadCsv(filename: string, csv: string) {
  downloadBlob(filename, new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
}

/** Saves any file contents in the browser. */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
