"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NumberInput } from "@/components/inputs";
import { RefreshButton } from "@/components/RefreshButton";
import { Alert, Card, ManualKey } from "@/components/SiteChrome";
import { buildApplications, computeTotals, type GrantData, type Review } from "@/lib/applications";
import { money, shortDate } from "@/lib/format";
import { AGE_CUTOFFS } from "@/lib/grant";

export function TotalsAndFundraising({ data, today }: { data: GrantData; today: string }) {
  const [reviews, setReviews] = useState(data.reviews);
  const [approvedOnly, setApprovedOnly] = useState(true);
  const apps = useMemo(() => buildApplications({ ...data, reviews }), [data, reviews]);
  const { rows, total, title1Needed } = useMemo(() => computeTotals(apps), [apps]);

  function update(timestamp: string, patch: Partial<Review>) {
    setReviews((r) => ({ ...r, [timestamp]: { ...r[timestamp], ...patch } }));
  }

  const fundRows = apps
    .filter((a) => !approvedOnly || a.review.approved === "Yes")
    .sort((a, b) => a.teamNumber - b.teamNumber || a.submittedAt - b.submittedAt);

  return (
    <>
      <h1 className="mb-1 text-3xl">Totals &amp; Fundraising</h1>
      <p className="mb-4 text-muted">FTC Illinois Matching Grants, 2026–27 season.</p>

      <Card title="Grant Matching Totals" actions={<RefreshButton initialRefreshedAt={data.refreshedAt} />}>
        <p className="mb-3 text-sm text-muted">
          Teams Applied counts every team that sent the form (each team once). Every other column counts only teams with
          Team Approved for Grant = Yes.
        </p>
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
                <th>Rookie/Veteran Status</th>
                <th className="num">Teams Applied</th>
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

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg">Team Age Thresholds</h3>
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
            <h3 className="mb-2 text-lg">Grant Category Lookup</h3>
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

      <Card
        title="Fundraising Status"
        actions={
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />
            Approved teams only
          </label>
        }
      >
        <p className="mb-2 text-sm text-muted">
          Possible Grant Award = amount raised, capped at the category&apos;s max fundraising target, × the matching
          multiplier. Unused Grant Match = Possible Grant Award less amount raised. The update date fills in when you change
          the amount raised.
        </p>
        <ManualKey />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team #</th>
                <th>Team Name</th>
                <th>Coach 1</th>
                {!approvedOnly && <th>Approved</th>}
                <th>Rookie/Veteran Status</th>
                <th className="num">Possible Grant Award</th>
                <th className="manual num">How Much Raised by Team</th>
                <th className="num">Unused Grant Match</th>
                <th>Date of Last Fundraising Update</th>
                <th>Check Addressee</th>
                <th>Street Address</th>
                <th>City, State, Zip</th>
                <th className="manual num">Amount of Check</th>
                <th className="manual">Check #</th>
                <th className="manual">Date Check Mailed</th>
                <th>Grant Award Email Sent</th>
              </tr>
            </thead>
            <tbody>
              {fundRows.length === 0 && (
                <tr>
                  <td colSpan={16} className="text-muted">
                    No approved teams yet.
                  </td>
                </tr>
              )}
              {fundRows.map((a) => (
                <tr key={a.timestamp}>
                  <td className="whitespace-nowrap">
                    {a.teamNumber}
                    {a.duplicateCount > 1 && (
                      <span className="badge badge-warning ml-1" title="This team sent the grant form more than once">
                        ×{a.duplicateCount}
                      </span>
                    )}
                  </td>
                  <td>{a.teamName ?? <span className="badge badge-danger">not in BioBuzz</span>}</td>
                  <td>{a.coach}</td>
                  {!approvedOnly && <td>{a.review.approved ?? "—"}</td>}
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
                  <td className="min-w-48">{a.checkPayee}</td>
                  <td className="min-w-40">{a.street}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
