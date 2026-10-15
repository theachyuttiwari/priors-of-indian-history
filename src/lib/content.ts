import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { holdBack, type HeldBack } from "./evidence";
import { year } from "./format";
import { centreParty, loadGovernments, stateParty, termAt, type Governments } from "./governments";
import { ACTION_TYPES, ACTION_META, Precedent, type Action, type ActionType } from "./schema";
import { isContentFile } from "./validate";

export { fmtDate, fmtPeriod, year, years } from "./format";

const ROOT = path.join(process.cwd(), "content");

/** Date (YYYY-MM-DD) of the last commit that touched a path, or undefined outside git. */
function gitDate(rel: string): string | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim() || undefined;
  } catch {
    return undefined;
  }
}

/** Entry id to its YAML path, filled by loadDir. */
const _files = new Map<string, string>();

/**
 * Decision C: claims below their evidence minimum are not published. Reviewers can build with
 * PRIORS_SHOW_ALL=1 to see every claim, with its "Single source" mark.
 */
export const SHOW_ALL = process.env.PRIORS_SHOW_ALL === "1";

/** Entry id to the number of claims held back, filled by loadDir. */
const _held = new Map<string, HeldBack>();

export function heldBack(p: Precedent): HeldBack {
  return _held.get(p.id) ?? { actions: 0, positions: 0 };
}

