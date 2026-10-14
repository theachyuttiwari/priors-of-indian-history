import { getPrecedents } from "@/lib/content";
import { GlyphLegend } from "@/components/Glyph";
import PrecedentList from "./PrecedentList";

export const metadata = { title: "Precedents" };

export default function PrecedentsPage() {
  const ps = [...getPrecedents()].reverse().map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    start: p.period.start,
    end: p.period.end ?? null,
    where: p.government.state
      ? `${p.government.state.party} in ${p.government.state.name}, ${p.government.centre.party} at the Centre`
      : `${p.government.centre.party} at the Centre`,
    parties: [p.government.centre.party, ...(p.government.state ? [p.government.state.party] : [])],
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
      <GlyphLegend className="mt-6" />
      <PrecedentList items={ps} />
    </div>
  );
}
