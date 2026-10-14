import { independenceKey, isLeadUrl, leadOnly, meetsMinimum, tierOf } from "@/lib/evidence";
import { TIER_META, type Claim, type Source } from "@/lib/schema";

const LANG = new Intl.DisplayNames(["en"], { type: "language" });
export function languageName(code: string): string {
  try {
    return LANG.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "PTI via The Tribune": the wire is the source; the outlet only carried it (decision H). */
export function credit(s: Source): string {
  return s.wire ? `${s.wire} via ${s.publisher || "an outlet"}` : s.publisher;
}

/** The evidence tier of one source, as a small badge. */
export function TierBadge({ s }: { s: Source }) {
  const t = tierOf(s);
  if (!t) return <span className="tier tier-none">Not yet rated</span>;
  const m = TIER_META[t];
  return (
    <span className={`tier ${t === "lead" ? "tier-lead" : ""}`} title={m.help}>
      T{m.rank} {m.label}
    </span>
  );
}

/**
 * A plain warning when a claim is thin (decision C): resting only on a lead such as Wikipedia,
 * or on a single source that does not meet the bar by itself. Nothing is shown when the bar is met.
 */
export function EvidenceMark({ claim, sources }: { claim: Claim | "said"; sources: Source[] }) {
  if (sources.length === 0) return <span className="mark">No source</span>;
  if (leadOnly(sources)) {
    const wiki = sources.every((s) => isLeadUrl(s.url) && s.url.includes("wikipedia.org"));
    return <span className="mark">{wiki ? "Wikipedia only" : "Lead source only"}</span>;
  }
  const independent = new Set(sources.filter((s) => tierOf(s) !== "lead").map(independenceKey)).size;
  if (independent === 1 && !meetsMinimum(claim, sources).ok) return <span className="mark">Single source</span>;
  return null;
}
