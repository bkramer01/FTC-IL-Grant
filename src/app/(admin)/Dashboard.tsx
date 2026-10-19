"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { NumberInput } from "@/components/inputs";
import { RefreshButton } from "@/components/RefreshButton";
import { Alert, Card, ManualKey } from "@/components/SiteChrome";
import { buildApplications, computeTotals, type Application, type GrantData, type Review } from "@/lib/applications";
import { money, shortDate } from "@/lib/format";
import { AGE_CUTOFFS, TOTALS_CATEGORIES, type GrantCategory } from "@/lib/grant";

type SortKey =
  | "team"
  | "approved"
  | "category"
  | "checkAmount"
  | "checkNumber"
  | "checkMailed"
  | "awardEmail";
type Sort = { key: SortKey; dir: 1 | -1 };
type Tab = "fundraising" | "checks";

const APPROVED_ORDER = { Yes: 0, No: 1 } as const;

function categoryRank(c: GrantCategory) {
  const i = TOTALS_CATEGORIES.indexOf(c as (typeof TOTALS_CATEGORIES)[number]);
  return i === -1 ? TOTALS_CATEGORIES.length : i;
}

/** The value a column sorts by; null (blank) always sorts last. */
function sortValue(a: Application, key: SortKey): number | string | null {
  switch (key) {
    case "approved":
      return a.review.approved ? APPROVED_ORDER[a.review.approved] : 2;
    case "category":
      return categoryRank(a.category);
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
  const va = sortValue(a, key);
  const vb = sortValue(b, key);
  if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
  if (typeof va === "number" && typeof vb === "number") return dir * (va - vb);
  return dir * String(va).localeCompare(String(vb), undefined, { numeric: true });
}

/** Column header that sorts the table when clicked. */
function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className = "",
}: {
  label: ReactNode;
  sortKey: SortKey;
  sort: Sort;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <th className={className} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex cursor-pointer items-end gap-1 text-left font-[inherit] hover:text-link ${
          className.includes("num") ? "ml-auto" : ""
        }`}
      >
        <span>{label}</span>
        <span aria-hidden className={active ? "" : "text-muted/50"}>
          {active ? (sort.dir === 1 ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function Dashboard({ data, today }: { data: GrantData; today: string }) {
  const [reviews, setReviews] = useState(data.reviews);
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [sort, setSort] = useState<Sort>({ key: "team", dir: 1 });
  const [tab, setTab] = useState<Tab>("fundraising");
  const apps = useMemo(() => buildApplications({ ...data, reviews }), [data, reviews]);
  const { rows, total, title1Needed } = useMemo(() => computeTotals(apps), [apps]);

  function update(timestamp: string, patch: Partial<Review>) {
    setReviews((r) => ({ ...r, [timestamp]: { ...r[timestamp], ...patch } }));
  }

  function onSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  const fundRows = apps
    .filter((a) => !approvedOnly || a.review.approved === "Yes")
    .sort(
      (a, b) =>
        compare(a, b, sort) || a.teamNumber - b.teamNumber || a.submittedAt - b.submittedAt,
    );

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
      <h1 className="mb-4 text-3xl">FTC Illinois Matching Grants, 2026–27 season</h1>

      <Card title="Grant Matching Totals" actions={<RefreshButton initialRefreshedAt={data.refreshedAt} />}>
        {title1Needed > 0 && (
          <Alert tone="warning">
            {title1Needed} application{title1Needed === 1 ? " still needs" : "s still need"} a School Title 1 Status and{" "}
            {title1Needed === 1 ? "is" : "are"} not counted below. <Link href="/applications?title1=needed">Fill it in on Applications</Link>.
          </Alert>
        )}
        <div className="overflow-x-auto">
          <table className="data-table wrap-head">
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
                  Teams Applied <span className="text-muted">ⓘ</span>
                </th>
                <th className="num">Teams Awarded Grants</th>
                <th className="num">Matching Multiplier</th>
                <th className="num">Grantor Match per Team</th>
                <th className="num">Total Possible Grant Amount</th>
                <th className="num">Max Fundraising Target</th>
                <th className="num">Fundraising as of {shortDate(today)}</th>
                <th className="num">Qualified Grants from Fundraising</th>
                <th className="num">Grants Distributed to Teams</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.category}>
                  <td className="font-medium">{r.category}</td>
                  <td className="num">{r.applied}</td>
                  <td className="num">{r.awarded}</td>
                  <td className="num">{r.multiplier ? `1 to ${r.multiplier}` : "—"}</td>
                  <td className="num">{money(r.grantorMatch)}</td>
                  <td className="num">{money(r.totalPossible)}</td>
                  <td className="num">{money(r.maxFundraising)}</td>
                  <td className="num">{money(r.raised)}</td>
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

      <Card
        title="Fundraising Status"
        actions={
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />
            Approved teams only
          </label>
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
          {tab === "fundraising" ? (
            <p className="mb-2 text-sm text-muted">
              Possible Grant Award = amount raised, capped at the category&apos;s max fundraising target, × the matching
              multiplier. Unused Grant Match = Possible Grant Award less amount raised. The update date fills in when you
              change the amount raised.
            </p>
          ) : (
            <p className="mb-2 text-sm text-muted">
              Where each grant check goes (from the form) and whether it has been sent.
            </p>
          )}
          <ManualKey />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                {tab === "fundraising" ? (
                  <tr>
                    <SortHeader label="Team #" sortKey="team" sort={sort} onSort={onSort} />
                    <th>Team Name</th>
                    <th>Coach 1</th>
                    <SortHeader label="Approved" sortKey="approved" sort={sort} onSort={onSort} />
                    <SortHeader label="Rookie/Veteran Status" sortKey="category" sort={sort} onSort={onSort} />
                    <th className="num">Possible Grant Award</th>
                    <th className="manual num">Raised by Team</th>
                    <th className="num">Unused Grant Match</th>
                    <th>Last Update</th>
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
                      City, State,
                      <br />
                      Zip
                    </th>
                    <SortHeader
                      label={<>Amount<br />of Check</>}
                      sortKey="checkAmount"
                      sort={sort}
                      onSort={onSort}
                      className="manual num"
                    />
                    <SortHeader label={<>Check<br />#</>} sortKey="checkNumber" sort={sort} onSort={onSort} className="manual" />
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
                    <td colSpan={9} className="text-muted">
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
                      <td className="num">{money(a.possibleAward)}</td>
                      <td className="w-28">
                        <NumberInput
                          label={`Amount raised by team ${a.teamNumber}`}
                          value={a.review.raised}
                          onChange={(v) => update(a.timestamp, { raised: v, raisedUpdatedOn: today })}
                        />
                      </td>
                      <td className="num">{money(a.unusedMatch)}</td>
                      <td className="whitespace-nowrap">{shortDate(a.review.raisedUpdatedOn)}</td>
                    </tr>
                  ) : (
                    <tr key={a.timestamp}>
                      {teamCell(a)}
                      {nameCell(a)}
                      <td className="min-w-48">{a.checkPayee}</td>
                      <td className="min-w-36">{a.street}</td>
                      <td className="whitespace-nowrap">{a.cityStateZip}</td>
                      <td className="w-28">
                        <NumberInput
                          label={`Check amount for team ${a.teamNumber}`}
                          value={a.review.checkAmount}
                          onChange={(v) => update(a.timestamp, { checkAmount: v })}
                        />
                      </td>
                      <td className="w-24">
                        <input
                          aria-label={`Check number for team ${a.teamNumber}`}
                          className="cell-input"
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
