"use client";

import { useState } from "react";
import type { computeTotals } from "@/lib/applications";
import { downloadBlob } from "@/lib/export";
import { grantMatchingReport, reportFileName } from "@/lib/report";

/** Downloads the Grant Matching Totals table as a formatted Excel file. */
export function ReportButton({
  totals,
  askPeriod,
}: {
  totals: ReturnType<typeof computeTotals>;
  /** The Ask Period filter's choice ("Unassigned" or an ask's name), or null for all. */
  askPeriod: string | null;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const now = new Date();
      const wb = await grantMatchingReport(totals, now, askPeriod);
      const buffer = await wb.xlsx.writeBuffer();
      downloadBlob(
        reportFileName(now),
        new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={download}
      disabled={busy}
      title="Download the Grant Matching Totals table as an Excel file"
    >
      ⤓ {busy ? "Building…" : "Grant Matching Report"}
    </button>
  );
}
