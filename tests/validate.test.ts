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

  const govSource = { id: "g", title: "List", publisher: "Assembly", url: "https://example.org/g", tier: "record" };
  const centre = {
    name: "Centre",
    terms: [{ from: "2014-05-26", head: "A", party: "Blue Party", sources: ["g"] }],
    sources: [govSource],
  };

  it("checks government tables: order, overlap, party, sources", () => {
    setup();
    write("governments/centre.yaml", centre);
    write("governments/somestate.yaml", {
      name: "Somestate",
      terms: [
        { from: "2010-01-01", to: "2015-01-01", head: "B", party: "Red Party", sources: ["g"] },
        { from: "2014-06-01", to: "2013-01-01", head: "C", sources: ["missing"] },
        { from: "2016-01-01", head: "President's Rule", kind: "presidents_rule", party: "Red Party", sources: ["w"] },
      ],
      sources: [govSource, { id: "w", title: "W", url: "https://en.wikipedia.org/wiki/x" }],
    });
    const reports = validateContent(root);
    expect(reports[0]).toMatchObject({ file: "governments/centre.yaml", errors: [] });
    expect(reports[1].errors).toEqual([
      "terms[1] (C, from 2014-06-01): unknown source missing",
      "terms[1] (C, from 2014-06-01): ends before it starts",
      "terms[1] (C, from 2014-06-01): an elected term needs a party",
      "terms[1] (C, from 2014-06-01): overlaps the term before (B, to 2015-01-01)",
      "terms[2] (President's Rule, from 2016-01-01): rests only on lead sources",
      "terms[2] (President's Rule, from 2016-01-01): presidents_rule counts for the Centre; drop party",
    ]);
  });

  it("fails actions the tables cannot attribute", () => {
    setup();
    write("governments/centre.yaml", centre);
    const action = { type: "section_144", date: "2020-01-02", description: "x", sources: ["s1"] };
    write(
      "precedents/test-protest-2020.yaml",
      entry({
        actions: [
          { ...action, actor: "centre" },
          { ...action, actor: "state" },
          { ...action, actor: "police", state: "Nowhere" },
          { ...action, actor: "centre", date: "2001-01-01" },
        ],
      }),
    );
    const r = validateContent(root).find((x) => x.file.startsWith("precedents/"))!;
    expect(r.errors).toEqual([
      "actions[1]: state action names no state; set state to where it happened",
      "actions[2]: no government table for Nowhere",
      "actions[3]: no Centre government recorded on 2001-01-01",
    ]);
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

  it("rejects a claim whose only source is Wikipedia", () => {
    const e = entry({ sources: [{ id: "s1", title: "t", url: "https://en.wikipedia.org/wiki/x" }] });
    const r = checkEntry(FILE, e);
    expect(r.errors.filter((m) => m.includes("rests only on lead sources"))).toHaveLength(2);
  });

  it("rejects a source with no tier and a statement with no kind", () => {
    const e = entry({
      sources: [{ id: "s1", title: "t", url: "https://example.org/a" }],
      positions: [{ party: "P", in_power: true, statement: "x", sources: ["s1"] }],
    });
    const r = checkEntry(FILE, e);
    expect(r.errors).toContain("sources s1: no evidence tier");
    expect(r.errors.some((m) => m.startsWith("positions[0]: mark kind"))).toBe(true);
  });
});
