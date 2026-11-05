"use client";

import { useEffect, useRef, useState } from "react";
import type { AskPick } from "@/lib/applications";

/**
 * Looks like the Ask Period dropdown on Grant Matching Totals, but opens a list of checkboxes
 * so several Ask Periods can be shown at once. No picks means All Ask Periods.
 */
export function AskPeriodChecklist({
  options,
  picks,
  onChange,
}: {
  options: { value: AskPick; label: string }[];
  picks: AskPick[];
  onChange: (picks: AskPick[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const summary =
    picks.length === 0
      ? "All Ask Periods"
      : picks.length === 1
        ? options.find((o) => o.value === picks[0])?.label
        : `${picks.length} Ask Periods`;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="sr-only sm:not-sr-only">Ask Period</span>
      <div className="relative" ref={boxRef}>
        <button
          type="button"
          className="form-control select-look !w-auto !py-1 text-left text-sm whitespace-nowrap"
          aria-expanded={open}
          aria-label={`Ask Period filter: ${summary}`}
          onClick={() => setOpen((o) => !o)}
          title="Show only the approved teams in the Ask Periods you tick, on both tabs. The totals and Export follow."
        >
          {summary}
        </button>
        {open && (
          <div
            role="group"
            aria-label="Ask Periods to show"
            className="absolute right-0 z-30 mt-1 min-w-full rounded-md border border-line bg-white py-1 whitespace-nowrap shadow-md"
          >
            <label className="flex cursor-pointer items-center gap-2 px-3 py-1 hover:bg-[#e9ecef]">
              <input type="checkbox" checked={picks.length === 0} onChange={() => onChange([])} />
              All Ask Periods
            </label>
            {options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 px-3 py-1 hover:bg-[#e9ecef]">
                <input
                  type="checkbox"
                  checked={picks.includes(o.value)}
                  onChange={(e) =>
                    onChange(e.target.checked ? [...picks, o.value] : picks.filter((p) => p !== o.value))
                  }
                />
                {o.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
