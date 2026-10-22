import { describe, expect, test } from "vitest";
import { buildApplications, type GrantData } from "@/lib/applications";
import { applicationsCsv, csvField, fundraisingCsv } from "@/lib/export";
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
  const lines = fundraisingCsv(approved).trimEnd().split("\r\n");
  expect(lines[0]).toBe(
    "Team #,Team Name,Coach Name,Approved,Rookie/Veteran Status,Matching Multiplier,Max Grant Award,Team Target,Raised by Team,Possible Grant Award,Unused Grant Match," +
      "Last Update,Check Addressee,Street Address,\"City, State\",Zip,Amount of Check,Check #,Date Check Mailed,Grant Award Email Sent",
  );
  expect(lines).toHaveLength(approved.length + 1);
  const team3640 = lines.find((l) => l.startsWith("3640,"));
  expect(team3640).toContain(",Veteran Title 1,1 to 2,1200,600,250,500,700,");
  expect(team3640).toContain(",500,3345,");
});
