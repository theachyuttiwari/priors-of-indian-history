/**
 * Validate every content file against the schema and the sourcing rules.
 *
 *   npm run validate             errors fail the run, warnings do not
 *   npm run validate -- --strict warnings fail the run too
 */
import path from "node:path";
import { validateContent } from "../src/lib/validate";

const strict = process.argv.includes("--strict");
const reports = validateContent(path.join(process.cwd(), "content"));

let failed = 0;
for (const r of reports) {
  if (r.errors.length) {
    console.log(`FAIL ${r.file}`);
    failed++;
  } else if (r.warnings.length) {
    console.log(`WARN ${r.file}`);
    if (strict) failed++;
  } else {
    const p = r.entry!;
    console.log(
      `ok   ${r.file}  (${p.actions.length} actions, ${p.positions.length} positions, ${p.sources.length} sources)`,
    );
  }
  for (const e of r.errors) console.log(`   error: ${e}`);
  for (const w of r.warnings) console.log(`   warn:  ${w}`);
}

console.log(`\n${reports.length} files, ${failed} failed${strict ? " (strict)" : ""}.`);
if (failed) process.exit(1);
