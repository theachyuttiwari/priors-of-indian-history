import { fmtDate, reviewStatus } from "@/lib/content";
import type { Precedent } from "@/lib/schema";
import { CORRECTION_FORM } from "@/lib/site";

/** Says plainly whether a person has checked this entry, and how to report an error. */
export default function ReviewNote({ p, className = "" }: { p: Precedent; className?: string }) {
  const status = reviewStatus(p);
  const { by, date } = p.review ?? {};
  const text =
    status === "verified"
      ? `Verified by ${by} on ${fmtDate(date)}. Quotes checked by a second reader.`
      : status === "checked"
        ? `Checked by ${by ?? "a person"} on ${fmtDate(date)}. Every source opened.`
        : "Draft. Written with AI help from the sources listed. Not yet checked by a person.";
  return (
    <p className={`small panel inline-block px-3 py-2 ${className}`}>
      <span className={status === "draft" ? "font-semibold text-ink" : "text-ink-2"}>{text}</span>{" "}
      <a href={CORRECTION_FORM} className="link whitespace-nowrap" rel="noreferrer">
        Report an error
      </a>
    </p>
  );
}

/** A short form for lists. Nothing is shown once an entry has been checked. */
export function DraftTag({ p }: { p: Precedent }) {
  return reviewStatus(p) === "draft" ? <span className="small">Draft, not yet checked by a person</span> : null;
}
