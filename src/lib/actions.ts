/**
 * One page, one share card and one link for each action. The link is the unit people paste into a
 * reply on X: it carries the card, and the card carries the date, the place, the party in power and
 * the source.
 */
import { attribute, entryHref, getCurrent, getPrecedents } from "./content";
import { fmtDate } from "./format";
import { ACTION_META, type Action, type Precedent } from "./schema";
import { SITE_URL } from "./site";

export type ActionPage = {
  p: Precedent;
  a: Action;
  /** Stable within an entry: date and type, then -2, -3 for repeats. */
  slug: string;
  /** Site path, without the base path. */
  href: string;
  /** Card image path under public/, without the base path. */
  card: string;
  /** Who the action counts for, and where it acted. Empty for courts and others. */
  by: { party: string; place: string }[];
};

/** Slugs for an entry's actions, in YAML order: "2019-12-15-lathi-charge". */
export function actionSlugs(p: Precedent): string[] {
  const seen = new Map<string, number>();
  return p.actions.map((a) => {
    const base = `${a.date ?? "undated"}-${a.type.replace(/_/g, "-")}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

export function entryActions(p: Precedent): ActionPage[] {
  const slugs = actionSlugs(p);
  return p.actions.map((a, i) => ({
    p,
    a,
    slug: slugs[i],
    href: `${entryHref(p)}actions/${slugs[i]}/`,
    card: `/cards/${p.id}/${slugs[i]}.png`,
    by: attribute(p, a),
  }));
}

let _all: ActionPage[] | null = null;
export function allActions(): ActionPage[] {
  return (_all ??= [...getPrecedents(), ...getCurrent()].flatMap(entryActions));
}

export function findAction(id: string, slug: string): ActionPage | undefined {
  return allActions().find((x) => x.p.id === id && x.slug === slug);
}

/** "BJP — Delhi Police, Centre". Courts and others: who acted instead. */
export function inPowerLine(x: ActionPage): string {
  if (x.by.length === 0) return x.a.actor === "court" ? "A court" : "Not a government action";
  const byParty = new Map<string, string[]>();
  for (const { party, place } of x.by) byParty.set(party, [...(byParty.get(party) ?? []), place]);
  return [...byParty.entries()].map(([party, places]) => `${party} — ${[...new Set(places)].join(", ")}`).join("; ");
}

/** The first sentence of the description, cut at a word if it runs past `max` characters. */
export function firstSentence(text: string, max = 200): string {
  const m = text.match(/^.+?[.!?](?=\s+[A-Z“"(]|$)/);
  const s = (m ? m[0] : text).trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/**
 * The same kind of action under other governments, chosen by a fixed rule so that no party is
 * picked by hand: for each party in power, its most recent such action in another entry.
 * Newest first.
 */
export function sameActionElsewhere(x: ActionPage, limit = 6): ActionPage[] {
  const best = new Map<string, ActionPage>();
  for (const y of allActions()) {
    if (y.a.type !== x.a.type || y.p.id === x.p.id || y.by.length === 0) continue;
    const party = y.by[0].party;
    const cur = best.get(party);
    if (!cur || (y.a.date ?? "") > (cur.a.date ?? "")) best.set(party, y);
  }
  return [...best.values()].sort((a, b) => (b.a.date ?? "").localeCompare(a.a.date ?? "")).slice(0, limit);
}

/** Full public URL of a site path. */
export function absolute(href: string): string {
  return `${SITE_URL}${href}`;
}

/** Text for a post on X: facts only, no adjectives. The link adds the card. */
export function postText(x: ActionPage): string {
  const label = ACTION_META[x.a.type].label;
  const date = x.a.date ? fmtDate(x.a.date) : "Date not recorded";
  return [`${label}, ${date}`, x.p.title, `In power: ${inPowerLine(x)}`, "Sourced record:"].join("\n");
}

/** X's compose page with the text and link filled in. Needs no API, no account keys. */
export function xIntent(x: ActionPage): string {
  const q = new URLSearchParams({ text: postText(x), url: absolute(x.href) });
  return `https://x.com/intent/post?${q.toString()}`;
}
