import Link from "next/link";
import type { Precedent } from "@/lib/schema";
import { fmtPeriod } from "@/lib/content";
import ActionChip from "./ActionChip";
import type { ActionType } from "@/lib/schema";

export default function PrecedentCard({
  p,
  href,
  highlight,
}: {
  p: Precedent;
  href?: string;
  highlight?: ActionType[];
}) {
  const types = [...new Set(p.actions.map((a) => a.type))];
  const counts = Object.fromEntries(types.map((t) => [t, p.actions.filter((a) => a.type === t).length]));
  const govt = p.government.state ?? p.government.centre;
  return (
    <Link href={href ?? `/precedents/${p.id}/`} className="card quiet block p-5 group">
      <div className="flex items-baseline justify-between gap-4">
        <span className="mono text-xs text-ink-3">{fmtPeriod(p.period)}</span>
        <span className="text-xs text-ink-3 truncate">
          {govt.party}
          {p.government.state ? ` · centre ${p.government.centre.party}` : ""}
        </span>
      </div>
      <h3 className="display text-xl mt-2 group-hover:text-accent transition-colors">{p.title}</h3>
      <p className="text-sm text-ink-2 mt-2 line-clamp-3">{p.summary}</p>
      <div className="flex flex-wrap gap-1.5 mt-4">
        {types.slice(0, 6).map((t) => (
          <span key={t} className={highlight && !highlight.includes(t) ? "opacity-40" : ""}>
            <ActionChip type={t} count={counts[t]} />
          </span>
        ))}
        {types.length > 6 && <span className="chip">+{types.length - 6}</span>}
      </div>
    </Link>
  );
}
