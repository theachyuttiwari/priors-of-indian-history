// Regression: the review lifecycle can no longer be walked backwards or
// side-stepped by a rename (STATE_MACHINES audit 2026-11-06, defect 4.1b).
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { Precedent } from "../src/lib/schema";
import { correctionsProblem } from "../pipeline/corrections-rule";
import { entry } from "./fixtures";

const p = (o: Record<string, unknown> = {}) => Precedent.parse(entry(o));
const verified = { review: { status: "verified", by: "AT" } };
const correction = { corrections: [{ date: "2026-11-01", kind: "correction", note: "n" }] };

describe("correctionsProblem", () => {
  it("lets drafts change freely", () => {
    expect(correctionsProblem(p(), p({ summary: "changed" }))).toBeNull();
  });

  it("refuses a changed claim on a verified entry without a correction", () => {
    expect(correctionsProblem(p(verified), p({ ...verified, summary: "changed" }))).toMatch(/changed what it claims/);
  });

  it("allows a changed claim with a correction", () => {
    expect(correctionsProblem(p(verified), p({ ...verified, ...correction, summary: "changed" }))).toBeNull();
  });

  it("refuses verified -> draft without a correction", () => {
    expect(correctionsProblem(p(verified), p({ review: { status: "draft" } }))).toMatch(
      /lowered from verified to draft/,
    );
  });

  it("refuses dropping the review block of a verified entry", () => {
    expect(correctionsProblem(p(verified), p())).toMatch(/lowered from verified to draft/);
  });

  it("allows a downgrade that adds a correction", () => {
    expect(correctionsProblem(p(verified), p({ review: { status: "checked" }, ...correction }))).toBeNull();
  });

  it("allows an upgrade", () => {
    expect(correctionsProblem(p({ review: { status: "checked" } }), p(verified))).toBeNull();
  });
});

describe("check-corrections.ts on a real diff", () => {
  const script = path.resolve("pipeline/check-corrections.ts");
  const tsx = path.resolve("node_modules/.bin/tsx");

  function repo() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "priors-cc-"));
    const g = (...a: string[]) => execFileSync("git", a, { cwd: dir, encoding: "utf8" });
    g("init", "-q", "-b", "main");
    g("config", "user.email", "t@example.org");
    g("config", "user.name", "t");
    fs.mkdirSync(path.join(dir, "content", "current"), { recursive: true });
    fs.writeFileSync(path.join(dir, "content/current/a.yaml"), YAML.stringify(entry(verified)));
    g("add", ".");
    g("commit", "-qm", "base");
    g("checkout", "-qb", "pr");
    return { dir, g };
  }

  function run(dir: string) {
    try {
      return { code: 0, out: execFileSync(tsx, [script, "main"], { cwd: dir, encoding: "utf8" }) };
    } catch (e) {
      const err = e as { status: number; stdout: string };
      return { code: err.status, out: err.stdout };
    }
  }

  it("fails a renamed verified entry whose claims changed", () => {
    const { dir, g } = repo();
    g("mv", "content/current/a.yaml", "content/current/b.yaml");
    fs.writeFileSync(
      path.join(dir, "content/current/b.yaml"),
      YAML.stringify(entry({ ...verified, summary: "Rewritten." })),
    );
    g("commit", "-qam", "rename and rewrite");
    const r = run(dir);
    expect(r.out).toMatch(/FAIL content\/current\/b\.yaml \(renamed from content\/current\/a\.yaml\)/);
    expect(r.code).toBe(1);
  });

  it("fails a verified entry lowered to draft", () => {
    const { dir, g } = repo();
    fs.writeFileSync(path.join(dir, "content/current/a.yaml"), YAML.stringify(entry({ review: { status: "draft" } })));
    g("commit", "-qam", "downgrade");
    const r = run(dir);
    expect(r.out).toMatch(/lowered from verified to draft/);
    expect(r.code).toBe(1);
  });
}, 30_000);
