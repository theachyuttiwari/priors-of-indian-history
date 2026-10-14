/** Date formatting shared by server and client components. No Node imports here. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function year(d: string): string {
  return d.slice(0, 4);
}

/** `2020`, `2020-11` or `2020-11-26` to `2020`, `Nov 2020` or `26 Nov 2020`. */
export function fmtDate(d?: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  if (!m) return y;
  if (!day) return `${MONTHS[+m - 1]} ${y}`;
  return `${+day} ${MONTHS[+m - 1]} ${y}`;
}

/** A period in full. A missing end means the event is ongoing. */
export function fmtPeriod(p: { start: string; end?: string | null }): string {
  const s = fmtDate(p.start);
  if (p.end === null || p.end === undefined) return `${s} – ongoing`;
  if (p.start === p.end) return s;
  return `${s} – ${fmtDate(p.end)}`;
}

/** A period as compact years: `2020`, `2020–21`, `1999–2001`, or `2020–` when ongoing. */
export function years(start: string, end?: string | null): string {
  const s = year(start);
  if (end === null || end === undefined) return `${s}–`;
  const e = year(end);
  if (e === s) return s;
  return s.slice(0, 2) === e.slice(0, 2) ? `${s}–${e.slice(2)}` : `${s}–${e}`;
}
