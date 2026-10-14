/**
 * On a pull request: if an entry that a person has checked or verified changes what it claims,
 * the change must add a corrections item. Drafts can change freely.
 *
 *   npx tsx pipeline/check-corrections.ts origin/main
 *
 * "What it claims" means a summary, an action description or date, a statement, a quote or a figure.
 * Add the label `typo-only` to the pull request to skip the check for a pure typo fix; CI passes it
 * through as SKIP_CORRECTIONS_CHECK=1.
 */
import { execFileSync } from "node:child_process";
import YAML from "yaml";
import { Precedent } from "../src/lib/schema";

const base = process.argv[2] ?? "origin/main";
if (process.env.SKIP_CORRECTIONS_CHECK === "1") {
  console.log("Skipped: pull request is labelled typo-only.");
  process.exit(0);
}

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" });
const changed = git(
  "diff",
  "--name-only",
  "--diff-filter=M",
  `${base}...HEAD`,
  "--",
  "content/precedents",
  "content/current",
)
  .split("\n")
  .filter((f) => /\.ya?ml$/.test(f));

/** The parts of an entry a reader relies on. */
function claims(p: Precedent) {
  return JSON.stringify({
    summary: p.summary,
    outcome: p.outcome,
    actions: p.actions.map((a) => [a.type, a.date, a.description, a.figures, a.legal_basis]),
    positions: p.positions.map((x) => [x.person, x.date, x.statement, x.quote?.text, x.quote?.original]),
  });
}

let failed = 0;
for (const file of changed) {
  const before = Precedent.safeParse(YAML.parse(git("show", `${base}:${file}`)));
  const after = Precedent.safeParse(YAML.parse(git("show", `HEAD:${file}`)));
  if (!before.success || !after.success) continue; // the validator reports parse errors
  const status = before.data.review?.status ?? "draft";
  if (status === "draft") continue;
  if (claims(before.data) === claims(after.data)) continue;
  if (after.data.corrections.length > before.data.corrections.length) continue;
  console.log(`FAIL ${file}: a ${status} entry changed what it claims without a corrections item.`);
  failed++;
}
console.log(`${changed.length} changed entries checked, ${failed} need a corrections item.`);
if (failed) process.exit(1);
