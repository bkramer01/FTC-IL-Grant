import { describe, expect, test } from "vitest";
import { buildApplications, fundBreakdown, sumFundRows, type GrantData } from "@/lib/applications";
import ExcelJS from "exceljs";
import { applicationsCsv, csvField, fundraisingTable } from "@/lib/export";
import { fundraisingFileName, fundraisingWorkbook } from "@/lib/report";
import sample from "@/mock/sample-data.json";

describe("csvField", () => {
  test("quotes commas, quotes and line breaks", () => {
    expect(csvField("a, b")).toBe('"a, b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("line 1\nline 2")).toBe('"line 1\nline 2"');
  });
  test("neutralizes formulas", () => expect(csvField("=SUM(A1)")).toBe("'=SUM(A1)"));
  test("leaves numbers and blanks alone", () => {
    expect(csvField(-150)).toBe("-150");
    expect(csvField(null)).toBe("");
  });
});

test("exports every application, newest first", () => {
  const apps = buildApplications(sample as GrantData);
  const lines = applicationsCsv(apps).trimEnd().split("\r\n");
  expect(lines[0].startsWith("Team #,Team Name,Coach Name,Coach Email,")).toBe(true);
  expect(lines[0]).toContain(",Calculated Team Age,Raised by Team,Possible Grant Award,Rookie/Veteran Status for Grant,");
  expect(lines[0]).not.toMatch(/Event Volunteering|Qualified Purchase/);
  expect(lines[0].endsWith(",Submissions from Team,Grant Approved,Review Notes,Timestamp")).toBe(true);
  expect(lines).toHaveLength(apps.length + 1);
  expect(lines[1].startsWith("38467,VHR,")).toBe(true);
  expect(lines[1].endsWith(",10/19/2026 17:46:38")).toBe(true);
  // No Grant Approved decision yet exports as "Not reviewed", like the page shows it.
  expect(lines[1].endsWith(",Not reviewed,,10/19/2026 17:46:38")).toBe(true);
});

test("fundraising export has both tabs' columns for the rows given", () => {
  const approved = buildApplications(sample as GrantData).filter((a) => a.review.approved === "Yes");
  const t = fundraisingTable(approved);
  expect(t.headers.join(",")).toBe(
    "Team #,Team Name,Coach Name,Approved,Rookie/Veteran Status,Matching Multiplier,Max Grant Award,Team Target,Raised by Team,Possible Grant Award,Unused Grant Match," +
      "Last Update,Check Addressee,Street Address,City, State,Zip,Ask Period,Amount of Check,Check #,Date Check Mailed,Grant Award Email Sent",
  );
  expect(t.rows).toHaveLength(approved.length);
  const team3640 = t.rows.find((r) => r[0] === 3640)!;
  const col = (h: string) => team3640[t.headers.indexOf(h)];
  expect([col("Rookie/Veteran Status"), col("Matching Multiplier"), col("Max Grant Award"), col("Team Target")]).toEqual(["Veteran Title 1", "1 to 2", 1200, 600]);
  expect([col("Raised by Team"), col("Possible Grant Award"), col("Unused Grant Match")]).toEqual([250, 500, 700]);
  expect(t.summary).toEqual([]);
});

test("fundraising Excel file: whole-dollar amounts, then the Total and Ask Period rows", async () => {
  const apps = buildApplications(sample as GrantData);
  const asks = [
    { id: 1, name: "Ask 1", start: "2026-09-01", end: "2026-10-20" },
    { id: 2, name: "Ask 2", start: null, end: null }, // not active: not listed
  ];
  const first = apps.find((a) => a.review.approved === "Yes")!;
  const tagged = apps.map((a) => (a === first ? { ...a, review: { ...a.review, askId: 1 } } : a));
  const groups = fundBreakdown(tagged, asks, true);
  expect(groups.map((g) => g.label)).toEqual(["Ask 1", "Unassigned", "Not approved"]);
  const total = { label: "Total", count: tagged.length, totals: sumFundRows(tagged) };
  for (const k of Object.keys(total.totals) as (keyof typeof total.totals)[]) {
    expect(groups.reduce((s, g) => s + g.totals[k], 0)).toBe(total.totals[k]);
  }

  const table = fundraisingTable(tagged, (id) => asks.find((a) => a.id === id)?.name ?? null, [total, ...groups]);
  const wb = await fundraisingWorkbook(table, new Date("2026-10-23T20:15:00Z"), "All applications");
  const read = new ExcelJS.Workbook();
  await read.xlsx.load(await wb.xlsx.writeBuffer());
  const ws = read.getWorksheet("Fundraising Status")!;
  const colOf = (h: string) => table.headers.indexOf(h) + 1;

  expect(ws.getCell("A1").value).toBe("Fundraising Status - All applications - as of Oct 23, 2026, 3:15 PM CDT");
  expect(ws.getCell("A3").value).toBe("Team #");
  expect(ws.views[0]).toMatchObject({ state: "frozen", ySplit: 3 });
  // A team row: dollar columns are numbers in whole-dollar format; others aren't.
  const withAward = tagged.findIndex((x) => x.possibleAward !== null);
  const teamCell = ws.getCell(4 + withAward, colOf("Possible Grant Award"));
  expect(typeof teamCell.value).toBe("number");
  expect(teamCell.numFmt).toBe('"$"#,##0');
  expect(ws.getCell(4, colOf("Team #")).numFmt).toBeFalsy();
  // One blank row, then Total (bold) and the groups.
  const blank = 4 + tagged.length;
  expect(ws.getCell(blank, 1).value).toBeNull();
  const labels = [0, 1, 2, 3].map((i) => ws.getCell(blank + 1 + i, 1).value);
  expect(labels).toEqual(["Total", "Ask 1 (1)", `Unassigned (${groups[1].count})`, `Not approved (${groups[2].count})`]);
  expect(ws.getCell(blank + 1, 1).font?.bold).toBe(true);
  expect(ws.getCell(blank + 1, colOf("Possible Grant Award")).value).toBe(total.totals.possible);
  expect(ws.getCell(blank + 2, colOf("Amount of Check")).value).toBe(groups[0].totals.checks);
  expect(ws.getCell(blank + 2, colOf("Amount of Check")).numFmt).toBe('"$"#,##0');
  expect(ws.getCell(blank + 1, colOf("Coach Name")).value).toBeNull();
  expect(fundraisingFileName(new Date("2026-10-23T20:15:00Z"))).toBe("grant-fundraising-2026-10-23.xlsx");
});

test("a Team Number that isn't one number exports as typed, never as NaN", async () => {
  const row = Object.assign(Array<string>(19).fill(""), { 0: "10/22/2026 13:54:40", 4: "31768, 31769", 5: "Coach" });
  const data = { ...(sample as GrantData), responses: { headers: [], rows: [row] }, reviews: {} };
  const [app] = buildApplications(data);
  expect(Number.isNaN(app.teamNumber)).toBe(true);
  expect(app.teamNumberText).toBe("31768, 31769");
  const table = fundraisingTable([app]);
  expect(table.rows[0][0]).toBe("31768, 31769");
  expect(applicationsCsv([app]).split("\r\n")[1].startsWith('"31768, 31769",')).toBe(true);
  // Even a NaN that slips into a number column is written as a blank cell.
  table.rows[0][table.headers.indexOf("Max Grant Award")] = Number.NaN;
  const wb = await fundraisingWorkbook(table);
  const read = new ExcelJS.Workbook();
  await read.xlsx.load(await wb.xlsx.writeBuffer());
  expect(read.getWorksheet("Fundraising Status")!.getCell(4, table.headers.indexOf("Max Grant Award") + 1).value).toBeNull();
});
