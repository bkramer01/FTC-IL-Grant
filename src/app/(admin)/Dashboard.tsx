"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoneyInput } from "@/components/inputs";
import { RefreshButton } from "@/components/RefreshButton";
import { ReportButton } from "@/components/ReportButton";
import { Alert, Card, ManualKey } from "@/components/SiteChrome";
import { SaveStatus, useSaver } from "@/components/useSaver";
import { compareValues, nextSort, SortHeader, type Sort as SortState } from "@/components/SortHeader";
import {
  buildApplications,
  computeTotals,
  EMPTY_REVIEW,
  type Application,
  type GrantData,
  type Review,
} from "@/lib/applications";
import { downloadCsv, fundraisingCsv } from "@/lib/export";
import { money, shortDate } from "@/lib/format";
import {
  AGE_CUTOFFS,
  maxFundraisingTarget,
  maxGrantAward,
  multiplierLabel,
  TOTALS_CATEGORIES,
  type GrantCategory,
} from "@/lib/grant";
import { GrantAskTracker } from "./GrantAskTracker";
import { saveReviewAction } from "./actions";

type SortKey =
  | "team"
  | "approved"
  | "raised"
  | "unused"
  | "category"
  | "checkAmount"
  | "checkNumber"
  | "checkMailed"
  | "awardEmail";
type Sort = SortState<SortKey>;
type Tab = "fundraising" | "checks";

const GREEN_NOTE =
  "Shows green if all teams in this Rookie/Veteran Status have achieved the maximum matching fundraising amounts.";
const MAXED_OUT ="Every approved team in this category raised the max fundraising target";

const APPROVED_ORDER = { Yes: 0, "Under Review": 1, No: 2 } as const;

function categoryRank(c: GrantCategory) {
  const i = TOTALS_CATEGORIES.indexOf(c as (typeof TOTALS_CATEGORIES)[number]);
  return i === -1 ? TOTALS_CATEGORIES.length : i;
}

/** The value a column sorts by; null (blank) always sorts last. */
function sortValue(a: Application, key: SortKey): number | string | null {
  switch (key) {
    case "approved":
      return a.review.approved ? APPROVED_ORDER[a.review.approved] : 3;
    case "category":
      return categoryRank(a.category);
    case "raised":
      return a.review.raised;
    case "unused":
      return a.unusedMatch;
    case "checkAmount":
      return a.review.checkAmount;
    case "checkNumber": {
      const n = a.review.checkNumber?.trim();
      if (!n) return null;
      return /^\d+$/.test(n) ? Number(n) : n;
    }
    case "checkMailed":
      return a.review.checkMailedOn;
    case "awardEmail":
      return a.awardEmailOn;
    default:
      return a.teamNumber;
  }
}

function compare(a: Application, b: Application, { key, dir }: Sort) {
  return compareValues(sortValue(a, key), sortValue(b, key), dir);
}

