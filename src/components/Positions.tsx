import type { Precedent } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import PartyMark from "./PartyMark";
import SourceRefs from "./SourceRefs";
import StatementText from "./StatementText";

export default function Positions({ p }: { p: Precedent }) {
  if (p.positions.length === 0) return null;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {p.positions.map((pos, i) => (
        <blockquote key={i} className="quote">
          <p className="stance">{pos.in_power ? "In power" : "In opposition"}</p>
          <div className="mt-1">
            <StatementText p={p} pos={pos} />
          </div>
          <footer className="mt-2 small flex flex-wrap gap-x-3 gap-y-1 items-baseline">
            <PartyMark party={pos.party} />
            {pos.person && (
              <span className="text-ink-2">
                {pos.person}
                {pos.role_at_time ? `, ${pos.role_at_time}` : ""}
              </span>
            )}
            {pos.date && <span className="num">{fmtDate(pos.date)}</span>}
            <SourceRefs p={p} ids={pos.sources} />
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
