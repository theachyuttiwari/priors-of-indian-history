import type { Precedent } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import { TierBadge, credit, languageName } from "./Evidence";

export default function Sources({ p }: { p: Precedent }) {
  return (
    <ol className="space-y-4 text-[15px] measure">
      {p.sources.map((s, i) => (
        <li key={s.id} id={`source-${s.id}`} className="grid grid-cols-[2rem_1fr] scroll-mt-24">
          <span className="num text-ink-3">{i + 1}</span>
          <span>
            <a href={s.url} target="_blank" rel="noreferrer" className="link">
              {s.title}
            </a>
            <span className="block small mt-0.5">
              {[
                credit(s),
                s.author,
                s.date ? fmtDate(s.date) : "",
                s.language !== "en" ? `In ${languageName(s.language)}` : "",
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <TierBadge s={s} />
              {s.archive_url && (
                <a href={s.archive_url} target="_blank" rel="noreferrer" className="small link">
                  Archived{s.archive_date ? ` ${fmtDate(s.archive_date)}` : ""}
                </a>
              )}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
