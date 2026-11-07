// Regression: re-running ingest must not overwrite an entry a person has
// already checked or verified (STATE_MACHINES audit 2026-11-06, defect 4.1a).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ingestTarget, reviewStateOf } from "../pipeline/ingest-target";
import { writeIngested } from "../pipeline/ingest-write";

const ROOT = "/c";

describe("ingestTarget", () => {
  it("writes a new entry into current/", () => {
    expect(ingestTarget(ROOT, "x", null)).toEqual({ kind: "new", file: "/c/current/x.yaml" });
  });

  it("refreshes an unreviewed draft in place", () => {
    expect(ingestTarget(ROOT, "x", "id: x\nreviewed: false\n").kind).toBe("update");
    expect(ingestTarget(ROOT, "x", "id: x\nreview:\n  status: draft\n").kind).toBe("update");
  });

  it.each([
    ["verified", "id: x\nreview:\n  status: verified\n  by: AT\n"],
    ["checked", "id: x\nreview:\n  status: checked\n"],
    ["checked", "id: x\nreviewed: true\n"],
    ["unreadable", "id: x\nreview: [unclosed\n"],
  ])("sends a re-ingest of a %s entry to proposed/", (state, text) => {
    expect(ingestTarget(ROOT, "x", text)).toEqual({
      kind: "proposal",
      file: "/c/proposed/x.yaml",
      existing: state,
    });
  });

  it("reads review state from the review block first", () => {
    expect(reviewStateOf("review:\n  status: verified\nreviewed: false\n")).toBe("verified");
  });
});

describe("writeIngested", () => {
  it("leaves a verified entry, its review and its corrections byte-identical", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "priors-"));
    fs.mkdirSync(path.join(root, "current"));
    const reviewed =
      "id: x\ntitle: Reviewed\nreviewed: true\nreview:\n  status: verified\n  by: AT\n" +
      "corrections:\n  - date: 2026-10-01\n    kind: correction\n    note: fixed a date\n";
    const file = path.join(root, "current", "x.yaml");
    fs.writeFileSync(file, reviewed);

    const t = writeIngested(root, "x", "id: x\ntitle: Fresh draft\nreviewed: false\n");

    expect(t.kind).toBe("proposal");
    expect(fs.readFileSync(file, "utf8")).toBe(reviewed);
    expect(fs.readFileSync(path.join(root, "proposed", "x.yaml"), "utf8")).toContain("Fresh draft");
  });
});
