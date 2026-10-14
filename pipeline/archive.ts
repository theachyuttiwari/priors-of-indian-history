/**
 * Give every source a Wayback Machine snapshot (decision G: Wayback only, never archive.today).
 *
 *   npx tsx pipeline/archive.ts                 use existing snapshots only (read-only lookups)
 *   npx tsx pipeline/archive.ts --save          also ask Save Page Now to capture sources with none
 *   npx tsx pipeline/archive.ts --save farm     only files whose path contains "farm"
 *
 * Optional: IA_ACCESS_KEY and IA_SECRET_KEY (archive.org S3 keys) raise Save Page Now limits.
 * Writes archive_url and archive_date under each source's url. It never sets `accessed`:
 * that means a person or the pipeline opened and read the source.
 */
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIRS, isContentFile } from "../src/lib/validate";
import { editSources } from "./lib/source-lines";

const args = process.argv.slice(2);
const save = args.includes("--save");
const filter = args.find((a) => !a.startsWith("--"));
const UA = "Priors archive bot (+https://github.com/theachyuttiwari/priors-of-indian-history)";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Snapshot = { url: string; date: string };

function snapshotFrom(timestamp: string, original: string): Snapshot {
  const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
  return { url: `https://web.archive.org/web/${timestamp}/${original}`, date };
}

/**
 * A good (HTTP 200) snapshot via the CDX API. Dated sources get the first snapshot on or after
 * publication; never an earlier one, which would be a different page at the same address.
 * Undated sources (living pages such as Wikipedia) get the latest snapshot, nearest to when
 * the page was read.
 */
async function existing(url: string, date?: string): Promise<Snapshot | undefined> {
  const from = date ? `&from=${date.replace(/-/g, "").padEnd(8, "0").slice(0, 8)}` : "";
  const api =
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}${from}` +
    `&filter=statuscode:200&limit=${date ? 1 : -1}&output=json&fl=timestamp,original`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(api, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = (await res.json().catch(() => [])) as string[][];
      const hit = rows[1]; // rows[0] is the header
      return hit ? snapshotFrom(hit[0], url) : undefined;
    } catch {
      await sleep(3000 * (attempt + 1));
    }
  }
  return undefined;
}

/** Ask Save Page Now for a capture and wait for it. A network error skips the source, not the run. */
async function capture(url: string): Promise<Snapshot | undefined> {
  try {
    return await captureOnce(url);
  } catch {
    // Refused connections usually mean rate limiting: wait before the next source.
    await sleep(60000);
    return undefined;
  }
}

async function captureOnce(url: string): Promise<Snapshot | undefined> {
  const headers: Record<string, string> = {
    "User-Agent": UA,
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (process.env.IA_ACCESS_KEY && process.env.IA_SECRET_KEY) {
    headers.Authorization = `LOW ${process.env.IA_ACCESS_KEY}:${process.env.IA_SECRET_KEY}`;
  }
  const res = await fetch("https://web.archive.org/save", {
    method: "POST",
    headers,
    body: new URLSearchParams({ url, skip_first_archive: "1" }),
  });
  if (!res.ok) return undefined;
  const job = (await res.json().catch(() => ({}))) as { job_id?: string };
  if (!job.job_id) return undefined;
  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    const s = await fetch(`https://web.archive.org/save/status/${job.job_id}`, { headers });
    const st = (await s.json().catch(() => ({}))) as { status?: string; timestamp?: string; original_url?: string };
    if (st.status === "success" && st.timestamp) return snapshotFrom(st.timestamp, st.original_url ?? url);
    if (st.status === "error") return undefined;
  }
  return undefined;
}

/** Map over items with at most `n` promises in flight, keeping order. */
async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

async function main() {
  const root = path.join(process.cwd(), "content");
  let found = 0;
  let saved = 0;
  const missing: string[] = [];
  for (const dir of CONTENT_DIRS) {
    for (const f of fs.readdirSync(path.join(root, dir)).filter(isContentFile).sort()) {
      const rel = `${dir}/${f}`;
      if (filter && !rel.includes(filter)) continue;
      const file = path.join(root, rel);
      const text = fs.readFileSync(file, "utf8");

      // Collect work first: lookups are async, edits are sync.
      const todo: { id: string; url: string; date?: string }[] = [];
      editSources(text, (b) => {
        const url = b.get("url");
        if (url && !b.has("archive_url")) todo.push({ id: b.get("id")!, url, date: b.get("date") });
      });
      if (!todo.length) continue;

      const results = new Map<string, Snapshot>();
      // Lookups are read-only, so run a few at a time. Captures stay one at a time.
      const lookups = await pool(todo, 2, (t) => existing(t.url, t.date));
      for (const [i, t] of todo.entries()) {
        let snap = lookups[i];
        if (snap) found++;
        else if (save) {
          snap = await capture(t.url);
          if (snap) saved++;
          await sleep(12000);
        }
        if (snap) results.set(t.id, snap);
        else missing.push(`${rel} ${t.id} ${t.url}`);
        console.log(`${snap ? "ok  " : "none"} ${rel} ${t.id}${snap ? ` ${snap.date}` : ""}`);
      }

      const next = editSources(text, (b) => {
        const snap = results.get(b.get("id")!);
        if (!snap) return;
        b.set("archive_url", snap.url);
        b.set("archive_date", snap.date);
      });
      if (next !== text) fs.writeFileSync(file, next);
    }
  }
  console.log(`\n${found} existing snapshots used, ${saved} new captures, ${missing.length} without a snapshot.`);
  if (missing.length) console.log(missing.map((m) => `  ${m}`).join("\n"));
}

main();
