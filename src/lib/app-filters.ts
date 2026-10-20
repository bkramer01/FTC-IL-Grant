// The Show filter on the Applications page. Plain module so the server page can read it.
import type { Application } from "./applications";

export type AppFilter = "all" | "approved" | "underReview" | "notApproved" | "pending" | "notReviewed";
type FilterOption = { value: AppFilter; label: string };

/** The choices in the Show dropdown: everything, or one Grant Approved status. */
export const APP_FILTERS: FilterOption[] = [
  { value: "all", label: "All applications" },
  { value: "approved", label: "Grant Approved: Yes" },
  { value: "underReview", label: "Grant Approved: Under Review" },
  { value: "notApproved", label: "Grant Approved: No" },
  { value: "pending", label: "Grant Approved: Not reviewed" },
];

/**
 * Filters reached only from a link (`/applications?show=…`), not listed in the dropdown
 * unless active: the Dashboard's "not fully reviewed/complete" note uses notReviewed.
 */
export const LINK_FILTERS: FilterOption[] = [{ value: "notReviewed", label: "Not fully reviewed (Not reviewed or Under Review)" }];

export function findFilter(value: string | string[] | undefined): FilterOption | undefined {
  return [...APP_FILTERS, ...LINK_FILTERS].find((f) => f.value === value);
}

export function matchesFilter(a: Application, f: AppFilter) {
  switch (f) {
    case "approved":
      return a.review.approved === "Yes";
    case "underReview":
      return a.review.approved === "Under Review";
    case "notApproved":
      return a.review.approved === "No";
    case "pending":
      return a.review.approved === null;
    case "notReviewed":
      return a.review.approved === null || a.review.approved === "Under Review";
    default:
      return true;
  }
}
