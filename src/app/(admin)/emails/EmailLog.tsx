"use client";

import { useState } from "react";
import { Card } from "@/components/SiteChrome";
import { EMAIL_PURPOSES, type EmailEntry } from "@/lib/applications";
import { shortDate } from "@/lib/format";

type Team = { teamNumber: number; teamName: string | null; coach: string; email: string };

export function EmailLog({ initialEmails, teams, today }: { initialEmails: EmailEntry[]; teams: Team[]; today: string }) {
  const [emails, setEmails] = useState(initialEmails);
  const [date, setDate] = useState(today);
  const [teamNumber, setTeamNumber] = useState("");
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState<string>(EMAIL_PURPOSES[0]);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const teamName = (n: number) => teams.find((t) => t.teamNumber === n)?.teamName ?? "";

  function pickTeam(value: string) {
    setTeamNumber(value);
    const t = teams.find((x) => String(x.teamNumber) === value);
    if (t) setRecipient(t.coach);
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    setEmails((list) => [...list, { date, teamNumber: Number(teamNumber), recipient, purpose, notes }]);
    setTeamNumber("");
    setRecipient("");
    setNotes("");
    setAdded(true);
  }

  const sorted = emails.map((e, i) => ({ ...e, i })).sort((a, b) => b.date.localeCompare(a.date) || b.i - a.i);

  return (
    <>
      <h1 className="mb-1 text-3xl">Grant Email Log</h1>
      <p className="mb-4 text-muted">
        Every grant email sent to a coach, entered by hand for now. The <strong>Additional Info Needed</strong> and{" "}
        <strong>Grant Award</strong> entries fill in the &ldquo;email sent&rdquo; columns on Applications and Fundraising.
      </p>

      <Card title="Log an email">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[10rem_14rem_1fr_13rem]">
          <div>
            <label htmlFor="em-date" className="mb-1 block text-sm font-medium">
              Email date
            </label>
            <input id="em-date" type="date" className="form-control" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="em-team" className="mb-1 block text-sm font-medium">
              Team #
            </label>
            <select id="em-team" className="form-control" required value={teamNumber} onChange={(e) => pickTeam(e.target.value)}>
              <option value="">Choose a team…</option>
              {teams.map((t) => (
                <option key={t.teamNumber} value={t.teamNumber}>
                  {t.teamNumber}
                  {t.teamName ? ` · ${t.teamName}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="em-to" className="mb-1 block text-sm font-medium">
              Coach name / recipient
            </label>
            <input id="em-to" className="form-control" required value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div>
            <label htmlFor="em-purpose" className="mb-1 block text-sm font-medium">
              Email purpose
            </label>
            <select id="em-purpose" className="form-control" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {EMAIL_PURPOSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="em-notes" className="mb-1 block text-sm font-medium">
              Notes
            </label>
            <input id="em-notes" className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn btn-primary w-full">
              Add to log
            </button>
          </div>
        </form>
        {added && <p className="mt-3 text-sm text-success" role="status">Added. (Mockup: not saved.)</p>}
      </Card>

      <Card title={`Emails sent (${emails.length})`}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email Date</th>
                <th>Team #</th>
                <th>Team Name</th>
                <th>Coach Name/Recipient</th>
                <th>Email Purpose</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">
                    No emails logged yet.
                  </td>
                </tr>
              )}
              {sorted.map((e) => (
                <tr key={e.i}>
                  <td className="whitespace-nowrap">{shortDate(e.date)}</td>
                  <td>{e.teamNumber}</td>
                  <td>{teamName(e.teamNumber)}</td>
                  <td>{e.recipient}</td>
                  <td className="whitespace-nowrap">{e.purpose}</td>
                  <td>{e.notes}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setEmails((list) => list.filter((_, j) => j !== e.i))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
