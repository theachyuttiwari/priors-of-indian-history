/**
 * Validate every content file against the schema and the sourcing rules.
 *
 *   npm run validate              errors fail the run; warnings and todos do not
 *   npm run validate -- --strict  warnings fail the run too (CI)
 *   npm run validate -- --todos   also list every todo (sourcing rules still being phased in)
 *   npm run validate -- --todos farm-laws   only files whose path contains "farm-laws"
 */
import path from "node:path";
import { RULES, validateContent, type Rule } from "../src/lib/validate";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const listTodos = args.includes("--todos");
const filter = args.find((a) => !a.startsWith("--"));
const reports = validateContent(path.join(process.cwd(), "content")).filter((r) => !filter || r.file.includes(filter));

let failed = 0;
const todoCount = Object.fromEntries(Object.keys(RULES).map((k) => [k, 0])) as Record<Rule, number>;
for (const r of reports) {
  for (const t of r.todos) todoCount[t.rule]++;
  if (r.errors.length) {
    console.log(`FAIL ${r.file}`);
    failed++;
  } else if (r.warnings.length) {
    console.log(`WARN ${r.file}`);
    if (strict) failed++;
  } else {
    const p = r.entry;
    const todo = r.todos.length ? `, ${r.todos.length} todo` : "";
    const what = p
      ? `${p.actions.length} actions, ${p.positions.length} positions, ${p.sources.length} sources`
      : r.summary;
    console.log(`ok   ${r.file}  (${what}${todo})`);
  }
  for (const e of r.errors) console.log(`   error: ${e}`);
  for (const w of r.warnings) console.log(`   warn:  ${w}`);
  if (listTodos) for (const t of r.todos) console.log(`   todo:  [${t.rule}] ${t.message}`);
}

const todos = Object.entries(todoCount).filter(([, n]) => n > 0);
if (todos.length) {
  console.log(`\nSourcing todos (rules being phased in; see RULES in src/lib/validate.ts):`);
  for (const [rule, n] of todos) console.log(`  ${String(n).padStart(4)}  ${rule}`);
  if (!listTodos) console.log(`  List them: npm run validate -- --todos [file]`);
}
console.log(`\n${reports.length} files, ${failed} failed${strict ? " (strict)" : ""}.`);
if (failed) process.exit(1);
