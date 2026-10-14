"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ACTION_META, type ActionType } from "@/lib/schema";
import { GroupGlyphs } from "@/components/Glyph";

type Item = {
  id: string;
  title: string;
  summary: string;
  start: string;
  end: string | null;
  where: string;
  parties: string[];
  types: ActionType[];
  states: string[];
};

function years(start: string, end: string | null) {
  const s = start.slice(0, 4);
  if (end === null) return `${s}–`;
  const e = end.slice(0, 4);
  return e === s ? s : `${s}–${e.slice(2)}`;
}

export default function PrecedentList({ items }: { items: Item[] }) {
  const [party, setParty] = useState<string>("");
  const [type, setType] = useState<ActionType | "">("");
  const [q, setQ] = useState("");
  const parties = useMemo(() => [...new Set(items.flatMap((i) => i.parties))].sort(), [items]);
  const types = useMemo(() => [...new Set(items.flatMap((i) => i.types))], [items]);
  const shown = items.filter(
    (i) =>
      (!party || i.parties.includes(party)) &&
      (!type || i.types.includes(type)) &&
      (!q || (i.title + i.summary + i.states.join(" ")).toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mt-10">
        <input className="field w-full sm:w-64" placeholder="Search titles, summaries, states" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field" aria-label="Party in power" value={party} onChange={(e) => setParty(e.target.value)}>
          <option value="">Any party in power</option>
          {parties.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className="field" aria-label="Action" value={type} onChange={(e) => setType(e.target.value as ActionType | "")}>
          <option value="">Any action</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {ACTION_META[t].label}
            </option>
          ))}
        </select>
        <span className="small num" aria-live="polite">
          {shown.length} of {items.length}
        </span>
      </div>
      {shown.length === 0 && <p className="mt-10 text-ink-2">No precedent matches. Clear a filter to see more.</p>}
      <div className="rows mt-6 border-t border-line">
        {shown.map((i) => (
          <Link key={i.id} href={`/precedents/${i.id}/`} className="row quiet">
            <span className="num text-ink-3 text-[15px]">{years(i.start, i.end)}</span>
            <span>
              <span className="row-title">{i.title}</span>
              <span className="block small mt-0.5">{i.where}</span>
              <span className="block text-[15px] text-ink-2 mt-2 line-clamp-2 measure">{i.summary}</span>
            </span>
            <GroupGlyphs types={i.types} highlight={type ? [type] : undefined} />
          </Link>
        ))}
      </div>
    </div>
  );
}
