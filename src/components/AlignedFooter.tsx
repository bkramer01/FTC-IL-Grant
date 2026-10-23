"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/**
 * Extra footer rows shown below a table's scroll box (so they don't scroll with it), with
 * their columns lined up under the table's: it copies the widths of the table's heading
 * cells and follows the box when it scrolls sideways.
 */
export function AlignedFooter({
  tableRef,
  scrollerRef,
  className = "",
  children,
}: {
  /** The main table; its first heading row sets the column widths. */
  tableRef: RefObject<HTMLTableElement | null>;
  /** The main table's scroll box. */
  scrollerRef: RefObject<HTMLDivElement | null>;
  className?: string;
  /** <tr> rows, using colSpan like the main table's Total row. */
  children: ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ widths: number[]; table: number; box: number } | null>(null);

  // Measure after every render (cheap: one row of headings) and only update when it changed.
  useLayoutEffect(() => {
    const measure = () => {
      const table = tableRef.current;
      const box = scrollerRef.current;
      if (!table || !box) return;
      const ths = [...table.querySelectorAll<HTMLTableCellElement>("thead tr:first-child > th")];
      const next = {
        widths: ths.map((th) => th.getBoundingClientRect().width),
        table: table.getBoundingClientRect().width,
        box: box.clientWidth,
      };
      setLayout((cur) => (cur && JSON.stringify(cur) === JSON.stringify(next) ? cur : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tableRef.current) ro.observe(tableRef.current);
    if (scrollerRef.current) ro.observe(scrollerRef.current);
    return () => ro.disconnect();
  });

  // Follow the box's sideways scrolling. Re-attached after every render, so it always
  // listens to the box that's on the page now.
  useEffect(() => {
    const box = scrollerRef.current;
    if (!box) return;
    const sync = () => {
      if (outerRef.current) outerRef.current.scrollLeft = box.scrollLeft;
    };
    sync();
    box.addEventListener("scroll", sync, { passive: true });
    return () => box.removeEventListener("scroll", sync);
  });

  return (
    <div ref={outerRef} className="overflow-hidden" style={layout ? { width: layout.box } : undefined}>
      <table
        className={`data-table ${className}`}
        style={layout ? { tableLayout: "fixed", width: layout.table } : undefined}
      >
        {layout && (
          <colgroup>
            {layout.widths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
        )}
        <tfoot>{children}</tfoot>
      </table>
    </div>
  );
}