function loadDir(dir: string): Precedent[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const out: Precedent[] = [];
  for (const f of fs.readdirSync(full).sort()) {
    if (!isContentFile(f)) continue;
    const raw = YAML.parse(fs.readFileSync(path.join(full, f), "utf8"));
    const parsed = Precedent.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`${dir}/${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    }
    _files.set(parsed.data.id, path.join("content", dir, f));
    if (SHOW_ALL) {
      out.push(parsed.data);
      continue;
    }
    const { entry, held } = holdBack(parsed.data);
    _held.set(entry.id, held);
    // An entry with nothing left to show is not published at all.
    if (entry.actions.length) out.push(entry);
  }
  return out;
}

let _precedents: Precedent[] | null = null;
let _current: Precedent[] | null = null;

export function getPrecedents(): Precedent[] {
  if (!_precedents) {
    _precedents = loadDir("precedents").sort((a, b) => a.period.start.localeCompare(b.period.start));
  }
  return _precedents;
}

export function getCurrent(): Precedent[] {
  if (!_current) {
    _current = loadDir("current").sort((a, b) => b.period.start.localeCompare(a.period.start));
  }
  return _current;
}

export function getPrecedent(id: string): Precedent | undefined {
  return getPrecedents().find((p) => p.id === id);
}

export function getCurrentEvent(id: string): Precedent | undefined {
  return getCurrent().find((p) => p.id === id);
}

/** When an entry last changed: the newer of its last_updated field and its file's last commit. */
export function entryUpdated(p: Precedent): string | undefined {
  const file = _files.get(p.id);
  const dates = [p.last_updated, file ? gitDate(file) : undefined].filter((d): d is string => !!d);
  return dates.sort().at(-1);
}

/** When the content as a whole last changed. Falls back to the build date outside git. */
export function siteUpdated(): string {
  const all = [...getPrecedents(), ...getCurrent()];
  const dates = [gitDate("content"), ...all.map((p) => p.last_updated)].filter((d): d is string => !!d);
  return dates.sort().at(-1) ?? new Date().toISOString().slice(0, 10);
}

/** The government that handled the protest. State govt if present, else centre. */
export function handlingParties(p: Precedent): string[] {
  const set = new Set<string>();
  set.add(p.government.centre.party);
  if (p.government.state) set.add(p.government.state.party);
  return [...set];
}

export function allParties(): string[] {
  const counts = new Map<string, number>();
  for (const p of [...getPrecedents(), ...getCurrent()]) {
    const parties = new Set([...handlingParties(p), ...p.actions.flatMap((a) => actionParties(p, a))]);
    for (const party of parties) counts.set(party, (counts.get(party) ?? 0) + 1);
    for (const pos of p.positions) counts.set(pos.party, (counts.get(pos.party) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export type PartyRecord = {
  party: string;
  inPower: Precedent[];
  actions: Record<ActionType, number>;
  statementsInPower: { p: Precedent; pos: Precedent["positions"][number] }[];
  statementsInOpposition: { p: Precedent; pos: Precedent["positions"][number] }[];
};

let _govs: Governments | null = null;
function governments(): Governments {
  return (_govs ??= loadGovernments(ROOT));
}

/**
 * The parties an action counts for, looked up by place and date in content/governments:
 * - court and other actions count for nobody (other: a statutory commission, the protesters);
 * - Centre actions count for the party ruling the Centre on the action date;
 * - state and police actions count, for each state named, for the party ruling that state on
 *   that date, or the Centre under President's Rule, in a Centre-run territory, or for Delhi Police.
 * Where the table has no answer (no state named, no term recorded), the entry's own government
 * block is used, as before. The validator lists those as attribution todos.
 */
export function actionParties(p: Precedent, a: ActionRef): string[] {
  return [...new Set(attribute(p, a).map((x) => x.party))];
}

type ActionRef = Pick<Action, "actor" | "state"> & { date?: string };

/** Each party an action counts for, with the place it acted through: "Centre", a state, or "Delhi Police". */
export function attribute(p: Precedent, a: ActionRef): { party: string; place: string }[] {
  if (a.actor === "court" || a.actor === "other") return [];
  const date = a.date ?? p.period.start;
  const govs = governments();
  const fallback =
    a.actor === "centre" || !p.government.state
      ? { party: p.government.centre.party, place: "Centre" }
      : { party: p.government.state.party, place: p.government.state.name ?? "the state" };
  if (a.actor === "centre") {
    const r = centreParty(govs, date);
    return [r.ok ? { party: r.party, place: "Centre" } : fallback];
  }
  if (a.state.length === 0) return [fallback];
  return a.state.map((st) => {
    const police = a.actor === "police";
    const r = stateParty(govs, st, date, police);
    if (!r.ok) return fallback;
    const g = govs.get(st)!;
    if (police && g.police === "centre") return { party: r.party, place: `${g.name} Police` };
    const kind = termAt(g, date)?.kind;
    const note = kind === "presidents_rule" ? " (President’s Rule)" : kind === "centre" ? " (run by the Centre)" : "";
    return { party: r.party, place: g.name + note };
  });
}

/**
 * Who acted in an entry, by party, most actions first: "BJP: Centre, Delhi Police, Uttar Pradesh".
 * Entries whose only actions are by courts or others fall back to who governed.
 */
export function whereLine(p: Precedent): string {
  const by = new Map<string, { n: number; places: Set<string> }>();
  for (const a of p.actions) {
    for (const { party, place } of attribute(p, a)) {
      const e = by.get(party) ?? { n: 0, places: new Set<string>() };
      e.n++;
      e.places.add(place);
      by.set(party, e);
    }
  }
  if (by.size === 0) {
    const s = p.government.state;
    return s
      ? `${s.party} in ${s.name}, ${p.government.centre.party} at the Centre`
      : `${p.government.centre.party} at the Centre`;
  }
  return [...by.entries()]
    .sort((x, y) => y[1].n - x[1].n)
    .map(([party, e]) => `${party}: ${[...e.places].join(", ")}`)
    .join("; ");
}

/** Parties an entry's actions count for; who governed when no action counts for a party. */
export function entryParties(p: Precedent): string[] {
  const parties = [...new Set(p.actions.flatMap((a) => actionParties(p, a)))];
  return parties.length ? parties : handlingParties(p);
}

export function partyRecord(party: string): PartyRecord {
  const all = [...getPrecedents(), ...getCurrent()];
  const actions = Object.fromEntries(ACTION_TYPES.map((t) => [t, 0])) as Record<ActionType, number>;
  const inPower: Precedent[] = [];
  const statementsInPower: PartyRecord["statementsInPower"] = [];
  const statementsInOpposition: PartyRecord["statementsInOpposition"] = [];
  for (const p of all) {
    let handled = false;
    for (const a of p.actions) {
      if (actionParties(p, a).includes(party)) {
        actions[a.type]++;
        handled = true;
      }
    }
    if (handled) inPower.push(p);
    for (const pos of p.positions) {
      if (pos.party !== party) continue;
      (pos.in_power ? statementsInPower : statementsInOpposition).push({ p, pos });
    }
  }
  return { party, inPower, actions, statementsInPower, statementsInOpposition };
}

export function matrix(): {
  parties: string[];
  types: ActionType[];
  cells: Record<string, Record<ActionType, number>>;
  max: number;
} {
  // Only parties with at least one attributed action; a centre-only party with no centre actions would be an empty row.
  const parties = allParties().filter((party) => Object.values(partyRecord(party).actions).some((n) => n > 0));
  const cells: Record<string, Record<ActionType, number>> = {};
  let max = 0;
  for (const party of parties) {
    cells[party] = partyRecord(party).actions;
    for (const v of Object.values(cells[party])) max = Math.max(max, v);
  }
  const types = ACTION_TYPES.filter((t) => parties.some((p) => cells[p][t] > 0)).sort(
    (a, b) => groupOrder(ACTION_META[a].group) - groupOrder(ACTION_META[b].group),
  );
  return { parties, types, cells, max };
}

function groupOrder(g: string): number {
  return ["restrict", "legal", "force", "engage", "other"].indexOf(g);
}

/** Similarity between a current event and a precedent: shared action types + tags. */
export function similar(ev: Precedent, limit = 4): { p: Precedent; score: number; shared: ActionType[] }[] {
  const evTypes = new Set(ev.actions.map((a) => a.type));
  const evTags = new Set(ev.tags);
  const explicit = new Set(ev.related_precedents);
  return getPrecedents()
    .map((p) => {
      const shared = [...new Set(p.actions.map((a) => a.type))].filter((t) => evTypes.has(t));
      const tagHits = p.tags.filter((t) => evTags.has(t)).length;
      const score = shared.length * 2 + tagHits + (explicit.has(p.id) ? 10 : 0);
      return { p, score, shared };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function stats() {
  const ps = getPrecedents();
  const years = ps.map((p) => +year(p.period.start));
  return {
    precedents: ps.length,
    actions: ps.reduce((n, p) => n + p.actions.length, 0),
    sources: ps.reduce((n, p) => n + p.sources.length, 0),
    parties: allParties().length,
    from: Math.min(...years),
    to: Math.max(...years),
  };
}

export type ReviewStatus = "draft" | "checked" | "verified";

/** Where an entry stands. An entry with no review record has not been checked by a person. */
export function reviewStatus(p: Precedent): ReviewStatus {
  return p.review?.status ?? "draft";
}

export function isCurrent(p: Precedent): boolean {
  return getCurrent().some((c) => c.id === p.id);
}

export function entryHref(p: Precedent): string {
  return isCurrent(p) ? `/now/${p.id}/` : `/precedents/${p.id}/`;
}

/** Every correction, clarification and update across the record, newest first. */
export function allCorrections() {
  return [...getPrecedents(), ...getCurrent()]
    .flatMap((p) => p.corrections.map((c) => ({ ...c, p })))
    .sort((a, b) => b.date.localeCompare(a.date));
}
