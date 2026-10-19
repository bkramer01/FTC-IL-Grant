"use client";

import type { YesNo } from "@/lib/grant";

/** Yes / No / blank picker for a table cell. */
export function YesNoSelect({
  value,
  onChange,
  label,
}: {
  value: YesNo | null;
  onChange: (v: YesNo | null) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      className="cell-input !w-[4.5rem] !min-w-0"
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || null) as YesNo | null)}
    >
      <option value="">—</option>
      <option>Yes</option>
      <option>No</option>
    </select>
  );
}

export function YesNoBadge({ value }: { value: string }) {
  if (value === "Yes") return <span className="badge badge-success">Yes</span>;
  if (value === "No") return <span className="badge badge-danger">No</span>;
  return <span className="text-muted">{value}</span>;
}

/** Link to a file the coach uploaded on the form (Google Drive). */
export function FileLink({ href, children }: { href: string; children: string }) {
  if (!href) return <span className="text-muted">no file</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap">
      {children} ↗
    </a>
  );
}

/** Number input that keeps blank as null. */
export function NumberInput({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
}) {
  return (
    <input
      type="number"
      min={0}
      step={1}
      inputMode="numeric"
      aria-label={label}
      className="cell-input text-right"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    />
  );
}
