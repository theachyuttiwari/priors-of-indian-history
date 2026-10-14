import type { Precedent } from "@/lib/schema";
import { ACTION_META } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import { groupColor } from "./ActionChip";

export default function Timeline({ p }: { p: Precedent }) {
  const actions = [...p.actions].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const src = new Map(p.sources.map((s) => [s.id, s]));
  return (
    <ol className="timeline space-y-5">
      {actions.map((a, i) => (
        <li key={i} className="relative pl-7">
          <span className="tl-dot" style={{ borderColor: groupColor(a.type) }} />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="mono text-xs text-ink-3 min-w-[90px]">{fmtDate(a.date) || "—"}</span>
            <span className="text-sm font-medium" style={{ color: groupColor(a.type) }}>
              {ACTION_META[a.type].label}
            </span>
            <span className="text-xs text-ink-3">by {a.actor}</span>
          </div>
          <p className="text-sm text-ink-2 mt-1 max-w-2xl">{a.description}</p>
          {a.sources.length > 0 && (
            <p className="mt-1 text-xs text-ink-3 flex flex-wrap gap-x-3 gap-y-1">
              {a.sources.map((id) => {
                const s = src.get(id);
                return s ? (
                  <a key={id} href={s.url} target="_blank" rel="noreferrer" className="link">
                    {s.publisher || s.title}
                  </a>
                ) : (
                  <span key={id}>{id}</span>
                );
              })}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
