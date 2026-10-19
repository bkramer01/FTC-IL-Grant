const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function money(n: number | null | undefined) {
  if (n === null || n === undefined) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** "2026-10-06" → "Oct 6, 2026". */
export function shortDate(iso: string | null | undefined) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Today's date in Central time as "YYYY-MM-DD". */
export function todayCentral(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

/** A timestamp in Central time, e.g. "Oct 12, 2026, 7:54 PM CDT". */
export function centralDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
