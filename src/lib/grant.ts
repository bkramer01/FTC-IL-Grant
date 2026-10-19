// Grant rules for the 2026-27 season (Goals tab of FTC IL Grant Status.xlsx).

export type TeamAge = "Rookie" | "Second Year" | "Veteran";
export type YesNo = "Yes" | "No";

export const QUALIFYING_CATEGORIES = [
  "Rookie 1",
  "Rookie 1 title 1",
  "Second Year",
  "Second Year Title 1",
  "Veteran Title 1",
] as const;
export const NOT_QUALIFIED = "Not Qualified";
export const TITLE1_NEEDED = "Title 1 status needed";

export type QualifyingCategory = (typeof QUALIFYING_CATEGORIES)[number];
export type TotalsCategory = QualifyingCategory | typeof NOT_QUALIFIED;
export type GrantCategory = TotalsCategory | typeof TITLE1_NEEDED;

export const TOTALS_CATEGORIES: TotalsCategory[] = [...QUALIFYING_CATEGORIES, NOT_QUALIFIED];

/** Team numbers are issued in order, so lower numbers are older teams. */
export const AGE_CUTOFFS = { rookieFrom: 35127, secondYearFrom: 25609 };

/** Grantor match = max fundraising matched × multiplier. */
export const CATEGORY_RULES: Record<TotalsCategory, { multiplier: number; maxFundraising: number }> = {
  "Rookie 1": { multiplier: 1, maxFundraising: 1500 },
  "Rookie 1 title 1": { multiplier: 3, maxFundraising: 1000 },
  "Second Year": { multiplier: 1, maxFundraising: 750 },
  "Second Year Title 1": { multiplier: 3, maxFundraising: 500 },
  "Veteran Title 1": { multiplier: 2, maxFundraising: 600 },
  "Not Qualified": { multiplier: 0, maxFundraising: 0 },
};

export function grantorMatch(category: TotalsCategory) {
  const r = CATEGORY_RULES[category];
  return r.multiplier * r.maxFundraising;
}

export function teamAge(teamNumber: number): TeamAge {
  if (teamNumber >= AGE_CUTOFFS.rookieFrom) return "Rookie";
  if (teamNumber >= AGE_CUTOFFS.secondYearFrom) return "Second Year";
  return "Veteran";
}

const CATEGORY_BY_AGE: Record<TeamAge, Record<YesNo, TotalsCategory>> = {
  Rookie: { Yes: "Rookie 1 title 1", No: "Rookie 1" },
  "Second Year": { Yes: "Second Year Title 1", No: "Second Year" },
  Veteran: { Yes: "Veteran Title 1", No: "Not Qualified" },
};

export function grantCategory(age: TeamAge, title1: YesNo | null): GrantCategory {
  return title1 ? CATEGORY_BY_AGE[age][title1] : TITLE1_NEEDED;
}

/** Amount raised, capped at the category's max fundraising, times its multiplier. */
export function possibleAward(category: GrantCategory, raised: number | null): number | null {
  if (raised === null || category === TITLE1_NEEDED) return null;
  const r = CATEGORY_RULES[category];
  return Math.min(raised, r.maxFundraising) * r.multiplier;
}

/** Possible grant less how much the team raised (Goals tab, Fundraising Status). */
export function unusedMatch(possible: number | null, raised: number | null): number | null {
  return possible === null || raised === null ? null : possible - raised;
}
