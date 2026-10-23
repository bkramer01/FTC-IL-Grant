"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlignedFooter } from "@/components/AlignedFooter";
import { HqAmountError, MoneyInput, TeamNumber } from "@/components/inputs";
import { RefreshButton } from "@/components/RefreshButton";
import { ReportButton } from "@/components/ReportButton";
import { Alert, Card, ManualKey } from "@/components/SiteChrome";
import { SaveStatus, useSaver } from "@/components/useSaver";
import { compareValues, nextSort, SortHeader, type Sort as SortState } from "@/components/SortHeader";
import {
  buildApplications,
  computeTotals,
  EMPTY_REVIEW,
  fundBreakdown,
  isActiveAsk,
  sumFundRows,
  isCheckLocked,
  type Application,
  type AskFilter,
  type FundTotals,
  type GrantAsk,
  type GrantData,
  type Review,
} from "@/lib/applications";
import { downloadBlob, fundraisingTable } from "@/lib/export";
import { fundraisingFileName, fundraisingWorkbook } from "@/lib/report";
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
      return a.checkAmount;
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
  const [asks, setAsks] = useState<GrantAsk[]>(data.asks);
  const [askFilterChoice, setAskFilter] = useState<AskFilter>("all");
  const apps = useMemo(() => buildApplications({ ...data, reviews }), [data, reviews]);
  // Asks with both dates set: offered in Ask Period and the filter.
  const activeAsks = asks.filter((a): a is GrantAsk & { id: number } => isActiveAsk(a) && a.id !== undefined);
  // A filtered ask that was removed or lost a date falls back to all ask periods.
  const askFilter =
    typeof askFilterChoice === "number" && !activeAsks.some((a) => a.id === askFilterChoice) ? "all" : askFilterChoice;
  const askName = (id: number | null) => asks.find((a) => a.id === id)?.name ?? null;
  const totals = useMemo(() => computeTotals(apps, askFilter), [apps, askFilter]);
  const filterLabel =
    askFilter === "all" ? null : askFilter === "unassigned" ? "Unassigned" : (askName(askFilter) ?? null);
  const { rows, total } = totals;
  // Every submission whose Grant Approved is still blank or Under Review.
  const notReviewed = apps.filter((a) => a.review.approved === null || a.review.approved === "Under Review").length;

  const saver = useSaver();
  const fundScrollerRef = useRef<HTMLDivElement>(null);
  const fundTableRef = useRef<HTMLTableElement>(null);
  // Height of what sits under the Fundraising Status box (Ask Period breakdown + row count),
  // so the box leaves room for it: headings and every subtotal fit in the window together.
  const fundBelowRef = useRef<HTMLDivElement>(null);
  const [fundBelowHeight, setFundBelowHeight] = useState(0);
  useEffect(() => {
    const el = fundBelowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFundBelowHeight(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function update(timestamp: string, patch: Partial<Review>) {
    setReviews((r) => ({ ...r, [timestamp]: { ...(r[timestamp] ?? EMPTY_REVIEW), ...patch } }));
    saver.queue(`${timestamp}:${Object.keys(patch).sort().join(",")}`, () => saveReviewAction(timestamp, patch));
  }

  /** Check # or Date Check Mailed changed. Completing both locks the check at its current amount. */
  function updateCheck(a: Application, patch: Pick<Partial<Review>, "checkNumber" | "checkMailedOn">) {
    update(a.timestamp, patch);
    if (!a.checkLocked && isCheckLocked({ ...a.review, ...patch })) {
      update(a.timestamp, { checkAmount: a.checkAmount, checkAmountFor: a.possibleAward });
    }
  }

  /** An ask was removed from the Grant Ask Tracker: its teams no longer have an Ask Period. */
  function onAskRemoved(id: number) {
    setReviews((r) =>
      Object.fromEntries(Object.entries(r).map(([ts, review]) => [ts, review.askId === id ? { ...review, askId: null } : review])),
    );
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
  const fundTotals = sumFundRows(fundRows);
  // The same totals split by Ask Period (always adds up to the Total row).
  const breakdown = fundBreakdown(fundRows, asks, !approvedOnly);

  /** Downloads the rows shown, with both tabs' columns and the subtotals, as an Excel file. */
  async function exportFundraising() {
    const now = new Date();
    const table = fundraisingTable(fundRows, askName, [{ label: "Total", count: fundRows.length, totals: fundTotals }, ...breakdown]);
    const wb = await fundraisingWorkbook(table, now, approvedOnly ? "Approved teams only" : "All applications");
    const buffer = await wb.xlsx.writeBuffer();
    downloadBlob(
      fundraisingFileName(now),
      new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    );
  }

  /** The Total row (frozen at the bottom of the table) or one breakdown row (below the box). */
  function totalsRow(g: { label: string; count: number | null; totals: FundTotals }, total: boolean) {
    const label = total ? (
      "Total"
    ) : (
      <span className="pl-4">
        {g.label} <span className="text-muted">({g.count})</span>
      </span>
    );
    return tab === "fundraising" ? (
      <tr key={g.label} className={total ? "total-row" : "breakdown-row"}>
        <td colSpan={6}>{label}</td>
        <td className="num">{money(g.totals.maxGrant)}</td>
        <td className="num">{money(g.totals.target)}</td>
        <td className="num">{money(g.totals.raised)}</td>
        <td className="num">{money(g.totals.possible)}</td>
        <td className="num">{money(g.totals.unused)}</td>
        <td />
      </tr>
    ) : (
      <tr key={g.label} className={total ? "total-row" : "breakdown-row"}>
        <td colSpan={7}>{label}</td>
        <td className="num">{money(g.totals.checks)}</td>
        <td colSpan={3} />
      </tr>
    );
  }

  const teamCell = (a: Application) => (
    <td className="whitespace-nowrap">
      <TeamNumber app={a} />
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
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only sm:not-sr-only">Ask Period</span>
              <select
                className="form-control !w-auto !py-1 text-sm"
                value={String(askFilter)}
                onChange={(e) => {
                  const v = e.target.value;
                  setAskFilter(v === "all" || v === "unassigned" ? v : Number(v));
                }}
                title="Show totals for the approved teams assigned to one ask period. Teams Applied always counts every application."
              >
                <option value="all">All Ask Periods</option>
                {activeAsks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
                <option value="unassigned">Unassigned</option>
              </select>
            </label>
            <RefreshButton initialRefreshedAt={data.refreshedAt} />
            <ReportButton totals={totals} askPeriod={filterLabel} />
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
        {filterLabel && (
          <Alert tone="info" compact>
            Showing approved teams {askFilter === "unassigned" ? "with no Ask Period" : <>assigned to <strong>{filterLabel}</strong></>}.
            Teams Applied still counts every application.
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
                  title={'Tracks the number of applications by rookie/veteran status. Other columns in the chart only count teams with "Grant Approved" equal to "Yes".'}
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
                <th className="num cursor-help" title="Includes amount of checks mailed to teams">
                  Grants Distributed to Teams <span className="text-muted">ⓘ</span>
                </th>
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

      <GrantAskTracker asks={asks} setAsks={setAsks} apps={apps} onRemoved={onAskRemoved} />

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
              onClick={exportFundraising}
              title="Download the rows shown, with the columns of both tabs and the subtotals, as an Excel file"
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
          <div
            className="overflow-auto"
            style={{ maxHeight: `calc(100vh - ${Math.round(fundBelowHeight) + 24}px)` }}
            ref={fundScrollerRef}
          >
            <table className="data-table compact sticky-head sticky-foot center-num" ref={fundTableRef}>
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
                      className="num"
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
                    <th
                      className="manual cursor-help"
                      title="The Grant Ask Tracker ask this team's check is funded from. Only approved teams; asks need a start and end date to be listed."
                    >
                      Ask
                      <br />
                      Period <span className="text-muted">ⓘ</span>
                    </th>
                    <SortHeader
                      label={<>Amount<br />of Check <span className="text-muted">ⓘ</span></>}
                      title="Defaults to the Possible Grant Award. The Grant Administrator can type a different amount, but if the Possible Grant Award changes, the check amount updates to match it again. If check number and date check mailed are filled out, then the check amount is no longer editable."
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
                      <td className="num">{a.raisedError ? <HqAmountError value={a.hqAmount} /> : money(a.review.raised)}</td>
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
                      <td className="w-24 min-w-24">{a.cityState}</td>
                      <td className="num whitespace-nowrap">{a.zip}</td>
                      <td>
                        {a.review.approved === "Yes" && (
                          <select
                            aria-label={`Ask period for team ${a.teamNumber}`}
                            className="cell-input !w-auto"
                            value={a.review.askId ?? ""}
                            onChange={(e) => update(a.timestamp, { askId: e.target.value ? Number(e.target.value) : null })}
                          >
                            <option value="">—</option>
                            {activeAsks.map((ask) => (
                              <option key={ask.id} value={ask.id}>
                                {ask.name}
                              </option>
                            ))}
                            {a.review.askId !== null && !activeAsks.some((ask) => ask.id === a.review.askId) && (
                              <option value={a.review.askId}>{askName(a.review.askId) ?? "?"} (no dates)</option>
                            )}
                          </select>
                        )}
                      </td>
                      {a.checkLocked ? (
                        <td
                          className="num cursor-help"
                          title="Locked because Check # and Date Check Mailed are filled in. Clear either one to change the amount."
                        >
                          {money(a.checkAmount)} <span aria-hidden>🔒</span>
                        </td>
                      ) : (
                        <td className="w-28">
                          <MoneyInput
                            label={`Check amount for team ${a.teamNumber}`}
                            value={a.checkAmount}
                            onChange={(v) => update(a.timestamp, { checkAmount: v, checkAmountFor: a.possibleAward })}
                          />
                        </td>
                      )}
                      <td className="w-24">
                        <input
                          aria-label={`Check number for team ${a.teamNumber}`}
                          className="cell-input text-center"
                          value={a.review.checkNumber ?? ""}
                          onChange={(e) => updateCheck(a, { checkNumber: e.target.value || null })}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          aria-label={`Date check mailed to team ${a.teamNumber}`}
                          className="cell-input"
                          value={a.review.checkMailedOn ?? ""}
                          onChange={(e) => updateCheck(a, { checkMailedOn: e.target.value || null })}
                        />
                      </td>
                      <td className="whitespace-nowrap">{shortDate(a.awardEmailOn)}</td>
                    </tr>
                  ),
                )}
              </tbody>
              {fundRows.length > 0 && (
                <tfoot>{totalsRow({ label: "Total", count: null, totals: fundTotals }, true)}</tfoot>
              )}
            </table>
          </div>
          <div ref={fundBelowRef}>
            {fundRows.length > 0 && (
              <AlignedFooter tableRef={fundTableRef} scrollerRef={fundScrollerRef} className="compact center-num">
                {breakdown.map((g) => totalsRow(g, false))}
              </AlignedFooter>
            )}
            <p className="mt-2 text-sm text-muted" aria-live="polite">
              {fundRows.length} {fundRows.length === 1 ? "row" : "rows"}
            </p>
          </div>
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
