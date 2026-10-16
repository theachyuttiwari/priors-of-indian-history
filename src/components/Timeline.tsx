import Link from "next/link";
import type { Precedent } from "@/lib/schema";
import { ACTION_META } from "@/lib/schema";
import { entryActions, firstSentence } from "@/lib/actions";
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

/**
 * What the government did, oldest first. Each action shows its first sentence; the rest of the
 * description, the legal basis, figures, court outcomes and source numbers fold under "More".
 * Native <details>, so it needs no client JS.
 */
export default function Timeline({ p }: { p: Precedent }) {
  const items = [...entryActions(p)].sort((a, b) => (a.a.date ?? "").localeCompare(b.a.date ?? ""));
  return (
    <ol className="timeline">
      {items.map((x) => {
        const a = x.a;
        const lead = firstSentence(a.description, 400);
        const rest = a.description.slice(lead.length).trim();
        const n = a.sources.length;
        return (
          <li key={x.slug} className="tl-item">
            <span className="tl-date num">{fmtDate(a.date) || "Date not recorded"}</span>
            <span className="tl-glyph">
              <span className="tl-dot" />
            </span>
            <div className="tl-body">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-semibold">{ACTION_META[a.type].label}</span>
                <span className="small">
                  {ACTOR[a.actor] ?? a.actor}
                  {a.state.length > 0 && a.state.length <= 2 && `, ${a.state.join(", ")}`}
                </span>
                <EvidenceMark claim={claimOf(a)} sources={p.sources.filter((s) => a.sources.includes(s.id))} />
                <Link href={x.href} className="small link ml-auto">
                  Share
                </Link>
              </p>
              <p className="text-[15px] text-ink-2 mt-1 measure">{lead}</p>
              <details className="tl-more mt-1.5">
                <summary className="small">
                  <span className="tl-more-label">
                    <span className="tl-closed">More</span>
                    <span className="tl-opened">Less</span>
                  </span>
                  &nbsp;· {n} {n === 1 ? "source" : "sources"}
                </summary>
                {rest && <p className="text-[15px] text-ink-2 mt-2 measure">{rest}</p>}
                {a.legal_basis && <p className="small mt-2">Legal basis: {a.legal_basis}</p>}
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
                <p className="small mt-2 flex flex-wrap gap-x-2">
                  Sources <SourceRefs p={p} ids={a.sources} />
                </p>
              </details>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
