/**
 * Source archiving (pipeline/lib/archive-run.ts). A CDX error is not "no snapshot", so it never
 * triggers a capture; and the file is re-read before it is written, so edits made during the
 * (minutes-long) run survive. ARCHIVE_MODULE=/abs/path.ts runs the same tests on another copy.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

type Mod = typeof import("../pipeline/lib/archive-run");
const { runArchive } = (await import(process.env.ARCHIVE_MODULE ?? "../pipeline/lib/archive-run")) as Mod;

const SRC = `id: farm-laws-2020
title: Farm laws protest
summary: |
  A short summary.
sources:
  - id: s1
    url: https://example.org/report
    date: 2020-11-26
  - id: s2
    url: https://example.org/other
    archive_url: https://web.archive.org/web/20201201000000/https://example.org/other
    archive_date: 2020-12-01
`;

let root: string;
let file: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "priors-archive-"));
  fs.mkdirSync(path.join(root, "precedents"));
  fs.mkdirSync(path.join(root, "current"));
  file = path.join(root, "precedents", "farm-laws-2020.yaml");
  fs.writeFileSync(file, SRC);
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** A fake Wayback: `cdx` answers the index lookup; Save Page Now always succeeds. */
function wayback(cdx: () => Promise<Response>) {
  const calls: string[] = [];
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push(`${init?.method ?? "GET"} ${url}`);
    if (url.includes("/cdx/search/cdx")) return cdx();
    if (init?.method === "HEAD") return new Response(null, { status: 200 });
    if (url === "https://web.archive.org/save") return json({ job_id: "j1" });
    if (url.includes("/save/status/")) return json({ status: "success", timestamp: "20261106000000" });
    throw new Error(`unexpected fetch ${url}`);
  }) as typeof fetch;
  const deps = { fetch: fetchFn, sleep: async () => {}, log: () => {} };
  const captures = () => calls.filter((c) => c === "POST https://web.archive.org/save").length;
  return { deps, calls, captures };
}

describe("archive: CDX error is not 'no snapshot'", () => {
  it("does not capture when every CDX attempt fails", async () => {
    const w = wayback(async () => new Response("busy", { status: 503 }));
    await runArchive({ root, save: true }, w.deps);
    expect(w.captures()).toBe(0);
    expect(fs.readFileSync(file, "utf8")).toBe(SRC);
  });

  it("does not capture when CDX answers with something that is not a list", async () => {
    const w = wayback(async () => new Response("<html>rate limited</html>", { status: 200 }));
    await runArchive({ root, save: true }, w.deps);
    expect(w.captures()).toBe(0);
  });

  it("does capture when CDX answers with no rows", async () => {
    const w = wayback(async () => json([["timestamp", "original"]]));
    await runArchive({ root, save: true }, w.deps);
    expect(w.captures()).toBe(1);
    expect(fs.readFileSync(file, "utf8")).toContain("archive_url: https://web.archive.org/web/20261106000000/");
  });

  it("uses an existing snapshot without capturing", async () => {
    const w = wayback(async () =>
      json([
        ["timestamp", "original"],
        ["20201127000000", "https://example.org/report"],
      ]),
    );
    await runArchive({ root, save: true }, w.deps);
    expect(w.captures()).toBe(0);
    expect(fs.readFileSync(file, "utf8")).toContain("archive_date: 2020-11-27");
  });
});

describe("archive: the file is re-read before writing", () => {
  it("keeps an edit made to the file while lookups ran", async () => {
    const w = wayback(async () => {
      // Someone edits the summary while the run waits on the network.
      fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("A short summary.", "A corrected summary."));
      return json([
        ["timestamp", "original"],
        ["20201127000000", "https://example.org/report"],
      ]);
    });
    await runArchive({ root, save: false }, w.deps);
    const after = fs.readFileSync(file, "utf8");
    expect(after).toContain("A corrected summary.");
    expect(after).toContain("archive_date: 2020-11-27");
  });

  it("does not write a snapshot onto a source whose url changed during the run", async () => {
    const w = wayback(async () => {
      fs.writeFileSync(
        file,
        fs.readFileSync(file, "utf8").replace("https://example.org/report", "https://example.org/moved"),
      );
      return json([
        ["timestamp", "original"],
        ["20201127000000", "https://example.org/report"],
      ]);
    });
    await runArchive({ root, save: false }, w.deps);
    const after = fs.readFileSync(file, "utf8");
    expect(after).toContain("url: https://example.org/moved");
    expect(after).not.toContain("archive_date: 2020-11-27");
  });
});
