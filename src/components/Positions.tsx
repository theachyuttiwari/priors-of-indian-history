import type { Precedent } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import PartyMark from "./PartyMark";

export default function Positions({ p }: { p: Precedent }) {
  const src = new Map(p.sources.map((s) => [s.id, s]));
  if (p.positions.length === 0) return null;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {p.positions.map((pos, i) => (
        <blockquote key={i} className={`quote ${pos.in_power ? "power" : "opp"}`}>
          <p className="text-sm leading-relaxed">“{pos.statement}”</p>
          <footer className="mt-2 text-xs text-ink-3 flex flex-wrap gap-x-2 items-baseline">
            <PartyMark party={pos.party} />
            {pos.person && <span className="text-ink-2">{pos.person}</span>}
            {pos.role_at_time && <span>· {pos.role_at_time}</span>}
            <span className={`chip ${pos.in_power ? "text-accent" : "text-cool"}`}>{pos.in_power ? "in power" : "in opposition"}</span>
            {pos.date && <span className="mono">{fmtDate(pos.date)}</span>}
            {pos.sources.map((id) => {
              const s = src.get(id);
              return s ? (
                <a key={id} href={s.url} target="_blank" rel="noreferrer" className="link">
                  source
                </a>
              ) : null;
            })}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
