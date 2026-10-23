import { describe, expect, test } from "vitest";
import { askRows, buildApplications, computeTotals, parseTimestamp, type GrantData } from "@/lib/applications";
import { grantCategory, maxFundraisingTarget, maxGrantAward, multiplierLabel, possibleAward, teamAge, unusedMatch } from "@/lib/grant";
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
  test("multiplier label and max grant award per category", () => {
    expect([multiplierLabel("Veteran Title 1"), maxGrantAward("Veteran Title 1")]).toEqual(["1 to 2", 1200]);
    expect([multiplierLabel("Rookie 1 title 1"), maxGrantAward("Rookie 1 title 1")]).toEqual(["1 to 3", 3000]);
    expect([multiplierLabel("Not Qualified"), maxGrantAward("Not Qualified")]).toEqual(["—", 0]);
    expect([multiplierLabel("Title 1 status needed"), maxGrantAward("Title 1 status needed")]).toEqual(["—", null]);
    expect([maxFundraisingTarget("Veteran Title 1"), maxFundraisingTarget("Rookie 1 title 1"), maxFundraisingTarget("Title 1 status needed")]).toEqual([600, 1000, null]);
  });

  test("unused match is the grant still available, never negative", () => {
    expect(unusedMatch("Veteran Title 1", 500)).toBe(700); // $1,200 match, $250 raised
    expect(unusedMatch("Rookie 1", 1500)).toBe(0); // raised $1,800, past the $1,500 max
    expect(unusedMatch("Second Year Title 1", 1500)).toBe(0); // raised the $500 max
    expect(unusedMatch("Not Qualified", 0)).toBe(0);
    expect(unusedMatch("Title 1 status needed", null)).toBeNull();
  });
});

test("parses Google Forms timestamps", () => {
  expect(parseTimestamp("10/2/2026 6:28:36")).toBe(Date.UTC(2026, 9, 2, 6, 28, 36));
});

describe("sample data", () => {
  const apps = buildApplications(data);

  describe("ask periods", () => {
    const asks = [
      { id: 1, name: "Ask 1", start: "2026-09-01", end: "2026-10-20" },
      { id: 2, name: "Ask 2", start: "2026-10-21", end: "2026-11-20" },
      { id: 3, name: "Ask 3", start: null, end: null },
    ];
    // Assign the approved teams: the first two counted teams to Ask 1, the rest to Ask 2;
    // one unapproved application is also tagged (it counts as assigned, not in amounts).
    const approved = [...new Map(apps.filter((a) => a.review.approved === "Yes").map((a) => [a.teamNumber, a])).values()];
    const reviews = { ...data.reviews };
    approved.forEach((a, i) => (reviews[a.timestamp] = { ...a.review, askId: i < 2 ? 1 : 2 }));
    const unapproved = apps.find((a) => a.review.approved !== "Yes")!;
    reviews[unapproved.timestamp] = { ...unapproved.review, askId: 2 };
    const tagged = buildApplications({ ...data, reviews });

    test("each ask adds up its teams' Amount of Check; cumulative is a running total", () => {
      const all = computeTotals(tagged);
      const ask1 = computeTotals(tagged, 1);
      const ask2 = computeTotals(tagged, 2);
      const sumChecks = (f: number) =>
        [...new Map(tagged.filter((a) => a.review.approved === "Yes" && a.review.askId === f).map((a) => [a.teamNumber, a])).values()]
          .reduce((s, a) => s + (a.checkAmount ?? 0), 0);
      const { rows, total } = askRows(asks, tagged);
      expect(rows.map((r) => [r.name, r.amount, r.cumulative])).toEqual([
        ["Ask 1", sumChecks(1), sumChecks(1)],
        ["Ask 2", sumChecks(2), sumChecks(1) + sumChecks(2)],
        ["Ask 3", 0, sumChecks(1) + sumChecks(2)],
      ]);
      expect(total).toBe(sumChecks(1) + sumChecks(2));
      expect(rows.map((r) => r.assigned)).toEqual([2, approved.length - 2 + 1, 0]);
      // The filter splits the awarded teams; Teams Applied ignores it.
      expect(ask1.total.awarded + ask2.total.awarded).toBe(all.total.awarded);
      expect(ask1.total.applied).toBe(all.total.applied);
      expect(computeTotals(tagged, "unassigned").total.awarded).toBe(0);
      expect(computeTotals(apps, "unassigned").total).toEqual(computeTotals(apps).total);
    });
  });

  test("reads City State and Zip separately", () => {
    // Sample-only row: zip moved out of City State into Zip.
    const sample = apps.find((a) => a.teamNumber === 99999)!;
    expect([sample.cityState, sample.zip]).toEqual(["Springfield, IL", "62701"]);
    // Real response from before the form gained a Zip column: shown as entered, Zip blank.
    const real = apps.find((a) => a.teamNumber === 8648)!;
    expect([real.cityState, real.zip]).toEqual(["Peoria, IL 61601", ""]);
  });

  test("looks up team names and flags duplicates", () => {
    expect(apps.find((a) => a.teamNumber === 8648)?.teamName).toBe("Manual High School RoboRams");
    expect(apps.find((a) => a.teamNumber === 99999)?.teamName).toBeNull();
    expect(apps.filter((a) => a.teamNumber === 38599).every((a) => a.duplicateCount === 2)).toBe(true);
  });

  // Matches the spreadsheet's Grant Totals mockup tab, except: team 26463 (Second Year Title 1) now
  // shows $500 raised instead of $350, and the 5 responses added from the Google Sheet on Oct 19
  // have no Title 1 status yet, and Teams Applied now counts every application (two Rookie 1 title 1
  // teams applied twice, so 4 there). Grants distributed count only mailed checks (Check # and
  // Date Check Mailed filled in); every sample check was mailed.
  test("totals match the Grant Totals mockup tab", () => {
    const { rows, total, title1Needed } = computeTotals(apps);
    const pick = (c: string) => {
      const r = rows.find((x) => x.category === c)!;
      return [r.applied, r.awarded, r.totalPossible, r.raised, r.qualified, r.distributed];
    };
    expect(pick("Rookie 1")).toEqual([4, 3, 4500, 3900, 3600, 900]);
    expect(pick("Rookie 1 title 1")).toEqual([4, 2, 6000, 1700, 5100, 3000]);
    expect(pick("Second Year")).toEqual([4, 3, 2250, 2050, 1900, 1500]);
    expect(pick("Second Year Title 1")).toEqual([3, 2, 3000, 1000, 3000, 1050]);
    expect(pick("Veteran Title 1")).toEqual([10, 8, 9600, 4150, 7100, 2900]);
    expect(pick("Not Qualified")).toEqual([5, 0, 0, 0, 0, 0]);
    expect(total).toMatchObject({ applied: 30, awarded: 18, totalPossible: 25350, raised: 12800, qualified: 20700, distributed: 9350 });
    expect(title1Needed).toBe(6);
  });

  test("flags a category only when every awarded team raised the max", () => {
    const maxed = computeTotals(apps).rows.filter((r) => r.maxedOut).map((r) => r.category);
    // Second Year Title 1: both approved teams raised $500. Not Qualified has no awards.
    expect(maxed).toEqual(["Second Year Title 1"]);
  });
});
