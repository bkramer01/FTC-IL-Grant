"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import type { YesNo } from "@/lib/grant";

/** Compact picker for a table cell: a blank choice ("—") plus the given options. */
export function ChoiceSelect<T extends string>({
  value,
  onChange,
  label,
  options,
  width = "4.5rem",
  blankLabel = "—",
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  label: string;
  options: readonly T[];
  width?: string;
  /** Text for the empty choice. */
  blankLabel?: string;
}) {
  return (
    <select
      aria-label={label}
      className="cell-input !min-w-0"
      style={{ width }}
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || null) as T | null)}
    >
      <option value="">{blankLabel}</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

const YES_NO = ["Yes", "No"] as const;

/** Yes / No / blank picker for a table cell. */
export function YesNoSelect(props: { value: YesNo | null; onChange: (v: YesNo | null) => void; label: string }) {
  return <ChoiceSelect {...props} options={YES_NO} />;
}

export function YesNoBadge({ value }: { value: string }) {
  if (value === "Yes") return <span className="badge badge-success">Yes</span>;
  if (value === "No") return <span className="badge badge-danger">No</span>;
  // Anything else (e.g. a mistaken answer on the form) is cut short; hover shows it all.
  return (
    <span className="inline-block max-w-24 truncate align-bottom text-muted" title={value}>
      {value}
    </span>
  );
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

/**
 * Whole-dollar input that shows "$1,050" like the rest of the site, and plain digits while
 * you type. Blank stays null; "$" and commas typed by hand are ignored.
 */
export function MoneyInput({
  value,
  onChange,
  label,
  commitOnBlur = false,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
  /** Report the amount on leaving the box instead of on every keystroke. */
  commitOnBlur?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<number | null>(null);
  const shown = commitOnBlur ? draft : value;
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      className="cell-input text-center"
      value={editing ? (shown ?? "") : money(value)}
      onFocus={() => {
        setEditing(true);
        setDraft(value);
      }}
      onBlur={() => {
        setEditing(false);
        if (commitOnBlur && draft !== value) onChange(draft);
      }}
      onKeyDown={(e) => {
        if (commitOnBlur && e.key === "Enter") e.currentTarget.blur();
      }}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^\d]/g, "");
        const v = digits === "" ? null : Number(digits);
        if (commitOnBlur) setDraft(v);
        else onChange(v);
      }}
    />
  );
}

/**
 * A text or date box that reports its value on leaving the box (or Enter), so a half-typed
 * value doesn't count as filled in.
 */
export function CommitInput({
  value,
  onCommit,
  clean = (v) => v,
  ...props
}: {
  value: string;
  onCommit: (v: string) => void;
  /** Applied to what's typed, e.g. to drop characters that aren't allowed. */
  clean?: (v: string) => string;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "onFocus" | "onBlur" | "onKeyDown">) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      {...props}
      value={draft ?? value}
      onFocus={() => setDraft(value)}
      onChange={(e) => setDraft(clean(e.target.value))}
      onBlur={() => {
        if (draft !== null && draft !== value) onCommit(draft);
        setDraft(null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

/** Raised by Team can't start from the form: its HQ grant amount isn't a number. */
export function HqAmountError({ value }: { value: string }) {
  return (
    <span
      className="badge badge-danger cursor-help"
      title={`The form's HQ grant amount is "${value}", which isn't a number. Fix it in the Google Sheet (it's copied on the next Refresh Data) or type the amount on the Applications page.`}
    >
      error
    </span>
  );
}

/** Team # as a number, or what the coach typed (with a red flag) when it isn't one number. */
export function TeamNumber({ app }: { app: { teamNumber: number; teamNumberText: string } }) {
  if (Number.isFinite(app.teamNumber)) return <>{app.teamNumber}</>;
  return (
    <span
      className="cursor-help"
      title={`The form's Team Number is "${app.teamNumberText}", not a single team number. Fix it in the Google Sheet (one team per response) and click Refresh Data.`}
    >
      <span className="whitespace-normal">{app.teamNumberText || "(blank)"}</span>{" "}
      <span className="badge badge-danger">not one team #</span>
    </span>
  );
}
