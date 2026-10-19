// Turns the two Google Sheets (form responses + BioBuzz team list) and the Grant
// Administrator's entries into application rows, and summarizes them by category.
import {
  CATEGORY_RULES,
  grantCategory,
  grantorMatch,
  possibleAward,
  teamAge,
  TITLE1_NEEDED,
  TOTALS_CATEGORIES,
  unusedMatch,
  type GrantCategory,
  type TeamAge,
  type TotalsCategory,
  type YesNo,
} from "./grant";

export type SheetTable = { headers: string[]; rows: string[][] };

/** Everything the Grant Administrator fills in for one application (keyed by its timestamp). */
export type Review = {
  title1: YesNo | null;
  letterReceived: YesNo | null;
  volunteering: YesNo | null;
  qualifiedPurchase: YesNo | null;
  vrsCompleted: YesNo | null;
  approved: YesNo | null;
  notes: string;
  raised: number | null;
  raisedUpdatedOn: string | null;
  checkAmount: number | null;
  checkNumber: string | null;
  checkMailedOn: string | null;
};

export const EMAIL_PURPOSES = ["Additional Info Needed", "Grant Award", "Other"] as const;
export type EmailPurpose = (typeof EMAIL_PURPOSES)[number];
export type EmailEntry = { date: string; teamNumber: number; recipient: string; purpose: string; notes: string };

export type GrantData = {
  refreshedAt: string;
  responses: SheetTable;
  biobuzz: SheetTable;
  reviews: Record<string, Review>;
  emails: EmailEntry[];
};

export const EMPTY_REVIEW: Review = {
  title1: null,
  letterReceived: null,
  volunteering: null,
  qualifiedPurchase: null,
  vrsCompleted: null,
  approved: null,
  notes: "",
  raised: null,
  raisedUpdatedOn: null,
  checkAmount: null,
  checkNumber: null,
  checkMailedOn: null,
};

// Form Responses 1 columns (A = 0).
const COL = {
  timestamp: 0,
  email: 1,
  survey: 2,
  inGreen: 3,
  teamNumber: 4,
  coach: 5,
  categoryProvided: 6,
  volunteers: 10,
  letterUrl: 11,
  checkPayee: 12,
  street: 14,
  cityStateZip: 15,
  vrsUrl: 16,
};

export type Application = {
  timestamp: string;
  submittedAt: number;
  email: string;
  teamNumber: number;
  teamName: string | null;
  coach: string;
  categoryProvided: string;
  age: TeamAge;
  category: GrantCategory;
  volunteers: string;
  fullyRegistered: string;
  surveyCompleted: string;
  letterUrl: string;
  vrsUrl: string;
  checkPayee: string;
  street: string;
  cityStateZip: string;
  duplicateCount: number;
  additionalInfoEmailOn: string | null;
  awardEmailOn: string | null;
  possibleAward: number | null;
  unusedMatch: number | null;
  review: Review;
};

/** Parses a Google Forms timestamp such as "10/2/2026 6:28:36" (Central time). */
export function parseTimestamp(ts: string): number {
  const m = ts.match(/^(\d+)\/(\d+)\/(\d{4}) (\d+):(\d+):(\d+)$/);
  if (!m) return 0;
  const [, mo, d, y, h, mi, s] = m.map(Number);
  return Date.UTC(y, mo - 1, d, h, mi, s);
}

function yesNoAnswer(raw: string) {
  const v = raw.trim().toLowerCase();
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  return raw.trim();
}

function surveyAnswer(raw: string) {
  return raw.trim().toLowerCase() === "rookie biobuzz" ? "N/A (rookie)" : yesNoAnswer(raw);
}

function latestEmail(emails: EmailEntry[], teamNumber: number, purpose: EmailPurpose) {
  let latest: string | null = null;
  for (const e of emails) {
    if (e.teamNumber === teamNumber && e.purpose === purpose && (!latest || e.date > latest)) latest = e.date;
  }
  return latest;
}

