import { getPrecedents } from "@/lib/content";
import PrecedentList from "./PrecedentList";

export const metadata = { title: "Precedents" };

export default function PrecedentsPage() {
  const ps = getPrecedents().map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    start: p.period.start,
    end: p.period.end ?? null,
    parties: [p.government.centre.party, ...(p.government.state ? [p.government.state.party] : [])],
    types: [...new Set(p.actions.map((a) => a.type))],
    states: p.location.states,
  }));
  return (
    <div>
      <p className="eyebrow">The record</p>
      <h1 className="display text-4xl mt-2">Precedents</h1>
      <p className="text-ink-2 mt-3 max-w-2xl">
        Every entry is one protest and one government&apos;s answer to it. Filter by the party in charge or by
        the kind of action taken.
      </p>
      <PrecedentList items={ps} />
    </div>
  );
}
