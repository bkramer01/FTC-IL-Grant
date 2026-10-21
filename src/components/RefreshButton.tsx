"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { refreshSheetsAction } from "@/app/(admin)/actions";
import { centralDateTime } from "@/lib/format";

/**
 * Refresh Data: reads the grant form responses and the BioBuzz team list from Google
 * Sheets, saves them, and reloads the page's data. Shows when it last ran.
 */
export function RefreshButton({ initialRefreshedAt }: { initialRefreshedAt: string | null }) {
  const router = useRouter();
  const [refreshedAt, setRefreshedAt] = useState(initialRefreshedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function refresh() {
    setBusy(true);
    setError(null);
    const result = await refreshSheetsAction();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRefreshedAt(result.refreshedAt);
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-muted" aria-live="polite">
        Last refreshed:{" "}
        <strong className="text-ink">{refreshedAt ? centralDateTime(refreshedAt) : "never"}</strong>
      </span>
      <button type="button" className="btn btn-primary btn-sm" onClick={refresh} disabled={busy}>
        <span aria-hidden className={busy ? "inline-block animate-spin" : ""}>
          ⟳
        </span>
        {busy ? "Refreshing…" : "Refresh Data"}
      </button>
      {error && (
        <span role="alert" className="basis-full text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
