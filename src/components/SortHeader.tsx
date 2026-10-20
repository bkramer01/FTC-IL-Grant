"use client";

import type { ReactNode } from "react";

export type Sort<K extends string> = { key: K; dir: 1 | -1 };

/** Clicking the active column reverses it; clicking another column sorts it ascending. */
export function nextSort<K extends string>(current: Sort<K>, key: K): Sort<K> {
  return current.key === key ? { key, dir: current.dir === 1 ? -1 : 1 } : { key, dir: 1 };
}

/** Compares two sort values in the given direction; null (blank) always sorts last. */
export function compareValues(va: number | string | null, vb: number | string | null, dir: 1 | -1) {
  if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
  if (typeof va === "number" && typeof vb === "number") return dir * (va - vb);
  return dir * String(va).localeCompare(String(vb), undefined, { numeric: true });
}

/** Column header that sorts the table when clicked. */
export function SortHeader<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className = "",
}: {
  label: ReactNode;
  sortKey: K;
  sort: Sort<K>;
  onSort: (k: K) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <th className={className} aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex cursor-pointer items-end gap-1 text-left font-[inherit] hover:text-link ${
          className.includes("num") ? "ml-auto" : ""
        }`}
      >
        <span>{label}</span>
        <span aria-hidden className={active ? "" : "text-muted/50"}>
          {active ? (sort.dir === 1 ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}
