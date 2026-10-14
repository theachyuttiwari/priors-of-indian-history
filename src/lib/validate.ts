import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { Precedent } from "./schema";

export const CONTENT_DIRS = ["precedents", "current"] as const;

export type FileReport = {
  /** Path relative to the content root, e.g. `precedents/emergency-1975.yaml`. */
  file: string;
  /** Problems that make the entry unusable. The run fails. */
  errors: string[];
  /** Problems a reviewer must fix before the entry is marked reviewed. */
  warnings: string[];
  entry?: Precedent;
};

export function isContentFile(name: string): boolean {
  return name.endsWith(".yaml") || name.endsWith(".yml");
}

/** Check one parsed YAML document. `file` is used for the id-matches-filename rule. */
export function checkEntry(file: string, raw: unknown): FileReport {
  const report: FileReport = { file, errors: [], warnings: [] };
  const r = Precedent.safeParse(raw);
  if (!r.success) {
    for (const i of r.error.issues) report.errors.push(`${i.path.join(".") || "(root)"}: ${i.message}`);
    return report;
  }
  const p = r.data;
  report.entry = p;

  const base = path.basename(file).replace(/\.ya?ml$/, "");
  if (p.id !== base) report.errors.push(`id "${p.id}" does not match filename "${base}"`);

  const ids = new Set<string>();
  for (const s of p.sources) {
    if (ids.has(s.id)) report.errors.push(`duplicate source id ${s.id}`);
    ids.add(s.id);
  }

  const checkRefs = (kind: string, items: { sources: string[] }[]) =>
    items.forEach((item, i) => {
      if (item.sources.length === 0) report.warnings.push(`${kind}[${i}] has no sources`);
      for (const s of item.sources) if (!ids.has(s)) report.errors.push(`${kind}[${i}] unknown source ${s}`);
    });
  checkRefs("actions", p.actions);
  checkRefs("positions", p.positions);

  return report;
}

/** Read and check every content file under `root`, then run cross-file checks. */
export function validateContent(root: string): FileReport[] {
  const reports: FileReport[] = [];
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
        reports.push({ file, errors: [`YAML parse error: ${(e as Error).message}`], warnings: [] });
        continue;
      }
      reports.push(checkEntry(file, raw));
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
