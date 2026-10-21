"use client";

import { useState } from "react";
import { MoneyInput } from "@/components/inputs";
import { Card } from "@/components/SiteChrome";
import { askTotals, type GrantAsk } from "@/lib/applications";
import { money } from "@/lib/format";

/**
 * Requests for money from the Donor Fund during the season. Everything is entered by the
 * Grant Administrator; "Use current" copies today's Qualified Grants from Fundraising total.
 * MOCKUP: edits are not saved.
 */
export function GrantAskTracker({
  initialAsks,
  currentQualified,
}: {
  initialAsks: GrantAsk[];
  currentQualified: number;
}) {
  const [asks, setAsks] = useState(initialAsks);
  const totals = askTotals(asks);

  function update(i: number, patch: Partial<GrantAsk>) {
    setAsks((list) => list.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  }

  function addAsk() {
    setAsks((list) => [...list, { name: `Ask ${list.length + 1}`, start: null, end: null, cumulative: null, ask: null }]);
  }

  return (
    <Card
      id="grant-ask-tracker"
      title="Grant Ask Tracker"
      actions={
        <button type="button" className="btn btn-outline btn-sm" onClick={addAsk}>
          + Add ask
        </button>
      }
    >
      <p className="mb-3 text-sm text-muted">
        Filled out by the Grant Administrator to track requests for funds from the Donor Fund during the season.
      </p>
      <div className="overflow-x-auto">
        <table className="data-table center-num !w-auto">
          <thead>
            <tr>
              <th className="manual">Name</th>
              <th className="manual">Start Date</th>
              <th className="manual">End Date</th>
              <th className="manual num !whitespace-normal">
                Cumulative Qualified
                <br />
                Grants as of End Date
              </th>
              <th className="manual num !whitespace-normal">
                Total Ask Amount
                <br />
                from Donor Fund
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {asks.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  No asks yet. Use <strong>+ Add ask</strong> to start one.
                </td>
              </tr>
            )}
            {asks.map((a, i) => (
              <tr key={i}>
                <td className="w-28">
                  <input
                    aria-label={`Name of ask ${i + 1}`}
                    className="cell-input"
                    value={a.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                  />
                </td>
                <td className="w-36">
                  <input
                    type="date"
                    aria-label={`Start date of ${a.name}`}
                    className="cell-input"
                    value={a.start ?? ""}
                    onChange={(e) => update(i, { start: e.target.value || null })}
                  />
                </td>
                <td className="w-36">
                  <input
                    type="date"
                    aria-label={`End date of ${a.name}`}
                    className="cell-input"
                    value={a.end ?? ""}
                    onChange={(e) => update(i, { end: e.target.value || null })}
                  />
                  {a.start && a.end && a.end < a.start && (
                    <div className="mt-1">
                      <span className="badge badge-warning">Ends before it starts</span>
                    </div>
                  )}
                </td>
                <td className="num">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-32">
                      <MoneyInput
                        label={`Cumulative qualified grants for ${a.name}`}
                        value={a.cumulative}
                        onChange={(v) => update(i, { cumulative: v })}
                      />
                    </div>
                    <button
                      type="button"
                      className="cell-pill"
                      title={`Copy today's Qualified Grants from Fundraising total (${money(currentQualified)})`}
                      onClick={() => update(i, { cumulative: currentQualified })}
                    >
                      Use current
                    </button>
                  </div>
                </td>
                <td className="num">
                  <div className="mx-auto w-32">
                    <MoneyInput
                      label={`Total ask amount for ${a.name}`}
                      value={a.ask}
                      onChange={(v) => update(i, { ask: v })}
                    />
                  </div>
                </td>
                <td>
                  <div className="flex h-[1.625rem] items-center">
                    <button
                      type="button"
                      className="cell-pill"
                      onClick={() => setAsks((list) => list.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total Ask for Year</td>
              <td className="num" title="The most recent ask's cumulative amount">
                {/* Same layout as the rows (amount box + Use current) so the total sits under the amounts. */}
                <div className="flex items-center justify-center gap-2">
                  <span className="w-32 text-center">{money(totals.cumulative)}</span>
                  <span className="cell-pill invisible" aria-hidden>
                    Use current
                  </span>
                </div>
              </td>
              <td className="num">{money(totals.ask)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
