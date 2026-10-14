import type { Precedent } from "@/lib/schema";
import { fmtDate } from "@/lib/content";

export default function Sources({ p }: { p: Precedent }) {
  return (
    <ol className="space-y-2 text-sm">
      {p.sources.map((s) => (
        <li key={s.id} className="flex gap-3">
          <span className="mono text-xs text-ink-3 w-8 shrink-0">{s.id}</span>
          <span>
            <a href={s.url} target="_blank" rel="noreferrer" className="link">
              {s.title}
            </a>
            <span className="text-ink-3">
              {" "}
              — {s.publisher}
              {s.date ? `, ${fmtDate(s.date)}` : ""} · {s.type.replace("_", " ")}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
