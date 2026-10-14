"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ACTION_META, type ActionType } from "@/lib/schema";
import ActionChip from "@/components/ActionChip";

type Item = {
  id: string;
  title: string;
  summary: string;
  start: string;
  end: string | null;
  parties: string[];
  types: ActionType[];
  states: string[];
};

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
  const sel = "bg-bg-3 border border-line-2 rounded-md px-3 py-1.5 text-sm text-ink";
  return (
    <div>
      <div className="flex flex-wrap gap-3 mt-8">
        <input className={sel} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={sel} value={party} onChange={(e) => setParty(e.target.value)}>
          <option value="">Any party in power</option>
          {parties.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className={sel} value={type} onChange={(e) => setType(e.target.value as ActionType | "")}>
          <option value="">Any action</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {ACTION_META[t].label}
            </option>
          ))}
        </select>
        <span className="mono text-xs text-ink-3 self-center">{shown.length} shown</span>
      </div>
      <ol className="mt-8 divide-y divide-line">
        {shown.map((i) => (
          <li key={i.id} className="py-5 grid gap-2 sm:grid-cols-[110px_1fr]">
            <span className="mono text-xs text-ink-3 pt-1">
              {i.start.slice(0, 4)}
              {i.end === null ? "–" : i.end && i.end.slice(0, 4) !== i.start.slice(0, 4) ? `–${i.end.slice(2, 4)}` : ""}
            </span>
            <div>
              <Link href={`/precedents/${i.id}/`} className="quiet display text-xl hover:text-accent">
                {i.title}
              </Link>
              <span className="text-xs text-ink-3 ml-3">{i.parties.join(" · ")}</span>
              <p className="text-sm text-ink-2 mt-1 max-w-3xl">{i.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {i.types.map((t) => (
                  <ActionChip key={t} type={t} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
