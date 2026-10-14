import type { Precedent } from "@/lib/schema";
import { fmtDate } from "@/lib/content";

export default function Sources({ p }: { p: Precedent }) {
  return (
    <ol className="space-y-3 text-[15px] measure">
      {p.sources.map((s, i) => (
        <li key={s.id} className="grid grid-cols-[2rem_1fr]">
          <span className="num text-ink-3">{i + 1}</span>
          <span>
            <a href={s.url} target="_blank" rel="noreferrer" className="link">
              {s.title}
            </a>
            <span className="block small">
              {[s.publisher, s.date ? fmtDate(s.date) : "", s.type.replace("_", " ")].filter(Boolean).join(", ")}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
