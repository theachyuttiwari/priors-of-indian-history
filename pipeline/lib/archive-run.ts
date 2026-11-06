/**
 * The archiving run behind pipeline/archive.ts, with its network and clock passed in so tests can
 * drive it.
 *
 * Per source the states are: no snapshot looked up yet, `found`, `none` (the CDX index answered
 * and holds no usable capture) and `unknown` (the index could not be read). Only `none` may lead
 * to a Save Page Now capture: a CDX outage is not evidence that no snapshot exists.
 *
 * Lookups and captures can take minutes, so the file is read again just before it is written, and
 * a result is applied only to a source that still has the same url and still has no archive_url.
 * Edits made to the file during the run are kept.
 */
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIRS, isContentFile } from "../../src/lib/validate";
import { editSources } from "./source-lines";

export const UA = "Priors archive bot (+https://github.com/theachyuttiwari/priors-of-indian-history)";

export type Snapshot = { url: string; date: string };
export type Lookup = { kind: "found"; snap: Snapshot } | { kind: "none" } | { kind: "unknown"; error: string };
export type ArchiveDeps = {
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  log: (line: string) => void;
};
export type ArchiveOptions = { root: string; save: boolean; filter?: string };
export type ArchiveSummary = { found: number; saved: number; missing: string[]; unknown: string[] };

export const realDeps: ArchiveDeps = {
  fetch: (...a) => fetch(...a),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  log: (line) => console.log(line),
};

function snapshotFrom(timestamp: string, original: string): Snapshot {
  const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
  return { url: `https://web.archive.org/web/${timestamp}/${original}`, date };
}

/**
 * A good (HTTP 200) snapshot via the CDX API. Dated sources get the first snapshot on or after
 * publication; never an earlier one, which would be a different page at the same address.
 * Undated sources (living pages such as Wikipedia) get the latest snapshot, nearest to when
 * the page was read. The index can list a capture that no longer replays, so each candidate is
 * checked; the first that loads is used. Three failed attempts give `unknown`, never `none`.
 */
export async function lookupSnapshot(url: string, date: string | undefined, deps: ArchiveDeps): Promise<Lookup> {
  const from = date ? `&from=${date.replace(/-/g, "").padEnd(8, "0").slice(0, 8)}` : "";
  const api =
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}${from}` +
    `&filter=statuscode:200&limit=${date ? 5 : -5}&output=json&fl=timestamp,original`;
  let error = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await deps.fetch(api, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // An empty body is how CDX says "no captures"; anything else that is not a JSON array is an error.
      const body = (await res.text()).trim();
      const parsed: unknown = body === "" ? [] : JSON.parse(body);
      if (!Array.isArray(parsed)) throw new Error("CDX answer is not a list");
      const rows = (parsed as string[][]).slice(1); // rows[0] is the header
      // Dated: earliest first. Undated: the API returns the last rows oldest first, so try newest first.
      for (const [timestamp] of date ? rows : rows.reverse()) {
        const replay = await deps.fetch(`https://web.archive.org/web/${timestamp}id_/${url}`, {
          method: "HEAD",
          headers: { "User-Agent": UA },
        });
        if (replay.ok) return { kind: "found", snap: snapshotFrom(timestamp, url) };
      }
      return { kind: "none" };
    } catch (e) {
      error = String(e);
      await deps.sleep(3000 * (attempt + 1));
    }
  }
  return { kind: "unknown", error };
}

/** Ask Save Page Now for a capture and wait for it. A network error skips the source, not the run. */
async function capture(url: string, deps: ArchiveDeps): Promise<Snapshot | undefined> {
  try {
    return await captureOnce(url, deps);
  } catch {
    // Refused connections usually mean rate limiting: wait before the next source.
    await deps.sleep(60000);
    return undefined;
  }
}

async function captureOnce(url: string, deps: ArchiveDeps): Promise<Snapshot | undefined> {
  const headers: Record<string, string> = {
    "User-Agent": UA,
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (process.env.IA_ACCESS_KEY && process.env.IA_SECRET_KEY) {
    headers.Authorization = `LOW ${process.env.IA_ACCESS_KEY}:${process.env.IA_SECRET_KEY}`;
  }
  const res = await deps.fetch("https://web.archive.org/save", {
    method: "POST",
    headers,
    body: new URLSearchParams({ url, skip_first_archive: "1" }),
  });
  if (!res.ok) return undefined;
  const job = (await res.json().catch(() => ({}))) as { job_id?: string };
  if (!job.job_id) return undefined;
  for (let i = 0; i < 24; i++) {
    await deps.sleep(5000);
    const s = await deps.fetch(`https://web.archive.org/save/status/${job.job_id}`, { headers });
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

/**
 * Write snapshots into the file as it is now, not as it was when the run read it. A result applies
 * only to the source with the same id that still points at the url that was looked up and still
 * has no archive_url. Returns the ids that were left alone because the source changed.
 */
export function writeSnapshots(file: string, results: Map<string, { url: string; snap: Snapshot }>): string[] {
  const now = fs.readFileSync(file, "utf8");
  const stale: string[] = [];
  const next = editSources(now, (b) => {
    const id = b.get("id")!;
    const r = results.get(id);
    if (!r) return;
    if (b.get("url") !== r.url || b.has("archive_url")) {
      stale.push(id);
      return;
    }
    b.set("archive_url", r.snap.url);
    b.set("archive_date", r.snap.date);
  });
  if (next !== now) fs.writeFileSync(file, next);
  return stale;
}

export async function runArchive(opts: ArchiveOptions, deps: ArchiveDeps = realDeps): Promise<ArchiveSummary> {
  const { root, save, filter } = opts;
  const summary: ArchiveSummary = { found: 0, saved: 0, missing: [], unknown: [] };
  for (const dir of CONTENT_DIRS) {
    const folder = path.join(root, dir);
    if (!fs.existsSync(folder)) continue;
    for (const f of fs.readdirSync(folder).filter(isContentFile).sort()) {
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

      const results = new Map<string, { url: string; snap: Snapshot }>();
      // Lookups are read-only, so run a few at a time. Captures stay one at a time.
      const lookups = await pool(todo, 2, (t) => lookupSnapshot(t.url, t.date, deps));
      for (const [i, t] of todo.entries()) {
        const l = lookups[i];
        let snap: Snapshot | undefined;
        if (l.kind === "found") {
          snap = l.snap;
          summary.found++;
        } else if (l.kind === "none" && save) {
          snap = await capture(t.url, deps);
          if (snap) summary.saved++;
          await deps.sleep(12000);
        }
        if (snap) results.set(t.id, { url: t.url, snap });
        else if (l.kind === "unknown") summary.unknown.push(`${rel} ${t.id} ${t.url} (${l.error})`);
        else summary.missing.push(`${rel} ${t.id} ${t.url}`);
        const tag = snap ? "ok  " : l.kind === "unknown" ? "err " : "none";
        deps.log(`${tag} ${rel} ${t.id}${snap ? ` ${snap.date}` : ""}`);
      }

      for (const id of writeSnapshots(file, results)) {
        deps.log(`skip ${rel} ${id}: the source changed during the run; run again`);
      }
    }
  }
  return summary;
}
