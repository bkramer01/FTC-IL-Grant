import type { Metadata } from "next";
import { buildApplications } from "@/lib/applications";
import { loadClientGrantData } from "@/lib/data";
import { todayCentral } from "@/lib/format";
import { EmailLog } from "./EmailLog";

export const metadata: Metadata = { title: "Email Log" };

export default async function EmailLogPage() {
  const data = await loadClientGrantData();
  // Team # → team name and coach, to fill in the recipient when adding an email.
  const teams = new Map<number, { teamNumber: number; teamName: string | null; coach: string; email: string }>();
  for (const a of buildApplications(data)) {
    // A Team Number answer that isn't a single number can't have emails logged against it.
    if (!Number.isFinite(a.teamNumber)) continue;
    teams.set(a.teamNumber, { teamNumber: a.teamNumber, teamName: a.teamName, coach: a.coach, email: a.email });
  }
  return (
    <EmailLog
      initialEmails={data.emails}
      teams={[...teams.values()].sort((a, b) => a.teamNumber - b.teamNumber)}
      today={todayCentral()}
    />
  );
}
