/**
 * Check the finished export (default out/) and fail on drift:
 * - every inline script on every page is allowed by that page's CSP hash list;
 * - every Markdown twin has the same numbers as the text its page shows;
 * - every page that should have a twin has one, and links it; every page has one canonical.
 *
 *   npx tsx pipeline/verify-out.ts [DIR]
 */
import fs from "node:fs";
import path from "node:path";
import {
  allowedHashes,
  find,
  inlineScriptHashes,
  numbers,
  parse,
  stripLinkTargets,
  visibleText,
} from "./lib/static-html";
import { hasTwin, isNotFound, pages } from "./lib/out-pages";

const dir = path.resolve(process.argv[2] ?? "out");
const errors: string[] = [];
let twins = 0;

for (const [file, p] of pages(dir)) {
  const html = fs.readFileSync(file, "utf8");
  const allowed = new Set(allowedHashes(html));
  if (allowed.size === 0 && inlineScriptHashes(html).length > 0) errors.push(`${p}: no CSP meta tag`);
  for (const h of inlineScriptHashes(html)) if (!allowed.has(h)) errors.push(`${p}: inline script ${h} not in CSP`);
  if (!isNotFound(p) && (html.match(/rel="canonical"/g) ?? []).length !== 1) errors.push(`${p}: not one canonical`);
  if (!hasTwin(p)) continue;
  const md = path.join(path.dirname(file), "index.md");
  if (!fs.existsSync(md)) {
    errors.push(`${p}: twin missing`);
    continue;
  }
  if (!html.includes('type="text/markdown"')) errors.push(`${p}: no link to its twin`);
  const doc = parse(html);
  const main = find(doc, (e) => e.tag === "main");
  const footer = find(doc, (e) => e.tag === "footer" && !find(main ?? doc, (x) => x === e));
  const shown = numbers(visibleText(main!) + " " + (footer ? visibleText(footer) : ""));
  const body = fs.readFileSync(md, "utf8").split("\n---\n").slice(1).join("\n");
  const inTwin = numbers(stripLinkTargets(body));
  if (shown.join(",") !== inTwin.join(",")) {
    const a = new Map<string, number>();
    for (const n of shown) a.set(n, (a.get(n) ?? 0) + 1);
    for (const n of inTwin) a.set(n, (a.get(n) ?? 0) - 1);
    const diff = [...a]
      .filter(([, c]) => c !== 0)
      .map(([n, c]) => `${n}${c > 0 ? " missing" : " extra"} x${Math.abs(c)}`);
    errors.push(`${p}: twin numbers differ from the page: ${diff.slice(0, 8).join("; ")}`);
  }
  twins++;
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`verify-out: ${errors.length} problems`);
  process.exit(1);
}
console.log(`verify-out: ${pages(dir).length} pages, CSP hashes match, ${twins} twins match their pages`);
