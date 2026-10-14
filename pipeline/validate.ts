/** Validate every content file against the schema. Run: npx tsx pipeline/validate.ts */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { Precedent } from "../src/lib/schema";

let bad = 0;
for (const dir of ["precedents", "current"]) {
  const full = path.join(process.cwd(), "content", dir);
  if (!fs.existsSync(full)) continue;
  for (const f of fs.readdirSync(full)) {
    if (!f.endsWith(".yaml")) continue;
    let raw: unknown;
    try {
      raw = YAML.parse(fs.readFileSync(path.join(full, f), "utf8"));
    } catch (e) {
      console.log(`FAIL ${dir}/${f}: YAML parse error: ${(e as Error).message}`);
      bad++;
      continue;
    }
    const r = Precedent.safeParse(raw);
    if (!r.success) {
      console.log(`FAIL ${dir}/${f}`);
      for (const i of r.error.issues) console.log(`   ${i.path.join(".")}: ${i.message}`);
      bad++;
      continue;
    }
    const p = r.data;
    const ids = new Set(p.sources.map((s) => s.id));
    const problems: string[] = [];
    if (p.id !== f.replace(/\.ya?ml$/, "")) problems.push(`id "${p.id}" does not match filename`);
    p.actions.forEach((a, i) => {
      if (a.sources.length === 0) problems.push(`actions[${i}] has no sources`);
      for (const s of a.sources) if (!ids.has(s)) problems.push(`actions[${i}] unknown source ${s}`);
    });
    p.positions.forEach((a, i) => {
      if (a.sources.length === 0) problems.push(`positions[${i}] has no sources`);
      for (const s of a.sources) if (!ids.has(s)) problems.push(`positions[${i}] unknown source ${s}`);
    });
    if (problems.length) {
      console.log(`WARN ${dir}/${f}`);
      problems.forEach((x) => console.log(`   ${x}`));
    } else {
      console.log(
        `ok   ${dir}/${f}  (${p.actions.length} actions, ${p.positions.length} positions, ${p.sources.length} sources)`,
      );
    }
  }
}
if (bad) process.exit(1);
