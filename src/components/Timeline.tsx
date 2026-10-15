import Link from "next/link";
import type { Precedent } from "@/lib/schema";
import { entryActions } from "@/lib/actions";
import { ACTION_META } from "@/lib/schema";
import { fmtDate } from "@/lib/content";
import { claimOf } from "@/lib/evidence";
import { EvidenceMark } from "./Evidence";
import SourceRefs from "./SourceRefs";

const ACTOR: Record<string, string> = {
  centre: "Centre",
  state: "State government",
  police: "Police",
  court: "Court",
  other: "Other",
};

export default function Timeline({ p }: { p: Precedent }) {
  const pages = entryActions(p);
  const actions = [...p.actions].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  return (
    <ol className="timeline">
      {actions.map((a, i) => (
        <li key={i} className="tl-item">
          <span className="tl-date num">{fmtDate(a.date) || "Date not recorded"}</span>
          <span className="tl-glyph">
            <span className="tl-dot" />
          </span>
          <div className="tl-body">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-semibold">{ACTION_META[a.type].label}</span>
              <span className="small">{ACTOR[a.actor] ?? a.actor}</span>
              <SourceRefs p={p} ids={a.sources} className="small" />
              <EvidenceMark claim={claimOf(a)} sources={p.sources.filter((s) => a.sources.includes(s.id))} />
              <Link href={pages.find((x) => x.a === a)!.href} className="small link">
                Share
              </Link>
            </p>
            <p className="text-[15px] text-ink-2 mt-1 measure">{a.description}</p>
            {a.legal_basis && <p className="small mt-1">Under {a.legal_basis}</p>}
            {a.figures.length > 0 && (
              <ul className="figures mt-2">
                {a.figures.map((f, j) => (
                  <li key={j}>
                    <span className="num font-semibold text-ink">{f.value}</span> {f.what}
                    <span className="small">
                      , said {f.claimed_by} <SourceRefs p={p} ids={[f.source]} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {a.court_outcomes.map((c, j) => (
              <p key={j} className="text-[15px] text-ink-2 mt-2 measure">
                <span className="font-semibold text-ink">Court:</span> {c.summary}{" "}
                <SourceRefs p={p} ids={[c.source]} className="small" />
              </p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
