"use client";

import type { Dispatch, SetStateAction } from "react";
import { SaveStatus, useSaver } from "@/components/useSaver";
import { Card } from "@/components/SiteChrome";
import { askRows, type Application, type GrantAsk } from "@/lib/applications";
import { money } from "@/lib/format";
import { addAskAction, removeAskAction, updateAskAction } from "./actions";

/**
 * Requests for money from the Donor Fund during the season. The Grant Administrator names
 * each ask and sets its dates; the amounts add up the Amount of Check of the approved teams
 * assigned to it (Ask Period on Check Status). Changes save to the database as you go.
 * The list itself lives on the Dashboard, which also uses it for Ask Period and the filter.
 */
export function GrantAskTracker({
  asks,
  setAsks,
  apps,
  onRemoved,
}: {
  asks: GrantAsk[];
  setAsks: Dispatch<SetStateAction<GrantAsk[]>>;
  apps: Application[];
  /** Called after an ask is removed, so its teams can be shown as unassigned. */
  onRemoved: (id: number) => void;
}) {
  const { rows, total } = askRows(asks, apps);
  const saver = useSaver();

  function update(i: number, patch: Partial<GrantAsk>) {
    const id = asks[i].id;
    setAsks((list) => list.map((a, j) => (j === i ? { ...a, ...patch } : a)));
    if (id) saver.queue(`ask:${id}:${Object.keys(patch).sort().join(",")}`, () => updateAskAction(id, patch));
  }

  async function addAsk() {
    const created = await saver.run(() => addAskAction(`Ask ${asks.length + 1}`));
    if (created) setAsks((list) => [...list, created]);
  }

  async function remove(i: number) {
    const { id, name, assigned } = rows[i];
    if (
      assigned > 0 &&
      !window.confirm(
        `${assigned} ${assigned === 1 ? "team is" : "teams are"} assigned to ${name}. Remove ${name} anyway? ` +
          `Those teams will no longer have an Ask Period.`,
      )
    ) {
      return;
    }
    setAsks((list) => list.filter((_, j) => j !== i));
    if (id) {
      await saver.run(() => removeAskAction(id));
      onRemoved(id);
    }
  }

  return (
    <Card
      id="grant-ask-tracker"
      title="Grant Ask Tracker"
      actions={
        <div className="flex items-center gap-3">
          <SaveStatus state={saver.state} />
          <button type="button" className="btn btn-outline btn-sm" onClick={addAsk}>
            + Add ask
          </button>
        </div>
      }
    >
      <p className="mb-3 text-sm text-muted">
        Filled out by the Grant Administrator to track requests for funds from the Donor Fund during the season. Give an
        ask a start and end date to make it available as an Ask Period on Check Status; its amounts add up the teams
        assigned to it.
      </p>
      <div className="overflow-x-auto">
        <table className="data-table center-num !w-auto">
          <thead>
            <tr>
              <th className="manual">Name</th>
              <th className="manual">Start Date</th>
              <th className="manual">End Date</th>
              <th
                className="num cursor-help !whitespace-normal"
                title="Running total: this ask's Total Ask Amount plus every ask above it"
              >
                Cumulative Qualified
                <br />
                Grants as of End Date <span className="text-muted">ⓘ</span>
              </th>
              <th
                className="num cursor-help !whitespace-normal"
                title="Amount of Check (mailed or not) of the approved teams assigned to this ask on Check Status"
              >
                Total Ask Amount
                <br />
                from Donor Fund <span className="text-muted">ⓘ</span>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted">
                  No asks yet. Use <strong>+ Add ask</strong> to start one.
                </td>
              </tr>
            )}
            {rows.map((a, i) => (
              <tr key={a.id ?? i}>
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
                <td className="num">{money(a.cumulative)}</td>
                <td className="num">{money(a.amount)}</td>
                <td>
                  <div className="flex h-[1.625rem] items-center">
                    <button type="button" className="cell-pill" onClick={() => remove(i)}>
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
              <td className="num">{money(total)}</td>
              <td className="num">{money(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
