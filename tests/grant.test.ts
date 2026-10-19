import { describe, expect, test } from "vitest";
import { buildApplications, computeTotals, parseTimestamp, type GrantData } from "@/lib/applications";
import { grantCategory, possibleAward, teamAge, unusedMatch } from "@/lib/grant";
import sample from "@/mock/sample-data.json";

const data = sample as GrantData;

describe("team age", () => {
  test.each([
    [35127, "Rookie"],
    [35126, "Second Year"],
    [25609, "Second Year"],
    [25608, "Veteran"],
    [3640, "Veteran"],
  ] as const)("%i is %s", (n, age) => expect(teamAge(n)).toBe(age));
});

describe("grant category", () => {
  test("combines age and Title 1", () => {
    expect(grantCategory("Rookie", "Yes")).toBe("Rookie 1 title 1");
    expect(grantCategory("Second Year", "No")).toBe("Second Year");
    expect(grantCategory("Veteran", "Yes")).toBe("Veteran Title 1");
    expect(grantCategory("Veteran", "No")).toBe("Not Qualified");
  });
  test("waits for Title 1 status", () => expect(grantCategory("Rookie", null)).toBe("Title 1 status needed"));
});

describe("possible award", () => {
  test("caps the amount raised, then applies the multiplier", () => {
    expect(possibleAward("Veteran Title 1", 250)).toBe(500);
    expect(possibleAward("Rookie 1 title 1", 5000)).toBe(3000);
    expect(possibleAward("Second Year Title 1", 350)).toBe(1050);
    expect(possibleAward("Not Qualified", 900)).toBe(0);
    expect(possibleAward("Rookie 1", null)).toBeNull();
  });
  test("unused match is possible award less amount raised", () => expect(unusedMatch(500, 250)).toBe(250));
});

test("parses Google Forms timestamps", () => {
  expect(parseTimestamp("10/2/2026 6:28:36")).toBe(Date.UTC(2026, 9, 2, 6, 28, 36));
});

describe("sample data", () => {
  const apps = buildApplications(data);

  test("looks up team names and flags duplicates", () => {
    expect(apps.find((a) => a.teamNumber === 8648)?.teamName).toBe("Manual High School RoboRams");
    expect(apps.find((a) => a.teamNumber === 99999)?.teamName).toBeNull();
    expect(apps.filter((a) => a.teamNumber === 38599).every((a) => a.duplicateCount === 2)).toBe(true);
  });

  test("totals match the Grant Totals mockup tab", () => {
    const { rows, total, title1Needed } = computeTotals(apps);
    const pick = (c: string) => {
      const r = rows.find((x) => x.category === c)!;
      return [r.applied, r.awarded, r.totalPossible, r.raised, r.qualified, r.distributed];
    };
    expect(pick("Rookie 1")).toEqual([4, 3, 4500, 3900, 3600, 900]);
    expect(pick("Rookie 1 title 1")).toEqual([3, 2, 6000, 1700, 5100, 3000]);
    expect(pick("Second Year")).toEqual([4, 3, 2250, 2050, 1900, 1500]);
    expect(pick("Second Year Title 1")).toEqual([3, 2, 3000, 850, 2550, 1050]);
    expect(pick("Veteran Title 1")).toEqual([10, 8, 9600, 4150, 7100, 2900]);
    expect(pick("Not Qualified")).toEqual([5, 0, 0, 0, 0, 0]);
    expect(total).toMatchObject({ applied: 29, awarded: 18, totalPossible: 25350, raised: 12650, qualified: 20250, distributed: 9350 });
    expect(title1Needed).toBe(1);
  });
});
