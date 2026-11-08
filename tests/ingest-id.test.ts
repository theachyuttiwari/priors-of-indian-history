// Regression: ingest must not write outside content/current or content/proposed when the model
// returns an entry id with path parts (security audit run-1, lead 1:
// pipeline/ingest.ts:model-entry-id-unconstrained-write-path).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { entryFile, ingestTarget, isSafeEntryId } from "../pipeline/ingest-target";
import { writeIngested } from "../pipeline/ingest-write";

const UNSAFE = [
  "../precedents/zz-escape",
  "../../zz-escape",
  "../../../../../../tmp/x",
  "/etc/x",
  "a/b",
  "a\\b",
  "..",
  ".",
  "",
  "x.yaml",
  "Upper-Case",
  "-leading",
  "trailing-",
  "double--hyphen",
  "with space",
  "nul\0byte",
  "x".repeat(121),
];

describe("isSafeEntryId", () => {
  it.each(["x", "farm-laws-2020", "anti-caa-shaheen-bagh-2019-2020", "x".repeat(120)])("accepts %s", (id) => {
    expect(isSafeEntryId(id)).toBe(true);
  });

  it.each(UNSAFE)("rejects %j", (id) => {
    expect(isSafeEntryId(id)).toBe(false);
  });

  it("rejects values that are not strings", () => {
    expect(isSafeEntryId(undefined)).toBe(false);
    expect(isSafeEntryId(42)).toBe(false);
  });

  it("accepts every id already in content/", () => {
    for (const dir of ["precedents", "current"]) {
      for (const f of fs.readdirSync(path.join("content", dir)).filter((f) => f.endsWith(".yaml"))) {
        expect(isSafeEntryId(f.replace(/\.yaml$/, "")), `${dir}/${f}`).toBe(true);
      }
    }
  });
});

describe("entryFile", () => {
  it("resolves to a file directly inside the directory", () => {
    expect(entryFile("/c", "current", "x")).toBe(path.resolve("/c/current/x.yaml"));
    expect(entryFile("/c", "proposed", "x")).toBe(path.resolve("/c/proposed/x.yaml"));
  });

  it.each(UNSAFE)("throws for %j", (id) => {
    expect(() => entryFile("/c", "current", id)).toThrow(/entry id/);
  });

  it("ingestTarget throws for an unsafe id, also on the proposal path", () => {
    expect(() => ingestTarget("/c", "../../x", null)).toThrow(/unsafe entry id/);
    expect(() => ingestTarget("/c", "../x", "review:\n  status: verified\n")).toThrow(/unsafe entry id/);
  });
});

describe("writeIngested with an unsafe id", () => {
  it.each(["../precedents/zz-escape", "../../zz-escape"])("writes nothing for %j", (id) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "priors-id-"));
    try {
      const root = path.join(tmp, "content");
      fs.mkdirSync(path.join(root, "current"), { recursive: true });
      fs.mkdirSync(path.join(root, "precedents"));

      expect(() => writeIngested(root, id, "id: x\n")).toThrow(/unsafe entry id/);

      expect(fs.readdirSync(path.join(root, "current"))).toEqual([]);
      expect(fs.readdirSync(path.join(root, "precedents"))).toEqual([]);
      expect(fs.readdirSync(tmp)).toEqual(["content"]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("still writes a safe id into current/", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "priors-id-"));
    try {
      const t = writeIngested(tmp, "safe-id", "id: safe-id\n");
      expect(t).toEqual({ kind: "new", file: path.resolve(tmp, "current", "safe-id.yaml") });
      expect(fs.readFileSync(path.join(tmp, "current", "safe-id.yaml"), "utf8")).toBe("id: safe-id\n");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
