"use client";

import { useMemo, useRef, useState } from "react";
import { HeaderScrollbar } from "@/components/HeaderScrollbar";
import { FileLink, YesNoBadge, YesNoSelect } from "@/components/inputs";
import { Card, ManualKey } from "@/components/SiteChrome";
import { buildApplications, type Application, type GrantData, type Review } from "@/lib/applications";
import { formDate, formDateTime, shortDate } from "@/lib/format";
import { TITLE1_NEEDED, type TeamAge } from "@/lib/grant";

export type AppFilter = "all" | "pending" | "approved" | "notApproved" | "duplicates" | "title1";

const FILTERS: { value: AppFilter; label: string }[] = [
  { value: "all", label: "All applications" },
  { value: "pending", label: "Not yet decided" },
  { value: "approved", label: "Approved" },
  { value: "notApproved", label: "Not approved" },
  { value: "duplicates", label: "Duplicate submissions" },
  { value: "title1", label: "Title 1 status needed" },
];

function matchesFilter(a: Application, f: AppFilter) {
  switch (f) {
    case "pending":
      return a.review.approved === null;
    case "approved":
      return a.review.approved === "Yes";
    case "notApproved":
      return a.review.approved === "No";
    case "duplicates":
      return a.duplicateCount > 1;
    case "title1":
      return a.category === TITLE1_NEEDED;
    default:
      return true;
  }
}

/** The team age the coach picked on the form, if it names one. */
function ageFromForm(provided: string): TeamAge | null {
  const v = provided.toLowerCase();
  if (v.includes("rookie")) return "Rookie";
  if (v.includes("second")) return "Second Year";
  if (v.includes("veteran")) return "Veteran";
  return null;
}

export function ApplicationsTable({ data, initialFilter }: { data: GrantData; initialFilter: AppFilter }) {
  const [reviews, setReviews] = useState(data.reviews);
  const [filter, setFilter] = useState<AppFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const apps = useMemo(() => buildApplications({ ...data, reviews }), [data, reviews]);

  function update(timestamp: string, patch: Partial<Review>) {
    setReviews((r) => ({ ...r, [timestamp]: { ...r[timestamp], ...patch } }));
  }

  const q = search.trim().toLowerCase();
  const shown = apps
    .filter((a) => matchesFilter(a, filter))
    .filter((a) => !q || `${a.teamNumber} ${a.teamName ?? ""} ${a.coach}`.toLowerCase().includes(q))
    .sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <>
      <h1 className="mb-4 text-3xl">Grant Application Status</h1>

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
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <ManualKey />
        <div className="overflow-x-auto" ref={scrollerRef}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Team #</th>
                <th>Team Name</th>
                <th>Coach 1</th>
                <th>Rookie/Veteran Status Provided</th>
                <th className="manual yn">Grant Approved</th>
                <th className="manual">Approval Notes</th>
                <th>Calculated Team Age</th>
                <th>Rookie/Veteran Status for Grant</th>
                <th className="manual yn">School Title 1 Status</th>
                <th className="manual yn">Matching Grant Letter Received?</th>
                <th className="manual yn">Event Volunteering?</th>
                <th>List of Volunteers</th>
                <th>Fully Registered? (from Team)</th>
                <th className="manual yn">Qualified Purchase?</th>
                <th>End of Season Survey Completed?</th>
                <th className="manual yn">VRS 6 Lesson Challenge Completed?</th>
                <th>Additional Info Email Sent</th>
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
                    <td className="whitespace-nowrap">
                      <span className="cursor-help" title={formDateTime(a.submittedAt)}>
                        {formDate(a.submittedAt)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      {a.teamNumber}
                      {a.duplicateCount > 1 && (
                        <span className="badge badge-warning ml-1" title="This team sent the grant form more than once">
                          duplicate ×{a.duplicateCount}
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
                    <td className="min-w-40">{a.categoryProvided}</td>
                    <td>
                      <YesNoSelect
                        label={`Team ${a.teamNumber} approved for grant`}
                        value={a.review.approved}
                        onChange={(v) => update(a.timestamp, { approved: v })}
                      />
                    </td>
                    <td className="min-w-56">
                      <textarea
                        aria-label={`Approval notes for team ${a.teamNumber}`}
                        rows={2}
                        className="cell-input"
                        value={a.review.notes}
                        onChange={(e) => update(a.timestamp, { notes: e.target.value })}
                      />
                    </td>
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
                        label={`Matching grant letter received from team ${a.teamNumber}`}
                        value={a.review.letterReceived}
                        onChange={(v) => update(a.timestamp, { letterReceived: v })}
                      />
                      <div className="mt-1 text-xs">
                        <FileLink href={a.letterUrl}>Letter</FileLink>
                      </div>
                    </td>
                    <td>
                      <YesNoSelect
                        label={`Event volunteering for team ${a.teamNumber}`}
                        value={a.review.volunteering}
                        onChange={(v) => update(a.timestamp, { volunteering: v })}
                      />
                    </td>
                    <td className="min-w-48">{a.volunteers}</td>
                    <td>
                      <YesNoBadge value={a.fullyRegistered} />
                    </td>
                    <td>
                      <YesNoSelect
                        label={`Qualified purchase for team ${a.teamNumber}`}
                        value={a.review.qualifiedPurchase}
                        onChange={(v) => update(a.timestamp, { qualifiedPurchase: v })}
                      />
                    </td>
                    <td>
                      <YesNoBadge value={a.surveyCompleted} />
                    </td>
                    <td>
                      <YesNoSelect
                        label={`VRS challenge completed by team ${a.teamNumber}`}
                        value={a.review.vrsCompleted}
                        onChange={(v) => update(a.timestamp, { vrsCompleted: v })}
                      />
                      <div className="mt-1 text-xs">
                        <FileLink href={a.vrsUrl}>Screenshot</FileLink>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{shortDate(a.additionalInfoEmailOn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
