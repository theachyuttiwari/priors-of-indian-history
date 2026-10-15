"use client";
import { useState } from "react";
import Link from "next/link";
import { ACTION_META, type ActionType } from "@/lib/schema";
import PartyFlag from "@/components/PartyFlag";

type Row = { party: string; slug: string; cases: number; counts: Partial<Record<ActionType, number>> };

/** Phone view of the compare grid: one action at a time, every party ranked on the same scale. */
export default function ByAction({ rows, types, initial }: { rows: Row[]; types: ActionType[]; initial: ActionType }) {
  const [type, setType] = useState<ActionType>(initial);
  const ranked = [...rows].sort(
    (a, b) => (b.counts[type] ?? 0) - (a.counts[type] ?? 0) || a.party.localeCompare(b.party),
  );
  const max = Math.max(1, ...rows.map((r) => r.counts[type] ?? 0));
  return (
    <div>
      <label className="flex items-center gap-3">
        <select
          className="field flex-1"
          aria-label="Action"
          value={type}
          onChange={(e) => setType(e.target.value as ActionType)}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {ACTION_META[t].label}
            </option>
          ))}
        </select>
      </label>
      <ol className="rows mt-4 border-t border-line" aria-live="polite">
        {ranked.map((r) => {
          const v = r.counts[type] ?? 0;
          return (
            <li key={r.party} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 py-3 items-baseline">
              <Link
                href={`/parties/${r.slug}/`}
                className="quiet font-semibold truncate inline-flex items-center gap-2"
                title={r.party}
              >
                <PartyFlag party={r.party} />
                <span className="truncate">{r.party}</span>
              </Link>
              <span className={`num text-right ${v ? "" : "text-ink-3"}`}>{v}</span>
              <span className="col-span-2 flex items-center gap-3">
                <span className="h-1.5 rounded-full bg-surface flex-1 overflow-hidden">
                  <span className="block h-full rounded-full bg-ink-2" style={{ width: `${(v / max) * 100}%` }} />
                </span>
                <span className="small num w-16 text-right">
                  {r.cases} {r.cases === 1 ? "case" : "cases"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
