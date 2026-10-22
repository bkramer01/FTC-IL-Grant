"use client";

import { useMemo, useRef, useState } from "react";
import { HeaderScrollbar } from "@/components/HeaderScrollbar";
import { ChoiceSelect, FileLink, HqAmountError, MoneyInput, YesNoBadge, YesNoSelect } from "@/components/inputs";
import { Alert, Card, ManualKey } from "@/components/SiteChrome";
import { SaveStatus, useSaver } from "@/components/useSaver";
import { compareValues, nextSort, SortHeader, type Sort } from "@/components/SortHeader";
import { APP_FILTERS, LINK_FILTERS, matchesFilter, type AppFilter } from "@/lib/app-filters";
import {
  APPROVAL_OPTIONS,
  buildApplications,
  EMPTY_REVIEW,
  VRS_OPTIONS,
  type Application,
  type GrantData,
  type Review,
} from "@/lib/applications";
import { applicationsCsv, downloadCsv } from "@/lib/export";
import { formDate, formDateTime, money, shortDate, todayCentral } from "@/lib/format";
import { TITLE1_NEEDED, type TeamAge } from "@/lib/grant";
import { saveReviewAction } from "../actions";

/** The team age the coach picked on the form, if it names one. */
function ageFromForm(provided: string): TeamAge | null {
  const v = provided.toLowerCase();
  if (v.includes("rookie")) return "Rookie";
  if (v.includes("second")) return "Second Year";
  if (v.includes("veteran")) return "Veteran";
  return null;
}

type SortKey = "timestamp" | "team" | "age" | "approved";

const AGE_ORDER: Record<TeamAge, number> = { Rookie: 0, "Second Year": 1, Veteran: 2 };
const APPROVED_ORDER = { Yes: 0, "Under Review": 1, No: 2 } as const;

function sortValue(a: Application, key: SortKey): number {
  switch (key) {
    case "team":
      return a.teamNumber;
    case "age":
      return AGE_ORDER[a.age];
    case "approved":
      // Not reviewed (blank) comes after No.
      return a.review.approved ? APPROVED_ORDER[a.review.approved] : 3;
    default:
      return a.submittedAt;
  }
}

/** Downloads every application, including unsaved edits on the page, as a CSV file. */
function exportCsv(apps: Application[]) {
  downloadCsv(`grant-applications-${todayCentral()}.csv`, applicationsCsv(apps));
}

