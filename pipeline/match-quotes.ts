/**
 * Check every quote against the archived copy of its source and record the result in
 * content/checks/quotes.json, which the validator reads.
 *
 *   npx tsx pipeline/match-quotes.ts            check quotes with no passing record
 *   npx tsx pipeline/match-quotes.ts --all      re-check every quote
 *   npx tsx pipeline/match-quotes.ts farm       only entries whose id contains "farm"
 *
 * Source text is cached in ~/.cache/priors/sources (decision D: no source text in the repo).
 * A translated quote is checked on the words the source itself published: the English text
 * when the source translated it, the original when Priors translated it.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { findQuote, htmlToText } from "../src/lib/quote-match";
import {
  loadQuoteChecks,
  quoteKeySync,
  QUOTE_CHECKS_FILE,
  validateContent,
  type QuoteCheck,
} from "../src/lib/validate";

const args = process.argv.slice(2);
const all = args.includes("--all");
const filter = args.find((a) => !a.startsWith("--"));
const root = path.join(process.cwd(), "content");
const cacheDir = path.join(os.homedir(), ".cache", "priors", "sources");
const UA = "Priors quote checker (+https://github.com/theachyuttiwari/priors-of-indian-history)";

/** Raw capture of the original page: the Wayback `id_` form skips the archive toolbar. */
function rawArchiveUrl(archiveUrl: string): string {
  return archiveUrl.replace(/\/web\/(\d+)\//, "/web/$1id_/");
}

/**
 * A scanned book or report on archive.org: its details page holds no text, but the item has an OCR
 * file (`*_djvu.txt`). archive.org is itself the archive, so its own copy is used, not a snapshot.
 */
async function archiveOrgText(url: string): Promise<string | undefined> {
  const id = url.match(/^https:\/\/archive\.org\/details\/([^/?#]+)/)?.[1];
  if (!id) return undefined;
  const res = await fetch(`https://archive.org/metadata/${id}`, { headers: { "User-Agent": UA } });
  if (!res.ok) return undefined;
  const meta = (await res.json()) as { files?: { name: string }[] };
  const txt = meta.files?.find((f) => f.name.endsWith("_djvu.txt"))?.name;
  return txt ? `https://archive.org/download/${id}/${encodeURIComponent(txt)}` : undefined;
}

/**
 * Text of a PDF (court judgments, parliamentary debates) via poppler's pdftotext. Reading order, not
 * -layout: debates are printed in two columns, and -layout would interleave them.
 */
function pdfToText(bytes: Buffer): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "priors-pdf-"));
  try {
    fs.writeFileSync(path.join(tmp, "in.pdf"), bytes);
    execFileSync("pdftotext", ["-enc", "UTF-8", path.join(tmp, "in.pdf"), path.join(tmp, "out.txt")]);
    return fs.readFileSync(path.join(tmp, "out.txt"), "utf8");
  } catch (e) {
    throw new Error(`PDF source: needs pdftotext (poppler-utils) on PATH. ${e}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function sourceText(url: string): Promise<{ text: string; sha256: string }> {
  fs.mkdirSync(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `${createHash("sha256").update(url).digest("hex").slice(0, 24)}.txt`);
  let text: string;
  if (fs.existsSync(file)) text = fs.readFileSync(file, "utf8");
  else {
    const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.subarray(0, 5).toString("latin1") === "%PDF-") text = pdfToText(bytes);
    else {
      const body = bytes.toString("utf8");
      text = /<html|<body|<p\b/i.test(body) ? htmlToText(body) : body;
    }
    fs.writeFileSync(file, text);
  }
  return { text, sha256: createHash("sha256").update(text).digest("hex") };
}

async function main() {
  const checks = loadQuoteChecks(root);
  const today = new Date().toISOString().slice(0, 10);
  let checked = 0;
  const failures: string[] = [];

  for (const r of validateContent(root)) {
    const p = r.entry;
    if (!p || (filter && !p.id.includes(filter))) continue;
    for (const [i, pos] of p.positions.entries()) {
      const q = pos.quote;
      if (!q) continue;
      const key = quoteKeySync(q.text);
      const prior = checks[p.id]?.[key];
      if (!all && prior?.result === "exact") continue;

      const src = p.sources.find((s) => s.id === q.source);
      const where = `${p.id} positions[${i}]`;
      if (!src) continue; // the validator reports unknown sources
      const fetchUrl = (await archiveOrgText(src.url)) ?? (src.archive_url ? rawArchiveUrl(src.archive_url) : src.url);
      const needle = pos.kind === "translated" && q.translated_by === "priors" ? (q.original ?? q.text) : q.text;

      let record: QuoteCheck;
      try {
        const { text, sha256 } = await sourceText(fetchUrl);
        const m = findQuote(needle, text);
        record = {
          position: i,
          source: src.id,
          fetched: fetchUrl,
          checked: today,
          result: m.status,
          ...(m.status !== "exact" && { score: Math.round(m.score * 100) / 100, passage: m.passage }),
          text_sha256: sha256,
        };
        if (!src.archive_url) record.note = "checked against the live page; archive the source and re-check";
      } catch (e) {
        record = { position: i, source: src.id, fetched: fetchUrl, checked: today, result: "error", note: String(e) };
      }
      (checks[p.id] ??= {})[key] = record;
      checked++;
      const line = `${record.result.padEnd(7)} ${where} (${src.id})`;
      console.log(line);
      if (record.result !== "exact") {
        failures.push(
          record.passage ? `${line}\n          closest: "${record.passage}"` : `${line} ${record.note ?? ""}`,
        );
      }
    }
  }

  fs.mkdirSync(path.dirname(path.join(root, QUOTE_CHECKS_FILE)), { recursive: true });
  fs.writeFileSync(path.join(root, QUOTE_CHECKS_FILE), `${JSON.stringify(checks, null, 2)}\n`);
  console.log(`\n${checked} quotes checked, ${failures.length} not matched exactly.`);
  if (failures.length) {
    console.log(failures.join("\n"));
    process.exit(1);
  }
}

main();
