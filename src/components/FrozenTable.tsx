"use client";

import { useRef, type ReactNode } from "react";
import { HeaderScrollbar } from "./HeaderScrollbar";

/**
 * A wide table in a window-height scroll box: the heading row stays frozen at the top
 * as you scroll down, with a sideways scrollbar just under it (plus the usual one at the
 * bottom of the box).
 */
export function FrozenTable({
  head,
  children,
  colSpan,
  className = "",
}: {
  /** The heading row(s), rendered inside <thead>. */
  head: ReactNode;
  /** The body rows, rendered inside <tbody>. */
  children: ReactNode;
  /** Number of columns, so the scrollbar row spans the table. */
  colSpan: number;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="max-h-[calc(100vh-7rem)] overflow-auto" ref={scrollerRef}>
      <table className={`data-table sticky-head ${className}`}>
        <thead>
          {head}
          <HeaderScrollbar scrollerRef={scrollerRef} colSpan={colSpan} />
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
