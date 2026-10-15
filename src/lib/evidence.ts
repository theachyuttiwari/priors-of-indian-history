/**
 * Evidence rules from docs/proposal-phase1-rules.html (decision B).
 * Pure functions, no Node imports, so the site and the validator share them.
 */
import { TIER_META, type Action, type ActionType, type Claim, type Source, type Tier } from "./schema";

/** Sites that are leads only: never enough to support a claim alone. Matched on host and its subdomains. */
const LEAD_HOSTS = [
  "wikipedia.org",
  "wikiwand.com",
  "altnews.in",
  "boomlive.in",
  "factly.in",
  "factchecker.in",
  "newschecker.in",
  "vishvasnews.com",
  "politifact.com",
  "snopes.com",
  "fullfact.org",
];
/** Fact-check sections inside general news sites. */
const LEAD_PATHS = [/thequint\.com\/news\/webqoof\//, /indiatoday\.in\/fact-check\//];

export function host(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isLeadUrl(url: string): boolean {
  const h = host(url);
  return LEAD_HOSTS.some((d) => h === d || h.endsWith(`.${d}`)) || LEAD_PATHS.some((re) => re.test(url));
}

/** The tier set by an editor, or "lead" for a known lead site. Undefined until someone assigns it. */
export function tierOf(s: Source): Tier | undefined {
  if (isLeadUrl(s.url)) return "lead";
  return s.tier;
}

export function rank(t: Tier): number {
  return TIER_META[t].rank;
}

/** Action types that are decisions of the state, so the order itself is the best evidence. */
const ORDERED = new Set<ActionType>([
  "permission_denied",
  "permission_granted",
  "section_144",
  "curfew",
  "internet_shutdown",
  "fir",
  "sedition_charge",
  "uapa_charge",
  "nsa_detention",
  "censorship",
  "deportation",
  "commission_of_inquiry",
  "concession",
  "repeal",
]);

export function claimOf(a: Pick<Action, "type" | "actor" | "claim">): Claim {
  if (a.claim) return a.claim;
  if (a.actor === "court") return "held";
  return ORDERED.has(a.type) ? "ordered" : "happened";
}

/** Copies of one wire story count once; otherwise one count per publisher. */
export function independenceKey(s: Source): string {
  if (s.wire) return `wire:${s.wire}`;
  return `pub:${(s.publisher || host(s.url)).toLowerCase().replace(/\s+/g, " ").trim()}`;
}

/** Number of independent sources at `maxRank` or better. */
function independentAtOrBetter(sources: Source[], maxRank: number): number {
  const keys = new Set<string>();
  for (const s of sources) {
    const t = tierOf(s);
    if (t && rank(t) <= maxRank) keys.add(independenceKey(s));
  }
  return keys.size;
}

export type Verdict = { ok: true } | { ok: false; reason: string; untiered: number };

/** Does this set of sources meet the minimum for the claim? "said" is a statement by a named person. */
export function meetsMinimum(claim: Claim | "said", sources: Source[]): Verdict {
  const tiers = sources.map(tierOf);
  const has = (t: Tier) => tiers.includes(t);
  const untiered = tiers.filter((t) => !t).length;
  const fail = (reason: string): Verdict => ({ ok: false, reason, untiered });
  if (sources.length && tiers.every((t) => t === "lead")) return fail("rests only on lead sources");
  switch (claim) {
    case "ordered":
      if (has("record") || has("court") || independentAtOrBetter(sources, 4) >= 2) return { ok: true };
      return fail("needs the order, a court record, or two independent reports");
    case "held":
      if (has("court")) return { ok: true };
      return fail("needs the judgment or court order");
    case "happened":
      if (has("court") || independentAtOrBetter(sources, 4) >= 2) return { ok: true };
      return fail("needs a court finding or two independent reports");
    case "said":
      if (has("record") || has("recording") || independentAtOrBetter(sources, 4) >= 2) return { ok: true };
      return fail("needs the record, a recording, or two independent reports");
  }
}

export type HeldBack = { actions: number; positions: number };

/**
 * Decision C at launch: a claim that does not meet its minimum is not published. It stays in the
 * YAML and in the validator todo list until it is sourced. Returns the entry without those claims
 * and how many were held back, so the page can say so.
 */
export function holdBack<P extends { actions: Action[]; positions: { sources: string[] }[]; sources: Source[] }>(
  p: P,
): { entry: P; held: HeldBack } {
  const byId = new Map(p.sources.map((s) => [s.id, s]));
  const resolve = (ids: string[]) => ids.map((id) => byId.get(id)).filter((s): s is Source => !!s);
  const actions = p.actions.filter((a) => meetsMinimum(claimOf(a), resolve(a.sources)).ok);
  const positions = p.positions.filter((pos) => meetsMinimum("said", resolve(pos.sources)).ok);
  return {
    entry: { ...p, actions, positions },
    held: { actions: p.actions.length - actions.length, positions: p.positions.length - positions.length },
  };
}

/** True when every source is a lead. Used for the hard rule: a lead is never enough alone. */
export function leadOnly(sources: Source[]): boolean {
  return sources.length > 0 && sources.every((s) => tierOf(s) === "lead");
}

/** Numbers next to words like "killed" or "detained" should be in `figures`, each with who gave it. */
const COUNT_WORDS =
  /\b\d[\d,]*\s*(?:people|persons|protesters|students|farmers|demonstrators|activists|supporters|workers|police(?:men)?|personnel)?\s*(?:were\s+)?(?:killed|dead|died|injured|wounded|detained|arrested|held|deaths)\b/i;
const VERB_FIRST =
  /\b(?:killed|injured|wounded|detained|arrested)\s+(?:about|around|over|nearly|at least|more than|some)?\s*\d[\d,]*\b/i;
export function mentionsCount(text: string): boolean {
  return COUNT_WORDS.test(text) || VERB_FIRST.test(text);
}
