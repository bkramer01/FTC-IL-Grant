"use client";

import { useState } from "react";
import { centralDateTime } from "@/lib/format";

/**
 * MOCKUP: pretends to pull both Google Sheets ("Form Responses 1" and
 * "biobuzz - including unpaid") and updates the last-refreshed time.
 */
export function RefreshButton({ initialRefreshedAt }: { initialRefreshedAt: string }) {
  const [refreshedAt, setRefreshedAt] = useState(initialRefreshedAt);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function refresh() {
    setBusy(true);
    setDone(false);
    setTimeout(() => {
      setRefreshedAt(new Date().toISOString());
      setBusy(false);
      setDone(true);
    }, 900);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-muted" aria-live="polite">
        Last refreshed: <strong className="text-ink">{centralDateTime(refreshedAt)}</strong>
        {done && <span className="ml-2 text-success">✓ Mockup refresh. The real button pulls both Google Sheets.</span>}
      </span>
      <button type="button" className="btn btn-primary btn-sm" onClick={refresh} disabled={busy}>
        <span aria-hidden className={busy ? "inline-block animate-spin" : ""}>
          ⟳
        </span>
        {busy ? "Refreshing…" : "Refresh Data"}
      </button>
    </div>
  );
}
