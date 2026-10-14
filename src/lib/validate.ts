import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { claimOf, host, leadOnly, meetsMinimum, mentionsCount, tierOf } from "./evidence";
import { normalise } from "./quote-match";
import { BANNED_ARCHIVE_HOSTS, Precedent, type Source } from "./schema";

export const CONTENT_DIRS = ["precedents", "current"] as const;

/** Quote-match results written by pipeline/match-quotes.ts, relative to the content root. */
export const QUOTE_CHECKS_FILE = "checks/quotes.json";

export type QuoteCheck = {
  position: number;
  source: string;
  fetched: string;
  checked: string;
  result: "exact" | "close" | "missing" | "error";
  score?: number;
  passage?: string;
  text_sha256?: string;
  note?: string;
};
/** Entry id to quote key to the latest check. */
export type QuoteChecks = Record<string, Record<string, QuoteCheck>>;

export function loadQuoteChecks(root: string): QuoteChecks {
  const file = path.join(root, QUOTE_CHECKS_FILE);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as QuoteChecks) : {};
}

/** Same value as quoteKey in quote-match.ts, computed synchronously with Node crypto. */
export function quoteKeySync(text: string): string {
  return createHash("sha256").update(normalise(text)).digest("hex").slice(0, 16);
}

type RuleName =
  | "lead-only"
  | "below-minimum"
  | "tier-missing"
  | "archive-missing"
  | "kind-missing"
  | "figures-missing"
  | "quote-unchecked";

/**
 * Sourcing rules that the current content does not yet meet. Each starts as "todo": reported, never
 * failing. When the content passes a rule, change it to "error" here so it can never regress.
 */
export const RULES: Record<RuleName, "todo" | "error"> = {
  "lead-only": "todo", // a claim whose only sources are Wikipedia or fact-checkers
  "below-minimum": "todo", // a claim below the minimum evidence for its kind
  "tier-missing": "todo", // a source with no evidence tier
  "archive-missing": "todo", // a source with no archive_url or accessed date
  "kind-missing": "todo", // a statement not marked verbatim, translated or paraphrase
  "figures-missing": "todo", // a count in a description with no attributed figures
  "quote-unchecked": "todo", // a quote with no exact match on record in content/checks/quotes.json
};
export type Rule = RuleName;

export type Todo = { rule: Rule; message: string };

export type FileReport = {
  /** Path relative to the content root, e.g. `precedents/emergency-1975.yaml`. */
  file: string;
  /** Problems that make the entry unusable. The run fails. */
  errors: string[];
  /** Problems a reviewer must fix before the entry is marked reviewed. Fail with --strict. */
  warnings: string[];
  /** Sourcing debt under a rule still being phased in. Never fails. */
  todos: Todo[];
  entry?: Precedent;
};

export function isContentFile(name: string): boolean {
  return name.endsWith(".yaml") || name.endsWith(".yml");
}

/**
 * Check one parsed YAML document. `file` is used for the id-matches-filename rule.
 * `checks` holds quote-match results; without it, quotes are not checked against them.
 */
