// Grant Matching Report: the Grant Matching Totals table as a formatted Excel workbook.
import type { TotalsRow } from "./applications";
import { centralDateTime, shortDate, todayCentral } from "./format";

type Totals = {
  rows: TotalsRow[];
  total: { applied: number; awarded: number; totalPossible: number; raised: number; qualified: number; distributed: number };
};

const MONEY = '"$"#,##0';
const GREEN = "FFD1E7DD"; // same light green as the page (--color-success-bg)
const HEAD_FILL = "FFF8F9FA";

/**
 * Builds the workbook: a title row with the as-of date and time, a blank row, then the
 * same columns, category rows and Total row as Grant Matching Totals. Amounts are real
 * numbers with dollar formatting; a category whose approved teams all raised the max gets
 * the light green fill on Total Team Fundraising, as on the page.
 */
export async function grantMatchingReport({ rows, total }: Totals, now = new Date(), askPeriod: string | null = null) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "FTC Illinois Grants";
  wb.created = now;
  const ws = wb.addWorksheet("Grant Matching Report", { views: [{ state: "frozen", ySplit: 3 }] });

  const headers = [
    "Rookie/Veteran Status",
    "Teams Applied",
    "Teams Awarded Grants",
    "Matching Multiplier",
    "Grantor Match per Team",
    "Total Possible Grant Amount",
    "Max Fundraising Target",
    `Total Team Fundraising as of ${shortDate(todayCentral(now))}`,
    "Qualified Grants from Fundraising",
    "Grants Distributed to Teams",
  ];
  const widths = [24, 10, 12, 12, 13, 15, 13, 17, 17, 15];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  ws.mergeCells(1, 1, 1, headers.length);
  const title = ws.getCell(1, 1);
  title.value = `Grant Matching Report${askPeriod ? ` - ${askPeriod}` : ""} - as of ${centralDateTime(now.toISOString())}`;
  title.font = { bold: true, size: 14 };

  const head = ws.getRow(3);
  head.values = headers;
  head.height = 45;
  head.eachCell((c) => {
    c.font = { bold: true };
    c.alignment = { horizontal: "center", vertical: "bottom", wrapText: true };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEAD_FILL } };
    c.border = { bottom: { style: "medium" } };
  });

  rows.forEach((r, i) => {
    const row = ws.getRow(4 + i);
    row.values = [
      r.category,
      r.applied,
      r.awarded,
      r.multiplier ? `1 to ${r.multiplier}` : "—",
      r.grantorMatch,
      r.totalPossible,
      r.maxFundraising,
      r.raised,
      r.qualified,
      r.distributed,
    ];
    row.eachCell((c, col) => {
      c.alignment = { horizontal: col === 1 ? "left" : "center" };
      if (col >= 5) c.numFmt = MONEY;
      c.border = { bottom: { style: "thin", color: { argb: "FFDEE2E6" } } };
    });
    if (r.maxedOut) row.getCell(8).fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } };
  });

  const foot = ws.getRow(4 + rows.length);
  foot.values = ["Total", total.applied, total.awarded, null, null, total.totalPossible, null, total.raised, total.qualified, total.distributed];
  for (let col = 1; col <= headers.length; col++) {
    const c = foot.getCell(col);
    c.font = { bold: true };
    c.alignment = { horizontal: col === 1 ? "left" : "center" };
    if (col >= 5) c.numFmt = MONEY;
    c.border = { top: { style: "medium" } };
  }

  return wb;
}

/** File name for a report generated on the given day, e.g. grant-matching-report-2026-10-20.xlsx. */
export function reportFileName(now = new Date()) {
  return `grant-matching-report-${todayCentral(now)}.xlsx`;
}
