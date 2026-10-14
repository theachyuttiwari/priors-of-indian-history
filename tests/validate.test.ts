import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import YAML from "yaml";
import { checkEntry, isContentFile, validateContent } from "@/lib/validate";
import { entry } from "./fixtures";

const FILE = "precedents/test-protest-2020.yaml";

describe("checkEntry", () => {
  it("accepts a valid entry with no errors or warnings", () => {
    const r = checkEntry(FILE, entry());
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    expect(r.entry?.id).toBe("test-protest-2020");
  });

  it("reports schema errors with their path", () => {
    const r = checkEntry(FILE, entry({ actions: [{ type: "not_a_type", description: "x" }] }));
    expect(r.entry).toBeUndefined();
    expect(r.errors.some((e) => e.startsWith("actions.0.type"))).toBe(true);
  });

  it("fails when the id does not match the filename", () => {
    const r = checkEntry("precedents/other-name.yaml", entry());
    expect(r.errors).toContain('id "test-protest-2020" does not match filename "other-name"');
  });

  it("accepts the .yml extension for the filename rule", () => {
    expect(checkEntry("precedents/test-protest-2020.yml", entry()).errors).toEqual([]);
  });

  it("fails on a reference to a source that does not exist", () => {
    const e = entry();
    (e.actions as { sources: string[] }[])[0].sources = ["s9"];
    expect(checkEntry(FILE, e).errors).toContain("actions[0]: unknown source s9");
  });

  it("fails on duplicate source ids", () => {
    const s = { id: "s1", title: "Again", url: "https://example.org/b" };
    const e = entry();
    e.sources = [...(e.sources as object[]), s];
    expect(checkEntry(FILE, e).errors).toContain("duplicate source id s1");
  });

  it("warns, but does not fail, on an unsourced action or position", () => {
    const e = entry();
    (e.actions as { sources: string[] }[])[0].sources = [];
    (e.positions as { sources: string[] }[])[0].sources = [];
    const r = checkEntry(FILE, e);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual(["actions[0] has no sources", "positions[0] has no sources"]);
  });
});

describe("isContentFile", () => {
  it("accepts .yaml and .yml only", () => {
    expect(isContentFile("a.yaml")).toBe(true);
    expect(isContentFile("a.yml")).toBe(true);
    expect(isContentFile("a.json")).toBe(false);
    expect(isContentFile("README.md")).toBe(false);
  });
});

describe("validateContent", () => {
  let root: string;

  function write(rel: string, data: unknown) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, typeof data === "string" ? data : YAML.stringify(data));
  }

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  function setup() {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "priors-"));
  }

  it("reads both content directories and both extensions", () => {
    setup();
    write("precedents/test-protest-2020.yaml", entry());
    write("current/now-2026.yml", entry({ id: "now-2026", related_precedents: ["test-protest-2020"] }));
    const reports = validateContent(root);
    expect(reports.map((r) => r.file)).toEqual(["precedents/test-protest-2020.yaml", "current/now-2026.yml"]);
    expect(reports.flatMap((r) => r.errors)).toEqual([]);
  });

  it("reports a YAML syntax error as a failure", () => {
    setup();
    write("precedents/broken.yaml", "id: [unclosed\n");
    const [r] = validateContent(root);
    expect(r.errors[0]).toMatch(/^YAML parse error/);
  });

  it("fails a related_precedents id that does not exist", () => {
    setup();
    write("current/now-2026.yaml", entry({ id: "now-2026", related_precedents: ["missing"] }));
    const [r] = validateContent(root);
    expect(r.errors).toContain('related_precedents: no precedent with id "missing"');
  });

  it("fails the second file that reuses an id", () => {
    setup();
    write("precedents/test-protest-2020.yaml", entry());
    write("current/test-protest-2020.yaml", entry());
    const reports = validateContent(root);
    expect(reports[0].errors).toEqual([]);
    expect(reports[1].errors).toContain('id "test-protest-2020" is also used by precedents/test-protest-2020.yaml');
  });
});

describe("sourcing rules", () => {
  const withPosition = (pos: Record<string, unknown>) =>
    entry({
      positions: [{ party: "Centre Party", in_power: true, statement: "A statement.", sources: ["s1"], ...pos }],
    });

  it("rejects archive.today and its mirrors", () => {
    const e = entry({
      sources: [{ id: "s1", title: "t", url: "https://example.org/a", archive_url: "https://archive.ph/abc" }],
    });
    expect(checkEntry(FILE, e).errors.some((m) => m.includes("archive.today"))).toBe(true);
  });

  it("rejects an accessed date before publication", () => {
    const e = entry({
      sources: [{ id: "s1", title: "t", url: "https://example.org/a", date: "2020-05-01", accessed: "2020-04-01" }],
    });
    expect(checkEntry(FILE, e).errors).toContain("sources s1: accessed before it was published");
  });

  it("requires a quote for verbatim and translated statements", () => {
    expect(checkEntry(FILE, withPosition({ kind: "verbatim" })).errors).toContain(
      "positions[0]: kind verbatim needs quote.text and quote.source",
    );
  });

  it("forbids a quote on a paraphrase", () => {
    const e = withPosition({ kind: "paraphrase", quote: { text: "x", source: "s1" } });
    expect(checkEntry(FILE, e).errors).toContain("positions[0]: a paraphrase cannot carry a quote");
  });

  it("requires the original text for a translated quote", () => {
    const e = withPosition({ kind: "translated", quote: { text: "x", source: "s1" } });
    expect(checkEntry(FILE, e).errors).toContain(
      "positions[0].quote: a translated quote needs original, language and translated_by",
    );
  });

  it("rejects a machine translator", () => {
    const e = withPosition({
      kind: "translated",
      quote: { text: "x", original: "y", language: "hi", translated_by: "machine", source: "s1" },
    });
    expect(checkEntry(FILE, e).errors.some((m) => m.startsWith("positions.0.quote.translated_by"))).toBe(true);
  });

  it("requires the quote source to be one of the statement sources", () => {
    const e = entry({
      sources: [
        { id: "s1", title: "t", url: "https://example.org/a" },
        { id: "s2", title: "t", url: "https://example.org/b" },
      ],
      positions: [
        {
          party: "P",
          in_power: true,
          statement: "x",
          sources: ["s1"],
          kind: "verbatim",
          quote: { text: "x", source: "s2" },
        },
      ],
    });
    expect(checkEntry(FILE, e).errors).toContain(
      "positions[0].quote: source s2 must also be in the statement's sources",
    );
  });

  it("requires a reviewer and date for verified", () => {
    expect(checkEntry(FILE, entry({ review: { status: "verified" } })).errors).toContain(
      "review: verified needs by and date",
    );
  });

  it("reports a Wikipedia-only claim as a todo, not an error, while the rule is phased in", () => {
    const e = entry({ sources: [{ id: "s1", title: "t", url: "https://en.wikipedia.org/wiki/x" }] });
    const r = checkEntry(FILE, e);
    expect(r.errors).toEqual([]);
    expect(r.todos.filter((t) => t.rule === "lead-only")).toHaveLength(2);
  });
});
