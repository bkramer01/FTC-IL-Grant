import { expect, test } from "vitest";
import { buildApplications, checkStatus, duplicateCheckNumbers, EMPTY_REVIEW, effectiveCheckAmount, parseDollars, type Application, type GrantData, type Review } from "@/lib/applications";

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

test("Check Status is blank until all four check fields are filled in, then Sent or Paid", () => {
  const full: Partial<Review> = { checkNumber: "1001", checkMailedOn: "2026-10-29", askId: 1, approved: "Yes" };
  const r = (p: Partial<Review>) => ({ ...EMPTY_REVIEW, ...full, ...p });
  expect(checkStatus(r({}), 500)).toBe("Sent");
  expect(checkStatus(r({ checkPaid: true }), 500)).toBe("Paid");
  // Any one of the four missing: blank, even if Paid was picked earlier.
  expect(checkStatus(r({ checkNumber: null }), 500)).toBeNull();
  expect(checkStatus(r({ checkNumber: " " }), 500)).toBeNull();
  expect(checkStatus(r({ checkMailedOn: null, checkPaid: true }), 500)).toBeNull();
  expect(checkStatus(r({ askId: null, checkPaid: true }), 500)).toBeNull();
  expect(checkStatus(r({}), null)).toBeNull();
  expect(checkStatus(r({}), 0)).toBeNull();
  // An unapproved team's saved Ask Period doesn't count.
  expect(checkStatus(r({ approved: "No" }), 500)).toBeNull();
  expect(checkStatus(r({ approved: null }), 500)).toBeNull();
});

test("duplicate check numbers are found across applications", () => {
  const app = (timestamp: string, checkNumber: string | null) => ({ timestamp, review: { ...EMPTY_REVIEW, checkNumber } }) as Application;
  const apps = [app("a", "100"), app("b", " 100 "), app("c", "200"), app("d", null), app("e", null)];
  const dups = duplicateCheckNumbers(apps);
  expect([...dups.keys()]).toEqual(["100"]);
  expect(dups.get("100")!.map((a) => a.timestamp)).toEqual(["a", "b"]);
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