export function ApplicationsTable({ data, initialFilter }: { data: GrantData; initialFilter: AppFilter }) {
  const [reviews, setReviews] = useState(data.reviews);
  const [filter, setFilter] = useState<AppFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Newest first until a heading is clicked.
  const [sort, setSort] = useState<Sort<SortKey>>({ key: "timestamp", dir: -1 });
  const apps = useMemo(() => buildApplications({ ...data, reviews }), [data, reviews]);

  const saver = useSaver();

  function update(timestamp: string, patch: Partial<Review>) {
    setReviews((r) => ({ ...r, [timestamp]: { ...(r[timestamp] ?? EMPTY_REVIEW), ...patch } }));
    saver.queue(`${timestamp}:${Object.keys(patch).sort().join(",")}`, () => saveReviewAction(timestamp, patch));
  }

  const q = search.trim().toLowerCase();
  // Grant Approved answers across all applications (search and filter don't change these).
  const counts = { approved: 0, rejected: 0, notReviewed: 0, underReview: 0 };
  for (const a of apps) {
    if (a.review.approved === "Yes") counts.approved++;
    else if (a.review.approved === "No") counts.rejected++;
    else if (a.review.approved === "Under Review") counts.underReview++;
    else counts.notReviewed++;
  }

  const shown = apps
    .filter((a) => matchesFilter(a, filter))
    .filter((a) => !q || `${a.teamNumber} ${a.teamName ?? ""} ${a.coach}`.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        compareValues(sortValue(a, sort.key), sortValue(b, sort.key), sort.dir) || b.submittedAt - a.submittedAt,
    );

  function onSort(key: SortKey) {
    setSort((s) => nextSort(s, key));
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl">Grant Application Status</h1>
        <SaveStatus state={saver.state} />
      </div>

      <Card
        title="Applications"
        actions={
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="sr-only" htmlFor="app-search">
              Search
            </label>
            <input
              id="app-search"
              type="search"
              placeholder="Team #, name or coach"
              className="form-control !w-56 !py-1 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="sr-only" htmlFor="app-filter">
              Show
            </label>
            <select
              id="app-filter"
              className="form-control !w-56 !py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as AppFilter)}
            >
              {[...APP_FILTERS, ...LINK_FILTERS.filter((f) => f.value === filter)].map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => exportCsv(apps)}
              title="Download every application (all rows, ignoring search and filter) as a CSV file for Excel"
            >
              ⤓ Export
            </button>
          </div>
        }
      >
        <ManualKey />
        <Alert tone="warning" compact>
          <strong>Total applications</strong> = {apps.length} · <strong>Grants approved</strong> = {counts.approved} · <strong>Rejected</strong> = {counts.rejected} ·{" "}
          <strong>Not reviewed</strong> = {counts.notReviewed} · <strong>Under review</strong> = {counts.underReview}
        </Alert>
        <div className="max-h-[calc(100vh-7rem)] overflow-auto" ref={scrollerRef}>
          <table className="data-table sticky-head">
            <thead>
              <tr>
                <SortHeader label="Team #" sortKey="team" sort={sort} onSort={onSort} className="freeze" />
                <th>Team Name</th>
                <th>Coach Name</th>
                <th>
                  Rookie/Veteran
                  <br />
                  Status Provided
                </th>
                <SortHeader
                  label={
                    <>
                      Calculated
                      <br />
                      Team Age <span className="text-muted">ⓘ</span>
                    </>
                  }
                  title="Checks the team age calculated by team number against what is reported on the grant form."
                  sortKey="age"
                  sort={sort}
                  onSort={onSort}
                />
                <th className="manual">
                  Raised by
                  <br />
                  Team
                </th>
                <th className="num">
                  Possible
                  <br />
                  Grant Award
                </th>
                <th>
                  Rookie/Veteran
                  <br />
                  Status for Grant
                </th>
                <th className="manual yn">School Title 1 Status</th>
                <th className="manual yn">Fundraising Letter Rec&apos;d</th>
                <th>List of Volunteers</th>
                <th>
                  Fully Registered?
                  <br />
                  (from Team)
                </th>
                <th>
                  End of Season
                  <br />
                  Survey Completed?
                </th>
                <th className="manual yn">VRS Task Completed</th>
                <th>
                  Add&apos;l Info
                  <br />
                  Email Sent
                </th>
                <SortHeader label="Grant Approved" sortKey="approved" sort={sort} onSort={onSort} className="manual yn" />
                <th className="manual">Review Notes</th>
                <SortHeader label="Timestamp" sortKey="timestamp" sort={sort} onSort={onSort} />
              </tr>
              <HeaderScrollbar scrollerRef={scrollerRef} colSpan={18} />
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={18} className="text-muted">
                    No applications match.
                  </td>
                </tr>
              )}
              {shown.map((a) => {
                const formAge = ageFromForm(a.categoryProvided);
                return (
                  <tr key={a.timestamp}>
                    <td className="freeze whitespace-nowrap">
                      {a.teamNumber}
                      {a.duplicateCount > 1 && (
                        <span className="badge badge-warning ml-1" title="This team sent the grant form more than once">
                          Dup ×{a.duplicateCount}
                        </span>
                      )}
                    </td>
                    <td className="min-w-36">{a.teamName ?? <span className="badge badge-danger" title="Team number not found in the BioBuzz team list">not found</span>}</td>
                    <td className="min-w-32">
                      {a.coach}
                      <div className="text-xs">
                        <a href={`mailto:${a.email}`}>{a.email}</a>
                      </div>
                    </td>
                    <td className="min-w-52">{a.categoryProvided}</td>
                    <td className="whitespace-nowrap">
                      {a.age}
                      {formAge && formAge !== a.age && (
                        <div>
                          <span className="badge badge-warning" title="The form answer doesn't match the team number">
                            form says {formAge}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="w-28">
                      <MoneyInput
                        label={`Amount raised by team ${a.teamNumber}`}
                        value={a.review.raised}
                        onChange={(v) => update(a.timestamp, { raised: v, raisedUpdatedOn: todayCentral(), raisedSet: true })}
                      />
                      {a.raisedError && (
                        <div className="mt-1">
                          <HqAmountError value={a.hqAmount} />
                        </div>
                      )}
                    </td>
                    <td className="num">{money(a.possibleAward)}</td>
                    <td className="whitespace-nowrap">
                      {a.category === TITLE1_NEEDED ? <span className="badge badge-warning">{a.category}</span> : a.category}
                    </td>
                    <td>
                      <YesNoSelect
                        label={`School Title 1 status for team ${a.teamNumber}`}
                        value={a.review.title1}
                        onChange={(v) => update(a.timestamp, { title1: v })}
                      />
                    </td>
                    <td>
                      <YesNoSelect
                        label={`Fundraising letter received from team ${a.teamNumber}`}
                        value={a.review.letterReceived}
                        onChange={(v) => update(a.timestamp, { letterReceived: v })}
                      />
                      <div className="mt-1 text-xs">
                        <FileLink href={a.letterUrl}>Letter</FileLink>
                      </div>
                    </td>
                    <td className="w-48 min-w-48 [overflow-wrap:anywhere]">{a.volunteers}</td>
                    <td>
                      <YesNoBadge value={a.fullyRegistered} />
                    </td>
                    <td>
                      <YesNoBadge value={a.surveyCompleted} />
                    </td>
                    <td>
                      <ChoiceSelect
                        options={VRS_OPTIONS}
                        width="6.75rem"
                        label={`VRS challenge completed by team ${a.teamNumber}`}
                        value={a.review.vrsCompleted}
                        onChange={(v) => update(a.timestamp, { vrsCompleted: v })}
                      />
                      <div className="mt-1 text-xs">
                        <FileLink href={a.vrsUrl}>Screenshot</FileLink>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{shortDate(a.additionalInfoEmailOn)}</td>
                    <td>
                      <ChoiceSelect
                        options={APPROVAL_OPTIONS}
                        blankLabel="Not reviewed"
                        width="7.25rem"
                        label={`Team ${a.teamNumber} approved for grant`}
                        value={a.review.approved}
                        onChange={(v) => update(a.timestamp, { approved: v })}
                      />
                    </td>
                    <td className="min-w-56">
                      <textarea
                        aria-label={`Review notes for team ${a.teamNumber}`}
                        rows={2}
                        className="cell-input"
                        value={a.review.notes}
                        onChange={(e) => update(a.timestamp, { notes: e.target.value })}
                      />
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="cursor-help" title={formDateTime(a.submittedAt)}>
                        {formDate(a.submittedAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "row" : "rows"}
        </p>
      </Card>
    </>
  );
}