export function checkEntry(file: string, raw: unknown, checks?: QuoteChecks): FileReport {
  const report: FileReport = { file, errors: [], warnings: [], todos: [] };
  const flag = (rule: Rule, message: string) => {
    if (RULES[rule] === "error") report.errors.push(message);
    else report.todos.push({ rule, message });
  };

  const r = Precedent.safeParse(raw);
  if (!r.success) {
    for (const i of r.error.issues) report.errors.push(`${i.path.join(".") || "(root)"}: ${i.message}`);
    return report;
  }
  const p = r.data;
  report.entry = p;

  const base = path.basename(file).replace(/\.ya?ml$/, "");
  if (p.id !== base) report.errors.push(`id "${p.id}" does not match filename "${base}"`);

  // Sources
  const byId = new Map<string, Source>();
  for (const s of p.sources) {
    if (byId.has(s.id)) report.errors.push(`duplicate source id ${s.id}`);
    byId.set(s.id, s);
    const where = `sources ${s.id}`;
    if (s.archive_url && BANNED_ARCHIVE_HOSTS.includes(host(s.archive_url))) {
      report.errors.push(`${where}: archive.today and its mirrors are not allowed; use the Wayback Machine`);
    }
    if (s.date && s.accessed && s.accessed < s.date) report.errors.push(`${where}: accessed before it was published`);
    if (s.date && s.archive_date && s.archive_date < s.date) {
      report.errors.push(`${where}: archived before it was published`);
    }
    if (!tierOf(s)) flag("tier-missing", `${where}: no evidence tier`);
    if (!s.archive_url || !s.accessed) flag("archive-missing", `${where}: no archive_url or accessed date`);
  }
  const ref = (where: string, id: string) => {
    if (!byId.has(id)) report.errors.push(`${where}: unknown source ${id}`);
  };
  const resolve = (ids: string[]) => ids.map((id) => byId.get(id)).filter((s): s is Source => !!s);

  // Actions
  p.actions.forEach((a, i) => {
    const where = `actions[${i}]`;
    if (a.sources.length === 0) report.warnings.push(`${where} has no sources`);
    a.sources.forEach((id) => ref(where, id));
    a.figures.forEach((f, j) => ref(`${where}.figures[${j}]`, f.source));
    a.court_outcomes.forEach((c, j) => ref(`${where}.court_outcomes[${j}]`, c.source));
    const sources = resolve(a.sources);
    if (leadOnly(sources)) flag("lead-only", `${where}: rests only on lead sources (Wikipedia, fact-checks)`);
    else checkMinimum(where, claimOf(a), sources);
    if (a.figures.length === 0 && mentionsCount(a.description)) {
      flag("figures-missing", `${where}: gives a count; record it in figures with who gave it`);
    }
  });

  // Statements
  p.positions.forEach((pos, i) => {
    const where = `positions[${i}]`;
    if (pos.sources.length === 0) report.warnings.push(`${where} has no sources`);
    pos.sources.forEach((id) => ref(where, id));
    const sources = resolve(pos.sources);
    if (leadOnly(sources)) flag("lead-only", `${where}: rests only on lead sources (Wikipedia, fact-checks)`);
    else checkMinimum(where, "said", sources);

    if (!pos.kind) flag("kind-missing", `${where}: mark kind as verbatim, translated or paraphrase`);
    if (pos.kind === "paraphrase" && pos.quote) report.errors.push(`${where}: a paraphrase cannot carry a quote`);
    if ((pos.kind === "verbatim" || pos.kind === "translated") && !pos.quote) {
      report.errors.push(`${where}: kind ${pos.kind} needs quote.text and quote.source`);
    }
    if (pos.quote) {
      ref(`${where}.quote`, pos.quote.source);
      if (!pos.sources.includes(pos.quote.source)) {
        report.errors.push(`${where}.quote: source ${pos.quote.source} must also be in the statement's sources`);
      }
      if (pos.kind === "translated") {
        const q = pos.quote;
        if (!q.original || !q.language || !q.translated_by) {
          report.errors.push(`${where}.quote: a translated quote needs original, language and translated_by`);
        }
      }
      if (checks) {
        const c = checks[p.id]?.[quoteKeySync(pos.quote.text)];
        if (!c) flag("quote-unchecked", `${where}.quote: not yet matched against its source`);
        else if (c.source !== pos.quote.source) {
          flag("quote-unchecked", `${where}.quote: matched against ${c.source}, but cites ${pos.quote.source}`);
        } else if (c.result !== "exact") {
          flag("quote-unchecked", `${where}.quote: ${c.result} in ${c.source} on ${c.checked}`);
        }
      }
    }
  });

  // Review and corrections
  if (p.review) {
    const { status, by, date } = p.review;
    if (status === "verified" && (!by || !date)) report.errors.push("review: verified needs by and date");
    if (status === "checked" && !date) report.errors.push("review: checked needs a date");
    if (p.reviewed === true && status === "draft")
      report.errors.push("review: status draft conflicts with reviewed: true");
    if (p.reviewed === false && status !== "draft")
      report.errors.push(`review: status ${status} conflicts with reviewed: false`);
  }

  return report;

  function checkMinimum(where: string, claim: Parameters<typeof meetsMinimum>[0], sources: Source[]) {
    if (sources.length === 0) return;
    const v = meetsMinimum(claim, sources);
    if (v.ok) return;
    const note = v.untiered ? ` (${v.untiered} source${v.untiered > 1 ? "s" : ""} not yet tiered)` : "";
    flag("below-minimum", `${where}: ${claim} claim ${v.reason}${note}`);
  }
}

/** Read and check every content file under `root`, then run cross-file checks. */
export function validateContent(root: string): FileReport[] {
  const reports: FileReport[] = [];
  const checks = loadQuoteChecks(root);
  for (const dir of CONTENT_DIRS) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full).sort()) {
      if (!isContentFile(f)) continue;
      const file = `${dir}/${f}`;
      let raw: unknown;
      try {
        raw = YAML.parse(fs.readFileSync(path.join(full, f), "utf8"));
      } catch (e) {
        reports.push({ file, errors: [`YAML parse error: ${(e as Error).message}`], warnings: [], todos: [] });
        continue;
      }
      reports.push(checkEntry(file, raw, checks));
    }
  }

  const seen = new Map<string, string>();
  for (const r of reports) {
    if (!r.entry) continue;
    const other = seen.get(r.entry.id);
    if (other) r.errors.push(`id "${r.entry.id}" is also used by ${other}`);
    else seen.set(r.entry.id, r.file);
  }

  const precedentIds = new Set(reports.filter((r) => r.file.startsWith("precedents/")).map((r) => r.entry?.id));
  for (const r of reports) {
    for (const id of r.entry?.related_precedents ?? []) {
      if (!precedentIds.has(id)) r.errors.push(`related_precedents: no precedent with id "${id}"`);
    }
  }

  return reports;
}
