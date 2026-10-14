import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { ACTION_TYPES, ACTION_META, Precedent, type ActionType } from "./schema";

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

function loadDir(dir: string): Precedent[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const out: Precedent[] = [];
  for (const f of fs.readdirSync(full).sort()) {
    if (!f.endsWith(".yaml") && !f.endsWith(".yml")) continue;
    const raw = YAML.parse(fs.readFileSync(path.join(full, f), "utf8"));
    const parsed = Precedent.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`${dir}/${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    }
    _files.set(parsed.data.id, path.join("content", dir, f));
    out.push(parsed.data);
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

export function year(d: string): string {
  return d.slice(0, 4);
}

export function fmtDate(d?: string | null): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (!m) return y;
  if (!day) return `${months[+m - 1]} ${y}`;
  return `${+day} ${months[+m - 1]} ${y}`;
}

export function fmtPeriod(p: Precedent["period"]): string {
  const s = fmtDate(p.start);
  if (p.end === null || p.end === undefined) return `${s} – ongoing`;
  if (year(p.start) === year(p.end) && p.start === p.end) return s;
  return `${s} – ${fmtDate(p.end)}`;
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
    for (const party of handlingParties(p)) counts.set(party, (counts.get(party) ?? 0) + 1);
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

/** Which actions does an actor attribute to? centre actions go to centre party, state/police to state party (or centre if no state). */
function actionParties(p: Precedent, actor: string): string[] {
  if (actor === "court") return [];
  if (actor === "centre") return [p.government.centre.party];
  if (p.government.state) return [p.government.state.party];
  return [p.government.centre.party];
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
      if (actionParties(p, a.actor).includes(party)) {
        actions[a.type]++;
        handled = true;
      }
    }
    if (handled || handlingParties(p).includes(party)) inPower.push(p);
    for (const pos of p.positions) {
      if (pos.party !== party) continue;
      (pos.in_power ? statementsInPower : statementsInOpposition).push({ p, pos });
    }
  }
  return { party, inPower, actions, statementsInPower, statementsInOpposition };
}

export function matrix(): { parties: string[]; types: ActionType[]; cells: Record<string, Record<ActionType, number>>; max: number } {
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
