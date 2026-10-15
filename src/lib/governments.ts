/**
 * Who governed where, by date (content/governments). Decides which party an action counts for:
 * an action by a state government or its police counts for the party ruling that state on that
 * date; President's Rule, Centre-administered territories and the Delhi Police count for the
 * party ruling the Centre on that date.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { GovernmentFile, type Term } from "./schema";

export { canonicalParty } from "./parties";

export const GOVERNMENTS_DIR = "governments";

export type Governments = Map<string, GovernmentFile>;

/** Every government file, keyed by name and by alias. Throws on a file that fails the schema. */
export function loadGovernments(contentRoot: string): Governments {
  const dir = path.join(contentRoot, GOVERNMENTS_DIR);
  const out: Governments = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs
    .readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()) {
    const parsed = GovernmentFile.safeParse(YAML.parse(fs.readFileSync(path.join(dir, f), "utf8")));
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ");
      throw new Error(`${GOVERNMENTS_DIR}/${f}: ${issues}`);
    }
    for (const name of [parsed.data.name, ...parsed.data.aliases]) out.set(name, parsed.data);
  }
  return out;
}

/** "2016", "2016-02" and "2016-02-18" all become a full date (the first day of the period). */
export function fullDate(d: string): string {
  const [y, m = "01", day = "01"] = d.split("-");
  return `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function termAt(g: GovernmentFile, date: string): Term | undefined {
  const d = fullDate(date);
  return g.terms.find((t) => t.from <= d && (!t.to || d <= t.to));
}

export type Attribution = { ok: true; party: string; via: "centre" | "state" } | { ok: false; reason: string };

/** The party ruling the Centre on a date. */
export function centreParty(govs: Governments, date: string): Attribution {
  const centre = govs.get("Centre");
  const t = centre && termAt(centre, date);
  if (!t?.party) return { ok: false, reason: `no Centre government recorded on ${fullDate(date)}` };
  return { ok: true, party: t.party, via: "centre" };
}

/** The party an action in a state counts for, on a date. `police` follows the state's police rule. */
export function stateParty(govs: Governments, state: string, date: string, police: boolean): Attribution {
  const g = govs.get(state);
  if (!g) return { ok: false, reason: `no government table for ${state}` };
  if (police && g.police === "centre") return centreParty(govs, date);
  const t = termAt(g, date);
  if (!t) return { ok: false, reason: `no ${state} government recorded on ${fullDate(date)}` };
  if (t.kind !== "elected") return centreParty(govs, date);
  if (!t.party) return { ok: false, reason: `${state} term from ${t.from} has no party` };
  return { ok: true, party: t.party, via: "state" };
}
