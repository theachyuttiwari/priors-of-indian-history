import { entryParties, getPrecedents, whereLine } from "@/lib/content";
import PrecedentList from "./PrecedentList";

export const metadata = { title: "Precedents" };

export default function PrecedentsPage() {
  const ps = [...getPrecedents()].reverse().map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    start: p.period.start,
    end: p.period.end ?? null,
    where: whereLine(p),
    parties: entryParties(p),
    types: [...new Set(p.actions.map((a) => a.type))],
    states: p.location.states,
  }));
  return (
    <div>
      <h1 className="t-1">Precedents</h1>
      <p className="lede mt-4 measure">
        Each entry is one protest and one government&apos;s answer to it. Filter by the party in charge or by the kind
        of action taken.
      </p>
      <PrecedentList items={ps} />
    </div>
  );
}
