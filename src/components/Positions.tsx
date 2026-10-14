import type { Precedent } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import PartyMark from "./PartyMark";

export default function Positions({ p }: { p: Precedent }) {
  const src = new Map(p.sources.map((s) => [s.id, s]));
  const num = new Map(p.sources.map((s, i) => [s.id, i + 1]));
  if (p.positions.length === 0) return null;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {p.positions.map((pos, i) => (
        <blockquote key={i} className="quote">
          <p className="stance">{pos.in_power ? "In power" : "In opposition"}</p>
          <p className="mt-1 leading-relaxed">“{pos.statement}”</p>
          <footer className="mt-2 small flex flex-wrap gap-x-3 gap-y-1 items-baseline">
            <PartyMark party={pos.party} />
            {pos.person && (
              <span className="text-ink-2">
                {pos.person}
                {pos.role_at_time ? `, ${pos.role_at_time}` : ""}
              </span>
            )}
            {pos.date && <span className="num">{fmtDate(pos.date)}</span>}
            {pos.sources.map((id) => {
              const s = src.get(id);
              return s ? (
                <a key={id} href={s.url} target="_blank" rel="noreferrer" className="link num" title={s.publisher || s.title}>
                  [{num.get(id)}]
                </a>
              ) : null;
            })}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