export function Dashboard({ data, today }: { data: GrantData; today: string }) {
  const [reviews, setReviews] = useState(data.reviews);
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [sort, setSort] = useState<Sort>({ key: "team", dir: 1 });
  const [tab, setTab] = useState<Tab>("fundraising");
  const apps = useMemo(() => buildApplications({ ...data, reviews }), [data, reviews]);
  const totals = useMemo(() => computeTotals(apps), [apps]);
  const { rows, total } = totals;
  // Every submission whose Grant Approved is still blank or Under Review.
  const notReviewed = apps.filter((a) => a.review.approved === null || a.review.approved === "Under Review").length;

  const saver = useSaver();

  function update(timestamp: string, patch: Partial<Review>) {
    setReviews((r) => ({ ...r, [timestamp]: { ...(r[timestamp] ?? EMPTY_REVIEW), ...patch } }));
    saver.queue(`${timestamp}:${Object.keys(patch).sort().join(",")}`, () => saveReviewAction(timestamp, patch));
  }

  function onSort(key: SortKey) {
    setSort((s) => nextSort(s, key));
  }

  const fundRows = apps
    .filter((a) => !approvedOnly || a.review.approved === "Yes")
    .sort(
      (a, b) =>
        compare(a, b, sort) || a.teamNumber - b.teamNumber || a.submittedAt - b.submittedAt,
    );

  // Totals of the rows shown (blanks count as $0).
  const fundTotals = { maxGrant: 0, target: 0, raised: 0, possible: 0, unused: 0, checks: 0 };
  for (const a of fundRows) {
    fundTotals.maxGrant += maxGrantAward(a.category) ?? 0;
    fundTotals.target += maxFundraisingTarget(a.category) ?? 0;
    fundTotals.raised += a.review.raised ?? 0;
    fundTotals.possible += a.possibleAward ?? 0;
    fundTotals.unused += a.unusedMatch ?? 0;
    fundTotals.checks += a.review.checkAmount ?? 0;
  }

  const teamCell = (a: Application) => (
    <td className="whitespace-nowrap">
      {a.teamNumber}
      {a.duplicateCount > 1 && (
        <span className="badge badge-warning ml-1" title="This team sent the grant form more than once">
          ×{a.duplicateCount}
        </span>
      )}
    </td>
  );
  const nameCell = (a: Application) => (
    <td className="min-w-28">{a.teamName ?? <span className="badge badge-danger">not in BioBuzz</span>}</td>
  );
  const teamHeader = <SortHeader label={<>Team<br />#</>} sortKey="team" sort={sort} onSort={onSort} />;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl">FTC Illinois Matching Grants, 2026–27 season</h1>
        <SaveStatus state={saver.state} />
      </div>

      <Card
        title="Grant Matching Totals"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <RefreshButton initialRefreshedAt={data.refreshedAt} />
            <ReportButton totals={totals} />
          </div>
        }
      >
        {notReviewed > 0 && (
          <Alert tone="warning" compact>
            <Link href="/applications?show=notReviewed">
              {notReviewed} application{notReviewed === 1 ? "" : "s"}
            </Link>{" "}
            not fully reviewed/complete.
          </Alert>
        )}
        <div className="overflow-x-auto">
          <table className="data-table wrap-head center-head">
            <thead>
              <tr>
                <th>
                  Rookie/Veteran Status
                  <a href="#grant-rules" className="no-underline" title="How Rookie/Veteran Status is worked out: see Grant Rules at the bottom of the page">
                    *
                  </a>
                </th>
                <th
                  className="num cursor-help"
                  title="Teams Applied counts every team that sent the form (each team once). Every other column counts only teams with Team Approved for Grant = Yes."
                >
                  Teams
                  <br />
                  <span className="whitespace-nowrap">
                    Applied <span className="text-muted">ⓘ</span>
                  </span>
                </th>
                <th className="num">Teams Awarded Grants</th>
                <th className="num">Matching Multiplier</th>
                <th className="num">Grantor Match per Team</th>
                <th className="num">Total Possible Grant Amount</th>
                <th className="num">Max Fundraising Target</th>
                <th className="num cursor-help" title={GREEN_NOTE}>
                  Total Team
                  <br />
                  <span className="whitespace-nowrap">Fundraising as of</span>
                  <br />
                  <span className="whitespace-nowrap">
                    {shortDate(today)} <span className="text-muted">ⓘ</span>
                  </span>
                </th>
                <th className="num">Qualified Grants from Fundraising</th>
                <th className="num">Grants Distributed to Teams</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.category}>
                  <td className="whitespace-nowrap font-medium">{r.category}</td>
                  <td className="num">{r.applied}</td>
                  <td className="num">{r.awarded}</td>
                  <td className="num">{r.multiplier ? `1 to ${r.multiplier}` : "—"}</td>
                  <td className="num">{money(r.grantorMatch)}</td>
                  <td className="num">{money(r.totalPossible)}</td>
                  <td className="num">{money(r.maxFundraising)}</td>
                  <td className={`num ${r.maxedOut ? "bg-success-bg" : ""}`} title={r.maxedOut ? MAXED_OUT : undefined}>
                    {money(r.raised)}
                  </td>
                  <td className="num">{money(r.qualified)}</td>
                  <td className="num">{money(r.distributed)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td className="num">{total.applied}</td>
                <td className="num">{total.awarded}</td>
                <td />
                <td />
                <td className="num">{money(total.totalPossible)}</td>
                <td />
                <td className="num">{money(total.raised)}</td>
                <td className="num">{money(total.qualified)}</td>
                <td className="num">{money(total.distributed)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <GrantAskTracker initialAsks={data.asks} currentQualified={total.qualified} />

      <Card
        title="Fundraising Status"
        actions={
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />
              Approved teams only
            </label>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => downloadCsv(`grant-fundraising-${today}.csv`, fundraisingCsv(fundRows))}
              title="Download the rows shown, with the columns of both tabs, as a CSV file for Excel"
            >
              ⤓ Export
            </button>
          </div>
        }
      >
        <div role="tablist" aria-label="Fundraising views" className="mb-3 flex gap-1 border-b-2 border-first-blue">
          {(
            [
              ["fundraising", "Fundraising Status"],
              ["checks", "Check Status"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`tab-${value}`}
              aria-selected={tab === value}
              aria-controls="fund-panel"
              onClick={() => setTab(value)}
              className={`cursor-pointer rounded-t-md border border-b-0 px-4 py-2 text-sm font-semibold ${
                tab === value
                  ? "border-first-blue bg-first-blue text-white"
                  : "border-line bg-panel text-ink/75 hover:bg-[#e9ecef] hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div id="fund-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <ManualKey />
          <div className="max-h-[calc(100vh-7rem)] overflow-auto">
            <table className="data-table compact sticky-head center-num">
              <thead>
                {tab === "fundraising" ? (
                  <tr>
                    <SortHeader label="Team #" sortKey="team" sort={sort} onSort={onSort} />
                    <th>Team Name</th>
                    <th>Coach Name</th>
                    <SortHeader label="Approved" sortKey="approved" sort={sort} onSort={onSort} />
                    <SortHeader
                      label={
                        <>
                          Rookie/Veteran
                          <br />
                          Status
                        </>
                      }
                      sortKey="category"
                      sort={sort}
                      onSort={onSort}
                    />
                    <th className="num">
                      Matching
                      <br />
                      Multiplier
                    </th>
                    <th className="num" title="Max fundraising target × matching multiplier (the grantor match per team)">
                      Max Grant
                      <br />
                      Award
                    </th>
                    <th className="num">Team Target</th>
                    <SortHeader
                      label={
                        <>
                          Raised by
                          <br />
                          Team
                        </>
                      }
                      sortKey="raised"
                      sort={sort}
                      onSort={onSort}
                      className="manual num"
                    />
                    <th className="num">
                      Possible
                      <br />
                      Grant Award
                    </th>
                    <SortHeader
                      label={
                        <>
                          Unused
                          <br />
                          Grant Match
                        </>
                      }
                      sortKey="unused"
                      sort={sort}
                      onSort={onSort}
                      className="num"
                    />
                    <th>
                      Last
                      <br />
                      Update
                    </th>
                  </tr>
                ) : (
                  <tr>
                    {teamHeader}
                    <th>
                      Team
                      <br />
                      Name
                    </th>
                    <th>
                      Check
                      <br />
                      Addressee
                    </th>
                    <th>
                      Street
                      <br />
                      Address
                    </th>
                    <th>
                      City,
                      <br />
                      State
                    </th>
                    <th className="num">Zip</th>
                    <SortHeader
                      label={<>Amount<br />of Check</>}
                      sortKey="checkAmount"
                      sort={sort}
                      onSort={onSort}
                      className="manual num"
                    />
                    <SortHeader label={<>Check<br />#</>} sortKey="checkNumber" sort={sort} onSort={onSort} className="manual num" />
                    <SortHeader
                      label={<>Date Check<br />Mailed</>}
                      sortKey="checkMailed"
                      sort={sort}
                      onSort={onSort}
                      className="manual"
                    />
                    <SortHeader label={<>Grant Award<br />Email Sent</>} sortKey="awardEmail" sort={sort} onSort={onSort} />
                  </tr>
                )}
              </thead>
              <tbody>
                {fundRows.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-muted">
                      No approved teams yet.
                    </td>
                  </tr>
                )}
                {fundRows.map((a) =>
                  tab === "fundraising" ? (
                    <tr key={a.timestamp}>
                      {teamCell(a)}
                      {nameCell(a)}
                      <td className="min-w-28">{a.coach}</td>
                      <td>{a.review.approved ?? "—"}</td>
                      <td className="whitespace-nowrap">{a.category}</td>
                      <td className="num">{multiplierLabel(a.category)}</td>
                      <td className="num">{money(maxGrantAward(a.category))}</td>
                      <td className="num">{money(maxFundraisingTarget(a.category))}</td>
                      <td className="w-28">
                        <MoneyInput
                          label={`Amount raised by team ${a.teamNumber}`}
                          value={a.review.raised}
                          onChange={(v) => update(a.timestamp, { raised: v, raisedUpdatedOn: today })}
                        />
                      </td>
                      <td className="num">{money(a.possibleAward)}</td>
                      <td className="num">{money(a.unusedMatch)}</td>
                      <td className="whitespace-nowrap">{shortDate(a.review.raisedUpdatedOn)}</td>
                    </tr>
                  ) : (
                    <tr key={a.timestamp}>
                      {teamCell(a)}
                      {nameCell(a)}
                      <td className="min-w-48">{a.checkPayee}</td>
                      <td className="min-w-36">{a.street}</td>
                      <td className="whitespace-nowrap">{a.cityState}</td>
                      <td className="num whitespace-nowrap">{a.zip}</td>
                      <td className="w-28">
                        <MoneyInput
                          label={`Check amount for team ${a.teamNumber}`}
                          value={a.review.checkAmount}
                          onChange={(v) => update(a.timestamp, { checkAmount: v })}
                        />
                      </td>
                      <td className="w-24">
                        <input
                          aria-label={`Check number for team ${a.teamNumber}`}
                          className="cell-input text-center"
                          value={a.review.checkNumber ?? ""}
                          onChange={(e) => update(a.timestamp, { checkNumber: e.target.value || null })}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          aria-label={`Date check mailed to team ${a.teamNumber}`}
                          className="cell-input"
                          value={a.review.checkMailedOn ?? ""}
                          onChange={(e) => update(a.timestamp, { checkMailedOn: e.target.value || null })}
                        />
                      </td>
                      <td className="whitespace-nowrap">{shortDate(a.awardEmailOn)}</td>
                    </tr>
                  ),
                )}
              </tbody>
              {fundRows.length > 0 && (
                <tfoot>
                  {tab === "fundraising" ? (
                    <tr>
                      <td colSpan={6}>Total</td>
                      <td className="num">{money(fundTotals.maxGrant)}</td>
                      <td className="num">{money(fundTotals.target)}</td>
                      <td className="num">{money(fundTotals.raised)}</td>
                      <td className="num">{money(fundTotals.possible)}</td>
                      <td className="num">{money(fundTotals.unused)}</td>
                      <td />
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6}>Total</td>
                      <td className="num">{money(fundTotals.checks)}</td>
                      <td colSpan={3} />
                    </tr>
                  )}
                </tfoot>
              )}
            </table>
          </div>
          <p className="mt-2 text-sm text-muted" aria-live="polite">
            {fundRows.length} {fundRows.length === 1 ? "row" : "rows"}
          </p>
        </div>
      </Card>

      <Card id="grant-rules" title="Grant Rules">
        <p className="mb-4">
          <strong>*</strong> <strong>How Rookie/Veteran Status is worked out:</strong> each team&apos;s age comes from its
          team number (Team Age Thresholds), then the age is combined with the School Title 1 Status to give the
          Rookie/Veteran Status used for the grant (Grant Category Lookup). Until Title 1 is entered, the status shows
          &ldquo;Title 1 status needed&rdquo;.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg">* Team Age Thresholds</h3>
            <p className="mb-2 text-sm text-muted">Team numbers are issued in order, so lower numbers are older teams.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Age</th>
                  <th>Team Numbers</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rookie (first year)</td>
                  <td>{AGE_CUTOFFS.rookieFrom} and up</td>
                </tr>
                <tr>
                  <td>Second Year</td>
                  <td>
                    {AGE_CUTOFFS.secondYearFrom} to {AGE_CUTOFFS.rookieFrom - 1}
                  </td>
                </tr>
                <tr>
                  <td>Veteran (3rd year or later)</td>
                  <td>{AGE_CUTOFFS.secondYearFrom - 1} and below</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="mb-2 text-lg">* Grant Category Lookup</h3>
            <p className="mb-2 text-sm text-muted">Team age combined with the School Title 1 Status.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Age</th>
                  <th>Title 1 = Yes</th>
                  <th>Title 1 = No</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rookie</td>
                  <td>Rookie 1 title 1</td>
                  <td>Rookie 1</td>
                </tr>
                <tr>
                  <td>Second Year</td>
                  <td>Second Year Title 1</td>
                  <td>Second Year</td>
                </tr>
                <tr>
                  <td>Veteran</td>
                  <td>Veteran Title 1</td>
                  <td>Not Qualified</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </>
  );
}
