import type { Metadata } from "next";
import Link from "next/link";
import { FrozenTable } from "@/components/FrozenTable";
import { Card } from "@/components/SiteChrome";
import { loadGrantData } from "@/lib/data";
import { centralDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Form Responses" };

const SHORT_HEADERS = [
  "Timestamp",
  "Email Address",
  "Got a grant last year & did the survey",
  "Team is in the green",
  "Team Number",
  "Coach Name",
  "Team Category",
  "Grant from FIRST HQ?",
  "HQ grant amount",
  "Team location (city)",
  "Volunteers (2 or more)",
  "Matching grant letter",
  "Make the check out to",
  "School or community team",
  "Street Address",
  "City State",
  "VRS screenshot",
  "The VRS 6 Challenges",
  "Zip",
];

/** Read-only copy of the "Form Responses 1" tab, as last pulled by Refresh Data. */
export default function ResponsesPage() {
  const { responses, refreshedAt } = loadGrantData();
  return (
    <>
      <h1 className="mb-1 text-3xl">Form Responses</h1>
      <p className="mb-4 text-muted">
        Read-only view of the grant form&apos;s Google Sheet (&ldquo;Form Responses 1&rdquo;) as of{" "}
        <strong className="text-ink">{centralDateTime(refreshedAt)}</strong>. Use <strong>Refresh Data</strong> on{" "}
        the <Link href="/">Dashboard</Link> to pull new responses. Hover a column heading for the full question.
      </p>
      <Card title={`Responses (${responses.rows.length})`}>
        <FrozenTable
          className="text-xs"
          colSpan={responses.headers.length}
          head={
            <tr>
              {responses.headers.map((h, i) => (
                <th key={i} title={h} className="!whitespace-normal min-w-28">
                  {SHORT_HEADERS[i] ?? h}
                </th>
              ))}
            </tr>
          }
        >
          {responses.rows.map((r) => (
            <tr key={r[0]}>
              {r.map((v, i) => (
                <td key={i} className={i === 0 ? "whitespace-nowrap" : ""}>
                  {/^https?:\/\//.test(v) ? (
                    <a href={v} target="_blank" rel="noopener noreferrer">
                      Open file ↗
                    </a>
                  ) : (
                    v
                  )}
                </td>
              ))}
            </tr>
          ))}
        </FrozenTable>
      </Card>
    </>
  );
}
