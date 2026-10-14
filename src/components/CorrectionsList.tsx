import { fmtDate } from "@/lib/content";
import type { Correction } from "@/lib/schema";

const KIND: Record<Correction["kind"], string> = {
  correction: "Correction",
  clarification: "Clarification",
  update: "Update",
};

/** The change log of one entry. An error is always called a correction. */
export default function CorrectionsList({ items }: { items: Correction[] }) {
  return (
    <ol className="rows border-t border-line">
      {[...items]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((c, i) => (
          <li key={i} className="py-3 grid grid-cols-[6.5rem_1fr] gap-3">
            <time className="small num" dateTime={c.date}>
              {fmtDate(c.date)}
            </time>
            <p className="text-[15px] text-ink-2">
              <span className="font-semibold text-ink">{KIND[c.kind]}.</span> {c.note}
            </p>
          </li>
        ))}
    </ol>
  );
}
