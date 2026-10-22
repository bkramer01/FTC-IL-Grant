import { expect, test } from "vitest";
import { checkLayout, normalizeTable } from "@/lib/sheets";

test("rows are padded to the header width and blank rows dropped", () => {
  const t = normalizeTable([["Timestamp", "B", "C"], ["10/1/2026 9:00:00", "x"], [], ["", "orphan"], ["10/2/2026 9:00:00", "y", "z"]]);
  expect(t.rows).toEqual([
    ["10/1/2026 9:00:00", "x", ""],
    ["10/2/2026 9:00:00", "y", "z"],
  ]);
});

test("layout check names the column that moved", () => {
  const ok = { headers: ["TeamNumber", "TeamName", "Zip"], rows: [] };
  expect(() => checkLayout("biobuzz", ok)).not.toThrow();
  const moved = { headers: ["TeamName", "TeamNumber"], rows: [] };
  expect(() => checkLayout("biobuzz", moved)).toThrow(/column A should be "TeamNumber" but is "TeamName"/);
});

test("the grant form's key columns match today's sheet", () => {
  const headers = Array.from({ length: 19 }, (_, i) => `col${i}`);
  Object.assign(headers, { 0: "Timestamp", 4: "Team Number", 5: "Coach Name", 8: "IF yes- how much did your team receive as credit from FIRST Headquarters", 14: "Street Address", 15: "City State", 18: "Zip" });
  expect(() => checkLayout("responses", { headers, rows: [] })).not.toThrow();
});
