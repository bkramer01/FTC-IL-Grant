import ExcelJS from "exceljs";
import { expect, test } from "vitest";
import { buildApplications, computeTotals, type GrantData } from "@/lib/applications";
import { grantMatchingReport, reportFileName } from "@/lib/report";
import sample from "@/mock/sample-data.json";

const now = new Date("2026-10-20T20:15:00Z"); // 3:15 PM CDT

test("Grant Matching Report matches the totals table", async () => {
  const totals = computeTotals(buildApplications(sample as GrantData));
  const wb = await grantMatchingReport(totals, now);

  // Round-trip through a real .xlsx file, the way Excel would open it.
  const read = new ExcelJS.Workbook();
  await read.xlsx.load(await wb.xlsx.writeBuffer());
  const ws = read.getWorksheet("Grant Matching Report")!;

  expect(ws.getCell("A1").value).toBe("Grant Matching Report - as of Oct 20, 2026, 3:15 PM CDT");
  expect(ws.getCell("A2").value).toBeNull();
  expect(ws.getCell("A3").value).toBe("Rookie/Veteran Status");
  expect(ws.getCell("H3").value).toBe("Total Team Fundraising as of Oct 20, 2026");

  const row = (r: number) => (ws.getRow(r).values as unknown[]).slice(1);
  expect(row(4)).toEqual(["Rookie 1", 4, 3, "1 to 1", 1500, 4500, 1500, 3900, 3600, 900]);
  expect(row(7)).toEqual(["Second Year Title 1", 3, 2, "1 to 3", 1500, 3000, 500, 1000, 3000, 1050]);
  expect(row(9)).toEqual(["Not Qualified", 5, 0, "—", 0, 0, 0, 0, 0, 0]);
  expect(ws.getCell("A10").value).toBe("Total");
  expect([ws.getCell("B10").value, ws.getCell("F10").value, ws.getCell("H10").value, ws.getCell("J10").value]).toEqual([
    28, 25350, 12800, 9350,
  ]);

  // Dollar formatting, and green only where every approved team raised the max.
  expect(ws.getCell("H4").numFmt).toBe('"$"#,##0');
  const green = (addr: string) => (ws.getCell(addr).fill as ExcelJS.FillPattern | undefined)?.fgColor?.argb;
  expect(green("H7")).toBe("FFD1E7DD");
  expect(green("H4")).toBeUndefined();
  expect(green("I7")).toBeUndefined();
});

test("report file name uses the Central date", () => {
  expect(reportFileName(now)).toBe("grant-matching-report-2026-10-20.xlsx");
});
