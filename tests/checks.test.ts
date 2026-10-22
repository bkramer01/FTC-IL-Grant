import { expect, test } from "vitest";
import { buildApplications, EMPTY_REVIEW, effectiveCheckAmount, parseDollars, type GrantData, type Review } from "@/lib/applications";

test("form dollar amounts", () => {
  expect(["1500", "$2,000", " 800.00 ", "0", "none", "", "$"].map(parseDollars)).toEqual([1500, 2000, 800, 0, null, null, null]);
});

test("Amount of Check follows Possible Grant Award unless typed for it or mailed", () => {
  const r = (p: Partial<Review>) => ({ ...EMPTY_REVIEW, ...p });
  expect(effectiveCheckAmount(r({}), 1500, false)).toBe(1500);
  // Typed against the current award: stands. Award changed since: back to the award.
  expect(effectiveCheckAmount(r({ checkAmount: 1200, checkAmountFor: 1500 }), 1500, false)).toBe(1200);
  expect(effectiveCheckAmount(r({ checkAmount: 1200, checkAmountFor: 1500 }), 1800, false)).toBe(1800);
  // Mailed: the saved amount stands whatever the award does.
  expect(effectiveCheckAmount(r({ checkAmount: 1500, checkAmountFor: 1500 }), 1800, true)).toBe(1500);
  expect(effectiveCheckAmount(r({}), null, false)).toBeNull();
});

test("a non-numeric HQ grant amount shows as an error until Raised by Team is set", () => {
  const row = (ts: string, team: string, hq: string) => Object.assign(Array<string>(19).fill(""), { 0: ts, 4: team, 8: hq });
  const data = (reviews: GrantData["reviews"]): GrantData => ({
    responses: { headers: [], rows: [row("10/1/2026 9:00:00", "38467", "a lot"), row("10/2/2026 9:00:00", "38599", "")] },
    biobuzz: { headers: [], rows: [] },
    refreshedAt: null,
    reviews,
    emails: [],
    asks: [],
  });
  expect(buildApplications(data({})).map((a) => [a.raisedError, a.possibleAward])).toEqual([[true, null], [false, null]]);
  const typed = { "10/1/2026 9:00:00": { ...EMPTY_REVIEW, raised: 500, raisedSet: true } };
  expect(buildApplications(data(typed))[0].raisedError).toBe(false);
});
