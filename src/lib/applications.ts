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

export const APPROVAL_OPTIONS = ["Yes", "Under Review", "No"] as const;
export type Approval = (typeof APPROVAL_OPTIONS)[number];
export const VRS_OPTIONS = ["Yes", "In Progress", "No"] as const;
export type VrsStatus = (typeof VRS_OPTIONS)[number];

/** Everything the Grant Administrator fills in for one application (keyed by its timestamp). */
export type Review = {
  title1: YesNo | null;
  letterReceived: YesNo | null;
  volunteering: YesNo | null;
  qualifiedPurchase: YesNo | null;
  vrsCompleted: VrsStatus | null;
  approved: Approval | null;
  notes: string;
  raised: number | null;
  raisedUpdatedOn: string | null;
  /** True once Raised by Team was copied from the form or typed in; refreshes then leave it alone. */
  raisedSet: boolean;
  /** A typed Amount of Check (blank: the check follows Possible Grant Award). */
  checkAmount: number | null;
  /** The Possible Grant Award when checkAmount was typed; the typed amount lapses once that changes. */
  checkAmountFor: number | null;
  checkNumber: string | null;
  checkMailedOn: string | null;
};

export const EMAIL_PURPOSES = ["Additional Info Needed", "Grant Award", "Other"] as const;
export type EmailPurpose = (typeof EMAIL_PURPOSES)[number];
/** Shorter wording shown in the Email purpose dropdown; the saved purpose keeps the full name. */
export const EMAIL_PURPOSE_LABELS: Record<EmailPurpose, string> = {
  "Additional Info Needed": "Add'l Info Needed",
  "Grant Award": "Grant Award",
  Other: "Other",
};
/** One logged email. `id` is the database row (absent only in the bundled sample data). */
export type EmailEntry = { id?: number; date: string; teamNumber: number; recipient: string; purpose: string; notes: string };

/**
 * One request for money from the Donor Fund (Grant Ask Tracker). All fields are typed by the
 * Grant Administrator; dates are "YYYY-MM-DD".
 */
export type GrantAsk = {
  /** Database row; absent only in the bundled sample data. */
  id?: number;
  name: string;
  start: string | null;
  end: string | null;
  /** Cumulative Qualified Grants from Fundraising as of the ask's end date. */
  cumulative: number | null;
  /** Total ask amount from the Donor Fund. */
  ask: number | null;
};

export type GrantData = {
  /** When Refresh Data last read the Google Sheets; null before the first refresh. */
  refreshedAt: string | null;
  responses: SheetTable;
  biobuzz: SheetTable;
  reviews: Record<string, Review>;
  emails: EmailEntry[];
  asks: GrantAsk[];
};

/**
 * Total row of the Grant Ask Tracker: the latest ask's cumulative amount (the last row that
 * has one) and the sum of all asks for the year.
 */
export function askTotals(asks: GrantAsk[]) {
  let cumulative: number | null = null;
  let ask = 0;
  for (const a of asks) {
    if (a.cumulative !== null) cumulative = a.cumulative;
    ask += a.ask ?? 0;
  }
  return { cumulative, ask };
}

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
  raisedSet: false,
  checkAmount: null,
  checkAmountFor: null,
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
  hqAmount: 8, // "IF yes- how much did your team receive as credit from FIRST Headquarters…"
  volunteers: 10,
  letterUrl: 11,
  checkPayee: 12,
  street: 14,
  cityState: 15,
  vrsUrl: 16,
  zip: 18, // added to the form Oct 2026, after the VRS columns
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
  cityState: string;
  zip: string;
  duplicateCount: number;
  additionalInfoEmailOn: string | null;
  awardEmailOn: string | null;
  possibleAward: number | null;
  unusedMatch: number | null;
  /** The form's HQ grant amount as typed (Raised by Team starts from it). */
  hqAmount: string;
  /** Raised by Team hasn't been set and the form's HQ grant amount isn't a number. */
  raisedError: boolean;
  /** Check # and Date Check Mailed are both filled in, so Amount of Check can't be changed. */
  checkLocked: boolean;
  /** Amount of Check: the typed amount while it still applies, otherwise Possible Grant Award. */
  checkAmount: number | null;
  review: Review;
};

/** Whole dollars from a form answer such as "1500", "$2,000" or "800.00"; null if it isn't a number. */
export function parseDollars(raw: string): number | null {
  const v = raw.replace(/[$,\s]/g, "");
  return /^\d+(\.\d+)?$/.test(v) ? Math.round(Number(v)) : null;
}

/** The form's HQ grant amount for one response row: a number, blank (null) or "error". */
export function hqAmountFromRow(row: string[]): number | null | "error" {
  const raw = (row[COL.hqAmount] ?? "").trim();
  if (!raw) return null;
  return parseDollars(raw) ?? "error";
}

export function responseTimestamp(row: string[]): string {
  return row[COL.timestamp];
}

/**
 * Amount of Check: once mailed (Check # and date filled in) the saved amount stands; a typed
 * amount stands while Possible Grant Award is what it was when typed; otherwise the check is
 * the Possible Grant Award.
 */
export function effectiveCheckAmount(review: Review, possible: number | null, locked: boolean): number | null {
  if (review.checkAmount !== null && (locked || review.checkAmountFor === possible)) return review.checkAmount;
  return possible;
}

export function isCheckLocked(review: Pick<Review, "checkNumber" | "checkMailedOn">): boolean {
  return !!review.checkNumber?.trim() && !!review.checkMailedOn;
}

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
    const locked = isCheckLocked(review);
    const hq = hqAmountFromRow(r);
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
      cityState: r[COL.cityState],
      zip: r[COL.zip] ?? "",
      duplicateCount: counts.get(teamNumber) ?? 1,
      additionalInfoEmailOn: latestEmail(data.emails, teamNumber, "Additional Info Needed"),
      awardEmailOn: latestEmail(data.emails, teamNumber, "Grant Award"),
      possibleAward: possible,
      unusedMatch: unusedMatch(category, possible),
      hqAmount: (r[COL.hqAmount] ?? "").trim(),
      raisedError: !review.raisedSet && review.raised === null && hq === "error",
      checkLocked: locked,
      checkAmount: effectiveCheckAmount(review, possible, locked),
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
  /** Every awarded team raised at least the max fundraising target (so Qualified = Total Possible). */
  maxedOut: boolean;
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
    maxedOut: false,
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
    // Only checks that went out (Check # and Date Check Mailed filled in).
    if (a.checkLocked) row.distributed += a.checkAmount ?? 0;
  }
  for (const row of rows) {
    row.totalPossible = row.awarded * row.grantorMatch;
    // Each team's qualified grant is capped at the grantor match, so the sum only reaches
    // Total Possible when every awarded team raised the max.
    row.maxedOut = row.awarded > 0 && row.grantorMatch > 0 && row.qualified >= row.totalPossible;
  }
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