export function buildApplications(data: GrantData): Application[] {
  const teamNames = new Map(data.biobuzz.rows.map((r) => [r[0].trim(), r[1].trim()]));
  const counts = new Map<number, number>();
  for (const r of data.responses.rows) {
    const n = Number(r[COL.teamNumber]);
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  return data.responses.rows.map((r) => {
    const teamNumber = Number(r[COL.teamNumber]);
    const review = data.reviews[r[COL.timestamp]] ?? EMPTY_REVIEW;
    const age = teamAge(teamNumber);
    const category = grantCategory(age, review.title1);
    const possible = possibleAward(category, review.raised);
    return {
      timestamp: r[COL.timestamp],
      submittedAt: parseTimestamp(r[COL.timestamp]),
      email: r[COL.email],
      teamNumber,
      teamName: teamNames.get(String(teamNumber)) || null,
      coach: r[COL.coach],
      categoryProvided: r[COL.categoryProvided],
      age,
      category,
      volunteers: r[COL.volunteers],
      fullyRegistered: yesNoAnswer(r[COL.inGreen]),
      surveyCompleted: surveyAnswer(r[COL.survey]),
      letterUrl: r[COL.letterUrl],
      vrsUrl: r[COL.vrsUrl],
      checkPayee: r[COL.checkPayee],
      street: r[COL.street],
      cityStateZip: r[COL.cityStateZip],
      duplicateCount: counts.get(teamNumber) ?? 1,
      additionalInfoEmailOn: latestEmail(data.emails, teamNumber, "Additional Info Needed"),
      awardEmailOn: latestEmail(data.emails, teamNumber, "Grant Award"),
      possibleAward: possible,
      unusedMatch: unusedMatch(possible, review.raised),
      review,
    };
  });
}

export type TotalsRow = {
  category: TotalsCategory;
  applied: number;
  awarded: number;
  multiplier: number;
  grantorMatch: number;
  totalPossible: number;
  maxFundraising: number;
  raised: number;
  qualified: number;
  distributed: number;
};

/**
 * One row per category. Each team counts once: its latest approved application if it
 * has one, otherwise its latest application. Applied counts every team; the other
 * columns count only approved teams. Teams still missing a Title 1 status are left
 * out and reported in `title1Needed`.
 */
export function computeTotals(apps: Application[]) {
  const byTeam = new Map<number, Application>();
  for (const a of apps) {
    const cur = byTeam.get(a.teamNumber);
    const aApproved = a.review.approved === "Yes";
    const curApproved = cur?.review.approved === "Yes";
    if (!cur || (aApproved && !curApproved) || (aApproved === curApproved && a.submittedAt > cur.submittedAt)) {
      byTeam.set(a.teamNumber, a);
    }
  }
  const rows: TotalsRow[] = TOTALS_CATEGORIES.map((category) => ({
    category,
    applied: 0,
    awarded: 0,
    multiplier: CATEGORY_RULES[category].multiplier,
    grantorMatch: grantorMatch(category),
    totalPossible: 0,
    maxFundraising: CATEGORY_RULES[category].maxFundraising,
    raised: 0,
    qualified: 0,
    distributed: 0,
  }));
  let title1Needed = 0;
  for (const a of byTeam.values()) {
    if (a.category === TITLE1_NEEDED) {
      title1Needed++;
      continue;
    }
    const row = rows.find((r) => r.category === a.category)!;
    row.applied++;
    if (a.review.approved !== "Yes") continue;
    row.awarded++;
    row.raised += a.review.raised ?? 0;
    row.qualified += a.possibleAward ?? 0;
    row.distributed += a.review.checkAmount ?? 0;
  }
  for (const row of rows) row.totalPossible = row.awarded * row.grantorMatch;
  const total = {
    applied: sum(rows, "applied"),
    awarded: sum(rows, "awarded"),
    totalPossible: sum(rows, "totalPossible"),
    raised: sum(rows, "raised"),
    qualified: sum(rows, "qualified"),
    distributed: sum(rows, "distributed"),
  };
  return { rows, total, title1Needed };
}

function sum(rows: TotalsRow[], key: keyof TotalsRow) {
  return rows.reduce((n, r) => n + (r[key] as number), 0);
}
