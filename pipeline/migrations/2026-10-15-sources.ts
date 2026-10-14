/**
 * One-off migration for the phase 1 sourcing rules. Kept for the record; safe to re-run.
 * Edits lines in place so hand-wrapped YAML keeps its layout.
 *
 * Only facts a script can know for certain:
 *   1. Wire copy named in the publisher ("The Tribune (PTI)", "UNI via Oneindia") moves to `wire`.
 *   2. Wikipedia sources get `tier: lead`.
 *   3. Judgments hosted by Indian Kanoon or the Supreme Court get `tier: court`.
 *   4. Every entry gets `review: { status: draft }`. No entry has yet been checked by a person.
 *
 * Run: npx tsx pipeline/migrations/2026-10-15-sources.ts [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIRS, isContentFile } from "../../src/lib/validate";
import { WIRES } from "../../src/lib/schema";

const dry = process.argv.includes("--dry");
const root = path.join(process.cwd(), "content");
const wireAlt = WIRES.join("|");
const TRAILING = new RegExp(`^(.*?)\\s*\\((${wireAlt})\\)$`);
const LEADING = new RegExp(`^(${wireAlt}) via (.+)$`);
const PUBLISHER_NAMES: Record<string, string> = { OneIndia: "Oneindia" };

function unquote(v: string) {
  const t = v.trim();
  return /^(['"]).*\1$/.test(t) ? t.slice(1, -1) : t;
}
function yamlStr(v: string) {
  return /^[\w .,&()'-]+$/.test(v) && !/^\d/.test(v) ? v : JSON.stringify(v);
}

export function splitWire(publisher: string): { publisher: string; wire?: string } {
  let m = publisher.match(TRAILING);
  if (m) return { publisher: PUBLISHER_NAMES[m[1]] ?? m[1], wire: m[2] };
  m = publisher.match(LEADING);
  if (m) return { publisher: PUBLISHER_NAMES[m[2]] ?? m[2], wire: m[1] };
  return { publisher: PUBLISHER_NAMES[publisher] ?? publisher };
}

const log: string[] = [];
for (const dir of CONTENT_DIRS) {
  const full = path.join(root, dir);
  for (const f of fs.readdirSync(full).filter(isContentFile).sort()) {
    const file = path.join(full, f);
    const lines = fs.readFileSync(file, "utf8").split("\n");
    const out: string[] = [];
    let inSources = false;
    let block: string[] = [];

    const flush = () => {
      if (!block.length) return;
      const get = (k: string) => block.find((l) => l.startsWith(`    ${k}:`))?.slice(k.length + 5);
      const has = (k: string) => block.some((l) => l.startsWith(`    ${k}:`));
      const id = unquote(get("id") ?? block[0].replace(/^ {2}- id:/, ""));
      const url = unquote(get("url") ?? "");
      const type = unquote(get("type") ?? "");
      const add: string[] = [];
      const pi = block.findIndex((l) => l.startsWith("    publisher:"));
      if (pi >= 0 && !has("wire")) {
        const before = unquote(block[pi].slice("    publisher:".length));
        const { publisher, wire } = splitWire(before);
        if (publisher !== before) {
          block[pi] = `    publisher: ${yamlStr(publisher)}`;
          log.push(`${dir}/${f} ${id}: publisher "${before}" -> "${publisher}"${wire ? `, wire ${wire}` : ""}`);
        }
        if (wire) add.push(`    wire: ${wire}`);
      }
      if (!has("tier")) {
        if (/(^|\.)wikipedia\.org\//.test(url.replace(/^https?:\/\//, ""))) {
          add.push("    tier: lead");
          log.push(`${dir}/${f} ${id}: tier lead (Wikipedia)`);
        } else if (type === "court_judgment" && /\/\/(www\.)?(indiankanoon\.org|api\.sci\.gov\.in)\//.test(url)) {
          add.push("    tier: court");
          log.push(`${dir}/${f} ${id}: tier court (${new URL(url).hostname})`);
        }
      }
      const at = pi >= 0 ? pi + 1 : block.length;
      block.splice(at, 0, ...add);
      out.push(...block);
      block = [];
    };

    for (const line of lines) {
      if (/^\S/.test(line)) {
        flush();
        inSources = line.startsWith("sources:");
        out.push(line);
      } else if (inSources && line.startsWith("  - ")) {
        flush();
        block.push(line);
      } else if (inSources && block.length) {
        block.push(line);
      } else {
        out.push(line);
      }
    }
    flush();

    let text = out.join("\n");
    if (!/^review:/m.test(text)) {
      text = text.replace(/\n*$/, "\n") + "review:\n  status: draft\n";
      log.push(`${dir}/${f}: review draft`);
    }
    if (!dry) fs.writeFileSync(file, text);
  }
}
console.log(log.join("\n"));
console.log(`\n${log.length} changes${dry ? " (dry run, nothing written)" : ""}.`);
