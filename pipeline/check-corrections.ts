/**
 * On a pull request: if an entry that a person has checked or verified changes what it claims,
 * the change must add a corrections item. Drafts can change freely.
 *
 *   npx tsx pipeline/check-corrections.ts origin/main
 *
 * Lowering an entry's review status also needs a corrections item (corrections-rule.ts).
 *
 * "What it claims" means a summary, an action description or date, a statement, a quote or a figure.
 * Add the label `typo-only` to the pull request to skip the check for a pure typo fix; CI passes it
 * through as SKIP_CORRECTIONS_CHECK=1.
 */
import { execFileSync } from "node:child_process";
import YAML from "yaml";
import { Precedent } from "../src/lib/schema";
import { correctionsProblem } from "./corrections-rule";

const base = process.argv[2] ?? "origin/main";
if (process.env.SKIP_CORRECTIONS_CHECK === "1") {
  console.log("Skipped: pull request is labelled typo-only.");
  process.exit(0);
}

const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" });

/* Modified and renamed entries. A rename keeps its history: the entry is
   compared with its old path on the base branch, so moving a file cannot
   hide a change of claims. */
const changed = git(
  "diff",
  "--name-status",
  "--find-renames",
  "--diff-filter=MR",
  `${base}...HEAD`,
  "--",
  "content/precedents",
  "content/current",
)
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [kind, a, b] = line.split("\t");
    return kind.startsWith("R") ? { from: a, to: b } : { from: a, to: a };
  })
  .filter(({ to }) => /\.ya?ml$/.test(to));

let failed = 0;
for (const { from, to } of changed) {
  const before = Precedent.safeParse(YAML.parse(git("show", `${base}:${from}`)));
  const after = Precedent.safeParse(YAML.parse(git("show", `HEAD:${to}`)));
  if (!before.success || !after.success) continue; // the validator reports parse errors
  const problem = correctionsProblem(before.data, after.data);
  if (!problem) continue;
  console.log(`FAIL ${to}${from !== to ? ` (renamed from ${from})` : ""}: ${problem}.`);
  failed++;
}
console.log(`${changed.length} changed entries checked, ${failed} need a corrections item.`);
if (failed) process.exit(1);
