"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * A second horizontal scrollbar, rendered as a table header row so it sits just under
 * the column headings. It stays in view (sticky) and scrolls together with the table's
 * own scroll container. Hidden when the table fits.
 */
export function HeaderScrollbar({
  scrollerRef,
  colSpan,
}: {
  scrollerRef: RefObject<HTMLDivElement | null>;
  colSpan: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ view: 0, content: 0 });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // ResizeObserver also fires once on observe, which gives the first measurement.
    const ro = new ResizeObserver(() => setSize({ view: el.clientWidth, content: el.scrollWidth }));
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    const onScroll = () => {
      const bar = barRef.current;
      if (bar && bar.scrollLeft !== el.scrollLeft) bar.scrollLeft = el.scrollLeft;
    };
    el.addEventListener("scroll", onScroll);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [scrollerRef]);

  if (size.content <= size.view) return null;
  return (
    <tr aria-hidden>
      <th colSpan={colSpan} className="!border-0 !bg-white !p-0">
        <div
          ref={barRef}
          className="sticky left-0 overflow-x-auto"
          style={{ width: size.view }}
          onScroll={(e) => {
            const el = scrollerRef.current;
            if (el && el.scrollLeft !== e.currentTarget.scrollLeft) el.scrollLeft = e.currentTarget.scrollLeft;
          }}
        >
          <div style={{ width: size.content, height: 1 }} />
        </div>
      </th>
    </tr>
  );
}
