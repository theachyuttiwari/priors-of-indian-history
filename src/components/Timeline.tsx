import type { Precedent } from "@/lib/schema";
import { ACTION_META } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import Glyph from "./Glyph";

const ACTOR: Record<string, string> = {
  centre: "Centre",
  state: "State government",
  police: "Police",
  court: "Court",
  other: "Other",
};

export default function Timeline({ p }: { p: Precedent }) {
  const actions = [...p.actions].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const src = new Map(p.sources.map((s) => [s.id, s]));
  const num = new Map(p.sources.map((s, i) => [s.id, i + 1]));
  return (
    <ol className="timeline">
      {actions.map((a, i) => (
        <li key={i} className="tl-item">
          <span className="tl-date num">{fmtDate(a.date) || "Date not recorded"}</span>
          <span className="tl-glyph">
            <Glyph group={ACTION_META[a.type].group} />
          </span>
          <div className="tl-body">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-semibold">{ACTION_META[a.type].label}</span>
              <span className="small">{ACTOR[a.actor] ?? a.actor}</span>
              {a.sources.map((id) => {
                const s = src.get(id);
                return s ? (
                  <a key={id} href={s.url} target="_blank" rel="noreferrer" className="link small num" title={`${s.publisher || s.title}`}>
                    [{num.get(id)}]
                  </a>
                ) : null;
              })}
            </p>
            <p className="text-[15px] text-ink-2 mt-1 measure">{a.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
